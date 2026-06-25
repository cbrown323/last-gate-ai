"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LIFECYCLE_PHASE_LABELS,
  WORKFLOW_TYPE_LABELS,
  type LifecyclePhase,
  type WorkflowType,
} from "@/types";
import {
  getPhaseGuidance,
  getNextLifecyclePhase,
  LIFECYCLE_PHASES,
} from "@/lib/pm/playbook";
import { getLifecyclePhaseTiming } from "@/lib/pm/lifecycle-timing";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, ChevronRight, Lightbulb, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

export function LifecycleBanner({
  applicationId,
  lifecyclePhase,
  workflowType,
  lifecyclePhaseStartedAt,
}: {
  applicationId: string;
  lifecyclePhase: LifecyclePhase;
  workflowType: WorkflowType;
  lifecyclePhaseStartedAt: string;
}) {
  const router = useRouter();
  const guidance = getPhaseGuidance(lifecyclePhase);
  const nextPhase = getNextLifecyclePhase(lifecyclePhase);
  const timing = getLifecyclePhaseTiming(lifecyclePhase, lifecyclePhaseStartedAt);

  async function updatePhase(phase: LifecyclePhase) {
    await fetch(`/api/applications/${applicationId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lifecyclePhase: phase }),
    });
    router.refresh();
  }

  return (
    <Card className="border-emerald-200/60 bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-emerald-950/20">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="size-4 text-emerald-600" />
            Product lifecycle — {LIFECYCLE_PHASE_LABELS[lifecyclePhase]}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{WORKFLOW_TYPE_LABELS[workflowType]} workflow</Badge>
            <Link href="/playbook">
              <Button variant="ghost" size="sm">
                <BookOpen className="mr-1 size-4" />
                Playbook
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-xs">Phase:</span>
          <Select value={lifecyclePhase} onValueChange={(v) => v && updatePhase(v as LifecyclePhase)}>
            <SelectTrigger className="h-8 w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LIFECYCLE_PHASES.map((p) => (
                <SelectItem key={p} value={p}>
                  {LIFECYCLE_PHASE_LABELS[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {nextPhase ? (
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => updatePhase(nextPhase)}
            >
              Advance to {LIFECYCLE_PHASE_LABELS[nextPhase]}
              <ChevronRight className="ml-1 size-3" />
            </Button>
          ) : null}
        </div>
        <div
          className={cn(
            "rounded-lg border p-3 text-sm",
            timing.isOverdue
              ? "border-red-200 bg-red-50/60 dark:border-red-900/40 dark:bg-red-950/30"
              : timing.needsReview
                ? "border-amber-200 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-950/30"
                : "border-emerald-200/60 bg-background/60"
          )}
        >
          <div className="mb-2 flex items-center gap-2 font-medium">
            <Timer className="size-4 text-emerald-600" />
            Phase timing — day {timing.daysInPhase} of ~{timing.maxDays}
          </div>
          <div className="bg-muted mb-2 h-2 overflow-hidden rounded-full">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                timing.isOverdue ? "bg-red-500" : timing.needsReview ? "bg-amber-500" : "bg-emerald-500"
              )}
              style={{ width: `${timing.percentElapsed}%` }}
            />
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed">{timing.message}</p>
          <p className="text-muted-foreground mt-2 text-[11px]">
            Velocity and effort on the portfolio dashboard factor into whether this phase should advance.
            Sync GitHub commits and complete board tasks for accurate signals.
          </p>
        </div>
        <ul className="space-y-1">
          {guidance.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="text-emerald-600 font-medium">{i + 1}.</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="flex gap-1 overflow-x-auto pb-1">
          {LIFECYCLE_PHASES.map((p, i) => (
            <div key={p} className="flex items-center">
              <div
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium whitespace-nowrap",
                  p === lifecyclePhase
                    ? "bg-emerald-600 text-white"
                    : LIFECYCLE_PHASES.indexOf(lifecyclePhase) > i
                      ? "bg-emerald-200/60 text-emerald-900 dark:bg-emerald-900/40"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {LIFECYCLE_PHASE_LABELS[p]}
              </div>
              {i < LIFECYCLE_PHASES.length - 1 ? (
                <ChevronRight className="text-muted-foreground mx-0.5 size-3" />
              ) : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
