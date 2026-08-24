import Link from "next/link";
import { ArrowRight, Users, Briefcase, Compass } from "lucide-react";
import { createPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import { absoluteUrl, breadcrumbSchema, SITE_URL } from "@/lib/seo";
import EditorialOverviewHero from "@/components/sections/EditorialOverviewHero";

export const metadata = createPageMetadata({
  title: "About Ereteam",
  description:
    "Learn about Ereteam — 25 years of enterprise data & analytics expertise. Discover our company story and career opportunities.",
  path: "/about",
  image: "/images/ai/about_bg.png",
});

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
      <JsonLd data={[{
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "@id": `${absoluteUrl("/about")}#about`,
        name: "About Ereteam",
        url: absoluteUrl("/about"),
        about: { "@id": `${SITE_URL}/#organization` },
      }, breadcrumbSchema([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])]} />
      <EditorialOverviewHero
        eyebrow="About Ereteam"
        title="25 years of making data come alive."
        description="We are a dedicated enterprise data and analytics consultancy—not a generalist IT firm. Everything we do is focused on helping organizations extract more value from their data."
        railLabel="Established in 2001"
        railText="New Jersey and Istanbul. More than 80 specialists delivering enterprise programs across 17 countries."
        icon={Compass}
      />

      <section className="border-b border-[#071a2a]/12 bg-white py-14 lg:py-20">
        <div className="site-container grid gap-8 lg:grid-cols-[.7fr_1.3fr] lg:items-start">
          <div>
            <p className="site-kicker">Ereteam at a glance</p>
            <p className="mt-5 text-sm leading-7 text-text-muted">Founded in 2001 · New Jersey and Istanbul · 80+ data professionals</p>
          </div>
          <div className="space-y-6 text-lg leading-8 text-[#40515d]">
            <p>Ereteam designs and delivers enterprise data systems that support decisions across finance, operations, marketing and executive leadership. Our work spans modern cloud data platforms, applied AI, IBM Planning Analytics, HCL Unica and purpose-built software products.</p>
            <p>We combine specialist consulting teams in the United States and Türkiye with delivery experience across 17 countries. The result is a firm built for complex, long-lived enterprise programs—not short-term technology installation.</p>
          </div>
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
