"use client";

import Image from "next/image";
import { ArrowUpRight, Radio } from "lucide-react";
import { useState } from "react";
import type { LinkedInFeedPost } from "@/lib/linkedin";

const PAGE_SIZE = 6;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Europe/Istanbul",
  }).format(new Date(value));
}

export default function LinkedInFeed({ posts }: { posts: LinkedInFeedPost[] }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  if (!posts.length) return null;

  const visiblePosts = posts.slice(0, visibleCount);

  return (
    <section className="bg-[#071A2A] py-20 text-white lg:py-28">
      <div className="site-container">
        <div className="grid gap-8 border-b border-white/15 pb-11 lg:grid-cols-[.65fr_1.35fr] lg:items-end">
          <p className="site-kicker text-[#D69A6E]">Latest updates</p>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="site-display max-w-3xl text-5xl sm:text-6xl lg:text-7xl">
              Fresh from the Ereteam feed.
            </h2>
            <a
              href="https://www.linkedin.com/company/ereteam"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-white/70 transition-colors hover:text-white"
            >
              Follow Ereteam <ArrowUpRight size={15} />
            </a>
          </div>
        </div>

        <div className="grid border-white/15 md:grid-cols-2 md:border-l xl:grid-cols-3">
          {visiblePosts.map((post) => (
            <article key={post.id} className="group flex flex-col border-b border-white/15 py-8 md:border-r md:px-7 lg:py-10">
              <a href={post.url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden">
                <div className="relative aspect-[4/3] overflow-hidden bg-[#102C3E]">
                  {post.imageUrl ? (
                    <Image
                      src={post.imageUrl}
                      alt={post.imageAlt || "Ereteam LinkedIn update"}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                    />
                  ) : (
                    <div className="flex h-full flex-col justify-between p-7">
                      <Radio size={28} strokeWidth={1.4} className="text-[#D69A6E]" />
                      <p className="site-display max-w-xs text-3xl text-white/90">Ereteam in the conversation.</p>
                    </div>
                  )}
                </div>
              </a>

              <div className="flex flex-1 flex-col pt-6">
                <p className="text-[11px] font-bold uppercase tracking-[.15em] text-white/45">
                  {formatDate(post.publishedAt)}
                </p>
                {post.articleTitle && (
                  <h3 className="mt-4 text-xl font-semibold leading-7 tracking-[-.025em] text-white">
                    {post.articleTitle}
                  </h3>
                )}
                <p className="mt-4 line-clamp-5 text-[15px] leading-7 text-white/68">{post.text}</p>
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-7 inline-flex items-center gap-2 self-start text-xs font-bold uppercase tracking-[.1em] text-[#D69A6E] transition-colors hover:text-white"
                >
                  Read on LinkedIn <ArrowUpRight size={14} />
                </a>
              </div>
            </article>
          ))}
        </div>

        {visibleCount < posts.length && (
          <div className="flex justify-center border-t border-white/15 pt-10">
            <button
              type="button"
              onClick={() => setVisibleCount((count) => Math.min(count + PAGE_SIZE, posts.length))}
              className="border border-white/30 px-7 py-4 text-xs font-bold uppercase tracking-[.12em] text-white transition-colors hover:border-white hover:bg-white hover:text-[#071A2A]"
            >
              Show more updates
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
