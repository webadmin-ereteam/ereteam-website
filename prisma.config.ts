// Prisma CLI configuration. The datasource URL itself lives in the schema's
// datasource block (env("DATABASE_URL")); `dotenv/config` here makes the CLI
// see local .env values, since a detected config file disables the CLI's own
// environment-variable loading.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  earlyAccess: true,
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
});
