import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/presales/session";
import { refreshSparkData } from "@/lib/spark/cache";

export const dynamic = "force-dynamic";

const SPARK_SESSION_COOKIE = "spark_session";
let refreshInFlight: Promise<
  Awaited<ReturnType<typeof refreshSparkData>>
> | null = null;

export async function POST(request: NextRequest) {
  const session = request.cookies.get(SPARK_SESSION_COOKIE)?.value;
  if (!(await verifySessionToken(session, "spark"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    refreshInFlight ??= refreshSparkData().finally(() => {
      refreshInFlight = null;
    });
    const result = await refreshInFlight;
    return NextResponse.json({
      ok: true,
      refreshed: true,
      generatedAt: result.data.generatedAt,
      sources: result.sourceState,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Refresh failed" },
      { status: 503 },
    );
  }
}
