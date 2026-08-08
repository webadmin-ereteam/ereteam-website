import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/presales/j/", "/presales/admin/", "/spark"],
    },
    sitemap: "https://ereteam.com/sitemap.xml",
  };
}
