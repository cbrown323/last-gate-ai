const LABEL_ABBREV: Record<string, string> = {
  Applications: "apps",
  Production: "prod",
  "In Development": "dev",
  "Needs Attention": "attn",
  "Portfolio velocity": "vel",
  "Portfolio effort": "eff",
  "Repo activity": "repo",
  "Board activity": "board",
  "Open tasks": "tasks",
  Overdue: "due",
  "GitHub issues": "gh",
  "Board tasks": "tasks",
  "Tasks by status / priority": "charts",
  "Recent board activity": "act",
  "Effort signals": "effort",
  "Velocity & effort by project": "vproj",
  "Applications needing attention": "attn",
  "Lifecycle phase timing alerts": "life",
  "Status distribution": "stat",
};

function abbreviate(label: string): string {
  return LABEL_ABBREV[label] ?? label.split(/\s+/)[0]?.slice(0, 4).toLowerCase() ?? label;
}

export function ZeroMetricPills({ metrics }: { metrics: { id: string; label: string; value: string }[] }) {
  if (metrics.length === 0) return null;

  const fullTitle = metrics.map((metric) => `${metric.label}: ${metric.value}`).join(" · ");

  return (
    <div className="h-1 overflow-hidden" title={fullTitle}>
      <p className="text-muted-foreground/50 origin-top-left scale-[0.22] font-mono text-[10px] leading-none tracking-tight whitespace-nowrap uppercase">
        {metrics.map((metric, index) => (
          <span key={metric.id}>
            {index > 0 ? <span className="mx-0.5 opacity-30">·</span> : null}
            <span>
              {abbreviate(metric.label)}
              <span className="opacity-60">{metric.value}</span>
            </span>
          </span>
        ))}
      </p>
    </div>
  );
}

export function ZeroMetricCount({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <span
      className="text-muted-foreground/50 inline-block origin-center scale-[0.22] font-mono text-[10px] leading-none tracking-tight uppercase"
      title={`${count} metrics at zero`}
    >
      {count}z
    </span>
  );
}
