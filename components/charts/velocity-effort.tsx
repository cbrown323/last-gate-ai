"use client";

import Link from "next/link";
import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatVelocityTrend } from "@/lib/pm/velocity-types";
import type { VelocityEffortStats } from "@/types";
import { LIFECYCLE_PHASE_LABELS } from "@/types";
import { Activity, Clock, GitCommit, Gauge, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const velocityChartConfig = {
  velocityScore: { label: "Velocity", color: "hsl(142 71% 45%)" },
  effortScore: { label: "Effort", color: "hsl(217 91% 60%)" },
} satisfies ChartConfig;

const effortBreakdownConfig = {
  value: { label: "Count", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function VelocityEffortSummary({
  stats,
  hideZero = false,
}: {
  stats: VelocityEffortStats;
  hideZero?: boolean;
}) {
  const cards = [
    {
      key: "portfolioVelocity",
      show:
        !hideZero ||
        stats.commitsLast7Days > 0 ||
        stats.tasksCompletedLast7Days > 0 ||
        stats.boardEditsLast7Days > 0,
      icon: Gauge,
      label: "Portfolio velocity",
      value: `${stats.portfolioVelocity}`,
      hint: `${stats.commitsLast7Days} commits · ${stats.tasksCompletedLast7Days} tasks done (7d)`,
      accent: "text-emerald-600",
    },
    {
      key: "portfolioEffort",
      show: !hideZero || stats.spentHours > 0 || stats.estimatedHours > 0,
      icon: Clock,
      label: "Portfolio effort",
      value: `${stats.portfolioEffortScore}`,
      hint: `${stats.spentHours.toFixed(1)}h logged · ${stats.estimatedHours.toFixed(1)}h estimated`,
      accent: "text-blue-600",
    },
    {
      key: "repoActivity",
      show: !hideZero || stats.commitsLast30Days > 0,
      icon: GitCommit,
      label: "Repo activity",
      value: `${stats.commitsLast30Days}`,
      hint: `${stats.commitsLast7Days} commits in the last 7 days`,
      accent: "text-violet-600",
    },
    {
      key: "boardActivity",
      show: !hideZero || stats.boardEditsLast7Days > 0 || stats.tasksCompletedLast30Days > 0,
      icon: Activity,
      label: "Board activity",
      value: `${stats.boardEditsLast7Days}`,
      hint: `${stats.tasksCompletedLast30Days} tasks completed in 30 days`,
      accent: "text-amber-600",
    },
  ].filter((card) => card.show);

  if (cards.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ key, icon, label, value, hint, accent }) => (
        <MetricCard
          key={key}
          icon={icon}
          label={label}
          value={value}
          hint={hint}
          accent={accent}
        />
      ))}
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
  hint: string;
  accent: string;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">{label}</CardTitle>
        <Icon className={cn("size-4", accent)} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-muted-foreground mt-1 text-xs">{hint}</p>
      </CardContent>
    </Card>
  );
}

export function VelocityByApplicationChart({ stats }: { stats: VelocityEffortStats }) {
  const data = stats.byApplication.slice(0, 8).map((app) => ({
    name: app.applicationName.length > 14 ? `${app.applicationName.slice(0, 14)}…` : app.applicationName,
    fullName: app.applicationName,
    velocityScore: app.velocityScore,
    effortScore: app.effortScore,
    trend: app.velocityTrend,
  }));

  if (data.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Velocity & effort by project</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Add applications and sync GitHub to see velocity scores.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Velocity & effort by project</CardTitle>
        <p className="text-muted-foreground text-xs">
          Velocity = commits + completed tasks + board edits. Effort = logged hours + estimates + activity.
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={velocityChartConfig} className="h-[240px] w-full">
          <BarChart data={data} margin={{ left: 0, right: 8 }}>
            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={50} />
            <YAxis allowDecimals={false} domain={[0, 100]} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.fullName ?? ""
                  }
                />
              }
            />
            <Bar dataKey="velocityScore" fill="var(--color-velocityScore)" radius={4} name="Velocity" />
            <Bar dataKey="effortScore" fill="var(--color-effortScore)" radius={4} name="Effort" />
          </BarChart>
        </ChartContainer>
        <div className="mt-3 flex flex-wrap gap-2">
          {stats.byApplication.slice(0, 5).map((app) => (
            <Link key={app.applicationId} href={`/applications/${app.applicationId}`}>
              <Badge variant="outline" className="text-[10px]">
                {app.applicationName}: {formatVelocityTrend(app.velocityTrend)}
              </Badge>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function EffortBreakdownChart({ stats }: { stats: VelocityEffortStats }) {
  const data = [
    { label: "Commits (30d)", value: stats.commitsLast30Days, fill: "hsl(142 71% 45%)" },
    { label: "Tasks done (30d)", value: stats.tasksCompletedLast30Days, fill: "hsl(217 91% 60%)" },
    { label: "Board edits (7d)", value: stats.boardEditsLast7Days, fill: "hsl(38 92% 50%)" },
    {
      label: "Hours logged",
      value: Math.round(stats.spentHours),
      fill: "hsl(262 83% 58%)",
    },
  ];

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Effort signals</CardTitle>
        <p className="text-muted-foreground text-xs">
          Composite view of coding commits, task completion, and logged hours.
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={effortBreakdownConfig} className="h-[220px] w-full">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
            <XAxis type="number" allowDecimals={false} />
            <YAxis type="category" dataKey="label" width={110} tick={{ fontSize: 11 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" radius={4}>
              {data.map((entry) => (
                <Cell key={entry.label} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function LifecycleTimeoutCard({ stats }: { stats: VelocityEffortStats }) {
  const alerts = stats.lifecycleAlerts;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="size-4 text-amber-500" />
          Lifecycle phase timing
        </CardTitle>
        <p className="text-muted-foreground text-xs">
          Phase durations follow playbook guidelines (Kanboard lead-time + monthly review). Low velocity may explain overdue phases.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.length === 0 ? (
          <p className="text-muted-foreground text-sm">All lifecycle phases are within recommended windows.</p>
        ) : (
          alerts.slice(0, 5).map((alert) => (
            <Link
              key={alert.applicationId}
              href={`/applications/${alert.applicationId}`}
              className={cn(
                "block rounded-md border p-3 text-sm transition-colors hover:bg-muted/50",
                alert.isOverdue && "border-red-200 bg-red-50/50 dark:border-red-900/40 dark:bg-red-950/20"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{alert.applicationName}</span>
                <Badge variant={alert.isOverdue ? "destructive" : "secondary"} className="text-[10px]">
                  {LIFECYCLE_PHASE_LABELS[alert.lifecyclePhase]}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                Day {alert.daysInPhase} of {alert.maxDays} recommended — {alert.isOverdue ? "overdue" : "review due"}
              </p>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function VelocityMeasurementNote({ stats }: { stats: VelocityEffortStats }) {
  return (
    <p className="text-muted-foreground rounded-lg border border-dashed bg-muted/20 p-3 text-xs leading-relaxed">
      {stats.measurementNote}
    </p>
  );
}
