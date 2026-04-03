export const revalidate = 60;

import { getAllSuccessStories } from "@/lib/sanity/queries";
import UseCasesClient from "@/components/sections/UseCasesClient";

export default async function UseCasesPage() {
  const stories = await getAllSuccessStories();

  return (
    <>
      <section
        className="pt-32 pb-16"
        style={{ background: "linear-gradient(135deg, #1A1A2E 0%, #0D3A5C 100%)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-medium text-brand-primary uppercase tracking-widest mb-3">
            Success Stories
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6">
            Proven Impact Across{" "}
            <span className="text-brand-primary">Every Industry</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Over 25 years, we&apos;ve delivered measurable outcomes for 100+ enterprise
            organizations across banking, pharma, telecom, retail, and beyond.
          </p>
        </div>
      </section>
      <UseCasesClient stories={stories} />
    </>
  );
}
