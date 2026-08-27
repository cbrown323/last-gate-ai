import { config } from "dotenv";
import { defineConfig } from "prisma/config";
import { resolveDatabaseUrl } from "./lib/database-url";

// Match Next.js precedence: shell variables, then .env.local, then .env.
config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: resolveDatabaseUrl(),
  },
});
