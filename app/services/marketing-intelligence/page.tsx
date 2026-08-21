"use client";

import Link from "next/link";
import { ArrowRight, Megaphone, TrendingUp, Zap, Database, Monitor, Settings } from "lucide-react";
import Image from "next/image";
import ServiceDetailHero from "@/components/detail/ServiceDetailHero";
import { DeliveryEditorial, ServiceAreasEditorial } from "@/components/detail/ServiceEditorialSections";

const serviceAreas = [
  {
    icon: Megaphone,
    color: "bg-blue-500",
    title: "Multichannel Campaign Management",
    summary: "Inbound and outbound omnichannel orchestration (HCL Unica)",
    content:
      "We implement HCL Unica Campaign and Unica Interact to deliver fully orchestrated omnichannel campaigns — combining mass outbound (email, SMS, direct mail) with real-time inbound decisioning across web, mobile, and contact center channels. Our implementations cover audience selection, segmentation, suppression logic, offer management, and response tracking at enterprise scale.",
    technologies: ["HCL Unica Campaign", "HCL Unica Interact", "HCL Unica Communicate"],
    image: "/images/editorial/service-detail/marketing-multichannel-campaigns.jpg",
  },
  {
    icon: TrendingUp,
    color: "bg-emerald-500",
    title: "Journey & Funnel Analytics",
    summary: "Customer lifecycle tracking and conversion optimization",
    content:
      "We build customer journey analytics frameworks that stitch together touchpoints across channels and time — from first acquisition contact through onboarding, engagement, and retention events. By mapping drop-off points and conversion drivers at each lifecycle stage, we give marketing and CX teams the evidence base to intervene at the right moment.",
    technologies: ["HCL Unica Campaign", "Tableau", "Python", "SQL"],
    image: "/images/editorial/service-detail/marketing-journey-funnel.jpg",
  },
  {
    icon: Zap,
    color: "bg-violet-500",
    title: "Next Best Offer & Personalization",
    summary: "Real-time decisioning for banking, insurance, and retail",
    content:
      "We design and deploy Next Best Offer (NBO) engines powered by HCL Unica Interact — serving personalized, context-aware offers in real time across inbound digital channels and contact center interactions. Our models factor in customer value, product eligibility, behavioral propensity scores, and business rules to recommend the most relevant offer at each moment.",
    technologies: ["HCL Unica Interact", "DataRobot", "Python"],
    image: "/images/editorial/service-detail/marketing-next-best-offer.jpg",
  },
  {
    icon: Database,
    color: "bg-orange-500",
    title: "Customer Data Platform",
    summary: "Unified customer profiles and segment activation",
    content:
      "We build unified customer data layers that consolidate behavioral, transactional, and demographic data into actionable customer profiles. These profiles feed directly into Unica segmentation and audience selection, ensuring every campaign and personalization decision is grounded in a complete, current view of the customer.",
    technologies: ["HCL Unica Platform", "Python", "SQL", "AWS"],
    image: "/images/editorial/service-detail/marketing-customer-data-platform.jpg",
  },
  {
    icon: Monitor,
    color: "bg-sky-500",
    title: "Digital Analytics & Web Intelligence",
    summary: "Session replay, heatmaps, UX diagnostics (HCL Discover)",
    content:
      "We implement HCL Discover (formerly Tealeaf) to give digital teams full visibility into online customer behavior — capturing session replays, interaction heatmaps, form analytics, and struggle detection. This enables product and CX teams to diagnose UX friction, investigate customer complaints, and continuously improve digital conversion rates.",
    technologies: ["HCL Discover", "HCL Unica Platform"],
    image: "/images/editorial/service-detail/marketing-digital-analytics.jpg",
  },
  {
    icon: Settings,
    color: "bg-rose-500",
    title: "Marketing Operations",
    summary: "Agency coordination, budget tracking, and asset lifecycle (Unica Plan)",
    content:
      "We implement HCL Unica Plan to bring structure and visibility to marketing operations — from campaign intake and creative brief management to agency workflow coordination, asset approvals, and budget tracking. Marketing teams get a governed, auditable process for every campaign from idea to in-market execution.",
    technologies: ["HCL Unica Plan", "HCL Unica Director"],
    image: "/images/editorial/service-detail/marketing-operations.jpg",
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
    summary: "Implemented a unified marketing hub capable of orchestrating highly personalized, real-time inbound and mass outbound campaigns across all digital channels.",
    result: "Real-time inbound + mass SMS/email campaigns across full customer base",
    image: "https://images.unsplash.com/photo-1639754390580-2e7437267698?auto=format&fit=crop&q=80&w=1000",
  },
  {
    industry: "Banking",
    project: "Internet Banking UX Diagnostics",
    technologies: ["HCL Discover"],
    summary: "Deployed advanced session replay and behavioral analytics to identify and resolve user friction points within the internet banking application.",
    result: "Session replay and struggle detection deployed for digital banking channel",
    image: "https://images.unsplash.com/photo-1621264448270-9ef00e88a935?auto=format&fit=crop&q=80&w=1000",
  },
  {
    industry: "Banking",
    project: "Full Unica Suite Implementation",
    technologies: ["HCL Unica Campaign", "HCL Unica Interact", "HCL Unica Plan"],
    summary: "End-to-end deployment of the HCL Unica suite, enabling marketing teams to plan, execute, and analyze complex campaigns from a single interface.",
    result: "Real-time and mass campaign management on a single unified platform",
    image: "/images/editorial/service-marketing-v2.png",
  },
  {
    industry: "Insurance",
    project: "Real-Time Online Insurance & Call Center Offers",
    technologies: ["HCL Unica Interact", "HCL Unica Campaign"],
    summary: "Integrated a custom loyalty module with real-time decisioning engines to provide Next-Best-Action recommendations to call center agents and online portals.",
    result: "Real-time NBO deployed online + contact center with custom loyalty module",
    image: "https://images.unsplash.com/photo-1707157281599-d155d1da5b4c?auto=format&fit=crop&q=80&w=1000",
  },
  {
    industry: "Aviation",
    project: "Marketing Operations Platform",
    technologies: ["HCL Unica Plan"],
    summary: "Digitalized marketing operations for a major airline, streamlining agency collaboration, campaign approvals, and budget tracking.",
    result: "Agency management, budget control, and asset lifecycle fully operationalized",
    image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&q=80&w=1000",
  },
];

const processSteps = [
  { title: "Discover", description: "Audit current marketing tech stack and campaign workflows" },
  { title: "Design", description: "Define audience model, offer catalogue, and channel strategy" },
  { title: "Build", description: "Implement Unica modules, integrate data sources, configure rules" },
  { title: "Optimize", description: "A/B test, refine NBO models, and scale across channels" },
];

const whyStats = [
  { stat: "5+", label: "Tier-1 banks running Unica in production via Ereteam" },
  { stat: "Real-time", label: "Inbound decisioning across web, mobile, and contact center" },
  { stat: "Full suite", label: "Campaign, Interact, Plan, Director, Communicate — all covered" },
];

export default function MarketingIntelligencePage() {
  return (
    <div className="detail-page">
      <ServiceDetailHero
        title="Marketing Intelligence"
        tagline="Orchestrate personalized customer engagement in real time."
        description="Powered by HCL Unica, we help organizations coordinate personalized customer engagement across every channel and turn campaign operations into a measurable enterprise capability."
        bullets={[
          "Omnichannel campaign management",
          "Real-time Next-Best-Action decisioning",
          "Customer journey and struggle analytics",
          "Marketing operations and budget control",
        ]}
        image="/images/editorial/service-marketing-v2.png"
        imagePosition="object-center"
        imageAlt="Marketing analytics team working with campaign intelligence"
        accent="#D995AD"
      />

      {/* Stats Bar */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {whyStats.map((s) => (
              <div key={s.stat}>
                <div className="text-4xl font-extrabold text-[#f472b6] mb-2">{s.stat}</div>
                <div className="text-sm text-text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ServiceAreasEditorial
        areas={serviceAreas}
        eyebrow="Marketing capabilities"
        title="One intelligence layer for every customer interaction."
        description="We connect campaign orchestration, decisioning and digital behavior so every channel learns from the same customer view."
        accent="#D995AD"
      />

      <DeliveryEditorial
        steps={processSteps}
        description="From platform implementation to live campaign orchestration."
        accent="#D995AD"
      />

      {/* Featured Success Stories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <h2 className="text-2xl font-extrabold text-brand-dark">
              Featured Success Stories
            </h2>
            <Link
              href="/use-cases"
              className="flex items-center gap-1.5 text-sm font-semibold text-[#f472b6]"
            >
              All success stories <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredUseCases.map((uc) => (
              <div
                key={uc.project}
                className="bg-white rounded-2xl border border-gray-200 hover:border-[#f472b6] hover:shadow-lg transition-all flex flex-col overflow-hidden group"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={uc.image}
                    alt={uc.project}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <span className="text-xs font-semibold bg-[#f472b6] text-white px-3 py-1 rounded-full">
                      {uc.industry}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-brand-dark mb-3">{uc.project}</h3>
                  <p className="text-sm text-text-muted mb-4 line-clamp-3">{uc.summary}</p>
                  <div className="bg-brand-light rounded-xl p-4 border border-gray-100 mt-auto">
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                      Key Result
                    </p>
                    <p className="text-sm font-semibold text-brand-dark">{uc.result}</p>
                  </div>
                </div>
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
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#07111F]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#f472b6]/10 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to make your marketing smarter?
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Talk to our Marketing Intelligence experts. No obligation, just clarity.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#f472b6] to-[#818cf8] text-white font-bold rounded-lg hover:shadow-[0_0_20px_rgba(244,114,182,0.4)] hover:-translate-y-1 transition-all"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  );
}
