"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  ApplicationTabValue,
  IntelligenceTabValue,
} from "@/lib/applications/intelligence-workflow";

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
}: {
  children: React.ReactNode;
  tab?: ApplicationTabValue;
  onTabChange?: (tab: ApplicationTabValue) => void;
  defaultValue?: ApplicationTabValue;
}) {
  const [uncontrolledTab, setUncontrolledTab] = useState<ApplicationTabValue>(defaultValue);
  const tab = controlledTab ?? uncontrolledTab;
  const setTab = onTabChange ?? setUncontrolledTab;

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => value && setTab(value as ApplicationTabValue)}
    >
      <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:flex sm:w-auto sm:flex-nowrap">
        {APPLICATION_TABS.map((item) => (
          <TabsTrigger key={item.value} value={item.value} className="text-sm">
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
}

export function IntelligenceDetailTabs({
  children,
  tab: controlledTab,
  onTabChange,
  defaultValue = "stack",
}: {
  children: React.ReactNode;
  tab?: IntelligenceTabValue;
  onTabChange?: (tab: IntelligenceTabValue) => void;
  defaultValue?: IntelligenceTabValue;
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
          {INTELLIGENCE_TABS.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {children}
    </Tabs>
  );
}
