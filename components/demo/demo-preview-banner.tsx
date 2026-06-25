"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FlaskConical, Loader2 } from "lucide-react";

export function DemoPreviewBanner({
  loaded,
  applicationId,
}: {
  loaded: boolean;
  applicationId: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadPreview() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/demo/preview", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load preview");
      router.refresh();
      if (data.applicationId) {
        router.push(`/applications/${data.applicationId}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FlaskConical className="size-4 text-emerald-600" />
            <p className="font-medium">Functionality preview (dry run)</p>
            <Badge variant="secondary" className="text-xs">
              No AI or GitHub keys required
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            {loaded
              ? "Demo data is loaded — explore Stack, Architecture, Security, Headroom, and Deployments tabs."
              : "Load pre-filled sample data to preview every feature without connecting integrations."}
          </p>
          {error ? <p className="text-destructive text-sm">{error}</p> : null}
        </div>
        <div className="flex shrink-0 gap-2">
          {loaded && applicationId ? (
            <Link
              href={`/applications/${applicationId}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Open demo app
            </Link>
          ) : null}
          <Button
            onClick={loadPreview}
            disabled={loading}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-1 size-4 animate-spin" />
                Loading…
              </>
            ) : loaded ? (
              "Reload preview data"
            ) : (
              "Load demo preview"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
