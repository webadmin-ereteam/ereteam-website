"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  children?: readonly NavItem[];
};

type NavGroup = {
  label: string;
  href: string;
  items: readonly NavItem[];
};

const groups: readonly NavGroup[] = [
  {
    label: "Services",
    href: "/services",
    items: [
      { label: "Data, Cloud & AI", href: "/services/data-cloud-ai" },
      { label: "Financial Performance", href: "/services/financial-performance-intelligence" },
      { label: "Marketing Intelligence", href: "/services/marketing-intelligence" },
    ],
  },
  {
    label: "Technologies",
    href: "/products",
    items: [
      {
        label: "Ereteam Products",
        href: "/products",
        children: [
          { label: "Obserian", href: "/products/obserian" },
          { label: "Pharmeta", href: "/products/pharmeta" },
          { label: "Maturytics", href: "/products/maturytics" },
        ],
      },
      { label: "Partners", href: "/partners" },
    ],
  },
  {
    label: "Company",
    href: "/about",
    items: [
      { label: "About Ereteam", href: "/about/company" },
      { label: "Careers", href: "/about/careers" },
    ],
  },
  {
    label: "Insights",
    href: "/use-cases",
    items: [
      { label: "Success Stories", href: "/use-cases" },
      { label: "Ereteam on LinkedIn", href: "/social-media" },
    ],
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const internal = pathname.startsWith("/presales") || pathname.startsWith("/spark");
  const overHero = pathname === "/" && !scrolled && !mobileOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  if (internal) return null;

  const ink = overHero ? "text-white" : "text-brand-dark";

  return (
    <header className={`site-header fixed inset-x-0 top-0 z-50 border-b transition-all duration-500 ${overHero ? "border-white/20 bg-transparent" : "border-[#071A2A]/10 bg-[#f9f7f2]/95 backdrop-blur-xl"}`}>
      <nav className="site-container flex h-[74px] items-center justify-between lg:h-[86px]" aria-label="Primary navigation">
        <Link href="/" className="relative z-50 flex items-center" aria-label="Ereteam home" onClick={() => setMobileOpen(false)}>
          <Image src="/logos/ereteam-logo.png" alt="Ereteam" width={174} height={52} priority className={`h-[66px] w-auto transition ${overHero ? "brightness-0 invert" : ""}`} />
        </Link>

        <div className="hidden h-full items-center lg:flex">
          {groups.map((group) => (
            <div key={group.label} className="group relative flex h-full items-center">
              <Link href={group.href} className={`flex h-full items-center gap-1 px-4 text-[12px] font-semibold uppercase tracking-[.1em] ${ink}`}>
                {group.label}<ChevronDown size={13} className="transition-transform group-hover:rotate-180" />
              </Link>
              <div className="invisible absolute left-0 top-full w-[310px] translate-y-2 border border-[#071A2A]/10 bg-[#f9f7f2] p-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                {group.items.map((item) => (
                  <div key={item.href} className="border-b border-[#071A2A]/10 last:border-0">
                    <Link href={item.href} className="flex items-center px-4 py-4 text-sm text-brand-dark transition-colors hover:bg-[#f3f0e8] hover:text-brand-primary">
                      {item.label}
                    </Link>
                    {item.children && (
                      <div className="mx-4 mb-3 border-l border-[#B96F38]/35 pl-3">
                        {item.children.map((child) => (
                          <Link key={child.href} href={child.href} className="block px-3 py-2 text-[13px] text-text-muted transition-colors hover:bg-[#f3f0e8] hover:text-brand-primary">
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <Link href="/contact" className={`ml-5 inline-flex min-h-11 items-center border px-5 text-[11px] font-bold uppercase tracking-[.12em] transition-colors ${overHero ? "border-white/60 text-white hover:bg-white hover:text-brand-dark" : "border-brand-dark bg-brand-dark text-white hover:bg-[#B96F38] hover:border-[#B96F38]"}`}>Contact</Link>
        </div>

        <button type="button" aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen} onClick={() => setMobileOpen((value) => !value)} className={`relative z-50 flex h-11 w-11 items-center justify-center border lg:hidden ${mobileOpen ? "border-brand-dark text-brand-dark" : overHero ? "border-white/50 text-white" : "border-brand-dark/30 text-brand-dark"}`}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="absolute left-0 right-0 top-full z-40 h-[calc(100dvh-74px)] overflow-y-auto bg-[#f3f0e8] px-4 pb-10 lg:hidden">
          <div className="site-container border-t border-brand-dark/15">
            {groups.map((group) => (
              <div key={group.label} className="border-b border-brand-dark/15">
                <div className="flex items-center">
                  <Link href={group.href} onClick={() => setMobileOpen(false)} className="flex flex-1 items-center py-5 text-xl text-brand-dark">{group.label}</Link>
                  <button type="button" className="h-12 w-12" aria-label={`Toggle ${group.label}`} onClick={() => setOpenGroup(openGroup === group.label ? null : group.label)}><ChevronDown className={`mx-auto transition ${openGroup === group.label ? "rotate-180" : ""}`} /></button>
                </div>
                {openGroup === group.label && (
                  <div className="pb-4 pl-7">
                    {group.items.map((item) => (
                      <div key={item.href} className="border-l border-brand-dark/15 pl-4">
                        <Link href={item.href} onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-brand-dark">{item.label}</Link>
                        {item.children && (
                          <div className="pb-2 pl-4">
                            {item.children.map((child) => (
                              <Link key={child.href} href={child.href} onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-text-muted">{child.label}</Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link href="/contact" onClick={() => setMobileOpen(false)} className="site-button mt-8 w-full">Start a conversation</Link>
          </div>
        </div>
      )}
    </header>
  );
}
