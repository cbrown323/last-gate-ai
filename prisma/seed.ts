import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../lib/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const removed = await prisma.application.deleteMany({
    where: {
      OR: [
        { name: { contains: "(demo)" } },
        { repoUrl: { contains: "github.com/demo/" } },
      ],
    },
  });

  if (removed.count > 0) {
    console.log(`Removed ${removed.count} legacy demo application(s).`);
  }

  console.log("Seed complete. Register applications at /applications and connect integrations in Settings.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
