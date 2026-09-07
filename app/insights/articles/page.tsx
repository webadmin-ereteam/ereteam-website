/* eslint-disable @next/next/no-img-element -- RSS image hosts are dynamic and cannot be predeclared for Next/Image. */
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import JsonLd from "@/components/seo/JsonLd";
import { absoluteUrl, breadcrumbSchema, createPageMetadata, SITE_URL } from "@/lib/seo";
import { getSoroArticles } from "@/lib/soro";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Enterprise Data and Analytics Articles",
  description: "Explore Ereteam articles on enterprise data, cloud, AI, financial performance and marketing intelligence.",
  path: "/insights/articles",
  keywords: ["enterprise data analytics articles", "cloud and AI insights", "financial performance management", "marketing intelligence"],
});

function formatDate(value?: string) {
  if (!value) return undefined;
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}

export default async function ArticlesPage() {
  const articles = await getSoroArticles();

  return (
    <>
      <JsonLd data={[{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${absoluteUrl("/insights/articles")}#articles`,
        name: "Ereteam Articles",
        url: absoluteUrl("/insights/articles"),
        isPartOf: { "@id": `${SITE_URL}/#website` },
      }, breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Insights", path: "/use-cases" }, { name: "Articles", path: "/insights/articles" }])]} />

      <section className="site-overview-hero !min-h-[430px] !pb-10 !pt-24 overflow-hidden bg-[#071A2A] text-white lg:!min-h-[460px] lg:!pb-12 lg:!pt-28">
        <div className="site-container grid w-full items-center gap-8 lg:grid-cols-[1.25fr_.75fr] lg:gap-12">
          <div className="max-w-4xl">
            <p className="site-kicker">Ideas from the field</p>
            <h1 className="site-page-title site-page-title--compact mt-4">Insight for the decisions behind transformation.</h1>
            <p className="site-page-lead mt-5 max-w-2xl text-white/68">Practical perspectives on enterprise data, cloud, AI and performance—grounded in the systems we build and the outcomes they enable.</p>
          </div>
          <div className="border-t border-white/20 pt-6 lg:border-l lg:border-t-0 lg:pb-2 lg:pl-8 lg:pt-0">
            <BookOpen className="mb-5 text-[#D69A6E]" size={30} strokeWidth={1.5} />
            <p className="text-xs font-bold uppercase tracking-[.18em] text-white/45">Ereteam articles</p>
            <p className="mt-3 max-w-sm text-lg leading-7 text-white/82">Clear thinking for leaders turning complex data into confident action.</p>
          </div>
        </div>
      </section>

      <section className="bg-[#f9f7f2] py-14 lg:py-20">
        <div className="site-container">
          {articles.length ? (
            <div className="grid border-l border-t border-[#071A2A]/15 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/insights/articles/${article.slug}`}
                  className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B96F38]"
                  aria-label={`Read ${article.title}`}
                >
                  <article className="flex min-h-[360px] h-full flex-col overflow-hidden border-b border-r border-[#071A2A]/15 bg-white">
                    {article.image && <img src={article.image} alt="" className="aspect-[16/9] w-full border-b border-[#071A2A]/15 object-cover transition-transform duration-500 group-hover:scale-[1.01]" loading="lazy" />}
                    <div className="flex flex-1 flex-col p-6 lg:p-8">
                      <p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#B96F38]">{article.category || "Insight"}{formatDate(article.publishedAt) ? ` · ${formatDate(article.publishedAt)}` : ""}</p>
                      <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-[-.035em] text-brand-dark">{article.title}</h2>
                      {article.excerpt && <p className="mt-4 line-clamp-3 text-[15px] leading-7 text-text-muted">{article.excerpt}</p>}
                      <span className="mt-auto inline-flex items-center gap-2 pt-7 text-xs font-bold uppercase tracking-[.12em] text-brand-dark transition-colors group-hover:text-[#B96F38]">Read article <ArrowRight size={15} /></span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <div className="border-y border-[#071A2A]/15 py-16 text-center">
              <p className="site-kicker">Coming soon</p>
              <h2 className="site-display mx-auto mt-5 max-w-3xl text-4xl text-brand-dark sm:text-5xl">New perspectives are being prepared.</h2>
              <p className="mx-auto mt-5 max-w-xl text-text-muted">Our first articles will appear here as soon as they are published.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
