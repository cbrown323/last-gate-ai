import { MetricTile, MetricTileGrid } from "@/components/dashboard/metric-tile";
import type { PortfolioStats } from "@/types";

export function WorkInFlightTiles({ stats }: { stats: PortfolioStats }) {
  return (
    <MetricTileGrid>
      <MetricTile
        id="openTasks"
        icon="tasks"
        value={stats.openTasks}
        hint={`${stats.doingTasks} in progress`}
      />
      <MetricTile
        id="overdueTasks"
        icon="clock"
        value={stats.overdueTasks}
        tone={stats.overdueTasks > 0 ? "danger" : "neutral"}
        emphasis={stats.overdueTasks > 0}
        hint={stats.overdueTasks > 0 ? "Past their due date" : "Nothing past due"}
      />
      <MetricTile id="openIssues" icon="issue" value={stats.openIssues} />
    </MetricTileGrid>
  );
}
