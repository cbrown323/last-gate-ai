export type LifecyclePhase =
  | "discovery"
  | "planning"
  | "development"
  | "launch"
  | "growth"
  | "maintenance"
  | "sunset";

export type WorkflowType = "kanban" | "scrum";

export const LIFECYCLE_PHASES: LifecyclePhase[] = [
  "discovery",
  "planning",
  "development",
  "launch",
  "growth",
  "maintenance",
  "sunset",
];

export const LIFECYCLE_PHASE_LABELS: Record<LifecyclePhase, string> = {
  discovery: "Discovery",
  planning: "Planning",
  development: "Development",
  launch: "Launch",
  growth: "Growth",
  maintenance: "Maintenance",
  sunset: "Sunset",
};

export const LIFECYCLE_PHASE_DESCRIPTIONS: Record<LifecyclePhase, string> = {
  discovery:
    "Validate the problem, talk to users, and decide whether this project deserves investment. Output: problem statement, success metrics, go/no-go.",
  planning:
    "Break work into epics and tasks, estimate effort, and define your workflow (Kanban or Scrum). Output: backlog, roadmap, WIP limits.",
  development:
    "Build iteratively. Keep WIP low, move tasks across the board daily, and sync with GitHub issues where possible.",
  launch:
    "Ship to production, run deployment checks, monitor errors, and close launch tasks. Output: live URL, release notes.",
  growth:
    "Measure adoption, iterate on feedback, and prioritize improvements. Track velocity and lead time on the board.",
  maintenance:
    "Keep dependencies updated, respond to security findings, and schedule recurring health scans.",
  sunset:
    "Archive or decommission. Document handoff, export data, and mark the application archived.",
};

export const WORKFLOW_TYPES: WorkflowType[] = ["kanban", "scrum"];

export const WORKFLOW_TYPE_LABELS: Record<WorkflowType, string> = {
  kanban: "Kanban",
  scrum: "Scrum",
};

export interface PlaybookSection {
  id: string;
  title: string;
  summary: string;
  principles: string[];
  practices: string[];
  antiPatterns: string[];
  platformTip: string;
}

export const PLAYBOOK_SECTIONS: PlaybookSection[] = [
  {
    id: "product-lifecycle",
    title: "Product lifecycle",
    summary:
      "Every application moves through predictable phases. Last Gate tracks your current phase per app so you know which practices matter right now.",
    principles: [
      "Match process weight to phase — discovery needs light structure; launch needs checklists.",
      "One source of truth for status: lifecycle phase + deployment status + board state.",
      "Revisit phase transitions explicitly; don't let apps drift in limbo.",
    ],
    practices: [
      "Set lifecycle phase when creating an application.",
      "Use Discovery for ideas; Planning before heavy coding; Maintenance after launch.",
      "Review phase monthly on the portfolio dashboard.",
      "Watch lifecycle phase timing widgets — overdue phases trigger review.",
      "Use velocity (commits + tasks done) and effort (hours logged) to decide when to advance.",
    ],
    antiPatterns: [
      "Treating every side project like an enterprise launch.",
      "Skipping planning and drowning in unstructured backlog.",
      "Never archiving sunset projects — they clutter your portfolio.",
    ],
    platformTip:
      "Set lifecycle phase on each application. The playbook banner on the app detail page shows phase-specific next steps.",
  },
  {
    id: "kanban",
    title: "Kanban workflow",
    summary:
      "Visualize work, limit work-in-progress, and optimize flow. Inspired by Kanboard — the board is your daily command center.",
    principles: [
      "Visualize all work on the board (Backlog → To Do → In Progress → Done).",
      "Limit WIP in In Progress — default limit is 3 tasks per app.",
      "Manage flow: pull work when capacity exists, don't push.",
      "Make policies explicit (definition of done, when to move columns).",
    ],
    practices: [
      "Drag tasks between columns; overdue tasks show in red on the dashboard.",
      "Use priorities (Low → Critical) and due dates on every actionable task.",
      "Link GitHub issues via Reference field for traceability.",
      "Close tasks when done instead of leaving them on the board forever.",
    ],
    antiPatterns: [
      "10+ items in In Progress — context switching kills throughput.",
      "Moving to Done without a definition of done.",
      "Using the board as a wish list with no owners or dates.",
    ],
    platformTip:
      "The In Progress column highlights when you exceed the WIP limit. Use tags like `bug`, `feature`, `chore` for filtering.",
  },
  {
    id: "scrum",
    title: "Scrum basics",
    summary:
      "Time-boxed iterations with epics and a roadmap. Borrowed from Helper's Scrum mode — suited when you need predictable delivery cadence.",
    principles: [
      "Work in sprints (1–2 weeks) with a clear sprint goal tied to an epic.",
      "Product backlog ordered by value; sprint backlog is a commitment.",
      "Inspect and adapt: review what shipped vs. what was planned.",
    ],
    practices: [
      "Set workflow type to Scrum on the application.",
      "Create epics on the Roadmap with start/end dates.",
      "Assign tasks to epics; use estimation hours to track capacity.",
      "Hold a lightweight retro: export overdue/done stats from the dashboard.",
    ],
    antiPatterns: [
      "Ceremony theater without shipping software.",
      "Epics with no dates — they become invisible work.",
      "Changing sprint scope daily without reprioritizing the backlog.",
    ],
    platformTip:
      "Use the Roadmap page for epic timelines. Kanban suits ongoing maintenance; Scrum suits feature pushes with deadlines.",
  },
  {
    id: "prioritization",
    title: "Prioritization & backlog hygiene",
    summary:
      "Most people fail at PM because the backlog becomes a graveyard. Ruthless prioritization keeps portfolios manageable.",
    principles: [
      "If everything is high priority, nothing is.",
      "Backlog items need a why: link to epic, issue, or metric.",
      "Stale tasks (>30 days untouched) need triage: do, defer, or delete.",
    ],
    practices: [
      "Use Critical sparingly — reserve for production incidents.",
      "Weekly: move top 3 items to To Do per active application.",
      "Sync GitHub open issues count with local task backlog size.",
    ],
    antiPatterns: [
      "Infinite backlog with no grooming.",
      "Duplicate tasks for the same GitHub issue.",
      "Ignoring the Needs Attention widget on the dashboard.",
    ],
    platformTip:
      "Dashboard shows overdue tasks and stale work across your portfolio. Groom before adding Phase 4 automation.",
  },
  {
    id: "delivery",
    title: "Delivery & deployment",
    summary:
      "Shipping is a phase, not an accident. Connect board state to deployments and intelligence tabs.",
    principles: [
      "Definition of Done includes: merged, deployed, monitored.",
      "Pre-launch: security scan + headroom check on the app detail tabs.",
      "Post-launch: move app to Growth or Maintenance lifecycle phase.",
    ],
    practices: [
      "Log deployments on the Deployments tab or auto-detect platform files.",
      "Run security agent before production launch tasks close.",
      "Use AI Summary for stakeholder-ready status narratives.",
    ],
    antiPatterns: [
      "Marking Done on the board but never deploying.",
      "Skipping security/headroom on 'small' projects.",
      "No record of what version is live.",
    ],
    platformTip:
      "Launch phase checklist appears on app overview when lifecycle is set to Launch.",
  },
];

export function getPhaseGuidance(phase: LifecyclePhase): string[] {
  const guidance: Record<LifecyclePhase, string[]> = {
    discovery: [
      "Write a one-paragraph problem statement in the app description.",
      "Create 3–5 discovery tasks in Backlog (user interviews, competitor scan).",
      "Do not over-build — validate before Planning phase.",
    ],
    planning: [
      "Create epics on the Roadmap with target dates.",
      "Break epics into tasks with estimates and priorities.",
      "Choose Kanban (flow) or Scrum (sprints) workflow type.",
    ],
    development: [
      "Keep In Progress under the WIP limit.",
      "Link GitHub issues to tasks via Reference.",
      "Sync git metadata weekly for accurate health signals.",
    ],
    launch: [
      "Run Security and Headroom scans before go-live.",
      "Log the production deployment with version and URL.",
      "Close launch epic tasks and document in AI Summary.",
    ],
    growth: [
      "Review dashboard metrics and open issue count monthly.",
      "Prioritize user-facing tasks over internal chores.",
      "Track lead time: created → done on completed tasks.",
    ],
    maintenance: [
      "Schedule dependency and security reviews.",
      "Keep archived candidates in Sunset backlog review.",
      "Use Maintenance status for stable production apps.",
    ],
    sunset: [
      "Export or document critical knowledge.",
      "Archive the application status.",
      "Close or migrate open tasks.",
    ],
  };
  return guidance[phase];
}

export function getNextLifecyclePhase(phase: LifecyclePhase): LifecyclePhase | null {
  const order = LIFECYCLE_PHASES;
  const idx = order.indexOf(phase);
  return idx < order.length - 1 ? order[idx + 1] : null;
}
