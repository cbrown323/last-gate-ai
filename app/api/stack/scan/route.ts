import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { scanApplicationStack } from "@/lib/stack/scanner";

const bodySchema = z.object({
  applicationId: z.string().min(1),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const applicationId = searchParams.get("applicationId");
  if (!applicationId) {
    return NextResponse.json({ error: "applicationId required" }, { status: 400 });
  }

  const scan = await prisma.stackScan.findUnique({ where: { applicationId } });
  if (!scan) {
    return NextResponse.json({ error: "No stack scan found" }, { status: 404 });
  }

  return NextResponse.json({
    id: scan.id,
    applicationId: scan.applicationId,
    frameworks: scan.frameworks,
    languages: scan.languages,
    dependencies: scan.dependencies,
    manifestFiles: scan.manifestFiles,
    lockfilePresent: scan.lockfilePresent,
    scannedAt: scan.scannedAt.toISOString(),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await scanApplicationStack(parsed.data.applicationId);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Scan failed";
    const status = message.includes("GITHUB_TOKEN") ? 503 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
