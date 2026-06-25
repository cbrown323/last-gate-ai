import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PortfolioStats } from "@/types";
import { Boxes, Rocket, Archive, AlertTriangle } from "lucide-react";

const statConfig = [
  { key: "total" as const, label: "Applications", icon: Boxes, color: "text-emerald-500" },
  { key: "production" as const, label: "Production", icon: Rocket, color: "text-blue-500" },
  { key: "development" as const, label: "In Development", icon: Boxes, color: "text-amber-500" },
  { key: "needsAttention" as const, label: "Needs Attention", icon: AlertTriangle, color: "text-red-500" },
];

export function PortfolioStats({
  stats,
  hideZero = false,
}: {
  stats: PortfolioStats;
  hideZero?: boolean;
}) {
  const visibleStats = hideZero
    ? statConfig.filter(({ key }) => stats[key] > 0)
    : statConfig;

  if (visibleStats.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {visibleStats.map(({ key, label, icon: Icon, color }) => (
        <Card key={key} className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">{label}</CardTitle>
            <Icon className={`size-4 ${color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats[key]}</div>
            {key === "total" && stats.archived > 0 ? (
              <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                <Archive className="size-3" /> {stats.archived} archived
              </p>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
