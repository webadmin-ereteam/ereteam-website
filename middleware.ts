import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/presales/session";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (await verifySessionToken(token)) {
    return NextResponse.next();
  }

  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/presales/login", req.url);
  loginUrl.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/presales/admin/:path*", "/api/presales/admin/:path*"],
};
