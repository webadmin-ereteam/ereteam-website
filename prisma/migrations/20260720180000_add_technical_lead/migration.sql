-- CreateTable
CREATE TABLE "TechnicalLead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "title" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TechnicalLead_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Journey" ADD COLUMN "technicalLeadId" TEXT;

-- AddForeignKey
ALTER TABLE "Journey" ADD CONSTRAINT "Journey_technicalLeadId_fkey" FOREIGN KEY ("technicalLeadId") REFERENCES "TechnicalLead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
