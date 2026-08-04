"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricCardTitle } from "@/components/dashboard/metric-info";
import { MetricWorkflowRow } from "@/components/dashboard/metric-workflow-trigger";
import { buildOverdueTaskWorkflow } from "@/lib/dashboard/metric-workflows";
import type { TaskPortfolioStats } from "@/types";
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from "@/types";
import { formatDistanceToNow } from "date-fns";

export function OverdueTasksCard({ stats }: { stats: TaskPortfolioStats }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <MetricCardTitle id="overdueList" icon="clock" iconClassName="text-red-500" />
      </CardHeader>
      <CardContent className="space-y-2">
        {stats.overdue.length === 0 ? (
          <p className="text-muted-foreground text-sm">No overdue tasks — nice work.</p>
        ) : (
          stats.overdue.map((task) => (
            <MetricWorkflowRow
              key={task.id}
              workflow={buildOverdueTaskWorkflow({
                applicationId: task.applicationId,
                applicationName: task.applicationName,
                taskId: task.id,
                taskTitle: task.title,
              })}
              title={task.title}
              subtitle={task.applicationName}
              accent="danger"
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function TaskActivityCard({ stats }: { stats: TaskPortfolioStats }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <MetricCardTitle id="taskActivity" icon="activity" iconClassName="text-emerald-600" />
      </CardHeader>
      <CardContent className="space-y-2">
        {stats.recentActivity.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Move tasks on a board to see activity here.
          </p>
        ) : (
          stats.recentActivity.map((a) => (
            <div key={a.id} className="rounded-md border p-2 text-sm">
              <p className="truncate font-medium">{a.taskTitle}</p>
              <p className="text-muted-foreground text-xs">
                {a.applicationName} ·{" "}
                {a.fromStatus
                  ? (TASK_STATUS_LABELS[a.fromStatus as keyof typeof TASK_STATUS_LABELS] ??
                    a.fromStatus)
                  : "new"}{" "}
                → {TASK_STATUS_LABELS[a.toStatus as keyof typeof TASK_STATUS_LABELS] ?? a.toStatus}{" "}
                · {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
