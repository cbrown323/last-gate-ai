import type {
  ArchitectureDirectory,
  ArchitectureLayer,
  DependencyEntry,
  SecurityFinding,
} from "@/types";

/** Static preview payloads — authored for UI walkthrough without live AI/GitHub. */

export const demoGitMeta = {
  lastCommitAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  commitCount: 247,
  commitsLast7Days: 12,
  commitsLast30Days: 38,
  contributorCount: 3,
  openIssues: 4,
  defaultBranch: "main",
  syncedAt: new Date(),
};

export const demoStackScan = {
  frameworks: ["Next.js", "React", "Prisma", "Tailwind CSS"],
  languages: ["TypeScript", "CSS"],
  manifestFiles: ["package.json"],
  lockfilePresent: true,
  dependencies: [
    { name: "next", version: "^16.2.9", dev: false },
    { name: "react", version: "^19.2.4", dev: false },
    { name: "@prisma/client", version: "^7.8.0", dev: false },
    { name: "ai", version: "^6.0.208", dev: false },
    { name: "@octokit/rest", version: "^22.0.1", dev: false },
    { name: "recharts", version: "^3.8.0", dev: false },
    { name: "zod", version: "^4.4.3", dev: false },
    { name: "date-fns", version: "^4.4.0", dev: false },
    { name: "lucide-react", version: "^1.21.0", dev: false },
    { name: "tailwindcss", version: "^4", dev: true },
    { name: "typescript", version: "^5", dev: true },
    { name: "eslint", version: "^9", dev: true },
    { name: "prisma", version: "^7.8.0", dev: true },
  ] satisfies DependencyEntry[],
};

export const demoArchitectureLayers: ArchitectureLayer[] = [
  {
    name: "Frontend",
    components: ["Next.js App Router", "shadcn/ui", "Recharts dashboards"],
  },
  {
    name: "Backend",
    components: ["Route Handlers", "Agent orchestration", "GitHub sync API"],
  },
  {
    name: "Core",
    components: ["Shared libraries", "Portfolio analytics", "Serialization"],
  },
  {
    name: "Data",
    components: ["Prisma ORM", "SQLite (dev)", "Application registry"],
  },
  {
    name: "Infrastructure",
    components: ["Vercel deployment", "CI/CD workflows"],
  },
  {
    name: "Quality",
    components: ["ESLint", "TypeScript strict"],
  },
];

export const demoArchitectureDirectories: ArchitectureDirectory[] = [
  { path: "app", role: "App Router pages", layer: "Frontend", fileCount: 18 },
  { path: "components", role: "UI components", layer: "Frontend", fileCount: 24 },
  { path: "lib", role: "Shared libraries", layer: "Core", fileCount: 15 },
  { path: "prisma", role: "Database schema", layer: "Data", fileCount: 3 },
  { path: "types", role: "Shared contracts", layer: "Core", fileCount: 1 },
  { path: "workflow_guide", role: "Agent workflow docs", layer: "Core", fileCount: 10 },
];

export const demoArchitectureDiagram = `graph TB
  L0["Frontend"]
  N1("Next.js App Router")
  N2("shadcn/ui")
  N3("Recharts dashboards")
  L0 --> N1
  L0 --> N2
  L0 --> N3
  L4["Backend"]
  N5("Route Handlers")
  N6("Agent orchestration")
  N7("GitHub sync API")
  L4 --> N5
  L4 --> N6
  L4 --> N7
  L8["Data"]
  N9("Prisma ORM")
  N10("Application registry")
  L8 --> N9
  L8 --> N10`;

export const demoAiSummary = `## Last Gate AI — Project intelligence summary

**Preview mode** — this summary was pre-generated for demo walkthrough (no live AI call).

### Purpose
Last Gate AI is a personal operating system for software portfolios. It centralizes application registry, GitHub metadata, Kanban tasks, stack scanning, architecture mapping, security/headroom agents, and deployment tracking in one admin dashboard.

### Technical profile
Built on **Next.js 16 App Router** with **TypeScript**, **Prisma + SQLite**, and **shadcn/ui**. Integrations include **@octokit/rest** for GitHub sync and the **Vercel AI SDK** for on-demand summaries and agent narratives.

### Maintenance signals
- **247 commits** across **3 contributors**; last commit **2 days ago**
- **4 open issues** — healthy backlog for an active MVP
- Lockfile present; dependencies pinned via \`package-lock.json\`

### Architecture highlights
Clear separation: \`app/\` routes, \`components/\` UI, \`lib/\` for GitHub/AI/agents, \`prisma/\` for persistence. Phase 1–3 features (registry, stack, security, headroom, deployments) are wired through tabbed application detail views.

### Recommended next actions
1. Add \`GITHUB_TOKEN\` and \`AI_GATEWAY_API_KEY\` for live integrations
2. Run production deploy to Vercel with PostgreSQL
3. Extend security agent with Semgrep/Trivy in CI
4. Add portfolio cost rollup and maintenance risk scoring`;

export const demoSecurityFindings: SecurityFinding[] = [
  {
    severity: "info",
    title: "Demo preview data",
    detail:
      "This report uses static sample findings. Connect GitHub and run a live scan for repository-specific results.",
  },
  {
    severity: "low",
    title: "Pre-1.0 dependency: ai",
    detail: "ai@^6.0.208 is pre-1.0 and may have breaking API changes.",
  },
  {
    severity: "info",
    title: "No GitHub Actions workflows",
    detail: "CI pipelines can run security scans on every push.",
  },
  {
    severity: "low",
    title: "Limited test coverage signals",
    detail: "No dedicated test directory detected in preview scan. Add unit/integration tests for agent logic.",
  },
];

export const demoSecuritySummary = `## Security assessment — Last Gate AI (preview)

**Score:** 88/100 · **Mode:** demo preview

Overall posture is **good for an early-stage portfolio tool**. Dependency hygiene is solid with a lockfile and modern framework stack. No high-severity findings in this preview dataset.

### Prioritized remediation
1. **Add CI security gates** — GitHub Actions with \`npm audit\` and optional Semgrep on pull requests
2. **Pin AI SDK upgrades** — monitor \`ai\` package releases before bumping major versions
3. **Expand test coverage** — especially for \`lib/agents/*\` and GitHub sync error paths
4. **Secrets hygiene** — confirm \`.env.local\` is gitignored and document required env vars only in workflow guides

When \`GITHUB_TOKEN\` is configured, re-run the security agent for repo-tree heuristics (lockfiles, sensitive paths, workflow presence).`;

export const demoHeadroomRecommendations = [
  "Next.js supports edge deployment — consider Vercel for auto-scaling and preview deployments.",
  "Prisma detected — plan connection pooling (PgBouncer) before high-traffic production on PostgreSQL.",
  "No caching layer detected — add Redis or CDN for read-heavy portfolio dashboards at scale.",
  "Add CI/CD pipelines to reduce deployment risk as the number of tracked applications grows.",
  "SQLite is fine for local dev; migrate to PostgreSQL before multi-user or hosted production.",
];

export const demoHeadroomSummary = `## Headroom — scale readiness (preview)

**Readiness score:** 78/100 · **Mode:** demo preview

Last Gate AI is well-positioned for **single-operator portfolio management** and moderate traffic. The Next.js + Prisma stack scales cleanly on Vercel with a managed Postgres backend.

### Bottlenecks to watch
- **Database:** SQLite limits concurrent writes; migrate before team-wide usage
- **GitHub API:** Sync and stack scans are rate-limited — cache metadata aggressively (already modeled in \`GitMetadata\`)
- **AI calls:** Summary and agent endpoints should stay on-demand, not batch-polled

### Scale path
1. PostgreSQL + connection pooler
2. Background job queue for repo scans (optional Phase 4)
3. Edge-cached dashboard aggregates for large portfolios

Re-run analysis after linking a live repo and completing stack scan for personalized recommendations.`;

export const demoDeployments = [
  {
    platform: "vercel",
    status: "success",
    url: "https://last-gate-ai.vercel.app",
    version: "v0.1.0-preview",
    notes: "Preview deployment — demo data",
    deployedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    platform: "vercel",
    status: "success",
    url: "https://last-gate-ai-git-main-demo.vercel.app",
    version: "abc12f3",
    notes: "Branch preview",
    deployedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
];

export const demoTasks = [
  {
    title: "Review security agent findings",
    status: "doing",
    position: 0,
    priority: "high",
    code: "LGA-1",
    tags: ["security"],
    assignee: "demo",
    dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    estimationHours: 2,
  },
  {
    title: "Wire PostgreSQL for production",
    status: "todo",
    position: 1,
    priority: "critical",
    code: "LGA-2",
    tags: ["infra"],
    estimationHours: 8,
  },
  {
    title: "Add GITHUB_TOKEN for live sync",
    status: "todo",
    position: 2,
    priority: "medium",
    code: "LGA-3",
    tags: ["setup"],
  },
  {
    title: "Background job queue for repo scans",
    status: "done",
    position: 3,
    priority: "high",
    code: "LGA-9",
    tags: ["automation", "phase4"],
    isClosed: true,
  },
  {
    title: "Server-side intelligence pipeline orchestrator",
    status: "done",
    position: 4,
    priority: "high",
    code: "LGA-10",
    tags: ["automation", "phase4"],
    isClosed: true,
  },
  {
    title: "Configure AI Gateway key",
    status: "backlog",
    position: 5,
    priority: "medium",
    code: "LGA-4",
  },
  {
    title: "PM playbook integration",
    status: "backlog",
    position: 6,
    priority: "high",
    code: "LGA-5",
    tags: ["feature", "pm"],
  },
  {
    title: "Portfolio cost rollup widget",
    status: "backlog",
    position: 7,
    priority: "low",
    code: "LGA-6",
  },
  {
    title: "Ship demo preview mode",
    status: "done",
    position: 8,
    priority: "high",
    code: "LGA-7",
    isClosed: true,
  },
  {
    title: "Implement Kanban board",
    status: "done",
    position: 9,
    priority: "high",
    code: "LGA-8",
    isClosed: true,
  },
];

export const demoNotes = [
  {
    title: "Project Brief",
    isPinned: true,
    tags: ["overview", "planning"],
    content: `# Project Brief

Last Gate AI is a **project intelligence platform** — a personal operating system for software portfolios.

## Goals
- Centralize repos, tasks, deployments, and knowledge
- Surface maintenance and scale signals automatically
- Make every project *feature and data rich*

See [[Architecture Decisions]] for the technical approach and [[Release Plan]] for timeline.

## Open questions
- Multi-user support? (tracked in [[Sprint Retro]])
- Cost rollup widget priority`,
  },
  {
    title: "Architecture Decisions",
    isPinned: false,
    tags: ["architecture", "engineering"],
    content: `# Architecture Decisions

Records the key technical choices. Context lives in [[Project Brief]].

## Stack
- **Next.js 16 App Router** + TypeScript
- **Prisma + SQLite** (dev) → PostgreSQL (prod)
- **shadcn/ui** + Tailwind

## Decisions
1. Server Components by default; client only where interactivity is needed
2. All integration tokens stay server-side in \`.env.local\`
3. Notes use a dependency-free markdown renderer with \`[[wikilinks]]\`

> Revisit caching strategy before the [[Release Plan]] ship date.`,
  },
  {
    title: "Release Plan",
    isPinned: false,
    tags: ["planning", "release"],
    content: `# Release Plan

Roadmap to v1.0. Derived from [[Project Brief]].

## Milestones
- **v0.1** — Registry + GitHub sync (done)
- **v0.2** — Agents + deployments (done)
- **v0.3** — Search, Calendar, Notes (current)
- **v1.0** — Live platform integrations

Follow-ups captured in [[Sprint Retro]].`,
  },
  {
    title: "Sprint Retro",
    isPinned: false,
    tags: ["retro", "process"],
    content: `# Sprint Retro

## What went well
- Shipped [[Release Plan]] v0.3 scope on time
- Clean separation in [[Architecture Decisions]]

## Improve
- Earlier integration testing
- More demo data for walkthroughs`,
  },
  {
    title: "Meeting Notes — Kickoff",
    isPinned: false,
    tags: ["meeting"],
    content: `# Meeting Notes — Kickoff

**Attendees:** Solo operator

## Agenda
- Confirm scope from [[Project Brief]]
- Lock [[Architecture Decisions]]

## Actions
- [ ] Wire search across all entities
- [ ] Add calendar with task + milestone feed
- [ ] Ship Obsidian-style notes`,
  },
];

const DAY = 24 * 60 * 60 * 1000;

export const demoEvents = [
  {
    title: "Sprint Review",
    type: "meeting",
    description: "Demo v0.3 features: search, calendar, notes.",
    startAt: new Date(Date.now() + 1 * DAY),
    allDay: false,
  },
  {
    title: "v0.3 Release",
    type: "release",
    description: "Ship search, calendar, and notes to production.",
    startAt: new Date(Date.now() + 3 * DAY),
    allDay: true,
  },
  {
    title: "Architecture sync",
    type: "meeting",
    description: "Review caching strategy before scale.",
    startAt: new Date(Date.now() + 5 * DAY),
    allDay: false,
  },
  {
    title: "Security agent re-run",
    type: "reminder",
    description: "Re-run security scan after dependency bumps.",
    startAt: new Date(Date.now() - 2 * DAY),
    allDay: true,
  },
  {
    title: "Phase 4 kickoff",
    type: "milestone",
    description: "Begin automation and multi-agent orchestration.",
    startAt: new Date(Date.now() + 14 * DAY),
    allDay: true,
  },
];

export const demoEpics = [
  {
    name: "Phase 3 — Agents & deployments",
    description: "Security, Headroom, and deployment tracking",
    startsAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    endsAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    color: "bg-emerald-500",
    position: 0,
  },
  {
    name: "PM fundamentals",
    description: "Playbook, enriched tasks, roadmap, dashboard widgets",
    startsAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    endsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    color: "bg-blue-500",
    position: 1,
  },
  {
    name: "Phase 4 — Automation",
    description: "Background scans and multi-agent orchestration",
    startsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    endsAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    color: "bg-violet-500",
    position: 2,
  },
];
