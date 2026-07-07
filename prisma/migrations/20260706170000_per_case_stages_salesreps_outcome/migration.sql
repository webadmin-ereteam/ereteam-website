-- CreateTable
CREATE TABLE "SalesRep" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "title" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SalesRep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JourneyStage" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "sourceStageDefinitionId" TEXT,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "customerDescription" TEXT,
    "customerVisible" BOOLEAN NOT NULL DEFAULT true,
    "surveysEnabled" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "enteredAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    CONSTRAINT "JourneyStage_pkey" PRIMARY KEY ("id")
);

-- AlterTable: Journey
ALTER TABLE "Journey" ADD COLUMN "outcomeReason" TEXT;
ALTER TABLE "Journey" ADD COLUMN "outcomeSetAt" TIMESTAMP(3);
ALTER TABLE "Journey" ADD COLUMN "salesRepId" TEXT;

-- DropTable
DROP TABLE IF EXISTS "JourneyStageProgress";

-- AlterTable: SurveyInstance.stageId now targets JourneyStage instead of StageDefinition
ALTER TABLE "SurveyInstance" DROP CONSTRAINT IF EXISTS "SurveyInstance_stageId_fkey";

-- AlterTable: Document.stageId now targets JourneyStage instead of StageDefinition
ALTER TABLE "Document" DROP CONSTRAINT IF EXISTS "Document_stageId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "JourneyStage_journeyId_key_key" ON "JourneyStage"("journeyId", "key");

-- AddForeignKey
ALTER TABLE "Journey" ADD CONSTRAINT "Journey_salesRepId_fkey" FOREIGN KEY ("salesRepId") REFERENCES "SalesRep"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "JourneyStage" ADD CONSTRAINT "JourneyStage_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "JourneyStage" ADD CONSTRAINT "JourneyStage_sourceStageDefinitionId_fkey" FOREIGN KEY ("sourceStageDefinitionId") REFERENCES "StageDefinition"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SurveyInstance" ADD CONSTRAINT "SurveyInstance_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "JourneyStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Document" ADD CONSTRAINT "Document_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "JourneyStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
