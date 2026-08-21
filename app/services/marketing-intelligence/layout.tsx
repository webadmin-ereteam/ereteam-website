import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema, createPageMetadata, serviceSchema } from "@/lib/seo";

const description = "Build measurable omnichannel customer engagement with HCL Unica campaign management, real-time decisioning, journey analytics and marketing operations expertise.";

export const metadata: Metadata = createPageMetadata({
  title: "Marketing Intelligence and HCL Unica Consulting",
  description,
  path: "/services/marketing-intelligence",
  image: "/images/editorial/service-marketing-v2.png",
  keywords: ["HCL Unica consulting", "campaign management consulting", "next best offer", "marketing intelligence services"],
});

export default function MarketingIntelligenceLayout({ children }: { children: React.ReactNode }) {
  return <><JsonLd data={[serviceSchema({ name: "Marketing Intelligence and HCL Unica Consulting", description, path: "/services/marketing-intelligence", serviceType: "Enterprise marketing technology and customer intelligence consulting" }), breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name: "Marketing Intelligence", path: "/services/marketing-intelligence" }])]} />{children}</>;
}
