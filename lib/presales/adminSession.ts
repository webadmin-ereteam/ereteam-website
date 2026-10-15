import "server-only";

import { cookies } from "next/headers";
import { getCurrentSessionEpoch } from "./auth";
import { getSessionPayload, SESSION_COOKIE_NAME } from "./session";

export async function hasCurrentAdminSession(): Promise<boolean> {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const payload = await getSessionPayload(token);
  if (!payload) return false;

  const currentEpoch = await getCurrentSessionEpoch();
  return currentEpoch === 0 || payload.epoch >= currentEpoch;
}

export async function requireCurrentAdminSession(): Promise<void> {
  if (!(await hasCurrentAdminSession())) {
    throw new Error("Unauthorized");
  }
}
