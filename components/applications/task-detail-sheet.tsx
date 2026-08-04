"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  type Epic,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "@/types";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-amber-100 text-amber-800",
  critical: "bg-red-100 text-red-800",
};

export function TaskDetailSheet({
  task,
  epics,
  open,
  onOpenChange,
  onUpdate,
}: {
  task: Task | null;
  epics: Epic[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (task: Task) => void;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [comment, setComment] = useState("");
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [reference, setReference] = useState("");
  const [tags, setTags] = useState("");
  const [estimationHours, setEstimationHours] = useState("");
  const [timeSpentHours, setTimeSpentHours] = useState("");

  useEffect(() => {
    if (!task || !open) return;
    setDescription(task.description ?? "");
    setAssignee(task.assignee ?? "");
    setDueDate(task.dueAt ? task.dueAt.slice(0, 10) : "");
    setReference(task.reference ?? "");
    setTags(task.tags.join(", "));
    setEstimationHours(
      task.estimationHours != null ? String(task.estimationHours) : ""
    );
    setTimeSpentHours(String(task.timeSpentHours));
  }, [task?.id, open]);

  if (!task) return null;

  async function patch(data: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch(`/api/tasks/${task!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        onUpdate(updated);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  async function addComment(e: React.FormEvent) {
    e.preventDefault();
    if (!task || !comment.trim()) return;
    const res = await fetch(`/api/tasks/${task.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: comment }),
    });
    if (res.ok) {
      const updatedRes = await fetch(`/api/tasks/${task.id}`);
      if (updatedRes.ok) {
        onUpdate(await updatedRes.json());
      }
      setComment("");
    }
  }

  async function addSubtask(e: React.FormEvent) {
    e.preventDefault();
    if (!task || !subtaskTitle.trim()) return;
    const res = await fetch(`/api/tasks/${task.id}/subtasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: subtaskTitle }),
    });
    if (res.ok) {
      const updatedRes = await fetch(`/api/tasks/${task.id}`);
      if (updatedRes.ok) {
        onUpdate(await updatedRes.json());
      }
      setSubtaskTitle("");
    }
  }

  async function toggleSubtask(subtaskId: string, done: boolean) {
    if (!task) return;
    await fetch(`/api/subtasks/${subtaskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: done ? "done" : "todo" }),
    });
    const updatedRes = await fetch(`/api/tasks/${task.id}`);
    if (updatedRes.ok) {
      onUpdate(await updatedRes.json());
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="pr-8 text-left">
            {task.code ? (
              <span className="text-muted-foreground mr-2 font-mono text-sm">{task.code}</span>
            ) : null}
            {task.title}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-5 px-1">
          <div className="flex flex-wrap gap-2">
            <Badge className={cn(PRIORITY_COLORS[task.priority])}>
              {TASK_PRIORITY_LABELS[task.priority]}
            </Badge>
            <Badge variant="outline">{TASK_STATUS_LABELS[task.status]}</Badge>
            {task.isClosed ? <Badge variant="secondary">Closed</Badge> : null}
          </div>

          <div className="grid gap-3">
            <div className="space-y-1">
              <Label>Status</Label>
              <Select
                value={task.status}
                onValueChange={(v) => v && patch({ status: v as TaskStatus })}
              >
                <SelectTrigger>
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
            </div>

            <div className="space-y-1">
              <Label>Priority</Label>
              <Select
                value={task.priority}
                onValueChange={(v) => v && patch({ priority: v as TaskPriority })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {TASK_PRIORITY_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="task-desc">Description</Label>
              <Textarea
                id="task-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                onBlur={() => {
                  if (description !== (task.description ?? "")) {
                    patch({ description: description || null });
                  }
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="task-assignee">Assignee</Label>
                <Input
                  id="task-assignee"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  onBlur={() => patch({ assignee: assignee || null })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="task-due">Due date</Label>
                <Input
                  id="task-due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  onBlur={() => {
                    const currentDue = task.dueAt ? task.dueAt.slice(0, 10) : "";
                    if (dueDate !== currentDue) {
                      patch({
                        dueAt: dueDate
                          ? new Date(dueDate).toISOString()
                          : null,
                      });
                    }
                  }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="task-ref">Reference (GitHub issue URL)</Label>
              <div className="flex gap-2">
                <Input
                  id="task-ref"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="https://github.com/owner/repo/issues/1"
                  onBlur={() => patch({ reference: reference || null })}
                />
                {task.reference ? (
                  <Button
                    variant="outline"
                    size="icon"
                    nativeButton={false}
                    render={<a href={task.reference} target="_blank" rel="noreferrer" />}
                  >
                    <ExternalLink className="size-4" />
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="task-tags">Tags (comma-separated)</Label>
              <Input
                id="task-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="bug, feature, chore"
                onBlur={() => {
                  const parsed = tags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean);
                  if (parsed.join(",") !== task.tags.join(",")) patch({ tags: parsed });
                }}
              />
            </div>

            {epics.length > 0 ? (
              <div className="space-y-1">
                <Label>Epic</Label>
                <Select
                  value={task.epicId ?? "none"}
                  onValueChange={(v) =>
                    patch({ epicId: v === "none" ? null : v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No epic</SelectItem>
                    {epics.map((epic) => (
                      <SelectItem key={epic.id} value={epic.id}>
                        {epic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="task-est">Estimate (hours)</Label>
                <Input
                  id="task-est"
                  type="number"
                  min={0}
                  step={0.5}
                  value={estimationHours}
                  onChange={(e) => setEstimationHours(e.target.value)}
                  onBlur={() =>
                    patch({
                      estimationHours: estimationHours
                        ? parseFloat(estimationHours)
                        : null,
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="task-spent">Time spent (hours)</Label>
                <Input
                  id="task-spent"
                  type="number"
                  min={0}
                  step={0.5}
                  value={timeSpentHours}
                  onChange={(e) => setTimeSpentHours(e.target.value)}
                  onBlur={() =>
                    patch({ timeSpentHours: parseFloat(timeSpentHours) || 0 })
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="mb-2 text-sm font-medium">Subtasks</h4>
            <form onSubmit={addSubtask} className="mb-2 flex gap-2">
              <Input
                placeholder="Add subtask..."
                value={subtaskTitle}
                onChange={(e) => setSubtaskTitle(e.target.value)}
              />
              <Button type="submit" size="icon" variant="outline">
                <Plus className="size-4" />
              </Button>
            </form>
            <ul className="space-y-1">
              {(task.subtasks ?? []).map((st) => (
                <li key={st.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={st.status === "done"}
                    onChange={(e) => toggleSubtask(st.id, e.target.checked)}
                  />
                  <span className={st.status === "done" ? "text-muted-foreground line-through" : ""}>
                    {st.title}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          <div>
            <h4 className="mb-2 text-sm font-medium">Comments</h4>
            <form onSubmit={addComment} className="mb-3 space-y-2">
              <Textarea
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
              />
              <Button type="submit" size="sm" disabled={!comment.trim()}>
                Comment
              </Button>
            </form>
            <ul className="space-y-3">
              {(task.comments ?? []).map((c) => (
                <li key={c.id} className="rounded-md border p-3 text-sm">
                  <p>{c.body}</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-muted-foreground text-xs">
            Created {format(new Date(task.createdAt), "MMM d, yyyy")}
            {task.dueAt && task.status !== "done" ? (
              <> · Due {format(new Date(task.dueAt), "MMM d, yyyy")}</>
            ) : null}
          </p>

          {saving ? (
            <p className="text-muted-foreground text-xs">Saving...</p>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
