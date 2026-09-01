import { prisma } from "@/lib/presales/db";
import type { SparkData } from "./types";
import {
  amplemarketOwnerEmail,
  amplemarketOwnerName,
  amplemarketSequenceKind,
  isAmplemarketAnalyticsBackfill,
} from "./amplemarketEvent";
import { reportDateKey } from "./time";

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
  const coveredSentDates = new Set(events
    .filter((event) => event.eventType === "analytics_coverage" || (event.eventType === "sent" && isAmplemarketAnalyticsBackfill(event.payload)))
    .map((event) => reportDateKey(event.occurredAt)));
  const sent = events.filter((event) => event.eventType === "sent")
    .filter((event) => isAmplemarketAnalyticsBackfill(event.payload) || !coveredSentDates.has(reportDateKey(event.occurredAt)))
    .map((event) => ({
      ...event,
      resolvedOwnerEmail: amplemarketOwnerEmail(event.payload, event.ownerEmail),
      resolvedOwnerName: amplemarketOwnerName(event.payload, event.ownerEmail),
      resolvedKind: amplemarketSequenceKind(event.payload, event.sequenceName)
        || (isAmplemarketAnalyticsBackfill(event.payload) && (event.sequenceKind === "duo" || event.sequenceKind === "bulk") ? event.sequenceKind : undefined),
    }));
  const ownerKeys = Array.from(new Set(sent.map((event) => event.resolvedOwnerEmail || event.resolvedOwnerName)));
  const owners = ownerKeys
    .map((ownerKey) => {
      const ownerEvents = sent.filter((event) => (event.resolvedOwnerEmail || event.resolvedOwnerName) === ownerKey);
      const bulk = ownerEvents.filter((event) => event.resolvedKind === "bulk").length;
      const duo = ownerEvents.filter((event) => event.resolvedKind === "duo").length;
      return { owner: ownerEvents[0]?.resolvedOwnerName || "Owner belirtilmemiş", bulk, duo, total: ownerEvents.length };
    })
    .sort((a, b) => b.total - a.total || a.owner.localeCompare(b.owner, "tr"));
  return {
    sent: sent.length,
    bulk: sent.filter((event) => event.resolvedKind === "bulk").length,
    duo: sent.filter((event) => event.resolvedKind === "duo").length,
    replies: count("reply"),
    positive: count("positive"),
    owners,
    meetings: events.filter((event) => event.eventType === "meeting").map((event) => ({
      person: event.personName || "İsim belirtilmemiş",
      company: event.companyName || "Şirket belirtilmemiş",
      bookedAt: event.occurredAt.toISOString(),
      owner: amplemarketOwnerName(event.payload, event.ownerEmail),
    })),
  };
}
