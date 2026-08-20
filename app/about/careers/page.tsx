export const revalidate = 60;

import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Heart, TrendingUp, Globe, Users, Zap, Database, BarChart2, Cloud, Brain, Code2, Briefcase, MapPin } from "lucide-react";
import { getAllActiveJobPostings } from "@/lib/sanity/queries";

export const metadata: Metadata = {
  title: "Careers – Join Ereteam",
  description:
    "Join Ereteam's team of enterprise data and analytics professionals. Explore open roles across data engineering, analytics, AI/ML, and consulting.",
};

const whyEreteam = [
  {
    icon: Brain,
    title: "Deep Technical Challenges",
    description:
      "Work on some of the most complex data and analytics problems in enterprise — from real-time ML pipelines to multi-billion-row financial consolidations.",
  },
  {
    icon: Globe,
    title: "Global Exposure",
    description:
      "Engage with leading enterprises across 17 countries. Our projects span Fortune 500 companies, major banks, global pharma firms, and technology unicorns.",
  },
  {
    icon: TrendingUp,
    title: "Accelerated Career Growth",
    description:
      "In a specialist firm, you develop expertise faster. Our flat structure, mentorship culture, and certification support programs put your career development first.",
  },
  {
    icon: Heart,
    title: "Culture of Excellence",
    description:
      "We take our work seriously but not ourselves. We celebrate curiosity, value diverse perspectives, and believe that the best ideas can come from anyone on the team.",
  },
  {
    icon: Zap,
    title: "Cutting-Edge Technologies",
    description:
      "Stay at the forefront of enterprise analytics with hands-on experience across IBM, AWS, Databricks, Alteryx, Tableau, DataRobot, and our own proprietary products.",
  },
  {
    icon: Users,
    title: "Brilliant Colleagues",
    description:
      "Work alongside 80+ dedicated data professionals — data engineers, analytics consultants, data scientists, and product specialists who are experts in their craft.",
  },
];

const departments = [
  {
    icon: Database,
    title: "Data Engineering",
    description:
      "Design and build enterprise data platforms — data lakes, warehouses, and lakehouses. Work with Databricks, AWS, IBM InfoSphere, and cutting-edge streaming technologies.",
    roles: ["Senior Data Engineer", "Data Architect", "Cloud Data Engineer", "ETL Developer"],
  },
  {
    icon: BarChart2,
    title: "Analytics & BI",
    description:
      "Translate complex data into business intelligence. Design Tableau dashboards, Cognos Analytics solutions, and self-service analytics environments for enterprise clients.",
    roles: ["BI Developer", "Analytics Consultant", "Tableau Developer", "IBM Cognos Consultant"],
  },
  {
    icon: Zap,
    title: "Marketing Technology",
    description:
      "Implement and optimize enterprise marketing platforms for global FMCG, retail, and telecom clients. Deep hands-on expertise in HCL Unica — campaign management, audience segmentation, and omnichannel execution at scale.",
    roles: ["HCL Unica Consultant", "Marketing Automation Specialist", "Campaign Technical Lead", "MarTech Integration Engineer"],
  },
  {
    icon: TrendingUp,
    title: "Financial Performance",
    description:
      "Help CFOs and finance teams with FP&A, budgeting, and financial consolidation. Deep expertise in IBM Planning Analytics (TM1) and IBM Cognos Controller required.",
    roles: ["TM1/Planning Analytics Developer", "Financial Consolidation Specialist", "FP&A Consultant"],
  },
  {
    icon: Brain,
    title: "AI & Data Science",
    description:
      "Build and deploy production ML models. From churn prediction and demand forecasting to NLP and computer vision — our AI practice works on the full spectrum.",
    roles: ["Senior Data Scientist", "ML Engineer", "AI Consultant", "DataRobot Specialist"],
  },
  {
    icon: Cloud,
    title: "Cloud & Platform",
    description:
      "Architect and implement cloud analytics infrastructure on AWS and Azure. Design secure, scalable, cost-optimized cloud data platforms for enterprise clients.",
    roles: ["Cloud Architect", "DevOps / MLOps Engineer", "Platform Engineer", "AWS Solutions Architect"],
  },
  {
    icon: Code2,
    title: "Software Engineering (R&D)",
    description:
      "Build and evolve our proprietary product portfolio — Obserian, Pharmeta, and Maturytics. Work on challenging R&D problems at the intersection of data engineering, AI, and SaaS product development. We are looking for engineers who want to ship products that are used by enterprise clients across 17 countries.",
    roles: ["Full-Stack Developer", "Backend Engineer (Python / Node.js)", "Frontend Engineer (React / Next.js)", "SaaS Product Engineer"],
  },
];

export default async function CareersPage() {
  const jobPostings = await getAllActiveJobPostings();

  return (
    <>
      <section className="bg-[#071a2a] text-white">
        <div className="grid min-h-[720px] lg:grid-cols-[1fr_1fr]">
          <div className="flex items-center px-4 pb-14 pt-32 sm:px-8 lg:px-[max(4rem,calc((100vw-1280px)/2))] lg:pr-14 lg:pt-36">
            <div className="max-w-2xl">
              <Link href="/about" className="text-xs font-bold uppercase tracking-[.14em] text-white/55 transition-colors hover:text-white">← About</Link>
              <p className="site-kicker mt-10">Careers at Ereteam</p>
              <h1 className="site-display mt-6 text-[clamp(3.8rem,7vw,7.5rem)]">Do work that makes data matter.</h1>
              <p className="mt-7 max-w-xl text-xl leading-8 text-white/72">Join experienced consultants, engineers and product builders solving decisions that matter for enterprises around the world.</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="#departments" className="site-button site-button--light">Explore opportunities</Link>
                <Link href="/contact" className="site-button site-button--ghost">Introduce yourself</Link>
              </div>
            </div>
          </div>
          <div className="relative min-h-[440px] overflow-hidden lg:min-h-full">
            <Image src="/images/editorial/careers-team-v2.png" alt="Ereteam colleagues collaborating in a data consultancy studio" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#071a2a]/60 via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#071a2a]/28 lg:to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 grid grid-cols-2 border-t border-white/25 bg-[#071a2a]/55 backdrop-blur-md">
              <div className="border-r border-white/20 p-6"><strong className="block text-3xl">80+</strong><span className="text-xs uppercase tracking-[.12em] text-white/60">Data professionals</span></div>
              <div className="p-6"><strong className="block text-3xl">17</strong><span className="text-xs uppercase tracking-[.12em] text-white/60">Countries served</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Ereteam */}
      <section className="bg-white py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 grid gap-5 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <div>
            <p className="text-sm font-medium text-brand-magenta uppercase tracking-widest mb-2">
              Why Ereteam
            </p>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-brand-dark">
              A Place to Do Your Best Work
            </h2>
            </div>
            <p className="text-xl leading-8 text-text-muted max-w-2xl lg:justify-self-end">
              We invest in our people because great outcomes require great talent.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyEreteam.map((reason) => {
              const Icon = reason.icon;
              return (
                <div
                  key={reason.title}
                  className="bg-brand-light rounded-2xl p-7 border border-gray-200 hover:border-brand-primary hover:shadow-md transition-all"
                >
                  <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Icon size={20} className="text-brand-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-brand-dark mb-3">{reason.title}</h3>
                  <p className="text-base text-text-body leading-7">
                    {reason.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#f3f0e8] py-10 lg:py-14">
        <div className="site-container grid overflow-hidden border border-[#071a2a]/15 bg-white lg:grid-cols-[1.2fr_.8fr]">
          <div className="relative min-h-[360px] lg:min-h-[520px]">
            <Image src="/images/editorial/careers-mentoring-v2.png" alt="A senior Ereteam consultant mentoring two colleagues" fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
          </div>
          <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
            <p className="site-kicker">Learn by doing</p>
            <h2 className="mt-6 text-[clamp(2.5rem,4vw,4.6rem)] font-semibold leading-[.98] tracking-[-.05em] text-[#071a2a]">Senior guidance. Real responsibility.</h2>
            <p className="mt-6 text-lg leading-8 text-[#40515d]">Our teams are deliberately mixed across experience levels. You learn beside specialists, contribute early and build depth through real delivery—not classroom exercises alone.</p>
          </div>
        </div>
      </section>

      {/* Departments */}
      <section id="departments" className="py-14 lg:py-20 bg-brand-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-medium text-brand-magenta uppercase tracking-widest mb-2">
              Open Departments
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-dark mb-4">
              Where You Could Work
            </h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {departments.map((dept) => {
              const Icon = dept.icon;
              return (
                <div
                  key={dept.title}
                  className="bg-white rounded-2xl p-7 sm:p-8 border border-gray-200 hover:border-brand-primary hover:shadow-md transition-all"
                >
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon size={22} className="text-brand-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-brand-dark mb-3">
                        {dept.title}
                      </h3>
                      <p className="text-base text-text-body leading-7 mb-5">
                        {dept.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {dept.roles.map((role) => (
                          <span
                            key={role}
                            className="text-xs px-3 py-1.5 bg-brand-primary/10 text-brand-primary rounded-full font-medium"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      {jobPostings.length > 0 && (
        <section className="py-20 bg-brand-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-sm font-medium text-brand-primary uppercase tracking-widest mb-2">
                We&apos;re Hiring
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-dark">
                Open Positions
              </h2>
            </div>
            <div className="space-y-4">
              {jobPostings.map((job) => (
                <div
                  key={job._id}
                  className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-brand-primary hover:shadow-lg transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-brand-dark mb-1">{job.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted">
                        <span className="flex items-center gap-1">
                          <Briefcase size={14} />
                          {job.department}
                        </span>
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {job.location}
                          </span>
                        )}
                        {job.type && (
                          <span className="px-2.5 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-medium">
                            {job.type}
                          </span>
                        )}
                      </div>
                      {job.description && (
                        <p className="text-sm text-text-body mt-2 max-w-2xl">{job.description}</p>
                      )}
                    </div>
                    <Link
                      href="/contact"
                      className="flex-shrink-0 inline-flex items-center px-5 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-opacity-90 transition-all"
                    >
                      Apply Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#07111F]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/10 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to join us?
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Send your CV and a brief introduction to our talent team. We respond
            to every application within 5 business days.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#0284c7] to-brand-primary text-white font-bold rounded-lg hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:-translate-y-1 transition-all"
          >
            Apply Now
          </Link>
        </div>
      </section>
    </>
  );
}
