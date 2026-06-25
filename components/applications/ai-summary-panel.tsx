"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { useApplicationDetailOptional } from "@/components/applications/application-detail-context";

type AiStatus = {
  configured: boolean;
  provider: "gateway" | "openai" | null;
};

export function AiSummaryPanel({
  applicationId,
  latestSummary,
}: {
  applicationId: string;
  latestSummary?: { content: string; generatedAt: string } | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(latestSummary?.content ?? "");
  const [generatedAt, setGeneratedAt] = useState(latestSummary?.generatedAt ?? "");
  const [lastMode, setLastMode] = useState<"ai" | "offline" | "demo" | null>(null);
  const [aiStatus, setAiStatus] = useState<AiStatus | null>(null);
  const detail = useApplicationDetailOptional();
  const hideActions = detail?.hidePanelActions ?? false;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/ai/status")
      .then((res) => res.json())
      .then((data: AiStatus) => setAiStatus(data))
      .catch(() => setAiStatus({ configured: false, provider: null }));
  }, []);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg =
          typeof data.error === "string"
            ? data.error
            : "Summary generation failed";
        throw new Error(msg);
      }
      setContent(data.content);
      setGeneratedAt(data.generatedAt);
      setLastMode(data.mode ?? null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <CardTitle className="text-base">AI project summary</CardTitle>
          {aiStatus ? (
            <Badge variant={aiStatus.configured ? "default" : "secondary"} className="text-xs">
              {aiStatus.configured
                ? `AI ready (${aiStatus.provider})`
                : "Offline — add API key in Settings"}
            </Badge>
          ) : null}
        </div>
        {!hideActions ? (
          <Button onClick={generate} disabled={loading} className="shrink-0 bg-emerald-600 hover:bg-emerald-700">
            <Sparkles className="mr-1 size-4" />
            {loading ? "Generating..." : "Generate"}
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {error ? <p className="text-destructive mb-2 text-sm">{error}</p> : null}
        {lastMode === "offline" ? (
          <p className="text-muted-foreground mb-2 text-xs">
            Saved an offline template. Add <code className="rounded bg-muted px-1">AI_GATEWAY_API_KEY</code> or{" "}
            <code className="rounded bg-muted px-1">OPENAI_API_KEY</code> to enable live AI.
          </p>
        ) : null}
        {lastMode === "demo" ? (
          <p className="text-muted-foreground mb-2 text-xs">
            Demo preview summary — pre-filled without a live AI call. Reload from the dashboard banner or run{" "}
            <code className="rounded bg-muted px-1">npm run db:seed</code>.
          </p>
        ) : null}
        {generatedAt ? (
          <p className="text-muted-foreground mb-2 text-xs">
            Last generated {new Date(generatedAt).toLocaleString()}
            {lastMode === "ai" ? " · live AI" : lastMode === "demo" ? " · demo preview" : ""}
          </p>
        ) : null}
        {content ? (
          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm">
            {content}
          </div>
        ) : hideActions ? (
          <p className="text-muted-foreground text-sm">
            Use <span className="font-medium text-foreground">Start product analysis</span> above to generate an intelligence summary from repo metadata and README.
          </p>
        ) : (
          <p className="text-muted-foreground text-sm">
            Generate an intelligence summary from repo metadata and README. Requires an API key for live AI output.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
