import path from "node:path";

export const DEFAULT_DATABASE_URL = "file:./data/last-gate.db";

export function resolveDatabaseUrl(
  configuredUrl = process.env.DATABASE_URL,
  projectRoot = process.cwd()
): string {
  const databaseUrl = configuredUrl?.trim() || DEFAULT_DATABASE_URL;

  if (!databaseUrl.startsWith("file:")) {
    throw new Error(
      "Invalid DATABASE_URL. Last Gate AI v0.1 supports SQLite URLs such as file:./data/last-gate.db."
    );
  }

  const configuredPath = databaseUrl.slice("file:".length);
  if (!configuredPath) {
    throw new Error(
      "Invalid DATABASE_URL. Set it to a SQLite file such as file:./data/last-gate.db."
    );
  }

  const absolutePath = path.isAbsolute(configuredPath)
    ? configuredPath
    : path.resolve(projectRoot, configuredPath);

  return `file:${absolutePath}`;
}
