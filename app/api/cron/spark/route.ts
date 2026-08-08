import { NextRequest, NextResponse } from "next/server";
import { refreshSparkData } from "@/lib/spark/cache";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET || process.env.SPARK_CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await refreshSparkData();
    return NextResponse.json({ ok: true, generatedAt: result.data.generatedAt, sources: result.sourceState });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Refresh failed" }, { status: 503 });
  }
}
