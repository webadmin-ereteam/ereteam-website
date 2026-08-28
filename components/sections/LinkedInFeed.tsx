"use client";

import Image from "next/image";
import { ArrowUpRight, Radio, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { LinkedInFeedPost } from "@/lib/linkedin";

const PAGE_SIZE = 6;
const LINK_PATTERN = /((?:https?:\/\/|www\.)[^\s]+|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|#[A-Za-z0-9_À-ÖØ-öø-ÿĞğİıŞşÇçÖöÜü]+)/g;

function LinkifiedText({ text }: { text: string }) {
  return text.split(LINK_PATTERN).map((part, index) => {
    if (/^(?:https?:\/\/|www\.)/i.test(part)) {
      const trailing = part.match(/[),.;!?]+$/)?.[0] || "";
      const url = trailing ? part.slice(0, -trailing.length) : part;
      const href = url.startsWith("www.") ? `https://${url}` : url;
      return (
        <span key={`${part}-${index}`}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="break-all font-medium text-[#B96F38] underline decoration-[#B96F38]/35 underline-offset-4 hover:decoration-current"
          >
            {url}
          </a>
          {trailing}
        </span>
      );
    }

    if (/^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(part)) {
      return (
        <a key={`${part}-${index}`} href={`mailto:${part}`} className="break-all font-medium text-[#B96F38] underline decoration-[#B96F38]/35 underline-offset-4">
          {part}
        </a>
      );
    }

    if (part.startsWith("#")) {
      return <span key={`${part}-${index}`} className="font-medium text-[#9B5729]">{part}</span>;
    }

    return part;
  });
}

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
            <article key={post.id} className="group flex min-w-0 flex-col overflow-hidden border-b border-white/15 py-8 md:border-r md:px-7 lg:py-10">
              <button
                type="button"
                onClick={() => setSelectedPost(post)}
                className="block w-full overflow-hidden text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D69A6E]"
                aria-label={`Read full post from ${formatDate(post.publishedAt)}`}
              >
                <div className="relative aspect-[1.91/1] overflow-hidden">
                  {post.imageUrl ? (
                    <Image
                      src={post.imageUrl}
                      alt={post.imageAlt || "Ereteam LinkedIn update"}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-contain transition-transform duration-700 ease-out group-hover:scale-[1.015]"
                    />
                  ) : (
                    <div className="flex h-full flex-col justify-between p-7">
                      <Radio size={28} strokeWidth={1.4} className="text-[#D69A6E]" />
                      <p className="site-display max-w-xs text-3xl text-white/90">Ereteam in the conversation.</p>
                    </div>
                  )}
                </div>
              </button>

              <div className="flex flex-1 flex-col pt-6">
                <p className="text-[11px] font-bold uppercase tracking-[.15em] text-white/45">
                  {formatDate(post.publishedAt)}
                </p>
                {post.articleTitle && (
                  <h3 className="mt-4 text-xl font-semibold leading-7 tracking-[-.025em] text-white">
                    {post.articleTitle}
                  </h3>
                )}
                <p className="mt-4 line-clamp-5 min-w-0 whitespace-pre-line break-words text-[15px] leading-7 text-white/68 [overflow-wrap:anywhere]">
                  <LinkifiedText text={post.text} />
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <button
                    type="button"
                    onClick={() => setSelectedPost(post)}
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.1em] text-[#D69A6E] transition-colors hover:text-white"
                  >
                    Read full post <ArrowUpRight size={14} />
                  </button>
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.1em] text-white/55 transition-colors hover:text-white"
                  >
                    View on LinkedIn <ArrowUpRight size={14} />
                  </a>
                </div>
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
          <article className="relative max-h-[92vh] min-w-0 w-full max-w-3xl overflow-x-hidden overflow-y-auto bg-[#f3f0e8] px-6 py-8 text-[#071A2A] shadow-2xl sm:px-10 sm:py-10">
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
            {selectedPost.imageUrl && (
              <div className="relative mt-7 aspect-[1.91/1] w-full overflow-hidden border border-[#071A2A]/10">
                <Image
                  src={selectedPost.imageUrl}
                  alt={selectedPost.imageAlt || "Ereteam LinkedIn update"}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="object-contain"
                />
              </div>
            )}
            <p
              id={selectedPost.articleTitle ? undefined : "linkedin-post-title"}
              className="mt-7 min-w-0 whitespace-pre-line break-words text-[17px] leading-8 text-[#223441] [overflow-wrap:anywhere]"
            >
              <LinkifiedText text={selectedPost.text} />
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
