import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { generateTaskCode, recordTaskTransition } from "@/lib/pm/tasks";
import { serializeTask } from "@/lib/serialize";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/types";

const createSchema = z.object({
  applicationId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(TASK_STATUSES as [string, ...string[]]).optional(),
  priority: z.enum(TASK_PRIORITIES as [string, ...string[]]).optional(),
  assignee: z.string().optional(),
  dueAt: z.string().datetime().optional().nullable(),
  startAt: z.string().datetime().optional().nullable(),
  reference: z.string().optional(),
  tags: z.array(z.string()).optional(),
  epicId: z.string().optional().nullable(),
  estimationHours: z.number().optional().nullable(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const applicationId = searchParams.get("applicationId");
  const includeClosed = searchParams.get("includeClosed") === "true";
  if (!applicationId) {
    return NextResponse.json({ error: "applicationId required" }, { status: 400 });
  }

  const tasks = await prisma.task.findMany({
    where: {
      applicationId,
      ...(includeClosed ? {} : { isClosed: false }),
    },
    include: {
      subtasks: { orderBy: { position: "asc" } },
      comments: { orderBy: { createdAt: "desc" }, take: 5 },
      epic: true,
    },
    orderBy: [{ status: "asc" }, { position: "asc" }],
  });

  return NextResponse.json(tasks.map(serializeTask));
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { applicationId, title, status, ...rest } = parsed.data;
  const columnStatus = status ?? "backlog";
  const count = await prisma.task.count({
    where: { applicationId, status: columnStatus },
  });
  const code = await generateTaskCode(applicationId);

  const task = await prisma.task.create({
    data: {
      applicationId,
      title,
      status: columnStatus,
      position: count,
      code,
      description: rest.description ?? null,
      priority: rest.priority ?? "medium",
      assignee: rest.assignee ?? null,
      dueAt: rest.dueAt ? new Date(rest.dueAt) : null,
      startAt: rest.startAt ? new Date(rest.startAt) : null,
      reference: rest.reference ?? null,
      tags: rest.tags ?? [],
      epicId: rest.epicId ?? null,
      estimationHours: rest.estimationHours ?? null,
    },
    include: { subtasks: true, comments: true, epic: true },
  });

  await recordTaskTransition(task.id, null, columnStatus, "Task created");

  return NextResponse.json(serializeTask(task), { status: 201 });
}
