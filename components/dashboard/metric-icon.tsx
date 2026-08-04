"use client";

import {
  Activity,
  AlertTriangle,
  Boxes,
  CircleDot,
  Clock,
  Gauge,
  GitCommit,
  Hammer,
  HeartPulse,
  ListChecks,
  Rocket,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

/**
 * Icons are looked up by name so server components can describe a metric tile
 * without passing a component across the server/client boundary.
 */
const METRIC_ICONS = {
  activity: Activity,
  alert: AlertTriangle,
  boxes: Boxes,
  clock: Clock,
  commit: GitCommit,
  gauge: Gauge,
  hammer: Hammer,
  health: HeartPulse,
  issue: CircleDot,
  rocket: Rocket,
  tasks: ListChecks,
  trend: TrendingUp,
} satisfies Record<string, LucideIcon>;

export type MetricIconName = keyof typeof METRIC_ICONS;

export function MetricIcon({
  name,
  className,
}: {
  name: MetricIconName;
  className?: string;
}) {
  const Icon = METRIC_ICONS[name];
  return <Icon className={className} aria-hidden />;
}
