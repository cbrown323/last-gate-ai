import { healthColor } from "@/components/ui/health-ring";

/**
 * Labeled progress bar with a soft inset track and glowing fill, used in the
 * "Project Health" panel. Color shifts teal → orange → red with the value.
 */
function HealthBar({ label, value }: { label: string; value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const color = healthColor(clamped);

  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 text-xs text-muted-foreground">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.25)]">
        <div
          className="h-full rounded-full"
          style={{
            width: `${clamped}%`,
            backgroundColor: color,
            boxShadow: `0 0 6px color-mix(in oklab, ${color} 38%, transparent)`,
            transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </div>
      <span
        className="w-6 shrink-0 text-right font-mono text-xs"
        style={{ color }}
      >
        {Math.round(clamped)}
      </span>
    </div>
  );
}

export { HealthBar };
