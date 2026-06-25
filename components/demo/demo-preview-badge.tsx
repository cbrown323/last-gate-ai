import { Badge } from "@/components/ui/badge";
import { FlaskConical } from "lucide-react";

export function DemoPreviewBadge() {
  return (
    <Badge variant="outline" className="gap-1 border-emerald-500/40 text-emerald-700 dark:text-emerald-400">
      <FlaskConical className="size-3" />
      Demo preview data
    </Badge>
  );
}
