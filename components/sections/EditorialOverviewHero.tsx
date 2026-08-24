import Link from "next/link";
import { ArrowLeft, type LucideIcon } from "lucide-react";

type EditorialOverviewHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  railLabel: string;
  railText: string;
  icon: LucideIcon;
  backHref?: string;
  backLabel?: string;
};

export default function EditorialOverviewHero({
  eyebrow,
  title,
  description,
  railLabel,
  railText,
  icon: Icon,
  backHref,
  backLabel,
}: EditorialOverviewHeroProps) {
  return (
    <section className="site-overview-hero relative isolate overflow-hidden bg-[#071A2A] text-white">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-80"
        style={{
          background:
            "radial-gradient(circle at 82% 18%, rgba(34, 126, 164, .2), transparent 28%), linear-gradient(115deg, transparent 48%, rgba(255,255,255,.025) 48%, rgba(255,255,255,.025) 49%, transparent 49%)",
        }}
        aria-hidden="true"
      />

      <div className="site-container grid w-full items-center gap-12 lg:grid-cols-[1.25fr_.75fr] lg:gap-16">
        <div className="max-w-4xl">
          {backHref && backLabel ? (
            <Link
              href={backHref}
              className="mb-8 flex w-fit items-center gap-2 text-sm text-white/55 transition-colors hover:text-white"
            >
              <ArrowLeft size={15} />
              {backLabel}
            </Link>
          ) : null}
          <p className="site-kicker">{eyebrow}</p>
          <h1 className="site-page-title mt-6">{title}</h1>
          <p className="site-page-lead mt-7 max-w-2xl text-white/68">{description}</p>
        </div>

        <aside className="border-t border-white/20 pt-8 lg:border-l lg:border-t-0 lg:pb-2 lg:pl-10 lg:pt-0">
          <Icon className="mb-9 text-[#D69A6E]" size={34} strokeWidth={1.5} />
          <p className="text-xs font-bold uppercase tracking-[.18em] text-white/45">{railLabel}</p>
          <p className="mt-5 max-w-sm text-xl leading-8 text-white/82">{railText}</p>
        </aside>
      </div>
    </section>
  );
}
