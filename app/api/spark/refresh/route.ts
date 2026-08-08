import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/presales/session";
import { getSparkData, refreshSparkData } from "@/lib/spark/cache";

export const dynamic = "force-dynamic";

const SPARK_SESSION_COOKIE = "spark_session";
const REFRESH_COOLDOWN_MS = 10 * 60 * 1000;

let refreshInFlight: Promise<
  Awaited<ReturnType<typeof refreshSparkData>>
> | null = null;

export async function POST(request: NextRequest) {
  const session = request.cookies.get(SPARK_SESSION_COOKIE)?.value;
  if (!(await verifySessionToken(session))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const current = await getSparkData();
  const age = Date.now() - new Date(current.data.generatedAt).getTime();
  if (Number.isFinite(age) && age >= 0 && age < REFRESH_COOLDOWN_MS) {
    return NextResponse.json({
      ok: true,
      refreshed: false,
      generatedAt: current.data.generatedAt,
      message: "Rapor zaten güncel.",
    });
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
