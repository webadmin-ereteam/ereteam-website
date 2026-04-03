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
    number: "01",
    title: "Deep Specialization",
    description:
      "We focus exclusively on data and analytics — no infrastructure projects, no ERP implementations, no digital marketing. This singular focus means every engagement benefits from 25 years of accumulated patterns, accelerators, and hard-won lessons from the most complex data environments in the world.",
  },
  {
    number: "02",
    title: "Business First, Technology Second",
    description:
      "We start every engagement by understanding the business problem, not by recommending a technology. Our vendor-agnostic approach means we select the right tool for your needs, and our certified expertise across 7+ platforms means we can deliver on that promise.",
  },
  {
    number: "03",
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
      <section
        className="pt-32 pb-20"
        style={{ background: "linear-gradient(135deg, #1A1A2E 0%, #0D3A5C 100%)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <Link href="/about" className="text-sm text-gray-400 hover:text-white transition-colors">
              ← About
            </Link>
          </div>
          <p className="text-sm font-medium text-brand-primary uppercase tracking-widest mb-3">
            Our Company
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6">
            Built Around Data.{" "}
            <span className="text-brand-primary">Built for Impact.</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl">
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
            <span className="text-lg">🎉</span>
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
                <div className="text-4xl font-extrabold text-brand-primary/20 mb-4">
                  {pillar.number}
                </div>
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
                    className="bg-brand-light rounded-xl p-4 text-center border border-gray-200 hover:border-brand-primary hover:shadow-sm transition-all"
                  >
                    <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold text-brand-primary">
                      {person.name.charAt(0)}
                    </div>
                    <p className="text-xs font-medium text-brand-dark leading-tight mb-2">
                      {person.name}
                    </p>
                    {person.linkedIn && (
                      <a
                        href={person.linkedIn}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center text-[#0A66C2] hover:text-[#004182] transition-colors"
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
                  className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-brand-primary hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    {person.image ? (
                      <Image
                        src={urlFor(person.image).width(112).height(112).url()}
                        alt={person.name}
                        width={56}
                        height={56}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-brand-primary/10 rounded-full flex items-center justify-center text-xl font-bold text-brand-primary">
                        {person.name.charAt(0)}
                      </div>
                    )}
                    {person.region && (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-magenta/10 text-brand-magenta border border-brand-magenta/20">
                        {person.region}
                      </span>
                    )}
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-brand-dark mb-1">{person.name}</h3>
                      <p className="text-sm font-medium text-brand-primary">{person.title}</p>
                    </div>
                    {person.linkedIn && (
                      <a
                        href={person.linkedIn}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0A66C2] hover:text-[#004182] transition-colors flex-shrink-0"
                        aria-label={`${person.name} LinkedIn`}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                      </a>
                    )}
                  </div>
                  {person.bio && (
                    <p className="text-sm text-text-body mt-2">{person.bio}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-16"
        style={{ background: "linear-gradient(135deg, #1A1A2E 0%, #0D3A5C 100%)" }}
      >
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Want to work with us?
          </h2>
          <p className="text-gray-300 mb-8">
            Whether you&apos;re a potential client or looking to join the team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-brand-primary text-white font-semibold rounded-lg hover:bg-opacity-90 transition-all"
            >
              Get in Touch
            </Link>
            <Link
              href="/about/careers"
              className="inline-flex items-center justify-center px-8 py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition-all"
            >
              View Careers
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
