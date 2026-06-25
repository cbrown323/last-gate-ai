import { NextResponse } from "next/server";
import { createIntelligenceJob } from "@/lib/applications/intelligence-jobs";
import { executeIntelligenceJob } from "@/lib/applications/run-intelligence-pipeline";
import { findStaleApplicationsForRefresh } from "@/lib/applications/stale-intelligence";

function authorizeCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV === "development";

  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.GITHUB_TOKEN) {
    return NextResponse.json(
      { error: "GITHUB_TOKEN is not configured — cron refresh skipped" },
      { status: 503 }
    );
  }

  const staleApps = await findStaleApplicationsForRefresh();
  if (staleApps.length === 0) {
    return NextResponse.json({ jobs: [], message: "No stale applications found" });
  }

  const jobs: { applicationId: string; jobId: string; status: string }[] = [];

  for (const app of staleApps) {
    const job = await createIntelligenceJob({
      applicationId: app.id,
      trigger: "cron",
    });

    try {
      const result = await executeIntelligenceJob(job.id, { fromBeginning: false });
      jobs.push({
        applicationId: app.id,
        jobId: job.id,
        status: result.status,
      });
    } catch {
      jobs.push({
        applicationId: app.id,
        jobId: job.id,
        status: "failed",
      });
    }
  }

  return NextResponse.json({
    jobs,
    refreshed: jobs.filter((j) => j.status === "complete").length,
    failed: jobs.filter((j) => j.status === "failed").length,
    staleCount: staleApps.length,
  });
}

export async function GET(request: Request) {
  return POST(request);
}
