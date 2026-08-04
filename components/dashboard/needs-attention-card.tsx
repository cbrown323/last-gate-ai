import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MetricCardTitle } from "@/components/dashboard/metric-info";
import type { AttentionItem } from "@/lib/dashboard/needs-attention";

export function NeedsAttentionCard({ items }: { items: AttentionItem[] }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <MetricCardTitle
          id="needsAttentionApps"
          title="Needs attention"
          icon="alert"
          iconClassName="text-amber-500"
        />
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">All applications look healthy.</p>
        ) : (
          items.slice(0, 5).map((item) => (
            <Link
              key={item.id}
              href={`/applications/${item.id}`}
              className="hover:bg-muted/50 hover:border-foreground/20 flex items-center justify-between gap-3 rounded-md border p-2.5 text-sm transition-colors"
            >
              <span className="truncate font-medium">{item.name}</span>
              <span className="text-muted-foreground shrink-0 text-xs">{item.reason}</span>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
