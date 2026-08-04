"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  APPLICATION_FOCUS_GUIDES,
  type ApplicationFocus,
} from "@/lib/dashboard/metric-workflows";
import { cn } from "@/lib/utils";

const VALID_FOCUS = new Set<ApplicationFocus>(["sync", "issues", "lifecycle", "overdue"]);

export function ApplicationFocusGuide({
  initialFocus,
  className,
}: {
  initialFocus?: string | null;
  className?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dismissed, setDismissed] = useState(false);

  const focusParam = searchParams.get("focus") ?? initialFocus ?? null;
  const focus = focusParam && VALID_FOCUS.has(focusParam as ApplicationFocus)
    ? (focusParam as ApplicationFocus)
    : null;

  useEffect(() => {
    setDismissed(false);
  }, [focus]);

  if (!focus || dismissed) return null;

  const guide = APPLICATION_FOCUS_GUIDES[focus];

  function dismiss() {
    setDismissed(true);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("focus");
    const query = params.toString();
    router.replace(query ? `${window.location.pathname}?${query}` : window.location.pathname, {
      scroll: false,
    });
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-emerald-200/60 bg-emerald-50/40 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="flex items-center gap-2 text-sm font-medium">
            <ListChecks className="size-4 shrink-0 text-emerald-600" />
            {guide.title}
          </p>
          <ol className="space-y-2 text-sm">
            {guide.steps.map((step, index) => (
              <li key={step.title} className="flex gap-2.5">
                <span className="text-muted-foreground shrink-0 text-xs font-medium tabular-nums">
                  {index + 1}.
                </span>
                <div className="min-w-0">
                  <p className="font-medium">{step.title}</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={dismiss}
          aria-label="Dismiss guide"
          className="text-muted-foreground shrink-0"
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}
