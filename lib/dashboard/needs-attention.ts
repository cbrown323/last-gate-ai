export type AttentionKind = "not_synced" | "open_issues" | "no_commits" | "stale";

const STALE_AFTER_MS = 30 * 24 * 60 * 60 * 1000;
const BUSY_ISSUE_THRESHOLD = 10;

export type AttentionItem = {
  id: string;
  name: string;
  /** Human-readable cause, shown next to the application name. */
  reason: string;
  kind: AttentionKind;
  repoUrl?: string | null;
  openIssues?: number;
};

type AttentionInput = {
  id: string;
  name: string;
  status: string;
  repoUrl?: string | null;
  gitMeta?: { lastCommitAt: Date | string | null; openIssues: number | null } | null;
};

/**
 * Mirrors the `needsAttention` rule in `lib/portfolio.ts`, but also reports why
 * each application was flagged so the dashboard can explain itself.
 */
export function collectNeedsAttention(applications: AttentionInput[]): AttentionItem[] {
  const items: AttentionItem[] = [];

  for (const app of applications) {
    if (app.status === "archived") continue;

    const openIssues = app.gitMeta?.openIssues ?? 0;
    const lastCommitAt = app.gitMeta?.lastCommitAt
      ? new Date(app.gitMeta.lastCommitAt).getTime()
      : null;
    const isStale = lastCommitAt === null || Date.now() - lastCommitAt > STALE_AFTER_MS;

    if (!app.gitMeta) {
      items.push({
        id: app.id,
        name: app.name,
        reason: "Not synced with GitHub",
        kind: "not_synced",
        repoUrl: app.repoUrl,
      });
      continue;
    }
    if (openIssues > BUSY_ISSUE_THRESHOLD) {
      items.push({
        id: app.id,
        name: app.name,
        reason: `${openIssues} open issues`,
        kind: "open_issues",
        repoUrl: app.repoUrl,
        openIssues,
      });
      continue;
    }
    if (isStale) {
      items.push({
        id: app.id,
        name: app.name,
        reason: lastCommitAt === null ? "No commit history" : "No commits in 30 days",
        kind: lastCommitAt === null ? "no_commits" : "stale",
        repoUrl: app.repoUrl,
      });
    }
  }

  return items;
}
