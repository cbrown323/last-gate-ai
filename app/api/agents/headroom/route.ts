import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { runHeadroomAgent } from "@/lib/agents/headroom";

const bodySchema = z.object({
  applicationId: z.string().min(1),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const applicationId = searchParams.get("applicationId");
  if (!applicationId) {
    return NextResponse.json({ error: "applicationId required" }, { status: 400 });
  }

  const report = await prisma.headroomReport.findFirst({
    where: { applicationId },
    orderBy: { generatedAt: "desc" },
  });
  if (!report) {
    return NextResponse.json({ error: "No headroom report found" }, { status: 404 });
  }

  return NextResponse.json({
    id: report.id,
    applicationId: report.applicationId,
    score: report.score,
    summary: report.summary,
    recommendations: report.recommendations,
    mode: report.mode,
    generatedAt: report.generatedAt.toISOString(),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await runHeadroomAgent(parsed.data.applicationId);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Headroom analysis failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
