"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HeadroomReportResult } from "@/types";
import { Gauge } from "lucide-react";
import { useApplicationDetailOptional } from "@/components/applications/application-detail-context";

export function HeadroomPanel({
  applicationId,
  latestReport,
}: {
  applicationId: string;
  latestReport?: HeadroomReportResult | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const detail = useApplicationDetailOptional();
  const hideActions = detail?.hidePanelActions ?? false;
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<HeadroomReportResult | null>(latestReport ?? null);

  async function runAnalysis() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/agents/headroom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      setReport(data);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <CardTitle className="text-base">Headroom — scale readiness</CardTitle>
          {report ? (
            <Badge variant={report.score >= 70 ? "default" : "secondary"} className="text-xs">
              Readiness {report.score}/100 · {report.mode}
            </Badge>
          ) : null}
        </div>
        {!hideActions ? (
          <Button
            onClick={runAnalysis}
            disabled={loading}
            variant="outline"
            className="shrink-0"
          >
            <Gauge className="mr-1 size-4" />
            {loading ? "Analyzing..." : "Analyze"}
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
        {!report ? (
          <p className="text-muted-foreground text-sm">
            {hideActions
              ? "Scale readiness analysis runs automatically in the guided product analysis flow above."
              : "Capacity and scale readiness based on stack, CI/CD signals, and maintenance health."}
          </p>
        ) : (
          <>
            {report.generatedAt ? (
              <p className="text-muted-foreground text-xs">
                Generated {new Date(report.generatedAt).toLocaleString()}
              </p>
            ) : null}
            {report.recommendations.length > 0 ? (
              <ul className="space-y-1 text-sm">
                {report.recommendations.map((r, i) => (
                  <li key={i} className="text-muted-foreground">· {r}</li>
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
