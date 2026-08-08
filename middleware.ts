import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/presales/session";

const SPARK_SESSION_COOKIE = "spark_session";

export async function middleware(req: NextRequest) {
  const isSpark = req.nextUrl.pathname === "/spark" || req.nextUrl.pathname.startsWith("/spark/");
  if (req.nextUrl.pathname === "/spark/login") return NextResponse.next();
  const token = req.cookies.get(isSpark ? SPARK_SESSION_COOKIE : SESSION_COOKIE_NAME)?.value;

  if (await verifySessionToken(token)) {
    return NextResponse.next();
  }

  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL(isSpark ? "/spark/login" : "/presales/login", req.url);
  loginUrl.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/presales/admin/:path*", "/api/presales/admin/:path*", "/spark/:path*"],
};
