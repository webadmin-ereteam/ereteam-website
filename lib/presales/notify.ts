import nodemailer from "nodemailer";

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Gmail SMTP via a Workspace mailbox + app password — no domain verification
// needed (unlike Resend's sandbox mode), since we're sending as a real mailbox
// Google already trusts. One transport instance is reused across calls.
let transport: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransport() {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.trim();
  if (!user || !pass) return null;

  if (!transport) {
    transport = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }
  return transport;
}

export async function notifySalesRep(params: {
  salesRepEmail: string;
  salesRepName: string;
  companyName: string;
  contactName: string;
  subject: string;
  actionSummary: string;
  journeyId: string;
}) {
  const mailer = getTransport();
  if (!mailer) {
    console.warn("GMAIL_USER/GMAIL_APP_PASSWORD not set — skipping sales rep notification.");
    return;
  }

  const journeyLink = `${APP_BASE_URL}/presales/admin/journeys/${params.journeyId}`;

  try {
    await mailer.sendMail({
      from: process.env.GMAIL_USER?.trim(),
      to: params.salesRepEmail,
      subject: params.subject,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <h2 style="color:#1A6FA8;margin-bottom:16px;">Presales güncellemesi</h2>
          <p>Merhaba ${params.salesRepName},</p>
          <p>${params.actionSummary}</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr><td style="padding:8px 0;color:#666;width:100px;">Şirket</td><td style="padding:8px 0;font-weight:600;">${params.companyName}</td></tr>
            <tr><td style="padding:8px 0;color:#666;">Kişi</td><td style="padding:8px 0;">${params.contactName}</td></tr>
          </table>
          <a href="${journeyLink}" style="display:inline-block;padding:10px 16px;background:#1A6FA8;color:white;text-decoration:none;border-radius:6px;">
            Journey'i Görüntüle
          </a>
        </div>
      `,
    });
  } catch (err) {
    // Notification failures must never break the customer's actual submission.
    console.error("Sales rep notification failed:", err);
  }
}
