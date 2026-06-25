import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink, GitBranch, GitCommit, Kanban, Pin } from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";
import { StatusBadge, StackChip } from "@/components/ui/intelligence-badges";
import { ApplicationPinButton } from "@/components/applications/application-pin-button";
import type { Application } from "@/types";
import { LIFECYCLE_PHASE_LABELS } from "@/types";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export function ApplicationCard({ application }: { application: Application }) {
  const repoPath = application.repoUrl?.replace("https://github.com/", "");
  const taskCount = application._count?.tasks;
  const openIssues = application.gitMeta?.openIssues;
  const lastCommitAt = application.gitMeta?.lastCommitAt;

  const metaLabel =
    taskCount != null
      ? `${taskCount} task${taskCount === 1 ? "" : "s"}`
      : openIssues != null
        ? `${openIssues} open issue${openIssues === 1 ? "" : "s"}`
        : application.repoUrl
          ? "Not synced"
          : "No repo";

  return (
    <GlassCard hover className="group/app-card h-full">
      <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1">
        {(taskCount ?? 0) > 0 ? (
          <Link
            href={`/applications/${application.id}/tasks`}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-sm" }),
              "text-muted-foreground hover:text-foreground size-7"
            )}
            title="Open task board"
          >
            <Kanban className="size-3.5" />
          </Link>
        ) : null}
        <ApplicationPinButton
          applicationId={application.id}
          isPinned={application.isPinned}
          size="icon-sm"
          variant="ghost"
        />
      </div>
      <Link href={`/applications/${application.id}`} className="block p-4">
        <div className="mb-2.5 flex items-start justify-between gap-3 pr-7">
          <div className="min-w-0 flex-1">
            <p className="text-foreground flex items-center gap-1 text-sm leading-snug font-medium">
              {application.isPinned ? (
                <Pin className="text-brand-orange size-3 shrink-0" />
              ) : null}
              <span className="line-clamp-1">{application.name}</span>
            </p>
            <p className="text-muted-foreground mt-1 line-clamp-2 text-[11px] leading-relaxed">
              {application.description || "No description"}
            </p>
          </div>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <StatusBadge status={application.status} />
          <span className="text-muted-foreground font-mono text-[11px]">
            {LIFECYCLE_PHASE_LABELS[application.lifecyclePhase]}
          </span>
        </div>

        {repoPath ? (
          <div className="mb-3 flex flex-wrap gap-1">
            <StackChip label={repoPath} />
          </div>
        ) : null}

        <div className="border-border flex items-center justify-between border-t pt-2.5">
          <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
            <GitCommit className="size-3" />
            <span className="font-mono">
              {lastCommitAt
                ? formatDistanceToNow(new Date(lastCommitAt), { addSuffix: true })
                : formatDistanceToNow(new Date(application.updatedAt), {
                    addSuffix: true,
                  })}
            </span>
          </span>
          <span className="text-muted-foreground flex items-center gap-2 text-[11px]">
            {application.websiteUrl ? (
              <ExternalLink className="text-primary size-3" />
            ) : null}
            {repoPath ? <GitBranch className="size-3 opacity-60" /> : null}
            <span className="font-mono">{metaLabel}</span>
          </span>
        </div>
      </Link>
    </GlassCard>
  );
}
