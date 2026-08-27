import { copyFile, mkdir, open } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { loadDatabaseConfig } from "./database-utils.mjs";

const projectRoot = process.cwd();

function assertSupportedNode() {
  const [major, minor] = process.versions.node.split(".").map(Number);
  const supported =
    (major === 20 && minor >= 19) ||
    (major === 22 && minor >= 12) ||
    major >= 24;

  if (!supported) {
    throw new Error(
      `Node.js ${process.versions.node} is unsupported. Use Node.js 20.19+, 22.12+, or 24+.`
    );
  }
}

function runNpmScript(name) {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = spawnSync(npmCommand, ["run", name], {
    cwd: projectRoot,
    env: process.env,
    stdio: "inherit",
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`npm run ${name} failed with exit code ${result.status ?? "unknown"}.`);
  }
}

async function main() {
  assertSupportedNode();

  const envLocalPath = path.join(projectRoot, ".env.local");
  if (!existsSync(envLocalPath)) {
    await copyFile(path.join(projectRoot, ".env.example"), envLocalPath);
    console.log("Created .env.local from .env.example.");
  }

  const { databasePath } = loadDatabaseConfig(projectRoot);
  await mkdir(path.dirname(databasePath), { recursive: true });
  const databaseFile = await open(databasePath, "a");
  await databaseFile.close();

  console.log(`Using SQLite database: ${databasePath}`);
  runNpmScript("db:generate");
  runNpmScript("db:deploy");

  if (process.argv.includes("--seed")) {
    runNpmScript("db:seed");
  }

  console.log("Setup complete. Start Last Gate AI with npm run dev.");
}

main().catch((error) => {
  console.error(`Setup failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
