import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { serializeEpic } from "@/lib/serialize";

const createSchema = z.object({
  applicationId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
  color: z.string().optional(),
  parentId: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const applicationId = searchParams.get("applicationId");
  if (!applicationId) {
    return NextResponse.json({ error: "applicationId required" }, { status: 400 });
  }

  const epics = await prisma.epic.findMany({
    where: { applicationId },
    include: { _count: { select: { tasks: true } } },
    orderBy: [{ position: "asc" }, { startsAt: "asc" }],
  });

  return NextResponse.json(epics.map(serializeEpic));
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { applicationId, name, ...rest } = parsed.data;
  const count = await prisma.epic.count({ where: { applicationId } });

  const epic = await prisma.epic.create({
    data: {
      applicationId,
      name,
      position: count,
      description: rest.description ?? null,
      startsAt: rest.startsAt ? new Date(rest.startsAt) : null,
      endsAt: rest.endsAt ? new Date(rest.endsAt) : null,
      color: rest.color ?? null,
      parentId: rest.parentId ?? null,
    },
    include: { _count: { select: { tasks: true } } },
  });

  return NextResponse.json(serializeEpic(epic), { status: 201 });
}
