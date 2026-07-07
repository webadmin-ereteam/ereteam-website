-- CreateTable
CREATE TABLE "StageTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StageTemplate_pkey" PRIMARY KEY ("id")
);

-- Seed the one template that carries every pre-existing stage forward.
INSERT INTO "StageTemplate" (id, name, "isDefault", "createdAt")
VALUES ('default-stage-template', 'Varsayılan', true, CURRENT_TIMESTAMP);

-- AlterTable
ALTER TABLE "StageDefinition" DROP CONSTRAINT IF EXISTS "StageDefinition_key_key";
ALTER TABLE "StageDefinition" ADD COLUMN "stageTemplateId" TEXT;
UPDATE "StageDefinition" SET "stageTemplateId" = 'default-stage-template' WHERE "stageTemplateId" IS NULL;
ALTER TABLE "StageDefinition" ALTER COLUMN "stageTemplateId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "StageDefinition" ADD CONSTRAINT "StageDefinition_stageTemplateId_fkey" FOREIGN KEY ("stageTemplateId") REFERENCES "StageTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "StageDefinition_stageTemplateId_key_key" ON "StageDefinition"("stageTemplateId", "key");
