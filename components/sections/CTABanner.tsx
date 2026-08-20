"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function CTABanner() {
  return (
    <section className="relative overflow-hidden bg-[#B96F38] py-24 text-white lg:py-32">
      <div className="site-container relative text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-[10px] font-bold uppercase tracking-[.2em] text-white/75">The next conversation</span>
          <h2 className="site-display mx-auto mt-6 max-w-4xl text-5xl text-white sm:text-6xl lg:text-7xl">
            What could better decisions change for your business?
          </h2>
          <p className="mx-auto mb-10 mt-7 max-w-xl text-base leading-7 text-white/80">
            Bring us the ambition, the complexity or the question. We will bring experienced perspective.
          </p>
          <Link
            href="/contact"
            className="site-button site-button--light"
          >
            Start a conversation
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
