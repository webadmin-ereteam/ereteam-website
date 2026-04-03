import { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Database, CheckCircle, Globe, Shield, Zap, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Pharmeta – AI-Powered Product Data Platform",
  description:
    "Pharmeta is the secure AI-powered data platform that enables organizations to clean and manage product and customer data — turning distributor chaos into clean, standardized golden records.",
};

const steps = [
  {
    id: "COLLECT",
    color: "bg-blue-500",
    title: "Collect From Anywhere",
    description: "Gather product and sales data from any source — Email, SFTP, API, Database, or Web Crawl. All your distributors, one platform.",
  },
  {
    id: "MATCH",
    color: "bg-purple-400",
    title: "AI Maps SKUs Automatically",
    description: "AI engine matches distributor SKUs to your product catalog with confidence scores. Smart matching handles abbreviations, typos, and format variations.",
  },
  {
    id: "CERTIFY",
    color: "bg-purple-500",
    title: "Approve Golden Records",
    description: "Review AI recommendations and approve golden records with full audit trail. Nothing goes live without your sign-off.",
  },
  {
    id: "ACT",
    color: "bg-purple-700",
    title: "Report With Confidence",
    description: "Once data is clean and standardized, downstream analytics, dashboards, and reporting all work from a single source of truth.",
  },
];

const capabilities = [
  {
    icon: Database,
    title: "AI SKU Matching",
    description:
      "The same product arrives as six different names from six distributors. Pharmeta's AI automatically maps all variants to a single golden record — handling abbreviations, typos, language differences, and format variations across every market.",
  },
  {
    icon: CheckCircle,
    title: "Golden Record Management",
    description:
      "Create and maintain a single source of truth for every product in your catalog. Full audit trail on every change, approval workflow built in, and version history for compliance.",
  },
  {
    icon: Globe,
    title: "Multi-Market Ready",
    description:
      "One platform for all your markets. Manage 50+ distributors across 14+ countries from a single interface, with global view and local detail. Already proven across MEA and Asia Pacific.",
  },
  {
    icon: Shield,
    title: "Secure by Design",
    description:
      "Your data stays yours. Enterprise-grade security and compliance built in from day one. SaaS deployment means no infrastructure to manage — always up to date.",
  },
];

const metrics = [
  { value: "90%", label: "Reduction in manual mapping time" },
  { value: "80%+", label: "Auto-match rate" },
  { value: "Hours→Min", label: "New product onboarding time" },
  { value: "4–6 weeks", label: "Time to value" },
];

const comparison = [
  { criterion: "Implementation", excel: "Immediate", mdm: "Months", pharmeta: "Weeks" },
  { criterion: "AI Matching", excel: "None", mdm: "Limited", pharmeta: "Native" },
  { criterion: "User Friendly", excel: "High", mdm: "Low", pharmeta: "High" },
  { criterion: "Scalability", excel: "Poor", mdm: "Good", pharmeta: "Excellent" },
  { criterion: "Cost", excel: "Low upfront", mdm: "High", pharmeta: "Predictable" },
  { criterion: "Time to Value", excel: "Never", mdm: "6–12 months", pharmeta: "4–6 weeks" },
];

export default function PharmPage() {
  return (
    <>
      {/* Hero */}
      <section
        className="pt-32 pb-20"
        style={{ background: "linear-gradient(135deg, #0a1628 0%, #1a2a5e 100%)" }}
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
                <img src="/logos/products/pharmeta_logo.png" alt="Pharmeta" className="h-10 w-auto max-w-[220px] object-contain" />
              </div>
              <p className="text-sm font-medium text-[#8B6FD4] uppercase tracking-widest mb-3">
                AI-Powered Data Platform
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
                Your data is costing you money.{" "}
                <span className="text-[#8B6FD4]">You just don&apos;t see it yet.</span>
              </h1>
              <p className="text-lg text-gray-300 mb-6 max-w-xl">
                Pharmeta is the secure AI-powered data platform that enables organizations to clean and manage product and customer data in less time — enabling everyone to do their jobs more effectively, efficiently, and profitably.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center px-6 py-3 bg-[#8B6FD4] text-white font-semibold rounded-lg hover:bg-opacity-90 transition-all text-sm"
                >
                  Request a Demo
                </Link>
                <a
                  href="https://pharmeta.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition-all text-sm"
                >
                  Visit pharmeta.io <ExternalLink size={14} />
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
                  <div className="text-2xl font-extrabold text-[#8B6FD4] mb-1">{m.value}</div>
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
            <p className="text-sm font-medium text-[#8B6FD4] uppercase tracking-widest mb-2">The Real Problem</p>
            <h2 className="text-3xl font-extrabold text-brand-dark mb-4">
              Same product. Six different names. Zero clarity.
            </h2>
            <p className="text-text-muted max-w-2xl mx-auto">
              Every distributor codes your products differently. The result: wrong reports, bad decisions, lost revenue — and weeks of manual cleanup every month.
            </p>
          </div>
          <div className="space-y-2 mb-10">
            {[
              { dist: "Distributor A", sku: "60127805", name: "DENTICORE Toothpaste Deep Clean Gel 75 ml" },
              { dist: "Distributor B", sku: "6010001", name: "DENTICORE DEEP CLEAN 75ML TP" },
              { dist: "Distributor C", sku: "SN2431", name: "DENTICORE DEEP CLEAN 1X75ML" },
              { dist: "Distributor D", sku: "Sku-7743", name: "DCORE T/PASTE DEEP CLEAN GEL 75ML12X75ML" },
              { dist: "Distributor E", sku: "A135", name: "DC T/PASTE DEEP CLEAN GEL 75ML(SPRINT)" },
            ].map((row) => (
              <div key={row.sku} className="flex items-center gap-3 rounded-xl overflow-hidden border border-gray-200">
                <div className="bg-[#1a2a5e] text-white text-xs font-semibold px-4 py-3 w-32 flex-shrink-0">{row.dist}</div>
                <div className="bg-[#38BDF8] text-white text-xs font-bold px-3 py-3 w-24 flex-shrink-0">{row.sku}</div>
                <div className="bg-[#1e3a5f] text-white text-xs px-4 py-3 flex-1">{row.name}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { chain: "Bad Data → Wrong Reports → Bad Decisions", outcome: "Lost Revenue", color: "bg-blue-50 border-blue-200" },
              { chain: "Bad Data → Manual Fixes → Wasted Hours", outcome: "High Costs", color: "bg-purple-50 border-purple-200" },
              { chain: "Bad Data → Slow Response → Unhappy Customers", outcome: "Lost Trust", color: "bg-indigo-50 border-indigo-200" },
            ].map((item) => (
              <div key={item.outcome} className={`rounded-xl p-4 border ${item.color}`}>
                <p className="text-xs text-text-muted mb-2">{item.chain}</p>
                <p className="font-bold text-brand-dark flex items-center gap-1">
                  <ArrowRight size={14} className="text-[#8B6FD4]" /> {item.outcome}
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
            <p className="text-sm font-medium text-[#8B6FD4] uppercase tracking-widest mb-2">How It Works</p>
            <h2 className="text-3xl font-extrabold text-brand-dark mb-4">
              AI-powered data platform that turns chaos into clarity
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
            <p className="text-sm font-medium text-[#8B6FD4] uppercase tracking-widest mb-2">Platform</p>
            <h2 className="text-3xl font-extrabold text-brand-dark">Built for Scale</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {capabilities.map((cap) => {
              const Icon = cap.icon;
              return (
                <div
                  key={cap.title}
                  className="bg-brand-light rounded-2xl p-8 border border-gray-200 hover:border-[#8B6FD4] hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 bg-[#8B6FD4]/10 rounded-xl flex items-center justify-center mb-5">
                    <Icon size={24} className="text-[#8B6FD4]" />
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
            <p className="text-sm font-medium text-[#8B6FD4] uppercase tracking-widest mb-2">Comparison</p>
            <h2 className="text-3xl font-extrabold text-brand-dark mb-2">Not Another MDM Tool</h2>
            <p className="text-text-muted">See how Pharmeta compares</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="grid grid-cols-4 text-xs font-bold uppercase tracking-wider">
              <div className="p-4 bg-gray-50 border-b border-gray-200"></div>
              <div className="p-4 bg-gray-50 border-b border-gray-200 text-center text-blue-500">Manual / Excel</div>
              <div className="p-4 bg-gray-50 border-b border-gray-200 text-center text-blue-600">Generic MDM</div>
              <div className="p-4 bg-[#8B6FD4]/10 border-b border-[#8B6FD4]/20 text-center text-[#8B6FD4]">pharmeta</div>
            </div>
            {comparison.map((row, i) => (
              <div key={row.criterion} className={`grid grid-cols-4 text-sm ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                <div className="p-4 font-medium text-brand-dark border-b border-gray-100">{row.criterion}</div>
                <div className="p-4 text-center text-text-muted border-b border-gray-100">{row.excel}</div>
                <div className="p-4 text-center text-text-muted border-b border-gray-100">{row.mdm}</div>
                <div className="p-4 text-center font-semibold text-[#8B6FD4] bg-[#8B6FD4]/5 border-b border-[#8B6FD4]/10">{row.pharmeta}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Proven */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-sm font-medium text-[#8B6FD4] uppercase tracking-widest mb-2">Proven</p>
            <h2 className="text-3xl font-extrabold text-brand-dark mb-2">Proven in Pharma & FMCG</h2>
            <p className="text-text-muted">Trusted by global brands managing complex multi-market operations</p>
          </div>
          <div className="bg-brand-light rounded-2xl p-8 border border-gray-200">
            <p className="text-sm font-bold text-[#38BDF8] mb-4">Global Consumer Healthcare Company</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "14+ markets across MEA and Asia Pacific",
                "50+ distributors with different SKU naming conventions",
                "2,000+ golden product records created and maintained",
                "86%+ automatic mapping rate achieved",
                "Weeks of manual work reduced to hours",
              ].map((point) => (
                <div key={point} className="flex items-start gap-2">
                  <Zap size={14} className="text-[#8B6FD4] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-text-body">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-16"
        style={{ background: "linear-gradient(135deg, #0a1628 0%, #1a2a5e 100%)" }}
      >
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            See Pharmeta in action with your own data
          </h2>
          <p className="text-gray-300 mb-8">
            Request a personalized demo — we&apos;ll show you exactly how Pharmeta handles your SKU landscape.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-[#8B6FD4] text-white font-semibold rounded-lg hover:bg-opacity-90 transition-all"
            >
              Request a Demo
            </Link>
            <a
              href="https://pharmeta.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition-all"
            >
              Visit pharmeta.io <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
