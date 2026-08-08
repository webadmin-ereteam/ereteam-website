import { prisma } from "@/lib/presales/db";
import type { SparkData } from "./types";

async function verifyApiKey() {
  const apiKey = process.env.AMPLEMARKET_API_KEY;
  if (!apiKey) throw new Error("AMPLEMARKET_API_KEY tanımlı değil");
  const response = await fetch("https://api.amplemarket.com/account-info", {
    headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Amplemarket API: ${response.status}`);
}

export async function fetchAmplemarket(periodStart: Date, periodEnd: Date): Promise<SparkData["leadGeneration"]> {
  await verifyApiKey();
  const events = await prisma.sparkAmplemarketEvent.findMany({
    where: { occurredAt: { gte: periodStart, lte: periodEnd } },
    orderBy: { occurredAt: "desc" },
  });
  const count = (type: string) => events.filter((event) => event.eventType === type).length;
  const sent = events.filter((event) => event.eventType === "sent");
  return {
    sent: sent.length,
    bulk: sent.filter((event) => event.sequenceKind === "bulk").length,
    duo: sent.filter((event) => event.sequenceKind === "duo").length,
    replies: count("reply"),
    positive: count("positive"),
    meetings: events.filter((event) => event.eventType === "meeting").map((event) => ({
      person: event.personName || "İsim belirtilmemiş",
      company: event.companyName || "Şirket belirtilmemiş",
      bookedAt: event.occurredAt.toISOString(),
      owner: event.ownerEmail || undefined,
    })),
  };
}
