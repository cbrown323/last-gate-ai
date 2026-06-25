import { generateText } from "ai";
import { getSummaryModel } from "@/lib/ai/model";
import { prisma } from "@/lib/db";
import { fetchRepoTreePaths } from "@/lib/github/fetch-repo-file";
import type { HeadroomReportResult } from "@/types";

function analyzeHeadroom(
  frameworks: string[],
  languages: string[],
  paths: string[],
  gitMeta: {
    contributorCount: number | null;
    openIssues: number | null;
    lastCommitAt: Date | null;
  } | null
): { score: number; recommendations: string[] } {
  const recommendations: string[] = [];
  let score = 70;

  if (frameworks.includes("Next.js")) {
    score += 8;
    recommendations.push("Next.js supports edge deployment — consider Vercel or similar for auto-scaling.");
  }
  if (frameworks.includes("Docker")) {
    score += 5;
    recommendations.push("Docker config detected — container orchestration (K8s, ECS) improves horizontal scale.");
  }
  if (frameworks.includes("Prisma")) {
    recommendations.push("Prisma detected — plan connection pooling (PgBouncer) before high-traffic production.");
  }
  if (paths.some((p) => p.includes("redis") || p.includes("cache"))) {
    score += 10;
    recommendations.push("Caching layer signals found — good for read-heavy scale.");
  } else {
    recommendations.push("No caching layer detected — add Redis or CDN for read-heavy workloads.");
  }
  if (paths.some((p) => p.includes(".github/workflows"))) {
    score += 5;
    recommendations.push("CI/CD workflows present — enables safe incremental deploys.");
  } else {
    recommendations.push("Add CI/CD pipelines to reduce deployment risk at scale.");
  }
  if ((gitMeta?.openIssues ?? 0) > 20) {
    score -= 10;
    recommendations.push("High open issue count — address backlog before scaling traffic.");
  }
  if (gitMeta?.lastCommitAt) {
    const daysSince =
      (Date.now() - gitMeta.lastCommitAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince > 90) {
      score -= 15;
      recommendations.push("Stale repository — refresh dependencies and run load tests before scale-up.");
    }
  }
  if (languages.includes("TypeScript")) {
    score += 5;
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    recommendations: recommendations.slice(0, 8),
  };
}

function buildOfflineSummary(
  score: number,
  recommendations: string[]
): string {
  return `## Headroom report (offline)

**Readiness score:** ${score}/100

**Recommendations:**
${recommendations.map((r) => `- ${r}`).join("\n")}

Add an AI API key for personalized capacity planning.`;
}

export async function runHeadroomAgent(
  applicationId: string
): Promise<HeadroomReportResult> {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { stackScan: true, gitMeta: true },
  });

  if (!application) throw new Error("Application not found");

  const frameworks = (application.stackScan?.frameworks as string[]) ?? [];
  const languages = (application.stackScan?.languages as string[]) ?? [];
  const paths = application.repoUrl
    ? await fetchRepoTreePaths(
        application.repoUrl,
        application.gitMeta?.defaultBranch ?? undefined
      )
    : [];

  const { score, recommendations } = analyzeHeadroom(
    frameworks,
    languages,
    paths,
    application.gitMeta
  );

  let summary = buildOfflineSummary(score, recommendations);
  let mode: "ai" | "offline" = "offline";

  const model = getSummaryModel();
  if (model) {
    try {
      const { text } = await generateText({
        model,
        prompt: `You are a capacity planning engineer (Headroom-style). For app "${application.name}" (${application.status}), write a concise markdown readiness report covering scale headroom, bottlenecks, and 3-5 actionable recommendations.

Frameworks: ${frameworks.join(", ") || "unknown"}
Languages: ${languages.join(", ") || "unknown"}
Contributors: ${application.gitMeta?.contributorCount ?? "unknown"}
Open issues: ${application.gitMeta?.openIssues ?? "unknown"}

Baseline recommendations:
${recommendations.join("\n")}`,
      });
      summary = text;
      mode = "ai";
    } catch {
      // keep offline
    }
  }

  const report = await prisma.headroomReport.create({
    data: {
      applicationId,
      score,
      summary,
      recommendations: JSON.parse(JSON.stringify(recommendations)),
      mode,
    },
  });

  return {
    id: report.id,
    applicationId: report.applicationId,
    score: report.score,
    summary: report.summary,
    recommendations: report.recommendations as unknown as string[],
    mode: report.mode as "ai" | "offline",
    generatedAt: report.generatedAt.toISOString(),
  };
}
