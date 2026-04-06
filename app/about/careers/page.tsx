export const revalidate = 60;

import { Metadata } from "next";
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
            Careers
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6">
            Make Data{" "}
            <span className="text-brand-primary">Come Alive</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl">
            Join a team of passionate data professionals who are building the next
            generation of enterprise analytics. At Ereteam, your work directly shapes
            how leading organizations make their most important decisions.
          </p>
          <div className="mt-8">
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-4 bg-brand-primary text-white font-semibold rounded-lg hover:bg-opacity-90 transition-all"
            >
              Apply Now
            </Link>
          </div>
        </div>
      </section>

      {/* Why Ereteam */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-medium text-brand-magenta uppercase tracking-widest mb-2">
              Why Ereteam
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-dark mb-4">
              A Place to Do Your Best Work
            </h2>
            <p className="text-lg text-text-muted max-w-2xl mx-auto">
              We invest in our people because great outcomes require great talent.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyEreteam.map((reason) => {
              const Icon = reason.icon;
              return (
                <div
                  key={reason.title}
                  className="bg-brand-light rounded-2xl p-6 border border-gray-200 hover:border-brand-primary hover:shadow-md transition-all"
                >
                  <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Icon size={20} className="text-brand-primary" />
                  </div>
                  <h3 className="font-bold text-brand-dark mb-2">{reason.title}</h3>
                  <p className="text-sm text-text-body leading-relaxed">
                    {reason.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Departments */}
      <section className="py-20 bg-brand-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-medium text-brand-magenta uppercase tracking-widest mb-2">
              Open Departments
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-dark mb-4">
              Where You Could Work
            </h2>
          </div>
          <div className="space-y-6">
            {departments.map((dept) => {
              const Icon = dept.icon;
              return (
                <div
                  key={dept.title}
                  className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 hover:border-brand-primary hover:shadow-md transition-all"
                >
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon size={22} className="text-brand-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-brand-dark mb-2">
                        {dept.title}
                      </h3>
                      <p className="text-sm text-text-body leading-relaxed mb-4">
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
      <section
        className="py-16"
        style={{ background: "linear-gradient(135deg, #1A1A2E 0%, #0D3A5C 100%)" }}
      >
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Ready to join us?
          </h2>
          <p className="text-gray-300 mb-8">
            Send your CV and a brief introduction to our talent team. We respond
            to every application within 5 business days.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-8 py-4 bg-brand-primary text-white font-semibold rounded-lg hover:bg-opacity-90 transition-all"
          >
            Apply Now
          </Link>
        </div>
      </section>
    </>
  );
}
