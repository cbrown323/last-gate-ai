"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

export function SettingsExpandableDetails({
  label = "Setup instructions",
  header,
  children,
  defaultOpen = false,
}: {
  label?: string;
  header?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const trigger = (
    <Button
      type="button"
      variant="ghost"
      size={header ? "icon" : "sm"}
      onClick={() => setOpen((prev) => !prev)}
      className={cn(
        "shrink-0",
        header
          ? "text-muted-foreground hover:text-foreground size-8"
          : "text-muted-foreground hover:text-foreground -ml-2 h-8 gap-2 px-2"
      )}
      aria-expanded={open}
      aria-label={header ? label : undefined}
    >
      <ChevronRight
        className={cn(
          "size-4 shrink-0 transition-transform duration-200",
          open ? "rotate-90 scale-110" : "rotate-0 scale-100"
        )}
      />
      {!header ? <span className="text-xs font-medium">{label}</span> : null}
    </Button>
  );

  return (
    <div className={cn(!header && "space-y-3", header && open && "space-y-3")}>
      {header ? (
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">{header}</div>
          {trigger}
        </div>
      ) : (
        trigger
      )}

      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          !open && "pointer-events-none"
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-3 pb-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
