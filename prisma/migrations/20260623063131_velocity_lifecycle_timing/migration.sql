-- AlterTable
ALTER TABLE "GitMetadata" ADD COLUMN "commitsLast30Days" INTEGER;
ALTER TABLE "GitMetadata" ADD COLUMN "commitsLast7Days" INTEGER;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Application" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'development',
    "repoUrl" TEXT,
    "websiteUrl" TEXT,
    "owner" TEXT,
    "lifecyclePhase" TEXT NOT NULL DEFAULT 'development',
    "workflowType" TEXT NOT NULL DEFAULT 'kanban',
    "ticketPrefix" TEXT,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "doingWipLimit" INTEGER NOT NULL DEFAULT 3,
    "lifecyclePhaseStartedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Application" ("createdAt", "description", "doingWipLimit", "id", "isPinned", "lifecyclePhase", "name", "owner", "repoUrl", "status", "ticketPrefix", "updatedAt", "websiteUrl", "workflowType") SELECT "createdAt", "description", "doingWipLimit", "id", "isPinned", "lifecyclePhase", "name", "owner", "repoUrl", "status", "ticketPrefix", "updatedAt", "websiteUrl", "workflowType" FROM "Application";
DROP TABLE "Application";
ALTER TABLE "new_Application" RENAME TO "Application";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
