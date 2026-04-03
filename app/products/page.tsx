import { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, ArrowRight, Shield, Zap, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Ereteam's purpose-built enterprise analytics products: Obserian (data governance), Pharmeta (pharma analytics), and Maturytics (data maturity).",
};

const products = [
  {
    icon: Shield,
    name: "Obserian",
    tagline: "Enterprise Data Governance Platform",
    href: "/products/obserian",
    externalHref: "https://obserian.com",
    description:
      "AI-powered data quality and governance platform that automates validation rules, tracks data lineage end-to-end, and provides compliance reporting — all at enterprise scale. Obserian is deployed across financial services, pharma, and telecom organizations worldwide.",
    capabilities: [
      "Automated data quality validation",
      "End-to-end data lineage tracking",
      "Business metadata management",
      "Compliance & audit reporting",
      "Real-time quality dashboards",
    ],
    deploymentOptions: ["Cloud (AWS, Azure, GCP)", "On-Premise", "Hybrid"],
    color: "from-blue-600 to-brand-primary",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-100 hover:border-brand-primary",
  },
  {
    icon: Zap,
    name: "Pharmeta",
    tagline: "AI-Powered Data Platform",
    href: "/products/pharmeta",
    externalHref: "https://pharmeta.io",
    description:
      "AI-powered SKU and product data management platform. Pharmeta solves distributor data chaos — automatically matching, cleaning, and certifying product records across markets so your team works from a single golden record.",
    capabilities: [
      "AI-powered SKU matching & harmonization",
      "Golden record creation & certification",
      "Multi-market & multi-distributor support",
      "Automated data quality scoring",
      "Secure by design, enterprise-ready",
    ],
    deploymentOptions: ["Cloud (SaaS)", "Enterprise License"],
    color: "from-brand-magenta to-purple-700",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-100 hover:border-brand-magenta",
  },
  {
    icon: Globe,
    name: "Maturytics",
    tagline: "Data Maturity Assessment Platform",
    href: "/products/maturytics",
    externalHref: "https://maturytics.com",
    description:
      "Benchmark your organization's data and analytics maturity against industry peers. Maturytics provides a structured assessment framework, generates actionable improvement roadmaps, and tracks progress over time — helping data leaders make the case for investment and prioritize initiatives.",
    capabilities: [
      "5-dimension maturity framework",
      "Industry peer benchmarking",
      "Automated roadmap generation",
      "Progress tracking over time",
      "Executive presentation output",
    ],
    deploymentOptions: ["SaaS (Cloud)", "Enterprise License"],
    color: "from-teal-600 to-cyan-700",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-100 hover:border-teal-600",
  },
];

export default function ProductsPage() {
  return (
    <>
      {/* Hero */}
      <section
        className="pt-32 pb-20"
        style={{
          background: "linear-gradient(135deg, #1A1A2E 0%, #0D3A5C 100%)",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-medium text-brand-primary uppercase tracking-widest mb-3">
            Our Products
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6">
            Built for{" "}
            <span className="text-brand-primary">Enterprise Scale</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Three purpose-built platforms that extend the reach of our consulting
            expertise — solving the hardest data challenges in governance, commercial
            analytics, and organizational maturity.
          </p>
        </div>
      </section>

      {/* Product Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {products.map((product) => {
              const Icon = product.icon;
              return (
                <div
                  key={product.name}
                  className={`rounded-2xl p-8 border-2 ${product.bgColor} ${product.borderColor} transition-all duration-300 hover:shadow-xl flex flex-col`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${product.color} flex items-center justify-center mb-6`}
                  >
                    <Icon size={28} className="text-white" />
                  </div>
                  <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">
                    {product.tagline}
                  </div>
                  <h2 className="text-2xl font-extrabold text-brand-dark mb-4">
                    {product.name}
                  </h2>
                  <p className="text-sm text-text-body leading-relaxed mb-6">
                    {product.description}
                  </p>
                  <ul className="space-y-2 mb-6 flex-1">
                    {product.capabilities.map((cap) => (
                      <li
                        key={cap}
                        className="flex items-center gap-2 text-sm text-text-muted"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-primary flex-shrink-0" />
                        {cap}
                      </li>
                    ))}
                  </ul>
                  <div className="mb-6">
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                      Deployment
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {product.deploymentOptions.map((opt) => (
                        <span
                          key={opt}
                          className="text-xs px-2 py-1 bg-white rounded-md border border-gray-200 text-text-muted"
                        >
                          {opt}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Link
                      href={product.href}
                      className="flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:text-brand-dark transition-colors"
                    >
                      Learn more <ArrowRight size={14} />
                    </Link>
                    <a
                      href={product.externalHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-brand-dark transition-colors"
                    >
                      Visit site <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-16"
        style={{ background: "linear-gradient(135deg, #1A1A2E 0%, #0D3A5C 100%)" }}
      >
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Want to see a product in action?
          </h2>
          <p className="text-gray-300 mb-8">
            Request a demo or speak to our product team.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-8 py-4 bg-brand-primary text-white font-semibold rounded-lg hover:bg-opacity-90 transition-all"
          >
            Request a Demo
          </Link>
        </div>
      </section>
    </>
  );
}
