-- Per-stage message shown to the customer only while the ball is in our
-- court (current stage, nothing pending on their side) — distinct from
-- customerDescription, which is a general blurb always shown for the stage.
ALTER TABLE "StageDefinition" ADD COLUMN "customerWaitingMessage" TEXT;
ALTER TABLE "JourneyStage" ADD COLUMN "customerWaitingMessage" TEXT;
