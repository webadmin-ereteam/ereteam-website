import { notFound } from "next/navigation";
import { prisma } from "@/lib/presales/db";
import { Badge } from "../../../_components/ui";
import { isJourneyLinkActive } from "@/lib/presales/journeyLink";
import { JOURNEY_STATUS_LABELS } from "@/lib/presales/journeyStatus";
import JourneyTabs from "./JourneyTabs";

const OUTCOME_BADGE: Record<string, "blue" | "green" | "gray" | "amber"> = {
  active: "blue",
  won: "green",
  lost: "gray",
  paused: "amber",
};

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default async function JourneyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const journey = await prisma.journey.findUnique({
    where: { id: params.id },
    include: { prospect: true },
  });

  if (!journey) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between rounded-2xl border border-gray-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-primary to-brand-magenta text-sm font-semibold text-white shadow-sm shadow-brand-primary/20">
            {initials(journey!.prospect.companyName)}
          </span>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold tracking-tight text-brand-dark">{journey!.prospect.companyName}</h1>
              <Badge color={OUTCOME_BADGE[journey!.status] ?? "gray"}>
                {JOURNEY_STATUS_LABELS[journey!.status] ?? journey!.status}
              </Badge>
              {journey!.archived && <Badge color="gray">Arşivlendi</Badge>}
            </div>
            <p className="mt-0.5 text-sm text-text-muted">
              {journey!.prospect.contactName} · {journey!.prospect.contactEmail}
            </p>
            <p className="mt-1 text-xs text-text-muted/70">Drive klasörü: {journey!.name}</p>
          </div>
        </div>
        <div className="rounded-xl bg-gray-50 px-4 py-2.5 text-right ring-1 ring-inset ring-gray-100">
          <div className="mb-0.5 flex items-center justify-end gap-1.5">
            <p className="text-[10.5px] font-semibold uppercase tracking-wide text-text-muted">Müşteri Linki</p>
            <Badge color={isJourneyLinkActive(journey!) ? "green" : "gray"}>
              {isJourneyLinkActive(journey!) ? "Aktif" : "Pasif"}
            </Badge>
          </div>
          <code className="text-xs text-brand-primary">/presales/j/{journey!.accessToken}</code>
        </div>
      </div>

      <JourneyTabs journeyId={params.id} />

      {children}
    </div>
  );
}
