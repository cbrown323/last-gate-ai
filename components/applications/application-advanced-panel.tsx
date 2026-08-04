"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

export function ApplicationAdvancedPanel({
  completedSteps,
  totalSteps,
  analysisComplete,
  children,
}: {
  completedSteps: number;
  totalSteps: number;
  analysisComplete: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="border-dashed shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="hover:bg-muted/40 flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left transition-colors"
        aria-expanded={open}
      >
        <div className="flex min-w-0 items-center gap-2">
          <SlidersHorizontal className="size-4 shrink-0 text-emerald-600" />
          <div className="min-w-0">
            <p className="text-sm font-medium">Advanced</p>
            <p className="text-muted-foreground truncate text-xs">
              Lifecycle phase and workflow timing controls
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge variant={analysisComplete ? "secondary" : "outline"} className="text-[10px]">
            {completedSteps}/{totalSteps} analysis
          </Badge>
          <ChevronDown
            className={cn(
              "text-muted-foreground size-4 transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </div>
      </button>
      {open ? <CardContent className="space-y-4 border-t pt-4">{children}</CardContent> : null}
      {!open && !analysisComplete ? (
        <p className="text-muted-foreground border-t px-4 py-2 text-xs">
          Run <span className="font-medium text-foreground">full analysis</span> above, then browse
          results under the Intelligence tab.
        </p>
      ) : null}
    </Card>
  );
}
