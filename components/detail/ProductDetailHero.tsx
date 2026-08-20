import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

type Metric = { value: string; label: string };

type ProductDetailHeroProps = {
  name: string;
  logo: string;
  label: string;
  title: string;
  highlight: string;
  description: string;
  metrics: Metric[];
  image: string;
  imagePosition?: string;
  accent: string;
  externalHref: string;
  primaryCta: string;
};

export default function ProductDetailHero({
  name,
  logo,
  label,
  title,
  highlight,
  description,
  metrics,
  image,
  imagePosition = "object-center",
  accent,
  externalHref,
  primaryCta,
}: ProductDetailHeroProps) {
  return (
    <section className="detail-hero detail-hero--product relative min-h-[760px] overflow-hidden bg-[#071A2A] text-white lg:min-h-[820px]">
      <Image src={image} alt="" fill priority sizes="100vw" className={`object-cover ${imagePosition}`} />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,26,42,.98)_0%,rgba(7,26,42,.9)_43%,rgba(7,26,42,.28)_78%,rgba(7,26,42,.15)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#071A2A] via-transparent to-[#071A2A]/35" />

      <div className="site-container relative flex min-h-[760px] flex-col pb-8 pt-28 lg:min-h-[820px] lg:pb-10 lg:pt-36">
        <div className="flex items-center justify-between gap-6">
          <Link href="/products" className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.12em] text-white/58 transition-colors hover:text-white">
            <ArrowLeft size={14} /> Products
          </Link>
          <span className="hidden font-mono text-[10px] uppercase tracking-[.18em] text-white/45 sm:block">Purpose-built by Ereteam</span>
        </div>

        <div className="my-auto max-w-4xl py-12">
          <div className="relative h-12 w-52 sm:h-14 sm:w-60">
            <Image src={logo} alt={name} fill sizes="240px" className="object-contain object-left brightness-0 invert" />
          </div>
          <p className="detail-eyebrow mt-10" style={{ color: accent }}>{label}</p>
          <h1 className="mt-5 max-w-4xl text-[clamp(3.2rem,6.8vw,7.3rem)] font-semibold leading-[.9] tracking-[-.065em] text-white">
            {title} <span style={{ color: accent }}>{highlight}</span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/72 sm:text-xl">{description}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/contact" className="site-button" style={{ backgroundColor: accent, borderColor: accent }}>{primaryCta}</Link>
            <a href={externalHref} target="_blank" rel="noopener noreferrer" className="site-button site-button--ghost">Visit website <ArrowUpRight size={15} /></a>
          </div>
        </div>

        <div className="grid border-t border-white/22 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="border-b border-white/15 py-4 pr-5 sm:border-r sm:px-5 sm:first:pl-0 lg:border-b-0 lg:py-5">
              <strong className="block text-2xl font-semibold sm:text-3xl" style={{ color: accent }}>{metric.value}</strong>
              <span className="mt-1 block text-[10px] uppercase leading-4 tracking-[.12em] text-white/58">{metric.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
