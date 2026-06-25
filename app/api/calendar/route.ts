import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { serializeCalendarEvent } from "@/lib/serialize";
import { getCalendarItems, listEvents } from "@/lib/calendar/queries";
import { CALENDAR_EVENT_TYPES } from "@/types";

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  applicationId: z.string().optional().nullable(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime().optional().nullable(),
  allDay: z.boolean().optional(),
  type: z.enum(CALENDAR_EVENT_TYPES as [string, ...string[]]).optional(),
  color: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const applicationId = searchParams.get("applicationId") ?? undefined;
  const mode = searchParams.get("mode");

  if (mode === "feed") {
    const items = await getCalendarItems(
      applicationId ? { applicationId } : undefined
    );
    return NextResponse.json(items);
  }

  return NextResponse.json(await listEvents(applicationId ?? undefined));
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { title, description, applicationId, startAt, endAt, allDay, type, color, location } =
    parsed.data;

  const event = await prisma.calendarEvent.create({
    data: {
      title,
      description: description ?? null,
      applicationId: applicationId || null,
      startAt: new Date(startAt),
      endAt: endAt ? new Date(endAt) : null,
      allDay: allDay ?? false,
      type: type ?? "event",
      color: color ?? null,
      location: location ?? null,
    },
    include: { application: { select: { name: true } } },
  });

  return NextResponse.json(serializeCalendarEvent(event), { status: 201 });
}
