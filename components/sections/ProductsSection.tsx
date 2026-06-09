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
    <section
      className="py-24 relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #1A1A2E 0%, #0D3A5C 60%, #1A1A2E 100%)" }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] opacity-5 rounded-full"
          style={{ background: "radial-gradient(circle, #1A6FA8 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] opacity-5 rounded-full"
          style={{ background: "radial-gradient(circle, #E91E8C 0%, transparent 70%)", transform: "translate(-30%, 30%)" }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="text-center mb-14"
        >
          <motion.p variants={fadeUp} className="text-sm font-medium text-brand-magenta uppercase tracking-widest mb-2">
            Our Products
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Built for Enterprise Scale
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-gray-400 max-w-2xl mx-auto">
            Purpose-built platforms that extend the reach of our consulting expertise.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {products.map((product) => (
            <motion.div key={product.name} variants={fadeUp} className="group">
              <div
                className="h-full rounded-2xl p-6 sm:p-8 border transition-all duration-300 relative overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderColor: "rgba(255,255,255,0.10)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = `${product.color}60`;
                  (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.08)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.10)";
                  (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)";
                }}
              >
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                  style={{ background: product.color, transform: "translate(30%, -30%)" }}
                />
                <div className="relative z-10">
                  <div className="mb-6 pb-5 border-b border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.logo}
                      alt={product.name}
                      className="h-9 w-auto max-w-[150px] object-contain"
                    />
                  </div>
                  <div className="mb-1 text-xs font-medium text-gray-400 italic">
                    {product.tagline}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{product.name}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-6">
                    {product.description}
                  </p>
                  <div className="flex flex-col gap-2">
                    <Link
                      href={product.internalHref}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
                      style={{ color: product.color }}
                    >
                      Learn more <ArrowRight size={14} />
                    </Link>
                    <a
                      href={product.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      Visit website <ExternalLink size={12} />
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
