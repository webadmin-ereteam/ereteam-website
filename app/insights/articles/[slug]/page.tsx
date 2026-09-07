import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import ArticleShareActions from "@/components/insights/ArticleShareActions";
import JsonLd from "@/components/seo/JsonLd";
import { absoluteUrl, breadcrumbSchema, createPageMetadata, SITE_URL } from "@/lib/seo";
import { getSoroArticle } from "@/lib/soro";

export const revalidate = 1800;

type PageProps = { params: { slug: string } };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = await getSoroArticle(params.slug);
  if (!article) return { title: "Article Not Found", robots: { index: false, follow: false } };
  return createPageMetadata({
    title: article.title,
    description: article.excerpt || "Read the latest Ereteam perspective.",
    path: `/insights/articles/${article.slug}`,
    image: article.image,
  });
}

function formatDate(value?: string) {
  if (!value) return undefined;
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}

export default async function ArticlePage({ params }: PageProps) {
  const article = await getSoroArticle(params.slug);
  if (!article) notFound();
  const path = `/insights/articles/${article.slug}`;

  return (
    <main className="detail-page">
      <JsonLd data={[{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: article.title,
        description: article.excerpt,
        image: article.image,
        datePublished: article.publishedAt,
        author: { "@type": "Organization", name: article.author || "Ereteam", url: SITE_URL },
        publisher: { "@id": `${SITE_URL}/#organization` },
        mainEntityOfPage: absoluteUrl(path),
      }, breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Articles", path: "/insights/articles" }, { name: article.title, path }])]} />

      <section className="detail-hero bg-[#071A2A] pb-14 pt-32 text-white lg:pb-20 lg:pt-40">
        <div className="site-container">
          <Link href="/insights/articles" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-white/60 transition-colors hover:text-white"><ArrowLeft size={15} /> All articles</Link>
          <p className="site-kicker mt-10">{article.category || "Ereteam insight"}</p>
          <h1 className="site-page-title site-page-title--compact mt-5 max-w-5xl">{article.title}</h1>
          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/60">
            {article.author && <span>{article.author}</span>}
            {formatDate(article.publishedAt) && <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>}
          </div>
        </div>
      </section>

      <section className="bg-[#f9f7f2]">
        <div className="site-container grid gap-10 lg:grid-cols-[minmax(0,780px)_1fr] lg:gap-20">
          <article>
            <div className="soro-article-body" dangerouslySetInnerHTML={{ __html: article.content }} />
            <ArticleShareActions title={article.title} />
          </article>
          <aside className="border-t border-[#071A2A]/15 pt-6 lg:border-l lg:border-t-0 lg:pl-8" aria-label="Article information">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#B96F38]">Ereteam perspective</p>
            <p className="mt-4 text-sm leading-7 text-text-muted">Explore practical ideas from our work across enterprise data, cloud, AI and performance.</p>
            <Link href="/contact" className="site-button mt-7">Start a conversation</Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
