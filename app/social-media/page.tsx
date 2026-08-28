import type { Metadata } from "next";
import { ArrowUpRight, BarChart3, Database, Radio, Users } from "lucide-react";
import { createPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import { absoluteUrl, breadcrumbSchema, SITE_URL } from "@/lib/seo";
import { getLinkedInPosts } from "@/lib/linkedin";
import LinkedInFeed from "@/components/sections/LinkedInFeed";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Ereteam Insights and LinkedIn Updates",
  description: "Follow Ereteam's latest enterprise data, AI, financial planning and marketing technology perspectives on LinkedIn.",
  path: "/social-media",
  image: "/images/ai/media_.png",
});

const themes = [
  {
    icon: Database,
    title: "Data, Cloud & AI",
    description: "Practical perspectives from the systems, platforms and AI programs we deliver.",
  },
  {
    icon: BarChart3,
    title: "Enterprise Performance",
    description: "Ideas for turning financial and operational data into decisions leaders can act on.",
  },
  {
    icon: Users,
    title: "People & Culture",
    description: "The teams, events and shared moments behind 25 years of enterprise delivery.",
  },
];

export default async function SocialMediaPage({
  searchParams,
}: {
  searchParams?: { post?: string };
}) {
  const posts = await getLinkedInPosts();
  const initialPostId = typeof searchParams?.post === "string" ? searchParams.post : undefined;

  return (
    <main>
      <JsonLd data={[{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${absoluteUrl("/social-media")}#insights`,
        name: "Ereteam Insights and LinkedIn Updates",
        url: absoluteUrl("/social-media"),
        isPartOf: { "@id": `${SITE_URL}/#website` },
        sameAs: "https://www.linkedin.com/company/ereteam",
      }, breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Insights", path: "/social-media" }])]} />
      <section className="site-overview-hero !min-h-[430px] !pb-10 !pt-24 overflow-hidden bg-[#071A2A] text-white lg:!min-h-[460px] lg:!pb-12 lg:!pt-28">
        <div className="site-container grid w-full items-center gap-8 lg:grid-cols-[1.25fr_.75fr] lg:gap-12">
          <div className="max-w-4xl">
            <p className="site-kicker">Ereteam on social</p>
            <h1 className="site-page-title site-page-title--compact mt-4">
              Where our work enters the conversation.
            </h1>
            <p className="site-page-lead mt-5 max-w-2xl text-white/68">
              Follow the thinking, delivery lessons and people shaping enterprise data and analytics at Ereteam.
            </p>
            <a
              href="https://www.linkedin.com/company/ereteam"
              target="_blank"
              rel="noopener noreferrer"
              className="site-button site-button--light mt-6"
            >
              Follow on LinkedIn <ArrowUpRight size={16} />
            </a>
          </div>

          <div className="border-t border-white/20 pt-6 lg:border-l lg:border-t-0 lg:pb-2 lg:pl-8 lg:pt-0">
            <Radio className="mb-5 text-[#D69A6E]" size={30} strokeWidth={1.5} />
            <p className="text-xs font-bold uppercase tracking-[.18em] text-white/45">One ongoing feed</p>
            <p className="mt-3 max-w-sm text-lg leading-7 text-white/82">
              Project insight, product thinking and company life—shared while it is happening.
            </p>
          </div>
        </div>
      </section>

      <LinkedInFeed posts={posts} initialPostId={initialPostId} />

      <section className="bg-[#f3f0e8] py-12 lg:py-16">
        <div className="site-container">
          <div className="grid gap-5 border-b border-[#071A2A]/15 pb-7 lg:grid-cols-[.7fr_1.3fr] lg:items-end">
            <p className="site-kicker">What we share</p>
            <h2 className="site-display max-w-3xl text-4xl text-brand-dark sm:text-5xl lg:text-6xl">
              Insight grounded in real enterprise work.
            </h2>
          </div>

          <div className="grid border-[#071A2A]/15 lg:grid-cols-3 lg:border-l">
            {themes.map(({ icon: Icon, title, description }) => (
              <article key={title} className="border-b border-[#071A2A]/15 py-7 lg:border-r lg:px-8 lg:py-8">
                <Icon size={23} strokeWidth={1.5} className="text-[#B96F38]" />
                <h3 className="mt-5 text-xl font-semibold tracking-[-.03em] text-brand-dark">{title}</h3>
                <p className="mt-3 max-w-sm text-[15px] leading-6 text-text-muted">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 lg:py-24">
        <div className="site-container flex flex-col gap-8 border-y border-[#071A2A]/15 py-12 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="site-kicker">Join the conversation</p>
            <p className="site-display mt-5 max-w-3xl text-4xl text-brand-dark sm:text-5xl">
              Stay close to what we are learning and building.
            </p>
          </div>
          <a
            href="https://www.linkedin.com/company/ereteam"
            target="_blank"
            rel="noopener noreferrer"
            className="site-button shrink-0"
          >
            Visit Ereteam on LinkedIn <ArrowUpRight size={16} />
          </a>
        </div>
      </section>
    </main>
  );
}
