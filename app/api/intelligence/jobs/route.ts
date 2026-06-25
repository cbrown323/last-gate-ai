import { NextResponse } from "next/server";
import { listIntelligenceJobs } from "@/lib/applications/intelligence-jobs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const applicationId = searchParams.get("applicationId");

  if (!applicationId) {
    return NextResponse.json(
      { error: "applicationId query parameter required" },
      { status: 400 }
    );
  }

  const jobs = await listIntelligenceJobs(applicationId);
  return NextResponse.json({ jobs });
}
