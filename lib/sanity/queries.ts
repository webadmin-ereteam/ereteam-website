import { client } from "./client";

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
  imagePartners?: { asset: { _ref: string } };
  linkedIn?: string;
  order?: number;
}

export async function getPartnersBoard(): Promise<SanityTeamMember[]> {
  return client.fetch(
    `*[_type == "teamMember"] | order(order asc, name asc) {
      _id, name, title, region, bio, image, imagePartners, linkedIn, order
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
