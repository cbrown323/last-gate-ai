import { waitUntil } from "@vercel/functions";
import { runHeadroomAgent } from "@/lib/agents/headroom";
import { runSecurityAgent } from "@/lib/agents/security";
import { generateApplicationSummary } from "@/lib/ai/summary";
import {
  buildIntelligenceProgress,
  INTELLIGENCE_STEPS,
  type IntelligenceStepId,
} from "@/lib/applications/intelligence-workflow";
import {
  getIntelligenceJob,
  updateIntelligenceJob,
} from "@/lib/applications/intelligence-jobs";
import { mapApplicationArchitecture } from "@/lib/architecture/mapper";
import { detectDeployments } from "@/lib/deployments/tracker";
import { prisma } from "@/lib/db";
import { syncGitHubMetadata } from "@/lib/github/sync";
import { scanApplicationStack } from "@/lib/stack/scanner";
import type { IntelligenceStepResult } from "@/types";

type StepRunner = (applicationId: string) => Promise<unknown>;

const STEP_RUNNERS: Record<IntelligenceStepId, StepRunner> = {
  git: syncGitHubMetadata,
  stack: scanApplicationStack,
  architecture: mapApplicationArchitecture,
  summary: generateApplicationSummary,
  security: runSecurityAgent,
  headroom: runHeadroomAgent,
  deployments: (applicationId) => detectDeployments(applicationId),
};

/** Sequential groups; inner arrays run in parallel after prior groups finish. */
const EXECUTION_GROUPS: IntelligenceStepId[][] = [
  ["git"],
  ["stack"],
  ["architecture"],
  ["summary"],
  ["security", "headroom"],
  ["deployments"],
];

export type RunIntelligencePipelineOptions = {
  fromBeginning?: boolean;
  steps?: IntelligenceStepId[];
};

async function loadApplicationProgress(applicationId: string) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      gitMeta: true,
      stackScan: true,
      architectureMap: true,
      summaries: { take: 1, orderBy: { generatedAt: "desc" } },
      securityReports: { take: 1, orderBy: { generatedAt: "desc" } },
      headroomReports: { take: 1, orderBy: { generatedAt: "desc" } },
      deployments: { take: 1 },
    },
  });

  if (!application) {
    throw new Error("Application not found");
  }

  const progress = buildIntelligenceProgress({
    hasGitMeta: Boolean(application.gitMeta?.syncedAt),
    hasStackScan: Boolean(application.stackScan),
    hasArchitectureMap: Boolean(application.architectureMap),
    hasSummary: application.summaries.length > 0,
    hasSecurityReport: application.securityReports.length > 0,
    hasHeadroomReport: application.headroomReports.length > 0,
    hasDeployments: application.deployments.length > 0,
  });

  return { application, progress };
}

function shouldRunStep(
  stepId: IntelligenceStepId,
  options: RunIntelligencePipelineOptions,
  progress: ReturnType<typeof buildIntelligenceProgress>,
  repoUrl: string | null
): "run" | "skip-no-repo" | "skip-complete" | "skip-filter" {
  const step = INTELLIGENCE_STEPS.find((s) => s.id === stepId);
  if (!step) return "skip-filter";

  if (options.steps?.length && !options.steps.includes(stepId)) {
    return "skip-filter";
  }

  if (step.requiresRepo && !repoUrl) {
    return "skip-no-repo";
  }

  if (!options.fromBeginning && progress[stepId] === "complete") {
    return "skip-complete";
  }

  return "run";
}

async function runStep(
  stepId: IntelligenceStepId,
  applicationId: string
): Promise<IntelligenceStepResult> {
  const started = Date.now();
  try {
    await STEP_RUNNERS[stepId](applicationId);
    return {
      stepId,
      status: "complete",
      durationMs: Date.now() - started,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : `${stepId} failed`;
    return {
      stepId,
      status: "failed",
      error: message,
      durationMs: Date.now() - started,
    };
  }
}

export async function runIntelligencePipeline(
  jobId: string,
  options: RunIntelligencePipelineOptions = {}
) {
  const job = await getIntelligenceJob(jobId);
  if (!job) {
    throw new Error("Intelligence job not found");
  }

  const { application, progress } = await loadApplicationProgress(job.applicationId);
  const stepResults: IntelligenceStepResult[] = [];

  await updateIntelligenceJob(jobId, {
    status: "running",
    startedAt: new Date(),
    currentStep: null,
    stepResults: [],
    error: null,
  });

  try {
    for (const group of EXECUTION_GROUPS) {
      const runnable: IntelligenceStepId[] = [];
      const skipped: IntelligenceStepResult[] = [];

      for (const stepId of group) {
        const step = INTELLIGENCE_STEPS.find((s) => s.id === stepId);
        if (!step) continue;

        const decision = shouldRunStep(stepId, options, progress, application.repoUrl);

        if (decision === "skip-no-repo") {
          skipped.push({
            stepId,
            status: "skipped",
            durationMs: 0,
          });
          continue;
        }

        if (decision === "skip-complete" || decision === "skip-filter") {
          continue;
        }

        runnable.push(stepId);
      }

      if (skipped.length > 0) {
        stepResults.push(...skipped);
        await updateIntelligenceJob(jobId, {
          stepResults: [...stepResults],
          currentStep: null,
        });
      }

      if (runnable.length === 0) {
        continue;
      }

      await updateIntelligenceJob(jobId, {
        currentStep: runnable[0],
      });

      const results =
        runnable.length === 1
          ? [await runStep(runnable[0], job.applicationId)]
          : await Promise.all(runnable.map((stepId) => runStep(stepId, job.applicationId)));

      stepResults.push(...results);

      await updateIntelligenceJob(jobId, {
        stepResults: [...stepResults],
        currentStep: null,
      });

      const failed = results.find((result) => result.status === "failed");
      if (failed) {
        const step = INTELLIGENCE_STEPS.find((s) => s.id === failed.stepId);
        await updateIntelligenceJob(jobId, {
          status: "failed",
          error: failed.error ?? `${step?.label ?? failed.stepId} failed`,
          completedAt: new Date(),
        });
        return { jobId, stepResults, status: "failed" as const };
      }
    }

    await updateIntelligenceJob(jobId, {
      status: "complete",
      completedAt: new Date(),
      currentStep: null,
    });

    return { jobId, stepResults, status: "complete" as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Pipeline failed";
    await updateIntelligenceJob(jobId, {
      status: "failed",
      error: message,
      completedAt: new Date(),
      currentStep: null,
      stepResults: [...stepResults],
    });
    throw error;
  }
}

export async function executeIntelligenceJob(
  jobId: string,
  options: RunIntelligencePipelineOptions = {}
) {
  return runIntelligencePipeline(jobId, options);
}

export function scheduleIntelligenceJob(
  jobId: string,
  options: RunIntelligencePipelineOptions = {}
) {
  const work = executeIntelligenceJob(jobId, options);
  waitUntil(work);
}
