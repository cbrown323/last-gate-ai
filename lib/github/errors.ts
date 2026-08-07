import { RequestError } from "@octokit/request-error";

/**
 * Turn a GitHub API error into a user-facing message that explains what to
 * fix. Shared by git sync and the repo access verification endpoint.
 */
export function formatGitHubAccessError(
  error: unknown,
  owner: string,
  repo: string,
  options?: { hasToken?: boolean }
): string {
  const hasToken = options?.hasToken ?? true;

  if (error instanceof RequestError) {
    if (error.status === 404) {
      if (!hasToken) {
        return `Repository "${owner}/${repo}" was not found. Check the URL is correct — if this is a private repo, save a GITHUB_TOKEN in Settings first.`;
      }
      return `Repository "${owner}/${repo}" was not found. Check the GitHub URL is correct and that your token can access it: classic tokens need the repo scope, fine-grained tokens need this repo selected under Repository access, and org-owned repos may need SSO authorization on the token.`;
    }
    if (error.status === 401) {
      return "GitHub rejected the token. Check that GITHUB_TOKEN in .env.local is valid and not expired.";
    }
    if (error.status === 403) {
      return `GitHub denied access to "${owner}/${repo}". The token may lack permissions or the API rate limit was exceeded.`;
    }
  }

  if (error instanceof Error) return error.message;
  return "GitHub request failed";
}
