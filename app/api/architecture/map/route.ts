import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { mapApplicationArchitecture } from "@/lib/architecture/mapper";

const bodySchema = z.object({
  applicationId: z.string().min(1),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const applicationId = searchParams.get("applicationId");
  if (!applicationId) {
    return NextResponse.json({ error: "applicationId required" }, { status: 400 });
  }

  const arch = await prisma.architectureMap.findUnique({ where: { applicationId } });
  if (!arch) {
    return NextResponse.json({ error: "No architecture map found" }, { status: 404 });
  }

  return NextResponse.json({
    id: arch.id,
    applicationId: arch.applicationId,
    layers: arch.layers,
    directories: arch.directories,
    diagram: arch.diagram,
    mappedAt: arch.mappedAt.toISOString(),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await mapApplicationArchitecture(parsed.data.applicationId);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Mapping failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
