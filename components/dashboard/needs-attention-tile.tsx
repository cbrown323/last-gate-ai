"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MetricWorkflowDialog } from "@/components/dashboard/metric-workflow-dialog";
import { MetricIcon } from "@/components/dashboard/metric-icon";
import { buildAttentionWorkflow } from "@/lib/dashboard/metric-workflows";
import type { AttentionItem } from "@/lib/dashboard/needs-attention";
import { cn } from "@/lib/utils";

export function NeedsAttentionTile({
  count,
  items,
}: {
  count: number;
  items: AttentionItem[];
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [workflowOpen, setWorkflowOpen] = useState(false);
  const [activeWorkflow, setActiveWorkflow] = useState<ReturnType<typeof buildAttentionWorkflow> | null>(
    null
  );

  if (count === 0) return null;

  function openWorkflow(item: AttentionItem) {
    setActiveWorkflow(buildAttentionWorkflow(item));
    setPickerOpen(false);
    setWorkflowOpen(true);
  }

  function handleTileClick() {
    if (items.length === 1) {
      openWorkflow(items[0]);
    } else {
      setPickerOpen(true);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleTileClick}
        className={cn(
          "bg-card block min-w-0 flex-1 basis-[210px] rounded-lg border px-3 py-2.5 text-left shadow-sm transition-colors",
          "border-amber-500/30 bg-amber-500/[0.04]",
          "hover:border-foreground/20 hover:bg-muted/40 cursor-pointer"
        )}
      >
        <div className="mb-2 flex items-center gap-1.5">
          <MetricIcon name="alert" className="size-3.5 shrink-0 text-amber-500" />
          <span className="text-muted-foreground truncate text-xs font-medium">Needs attention</span>
          <ChevronRight className="text-muted-foreground ml-auto size-3.5 shrink-0" />
        </div>
        <p className="text-2xl leading-none font-semibold tracking-tight tabular-nums text-amber-600 dark:text-amber-400">
          {count}
        </p>
        <p className="text-muted-foreground/80 mt-1.5 line-clamp-2 text-[11px] leading-snug">
          Click for fix steps
        </p>
      </button>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Applications needing attention</DialogTitle>
            <DialogDescription>
              Choose an application to see why it was flagged and how to fix it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openWorkflow(item)}
                className="hover:bg-muted/50 hover:border-foreground/20 flex w-full items-center justify-between gap-3 rounded-md border p-2.5 text-sm transition-colors"
              >
                <span className="truncate font-medium">{item.name}</span>
                <span className="text-muted-foreground flex shrink-0 items-center gap-1 text-xs">
                  {item.reason}
                  <ChevronRight className="size-3.5" />
                </span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {activeWorkflow ? (
        <MetricWorkflowDialog
          workflow={activeWorkflow}
          open={workflowOpen}
          onOpenChange={setWorkflowOpen}
        />
      ) : null}
    </>
  );
}
