import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema, createPageMetadata, serviceSchema } from "@/lib/seo";

const description = "Transform FP&A, budgeting, forecasting and financial consolidation with Ereteam's IBM Planning Analytics and enterprise performance management expertise.";

export const metadata: Metadata = createPageMetadata({
  title: "Financial Performance and Planning Consulting",
  description,
  path: "/services/financial-performance-intelligence",
  image: "/images/editorial/service-finance-v2.png",
  keywords: ["IBM Planning Analytics consulting", "TM1 consulting", "FP&A transformation", "financial consolidation consulting"],
});

export default function FinancialPerformanceLayout({ children }: { children: React.ReactNode }) {
  return <><JsonLd data={[serviceSchema({ name: "Financial Performance and Planning Consulting", description, path: "/services/financial-performance-intelligence", serviceType: "Financial planning, analysis and consolidation consulting" }), breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name: "Financial Performance and Intelligence", path: "/services/financial-performance-intelligence" }])]} />{children}</>;
}
