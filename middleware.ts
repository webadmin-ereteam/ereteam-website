import { NextRequest, NextResponse } from "next/server";
import { isValidAdminBasicAuth } from "@/lib/presales/auth";

export async function middleware(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (!(await isValidAdminBasicAuth(authHeader))) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Presales Admin"' },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/presales/admin/:path*", "/api/presales/admin/:path*"],
};
