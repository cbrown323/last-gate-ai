import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { runSecurityAgent } from "@/lib/agents/security";

const bodySchema = z.object({
  applicationId: z.string().min(1),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const applicationId = searchParams.get("applicationId");
  if (!applicationId) {
    return NextResponse.json({ error: "applicationId required" }, { status: 400 });
  }

  const report = await prisma.securityReport.findFirst({
    where: { applicationId },
    orderBy: { generatedAt: "desc" },
  });
  if (!report) {
    return NextResponse.json({ error: "No security report found" }, { status: 404 });
  }

  return NextResponse.json({
    id: report.id,
    applicationId: report.applicationId,
    findings: report.findings,
    score: report.score,
    summary: report.summary,
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
    const result = await runSecurityAgent(parsed.data.applicationId);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Security scan failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
