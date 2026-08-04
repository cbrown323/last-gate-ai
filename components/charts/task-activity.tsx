import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricCardTitle } from "@/components/dashboard/metric-info";
import type { TaskPortfolioStats } from "@/types";
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from "@/types";

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
            <Link
              key={task.id}
              href={`/applications/${task.applicationId}/tasks?task=${task.id}`}
              className="hover:bg-muted/50 hover:border-foreground/20 flex items-center justify-between gap-2 rounded-md border p-2 text-sm transition-colors"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{task.title}</p>
                <p className="text-muted-foreground text-xs">{task.applicationName}</p>
              </div>
              <Badge variant="destructive" className="shrink-0 text-[10px]">
                {TASK_PRIORITY_LABELS[task.priority]}
              </Badge>
            </Link>
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
