"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DeploymentRecord } from "@/types";
import { Rocket } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useApplicationDetailOptional } from "@/components/applications/application-detail-context";

const PLATFORMS = ["vercel", "railway", "fly", "render", "netlify", "docker", "other"];

export function DeploymentsPanel({
  applicationId,
  repoUrl,
  initialDeployments,
}: {
  applicationId: string;
  repoUrl: string | null;
  initialDeployments: DeploymentRecord[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const detail = useApplicationDetailOptional();
  const hideActions = detail?.hidePanelActions ?? false;
  const [error, setError] = useState<string | null>(null);
  const [deployments, setDeployments] = useState(initialDeployments);
  const [platform, setPlatform] = useState("vercel");
  const [url, setUrl] = useState("");
  const [version, setVersion] = useState("");

  async function detect() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/deployments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, detect: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Detection failed");
      setDeployments(data.deployments);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Detection failed");
    } finally {
      setLoading(false);
    }
  }

  async function addDeployment() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/deployments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          platform,
          status: "success",
          url: url || undefined,
          version: version || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to add deployment");
      setDeployments((prev) => [data, ...prev]);
      setUrl("");
      setVersion("");
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
          <CardTitle className="text-base">Deployments</CardTitle>
          <p className="text-muted-foreground text-xs">
            Track deployment history and detect platform config files
          </p>
        </div>
        {!hideActions ? (
          <Button
            onClick={detect}
            disabled={loading || !repoUrl}
            variant="outline"
            size="sm"
            className="shrink-0"
          >
            <Rocket className="mr-1 size-4" />
            Detect from repo
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? <p className="text-destructive text-sm">{error}</p> : null}

        <div className="rounded-lg border p-4 space-y-3">
          <p className="text-sm font-medium">Log deployment</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label htmlFor="platform">Platform</Label>
              <Select
                value={platform}
                onValueChange={(v) => v && setPlatform(v)}
              >
                <SelectTrigger id="platform">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="deploy-url">URL</Label>
              <Input
                id="deploy-url"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="version">Version / commit</Label>
              <Input
                id="version"
                placeholder="abc123"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={addDeployment} disabled={loading} size="sm">
            Add deployment
          </Button>
        </div>

        {deployments.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {hideActions
              ? "Deployment detection runs automatically in the guided product analysis flow above. You can still log deployments manually below."
              : "No deployments tracked yet. Detect from repo or log manually."}
          </p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {deployments.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{d.platform}</Badge>
                  <Badge variant={d.status === "success" ? "default" : "secondary"}>
                    {d.status}
                  </Badge>
                  {d.version ? (
                    <span className="text-muted-foreground font-mono text-xs">{d.version}</span>
                  ) : null}
                </div>
                <div className="flex items-center gap-3">
                  {d.url ? (
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-600 text-xs hover:underline"
                    >
                      {d.url.replace(/^https?:\/\//, "")}
                    </a>
                  ) : null}
                  <span className="text-muted-foreground text-xs">
                    {formatDistanceToNow(new Date(d.deployedAt), { addSuffix: true })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
