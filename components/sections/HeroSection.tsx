"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    eyebrow: "Financial Planning & Reporting",
    title: "Plan with clarity. Report with confidence.",
    body: "We connect strategy, finance and operations through enterprise planning, forecasting and management reporting.",
    href: "/services/financial-performance-intelligence",
    image: "/images/editorial/service-finance-v2.png",
    position: "object-center",
  },
  {
    eyebrow: "Data Analytics & AI",
    title: "Turn complex data into decisive action.",
    body: "From trusted data foundations to applied AI, we build analytics capabilities that work in the real enterprise.",
    href: "/services/data-cloud-ai",
    image: "/images/editorial/service-data-ai-v2.png",
    position: "object-center",
  },
  {
    eyebrow: "25 Years of Enterprise Expertise",
    title: "Built on experience. Focused on what is next.",
    body: "Since 2001, Ereteam has united business perspective and technical depth to deliver lasting outcomes.",
    href: "/about/company",
    image: "/images/editorial/careers-mentoring-v2.png",
    position: "object-center",
  },
];

export default function HeroSection() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 7500);
    return () => window.clearInterval(interval);
  }, []);

  const move = (direction: number) => setActive((current) => (current + direction + slides.length) % slides.length);

  return (
    <section className="relative min-h-[720px] bg-[#071A2A] text-white lg:min-h-[820px]" aria-roledescription="carousel" aria-label="Ereteam expertise">
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div key={slide.image} className={`absolute inset-0 transition-opacity duration-1000 ${index === active ? "opacity-100" : "pointer-events-none opacity-0"}`} aria-hidden={index !== active}>
            <Image src={slide.image} alt="" fill priority={index === 0} sizes="100vw" className={`object-cover ${slide.position}`} />
          </div>
        ))}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,17,28,.94)_0%,rgba(4,17,28,.72)_44%,rgba(4,17,28,.2)_75%,rgba(4,17,28,.46)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071A2A]/85 via-transparent to-[#071A2A]/25" />
      </div>

      <div className="site-container relative z-10 grid min-h-[720px] grid-rows-[1fr_auto] pt-28 lg:min-h-[820px] lg:pt-36">
        <div className="flex items-center">
          <div key={active} className="max-w-5xl animate-[hero-in_.8s_cubic-bezier(.22,1,.36,1)_both]">
            <span className="site-kicker text-[#D69A6E]">{slides[active].eyebrow}</span>
            <h1 className="site-display mt-7 min-h-[3.8em] max-w-5xl text-[clamp(3.25rem,7.2vw,7.2rem)] text-white sm:min-h-[2.85em] lg:min-h-[1.9em]">{slides[active].title}</h1>
            <p className="mt-7 min-h-[5.25rem] max-w-xl text-base leading-7 text-white/75 sm:min-h-[3.5rem] sm:text-lg">{slides[active].body}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href={slides[active].href} className="site-button site-button--light">Explore expertise <ArrowRight size={16} /></Link>
              <Link href="/contact" className="site-button site-button--ghost">Talk to our team</Link>
            </div>
          </div>
        </div>

        <div className="grid border-t border-white/25 lg:grid-cols-[1fr_auto]">
          <div className="grid grid-cols-3">
            {slides.map((slide, index) => (
              <button key={slide.eyebrow} type="button" onClick={() => setActive(index)} aria-label={`Show ${slide.eyebrow} slide`} aria-current={index === active} className={`border-r border-white/20 px-3 py-5 text-left transition-colors lg:px-5 ${index === active ? "bg-white/10" : "hover:bg-white/5"}`}>
                <span className={`mb-2 block h-[2px] transition-all ${index === active ? "w-10 bg-[#D69A6E]" : "w-4 bg-white/30"}`} />
                <span className="hidden text-[10px] font-semibold uppercase tracking-[.13em] text-white/70 sm:block">{slide.eyebrow}</span>
              </button>
            ))}
          </div>
          <div className="hidden items-center lg:flex">
            <button type="button" onClick={() => move(-1)} className="flex h-full w-16 items-center justify-center border-l border-white/20 hover:bg-white/10" aria-label="Previous slide"><ChevronLeft /></button>
            <button type="button" onClick={() => move(1)} className="flex h-full w-16 items-center justify-center border-l border-white/20 hover:bg-white/10" aria-label="Next slide"><ChevronRight /></button>
          </div>
        </div>
      </div>
      <style jsx>{`@keyframes hero-in { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </section>
  );
}
