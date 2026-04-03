import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Users, Award, Briefcase } from "lucide-react";

export const metadata: Metadata = {
  title: "About Ereteam",
  description:
    "Learn about Ereteam — 25 years of enterprise data & analytics expertise. Discover our company story, career opportunities, and technology certifications.",
};

const sections = [
  {
    icon: Users,
    title: "Company",
    href: "/about/company",
    description:
      "Our story, mission, values, approach, and leadership team. 25 years of building enterprise data and analytics excellence.",
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
  {
    icon: Award,
    title: "Certifications",
    href: "/about/certifications",
    description:
      "Our technology certifications across IBM, AWS, HCL, Alteryx, Tableau, and DataRobot — proof of our deep technical expertise.",
    cta: "View certifications",
  },
];

export default function AboutPage() {
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
            About Ereteam
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6">
            25 Years of Making{" "}
            <span className="text-brand-primary">Data Come Alive</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            We are a dedicated enterprise data and analytics consultancy — not a generalist
            IT firm. Everything we do is focused on helping organizations extract more
            value from their data.
          </p>
        </div>
      </section>

      {/* Section navigation */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Link
                  key={section.title}
                  href={section.href}
                  className="group block bg-brand-light rounded-2xl p-8 border border-gray-200 hover:border-brand-primary hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center mb-5">
                    <Icon size={24} className="text-brand-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-brand-dark mb-3 group-hover:text-brand-primary transition-colors">
                    {section.title}
                  </h2>
                  <p className="text-sm text-text-body leading-relaxed mb-5">
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
