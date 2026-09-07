import HeroSection from "@/components/sections/HeroSection";
import StatsBar from "@/components/sections/StatsBar";
import LogoTicker from "@/components/sections/LogoTicker";
import CTABanner from "@/components/sections/CTABanner";
import ServicesSection from "@/components/sections/ServicesSection";
import ProductsSection from "@/components/sections/ProductsSection";
import WorkSection from "@/components/sections/WorkSection";
import PartnersSection from "@/components/sections/PartnersSection";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Ereteam | Where Data Comes Alive",
  description:
    "Ereteam is an enterprise data & analytics consultancy with 25 years of expertise. Data, Cloud & AI, Financial Performance Intelligence, and Marketing Intelligence.",
  path: "/",
  image: "/images/editorial/hero-data-ai.png",
  absoluteTitle: true,
  keywords: ["enterprise data analytics consulting", "AI consulting", "IBM Planning Analytics consulting", "HCL Unica consulting"],
});

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <ServicesSection />
      <ProductsSection />
      <WorkSection />
      <PartnersSection />
      <LogoTicker />
      <CTABanner />
    </>
  );
}
