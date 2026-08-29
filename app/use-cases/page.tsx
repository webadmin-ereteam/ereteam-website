export const revalidate = 60;

import type { Metadata } from "next";
import { getAllSuccessStories } from "@/lib/sanity/queries";
import UseCasesClient from "@/components/sections/UseCasesClient";
import { createPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema, collectionSchema } from "@/lib/seo";
import { Trophy } from "lucide-react";
import EditorialOverviewHero from "@/components/sections/EditorialOverviewHero";

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
      <JsonLd data={[collectionSchema({ name: "Ereteam Success Stories", description: "Measurable enterprise data and analytics outcomes delivered by Ereteam.", path: "/use-cases", items: stories.map((story) => ({ name: story.project })) }), breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Success Stories", path: "/use-cases" }])]} />
      <EditorialOverviewHero
        eyebrow="Success stories"
        title="Proven impact across every industry."
        description="Over 25 years, we have delivered measurable outcomes for more than 100 enterprise organizations across banking, pharma, telecom, retail and beyond."
        railLabel={`${stories.length} documented outcomes`}
        railText="Evidence from real programs: faster planning, stronger governance and decisions made with greater confidence."
        icon={Trophy}
      />
      <UseCasesClient stories={stories} />
    </>
  );
}
