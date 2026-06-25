"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskDetailSheet } from "@/components/applications/task-detail-sheet";
import { TaskListView } from "@/components/applications/task-list-view";
import {
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
  type Epic,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "@/types";
import { isTaskOverdue } from "@/lib/pm/utils";
import { Plus, Search, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const PRIORITY_DOT: Record<TaskPriority, string> = {
  low: "bg-slate-400",
  medium: "bg-blue-500",
  high: "bg-amber-500",
  critical: "bg-red-500",
};

export function KanbanBoard({
  applicationId,
  initialTasks,
  initialTaskId,
  epics = [],
  doingWipLimit = 3,
  workflowType = "kanban",
}: {
  applicationId: string;
  initialTasks: Task[];
  initialTaskId?: string;
  epics?: Epic[];
  doingWipLimit?: number;
  workflowType?: "kanban" | "scrum";
}) {
  const [tasks, setTasks] = useState(initialTasks);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  useEffect(() => {
    if (!initialTaskId) return;
    const task = initialTasks.find((t) => t.id === initialTaskId);
    if (task) {
      setSelectedTask(task);
      setSheetOpen(true);
    }
  }, [initialTaskId, initialTasks]);

  const doingCount = tasks.filter((t) => t.status === "doing" && !t.isClosed).length;
  const wipExceeded = doingCount > doingWipLimit;

  const filteredTasks = useMemo(() => {
    const q = filter.toLowerCase().trim();
    if (!q) return tasks.filter((t) => !t.isClosed);
    return tasks.filter(
      (t) =>
        !t.isClosed &&
        (t.title.toLowerCase().includes(q) ||
          t.code?.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          t.assignee?.toLowerCase().includes(q))
    );
  }, [tasks, filter]);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, title, status: "backlog" }),
      });
      if (res.ok) {
        const task = await res.json();
        setTasks([...tasks, task]);
        setTitle("");
      }
    } finally {
      setLoading(false);
    }
  }

  async function moveTask(taskId: string, status: TaskStatus, position?: number) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === status && position === undefined) return;

    const columnTasks = tasks.filter((t) => t.status === status && !t.isClosed);
    const newPosition = position ?? columnTasks.length;

    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, position: newPosition }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTasks(tasks.map((t) => (t.id === taskId ? updated : t)));
    }
  }

  function handleDragStart(taskId: string) {
    setDragTaskId(taskId);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  async function handleDrop(status: TaskStatus) {
    if (!dragTaskId) return;
    await moveTask(dragTaskId, status);
    setDragTaskId(null);
  }

  function openTask(task: Task) {
    setSelectedTask(task);
    setSheetOpen(true);
  }

  function handleTaskUpdate(updated: Task) {
    setTasks(tasks.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTask(updated);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={addTask} className="flex flex-1 gap-2">
          <Input
            placeholder="New task — press Enter to add to Backlog"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Button type="submit" disabled={loading}>
            <Plus className="size-4" />
            Add
          </Button>
        </form>
        <div className="relative w-full sm:w-56">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
          <Input
            className="pl-8"
            placeholder="Filter tasks..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      {workflowType === "kanban" && wipExceeded ? (
        <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          <AlertCircle className="size-4 shrink-0" />
          WIP limit exceeded: {doingCount}/{doingWipLimit} in progress. Finish or move tasks before pulling more work.
        </div>
      ) : null}

      <Tabs defaultValue="board">
        <TabsList>
          <TabsTrigger value="board">Board</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {TASK_STATUSES.map((status) => {
              const columnTasks = filteredTasks
                .filter((t) => t.status === status)
                .sort((a, b) => a.position - b.position);
              const overWip = status === "doing" && columnTasks.length > doingWipLimit;

              return (
                <Card
                  key={status}
                  className={cn(
                    "shadow-sm transition-colors",
                    overWip && "border-amber-400 bg-amber-50/50 dark:bg-amber-950/20"
                  )}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(status)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between text-sm font-medium">
                      <span>{TASK_STATUS_LABELS[status]}</span>
                      <Badge variant="secondary" className="font-normal">
                        {columnTasks.length}
                        {status === "doing" ? ` / ${doingWipLimit}` : ""}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="min-h-[120px] space-y-2">
                    {columnTasks.map((task) => {
                      const overdue =
                        task.dueAt && isTaskOverdue(task.dueAt) && task.status !== "done";
                      return (
                        <div
                          key={task.id}
                          draggable
                          data-priority={task.priority}
                          onDragStart={() => handleDragStart(task.id)}
                          onClick={() => openTask(task)}
                          className={cn(
                            "priority-edge cursor-grab rounded-md border bg-card p-3 text-sm shadow-xs transition-shadow active:cursor-grabbing",
                            overdue && "border-red-300 dark:border-red-800"
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <span
                              className={cn(
                                "mt-1.5 size-2 shrink-0 rounded-full",
                                PRIORITY_DOT[task.priority]
                              )}
                            />
                            <div className="min-w-0 flex-1">
                              {task.code ? (
                                <p className="text-muted-foreground font-mono text-[10px]">
                                  {task.code}
                                </p>
                              ) : null}
                              <p className="font-medium leading-snug">{task.title}</p>
                              <div className="mt-1.5 flex flex-wrap items-center gap-1">
                                {task.tags.slice(0, 3).map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-[10px] px-1 py-0">
                                    {tag}
                                  </Badge>
                                ))}
                                {task.assignee ? (
                                  <span className="text-muted-foreground text-[10px]">
                                    @{task.assignee}
                                  </span>
                                ) : null}
                              </div>
                              {task.dueAt ? (
                                <p
                                  className={cn(
                                    "mt-1 text-[10px]",
                                    overdue ? "text-red-600 font-medium" : "text-muted-foreground"
                                  )}
                                >
                                  Due {format(new Date(task.dueAt), "MMM d")}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <p className="text-muted-foreground mt-3 text-xs">
            Drag cards between columns · Click a card for full details, comments, and subtasks
          </p>
        </TabsContent>

        <TabsContent value="list" className="mt-4">
          <TaskListView
            tasks={filteredTasks}
            onSelect={openTask}
            onStatusChange={(id, status) => moveTask(id, status)}
          />
        </TabsContent>
      </Tabs>

      <TaskDetailSheet
        task={selectedTask}
        epics={epics}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onUpdate={handleTaskUpdate}
      />
    </div>
  );
}
