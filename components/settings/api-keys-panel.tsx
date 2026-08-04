"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  settingsCategoryCardClass,
  SettingsCategoryBadge,
} from "@/components/settings/settings-category";
import { SettingsExpandableDetails } from "@/components/settings/settings-expandable-details";
import { MANAGEABLE_ENV_KEYS, type EnvKeyId } from "@/lib/env/keys";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  ShieldCheck,
} from "lucide-react";

type EnvKeyStatus = {
  id: EnvKeyId;
  configured: boolean;
  maskedPreview: string | null;
};

type EnvKeysResponse = {
  enabled: boolean;
  keys: EnvKeyStatus[];
  message?: string;
};

function ApiKeyField({
  envVar,
  label,
  description,
  placeholder,
  optional,
  status,
  onSaved,
}: {
  envVar: EnvKeyId;
  label: string;
  description: string;
  placeholder: string;
  optional?: boolean;
  status: EnvKeyStatus | undefined;
  onSaved: () => void;
}) {
  const [value, setValue] = useState("");
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (!value.trim()) {
      setError("Enter a key before saving");
      return;
    }

    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch("/api/settings/env-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: envVar, value: value.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");

      setValue("");
      setVisible(false);
      setSaved(true);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-2 rounded-lg border border-border/60 bg-background/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Label htmlFor={envVar} className="text-sm">
              {label}
            </Label>
            {optional ? <SettingsCategoryBadge category="optional" /> : null}
            {status?.configured ? (
              <Badge
                variant="outline"
                className="border-emerald-200/60 bg-emerald-50/80 font-normal text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-200"
              >
                <CheckCircle2 className="mr-1 size-3" />
                Saved
              </Badge>
            ) : null}
          </div>
          <p className="text-muted-foreground text-xs">{description}</p>
          <p className="text-muted-foreground font-mono text-xs">{envVar}</p>
        </div>
        {status?.maskedPreview ? (
          <code className="rounded-md border bg-muted/50 px-2 py-1 font-mono text-xs tracking-wider">
            {status.maskedPreview}
          </code>
        ) : null}
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            id={envVar}
            type={visible ? "text" : "password"}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setSaved(false);
              setError(null);
            }}
            placeholder={status?.configured ? "Paste a new key to replace" : placeholder}
            autoComplete="off"
            spellCheck={false}
            className="pr-9 font-mono text-sm"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide API key" : "Show API key"}
          >
            {visible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          </Button>
        </div>
        <Button size="sm" onClick={handleSave} disabled={saving || !value.trim()}>
          {saving ? (
            <>
              <Loader2 className="mr-1 size-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Save"
          )}
        </Button>
      </div>

      {error ? <p className="text-destructive text-xs">{error}</p> : null}
      {saved ? (
        <p className="text-emerald-700 text-xs dark:text-emerald-300">
          Saved securely to .env.local. Masked above so your key stays private.
        </p>
      ) : null}
    </div>
  );
}

export function ApiKeysPanel() {
  const [data, setData] = useState<EnvKeysResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStatuses = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/settings/env-keys");
      if (!res.ok) throw new Error("Could not load API key status");
      const json = (await res.json()) as EnvKeysResponse;
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatuses();
  }, [loadStatuses]);

  if (loading) {
    return (
      <Card className={cn(settingsCategoryCardClass("recommended"), "shadow-sm")}>
        <CardContent className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading API keys…
        </CardContent>
      </Card>
    );
  }

  if (!data?.enabled) {
    return (
      <Card className={cn(settingsCategoryCardClass("optional"), "shadow-sm")}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="size-4" />
            API keys
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            {data?.message ??
              "Set environment variables in your deployment platform for production."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const statusById = new Map(data.keys.map((k) => [k.id, k]));
  const configuredCount = data.keys.filter((k) => k.configured).length;
  const totalCount = data.keys.length;
  const githubConfigured = statusById.get("GITHUB_TOKEN")?.configured ?? false;

  return (
    <Card className={cn(settingsCategoryCardClass("recommended"), "shadow-sm")}>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="size-4 text-emerald-600" />
            API keys
          </CardTitle>
          <SettingsCategoryBadge category="recommended" />
          {configuredCount > 0 ? (
            <Badge
              variant="outline"
              className="border-emerald-200/60 bg-emerald-50/80 font-normal text-emerald-800 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-200"
            >
              <CheckCircle2 className="mr-1 size-3" />
              {configuredCount} of {totalCount} set
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <SettingsExpandableDetails
          label="Manage keys"
          defaultOpen={!githubConfigured}
          header={
            <p className="text-muted-foreground text-sm">
              {configuredCount > 0
                ? "Keys saved locally. Expand to update or add more."
                : "Add GitHub and AI keys to unlock live sync and intelligence."}
            </p>
          }
        >
          <div className="space-y-4">
            <div className="flex gap-3 rounded-lg border border-emerald-200/50 bg-emerald-50/40 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              <div className="space-y-1 text-sm">
                <p className="font-medium">Your keys stay on this machine</p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Keys are saved to <code className="rounded bg-muted px-1">.env.local</code> only,
                  never sent to a database or third party. Inputs are masked by default; saved keys
                  appear scrambled (e.g.{" "}
                  <code className="rounded bg-muted px-1">ghp_••••••••abcd</code>) so you can
                  confirm something is set without exposing the full value.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <Lock className="size-3.5" />
              <span>Leave blank to keep an existing key. Paste a new value to replace it.</span>
            </div>

            {error ? <p className="text-destructive text-sm">{error}</p> : null}

            <div className="space-y-3">
              {MANAGEABLE_ENV_KEYS.map((keyDef) => (
                <ApiKeyField
                  key={keyDef.id}
                  envVar={keyDef.id}
                  label={keyDef.label}
                  description={keyDef.description}
                  placeholder={keyDef.placeholder}
                  optional={keyDef.optional}
                  status={statusById.get(keyDef.id)}
                  onSaved={loadStatuses}
                />
              ))}
            </div>
          </div>
        </SettingsExpandableDetails>
      </CardContent>
    </Card>
  );
}
