import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/presales/db";
import { revalidateTag, unstable_cache } from "next/cache";
import { collectSparkCurrentAndPlanning } from "./collector";
import type { SparkData, SparkSourceState } from "./types";

const CURRENT_SNAPSHOT_ID = "current";
const SNAPSHOT_TAG = "spark-dashboard-snapshot";
const SNAPSHOT_WRITE_LOCK = 20260919;
type SparkSnapshot = { data: SparkData; sourceState: SparkSourceState };

function parseSnapshot(payload: unknown): SparkSnapshot {
  if (!payload || typeof payload !== "object" || !("data" in payload)) {
    throw new Error("Spark snapshot geçersiz.");
  }
  const snapshot = payload as SparkSnapshot;
  if (!snapshot.data?.generatedAt) throw new Error("Spark snapshot tarihi eksik.");
  return snapshot;
}

const snapshotYear = (snapshot: SparkSnapshot) => Number(snapshot.data.reportDate?.slice(0, 4));
const annualSnapshotId = (year: number) => `year:${year}`;

const readSparkSnapshot = unstable_cache(async (id: string) => {
  const snapshot = await prisma.sparkDashboardSnapshot.findUnique({
    where: { id },
    select: { payload: true },
  });
  if (!snapshot) throw new Error("Spark snapshot henüz oluşturulmadı.");
  const parsed = parseSnapshot(snapshot.payload);
  if (id.startsWith("year:") && annualSnapshotId(snapshotYear(parsed)) !== id) {
    throw new Error("Spark yıllık snapshot kaydı geçersiz.");
  }
  return parsed;
}, ["spark-dashboard-snapshot-v2"], { tags: [SNAPSHOT_TAG], revalidate: false });

const readSparkYears = unstable_cache(async () => {
  const snapshots = await prisma.sparkDashboardSnapshot.findMany({
    where: { OR: [{ id: CURRENT_SNAPSHOT_ID }, { id: { startsWith: "year:" } }] },
    select: { id: true, payload: true },
  });
  const years = new Set<number>();
  snapshots.forEach((row) => {
    try {
      const year = snapshotYear(parseSnapshot(row.payload));
      if (Number.isInteger(year) && year >= 2000 && year <= 2100) {
        if (row.id === CURRENT_SNAPSHOT_ID || row.id === annualSnapshotId(year)) years.add(year);
      }
    } catch {
      // Ignore malformed annual rows while keeping valid reports available.
    }
  });
  return Array.from(years).sort((left, right) => right - left);
}, ["spark-dashboard-years-v1"], { tags: [SNAPSHOT_TAG], revalidate: false });

export async function getSparkData(year?: number) {
  if (year == null) return readSparkSnapshot(CURRENT_SNAPSHOT_ID);
  if (!Number.isInteger(year) || year < 2000 || year > 2100) throw new Error("Geçersiz rapor yılı.");
  try {
    return await readSparkSnapshot(annualSnapshotId(year));
  } catch (error) {
    const current = await readSparkSnapshot(CURRENT_SNAPSHOT_ID);
    if (snapshotYear(current) === year) return current;
    throw error;
  }
}

export async function getSparkYears() {
  return readSparkYears();
}

const REFRESH_LEASE_SECONDS = 10 * 60;

async function acquireRefreshLease() {
  const rows = await prisma.$queryRaw<Array<{ id: string }>>`
    INSERT INTO "SparkDashboardSnapshot" ("id", "payload", "generatedAt", "updatedAt")
    VALUES ('refresh-lease', '{}'::jsonb, now(), now())
    ON CONFLICT ("id") DO UPDATE SET "generatedAt" = now(), "updatedAt" = now()
    WHERE "SparkDashboardSnapshot"."generatedAt" < now() - make_interval(secs => ${REFRESH_LEASE_SECONDS})
    RETURNING "id"`;
  return rows.length > 0;
}

export async function refreshSparkData() {
  if (!(await acquireRefreshLease())) {
    throw new Error("Spark veri yenilemesi zaten sürüyor; birkaç dakika sonra tekrar deneyin.");
  }
  const snapshots = await collectSparkCurrentAndPlanning();
  const snapshot = snapshots.current;
  const generatedAt = new Date(snapshot.data.generatedAt);
  await prisma.$transaction(async (transaction) => {
    await transaction.$queryRaw`SELECT pg_advisory_xact_lock(${SNAPSHOT_WRITE_LOCK})::text AS locked`;
    const current = await transaction.sparkDashboardSnapshot.findUnique({
      where: { id: CURRENT_SNAPSHOT_ID },
      select: { generatedAt: true },
    });
    if (current && current.generatedAt >= generatedAt) return;

    const currentPayload = snapshot as unknown as Prisma.InputJsonValue;
    await transaction.sparkDashboardSnapshot.upsert({
      where: { id: CURRENT_SNAPSHOT_ID },
      create: { id: CURRENT_SNAPSHOT_ID, payload: currentPayload, generatedAt },
      update: { payload: currentPayload, generatedAt },
    });

    for (const annualSnapshot of [snapshots.current, snapshots.planning]) {
      const year = snapshotYear(annualSnapshot);
      if (!Number.isInteger(year)) throw new Error("Spark rapor yılı belirlenemedi.");
      const annualId = annualSnapshotId(year);
      const annualGeneratedAt = new Date(annualSnapshot.data.generatedAt);
      const annual = await transaction.sparkDashboardSnapshot.findUnique({
        where: { id: annualId },
        select: { generatedAt: true },
      });
      if (!annual || annual.generatedAt < annualGeneratedAt) {
        const annualPayload = annualSnapshot as unknown as Prisma.InputJsonValue;
        await transaction.sparkDashboardSnapshot.upsert({
          where: { id: annualId },
          create: { id: annualId, payload: annualPayload, generatedAt: annualGeneratedAt },
          update: { payload: annualPayload, generatedAt: annualGeneratedAt },
        });
      }
    }
  });
  revalidateTag(SNAPSHOT_TAG);
  const stored = await prisma.sparkDashboardSnapshot.findUnique({
    where: { id: CURRENT_SNAPSHOT_ID },
    select: { payload: true },
  });
  return stored ? parseSnapshot(stored.payload) : snapshot;
}
