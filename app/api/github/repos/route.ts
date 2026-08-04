import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { listAuthenticatedRepos, normalizeRepoUrl } from "@/lib/github/list-repos";

export async function GET() {
  try {
    const [repos, applications] = await Promise.all([
      listAuthenticatedRepos(),
      prisma.application.findMany({
        select: { repoUrl: true },
      }),
    ]);

    const registeredUrls = new Set(
      applications
        .map((app) => normalizeRepoUrl(app.repoUrl))
        .filter((url): url is string => Boolean(url))
    );

    return NextResponse.json({
      repos: repos.map((repo) => ({
        ...repo,
        registered: registeredUrls.has(normalizeRepoUrl(repo.htmlUrl) ?? ""),
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list GitHub repos";
    const status = message.includes("GITHUB_TOKEN") ? 503 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
