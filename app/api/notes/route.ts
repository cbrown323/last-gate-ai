import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { serializeNote } from "@/lib/serialize";
import { listNotes } from "@/lib/notes/queries";

const createSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
  applicationId: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  isPinned: z.boolean().optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("applicationId");

  if (scope === "workspace") {
    return NextResponse.json(await listNotes(null));
  }
  if (scope) {
    return NextResponse.json(await listNotes(scope));
  }
  return NextResponse.json(await listNotes(undefined));
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { title, content, applicationId, tags, isPinned } = parsed.data;

  const note = await prisma.note.create({
    data: {
      title,
      content: content ?? "",
      applicationId: applicationId || null,
      tags: tags ?? [],
      isPinned: isPinned ?? false,
    },
    include: { application: { select: { name: true } } },
  });

  return NextResponse.json(serializeNote(note), { status: 201 });
}
