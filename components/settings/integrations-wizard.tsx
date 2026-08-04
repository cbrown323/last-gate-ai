"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SettingsCategoryBadge,
  settingsCategoryCardClass,
  SettingsFeaturePill,
  type SettingsCategory,
} from "@/components/settings/settings-category";
import { SettingsDocumentationCard } from "@/components/settings/settings-documentation-card";
import { SettingsExpandableDetails } from "@/components/settings/settings-expandable-details";
import type {
  IntegrationConnectionState,
  IntegrationProviderDefinition,
  IntegrationProviderStatus,
} from "@/types/integrations";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Circle,
  ExternalLink,
  Loader2,
  Plug,
  RefreshCw,
  XCircle,
} from "lucide-react";

type ProviderWithDef = IntegrationProviderStatus & IntegrationProviderDefinition;

type OverviewResponse = {
  providers: ProviderWithDef[];
  readyCount: number;
  totalCount: number;
  coreReady: boolean;
};

function isIntegrationReady(state: IntegrationConnectionState) {
  return state === "verified" || state === "configured";
}

function stateBadge(state: IntegrationConnectionState) {
  switch (state) {
    case "verified":
      return (
        <Badge className="border-emerald-200/60 bg-emerald-100/80 text-emerald-800 hover:bg-emerald-100/80 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-200">
          <CheckCircle2 className="mr-1 size-3" />
          All set
        </Badge>
      );
    case "configured":
      return (
        <Badge className="border-emerald-200/60 bg-emerald-100/80 text-emerald-800 hover:bg-emerald-100/80 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-200">
          <CheckCircle2 className="mr-1 size-3" />
          Ready
        </Badge>
      );
    case "error":
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 size-3" />
          Error
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          <Circle className="mr-1 size-3" />
          Not set up
        </Badge>
      );
  }
}

function IntegrationStepCard({
  provider,
  stepNumber,
  onVerify,
  verifying,
}: {
  provider: ProviderWithDef;
  stepNumber: number;
  onVerify: (id: string) => void;
  verifying: boolean;
}) {
  const category: SettingsCategory = provider.optional ? "optional" : "recommended";
  const ready = isIntegrationReady(provider.state);

  return (
    <Card
      className={cn(
        settingsCategoryCardClass(category, { completed: ready }),
        ready && "border-l-2 border-l-emerald-500/35"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full border text-xs font-medium",
                  ready
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "text-muted-foreground"
                )}
              >
                {ready ? <CheckCircle2 className="size-3.5" /> : stepNumber}
              </span>
              <CardTitle className={cn("text-base", ready && "text-muted-foreground")}>
                {provider.name}
              </CardTitle>
              {!ready ? <SettingsCategoryBadge category={category} /> : null}
            </div>
            {ready ? (
              <p className="text-muted-foreground text-sm">
                {provider.state === "verified" && provider.accountLabel
                  ? `Connected as ${provider.accountLabel}. No further setup needed.`
                  : provider.state === "verified"
                    ? "Verified and working. No further setup needed."
                    : "Environment configured. You're good to go."}
              </p>
            ) : (
              <p className="text-muted-foreground text-sm">{provider.description}</p>
            )}
          </div>
          {stateBadge(provider.state)}
        </div>
      </CardHeader>
      <CardContent className={cn("space-y-4", ready && "pt-0")}>
        <SettingsExpandableDetails
          label={ready ? "View setup details" : "Setup instructions"}
          header={
            <div className={cn("flex flex-wrap gap-1", ready && "opacity-75")}>
              {provider.features.map((f) => (
                <SettingsFeaturePill key={f} category={category}>
                  {f}
                </SettingsFeaturePill>
              ))}
            </div>
          }
        >
          {provider.accountLabel ? (
            <p className="text-sm">
              Account:{" "}
              <code className="rounded bg-muted px-1">{provider.accountLabel}</code>
            </p>
          ) : null}

          {provider.message ? (
            <p
              className={
                provider.state === "error"
                  ? "text-destructive text-sm"
                  : "text-muted-foreground text-sm"
              }
            >
              {provider.message}
            </p>
          ) : null}

          <ol className="space-y-3 text-sm">
            {provider.setupSteps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-muted-foreground mt-0.5 shrink-0 font-mono text-xs">
                  {i + 1}.
                </span>
                <div className="space-y-1">
                  <p className="font-medium">{step.title}</p>
                  <p className="text-muted-foreground">{step.description}</p>
                  {step.link ? (
                    <a
                      href={step.link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-600 text-xs hover:underline"
                    >
                      {step.link.label}
                      <ExternalLink className="size-3" />
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </SettingsExpandableDetails>

        <div
          className={cn(
            "flex flex-wrap items-center gap-2 border-t pt-3",
            ready && "border-border/40"
          )}
        >
          {!ready ? (
            <p className="text-muted-foreground text-xs">
              Env:{" "}
              {provider.envVars.map((v) => (
                <code key={v} className="mr-1 rounded bg-muted px-1">
                  {v}
                </code>
              ))}
            </p>
          ) : null}
          <div className={cn("ml-auto flex gap-2", ready && "w-full justify-end")}>
            {!ready ? (
              <a
                href={provider.docsUrl}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground inline-flex items-center gap-1 text-xs hover:text-foreground"
              >
                Docs
                <ExternalLink className="size-3" />
              </a>
            ) : null}
            <Button
              size="sm"
              variant={ready ? "ghost" : "outline"}
              onClick={() => onVerify(provider.id)}
              disabled={verifying}
              className={ready ? "text-muted-foreground h-7 text-xs" : undefined}
            >
              {verifying ? (
                <>
                  <Loader2 className="mr-1 size-4 animate-spin" />
                  Checking…
                </>
              ) : (
                <>
                  <RefreshCw className="mr-1 size-4" />
                  Re-check
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function IntegrationsWizard() {
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/integrations/status");
      if (!res.ok) throw new Error("Could not load integration status");
      const data = (await res.json()) as OverviewResponse;
      setOverview(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  async function verifyProvider(id: string) {
    setVerifyingId(id);
    setError(null);
    try {
      const res = await fetch("/api/integrations/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Verification failed");

      setOverview((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          providers: prev.providers.map((p) =>
            p.id === id
              ? {
                  ...p,
                  state: data.ok ? ("verified" as const) : ("error" as const),
                  verified: data.ok,
                  configured: data.ok || p.configured,
                  message: data.message,
                  accountLabel: data.accountLabel,
                }
              : p
          ),
          readyCount: prev.providers.filter((p) =>
            p.id === id ? data.ok : p.verified || p.configured
          ).length,
          coreReady:
            id === "github" ? data.ok : prev.coreReady,
        };
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setVerifyingId(null);
    }
  }

  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardContent className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading integrations…
        </CardContent>
      </Card>
    );
  }

  const progress = overview
    ? Math.round((overview.readyCount / overview.totalCount) * 100)
    : 0;

  return (
    <div className="space-y-4">
      <Card className="border-emerald-200/50 bg-emerald-50/20 shadow-sm dark:bg-emerald-950/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plug className="size-4 text-emerald-600" />
            Connect your stack
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Paste keys in the <strong className="font-medium text-foreground">API keys</strong> section
            above. They save to <code className="rounded bg-muted px-1">.env.local</code> on this
            machine only, never in the browser cache or database.
          </p>

          {overview ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>
                  {overview.readyCount} of {overview.totalCount} integrations ready
                </span>
                <span className="text-muted-foreground">{progress}%</span>
              </div>
              <div className="bg-muted h-2 overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full bg-emerald-600 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : null}

          {error ? <p className="text-destructive text-sm">{error}</p> : null}

          {overview?.coreReady ? (
            <p className="text-sm">
              GitHub is configured.{" "}
              <Link href="/applications" className="text-emerald-600 underline">
                Open Applications
              </Link>{" "}
              and use Import from GitHub or Add application to start syncing.
            </p>
          ) : (
            <p className="text-sm">
              Start with GitHub to unlock repo sync, stack scans, and deployment detection.
            </p>
          )}
        </CardContent>
      </Card>

      {overview?.providers.map((provider, index) => (
        <IntegrationStepCard
          key={provider.id}
          provider={provider}
          stepNumber={index + 1}
          onVerify={verifyProvider}
          verifying={verifyingId === provider.id}
        />
      ))}

      <SettingsDocumentationCard title="After connecting" expandLabel="Next steps">
        <ol className="list-inside list-decimal space-y-1">
          <li>
            <Link href="/applications" className="text-emerald-600 underline">
              Applications
            </Link>
            : Import from GitHub or Add application
          </li>
          <li>
            Open the app and click Run full analysis (git sync, stack scan, AI summary, and more)
          </li>
          <li>
            Or run steps individually under Intelligence → Git (Sync now), Stack (Scan repo),
            Architecture (Map architecture)
          </li>
          <li>
            Intelligence → Deployments → Detect from repo (finds vercel.json, railway.toml, etc.)
          </li>
        </ol>
      </SettingsDocumentationCard>
    </div>
  );
}
