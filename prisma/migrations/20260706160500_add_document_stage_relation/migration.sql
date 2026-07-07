-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "StageDefinition"("id") ON DELETE SET NULL ON UPDATE CASCADE;
