"use client";

import { useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { HiddenMetricsNote } from "@/components/dashboard/hidden-metrics-note";
import { MetricIcon, type MetricIconName } from "@/components/dashboard/metric-icon";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { HiddenMetric } from "@/lib/dashboard/metrics-visibility";

export type AdvancedMetricsSection = {
  id: string;
  label: string;
  icon: MetricIconName;
  /** Shown under the tab bar so the user knows what they are looking at. */
  description: string;
  /** Number of items needing action in this section — drives the tab badge. */
  alerts?: number;
  content: React.ReactNode;
};

export function DashboardAdvancedPanel({
  sections,
  hiddenMetrics,
  summary,
}: {
  sections: AdvancedMetricsSection[];
  hiddenMetrics: HiddenMetric[];
  /** One-line readout kept visible while the panel is collapsed. */
  summary?: string;
}) {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");

  if (sections.length === 0) {
    return null;
  }

  const active = sections.find((section) => section.id === activeId) ?? sections[0];
  const totalAlerts = sections.reduce((sum, section) => sum + (section.alerts ?? 0), 0);

  return (
    <Card className="overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="hover:bg-muted/40 flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors"
        aria-expanded={open}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <SlidersHorizontal className="size-4 shrink-0 text-emerald-600" />
          <div className="min-w-0">
            <p className="text-sm font-medium">Advanced metrics</p>
            <p className="text-muted-foreground truncate text-xs">
              {open ? "Delivery, work, and health signals" : (summary ?? "Delivery, work, and health signals")}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          {!open && totalAlerts > 0 ? (
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-700 tabular-nums dark:text-amber-300">
              {totalAlerts} to review
            </span>
          ) : null}
          <span className="text-muted-foreground text-xs">{open ? "Hide" : "Show"}</span>
          <ChevronDown
            className={cn(
              "text-muted-foreground size-4 transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </div>
      </button>

      {open ? (
        <div className="border-t">
          <Tabs
            value={active.id}
            onValueChange={(value) => value && setActiveId(value as string)}
            className="gap-0"
          >
            <div className="bg-muted/25 flex items-center gap-3 border-b px-3 py-2">
              <div className="-mx-1 min-w-0 flex-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <TabsList className="bg-muted/60 h-auto w-max max-w-none flex-nowrap">
                  {sections.map((section) => (
                    <TabsTrigger
                      key={section.id}
                      value={section.id}
                      className="h-7 flex-none gap-1.5 px-2.5 text-xs"
                    >
                      <MetricIcon name={section.icon} className="size-3.5" />
                      {section.label}
                      {section.alerts ? (
                        <span className="rounded-full bg-amber-500/20 px-1.5 text-[10px] font-medium text-amber-700 tabular-nums dark:text-amber-300">
                          {section.alerts}
                        </span>
                      ) : null}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              <HiddenMetricsNote metrics={hiddenMetrics} />
            </div>

            <p className="text-muted-foreground border-b px-4 py-2 text-xs">
              {active.description}
            </p>

            {sections.map((section) => (
              <TabsContent key={section.id} value={section.id} className="space-y-4 p-4">
                {section.content}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      ) : null}
    </Card>
  );
}
