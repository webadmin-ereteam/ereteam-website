import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { partners } from "@/lib/homeData";

export default function PartnersSection() {
  return (
    <section className="bg-[#f9f7f2] py-24 lg:py-32">
      <div className="site-container">
        <div className="grid gap-8 lg:grid-cols-[.75fr_1.25fr]">
          <div className="lg:pr-12">
            <span className="site-kicker">Technology ecosystem</span>
            <h2 className="site-display mt-6 text-5xl text-brand-dark sm:text-6xl">The right platform. Applied with depth.</h2>
            <p className="mt-7 max-w-md text-sm leading-7 text-text-muted">We pair independent advice with long-standing expertise across the technologies shaping enterprise analytics.</p>
            <Link href="/partners" className="mt-8 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.12em]">Meet our partners <ArrowUpRight size={15} /></Link>
          </div>
          <div className="mt-5 grid grid-cols-2 border-l border-t border-[#071A2A]/15 sm:grid-cols-3 lg:mt-0">
            {partners.map((partner) => (
              <div key={partner.name} className="flex min-h-32 items-center justify-center border-b border-r border-[#071A2A]/15 bg-white/50 p-6 lg:min-h-40">
                <div className="relative h-14 w-full">
                  <Image src={partner.logo} alt={partner.name} fill sizes="180px" className="object-contain grayscale opacity-65 transition duration-300 hover:grayscale-0 hover:opacity-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
