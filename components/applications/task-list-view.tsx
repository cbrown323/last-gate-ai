"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
  type Task,
  type TaskStatus,
} from "@/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { isTaskOverdue } from "@/lib/pm/utils";

export function TaskListView({
  tasks,
  onSelect,
  onStatusChange,
}: {
  tasks: Task[];
  onSelect: (task: Task) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}) {
  const sorted = [...tasks].sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const pd = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (pd !== 0) return pd;
    return a.position - b.position;
  });

  if (sorted.length === 0) {
    return <p className="text-muted-foreground text-sm">No tasks match your filter.</p>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">Code</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Due</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((task) => {
            const overdue =
              task.dueAt && isTaskOverdue(task.dueAt) && task.status !== "done";
            return (
              <TableRow
                key={task.id}
                className="cursor-pointer"
                onClick={() => onSelect(task)}
              >
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {task.code ?? "—"}
                </TableCell>
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell>
                  <Badge variant="outline">{TASK_PRIORITY_LABELS[task.priority]}</Badge>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Select
                    value={task.status}
                    onValueChange={(v) => v && onStatusChange(task.id, v as TaskStatus)}
                  >
                    <SelectTrigger className="h-8 w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {TASK_STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {task.assignee ?? "—"}
                </TableCell>
                <TableCell
                  className={cn("text-sm", overdue && "text-red-600 font-medium")}
                >
                  {task.dueAt ? format(new Date(task.dueAt), "MMM d, yyyy") : "—"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
