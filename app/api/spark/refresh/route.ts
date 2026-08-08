import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/presales/session";
import { getSparkData } from "@/lib/spark/cache";
import { collectSparkData } from "@/lib/spark/collector";

export const dynamic = "force-dynamic";

const SPARK_SESSION_COOKIE = "spark_session";
const REFRESH_COOLDOWN_MS = 10 * 60 * 1000;

let refreshInFlight: Promise<
  Awaited<ReturnType<typeof collectSparkData>>
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
    refreshInFlight ??= collectSparkData().finally(() => {
      refreshInFlight = null;
    });
    const result = await refreshInFlight;
    revalidateTag("spark-current-dashboard");
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
