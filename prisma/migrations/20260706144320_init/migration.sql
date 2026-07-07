-- CreateTable
CREATE TABLE "Prospect" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prospect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Journey" (
    "id" TEXT NOT NULL,
    "prospectId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "focusStageId" TEXT,
    "proposalRequested" BOOLEAN NOT NULL DEFAULT false,
    "proposalRequestedAt" TIMESTAMP(3),
    "driveFolderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Journey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StageDefinition" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "StageDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JourneyStageProgress" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "enteredAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "JourneyStageProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionPoolItem" (
    "id" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "options" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "QuestionPoolItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyInstance" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "sentAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SurveyInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyQuestionSelection" (
    "id" TEXT NOT NULL,
    "surveyInstanceId" TEXT NOT NULL,
    "questionPoolItemId" TEXT,
    "customText" TEXT,
    "type" TEXT NOT NULL,
    "options" JSONB,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SurveyQuestionSelection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyResponse" (
    "id" TEXT NOT NULL,
    "surveyQuestionSelectionId" TEXT NOT NULL,
    "answerText" TEXT,
    "answerJson" JSONB,
    "respondedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SurveyResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "stageId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "driveFileId" TEXT NOT NULL,
    "driveWebViewLink" TEXT NOT NULL,
    "customerVisible" BOOLEAN NOT NULL DEFAULT true,
    "uploadedBy" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Journey_accessToken_key" ON "Journey"("accessToken");

-- CreateIndex
CREATE UNIQUE INDEX "StageDefinition_key_key" ON "StageDefinition"("key");

-- CreateIndex
CREATE UNIQUE INDEX "JourneyStageProgress_journeyId_stageId_key" ON "JourneyStageProgress"("journeyId", "stageId");

-- CreateIndex
CREATE UNIQUE INDEX "SurveyResponse_surveyQuestionSelectionId_key" ON "SurveyResponse"("surveyQuestionSelectionId");

-- AddForeignKey
ALTER TABLE "Journey" ADD CONSTRAINT "Journey_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "Prospect"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyStageProgress" ADD CONSTRAINT "JourneyStageProgress_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyStageProgress" ADD CONSTRAINT "JourneyStageProgress_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "StageDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionPoolItem" ADD CONSTRAINT "QuestionPoolItem_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "StageDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyInstance" ADD CONSTRAINT "SurveyInstance_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyInstance" ADD CONSTRAINT "SurveyInstance_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "StageDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyQuestionSelection" ADD CONSTRAINT "SurveyQuestionSelection_surveyInstanceId_fkey" FOREIGN KEY ("surveyInstanceId") REFERENCES "SurveyInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyQuestionSelection" ADD CONSTRAINT "SurveyQuestionSelection_questionPoolItemId_fkey" FOREIGN KEY ("questionPoolItemId") REFERENCES "QuestionPoolItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_surveyQuestionSelectionId_fkey" FOREIGN KEY ("surveyQuestionSelectionId") REFERENCES "SurveyQuestionSelection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
