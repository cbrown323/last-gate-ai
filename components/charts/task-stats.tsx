"use client";

import { Bar, BarChart, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ChartEmpty } from "@/components/charts/chart-empty";
import { MetricCardTitle } from "@/components/dashboard/metric-info";
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  type TaskPortfolioStats,
  type TaskStatus,
} from "@/types";

const statusChartConfig = {
  backlog: { label: "Backlog", color: "hsl(215 16% 65%)" },
  todo: { label: "To Do", color: "hsl(217 91% 60%)" },
  doing: { label: "In Progress", color: "hsl(38 92% 50%)" },
  done: { label: "Done", color: "hsl(142 71% 45%)" },
} satisfies ChartConfig;

const statusColors: Record<TaskStatus, string> = {
  backlog: statusChartConfig.backlog.color!,
  todo: statusChartConfig.todo.color!,
  doing: statusChartConfig.doing.color!,
  done: statusChartConfig.done.color!,
};

const priorityConfig = {
  count: { label: "Tasks", color: "var(--chart-1)" },
} satisfies ChartConfig;

const priorityColors = [
  "hsl(215 16% 65%)",
  "hsl(217 91% 60%)",
  "hsl(38 92% 50%)",
  "hsl(0 84% 60%)",
];

const EMPTY_BOARD_MESSAGE = "No tasks on any board yet. Create tasks to populate this chart.";

export function TaskStatusChart({ stats }: { stats: TaskPortfolioStats }) {
  const data = TASK_STATUSES.map((s) => ({
    status: s,
    count: stats.byStatus[s] ?? 0,
    fill: statusColors[s],
  }));

  const total = data.reduce((sum, entry) => sum + entry.count, 0);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <MetricCardTitle id="tasksByStatus" />
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <ChartEmpty message={EMPTY_BOARD_MESSAGE} />
        ) : (
          <ChartContainer
            config={statusChartConfig}
            className="mx-auto aspect-square max-h-[220px] w-full"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="status" />} />
              <Pie data={data} dataKey="count" nameKey="status" innerRadius={40} strokeWidth={2}>
                {data.map((entry) => (
                  <Cell key={entry.status} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="status" />} />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function TaskPriorityChart({ stats }: { stats: TaskPortfolioStats }) {
  const data = TASK_PRIORITIES.map((p, i) => ({
    priority: TASK_PRIORITY_LABELS[p],
    count: stats.byPriority[p] ?? 0,
    fill: priorityColors[i],
  }));

  const total = data.reduce((sum, entry) => sum + entry.count, 0);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <MetricCardTitle id="tasksByPriority" />
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <ChartEmpty message={EMPTY_BOARD_MESSAGE} />
        ) : (
          <ChartContainer config={priorityConfig} className="h-[200px] w-full">
            <BarChart data={data}>
              <XAxis dataKey="priority" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" radius={4}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
