"use client";

import { EyeOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { HiddenMetric } from "@/lib/dashboard/metrics-visibility";

/**
 * Explains the metrics that are intentionally absent from the panel so a zero
 * reading is never mistaken for a missing feature.
 */
export function HiddenMetricsNote({ metrics }: { metrics: HiddenMetric[] }) {
  if (metrics.length === 0) return null;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            className="text-muted-foreground/70 hover:text-muted-foreground focus-visible:ring-ring/50 inline-flex shrink-0 items-center gap-1.5 rounded text-[11px] whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <EyeOff className="size-3" aria-hidden />
            <span className="lg:hidden">{`${metrics.length} hidden`}</span>
            <span className="hidden lg:inline">
              {`${metrics.length} ${metrics.length === 1 ? "metric" : "metrics"} hidden while at zero`}
            </span>
          </button>
        }
      />
      <TooltipContent className="w-64 max-w-[calc(100vw-2rem)] flex-col items-start gap-1.5 px-3 py-2.5 text-left">
        <p className="text-[13px] leading-tight font-semibold">Hidden while at zero</p>
        <p className="text-background/70 text-[11px] leading-relaxed">
          These cards reappear on their own once they have data.
        </p>
        <ul className="text-background/85 w-full space-y-0.5 text-[11px]">
          {metrics.map((metric) => (
            <li key={metric.id} className="flex items-baseline justify-between gap-3">
              <span className="truncate">{metric.label}</span>
              <span className="text-background/50 tabular-nums">{metric.value}</span>
            </li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}
