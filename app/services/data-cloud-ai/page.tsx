"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown, ArrowRight, Database, Cloud, Brain, GitMerge, BarChart2 } from "lucide-react";

const serviceAreas = [
  {
    icon: BarChart2,
    color: "bg-blue-500",
    title: "AI-Powered BI & DataOps",
    summary: "Self-service analytics, automated pipelines, governed BI environments",
    content:
      "We design and implement governed self-service analytics environments that empower business users while maintaining data integrity. Our DataOps practice automates pipeline orchestration, CI/CD for data, and monitors data freshness end-to-end. From semantic layers and certified data marts to Tableau and Cognos dashboards — we build analytics experiences that business users actually adopt.",
    technologies: ["Tableau", "IBM Cognos Analytics", "Power BI", "Alteryx", "dbt", "Prefect"],
  },
  {
    icon: Database,
    color: "bg-emerald-500",
    title: "Data Governance & Quality",
    summary: "Policies, stewardship, lineage, and observability",
    content:
      "We implement enterprise data governance frameworks covering metadata management, data lineage, master data management (MDM), and automated data quality monitoring. AI-powered validation rules and continuous quality scoring ensure your data is reliable at every point of consumption. We establish ownership, stewardship models, and audit trails that satisfy both regulators and business stakeholders.",
    technologies: ["IBM InfoSphere MDM", "Python", "dbt", "Prefect"],
  },
  {
    icon: Brain,
    color: "bg-violet-500",
    title: "Predictive AI & Generative AI",
    summary: "ML model development, LLM integration, AI use-case discovery",
    content:
      "We help organizations move from AI experimentation to production AI deployment. Our team designs ML pipelines, builds predictive and prescriptive models, and integrates AI outputs into business workflows. We also scope and deliver Generative AI use cases — from internal knowledge assistants to LLM-powered document processing — grounded in your enterprise data.",
    technologies: ["DataRobot", "Databricks MLflow", "Python", "AWS SageMaker", "IBM Watson", "OpenAI API"],
  },
  {
    icon: GitMerge,
    color: "bg-orange-500",
    title: "Data Engineering & Enrichment",
    summary: "ETL/ELT pipelines, lakehouse architecture, third-party data integration",
    content:
      "We build and modernize data engineering foundations — from high-volume ETL/ELT pipelines to lakehouse architectures on Databricks and Snowflake. We integrate third-party data sources (market data, geospatial, syndicated) and build enrichment layers that give your models and dashboards the context they need to deliver real insight.",
    technologies: ["Databricks", "Snowflake", "Apache Spark", "AWS Glue", "Python", "dbt"],
  },
  {
    icon: Cloud,
    color: "bg-sky-500",
    title: "Cloud & Digital Transformation",
    summary: "AWS, Azure, GCP migrations; DataOps; infrastructure modernization",
    content:
      "From legacy on-premise data warehouses to modern cloud-native platforms, we manage the full migration lifecycle. We assess your current estate, design the target architecture, execute migration with zero data loss, and optimize post-migration performance and cost. Deep expertise spans IBM Cloud Pak for Data, AWS, Azure, and GCP — including full DataOps practice build-out.",
    technologies: ["AWS", "Azure", "GCP", "IBM Cloud Pak for Data", "Databricks", "Terraform"],
  },
];

const techPartners = [
  { name: "IBM" },
  { name: "AWS" },
  { name: "Databricks" },
  { name: "Alteryx" },
  { name: "Tableau" },
  { name: "DataRobot" },
  { name: "Snowflake" },
  { name: "Python / dbt" },
];

const featuredUseCases = [
  {
    industry: "Consumer Health",
    project: "Secondary Sales Platform",
    technologies: ["Python", "PostgreSQL", "Power BI", "Prefect", "AWS"],
    result: "34 countries, 8K+ products tracked in real time",
  },
  {
    industry: "Manufacturing",
    project: "AI Process Control",
    technologies: ["DataRobot"],
    result: "$39M cost savings, 2% CO₂ reduction",
  },
  {
    industry: "Pharma",
    project: "Data Stack Modernization",
    technologies: ["AWS Glue", "Tableau", "Python"],
    result: "Unified data platform across 5 business units",
  },
  {
    industry: "Telecom",
    project: "Enterprise Reporting Platform",
    technologies: ["Tableau", "Oracle", "AWS"],
    result: "Reporting cycle cut from days to hours",
  },
  {
    industry: "Banking",
    project: "Enterprise AI Platform",
    technologies: ["DataRobot"],
    result: "20+ ML models in production within 6 months",
  },
];

const processSteps = [
  { number: "01", title: "Discover", description: "Assess current data estate, define business value targets" },
  { number: "02", title: "Design", description: "Architect the target platform, governance model, and roadmap" },
  { number: "03", title: "Build", description: "Deliver pipelines, models, and dashboards in sprints" },
  { number: "04", title: "Optimize", description: "Monitor, iterate, and scale with ongoing DataOps support" },
];

const whyStats = [
  { stat: "25+", label: "Years of enterprise data & analytics expertise" },
  { stat: "100+", label: "Enterprise clients across 17 countries" },
  { stat: "50+", label: "Data engineers, architects, and scientists on team" },
];

export default function DataCloudAIPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
      {/* Hero */}
      <section
        className="pt-32 pb-20"
        style={{ background: "linear-gradient(135deg, #0a1628 0%, #0D3A5C 100%)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <Link href="/services" className="text-sm text-gray-400 hover:text-white transition-colors">
              ← Services
            </Link>
          </div>
          <p className="text-sm font-medium text-brand-primary uppercase tracking-widest mb-3">
            Service Domain
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
            Data, Cloud &amp; AI
          </h1>
          <p className="text-lg text-brand-primary font-semibold mb-6">
            From raw data to competitive intelligence — end to end.
          </p>
          <p className="text-lg text-gray-300 max-w-2xl mb-8">
            Build a modern, scalable data foundation with cloud-native architecture,
            AI/ML solutions, and enterprise data governance. From strategy to production
            — we deliver the intelligence infrastructure that powers your competitive advantage.
          </p>
          <ul className="space-y-2 text-gray-200 text-sm">
            {[
              "AI-Powered BI & self-service analytics at enterprise scale",
              "Predictive & Generative AI from pilot to production",
              "Cloud migration on AWS, Azure, and GCP",
              "Data governance, quality, and lineage frameworks",
            ].map((bullet) => (
              <li key={bullet} className="flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-primary flex-shrink-0" />
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {whyStats.map((s) => (
              <div key={s.stat}>
                <div className="text-4xl font-extrabold text-brand-primary mb-1">{s.stat}</div>
                <div className="text-sm text-text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas Accordion */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-brand-dark mb-4">
              Service Areas
            </h2>
            <p className="text-text-muted">
              Click each area to explore our capabilities in depth.
            </p>
          </div>
          <div className="space-y-3">
            {serviceAreas.map((area, index) => (
                <motion.div
                  key={area.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-gray-200 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setOpenIndex(openIndex === index ? null : index)
                    }
                    className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-brand-light transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-2.5 h-2.5 rounded-full ${area.color} flex-shrink-0`} />
                      <div>
                        <div className="font-bold text-brand-dark">{area.title}</div>
                        <div className="text-sm text-text-muted mt-0.5">{area.summary}</div>
                      </div>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`text-brand-primary flex-shrink-0 transition-transform ml-4 ${openIndex === index ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openIndex === index && (
                    <div className="px-6 pb-6 bg-brand-light">
                      <p className="text-sm text-text-body leading-relaxed mb-4">
                        {area.content}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {area.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="text-xs px-3 py-1 bg-white border border-brand-primary/20 text-brand-primary rounded-full font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Deliver */}
      <section className="py-20 bg-brand-light">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-brand-dark mb-4">How We Deliver</h2>
            <p className="text-text-muted">A proven engagement model from data audit to scaled production.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {processSteps.map((step, i) => (
              <div key={step.number} className="relative text-center">
                {i < processSteps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-[calc(50%+2rem)] right-[-50%] h-px bg-gray-300" />
                )}
                <div className="w-12 h-12 rounded-full bg-brand-primary text-white font-extrabold text-sm flex items-center justify-center mx-auto mb-3">
                  {step.number}
                </div>
                <div className="font-bold text-brand-dark text-sm mb-1">{step.title}</div>
                <div className="text-xs text-text-muted">{step.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Success Stories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <h2 className="text-2xl font-extrabold text-brand-dark">
              Featured Success Stories
            </h2>
            <Link
              href="/use-cases"
              className="flex items-center gap-1.5 text-sm font-semibold text-brand-primary"
            >
              All success stories <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredUseCases.map((uc) => (
              <div
                key={uc.project}
                className="bg-brand-light rounded-xl p-6 border border-gray-200 flex flex-col"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full">
                    {uc.industry}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-brand-dark mb-3">{uc.project}</h3>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {uc.technologies.map((t) => (
                    <span key={t} className="text-xs px-2 py-0.5 bg-white border border-gray-200 text-text-muted rounded-full">
                      {t}
                    </span>
                  ))}
                </div>
                <p className="text-sm font-semibold text-brand-primary mt-auto">{uc.result}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Partners */}
      <section className="py-16 bg-brand-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-brand-dark mb-8 text-center">
            Technology Partners
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {techPartners.map((partner) => (
              <div
                key={partner.name}
                className="px-5 py-3 bg-white rounded-xl border border-gray-200 shadow-sm"
              >
                <span className="font-bold text-brand-dark">{partner.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-16"
        style={{ background: "linear-gradient(135deg, #0a1628 0%, #0D3A5C 100%)" }}
      >
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Ready to modernize your data stack?
          </h2>
          <p className="text-gray-300 mb-8">
            Talk to our Data, Cloud &amp; AI experts. No obligation, just clarity.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-8 py-4 bg-brand-primary text-white font-semibold rounded-lg hover:bg-opacity-90 transition-all"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </>
  );
}
