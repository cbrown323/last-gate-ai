"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CALENDAR_EVENT_TYPES,
  CALENDAR_EVENT_TYPE_LABELS,
  type CalendarEventType,
  type CalendarItem,
} from "@/types";
import { ChevronLeft, ChevronRight, Plus, CalendarDays, Loader2 } from "lucide-react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const SOURCE_LABEL: Record<CalendarItem["source"], string> = {
  event: "Event",
  task: "Task due",
  epic: "Milestone",
};

function projectLabel(item: CalendarItem): string {
  return item.applicationName ?? "Workspace";
}

function itemAccent(color: string | null): string {
  return color ?? "#10b981";
}

function CalendarItemStack({
  item,
  showProject,
  variant,
}: {
  item: CalendarItem;
  showProject: boolean;
  variant: "compact" | "detail";
}) {
  const accent = itemAccent(item.color);
  const isCompact = variant === "compact";

  return (
    <div
      className={`overflow-hidden rounded-md border ${isCompact ? "text-[10px]" : "text-sm"}`}
      style={{ borderColor: `${accent}35` }}
    >
      <div
        className={`flex min-w-0 items-center gap-1 truncate ${
          isCompact ? "px-1 py-0.5" : "px-2 py-1.5"
        }`}
        style={{ backgroundColor: `${accent}24` }}
        title={item.title}
      >
        <span
          className={`shrink-0 rounded-full ${isCompact ? "size-1.5" : "size-2"}`}
          style={{ backgroundColor: accent }}
        />
        <span className={`truncate ${isCompact ? "" : "font-medium"}`}>{item.title}</span>
      </div>
      {showProject ? (
        <div
          className={`truncate border-t font-medium ${
            isCompact ? "px-1 py-0.5 text-[9px]" : "px-2 py-1 text-xs"
          }`}
          style={{
            backgroundColor: `${accent}12`,
            borderColor: `${accent}25`,
            color: accent,
          }}
          title={projectLabel(item)}
        >
          {projectLabel(item)}
        </div>
      ) : null}
      {!isCompact ? (
        <div className="flex flex-wrap items-center gap-1 border-t px-2 py-1.5" style={{ borderColor: `${accent}20` }}>
          <Badge
            variant="outline"
            className="text-[10px]"
            style={{ borderColor: `${accent}40`, color: accent }}
          >
            {SOURCE_LABEL[item.source]}
          </Badge>
        </div>
      ) : null}
    </div>
  );
}

export function CalendarView({
  initialItems,
  applications,
  applicationId,
}: {
  initialItems: CalendarItem[];
  applications: { id: string; name: string }[];
  applicationId?: string;
}) {
  const router = useRouter();
  const [items, setItems] = useState<CalendarItem[]>(initialItems);
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor));
    const end = endOfWeek(endOfMonth(cursor));
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const itemsByDay = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    for (const item of items) {
      const key = format(parseISO(item.startAt), "yyyy-MM-dd");
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return map;
  }, [items]);

  function dayItems(day: Date): CalendarItem[] {
    return itemsByDay.get(format(day, "yyyy-MM-dd")) ?? [];
  }

  const selectedItems = selectedDay ? dayItems(selectedDay) : [];
  const showProject = !applicationId;

  async function refreshFeed() {
    const url = applicationId
      ? `/api/calendar?mode=feed&applicationId=${applicationId}`
      : `/api/calendar?mode=feed`;
    const res = await fetch(url);
    if (res.ok) setItems(await res.json());
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCursor((c) => addMonths(c, -1))}>
            <ChevronLeft className="size-4" />
          </Button>
          <h2 className="min-w-40 text-center text-lg font-semibold">
            {format(cursor, "MMMM yyyy")}
          </h2>
          <Button variant="outline" size="icon" onClick={() => setCursor((c) => addMonths(c, 1))}>
            <ChevronRight className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCursor(new Date())}>
            Today
          </Button>
        </div>
        <EventDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          applications={applications}
          defaultApplicationId={applicationId}
          defaultDate={selectedDay ?? new Date()}
          onCreated={() => {
            setDialogOpen(false);
            refreshFeed();
          }}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="shadow-sm">
          <CardContent className="p-2 sm:p-3">
            <div className="grid grid-cols-7 border-b pb-1">
              {WEEKDAYS.map((d) => (
                <div key={d} className="text-muted-foreground py-1 text-center text-xs font-medium">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {monthDays.map((day) => {
                const dItems = dayItems(day);
                const isSelected = selectedDay && isSameDay(day, selectedDay);
                return (
                  <button
                    type="button"
                    key={day.toISOString()}
                    onClick={() => setSelectedDay(day)}
                    className={`min-h-20 border-b border-r p-1 text-left align-top transition-colors hover:bg-accent/50 [&:nth-child(7n)]:border-r-0 ${
                      isSameMonth(day, cursor) ? "" : "bg-muted/30 text-muted-foreground"
                    } ${isSelected ? "ring-1 ring-emerald-500 ring-inset" : ""}`}
                  >
                    <span
                      className={`inline-flex size-6 items-center justify-center rounded-full text-xs ${
                        isToday(day) ? "bg-emerald-600 font-semibold text-white" : ""
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                    <div className="mt-0.5 space-y-0.5">
                      {dItems.slice(0, 3).map((item) => (
                        <CalendarItemStack
                          key={item.id}
                          item={item}
                          showProject={showProject}
                          variant="compact"
                        />
                      ))}
                      {dItems.length > 3 ? (
                        <p className="text-muted-foreground px-1 text-[10px]">
                          +{dItems.length - 3} more
                        </p>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-emerald-600" />
              <h3 className="font-semibold">
                {selectedDay ? format(selectedDay, "EEEE, MMM d") : "Select a day"}
              </h3>
            </div>
            {selectedItems.length === 0 ? (
              <p className="text-muted-foreground text-sm">No items on this day.</p>
            ) : (
              <ul className="space-y-2">
                {selectedItems.map((item) => {
                  const body = (
                    <CalendarItemStack
                      item={item}
                      showProject={showProject}
                      variant="detail"
                    />
                  );
                  return (
                    <li key={item.id}>
                      {item.href ? (
                        <Link href={item.href} className="block hover:opacity-80">
                          {body}
                        </Link>
                      ) : (
                        body
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EventDialog({
  open,
  onOpenChange,
  applications,
  defaultApplicationId,
  defaultDate,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applications: { id: string; name: string }[];
  defaultApplicationId?: string;
  defaultDate: Date;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<CalendarEventType>("event");
  const [date, setDate] = useState(format(defaultDate, "yyyy-MM-dd"));
  const [time, setTime] = useState("09:00");
  const [allDay, setAllDay] = useState(false);
  const [appId, setAppId] = useState(defaultApplicationId ?? "none");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDate(format(defaultDate, "yyyy-MM-dd"));
      setAppId(defaultApplicationId ?? "none");
    }
  }, [open, defaultDate, defaultApplicationId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const startAt = new Date(`${date}T${allDay ? "00:00" : time}:00`).toISOString();
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || undefined,
          type,
          startAt,
          allDay,
          applicationId: appId === "none" ? null : appId,
        }),
      });
      if (!res.ok) throw new Error("Failed to create event");
      setTitle("");
      setDescription("");
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger
        render={
          <Button className="bg-emerald-600 hover:bg-emerald-700" size="sm">
            <Plus className="mr-1 size-4" />
            Add event
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New calendar event</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          {error ? <p className="text-destructive text-sm">{error}</p> : null}
          <div className="space-y-1">
            <Label htmlFor="evt-title">Title</Label>
            <Input
              id="evt-title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Sprint review"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => v && setType(v as CalendarEventType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CALENDAR_EVENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {CALENDAR_EVENT_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Application</Label>
              <Select value={appId} onValueChange={(v) => v && setAppId(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Workspace (none)</SelectItem>
                  {applications.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="evt-date">Date</Label>
              <Input
                id="evt-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="evt-time">Time</Label>
              <Input
                id="evt-time"
                type="time"
                value={time}
                disabled={allDay}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
            />
            All day
          </label>
          <div className="space-y-1">
            <Label htmlFor="evt-desc">Description</Label>
            <Textarea
              id="evt-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading || !title}>
            {loading ? <Loader2 className="mr-1 size-4 animate-spin" /> : null}
            Create event
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
