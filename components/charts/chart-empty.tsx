import { cn } from "@/lib/utils";

/**
 * Placeholder used instead of rendering a chart with no data — an empty axis
 * frame reads as a broken widget and wastes vertical space.
 */
export function ChartEmpty({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "text-muted-foreground/80 flex min-h-[72px] items-center justify-center rounded-md border border-dashed px-4 py-5 text-center text-xs",
        className
      )}
    >
      {message}
    </div>
  );
}
