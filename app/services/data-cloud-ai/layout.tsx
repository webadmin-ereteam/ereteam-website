import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema, createPageMetadata, serviceSchema } from "@/lib/seo";

const description = "Modernize enterprise data platforms with cloud architecture, data engineering, governance, DataOps, predictive AI and generative AI services from Ereteam.";

export const metadata: Metadata = createPageMetadata({
  title: "Data, Cloud and AI Consulting",
  description,
  path: "/services/data-cloud-ai",
  image: "/images/editorial/service-data-ai-v2.png",
  keywords: ["data cloud AI consulting", "data engineering consulting", "data governance services", "generative AI consulting"],
});

export default function DataCloudAiLayout({ children }: { children: React.ReactNode }) {
  return <><JsonLd data={[serviceSchema({ name: "Data, Cloud and AI Consulting", description, path: "/services/data-cloud-ai", serviceType: "Enterprise data, cloud and artificial intelligence consulting" }), breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name: "Data, Cloud and AI", path: "/services/data-cloud-ai" }])]} />{children}</>;
}
