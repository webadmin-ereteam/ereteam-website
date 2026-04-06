"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, CheckCircle, Loader2 } from "lucide-react";
import { z } from "zod";

const contactSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  company: z.string().min(1, "Company name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  country: z.string().min(1, "Please select your country"),
  areaOfInterest: z.string().min(1, "Please select an area of interest"),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;
type FormErrors = Partial<Record<keyof ContactFormData, string>>;

const initialForm: ContactFormData = {
  fullName: "",
  company: "",
  email: "",
  phone: "",
  country: "",
  areaOfInterest: "",
  message: "",
};

const countries = [
  "United States",
  "Türkiye",
  "United Kingdom",
  "Germany",
  "France",
  "Netherlands",
  "UAE",
  "Saudi Arabia",
  "Other",
];

const areasOfInterest = [
  "Data, Cloud & AI",
  "Financial Performance & Intelligence",
  "Marketing Intelligence",
  "Obserian (Data Governance)",
  "Pharmeta (Pharma Analytics)",
  "Maturytics (Data Maturity)",
  "Partnership / Reseller",
  "Careers / Employment",
  "Other",
];


export default function ContactPage() {
  const [form, setForm] = useState<ContactFormData>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name as keyof ContactFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof ContactFormData;
        if (!fieldErrors[field]) {
          fieldErrors[field] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("https://formspree.io/f/mykbnejw", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: form.fullName,
          company: form.company,
          email: form.email,
          phone: form.phone,
          country: form.country,
          area_of_interest: form.areaOfInterest,
          message: form.message,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setErrors({ message: "Something went wrong. Please try again or email us directly." });
      }
    } catch {
      setErrors({ message: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (field: keyof ContactFormData) =>
    `w-full px-4 py-2.5 rounded-lg border text-sm text-brand-dark bg-brand-light focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors ${
      errors[field]
        ? "border-red-400"
        : "border-gray-300 hover:border-gray-400"
    }`;

  return (
    <>
      {/* Hero */}
      <section
        className="pt-32 pb-16"
        style={{ background: "linear-gradient(135deg, #1A1A2E 0%, #0D3A5C 100%)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-medium text-brand-primary uppercase tracking-widest mb-3">
            Contact Us
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6">
            Let&apos;s{" "}
            <span className="text-brand-primary">Talk Data</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Whether you have a project in mind, want to explore our products, or
            just want to benchmark your data maturity — our team is ready to help.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="py-16 bg-brand-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl p-5 sm:p-8 border border-gray-200 shadow-sm">
                {submitted ? (
                  <div className="flex flex-col items-center justify-center text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-5">
                      <CheckCircle size={32} className="text-green-600" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-brand-dark mb-3">
                      Message Received!
                    </h2>
                    <p className="text-text-muted max-w-sm">
                      Thank you for reaching out. One of our experts will be in touch
                      within one business day.
                    </p>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-extrabold text-brand-dark mb-6">
                      Send us a message
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Full Name */}
                        <div>
                          <label htmlFor="fullName" className="block text-sm font-medium text-brand-dark mb-1.5">
                            Full Name <span className="text-brand-magenta">*</span>
                          </label>
                          <input
                            id="fullName"
                            name="fullName"
                            type="text"
                            placeholder="Jane Smith"
                            value={form.fullName}
                            onChange={handleChange}
                            className={inputClass("fullName")}
                          />
                          {errors.fullName && (
                            <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
                          )}
                        </div>

                        {/* Company */}
                        <div>
                          <label htmlFor="company" className="block text-sm font-medium text-brand-dark mb-1.5">
                            Company <span className="text-brand-magenta">*</span>
                          </label>
                          <input
                            id="company"
                            name="company"
                            type="text"
                            placeholder="Acme Corp"
                            value={form.company}
                            onChange={handleChange}
                            className={inputClass("company")}
                          />
                          {errors.company && (
                            <p className="mt-1 text-xs text-red-600">{errors.company}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Email */}
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-brand-dark mb-1.5">
                            Email Address <span className="text-brand-magenta">*</span>
                          </label>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="jane@company.com"
                            value={form.email}
                            onChange={handleChange}
                            className={inputClass("email")}
                          />
                          {errors.email && (
                            <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                          )}
                        </div>

                        {/* Phone */}
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-brand-dark mb-1.5">
                            Phone
                          </label>
                          <input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            value={form.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 hover:border-gray-400 text-sm text-brand-dark bg-brand-light focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Country */}
                        <div>
                          <label htmlFor="country" className="block text-sm font-medium text-brand-dark mb-1.5">
                            Country <span className="text-brand-magenta">*</span>
                          </label>
                          <select
                            id="country"
                            name="country"
                            value={form.country}
                            onChange={handleChange}
                            className={inputClass("country")}
                          >
                            <option value="">Select country...</option>
                            {countries.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                          {errors.country && (
                            <p className="mt-1 text-xs text-red-600">{errors.country}</p>
                          )}
                        </div>

                        {/* Area of Interest */}
                        <div>
                          <label htmlFor="areaOfInterest" className="block text-sm font-medium text-brand-dark mb-1.5">
                            Area of Interest <span className="text-brand-magenta">*</span>
                          </label>
                          <select
                            id="areaOfInterest"
                            name="areaOfInterest"
                            value={form.areaOfInterest}
                            onChange={handleChange}
                            className={inputClass("areaOfInterest")}
                          >
                            <option value="">Select topic...</option>
                            {areasOfInterest.map((a) => (
                              <option key={a} value={a}>{a}</option>
                            ))}
                          </select>
                          {errors.areaOfInterest && (
                            <p className="mt-1 text-xs text-red-600">{errors.areaOfInterest}</p>
                          )}
                        </div>
                      </div>

                      {/* Message */}
                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-brand-dark mb-1.5">
                          Message <span className="text-brand-magenta">*</span>
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          rows={5}
                          placeholder="Tell us about your project, challenge, or question..."
                          value={form.message}
                          onChange={handleChange}
                          className={`${inputClass("message")} resize-none`}
                        />
                        {errors.message && (
                          <p className="mt-1 text-xs text-red-600">{errors.message}</p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-primary text-white font-semibold rounded-lg hover:bg-opacity-90 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Sending...
                          </>
                        ) : (
                          "Send Message"
                        )}
                      </button>

                      <p className="text-xs text-text-muted text-center">
                        We respond to all inquiries within 1 business day.
                      </p>
                      <p className="text-xs text-text-muted text-center leading-relaxed">
                        By submitting this form, you consent to Ereteam contacting you regarding your inquiry in accordance with our{" "}
                        <Link href="/privacy-policy" className="text-brand-primary hover:underline">
                          Privacy Policy
                        </Link>.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>

            {/* Contact details */}
            <div className="lg:col-span-2 space-y-6">
              {/* General email */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <p className="text-xs font-semibold text-brand-magenta uppercase tracking-widest mb-2">General Inquiries</p>
                <h3 className="font-bold text-brand-dark mb-3">Email Us</h3>
                <a href="mailto:info@ereteam.com" className="flex items-center gap-2 text-sm text-text-body hover:text-brand-primary transition-colors">
                  <Mail size={16} className="text-brand-primary flex-shrink-0" />
                  info@ereteam.com
                </a>
              </div>

              {/* US HQ */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <p className="text-xs font-semibold text-brand-magenta uppercase tracking-widest mb-2">US Headquarters</p>
                <h3 className="font-bold text-brand-dark mb-3">Ereteam Analytics USA HQ</h3>
                <p className="text-sm text-text-muted leading-relaxed mb-3">
                  39 Woodbrook Circle<br />Westfield, NJ 07090<br />New Jersey, USA
                </p>
                <a href="tel:+19733493440" className="flex items-center gap-2 text-sm text-text-body hover:text-brand-primary transition-colors">
                  <Phone size={14} className="text-brand-primary flex-shrink-0" />
                  +1 (973) 349 3440
                </a>
              </div>

              {/* Turkey Operations */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <p className="text-xs font-semibold text-brand-magenta uppercase tracking-widest mb-2">Operations Center</p>
                <h3 className="font-bold text-brand-dark mb-3">Ereteam Operations Center</h3>
                <p className="text-sm text-text-muted leading-relaxed mb-3">
                  Mehmet Akif Mah. Tavukçuyolu Cad.<br />No:150 K:2 D:3<br />Ümraniye / İstanbul, Türkiye
                </p>
                <a href="tel:+902165184440" className="flex items-center gap-2 text-sm text-text-body hover:text-brand-primary transition-colors">
                  <Phone size={14} className="text-brand-primary flex-shrink-0" />
                  +90 216 518 44 40
                </a>
              </div>


              {/* Response time */}
              <div className="bg-brand-primary/5 rounded-2xl p-6 border border-brand-primary/20">
                <p className="text-sm font-semibold text-brand-dark mb-1">
                  Quick response guaranteed
                </p>
                <p className="text-sm text-text-muted">
                  We respond to all inquiries within 1 business day.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
