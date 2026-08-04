import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { EnvKeyId } from "@/lib/env/keys";
import { MANAGEABLE_ENV_KEY_IDS } from "@/lib/env/keys";

const ENV_LOCAL_PATH = path.join(process.cwd(), ".env.local");

export function maskSecret(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.length <= 8) return "••••••••";
  const middleLength = Math.min(12, trimmed.length - 8);
  return `${trimmed.slice(0, 4)}${"•".repeat(middleLength)}${trimmed.slice(-4)}`;
}

export function isEnvKeyManagementEnabled(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.ALLOW_ENV_KEY_UI === "true";
}

function parseEnvLine(line: string): { key: string; value: string } | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;

  const eq = trimmed.indexOf("=");
  if (eq === -1) return null;

  const key = trimmed.slice(0, eq).trim();
  let value = trimmed.slice(eq + 1).trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return { key, value };
}

function formatEnvValue(value: string): string {
  if (/[\s#"'\\]/.test(value)) {
    return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return value;
}

async function readEnvLocalContent(): Promise<string> {
  try {
    return await readFile(ENV_LOCAL_PATH, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return "";
    }
    throw error;
  }
}

function parseEnvContent(content: string): Map<string, string> {
  const entries = new Map<string, string>();
  for (const line of content.split("\n")) {
    const parsed = parseEnvLine(line);
    if (parsed) entries.set(parsed.key, parsed.value);
  }
  return entries;
}

function upsertEnvKeyInContent(content: string, key: EnvKeyId, value: string): string {
  const lines = content.length > 0 ? content.split("\n") : [];
  const formatted = `${key}=${formatEnvValue(value)}`;
  let found = false;

  const updated = lines.map((line) => {
    const parsed = parseEnvLine(line);
    if (parsed?.key === key) {
      found = true;
      return formatted;
    }
    return line;
  });

  if (!found) {
    if (updated.length > 0 && updated[updated.length - 1] !== "") {
      updated.push("");
    }
    updated.push(formatted);
  }

  return updated.join("\n").replace(/\n?$/, "\n");
}

export type EnvKeyStatus = {
  id: EnvKeyId;
  configured: boolean;
  maskedPreview: string | null;
};

export async function getEnvKeyStatuses(): Promise<EnvKeyStatus[]> {
  const content = await readEnvLocalContent();
  const parsed = parseEnvContent(content);

  return MANAGEABLE_ENV_KEY_IDS.map((id) => {
    const runtimeValue = process.env[id]?.trim();
    const fileValue = parsed.get(id)?.trim();
    const value = runtimeValue || fileValue || "";
    const configured = Boolean(value);

    return {
      id,
      configured,
      maskedPreview: configured ? maskSecret(value) : null,
    };
  });
}

export async function setEnvKey(key: EnvKeyId, value: string): Promise<void> {
  if (!isEnvKeyManagementEnabled()) {
    throw new Error("API key management is only available in local development");
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("API key cannot be empty");
  }

  const content = await readEnvLocalContent();
  const nextContent = upsertEnvKeyInContent(content, key, trimmed);
  await writeFile(ENV_LOCAL_PATH, nextContent, "utf8");

  process.env[key] = trimmed;
}
