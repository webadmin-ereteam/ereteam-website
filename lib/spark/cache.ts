import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/presales/db";
import { revalidateTag, unstable_cache } from "next/cache";
import { collectSparkData } from "./collector";
import type { SparkData, SparkSourceState } from "./types";

const SNAPSHOT_ID = "current";
type SparkSnapshot = { data: SparkData; sourceState: SparkSourceState };

function parseSnapshot(payload: unknown): SparkSnapshot {
  if (!payload || typeof payload !== "object" || !("data" in payload)) {
    throw new Error("Spark snapshot geçersiz.");
  }
  const snapshot = payload as SparkSnapshot;
  if (!snapshot.data?.generatedAt) throw new Error("Spark snapshot tarihi eksik.");
  return snapshot;
}

const readSparkSnapshot = unstable_cache(async () => {
  const snapshot = await prisma.sparkDashboardSnapshot.findUnique({
    where: { id: SNAPSHOT_ID },
    select: { payload: true },
  });
  if (!snapshot) throw new Error("Spark snapshot henüz oluşturulmadı.");
  return parseSnapshot(snapshot.payload);
}, ["spark-dashboard-snapshot-v1"], { tags: ["spark-dashboard-snapshot"], revalidate: false });

export async function getSparkData() {
  return readSparkSnapshot();
}

export async function refreshSparkData() {
  const snapshot = await collectSparkData();
  await prisma.sparkDashboardSnapshot.upsert({
    where: { id: SNAPSHOT_ID },
    create: {
      id: SNAPSHOT_ID,
      payload: snapshot as unknown as Prisma.InputJsonValue,
      generatedAt: new Date(snapshot.data.generatedAt),
    },
    update: {
      payload: snapshot as unknown as Prisma.InputJsonValue,
      generatedAt: new Date(snapshot.data.generatedAt),
    },
  });
  revalidateTag("spark-dashboard-snapshot");
  return snapshot;
}
