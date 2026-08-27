import Database from "better-sqlite3";
import { copyFile, mkdir, rename, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { loadDatabaseConfig, timestamp } from "./database-utils.mjs";

function validateBackup(backupPath) {
  const backup = new Database(backupPath, { readonly: true, fileMustExist: true });
  try {
    const result = backup.pragma("quick_check", { simple: true });
    if (result !== "ok") {
      throw new Error(`SQLite integrity check failed: ${String(result)}`);
    }
  } finally {
    backup.close();
  }
}

async function main() {
  const argumentsAfterScript = process.argv.slice(2);
  const backupArgument = argumentsAfterScript.find((argument) => !argument.startsWith("--"));
  if (!backupArgument || !argumentsAfterScript.includes("--force")) {
    throw new Error(
      "Usage: npm run db:restore -- <backup.db> --force (stop the app before restoring)."
    );
  }

  const { databasePath, projectRoot } = loadDatabaseConfig();
  const backupPath = path.resolve(projectRoot, backupArgument);
  if (backupPath === path.resolve(databasePath)) {
    throw new Error("Backup source must be different from the live database.");
  }

  validateBackup(backupPath);
  await mkdir(path.dirname(databasePath), { recursive: true });

  const restoreTempPath = `${databasePath}.restore-${process.pid}`;
  const previousPath = `${databasePath}.before-restore-${timestamp()}`;
  await copyFile(backupPath, restoreTempPath);

  let movedCurrentDatabase = false;
  try {
    if (existsSync(databasePath)) {
      await rename(databasePath, previousPath);
      movedCurrentDatabase = true;
    }
    await rename(restoreTempPath, databasePath);
    await rm(`${databasePath}-wal`, { force: true });
    await rm(`${databasePath}-shm`, { force: true });
  } catch (error) {
    await rm(restoreTempPath, { force: true });
    if (movedCurrentDatabase && !existsSync(databasePath)) {
      await rename(previousPath, databasePath);
    }
    throw error;
  }

  console.log(`Database restored from: ${backupPath}`);
  if (movedCurrentDatabase) {
    console.log(`Previous database retained at: ${previousPath}`);
  }
}

main().catch((error) => {
  console.error(`Restore failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
