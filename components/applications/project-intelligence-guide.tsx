"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  ChevronRight,
  Circle,
  Loader2,
  Sparkles,
  XCircle,
} from "lucide-react";

type StepRuntimeStatus = "pending" | "running" | "complete" | "skipped" | "error";

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

export function ProjectIntelligenceGuide({
  applicationId,
  repoUrl,
  progress,
  running,
  onRunningChange,
  onProgressChange,
  onStepTab,
}: {
  applicationId: string;
  repoUrl: string | null;
  progress: IntelligenceProgress;
  running: boolean;
  onRunningChange: (running: boolean) => void;
  onProgressChange: (progress: IntelligenceProgress) => void;
  onStepTab: (tab: IntelligenceTabValue) => void;
}) {
  const router = useRouter();
  const [activeStepId, setActiveStepId] = useState<IntelligenceStepId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const completedCount = countCompletedSteps(progress, repoUrl);
  const totalSteps = INTELLIGENCE_STEPS.length;
  const analysisComplete = isAnalysisComplete(progress, repoUrl);
  const nextStep = getNextIntelligenceStep(progress, repoUrl);

  const stepStatuses = useMemo(() => {
    const statuses: Record<IntelligenceStepId, StepRuntimeStatus> = {
      git: progress.git,
      stack: progress.stack,
      architecture: progress.architecture,
      summary: progress.summary,
      security: progress.security,
      headroom: progress.headroom,
      deployments: progress.deployments,
    };

    for (const step of INTELLIGENCE_STEPS) {
      if (step.requiresRepo && !repoUrl && statuses[step.id] === "pending") {
        statuses[step.id] = "skipped";
      }
    }

    if (activeStepId && running) {
      statuses[activeStepId] = "running";
    }

    return statuses;
  }, [progress, repoUrl, activeStepId, running]);

  async function pollJob(jobId: string, fromBeginning: boolean) {
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
  }

  async function runAnalysis(fromBeginning = false) {
    onRunningChange(true);
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
      onRunningChange(false);
    }
  }

  const ctaLabel = running
    ? activeStepId
      ? `Analyzing ${INTELLIGENCE_STEPS.find((s) => s.id === activeStepId)?.label ?? "project"}…`
      : "Analyzing project…"
    : analysisComplete
      ? "Re-run analysis"
      : completedCount > 0
        ? "Continue analysis"
        : "Start product analysis";

  return (
    <Card className="border-emerald-200/60 bg-emerald-50/30 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/20">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-4 text-emerald-600" />
              Guided product analysis
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              One flow from repo intelligence through security to deployment — no need to hunt for generate buttons.
              Velocity and effort are measured from GitHub commits and board activity; results appear on the portfolio dashboard.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {completedCount}/{totalSteps} complete
            </Badge>
            <Button
              onClick={() => runAnalysis(analysisComplete)}
              disabled={running || (!analysisComplete && !nextStep)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {running ? (
                <Loader2 className="mr-1 size-4 animate-spin" />
              ) : (
                <Sparkles className="mr-1 size-4" />
              )}
              {ctaLabel}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!repoUrl ? (
          <p className="text-muted-foreground rounded-lg border border-dashed bg-background/60 p-3 text-sm">
            Link a GitHub repository in{" "}
            <span className="font-medium text-foreground">Edit</span> to unlock the full analysis path.
            Summary, security, and headroom can still run with limited context.
          </p>
        ) : null}

        {error ? (
          <p className="text-destructive flex items-center gap-2 text-sm">
            <XCircle className="size-4 shrink-0" />
            {error}
          </p>
        ) : null}

        {running && activeStepId ? (
          <p className="text-muted-foreground text-sm">
            {INTELLIGENCE_STEPS.find((step) => step.id === activeStepId)?.description}
          </p>
        ) : null}

        <div className="flex gap-1 overflow-x-auto pb-1">
          {INTELLIGENCE_STEPS.map((step, index) => {
            const status = stepStatuses[step.id];
            return (
              <div key={step.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => !running && onStepTab(step.tab)}
                  disabled={running}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium whitespace-nowrap transition-colors",
                    status === "running"
                      ? "bg-emerald-600 text-white"
                      : status === "complete"
                        ? "bg-emerald-200/70 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-100"
                        : status === "skipped"
                          ? "bg-muted/80 text-muted-foreground"
                          : status === "error"
                            ? "bg-destructive/15 text-destructive"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {status === "running" ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : status === "complete" ? (
                    <CheckCircle2 className="size-3" />
                  ) : (
                    <Circle className="size-3" />
                  )}
                  {step.label}
                </button>
                {index < INTELLIGENCE_STEPS.length - 1 ? (
                  <ChevronRight className="text-muted-foreground mx-0.5 size-3 shrink-0" />
                ) : null}
              </div>
            );
          })}
        </div>

        {analysisComplete && !running ? (
          <p className="text-muted-foreground text-xs">
            Analysis complete. Browse each tab for details, or use{" "}
            <Link href="/playbook" className="text-emerald-600 hover:underline">
              Playbook
            </Link>{" "}
            for product lifecycle next steps.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
