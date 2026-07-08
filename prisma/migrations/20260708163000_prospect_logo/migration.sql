-- Company logo for the customer-facing journey page, stored in Drive in a
-- dedicated "_Logolar" folder (not tied to any one journey's documents).
ALTER TABLE "Prospect" ADD COLUMN "logoDriveFileId" TEXT;
ALTER TABLE "Prospect" ADD COLUMN "logoUrl" TEXT;
