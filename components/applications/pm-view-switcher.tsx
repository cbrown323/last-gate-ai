import Link from "next/link";
import { Kanban, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";

export function PmViewSwitcher({
  applicationId,
  view,
}: {
  applicationId: string;
  view?: "tasks" | "roadmap";
}) {
  return (
    <div className="inline-flex rounded-lg border bg-muted/40 p-0.5">
      <Link
        href={`/applications/${applicationId}/tasks`}
        prefetch
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "h-8 gap-1.5 rounded-md px-3",
          view === "tasks" && "bg-background shadow-sm"
        )}
      >
        <Kanban className="size-4" />
        Board
      </Link>
      <Link
        href={`/applications/${applicationId}/roadmap`}
        prefetch
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "h-8 gap-1.5 rounded-md px-3",
          view === "roadmap" && "bg-background shadow-sm"
        )}
      >
        <Map className="size-4" />
        Roadmap
      </Link>
    </div>
  );
}
