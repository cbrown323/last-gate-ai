import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Lightweight frosted-glass surface matched to the Figma "ORBIT" GlassCard:
 * translucent fill, embossed lighting, colored directional glow, and a
 * specular top line (all supplied by the `.glass-surface` layer in globals.css).
 *
 * Unlike the shadcn `Card`, this primitive carries no internal padding/spacing
 * system, so callers control layout directly — ideal for the dense intelligence
 * panels and stat tiles.
 */
function GlassCard({
  className,
  hover = false,
  ...props
}: React.ComponentProps<"div"> & { hover?: boolean }) {
  return (
    <div
      data-slot="glass-card"
      className={cn(
        "glass-surface relative overflow-hidden rounded-xl",
        hover &&
          "transition-transform duration-300 will-change-transform hover:-translate-y-0.5",
        props.onClick && "cursor-pointer",
        className,
      )}
      {...props}
    />
  );
}

export { GlassCard };
