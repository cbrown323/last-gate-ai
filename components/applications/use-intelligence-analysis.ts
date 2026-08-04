"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  INTELLIGENCE_STEPS,
  countCompletedSteps,
  getNextIntelligenceStep,
  isAnalysisComplete,
  type IntelligenceProgress,
  type IntelligenceStepId,
} from "@/lib/applications/intelligence-workflow";
import type { IntelligenceTabValue } from "@/components/applications/application-detail-tabs";
import type { IntelligenceJobRecord } from "@/types";

function progressFromJob(
  job: IntelligenceJobRecord,
  repoUrl: string | null,
  fallback: IntelligenceProgress
): IntelligenceProgress {
  const progress = { ...fallback };

  for (const result of job.stepResults) {
    if (result.status === "complete") {
      progress[result.stepId] = "complete";
    } else if (result.status === "skipped") {
      progress[result.stepId] = "skipped";
    }
  }

  for (const step of INTELLIGENCE_STEPS) {
    if (step.requiresRepo && !repoUrl && progress[step.id] === "pending") {
      progress[step.id] = "skipped";
    }
  }

  return progress;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useIntelligenceAnalysis({
  applicationId,
  repoUrl,
  progress,
  onProgressChange,
  onStepTab,
}: {
  applicationId: string;
  repoUrl: string | null;
  progress: IntelligenceProgress;
  onProgressChange: (progress: IntelligenceProgress) => void;
  onStepTab: (tab: IntelligenceTabValue) => void;
}) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [activeStepId, setActiveStepId] = useState<IntelligenceStepId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const completedCount = countCompletedSteps(progress, repoUrl);
  const totalSteps = INTELLIGENCE_STEPS.length;
  const analysisComplete = isAnalysisComplete(progress, repoUrl);
  const nextStep = getNextIntelligenceStep(progress, repoUrl);

  const ctaLabel = running
    ? activeStepId
      ? `Analyzing ${INTELLIGENCE_STEPS.find((s) => s.id === activeStepId)?.label ?? "project"}…`
      : "Analyzing project…"
    : "Run full analysis";

  const ctaHint = running
    ? null
    : analysisComplete
      ? `${completedCount}/${totalSteps} steps complete — refreshes git sync, AI summary, security, and more`
      : completedCount > 0
        ? `${completedCount}/${totalSteps} done — picks up at ${nextStep?.label ?? "the next step"}`
        : `${totalSteps} steps — git sync, stack scan, AI summary, security, headroom, deployments`;

  const canRun = running ? false : analysisComplete ? true : Boolean(nextStep);

  const pollJob = useCallback(
    async (jobId: string, fromBeginning: boolean) => {
      let workingProgress = { ...progress };

      if (fromBeginning) {
        workingProgress = Object.fromEntries(
          INTELLIGENCE_STEPS.map((step) => [
            step.id,
            step.requiresRepo && !repoUrl ? "skipped" : "pending",
          ])
        ) as IntelligenceProgress;
        onProgressChange(workingProgress);
      }

      for (;;) {
        const res = await fetch(`/api/intelligence/jobs/${jobId}`);
        const job = (await res.json()) as IntelligenceJobRecord & { error?: string };

        if (!res.ok) {
          throw new Error(typeof job.error === "string" ? job.error : "Failed to poll job");
        }

        workingProgress = progressFromJob(job, repoUrl, workingProgress);
        onProgressChange(workingProgress);

        if (job.currentStep) {
          setActiveStepId(job.currentStep);
          const step = INTELLIGENCE_STEPS.find((s) => s.id === job.currentStep);
          if (step) onStepTab(step.tab);
        }

        if (job.status === "complete") {
          setActiveStepId(null);
          router.refresh();
          return;
        }

        if (job.status === "failed") {
          setActiveStepId(null);
          throw new Error(job.error ?? "Analysis failed");
        }

        await sleep(1000);
      }
    },
    [onProgressChange, onStepTab, progress, repoUrl, router]
  );

  const runAnalysis = useCallback(
    async (fromBeginning = false) => {
      setRunning(true);
      setError(null);

      try {
        const res = await fetch("/api/intelligence/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            applicationId,
            fromBeginning,
            trigger: "manual",
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          const msg = typeof data.error === "string" ? data.error : "Failed to start analysis";
          throw new Error(msg);
        }

        await pollJob(data.jobId as string, fromBeginning);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Analysis failed");
      } finally {
        setActiveStepId(null);
        setRunning(false);
      }
    },
    [applicationId, pollJob]
  );

  const activeStepDescription = useMemo(() => {
    if (!running || !activeStepId) return null;
    return INTELLIGENCE_STEPS.find((step) => step.id === activeStepId)?.description ?? null;
  }, [activeStepId, running]);

  return {
    running,
    activeStepId,
    error,
    completedCount,
    totalSteps,
    analysisComplete,
    ctaLabel,
    ctaHint,
    canRun,
    runAnalysis,
    activeStepDescription,
  };
}
