"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { products } from "@/lib/homeData";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

export default function ProductsSection() {
  return (
    <section className="py-24 bg-[#0B0F19]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="mb-12"
        >
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-light text-white tracking-wide">
            Built for <span className="font-semibold">Enterprise Scale</span>
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {products.map((product) => (
            <motion.div key={product.name} variants={fadeUp} className="group h-full flex">
              <div className="h-full w-full rounded-2xl overflow-hidden bg-[#111827] border border-gray-800 hover:border-gray-600 transition-colors duration-300 flex flex-col relative">
                
                {/* Image container with aspect ratio */}
                <div className="relative h-48 w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 mix-blend-overlay"
                  />
                  {/* Color overlay to give brand identity */}
                  <div className="absolute inset-0" style={{ backgroundColor: product.color, opacity: 0.2 }}></div>
                  
                  {/* Top gradient for logo */}
                  <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#111827] to-transparent"></div>
                  
                  {/* Logo overlay on top of image */}
                  <div className="absolute top-6 left-8">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.logo}
                      alt={product.name}
                      className="h-10 w-auto max-w-[150px] object-contain drop-shadow-lg"
                    />
                  </div>
                </div>
                
                {/* Content container */}
                <div className="p-8 flex flex-col flex-grow relative z-10">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: product.color }}>
                    {product.tagline}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {product.name}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">
                    {product.description}
                  </p>
                  
                  <div className="mt-auto pt-4 flex flex-col gap-3">
                    <Link
                      href={product.internalHref}
                      className="inline-flex items-center gap-2 text-sm font-semibold transition-colors w-fit"
                      style={{ color: product.color }}
                    >
                      Learn more <ArrowRight size={16} />
                    </Link>
                    <a
                      href={product.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-white transition-colors w-fit"
                    >
                      Visit website <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
