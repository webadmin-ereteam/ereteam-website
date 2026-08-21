export const revalidate = 60;

import type { Metadata } from "next";
import { getAllSuccessStories } from "@/lib/sanity/queries";
import UseCasesClient from "@/components/sections/UseCasesClient";
import { createPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema, collectionSchema } from "@/lib/seo";
import { storySlug } from "@/lib/successStories";

export const metadata: Metadata = createPageMetadata({
  title: "Enterprise Data and Analytics Success Stories",
  description: "Explore Ereteam success stories across banking, insurance, telecom, pharma, retail and manufacturing, with measurable enterprise data and analytics outcomes.",
  path: "/use-cases",
  image: "/images/ai/usecases_bg.png",
  keywords: ["data analytics case studies", "IBM Planning Analytics success stories", "enterprise AI case studies", "HCL Unica case studies"],
});

export default async function UseCasesPage() {
  const stories = await getAllSuccessStories();

  return (
    <>
      <JsonLd data={[collectionSchema({ name: "Ereteam Success Stories", description: "Measurable enterprise data and analytics outcomes delivered by Ereteam.", path: "/use-cases", items: stories.map((story) => ({ name: story.project, path: `/success-stories/${storySlug(story)}` })) }), breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Success Stories", path: "/use-cases" }])]} />
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
