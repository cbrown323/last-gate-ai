import { NextResponse } from "next/server";
import { z } from "zod";
import { syncGitHubMetadata } from "@/lib/github/sync";

const bodySchema = z.object({
  applicationId: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const gitMeta = await syncGitHubMetadata(parsed.data.applicationId);
    return NextResponse.json(gitMeta);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
