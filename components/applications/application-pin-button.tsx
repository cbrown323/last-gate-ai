"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Pin, PinOff } from "lucide-react";
import { setApplicationPinned } from "@/lib/applications/pin";
import { cn } from "@/lib/utils";

export function ApplicationPinButton({
  applicationId,
  isPinned: initialPinned,
  size = "sm",
  variant = "outline",
  className,
  showLabel = false,
}: {
  applicationId: string;
  isPinned: boolean;
  size?: "sm" | "icon" | "icon-sm";
  variant?: "outline" | "ghost";
  className?: string;
  showLabel?: boolean;
}) {
  const router = useRouter();
  const [pinned, setPinned] = useState(initialPinned);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPinned(initialPinned);
  }, [initialPinned]);

  async function toggle(e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();
    setLoading(true);
    try {
      await setApplicationPinned(applicationId, !pinned);
      setPinned(!pinned);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const label = pinned ? "Unpin from dashboard" : "Pin to dashboard";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant={pinned ? "secondary" : variant}
              size={size}
              className={cn(pinned && "text-amber-600", className)}
              onClick={toggle}
              disabled={loading}
              aria-label={label}
            >
              {pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
              {showLabel ? <span className="ml-1">{pinned ? "Pinned" : "Pin"}</span> : null}
            </Button>
          }
        />
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
