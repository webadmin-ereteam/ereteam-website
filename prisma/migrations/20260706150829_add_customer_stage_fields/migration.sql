-- AlterTable
ALTER TABLE "StageDefinition" ADD COLUMN     "customerDescription" TEXT,
ADD COLUMN     "customerVisible" BOOLEAN NOT NULL DEFAULT true;
