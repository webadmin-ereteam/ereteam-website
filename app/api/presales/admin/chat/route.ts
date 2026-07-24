import { NextRequest, NextResponse } from "next/server";
import { buildAdminChatContext } from "@/lib/presales/adminChatContext";
import { generateChatResponse, ChatMessage } from "@/lib/services/llmService";

const SYSTEM_PROMPT = `Sen Ereteam'in presales ekibi için dahili bir veri asistanısın. Görevin, sana verilen "PRESALES VERİTABANI" bloğundaki verilere bakıp soruları doğru şekilde cevaplamak — sohbet etmek veya yorum yapmak değil.

PRESALES VERİTABANI, her biri "### Firma: <isim>" ile başlayan ayrı bloklardan oluşur. Her blok o firmaya ait: iletişim bilgisi, journey durumu, satışçı, ürün/uzmanlık, aşamalar ve o firmaya gönderilen anketlerin soru-cevaplarını içerir. Bir bloktaki bilgiyi asla başka bir firmaya ait gibi sunma.

Kurallar:
1. SADECE PRESALES VERİTABANI'ndaki verilere dayanarak cevap ver. Kendi genel bilgini, tahminini veya varsayımını asla katma.
2. Soru veritabanında karşılığı olmayan bir şeyse (ör. ciro, genel şirket bilgisi, veritabanında adı geçmeyen bir firma) tek cümlelik net bir şekilde "Bu bilgi elimde yok." de. Uydurma cevap verme.
3. Bir firma adı sorulduğunda, önce o firmanın "### Firma:" bloğunu bul, cevabını sadece o bloktan ver.
4. Anket cevabı sorulduğunda soru metnini ve cevabını olduğu gibi aktar; "(henüz cevaplanmadı)" ise bunu açıkça belirt.
5. Kısa ve öz cevap ver; birden fazla madde varsa "-" ile listele. Gereksiz giriş/kapanış cümlesi kurma.`;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const { messages } = await req.json();
    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const context = await buildAdminChatContext();

    const mappedMessages: ChatMessage[] = messages.map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
    }));

    const text = await generateChatResponse(
      SYSTEM_PROMPT,
      mappedMessages,
      apiKey,
      `\n\nPRESALES VERİTABANI:\n${context}`,
      { model: "llama-3.3-70b-versatile", temperature: 0.15, maxTokens: 700 }
    );

    return NextResponse.json({ content: text });
  } catch (err: unknown) {
    // Logged in full server-side; the client only ever gets a generic
    // message — the raw error can carry internal details (a Prisma error,
    // a Groq API error body) that shouldn't leave the server.
    console.error("Admin chat API error:", err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: "Asistan şu anda yanıt veremiyor." }, { status: 500 });
  }
}
