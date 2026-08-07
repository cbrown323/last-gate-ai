import { generateObject } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getAiConfig } from "@/lib/ai/config";
import { getSummaryModel } from "@/lib/ai/model";
import { getLifecyclePhaseTiming } from "@/lib/pm/lifecycle-timing";
import {
  getNextLifecyclePhase,
  getPhaseGuidance,
  LIFECYCLE_PHASE_LABELS,
} from "@/lib/pm/playbook";
import { generateTaskCode, recordTaskTransition } from "@/lib/pm/tasks";
import { getVelocityEffortStats } from "@/lib/pm/velocity";
import type { LifecyclePhase } from "@/types";

const EPIC_COLORS = [
  "bg-emerald-500",
  "bg-blue-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
];

const ROADMAP_TAG = "ai-roadmap";

/**
 * The model plans in day offsets from today rather than absolute dates —
 * far more reliable than asking an LLM to emit valid future ISO dates.
 */
const roadmapPlanSchema = z.object({
  rationale: z
    .string()
    .describe(
      "Markdown explanation (3-6 short paragraphs) of why this roadmap fits the project: what the repo/board signals show, what to build next, and how the timeline was sized."
    ),
  epics: z
    .array(
      z.object({
        name: z.string().describe("Short epic name, e.g. 'Harden onboarding flow'"),
        description: z.string().describe("1-2 sentence epic goal"),
        startOffsetDays: z
          .number()
          .int()
          .min(0)
          .max(120)
          .describe("Days from today the epic starts"),
        durationDays: z
          .number()
          .int()
          .min(3)
          .max(60)
          .describe("Epic length in days"),
        tasks: z
          .array(
            z.object({
              title: z.string(),
              description: z.string().describe("Goal + acceptance criteria in 1-3 sentences"),
              priority: z.enum(["low", "medium", "high", "critical"]),
              estimationHours: z.number().min(0.5).max(40),
              dueOffsetDays: z
                .number()
                .int()
                .min(1)
                .max(180)
                .describe("Days from today the task is due; must fall within its epic window"),
            })
          )
          .min(2)
          .max(5),
      })
    )
    .min(2)
    .max(4),
});

type RoadmapPlan = z.infer<typeof roadmapPlanSchema>;

export type PredictiveRoadmapResult = {
  mode: "ai" | "offline";
  epicsCreated: number;
  tasksCreated: number;
  noteId: string;
  noteTitle: string;
  aiError?: string;
  provider?: string | null;
  model?: string;
};

function addDays(base: Date, days: number): Date {
  return new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
}

function buildOfflinePlan(
  phase: LifecyclePhase,
  headroomRecommendations: string[],
  aiError?: string
): RoadmapPlan {
  const phaseLabel = LIFECYCLE_PHASE_LABELS[phase];
  const nextPhase = getNextLifecyclePhase(phase);
  const guidance = getPhaseGuidance(phase);

  const phaseTasks = guidance.slice(0, 5).map((item, i) => ({
    title: item.length > 80 ? `${item.slice(0, 77)}…` : item,
    description: item,
    priority: (i === 0 ? "high" : "medium") as "high" | "medium",
    estimationHours: 4,
    dueOffsetDays: 3 + i * 3,
  }));

  const epics: RoadmapPlan["epics"] = [
    {
      name: `${phaseLabel} phase focus`,
      description: `Playbook-recommended work for the ${phaseLabel} phase${
        nextPhase ? `, moving toward ${LIFECYCLE_PHASE_LABELS[nextPhase]}` : ""
      }.`,
      startOffsetDays: 0,
      durationDays: 14,
      tasks: phaseTasks.slice(0, Math.max(2, Math.min(5, phaseTasks.length))),
    },
  ];

  if (headroomRecommendations.length > 0) {
    epics.push({
      name: "Scale & operational readiness",
      description: "Recommendations from the latest headroom report.",
      startOffsetDays: 14,
      durationDays: 14,
      tasks: headroomRecommendations.slice(0, 4).map((rec, i) => ({
        title: rec.length > 80 ? `${rec.slice(0, 77)}…` : rec,
        description: rec,
        priority: "medium" as const,
        estimationHours: 3,
        dueOffsetDays: 17 + i * 3,
      })),
    });
  } else {
    epics.push({
      name: "Project hygiene",
      description: "Baseline hygiene work while AI recommendations are unavailable.",
      startOffsetDays: 14,
      durationDays: 14,
      tasks: [
        {
          title: "Review and groom the backlog",
          description:
            "Triage stale tasks (do, defer, or delete) and reprioritize the top of the backlog.",
          priority: "medium",
          estimationHours: 2,
          dueOffsetDays: 17,
        },
        {
          title: "Update dependencies and run a security review",
          description:
            "Refresh lockfile dependencies and run the security scan under Intelligence.",
          priority: "medium",
          estimationHours: 3,
          dueOffsetDays: 24,
        },
      ],
    });
  }

  const aiNote = aiError
    ? `\n\n_Live AI roadmap unavailable (${aiError}). Showing a playbook-based offline roadmap._`
    : "\n\nConfigure `AI_GATEWAY_API_KEY` or `OPENAI_API_KEY` in `.env.local` for an AI-generated roadmap tailored to your repo.";

  return {
    rationale: `This roadmap was generated offline from the PM playbook guidance for the **${phaseLabel}** phase${
      headroomRecommendations.length > 0 ? " and the latest headroom report" : ""
    }. It uses default two-week epic windows rather than repo-specific pacing.${aiNote}`,
    epics,
  };
}

function buildNoteContent(
  applicationName: string,
  plan: RoadmapPlan,
  mode: "ai" | "offline",
  today: Date,
  createdEpics: { name: string; startsAt: Date; endsAt: Date; taskTitles: string[] }[]
): string {
  const epicSections = createdEpics
    .map((epic) => {
      const tasks = epic.taskTitles.map((t) => `  - ${t}`).join("\n");
      return `- **${epic.name}** (${epic.startsAt.toLocaleDateString()} → ${epic.endsAt.toLocaleDateString()})\n${tasks}`;
    })
    .join("\n");

  return `## Predictive roadmap — ${applicationName}

_Generated ${today.toLocaleDateString()} (${mode === "ai" ? "AI analysis" : "offline playbook fallback"}). Epics and tasks were added to the roadmap and board; dated items appear on the calendar._

### Why this roadmap

${plan.rationale}

### Suggested timeline

${epicSections}

### How to use this

- Review the generated epics on the Roadmap tab and adjust dates to your pace.
- Generated tasks are tagged \`${ROADMAP_TAG}\` in Backlog — reprioritize or delete what doesn't fit.
- Epic milestones and task due dates show on the Calendar automatically.`;
}

export async function generatePredictiveRoadmap(
  applicationId: string
): Promise<PredictiveRoadmapResult> {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      gitMeta: true,
      stackScan: true,
      epics: { orderBy: { position: "asc" } },
      tasks: {
        where: { isClosed: false },
        select: { title: true, status: true, priority: true },
        orderBy: { updatedAt: "desc" },
        take: 30,
      },
      summaries: { orderBy: { generatedAt: "desc" }, take: 1 },
      headroomReports: { orderBy: { generatedAt: "desc" }, take: 1 },
    },
  });

  if (!application) {
    throw new Error("Application not found");
  }

  const phase = application.lifecyclePhase as LifecyclePhase;
  const phaseTiming = getLifecyclePhaseTiming(
    phase,
    application.lifecyclePhaseStartedAt ?? application.updatedAt
  );
  const velocityStats = await getVelocityEffortStats();
  const appVelocity = velocityStats.byApplication.find(
    (a) => a.applicationId === applicationId
  );
  const headroomRecommendations =
    (application.headroomReports[0]?.recommendations as string[] | undefined) ?? [];

  const frameworks = (application.stackScan?.frameworks as string[]) ?? [];
  const languages = (application.stackScan?.languages as string[]) ?? [];
  const latestSummary = application.summaries[0]?.content ?? "";
  const existingEpicNames = application.epics.map((e) => e.name);
  const openTaskLines = application.tasks
    .map((t) => `- [${t.status}/${t.priority}] ${t.title}`)
    .join("\n");

  const context = `
Application: ${application.name}
Description: ${application.description ?? "None"}
Status: ${application.status}
Lifecycle phase: ${phase} (day ${phaseTiming.daysInPhase} of ~${phaseTiming.maxDays} recommended; ${phaseTiming.isOverdue ? "OVERDUE" : phaseTiming.needsReview ? "review due" : "on track"})
Next phase: ${getNextLifecyclePhase(phase) ?? "none (final phase)"}

Stack frameworks: ${frameworks.join(", ") || "Unknown"}
Languages: ${languages.join(", ") || "Unknown"}
Commits (7d / 30d): ${application.gitMeta?.commitsLast7Days ?? "?"} / ${application.gitMeta?.commitsLast30Days ?? "?"}
Open issues: ${application.gitMeta?.openIssues ?? "?"}
Velocity score: ${appVelocity?.velocityScore ?? "N/A"} (${appVelocity?.velocityTrend ?? "unknown"} trend)
Effort: ${appVelocity?.spentHours?.toFixed(1) ?? 0}h logged, ${appVelocity?.tasksCompletedLast30Days ?? 0} tasks done in 30d

Existing epics (do NOT duplicate these): ${existingEpicNames.join("; ") || "None"}
Open tasks on the board (do NOT duplicate these):
${openTaskLines || "None"}

Playbook guidance for the current phase:
${getPhaseGuidance(phase)
  .map((g) => `- ${g}`)
  .join("\n")}

Headroom recommendations:
${headroomRecommendations.map((r) => `- ${r}`).join("\n") || "None"}

Latest AI summary excerpt:
${latestSummary.slice(0, 2500) || "None"}
`.trim();

  const model = getSummaryModel();
  const aiConfig = getAiConfig();
  const today = new Date();

  let plan: RoadmapPlan;
  let mode: "ai" | "offline";
  let aiError: string | undefined;

  if (!model) {
    plan = buildOfflinePlan(phase, headroomRecommendations);
    mode = "offline";
  } else {
    try {
      const { object } = await generateObject({
        model,
        schema: roadmapPlanSchema,
        prompt: `You are a pragmatic technical program manager planning the next 1-3 months for a solo developer or small team. Based on the project signals below, propose a predictive roadmap: 2-4 epics, each with 2-5 concrete tasks the developer can implement in an adequate amount of time.

Rules:
- Size timelines realistically using the velocity/effort signals: low velocity means fewer, smaller epics with longer windows.
- Prioritize work that advances the current lifecycle phase toward the next one.
- Do not duplicate existing epics or open board tasks.
- Every task needs concrete acceptance criteria in its description.
- Use day offsets from today for all scheduling.

${context}`,
      });
      plan = object;
      mode = "ai";
    } catch (error) {
      aiError = error instanceof Error ? error.message : "AI roadmap generation failed";
      plan = buildOfflinePlan(phase, headroomRecommendations, aiError);
      mode = "offline";
    }
  }

  // Persist epics, tasks, and the summary note.
  const existingEpicCount = application.epics.length;
  const createdEpics: {
    name: string;
    startsAt: Date;
    endsAt: Date;
    taskTitles: string[];
  }[] = [];
  let tasksCreated = 0;

  for (const [index, epicPlan] of plan.epics.entries()) {
    const startsAt = addDays(today, epicPlan.startOffsetDays);
    const endsAt = addDays(startsAt, epicPlan.durationDays);

    const epic = await prisma.epic.create({
      data: {
        applicationId,
        name: epicPlan.name,
        description: epicPlan.description,
        startsAt,
        endsAt,
        position: existingEpicCount + index,
        color: EPIC_COLORS[(existingEpicCount + index) % EPIC_COLORS.length],
      },
    });

    const taskTitles: string[] = [];
    for (const taskPlan of epicPlan.tasks) {
      const code = await generateTaskCode(applicationId);
      const taskCount = await prisma.task.count({
        where: { applicationId, status: "backlog" },
      });
      const task = await prisma.task.create({
        data: {
          applicationId,
          epicId: epic.id,
          title: taskPlan.title,
          description: taskPlan.description,
          status: "backlog",
          position: taskCount,
          priority: taskPlan.priority,
          estimationHours: taskPlan.estimationHours,
          dueAt: addDays(today, taskPlan.dueOffsetDays),
          tags: [ROADMAP_TAG],
          code,
        },
      });
      await recordTaskTransition(task.id, null, "backlog", "Created by predictive roadmap");
      taskTitles.push(taskPlan.title);
      tasksCreated += 1;
    }

    createdEpics.push({ name: epicPlan.name, startsAt, endsAt, taskTitles });
  }

  const noteTitle = `Predictive roadmap — ${today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })}`;
  const note = await prisma.note.create({
    data: {
      applicationId,
      title: noteTitle,
      content: buildNoteContent(application.name, plan, mode, today, createdEpics),
      tags: ["predictive-roadmap"],
    },
  });

  const result: PredictiveRoadmapResult = {
    mode,
    epicsCreated: createdEpics.length,
    tasksCreated,
    noteId: note.id,
    noteTitle,
  };
  if (aiError) result.aiError = aiError;
  if (mode === "ai") {
    result.provider = aiConfig.provider;
    result.model = aiConfig.model;
  }
  return result;
}
