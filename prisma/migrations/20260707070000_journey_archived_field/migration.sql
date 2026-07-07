-- Decouple archiving from Journey.status: archiving is now an independent flag,
-- since a journey can be archived while still won/lost/etc.
ALTER TABLE "Journey" ADD COLUMN "archived" BOOLEAN NOT NULL DEFAULT false;

-- Migrate any journeys that were previously archived via status="archived":
-- mark them archived and fall back their status to "active" since the prior
-- won/lost/paused value was already overwritten under the old design.
UPDATE "Journey" SET "archived" = true, "status" = 'active' WHERE "status" = 'archived';
