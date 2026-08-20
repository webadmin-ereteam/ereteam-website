export const revalidate = 60;

import { getAllPartners, SanityPartner } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/client";
import Image from "next/image";
import Link from "next/link";

const localLogos: Record<string, string> = {
  "IBM": "/logos/partners/ibm.png",
  "AWS": "/logos/partners/aws.png",
  "HCL Software": "/logos/partners/hcl.png",
  "Databricks": "/logos/partners/databricks.png",
  "Alteryx": "/logos/partners/alteryx.png",
  "Tableau": "/logos/partners/tableau.png",
  "DataRobot": "/logos/partners/Datarobot_logo.png",
  "Snowflake": "/logos/partners/snowflake.png",
  "Apparo": "/logos/partners/apparo.png",
  "Theobald Software": "/logos/partners/theobald.png",
};

function PartnerLogo({ partner }: { partner: SanityPartner }) {
  const src = partner.logo
    ? urlFor(partner.logo).width(256).height(96).url()
    : localLogos[partner.name];

  if (src) {
    return (
      <div className="w-32 h-16 flex items-center">
        <Image
          src={src}
          alt={partner.name}
          width={128}
          height={48}
          className="max-h-12 w-auto object-contain"
        />
      </div>
    );
  }
  return (
    <div className="w-32 h-16 flex items-center">
      <span className="text-xl font-extrabold text-brand-dark">{partner.name}</span>
    </div>
  );
}

export default async function PartnersPage() {
  const partners = await getAllPartners();

  return (
    <>
      {/* Hero */}
      <section className="site-overview-hero relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/images/editorial/hero-advisory.png"
            alt="Partners Background" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F19]/40 via-[#0B0F19]/80 to-[#0B0F19]"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-medium text-[#38bdf8] uppercase tracking-widest mb-4">
            Technology Partners
          </p>
          <h1 className="site-page-title mb-6 text-white">
            Building on the World&apos;s{" "}
            <span style={{ background: "linear-gradient(90deg, #1A6FA8, #38bdf8, #0C9472)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Best Technology
            </span>
          </h1>
          <p className="site-page-lead mx-auto max-w-2xl text-gray-300">
            Ereteam is a certified partner of the industry&apos;s leading technology vendors.
          </p>
        </div>
      </section>

      {/* Partners Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {partners.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">No partners listed yet.</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {partners.map((partner) => (
              <div
                key={partner._id}
                className="bg-white rounded-2xl shadow-md border border-gray-200 hover:border-brand-primary hover:shadow-lg transition-all p-8"
              >
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex-shrink-0 flex items-start">
                    <PartnerLogo partner={partner} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-extrabold text-brand-dark mb-2">
                      {partner.name}
                    </h2>
                    <p className="text-sm text-text-body leading-relaxed mb-4">
                      {partner.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(partner.areas || []).map((area) => (
                        <span
                          key={area}
                          className="text-xs px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full font-medium"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#07111F]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A6FA8]/10 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Interested in partnering with Ereteam?
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            We work with technology vendors and consulting firms to deliver better
            outcomes for our shared clients.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#1A6FA8] to-[#38bdf8] text-white font-bold rounded-lg hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:-translate-y-1 transition-all"
          >
            Get in Touch →
          </Link>
        </div>
      </section>
    </>
  );
}
