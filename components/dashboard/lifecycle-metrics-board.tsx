"use client";

import Link from "next/link";
import { GripVertical } from "lucide-react";
import type { BoardTile, LifecycleBoardData, LifecycleColumn, TileAccent, TileSize } from "@/lib/dashboard/lifecycle-board";
import { PIN_DRAG_MIME } from "@/lib/applications/pin";
import { cn } from "@/lib/utils";

const SIZE_CLASS: Record<TileSize, string> = {
  xs: "min-h-[3rem] basis-[calc(50%-0.25rem)]",
  sm: "min-h-[3.5rem] basis-[calc(50%-0.25rem)]",
  md: "min-h-[4rem] basis-full",
  lg: "min-h-[5rem] basis-full",
  xl: "min-h-[6rem] basis-full",
};

const ACCENT_CLASS: Record<TileAccent, string> = {
  default: "border-border bg-card",
  success: "border-emerald-500/30 bg-emerald-500/5",
  info: "border-sky-500/30 bg-sky-500/5",
  warning: "border-amber-500/30 bg-amber-500/5",
  danger: "border-red-500/40 bg-red-500/8",
};

const LABEL_SIZE_COLUMN: Record<TileSize, string> = {
  xs: "text-xs",
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-lg",
};

const VALUE_SIZE_COLUMN: Record<TileSize, string> = {
  xs: "text-sm",
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
  xl: "text-2xl",
};

const VALUE_CLASS: Record<TileAccent, string> = {
  default: "text-foreground",
  success: "text-emerald-600",
  info: "text-sky-600",
  warning: "text-amber-600",
  danger: "text-red-600",
};

const TILE_SHELL =
  "metric-tile-edge grow overflow-hidden rounded-lg border px-2.5 py-2 shadow-sm";

function hasColumnContent(column: LifecycleColumn) {
  return column.tiles.length > 0;
}

export function LifecycleMetricsBoard({
  data,
  pinnedAppIds,
  onAppDragStart,
  onAppDragEnd,
}: {
  data: LifecycleBoardData;
  pinnedAppIds?: Set<string>;
  onAppDragStart?: (applicationId: string) => void;
  onAppDragEnd?: () => void;
}) {
  const activeColumns = data.columns.filter(hasColumnContent);

  return (
    <div className="space-y-5">
      {data.portfolioTiles.length > 0 ? (
        <section>
          <h2 className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
            Portfolio pulse
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {data.portfolioTiles.map((tile) => (
              <PulseChip key={tile.id} tile={tile} />
            ))}
          </div>
        </section>
      ) : null}

      {activeColumns.length > 0 ? (
        <section className="min-w-0">
          <h2 className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
            Lifecycle board
          </h2>
          <div
            className={cn(
              "grid gap-3",
              activeColumns.length === 1
                ? "grid-cols-1"
                : activeColumns.length === 2
                  ? "sm:grid-cols-2"
                  : "sm:grid-cols-2 xl:grid-cols-3"
            )}
          >
            {activeColumns.map((column) => (
              <LifecycleColumnView
                key={column.phase}
                column={column}
                pinnedAppIds={pinnedAppIds}
                onAppDragStart={onAppDragStart}
                onAppDragEnd={onAppDragEnd}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function PulseChip({ tile }: { tile: BoardTile }) {
  const content = (
    <span className="relative z-[1] flex items-center gap-1.5">
      <span className="text-muted-foreground text-[11px] leading-none font-medium">
        {tile.label}
      </span>
      <span className={cn("text-sm leading-none font-bold tabular-nums", VALUE_CLASS[tile.accent])}>
        {tile.value}
      </span>
    </span>
  );

  const className = cn(
    "metric-tile-edge inline-flex items-center overflow-hidden rounded-md border px-2 py-1 shadow-sm",
    ACCENT_CLASS[tile.accent]
  );

  if (tile.href) {
    return (
      <Link href={tile.href} className={className} data-accent={tile.accent} title={tile.hint}>
        {content}
      </Link>
    );
  }

  return (
    <div className={className} data-accent={tile.accent} title={tile.hint}>
      {content}
    </div>
  );
}

function LifecycleColumnView({
  column,
  pinnedAppIds,
  onAppDragStart,
  onAppDragEnd,
}: {
  column: LifecycleColumn;
  pinnedAppIds?: Set<string>;
  onAppDragStart?: (applicationId: string) => void;
  onAppDragEnd?: () => void;
}) {
  const appCount = column.tiles.filter((tile) => tile.applicationId).length;

  return (
    <section className="flex min-w-0 flex-col">
      <header className="mb-2 flex items-baseline justify-between gap-2 px-1">
        <h3 className="text-sm font-semibold">{column.label}</h3>
        <span className="text-muted-foreground text-xs">{appCount}</span>
      </header>
      <div className="bg-muted/35 flex flex-col rounded-lg p-2">
        <div className="flex flex-wrap content-start gap-1.5">
          {column.tiles.map((tile) => (
            <MetricTile
              key={tile.id}
              tile={tile}
              isPinned={tile.applicationId ? pinnedAppIds?.has(tile.applicationId) : false}
              onAppDragStart={onAppDragStart}
              onAppDragEnd={onAppDragEnd}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function MetricTile({
  tile,
  isPinned,
  onAppDragStart,
  onAppDragEnd,
}: {
  tile: BoardTile;
  isPinned?: boolean;
  onAppDragStart?: (applicationId: string) => void;
  onAppDragEnd?: () => void;
}) {
  const isDraggable = Boolean(tile.applicationId) && !isPinned;

  const body = (
    <div className="relative z-[1] flex h-full flex-col justify-center">
      <p
        className={cn(
          "text-foreground line-clamp-2 leading-tight font-semibold",
          LABEL_SIZE_COLUMN[tile.size]
        )}
      >
        {tile.label}
      </p>
      <p
        className={cn(
          "mt-0.5 leading-none font-bold tracking-tight tabular-nums",
          VALUE_SIZE_COLUMN[tile.size],
          VALUE_CLASS[tile.accent]
        )}
      >
        {tile.value}
      </p>
      {tile.hint ? (
        <p className="text-muted-foreground mt-0.5 line-clamp-1 text-[9px] leading-snug">{tile.hint}</p>
      ) : null}
    </div>
  );

  const className = cn(
    TILE_SHELL,
    SIZE_CLASS[tile.size],
    ACCENT_CLASS[tile.accent],
    isDraggable && "relative cursor-grab active:cursor-grabbing",
    isPinned && "ring-1 ring-amber-400/50"
  );

  function handleDragStart(e: React.DragEvent) {
    if (!tile.applicationId) return;
    e.dataTransfer.setData(PIN_DRAG_MIME, tile.applicationId);
    e.dataTransfer.setData("text/plain", tile.applicationId);
    e.dataTransfer.effectAllowed = "copyMove";
    onAppDragStart?.(tile.applicationId);
  }

  if (isDraggable) {
    return (
      <div
        className={className}
        data-accent={tile.accent}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={onAppDragEnd}
        title="Drag up to pin on your dashboard"
      >
        <GripVertical
          className="text-muted-foreground/50 pointer-events-none absolute top-1 right-1 size-3"
          aria-hidden
        />
        {tile.href ? (
          <Link href={tile.href} draggable={false} className="block">
            {body}
          </Link>
        ) : (
          body
        )}
      </div>
    );
  }

  if (tile.href) {
    return (
      <Link href={tile.href} className={className} data-accent={tile.accent}>
        {body}
      </Link>
    );
  }

  return (
    <div className={className} data-accent={tile.accent}>
      {body}
    </div>
  );
}
