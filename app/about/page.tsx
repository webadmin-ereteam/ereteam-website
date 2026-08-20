import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Users, Briefcase } from "lucide-react";

export const metadata: Metadata = {
  title: "About Ereteam",
  description:
    "Learn about Ereteam — 25 years of enterprise data & analytics expertise. Discover our company story and career opportunities.",
};

const sections = [
  {
    icon: Users,
    title: "Company",
    href: "/about/company",
    description:
      "Our story, mission, values, approach, and partners. 25 years of building enterprise data and analytics excellence.",
    cta: "Meet Ereteam",
  },
  {
    icon: Briefcase,
    title: "Careers",
    href: "/about/careers",
    description:
      "Join a team of passionate data professionals. We're always looking for talented people who want to make data come alive.",
    cta: "Explore opportunities",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      {/* Hero */}
      <section
        className="site-overview-hero"
        style={{ background: "linear-gradient(135deg, #0a1628 0%, #1a2a5e 100%)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-medium text-[#38bdf8] uppercase tracking-widest mb-4">
            About Ereteam
          </p>
          <h1 className="site-page-title mb-6 text-white">
            25 Years of Making{" "}
            <span style={{ background: "linear-gradient(90deg, #1A6FA8, #38bdf8, #0C9472)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Data Come Alive
            </span>
          </h1>
          <p className="site-page-lead mx-auto max-w-2xl text-gray-300">
            We are a dedicated enterprise data and analytics consultancy — not a generalist
            IT firm. Everything we do is focused on helping organizations extract more
            value from their data.
          </p>
        </div>
      </section>

      {/* Section navigation */}
      <section className="py-20 bg-brand-light">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Link
                  key={section.title}
                  href={section.href}
                  className="group block bg-white rounded-2xl p-8 border border-gray-200 hover:border-brand-primary/50 hover:shadow-xl transition-all"
                >
                  <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center mb-6">
                    <Icon size={24} className="text-brand-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-brand-dark mb-4 group-hover:text-brand-primary transition-colors">
                    {section.title}
                  </h2>
                  <p className="text-sm text-text-muted leading-relaxed mb-6">
                    {section.description}
                  </p>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-brand-primary">
                    {section.cta}{" "}
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
