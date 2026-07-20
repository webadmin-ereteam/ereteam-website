import nodemailer from "nodemailer";
import { escapeHtml, stripNewlines } from "./escapeHtml";

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
      subject: stripNewlines(params.subject),
      // actionSummary is pre-built HTML (its own dynamic pieces are already
      // escaped where it's constructed) — everything else here is raw
      // admin-entered text, escaped on the way in.
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <h2 style="color:#1A6FA8;margin-bottom:16px;">Presales güncellemesi</h2>
          <p>Merhaba ${escapeHtml(params.salesRepName)},</p>
          <p>${params.actionSummary}</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr><td style="padding:8px 0;color:#666;width:100px;">Şirket</td><td style="padding:8px 0;font-weight:600;">${escapeHtml(params.companyName)}</td></tr>
            <tr><td style="padding:8px 0;color:#666;">Kişi</td><td style="padding:8px 0;">${escapeHtml(params.contactName)}</td></tr>
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

// Technical leads never log into the admin tool, so unlike notifySalesRep
// there's no "view journey" link here — instead the completed survey's
// answers are attached directly as an Excel file, the same buffer/filename
// already built for the Drive archive in j/[token]/actions.ts.
export async function notifyTechnicalLead(params: {
  technicalLeadEmail: string;
  technicalLeadName: string;
  companyName: string;
  contactName: string;
  surveyTitle: string;
  attachment: { fileName: string; buffer: ArrayBuffer };
}) {
  const mailer = getTransport();
  if (!mailer) {
    console.warn("GMAIL_USER/GMAIL_APP_PASSWORD not set — skipping technical lead notification.");
    return;
  }

  try {
    await mailer.sendMail({
      from: process.env.GMAIL_USER?.trim(),
      to: params.technicalLeadEmail,
      subject: stripNewlines(`${params.companyName} anketi tamamladı: ${params.surveyTitle}`),
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <h2 style="color:#1A6FA8;margin-bottom:16px;">Presales anketi tamamlandı</h2>
          <p>Merhaba ${escapeHtml(params.technicalLeadName)},</p>
          <p><strong>${escapeHtml(params.companyName)}</strong>, "${escapeHtml(params.surveyTitle)}" anketini tamamladı. Cevapları ekteki Excel dosyasında bulabilirsin.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr><td style="padding:8px 0;color:#666;width:100px;">Şirket</td><td style="padding:8px 0;font-weight:600;">${escapeHtml(params.companyName)}</td></tr>
            <tr><td style="padding:8px 0;color:#666;">Kişi</td><td style="padding:8px 0;">${escapeHtml(params.contactName)}</td></tr>
          </table>
        </div>
      `,
      attachments: [
        {
          filename: params.attachment.fileName,
          content: Buffer.from(params.attachment.buffer),
          contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      ],
    });
  } catch (err) {
    // Notification failures must never break the customer's actual submission.
    console.error("Technical lead notification failed:", err);
  }
}
