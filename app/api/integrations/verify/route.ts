import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyProvider } from "@/lib/integrations/verify";
import { getProviderDefinition } from "@/lib/integrations/providers";
import type { IntegrationProviderId } from "@/types/integrations";

const bodySchema = z.object({
  provider: z.enum(["github", "ai", "vercel", "railway"]),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const providerId = parsed.data.provider as IntegrationProviderId;
  const def = getProviderDefinition(providerId);
  if (!def) {
    return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
  }

  const result = await verifyProvider(providerId);
  return NextResponse.json({
    provider: providerId,
    ok: result.ok,
    accountLabel: result.accountLabel,
    message: result.message,
    state: result.ok ? "verified" : "error",
  });
}
