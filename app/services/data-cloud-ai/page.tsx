"use client";

import Link from "next/link";
import { ArrowRight, Database, Cloud, Brain, GitMerge, BarChart2 } from "lucide-react";
import Image from "next/image";

const serviceAreas = [
  {
    icon: BarChart2,
    color: "bg-blue-500",
    title: "AI-Powered BI & DataOps",
    summary: "Self-service analytics, automated pipelines, governed BI environments",
    content:
      "We design and implement governed self-service analytics environments that empower business users while maintaining data integrity. Our DataOps practice automates pipeline orchestration, CI/CD for data, and monitors data freshness end-to-end. From semantic layers and certified data marts to Tableau and Cognos dashboards — we build analytics experiences that business users actually adopt.",
    technologies: ["Tableau", "IBM Cognos Analytics", "Power BI", "Alteryx", "dbt", "Prefect"],
    image: "https://images.unsplash.com/photo-1644325349124-d1756b79dd42?auto=format&fit=crop&q=80&w=1000",
  },
  {
    icon: Database,
    color: "bg-emerald-500",
    title: "Data Governance & Quality",
    summary: "Policies, stewardship, lineage, and observability",
    content:
      "We implement enterprise data governance frameworks covering metadata management, data lineage, master data management (MDM), and automated data quality monitoring. AI-powered validation rules and continuous quality scoring ensure your data is reliable at every point of consumption. We establish ownership, stewardship models, and audit trails that satisfy both regulators and business stakeholders.",
    technologies: ["IBM InfoSphere MDM", "Python", "dbt", "Prefect"],
    image: "https://images.unsplash.com/photo-1642516303080-431f6681f864?auto=format&fit=crop&q=80&w=1000",
  },
  {
    icon: Brain,
    color: "bg-violet-500",
    title: "Predictive AI & Generative AI",
    summary: "ML model development, LLM integration, AI use-case discovery",
    content:
      "We help organizations move from AI experimentation to production AI deployment. Our team designs ML pipelines, builds predictive and prescriptive models, and integrates AI outputs into business workflows. We also scope and deliver Generative AI use cases — from internal knowledge assistants to LLM-powered document processing — grounded in your enterprise data.",
    technologies: ["DataRobot", "Databricks MLflow", "Python", "AWS SageMaker", "IBM Watson", "OpenAI API"],
    image: "https://images.unsplash.com/photo-1640158615573-cd28feb1bf4e?auto=format&fit=crop&q=80&w=1000",
  },
  {
    icon: GitMerge,
    color: "bg-orange-500",
    title: "Data Engineering & Enrichment",
    summary: "ETL/ELT pipelines, lakehouse architecture, third-party data integration",
    content:
      "We build and modernize data engineering foundations — from high-volume ETL/ELT pipelines to lakehouse architectures on Databricks and Snowflake. We integrate third-party data sources (market data, geospatial, syndicated) and build enrichment layers that give your models and dashboards the context they need to deliver real insight.",
    technologies: ["Databricks", "Snowflake", "Apache Spark", "AWS Glue", "Python", "dbt"],
    image: "https://images.unsplash.com/photo-1480944657103-7fed22359e1d?auto=format&fit=crop&q=80&w=1000",
  },
  {
    icon: Cloud,
    color: "bg-sky-500",
    title: "Cloud & Digital Transformation",
    summary: "AWS, Azure, GCP migrations; DataOps; infrastructure modernization",
    content:
      "From legacy on-premise data warehouses to modern cloud-native platforms, we manage the full migration lifecycle. We assess your current estate, design the target architecture, execute migration with zero data loss, and optimize post-migration performance and cost. Deep expertise spans IBM Cloud Pak for Data, AWS, Azure, and GCP — including full DataOps practice build-out.",
    technologies: ["AWS", "Azure", "GCP", "IBM Cloud Pak for Data", "Databricks", "Terraform"],
    image: "https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?auto=format&fit=crop&q=80&w=1000",
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
    summary: "Built a real-time data platform tracking 8,000+ SKUs across 34 countries to optimize distributor inventory and secondary sales forecasting.",
    result: "34 countries, 8K+ products tracked in real time",
    image: "https://images.unsplash.com/photo-1542903660-eedba2cda473?auto=format&fit=crop&q=80&w=1000",
  },
  {
    industry: "Manufacturing",
    project: "AI Process Control",
    technologies: ["DataRobot"],
    summary: "Implemented an end-to-end AI process control solution on factory floors to reduce energy consumption and predict equipment failures.",
    result: "$39M cost savings, 2% CO₂ reduction",
    image: "https://images.unsplash.com/photo-1644088379091-d574269d422f?auto=format&fit=crop&q=80&w=1000",
  },
  {
    industry: "Pharma",
    project: "Data Stack Modernization",
    technologies: ["AWS Glue", "Tableau", "Python"],
    summary: "Modernized legacy on-premise data warehouses into a unified cloud data platform, centralizing commercial and clinical data for 5 business units.",
    result: "Unified data platform across 5 business units",
    image: "https://images.unsplash.com/photo-1763739527737-e3626d731072?auto=format&fit=crop&q=80&w=1000",
  },
  {
    industry: "Telecom",
    project: "Enterprise Reporting Platform",
    technologies: ["Tableau", "Oracle", "AWS"],
    summary: "Designed a centralized enterprise reporting platform, automating 200+ manual reports and empowering executives with self-service analytics.",
    result: "Reporting cycle cut from days to hours",
    image: "https://images.unsplash.com/photo-1695891583421-3cbbf1c2e3bd?auto=format&fit=crop&q=80&w=1000",
  },
  {
    industry: "Banking",
    project: "Enterprise AI Platform",
    technologies: ["DataRobot"],
    summary: "Deployed a centralized Machine Learning Operations (MLOps) platform, accelerating model development from concept to production for credit risk and churn.",
    result: "20+ ML models in production within 6 months",
    image: "https://images.unsplash.com/photo-1580920461931-fcb03a940df5?auto=format&fit=crop&q=80&w=1000",
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
  return (
    <>
      {/* Hero */}
      {/* Hero */}
      <section
        className="pt-32 pb-20"
        style={{ background: "linear-gradient(135deg, #0a1628 0%, #1a2a5e 100%)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <Link href="/services" className="text-sm text-gray-400 hover:text-white transition-colors">
              ← Services
            </Link>
          </div>
          <p className="text-sm font-medium text-[#38bdf8] uppercase tracking-widest mb-3">
            Service Domain
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
            Data, Cloud &amp; AI
          </h1>
          <p className="text-xl text-[#38bdf8] font-semibold mb-6">
            From raw data to competitive intelligence — end to end.
          </p>
          <p className="text-lg text-gray-300 max-w-2xl mb-8 leading-relaxed">
            Build a modern, scalable data foundation with cloud-native architecture,
            AI/ML solutions, and enterprise data governance. From strategy to production
            — we deliver the intelligence infrastructure that powers your competitive advantage.
          </p>
          <ul className="space-y-3 text-gray-300 text-sm">
            {[
              "AI-Powered BI & self-service analytics at enterprise scale",
              "Predictive & Generative AI from pilot to production",
              "Cloud migration on AWS, Azure, and GCP",
              "Data governance, quality, and lineage frameworks",
            ].map((bullet) => (
              <li key={bullet} className="flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#38bdf8] flex-shrink-0" />
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {whyStats.map((s) => (
              <div key={s.stat}>
                <div className="text-4xl font-extrabold text-brand-primary mb-2">{s.stat}</div>
                <div className="text-sm text-text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas (Alternating) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-brand-dark mb-4">
              Service Areas
            </h2>
            <p className="text-text-muted">
              Deep expertise across the entire data lifecycle.
            </p>
          </div>
          <div className="space-y-20">
            {serviceAreas.map((area, index) => {
              const isEven = index % 2 === 0;
              const Icon = area.icon;
              return (
                <div
                  key={area.title}
                  className={`flex flex-col lg:flex-row items-center gap-10 ${
                    !isEven ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  <div className="w-full lg:w-1/2 relative h-64 sm:h-80 lg:h-[400px] rounded-2xl overflow-hidden shadow-lg">
                    <Image
                      src={area.image}
                      alt={area.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </div>
                  <div className="w-full lg:w-1/2 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl ${area.color} bg-opacity-10 flex items-center justify-center`}>
                        <Icon size={24} className={area.color.replace("bg-", "text-")} />
                      </div>
                      <h3 className="font-bold text-brand-dark text-2xl">{area.title}</h3>
                    </div>
                    <p className="text-lg font-medium text-text-muted">{area.summary}</p>
                    <p className="text-base text-text-body leading-relaxed">
                      {area.content}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How We Deliver */}
      <section className="py-20 bg-brand-light">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-brand-dark mb-4">How We Deliver</h2>
            <p className="text-text-muted">A proven engagement model from data audit to scaled production.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-6">
            {processSteps.map((step, i) => (
              <div key={step.number} className="relative text-center">
                {i < processSteps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-[calc(50%+2rem)] right-[-50%] h-px bg-gray-200" />
                )}
                <div className="w-12 h-12 rounded-full bg-white border border-gray-200 text-brand-primary font-extrabold text-sm flex items-center justify-center mx-auto mb-4 shadow-sm">
                  {step.number}
                </div>
                <div className="font-bold text-brand-dark text-base mb-2">{step.title}</div>
                <div className="text-sm text-text-muted px-2">{step.description}</div>
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
              className="flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:text-brand-dark transition-colors"
            >
              All success stories <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredUseCases.map((uc) => (
              <div
                key={uc.project}
                className="bg-white rounded-2xl border border-gray-200 hover:border-brand-primary hover:shadow-lg transition-all flex flex-col overflow-hidden group"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={uc.image}
                    alt={uc.project}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <span className="text-xs font-semibold bg-brand-primary text-white px-3 py-1 rounded-full">
                      {uc.industry}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-brand-dark mb-3">{uc.project}</h3>
                  <p className="text-sm text-text-muted mb-4 line-clamp-3">{uc.summary}</p>
                  <div className="bg-brand-light rounded-xl p-4 border border-gray-100 mt-auto">
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                      Key Result
                    </p>
                    <p className="text-sm font-semibold text-brand-dark">{uc.result}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Partners */}
      <section className="py-16 bg-brand-light border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-500 mb-8 text-center uppercase tracking-wider">
            Technology Partners
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {techPartners.map((partner) => (
              <div
                key={partner.name}
                className="px-6 py-3 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors shadow-sm"
              >
                <span className="font-bold text-brand-dark">{partner.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#0B0F19]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A6FA8]/10 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to modernize your data stack?
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Talk to our Data, Cloud &amp; AI experts. No obligation, just clarity.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#1A6FA8] to-[#38bdf8] text-white font-bold rounded-lg hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:-translate-y-1 transition-all"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </>
  );
}
