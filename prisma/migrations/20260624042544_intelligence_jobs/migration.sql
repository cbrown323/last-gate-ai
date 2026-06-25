-- CreateTable
CREATE TABLE "IntelligenceJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "currentStep" TEXT,
    "stepResults" JSONB NOT NULL DEFAULT [],
    "error" TEXT,
    "trigger" TEXT NOT NULL DEFAULT 'manual',
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IntelligenceJob_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "IntelligenceJob_applicationId_idx" ON "IntelligenceJob"("applicationId");

-- CreateIndex
CREATE INDEX "IntelligenceJob_status_idx" ON "IntelligenceJob"("status");

-- CreateIndex
CREATE INDEX "IntelligenceJob_createdAt_idx" ON "IntelligenceJob"("createdAt");
