export const revalidate = 60;

import { getBlogPostBySlug, getAllBlogPosts } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/client";
import { PortableText } from "next-sanity";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, User, ArrowLeft } from "lucide-react";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  return posts.map((post) => ({ slug: post.slug.current }));
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getBlogPostBySlug(params.slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-white">
        {/* Hero */}
        <section className="bg-brand-dark pt-32 pb-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Blog
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {post.title}
            </h1>
            <div className="flex items-center gap-5 text-sm text-gray-400">
              {post.publishedAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {formatDate(post.publishedAt)}
                </span>
              )}
              {post.author && (
                <span className="flex items-center gap-1.5">
                  <User size={14} />
                  {post.author}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Content */}
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Video */}
          {post.videoUrl && (
            <div className="mb-10">
              <div className="aspect-video rounded-2xl overflow-hidden bg-gray-100">
                <iframe
                  src={post.videoUrl.replace("watch?v=", "embed/")}
                  title={post.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          )}

          {/* Main Image (only if no video) */}
          {!post.videoUrl && post.mainImage && (
            <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden mb-10">
              <Image
                src={urlFor(post.mainImage).width(900).height(500).url()}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl text-gray-500 border-l-4 border-brand-primary pl-5 mb-10 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Body */}
          {post.body && (
            <div className="prose prose-lg max-w-none prose-headings:text-brand-dark prose-headings:font-bold prose-p:text-text-body prose-a:text-brand-primary prose-strong:text-brand-dark">
              <PortableText value={post.body as Parameters<typeof PortableText>[0]["value"]} />
            </div>
          )}
        </article>
    </div>
  );
}
