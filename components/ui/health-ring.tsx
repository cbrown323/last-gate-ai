import { cn } from "@/lib/utils";

/** Returns a theme-aware CSS variable for a 0–100 health score. */
export function healthColor(score: number): string {
  if (score >= 70) return "var(--brand-teal)";
  if (score >= 45) return "var(--brand-orange)";
  return "var(--destructive)";
}

/**
 * SVG donut gauge with the score centered inside — the signature "health ring"
 * from the Figma portfolio cards and detail panels.
 */
function HealthRing({
  score,
  size = 44,
  className,
}: {
  score: number;
  size?: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, score));
  const r = size * 0.36;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - clamped / 100);
  const color = healthColor(clamped);
  const cx = size / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn("shrink-0", className)}
      role="img"
      aria-label={`Health score ${Math.round(clamped)} of 100`}
    >
      <circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        strokeWidth={2.5}
        className="text-muted-foreground/25"
        stroke="currentColor"
      />
      <circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        strokeWidth={2.5}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cx})`}
        style={{
          stroke: color,
          transition: "stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)",
        }}
      />
      <text
        x={cx}
        y={cx + size * 0.08}
        textAnchor="middle"
        fontSize={size * 0.22}
        fontWeight={500}
        className="font-mono"
        style={{ fill: color }}
      >
        {Math.round(clamped)}
      </text>
    </svg>
  );
}

export { HealthRing };
