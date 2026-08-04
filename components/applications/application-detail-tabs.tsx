"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getEffectiveStepStatus,
  INTELLIGENCE_STEPS,
  type ApplicationTabValue,
  type IntelligenceProgress,
  type IntelligenceTabValue,
} from "@/lib/applications/intelligence-workflow";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

export type { ApplicationTabValue, IntelligenceTabValue };

export const APPLICATION_TABS = [
  { value: "overview", label: "Overview" },
  { value: "intelligence", label: "Intelligence" },
  { value: "notes", label: "Notes" },
  { value: "calendar", label: "Calendar" },
] as const satisfies ReadonlyArray<{ value: ApplicationTabValue; label: string }>;

export const INTELLIGENCE_TABS = [
  { value: "stack", label: "Stack" },
  { value: "architecture", label: "Architecture" },
  { value: "git", label: "Git" },
  { value: "summary", label: "AI Summary" },
  { value: "security", label: "Security" },
  { value: "headroom", label: "Headroom" },
  { value: "deployments", label: "Deployments" },
] as const satisfies ReadonlyArray<{ value: IntelligenceTabValue; label: string }>;

export function ApplicationDetailTabs({
  children,
  tab: controlledTab,
  onTabChange,
  defaultValue = "overview",
  intelligenceCompletedCount,
  intelligenceTotalSteps,
  analysisComplete,
}: {
  children: React.ReactNode;
  tab?: ApplicationTabValue;
  onTabChange?: (tab: ApplicationTabValue) => void;
  defaultValue?: ApplicationTabValue;
  intelligenceCompletedCount?: number;
  intelligenceTotalSteps?: number;
  analysisComplete?: boolean;
}) {
  const [uncontrolledTab, setUncontrolledTab] = useState<ApplicationTabValue>(defaultValue);
  const tab = controlledTab ?? uncontrolledTab;
  const setTab = onTabChange ?? setUncontrolledTab;
  const showIntelligenceProgress =
    intelligenceCompletedCount != null &&
    intelligenceTotalSteps != null &&
    analysisComplete === false;

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => value && setTab(value as ApplicationTabValue)}
    >
      <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:flex sm:w-auto sm:flex-nowrap">
        {APPLICATION_TABS.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            className={cn(
              "gap-1.5 text-sm",
              item.value === "intelligence" &&
                showIntelligenceProgress &&
                "ring-1 ring-amber-500/40 data-[state=active]:ring-emerald-500/50"
            )}
          >
            {item.label}
            {item.value === "intelligence" && showIntelligenceProgress ? (
              <Badge
                variant="outline"
                className="h-4 px-1 text-[10px] font-normal text-amber-800 dark:text-amber-200"
              >
                {intelligenceCompletedCount}/{intelligenceTotalSteps}
              </Badge>
            ) : null}
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
}

function intelligenceTabStatus(
  tabValue: IntelligenceTabValue,
  progress: IntelligenceProgress | undefined,
  repoUrl: string | null | undefined
) {
  if (!progress) return null;
  const step = INTELLIGENCE_STEPS.find((item) => item.tab === tabValue);
  if (!step) return null;
  return getEffectiveStepStatus(step, progress, repoUrl ?? null);
}

export function IntelligenceDetailTabs({
  children,
  tab: controlledTab,
  onTabChange,
  defaultValue = "stack",
  progress,
  repoUrl,
}: {
  children: React.ReactNode;
  tab?: IntelligenceTabValue;
  onTabChange?: (tab: IntelligenceTabValue) => void;
  defaultValue?: IntelligenceTabValue;
  progress?: IntelligenceProgress;
  repoUrl?: string | null;
}) {
  const [uncontrolledTab, setUncontrolledTab] = useState<IntelligenceTabValue>(defaultValue);
  const tab = controlledTab ?? uncontrolledTab;
  const setTab = onTabChange ?? setUncontrolledTab;

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => value && setTab(value as IntelligenceTabValue)}
    >
      <div className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <TabsList className="inline-flex h-auto w-max max-w-none flex-nowrap bg-muted/50 [&_[data-slot=tabs-trigger]]:flex-none [&_[data-slot=tabs-trigger]]:shrink-0 [&_[data-slot=tabs-trigger]]:text-xs">
          {INTELLIGENCE_TABS.map((item) => {
            const status = intelligenceTabStatus(item.value, progress, repoUrl);
            return (
              <TabsTrigger
                key={item.value}
                value={item.value}
                className={cn(
                  "gap-1",
                  item.value === "summary" &&
                    status === "pending" &&
                    "ring-1 ring-amber-500/35"
                )}
              >
                {item.label}
                {status === "complete" ? (
                  <CheckCircle2 className="size-3 shrink-0 text-emerald-600" />
                ) : status === "pending" ? (
                  <span
                    className="size-1.5 shrink-0 rounded-full bg-amber-500"
                    title="Not run yet"
                  />
                ) : null}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>
      {children}
    </Tabs>
  );
}
