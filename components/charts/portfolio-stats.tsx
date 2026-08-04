import type { MetricIconName } from "@/components/dashboard/metric-icon";
import { MetricTile, MetricTileGrid, type MetricTone } from "@/components/dashboard/metric-tile";
import type { MetricId } from "@/lib/dashboard/metric-definitions";
import type { PortfolioStats } from "@/types";

const statConfig: {
  key: "total" | "production" | "development" | "needsAttention";
  metric: MetricId;
  icon: MetricIconName;
  tone: MetricTone;
}[] = [
  { key: "total", metric: "applications", icon: "boxes", tone: "neutral" },
  { key: "production", metric: "production", icon: "rocket", tone: "info" },
  { key: "development", metric: "development", icon: "hammer", tone: "positive" },
  { key: "needsAttention", metric: "needsAttention", icon: "alert", tone: "warning" },
];

export function PortfolioStats({
  stats,
  hideZero = false,
}: {
  stats: PortfolioStats;
  hideZero?: boolean;
}) {
  const visibleStats = hideZero ? statConfig.filter(({ key }) => stats[key] > 0) : statConfig;

  if (visibleStats.length === 0) {
    return null;
  }

  return (
    <MetricTileGrid>
      {visibleStats.map(({ key, metric, icon, tone }) => (
        <MetricTile
          key={key}
          id={metric}
          icon={icon}
          tone={tone}
          value={stats[key]}
          emphasis={key === "needsAttention"}
          href={key === "needsAttention" ? "/applications" : undefined}
          hint={
            key === "total" && stats.archived > 0
              ? `${stats.archived} archived`
              : key === "needsAttention" && stats.needsAttention > 0
                ? "Review these applications"
                : undefined
          }
        />
      ))}
    </MetricTileGrid>
  );
}
