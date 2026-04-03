import { Metadata } from "next";
import HeroSection from "@/components/sections/HeroSection";
import StatsBar from "@/components/sections/StatsBar";
import LogoTicker from "@/components/sections/LogoTicker";
import CTABanner from "@/components/sections/CTABanner";
import HomePageClient from "./HomePageClient";

export const metadata: Metadata = {
  title: "Ereteam | Where Data Comes Alive",
  description:
    "Ereteam is an enterprise data & analytics consultancy with 25 years of expertise. Data, Cloud & AI, Financial Performance Intelligence, and Marketing Intelligence.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <HomePageClient />
      <LogoTicker />
      <CTABanner />
    </>
  );
}
