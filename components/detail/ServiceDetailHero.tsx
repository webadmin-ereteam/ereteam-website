import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type ServiceDetailHeroProps = {
  title: string;
  tagline: string;
  description: string;
  bullets: string[];
  image: string;
  imagePosition?: string;
  accent: string;
  imageAlt: string;
};

export default function ServiceDetailHero({
  title,
  tagline,
  description,
  bullets,
  image,
  imagePosition = "object-center",
  accent,
  imageAlt,
}: ServiceDetailHeroProps) {
  return (
    <section className="detail-hero detail-hero--service relative min-h-[780px] overflow-hidden bg-[#071A2A] text-white lg:min-h-[840px]">
      <Image src={image} alt={imageAlt} fill priority sizes="100vw" className={`object-cover ${imagePosition}`} />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,26,42,.98)_0%,rgba(7,26,42,.9)_42%,rgba(7,26,42,.32)_76%,rgba(7,26,42,.18)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#071A2A] via-transparent to-[#071A2A]/35" />

      <div className="site-container relative flex min-h-[780px] flex-col pb-8 pt-28 lg:min-h-[840px] lg:pb-10 lg:pt-36">
        <div className="flex items-center justify-between gap-6">
          <Link href="/services" className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.12em] text-white/60 transition-colors hover:text-white">
            <ArrowLeft size={14} /> Services
          </Link>
          <div className="hidden items-center gap-5 sm:flex">
            <span className="font-mono text-[10px] uppercase tracking-[.16em] text-white/50">25+ years of expertise</span>
            <span className="h-px w-12" style={{ backgroundColor: accent }} />
          </div>
        </div>

        <div className="my-auto max-w-5xl py-10">
          <p className="detail-eyebrow" style={{ color: accent }}>Service domain</p>
          <h1 className="mt-5 max-w-5xl text-[clamp(3.4rem,7vw,7.4rem)] font-semibold leading-[.9] tracking-[-.062em] text-white">{title}</h1>
          <p className="mt-7 max-w-3xl text-xl font-semibold leading-8 sm:text-2xl" style={{ color: accent }}>{tagline}</p>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/75 sm:text-xl">{description}</p>
        </div>

        <div className="grid border-t border-white/20 sm:grid-cols-2 lg:grid-cols-4">
          {bullets.map((bullet) => (
            <div key={bullet} className="border-b border-white/15 py-4 pr-5 text-sm leading-6 text-white/80 sm:border-r sm:px-5 sm:first:pl-0 lg:border-b-0 lg:py-5">
              <span>{bullet}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
