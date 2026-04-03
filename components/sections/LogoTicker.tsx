"use client";

import { clients } from "@/lib/data/clients";

const ITEMS_PER_ROW = Math.ceil(clients.length / 2);
const row1 = clients.slice(0, ITEMS_PER_ROW);
const row2 = clients.slice(ITEMS_PER_ROW);

function ClientItem({ client }: { client: (typeof clients)[0] }) {
  return (
    <div className="flex-shrink-0 flex items-center justify-center px-6 h-12">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/logos/clients/${client.localLogo}`}
        alt={client.name}
        className="h-8 w-auto max-w-[110px] object-contain grayscale opacity-55 hover:opacity-100 hover:grayscale-0 transition-all duration-300"
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
    <section className="py-14 bg-white overflow-hidden border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="text-center">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-2">Trusted by</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-dark">
            Industry Leaders Worldwide
          </h2>
        </div>
      </div>
      <div className="space-y-3">
        <TickerRow items={row1} direction="left" />
        <TickerRow items={row2} direction="right" />
      </div>
    </section>
  );
}
