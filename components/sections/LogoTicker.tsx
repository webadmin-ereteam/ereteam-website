"use client";

import { clients } from "@/lib/data/clients";

const ITEMS_PER_ROW = Math.ceil(clients.length / 2);
const row1 = clients.slice(0, ITEMS_PER_ROW);
const row2 = clients.slice(ITEMS_PER_ROW);

function ClientItem({ client }: { client: (typeof clients)[0] }) {
  return (
    <div className="flex h-16 flex-shrink-0 items-center justify-center border-r border-[#071A2A]/10 px-9">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/logos/clients/${client.localLogo}`}
        alt={client.name}
        className="h-8 w-auto max-w-[120px] object-contain grayscale opacity-50 transition-all duration-300 hover:grayscale-0 hover:opacity-100"
      />
    </div>
  );
}

function TickerRow({ items, direction }: { items: typeof clients; direction: "left" | "right" }) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden">
      <div
        className={direction === "left" ? "flex animate-ticker-left" : "flex animate-ticker-right"}
        style={{ width: "max-content" }}
      >
        {doubled.map((client, i) => (
          <ClientItem key={`${client.name}-${i}`} client={client} />
        ))}
      </div>
    </div>
  );
}

export default function LogoTicker() {
  return (
    <section className="overflow-hidden border-y border-[#071A2A]/15 bg-[#f3f0e8] py-16 lg:py-20">
      <div className="site-container mb-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><span className="site-kicker">Long-term trust</span><h2 className="site-display mt-4 text-4xl text-brand-dark sm:text-5xl">Trusted by enterprise leaders.</h2></div>
          <p className="max-w-sm text-xs leading-6 text-text-muted">Across finance, telecom, pharmaceuticals, retail, manufacturing and the public sector.</p>
        </div>
      </div>
      <div className="space-y-3">
        <TickerRow items={row1} direction="left" />
        <TickerRow items={row2} direction="right" />
      </div>
    </section>
  );
}
