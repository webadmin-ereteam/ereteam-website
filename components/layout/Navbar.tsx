"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Menu, X } from "lucide-react";

const servicesDropdown = [
  {
    label: "Data, Cloud & AI",
    href: "/services/data-cloud-ai",
    description: "Modern data architecture, cloud migration, AI/ML solutions",
  },
  {
    label: "Financial Performance & Intelligence",
    href: "/services/financial-performance-intelligence",
    description: "FP&A, budgeting, financial analytics platforms",
  },
  {
    label: "Marketing Intelligence",
    href: "/services/marketing-intelligence",
    description: "Marketing analytics, campaign intelligence, ROI optimization",
  },
];

const productsDropdown = [
  {
    label: "Obserian",
    href: "/products/obserian",
    description: "Enterprise data governance & quality platform",
  },
  {
    label: "Pharmeta",
    href: "/products/pharmeta",
    description: "Pharma commercial analytics suite",
  },
  {
    label: "Maturytics",
    href: "/products/maturytics",
    description: "Data maturity assessment platform",
  },
];

const aboutDropdown = [
  { label: "Company", href: "/about/company" },
  { label: "Careers", href: "/about/careers" },
  { label: "Certifications", href: "/about/certifications" },
];

const resourcesDropdown = [
  { label: "Success Stories", href: "/use-cases", description: "Customer success stories" },
  { label: "Blog", href: "/blog", description: "Video content and technical articles" },
  { label: "News", href: "/news", description: "Company and industry news" },
];

type DropdownKey = "services" | "products" | "about" | "resources" | null;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<DropdownKey>(null);
  const [mobileExpanded, setMobileExpanded] = useState<DropdownKey>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleMouseEnter = (key: DropdownKey) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(key);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const navTextColor =
    scrolled || mobileOpen ? "text-brand-dark" : "text-white";
  const navBg = scrolled
    ? "bg-white shadow-md"
    : mobileOpen
    ? "bg-white"
    : "bg-transparent";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logos/ereteam-logo.png"
              alt="Ereteam"
              width={160}
              height={48}
              className={`h-[78px] w-auto transition-all duration-300 ${scrolled ? "" : "brightness-0 invert"}`}
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Services */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter("services")}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                href="/services"
                className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-md transition-colors hover:text-brand-primary ${navTextColor}`}
                onClick={() => setActiveDropdown(null)}
              >
                Services
                <ChevronDown
                  size={14}
                  className={`transition-transform ${activeDropdown === "services" ? "rotate-180" : ""}`}
                />
              </Link>
              {activeDropdown === "services" && (
                <div className="absolute top-full left-0 mt-1 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  {servicesDropdown.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-3 hover:bg-brand-light group"
                      onClick={() => setActiveDropdown(null)}
                    >
                      <div className="font-medium text-brand-dark group-hover:text-brand-primary text-sm">
                        {item.label}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Products */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter("products")}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                href="/products"
                className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-md transition-colors hover:text-brand-primary ${navTextColor}`}
                onClick={() => setActiveDropdown(null)}
              >
                Products
                <ChevronDown
                  size={14}
                  className={`transition-transform ${activeDropdown === "products" ? "rotate-180" : ""}`}
                />
              </Link>
              {activeDropdown === "products" && (
                <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  {productsDropdown.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-3 hover:bg-brand-light group"
                      onClick={() => setActiveDropdown(null)}
                    >
                      <div className="font-medium text-brand-dark group-hover:text-brand-primary text-sm">
                        {item.label}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/partners"
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors hover:text-brand-primary ${navTextColor}`}
            >
              Partners
            </Link>

            {/* About */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter("about")}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                href="/about"
                className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-md transition-colors hover:text-brand-primary ${navTextColor}`}
                onClick={() => setActiveDropdown(null)}
              >
                About
                <ChevronDown
                  size={14}
                  className={`transition-transform ${activeDropdown === "about" ? "rotate-180" : ""}`}
                />
              </Link>
              {activeDropdown === "about" && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  {aboutDropdown.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-3 text-sm font-medium text-brand-dark hover:text-brand-primary hover:bg-brand-light"
                      onClick={() => setActiveDropdown(null)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Resources */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter("resources")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-md transition-colors hover:text-brand-primary ${navTextColor}`}
              >
                Resources
                <ChevronDown
                  size={14}
                  className={`transition-transform ${activeDropdown === "resources" ? "rotate-180" : ""}`}
                />
              </button>
              {activeDropdown === "resources" && (
                <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  {resourcesDropdown.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-3 hover:bg-brand-light group"
                      onClick={() => setActiveDropdown(null)}
                    >
                      <div className="font-medium text-brand-dark group-hover:text-brand-primary text-sm">
                        {item.label}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{item.description}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/contact"
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors hover:text-brand-primary ${navTextColor}`}
            >
              Contact
            </Link>
          </div>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <Link
              href="/contact"
              className="inline-flex items-center px-5 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-opacity-90 transition-all shadow-sm hover:shadow-md"
            >
              Let&apos;s Talk
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className={`lg:hidden p-2 rounded-md ${navTextColor}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 max-h-[calc(100vh-64px)] overflow-y-auto">
          <div className="px-4 py-4 space-y-1">
            {/* Services mobile */}
            <div>
              <button
                onClick={() =>
                  setMobileExpanded(
                    mobileExpanded === "services" ? null : "services"
                  )
                }
                className="w-full flex items-center justify-between px-3 py-3 text-sm font-medium text-brand-dark rounded-lg hover:bg-brand-light"
              >
                Services
                <ChevronDown
                  size={16}
                  className={`transition-transform ${mobileExpanded === "services" ? "rotate-180" : ""}`}
                />
              </button>
              {mobileExpanded === "services" && (
                <div className="ml-4 mt-1 space-y-1">
                  <Link
                    href="/services"
                    className="block px-3 py-2 text-sm font-semibold text-brand-primary hover:bg-brand-light rounded-lg"
                    onClick={() => setMobileOpen(false)}
                  >
                    All Services →
                  </Link>
                  {servicesDropdown.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-3 py-2 text-sm text-text-body hover:text-brand-primary hover:bg-brand-light rounded-lg"
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Products mobile */}
            <div>
              <button
                onClick={() =>
                  setMobileExpanded(
                    mobileExpanded === "products" ? null : "products"
                  )
                }
                className="w-full flex items-center justify-between px-3 py-3 text-sm font-medium text-brand-dark rounded-lg hover:bg-brand-light"
              >
                Products
                <ChevronDown
                  size={16}
                  className={`transition-transform ${mobileExpanded === "products" ? "rotate-180" : ""}`}
                />
              </button>
              {mobileExpanded === "products" && (
                <div className="ml-4 mt-1 space-y-1">
                  <Link
                    href="/products"
                    className="block px-3 py-2 text-sm font-semibold text-brand-primary hover:bg-brand-light rounded-lg"
                    onClick={() => setMobileOpen(false)}
                  >
                    All Products →
                  </Link>
                  {productsDropdown.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-3 py-2 text-sm text-text-body hover:text-brand-primary hover:bg-brand-light rounded-lg"
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/partners"
              className="block px-3 py-3 text-sm font-medium text-brand-dark hover:text-brand-primary hover:bg-brand-light rounded-lg"
              onClick={() => setMobileOpen(false)}
            >
              Partners
            </Link>

            {/* About mobile */}
            <div>
              <button
                onClick={() =>
                  setMobileExpanded(
                    mobileExpanded === "about" ? null : "about"
                  )
                }
                className="w-full flex items-center justify-between px-3 py-3 text-sm font-medium text-brand-dark rounded-lg hover:bg-brand-light"
              >
                About
                <ChevronDown
                  size={16}
                  className={`transition-transform ${mobileExpanded === "about" ? "rotate-180" : ""}`}
                />
              </button>
              {mobileExpanded === "about" && (
                <div className="ml-4 mt-1 space-y-1">
                  <Link
                    href="/about"
                    className="block px-3 py-2 text-sm font-semibold text-brand-primary hover:bg-brand-light rounded-lg"
                    onClick={() => setMobileOpen(false)}
                  >
                    About Ereteam →
                  </Link>
                  {aboutDropdown.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-3 py-2 text-sm text-text-body hover:text-brand-primary hover:bg-brand-light rounded-lg"
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Resources mobile */}
            <div>
              <button
                onClick={() =>
                  setMobileExpanded(
                    mobileExpanded === "resources" ? null : "resources"
                  )
                }
                className="w-full flex items-center justify-between px-3 py-3 text-sm font-medium text-brand-dark rounded-lg hover:bg-brand-light"
              >
                Resources
                <ChevronDown
                  size={16}
                  className={`transition-transform ${mobileExpanded === "resources" ? "rotate-180" : ""}`}
                />
              </button>
              {mobileExpanded === "resources" && (
                <div className="ml-4 mt-1 space-y-1">
                  {resourcesDropdown.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-3 py-2 text-sm text-text-body hover:text-brand-primary hover:bg-brand-light rounded-lg"
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/contact"
              className="block px-3 py-3 text-sm font-medium text-brand-dark hover:text-brand-primary hover:bg-brand-light rounded-lg"
              onClick={() => setMobileOpen(false)}
            >
              Contact
            </Link>

            <div className="pt-2 pb-4">
              <Link
                href="/contact"
                className="block w-full text-center px-5 py-3 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-opacity-90 transition-all"
                onClick={() => setMobileOpen(false)}
              >
                Let&apos;s Talk
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
