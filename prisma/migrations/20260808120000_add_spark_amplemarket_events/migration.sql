CREATE TABLE "SparkAmplemarketEvent" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "sequenceKind" TEXT,
    "sequenceName" TEXT,
    "ownerEmail" TEXT,
    "personName" TEXT,
    "companyName" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SparkAmplemarketEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SparkAmplemarketEvent_externalId_key" ON "SparkAmplemarketEvent"("externalId");
CREATE INDEX "SparkAmplemarketEvent_occurredAt_idx" ON "SparkAmplemarketEvent"("occurredAt");
CREATE INDEX "SparkAmplemarketEvent_eventType_occurredAt_idx" ON "SparkAmplemarketEvent"("eventType", "occurredAt");
