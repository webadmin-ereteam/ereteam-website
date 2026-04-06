import { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Shield, CheckCircle, Lock, TrendingUp, ArrowRight, Server, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Obserian – Enterprise Data Governance Platform",
  description:
    "Obserian is an AI-powered data quality and governance platform. Automated validation, lineage tracking, compliance reporting at enterprise scale.",
};

const steps = [
  {
    id: "CONNECT",
    color: "bg-blue-600",
    title: "Connect Your Data Sources",
    description: "Integrate with any database, data warehouse, or data lake — on-premise or cloud. Obserian discovers assets automatically and builds an inventory within hours.",
  },
  {
    id: "MONITOR",
    color: "bg-[#5a3a8a]",
    title: "AI Monitors Quality Continuously",
    description: "Machine learning engine learns your normal data patterns and flags anomalies in real time. No manual rule-writing required — Obserian proposes rules based on observed data behavior.",
  },
  {
    id: "GOVERN",
    color: "bg-[#7454A2]",
    title: "Govern With Context",
    description: "Assign ownership, enrich with business definitions, and map data lineage end-to-end. Stewards and consumers work from the same catalog — technical and business views unified.",
  },
  {
    id: "CERTIFY",
    color: "bg-[#4a2a72]",
    title: "Report & Certify",
    description: "Generate compliance reports for GDPR, BCBS 239, DORA, and internal standards at the push of a button. Certified datasets signal trust to data consumers downstream.",
  },
];

const capabilities = [
  {
    icon: Shield,
    title: "AI-Powered Data Quality",
    description:
      "Obserian's machine learning engine automatically learns your data patterns and proposes validation rules — catching anomalies, outliers, and quality issues before they propagate downstream. Rules are self-learning and adapt as your data evolves.",
  },
  {
    icon: TrendingUp,
    title: "End-to-End Data Lineage",
    description:
      "Track every data element from source to consumption. Obserian automatically maps transformations, dependencies, and data flows across your entire technical estate — giving data stewards and auditors a complete impact analysis capability.",
  },
  {
    icon: CheckCircle,
    title: "Business Metadata Management",
    description:
      "Connect technical data assets to business context with an intuitive data catalog. Business users can find, understand, and trust data through rich business glossaries, ownership tracking, and certified data sets.",
  },
  {
    icon: Lock,
    title: "Compliance & Audit Reporting",
    description:
      "Generate automated compliance reports for GDPR, BCBS 239, DORA, and internal data governance standards. Complete audit trails, access controls, and data classification ensure you can demonstrate data governance maturity to regulators.",
  },
];

const metrics = [
  { value: "90%", label: "Reduction in data quality incidents" },
  { value: "60%", label: "Faster audit preparation" },
  { value: "3×", label: "Improvement in data consumer trust" },
  { value: "40%", label: "Less time on issue resolution" },
];

const comparison = [
  { criterion: "Setup Time", manual: "Ongoing", legacy: "12–18 months", obserian: "Weeks" },
  { criterion: "AI Detection", manual: "None", legacy: "Rule-based only", obserian: "Native ML" },
  { criterion: "Data Lineage", manual: "Spreadsheets", legacy: "Partial", obserian: "End-to-end" },
  { criterion: "Business Catalog", manual: "None", legacy: "Complex", obserian: "Built-in" },
  { criterion: "Compliance Reports", manual: "Manual", legacy: "Limited", obserian: "Automated" },
  { criterion: "Time to Value", manual: "Never", legacy: "12–18 months", obserian: "4–8 weeks" },
];

const deploymentOptions = [
  {
    title: "Cloud (SaaS)",
    desc: "Fully managed on AWS, Azure, or GCP. Fastest time to value.",
    options: ["AWS", "Microsoft Azure", "Google Cloud Platform"],
  },
  {
    title: "On-Premise",
    desc: "Deploy within your own data center for maximum control.",
    options: ["Docker / Kubernetes", "VMware", "Bare Metal"],
  },
  {
    title: "Hybrid",
    desc: "Control plane in your environment, managed services in the cloud.",
    options: ["Mixed cloud/on-prem", "Air-gapped support"],
  },
];

export default function OberianPage() {
  return (
    <>
      {/* Hero */}
      <section
        className="pt-32 pb-20"
        style={{ background: "linear-gradient(135deg, #1A1A2E 0%, #2d1a4a 100%)" }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <Link href="/products" className="text-sm text-gray-400 hover:text-white transition-colors">
              ← Products
            </Link>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
            <div className="flex-1">
              <div className="mb-6 pb-6 border-b border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logos/products/obserian.svg" alt="Obserian" className="h-10 w-auto max-w-[200px] object-contain" />
              </div>
              <p className="text-sm font-medium text-[#7454A2] uppercase tracking-widest mb-3">
                Enterprise Data Governance Platform
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
                Your data quality problems are invisible.{" "}
                <span className="text-[#7454A2]">Until they become a crisis.</span>
              </h1>
              <p className="text-lg text-gray-300 mb-6 max-w-xl">
                Obserian is the AI-powered data governance platform that continuously monitors data quality, maps lineage end-to-end, and automates compliance reporting — so your organization stays in control at enterprise scale.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center px-6 py-3 bg-[#7454A2] text-white font-semibold rounded-lg hover:bg-opacity-90 transition-all text-sm"
                >
                  Request a Demo
                </Link>
                <a
                  href="https://obserian.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition-all text-sm"
                >
                  Visit obserian.com <ExternalLink size={14} />
                </a>
              </div>
            </div>
            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 lg:w-72 flex-shrink-0">
              {metrics.map((m) => (
                <div
                  key={m.label}
                  className="bg-white/10 rounded-xl p-4 text-center border border-white/10"
                >
                  <div className="text-2xl font-extrabold text-[#7454A2] mb-1">{m.value}</div>
                  <div className="text-xs text-gray-300 leading-tight">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-[#7454A2] uppercase tracking-widest mb-2">The Real Problem</p>
            <h2 className="text-3xl font-extrabold text-brand-dark mb-4">
              Same data. Different definitions. Zero trust.
            </h2>
            <p className="text-text-muted max-w-2xl mx-auto">
              Every team calculates revenue differently. No one owns the data. Auditors ask for lineage and nobody knows where to look.
            </p>
          </div>
          <div className="space-y-2 mb-10">
            {[
              { team: "Finance", field: "Revenue", value: "$48.2M", note: "Excludes returns, uses invoice date" },
              { team: "Sales", field: "Revenue", value: "$51.7M", note: "Gross bookings, uses order date" },
              { team: "Operations", field: "Revenue", value: "$46.9M", note: "Cash received, excludes pending" },
              { team: "Executive BI", field: "Revenue", value: "$49.1M", note: "Unknown transformation, undocumented" },
            ].map((row) => (
              <div key={row.team} className="flex items-center gap-3 rounded-xl overflow-hidden border border-gray-200">
                <div className="bg-[#2d1a4a] text-white text-xs font-semibold px-4 py-3 w-28 flex-shrink-0">{row.team}</div>
                <div className="bg-[#7454A2] text-white text-xs font-bold px-3 py-3 w-24 flex-shrink-0">{row.value}</div>
                <div className="bg-[#1e1e3f] text-white text-xs px-4 py-3 flex-1">{row.note}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { chain: "Inconsistent Data → Wrong Reports → Bad Decisions", outcome: "Lost Revenue", color: "bg-purple-50 border-purple-200" },
              { chain: "No Lineage → Audit Failures → Regulatory Risk", outcome: "Compliance Exposure", color: "bg-indigo-50 border-indigo-200" },
              { chain: "No Ownership → Manual Fixes → Wasted Hours", outcome: "High Costs", color: "bg-blue-50 border-blue-200" },
            ].map((item) => (
              <div key={item.outcome} className={`rounded-xl p-4 border ${item.color}`}>
                <p className="text-xs text-text-muted mb-2">{item.chain}</p>
                <p className="font-bold text-brand-dark flex items-center gap-1">
                  <ArrowRight size={14} className="text-[#7454A2]" /> {item.outcome}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-brand-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-[#7454A2] uppercase tracking-widest mb-2">How It Works</p>
            <h2 className="text-3xl font-extrabold text-brand-dark mb-4">
              From data chaos to governed, trusted assets
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={step.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm relative">
                <span className={`inline-block text-xs font-bold text-white px-3 py-1 rounded-full mb-4 ${step.color}`}>
                  {step.id}
                </span>
                {i < steps.length - 1 && (
                  <ArrowRight size={16} className="absolute -right-3 top-8 text-gray-300 hidden lg:block" />
                )}
                <h3 className="font-bold text-brand-dark mb-2 text-sm">{step.title}</h3>
                <p className="text-xs text-text-muted leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-[#7454A2] uppercase tracking-widest mb-2">Platform</p>
            <h2 className="text-3xl font-extrabold text-brand-dark">Built for Enterprise Governance</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {capabilities.map((cap) => {
              const Icon = cap.icon;
              return (
                <div
                  key={cap.title}
                  className="bg-brand-light rounded-2xl p-8 border border-gray-200 hover:border-[#7454A2] hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 bg-[#7454A2]/10 rounded-xl flex items-center justify-center mb-5">
                    <Icon size={24} className="text-[#7454A2]" />
                  </div>
                  <h3 className="text-lg font-bold text-brand-dark mb-3">{cap.title}</h3>
                  <p className="text-sm text-text-body leading-relaxed">{cap.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 bg-brand-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-[#7454A2] uppercase tracking-widest mb-2">Comparison</p>
            <h2 className="text-3xl font-extrabold text-brand-dark mb-2">Not Another Data Catalog</h2>
            <p className="text-text-muted">See how Obserian compares to the alternatives</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="grid grid-cols-4 text-xs font-bold uppercase tracking-wider">
              <div className="p-4 bg-gray-50 border-b border-gray-200"></div>
              <div className="p-4 bg-gray-50 border-b border-gray-200 text-center text-blue-500">Manual Processes</div>
              <div className="p-4 bg-gray-50 border-b border-gray-200 text-center text-blue-600">Legacy Tools</div>
              <div className="p-4 bg-[#7454A2]/10 border-b border-[#7454A2]/20 text-center text-[#7454A2]">obserian</div>
            </div>
            {comparison.map((row, i) => (
              <div key={row.criterion} className={`grid grid-cols-4 text-sm ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                <div className="p-4 font-medium text-brand-dark border-b border-gray-100">{row.criterion}</div>
                <div className="p-4 text-center text-text-muted border-b border-gray-100">{row.manual}</div>
                <div className="p-4 text-center text-text-muted border-b border-gray-100">{row.legacy}</div>
                <div className="p-4 text-center font-semibold text-[#7454A2] bg-[#7454A2]/5 border-b border-[#7454A2]/10">{row.obserian}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deployment & Security */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-[#7454A2] uppercase tracking-widest mb-2">Infrastructure</p>
            <h2 className="text-3xl font-extrabold text-brand-dark mb-4">Flexible Deployment</h2>
            <p className="text-text-muted max-w-xl mx-auto">
              Deploy Obserian wherever your data lives — cloud, on-premise, or hybrid.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {deploymentOptions.map((opt) => (
              <div key={opt.title} className="bg-brand-light rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <Server size={20} className="text-[#7454A2]" />
                  <h3 className="font-bold text-brand-dark">{opt.title}</h3>
                </div>
                <p className="text-sm text-text-muted mb-4">{opt.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {opt.options.map((o) => (
                    <span key={o} className="text-xs px-2 py-1 bg-white rounded-md border border-gray-200 text-text-muted">
                      {o}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {/* Security chips */}
          <div className="bg-[#1A1A2E] rounded-2xl p-8">
            <div className="flex items-center gap-2 mb-5">
              <AlertTriangle size={18} className="text-[#7454A2]" />
              <p className="text-sm font-semibold text-white">Security &amp; Compliance</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                "SOC 2 Type II certified",
                "ISO 27001 aligned",
                "GDPR compliant",
                "TLS 1.3 encryption",
                "Role-based access (RBAC)",
                "SSO (SAML / OIDC)",
                "Full audit logging",
                "Data residency options",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 bg-white/10 px-4 py-3 rounded-xl border border-white/10 text-sm text-gray-300">
                  <Lock size={12} className="text-[#7454A2] flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-16"
        style={{ background: "linear-gradient(135deg, #1A1A2E 0%, #2d1a4a 100%)" }}
      >
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Ready to govern your data with confidence?
          </h2>
          <p className="text-gray-300 mb-8">
            Request a personalized demo — we&apos;ll show you exactly how Obserian fits your governance landscape.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-[#7454A2] text-white font-semibold rounded-lg hover:bg-opacity-90 transition-all"
            >
              Request a Demo
            </Link>
            <a
              href="https://obserian.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition-all"
            >
              Visit obserian.com <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
