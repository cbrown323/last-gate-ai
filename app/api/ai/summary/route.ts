import { NextResponse } from "next/server";
import { z } from "zod";
import { generateApplicationSummary } from "@/lib/ai/summary";

const bodySchema = z.object({
  applicationId: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const summary = await generateApplicationSummary(parsed.data.applicationId);
    return NextResponse.json({
      ...summary,
      generatedAt: summary.generatedAt.toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Summary failed";
    const status = message.includes("not found") ? 404 : message.includes("AI request failed") ? 502 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
