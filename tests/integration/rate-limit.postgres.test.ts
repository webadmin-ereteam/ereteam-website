import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { consumeRateLimitBucket } from "@/lib/rateLimit";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

describe.skipIf(!testDatabaseUrl)("PostgreSQL rate limiter", () => {
  let database: PrismaClient;

  beforeAll(async () => {
    if (testDatabaseUrl === process.env.DATABASE_URL) {
      throw new Error("TEST_DATABASE_URL must not point to the normal application database");
    }
    database = new PrismaClient({ adapter: new PrismaPg({ connectionString: testDatabaseUrl }) });
    await database.$connect();
  });

  afterAll(async () => {
    await database?.$disconnect();
  });

  it("atomically enforces one limit across concurrent consumers", async () => {
    const key = `integration:${crypto.randomUUID()}`;
    const results = await Promise.all(
      Array.from({ length: 10 }, () => consumeRateLimitBucket(database, key, 5, 60_000)),
    );
    expect(results.filter((result) => result.allowed)).toHaveLength(5);
    await database.rateLimitBucket.deleteMany({ where: { key } });
  });
});
