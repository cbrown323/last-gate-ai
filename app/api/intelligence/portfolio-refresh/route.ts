import { NextResponse } from "next/server";
import { createIntelligenceJob } from "@/lib/applications/intelligence-jobs";
import { executeIntelligenceJob } from "@/lib/applications/run-intelligence-pipeline";
import { findApplicationsWithRepo } from "@/lib/applications/stale-intelligence";

export async function POST() {
  if (!process.env.GITHUB_TOKEN) {
    return NextResponse.json(
      { error: "GITHUB_TOKEN is not configured — portfolio refresh skipped" },
      { status: 503 }
    );
  }

  const applications = await findApplicationsWithRepo();
  if (applications.length === 0) {
    return NextResponse.json({ jobs: [], message: "No applications with linked repos" });
  }

  const jobs: { applicationId: string; jobId: string; status: string }[] = [];

  for (const app of applications) {
    const job = await createIntelligenceJob({
      applicationId: app.id,
      trigger: "portfolio",
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
  });
}
