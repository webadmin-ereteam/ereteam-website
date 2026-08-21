import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatWidget from "@/components/ChatWidget";
import CookieBannerGate from "@/components/CookieBannerGate";
import JsonLd from "@/components/seo/JsonLd";
import { organizationSchema, SITE_URL, websiteSchema } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s | Ereteam",
    default: "Ereteam | Where Data Comes Alive",
  },
  description:
    "Ereteam is an enterprise data & analytics consultancy with 25 years of expertise. We help organizations unlock the value in their data through cloud, AI, financial intelligence, and marketing analytics.",
  keywords: [
    "data analytics",
    "enterprise data",
    "cloud analytics",
    "AI",
    "financial intelligence",
    "marketing intelligence",
    "data consultancy",
  ],
  authors: [{ name: "Ereteam", url: SITE_URL }],
  creator: "Ereteam",
  publisher: "Ereteam",
  category: "Enterprise Data & Analytics Consulting",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Ereteam",
    title: "Ereteam | Where Data Comes Alive",
    description:
      "25 years of enterprise data & analytics expertise. HQ in USA, operations in Türkiye.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Ereteam — Where Data Comes Alive" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ereteam | Where Data Comes Alive",
    description: "25 years of enterprise data and analytics expertise.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          id="cookieyes"
          src="https://cdn-cookieyes.com/client_data/e2d3115991fe36595be306d4bbde31b9/script.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="font-sans antialiased bg-[#f7f5ef] text-text-body">
        <JsonLd data={[organizationSchema, websiteSchema]} />
        <a href="#main-content" className="site-skip-link">Skip to content</a>
        <CookieBannerGate />
        <Navbar />
        <main id="main-content">{children}</main>
        <Footer />
        <ChatWidget />
        <Script
          id="hs-script-loader"
          src="//js-eu1.hs-scripts.com/147286586.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
