import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { PortfolioStats } from "@/components/charts/portfolio-stats";
import { StatusChart } from "@/components/charts/status-chart";
import { TaskStatusChart, TaskPriorityChart } from "@/components/charts/task-stats";
import { OverdueTasksCard, TaskActivityCard } from "@/components/charts/task-activity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { AlertTriangle } from "lucide-react";
import type { LifecyclePhase } from "@/types";
import { DemoPreviewBanner } from "@/components/demo/demo-preview-banner";
import { IntegrationsSetupBanner } from "@/components/settings/integrations-setup-banner";
import { getDemoPreviewStatus } from "@/lib/demo/load-preview";
import { DashboardAdvancedPanel } from "@/components/dashboard/dashboard-advanced-panel";
import { DashboardBoard } from "@/components/dashboard/dashboard-board";
import { PortfolioIntelligenceRefresh } from "@/components/dashboard/portfolio-intelligence-refresh";
import { buildLifecycleBoardData } from "@/lib/dashboard/lifecycle-board";
import { collectHiddenMetrics } from "@/lib/dashboard/metrics-visibility";

export default async function DashboardPage() {
  const [stats, taskStats, velocityStats, applications, pinned, demoStatus] = await Promise.all([
    getPortfolioStats(),
    getTaskPortfolioStats(),
    getVelocityEffortStats(),
    getApplications(),
    getPinnedApplications(),
    getDemoPreviewStatus(),
  ]);

  const attention = applications.filter((app) => {
    if (app.status === "archived") return false;
    const stale =
      !app.gitMeta?.lastCommitAt ||
      Date.now() - new Date(app.gitMeta.lastCommitAt).getTime() > 30 * 24 * 60 * 60 * 1000;
    return stale || !app.gitMeta || (app.gitMeta.openIssues ?? 0) > 10;
  });

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

  return (
    <div className="min-w-0 space-y-5">
      <PageHeader
        title="Portfolio dashboard"
        description="Lifecycle view of your applications and portfolio signals"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <PortfolioIntelligenceRefresh disabled={applications.length === 0} />
            <Link href="/applications">
              <Button variant="outline" size="sm">
                Applications
              </Button>
            </Link>
          </div>
        }
      />
      <IntegrationsSetupBanner />
      <DemoPreviewBanner
        loaded={demoStatus.loaded}
        applicationId={demoStatus.applicationId}
      />

      {applications.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <p className="text-muted-foreground mb-3 text-sm">
            Register an application to see your lifecycle board.
          </p>
          <Link href="/applications">
            <Button size="sm">Go to Applications</Button>
          </Link>
        </div>
      ) : (
        <DashboardBoard boardData={boardData} pinnedApplications={serializedPinned} />
      )}

      <DashboardAdvancedPanel hiddenMetrics={hiddenMetrics}>
        <PortfolioStats stats={stats} hideZero />
        <VelocityEffortSummary stats={velocityStats} hideZero />
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">Open tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.openTasks}</div>
              <p className="text-muted-foreground mt-1 text-xs">{stats.doingTasks} in progress</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">Overdue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.overdueTasks}</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">GitHub issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.openIssues}</div>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <OverdueTasksCard stats={taskStats} />
          <TaskActivityCard stats={taskStats} />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <VelocityByApplicationChart stats={velocityStats} />
          <EffortBreakdownChart stats={velocityStats} />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <TaskStatusChart stats={taskStats} />
          <TaskPriorityChart stats={taskStats} />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <StatusChart stats={stats} />
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="size-4 text-amber-500" />
                Needs attention
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {attention.length > 0 ? (
                attention.slice(0, 5).map((app) => (
                  <Link
                    key={app.id}
                    href={`/applications/${app.id}`}
                    className="hover:bg-muted/50 flex items-center justify-between rounded-md border p-3 text-sm"
                  >
                    <span className="font-medium">{app.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {!app.gitMeta ? "Not synced" : `${app.gitMeta.openIssues ?? 0} issues`}
                    </span>
                  </Link>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">All applications look healthy.</p>
              )}
            </CardContent>
          </Card>
        </div>
        <LifecycleTimeoutCard stats={velocityStats} />
        <VelocityMeasurementNote stats={velocityStats} />
      </DashboardAdvancedPanel>
    </div>
  );
}
