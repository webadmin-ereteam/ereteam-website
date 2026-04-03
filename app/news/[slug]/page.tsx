export const revalidate = 60;

import { getNewsArticleBySlug, getAllNewsArticles } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/client";
import { PortableText } from "next-sanity";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Tag, ArrowLeft } from "lucide-react";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const categoryLabels: Record<string, string> = {
  company: "Company News",
  industry: "Industry News",
  product: "Product Updates",
  events: "Events",
};

export async function generateStaticParams() {
  const articles = await getAllNewsArticles();
  return articles.map((article) => ({ slug: article.slug.current }));
}

export default async function NewsArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const article = await getNewsArticleBySlug(params.slug);
  if (!article) notFound();

  return (
    <div className="min-h-screen bg-white">
        {/* Hero */}
        <section className="bg-brand-dark pt-32 pb-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to News
            </Link>
            {article.category && (
              <p className="text-brand-primary text-sm font-semibold uppercase tracking-widest mb-3">
                {categoryLabels[article.category] || article.category}
              </p>
            )}
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {article.title}
            </h1>
            <div className="flex items-center gap-5 text-sm text-gray-400">
              {article.publishedAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {formatDate(article.publishedAt)}
                </span>
              )}
              {article.source && (
                <span className="flex items-center gap-1.5">
                  <Tag size={14} />
                  {article.source}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Content */}
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {article.mainImage && (
            <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden mb-10">
              <Image
                src={urlFor(article.mainImage).width(900).height(500).url()}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {article.excerpt && (
            <p className="text-xl text-gray-500 border-l-4 border-brand-primary pl-5 mb-10 leading-relaxed">
              {article.excerpt}
            </p>
          )}

          {article.body && (
            <div className="prose prose-lg max-w-none prose-headings:text-brand-dark prose-headings:font-bold prose-p:text-text-body prose-a:text-brand-primary prose-strong:text-brand-dark">
              <PortableText value={article.body as Parameters<typeof PortableText>[0]["value"]} />
            </div>
          )}
        </article>
    </div>
  );
}
