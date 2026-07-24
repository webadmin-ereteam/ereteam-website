import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminNav from "./AdminNav";
import AdminChatWidget from "./AdminChatWidget";
import { SESSION_COOKIE_NAME, getSessionPayload } from "@/lib/presales/session";
import { getCurrentSessionEpoch } from "@/lib/presales/auth";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function PresalesAdminLayout({ children }: { children: React.ReactNode }) {
  // middleware.ts already confirmed the cookie's signature + expiry are
  // valid (Edge Runtime, no DB access) before this layout ever renders —
  // this is the second, epoch-aware check: does the DB's current
  // sessionEpoch (bumped by a password change or "Tüm Cihazlardan Çıkış
  // Yap") postdate the moment this specific token was issued? A stateless
  // token has no other way to be revoked before its own 7-day expiry.
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  const payload = await getSessionPayload(token);
  const currentEpoch = await getCurrentSessionEpoch();

  if (!payload || (currentEpoch > 0 && payload.epoch < currentEpoch)) {
    // Can't cookies().delete() from a Server Component render (only a
    // Server Action/Route Handler can) — the stale cookie is left in place,
    // but it's inert: it will keep failing this same check on every request
    // until a fresh login overwrites it with a current one.
    redirect("/presales/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-text-body">
      <AdminNav />
      <main className="flex-1 px-10 py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
      <AdminChatWidget />
    </div>
  );
}
