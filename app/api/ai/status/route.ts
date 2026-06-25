import { NextResponse } from "next/server";
import { getAiConfig } from "@/lib/ai/config";

export async function GET() {
  const config = getAiConfig();
  return NextResponse.json({
    configured: config.configured,
    provider: config.provider,
    model: config.model,
    envHint: config.configured
      ? null
      : "Set AI_GATEWAY_API_KEY or OPENAI_API_KEY in .env.local",
  });
}
