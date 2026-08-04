import { generateText } from "ai";
import { getAiConfig } from "@/lib/ai/config";
import { getSummaryModel } from "@/lib/ai/model";
import { getOctokit } from "@/lib/github/client";
import { parseRepoUrl } from "@/lib/github/parse-repo-url";
import { prisma } from "@/lib/db";
import { getVelocityEffortStats } from "@/lib/pm/velocity";
import { getLifecyclePhaseTiming } from "@/lib/pm/lifecycle-timing";

function buildOfflineSummary(
  application: {
    name: string;
    description: string | null;
    status: string;
    repoUrl: string | null;
    gitMeta: { openIssues: number | null } | null;
    stackScan?: {
      frameworks: unknown;
      languages: unknown;
      lockfilePresent: boolean;
    } | null;
    architectureMap?: { layers: unknown } | null;
  },
  aiError?: string
) {
  const frameworks = (application.stackScan?.frameworks as string[]) ?? [];
  const languages = (application.stackScan?.languages as string[]) ?? [];
  const stackLine =
    frameworks.length > 0
      ? `**Stack:** ${frameworks.join(", ")} (${languages.join(", ")})`
      : "**Stack:** Run stack scan for framework detection";

  const aiNote = aiError
    ? `\n\n_Live AI summary unavailable (${aiError}). Showing offline summary._`
    : "\n\nConfigure `AI_GATEWAY_API_KEY` or `OPENAI_API_KEY` in `.env.local` for AI-generated summaries.";

  return `## ${application.name} — Summary (offline)

${application.description ?? "No description provided."}

**Status:** ${application.status}
**Repository:** ${application.repoUrl ?? "Not linked"}
**Open issues:** ${application.gitMeta?.openIssues ?? "Sync GitHub for stats"}
${stackLine}
**Lockfile:** ${application.stackScan?.lockfilePresent ? "Yes" : "Not detected"}${aiNote}`;
}

export async function generateApplicationSummary(applicationId: string) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { gitMeta: true, stackScan: true, architectureMap: true },
  });

  if (!application) {
    throw new Error("Application not found");
  }

  const [velocityStats] = await Promise.all([getVelocityEffortStats()]);
  const appVelocity = velocityStats.byApplication.find((a) => a.applicationId === applicationId);
  const phaseTiming = getLifecyclePhaseTiming(
    application.lifecyclePhase as import("@/types").LifecyclePhase,
    application.lifecyclePhaseStartedAt ?? application.updatedAt
  );

  let readme = "";
  if (application.repoUrl) {
    const parsed = parseRepoUrl(application.repoUrl);
    const octokit = getOctokit();
    if (parsed && octokit) {
      try {
        const { data } = await octokit.repos.getReadme({
          owner: parsed.owner,
          repo: parsed.repo,
        });
        if ("content" in data && data.content) {
          readme = Buffer.from(data.content, "base64").toString("utf-8").slice(0, 4000);
        }
      } catch {
        readme = "(README not available)";
      }
    }
  }

  const frameworks = (application.stackScan?.frameworks as string[]) ?? [];
  const languages = (application.stackScan?.languages as string[]) ?? [];
  const archLayers = application.architectureMap?.layers
    ? JSON.stringify(application.architectureMap.layers)
    : "Not mapped";

  const context = `
Application: ${application.name}
Status: ${application.status}
Description: ${application.description ?? "None"}
Repo: ${application.repoUrl ?? "None"}
Website: ${application.websiteUrl ?? "None"}
Open issues: ${application.gitMeta?.openIssues ?? "Unknown"}
Contributors: ${application.gitMeta?.contributorCount ?? "Unknown"}
Last commit: ${application.gitMeta?.lastCommitAt?.toISOString() ?? "Unknown"}
Commits (7d / 30d): ${application.gitMeta?.commitsLast7Days ?? "—"} / ${application.gitMeta?.commitsLast30Days ?? "—"}

Lifecycle phase: ${application.lifecyclePhase} (day ${phaseTiming.daysInPhase} of ~${phaseTiming.maxDays} recommended)
Phase timing: ${phaseTiming.isOverdue ? "OVERDUE — consider advancing" : phaseTiming.needsReview ? "Review due soon" : "Within guideline"}

Velocity score (portfolio model): ${appVelocity?.velocityScore ?? "N/A"} — ${appVelocity?.velocityTrend ?? "unknown"} trend
Effort score: ${appVelocity?.effortScore ?? "N/A"} (${appVelocity?.spentHours?.toFixed(1) ?? 0}h logged, ${appVelocity?.tasksCompletedLast30Days ?? 0} tasks done in 30d)
Note: Velocity uses repo commits + board completions; effort uses logged hours + estimates + edits.

Stack frameworks: ${frameworks.join(", ") || "Unknown"}
Languages: ${languages.join(", ") || "Unknown"}
Architecture layers: ${archLayers}

README excerpt:
${readme || "(No README)"}
`.trim();

  const model = getSummaryModel();
  const aiConfig = getAiConfig();

  if (!model) {
    const summary = await prisma.aiSummary.create({
      data: { applicationId, content: buildOfflineSummary(application) },
    });
    return { ...summary, mode: "offline" as const };
  }

  try {
    const { text } = await generateText({
      model,
      prompt: `You are a technical portfolio analyst. Write a concise project intelligence summary (markdown, 3-5 short paragraphs) for an investor/developer audience. Cover purpose, stack hints from README, maintenance signals, velocity/effort context, lifecycle phase timing, and suggested next actions. Explicitly mention how commit activity and board progress inform whether the project should advance its lifecycle phase.\n\n${context}`,
    });

    const summary = await prisma.aiSummary.create({
      data: { applicationId, content: text },
    });
    return {
      ...summary,
      mode: "ai" as const,
      provider: aiConfig.provider,
      model: aiConfig.model,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI summary generation failed";
    const summary = await prisma.aiSummary.create({
      data: {
        applicationId,
        content: buildOfflineSummary(application, message),
      },
    });
    return {
      ...summary,
      mode: "offline" as const,
      aiError: message,
    };
  }
}
