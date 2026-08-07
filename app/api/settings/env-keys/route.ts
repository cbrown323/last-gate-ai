import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getEnvKeyStatuses,
  isEnvKeyManagementEnabled,
  setEnvKey,
} from "@/lib/env/local";

export async function GET() {
  if (!isEnvKeyManagementEnabled()) {
    return NextResponse.json({
      enabled: false,
      keys: [],
      message: "Configure keys via your deployment platform in production.",
    });
  }

  const keys = await getEnvKeyStatuses();
  return NextResponse.json({ enabled: true, keys });
}

const saveSchema = z.object({
  key: z.enum([
    "GITHUB_TOKEN",
    "AI_GATEWAY_API_KEY",
    "OPENAI_API_KEY",
    "VERCEL_TOKEN",
    "RAILWAY_TOKEN",
  ]),
  value: z.string().min(1, "API key is required"),
});

export async function POST(request: Request) {
  if (!isEnvKeyManagementEnabled()) {
    return NextResponse.json(
      { error: "API key management is only available in local development" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = saveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    await setEnvKey(parsed.data.key, parsed.data.value);
    const keys = await getEnvKeyStatuses();
    const saved = keys.find((k) => k.id === parsed.data.key);

    return NextResponse.json({
      ok: true,
      key: parsed.data.key,
      configured: saved?.configured ?? true,
      maskedPreview: saved?.maskedPreview ?? null,
      message: "Saved to .env.local and active immediately. Restart npm run dev only if features don't update.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save API key";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
