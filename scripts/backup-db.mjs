import Database from "better-sqlite3";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import {
  assertDatabaseExists,
  loadDatabaseConfig,
  timestamp,
} from "./database-utils.mjs";

async function main() {
  const { databasePath, projectRoot } = loadDatabaseConfig();
  assertDatabaseExists(databasePath);

  const requestedPath = process.argv[2];
  const backupPath = requestedPath
    ? path.resolve(projectRoot, requestedPath)
    : path.join(projectRoot, "backups", `last-gate-${timestamp()}.db`);

  if (path.resolve(backupPath) === path.resolve(databasePath)) {
    throw new Error("Backup destination must be different from the live database.");
  }
  if (existsSync(backupPath)) {
    throw new Error(`Backup destination already exists: ${backupPath}`);
  }

  await mkdir(path.dirname(backupPath), { recursive: true });
  const database = new Database(databasePath, { fileMustExist: true });

  try {
    await database.backup(backupPath);
  } finally {
    database.close();
  }

  console.log(`Database backup created: ${backupPath}`);
}

main().catch((error) => {
  console.error(`Backup failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
