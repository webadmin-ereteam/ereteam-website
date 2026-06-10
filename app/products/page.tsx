import { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Ereteam's purpose-built enterprise analytics products: Obserian (data governance), Pharmeta (pharma analytics), and Maturytics (data maturity).",
};

const products = [
  {
    logo: "/logos/products/obserian.svg",
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
    color: "from-blue-600 to-cyan-500",
    bgColor: "bg-white",
    borderColor: "border-gray-200 hover:border-blue-500",
  },
  {
    logo: "/logos/products/pharmeta_logo.png",
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
    color: "from-[#f472b6] to-purple-700",
    bgColor: "bg-white",
    borderColor: "border-gray-200 hover:border-[#f472b6]",
  },
  {
    logo: "/logos/products/maturytics.svg",
    name: "Maturytics",
    tagline: "Data Maturity Assessment Platform",
    href: "/products/maturytics",
    externalHref: "https://maturytics.com",
    description:
      "Assess your organization's data and analytics maturity across 5 dimensions. Maturytics provides a structured assessment framework, generates actionable improvement roadmaps, and tracks progress over time — helping data leaders make the case for investment and prioritize initiatives.",
    capabilities: [
      "5-dimension maturity framework",
      "Industry-calibrated maturity scoring",
      "Automated roadmap generation",
      "Progress tracking over time",
      "Executive presentation output",
    ],
    deploymentOptions: ["SaaS (Cloud)", "Enterprise License"],
    color: "from-teal-600 to-cyan-400",
    bgColor: "bg-white",
    borderColor: "border-gray-200 hover:border-teal-500",
  },
];

export default function ProductsPage() {
  return (
    <>
      {/* Hero */}
      {/* Hero */}
      <section
        className="pt-32 pb-20"
        style={{ background: "linear-gradient(135deg, #0a1628 0%, #1a2a5e 100%)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-medium text-[#38bdf8] uppercase tracking-widest mb-4">
            Our Products
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
            Built for{" "}
            <span style={{ background: "linear-gradient(90deg, #f472b6, #818cf8, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Enterprise Scale
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Three purpose-built platforms that extend the reach of our consulting
            expertise — solving the hardest data challenges in governance, commercial
            analytics, and organizational maturity.
          </p>
        </div>
      </section>

      {/* Product Cards */}
      <section className="py-20 bg-brand-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {products.map((product) => {
              return (
                <div
                  key={product.name}
                  className={`rounded-2xl p-8 border ${product.bgColor} ${product.borderColor} transition-all duration-300 hover:shadow-xl flex flex-col group`}
                >
                  <div className="h-14 mb-6 flex items-center justify-start">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={product.logo} 
                      alt={`${product.name} logo`} 
                      className="max-h-full max-w-[160px] object-contain"
                    />
                  </div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    {product.tagline}
                  </div>
                  <h2 className="text-2xl font-extrabold text-brand-dark mb-4 transition-colors group-hover:text-brand-primary">
                    {product.name}
                  </h2>
                  <p className="text-sm text-text-body leading-relaxed mb-8">
                    {product.description}
                  </p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {product.capabilities.map((cap) => (
                      <li
                        key={cap}
                        className="flex items-center gap-3 text-sm text-text-muted"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                        {cap}
                      </li>
                    ))}
                  </ul>
                  <div className="mb-8">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Deployment
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.deploymentOptions.map((opt) => (
                        <span
                          key={opt}
                          className="text-xs px-3 py-1.5 bg-gray-50 rounded-md border border-gray-200 text-gray-600"
                        >
                          {opt}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Link
                      href={product.href}
                      className="flex items-center gap-1.5 text-sm font-semibold text-brand-primary"
                    >
                      Learn more <ArrowRight size={14} />
                    </Link>
                    <a
                      href={product.externalHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand-dark transition-colors"
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
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#07111F]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A6FA8]/10 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Want to see a product in action?
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Request a demo or speak to our product team.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#1A6FA8] to-[#38bdf8] text-white font-bold rounded-lg hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:-translate-y-1 transition-all"
          >
            Request a Demo
          </Link>
        </div>
      </section>
    </>
  );
}
