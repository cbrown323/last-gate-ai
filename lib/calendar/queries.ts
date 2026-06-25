import { prisma } from "@/lib/db";
import { serializeCalendarEvent } from "@/lib/serialize";
import type {
  CalendarEventRecord,
  CalendarEventType,
  CalendarItem,
} from "@/types";

export async function listEvents(
  applicationId?: string | null
): Promise<CalendarEventRecord[]> {
  const events = await prisma.calendarEvent.findMany({
    where:
      applicationId === undefined
        ? {}
        : applicationId === null
          ? { applicationId: null }
          : { applicationId },
    include: { application: { select: { name: true } } },
    orderBy: { startAt: "asc" },
  });
  return events.map(serializeCalendarEvent);
}

const TYPE_COLORS: Record<CalendarEventType, string> = {
  event: "#10b981",
  milestone: "#8b5cf6",
  meeting: "#3b82f6",
  release: "#f59e0b",
  deadline: "#ef4444",
  reminder: "#6b7280",
};

export function eventTypeColor(type: CalendarEventType | null): string {
  if (!type) return TYPE_COLORS.event;
  return TYPE_COLORS[type] ?? TYPE_COLORS.event;
}

/**
 * Unified calendar feed: explicit events + task due dates + epic ranges.
 */
export async function getCalendarItems(options?: {
  applicationId?: string;
}): Promise<CalendarItem[]> {
  const appFilter = options?.applicationId
    ? { applicationId: options.applicationId }
    : {};

  const [events, tasks, epics] = await Promise.all([
    prisma.calendarEvent.findMany({
      where: options?.applicationId
        ? { applicationId: options.applicationId }
        : {},
      include: { application: { select: { name: true } } },
    }),
    prisma.task.findMany({
      where: { ...appFilter, dueAt: { not: null }, isClosed: false },
      include: { application: { select: { name: true } } },
    }),
    prisma.epic.findMany({
      where: { ...appFilter, startsAt: { not: null } },
      include: { application: { select: { name: true } } },
    }),
  ]);

  const items: CalendarItem[] = [];

  for (const e of events) {
    items.push({
      id: `event-${e.id}`,
      source: "event",
      title: e.title,
      startAt: e.startAt.toISOString(),
      endAt: e.endAt?.toISOString() ?? null,
      allDay: e.allDay,
      type: e.type as CalendarEventType,
      color: e.color ?? eventTypeColor(e.type as CalendarEventType),
      applicationId: e.applicationId,
      applicationName: e.application?.name ?? null,
      href: e.applicationId ? `/applications/${e.applicationId}` : null,
    });
  }

  for (const t of tasks) {
    if (!t.dueAt) continue;
    items.push({
      id: `task-${t.id}`,
      source: "task",
      title: t.title,
      startAt: t.dueAt.toISOString(),
      endAt: null,
      allDay: true,
      type: "deadline",
      color: eventTypeColor("deadline"),
      applicationId: t.applicationId,
      applicationName: t.application?.name ?? null,
      href: `/applications/${t.applicationId}/tasks`,
    });
  }

  for (const ep of epics) {
    if (!ep.startsAt) continue;
    items.push({
      id: `epic-${ep.id}`,
      source: "epic",
      title: ep.name,
      startAt: ep.startsAt.toISOString(),
      endAt: ep.endsAt?.toISOString() ?? null,
      allDay: true,
      type: "milestone",
      color: eventTypeColor("milestone"),
      applicationId: ep.applicationId,
      applicationName: ep.application?.name ?? null,
      href: `/applications/${ep.applicationId}/roadmap`,
    });
  }

  return items.sort((a, b) => a.startAt.localeCompare(b.startAt));
}
