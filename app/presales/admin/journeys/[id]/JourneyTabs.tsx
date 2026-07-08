"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function JourneyTabs({ journeyId }: { journeyId: string }) {
  const pathname = usePathname();
  const base = `/presales/admin/journeys/${journeyId}`;

  const tabs = [
    { href: base, label: "Genel Bakış", active: pathname === base },
    { href: `${base}/stages`, label: "Aşamalar", active: pathname.startsWith(`${base}/stages`) },
    { href: `${base}/surveys`, label: "Anketler", active: pathname.startsWith(`${base}/surveys`) },
    { href: `${base}/documents`, label: "Belgeler", active: pathname.startsWith(`${base}/documents`) },
    { href: `${base}/settings`, label: "Ayarlar", active: pathname.startsWith(`${base}/settings`) },
  ];

  return (
    <div className="mb-6 flex gap-1 rounded-xl bg-gray-100/70 p-1">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            tab.active
              ? "bg-white text-brand-primary shadow-sm"
              : "text-text-muted hover:text-brand-dark"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
