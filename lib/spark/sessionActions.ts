"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { checkLoginLock, recordLoginResult } from "@/lib/presales/loginRateLimit";
import { verifyPassword } from "@/lib/presales/passwordHash";
import { createSessionToken, SESSION_MAX_AGE_SECONDS } from "@/lib/presales/session";

const SPARK_SESSION_COOKIE = "spark_session";

export async function loginSpark(formData: FormData) {
  const password = String(formData.get("password") ?? "").trim();
  const lock = await checkLoginLock();
  if (lock.locked) redirect(`/spark/login?error=locked&retry=${lock.retryAfterMinutes}`);

  const storedPassword = process.env.SPARK_PASSWORD?.trim();
  const ok = Boolean(storedPassword) && await verifyPassword(password, storedPassword!);
  await recordLoginResult(ok);
  if (!ok) redirect("/spark/login?error=1");

  const token = await createSessionToken(0);
  cookies().set(SPARK_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
  redirect("/spark");
}
