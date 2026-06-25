export type ApplicationTabValue = "overview" | "intelligence" | "notes" | "calendar";

export type IntelligenceTabValue =
  | "stack"
  | "architecture"
  | "git"
  | "summary"
  | "security"
  | "headroom"
  | "deployments";

export type IntelligenceStepId =
  | "git"
  | "stack"
  | "architecture"
  | "summary"
  | "security"
  | "headroom"
  | "deployments";

export type IntelligenceStepStatus = "pending" | "complete" | "skipped";

export type IntelligenceProgress = Record<IntelligenceStepId, IntelligenceStepStatus>;

export type IntelligenceStep = {
  id: IntelligenceStepId;
  label: string;
  description: string;
  tab: IntelligenceTabValue;
  endpoint: string;
  requiresRepo: boolean;
  body?: Record<string, unknown>;
};

export const INTELLIGENCE_STEPS: IntelligenceStep[] = [
  {
    id: "git",
    label: "Git",
    description: "Pull commit activity, contributors, and open issues from GitHub.",
    tab: "git",
    endpoint: "/api/github/sync",
    requiresRepo: true,
  },
  {
    id: "stack",
    label: "Stack",
    description: "Detect frameworks, languages, and dependencies from manifest files.",
    tab: "stack",
    endpoint: "/api/stack/scan",
    requiresRepo: true,
  },
  {
    id: "architecture",
    label: "Architecture",
    description: "Map layers and directory roles from repository structure.",
    tab: "architecture",
    endpoint: "/api/architecture/map",
    requiresRepo: true,
  },
  {
    id: "summary",
    label: "Summary",
    description: "Generate an AI project summary from repo metadata and README.",
    tab: "summary",
    endpoint: "/api/ai/summary",
    requiresRepo: false,
  },
  {
    id: "security",
    label: "Security",
    description: "Scan dependencies and repo patterns for security risks.",
    tab: "security",
    endpoint: "/api/agents/security",
    requiresRepo: false,
  },
  {
    id: "headroom",
    label: "Headroom",
    description: "Assess scale readiness from stack, CI/CD, and maintenance signals.",
    tab: "headroom",
    endpoint: "/api/agents/headroom",
    requiresRepo: false,
  },
  {
    id: "deployments",
    label: "Deployments",
    description: "Detect deployment platform config and track release history.",
    tab: "deployments",
    endpoint: "/api/deployments",
    requiresRepo: true,
    body: { detect: true },
  },
];

export function buildIntelligenceProgress(input: {
  hasGitMeta: boolean;
  hasStackScan: boolean;
  hasArchitectureMap: boolean;
  hasSummary: boolean;
  hasSecurityReport: boolean;
  hasHeadroomReport: boolean;
  hasDeployments: boolean;
}): IntelligenceProgress {
  return {
    git: input.hasGitMeta ? "complete" : "pending",
    stack: input.hasStackScan ? "complete" : "pending",
    architecture: input.hasArchitectureMap ? "complete" : "pending",
    summary: input.hasSummary ? "complete" : "pending",
    security: input.hasSecurityReport ? "complete" : "pending",
    headroom: input.hasHeadroomReport ? "complete" : "pending",
    deployments: input.hasDeployments ? "complete" : "pending",
  };
}

export function getNextIntelligenceStep(
  progress: IntelligenceProgress,
  repoUrl: string | null
): IntelligenceStep | null {
  for (const step of INTELLIGENCE_STEPS) {
    if (progress[step.id] === "complete" || progress[step.id] === "skipped") continue;
    if (step.requiresRepo && !repoUrl) continue;
    return step;
  }
  return null;
}

export function getEffectiveStepStatus(
  step: IntelligenceStep,
  progress: IntelligenceProgress,
  repoUrl: string | null
): IntelligenceStepStatus {
  if (step.requiresRepo && !repoUrl) return "skipped";
  return progress[step.id];
}

export function countCompletedSteps(progress: IntelligenceProgress, repoUrl: string | null): number {
  return INTELLIGENCE_STEPS.filter((step) => {
    const status = getEffectiveStepStatus(step, progress, repoUrl);
    return status === "complete" || status === "skipped";
  }).length;
}

export function isAnalysisComplete(progress: IntelligenceProgress, repoUrl: string | null): boolean {
  return getNextIntelligenceStep(progress, repoUrl) === null;
}
