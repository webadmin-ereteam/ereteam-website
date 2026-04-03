"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SanitySuccessStory } from "@/lib/sanity/queries";

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
                className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-brand-primary hover:shadow-lg transition-all flex flex-col"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span
                    className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                      industryColors[uc.industry as Industry] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {uc.industry}
                  </span>
                </div>
                <h3 className="font-bold text-brand-dark text-base mb-3">{uc.project}</h3>
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
