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
      "Match process weight to phase: discovery needs light structure; launch needs checklists.",
      "One source of truth for status: lifecycle phase + deployment status + board state.",
      "Revisit phase transitions explicitly; don't let apps drift in limbo.",
      "Advance or kill on evidence (velocity, effort, user signal), not sunk cost.",
    ],
    practices: [
      "Set lifecycle phase when creating an application.",
      "Use Discovery for ideas; Planning before heavy coding; Maintenance after launch.",
      "Review phase monthly on the portfolio dashboard.",
      "Watch lifecycle phase timing widgets; overdue phases trigger review.",
      "Use velocity (commits + tasks done) and effort (hours logged) to decide when to advance.",
    ],
    antiPatterns: [
      "Treating every side project like an enterprise launch.",
      "Skipping planning and drowning in unstructured backlog.",
      "Never archiving sunset projects. They clutter your portfolio.",
    ],
    platformTip:
      "Set lifecycle phase on each application. The playbook banner on the app detail page shows phase-specific next steps.",
  },
  {
    id: "kanban",
    title: "Kanban workflow",
    summary:
      "Visualize work, limit work in progress, and optimize flow. The board is your daily command center, and now that agents can build in parallel, your review bandwidth is the real constraint.",
    principles: [
      "Visualize all work on the board (Backlog → To Do → In Progress → Done).",
      "Limit WIP to what you can actually review and verify. Default limit is 3 tasks per app.",
      "Manage flow: pull work when capacity exists, don't push.",
      "Make policies explicit (definition of done, when to move columns).",
    ],
    practices: [
      "Drag tasks between columns; overdue tasks show in red on the dashboard.",
      "Use priorities (Low → Critical) and due dates on every actionable task.",
      "Link GitHub issues via Reference field for traceability.",
      "Write tasks with acceptance criteria so an agent can pick them up cold.",
    ],
    antiPatterns: [
      "10+ items in In Progress. Even with agents building in parallel, unreviewed work is not done.",
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
      "Time-boxed iterations with epics and a roadmap. Suited when you need a predictable delivery cadence or a hard deadline.",
    principles: [
      "Work in sprints (1 to 2 weeks) with a clear sprint goal tied to an epic.",
      "Product backlog ordered by value; sprint backlog is a commitment.",
      "Inspect and adapt: review what shipped versus what was planned.",
    ],
    practices: [
      "Set workflow type to Scrum on the application.",
      "Create epics on the Roadmap with start and end dates.",
      "Assign tasks to epics; use estimation hours to track capacity.",
      "Run a lightweight retro from dashboard stats: what shipped, what slipped, what to change.",
    ],
    antiPatterns: [
      "Ceremony theater without shipping software.",
      "Epics with no dates. They become invisible work.",
      "Changing sprint scope daily without reprioritizing the backlog.",
    ],
    platformTip:
      "Use the Roadmap page for epic timelines. Kanban suits ongoing maintenance; Scrum suits feature pushes with deadlines.",
  },
  {
    id: "prioritization",
    title: "Prioritization & backlog hygiene",
    summary:
      "Most portfolios die in the backlog. Ruthless prioritization keeps them manageable, and triage is exactly the kind of work AI is good at drafting for you.",
    principles: [
      "If everything is high priority, nothing is.",
      "Backlog items need a why: link to epic, issue, or metric.",
      "Stale tasks (over 30 days untouched) need triage: do, defer, or delete.",
      "Automate the work that produces a document or a number. Keep the work that produces a commitment.",
    ],
    practices: [
      "Use Critical sparingly. Reserve it for production incidents.",
      "Weekly: move top 3 items to To Do per active application.",
      "Have an agent cluster duplicates, flag vague tasks, and draft a priority order. You make the final call.",
      "Sync GitHub open issues count with local task backlog size.",
    ],
    antiPatterns: [
      "Infinite backlog with no grooming.",
      "Letting AI make the go/no-go call. Prioritization is judgment, and judgment stays human.",
      "Ignoring the Needs Attention widget on the dashboard.",
    ],
    platformTip:
      "Dashboard shows overdue tasks and stale work across your portfolio. Groom weekly before piling on new work.",
  },
  {
    id: "ai-operations",
    title: "Working with AI agents",
    summary:
      "The real shift in modern PM: you are not the only worker anymore, you manage a small team of agents. Delegate the structured middle and keep the two decisions that need a human: what to build, and what is good enough to ship.",
    principles: [
      "Delegate outcomes with acceptance criteria, not step-by-step instructions.",
      "Context engineering beats prompt engineering: encode your rules, stack, and decisions in files agents read every session.",
      "Trust comes from constraints and verification, not faith. Review everything before it ships.",
      "Automate one repetitive workflow at a time. Run it, fix what breaks, then add the next.",
    ],
    practices: [
      "Keep an AGENTS.md rulebook per project: what agents may do, what they must never do, and the context they need.",
      "Let agents draft plans, specs, status reports, and risk lists. You edit instead of authoring from scratch.",
      "Write every task so an agent could pick it up cold: goal, constraints, how to verify.",
      "Run a weekly audit loop: review what agents shipped, track what they got wrong, feed fixes back into the rulebook.",
    ],
    antiPatterns: [
      "Automating judgment. Strategy, prioritization, and go/no-go decisions stay human.",
      "One giant do-everything prompt instead of small, repeatable workflows.",
      "Trusting agent summaries without reading the diff or clicking through the flow.",
    ],
    platformTip:
      "Write task descriptions with acceptance criteria and use the Reference field to link context. A well-written task doubles as an agent-ready work order.",
  },
  {
    id: "ai-evals",
    title: "Shipping AI features: evals",
    summary:
      "If your product has an AI feature, eval-driven development replaces vibe-based testing. Evals are the new spec: they define what good looks like in measurable, repeatable terms and run on every change.",
    principles: [
      "Eyeballing model outputs is not an eval. An eval is a scored test against a defined set of examples.",
      "Define the invariants first: what the feature must never do, regardless of model or prompt.",
      "Score one dimension per check. A single 'quality' score hides what actually regressed.",
      "Every production failure is a candidate eval case: observe, analyze, evaluate, improve.",
    ],
    practices: [
      "Build a golden set of 20 to 50 real input and expected-output pairs before launch; grow it from production logs.",
      "Re-score after every prompt, model, or pipeline change. Block the change if core cases regress.",
      "Use code checks for deterministic behavior, LLM-as-judge for subjective quality, humans for high-stakes calls.",
      "Review eval scores weekly. When a score drops, find what changed before shipping anything else.",
    ],
    antiPatterns: [
      "Shipping an AI feature with no baseline, then debugging user complaints by feel.",
      "Using AI to skip discovery. Synthesizing real user data is fine; inventing users is not.",
      "Letting a model update land silently without re-running the golden set.",
    ],
    platformTip:
      "Track eval work as tasks tagged `eval` on each AI-powered application, and record score baselines in the app's AI Summary so regressions are visible next session.",
  },
  {
    id: "delivery",
    title: "Delivery & deployment",
    summary:
      "Shipping is a phase, not an accident. Connect board state to deployments and intelligence tabs, and never confuse merged with done.",
    principles: [
      "Definition of Done includes: reviewed, merged, deployed, monitored.",
      "Pre-launch: security scan + headroom check on the app detail tabs.",
      "Post-launch: move app to Growth or Maintenance lifecycle phase.",
    ],
    practices: [
      "Log deployments on the Deployments tab or auto-detect platform files.",
      "Run security agent before production launch tasks close.",
      "Use AI Summary for stakeholder-ready status narratives, then edit it. You own the message.",
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
      "Create 3 to 5 discovery tasks in Backlog (user interviews, competitor scan).",
      "Use AI to synthesize research fast, but talk to real users yourself.",
      "Do not over-build. Validate before the Planning phase.",
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
      "Turn real user complaints into tasks (and eval cases for AI features).",
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
