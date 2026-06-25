import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { serializeEpic } from "@/lib/serialize";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
  color: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  position: z.number().int().optional(),
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

  const data = parsed.data;
  const epic = await prisma.epic.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.color !== undefined && { color: data.color }),
      ...(data.parentId !== undefined && { parentId: data.parentId }),
      ...(data.position !== undefined && { position: data.position }),
      ...(data.startsAt !== undefined && {
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
      }),
      ...(data.endsAt !== undefined && {
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
      }),
    },
    include: { _count: { select: { tasks: true } } },
  });

  return NextResponse.json(serializeEpic(epic));
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.epic.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
