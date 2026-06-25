import { cn } from "@/lib/utils";

type Tone = string;

function tinted(color: Tone, bg = 12, border = 25) {
  return {
    background: `color-mix(in oklab, ${color} ${bg}%, transparent)`,
    border: `1px solid color-mix(in oklab, ${color} ${border}%, transparent)`,
  };
}

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  production: { color: "var(--brand-teal)", label: "Production" },
  development: { color: "var(--brand-orange)", label: "Development" },
  archived: { color: "var(--muted-foreground)", label: "Archived" },
};

/** Pill with a colored status dot — Production / Development / Archived. */
function StatusBadge({ status, className }: { status: string; className?: string }) {
  const cfg = STATUS_CONFIG[status] ?? {
    color: "var(--muted-foreground)",
    label: status,
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs capitalize",
        className,
      )}
      style={tinted(cfg.color)}
    >
      <span
        className="size-1.5 rounded-full"
        style={{ backgroundColor: cfg.color }}
      />
      <span style={{ color: cfg.color }}>{cfg.label}</span>
    </span>
  );
}

const RISK_CONFIG: Record<string, { color: string; label: string }> = {
  low: { color: "var(--brand-teal)", label: "Low Risk" },
  medium: { color: "var(--brand-orange)", label: "Med Risk" },
  high: { color: "var(--destructive)", label: "High Risk" },
};

/** Compact monospace risk label — Low / Med / High. */
function RiskBadge({ risk, className }: { risk: string; className?: string }) {
  const cfg = RISK_CONFIG[risk] ?? RISK_CONFIG.medium;
  return (
    <span
      className={cn("font-mono text-xs", className)}
      style={{ color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

const SEVERITY_COLOR: Record<string, string> = {
  high: "var(--destructive)",
  medium: "var(--brand-orange)",
  low: "var(--muted-foreground)",
};

/** Tiny uppercase severity chip for security issue rows. */
function SeverityPill({ severity, className }: { severity: string; className?: string }) {
  const color = SEVERITY_COLOR[severity] ?? SEVERITY_COLOR.low;
  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 font-mono text-[10px] capitalize",
        className,
      )}
      style={tinted(color, 14, 25)}
    >
      <span style={{ color }}>{severity}</span>
    </span>
  );
}

/** Bordered monospace chip for a stack technology. */
function StackChip({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "rounded-md border border-border bg-secondary px-2 py-0.5 font-mono text-xs text-muted-foreground",
        className,
      )}
    >
      {label}
    </span>
  );
}

export { StatusBadge, RiskBadge, SeverityPill, StackChip };
