import "server-only";

import { unstable_cache } from "next/cache";

const LINKEDIN_API_BASE = "https://api.linkedin.com/rest";
const LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";
const LINKEDIN_API_VERSION = "202606";
const LINKEDIN_VANITY_NAME = "ereteam";
const LINKEDIN_CLIENT_ID = "77utxj920hnqpn";
const LINKEDIN_POST_COUNT = 24;
const LINKEDIN_PAGE_SIZE = 10;

let runtimeAccessToken: string | undefined;

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

async function refreshLinkedInAccessToken() {
  const refreshToken = process.env.LINKEDIN_REFRESH_TOKEN;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  if (!refreshToken || !clientSecret) {
    throw new Error("LinkedIn token expired and refresh credentials are incomplete");
  }

  const response = await fetch(LINKEDIN_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: process.env.LINKEDIN_CLIENT_ID || LINKEDIN_CLIENT_ID,
      client_secret: clientSecret,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`LinkedIn access token refresh failed with ${response.status}`);
  }

  const result = await response.json() as { access_token?: string };
  if (!result.access_token) throw new Error("LinkedIn token refresh returned no access token");
  runtimeAccessToken = result.access_token;
  return runtimeAccessToken;
}

async function getLinkedInAccessToken() {
  if (runtimeAccessToken) return runtimeAccessToken;
  if (process.env.LINKEDIN_ACCESS_TOKEN) return process.env.LINKEDIN_ACCESS_TOKEN;
  return refreshLinkedInAccessToken();
}

async function linkedinGet<T>(path: string, finder = false, retryAfterRefresh = true): Promise<T> {
  const token = await getLinkedInAccessToken();
  const response = await fetch(`${LINKEDIN_API_BASE}${path}`, {
    headers: {
      ...linkedinHeaders(token),
      ...(finder ? { "X-RestLi-Method": "FINDER" } : {}),
    },
    cache: "no-store",
  });

  if (response.status === 401 && retryAfterRefresh) {
    await refreshLinkedInAccessToken();
    return linkedinGet<T>(path, finder, false);
  }

  if (!response.ok) {
    throw new Error(`LinkedIn API request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function resolveOrganizationId() {
  if (process.env.LINKEDIN_ORGANIZATION_ID) {
    return process.env.LINKEDIN_ORGANIZATION_ID;
  }

  const params = new URLSearchParams({
    q: "vanityName",
    vanityName: LINKEDIN_VANITY_NAME,
  });
  const result = await linkedinGet<{
    elements?: Array<{ id?: number | string; vanityName?: string }>;
  }>(`/organizations?${params.toString()}`, true);

  const organization = result.elements?.find(
    (item) => item.vanityName?.toLowerCase() === LINKEDIN_VANITY_NAME
  ) ?? result.elements?.[0];

  if (!organization?.id) throw new Error("Ereteam LinkedIn organization could not be resolved");
  return String(organization.id);
}

function cleanCommentary(value?: string) {
  return (value || "")
    .replace(/@\[([^\]]+)]\(urn:li:[^)]+\)/g, "$1")
    .replace(/\{hashtag\}\\?#\|?([^}]+)\}/gi, "#$1")
    .replace(/\{hashtag\|#?([^}]+)\}/gi, "#$1")
    .replace(/\\([_#])/g, "$1")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
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

async function resolveImageUrl(imageId: string) {
  const image = await linkedinGet<{ downloadUrl?: string }>(
    `/images/${encodeURIComponent(imageId)}`
  );
  return image.downloadUrl;
}

async function fetchLinkedInPosts(): Promise<LinkedInFeedPost[]> {
  if (!process.env.LINKEDIN_ACCESS_TOKEN && !process.env.LINKEDIN_REFRESH_TOKEN) return [];

  const organizationId = await resolveOrganizationId();
  const author = `urn:li:organization:${organizationId}`;
  const fetchedPosts: LinkedInApiPost[] = [];

  for (let start = 0; start < LINKEDIN_POST_COUNT; start += LINKEDIN_PAGE_SIZE) {
    const params = new URLSearchParams({
      author,
      q: "author",
      count: String(LINKEDIN_PAGE_SIZE),
      start: String(start),
      sortBy: "LAST_MODIFIED",
    });
    const result = await linkedinGet<{ elements?: LinkedInApiPost[] }>(
      `/posts?${params.toString()}`,
      true
    );
    const page = result.elements || [];
    fetchedPosts.push(...page);
    if (page.length < LINKEDIN_PAGE_SIZE) break;
  }

  const posts = fetchedPosts
    .filter((post) => post.lifecycleState === "PUBLISHED" && post.visibility === "PUBLIC")
    .slice(0, LINKEDIN_POST_COUNT);

  return Promise.all(posts.map(async (post) => {
    const image = firstImage(post);
    let imageUrl: string | undefined;

    if (image) {
      try {
        imageUrl = await resolveImageUrl(image.id);
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
}

const getCachedLinkedInPosts = unstable_cache(
  fetchLinkedInPosts,
  ["ereteam-linkedin-feed-v4"],
  { revalidate: 21_600 }
);

export async function getLinkedInPosts() {
  try {
    return await getCachedLinkedInPosts();
  } catch (error) {
    console.error("LinkedIn feed could not be loaded:", error instanceof Error ? error.message : error);
    return [];
  }
}
