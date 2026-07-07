-- AlterTable
ALTER TABLE "StageDefinition" ADD COLUMN "surveysEnabled" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Document" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'admin_upload';
ALTER TABLE "Document" ADD COLUMN "surveyResponseId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Document_surveyResponseId_key" ON "Document"("surveyResponseId");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_surveyResponseId_fkey" FOREIGN KEY ("surveyResponseId") REFERENCES "SurveyResponse"("id") ON DELETE SET NULL ON UPDATE CASCADE;
