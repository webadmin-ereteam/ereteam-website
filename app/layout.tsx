import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatWidget from "@/components/ChatWidget";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ereteam.com",
    siteName: "Ereteam",
    title: "Ereteam | Where Data Comes Alive",
    description:
      "25 years of enterprise data & analytics expertise. HQ in USA, operations in Türkiye.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <Script
          id="cookieyes"
          src="https://cdn-cookieyes.com/client_data/e2d3115991fe36595be306d4bbde31b9/script.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="font-sans antialiased bg-white text-text-body">
        <Navbar />
        <main>{children}</main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
