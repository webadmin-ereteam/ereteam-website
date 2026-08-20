"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const services = [
  {
    title: "Financial Performance & Intelligence",
    description: "Integrated planning, budgeting, forecasting, consolidation and management reporting—designed around how your finance team actually operates.",
    href: "/services/financial-performance-intelligence",
    image: "/images/editorial/service-finance-v2.png",
  },
  {
    title: "Data, Cloud & AI",
    description: "Trusted data foundations, modern cloud platforms and applied AI that move securely from strategy into everyday enterprise use.",
    href: "/services/data-cloud-ai",
    image: "/images/editorial/service-data-ai-v2.png",
  },
  {
    title: "Marketing Intelligence",
    description: "Measurement frameworks and advanced analytics that help commercial teams understand performance, allocate spend and act with confidence.",
    href: "/services/marketing-intelligence",
    image: "/images/editorial/service-marketing-v2.png",
  },
];

export default function ServicesSection() {
  return (
    <section className="bg-[#f9f7f2] py-24 lg:py-36">
      <div className="site-container">
        <div className="grid gap-8 pb-14 lg:grid-cols-[.8fr_1.2fr] lg:items-end lg:pb-20">
          <div>
            <span className="site-kicker">Our expertise</span>
            <h2 className="site-display mt-6 text-5xl text-brand-dark sm:text-6xl lg:text-7xl">Deep expertise.<br />One clear outcome.</h2>
          </div>
          <p className="max-w-xl text-base leading-8 text-text-muted lg:justify-self-end">Ereteam brings business context, technical rigor and experienced delivery teams together. We do not stop at recommendations—we build the capability with you.</p>
        </div>

        <div className="border-t border-[#071A2A]/20">
          {services.map((service, index) => (
            <motion.article key={service.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .25 }} transition={{ duration: .6, delay: index * .06 }} className="group grid border-b border-[#071A2A]/20 py-8 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-12 lg:py-12">
              <div className="pr-4">
                <h3 className="site-display text-3xl text-brand-dark transition-colors group-hover:text-brand-primary sm:text-4xl">{service.title}</h3>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-text-muted">{service.description}</p>
                <Link href={service.href} className="mt-7 inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[.12em] text-brand-dark">Explore capability <ArrowUpRight size={15} /></Link>
              </div>
              <Link href={service.href} className="relative mt-7 block aspect-[16/9] overflow-hidden bg-brand-dark lg:mt-0">
                <Image src={service.image} alt="" fill sizes="(min-width: 1024px) 42vw, 100vw" className="object-cover saturate-[.72] transition duration-700 group-hover:scale-[1.03] group-hover:saturate-100" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071A2A]/35 to-transparent" />
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
