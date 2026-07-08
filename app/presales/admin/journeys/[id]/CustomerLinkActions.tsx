"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";

export function CustomerLinkActions({ accessToken }: { accessToken: string }) {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    const url = `${window.location.origin}/presales/j/${accessToken}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <span className="flex items-center gap-1">
      <button
        type="button"
        title="Linki kopyala"
        onClick={copyLink}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-white hover:text-brand-primary"
      >
        {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
      </button>
      <a
        href={`/presales/j/${accessToken}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Müşteri sayfasını aç"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-white hover:text-brand-primary"
      >
        <ExternalLink size={13} />
      </a>
    </span>
  );
}
