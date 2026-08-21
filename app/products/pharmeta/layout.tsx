import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbSchema, softwareSchema } from "@/lib/seo";

const description = "Pharmeta is an AI-powered product and customer data platform for matching inconsistent records and creating governed golden records across systems.";

export default function PharmetaLayout({ children }: { children: React.ReactNode }) {
  return <><JsonLd data={[softwareSchema({ name: "Pharmeta", description, path: "/products/pharmeta", applicationCategory: "BusinessApplication" }), breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Products", path: "/products" }, { name: "Pharmeta", path: "/products/pharmeta" }])]} />{children}</>;
}
