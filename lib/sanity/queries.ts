import { client } from "./client";

// ─── Blog ────────────────────────────────────────────────────────────────────

export interface BlogPost {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  excerpt?: string;
  mainImage?: { asset: { _ref: string } };
  videoUrl?: string;
  author?: string;
  body?: unknown[];
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  return client.fetch(
    `*[_type == "blog"] | order(publishedAt desc) {
      _id, title, slug, publishedAt, excerpt, mainImage, videoUrl, author
    }`
  );
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  return client.fetch(
    `*[_type == "blog" && slug.current == $slug][0] {
      _id, title, slug, publishedAt, excerpt, mainImage, videoUrl, author, body
    }`,
    { slug }
  );
}

// ─── News ────────────────────────────────────────────────────────────────────

export interface NewsArticle {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  excerpt?: string;
  mainImage?: { asset: { _ref: string } };
  category?: string;
  source?: string;
  body?: unknown[];
}

export async function getAllNewsArticles(): Promise<NewsArticle[]> {
  return client.fetch(
    `*[_type == "news"] | order(publishedAt desc) {
      _id, title, slug, publishedAt, excerpt, mainImage, category, source
    }`
  );
}

export async function getNewsArticleBySlug(slug: string): Promise<NewsArticle | null> {
  return client.fetch(
    `*[_type == "news" && slug.current == $slug][0] {
      _id, title, slug, publishedAt, excerpt, mainImage, category, source, body
    }`,
    { slug }
  );
}

// ─── Success Stories ─────────────────────────────────────────────────────────

export interface SanitySuccessStory {
  _id: string;
  industry: string;
  project: string;
  technologies: string[];
  summary?: string;
  results?: string;
  order?: number;
}

export async function getAllSuccessStories(): Promise<SanitySuccessStory[]> {
  return client.fetch(
    `*[_type == "successStory" && industry != "Government"] | order(order asc, project asc) {
      _id, industry, project, technologies, summary, results, order
    }`
  );
}

// ─── Team Members ─────────────────────────────────────────────────────────────

export interface SanityTeamMember {
  _id: string;
  name: string;
  title: string;
  region?: string;
  bio?: string;
  image?: { asset: { _ref: string } };
  linkedIn?: string;
  groups?: string[];
  order?: number;
}

export async function getAllTeamMembers(): Promise<SanityTeamMember[]> {
  return client.fetch(
    `*[_type == "teamMember"] | order(order asc, name asc) {
      _id, name, title, region, bio, image, linkedIn, groups, order
    }`
  );
}

export async function getLeadershipTeam(): Promise<SanityTeamMember[]> {
  return client.fetch(
    `*[_type == "teamMember" && "leadership" in groups] | order(order asc, name asc) {
      _id, name, title, region, bio, image, linkedIn, groups, order
    }`
  );
}

export async function getPartnersBoard(): Promise<SanityTeamMember[]> {
  return client.fetch(
    `*[_type == "teamMember" && "partners_board" in groups] | order(order asc, name asc) {
      _id, name, title, region, bio, image, linkedIn, groups, order
    }`
  );
}

// ─── Partners ─────────────────────────────────────────────────────────────────

export interface SanityPartner {
  _id: string;
  name: string;
  logo?: { asset: { _ref: string } };
  description?: string;
  areas: string[];
  useCases: string[];
  order?: number;
}

export async function getAllPartners(): Promise<SanityPartner[]> {
  return client.fetch(
    `*[_type == "partner"] | order(order asc, name asc) {
      _id, name, logo, description, areas, useCases, order
    }`
  );
}

// ─── Certifications ───────────────────────────────────────────────────────────

export interface SanityCert {
  name: string;
}

export interface SanityCertificationGroup {
  _id: string;
  vendor: string;
  description?: string;
  certifications: SanityCert[];
  colorTheme?: string;
  order?: number;
}

export async function getAllCertificationGroups(): Promise<SanityCertificationGroup[]> {
  return client.fetch(
    `*[_type == "certificationGroup"] | order(order asc, vendor asc) {
      _id, vendor, description, certifications, colorTheme, order
    }`
  );
}

// ─── Job Postings ─────────────────────────────────────────────────────────────

export interface SanityJobPosting {
  _id: string;
  title: string;
  department: string;
  location?: string;
  type?: string;
  description?: string;
  requirements: string[];
  isActive: boolean;
  publishedAt?: string;
}

export async function getAllActiveJobPostings(): Promise<SanityJobPosting[]> {
  return client.fetch(
    `*[_type == "jobPosting" && isActive == true] | order(publishedAt desc) {
      _id, title, department, location, type, description, requirements, isActive, publishedAt
    }`
  );
}
