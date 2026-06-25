"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DependencyEntry, StackScanResult } from "@/types";
import { Layers, Scan } from "lucide-react";
import { useApplicationDetailOptional } from "@/components/applications/application-detail-context";

export function StackPanel({
  applicationId,
  repoUrl,
  initialScan,
}: {
  applicationId: string;
  repoUrl: string | null;
  initialScan?: StackScanResult | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const detail = useApplicationDetailOptional();
  const hideActions = detail?.hidePanelActions ?? false;
  const [error, setError] = useState<string | null>(null);
  const [scan, setScan] = useState<StackScanResult | null>(initialScan ?? null);

  async function runScan() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stack/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Scan failed");
      setScan(data);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed");
    } finally {
      setLoading(false);
    }
  }

  const deps = (scan?.dependencies ?? []) as DependencyEntry[];

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <CardTitle className="text-base">Repository stack</CardTitle>
          <p className="text-muted-foreground text-xs">
            Frameworks, languages, and dependencies from manifest files
          </p>
        </div>
        {!hideActions ? (
          <Button
            onClick={runScan}
            disabled={loading || !repoUrl}
            variant="outline"
            className="shrink-0"
          >
            <Scan className={`mr-1 size-4 ${loading ? "animate-pulse" : ""}`} />
            {loading ? "Scanning..." : "Scan repo"}
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
        {!repoUrl ? (
          <p className="text-muted-foreground text-sm">Add a GitHub repo URL to scan the stack.</p>
        ) : !scan ? (
          <p className="text-muted-foreground text-sm">
            {hideActions
              ? "Stack scan runs automatically in the guided product analysis flow above."
              : <>No scan yet. Requires <code className="rounded bg-muted px-1">GITHUB_TOKEN</code> in env.</>}
          </p>
        ) : (
          <>
            {scan.scannedAt ? (
              <p className="text-muted-foreground text-xs">
                Scanned {new Date(scan.scannedAt).toLocaleString()}
                {scan.lockfilePresent ? " · lockfile present" : " · no lockfile"}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1">
                <Layers className="size-3" />
                {scan.frameworks.length ? scan.frameworks.join(", ") : "No frameworks detected"}
              </Badge>
              {scan.languages.map((lang) => (
                <Badge key={lang} variant="outline">{lang}</Badge>
              ))}
            </div>
            {scan.manifestFiles.length > 0 ? (
              <p className="text-muted-foreground text-xs">
                Manifests: {scan.manifestFiles.join(", ")}
              </p>
            ) : null}
            {deps.length > 0 ? (
              <div className="rounded-lg border">
                <p className="border-b px-3 py-2 text-xs font-medium">Top dependencies</p>
                <ul className="divide-y text-sm">
                  {deps.slice(0, 15).map((d) => (
                    <li key={`${d.name}-${d.dev}`} className="flex justify-between px-3 py-1.5">
                      <span>
                        {d.name}
                        {d.dev ? <span className="text-muted-foreground ml-1 text-xs">(dev)</span> : null}
                      </span>
                      <span className="text-muted-foreground font-mono text-xs">{d.version}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
