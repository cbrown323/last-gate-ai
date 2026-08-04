import { getOctokit } from "@/lib/github/client";
import { parseRepoUrl } from "@/lib/github/parse-repo-url";

export type GitHubRepoSummary = {
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  isPrivate: boolean;
  updatedAt: string;
  defaultBranch: string;
  owner: string;
};

export function normalizeRepoUrl(repoUrl: string | null | undefined): string | null {
  if (!repoUrl) return null;
  const parsed = parseRepoUrl(repoUrl);
  if (!parsed) return null;
  return `https://github.com/${parsed.owner}/${parsed.repo}`.toLowerCase();
}

export async function listAuthenticatedRepos(): Promise<GitHubRepoSummary[]> {
  const octokit = getOctokit();
  if (!octokit) {
    throw new Error("GITHUB_TOKEN is not configured");
  }

  const repos = await octokit.paginate(octokit.repos.listForAuthenticatedUser, {
    per_page: 100,
    sort: "updated",
    affiliation: "owner",
  });

  return repos
    .filter((repo) => !repo.fork)
    .map((repo) => ({
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      htmlUrl: repo.html_url,
      isPrivate: repo.private,
      updatedAt: repo.updated_at ?? new Date().toISOString(),
      defaultBranch: repo.default_branch ?? "main",
      owner: repo.owner?.login ?? "",
    }));
}
