import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema, softwareSchema } from "@/lib/seo";

const description = "Obserian is an AI-powered enterprise data quality and governance platform for automated validation, lineage and compliance reporting.";

export default function ObserianLayout({ children }: { children: React.ReactNode }) {
  return <><JsonLd data={[softwareSchema({ name: "Obserian", description, path: "/products/obserian", applicationCategory: "BusinessApplication" }), breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Products", path: "/products" }, { name: "Obserian", path: "/products/obserian" }])]} />{children}</>;
}
