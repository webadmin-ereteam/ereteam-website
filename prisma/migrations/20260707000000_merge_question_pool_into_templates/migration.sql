-- Merge QuestionPoolItem into SurveyTemplateItem (self-contained templates,
-- no separate question pool), and drop the stage requirement from
-- SurveyTemplate. Also simplify SurveyQuestionSelection to a plain snapshot
-- (text/type/options/required/order) with no FK to a pool item.

-- DropForeignKey
ALTER TABLE "SurveyTemplate" DROP CONSTRAINT IF EXISTS "SurveyTemplate_stageId_fkey";
ALTER TABLE "SurveyTemplateItem" DROP CONSTRAINT IF EXISTS "SurveyTemplateItem_questionPoolItemId_fkey";
ALTER TABLE "SurveyQuestionSelection" DROP CONSTRAINT IF EXISTS "SurveyQuestionSelection_questionPoolItemId_fkey";
ALTER TABLE "QuestionPoolItem" DROP CONSTRAINT IF EXISTS "QuestionPoolItem_stageId_fkey";

-- AlterTable: SurveyTemplate no longer tied to a stage
ALTER TABLE "SurveyTemplate" DROP COLUMN "stageId";

-- AlterTable: SurveyTemplateItem becomes self-contained
ALTER TABLE "SurveyTemplateItem" DROP COLUMN "questionPoolItemId";
ALTER TABLE "SurveyTemplateItem" RENAME COLUMN "customText" TO "text";
ALTER TABLE "SurveyTemplateItem" ALTER COLUMN "text" SET NOT NULL;
ALTER TABLE "SurveyTemplateItem" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'short_text';
ALTER TABLE "SurveyTemplateItem" ADD COLUMN "options" JSONB;
ALTER TABLE "SurveyTemplateItem" ALTER COLUMN "type" DROP DEFAULT;

-- AlterTable: SurveyQuestionSelection becomes a plain snapshot
ALTER TABLE "SurveyQuestionSelection" DROP COLUMN "questionPoolItemId";
ALTER TABLE "SurveyQuestionSelection" RENAME COLUMN "customText" TO "text";
ALTER TABLE "SurveyQuestionSelection" ALTER COLUMN "text" SET NOT NULL;

-- DropTable
DROP TABLE "QuestionPoolItem";
