import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { serializeCalendarEvent } from "@/lib/serialize";
import { CALENDAR_EVENT_TYPES } from "@/types";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional().nullable(),
  allDay: z.boolean().optional(),
  type: z.enum(CALENDAR_EVENT_TYPES as [string, ...string[]]).optional(),
  color: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const d = parsed.data;
  try {
    const event = await prisma.calendarEvent.update({
      where: { id },
      data: {
        ...(d.title !== undefined ? { title: d.title } : {}),
        ...(d.description !== undefined ? { description: d.description } : {}),
        ...(d.startAt !== undefined ? { startAt: new Date(d.startAt) } : {}),
        ...(d.endAt !== undefined
          ? { endAt: d.endAt ? new Date(d.endAt) : null }
          : {}),
        ...(d.allDay !== undefined ? { allDay: d.allDay } : {}),
        ...(d.type !== undefined ? { type: d.type } : {}),
        ...(d.color !== undefined ? { color: d.color } : {}),
        ...(d.location !== undefined ? { location: d.location } : {}),
      },
      include: { application: { select: { name: true } } },
    });
    return NextResponse.json(serializeCalendarEvent(event));
  } catch {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.calendarEvent.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
}
