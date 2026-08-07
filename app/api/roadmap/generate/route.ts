import { NextResponse } from "next/server";
import { z } from "zod";
import { generatePredictiveRoadmap } from "@/lib/pm/predictive-roadmap";

const generateSchema = z.object({
  applicationId: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = generateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await generatePredictiveRoadmap(parsed.data.applicationId);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Roadmap generation failed";
    const status = message === "Application not found" ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
