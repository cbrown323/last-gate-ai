"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AiStatus = {
  configured: boolean;
  provider: "gateway" | "openai" | null;
  model: string;
  envHint: string | null;
};

export function AiStatusCard() {
  const [status, setStatus] = useState<AiStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/ai/status")
      .then(async (res) => {
        if (!res.ok) throw new Error("Could not load AI status");
        return res.json() as Promise<AiStatus>;
      })
      .then(setStatus)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"));
  }, []);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">AI integration status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {error ? <p className="text-destructive">{error}</p> : null}
        {!status && !error ? (
          <p className="text-muted-foreground">Checking configuration…</p>
        ) : null}
        {status ? (
          <>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={status.configured ? "default" : "secondary"}>
                {status.configured ? "Ready" : "Offline"}
              </Badge>
            </div>
            {status.configured ? (
              <p className="text-muted-foreground">
                Provider: <code className="rounded bg-muted px-1">{status.provider}</code> · Model:{" "}
                <code className="rounded bg-muted px-1">{status.model}</code>
              </p>
            ) : (
              <p className="text-muted-foreground">{status.envHint}</p>
            )}
            <p className="text-muted-foreground">
              Test summaries on any application → <span className="text-foreground">AI Summary</span> tab →{" "}
              <span className="text-foreground">Generate</span>.
            </p>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
