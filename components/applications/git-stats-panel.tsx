"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { GitMetadata } from "@/types";
import { RefreshCw } from "lucide-react";
import { useApplicationDetailOptional } from "@/components/applications/application-detail-context";

export function GitStatsPanel({
  applicationId,
  gitMeta,
  repoUrl,
}: {
  applicationId: string;
  gitMeta: GitMetadata | null | undefined;
  repoUrl: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const detail = useApplicationDetailOptional();
  const hideActions = detail?.hidePanelActions ?? false;
  const [error, setError] = useState<string | null>(null);

  async function sync() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/github/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Sync failed");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Git intelligence</CardTitle>
        {!hideActions ? (
          <Button variant="outline" size="sm" onClick={sync} disabled={loading || !repoUrl}>
            <RefreshCw className={`mr-1 size-4 ${loading ? "animate-spin" : ""}`} />
            Sync now
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Last commit" value={
          gitMeta?.lastCommitAt
            ? formatDistanceToNow(new Date(gitMeta.lastCommitAt), { addSuffix: true })
            : "—"
        } />
        <Stat label="Commits (7d)" value={gitMeta?.commitsLast7Days?.toString() ?? "—"} />
        <Stat label="Commits (30d)" value={gitMeta?.commitsLast30Days?.toString() ?? "—"} />
        <Stat label="Total commits" value={gitMeta?.commitCount?.toString() ?? "—"} />
        <Stat label="Contributors" value={gitMeta?.contributorCount?.toString() ?? "—"} />
        <Stat label="Open issues" value={gitMeta?.openIssues?.toString() ?? "—"} />
        <Stat label="Default branch" value={gitMeta?.defaultBranch ?? "—"} />
        {gitMeta?.syncedAt ? (
          <p className="text-muted-foreground col-span-full text-xs">
            Last synced {formatDistanceToNow(new Date(gitMeta.syncedAt), { addSuffix: true })}
          </p>
        ) : null}
        {gitMeta ? (
          <p className="text-muted-foreground col-span-full text-xs">
            Commit counts feed portfolio velocity scores. Re-sync after active development sprints.
          </p>
        ) : null}
        {error ? <p className="text-destructive col-span-full text-sm">{error}</p> : null}
        {!repoUrl ? (
          <p className="text-muted-foreground col-span-full text-sm">Add a GitHub repo URL to enable sync.</p>
        ) : !gitMeta ? (
          <p className="text-muted-foreground col-span-full text-sm">
            {hideActions
              ? "Git sync runs automatically when you start the guided product analysis above."
              : <>No Git data yet. Click <span className="font-medium text-foreground">Sync now</span> to pull repository stats.</>}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
