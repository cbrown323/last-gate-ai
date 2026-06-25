import { NextResponse } from "next/server";
import { z } from "zod";
import { createIntelligenceJob } from "@/lib/applications/intelligence-jobs";
import {
  scheduleIntelligenceJob,
  type RunIntelligencePipelineOptions,
} from "@/lib/applications/run-intelligence-pipeline";
import type { IntelligenceStepId } from "@/types";

const bodySchema = z.object({
  applicationId: z.string().min(1),
  fromBeginning: z.boolean().optional(),
  trigger: z.enum(["manual", "cron", "portfolio"]).optional(),
  steps: z
    .array(
      z.enum([
        "git",
        "stack",
        "architecture",
        "summary",
        "security",
        "headroom",
        "deployments",
      ])
    )
    .optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { applicationId, fromBeginning, trigger, steps } = parsed.data;

  const job = await createIntelligenceJob({
    applicationId,
    trigger: trigger ?? "manual",
  });

  const options: RunIntelligencePipelineOptions = {
    fromBeginning: fromBeginning ?? false,
    steps: steps as IntelligenceStepId[] | undefined,
  };

  scheduleIntelligenceJob(job.id, options);

  return NextResponse.json({ jobId: job.id, job });
}
