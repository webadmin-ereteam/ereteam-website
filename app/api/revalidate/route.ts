import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { CHAT_CACHE_TAG } from "@/lib/getChatContext";
import { SORO_CACHE_TAG } from "@/lib/soro";

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  revalidateTag(CHAT_CACHE_TAG);
  revalidateTag(SORO_CACHE_TAG);
  console.log("✅ Site content caches revalidated via webhook");

  return NextResponse.json({ revalidated: true });
}
