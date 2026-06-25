import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { serializeTaskComment } from "@/lib/serialize";

const createSchema = z.object({
  body: z.string().min(1),
  author: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: taskId } = await params;
  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const comment = await prisma.taskComment.create({
    data: {
      taskId,
      body: parsed.data.body,
      author: parsed.data.author ?? null,
    },
  });

  return NextResponse.json(serializeTaskComment(comment), { status: 201 });
}
