import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { recordTaskTransition } from "@/lib/pm/tasks";
import { serializeTask } from "@/lib/serialize";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/types";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  status: z.enum(TASK_STATUSES as [string, ...string[]]).optional(),
  position: z.number().int().optional(),
  priority: z.enum(TASK_PRIORITIES as [string, ...string[]]).optional(),
  assignee: z.string().optional().nullable(),
  dueAt: z.string().datetime().optional().nullable(),
  startAt: z.string().datetime().optional().nullable(),
  reference: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  color: z.string().optional().nullable(),
  epicId: z.string().optional().nullable(),
  isClosed: z.boolean().optional(),
  estimationHours: z.number().optional().nullable(),
  timeSpentHours: z.number().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      subtasks: { orderBy: { position: "asc" } },
      comments: { orderBy: { createdAt: "desc" } },
      transitions: { orderBy: { createdAt: "desc" }, take: 20 },
      epic: true,
    },
  });
  if (!task) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(serializeTask(task));
}

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

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data = parsed.data;
  const updateData: Record<string, unknown> = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.assignee !== undefined) updateData.assignee = data.assignee;
  if (data.reference !== undefined) updateData.reference = data.reference;
  if (data.tags !== undefined) updateData.tags = data.tags;
  if (data.color !== undefined) updateData.color = data.color;
  if (data.epicId !== undefined) updateData.epicId = data.epicId;
  if (data.isClosed !== undefined) updateData.isClosed = data.isClosed;
  if (data.estimationHours !== undefined) updateData.estimationHours = data.estimationHours;
  if (data.timeSpentHours !== undefined) updateData.timeSpentHours = data.timeSpentHours;
  if (data.dueAt !== undefined) {
    updateData.dueAt = data.dueAt ? new Date(data.dueAt) : null;
  }
  if (data.startAt !== undefined) {
    updateData.startAt = data.startAt ? new Date(data.startAt) : null;
  }
  if (data.position !== undefined) updateData.position = data.position;
  if (data.status !== undefined) {
    updateData.status = data.status;
    if (data.status === "doing" && !existing.startAt) {
      updateData.startAt = new Date();
    }
    if (data.status === "done") {
      updateData.isClosed = true;
    }
  }

  const task = await prisma.task.update({
    where: { id },
    data: updateData,
    include: { subtasks: true, comments: true, epic: true },
  });

  if (data.status !== undefined && data.status !== existing.status) {
    await recordTaskTransition(id, existing.status, data.status);
  }

  return NextResponse.json(serializeTask(task));
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
