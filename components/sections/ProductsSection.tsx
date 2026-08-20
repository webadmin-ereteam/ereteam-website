"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { products } from "@/lib/homeData";

export default function ProductsSection() {
  return (
    <section className="bg-[#e9e4d8] py-24 lg:py-32">
      <div className="site-container">
        <div className="grid gap-7 border-b border-[#071A2A]/20 pb-12 lg:grid-cols-2 lg:items-end">
          <div>
            <span className="site-kicker">Ereteam products</span>
            <h2 className="site-display mt-6 text-5xl text-brand-dark sm:text-6xl">Expertise, made repeatable.</h2>
          </div>
          <p className="max-w-xl text-lg leading-8 text-text-muted lg:justify-self-end">Purpose-built software born from recurring enterprise data problems—and refined through real client delivery.</p>
        </div>

        <div className="grid border-l border-[#071A2A]/20 md:grid-cols-3">
          {products.map((product) => (
            <article key={product.name} className="group relative flex min-h-[370px] flex-col border-b border-r border-[#071A2A]/20 bg-[#f3f0e8] p-7 transition-colors hover:bg-[#f9f7f2] lg:min-h-[430px] lg:p-9">
              <div className="flex items-start justify-end">
                <Link href={product.internalHref} aria-label={"View " + product.name} className="flex h-10 w-10 items-center justify-center border border-brand-dark/20 transition-colors group-hover:bg-brand-dark group-hover:text-white"><ArrowUpRight size={17} /></Link>
              </div>
              <div className="relative my-auto h-20 w-full">
                <Image src={product.logo} alt={product.name} fill sizes="280px" className="object-contain object-left" />
              </div>
              <div>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[.14em]" style={{ color: product.color }}>{product.tagline}</p>
                <p className="text-base leading-7 text-text-muted">{product.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
