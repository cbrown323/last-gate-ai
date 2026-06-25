import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { serializeSubtask } from "@/lib/serialize";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  status: z.enum(["todo", "doing", "done"]).optional(),
  position: z.number().int().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: subtaskId } = await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const subtask = await prisma.subtask.update({
    where: { id: subtaskId },
    data: parsed.data,
  });

  return NextResponse.json(serializeSubtask(subtask));
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: subtaskId } = await params;
  await prisma.subtask.delete({ where: { id: subtaskId } });
  return NextResponse.json({ ok: true });
}
