-- AlterTable
ALTER TABLE "SurveyTemplateItem" ADD COLUMN "conditionOnOrder" INTEGER;
ALTER TABLE "SurveyTemplateItem" ADD COLUMN "conditionValues" JSONB;

-- AlterTable
ALTER TABLE "SurveyQuestionSelection" ADD COLUMN "conditionOnOrder" INTEGER;
ALTER TABLE "SurveyQuestionSelection" ADD COLUMN "conditionValues" JSONB;
