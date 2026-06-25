import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TaskPortfolioStats } from "@/types";
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from "@/types";
import { Clock, Activity } from "lucide-react";

export function OverdueTasksCard({ stats }: { stats: TaskPortfolioStats }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="size-4 text-red-500" />
          Overdue tasks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {stats.overdue.length === 0 ? (
          <p className="text-muted-foreground text-sm">No overdue tasks — nice work.</p>
        ) : (
          stats.overdue.map((task) => (
            <Link
              key={task.id}
              href={`/applications/${task.applicationId}/tasks`}
              className="hover:bg-muted/50 flex items-center justify-between rounded-md border p-2 text-sm"
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
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="size-4 text-emerald-600" />
          Recent board activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {stats.recentActivity.length === 0 ? (
          <p className="text-muted-foreground text-sm">Move tasks on a board to see activity here.</p>
        ) : (
          stats.recentActivity.map((a) => (
            <div key={a.id} className="rounded-md border p-2 text-sm">
              <p className="font-medium">{a.taskTitle}</p>
              <p className="text-muted-foreground text-xs">
                {a.applicationName} ·{" "}
                {a.fromStatus ? TASK_STATUS_LABELS[a.fromStatus as keyof typeof TASK_STATUS_LABELS] ?? a.fromStatus : "new"}{" "}
                → {TASK_STATUS_LABELS[a.toStatus as keyof typeof TASK_STATUS_LABELS] ?? a.toStatus} ·{" "}
                {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
