import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const API_BASE = "https://api.linkedin.com/rest";
const API_VERSION = "202606";
const HEALTH_KEY = "e402f89-linkedin-check";

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Linkedin-Version": API_VERSION,
    "X-Restli-Protocol-Version": "2.0.0",
    "X-RestLi-Method": "FINDER",
  };
}

export async function GET(request: NextRequest) {
  if (request.headers.get("x-linkedin-health") !== HEALTH_KEY) {
    return new NextResponse(null, { status: 404 });
  }

  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  if (!token) return NextResponse.json({ configured: false });

  const organizationResponse = await fetch(
    `${API_BASE}/organizations?q=vanityName&vanityName=ereteam`,
    { headers: headers(token), cache: "no-store" }
  );
  const organizationBody = await organizationResponse.json().catch(() => null) as {
    elements?: Array<{ id?: number | string }>;
    message?: string;
    status?: number;
  } | null;

  const organizationId = organizationBody?.elements?.[0]?.id;
  if (!organizationResponse.ok || !organizationId) {
    return NextResponse.json({
      configured: true,
      step: "organization",
      status: organizationResponse.status,
      apiStatus: organizationBody?.status,
      message: organizationBody?.message,
    });
  }

  const params = new URLSearchParams({
    author: `urn:li:organization:${organizationId}`,
    q: "author",
    count: "1",
    sortBy: "LAST_MODIFIED",
  });
  const postsResponse = await fetch(`${API_BASE}/posts?${params.toString()}`, {
    headers: headers(token),
    cache: "no-store",
  });
  const postsBody = await postsResponse.json().catch(() => null) as {
    elements?: unknown[];
    message?: string;
    status?: number;
  } | null;

  return NextResponse.json({
    configured: true,
    step: "posts",
    status: postsResponse.status,
    apiStatus: postsBody?.status,
    message: postsBody?.message,
    count: postsBody?.elements?.length,
  });
}
