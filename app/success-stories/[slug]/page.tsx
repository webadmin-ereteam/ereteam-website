import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/seo/JsonLd";
import { getAllSuccessStories } from "@/lib/sanity/queries";
import { absoluteUrl, breadcrumbSchema, createPageMetadata, SITE_URL } from "@/lib/seo";
import { storyImage, storySlug } from "@/lib/successStories";

export const revalidate = 60;

type StoryPageProps = { params: { slug: string } };

async function getStory(slug: string) {
  const stories = await getAllSuccessStories();
  return stories.find((story) => storySlug(story) === slug);
}

export async function generateStaticParams() {
  try {
    const stories = await getAllSuccessStories();
    return stories.map((story) => ({ slug: storySlug(story) }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const story = await getStory(params.slug);
  if (!story) return {};

  return createPageMetadata({
    title: `${story.project} – Success Story`,
    description: story.summary || `A ${story.industry} data and analytics success story delivered by Ereteam.`,
    path: `/success-stories/${params.slug}`,
    image: storyImage(story.industry),
    keywords: [story.industry, ...(story.technologies || []), "enterprise analytics success story"],
  });
}

export default async function SuccessStoryPage({ params }: StoryPageProps) {
  const story = await getStory(params.slug);
  if (!story) notFound();

  const path = `/success-stories/${params.slug}`;
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${absoluteUrl(path)}#article`,
    headline: story.project,
    description: story.summary,
    datePublished: story._createdAt,
    dateModified: story._updatedAt,
    articleSection: story.industry,
    keywords: (story.technologies || []).join(", "),
    image: absoluteUrl(storyImage(story.industry)),
    url: absoluteUrl(path),
    author: { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <article className="bg-[#f5f2ea]">
      <JsonLd data={[articleSchema, breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Success Stories", path: "/use-cases" }, { name: story.project, path }])]} />

      <header className="bg-[#071a2a] text-white">
        <div className="site-container grid min-h-[620px] lg:grid-cols-[1.05fr_.95fr]">
          <div className="flex items-center py-28 pr-0 lg:pr-16">
            <div>
              <Link href="/use-cases" className="text-xs font-bold uppercase tracking-[.15em] text-white/55 transition hover:text-white">← All success stories</Link>
              <p className="site-kicker mt-10">{story.industry}</p>
              <h1 className="site-page-title mt-6">{story.project}</h1>
              {story.summary && <p className="site-page-lead mt-7 max-w-2xl text-white/72">{story.summary}</p>}
            </div>
          </div>
          <div className="relative min-h-[360px] overflow-hidden lg:min-h-full">
            <Image src={storyImage(story.industry)} alt={`${story.project} enterprise analytics success story`} fill priority sizes="(min-width: 1024px) 48vw, 100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#071a2a]/60 via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#071a2a]/25 lg:to-transparent" />
          </div>
        </div>
      </header>

      <section className="py-14 lg:py-20">
        <div className="site-container grid gap-10 lg:grid-cols-[1.25fr_.75fr]">
          <div className="border border-[#071a2a]/14 bg-white p-7 sm:p-10 lg:p-12">
            <p className="site-kicker">The engagement</p>
            <h2 className="mt-5 text-3xl font-semibold tracking-[-.035em] text-[#071a2a] sm:text-4xl">From a complex enterprise challenge to a measurable operating result.</h2>
            <p className="mt-7 text-lg leading-8 text-[#40515d]">{story.summary}</p>
          </div>

          <aside className="border border-[#071a2a]/14 bg-[#071a2a] p-7 text-white sm:p-10">
            <p className="site-kicker">Measured outcome</p>
            <p className="mt-6 text-2xl font-semibold leading-9 tracking-[-.025em]">{story.results || "A governed enterprise analytics capability designed for faster, more confident decisions."}</p>
          </aside>
        </div>
      </section>

      {(story.technologies || []).length > 0 && (
        <section className="border-y border-[#071a2a]/12 bg-white py-12">
          <div className="site-container">
            <p className="site-kicker">Technology foundation</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {story.technologies.map((technology) => <span key={technology} className="border border-[#071a2a]/18 px-4 py-2 text-sm font-semibold text-[#40515d]">{technology}</span>)}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 lg:py-20">
        <div className="site-container flex flex-col items-start justify-between gap-8 border border-[#071a2a]/15 bg-[#e9e4d9] p-8 sm:p-10 lg:flex-row lg:items-center lg:p-12">
          <div>
            <p className="site-kicker">Build the next outcome</p>
            <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-.04em] text-[#071a2a] sm:text-4xl">Bring us the decision your current data cannot support.</h2>
          </div>
          <Link href="/contact" className="site-button site-button--dark shrink-0">Talk to Ereteam</Link>
        </div>
      </section>
    </article>
  );
}
