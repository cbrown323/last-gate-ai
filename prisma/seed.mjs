import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";
import { loadDatabaseConfig } from "../scripts/database-utils.mjs";

const { databasePath } = loadDatabaseConfig();
const database = new Database(databasePath, { fileMustExist: true });

function main() {
  const starterName = "Welcome to Last Gate AI (starter)";
  const existing = database
    .prepare('SELECT "id" FROM "Application" WHERE "name" = ? LIMIT 1')
    .get(starterName);

  if (existing) {
    console.log("Starter data already exists; nothing to add.");
    return;
  }

  const now = new Date().toISOString();
  database
    .prepare(
      `INSERT INTO "Application"
        ("id", "name", "description", "status", "lifecyclePhase", "createdAt", "updatedAt")
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      randomUUID(),
      starterName,
      "A safe starter record. Delete it when you are ready to import your own repositories.",
      "development",
      "planning",
      now,
      now
    );

  console.log("Starter application created.");
}

try {
  main();
} catch (error) {
    console.error(error);
    process.exitCode = 1;
} finally {
  database.close();
}
