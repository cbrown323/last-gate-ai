export const DEMO_APP_NAME = "Last Gate AI (demo)";

export const DEMO_APP_DEFAULTS = {
  name: DEMO_APP_NAME,
  description:
    "Project Intelligence Platform — portfolio OS for managing applications, stack intelligence, agents, and deployments. This entry uses pre-filled preview data (no GitHub or AI keys required).",
  status: "development" as const,
  repoUrl: "https://github.com/demo/last-gate-ai",
  websiteUrl: "https://last-gate-ai.vercel.app",
  owner: "demo",
  lifecyclePhase: "development" as const,
  workflowType: "kanban" as const,
  ticketPrefix: "LGA",
  isPinned: true,
  doingWipLimit: 3,
};
