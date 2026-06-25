"use client";

import { useState } from "react";
import { ZeroMetricCount, ZeroMetricPills } from "@/components/dashboard/zero-metric-pills";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import type { HiddenMetric } from "@/lib/dashboard/metrics-visibility";

export function DashboardAdvancedPanel({
  hiddenMetrics,
  children,
}: {
  hiddenMetrics: HiddenMetric[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  if (hiddenMetrics.length === 0 && !children) {
    return null;
  }

  return (
    <Card className="border-dashed shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="hover:bg-muted/40 flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left transition-colors"
        aria-expanded={open}
      >
        <div className="flex min-w-0 items-center gap-2">
          <SlidersHorizontal className="size-4 shrink-0 text-emerald-600" />
          <div className="min-w-0">
            <p className="text-sm font-medium">Advanced metrics</p>
            <p className="text-muted-foreground truncate text-xs">
              Portfolio stats, charts, and health signals
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {hiddenMetrics.length > 0 ? <ZeroMetricCount count={hiddenMetrics.length} /> : null}
          <ChevronDown
            className={cn(
              "text-muted-foreground size-4 transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </div>
      </button>
      {!open && hiddenMetrics.length > 0 ? (
        <div className="border-t px-4 py-1">
          <ZeroMetricPills metrics={hiddenMetrics} />
        </div>
      ) : null}
      {open ? (
        <CardContent className="space-y-6 border-t pt-4">
          {hiddenMetrics.length > 0 ? <ZeroMetricPills metrics={hiddenMetrics} /> : null}
          {children}
        </CardContent>
      ) : null}
    </Card>
  );
}
