"use client";

import { useState } from "react";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import { Info } from "lucide-react";
import { CardTitle } from "@/components/ui/card";
import { MetricIcon, type MetricIconName } from "@/components/dashboard/metric-icon";
import { getMetricDefinition, type MetricId } from "@/lib/dashboard/metric-definitions";
import { cn } from "@/lib/utils";

export const METRIC_DEFINITION_PANEL_CLASS =
  "w-72 max-w-[calc(100vw-2rem)] flex-col items-start gap-1.5 rounded-md bg-foreground px-3 py-2.5 text-left text-background shadow-md";

/** Grace period after the pointer leaves — matches common tooltip/popover timing. */
const METRIC_DEFINITION_CLOSE_DELAY_MS = 300;

/** Hover delay high enough that only an intentional click opens the panel. */
const METRIC_DEFINITION_OPEN_DELAY_MS = 60_000;

export function MetricDefinitionBody({ id }: { id: MetricId }) {
  const definition = getMetricDefinition(id);

  return (
    <>
      <p className="text-[13px] leading-tight font-semibold">{definition.label}</p>
      <p className="text-background/85 text-xs leading-relaxed">{definition.what}</p>
      <p className="text-background/60 text-[11px] leading-relaxed">
        <span className="tracking-wide uppercase">Define</span> · {definition.how}
      </p>
      {definition.action ? (
        <p className="border-background/20 text-background/75 w-full border-t pt-1.5 text-[11px] leading-relaxed">
          {definition.action}
        </p>
      ) : null}
    </>
  );
}

/** Click the info icon to open the metric definition — closes after the pointer leaves. */
export function MetricInfo({
  id,
  className,
  align = "start",
}: {
  id: MetricId;
  className?: string;
  /** Align relative to the trigger; use `end` when the icon sits on the right edge. */
  align?: "start" | "end";
}) {
  const [open, setOpen] = useState(false);
  const definition = getMetricDefinition(id);

  return (
    <TooltipPrimitive.Root open={open} onOpenChange={setOpen}>
      <TooltipPrimitive.Trigger
        delay={METRIC_DEFINITION_OPEN_DELAY_MS}
        closeDelay={METRIC_DEFINITION_CLOSE_DELAY_MS}
        closeOnClick={false}
        render={
          <button
            type="button"
            aria-expanded={open}
            aria-label={`Definition for ${definition.label}`}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setOpen((value) => !value);
            }}
            className={cn(
              "text-muted-foreground/50 hover:text-muted-foreground focus-visible:ring-ring/50 -m-1 rounded p-1 transition-colors focus-visible:ring-2 focus-visible:outline-none",
              className
            )}
          >
            <Info className="size-3.5" />
          </button>
        }
      />
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Positioner
          side="bottom"
          align={align}
          sideOffset={6}
          collisionPadding={16}
          className="isolate z-50"
        >
          <TooltipPrimitive.Popup
            role="dialog"
            aria-label={definition.label}
            className={cn("flex", METRIC_DEFINITION_PANEL_CLASS)}
          >
            <MetricDefinitionBody id={id} />
          </TooltipPrimitive.Popup>
        </TooltipPrimitive.Positioner>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

/** Card title with a click-to-open definition on the info icon. */
export function MetricCardTitle({
  id,
  title,
  icon,
  iconClassName,
}: {
  id: MetricId;
  title?: string;
  icon?: MetricIconName;
  iconClassName?: string;
}) {
  const definition = getMetricDefinition(id);

  return (
    <CardTitle className="flex items-center gap-2 text-base">
      {icon ? <MetricIcon name={icon} className={cn("size-4 shrink-0", iconClassName)} /> : null}
      <span className="min-w-0 truncate">{title ?? definition.label}</span>
      <MetricInfo id={id} />
    </CardTitle>
  );
}

export function MetricSectionHeading({
  title,
  description,
  count,
}: {
  title: string;
  description: string;
  count?: number;
}) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <h3 className="text-muted-foreground text-[11px] font-semibold tracking-widest uppercase">
        {title}
      </h3>
      {typeof count === "number" ? (
        <span className="text-muted-foreground/60 text-[11px] tabular-nums">{count}</span>
      ) : null}
      <p className="text-muted-foreground/70 basis-full text-xs">{description}</p>
    </div>
  );
}
