"use client";

import Link from "next/link";
import { ApplicationPinButton } from "@/components/applications/application-pin-button";
import type { Application } from "@/types";
import { Pin } from "lucide-react";
import { cn } from "@/lib/utils";

type DropHandlers = {
  isDropTarget?: boolean;
  isDropActive?: boolean;
  isPinning?: boolean;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: () => void;
  onDrop?: (e: React.DragEvent) => void;
};

export function DashboardPinnedApps({
  applications,
  isDropTarget = false,
  isDropActive = false,
  isPinning = false,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  applications: Application[];
} & DropHandlers) {
  const dropZoneClass = cn(
    "rounded-lg border px-4 py-3 transition-colors",
    isDropTarget && isDropActive
      ? "border-amber-400 bg-amber-500/10 ring-2 ring-amber-400/40"
      : isDropTarget
        ? "border-dashed border-amber-400/50 bg-amber-500/5"
        : "border-dashed"
  );

  if (applications.length === 0) {
    return (
      <div
        className={dropZoneClass}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <p className="text-muted-foreground text-sm">
          {isPinning
            ? "Pinning application…"
            : isDropTarget
              ? "Drop here to pin this application to your dashboard."
              : "Drag an application from the board below, or pin from any card or detail page."}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn("flex flex-wrap gap-2", isDropTarget && "rounded-lg p-1")}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {applications.map((app) => (
        <div
          key={app.id}
          className="bg-muted/30 flex min-w-[220px] items-center gap-2 rounded-lg border px-3 py-2"
        >
          <Pin className="size-3 shrink-0 text-amber-500" />
          <Link
            href={`/applications/${app.id}`}
            className="min-w-0 flex-1 truncate text-sm font-medium hover:underline"
          >
            {app.name}
          </Link>
          <ApplicationPinButton
            applicationId={app.id}
            isPinned={app.isPinned}
            size="icon-sm"
            variant="ghost"
          />
        </div>
      ))}
      {isDropTarget ? (
        <div
          className={cn(
            "flex min-w-[180px] flex-1 items-center justify-center rounded-lg border border-dashed px-3 py-2 text-xs",
            isDropActive
              ? "border-amber-400 bg-amber-500/10 text-amber-700 dark:text-amber-300"
              : "text-muted-foreground"
          )}
        >
          {isPinning ? "Pinning…" : "Drop to pin"}
        </div>
      ) : null}
    </div>
  );
}
