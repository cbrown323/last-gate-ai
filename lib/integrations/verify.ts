import "server-only";
import { generateText } from "ai";
import { getOctokit } from "@/lib/github/client";
import { getAiConfig } from "@/lib/ai/config";
import { getSummaryModel } from "@/lib/ai/model";
import type { IntegrationProviderId } from "@/types/integrations";

export type VerifyResult = {
  ok: boolean;
  accountLabel: string | null;
  message: string;
};

export async function verifyGitHub(): Promise<VerifyResult> {
  const octokit = getOctokit();
  if (!octokit) {
    return {
      ok: false,
      accountLabel: null,
      message: "GITHUB_TOKEN is not set in .env.local",
    };
  }

  try {
    const { data } = await octokit.users.getAuthenticated();
    return {
      ok: true,
      accountLabel: data.login ?? data.name ?? null,
      message: `Connected as @${data.login}`,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "GitHub authentication failed";
    return { ok: false, accountLabel: null, message };
  }
}

export async function verifyAi(): Promise<VerifyResult> {
  const config = getAiConfig();
  if (!config.configured) {
    return {
      ok: false,
      accountLabel: null,
      message: "Set AI_GATEWAY_API_KEY or OPENAI_API_KEY in .env.local",
    };
  }

  const model = getSummaryModel();
  if (!model) {
    return {
      ok: false,
      accountLabel: null,
      message: "AI key is set but no model could be configured",
    };
  }

  // A tiny live call so billing/quota problems surface here instead of
  // silently degrading analysis to offline mode.
  try {
    await generateText({
      model,
      prompt: "Reply with the single word: ok",
      maxOutputTokens: 8,
    });
    return {
      ok: true,
      accountLabel: config.provider,
      message: `Live check passed (${config.provider}, ${config.model})`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI request failed";
    return {
      ok: false,
      accountLabel: config.provider,
      message: `Key is set but a live request failed — check billing/quota with your provider. (${message})`,
    };
  }
}

export async function verifyVercel(): Promise<VerifyResult> {
  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    return {
      ok: false,
      accountLabel: null,
      message: "VERCEL_TOKEN is not set in .env.local",
    };
  }

  try {
    const res = await fetch("https://api.vercel.com/v2/user", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      return {
        ok: false,
        accountLabel: null,
        message: `Vercel API returned ${res.status}`,
      };
    }
    const data = (await res.json()) as { user?: { username?: string; email?: string } };
    const label = data.user?.username ?? data.user?.email ?? null;
    return {
      ok: true,
      accountLabel: label,
      message: label ? `Connected as ${label}` : "Vercel token is valid",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Vercel verification failed";
    return { ok: false, accountLabel: null, message };
  }
}

export async function verifyRailway(): Promise<VerifyResult> {
  const token = process.env.RAILWAY_TOKEN;
  if (!token) {
    return {
      ok: false,
      accountLabel: null,
      message: "RAILWAY_TOKEN is not set in .env.local",
    };
  }

  try {
    const res = await fetch("https://backboard.railway.app/graphql/v2", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: "{ me { email name } }" }),
    });
    if (!res.ok) {
      return {
        ok: false,
        accountLabel: null,
        message: `Railway API returned ${res.status}`,
      };
    }
    const data = (await res.json()) as {
      data?: { me?: { email?: string; name?: string } };
      errors?: { message: string }[];
    };
    if (data.errors?.length) {
      return {
        ok: false,
        accountLabel: null,
        message: data.errors[0]?.message ?? "Railway authentication failed",
      };
    }
    const label = data.data?.me?.email ?? data.data?.me?.name ?? null;
    return {
      ok: true,
      accountLabel: label,
      message: label ? `Connected as ${label}` : "Railway token is valid",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Railway verification failed";
    return { ok: false, accountLabel: null, message };
  }
}

export async function verifyProvider(
  id: IntegrationProviderId
): Promise<VerifyResult> {
  switch (id) {
    case "github":
      return verifyGitHub();
    case "ai":
      return verifyAi();
    case "vercel":
      return verifyVercel();
    case "railway":
      return verifyRailway();
  }
}
