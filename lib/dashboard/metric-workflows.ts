import type { AttentionKind, AttentionItem } from "@/lib/dashboard/needs-attention";
import type { LifecycleVelocityAlert } from "@/lib/pm/velocity-types";
import { LIFECYCLE_PHASE_LABELS } from "@/types";

export type MetricWorkflowId =
  | "attention-not-synced"
  | "attention-open-issues"
  | "attention-no-commits"
  | "attention-stale"
  | "lifecycle-overdue"
  | "lifecycle-review"
  | "overdue-task";

export type ApplicationFocus = "sync" | "issues" | "lifecycle" | "overdue";

export type WorkflowStep = {
  title: string;
  description: string;
};

export type MetricWorkflow = {
  id: MetricWorkflowId;
  title: string;
  summary: string;
  steps: WorkflowStep[];
  primaryAction: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
  focus?: ApplicationFocus;
};

export function applicationHref(
  applicationId: string,
  options?: {
    tab?: "overview" | "intelligence";
    intel?: "git" | "stack" | "summary" | "deployments";
    focus?: ApplicationFocus;
    taskId?: string;
  }
): string {
  const params = new URLSearchParams();
  if (options?.tab) params.set("tab", options.tab);
  if (options?.intel) params.set("intel", options.intel);
  if (options?.focus) params.set("focus", options.focus);
  if (options?.taskId) params.set("task", options.taskId);

  const query = params.toString();
  if (options?.focus === "overdue" || options?.taskId) {
    const base = `/applications/${applicationId}/tasks`;
    return query ? `${base}?${query}` : base;
  }

  const base = `/applications/${applicationId}`;
  return query ? `${base}?${query}` : base;
}

export function githubIssuesHref(repoUrl: string | null | undefined): string | null {
  if (!repoUrl) return null;
  const normalized = repoUrl.replace(/\/$/, "");
  if (!normalized.includes("github.com")) return null;
  return `${normalized}/issues`;
}

export function attentionWorkflowId(kind: AttentionKind): MetricWorkflowId {
  switch (kind) {
    case "not_synced":
      return "attention-not-synced";
    case "open_issues":
      return "attention-open-issues";
    case "no_commits":
      return "attention-no-commits";
    case "stale":
      return "attention-stale";
  }
}

export function lifecycleWorkflowId(alert: Pick<LifecycleVelocityAlert, "isOverdue">): MetricWorkflowId {
  return alert.isOverdue ? "lifecycle-overdue" : "lifecycle-review";
}

export function buildAttentionWorkflow(item: AttentionItem): MetricWorkflow {
  const id = attentionWorkflowId(item.kind);
  const issuesUrl = githubIssuesHref(item.repoUrl);

  switch (item.kind) {
    case "not_synced":
      return {
        id,
        title: "Connect and sync GitHub",
        summary: `${item.name} has no cached GitHub data yet.`,
        focus: "sync",
        steps: [
          {
            title: "Confirm the repo URL",
            description:
              "Open the application and make sure Repository is set under Overview. Use Edit if it is missing.",
          },
          {
            title: "Check your GitHub token",
            description:
              "Settings → API keys → GitHub token must be saved. Re-check the GitHub integration if sync fails.",
          },
          {
            title: "Pull live git stats",
            description:
              "On the application page, open Intelligence → Git and click Sync now, or use Run full analysis.",
          },
        ],
        primaryAction: {
          label: "Go to Git sync",
          href: applicationHref(item.id, { tab: "intelligence", intel: "git", focus: "sync" }),
        },
        secondaryAction: {
          label: "Open Settings",
          href: "/settings",
        },
      };
    case "open_issues":
      return {
        id,
        title: "Triage open GitHub issues",
        summary: `${item.name} has ${item.openIssues ?? "many"} open issues (threshold: 10).`,
        focus: "issues",
        steps: [
          {
            title: "Refresh issue counts",
            description: "Intelligence → Git → Sync now so the dashboard reflects current GitHub data.",
          },
          {
            title: "Review the backlog on GitHub",
            description:
              "Close duplicates, convert actionable items into board tasks, and defer low-priority work.",
          },
          {
            title: "Track follow-ups here",
            description:
              "Create tasks on the application board for anything that needs local tracking.",
          },
        ],
        primaryAction: issuesUrl
          ? { label: "Open GitHub issues", href: issuesUrl }
          : {
              label: "Go to Git sync",
              href: applicationHref(item.id, { tab: "intelligence", intel: "git", focus: "issues" }),
            },
        secondaryAction: {
          label: "Open task board",
          href: `/applications/${item.id}/tasks`,
        },
      };
    case "no_commits":
      return {
        id,
        title: "Establish commit history",
        summary: `${item.name} is synced but has no recorded commits.`,
        focus: "sync",
        steps: [
          {
            title: "Verify the repository",
            description:
              "Confirm the repo URL points to an active repository with at least one commit on the default branch.",
          },
          {
            title: "Re-sync git metadata",
            description: "Intelligence → Git → Sync now to pull commit history from GitHub.",
          },
          {
            title: "Archive if inactive",
            description:
              "If the project is retired, set status to Archived so it stops appearing in health signals.",
          },
        ],
        primaryAction: {
          label: "Go to Git sync",
          href: applicationHref(item.id, { tab: "intelligence", intel: "git", focus: "sync" }),
        },
      };
    case "stale":
      return {
        id,
        title: "Revive or retire a stale repo",
        summary: `${item.name} has had no commits in the last 30 days.`,
        focus: "sync",
        steps: [
          {
            title: "Confirm whether the project is still active",
            description:
              "A quiet repo may be fine for maintenance apps, or it may need a deliberate push or sunset.",
          },
          {
            title: "Sync and inspect recent activity",
            description: "Intelligence → Git → Sync now, then review last commit and open issues.",
          },
          {
            title: "Update lifecycle or archive",
            description:
              "Advance the lifecycle phase after a review, or archive the application if work has stopped.",
          },
        ],
        primaryAction: {
          label: "Review git activity",
          href: applicationHref(item.id, { tab: "intelligence", intel: "git", focus: "sync" }),
        },
        secondaryAction: {
          label: "Review lifecycle",
          href: applicationHref(item.id, { tab: "overview", focus: "lifecycle" }),
        },
      };
  }
}

export function buildLifecycleWorkflow(alert: LifecycleVelocityAlert): MetricWorkflow {
  const id = lifecycleWorkflowId(alert);
  const phaseLabel = LIFECYCLE_PHASE_LABELS[alert.lifecyclePhase];

  if (alert.isOverdue) {
    return {
      id,
      title: "Resolve overdue lifecycle phase",
      summary: `${alert.applicationName} has been in ${phaseLabel} for ${alert.daysInPhase} days (recommended max: ${alert.maxDays}).`,
      focus: "lifecycle",
      steps: [
        {
          title: "Review exit criteria",
          description:
            "Open the lifecycle panel and confirm whether this phase's goals are met, blocked, or no longer relevant.",
        },
        {
          title: "Advance the phase when ready",
          description:
            "Move to the next lifecycle phase when exit criteria are met. Elapsed timing is kept across phase changes.",
        },
        {
          title: "Align the board with the decision",
          description:
            "Close or reschedule stale tasks so velocity and health metrics reflect the new direction.",
        },
      ],
      primaryAction: {
        label: "Open lifecycle review",
        href: applicationHref(alert.applicationId, { tab: "overview", focus: "lifecycle" }),
      },
    };
  }

  return {
    id,
    title: "Schedule a lifecycle review",
    summary: `${alert.applicationName} is in ${phaseLabel} (day ${alert.daysInPhase} of ${alert.maxDays} recommended).`,
    focus: "lifecycle",
    steps: [
      {
        title: "Check progress against phase goals",
        description:
          "Use the lifecycle guidance and recent velocity signals to decide if you are on track.",
      },
      {
        title: "Document the review outcome",
        description:
          "Advance to the next phase when ready. Elapsed lifecycle timing is preserved when you switch phases.",
      },
      {
        title: "Clear related health flags",
        description: "Resolve any overdue tasks or git sync gaps uncovered during the review.",
      },
    ],
    primaryAction: {
      label: "Start lifecycle review",
      href: applicationHref(alert.applicationId, { tab: "overview", focus: "lifecycle" }),
    },
  };
}

export function buildOverdueTaskWorkflow(input: {
  applicationId: string;
  applicationName: string;
  taskId: string;
  taskTitle: string;
}): MetricWorkflow {
  return {
    id: "overdue-task",
    title: "Clear an overdue task",
    summary: `"${input.taskTitle}" on ${input.applicationName} is past its due date.`,
    focus: "overdue",
    steps: [
      {
        title: "Open the task on the board",
        description: "Review scope, assignee, and whether the due date is still realistic.",
      },
      {
        title: "Finish, reschedule, or close",
        description:
          "Move to Done if complete, set a new due date if still active, or close if no longer needed.",
      },
      {
        title: "Check WIP limits",
        description: "Too many overdue items usually means too much work in progress.",
      },
    ],
    primaryAction: {
      label: "Open on task board",
      href: applicationHref(input.applicationId, {
        focus: "overdue",
        taskId: input.taskId,
      }),
    },
  };
}

export const APPLICATION_FOCUS_GUIDES: Record<
  ApplicationFocus,
  { title: string; steps: WorkflowStep[] }
> = {
  sync: {
    title: "Sync git intelligence",
    steps: [
      {
        title: "Run full analysis or Git sync",
        description:
          "Use Run full analysis in the green card above, or open Intelligence → Git and click Sync now.",
      },
      {
        title: "Confirm the repo URL",
        description: "Overview should show your GitHub repository. Use Edit if it is missing or wrong.",
      },
      {
        title: "Fix integration issues",
        description: "If sync fails, check Settings → API keys and Re-check the GitHub integration.",
      },
    ],
  },
  issues: {
    title: "Triage GitHub issues",
    steps: [
      {
        title: "Sync latest counts",
        description: "Intelligence → Git → Sync now refreshes open-issue totals.",
      },
      {
        title: "Work the backlog on GitHub",
        description: "Close, defer, or convert issues into tasks on this application's board.",
      },
      {
        title: "Re-check the dashboard",
        description: "The health flag clears once open issues drop below the threshold.",
      },
    ],
  },
  lifecycle: {
    title: "Review lifecycle phase",
    steps: [
      {
        title: "Open the lifecycle panel below",
        description: "Compare days in phase against the playbook's recommended window.",
      },
      {
        title: "Advance the phase when ready",
        description:
          "Move forward when exit criteria are met. Elapsed timing stays put across phase changes.",
      },
      {
        title: "Update tasks to match",
        description: "Reschedule or close stale work so metrics reflect the new plan.",
      },
    ],
  },
  overdue: {
    title: "Resolve overdue work",
    steps: [
      {
        title: "Find the highlighted task",
        description: "Overdue cards are sorted to the top of the board columns.",
      },
      {
        title: "Update status or due date",
        description: "Complete the work, push the date, or close if it is no longer relevant.",
      },
      {
        title: "Reduce WIP if this keeps happening",
        description: "Finish in-progress items before pulling new work.",
      },
    ],
  },
};
