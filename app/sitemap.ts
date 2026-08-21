import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { getAllSuccessStories } from "@/lib/sanity/queries";
import { storySlug } from "@/lib/successStories";

const CORPORATE_UPDATED = new Date("2026-08-21T00:00:00.000Z");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: CORPORATE_UPDATED, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, lastModified: CORPORATE_UPDATED, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/about/company`, lastModified: CORPORATE_UPDATED, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/about/careers`, lastModified: CORPORATE_UPDATED, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/services`, lastModified: CORPORATE_UPDATED, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/services/data-cloud-ai`, lastModified: CORPORATE_UPDATED, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/services/financial-performance-intelligence`, lastModified: CORPORATE_UPDATED, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/services/marketing-intelligence`, lastModified: CORPORATE_UPDATED, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/products`, lastModified: CORPORATE_UPDATED, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/products/obserian`, lastModified: CORPORATE_UPDATED, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/products/pharmeta`, lastModified: CORPORATE_UPDATED, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/products/maturytics`, lastModified: CORPORATE_UPDATED, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/partners`, lastModified: CORPORATE_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/use-cases`, lastModified: CORPORATE_UPDATED, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/social-media`, lastModified: CORPORATE_UPDATED, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/contact`, lastModified: CORPORATE_UPDATED, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/privacy-policy`, lastModified: CORPORATE_UPDATED, changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const stories = await getAllSuccessStories();
    routes.push(
      ...stories.map((story) => ({
        url: `${SITE_URL}/success-stories/${storySlug(story)}`,
        lastModified: story._updatedAt ? new Date(story._updatedAt) : CORPORATE_UPDATED,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }))
    );
  } catch {
    // Corporate routes should remain available if Sanity is temporarily unavailable.
  }

  return routes;
}
