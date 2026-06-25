import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  serializeArchitectureMap,
  serializeDeployment,
  serializeGitMeta,
  serializeHeadroomReport,
  serializeSecurityReport,
  serializeStackScan,
} from "@/lib/serialize";
import { PageHeader } from "@/components/layout/page-header";
import { ApplicationEditDialog } from "@/components/applications/application-form";
import { ApplicationPinButton } from "@/components/applications/application-pin-button";
import { NotesWorkspace } from "@/components/notes/notes-workspace";
import { CalendarView } from "@/components/calendar/calendar-view";
import { getCalendarItems } from "@/lib/calendar/queries";
import { serializeApplication } from "@/lib/serialize";
import type { ApplicationStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { ApplicationDetailShell } from "@/components/applications/application-detail-shell";
import { PmViewSwitcher } from "@/components/applications/pm-view-switcher";
import { buildIntelligenceProgress } from "@/lib/applications/intelligence-workflow";
import { ExternalLink } from "lucide-react";
import { DemoPreviewBadge } from "@/components/demo/demo-preview-badge";
import { isDemoApplication } from "@/lib/demo/load-preview";
import { LifecycleBanner } from "@/components/applications/lifecycle-banner";
import type { LifecyclePhase, WorkflowType } from "@/types";
import { formatDistanceToNow } from "date-fns";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      gitMeta: true,
      stackScan: true,
      architectureMap: true,
      summaries: { orderBy: { generatedAt: "desc" }, take: 1 },
      securityReports: { orderBy: { generatedAt: "desc" }, take: 1 },
      headroomReports: { orderBy: { generatedAt: "desc" }, take: 1 },
      deployments: { orderBy: { deployedAt: "desc" }, take: 20 },
    },
  });

  if (!application) notFound();

  const serialized = serializeApplication(application);
  const stackScan = application.stackScan
    ? serializeStackScan(application.stackScan)
    : null;
  const architectureMap = application.architectureMap
    ? serializeArchitectureMap(application.architectureMap)
    : null;
  const securityReport = application.securityReports[0]
    ? serializeSecurityReport(application.securityReports[0])
    : null;
  const headroomReport = application.headroomReports[0]
    ? serializeHeadroomReport(application.headroomReports[0])
    : null;
  const deployments = application.deployments.map(serializeDeployment);
  const gitMeta = application.gitMeta ? serializeGitMeta(application.gitMeta) : null;
  const calendarItems = await getCalendarItems({ applicationId: id });
  const intelligenceProgress = buildIntelligenceProgress({
    hasGitMeta: Boolean(application.gitMeta?.syncedAt),
    hasStackScan: Boolean(application.stackScan),
    hasArchitectureMap: Boolean(application.architectureMap),
    hasSummary: application.summaries.length > 0,
    hasSecurityReport: application.securityReports.length > 0,
    hasHeadroomReport: application.headroomReports.length > 0,
    hasDeployments: application.deployments.length > 0,
  });

  const latestSummary = application.summaries[0]
    ? {
        content: application.summaries[0].content,
        generatedAt: application.summaries[0].generatedAt.toISOString(),
      }
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={application.name}
        description={application.description ?? undefined}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {isDemoApplication(application.name) ? <DemoPreviewBadge /> : null}
            <Badge>{application.status as ApplicationStatus}</Badge>
            <ApplicationPinButton
              applicationId={id}
              isPinned={application.isPinned}
              showLabel
            />
            <ApplicationEditDialog application={serialized} />
            <PmViewSwitcher applicationId={id} />
          </div>
        }
      />
      <ApplicationDetailShell
        applicationId={id}
        repoUrl={application.repoUrl}
        initialProgress={intelligenceProgress}
        stackScan={stackScan}
        architectureMap={architectureMap}
        gitMeta={gitMeta}
        latestSummary={latestSummary}
        securityReport={securityReport}
        headroomReport={headroomReport}
        deployments={deployments}
        advancedContent={
          <LifecycleBanner
            applicationId={id}
            lifecyclePhase={application.lifecyclePhase as LifecyclePhase}
            workflowType={application.workflowType as WorkflowType}
            lifecyclePhaseStartedAt={(
              application.lifecyclePhaseStartedAt ?? application.updatedAt
            ).toISOString()}
          />
        }
        overviewContent={
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <OverviewStat
                label="Lifecycle"
                value={
                  application.lifecyclePhase.charAt(0).toUpperCase() +
                  application.lifecyclePhase.slice(1)
                }
              />
              <OverviewStat
                label="Last commit"
                value={
                  gitMeta?.lastCommitAt
                    ? formatDistanceToNow(new Date(gitMeta.lastCommitAt), { addSuffix: true })
                    : "Not synced"
                }
              />
              <OverviewStat
                label="Commits (30d)"
                value={gitMeta?.commitsLast30Days?.toString() ?? "—"}
              />
              <OverviewStat
                label="Stack"
                value={
                  stackScan?.frameworks.length
                    ? stackScan.frameworks.slice(0, 2).join(", ")
                    : "Not scanned"
                }
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-4">
                <p className="text-muted-foreground text-xs">Repository</p>
                {application.repoUrl ? (
                  <a
                    href={application.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 flex items-center gap-1 text-sm font-medium text-emerald-600"
                  >
                    {application.repoUrl.replace("https://github.com/", "")}
                    <ExternalLink className="size-3" />
                  </a>
                ) : (
                  <p className="mt-1 text-sm font-medium">Not linked</p>
                )}
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-muted-foreground text-xs">Website</p>
                {application.websiteUrl ? (
                  <a
                    href={application.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 flex items-center gap-1 text-sm font-medium text-emerald-600"
                  >
                    {application.websiteUrl.replace(/^https?:\/\//, "")}
                    <ExternalLink className="size-3" />
                  </a>
                ) : (
                  <p className="mt-1 text-sm font-medium">Not linked</p>
                )}
              </div>
            </div>
            {!application.repoUrl || !application.websiteUrl ? (
              <p className="text-muted-foreground text-sm">
                Missing details? Use <span className="font-medium text-foreground">Edit</span> above,
                or open <span className="font-medium text-foreground">Advanced</span> for guided
                analysis and lifecycle controls.
              </p>
            ) : null}
          </>
        }
        notesContent={<NotesWorkspace applicationId={id} />}
        calendarContent={
          <CalendarView
            initialItems={calendarItems}
            applications={[{ id, name: application.name }]}
            applicationId={id}
          />
        }
      />
    </div>
  );
}

function OverviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold">{value}</p>
    </div>
  );
}
