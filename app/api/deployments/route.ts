import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createDeployment,
  detectDeployments,
  listDeployments,
} from "@/lib/deployments/tracker";

const createSchema = z.object({
  applicationId: z.string().min(1),
  platform: z.string().min(1),
  status: z.string().optional(),
  url: z.string().url().optional().or(z.literal("")),
  version: z.string().optional(),
  notes: z.string().optional(),
  detect: z.boolean().optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const applicationId = searchParams.get("applicationId");
  if (!applicationId) {
    return NextResponse.json({ error: "applicationId required" }, { status: 400 });
  }

  const deployments = await listDeployments(applicationId);
  return NextResponse.json({ deployments });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    if (parsed.data.detect) {
      const deployments = await detectDeployments(parsed.data.applicationId);
      return NextResponse.json({ deployments });
    }

    const deployment = await createDeployment(parsed.data.applicationId, {
      platform: parsed.data.platform,
      status: parsed.data.status,
      url: parsed.data.url || undefined,
      version: parsed.data.version,
      notes: parsed.data.notes,
    });
    return NextResponse.json(deployment);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Deployment action failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
