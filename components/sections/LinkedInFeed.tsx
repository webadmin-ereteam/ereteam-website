"use client";

import Image from "next/image";
import { ArrowUpRight, Radio, X } from "lucide-react";
import { useEffect, useState } from "react";
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

export default function LinkedInFeed({
  posts,
  initialPostId,
}: {
  posts: LinkedInFeedPost[];
  initialPostId?: string;
}) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedPost, setSelectedPost] = useState<LinkedInFeedPost | null>(
    () => posts.find((post) => post.id === initialPostId) || null
  );

  useEffect(() => {
    if (!selectedPost) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedPost(null);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedPost]);

  if (!posts.length) return null;

  const visiblePosts = posts.slice(0, visibleCount);

  return (
    <section className="bg-[#071A2A] py-12 text-white lg:py-16">
      <div className="site-container">
        <div className="grid gap-5 border-b border-white/15 pb-7 lg:grid-cols-[.4fr_1fr_auto] lg:items-end">
          <p className="site-kicker text-[#D69A6E]">Latest updates</p>
          <h2 className="site-display text-4xl sm:text-5xl lg:whitespace-nowrap lg:text-6xl">
            Latest from Ereteam.
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
                <p className="mt-4 line-clamp-5 whitespace-pre-line text-[15px] leading-7 text-white/68">{post.text}</p>
                <button
                  type="button"
                  onClick={() => setSelectedPost(post)}
                  className="mt-7 inline-flex items-center gap-2 self-start text-xs font-bold uppercase tracking-[.1em] text-[#D69A6E] transition-colors hover:text-white"
                >
                  Read full post <ArrowUpRight size={14} />
                </button>
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

      {selectedPost && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-[#03101b]/80 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="linkedin-post-title"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setSelectedPost(null);
          }}
        >
          <article className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto bg-[#f3f0e8] px-6 py-8 text-[#071A2A] shadow-2xl sm:px-10 sm:py-10">
            <button
              type="button"
              onClick={() => setSelectedPost(null)}
              className="absolute right-5 top-5 grid size-10 place-items-center border border-[#071A2A]/20 transition-colors hover:bg-[#071A2A] hover:text-white"
              aria-label="Close post"
            >
              <X size={19} />
            </button>

            <p className="site-kicker pr-14">Ereteam on LinkedIn</p>
            <p className="mt-5 text-sm font-semibold uppercase tracking-[.1em] text-[#071A2A]/45">
              {formatDate(selectedPost.publishedAt)}
            </p>
            {selectedPost.articleTitle && (
              <h2 id="linkedin-post-title" className="site-display mt-5 max-w-2xl text-3xl sm:text-4xl">
                {selectedPost.articleTitle}
              </h2>
            )}
            <p
              id={selectedPost.articleTitle ? undefined : "linkedin-post-title"}
              className="mt-7 whitespace-pre-line text-[17px] leading-8 text-[#223441]"
            >
              {selectedPost.text}
            </p>
            <a
              href={selectedPost.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-9 inline-flex items-center gap-2 border-t border-[#071A2A]/15 pt-6 text-xs font-bold uppercase tracking-[.11em] text-[#9B5729] transition-colors hover:text-[#071A2A]"
            >
              View original on LinkedIn <ArrowUpRight size={14} />
            </a>
          </article>
        </div>
      )}
    </section>
  );
}
