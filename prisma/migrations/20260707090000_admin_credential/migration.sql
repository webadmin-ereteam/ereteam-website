-- Singleton table for the shared admin Basic-Auth login, editable from the
-- admin panel. No row yet -> falls back to ADMIN_BASIC_USER/ADMIN_BASIC_PASS.
CREATE TABLE "AdminCredential" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminCredential_pkey" PRIMARY KEY ("id")
);
