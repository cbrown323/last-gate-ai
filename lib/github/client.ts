import "server-only";
import { Octokit } from "@octokit/rest";

export function getOctokit(): Octokit | null {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;
  return new Octokit({ auth: token });
}
