import { NextResponse } from "next/server";
import { createIntelligenceJob } from "@/lib/applications/intelligence-jobs";
import { executeIntelligenceJob } from "@/lib/applications/run-intelligence-pipeline";
import { findApplicationsWithRepo } from "@/lib/applications/stale-intelligence";
import { prisma } from "@/lib/db";

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

  const jobs: {
    applicationId: string;
    applicationName: string;
    jobId: string;
    status: string;
    error?: string;
  }[] = [];

  for (const app of applications) {
    const job = await createIntelligenceJob({
      applicationId: app.id,
      trigger: "portfolio",
    });

    try {
      const result = await executeIntelligenceJob(job.id, { fromBeginning: false });
      const failedJob = result.status === "failed" ? await prisma.intelligenceJob.findUnique({
        where: { id: job.id },
        select: { error: true },
      }) : null;
      jobs.push({
        applicationId: app.id,
        applicationName: app.name,
        jobId: job.id,
        status: result.status,
        error: failedJob?.error ?? undefined,
      });
    } catch {
      const failedJob = await prisma.intelligenceJob.findUnique({
        where: { id: job.id },
        select: { error: true },
      });
      jobs.push({
        applicationId: app.id,
        applicationName: app.name,
        jobId: job.id,
        status: "failed",
        error: failedJob?.error ?? "Pipeline failed",
      });
    }
  }

  const failedJobs = jobs.filter((j) => j.status === "failed");

  return NextResponse.json({
    jobs,
    refreshed: jobs.filter((j) => j.status === "complete").length,
    failed: failedJobs.length,
    failures: failedJobs.map((j) => ({
      name: j.applicationName,
      error: j.error ?? "Unknown error",
    })),
  });
}
