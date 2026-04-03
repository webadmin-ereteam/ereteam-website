export const revalidate = 60;

import { getAllNewsArticles, NewsArticle } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/client";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Tag } from "lucide-react";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const categoryLabels: Record<string, string> = {
  company: "Company",
  industry: "Industry",
  product: "Product",
  events: "Events",
};

const categoryColors: Record<string, string> = {
  company: "bg-blue-50 text-blue-700",
  industry: "bg-purple-50 text-purple-700",
  product: "bg-green-50 text-green-700",
  events: "bg-orange-50 text-orange-700",
};

export default async function NewsPage() {
  let articles: NewsArticle[] = [];
  try {
    articles = await getAllNewsArticles();
  } catch {
    articles = [];
  }

  return (
    <div className="min-h-screen bg-white">
        {/* Hero */}
        <section className="bg-brand-dark pt-32 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-brand-primary font-semibold text-sm uppercase tracking-widest mb-3">
                Resources
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                News
              </h1>
              <p className="text-gray-400 text-lg">
                Latest updates from Ereteam and the industry.
              </p>
            </div>
          </div>
        </section>

        {/* Articles */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {articles.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg">
                  No news articles yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article) => (
                  <Link
                    key={article._id}
                    href={`/news/${article.slug.current}`}
                    className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Image */}
                    <div className="relative h-52 bg-gray-100 overflow-hidden">
                      {article.mainImage ? (
                        <Image
                          src={urlFor(article.mainImage).width(600).height(400).url()}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 flex items-center justify-center">
                          <span className="text-brand-primary/30 text-5xl font-bold">
                            E
                          </span>
                        </div>
                      )}
                      {article.category && (
                        <div className="absolute top-3 left-3">
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                              categoryColors[article.category] ||
                              "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {categoryLabels[article.category] || article.category}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h2 className="text-lg font-semibold text-brand-dark group-hover:text-brand-primary transition-colors mb-2 line-clamp-2">
                        {article.title}
                      </h2>
                      {article.excerpt && (
                        <p className="text-text-body text-sm line-clamp-2 mb-4">
                          {article.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        {article.publishedAt && (
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(article.publishedAt)}
                          </span>
                        )}
                        {article.source && (
                          <span className="flex items-center gap-1">
                            <Tag size={12} />
                            {article.source}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
    </div>
  );
}
