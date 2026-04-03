import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://ereteam.com";
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/about/company`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/about/careers`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/about/certifications`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/services/data-cloud-ai`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/services/financial-performance-intelligence`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/services/marketing-intelligence`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/products`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/products/obserian`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/products/pharmeta`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/products/maturytics`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/partners`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/use-cases`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/news`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/privacy-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
