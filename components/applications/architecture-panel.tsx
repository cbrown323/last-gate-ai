"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ArchitectureMapResult } from "@/types";
import { GitBranch } from "lucide-react";
import { useApplicationDetailOptional } from "@/components/applications/application-detail-context";

export function ArchitecturePanel({
  applicationId,
  repoUrl,
  initialMap,
}: {
  applicationId: string;
  repoUrl: string | null;
  initialMap?: ArchitectureMapResult | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const detail = useApplicationDetailOptional();
  const hideActions = detail?.hidePanelActions ?? false;
  const [error, setError] = useState<string | null>(null);
  const [arch, setArch] = useState<ArchitectureMapResult | null>(initialMap ?? null);

  async function runMap() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/architecture/map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Mapping failed");
      setArch(data);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Mapping failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <CardTitle className="text-base">Architecture map</CardTitle>
          <p className="text-muted-foreground text-xs">
            Layers and directory roles inferred from repo structure
          </p>
        </div>
        {!hideActions ? (
          <Button
            onClick={runMap}
            disabled={loading || !repoUrl}
            variant="outline"
            className="shrink-0"
          >
            <GitBranch className={`mr-1 size-4 ${loading ? "animate-pulse" : ""}`} />
            {loading ? "Mapping..." : "Map architecture"}
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
        {!repoUrl ? (
          <p className="text-muted-foreground text-sm">Add a GitHub repo URL to map architecture.</p>
        ) : !arch ? (
          <p className="text-muted-foreground text-sm">
            {hideActions
              ? "Architecture mapping runs automatically in the guided product analysis flow above."
              : "Run a stack scan first for richer framework context, then map architecture."}
          </p>
        ) : (
          <>
            {arch.mappedAt ? (
              <p className="text-muted-foreground text-xs">
                Mapped {new Date(arch.mappedAt).toLocaleString()}
              </p>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              {arch.layers.map((layer) => (
                <div key={layer.name} className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide">{layer.name}</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {layer.components.map((c) => (
                      <li key={c} className="text-muted-foreground">· {c}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            {arch.directories.length > 0 ? (
              <div className="rounded-lg border">
                <p className="border-b px-3 py-2 text-xs font-medium">Key directories</p>
                <ul className="divide-y text-sm">
                  {arch.directories.slice(0, 12).map((d) => (
                    <li key={d.path} className="flex justify-between px-3 py-1.5">
                      <span className="font-mono text-xs">{d.path}/</span>
                      <span className="text-muted-foreground text-xs">{d.role}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {arch.diagram ? (
              <div className="rounded-lg border bg-muted/20 p-3">
                <p className="mb-2 text-xs font-medium">Structure diagram (Mermaid)</p>
                <pre className="overflow-x-auto text-xs whitespace-pre-wrap">{arch.diagram}</pre>
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
