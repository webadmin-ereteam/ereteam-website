-- CreateTable
CREATE TABLE "SurveyTemplate" (
    "id" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SurveyTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyTemplateItem" (
    "id" TEXT NOT NULL,
    "surveyTemplateId" TEXT NOT NULL,
    "questionPoolItemId" TEXT NOT NULL,
    "customText" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "SurveyTemplateItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SurveyTemplate" ADD CONSTRAINT "SurveyTemplate_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "StageDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SurveyTemplateItem" ADD CONSTRAINT "SurveyTemplateItem_surveyTemplateId_fkey" FOREIGN KEY ("surveyTemplateId") REFERENCES "SurveyTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SurveyTemplateItem" ADD CONSTRAINT "SurveyTemplateItem_questionPoolItemId_fkey" FOREIGN KEY ("questionPoolItemId") REFERENCES "QuestionPoolItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
