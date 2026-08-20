"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

const columns = [
  { title: "Expertise", links: [["Data, Cloud & AI", "/services/data-cloud-ai"], ["Financial Performance", "/services/financial-performance-intelligence"], ["Marketing Intelligence", "/services/marketing-intelligence"]] },
  { title: "Products", links: [["Obserian", "/products/obserian"], ["Pharmeta", "/products/pharmeta"], ["Maturytics", "/products/maturytics"]] },
  { title: "Company", links: [["About", "/about/company"], ["Partners", "/partners"], ["Careers", "/about/careers"], ["Contact", "/contact"]] },
  { title: "Resources", links: [["Success Stories", "/use-cases"], ["Blog", "/blog"], ["News", "/news"], ["Privacy", "/privacy-policy"]] },
] as const;

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/presales") || pathname.startsWith("/spark")) return null;

  return (
    <footer className="border-t border-white/15 bg-[#071A2A] text-white">
      <div className="site-container py-16 lg:py-24">
        <div className="grid gap-14 border-b border-white/15 pb-16 lg:grid-cols-[1.35fr_1fr] lg:pb-24">
          <div>
            <span className="site-kicker">Ereteam since 2001</span>
            <p className="site-display mt-7 max-w-2xl text-4xl text-white sm:text-5xl lg:text-6xl">Where experience meets what&apos;s next.</p>
          </div>
          <div className="flex flex-col items-start justify-end lg:items-end">
            <p className="mb-7 max-w-md text-sm leading-7 text-white/65 lg:text-right">For 25 years, we have helped enterprise leaders turn complex data into clear decisions, resilient systems and measurable performance.</p>
            <Link href="/contact" className="site-button site-button--light">Start a conversation <ArrowUpRight size={16} /></Link>
          </div>
        </div>

        <div className="grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.15fr_repeat(4,minmax(0,1fr))] lg:gap-9">
          <div>
            <Image src="/logos/ereteam-logo.png" alt="Ereteam" width={176} height={52} className="h-[70px] w-auto brightness-0 invert" />
            <p className="mt-4 max-w-xs text-xs leading-6 text-white/50">New Jersey, USA · Istanbul, Türkiye<br />25 years of enterprise data and analytics expertise.</p>
          </div>
          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="mb-5 text-[10px] font-bold uppercase tracking-[.2em] text-[#D69A6E]">{column.title}</h2>
              <ul className="space-y-3">
                {column.links.map(([label, href]) => <li key={href}><Link href={href} className="text-sm text-white/65 transition-colors hover:text-white">{label}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-white/15 pt-7 text-[11px] text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Ereteam. All rights reserved.</p>
          <a href="https://www.linkedin.com/company/ereteam" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-white/60 hover:text-white">LinkedIn <ArrowUpRight size={12} /></a>
        </div>
      </div>
    </footer>
  );
}
