import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    const { name, email, company, message, page } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    console.log("📩 New lead:", { name, email, company, page });

    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const resend = new Resend(apiKey);
      const result = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: "webadmin@ereteam.com",
        subject: `New AI Chat Lead: ${name}${company ? ` — ${company}` : ""}`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
            <h2 style="color:#1A6FA8;margin-bottom:16px;">New lead from website chat</h2>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#666;width:100px;">Name</td><td style="padding:8px 0;font-weight:600;">${name}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Email</td><td style="padding:8px 0;font-weight:600;"><a href="mailto:${email}">${email}</a></td></tr>
              <tr><td style="padding:8px 0;color:#666;">Company</td><td style="padding:8px 0;">${company || "—"}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Message</td><td style="padding:8px 0;">${message || "—"}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Page</td><td style="padding:8px 0;">${page || "—"}</td></tr>
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
