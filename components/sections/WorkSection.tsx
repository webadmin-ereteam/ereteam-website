"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { selectedWork } from "@/lib/homeData";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

export default function WorkSection() {
  return (
    <section className="py-24 bg-[#F7F8FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="flex flex-col sm:flex-row sm:items-end justify-between mb-14"
        >
          <div>
            <motion.p variants={fadeUp} className="text-sm font-medium text-brand-magenta uppercase tracking-widest mb-2">
              Selected Work
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold text-brand-dark">
              Proven Impact Across Industries
            </motion.h2>
          </div>
          <motion.div variants={fadeUp} className="mt-4 sm:mt-0">
            <Link
              href="/use-cases"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary hover:text-brand-dark transition-colors"
            >
              View all use cases <ArrowRight size={16} />
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {selectedWork.map((work) => (
            <motion.div key={work.project} variants={fadeUp}>
              <Link
                href={work.href}
                className="group block h-full bg-white rounded-2xl p-8 border border-gray-200 hover:border-brand-primary hover:shadow-xl transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                <span className="inline-block text-xs font-semibold text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full mb-5">
                  {work.industry}
                </span>
                <h3 className="text-xl font-extrabold text-brand-dark mb-4 group-hover:text-brand-primary transition-colors">
                  {work.project}
                </h3>
                <p className="text-sm text-text-body mb-5 leading-relaxed font-medium border-l-2 border-brand-magenta pl-3">
                  {work.result}
                </p>
                <div className="flex flex-wrap gap-2">
                  {work.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2.5 py-1 bg-brand-light rounded-md border border-gray-200 text-text-muted">
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
