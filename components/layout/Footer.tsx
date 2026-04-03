import Link from "next/link";
import Image from "next/image";
import { Globe } from "lucide-react";

const services = [
  { label: "Data, Cloud & AI", href: "/services/data-cloud-ai" },
  {
    label: "Financial Performance & Intelligence",
    href: "/services/financial-performance-intelligence",
  },
  {
    label: "Marketing Intelligence",
    href: "/services/marketing-intelligence",
  },
];

const products = [
  { label: "Obserian", internalHref: "/products/obserian", externalHref: "https://obserian.com" },
  { label: "Pharmeta", internalHref: "/products/pharmeta", externalHref: "https://pharmeta.io" },
  { label: "Maturytics", internalHref: "/products/maturytics", externalHref: "https://maturytics.com" },
];

const company = [
  { label: "About Us", href: "/about/company" },
  { label: "Partners", href: "/partners" },
  { label: "Careers", href: "/about/careers" },
  { label: "Contact", href: "/contact" },
];

const resources = [
  { label: "Blog", href: "/blog" },
  { label: "News", href: "/news" },
  { label: "Success Stories", href: "/use-cases" },
  { label: "Certifications", href: "/about/certifications" },
  { label: "Privacy Policy", href: "/privacy-policy" },
];

export default function Footer() {
  return (
    <footer className="bg-brand-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Col 1: Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/logos/ereteam-logo.png"
                alt="Ereteam"
                width={180}
                height={54}
                className="h-14 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-sm font-medium text-white mb-3">
              Where Data Comes Alive
            </p>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              25 years of enterprise data &amp; analytics expertise. HQ in USA,
              operations in Türkiye.
            </p>
            <a
              href="https://www.linkedin.com/company/ereteam"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
          </div>

          {/* Col 2: Services */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
              Services
            </h3>
            <ul className="space-y-3">
              {services.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Products */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
              Products
            </h3>
            <ul className="space-y-3">
              {products.map((item) => (
                <li key={item.label}>
                  <div className="inline-flex items-center gap-1.5">
                    <Link
                      href={item.internalHref}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {item.label}
                    </Link>
                    <a
                      href={item.externalHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-300 transition-colors"
                      title={`Visit ${item.label} website`}
                    >
                      <Globe size={12} />
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Company */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
              Company
            </h3>
            <ul className="space-y-3">
              {company.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Resources */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
              Resources
            </h3>
            <ul className="space-y-3">
              {resources.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; 2026 Ereteam. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
