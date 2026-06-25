import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type SettingsCategory = "recommended" | "optional" | "documentation";

const cardStyles: Record<SettingsCategory, string> = {
  recommended:
    "border-emerald-200/60 bg-emerald-50/30 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/15",
  optional:
    "border-slate-200/70 bg-slate-50/60 shadow-sm dark:border-slate-700/50 dark:bg-slate-900/25",
  documentation:
    "border-violet-200/60 bg-violet-50/30 shadow-sm dark:border-violet-900/40 dark:bg-violet-950/15",
};

const badgeStyles: Record<SettingsCategory, string> = {
  recommended: "border-transparent bg-emerald-600/90 text-white hover:bg-emerald-600/90",
  optional:
    "border-slate-300/80 bg-slate-100/90 text-slate-700 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-200",
  documentation:
    "border-violet-300/80 bg-violet-100/90 text-violet-800 dark:border-violet-700 dark:bg-violet-950/50 dark:text-violet-200",
};

const featurePillStyles: Record<SettingsCategory, string> = {
  recommended:
    "border-emerald-200/70 bg-emerald-50/50 text-emerald-900 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-100",
  optional:
    "border-slate-200/80 bg-slate-100/60 text-slate-700 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-200",
  documentation:
    "border-violet-200/70 bg-violet-50/50 text-violet-900 dark:border-violet-800/50 dark:bg-violet-950/30 dark:text-violet-100",
};

const categoryLabels: Record<SettingsCategory, string> = {
  recommended: "Recommended",
  optional: "Optional",
  documentation: "Documentation",
};

const completedCardClass =
  "border-border/50 bg-muted/20 shadow-none opacity-[0.72] saturate-[0.82] dark:border-border/40 dark:bg-muted/10 dark:opacity-[0.78]";

export function settingsCategoryCardClass(
  category: SettingsCategory,
  options?: { completed?: boolean }
) {
  if (options?.completed) return completedCardClass;
  return cardStyles[category];
}

export function SettingsCategoryBadge({
  category,
  className,
}: {
  category: SettingsCategory;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn("text-xs", badgeStyles[category], className)}>
      {categoryLabels[category]}
    </Badge>
  );
}

export function SettingsFeaturePill({
  category,
  children,
}: {
  category: SettingsCategory;
  children: ReactNode;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-normal", featurePillStyles[category])}
    >
      {children}
    </Badge>
  );
}
