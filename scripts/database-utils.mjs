import { config } from "dotenv";
import { existsSync } from "node:fs";
import path from "node:path";

export const DEFAULT_DATABASE_URL = "file:./data/last-gate.db";

export function loadDatabaseConfig(projectRoot = process.cwd()) {
  config({ path: path.join(projectRoot, ".env.local"), quiet: true });
  config({ path: path.join(projectRoot, ".env"), quiet: true });

  const configuredUrl = process.env.DATABASE_URL?.trim() || DEFAULT_DATABASE_URL;
  if (!configuredUrl.startsWith("file:")) {
    throw new Error(
      "Invalid DATABASE_URL. Last Gate AI v0.1 supports SQLite URLs such as file:./data/last-gate.db."
    );
  }

  const configuredPath = configuredUrl.slice("file:".length);
  if (!configuredPath) {
    throw new Error(
      "Invalid DATABASE_URL. Set it to a SQLite file such as file:./data/last-gate.db."
    );
  }

  const databasePath = path.isAbsolute(configuredPath)
    ? configuredPath
    : path.resolve(projectRoot, configuredPath);

  return {
    databasePath,
    databaseUrl: `file:${databasePath}`,
    projectRoot,
  };
}

export function assertDatabaseExists(databasePath) {
  if (!existsSync(databasePath)) {
    throw new Error(
      `Database not found at ${databasePath}. Run npm run setup before using this command.`
    );
  }
}

export function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}
