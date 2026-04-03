"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.3 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

// Node positions around a 400x400 canvas, center at (200,200)
const centerNode = { x: 250, y: 250 };
const nodes = [
  { id: "banking",     label: "Banking",       x: 250, y: 62,  color: "#1A6FA8", delay: 0 },
  { id: "pharma",      label: "Pharma",        x: 432, y: 132, color: "#E91E8C", delay: 0.3 },
  { id: "insurance",   label: "Insurance",     x: 460, y: 338, color: "#0C9472", delay: 0.6 },
  { id: "retail",      label: "Retail",        x: 322, y: 458, color: "#7C3AED", delay: 0.9 },
  { id: "mfg",         label: "Manufacturing", x: 132, y: 432, color: "#D97706", delay: 1.2 },
  { id: "telecom",     label: "Telecom",       x: 50,  y: 250, color: "#0891B2", delay: 1.5 },
  { id: "finance",     label: "Finance",       x: 108, y: 108, color: "#BE185D", delay: 1.8 },
];

const floatingMetrics = [
  { label: "25 yrs", sub: "Experience", x: -70, y: 30,  color: "#1A6FA8", floatDelay: 0 },
  { label: "100+",   sub: "Clients",    x: 490, y: 70,  color: "#0C9472", floatDelay: 1 },
  { label: "200+",   sub: "Projects",   x: 478, y: 380, color: "#E91E8C", floatDelay: 2 },
  { label: "17",     sub: "Countries",  x: -65, y: 370, color: "#7C3AED", floatDelay: 1.5 },
];

function DataNetwork() {
  return (
    <div className="relative w-[500px] h-[500px]">
      {/* Floating metric chips */}
      {floatingMetrics.map((m) => (
        <motion.div
          key={m.label}
          className="absolute z-20 rounded-xl px-3 py-2 text-center"
          style={{
            left: m.x,
            top: m.y,
            background: `${m.color}18`,
            border: `1px solid ${m.color}40`,
            backdropFilter: "blur(12px)",
            minWidth: 64,
          }}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4 + m.floatDelay, repeat: Infinity, ease: "easeInOut", delay: m.floatDelay }}
        >
          <div className="text-lg font-extrabold text-white leading-none">{m.label}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">{m.sub}</div>
        </motion.div>
      ))}

      {/* SVG network */}
      <svg width="500" height="500" className="absolute inset-0">
        <defs>
          {nodes.map((n) => (
            <linearGradient key={`grad-${n.id}`} id={`grad-${n.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={n.color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={n.color} stopOpacity="0.2" />
            </linearGradient>
          ))}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Connection lines */}
        {nodes.map((n) => (
          <motion.line
            key={`line-${n.id}`}
            x1={centerNode.x} y1={centerNode.y}
            x2={n.x} y2={n.y}
            stroke={n.color}
            strokeWidth="1.5"
            strokeOpacity="0.35"
            strokeDasharray="4 4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 + n.delay }}
          />
        ))}

        {/* Animated data particles traveling along each line */}
        {nodes.map((n) => (
          <motion.circle
            key={`particle-${n.id}`}
            r="3"
            fill={n.color}
            filter="url(#glow)"
            animate={{
              cx: [centerNode.x, n.x, centerNode.x],
              cy: [centerNode.y, n.y, centerNode.y],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: 1.5 + n.delay,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Center hub glow ring */}
        <motion.circle
          cx={centerNode.x} cy={centerNode.y} r="42"
          fill="none" stroke="rgba(26,111,168,0.15)" strokeWidth="1"
          animate={{ r: [42, 52, 42], opacity: [0.3, 0.1, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle
          cx={centerNode.x} cy={centerNode.y} r="28"
          fill="none" stroke="rgba(26,111,168,0.25)" strokeWidth="1"
          animate={{ r: [28, 36, 28], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />

        {/* Outer node circles */}
        {nodes.map((n) => (
          <g key={`node-${n.id}`}>
            {/* Pulse ring */}
            <motion.circle
              cx={n.x} cy={n.y} r="16"
              fill="none" stroke={n.color} strokeWidth="1"
              animate={{ r: [16, 24, 16], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, delay: n.delay, ease: "easeOut" }}
            />
            {/* Node fill */}
            <motion.circle
              cx={n.x} cy={n.y} r="14"
              fill={`${n.color}22`}
              stroke={n.color}
              strokeWidth="1.5"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 + n.delay }}
            />
          </g>
        ))}

        {/* Center hub */}
        <circle cx={centerNode.x} cy={centerNode.y} r="36" fill="rgba(26,111,168,0.12)" stroke="rgba(26,111,168,0.5)" strokeWidth="1.5" />
        <circle cx={centerNode.x} cy={centerNode.y} r="36" fill="url(#hubGrad)" />
        <defs>
          <radialGradient id="hubGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1A6FA8" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0D3A5C" stopOpacity="0.1" />
          </radialGradient>
        </defs>
      </svg>

      {/* Center: Ereteam logo */}
      <div
        className="absolute flex items-center justify-center"
        style={{ left: centerNode.x - 36, top: centerNode.y - 16, width: 72, height: 32 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logos/ereteam-logo.png"
          alt="Ereteam"
          className="w-full h-full object-contain brightness-0 invert opacity-90"
        />
      </div>

      {/* Node labels */}
      {nodes.map((n) => {
        const dx = n.x - centerNode.x;
        const dy = n.y - centerNode.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const lx = n.x + (dx / len) * 22;
        const ly = n.y + (dy / len) * 22;
        const isRight = n.x > centerNode.x;
        return (
          <motion.div
            key={`label-${n.id}`}
            className="absolute text-[11px] font-semibold whitespace-nowrap"
            style={{
              left: lx,
              top: ly - 8,
              color: n.color,
              transform: isRight ? "translateX(4px)" : "translateX(calc(-100% - 4px))",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 + n.delay }}
          >
            {n.label}
          </motion.div>
        );
      })}
    </div>
  );
}

export default function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: "#07111f" }}
    >
      {/* Animated background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute animate-blob-1 rounded-full"
          style={{ top: "5%", left: "-5%", width: 700, height: 700, background: "radial-gradient(circle, rgba(26,111,168,0.25) 0%, transparent 65%)" }} />
        <div className="absolute animate-blob-2 rounded-full"
          style={{ top: "30%", right: "-10%", width: 600, height: 600, background: "radial-gradient(circle, rgba(12,148,114,0.18) 0%, transparent 65%)" }} />
        <div className="absolute animate-blob-3 rounded-full"
          style={{ bottom: "0%", left: "35%", width: 500, height: 500, background: "radial-gradient(circle, rgba(233,30,140,0.12) 0%, transparent 65%)" }} />
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" width="36" height="36" patternUnits="userSpaceOnUse">
              <circle cx="18" cy="18" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left: Text */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A6FA8]/20 border border-[#1A6FA8]/30 text-[#4fa8d8] text-sm font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-[#1A6FA8] animate-pulse" />
                Enterprise Data &amp; Analytics Consultancy
              </span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-4">
              Where Data{" "}
              <span style={{ background: "linear-gradient(90deg, #1A6FA8, #38bdf8, #0C9472)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Comes Alive
              </span>
            </motion.h1>

            <motion.div variants={itemVariants} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E91E8C]/20 border border-[#E91E8C]/40 text-[#E91E8C] text-sm font-semibold">
                ✦ 25 Years of Enterprise Data Excellence
              </span>
            </motion.div>

            <motion.p variants={itemVariants} className="text-lg text-gray-300 max-w-xl mb-10 leading-relaxed">
              Ereteam helps enterprises unlock the full potential of their data
              through modern cloud platforms, AI-driven analytics, and deep
              industry expertise spanning 25 years.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 mb-10 lg:mb-14">
              <Link
                href="/services"
                className="inline-flex items-center justify-center px-6 py-3.5 bg-[#1A6FA8] text-white font-semibold rounded-lg hover:bg-[#155d8f] transition-all shadow-lg text-sm"
              >
                Explore Our Services
              </Link>
              <Link
                href="/use-cases"
                className="inline-flex items-center justify-center px-6 py-3.5 border border-white/25 text-white font-semibold rounded-lg hover:bg-white/10 transition-all text-sm"
              >
                See Our Work
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-8 flex-wrap">
              {[
                { name: "Obserian", href: "/products/obserian", logo: "/logos/products/obserian.svg" },
                { name: "Pharmeta", href: "/products/pharmeta", logo: "/logos/products/pharmeta_logo.png" },
                { name: "Maturytics", href: "/products/maturytics", logo: "/logos/products/maturytics.svg" },
              ].map((p) => (
                <a key={p.name} href={p.href} className="opacity-40 hover:opacity-80 transition-opacity">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.logo} alt={p.name} className="h-6 w-auto max-w-[100px] object-contain brightness-0 invert" />
                </a>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Data Network */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="hidden lg:flex items-center justify-center"
          >
            <DataNetwork />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-1 text-gray-600">
          <span className="text-xs">Scroll</span>
          <div className="w-0.5 h-8 bg-gradient-to-b from-gray-600 to-transparent" />
        </div>
      </motion.div>
    </section>
  );
}
