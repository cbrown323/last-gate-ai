"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ChartEmpty } from "@/components/charts/chart-empty";
import { MetricCardTitle } from "@/components/dashboard/metric-info";
import { MetricWorkflowRow } from "@/components/dashboard/metric-workflow-trigger";
import { buildLifecycleWorkflow } from "@/lib/dashboard/metric-workflows";
import { formatVelocityTrend } from "@/lib/pm/velocity-types";
import type { VelocityEffortStats } from "@/types";
import { LIFECYCLE_PHASE_LABELS } from "@/types";
import Link from "next/link";
import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts";
import { MetricTile, MetricTileGrid } from "@/components/dashboard/metric-tile";

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
      key: "portfolioVelocity" as const,
      show:
        !hideZero ||
        stats.commitsLast7Days > 0 ||
        stats.tasksCompletedLast7Days > 0 ||
        stats.boardEditsLast7Days > 0,
      icon: "gauge" as const,
      value: `${stats.portfolioVelocity}`,
      hint: `${stats.commitsLast7Days} commits · ${stats.tasksCompletedLast7Days} tasks done (7d)`,
      tone: "positive" as const,
    },
    {
      key: "portfolioEffort" as const,
      show: !hideZero || stats.spentHours > 0 || stats.estimatedHours > 0,
      icon: "clock" as const,
      value: `${stats.portfolioEffortScore}`,
      hint: `${stats.spentHours.toFixed(1)}h logged · ${stats.estimatedHours.toFixed(1)}h estimated`,
      tone: "info" as const,
    },
    {
      key: "repoActivity" as const,
      show: !hideZero || stats.commitsLast30Days > 0,
      icon: "commit" as const,
      value: `${stats.commitsLast30Days}`,
      hint: `${stats.commitsLast7Days} commits in the last 7 days`,
      tone: "accent" as const,
    },
    {
      key: "boardActivity" as const,
      show: !hideZero || stats.boardEditsLast7Days > 0 || stats.tasksCompletedLast30Days > 0,
      icon: "activity" as const,
      value: `${stats.boardEditsLast7Days}`,
      hint: `${stats.tasksCompletedLast30Days} tasks completed in 30 days`,
      tone: "warning" as const,
    },
  ].filter((card) => card.show);

  if (cards.length === 0) {
    return null;
  }

  return (
    <MetricTileGrid>
      {cards.map(({ key, icon, value, hint, tone }) => (
        <MetricTile key={key} id={key} icon={icon} value={value} hint={hint} tone={tone} />
      ))}
    </MetricTileGrid>
  );
}

export function VelocityByApplicationChart({ stats }: { stats: VelocityEffortStats }) {
  const data = stats.byApplication.slice(0, 8).map((app) => ({
    name:
      app.applicationName.length > 14
        ? `${app.applicationName.slice(0, 14)}…`
        : app.applicationName,
    fullName: app.applicationName,
    velocityScore: app.velocityScore,
    effortScore: app.effortScore,
    trend: app.velocityTrend,
  }));

  const hasSignal = data.some((app) => app.velocityScore > 0 || app.effortScore > 0);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <MetricCardTitle id="velocityByProject" />
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <ChartEmpty message="Add applications and sync GitHub to see velocity scores." />
        ) : !hasSignal ? (
          <ChartEmpty message="No commits, completed tasks, or board edits recorded yet — every project scores zero." />
        ) : (
          <ChartContainer config={velocityChartConfig} className="h-[240px] w-full">
            <BarChart data={data} margin={{ left: 0, right: 8 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={50}
              />
              <YAxis allowDecimals={false} domain={[0, 100]} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ""}
                  />
                }
              />
              <Bar
                dataKey="velocityScore"
                fill="var(--color-velocityScore)"
                radius={4}
                name="Velocity"
              />
              <Bar dataKey="effortScore" fill="var(--color-effortScore)" radius={4} name="Effort" />
            </BarChart>
          </ChartContainer>
        )}
        {data.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {stats.byApplication.slice(0, 5).map((app) => (
              <Link key={app.applicationId} href={`/applications/${app.applicationId}`}>
                <Badge variant="outline" className="text-[10px] font-normal">
                  {app.applicationName}
                  <span className="text-muted-foreground ml-1">
                    {formatVelocityTrend(app.velocityTrend)}
                  </span>
                </Badge>
              </Link>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function EffortBreakdownChart({ stats }: { stats: VelocityEffortStats }) {
  const data = [
    { label: "Commits (30d)", value: stats.commitsLast30Days, fill: "hsl(142 71% 45%)" },
    { label: "Tasks done (30d)", value: stats.tasksCompletedLast30Days, fill: "hsl(217 91% 60%)" },
    { label: "Board edits (7d)", value: stats.boardEditsLast7Days, fill: "hsl(38 92% 50%)" },
    { label: "Hours logged", value: Math.round(stats.spentHours), fill: "hsl(262 83% 58%)" },
  ];

  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <MetricCardTitle id="effortSignals" />
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <ChartEmpty message="No effort signals yet. Sync a repo, log task hours, or move cards on a board." />
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
}

export function LifecycleTimeoutCard({ stats }: { stats: VelocityEffortStats }) {
  const alerts = stats.lifecycleAlerts;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <MetricCardTitle id="lifecycleTiming" icon="alert" iconClassName="text-amber-500" />
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            All lifecycle phases are within recommended windows.
          </p>
        ) : (
          alerts.slice(0, 5).map((alert) => (
            <MetricWorkflowRow
              key={alert.applicationId}
              workflow={buildLifecycleWorkflow(alert)}
              title={alert.applicationName}
              subtitle={`${LIFECYCLE_PHASE_LABELS[alert.lifecyclePhase]} · ${
                alert.isOverdue ? "overdue" : "review due"
              }`}
              accent={alert.isOverdue ? "danger" : "warning"}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function VelocityMeasurementNote({ stats }: { stats: VelocityEffortStats }) {
  return (
    <p className="text-muted-foreground/80 bg-muted/20 rounded-lg border border-dashed p-3 text-[11px] leading-relaxed">
      {stats.measurementNote}
    </p>
  );
}
