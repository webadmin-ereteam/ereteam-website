"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { selectedWork } from "@/lib/homeData";

export default function WorkSection() {
  return (
    <section className="bg-[#071A2A] py-24 text-white lg:py-32">
      <div className="site-container">
        <div className="grid gap-8 pb-14 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <span className="site-kicker text-[#D69A6E]">Selected outcomes</span>
            <h2 className="site-display mt-6 max-w-4xl text-5xl text-white sm:text-6xl lg:text-7xl">Work measured by what changed.</h2>
          </div>
          <Link href="/use-cases" className="site-button site-button--ghost">View success stories <ArrowRight size={16} /></Link>
        </div>

        <div className="grid border-l border-t border-white/20 md:grid-cols-3">
          {selectedWork.map((work) => (
            <Link key={work.project} href={work.href} className="group flex flex-col border-b border-r border-white/20">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image src={work.image} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover grayscale transition duration-700 group-hover:scale-[1.04] group-hover:grayscale-0" />
                <div className="absolute inset-0 bg-[#071A2A]/20" />
              </div>
              <div className="flex min-h-[260px] flex-col p-7 lg:p-8">
                <div className="text-[10px] font-bold uppercase tracking-[.14em] text-[#D69A6E]">{work.industry}</div>
                <h3 className="site-display mt-8 text-2xl leading-tight text-white lg:text-3xl">{work.project}</h3>
                <p className="mt-auto pt-8 text-sm leading-6 text-white/60">{work.result}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
