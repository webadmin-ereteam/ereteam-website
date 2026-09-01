import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionToken } from "@/lib/presales/session";

export const dynamic = "force-dynamic";

export default async function AmplemarketSyncPage() {
  if (!(await verifySessionToken(cookies().get("spark_session")?.value))) {
    redirect("/spark/login");
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Amplemarket Analytics aktarımı</h1>
      <p className="mt-2 text-sm text-slate-600">
        MCP Analytics günlük owner, Bulk ve Duo satırlarını JSON olarak girin.
        Aynı tarih yeniden gönderildiğinde önceki Analytics uzlaştırması yenilenir.
      </p>
      <form action="/api/spark/amplemarket/backfill" method="post" className="mt-6 space-y-4">
        <textarea
          name="rows"
          required
          spellCheck={false}
          className="min-h-[480px] w-full rounded-xl border border-slate-300 p-4 font-mono text-sm"
          placeholder='[{"date":"2026-09-01","owner":"name@ereteam.com","kind":"duo","sent":10,"replies":0,"positive":0}]'
        />
        <button type="submit" className="rounded-lg bg-slate-900 px-5 py-3 font-medium text-white">
          Analytics verisini aktar
        </button>
      </form>
    </main>
  );
}
