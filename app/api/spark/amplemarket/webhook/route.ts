import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/presales/db";
import { Prisma } from "@/lib/generated/prisma/client";

export const dynamic = "force-dynamic";

const safeEqual = (a: string, b: string) => {
  const left = Buffer.from(a); const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};
const string = (value: unknown) => typeof value === "string" ? value : undefined;
const object = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};

export async function POST(request: NextRequest) {
  const configured = process.env.AMPLEMARKET_WEBHOOK_SECRET || process.env.SPARK_CRON_SECRET;
  const supplied = request.nextUrl.searchParams.get("key") || request.headers.get("x-spark-webhook-secret") || "";
  if (!configured || !safeEqual(supplied, configured)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = await request.json() as Record<string, unknown>;
  const emailMessage = object(payload.email_message);
  const stage = object(payload.sequence_stage);
  const sequence = object(payload.sequence);
  const dynamic = object(payload.dynamic_fields ?? payload.lead);
  const tags = Array.isArray(emailMessage.tag) ? emailMessage.tag.map(String) : [];
  const normalizedTags = tags.map((tag: string) => tag.toLowerCase());
  const activityType = string(stage.type)?.toLowerCase();
  const rawType = string(payload.event_type)?.toLowerCase();
  const positive = normalizedTags.includes("interested");
  const meeting = rawType?.includes("meeting") || normalizedTags.some((tag: string) => tag.includes("meeting"));
  const isMessage = ["email", "linkedin_message", "linkedin_voice_message", "linkedin_video_message"].includes(activityType || "");
  const eventType = meeting ? "meeting" : positive ? "positive" : payload.is_reply === true ? "reply" : isMessage ? "sent" : "activity";
  const occurredValue = string(payload.date) || string(emailMessage.date) || string(stage.sending_date) || new Date().toISOString();
  const occurredAt = new Date(occurredValue);
  if (!Number.isFinite(occurredAt.getTime())) return NextResponse.json({ error: "Invalid event date" }, { status: 400 });

  const sequenceName = string(sequence.name);
  const explicitKind = string(sequence.type)?.toLowerCase();
  const sequenceKind = explicitKind === "duo" || sequenceName?.toLowerCase().includes("duo") ? "duo" : eventType === "sent" ? "bulk" : undefined;
  const externalId = string(payload.id) || string(emailMessage.id) || createHash("sha256").update(JSON.stringify(payload)).digest("hex");
  const firstName = string(dynamic.first_name); const lastName = string(dynamic.last_name);

  await prisma.sparkAmplemarketEvent.upsert({
    where: { externalId },
    update: {},
    create: {
      externalId, eventType, sequenceKind, sequenceName,
      ownerEmail: string(object(payload.user).email),
      personName: [firstName, lastName].filter(Boolean).join(" ") || string(dynamic.name),
      companyName: string(dynamic.company_name), occurredAt,
      payload: JSON.parse(JSON.stringify(payload)) as Prisma.InputJsonValue,
    },
  });
  return NextResponse.json({ ok: true });
}
