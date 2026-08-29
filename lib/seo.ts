import type { Metadata } from "next";

export const SITE_URL = "https://www.ereteam.com";
export const SITE_NAME = "Ereteam";

const DEFAULT_DESCRIPTION =
  "Ereteam is an enterprise data and analytics consultancy with 25 years of expertise across cloud, AI, financial performance and marketing intelligence.";

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  image?: string;
  keywords?: string[];
  absoluteTitle?: boolean;
};

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export function createPageMetadata({
  title,
  description,
  path,
  image = "/opengraph-image",
  keywords,
  absoluteTitle = false,
}: PageMetadataOptions): Metadata {
  const socialTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: SITE_NAME,
      url: path,
      title: socialTitle,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: socialTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [image],
    },
  };
}

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": ["Organization", "ProfessionalService"],
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: absoluteUrl("/logos/ereteam-logo.png"),
  image: absoluteUrl("/opengraph-image"),
  description: DEFAULT_DESCRIPTION,
  foundingDate: "2001",
  email: "info@ereteam.com",
  telephone: ["+1-973-349-3440", "+90-216-518-44-40"],
  sameAs: ["https://www.linkedin.com/company/ereteam"],
  address: [
    {
      "@type": "PostalAddress",
      name: "US Headquarters",
      streetAddress: "39 Woodbrook Circle",
      addressLocality: "Westfield",
      addressRegion: "NJ",
      postalCode: "07090",
      addressCountry: "US",
    },
    {
      "@type": "PostalAddress",
      name: "Türkiye Operations Center",
      streetAddress: "Mehmet Akif Mah. Tavukçuyolu Cad. No:150 K:2 D:3",
      addressLocality: "Ümraniye",
      addressRegion: "İstanbul",
      addressCountry: "TR",
    },
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "sales",
      email: "info@ereteam.com",
      telephone: "+1-973-349-3440",
      areaServed: ["US", "TR", "EU"],
      availableLanguage: ["English", "Turkish"],
    },
  ],
  numberOfEmployees: {
    "@type": "QuantitativeValue",
    minValue: 80,
  },
  knowsAbout: [
    "Enterprise data analytics",
    "Cloud data platforms",
    "Artificial intelligence",
    "Financial planning and analysis",
    "IBM Planning Analytics",
    "Marketing intelligence",
    "HCL Unica",
    "Data governance",
  ],
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: SITE_NAME,
  alternateName: "Ereteam Analytics",
  url: SITE_URL,
  inLanguage: "en-US",
  publisher: { "@id": `${SITE_URL}/#organization` },
};

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function serviceSchema(options: {
  name: string;
  description: string;
  path: string;
  serviceType: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${absoluteUrl(options.path)}#service`,
    name: options.name,
    description: options.description,
    serviceType: options.serviceType,
    url: absoluteUrl(options.path),
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: ["United States", "Türkiye", "Europe", "Global"],
  };
}

export function softwareSchema(options: {
  name: string;
  description: string;
  path: string;
  applicationCategory: string;
  operatingSystem?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${absoluteUrl(options.path)}#software`,
    name: options.name,
    description: options.description,
    url: absoluteUrl(options.path),
    applicationCategory: options.applicationCategory,
    operatingSystem: options.operatingSystem || "Web",
    author: { "@id": `${SITE_URL}/#organization` },
  };
}

export function collectionSchema(options: {
  name: string;
  description: string;
  path: string;
  items: Array<{ name: string; path?: string }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${absoluteUrl(options.path)}#collection`,
    name: options.name,
    description: options.description,
    url: absoluteUrl(options.path),
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: options.items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        ...(item.path ? { url: absoluteUrl(item.path) } : {}),
      })),
    },
  };
}
