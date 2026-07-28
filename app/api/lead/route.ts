import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { escapeHtml, stripNewlines } from "@/lib/presales/escapeHtml";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

const leadSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  company: z.string().trim().max(160).optional().default(""),
  message: z.string().trim().max(4_000).optional().default(""),
  page: z.string().trim().max(200).optional().default(""),
});

export async function POST(req: NextRequest) {
  try {
    const limit = rateLimit(`lead:${getClientIp(req)}`, 5, 60 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
      );
    }

    const payload = leadSchema.safeParse(await req.json());
    if (!payload.success) return NextResponse.json({ error: "Invalid lead details" }, { status: 400 });

    const { name, email, company, message, page } = payload.data;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    console.log("📩 New lead:", { name, email, company, page });

    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const resend = new Resend(apiKey);
      const safeName = escapeHtml(name);
      const safeEmail = escapeHtml(email);
      const safeCompany = escapeHtml(company);
      const safeMessage = escapeHtml(message);
      const safePage = escapeHtml(page);
      const result = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: "webadmin@ereteam.com",
        subject: `New AI Chat Lead: ${stripNewlines(name)}${company ? ` — ${stripNewlines(company)}` : ""}`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
            <h2 style="color:#1A6FA8;margin-bottom:16px;">New lead from website chat</h2>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#666;width:100px;">Name</td><td style="padding:8px 0;font-weight:600;">${safeName}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Email</td><td style="padding:8px 0;font-weight:600;"><a href="mailto:${safeEmail}">${safeEmail}</a></td></tr>
              <tr><td style="padding:8px 0;color:#666;">Company</td><td style="padding:8px 0;">${safeCompany || "—"}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Message</td><td style="padding:8px 0;">${safeMessage || "—"}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Page</td><td style="padding:8px 0;">${safePage || "—"}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Time</td><td style="padding:8px 0;">${new Date().toLocaleString("en-GB", { timeZone: "Europe/Istanbul" })}</td></tr>
            </table>
          </div>
        `,
      });
      console.log("📧 Resend result:", JSON.stringify(result));
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Lead API error:", err);
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
  }
}
