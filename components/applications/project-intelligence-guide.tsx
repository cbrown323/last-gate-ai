"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  INTELLIGENCE_STEPS,
  type IntelligenceProgress,
  type IntelligenceStepId,
} from "@/lib/applications/intelligence-workflow";
import type { IntelligenceTabValue } from "@/components/applications/application-detail-tabs";
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

export function AnalysisRunButton({
  ctaLabel,
  running,
  canRun,
  onClick,
  className,
  size = "default",
}: {
  ctaLabel: string;
  running: boolean;
  canRun: boolean;
  onClick: () => void;
  className?: string;
  size?: "default" | "sm" | "lg";
}) {
  return (
    <Button
      onClick={onClick}
      disabled={!canRun}
      size={size}
      className={cn("bg-emerald-600 hover:bg-emerald-700", className)}
    >
      {running ? (
        <Loader2 className="mr-1 size-4 animate-spin" />
      ) : (
        <Sparkles className="mr-1 size-4" />
      )}
      {ctaLabel}
    </Button>
  );
}

export function ProjectIntelligenceGuide({
  repoUrl,
  progress,
  running,
  activeStepId,
  error,
  activeStepDescription,
  completedCount,
  totalSteps,
  analysisComplete,
  ctaLabel,
  ctaHint,
  canRun,
  onRunAnalysis,
  onStepTab,
}: {
  repoUrl: string | null;
  progress: IntelligenceProgress;
  running: boolean;
  activeStepId: IntelligenceStepId | null;
  error: string | null;
  activeStepDescription: string | null;
  completedCount: number;
  totalSteps: number;
  analysisComplete: boolean;
  ctaLabel: string;
  ctaHint: string | null;
  canRun: boolean;
  onRunAnalysis: () => void;
  onStepTab: (tab: IntelligenceTabValue) => void;
}) {
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

  return (
    <Card className="border-emerald-200/60 bg-emerald-50/30 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/20">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-4 text-emerald-600" />
              Guided product analysis
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Run the full pipeline in one click — git sync, stack scan, AI summary, security, and
              more. Individual steps also live under the Intelligence tab.
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-stretch gap-1 sm:items-end">
            <Badge variant="outline" className="self-start text-xs sm:self-end">
              {completedCount}/{totalSteps} complete
            </Badge>
            <AnalysisRunButton
              ctaLabel={ctaLabel}
              running={running}
              canRun={canRun}
              onClick={onRunAnalysis}
              className="w-full sm:w-auto"
            />
            {ctaHint ? (
              <p className="text-muted-foreground max-w-xs text-right text-[11px] leading-snug">
                {ctaHint}
              </p>
            ) : null}
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

        {activeStepDescription ? (
          <p className="text-muted-foreground text-sm">{activeStepDescription}</p>
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
            All steps finished. Browse Intelligence sub-tabs below for details, or run full analysis
            again to refresh with live data.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
