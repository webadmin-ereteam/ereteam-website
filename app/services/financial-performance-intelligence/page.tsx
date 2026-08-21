"use client";

import Link from "next/link";
import { ArrowRight, TrendingUp, GitBranch, Calendar, Cpu, Users } from "lucide-react";
import Image from "next/image";
import ServiceDetailHero from "@/components/detail/ServiceDetailHero";
import { DeliveryEditorial, ServiceAreasEditorial } from "@/components/detail/ServiceEditorialSections";

const serviceAreas = [
  {
    icon: TrendingUp,
    color: "bg-blue-500",
    title: "Integrated Financial Planning",
    summary: "Driver-based models, rolling forecasts, cash flow",
    content:
      "We implement world-class FP&A platforms that consolidate budget planning, rolling forecasts, and cash flow planning into a single collaborative workspace. By replacing disconnected Excel models with driver-based planning, we help finance teams cut budget cycles from weeks to days while dramatically improving accuracy and auditability. Every assumption is visible, traceable, and version-controlled.",
    technologies: ["IBM Planning Analytics", "IBM TM1"],
    image: "/images/editorial/service-detail/finance-integrated-planning.jpg",
  },
  {
    icon: GitBranch,
    color: "bg-violet-500",
    title: "Scenario Modelling & What-If Analysis",
    summary: "Dynamic scenarios linked to business drivers",
    content:
      "We build multi-scenario planning engines where executives can instantly stress-test assumptions and see the downstream P&L, balance sheet, and cash flow impact. Scenarios are linked directly to operational drivers — headcount, volume, pricing, FX — so every change propagates through the model automatically and consistently.",
    technologies: ["IBM Planning Analytics", "IBM TM1", "Power BI"],
    image: "/images/editorial/service-detail/finance-scenario-modelling.jpg",
  },
  {
    icon: Calendar,
    color: "bg-emerald-500",
    title: "Long-Term Business Forecasting",
    summary: "Multi-year models with macro and operational inputs",
    content:
      "We design long-range financial models that integrate macroeconomic assumptions, market dynamics, and internal operational drivers into coherent 3–10 year forecasts. These models support strategic decision-making, M&A evaluation, capital allocation, and investor communications — giving leadership a single version of the long-range truth.",
    technologies: ["IBM Planning Analytics", "IBM TM1", "Python"],
    image: "/images/editorial/service-detail/finance-long-term-forecasting.jpg",
  },
  {
    icon: Cpu,
    color: "bg-orange-500",
    title: "AI-Powered Planning & Consolidation",
    summary: "Automated consolidation, eliminations, statutory reporting",
    content:
      "We automate statutory and management consolidation for groups with complex legal structures. Our solutions handle intercompany eliminations, multi-currency translation, minority interest calculations, and IFRS/GAAP adjustments. AI-assisted variance analysis and anomaly detection surface material issues before the close — reducing close cycles from weeks to days.",
    technologies: ["IBM Cognos Controller", "IBM Planning Analytics", "Theobald", "Python"],
    image: "/images/editorial/service-detail/finance-ai-consolidation.jpg",
  },
  {
    icon: Users,
    color: "bg-sky-500",
    title: "Sales & HR Planning",
    summary: "Quota planning, commission calculation, headcount planning",
    content:
      "We extend financial planning into commercial and workforce domains — building sales quota models, territory plans, commission calculation engines, and headcount cost models. Finance and HR get a shared planning language, with workforce costs and commercial targets fully integrated into the enterprise financial model.",
    technologies: ["IBM Planning Analytics", "IBM TM1", "Apparo Fast Edit"],
    image: "/images/editorial/service-detail/finance-sales-hr-planning.jpg",
  },
];

const techPartners = [
  { name: "IBM Planning Analytics" },
  { name: "IBM Cognos Controller" },
  { name: "IBM Cognos Analytics" },
  { name: "Apparo Fast Edit" },
  { name: "Power BI" },
  { name: "Tableau" },
];

const featuredUseCases = [
  {
    industry: "Banking",
    project: "Full Banking P&L, FTP, RWA, OPEX/CAPEX & Financial Statements",
    technologies: ["IBM Planning Analytics"],
    summary: "Built a fully integrated financial planning model for a major bank, replacing hundreds of Excel sheets with a unified, driver-based platform.",
    result: "Budget cycle: 6 weeks to 10 days. 200+ users on one platform.",
    image: "https://images.unsplash.com/photo-1599658880436-c61792e70672?auto=format&fit=crop&q=80&w=1000",
  },
  {
    industry: "Banking",
    project: "Personnel Expense Planning",
    technologies: ["IBM Planning Analytics"],
    summary: "Delivered a dedicated HR planning module to accurately forecast headcount costs, promotions, and bonuses directly linked to the corporate P&L.",
    result: "HR cost planning fully integrated with financial P&L model",
    image: "https://images.unsplash.com/photo-1542744173-05336fcc7ad4?auto=format&fit=crop&q=80&w=1000",
  },
  {
    industry: "Energy",
    project: "P&L, Balance Sheet, Cash Flow, Hedge Accounting & Capex",
    technologies: ["IBM Planning Analytics", "Theobald"],
    summary: "Automated end-to-end financial forecasting for a top energy provider, including complex hedge accounting rules and capital expenditure modeling.",
    result: "End-to-end financial planning including hedge accounting automation",
    image: "https://images.unsplash.com/photo-1651341050677-24dba59ce0fd?auto=format&fit=crop&q=80&w=1000",
  },
  {
    industry: "Retail",
    project: "Sales Planning, Payroll, Actuals & Consolidation",
    technologies: ["IBM Planning Analytics"],
    summary: "Enabled store-level sales planning and payroll forecasting for a retail chain, providing management with real-time consolidated profitability.",
    result: "Retail chain sales and workforce planning on single platform",
    image: "https://images.unsplash.com/photo-1748439435495-722cc1728b7e?auto=format&fit=crop&q=80&w=1000",
  },
  {
    industry: "Insurance",
    project: "Agency Commission Calculation",
    technologies: ["IBM Planning Analytics"],
    summary: "Replaced a rigid legacy system with a flexible commission calculation engine that dynamically processes tiers and bonuses for thousands of agents.",
    result: "Complex commission logic automated — processing thousands of agents",
    image: "https://images.unsplash.com/photo-1763038311036-6d18805537e5?auto=format&fit=crop&q=80&w=1000",
  },
  {
    industry: "Media",
    project: "CC Automation Planning",
    technologies: ["IBM Planning Analytics", "Power BI"],
    summary: "Optimized contact center workforce planning by modeling agent shifts, call volumes, and operational costs against expected service level agreements.",
    result: "Contact center workforce planning and cost modeling automated",
    image: "https://images.unsplash.com/photo-1686061593213-98dad7c599b9?auto=format&fit=crop&q=80&w=1000",
  },
];

const processSteps = [
  { title: "Discovery", description: "Map current planning processes, data sources, and pain points" },
  { title: "Design", description: "Define model architecture, driver logic, and integration blueprint" },
  { title: "Build", description: "Develop TM1/PA models, consolidation rules, and reporting layer" },
  { title: "Test", description: "UAT with finance team — validate against actuals and prior periods" },
  { title: "Deploy", description: "Cutover, training, and hypercare for first full planning cycle" },
  { title: "Optimize", description: "Post-cycle review, model enhancements, and ongoing support" },
];

const whyStats = [
  { stat: "25+", label: "Years implementing IBM Planning Analytics globally" },
  { stat: "50+", label: "FP&A and consolidation projects delivered" },
  { stat: "17", label: "Countries with active enterprise finance clients" },
];

export default function FinancialPerformancePage() {
  return (
    <div className="detail-page">
      <ServiceDetailHero
        title="Financial Performance & Intelligence"
        tagline="From spreadsheet chaos to a single version of financial truth."
        description="Transform finance with integrated FP&A, driver-based budgeting, consolidation and regulatory reporting. We help CFOs move from reactive reporting to proactive decision support."
        bullets={[
          "Driver-based planning in real time",
          "Multi-entity financial consolidation",
          "Scenario modelling for leadership",
          "Integrated sales, HR and operational plans",
        ]}
        image="/images/editorial/service-finance-v2.png"
        imageAlt="Finance leaders reviewing planning and reporting"
        accent="#D69A6E"
      />

      {/* Stats Bar */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {whyStats.map((s) => (
              <div key={s.stat}>
                <div className="text-4xl font-extrabold text-[#10b981] mb-2">{s.stat}</div>
                <div className="text-sm text-text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why IBM Planning Analytics Spotlight */}
      <section className="py-16 bg-brand-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid border-y border-[#071a2a]/16 py-8 lg:grid-cols-[.38fr_1.62fr] lg:gap-12 lg:py-10">
            <div>
              <p className="text-xs font-semibold text-[#10b981] uppercase tracking-widest">Platform Spotlight</p>
              <span className="mt-5 hidden h-px w-20 bg-[#10b981] lg:block" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-brand-dark">Why IBM Planning Analytics?</h2>
              <div className="mt-7 grid gap-6 lg:grid-cols-2 lg:gap-10">
                <p className="text-text-body leading-relaxed">
                  IBM Planning Analytics (TM1) is widely recognized as the world&apos;s best-in-class platform
                  for enterprise financial planning, budgeting, and consolidation. Its in-memory OLAP engine
                  handles complex multi-currency, multi-entity and multi-scenario models at scale.
                </p>
                <p className="text-text-body leading-relaxed">
                  Ereteam&apos;s dedicated TM1 specialists build production models for banks, insurers, energy
                  companies and global consumer brands—mirroring each organization&apos;s business logic,
                  reporting hierarchy and regulatory requirements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ServiceAreasEditorial
        areas={serviceAreas}
        eyebrow="Finance capabilities"
        title="Planning, reporting and performance in one connected model."
        description="We connect strategic targets with operational drivers so finance teams can plan continuously and explain every decision."
        accent="#D69A6E"
      />

      <DeliveryEditorial
        steps={processSteps}
        description="A structured engagement that covers every phase from scoping to go-live."
        accent="#D69A6E"
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
              className="flex items-center gap-1.5 text-sm font-semibold text-[#10b981] hover:text-[#047857] transition-colors"
            >
              All success stories <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredUseCases.map((uc) => (
              <div
                key={uc.project}
                className="bg-white rounded-2xl border border-gray-200 hover:border-[#10b981] hover:shadow-lg transition-all flex flex-col overflow-hidden group"
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
                    <span className="text-xs font-semibold bg-[#10b981] text-white px-3 py-1 rounded-full">
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
      <section className="py-16 bg-brand-light border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-500 mb-8 text-center uppercase tracking-wider">
            Technology Partners
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {techPartners.map((partner) => (
              <div
                key={partner.name}
                className="px-6 py-3 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors shadow-sm"
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
          <div className="absolute inset-0 bg-[#0B0F19]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#10b981]/10 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to transform your finance function?
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Talk to our Financial Performance experts. No obligation, just clarity.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#10b981] to-[#047857] text-white font-bold rounded-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:-translate-y-1 transition-all"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  );
}
