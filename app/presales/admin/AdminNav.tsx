"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserPlus,
  ListOrdered,
  FileStack,
  Users,
  Package,
  KeyRound,
  LogOut,
} from "lucide-react";
import { logoutAdmin } from "@/lib/presales/sessionActions";

const JOURNEY_NAV_ITEMS = [
  { href: "/presales/admin", label: "Kontrol Paneli", icon: LayoutDashboard, exact: true },
  { href: "/presales/admin/prospects/new", label: "Yeni Prospect", icon: UserPlus },
];

const SETTINGS_NAV_ITEMS = [
  { href: "/presales/admin/stages", label: "Aşama Şablonları", icon: ListOrdered },
  { href: "/presales/admin/survey-templates", label: "Anket Şablonları", icon: FileStack },
  { href: "/presales/admin/sales-reps", label: "Satış Ekibi", icon: Users },
  { href: "/presales/admin/products", label: "Ürünler", icon: Package },
  { href: "/presales/admin/account", label: "Giriş Bilgileri", icon: KeyRound },
];

function NavLink({
  href,
  label,
  Icon,
  isActive,
}: {
  href: string;
  label: string;
  Icon: typeof LayoutDashboard;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
        isActive ? "bg-white/[0.08] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" : "text-white/55 hover:bg-white/[0.04] hover:text-white"
      }`}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-gradient-to-b from-brand-primary to-brand-magenta" />
      )}
      <Icon size={16.5} className={isActive ? "text-white" : "text-white/40 group-hover:text-white/70"} />
      {label}
    </Link>
  );
}

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="relative flex w-64 shrink-0 flex-col overflow-hidden bg-brand-dark">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 0%, rgba(26,111,168,0.35) 0, transparent 45%), radial-gradient(circle at 100% 85%, rgba(233,30,140,0.22) 0, transparent 45%)",
        }}
      />
      <div className="pointer-events-none absolute -left-10 top-40 h-52 w-52 rounded-full bg-brand-primary/[0.12] blur-[70px]" />
      <div className="relative flex flex-col items-start gap-2.5 px-6 py-6">
        <Image
          src="/logos/ereteam-logo.png"
          alt="Ereteam"
          width={175}
          height={100}
          className="h-12 w-auto object-contain brightness-0 invert"
          priority
        />
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">Presales Admin</span>
      </div>
      <div className="relative mx-6 mb-2 h-px bg-gradient-to-r from-white/[0.1] via-white/[0.1] to-transparent" />
      <nav className="relative flex-1 space-y-7 px-3 pt-3">
        <div className="space-y-1">
          {JOURNEY_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              Icon={item.icon}
              isActive={item.exact ? pathname === item.href : pathname.startsWith(item.href)}
            />
          ))}
        </div>
        <div>
          <p className="mb-2 px-3 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white/25">
            Ayarlar (Şablonlar)
          </p>
          <div className="space-y-1">
            {SETTINGS_NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                Icon={item.icon}
                isActive={pathname.startsWith(item.href)}
              />
            ))}
          </div>
        </div>
      </nav>
      <form action={logoutAdmin} className="relative px-3 pb-6 pt-3">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/55 transition-all hover:bg-white/[0.04] hover:text-white"
        >
          <LogOut size={16.5} className="text-white/40" />
          Çıkış Yap
        </button>
      </form>
    </aside>
  );
}
