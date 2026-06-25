import type { PortfolioStats, TaskPortfolioStats } from "@/types";
import type { VelocityEffortStats } from "@/lib/pm/velocity-types";

export type HiddenMetric = {
  id: string;
  label: string;
  value: string;
};

export function getPortfolioHiddenMetrics(stats: PortfolioStats): HiddenMetric[] {
  const hidden: HiddenMetric[] = [];
  if (stats.total === 0) {
    hidden.push({ id: "total", label: "Applications", value: "0" });
  }
  if (stats.production === 0) {
    hidden.push({ id: "production", label: "Production", value: "0" });
  }
  if (stats.development === 0) {
    hidden.push({ id: "development", label: "In Development", value: "0" });
  }
  if (stats.needsAttention === 0) {
    hidden.push({ id: "needsAttention", label: "Needs Attention", value: "0" });
  }
  return hidden;
}

export function getVelocityHiddenMetrics(stats: VelocityEffortStats): HiddenMetric[] {
  const hidden: HiddenMetric[] = [];
  const hasVelocityActivity =
    stats.commitsLast7Days > 0 ||
    stats.tasksCompletedLast7Days > 0 ||
    stats.boardEditsLast7Days > 0;
  const hasEffortActivity = stats.spentHours > 0 || stats.estimatedHours > 0;

  if (!hasVelocityActivity) {
    hidden.push({ id: "portfolioVelocity", label: "Portfolio velocity", value: "0" });
  }
  if (!hasEffortActivity) {
    hidden.push({ id: "portfolioEffort", label: "Portfolio effort", value: "0" });
  }
  if (stats.commitsLast30Days === 0) {
    hidden.push({ id: "repoActivity", label: "Repo activity (30d)", value: "0" });
  }
  if (stats.boardEditsLast7Days === 0 && stats.tasksCompletedLast30Days === 0) {
    hidden.push({ id: "boardActivity", label: "Board activity", value: "0" });
  }
  return hidden;
}

export function getTaskQuickHiddenMetrics(stats: PortfolioStats): HiddenMetric[] {
  const hidden: HiddenMetric[] = [];
  if (stats.openTasks === 0) {
    hidden.push({ id: "openTasks", label: "Open tasks", value: "0" });
  }
  if (stats.openIssues === 0) {
    hidden.push({ id: "openIssues", label: "GitHub issues", value: "0" });
  }
  return hidden;
}

export function getTaskChartHiddenMetrics(taskStats: TaskPortfolioStats): HiddenMetric[] {
  const totalTasks = Object.values(taskStats.byStatus).reduce((sum, count) => sum + count, 0);
  const hidden: HiddenMetric[] = [];
  if (totalTasks === 0) {
    hidden.push({ id: "taskCharts", label: "Tasks by status / priority", value: "0" });
  }
  if (taskStats.recentActivity.length === 0) {
    hidden.push({ id: "taskActivity", label: "Recent board activity", value: "0" });
  }
  return hidden;
}

export function getEffortChartHiddenMetrics(stats: VelocityEffortStats): HiddenMetric[] {
  const signals =
    stats.commitsLast30Days +
    stats.tasksCompletedLast30Days +
    stats.boardEditsLast7Days +
    Math.round(stats.spentHours);
  if (signals === 0) {
    return [{ id: "effortSignals", label: "Effort signals", value: "0" }];
  }
  return [];
}

export function collectHiddenMetrics({
  stats,
  taskStats,
  velocityStats,
  attentionCount,
}: {
  stats: PortfolioStats;
  taskStats: TaskPortfolioStats;
  velocityStats: VelocityEffortStats;
  attentionCount: number;
}): HiddenMetric[] {
  const hidden = [
    ...getPortfolioHiddenMetrics(stats),
    ...getVelocityHiddenMetrics(velocityStats),
    ...getTaskQuickHiddenMetrics(stats),
    ...getTaskChartHiddenMetrics(taskStats),
    ...getEffortChartHiddenMetrics(velocityStats),
  ];

  if (velocityStats.byApplication.length === 0) {
    hidden.push({ id: "velocityByApp", label: "Velocity & effort by project", value: "0" });
  }
  if (attentionCount === 0) {
    hidden.push({ id: "needsAttentionApps", label: "Applications needing attention", value: "0" });
  }
  if (velocityStats.lifecycleAlerts.length === 0) {
    hidden.push({ id: "lifecycleTiming", label: "Lifecycle phase timing alerts", value: "0" });
  }
  if (stats.total === 0) {
    hidden.push({ id: "statusDistribution", label: "Status distribution", value: "0" });
  }

  return hidden;
}

export function hasVelocityActivity(stats: VelocityEffortStats): boolean {
  return getVelocityHiddenMetrics(stats).length < 4;
}

export function hasPortfolioStat(key: keyof PortfolioStats, stats: PortfolioStats): boolean {
  if (key === "total") return stats.total > 0;
  return stats[key] > 0;
}

export function totalTaskCount(taskStats: TaskPortfolioStats): number {
  return Object.values(taskStats.byStatus).reduce((sum, count) => sum + count, 0);
}

export function hasEffortSignals(stats: VelocityEffortStats): boolean {
  return getEffortChartHiddenMetrics(stats).length === 0;
}
