import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import { absoluteUrl, breadcrumbSchema, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Contact Ereteam",
  description: "Contact Ereteam's enterprise data and analytics teams in New Jersey and Istanbul to discuss data, AI, financial planning or marketing technology initiatives.",
  path: "/contact",
  image: "/images/editorial/hero-advisory.png",
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <><JsonLd data={[{
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${absoluteUrl("/contact")}#contact`,
    name: "Contact Ereteam",
    url: absoluteUrl("/contact"),
    about: { "@id": `${SITE_URL}/#organization` },
  }, breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])]} />{children}</>;
}
