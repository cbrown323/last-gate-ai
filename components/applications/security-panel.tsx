"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SecurityFinding, SecurityReportResult } from "@/types";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApplicationDetailOptional } from "@/components/applications/application-detail-context";

const SEVERITY_STYLES: Record<string, string> = {
  high: "bg-red-500/15 text-red-700 dark:text-red-400",
  medium: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  low: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  info: "bg-muted text-muted-foreground",
};

export function SecurityPanel({
  applicationId,
  latestReport,
}: {
  applicationId: string;
  latestReport?: SecurityReportResult | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const detail = useApplicationDetailOptional();
  const hideActions = detail?.hidePanelActions ?? false;
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<SecurityReportResult | null>(latestReport ?? null);

  async function runScan() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/agents/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Security scan failed");
      setReport(data);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed");
    } finally {
      setLoading(false);
    }
  }

  const findings = (report?.findings ?? []) as SecurityFinding[];

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <CardTitle className="text-base">Security agent</CardTitle>
          {report ? (
            <Badge variant={report.score >= 70 ? "default" : "destructive"} className="text-xs">
              Score {report.score}/100 · {report.mode}
            </Badge>
          ) : null}
        </div>
        {!hideActions ? (
          <Button
            onClick={runScan}
            disabled={loading}
            className="shrink-0 bg-emerald-600 hover:bg-emerald-700"
          >
            <Shield className="mr-1 size-4" />
            {loading ? "Analyzing..." : "Run scan"}
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
        {!report ? (
          <p className="text-muted-foreground text-sm">
            {hideActions
              ? "Security analysis runs automatically in the guided product analysis flow above."
              : "Analyze dependencies, lockfiles, and repo patterns. Run stack scan first for best results."}
          </p>
        ) : (
          <>
            {report.generatedAt ? (
              <p className="text-muted-foreground text-xs">
                Generated {new Date(report.generatedAt).toLocaleString()}
              </p>
            ) : null}
            {findings.length > 0 ? (
              <ul className="space-y-2">
                {findings.map((f, i) => (
                  <li key={i} className="rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-xs font-medium uppercase",
                          SEVERITY_STYLES[f.severity] ?? SEVERITY_STYLES.info
                        )}
                      >
                        {f.severity}
                      </span>
                      <span className="text-sm font-medium">{f.title}</span>
                    </div>
                    <p className="text-muted-foreground mt-1 text-sm">{f.detail}</p>
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm">
              {report.summary}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
