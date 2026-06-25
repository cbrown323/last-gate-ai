import type { PortfolioStats, TaskPortfolioStats, LifecyclePhase } from "@/types";
import type { VelocityEffortStats } from "@/lib/pm/velocity-types";
import { LIFECYCLE_PHASE_LABELS } from "@/types";

export const LIFECYCLE_PHASE_ORDER: LifecyclePhase[] = [
  "discovery",
  "planning",
  "development",
  "launch",
  "growth",
  "maintenance",
  "sunset",
];

export type TileAccent = "default" | "success" | "warning" | "danger" | "info";
export type TileSize = "xs" | "sm" | "md" | "lg" | "xl";

export type BoardTile = {
  id: string;
  label: string;
  value: string;
  hint?: string;
  href?: string;
  applicationId?: string;
  weight: number;
  accent: TileAccent;
  size: TileSize;
};

export type LifecycleColumn = {
  phase: LifecyclePhase;
  label: string;
  tiles: BoardTile[];
};

export type LifecycleBoardData = {
  portfolioTiles: BoardTile[];
  columns: LifecycleColumn[];
};

type AppInput = {
  id: string;
  name: string;
  status: string;
  lifecyclePhase: LifecyclePhase;
  isPinned: boolean;
  _count?: { tasks: number };
};

function weightToSize(weight: number, maxWeight: number): TileSize {
  if (maxWeight <= 0) return "sm";
  const ratio = weight / maxWeight;
  if (ratio >= 0.85) return "xl";
  if (ratio >= 0.6) return "lg";
  if (ratio >= 0.35) return "md";
  if (ratio >= 0.15) return "sm";
  return "xs";
}

function withSizes(tiles: Omit<BoardTile, "size">[]): BoardTile[] {
  const max = Math.max(...tiles.map((tile) => tile.weight), 1);
  return tiles.map((tile) => ({ ...tile, size: weightToSize(tile.weight, max) }));
}

export function buildLifecycleBoardData({
  stats,
  taskStats,
  velocityStats,
  applications,
}: {
  stats: PortfolioStats;
  taskStats: TaskPortfolioStats;
  velocityStats: VelocityEffortStats;
  applications: AppInput[];
}): LifecycleBoardData {
  const velocityByApp = new Map(
    velocityStats.byApplication.map((app) => [app.applicationId, app])
  );
  const alertByApp = new Map(
    velocityStats.lifecycleAlerts.map((alert) => [alert.applicationId, alert])
  );

  const portfolioCandidates: Omit<BoardTile, "size">[] = [];

  if (stats.total > 0) {
    portfolioCandidates.push({
      id: "applications",
      label: "Applications",
      value: String(stats.total),
      hint: stats.archived > 0 ? `${stats.archived} archived` : undefined,
      weight: stats.total,
      accent: "success",
    });
  }
  if (stats.production > 0) {
    portfolioCandidates.push({
      id: "production",
      label: "Production",
      value: String(stats.production),
      weight: stats.production * 1.4,
      accent: "info",
    });
  }
  if (stats.development > 0) {
    portfolioCandidates.push({
      id: "development",
      label: "In development",
      value: String(stats.development),
      weight: stats.development * 1.2,
      accent: "warning",
    });
  }
  if (stats.needsAttention > 0) {
    portfolioCandidates.push({
      id: "needs-attention",
      label: "Needs attention",
      value: String(stats.needsAttention),
      weight: stats.needsAttention * 4,
      accent: "danger",
    });
  }
  if (stats.openTasks > 0) {
    portfolioCandidates.push({
      id: "open-tasks",
      label: "Open tasks",
      value: String(stats.openTasks),
      hint: `${stats.doingTasks} in progress`,
      weight: stats.openTasks * 1.5,
      accent: "info",
    });
  }

  if (stats.overdueTasks > 0) {
    portfolioCandidates.push({
      id: "overdue",
      label: "Overdue",
      value: String(stats.overdueTasks),
      weight: stats.overdueTasks * 6,
      accent: "danger",
    });
  }

  if (stats.openIssues > 0) {
    portfolioCandidates.push({
      id: "github-issues",
      label: "GitHub issues",
      value: String(stats.openIssues),
      weight: stats.openIssues * 1.3,
      accent: "warning",
    });
  }

  const hasVelocity =
    velocityStats.commitsLast7Days > 0 ||
    velocityStats.tasksCompletedLast7Days > 0 ||
    velocityStats.boardEditsLast7Days > 0;
  if (hasVelocity || velocityStats.portfolioVelocity > 0) {
    portfolioCandidates.push({
      id: "portfolio-velocity",
      label: "Portfolio velocity",
      value: String(velocityStats.portfolioVelocity),
      hint: `${velocityStats.commitsLast7Days} commits · ${velocityStats.tasksCompletedLast7Days} tasks (7d)`,
      weight: velocityStats.portfolioVelocity,
      accent: "success",
    });
  }

  if (velocityStats.spentHours > 0 || velocityStats.estimatedHours > 0) {
    portfolioCandidates.push({
      id: "portfolio-effort",
      label: "Portfolio effort",
      value: String(velocityStats.portfolioEffortScore),
      hint: `${velocityStats.spentHours.toFixed(1)}h logged`,
      weight: velocityStats.portfolioEffortScore,
      accent: "info",
    });
  }

  if (velocityStats.commitsLast30Days > 0) {
    portfolioCandidates.push({
      id: "repo-activity",
      label: "Repo activity",
      value: String(velocityStats.commitsLast30Days),
      hint: `${velocityStats.commitsLast7Days} commits (7d)`,
      weight: velocityStats.commitsLast30Days,
      accent: "default",
    });
  }

  if (velocityStats.boardEditsLast7Days > 0 || velocityStats.tasksCompletedLast30Days > 0) {
    portfolioCandidates.push({
      id: "board-activity",
      label: "Board activity",
      value: String(velocityStats.boardEditsLast7Days),
      hint: `${velocityStats.tasksCompletedLast30Days} tasks done (30d)`,
      weight: velocityStats.boardEditsLast7Days + velocityStats.tasksCompletedLast30Days,
      accent: "warning",
    });
  }

  const taskTotal = Object.values(taskStats.byStatus).reduce((sum, n) => sum + n, 0);
  if (taskTotal > 0) {
    portfolioCandidates.push({
      id: "board-tasks",
      label: "Board tasks",
      value: String(taskTotal),
      hint: `${taskStats.byStatus.doing} in progress`,
      weight: taskTotal,
      accent: "info",
    });
  }

  const columns: LifecycleColumn[] = LIFECYCLE_PHASE_ORDER.map((phase) => {
    const phaseApps = applications.filter(
      (app) => app.lifecyclePhase === phase && app.status !== "archived"
    );
    const archivedInPhase = applications.filter(
      (app) => app.lifecyclePhase === phase && app.status === "archived"
    ).length;

    const phaseTasks = phaseApps.reduce((sum, app) => sum + (app._count?.tasks ?? 0), 0);
    const phaseVelocity = phaseApps.reduce((sum, app) => {
      const velocity = velocityByApp.get(app.id);
      return sum + (velocity?.velocityScore ?? 0);
    }, 0);

    const tiles: Omit<BoardTile, "size">[] = [];

    if (phaseApps.length > 0) {
      tiles.push({
        id: `${phase}-count`,
        label: "In this phase",
        value: String(phaseApps.length),
        hint: archivedInPhase > 0 ? `${archivedInPhase} archived` : undefined,
        weight: phaseApps.length * 2,
        accent: "default",
      });
    }

    if (phaseTasks > 0) {
      tiles.push({
        id: `${phase}-tasks`,
        label: "Open tasks",
        value: String(phaseTasks),
        weight: phaseTasks * 1.8,
        accent: "info",
      });
    }

    if (phaseVelocity > 0) {
      tiles.push({
        id: `${phase}-velocity`,
        label: "Phase velocity",
        value: String(Math.round(phaseVelocity / Math.max(phaseApps.length, 1))),
        hint: "Avg score",
        weight: phaseVelocity,
        accent: "success",
      });
    }

    for (const app of phaseApps) {
      const velocity = velocityByApp.get(app.id);
      const alert = alertByApp.get(app.id);
      const openTasks = app._count?.tasks ?? 0;
      const weight =
        (velocity?.velocityScore ?? 0) +
        (velocity?.effortScore ?? 0) * 0.6 +
        openTasks * 2 +
        (app.isPinned ? 12 : 0) +
        (alert?.isOverdue ? 20 : alert?.needsReview ? 10 : 0);

      tiles.push({
        id: `app-${app.id}`,
        label: app.name,
        value: velocity ? String(velocity.velocityScore) : openTasks > 0 ? `${openTasks} tasks` : "—",
        hint: alert?.isOverdue
          ? "Phase overdue"
          : velocity
            ? `Effort ${velocity.effortScore}`
            : openTasks > 0
              ? "Open tasks"
              : "View application",
        href:
          openTasks > 0
            ? `/applications/${app.id}/tasks`
            : `/applications/${app.id}`,
        applicationId: app.id,
        weight,
        accent: alert?.isOverdue ? "danger" : app.isPinned ? "warning" : "default",
      });
    }

    return {
      phase,
      label: LIFECYCLE_PHASE_LABELS[phase],
      tiles: withSizes(tiles),
    };
  });

  return {
    portfolioTiles: withSizes(portfolioCandidates),
    columns,
  };
}
