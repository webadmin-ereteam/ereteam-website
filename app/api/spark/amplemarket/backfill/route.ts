import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/presales/db";
import { verifySessionToken } from "@/lib/presales/session";
import { refreshSparkData } from "@/lib/spark/cache";

export const dynamic = "force-dynamic";

type BackfillRow = {
  date: string;
  owner: string;
  kind: "bulk" | "duo";
  sent: number;
  replies: number;
  positive: number;
};

const safeEqual = (leftValue: string, rightValue: string) => {
  const left = Buffer.from(leftValue);
  const right = Buffer.from(rightValue);
  return left.length === right.length && timingSafeEqual(left, right);
};

const validCount = (value: unknown) => Number.isInteger(value) && Number(value) >= 0 && Number(value) <= 20_000;

export async function POST(request: NextRequest) {
  const configured = process.env.AMPLEMARKET_WEBHOOK_SECRET;
  const supplied = request.nextUrl.searchParams.get("key") || request.headers.get("x-spark-webhook-secret") || "";
  const validSecret = Boolean(configured && supplied && safeEqual(supplied, configured));
  const validSession = await verifySessionToken(request.cookies.get("spark_session")?.value);
  if (!validSecret && !validSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { rows?: BackfillRow[] };
  if (request.headers.get("content-type")?.includes("application/x-www-form-urlencoded")) {
    const form = await request.formData();
    try {
      body = { rows: JSON.parse(String(form.get("rows") || "[]")) as BackfillRow[] };
    } catch {
      return NextResponse.json({ error: "Invalid rows JSON" }, { status: 400 });
    }
  } else {
    body = await request.json() as { rows?: BackfillRow[] };
  }
  if (!Array.isArray(body.rows) || body.rows.length > 500) return NextResponse.json({ error: "Invalid rows" }, { status: 400 });

  const records: Prisma.SparkAmplemarketEventCreateManyInput[] = [];
  const coveredDates = new Set<string>();
  for (const row of body.rows) {
    const occurredAt = new Date(`${row.date}T12:00:00+03:00`);
    if (!Number.isFinite(occurredAt.getTime()) || !row.owner || !["bulk", "duo"].includes(row.kind) || !validCount(row.sent) || !validCount(row.replies) || !validCount(row.positive)) {
      return NextResponse.json({ error: "Invalid backfill row" }, { status: 400 });
    }
    coveredDates.add(row.date);
    const payload = { source: "amplemarket-mcp-backfill", date: row.date, owner: row.owner, kind: row.kind } as Prisma.InputJsonValue;
    for (const [eventType, count] of [["sent", row.sent], ["reply", row.replies], ["positive", row.positive]] as const) {
      for (let index = 0; index < count; index += 1) {
        records.push({
          externalId: `mcp-backfill:${row.date}:${row.owner}:${row.kind}:${eventType}:${index}`,
          eventType,
          sequenceKind: row.kind,
          sequenceName: row.kind === "duo" ? "Duo" : "Toplu sequence",
          ownerEmail: row.owner,
          occurredAt,
          payload,
        });
      }
    }
  }

  for (const date of Array.from(coveredDates)) {
    records.push({
      externalId: `mcp-backfill:${date}:analytics-coverage`,
      eventType: "analytics_coverage",
      sequenceName: "Amplemarket Analytics",
      occurredAt: new Date(`${date}T12:00:00+03:00`),
      payload: { source: "amplemarket-analytics-snapshot", date } as Prisma.InputJsonValue,
    });
  }

  const dates = Array.from(coveredDates);
  const result = records.length
    ? await prisma.$transaction(async (tx) => {
      await tx.sparkAmplemarketEvent.deleteMany({
        where: { OR: dates.map((date) => ({ externalId: { startsWith: `mcp-backfill:${date}:` } })) },
      });
      return tx.sparkAmplemarketEvent.createMany({ data: records, skipDuplicates: true });
    })
    : { count: 0 };
  const dashboard = await refreshSparkData();
  return NextResponse.json({
    ok: true,
    inserted: result.count,
    submitted: records.length,
    dashboardGeneratedAt: dashboard.data.generatedAt,
  });
}
