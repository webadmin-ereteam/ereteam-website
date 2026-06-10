export const revalidate = 60;

import { getAllSuccessStories } from "@/lib/sanity/queries";
import UseCasesClient from "@/components/sections/UseCasesClient";

export default async function UseCasesPage() {
  const stories = await getAllSuccessStories();

  return (
    <>
      <section
        className="pt-32 pb-20"
        style={{ background: "linear-gradient(135deg, #0a1628 0%, #1a2a5e 100%)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-medium text-[#38bdf8] uppercase tracking-widest mb-4">
            Success Stories
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
            Proven Impact Across{" "}
            <span style={{ background: "linear-gradient(90deg, #1A6FA8, #38bdf8, #0C9472)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Every Industry
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Over 25 years, we&apos;ve delivered measurable outcomes for 100+ enterprise
            organizations across banking, pharma, telecom, retail, and beyond.
          </p>
        </div>
      </section>
      <UseCasesClient stories={stories} />
    </>
  );
}
