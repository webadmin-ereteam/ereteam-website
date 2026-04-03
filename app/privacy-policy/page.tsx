import { Metadata } from "next";
import Link from "next/link";
import { FileText, Download } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy – Ereteam",
  description: "Ereteam's privacy policy and personal data protection documents.",
};

const trDocuments = [
  {
    title: "Kişisel Verilerin Korunması ve İşlenmesi Politikası",
    subtitle: "Personal Data Protection and Processing Policy",
    file: "/docs/kisisel_verilerin_korunmasi_ve_islenmesi_politikasi.pdf",
  },
  {
    title: "Kişisel Veri Saklama ve İmha Politikası",
    subtitle: "Personal Data Retention and Disposal Policy",
    file: "/docs/kisisel_veri_saklama_ve_imha_politikasi.pdf",
  },
  {
    title: "Çalışan Aydınlatma Metni",
    subtitle: "Employee Disclosure Text (KVKK)",
    file: "/docs/calisan_aydinlatma_metni.pdf",
  },
  {
    title: "Çalışan Adayı Aydınlatma Metni",
    subtitle: "Job Applicant Disclosure Text (KVKK)",
    file: "/docs/calisan_adayi_aydinlatma_metni.pdf",
  },
  {
    title: "Veri Sahibi Talep Formu",
    subtitle: "Data Subject Request Form",
    file: "/docs/veri_sahibi_talep_formu.pdf",
  },
];

const usDocuments = [
  {
    title: "Privacy Policy",
    subtitle: "Ereteam USA Privacy Policy",
    file: "/docs/us_privacy_policy.pdf",
  },
  {
    title: "Cookies Policy",
    subtitle: "Ereteam USA Cookies Policy",
    file: "/docs/us_cookies_policy.pdf",
  },
  {
    title: "Terms & Conditions",
    subtitle: "Ereteam USA Terms and Conditions",
    file: "/docs/us_terms_conditions.pdf",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <section
        className="pt-32 pb-16"
        style={{ background: "linear-gradient(135deg, #1A1A2E 0%, #0D3A5C 100%)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
              ← Home
            </Link>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-300 max-w-2xl">
            Ereteam is committed to protecting your personal data. Below you will find our data protection and privacy documents.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* US Documents */}
          <div className="mb-12">
            <h2 className="text-lg font-extrabold text-brand-dark mb-1">United States</h2>
            <p className="text-sm text-text-muted mb-5">Documents applicable to Ereteam Analytics USA operations.</p>
            <div className="space-y-4">
              {usDocuments.map((doc) => (
                <div
                  key={doc.file}
                  className="flex items-center justify-between gap-6 p-6 bg-brand-light rounded-2xl border border-gray-200 hover:border-brand-primary hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText size={22} className="text-brand-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-brand-dark text-sm">{doc.title}</p>
                      <p className="text-xs text-text-muted mt-0.5">{doc.subtitle}</p>
                    </div>
                  </div>
                  <a
                    href={doc.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-opacity-90 transition-all"
                  >
                    <Download size={14} />
                    Download
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Turkey Documents */}
          <div>
            <h2 className="text-lg font-extrabold text-brand-dark mb-1">Türkiye (KVKK)</h2>
            <p className="text-sm text-text-muted mb-5">Documents applicable to Ereteam operations in Türkiye in accordance with KVKK (Turkish Personal Data Protection Law).</p>
            <div className="space-y-4">
              {trDocuments.map((doc) => (
                <div
                  key={doc.file}
                  className="flex items-center justify-between gap-6 p-6 bg-brand-light rounded-2xl border border-gray-200 hover:border-brand-primary hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText size={22} className="text-brand-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-brand-dark text-sm">{doc.title}</p>
                      <p className="text-xs text-text-muted mt-0.5">{doc.subtitle}</p>
                    </div>
                  </div>
                  <a
                    href={doc.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-opacity-90 transition-all"
                  >
                    <Download size={14} />
                    Download
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 p-6 bg-brand-light rounded-2xl border border-gray-200">
            <p className="text-sm text-text-muted leading-relaxed">
              For any questions or requests regarding your personal data, please contact us at{" "}
              <a href="mailto:info@ereteam.com" className="text-brand-primary font-medium hover:underline">
                info@ereteam.com
              </a>{" "}
              or visit our{" "}
              <Link href="/contact" className="text-brand-primary font-medium hover:underline">
                Contact page
              </Link>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
