import { generateText } from "ai";
import { getSummaryModel } from "@/lib/ai/model";
import { prisma } from "@/lib/db";
import { fetchRepoTreePaths } from "@/lib/github/fetch-repo-file";
import type { SecurityFinding, SecurityReportResult } from "@/types";

const RISKY_DEPENDENCIES = [
  "lodash",
  "moment",
  "request",
  "node-fetch",
  "serialize-javascript",
];

function analyzeStack(
  dependencies: { name: string; version: string; dev?: boolean }[],
  lockfilePresent: boolean,
  paths: string[]
): SecurityFinding[] {
  const findings: SecurityFinding[] = [];

  if (!lockfilePresent) {
    findings.push({
      severity: "medium",
      title: "No lockfile detected",
      detail:
        "Dependency versions may float between installs. Add package-lock.json, pnpm-lock.yaml, or equivalent.",
    });
  }

  for (const dep of dependencies.filter((d) => !d.dev)) {
    if (RISKY_DEPENDENCIES.includes(dep.name)) {
      findings.push({
        severity: "low",
        title: `Legacy dependency: ${dep.name}`,
        detail: `${dep.name}@${dep.version} is commonly flagged for maintenance or CVE history. Review alternatives.`,
      });
    }
    if (dep.version.startsWith("^0.") || dep.version.startsWith("~0.")) {
      findings.push({
        severity: "low",
        title: `Pre-1.0 dependency: ${dep.name}`,
        detail: `${dep.name}@${dep.version} is pre-1.0 and may have breaking API changes.`,
      });
    }
  }

  const sensitivePaths = paths.filter(
    (p) =>
      p === ".env" ||
      p.endsWith("/.env") ||
      p.includes("credentials.json") ||
      p.includes("secrets.")
  );
  if (sensitivePaths.length > 0) {
    findings.push({
      severity: "high",
      title: "Potential secrets in repository",
      detail: `Found sensitive-looking paths: ${sensitivePaths.slice(0, 5).join(", ")}. Ensure secrets are gitignored.`,
    });
  }

  if (!paths.some((p) => p.includes("test") || p.includes("spec"))) {
    findings.push({
      severity: "low",
      title: "No test directory detected",
      detail: "Automated tests improve security regression coverage.",
    });
  }

  if (!paths.some((p) => p.includes(".github/workflows"))) {
    findings.push({
      severity: "info",
      title: "No GitHub Actions workflows",
      detail: "CI pipelines can run security scans on every push.",
    });
  }

  return findings;
}

function scoreFromFindings(findings: SecurityFinding[]): number {
  let score = 100;
  for (const f of findings) {
    if (f.severity === "high") score -= 25;
    else if (f.severity === "medium") score -= 12;
    else if (f.severity === "low") score -= 5;
    else score -= 1;
  }
  return Math.max(0, Math.min(100, score));
}

function buildOfflineSummary(
  findings: SecurityFinding[],
  score: number
): string {
  const high = findings.filter((f) => f.severity === "high").length;
  const medium = findings.filter((f) => f.severity === "medium").length;
  return `## Security report (offline)

**Score:** ${score}/100

Found ${findings.length} item(s): ${high} high, ${medium} medium.

This report uses dependency and repository heuristics. Add an AI API key for deeper analysis.`;
}

export async function runSecurityAgent(
  applicationId: string
): Promise<SecurityReportResult> {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { stackScan: true, gitMeta: true },
  });

  if (!application) throw new Error("Application not found");

  const dependencies =
    (application.stackScan?.dependencies as {
      name: string;
      version: string;
      dev?: boolean;
    }[]) ?? [];
  const lockfilePresent = application.stackScan?.lockfilePresent ?? false;
  const paths = application.repoUrl
    ? await fetchRepoTreePaths(
        application.repoUrl,
        application.gitMeta?.defaultBranch ?? undefined
      )
    : [];

  let findings = analyzeStack(dependencies, lockfilePresent, paths);

  if (!application.repoUrl) {
    findings = [
      {
        severity: "medium",
        title: "No repository linked",
        detail: "Link a GitHub repo and run stack scan for full analysis.",
      },
    ];
  }

  let score = scoreFromFindings(findings);
  let summary = buildOfflineSummary(findings, score);
  let mode: "ai" | "offline" = "offline";

  const model = getSummaryModel();
  if (model && application.repoUrl) {
    try {
      const { text } = await generateText({
        model,
        prompt: `You are a security analyst. Given these findings for "${application.name}", write a brief markdown security assessment (2-3 paragraphs) with prioritized remediation steps. Do not invent CVEs.

Findings JSON:
${JSON.stringify(findings, null, 2)}

Stack frameworks: ${JSON.stringify(application.stackScan?.frameworks ?? [])}`,
      });
      summary = text;
      mode = "ai";
    } catch {
      // keep offline summary
    }
  }

  const report = await prisma.securityReport.create({
    data: {
      applicationId,
      findings: JSON.parse(JSON.stringify(findings)),
      score,
      summary,
      mode,
    },
  });

  return {
    id: report.id,
    applicationId: report.applicationId,
    findings: report.findings as unknown as SecurityFinding[],
    score: report.score,
    summary: report.summary,
    mode: report.mode as "ai" | "offline",
    generatedAt: report.generatedAt.toISOString(),
  };
}
