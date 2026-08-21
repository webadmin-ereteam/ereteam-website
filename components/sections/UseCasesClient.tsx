"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SanitySuccessStory } from "@/lib/sanity/queries";
import Image from "next/image";
import Link from "next/link";
import { storySlug } from "@/lib/successStories";

type Industry =
  | "Banking & Finance"
  | "Insurance"
  | "Telecom"
  | "Pharma & Biotech"
  | "Retail"
  | "Manufacturing"
  | "Media"
  | "Other";

const allIndustries: Industry[] = [
  "Banking & Finance",
  "Insurance",
  "Telecom",
  "Pharma & Biotech",
  "Retail",
  "Manufacturing",
  "Media",
  "Other",
];

const industryColors: Record<Industry, string> = {
  "Banking & Finance": "bg-blue-100 text-blue-800",
  Insurance: "bg-green-100 text-green-800",
  Telecom: "bg-purple-100 text-purple-800",
  "Pharma & Biotech": "bg-pink-100 text-pink-800",
  Retail: "bg-orange-100 text-orange-800",
  Manufacturing: "bg-yellow-100 text-yellow-800",
  Media: "bg-red-100 text-red-800",
  Other: "bg-gray-100 text-gray-800",
};

const industryImages: Record<Industry, string> = {
  "Banking & Finance": "https://images.unsplash.com/photo-1667264501379-c1537934c7ab?auto=format&fit=crop&q=80&w=1000",
  Insurance: "https://images.unsplash.com/photo-1680992046615-065f58bcb4d8?auto=format&fit=crop&q=80&w=1000",
  Telecom: "https://images.unsplash.com/photo-1680992046626-418f7e910589?auto=format&fit=crop&q=80&w=1000",
  "Pharma & Biotech": "https://images.unsplash.com/photo-1462826303086-329426d1aef5?auto=format&fit=crop&q=80&w=1000",
  Retail: "https://images.unsplash.com/photo-1691435828932-911a7801adfb?auto=format&fit=crop&q=80&w=1000",
  Manufacturing: "https://images.unsplash.com/photo-1506399558188-acca6f8cbf41?auto=format&fit=crop&q=80&w=1000",
  Media: "https://images.unsplash.com/photo-1564457461758-8ff96e439e83?auto=format&fit=crop&q=80&w=1000",
  Other: "https://images.unsplash.com/photo-1639066648921-82d4500abf1a?auto=format&fit=crop&q=80&w=1000",
};

const projectImages: Record<string, string> = {
  "Integrated Budget Planning & Forecasting Platform": "https://images.unsplash.com/photo-1695668548342-c0c1ad479aee?auto=format&fit=crop&q=80&w=1000",
  "HR Analytics & Workforce Planning": "https://images.unsplash.com/photo-1580106815433-a5b1d1d53d85?auto=format&fit=crop&q=80&w=1000",
  "Financial Consolidation & Regulatory Reporting": "https://images.unsplash.com/photo-1683322499436-f4383dd59f5a?auto=format&fit=crop&q=80&w=1000",
  "Enterprise Risk & Performance Analytics Platform": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=1000",
  "Branch Performance & Profitability Analytics": "https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?auto=format&fit=crop&q=80&w=1000",
  "Enterprise Data Warehouse & BI Platform": "https://images.unsplash.com/photo-1565728744382-61accd4aa148?auto=format&fit=crop&q=80&w=1000",
  "Payment Analytics & Merchant Intelligence Dashboard": "https://images.unsplash.com/photo-1508385082359-f38ae991e8f2?auto=format&fit=crop&q=80&w=1000",
  "Actuarial & Financial Planning Platform": "https://images.unsplash.com/photo-1644325349124-d1756b79dd42?auto=format&fit=crop&q=80&w=1000",
  "Claims Analytics & Loss Ratio Optimization": "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=1000",
  "Reinsurance Analytics & Treaty Management": "https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&q=80&w=1000",
  "Customer Lifetime Value & Churn Prediction Platform": "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1000",
  "Subscriber Analytics & Network Performance Dashboard": "https://images.unsplash.com/photo-1573164574572-cb89e39749b4?auto=format&fit=crop&q=80&w=1000",
  "Enterprise Financial Planning & Consolidation": "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&q=80&w=1000",
  "Commercial Analytics & Market Intelligence Platform": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1000",
  "Global Demand Forecasting & Supply Chain Analytics": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1000",
  "Patient Journey Analytics": "https://images.unsplash.com/photo-1606836591695-4d58a73eba1e?auto=format&fit=crop&q=80&w=1000",
  "Integrated Commercial Reporting Platform": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000",
  "Rare Disease Patient Identification & Market Access Analytics": "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1000",
  "Population Health Management & Risk Stratification Platform": "https://images.unsplash.com/photo-1721937127582-ed331de95a04?auto=format&fit=crop&q=80&w=1000",
  "Real-World Evidence Analytics Platform": "https://images.unsplash.com/photo-1740914994162-0b2a49280aeb?auto=format&fit=crop&q=80&w=1000",
  "Route-to-Market Analytics & Sales Force Effectiveness": "https://images.unsplash.com/photo-1726776230751-183496c51f00?auto=format&fit=crop&q=80&w=1000",
  "Retail Analytics & Store Performance Platform": "https://images.unsplash.com/photo-1726776230760-ae81dc9d4e55?auto=format&fit=crop&q=80&w=1000",
  "Trade Promotion Analytics & ROI Measurement": "https://images.unsplash.com/photo-1645736315000-6f788915923b?auto=format&fit=crop&q=80&w=1000",
  "Group Financial Consolidation & Performance Reporting": "https://images.unsplash.com/photo-1622030411594-c282a63aa1bc?auto=format&fit=crop&q=80&w=1000",
  "Energy Analytics & Grid Performance Platform": "https://images.unsplash.com/photo-1740914994657-f1cdffdc418e?auto=format&fit=crop&q=80&w=1000",
  "Manufacturing Performance & OEE Analytics": "https://images.unsplash.com/photo-1644079446600-219068676743?auto=format&fit=crop&q=80&w=1000",
  "Supply Chain & Distribution Analytics": "https://images.unsplash.com/photo-1504376830547-506dedfe1fe9?auto=format&fit=crop&q=80&w=1000",
  "Logistics Network Analytics & Last-Mile Optimization": "https://images.unsplash.com/photo-1592085198739-ffcad7f36b54?auto=format&fit=crop&q=80&w=1000",
  "Customer Analytics & CRM Intelligence Platform": "https://images.unsplash.com/photo-1627309366653-2dedc084cdf1?auto=format&fit=crop&q=80&w=1000",
  "Credit Risk Analytics & IFRS 9 Reporting": "https://images.unsplash.com/photo-1565891741441-64926e441838?auto=format&fit=crop&q=80&w=1000",
  "Enterprise Data Warehouse & Management Reporting": "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=1000",
  "Subscriber Analytics & Content Performance Platform": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1000",
  "Subscriber Lifetime Value & Retention Analytics": "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&q=80&w=1000",
  "Smart City Analytics & Urban Performance Dashboard": "https://images.unsplash.com/photo-1727434032773-af3cd98375ba?auto=format&fit=crop&q=80&w=1000",
};

export default function UseCasesClient({ stories }: { stories: SanitySuccessStory[] }) {
  const [activeFilter, setActiveFilter] = useState<Industry | "All">("All");

  const visibleStories = stories.filter((s) => s.industry !== "Government");

  const filtered =
    activeFilter === "All"
      ? visibleStories
      : visibleStories.filter((s) => s.industry === activeFilter);

  return (
    <>
      {/* Filter Bar */}
      <section className="sticky top-16 lg:top-20 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveFilter("All")}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilter === "All"
                  ? "bg-brand-primary text-white shadow-sm"
                  : "bg-gray-100 text-text-muted hover:bg-gray-200"
              }`}
            >
              All ({visibleStories.length})
            </button>
            {allIndustries.map((industry) => {
              const count = visibleStories.filter((s) => s.industry === industry).length;
              if (count === 0) return null;
              return (
                <button
                  key={industry}
                  onClick={() => setActiveFilter(industry)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeFilter === industry
                      ? "bg-brand-primary text-white shadow-sm"
                      : "bg-gray-100 text-text-muted hover:bg-gray-200"
                  }`}
                >
                  {industry} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12 bg-brand-light min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 text-sm text-text-muted">
            Showing{" "}
            <span className="font-semibold text-brand-dark">{filtered.length}</span>{" "}
            use case{filtered.length !== 1 ? "s" : ""}
            {activeFilter !== "All" ? ` in ${activeFilter}` : ""}
          </div>

          <motion.div
            key={activeFilter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((uc, index) => (
              <motion.div
                key={uc._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.04 }}
                className="bg-white rounded-2xl border border-gray-200 hover:border-brand-primary hover:shadow-lg transition-all flex flex-col overflow-hidden group"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={projectImages[uc.project] || industryImages[uc.industry as Industry] || industryImages["Other"]}
                    alt={uc.project}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <span
                      className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                        industryColors[uc.industry as Industry] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {uc.industry}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-bold text-brand-dark text-base mb-3">
                    <Link href={`/success-stories/${storySlug(uc)}`} className="transition-colors hover:text-brand-primary">
                      {uc.project}
                    </Link>
                  </h3>
                  <p className="text-sm text-text-body leading-relaxed mb-4 flex-1">{uc.summary}</p>
                {uc.results && (
                  <div className="bg-brand-light rounded-xl p-4 mb-4 border border-gray-100">
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                      Key Results
                    </p>
                    <p className="text-sm text-brand-dark font-medium">{uc.results}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {(uc.technologies || []).map((tech) => (
                    <span
                      key={tech}
                      className="text-xs px-2 py-1 bg-gray-50 border border-gray-200 rounded-md text-text-muted"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/success-stories/${storySlug(uc)}`}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-primary"
                >
                  Read the success story <span aria-hidden="true">→</span>
                </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-text-muted text-lg">No use cases found for this filter.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
