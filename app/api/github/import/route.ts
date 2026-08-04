import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { listAuthenticatedRepos, normalizeRepoUrl } from "@/lib/github/list-repos";

const bodySchema = z.object({
  repoUrls: z.array(z.string().url()).min(1),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const repos = await listAuthenticatedRepos();
    const repoByUrl = new Map(
      repos.map((repo) => [normalizeRepoUrl(repo.htmlUrl), repo] as const)
    );

    const existing = await prisma.application.findMany({
      select: { repoUrl: true },
    });
    const registeredUrls = new Set(
      existing
        .map((app) => normalizeRepoUrl(app.repoUrl))
        .filter((url): url is string => Boolean(url))
    );

    const created = [];
    const skipped: string[] = [];

    for (const repoUrl of parsed.data.repoUrls) {
      const normalized = normalizeRepoUrl(repoUrl);
      if (!normalized) {
        skipped.push(repoUrl);
        continue;
      }

      if (registeredUrls.has(normalized)) {
        skipped.push(repoUrl);
        continue;
      }

      const repo = repoByUrl.get(normalized);
      if (!repo) {
        skipped.push(repoUrl);
        continue;
      }

      const application = await prisma.application.create({
        data: {
          name: repo.name,
          description: repo.description,
          repoUrl: repo.htmlUrl,
          owner: repo.owner,
          status: "development",
          lifecyclePhase: "development",
          workflowType: "kanban",
        },
      });

      registeredUrls.add(normalized);
      created.push(application);
    }

    return NextResponse.json({ created, skipped });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Import failed";
    const status = message.includes("GITHUB_TOKEN") ? 503 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
