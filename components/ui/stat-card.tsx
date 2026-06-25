import type { LucideIcon } from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

/**
 * Portfolio KPI tile: small label + icon header, large monospace value, and a
 * caption — mirrors the Figma StatCard used across the dashboard headers.
 */
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  alert = false,
  className,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: LucideIcon;
  alert?: boolean;
  className?: string;
}) {
  return (
    <GlassCard className={cn("p-4", className)}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        {Icon ? (
          <Icon
            className="size-3.5"
            style={{
              color: alert ? "var(--destructive)" : "var(--muted-foreground)",
            }}
          />
        ) : null}
      </div>
      <p className="font-mono text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      {sub ? <p className="mt-1 text-[11px] text-muted-foreground">{sub}</p> : null}
    </GlassCard>
  );
}

export { StatCard };
