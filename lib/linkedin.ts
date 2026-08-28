import "server-only";

import { unstable_cache } from "next/cache";

const LINKEDIN_API_BASE = "https://api.linkedin.com/rest";
const LINKEDIN_API_VERSION = "202606";
const LINKEDIN_VANITY_NAME = "ereteam";

type LinkedInPostContent = {
  media?: { id?: string; altText?: string; title?: string };
  article?: { source?: string; thumbnail?: string; title?: string; description?: string };
  multiImage?: { images?: Array<{ id?: string; altText?: string }> };
};

type LinkedInApiPost = {
  id: string;
  commentary?: string;
  publishedAt?: number;
  createdAt?: number;
  lifecycleState?: string;
  visibility?: string;
  content?: LinkedInPostContent;
};

export type LinkedInFeedPost = {
  id: string;
  text: string;
  publishedAt: string;
  url: string;
  imageUrl?: string;
  imageAlt?: string;
  articleTitle?: string;
};

function linkedinHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Linkedin-Version": LINKEDIN_API_VERSION,
    "X-Restli-Protocol-Version": "2.0.0",
    "Content-Type": "application/json",
  };
}

async function linkedinGet<T>(path: string, token: string, finder = false): Promise<T> {
  const response = await fetch(`${LINKEDIN_API_BASE}${path}`, {
    headers: {
      ...linkedinHeaders(token),
      ...(finder ? { "X-RestLi-Method": "FINDER" } : {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`LinkedIn API request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function resolveOrganizationId(token: string) {
  if (process.env.LINKEDIN_ORGANIZATION_ID) {
    return process.env.LINKEDIN_ORGANIZATION_ID;
  }

  const params = new URLSearchParams({
    q: "vanityName",
    vanityName: LINKEDIN_VANITY_NAME,
  });
  const result = await linkedinGet<{
    elements?: Array<{ id?: number | string; vanityName?: string }>;
  }>(`/organizations?${params.toString()}`, token, true);

  const organization = result.elements?.find(
    (item) => item.vanityName?.toLowerCase() === LINKEDIN_VANITY_NAME
  ) ?? result.elements?.[0];

  if (!organization?.id) throw new Error("Ereteam LinkedIn organization could not be resolved");
  return String(organization.id);
}

function cleanCommentary(value?: string) {
  return (value || "")
    .replace(/@\[([^\]]+)]\(urn:li:[^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function firstImage(post: LinkedInApiPost) {
  const media = post.content?.media;
  if (media?.id?.startsWith("urn:li:image:")) {
    return { id: media.id, alt: media.altText || media.title || "Ereteam LinkedIn update" };
  }

  const article = post.content?.article;
  if (article?.thumbnail?.startsWith("urn:li:image:")) {
    return { id: article.thumbnail, alt: article.title || "Ereteam LinkedIn article" };
  }

  const image = post.content?.multiImage?.images?.find((item) => item.id?.startsWith("urn:li:image:"));
  return image?.id ? { id: image.id, alt: image.altText || "Ereteam LinkedIn update" } : undefined;
}

async function resolveImageUrl(imageId: string, token: string) {
  const image = await linkedinGet<{ downloadUrl?: string }>(
    `/images/${encodeURIComponent(imageId)}`,
    token
  );
  return image.downloadUrl;
}

async function fetchLinkedInPosts(): Promise<LinkedInFeedPost[]> {
  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  if (!token) return [];

  try {
    const organizationId = await resolveOrganizationId(token);
    const author = `urn:li:organization:${organizationId}`;
    const params = new URLSearchParams({
      author,
      q: "author",
      count: "6",
      sortBy: "LAST_MODIFIED",
    });
    const result = await linkedinGet<{ elements?: LinkedInApiPost[] }>(
      `/posts?${params.toString()}`,
      token,
      true
    );

    const posts = (result.elements || [])
      .filter((post) => post.lifecycleState === "PUBLISHED" && post.visibility === "PUBLIC")
      .slice(0, 6);

    return Promise.all(posts.map(async (post) => {
      const image = firstImage(post);
      let imageUrl: string | undefined;

      if (image) {
        try {
          imageUrl = await resolveImageUrl(image.id, token);
        } catch (error) {
          console.warn("LinkedIn image could not be resolved:", error instanceof Error ? error.message : error);
        }
      }

      const timestamp = post.publishedAt || post.createdAt || Date.now();
      const article = post.content?.article;
      const text = cleanCommentary(post.commentary) || article?.description || article?.title || "View this Ereteam update on LinkedIn.";

      return {
        id: post.id,
        text,
        publishedAt: new Date(timestamp).toISOString(),
        url: `https://www.linkedin.com/feed/update/${post.id}`,
        imageUrl,
        imageAlt: image?.alt,
        articleTitle: article?.title,
      };
    }));
  } catch (error) {
    console.error("LinkedIn feed could not be loaded:", error instanceof Error ? error.message : error);
    return [];
  }
}

export const getLinkedInPosts = unstable_cache(
  fetchLinkedInPosts,
  ["ereteam-linkedin-feed-v1"],
  { revalidate: 21_600 }
);
