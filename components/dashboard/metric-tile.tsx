"use client";

import Link from "next/link";
import { MetricInfo } from "@/components/dashboard/metric-info";
import { MetricIcon, type MetricIconName } from "@/components/dashboard/metric-icon";
import { getMetricDefinition, type MetricId } from "@/lib/dashboard/metric-definitions";
import { cn } from "@/lib/utils";

export type MetricTone = "neutral" | "positive" | "info" | "warning" | "danger" | "accent";

const ICON_TONE: Record<MetricTone, string> = {
  neutral: "text-muted-foreground",
  positive: "text-emerald-500",
  info: "text-sky-500",
  warning: "text-amber-500",
  danger: "text-red-500",
  accent: "text-violet-500",
};

/** Colour the number only when the value itself carries a warning. */
const VALUE_TONE: Record<MetricTone, string> = {
  neutral: "text-foreground",
  positive: "text-foreground",
  info: "text-foreground",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-red-600 dark:text-red-400",
  accent: "text-foreground",
};

/**
 * Tiles share the row evenly and stretch to fill it, so a group never leaves an
 * orphaned gap when some of its metrics are hidden for being at zero.
 */
export function MetricTileGrid({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2.5">{children}</div>;
}

export function MetricTile({
  id,
  value,
  hint,
  icon,
  tone = "neutral",
  href,
  emphasis = false,
}: {
  id: MetricId;
  value: string | number;
  hint?: string;
  icon?: MetricIconName;
  tone?: MetricTone;
  href?: string;
  /** Draw a tinted edge — reserve for values that need to be noticed. */
  emphasis?: boolean;
}) {
  const definition = getMetricDefinition(id);

  const body = (
    <>
      <div className="mb-2 flex items-center gap-1.5">
        {icon ? <MetricIcon name={icon} className={cn("size-3.5 shrink-0", ICON_TONE[tone])} /> : null}
        <span className="text-muted-foreground truncate text-xs font-medium">
          {definition.label}
        </span>
        <MetricInfo id={id} align="end" className="ml-auto" />
      </div>
      <p
        className={cn(
          "text-2xl leading-none font-semibold tracking-tight tabular-nums",
          VALUE_TONE[tone]
        )}
      >
        {value}
      </p>
      {hint ? (
        <p className="text-muted-foreground/80 mt-1.5 line-clamp-2 text-[11px] leading-snug">
          {hint}
        </p>
      ) : null}
    </>
  );

  const className = cn(
    "bg-card block min-w-0 flex-1 basis-[210px] rounded-lg border px-3 py-2.5 text-left shadow-sm transition-colors",
    emphasis && tone === "danger" && "border-red-500/30 bg-red-500/[0.04]",
    emphasis && tone === "warning" && "border-amber-500/30 bg-amber-500/[0.04]",
    "hover:border-foreground/20 hover:bg-muted/40",
    href && "cursor-pointer"
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {body}
      </Link>
    );
  }

  return <div className={className}>{body}</div>;
}
