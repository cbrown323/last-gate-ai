import { getOctokit } from "@/lib/github/client";
import { parseRepoUrl } from "@/lib/github/parse-repo-url";

export async function fetchRepoFile(
  repoUrl: string,
  path: string,
  ref?: string
): Promise<string | null> {
  const parsed = parseRepoUrl(repoUrl);
  const octokit = getOctokit();
  if (!parsed || !octokit) return null;

  try {
    const { data } = await octokit.repos.getContent({
      owner: parsed.owner,
      repo: parsed.repo,
      path,
      ref,
    });
    if (Array.isArray(data) || data.type !== "file" || !("content" in data)) {
      return null;
    }
    return Buffer.from(data.content, "base64").toString("utf-8");
  } catch {
    return null;
  }
}

export async function fetchRepoTreePaths(
  repoUrl: string,
  ref?: string
): Promise<string[]> {
  const parsed = parseRepoUrl(repoUrl);
  const octokit = getOctokit();
  if (!parsed || !octokit) return [];

  try {
    const { data: repo } = await octokit.repos.get({
      owner: parsed.owner,
      repo: parsed.repo,
    });
    const branch = ref ?? repo.default_branch ?? "main";
    const { data: branchRef } = await octokit.git.getRef({
      owner: parsed.owner,
      repo: parsed.repo,
      ref: `heads/${branch}`,
    });
    const { data: tree } = await octokit.git.getTree({
      owner: parsed.owner,
      repo: parsed.repo,
      tree_sha: branchRef.object.sha,
      recursive: "1",
    });
    return (tree.tree ?? [])
      .filter((item) => item.type === "blob" && item.path)
      .map((item) => item.path as string);
  } catch {
    return [];
  }
}
