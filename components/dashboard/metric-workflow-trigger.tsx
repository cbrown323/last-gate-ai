"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { MetricWorkflowDialog } from "@/components/dashboard/metric-workflow-dialog";
import type { MetricWorkflow } from "@/lib/dashboard/metric-workflows";
import { cn } from "@/lib/utils";

export function MetricWorkflowRow({
  workflow,
  title,
  subtitle,
  accent,
}: {
  workflow: MetricWorkflow;
  title: string;
  subtitle: string;
  accent?: "danger" | "warning" | "default";
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "hover:bg-muted/50 hover:border-foreground/20 flex w-full items-center justify-between gap-3 rounded-md border p-2.5 text-sm transition-colors",
          accent === "danger" &&
            "border-red-500/30 bg-red-500/[0.04] dark:border-red-900/40 dark:bg-red-950/20",
          accent === "warning" &&
            "border-amber-500/30 bg-amber-500/[0.04] dark:border-amber-900/40 dark:bg-amber-950/20"
        )}
      >
        <span className="truncate font-medium">{title}</span>
        <span className="text-muted-foreground flex shrink-0 items-center gap-1 text-xs">
          {subtitle}
          <ChevronRight className="size-3.5" />
        </span>
      </button>
      <MetricWorkflowDialog workflow={workflow} open={open} onOpenChange={setOpen} />
    </>
  );
}
