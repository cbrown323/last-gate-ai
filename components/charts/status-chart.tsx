"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChartEmpty } from "@/components/charts/chart-empty";
import { MetricCardTitle } from "@/components/dashboard/metric-info";
import type { PortfolioStats } from "@/types";

const chartConfig = {
  count: { label: "Applications", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function StatusChart({ stats }: { stats: PortfolioStats }) {
  const data = [
    { status: "Production", count: stats.production },
    { status: "Development", count: stats.development },
    { status: "Archived", count: stats.archived },
  ];

  const total = data.reduce((sum, entry) => sum + entry.count, 0);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <MetricCardTitle id="statusDistribution" />
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <ChartEmpty message="Register an application to see how your portfolio is distributed." />
        ) : (
          <ChartContainer config={chartConfig} className="h-[220px] w-full">
            <BarChart data={data} margin={{ left: 0, right: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="status" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
