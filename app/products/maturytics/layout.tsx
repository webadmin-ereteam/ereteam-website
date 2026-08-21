import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema, softwareSchema } from "@/lib/seo";

const description = "Maturytics assesses enterprise data and analytics maturity, identifies capability gaps and generates a prioritized transformation roadmap.";

export default function MaturyticsLayout({ children }: { children: React.ReactNode }) {
  return <><JsonLd data={[softwareSchema({ name: "Maturytics", description, path: "/products/maturytics", applicationCategory: "BusinessApplication" }), breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Products", path: "/products" }, { name: "Maturytics", path: "/products/maturytics" }])]} />{children}</>;
}
