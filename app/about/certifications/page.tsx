export const revalidate = 60;

import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { getAllCertificationGroups } from "@/lib/sanity/queries";

const colorThemes: Record<string, { bg: string; border: string; accent: string; dot: string }> = {
  blue:   { bg: "bg-blue-50",   border: "border-blue-200",   accent: "text-blue-700",   dot: "bg-blue-400" },
  orange: { bg: "bg-orange-50", border: "border-orange-200", accent: "text-orange-700", dot: "bg-orange-400" },
  red:    { bg: "bg-red-50",    border: "border-red-200",    accent: "text-red-700",    dot: "bg-red-400" },
  sky:    { bg: "bg-sky-50",    border: "border-sky-200",    accent: "text-sky-700",    dot: "bg-sky-400" },
  cyan:   { bg: "bg-cyan-50",   border: "border-cyan-200",   accent: "text-cyan-700",   dot: "bg-cyan-400" },
  violet: { bg: "bg-violet-50", border: "border-violet-200", accent: "text-violet-700", dot: "bg-violet-400" },
  green:  { bg: "bg-green-50",  border: "border-green-200",  accent: "text-green-700",  dot: "bg-green-400" },
  pink:   { bg: "bg-pink-50",   border: "border-pink-200",   accent: "text-pink-700",   dot: "bg-pink-400" },
  yellow: { bg: "bg-yellow-50", border: "border-yellow-200", accent: "text-yellow-700", dot: "bg-yellow-400" },
  gray:   { bg: "bg-gray-50",   border: "border-gray-200",   accent: "text-gray-700",   dot: "bg-gray-400" },
};
const defaultTheme = colorThemes.gray;

export const metadata: Metadata = {
  title: "Certifications – Ereteam",
  description:
    "Ereteam's technology certifications across IBM, AWS, HCL, Alteryx, Tableau, and DataRobot platforms.",
};

export default async function CertificationsPage() {
  const certGroups = await getAllCertificationGroups();

  return (
    <>
      {/* Hero */}
      {/* Hero */}
      <section
        className="pt-32 pb-20"
        style={{ background: "linear-gradient(135deg, #1A1A2E 0%, #0D3A5C 100%)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-4">
            <Link href="/about" className="text-sm text-gray-400 hover:text-white transition-colors">
              ← About
            </Link>
          </div>
          <p className="text-sm font-medium text-brand-primary uppercase tracking-widest mb-4">
            Certifications
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
            Certified Expertise,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-blue-400">Every Engagement</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Our certifications across 6 major technology vendors are evidence of our
            commitment to technical excellence. When you work with Ereteam, you get
            senior certified practitioners — not junior consultants building their skills
            on your project.
          </p>
        </div>
      </section>

      {/* Cert Groups */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {certGroups.length === 0 ? (
            <p className="text-center text-gray-400 py-20">Certification data coming soon.</p>
          ) : (
          <div className="space-y-8">
            {certGroups.map((group) => {
              const theme = colorThemes[group.colorTheme ?? ""] ?? defaultTheme;
              return (
                <div
                  key={group._id}
                  className={`rounded-2xl p-8 border ${theme.bg} ${theme.border} transition-all hover:shadow-md`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`w-3 h-3 rounded-full flex-shrink-0 ${theme.dot}`} />
                    <h2 className={`text-xl font-extrabold ${theme.accent}`}>
                      {group.vendor}
                    </h2>
                  </div>
                  {group.description && (
                    <p className="text-sm text-text-body leading-relaxed mb-5 pl-6">
                      {group.description}
                    </p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pl-6">
                    {(group.certifications || []).map((cert) => (
                      <div
                        key={cert.name}
                        className="flex items-start gap-3 bg-white rounded-xl p-4 border border-white/80 shadow-sm"
                      >
                        <CheckCircle size={15} className={`flex-shrink-0 mt-0.5 ${theme.accent}`} />
                        <p className="text-sm font-medium text-brand-dark leading-snug">{cert.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#07111F]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/10 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Work with certified experts
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Every Ereteam engagement is staffed with certified practitioners on your
            platform of choice.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#0284c7] to-brand-primary text-white font-bold rounded-lg hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:-translate-y-1 transition-all"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </>
  );
}
