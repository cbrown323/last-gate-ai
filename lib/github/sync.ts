import { RequestError } from "@octokit/request-error";
import type { Octokit } from "@octokit/rest";
import { prisma } from "@/lib/db";
import { getOctokit } from "@/lib/github/client";
import { parseRepoUrl } from "@/lib/github/parse-repo-url";

async function countCommitsSince(
  octokit: Octokit,
  owner: string,
  repo: string,
  since: Date
): Promise<number> {
  let count = 0;
  const iterator = octokit.paginate.iterator(octokit.repos.listCommits, {
    owner,
    repo,
    since: since.toISOString(),
    per_page: 100,
  });

  for await (const { data } of iterator) {
    count += data.length;
    if (count >= 500) break;
  }

  return count;
}

function formatGitHubSyncError(
  error: unknown,
  owner: string,
  repo: string
): string {
  if (error instanceof RequestError) {
    if (error.status === 404) {
      return `Repository "${owner}/${repo}" was not found. Check the GitHub URL in Edit is correct, the repo exists on GitHub, and your token can access it (private repos need repo scope on the token).`;
    }
    if (error.status === 401) {
      return "GitHub rejected the token. Check that GITHUB_TOKEN in .env.local is valid and not expired, then restart the dev server.";
    }
    if (error.status === 403) {
      return `GitHub denied access to "${owner}/${repo}". The token may lack permissions or the API rate limit was exceeded.`;
    }
  }

  if (error instanceof Error) return error.message;
  return "Sync failed";
}

export async function syncGitHubMetadata(applicationId: string) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
  });

  if (!application?.repoUrl) {
    throw new Error("Application has no repository URL");
  }

  const parsed = parseRepoUrl(application.repoUrl);
  if (!parsed) {
    throw new Error("Invalid GitHub repository URL");
  }

  const octokit = getOctokit();
  if (!octokit) {
    throw new Error("GITHUB_TOKEN is not configured");
  }

  const { owner, repo } = parsed;

  const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  let repoData;
  let contributors;
  let issues;
  let commits7;
  let commits30;
  let totalCommits;
  try {
    [repoData, contributors, issues, commits7, commits30, totalCommits] = await Promise.all([
      octokit.repos.get({ owner, repo }),
      octokit.repos.listContributors({ owner, repo, per_page: 100 }),
      octokit.issues.listForRepo({ owner, repo, state: "open", per_page: 1 }),
      countCommitsSince(octokit, owner, repo, since7),
      countCommitsSince(octokit, owner, repo, since30),
      countCommitsSince(octokit, owner, repo, new Date(0)),
    ]);
  } catch (error) {
    throw new Error(formatGitHubSyncError(error, owner, repo));
  }

  const lastCommitAt = repoData.data.pushed_at
    ? new Date(repoData.data.pushed_at)
    : null;

  const gitMeta = await prisma.gitMetadata.upsert({
    where: { applicationId },
    create: {
      applicationId,
      lastCommitAt,
      commitCount: totalCommits,
      commitsLast7Days: commits7,
      commitsLast30Days: commits30,
      contributorCount: contributors.data.length,
      openIssues: repoData.data.open_issues ?? issues.data.length,
      defaultBranch: repoData.data.default_branch ?? "main",
      syncedAt: new Date(),
    },
    update: {
      lastCommitAt,
      commitCount: totalCommits,
      commitsLast7Days: commits7,
      commitsLast30Days: commits30,
      contributorCount: contributors.data.length,
      openIssues: repoData.data.open_issues ?? issues.data.length,
      defaultBranch: repoData.data.default_branch ?? "main",
      syncedAt: new Date(),
    },
  });

  return gitMeta;
}
