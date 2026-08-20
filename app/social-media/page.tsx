import type { Metadata } from "next";
import { ArrowUpRight, BarChart3, Database, Radio, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Ereteam on LinkedIn | Ereteam",
  description: "Follow Ereteam's latest perspectives, project stories and company updates on LinkedIn.",
};

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

export default function SocialMediaPage() {
  return (
    <main>
      <section className="site-overview-hero overflow-hidden bg-[#071A2A] text-white">
        <div className="site-container grid w-full items-center gap-12 lg:grid-cols-[1.25fr_.75fr]">
          <div className="max-w-4xl">
            <p className="site-kicker">Ereteam on social</p>
            <h1 className="site-page-title mt-6">
              Where our work enters the conversation.
            </h1>
            <p className="site-page-lead mt-7 max-w-2xl text-white/68">
              Follow the thinking, delivery lessons and people shaping enterprise data and analytics at Ereteam.
            </p>
            <a
              href="https://www.linkedin.com/company/ereteam"
              target="_blank"
              rel="noopener noreferrer"
              className="site-button site-button--light mt-9"
            >
              Follow on LinkedIn <ArrowUpRight size={16} />
            </a>
          </div>

          <div className="border-l border-white/20 pb-2 pl-7 lg:mb-2 lg:pl-10">
            <Radio className="mb-9 text-[#D69A6E]" size={34} strokeWidth={1.5} />
            <p className="text-xs font-bold uppercase tracking-[.18em] text-white/45">One ongoing feed</p>
            <p className="mt-5 max-w-sm text-xl leading-8 text-white/82">
              Project insight, product thinking and company life—shared while it is happening.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#f3f0e8] py-20 lg:py-28">
        <div className="site-container">
          <div className="grid gap-10 border-b border-[#071A2A]/15 pb-12 lg:grid-cols-[.7fr_1.3fr] lg:items-end">
            <p className="site-kicker">What we share</p>
            <h2 className="site-display max-w-4xl text-5xl text-brand-dark sm:text-6xl lg:text-7xl">
              Insight grounded in real enterprise work.
            </h2>
          </div>

          <div className="grid border-[#071A2A]/15 lg:grid-cols-3 lg:border-l">
            {themes.map(({ icon: Icon, title, description }) => (
              <article key={title} className="border-b border-[#071A2A]/15 py-10 lg:border-r lg:px-9 lg:py-12">
                <Icon size={28} strokeWidth={1.5} className="text-[#B96F38]" />
                <h3 className="mt-9 text-2xl font-semibold tracking-[-.03em] text-brand-dark">{title}</h3>
                <p className="mt-4 max-w-sm text-base leading-7 text-text-muted">{description}</p>
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
