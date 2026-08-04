"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Epic } from "@/types";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const EPIC_COLORS = [
  "bg-emerald-500",
  "bg-blue-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
];

export function RoadmapBoard({
  applicationId,
  initialEpics,
}: {
  applicationId: string;
  initialEpics: Epic[];
}) {
  const [epics, setEpics] = useState(initialEpics);

  useEffect(() => {
    setEpics(initialEpics);
  }, [initialEpics]);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    startsAt: "",
    endsAt: "",
  });

  const timelineStart = epics.reduce((min, e) => {
    if (!e.startsAt) return min;
    const t = new Date(e.startsAt).getTime();
    return min === null || t < min ? t : min;
  }, null as number | null);

  const timelineEnd = epics.reduce((max, e) => {
    if (!e.endsAt) return max;
    const t = new Date(e.endsAt).getTime();
    return max === null || t > max ? t : max;
  }, null as number | null);

  const rangeMs =
    timelineStart !== null && timelineEnd !== null
      ? Math.max(timelineEnd - timelineStart, 1)
      : null;

  async function createEpic(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    const res = await fetch("/api/epics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationId,
        name: form.name,
        description: form.description || undefined,
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
        color: EPIC_COLORS[epics.length % EPIC_COLORS.length],
      }),
    });
    if (res.ok) {
      const epic = await res.json();
      setEpics([...epics, epic]);
      setForm({ name: "", description: "", startsAt: "", endsAt: "" });
      setOpen(false);
    }
  }

  async function deleteEpic(id: string) {
    const res = await fetch(`/api/epics/${id}`, { method: "DELETE" });
    if (res.ok) {
      setEpics(epics.filter((e) => e.id !== id));
    }
  }

  function epicBarStyle(epic: Epic) {
    if (!rangeMs || !timelineStart || !epic.startsAt || !epic.endsAt) {
      return { left: "0%", width: "100%" };
    }
    const start = new Date(epic.startsAt).getTime();
    const end = new Date(epic.endsAt).getTime();
    const left = ((start - timelineStart) / rangeMs) * 100;
    const width = Math.max(((end - start) / rangeMs) * 100, 4);
    return { left: `${left}%`, width: `${width}%` };
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Plan work in epics with date ranges on the roadmap timeline.
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" />
            }
          >
            <Plus className="size-4" />
            Add epic
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New epic</DialogTitle>
            </DialogHeader>
            <form onSubmit={createEpic} className="space-y-3">
              <div className="space-y-1">
                <Label>Name</Label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Start</Label>
                  <Input
                    type="date"
                    value={form.startsAt}
                    onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>End</Label>
                  <Input
                    type="date"
                    value={form.endsAt}
                    onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Create epic
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {epics.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-8 text-center text-sm">
            No epics yet. Create one to build a roadmap for this application.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {timelineStart !== null && timelineEnd !== null ? (
            <div className="text-muted-foreground flex justify-between text-xs">
              <span>{format(new Date(timelineStart), "MMM d, yyyy")}</span>
              <span>{format(new Date(timelineEnd), "MMM d, yyyy")}</span>
            </div>
          ) : null}

          {epics.map((epic, i) => (
            <Card key={epic.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{epic.name}</CardTitle>
                    {epic.description ? (
                      <p className="text-muted-foreground mt-1 text-sm">{epic.description}</p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {epic._count?.tasks ?? 0} tasks
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive size-8"
                      onClick={() => deleteEpic(epic.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {epic.startsAt && epic.endsAt && rangeMs ? (
                  <div className="relative h-8 rounded-md bg-muted">
                    <div
                      className={cn(
                        "absolute top-1 h-6 rounded-md opacity-80",
                        epic.color ?? EPIC_COLORS[i % EPIC_COLORS.length]
                      )}
                      style={epicBarStyle(epic)}
                    />
                  </div>
                ) : (
                  <p className="text-muted-foreground text-xs">Add start and end dates for timeline bar</p>
                )}
                <p className="text-muted-foreground mt-2 text-xs">
                  {epic.startsAt ? format(new Date(epic.startsAt), "MMM d") : "—"}
                  {" → "}
                  {epic.endsAt ? format(new Date(epic.endsAt), "MMM d, yyyy") : "—"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
