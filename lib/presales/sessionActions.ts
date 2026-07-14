"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminPassword } from "./auth";
import { checkLoginLock, recordLoginResult } from "./loginRateLimit";
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "./session";

export async function loginAdmin(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  const next = String(formData.get("next") ?? "").trim() || "/presales/admin";

  const lock = await checkLoginLock();
  if (lock.locked) {
    redirect(
      `/presales/login?error=locked&retry=${lock.retryAfterMinutes}&next=${encodeURIComponent(next)}`
    );
  }

  const ok = await verifyAdminPassword(username, password);
  await recordLoginResult(ok);

  if (!ok) {
    redirect(`/presales/login?error=1&next=${encodeURIComponent(next)}`);
  }

  const token = await createSessionToken();
  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });

  redirect(next.startsWith("/presales/admin") ? next : "/presales/admin");
}

export async function logoutAdmin() {
  cookies().delete(SESSION_COOKIE_NAME);
  redirect("/presales/login");
}
