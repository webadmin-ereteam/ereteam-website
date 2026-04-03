"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function CTABanner() {
  return (
    <section
      className="py-20"
      style={{ background: "linear-gradient(135deg, #1A1A2E 0%, #0D3A5C 100%)" }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
            Ready to unlock the value{" "}
            <span className="text-brand-primary">in your data?</span>
          </h2>
          <p className="text-lg text-gray-300 mb-10">
            Talk to our experts — no obligation, just clarity.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-10 py-4 bg-brand-primary text-white font-semibold rounded-lg hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl text-base"
          >
            Get in Touch
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
