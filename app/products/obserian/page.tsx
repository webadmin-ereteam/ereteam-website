import { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Shield, CheckCircle, Server, Lock, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Obserian – Enterprise Data Governance Platform",
  description:
    "Obserian is an AI-powered data quality and governance platform. Automated validation, lineage tracking, compliance reporting at enterprise scale.",
};

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
      "Generate automated compliance reports for GDPR, BCBS 239, DORA, and internal data governance standards. Complete audit trails, access controls, and data classification ensure you can demonstrate data governance maturity to regulators and auditors.",
  },
];

const validationRules = [
  "Completeness & Null checks",
  "Referential integrity validation",
  "Format & pattern validation",
  "Statistical anomaly detection",
  "Cross-system consistency checks",
  "Temporal consistency validation",
  "Business rule enforcement",
  "Duplicate detection & deduplication",
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

const security = [
  "SOC 2 Type II certified",
  "ISO 27001 aligned",
  "GDPR compliant architecture",
  "End-to-end encryption (TLS 1.3)",
  "Role-based access control (RBAC)",
  "Single Sign-On (SAML / OIDC)",
  "Comprehensive audit logging",
  "Data residency options",
];

const benefits = [
  { metric: "90%", label: "Reduction in data quality incidents" },
  { metric: "60%", label: "Faster regulatory audit preparation" },
  { metric: "3x", label: "Improvement in data consumer trust scores" },
  { metric: "40%", label: "Less time spent on data issue resolution" },
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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <div className="mb-6 pb-6 border-b border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logos/products/obserian.svg" alt="Obserian" className="h-10 w-auto max-w-[200px] object-contain brightness-0 invert" />
              </div>
              <p className="text-sm font-medium text-[#7454A2] uppercase tracking-widest mb-3">
                Data Observability Platform
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
                Obserian
              </h1>
              <p className="text-lg text-gray-300 mb-6 max-w-xl">
                AI-powered data quality and governance platform. Automated validation,
                end-to-end lineage, and compliance reporting — at enterprise scale.
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
            {/* Benefits quick stats */}
            <div className="grid grid-cols-2 gap-4 lg:w-72 flex-shrink-0">
              {benefits.map((b) => (
                <div
                  key={b.label}
                  className="bg-white/10 rounded-xl p-4 text-center border border-white/10"
                >
                  <div className="text-2xl font-extrabold text-[#7454A2] mb-1">
                    {b.metric}
                  </div>
                  <div className="text-xs text-gray-300 leading-tight">{b.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-brand-dark mb-4">
              Core Capabilities
            </h2>
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
                  <h3 className="text-lg font-bold text-brand-dark mb-3">
                    {cap.title}
                  </h3>
                  <p className="text-sm text-text-body leading-relaxed">
                    {cap.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Validation Rules */}
      <section className="py-16 bg-brand-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold text-brand-dark mb-2">
              Built-in Validation Framework
            </h2>
            <p className="text-text-muted">
              100+ pre-built validation rule templates, extensible with custom logic.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {validationRules.map((rule) => (
              <div
                key={rule}
                className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-gray-200 text-sm text-text-body"
              >
                <CheckCircle size={14} className="text-[#7454A2] flex-shrink-0" />
                {rule}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deployment Options */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-brand-dark mb-4">
              Flexible Deployment
            </h2>
            <p className="text-text-muted max-w-xl mx-auto">
              Deploy Obserian wherever your data lives — cloud, on-premise, or hybrid.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {deploymentOptions.map((opt) => (
              <div
                key={opt.title}
                className="bg-brand-light rounded-2xl p-6 border border-gray-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Server size={20} className="text-[#7454A2]" />
                  <h3 className="font-bold text-brand-dark">{opt.title}</h3>
                </div>
                <p className="text-sm text-text-muted mb-4">{opt.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {opt.options.map((o) => (
                    <span
                      key={o}
                      className="text-xs px-2 py-1 bg-white rounded-md border border-gray-200 text-text-muted"
                    >
                      {o}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-16 bg-brand-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold text-white mb-2">
              Security &amp; Compliance
            </h2>
            <p className="text-gray-400">
              Enterprise-grade security baked in from the ground up.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {security.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 bg-white/10 px-4 py-3 rounded-xl border border-white/10 text-sm text-gray-300"
              >
                <Lock size={14} className="text-[#7454A2] flex-shrink-0" />
                {item}
              </div>
            ))}
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
            Request a personalized demo of Obserian.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-[#7454A2] text-white font-semibold rounded-lg hover:bg-opacity-90 transition-all"
            >
              Request Demo
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
