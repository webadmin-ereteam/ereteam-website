-- Distributed API rate limits shared by all serverless instances.
CREATE TABLE "RateLimitBucket" (
    "key" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("key", "windowStart")
);

CREATE INDEX "RateLimitBucket_expiresAt_idx" ON "RateLimitBucket"("expiresAt");

-- A survey write token serializes draft/final writes before external file I/O.
ALTER TABLE "SurveyInstance"
    ADD COLUMN "responseWriteToken" TEXT,
    ADD COLUMN "responseWriteStartedAt" TIMESTAMP(3),
    ADD COLUMN "exportAttemptedAt" TIMESTAMP(3),
    ADD COLUMN "salesNotificationAttemptedAt" TIMESTAMP(3),
    ADD COLUMN "technicalLeadNotificationAttemptedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "SurveyInstance_responseWriteToken_key"
    ON "SurveyInstance"("responseWriteToken");

-- Associates the single generated Excel archive with its source survey.
ALTER TABLE "Document" ADD COLUMN "surveyExportForId" TEXT;

CREATE UNIQUE INDEX "Document_surveyExportForId_key"
    ON "Document"("surveyExportForId");

ALTER TABLE "Document"
    ADD CONSTRAINT "Document_surveyExportForId_fkey"
    FOREIGN KEY ("surveyExportForId") REFERENCES "SurveyInstance"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Login throttling now uses the atomic RateLimitBucket primitive with separate
-- per-product scopes; the legacy singleton attempt row is retired.
DROP TABLE "AdminLoginAttempt";
