import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/presales/j/", "/presales/admin/", "/spark"],
      },
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
        disallow: ["/presales/", "/spark"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
