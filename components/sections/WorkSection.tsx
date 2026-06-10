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
    <section className="py-24 bg-[#0B0F19]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="flex flex-col sm:flex-row sm:items-end justify-between mb-12"
        >
          <div>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-light text-white tracking-wide">
              Explore our <span className="font-semibold">stories & insights</span>
            </motion.h2>
          </div>
          <motion.div variants={fadeUp} className="mt-4 sm:mt-0 flex gap-4">
            <Link
              href="/use-cases"
              className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-600 text-white hover:bg-white/10 transition-colors"
            >
               <ArrowRight size={20} className="rotate-180" />
            </Link>
            <Link
              href="/use-cases"
              className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-blue-500 text-blue-500 hover:bg-blue-500/10 transition-colors"
            >
              <ArrowRight size={20} />
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
                className="group block h-[500px] w-full rounded-none overflow-hidden relative"
              >
                {/* Background Image */}
                <div className="absolute inset-0 w-full h-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={work.image}
                    alt={work.project}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/80 to-transparent transition-opacity duration-300" />
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <span className="block text-xs font-semibold text-gray-400 tracking-wider uppercase mb-3">
                    {work.industry}
                  </span>
                  <h3 className="text-2xl font-bold text-white mb-2 leading-snug">
                    {work.project}
                  </h3>
                  <p className="text-gray-300 text-sm mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                    {work.result}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
