/**
 * Single source of truth for the hover explanations shown on dashboard metrics.
 * `how` must stay in sync with the scoring in `lib/pm/velocity.ts` and the
 * counting in `lib/portfolio.ts` — the tooltips are the only place a user can
 * learn what a score actually means.
 */
export type MetricDefinition = {
  label: string;
  what: string;
  how: string;
  action?: string;
};

export const METRIC_DEFINITIONS = {
  applications: {
    label: "Applications",
    what: "Every application registered in your portfolio.",
    how: "Counts all applications, including archived ones.",
  },
  production: {
    label: "In production",
    what: "Applications you have shipped and are running live.",
    how: "Applications whose status is set to Production.",
  },
  development: {
    label: "In development",
    what: "Applications you are actively building.",
    how: "Applications whose status is set to Development.",
  },
  needsAttention: {
    label: "Needs attention",
    what: "Applications showing a staleness or backlog risk signal.",
    how: "Non-archived applications with no GitHub sync, no commit in 30 days, or more than 10 open issues.",
    action: "Sync the repo or triage its issues to clear the flag.",
  },
  openTasks: {
    label: "Open tasks",
    what: "Work still on your boards across every application.",
    how: "Tasks that are not closed and not in the Done column.",
  },
  overdueTasks: {
    label: "Overdue",
    what: "Open tasks that have passed their due date.",
    how: "Unclosed, not-Done tasks whose due date is in the past.",
    action: "Reschedule or close these first — they distort velocity.",
  },
  openIssues: {
    label: "GitHub issues",
    what: "Open issues across all synced repositories.",
    how: "Sums the cached open-issue count from each application's GitHub metadata.",
  },
  portfolioVelocity: {
    label: "Portfolio velocity",
    what: "How fast the portfolio is moving right now, scored 0–100.",
    how: "Average of each application's velocity score: commits (7d, weighted heaviest), tasks completed, and board edits in the last 7 days.",
    action: "Commit code and move tasks to Done to raise this.",
  },
  portfolioEffort: {
    label: "Portfolio effort",
    what: "How much work you are pouring in, scored 0–100.",
    how: "Combines logged hours and estimates (up to 50 points), commits in 30 days (up to 30), and board transitions (up to 20).",
    action: "High effort with low velocity usually means work is stuck.",
  },
  repoActivity: {
    label: "Repo activity",
    what: "Commit volume across your synced repositories.",
    how: "Total commits in the last 30 days, read from cached GitHub metadata.",
    action: "Run Sync now on an application if this looks stale.",
  },
  boardActivity: {
    label: "Board activity",
    what: "How much you have touched your boards this week.",
    how: "Status moves plus task edits in the last 7 days.",
  },
  velocityByProject: {
    label: "Velocity & effort by project",
    what: "Which applications are carrying the portfolio and which have gone quiet.",
    how: "Per-application velocity and effort scores, both on a 0–100 scale, for the eight highest-scoring applications.",
    action: "A tall effort bar next to a short velocity bar is your bottleneck.",
  },
  effortSignals: {
    label: "Effort signals",
    what: "The raw inputs behind the effort score, before weighting.",
    how: "Commits and tasks completed in 30 days, board edits in 7 days, and total hours logged.",
  },
  tasksByStatus: {
    label: "Tasks by status",
    what: "How your open work is spread across board columns.",
    how: "Counts unclosed tasks in Backlog, To Do, In Progress, and Done.",
    action: "A heavy In Progress column means too much work in flight.",
  },
  tasksByPriority: {
    label: "Tasks by priority",
    what: "Whether your backlog is front-loaded with urgent work.",
    how: "Counts unclosed tasks at each priority level.",
  },
  taskActivity: {
    label: "Recent board activity",
    what: "The latest task movements across all applications.",
    how: "The ten most recent status transitions, newest first.",
  },
  overdueList: {
    label: "Overdue tasks",
    what: "The specific tasks that have slipped past their due date.",
    how: "Up to eight overdue tasks, each linking straight to its board.",
  },
  statusDistribution: {
    label: "Status distribution",
    what: "The shape of your portfolio across the delivery pipeline.",
    how: "Application counts for Production, Development, and Archived.",
  },
  lifecycleTiming: {
    label: "Lifecycle phase timing",
    what: "Applications that have sat in one lifecycle phase too long.",
    how: "Compares days in the current phase against the playbook's recommended window.",
    action: "Advance the phase or reset its start date after a review.",
  },
  needsAttentionApps: {
    label: "Applications needing attention",
    what: "The specific applications behind the Needs attention count.",
    how: "Lists up to five flagged applications with the reason for each.",
  },
} satisfies Record<string, MetricDefinition>;

export type MetricId = keyof typeof METRIC_DEFINITIONS;

export function getMetricDefinition(id: MetricId): MetricDefinition {
  return METRIC_DEFINITIONS[id];
}
