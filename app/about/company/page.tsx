export const revalidate = 60;

import { Metadata } from "next";
import Link from "next/link";
import { getLeadershipTeam, getPartnersBoard, SanityTeamMember } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/client";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Company – About Ereteam",
  description:
    "Learn about Ereteam: our story, mission, approach, and leadership team. 25 years of enterprise data & analytics expertise.",
};

const stats = [
  { value: "2001", label: "Founded" },
  { value: "25+", label: "Years of expertise" },
  { value: "80+", label: "Data professionals" },
  { value: "100+", label: "Enterprise clients" },
  { value: "17", label: "Countries served" },
  { value: "3", label: "Proprietary products" },
];

const pillars = [
  {
    title: "Deep Specialization",
    description:
      "We focus exclusively on data and analytics — no infrastructure projects, no ERP implementations, no digital marketing. This singular focus means every engagement benefits from 25 years of accumulated patterns, accelerators, and hard-won lessons from the most complex data environments in the world.",
  },
  {
    title: "Business First, Technology Second",
    description:
      "We start every engagement by understanding the business problem, not by recommending a technology. Our vendor-agnostic approach means we select the right tool for your needs, and our certified expertise across 7+ platforms means we can deliver on that promise.",
  },
  {
    title: "Outcomes Over Outputs",
    description:
      "We measure our success by your business outcomes — budget cycles shortened, revenues grown, costs reduced, risks mitigated. We stay engaged beyond implementation to ensure adoption, deliver training, and evolve solutions as your business evolves.",
  },
];

const LinkedInIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

export default async function CompanyPage() {
  const [leadershipTeam, partnersBoard] = await Promise.all([
    getLeadershipTeam(),
    getPartnersBoard(),
  ]);

  return (
    <>
      {/* Hero */}
      {/* Hero */}
      <section
        className="site-overview-hero"
        style={{ background: "linear-gradient(135deg, #1A1A2E 0%, #0D3A5C 100%)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-4">
            <Link href="/about" className="text-sm text-gray-400 hover:text-white transition-colors">
              ← About
            </Link>
          </div>
          <p className="text-sm font-medium text-brand-primary uppercase tracking-widest mb-4">
            Our Company
          </p>
          <h1 className="site-page-title mb-6 text-white">
            Built Around Data.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-blue-400">Built for Impact.</span>
          </h1>
          <p className="site-page-lead mx-auto max-w-2xl text-gray-300">
            Since 2001, Ereteam has been at the forefront of enterprise data and analytics.
            We are a team of specialists who believe that data, properly harnessed, has
            the power to transform organizations.
          </p>
        </div>
      </section>

      {/* 25th Anniversary Banner */}
      <section className="bg-brand-magenta/10 border-y border-brand-magenta/30 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 text-brand-magenta font-semibold text-sm">
            Celebrating 25 Years of Excellence — Est. 2001
          </span>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-medium text-brand-magenta uppercase tracking-widest mb-3">
                Who We Are
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-dark mb-6">
                A Specialist Firm, Not a Generalist
              </h2>
              <p className="text-text-body leading-relaxed mb-4">
                Ereteam was founded in 2001 with one mission: to help enterprises get
                more value from their data. Unlike large system integrators who offer
                data analytics alongside dozens of other services, we focus exclusively
                on the data and analytics space.
              </p>
              <p className="text-text-body leading-relaxed mb-4">
                This singular focus means our consultants develop extraordinary depth.
                When a client faces a complex data challenge, they get the most
                experienced specialist available — not a generalist who&apos;s just
                completed a certification course.
              </p>
              <p className="text-text-body leading-relaxed">
                Headquartered in the United States with delivery operations in Türkiye,
                we combine world-class consulting standards with a deep talent pool and
                cost-effective delivery model that consistently delivers exceptional ROI
                for our clients.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className={`rounded-2xl p-6 text-center border ${
                    stat.label === "Founded"
                      ? "bg-brand-magenta/10 border-brand-magenta/30"
                      : "bg-brand-light border-gray-200"
                  }`}
                >
                  <div className={`text-3xl font-extrabold mb-1 ${stat.label === "Founded" ? "text-brand-magenta" : "text-brand-primary"}`}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-text-muted font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Approach Pillars */}
      <section className="py-20 bg-brand-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-medium text-brand-magenta uppercase tracking-widest mb-2">
              Our Approach
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-dark">
              How We Work
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm"
              >
                <div className="mb-5 h-1 w-10 bg-brand-primary/55" />
                <h3 className="text-lg font-bold text-brand-dark mb-3">
                  {pillar.title}
                </h3>
                <p className="text-sm text-text-body leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Board */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-brand-magenta uppercase tracking-widest mb-2">
              Ownership
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-dark">
              Partners Board
            </h2>
          </div>
          {partnersBoard.length === 0 ? (
            <p className="text-center text-gray-400">Partners Board information coming soon.</p>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {partnersBoard.map((person: SanityTeamMember) => (
                  <div
                    key={person._id}
                    className="bg-brand-light rounded-xl p-4 text-center border border-gray-200 hover:border-brand-primary hover:shadow-sm transition-all flex flex-col items-center"
                  >
                    {person.imagePartners || person.image ? (
                      <div className="w-full aspect-square mb-3 overflow-hidden rounded-lg">
                        <Image
                          src={urlFor(person.imagePartners || person.image).width(400).height(400).fit('crop').url()}
                          alt={person.name}
                          width={400}
                          height={400}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full aspect-square bg-brand-primary/10 rounded-lg flex items-center justify-center mb-3 text-4xl font-bold text-brand-primary">
                        {person.name.charAt(0)}
                      </div>
                    )}
                    <p className="text-sm font-bold text-brand-dark leading-tight mb-1">
                      {person.name}
                    </p>
                    {person.title && (
                      <p className="text-xs font-medium text-brand-primary mb-3">
                        {person.title}
                      </p>
                    )}
                    {person.linkedIn && (
                      <a
                        href={person.linkedIn}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center text-[#0A66C2] hover:text-[#004182] transition-colors mt-auto"
                        aria-label={`${person.name} LinkedIn`}
                      >
                        <LinkedInIcon />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Executive Leadership Team */}
      <section className="py-20 bg-brand-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-medium text-brand-magenta uppercase tracking-widest mb-2">
              Leadership
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-dark">
              Executive Leadership Team
            </h2>
          </div>
          {leadershipTeam.length === 0 ? (
            <p className="text-center text-gray-400">Team information coming soon.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leadershipTeam.map((person: SanityTeamMember) => (
                <div
                  key={person._id}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-brand-primary hover:shadow-lg transition-all flex flex-col"
                >
                  <div className="w-full aspect-[4/3] relative">
                    {person.image || person.imagePartners ? (
                      <Image
                        src={urlFor(person.image || person.imagePartners).width(800).height(600).fit('crop').url()}
                        alt={person.name}
                        width={800}
                        height={600}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-brand-primary/10 flex items-center justify-center text-6xl font-bold text-brand-primary">
                        {person.name.charAt(0)}
                      </div>
                    )}
                    {person.region && (
                      <div className="absolute top-4 right-4">
                        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-brand-magenta text-white shadow-md">
                          {person.region}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-brand-dark mb-1">{person.name}</h3>
                        <p className="text-sm font-semibold text-brand-primary">{person.title}</p>
                      </div>
                      {person.linkedIn && (
                        <a
                          href={person.linkedIn}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0A66C2] hover:text-[#004182] transition-colors flex-shrink-0"
                          aria-label={`${person.name} LinkedIn`}
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                          </svg>
                        </a>
                      )}
                    </div>
                    {person.bio && (
                      <p className="text-sm text-text-body mt-2 leading-relaxed">{person.bio}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#07111F]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/10 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Want to work with us?
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Whether you&apos;re a potential client or looking to join the team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[#0284c7] to-brand-primary text-white font-bold rounded-lg hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:-translate-y-1 transition-all"
            >
              Get in Touch
            </Link>
            <Link
              href="/about/careers"
              className="inline-flex items-center justify-center px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-lg hover:bg-white/10 transition-all"
            >
              View Careers
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
