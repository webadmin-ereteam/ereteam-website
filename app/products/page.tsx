import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Products",
  description: "Ereteam's purpose-built enterprise analytics products: Obserian, Pharmeta, and Maturytics.",
};

const products = [
  {
    logo: "/logos/products/obserian.svg",
    name: "Obserian",
    tagline: "Enterprise Data Governance",
    href: "/products/obserian",
    externalHref: "https://obserian.com",
    image: "/images/editorial/product-obserian-v2.png",
    accent: "#a88bcc",
    statement: "Make enterprise data trustworthy before it becomes a risk.",
    description: "Obserian continuously validates data quality, maps lineage and creates an auditable governance layer across complex enterprise environments.",
    capabilities: ["Automated validation", "End-to-end lineage", "Audit-ready governance"],
  },
  {
    logo: "/logos/products/pharmeta_logo.png",
    name: "Pharmeta",
    tagline: "Pharmaceutical Product Data",
    href: "/products/pharmeta",
    externalHref: "https://pharmeta.io",
    image: "/images/editorial/product-pharmeta-v2.png",
    accent: "#9e8bd7",
    statement: "One clean product record across every market and distributor.",
    description: "Pharmeta matches, cleans and certifies complex pharmaceutical product data so commercial and operations teams work from the same trusted record.",
    capabilities: ["AI-powered SKU matching", "Golden record creation", "Multi-market control"],
  },
  {
    logo: "/logos/products/maturytics.svg",
    name: "Maturytics",
    tagline: "Data Maturity Assessment",
    href: "/products/maturytics",
    externalHref: "https://maturytics.com",
    image: "/images/editorial/product-maturytics-v2.png",
    accent: "#d87949",
    statement: "Turn data maturity into a practical investment roadmap.",
    description: "Maturytics assesses capability across five dimensions, exposes the real gaps and converts findings into a prioritized, measurable transformation plan.",
    capabilities: ["5-dimension assessment", "Prioritized roadmaps", "Progress measurement"],
  },
];

export default function ProductsPage() {
  return (
    <div className="products-index bg-[#f6f3ec]">
      <section className="bg-[#071a2a] pb-16 pt-32 text-white lg:pb-20 lg:pt-40">
        <div className="site-container">
          <p className="site-kicker">Ereteam products</p>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_.7fr] lg:items-end">
            <h1 className="site-display max-w-5xl text-[clamp(3.8rem,8vw,8.4rem)]">Built from real enterprise problems.</h1>
            <p className="max-w-xl border-l border-white/20 pl-6 text-lg leading-8 text-white/68 lg:pb-2">Three focused platforms shaped by 25 years of delivery experience—not generic software looking for a use case.</p>
          </div>
        </div>
      </section>

      <section className="py-10 lg:py-16">
        <div className="site-container space-y-8 lg:space-y-12">
          {products.map((product, index) => (
            <article key={product.name} className="group grid overflow-hidden border border-[#071a2a]/18 bg-white lg:grid-cols-2">
              <Link href={product.href} className={`relative min-h-[340px] overflow-hidden sm:min-h-[440px] lg:min-h-[620px] ${index % 2 ? "lg:order-2" : ""}`}>
                <Image src={product.image} alt={`${product.name} platform team at work`} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-[1.025]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071a2a]/65 via-transparent to-transparent" />
                <span className="absolute bottom-6 left-6 text-xs font-bold uppercase tracking-[.16em] text-white/75">{product.tagline}</span>
              </Link>

              <div className={`flex min-h-[560px] flex-col p-7 sm:p-10 lg:min-h-[620px] lg:p-14 ${index % 2 ? "lg:order-1" : ""}`}>
                <div className="flex items-start border-b border-[#071a2a]/14 pb-7">
                  <div className="relative h-12 w-48">
                    <Image src={product.logo} alt={`${product.name} logo`} fill sizes="192px" className="object-contain object-left" />
                  </div>
                </div>

                <div className="my-auto py-10">
                  <p className="text-xs font-bold uppercase tracking-[.16em]" style={{ color: product.accent }}>{product.tagline}</p>
                  <h2 className="mt-6 text-[clamp(2.6rem,4vw,4.8rem)] font-semibold leading-[.98] tracking-[-.055em] text-[#071a2a]">{product.statement}</h2>
                  <p className="mt-7 max-w-2xl text-lg leading-8 text-[#40515d]">{product.description}</p>
                  <div className="mt-9 grid gap-3 border-t border-[#071a2a]/14 pt-7 sm:grid-cols-3">
                    {product.capabilities.map((capability) => (
                      <div key={capability} className="flex gap-3 text-sm font-semibold leading-5 text-[#213846]">
                        <span className="mt-2 h-px w-4 flex-none" style={{ backgroundColor: product.accent }} />
                        {capability}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link href={product.href} className="site-button">Explore {product.name} <ArrowRight size={15} /></Link>
                  <a href={product.externalHref} target="_blank" rel="noopener noreferrer" className="site-button border-[#071a2a]/35 bg-transparent text-[#071a2a] hover:text-white">Product website <ArrowUpRight size={15} /></a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#071a2a] py-16 text-white lg:py-20">
        <div className="site-container grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="site-kicker">Start a conversation</p>
            <h2 className="mt-5 max-w-4xl text-[clamp(2.7rem,5vw,5.8rem)] font-semibold leading-[.98] tracking-[-.05em]">See the right product against your own data challenge.</h2>
          </div>
          <Link href="/contact" className="site-button site-button--light">Request a demo <ArrowRight size={16} /></Link>
        </div>
      </section>
    </div>
  );
}
