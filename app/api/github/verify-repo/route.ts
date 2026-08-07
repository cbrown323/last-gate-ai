import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import { z } from "zod";
import { getOctokit } from "@/lib/github/client";
import { formatGitHubAccessError } from "@/lib/github/errors";
import { parseRepoUrl } from "@/lib/github/parse-repo-url";

const verifySchema = z.object({
  repoUrl: z.string().min(1, "Repository URL is required"),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const repoRef = parseRepoUrl(parsed.data.repoUrl);
  if (!repoRef) {
    return NextResponse.json({
      ok: false,
      message:
        "Not a valid GitHub repository URL. Expected format: https://github.com/owner/repo",
    });
  }

  const authenticated = getOctokit();
  // Fall back to anonymous access so public repos can still be verified
  // before a token is configured.
  const octokit = authenticated ?? new Octokit();
  const hasToken = authenticated !== null;
  const { owner, repo } = repoRef;

  try {
    const { data } = await octokit.repos.get({ owner, repo });
    const message = data.private
      ? `Access confirmed to private repo ${data.full_name}.`
      : hasToken
        ? `Access confirmed to public repo ${data.full_name}.`
        : `${data.full_name} is public and reachable. Save a GITHUB_TOKEN in Settings to sync private repos and avoid rate limits.`;

    return NextResponse.json({
      ok: true,
      fullName: data.full_name,
      isPrivate: data.private,
      defaultBranch: data.default_branch,
      message,
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      message: formatGitHubAccessError(error, owner, repo, { hasToken }),
    });
  }
}
