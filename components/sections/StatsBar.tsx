"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "25", suffix: "th", label: "Years of Excellence", description: "Est. 2001 — Still going strong", isAnniversary: true },
  { value: "80", suffix: "+", label: "Professionals", description: "Global team", isAnniversary: false },
  { value: "100", suffix: "+", label: "Enterprise Clients", description: "Worldwide", isAnniversary: false },
  { value: "17", suffix: "", label: "Countries", description: "Global reach", isAnniversary: false },
];

export default function StatsBar() {
  return (
    <section className="bg-white border-b border-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-primary mb-1">
                {stat.value}
                <span className="text-brand-magenta">{stat.suffix}</span>
              </div>
              <div className="text-sm font-semibold text-brand-dark mb-0.5">
                {stat.label}
              </div>
              <div className={`text-xs font-medium ${stat.isAnniversary ? "text-brand-magenta" : "text-text-muted"}`}>
                {stat.description}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
