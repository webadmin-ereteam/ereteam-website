"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown, ArrowRight, Megaphone, TrendingUp, Zap, Database, Monitor, Settings } from "lucide-react";

const serviceAreas = [
  {
    icon: Megaphone,
    color: "bg-blue-500",
    title: "Multichannel Campaign Management",
    summary: "Inbound and outbound omnichannel orchestration (HCL Unica)",
    content:
      "We implement HCL Unica Campaign and Unica Interact to deliver fully orchestrated omnichannel campaigns — combining mass outbound (email, SMS, direct mail) with real-time inbound decisioning across web, mobile, and contact center channels. Our implementations cover audience selection, segmentation, suppression logic, offer management, and response tracking at enterprise scale.",
    technologies: ["HCL Unica Campaign", "HCL Unica Interact", "HCL Unica Communicate"],
  },
  {
    icon: TrendingUp,
    color: "bg-emerald-500",
    title: "Journey & Funnel Analytics",
    summary: "Customer lifecycle tracking and conversion optimization",
    content:
      "We build customer journey analytics frameworks that stitch together touchpoints across channels and time — from first acquisition contact through onboarding, engagement, and retention events. By mapping drop-off points and conversion drivers at each lifecycle stage, we give marketing and CX teams the evidence base to intervene at the right moment.",
    technologies: ["HCL Unica Campaign", "Tableau", "Python", "SQL"],
  },
  {
    icon: Zap,
    color: "bg-violet-500",
    title: "Next Best Offer & Personalization",
    summary: "Real-time decisioning for banking, insurance, and retail",
    content:
      "We design and deploy Next Best Offer (NBO) engines powered by HCL Unica Interact — serving personalized, context-aware offers in real time across inbound digital channels and contact center interactions. Our models factor in customer value, product eligibility, behavioral propensity scores, and business rules to recommend the most relevant offer at each moment.",
    technologies: ["HCL Unica Interact", "DataRobot", "Python"],
  },
  {
    icon: Database,
    color: "bg-orange-500",
    title: "Customer Data Platform",
    summary: "Unified customer profiles and segment activation",
    content:
      "We build unified customer data layers that consolidate behavioral, transactional, and demographic data into actionable customer profiles. These profiles feed directly into Unica segmentation and audience selection, ensuring every campaign and personalization decision is grounded in a complete, current view of the customer.",
    technologies: ["HCL Unica Platform", "Python", "SQL", "AWS"],
  },
  {
    icon: Monitor,
    color: "bg-sky-500",
    title: "Digital Analytics & Web Intelligence",
    summary: "Session replay, heatmaps, UX diagnostics (HCL Discover)",
    content:
      "We implement HCL Discover (formerly Tealeaf) to give digital teams full visibility into online customer behavior — capturing session replays, interaction heatmaps, form analytics, and struggle detection. This enables product and CX teams to diagnose UX friction, investigate customer complaints, and continuously improve digital conversion rates.",
    technologies: ["HCL Discover", "HCL Unica Platform"],
  },
  {
    icon: Settings,
    color: "bg-rose-500",
    title: "Marketing Operations",
    summary: "Agency coordination, budget tracking, and asset lifecycle (Unica Plan)",
    content:
      "We implement HCL Unica Plan to bring structure and visibility to marketing operations — from campaign intake and creative brief management to agency workflow coordination, asset approvals, and budget tracking. Marketing teams get a governed, auditable process for every campaign from idea to in-market execution.",
    technologies: ["HCL Unica Plan", "HCL Unica Director"],
  },
];

const techPartners = [
  { name: "HCL Unica Platform" },
  { name: "HCL Unica Campaign" },
  { name: "HCL Unica Interact" },
  { name: "HCL Unica Plan" },
  { name: "HCL Unica Director" },
  { name: "HCL Unica Communicate" },
  { name: "HCL Discover" },
];

const featuredUseCases = [
  {
    industry: "Banking",
    project: "Omnichannel Campaign Management",
    technologies: ["HCL Unica Campaign", "HCL Unica Interact", "HCL Unica Communicate"],
    result: "Real-time inbound + mass SMS/email campaigns across full customer base",
  },
  {
    industry: "Banking",
    project: "Internet Banking UX Diagnostics",
    technologies: ["HCL Discover"],
    result: "Session replay and struggle detection deployed for digital banking channel",
  },
  {
    industry: "Banking",
    project: "Full Unica Suite Implementation",
    technologies: ["HCL Unica Campaign", "HCL Unica Interact", "HCL Unica Plan"],
    result: "Real-time and mass campaign management on a single unified platform",
  },
  {
    industry: "Insurance",
    project: "Real-Time Online Insurance & Call Center Offers",
    technologies: ["HCL Unica Interact", "HCL Unica Campaign"],
    result: "Real-time NBO deployed online + contact center with custom loyalty module",
  },
  {
    industry: "Aviation",
    project: "Marketing Operations Platform",
    technologies: ["HCL Unica Plan"],
    result: "Agency management, budget control, and asset lifecycle fully operationalized",
  },
];

const processSteps = [
  { number: "01", title: "Discover", description: "Audit current marketing tech stack and campaign workflows" },
  { number: "02", title: "Design", description: "Define audience model, offer catalogue, and channel strategy" },
  { number: "03", title: "Build", description: "Implement Unica modules, integrate data sources, configure rules" },
  { number: "04", title: "Optimize", description: "A/B test, refine NBO models, and scale across channels" },
];

const whyStats = [
  { stat: "5+", label: "Tier-1 banks running Unica in production via Ereteam" },
  { stat: "Real-time", label: "Inbound decisioning across web, mobile, and contact center" },
  { stat: "Full suite", label: "Campaign, Interact, Plan, Director, Communicate — all covered" },
];

export default function MarketingIntelligencePage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
      {/* Hero */}
      <section
        className="pt-32 pb-20"
        style={{ background: "linear-gradient(135deg, #1A1A2E 0%, #3d0028 100%)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <Link href="/services" className="text-sm text-gray-400 hover:text-white transition-colors">
              ← Services
            </Link>
          </div>
          <p className="text-sm font-medium text-[#E91E8C] uppercase tracking-widest mb-3">
            Service Domain
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
            Marketing Intelligence
          </h1>
          <p className="text-lg text-[#E91E8C] font-semibold mb-6">
            The right offer, to the right customer, at the right moment — at scale.
          </p>
          <p className="text-lg text-gray-300 max-w-2xl mb-8">
            Powered by HCL Unica — the enterprise standard for omnichannel campaign management
            — we help banks, insurers, and retailers orchestrate personalized customer engagement
            across every channel, in real time.
          </p>
          <ul className="space-y-2 text-gray-200 text-sm">
            {[
              "Real-time inbound decisioning across web, mobile, and contact center",
              "Mass outbound campaigns via email, SMS, and direct mail",
              "Next Best Offer engines powered by ML propensity models",
              "Marketing operations, agency management, and budget control",
            ].map((bullet) => (
              <li key={bullet} className="flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#E91E8C] flex-shrink-0" />
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {whyStats.map((s) => (
              <div key={s.stat}>
                <div className="text-3xl font-extrabold text-[#E91E8C] mb-1">{s.stat}</div>
                <div className="text-sm text-text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas Accordion */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-brand-dark mb-4">
              Service Areas
            </h2>
            <p className="text-text-muted">
              Click each area to explore our capabilities in depth.
            </p>
          </div>
          <div className="space-y-3">
            {serviceAreas.map((area, index) => (
                <motion.div
                  key={area.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-gray-200 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setOpenIndex(openIndex === index ? null : index)
                    }
                    className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-brand-light transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-2.5 h-2.5 rounded-full ${area.color} flex-shrink-0`} />
                      <div>
                        <div className="font-bold text-brand-dark">{area.title}</div>
                        <div className="text-sm text-text-muted mt-0.5">{area.summary}</div>
                      </div>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`text-[#E91E8C] flex-shrink-0 transition-transform ml-4 ${openIndex === index ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openIndex === index && (
                    <div className="px-6 pb-6 bg-brand-light">
                      <p className="text-sm text-text-body leading-relaxed mb-4">
                        {area.content}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {area.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="text-xs px-3 py-1 bg-white border border-[#E91E8C]/20 text-[#E91E8C] rounded-full font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Deliver */}
      <section className="py-20 bg-brand-light">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-brand-dark mb-4">How We Deliver</h2>
            <p className="text-text-muted">From platform implementation to live campaign orchestration.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {processSteps.map((step, i) => (
              <div key={step.number} className="relative text-center">
                {i < processSteps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-[calc(50%+2rem)] right-[-50%] h-px bg-gray-300" />
                )}
                <div className="w-12 h-12 rounded-full bg-[#E91E8C] text-white font-extrabold text-sm flex items-center justify-center mx-auto mb-3">
                  {step.number}
                </div>
                <div className="font-bold text-brand-dark text-sm mb-1">{step.title}</div>
                <div className="text-xs text-text-muted">{step.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Success Stories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <h2 className="text-2xl font-extrabold text-brand-dark">
              Featured Success Stories
            </h2>
            <Link
              href="/use-cases"
              className="flex items-center gap-1.5 text-sm font-semibold text-[#E91E8C]"
            >
              All success stories <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredUseCases.map((uc) => (
              <div
                key={uc.project}
                className="bg-brand-light rounded-xl p-6 border border-gray-200 flex flex-col"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium bg-[#E91E8C]/10 text-[#E91E8C] px-2 py-0.5 rounded-full">
                    {uc.industry}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-brand-dark mb-3">{uc.project}</h3>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {uc.technologies.map((t) => (
                    <span key={t} className="text-xs px-2 py-0.5 bg-white border border-gray-200 text-text-muted rounded-full">
                      {t}
                    </span>
                  ))}
                </div>
                <p className="text-sm font-semibold text-[#E91E8C] mt-auto">{uc.result}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Partners */}
      <section className="py-16 bg-brand-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-brand-dark mb-8 text-center">
            Technology Partners
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {techPartners.map((partner) => (
              <div
                key={partner.name}
                className="px-5 py-3 bg-white rounded-xl border border-gray-200 shadow-sm"
              >
                <span className="font-bold text-brand-dark">{partner.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-16"
        style={{ background: "linear-gradient(135deg, #1A1A2E 0%, #3d0028 100%)" }}
      >
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Ready to make your marketing smarter?
          </h2>
          <p className="text-gray-300 mb-8">
            Talk to our Marketing Intelligence experts. No obligation, just clarity.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-8 py-4 bg-[#E91E8C] text-white font-semibold rounded-lg hover:bg-opacity-90 transition-all"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </>
  );
}
