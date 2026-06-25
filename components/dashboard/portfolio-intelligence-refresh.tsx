"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

export function PortfolioIntelligenceRefresh({
  disabled,
}: {
  disabled?: boolean;
}) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refreshAll() {
    setRunning(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/intelligence/portfolio-refresh", {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Refresh failed");
      }

      const refreshed = typeof data.refreshed === "number" ? data.refreshed : 0;
      const failed = typeof data.failed === "number" ? data.failed : 0;
      setMessage(`Refreshed ${refreshed} app${refreshed === 1 ? "" : "s"}${failed > 0 ? ` (${failed} failed)` : ""}.`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Refresh failed");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={refreshAll}
        disabled={disabled || running}
      >
        {running ? (
          <Loader2 className="mr-1 size-4 animate-spin" />
        ) : (
          <RefreshCw className="mr-1 size-4" />
        )}
        Refresh intelligence
      </Button>
      {message ? (
        <p className="text-muted-foreground text-xs">{message}</p>
      ) : null}
      {error ? (
        <p className="text-destructive text-xs">{error}</p>
      ) : null}
    </div>
  );
}
