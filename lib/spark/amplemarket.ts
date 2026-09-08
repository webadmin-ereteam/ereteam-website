import { prisma } from "@/lib/presales/db";
import type { SparkData } from "./types";
import { amplemarketOwnerName } from "./amplemarketEvent";

export async function fetchAmplemarket(periodStart: Date, periodEnd: Date): Promise<SparkData["leadGeneration"]> {
  const events = await prisma.sparkAmplemarketEvent.findMany({
    where: {
      eventType: "meeting",
      occurredAt: { gte: periodStart, lte: periodEnd },
    },
    orderBy: { occurredAt: "desc" },
  });
  return {
    meetings: events.map((event) => ({
      person: event.personName || "İsim belirtilmemiş",
      company: event.companyName || "Şirket belirtilmemiş",
      bookedAt: event.occurredAt.toISOString(),
      owner: amplemarketOwnerName(event.payload, event.ownerEmail),
    })),
  };
}
