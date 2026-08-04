import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MetricCardTitle } from "@/components/dashboard/metric-info";
import { MetricWorkflowRow } from "@/components/dashboard/metric-workflow-trigger";
import { buildAttentionWorkflow } from "@/lib/dashboard/metric-workflows";
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
            <MetricWorkflowRow
              key={item.id}
              workflow={buildAttentionWorkflow(item)}
              title={item.name}
              subtitle={item.reason}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
