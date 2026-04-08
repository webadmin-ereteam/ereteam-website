import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { CHAT_CACHE_TAG } from "@/lib/getChatContext";

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  revalidateTag(CHAT_CACHE_TAG);
  console.log("✅ Chat context cache revalidated via webhook");

  return NextResponse.json({ revalidated: true });
}
