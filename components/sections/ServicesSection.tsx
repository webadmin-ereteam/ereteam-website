"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { services } from "@/lib/homeData";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

export default function ServicesSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.p variants={fadeUp} className="text-sm font-medium text-brand-magenta uppercase tracking-widest mb-2">
            What We Do
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold text-brand-dark mb-4">
            Expertise at Every Layer of Your Data Stack
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-text-muted max-w-2xl mx-auto">
            From raw data infrastructure to C-suite decision intelligence — we cover the full analytics spectrum.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <motion.div key={service.title} variants={fadeUp}>
                <Link
                  href={service.href}
                  className={`group block h-full p-6 sm:p-8 bg-gradient-to-br ${service.gradient} rounded-2xl border hover:shadow-2xl transition-all duration-300 relative overflow-hidden`}
                  style={{ borderColor: `${service.accent}30` }}
                >
                  {/* Hover glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                    style={{ background: `radial-gradient(circle at 20% 80%, ${service.accent}20 0%, transparent 60%)` }}
                  />
                  {/* Top accent line */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: service.accent }} />
                  <div className="relative z-10">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                      style={{ background: `${service.accent}22`, border: `1px solid ${service.accent}40` }}
                    >
                      <Icon size={26} style={{ color: service.accent }} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">
                      {service.title}
                    </h3>
                    <p className="text-sm text-gray-300 leading-relaxed mb-5">
                      {service.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-5">
                      {service.tags.map((tag) => (
                        <span key={tag} className="text-xs px-2.5 py-1 rounded-md font-medium" style={{ background: `${service.accent}18`, border: `1px solid ${service.accent}35`, color: service.accent }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: service.accent }}>
                      Learn more <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
