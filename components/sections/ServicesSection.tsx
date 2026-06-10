"use client";

import { motion } from "framer-motion";
import Link from "next/link";
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
            Explore <span className="font-semibold">Our Expertise</span>
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {services.map((service) => {
            return (
              <motion.div key={service.title} variants={fadeUp}>
                <Link
                  href={service.href}
                  className="group block h-full rounded-2xl overflow-hidden bg-[#111827] border border-gray-800 hover:border-gray-600 transition-colors duration-300 flex flex-col"
                >
                  {/* Image container with aspect ratio */}
                  <div className="relative h-48 w-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={service.image} 
                      alt={service.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Accent triangle / ribbon in corner */}
                    <div className="absolute bottom-0 right-0 w-24 h-24 overflow-hidden">
                       <div 
                         className="absolute bottom-0 right-0 w-24 h-24 origin-bottom-right transform rotate-45 flex items-end justify-center pb-2 opacity-90"
                         style={{ background: `linear-gradient(45deg, transparent 50%, ${service.accent} 50%)` }}
                       >
                       </div>
                    </div>
                  </div>
                  
                  {/* Content container */}
                  <div className="p-8 flex flex-col flex-grow">
                    <h3 className="text-2xl font-bold text-white mb-6 pr-4">
                      {service.title}
                    </h3>
                    
                    <div className="mt-auto pt-4">
                      <div className="inline-block px-5 py-2 rounded-full border border-gray-600 text-sm font-medium text-white group-hover:bg-white/10 group-hover:border-white/40 transition-all duration-300">
                        View details
                      </div>
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
