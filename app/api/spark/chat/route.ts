import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifySessionToken } from "@/lib/presales/session";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { executeSparkChatQuery, sparkChatFilterSchema, SparkChatStageError } from "@/lib/spark/chat";

export const dynamic = "force-dynamic";

const queryContextSchema = z.object({
  object: z.enum(["deals", "invoices", "orders"]),
  filters: z.array(sparkChatFilterSchema).max(10),
  associatedDealFilters: z.array(sparkChatFilterSchema).max(8),
  aggregate: z.object({ operation: z.enum(["sum", "count", "average"]), property: z.string().max(120).nullish() }).nullish(),
  groupBy: z.string().max(120).nullish(),
  metricKind: z.enum(["guaranteed_revenue", "expected_revenue", "weighted_pipeline"]).optional(),
});
const contextResultSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("metric"), title: z.string().max(100), value: z.string().max(100), recordCount: z.number().int().nonnegative() }),
  z.object({ kind: z.literal("breakdown"), title: z.string().max(100), value: z.string().max(500), recordCount: z.number().int().nonnegative() }),
  z.object({ kind: z.literal("records"), title: z.string().max(100), recordCount: z.number().int().nonnegative(), objectLabel: z.string().max(30) }),
  z.object({ kind: z.literal("text"), title: z.string().max(100), value: z.string().max(800), recordCount: z.literal(0) }),
]).and(z.object({ queryContext: queryContextSchema.optional() }));
const schema = z.object({
  question: z.string().trim().min(1).max(1_500),
  context: z.array(z.object({ question: z.string().max(1_500), result: contextResultSchema })).max(5).default([]),
});

export async function POST(request: NextRequest) {
  const session = request.cookies.get("spark_session")?.value;
  if (!(await verifySessionToken(session))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const limit = rateLimit(`spark-chat:${getClientIp(request)}`, 15, 10 * 60 * 1000);
  if (!limit.allowed) return NextResponse.json({ error: "Çok fazla sorgu gönderildi. Birkaç dakika sonra tekrar deneyin." }, { status: 429 });

  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Geçersiz sorgu." }, { status: 400 });
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Sorgu planlayıcısı yapılandırılmamış." }, { status: 503 });
    return NextResponse.json(await executeSparkChatQuery(parsed.data.question, apiKey, parsed.data.context));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Spark chat error:", message);
    const aiRateLimited = error instanceof SparkChatStageError
      && error.stage === "planner"
      && /rate.?limit|too many requests|429/i.test(message);
    const retryAfterSeconds = error instanceof SparkChatStageError && error.retryAfterSeconds
      ? Math.max(1, Math.ceil(error.retryAfterSeconds))
      : null;
    const publicError = aiRateLimited
      ? `AI sorgu limiti şu anda dolu. ${retryAfterSeconds ? `${retryAfterSeconds} saniye` : "Kısa bir süre"} sonra tekrar deneyin; devam ederse soruyu tek dönem ve tek metrik olarak kısaltın.`
      : error instanceof SparkChatStageError && error.stage === "owner"
      ? "Owner adını canlı HubSpot kullanıcılarında güvenle eşleştiremedim. Lütfen ad-soyadı biraz daha açık yazın."
      : error instanceof SparkChatStageError && error.stage === "planner"
      ? "Soruyu anlayamadım. Dönem, kayıt türü veya istediğiniz değeri biraz daha açık yazar mısınız?"
      : error instanceof SparkChatStageError
      ? `Canlı sorgu ${error.stage} aşamasında tamamlanamadı.`
      : error instanceof z.ZodError || error instanceof SyntaxError ? "Canlı sorgu planı oluşturulamadı." : "Asistan şu anda canlı veriyi sorgulayamıyor.";
    return NextResponse.json(
      { error: publicError },
      { status: aiRateLimited ? 429 : 500, headers: retryAfterSeconds ? { "Retry-After": String(retryAfterSeconds) } : undefined },
    );
  }
}
