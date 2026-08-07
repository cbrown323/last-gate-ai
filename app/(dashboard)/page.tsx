import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { PortfolioStats } from "@/components/charts/portfolio-stats";
import { StatusChart } from "@/components/charts/status-chart";
import { TaskStatusChart, TaskPriorityChart } from "@/components/charts/task-stats";
import { OverdueTasksCard, TaskActivityCard } from "@/components/charts/task-activity";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  getApplications,
  getPinnedApplications,
  getPortfolioStats,
  getTaskPortfolioStats,
} from "@/lib/portfolio";
import { getVelocityEffortStats } from "@/lib/pm/velocity";
import {
  EffortBreakdownChart,
  LifecycleTimeoutCard,
  VelocityByApplicationChart,
  VelocityEffortSummary,
  VelocityMeasurementNote,
} from "@/components/charts/velocity-effort";
import { serializeApplication } from "@/lib/serialize";
import type { LifecyclePhase } from "@/types";
import { IntegrationsSetupBanner } from "@/components/settings/integrations-setup-banner";
import {
  DashboardAdvancedPanel,
  type AdvancedMetricsSection,
} from "@/components/dashboard/dashboard-advanced-panel";
import { DashboardBoard } from "@/components/dashboard/dashboard-board";
import { MetricSectionHeading } from "@/components/dashboard/metric-info";
import { NeedsAttentionCard } from "@/components/dashboard/needs-attention-card";
import { PortfolioIntelligenceRefresh } from "@/components/dashboard/portfolio-intelligence-refresh";
import { WorkInFlightTiles } from "@/components/dashboard/work-in-flight-tiles";
import { buildLifecycleBoardData } from "@/lib/dashboard/lifecycle-board";
import { collectHiddenMetrics } from "@/lib/dashboard/metrics-visibility";
import { collectNeedsAttention } from "@/lib/dashboard/needs-attention";

export default async function DashboardPage() {
  const [stats, taskStats, velocityStats, applications, pinned] = await Promise.all([
    getPortfolioStats(),
    getTaskPortfolioStats(),
    getVelocityEffortStats(),
    getApplications(),
    getPinnedApplications(),
  ]);

  const attention = collectNeedsAttention(
    applications.map((app) => ({
      id: app.id,
      name: app.name,
      status: app.status,
      repoUrl: app.repoUrl,
      gitMeta: app.gitMeta,
    }))
  );

  const hiddenMetrics = collectHiddenMetrics({
    stats,
    taskStats,
    velocityStats,
    attentionCount: attention.length,
  });

  const boardData = buildLifecycleBoardData({
    stats,
    taskStats,
    velocityStats,
    applications: applications.map((app) => ({
      id: app.id,
      name: app.name,
      status: app.status,
      lifecyclePhase: app.lifecyclePhase as LifecyclePhase,
      isPinned: app.isPinned,
      _count: app._count,
    })),
  });

  const serializedPinned = pinned.map(serializeApplication);

  const advancedSections: AdvancedMetricsSection[] = [
    {
      id: "overview",
      label: "Overview",
      icon: "gauge",
      description:
        "Where your portfolio stands right now. Click the info icon on any tile or chart to see what it measures.",
      content: (
        <>
          <section className="space-y-2">
            <MetricSectionHeading
              title="Portfolio composition"
              description="How your applications are split across the pipeline."
            />
            <PortfolioStats stats={stats} attentionItems={attention} hideZero />
          </section>
          <section className="space-y-2">
            <MetricSectionHeading
              title="Work in flight"
              description="Open commitments across every board and repository."
            />
            <WorkInFlightTiles stats={stats} />
          </section>
          <StatusChart stats={stats} />
        </>
      ),
    },
    {
      id: "delivery",
      label: "Delivery",
      icon: "trend",
      description:
        "Throughput and effort signals over the last 7 and 30 days, scored 0–100 so projects can be compared.",
      content: (
        <>
          <VelocityEffortSummary stats={velocityStats} hideZero />
          <div className="grid gap-4 xl:grid-cols-2">
            <VelocityByApplicationChart stats={velocityStats} />
            <EffortBreakdownChart stats={velocityStats} />
          </div>
          <VelocityMeasurementNote stats={velocityStats} />
        </>
      ),
    },
    {
      id: "work",
      label: "Work",
      icon: "tasks",
      description: "The shape of your board — what is queued, what is late, and what moved lately.",
      alerts: stats.overdueTasks,
      content: (
        <>
          <div className="grid gap-4 xl:grid-cols-2">
            <TaskStatusChart stats={taskStats} />
            <TaskPriorityChart stats={taskStats} />
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            <OverdueTasksCard stats={taskStats} />
            <TaskActivityCard stats={taskStats} />
          </div>
        </>
      ),
    },
    {
      id: "health",
      label: "Health",
      icon: "health",
      description:
        "Risk signals worth acting on: applications drifting out of sync and phases running past their window.",
      alerts: attention.length + velocityStats.lifecycleAlerts.length,
      content: (
        <div className="grid gap-4 xl:grid-cols-2">
          <NeedsAttentionCard items={attention} />
          <LifecycleTimeoutCard stats={velocityStats} />
        </div>
      ),
    },
  ];

  const advancedSummary = [
    `${stats.total} app${stats.total === 1 ? "" : "s"}`,
    `velocity ${velocityStats.portfolioVelocity}`,
    `${stats.openTasks} open task${stats.openTasks === 1 ? "" : "s"}`,
    attention.length > 0 ? `${attention.length} needing attention` : "all healthy",
  ].join(" · ");

  return (
    <div className="min-w-0 space-y-5">
      <PageHeader
        title="Portfolio dashboard"
        description="Lifecycle view of your applications and portfolio signals"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <PortfolioIntelligenceRefresh disabled={applications.length === 0} />
            <Link
              href="/applications"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Applications
            </Link>
          </div>
        }
      />
      <IntegrationsSetupBanner />

      {applications.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <p className="text-muted-foreground mb-3 text-sm">
            Register an application to see your lifecycle board.
          </p>
          <Link href="/applications" className={buttonVariants({ size: "sm" })}>
            Go to Applications
          </Link>
        </div>
      ) : (
        <DashboardBoard boardData={boardData} pinnedApplications={serializedPinned} />
      )}

      <DashboardAdvancedPanel
        sections={advancedSections}
        hiddenMetrics={hiddenMetrics}
        summary={advancedSummary}
      />
    </div>
  );
}
