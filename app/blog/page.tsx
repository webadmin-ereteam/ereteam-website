export const revalidate = 60;

import { getAllBlogPosts, BlogPost } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/client";
import Link from "next/link";
import Image from "next/image";
import { Calendar, User, Play } from "lucide-react";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPage() {
  let posts: BlogPost[] = [];
  try {
    posts = await getAllBlogPosts();
  } catch {
    posts = [];
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
                Blog
              </h1>
              <p className="text-gray-400 text-lg">
                Video content, technical articles and insights from the world of data.
              </p>
            </div>
          </div>
        </section>

        {/* Posts Grid */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {posts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg">
                  No blog posts yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <Link
                    key={post._id}
                    href={`/blog/${post.slug.current}`}
                    className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Image / Video Thumbnail */}
                    <div className="relative h-52 bg-gray-100 overflow-hidden">
                      {post.mainImage ? (
                        <Image
                          src={urlFor(post.mainImage).width(600).height(400).url()}
                          alt={post.title}
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
                      {post.videoUrl && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                            <Play size={20} className="text-brand-primary ml-1" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h2 className="text-lg font-semibold text-brand-dark group-hover:text-brand-primary transition-colors mb-2 line-clamp-2">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-text-body text-sm line-clamp-2 mb-4">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-400 mt-auto">
                        {post.publishedAt && (
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(post.publishedAt)}
                          </span>
                        )}
                        {post.author && (
                          <span className="flex items-center gap-1">
                            <User size={12} />
                            {post.author}
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
