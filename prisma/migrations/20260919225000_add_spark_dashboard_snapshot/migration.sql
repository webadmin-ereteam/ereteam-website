CREATE TABLE "SparkDashboardSnapshot" (
    "id" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SparkDashboardSnapshot_pkey" PRIMARY KEY ("id")
);
