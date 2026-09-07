import "server-only";

import Parser from "rss-parser";
import sanitizeHtml from "sanitize-html";
import { decode } from "he";

const SORO_RSS_URL =
  process.env.SORO_RSS_URL ||
  "https://app.trysoro.com/api/rss/0cfffdcd-4a36-41c8-a6d7-160ab20e98bf";

export const SORO_REVALIDATE_SECONDS = 300;
export const SORO_CACHE_TAG = "soro-articles";
const SORO_FETCH_VERSION = "2";

type SoroFeedItem = Parser.Item & {
  fullContent?: string;
  creator?: string;
  author?: string;
  description?: string;
  media?: { $?: { url?: string } };
};

export interface SoroArticle {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  plainContent: string;
  publishedAt?: string;
  author?: string;
  category?: string;
  image?: string;
  sourceUrl?: string;
}

const parser = new Parser<Record<string, never>, SoroFeedItem>({
  customFields: {
    item: [
      ["content:encoded", "fullContent"],
      ["dc:creator", "creator"],
      ["media:content", "media"],
    ],
  },
});

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 90);
}

function plainText(value = "") {
  return decode(sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }))
    .replace(/\s+/g, " ")
    .trim();
}

function safeArticleHtml(value = "") {
  return sanitizeHtml(value, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      "article",
      "section",
      "figure",
      "figcaption",
      "img",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      h1: "h2",
      a: sanitizeHtml.simpleTransform("a", {
        target: "_blank",
        rel: "noopener noreferrer",
      }),
      img: sanitizeHtml.simpleTransform("img", { loading: "lazy" }),
    },
  });
}

function firstImage(value = "") {
  return value.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1];
}

function validDate(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export async function getSoroArticles(): Promise<SoroArticle[]> {
  try {
    const response = await fetch(SORO_RSS_URL, {
      next: { revalidate: SORO_REVALIDATE_SECONDS, tags: [SORO_CACHE_TAG] },
      headers: {
        Accept: "application/rss+xml, application/xml;q=0.9, text/xml;q=0.8",
        "X-Ereteam-RSS-Version": SORO_FETCH_VERSION,
      },
    });

    if (!response.ok) return [];

    const feed = await parser.parseString(await response.text());
    const usedSlugs = new Map<string, number>();

    return feed.items
      .filter((item) => item.title)
      .map((item) => {
        const title = plainText(item.title);
        const baseSlug = slugify(title) || "article";
        const duplicateNumber = usedSlugs.get(baseSlug) ?? 0;
        usedSlugs.set(baseSlug, duplicateNumber + 1);
        const slug = duplicateNumber ? `${baseSlug}-${duplicateNumber + 1}` : baseSlug;
        const rawContent = item.fullContent || item.content || item.contentSnippet || item.summary || item.description || "";
        const excerpt = plainText(item.contentSnippet || item.summary || item.description || rawContent).slice(0, 220);

        return {
          title,
          slug,
          excerpt,
          content: safeArticleHtml(rawContent),
          plainContent: plainText(rawContent),
          publishedAt: validDate(item.isoDate || item.pubDate),
          author: plainText(item.creator || item.author),
          category: item.categories?.[0] ? plainText(item.categories[0]) : undefined,
          image: item.enclosure?.url || item.media?.$?.url || firstImage(rawContent),
          sourceUrl: item.link,
        };
      });
  } catch (error) {
    console.error("Soro RSS feed could not be loaded", error);
    return [];
  }
}

export async function getSoroArticle(slug: string) {
  return (await getSoroArticles()).find((article) => article.slug === slug);
}
