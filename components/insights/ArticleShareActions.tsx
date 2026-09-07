"use client";

import { useState } from "react";
import { Check, Copy, Mail, MessageCircle, Share2 } from "lucide-react";

export default function ArticleShareActions({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const buttonClass =
    "inline-flex min-h-11 items-center gap-2 border border-[#071A2A]/20 bg-white px-4 text-xs font-bold uppercase tracking-[.08em] text-brand-dark transition-colors hover:border-[#B96F38] hover:text-[#B96F38]";

  const shareData = () => ({ title, url: window.location.href });
  const openShareWindow = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareData().url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const nativeShare = async () => {
    if (navigator.share) await navigator.share(shareData());
    else await copyLink();
  };

  return (
    <aside className="my-10 border-y border-[#071A2A]/15 py-5" aria-label="Share this article">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[#B96F38]">Share this article</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={buttonClass}
            aria-label="Share on LinkedIn"
            onClick={() => openShareWindow(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData().url)}`)}
          >
            <span aria-hidden="true" className="text-sm font-extrabold leading-none">in</span>
            <span className="hidden sm:inline">LinkedIn</span>
          </button>
          <button
            type="button"
            className={buttonClass}
            aria-label="Share on WhatsApp"
            onClick={() => {
              const data = shareData();
              openShareWindow(`https://wa.me/?text=${encodeURIComponent(`${data.title} ${data.url}`)}`);
            }}
          >
            <MessageCircle size={16} /> <span className="hidden sm:inline">WhatsApp</span>
          </button>
          <button
            type="button"
            className={buttonClass}
            aria-label="Share on X"
            onClick={() => {
              const data = shareData();
              openShareWindow(`https://twitter.com/intent/tweet?text=${encodeURIComponent(data.title)}&url=${encodeURIComponent(data.url)}`);
            }}
          >
            <span aria-hidden="true" className="text-sm leading-none">𝕏</span>
          </button>
          <a
            className={buttonClass}
            aria-label="Share by email"
            href={`mailto:?subject=${encodeURIComponent(title)}`}
            onClick={(event) => {
              event.currentTarget.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareData().url)}`;
            }}
          >
            <Mail size={16} />
          </a>
          <button type="button" onClick={copyLink} className={buttonClass} aria-label="Copy article link">
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy link"}</span>
          </button>
          <button type="button" onClick={nativeShare} className={`${buttonClass} sm:hidden`} aria-label="Open share menu">
            <Share2 size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
