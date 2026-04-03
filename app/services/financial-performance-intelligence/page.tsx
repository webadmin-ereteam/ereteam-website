"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown, ArrowRight, TrendingUp, GitBranch, Calendar, Cpu, Users } from "lucide-react";

const serviceAreas = [
  {
    icon: TrendingUp,
    color: "bg-blue-500",
    title: "Integrated Financial Planning",
    summary: "Driver-based models, rolling forecasts, cash flow",
    content:
      "We implement world-class FP&A platforms that consolidate budget planning, rolling forecasts, and cash flow planning into a single collaborative workspace. By replacing disconnected Excel models with driver-based planning, we help finance teams cut budget cycles from weeks to days while dramatically improving accuracy and auditability. Every assumption is visible, traceable, and version-controlled.",
    technologies: ["IBM Planning Analytics", "IBM TM1"],
  },
  {
    icon: GitBranch,
    color: "bg-violet-500",
    title: "Scenario Modelling & What-If Analysis",
    summary: "Dynamic scenarios linked to business drivers",
    content:
      "We build multi-scenario planning engines where executives can instantly stress-test assumptions and see the downstream P&L, balance sheet, and cash flow impact. Scenarios are linked directly to operational drivers — headcount, volume, pricing, FX — so every change propagates through the model automatically and consistently.",
    technologies: ["IBM Planning Analytics", "IBM TM1", "Power BI"],
  },
  {
    icon: Calendar,
    color: "bg-emerald-500",
    title: "Long-Term Business Forecasting",
    summary: "Multi-year models with macro and operational inputs",
    content:
      "We design long-range financial models that integrate macroeconomic assumptions, market dynamics, and internal operational drivers into coherent 3–10 year forecasts. These models support strategic decision-making, M&A evaluation, capital allocation, and investor communications — giving leadership a single version of the long-range truth.",
    technologies: ["IBM Planning Analytics", "IBM TM1", "Python"],
  },
  {
    icon: Cpu,
    color: "bg-orange-500",
    title: "AI-Powered Planning & Consolidation",
    summary: "Automated consolidation, eliminations, statutory reporting",
    content:
      "We automate statutory and management consolidation for groups with complex legal structures. Our solutions handle intercompany eliminations, multi-currency translation, minority interest calculations, and IFRS/GAAP adjustments. AI-assisted variance analysis and anomaly detection surface material issues before the close — reducing close cycles from weeks to days.",
    technologies: ["IBM Cognos Controller", "IBM Planning Analytics", "Theobald", "Python"],
  },
  {
    icon: Users,
    color: "bg-sky-500",
    title: "Sales & HR Planning",
    summary: "Quota planning, commission calculation, headcount planning",
    content:
      "We extend financial planning into commercial and workforce domains — building sales quota models, territory plans, commission calculation engines, and headcount cost models. Finance and HR get a shared planning language, with workforce costs and commercial targets fully integrated into the enterprise financial model.",
    technologies: ["IBM Planning Analytics", "IBM TM1", "Apparo Fast Edit"],
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
    result: "Budget cycle: 6 weeks to 10 days. 200+ users on one platform.",
  },
  {
    industry: "Banking",
    project: "Personnel Expense Planning",
    technologies: ["IBM Planning Analytics"],
    result: "HR cost planning fully integrated with financial P&L model",
  },
  {
    industry: "Energy",
    project: "P&L, Balance Sheet, Cash Flow, Hedge Accounting & Capex",
    technologies: ["IBM Planning Analytics", "Theobald"],
    result: "End-to-end financial planning including hedge accounting automation",
  },
  {
    industry: "Retail",
    project: "Sales Planning, Payroll, Actuals & Consolidation",
    technologies: ["IBM Planning Analytics"],
    result: "Retail chain sales and workforce planning on single platform",
  },
  {
    industry: "Insurance",
    project: "Agency Commission Calculation",
    technologies: ["IBM Planning Analytics"],
    result: "Complex commission logic automated — processing thousands of agents",
  },
  {
    industry: "Media",
    project: "CC Automation Planning",
    technologies: ["IBM Planning Analytics", "Power BI"],
    result: "Contact center workforce planning and cost modeling automated",
  },
];

const processSteps = [
  { number: "01", title: "Discovery", description: "Map current planning processes, data sources, and pain points" },
  { number: "02", title: "Design", description: "Define model architecture, driver logic, and integration blueprint" },
  { number: "03", title: "Build", description: "Develop TM1/PA models, consolidation rules, and reporting layer" },
  { number: "04", title: "Test", description: "UAT with finance team — validate against actuals and prior periods" },
  { number: "05", title: "Deploy", description: "Cutover, training, and hypercare for first full planning cycle" },
  { number: "06", title: "Optimize", description: "Post-cycle review, model enhancements, and ongoing support" },
];

const whyStats = [
  { stat: "25+", label: "Years implementing IBM Planning Analytics globally" },
  { stat: "50+", label: "FP&A and consolidation projects delivered" },
  { stat: "17", label: "Countries with active enterprise finance clients" },
];

export default function FinancialPerformancePage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
      {/* Hero */}
      <section
        className="pt-32 pb-20"
        style={{ background: "linear-gradient(135deg, #1A1A2E 0%, #2e1065 100%)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <Link href="/services" className="text-sm text-gray-400 hover:text-white transition-colors">
              ← Services
            </Link>
          </div>
          <p className="text-sm font-medium text-[#7C3AED] uppercase tracking-widest mb-3">
            Service Domain
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
            Financial Performance &amp; Intelligence
          </h1>
          <p className="text-lg text-[#7C3AED] font-semibold mb-6">
            From spreadsheet chaos to a single version of financial truth.
          </p>
          <p className="text-lg text-gray-300 max-w-2xl mb-8">
            Transform your finance function with integrated FP&amp;A, driver-based budgeting,
            financial consolidation, and regulatory reporting. We help CFOs and finance teams
            move from reactive reporting to proactive, data-driven decision support.
          </p>
          <ul className="space-y-2 text-gray-200 text-sm">
            {[
              "Driver-based planning models that update in real time",
              "Automated consolidation for complex multi-entity groups",
              "Scenario modelling and what-if analysis for leadership",
              "Sales, HR, and operational plans fully integrated with finance",
            ].map((bullet) => (
              <li key={bullet} className="flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#7C3AED] flex-shrink-0" />
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
                <div className="text-4xl font-extrabold text-[#7C3AED] mb-1">{s.stat}</div>
                <div className="text-sm text-text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why IBM Planning Analytics Spotlight */}
      <section className="py-16 bg-brand-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <p className="text-xs font-semibold text-[#7C3AED] uppercase tracking-widest mb-3">Platform Spotlight</p>
            <h2 className="text-2xl font-extrabold text-brand-dark mb-4">Why IBM Planning Analytics?</h2>
            <p className="text-text-body leading-relaxed mb-4">
              IBM Planning Analytics (TM1) is widely recognized as the world&apos;s best-in-class platform
              for enterprise financial planning, budgeting, and consolidation. Its in-memory OLAP engine
              can handle the most complex financial models — multi-currency, multi-entity, multi-scenario
              — while delivering sub-second calculation times even at scale.
            </p>
            <p className="text-text-body leading-relaxed">
              Ereteam is one of the deepest IBM Planning Analytics implementers globally, with dedicated
              TM1 developers who have built production models for tier-1 banks, insurers, energy companies,
              and global consumer brands. We don&apos;t configure out-of-the-box templates — we build
              bespoke financial models that mirror your exact business logic, reporting hierarchy, and
              regulatory requirements.
            </p>
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
                      className={`text-[#7C3AED] flex-shrink-0 transition-transform ml-4 ${openIndex === index ? "rotate-180" : ""}`}
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
                            className="text-xs px-3 py-1 bg-white border border-[#7C3AED]/20 text-[#7C3AED] rounded-full font-medium"
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

      {/* Engagement Process */}
      <section className="py-20 bg-brand-light">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-brand-dark mb-4">How We Deliver</h2>
            <p className="text-text-muted">A structured engagement that covers every phase from scoping to go-live.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {processSteps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#7C3AED] text-white font-extrabold text-sm flex items-center justify-center mx-auto mb-3">
                  {step.number}
                </div>
                <div className="font-bold text-brand-dark text-sm mb-1">{step.title}</div>
                <div className="text-xs text-text-muted leading-snug">{step.description}</div>
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
              className="flex items-center gap-1.5 text-sm font-semibold text-[#7C3AED]"
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
                  <span className="text-xs font-medium bg-[#7C3AED]/10 text-[#7C3AED] px-2 py-0.5 rounded-full">
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
                <p className="text-sm font-semibold text-[#7C3AED] mt-auto">{uc.result}</p>
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
        style={{ background: "linear-gradient(135deg, #1A1A2E 0%, #2e1065 100%)" }}
      >
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Ready to transform your finance function?
          </h2>
          <p className="text-gray-300 mb-8">
            Talk to our Financial Performance experts. No obligation, just clarity.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-8 py-4 bg-[#7C3AED] text-white font-semibold rounded-lg hover:bg-opacity-90 transition-all"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </>
  );
}
