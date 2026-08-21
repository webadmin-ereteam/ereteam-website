import type { SanitySuccessStory } from "@/lib/sanity/queries";

export function slugifyStory(value: string) {
  return value
    .toLocaleLowerCase("en-US")
    .replace(/[ıİ]/g, "i")
    .replace(/[şŞ]/g, "s")
    .replace(/[ğĞ]/g, "g")
    .replace(/[üÜ]/g, "u")
    .replace(/[öÖ]/g, "o")
    .replace(/[çÇ]/g, "c")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export function storySlug(story: Pick<SanitySuccessStory, "project">) {
  return slugifyStory(story.project);
}

export function storyImage(industry: string) {
  const images: Record<string, string> = {
    "Banking & Finance": "/images/ai/industry_banking.png",
    Insurance: "/images/ai/industry_insurance.png",
    Telecom: "/images/ai/industry_telecom.png",
    "Pharma & Biotech": "/images/ai/work_pharma.png",
    Retail: "/images/ai/work_finance2.png",
    Manufacturing: "/images/ai/services_bg.png",
    Media: "/images/ai/media_.png",
  };

  return images[industry] || "/images/ai/usecases_bg.png";
}
