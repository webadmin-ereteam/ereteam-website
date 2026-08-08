import { getSparkData } from "@/lib/spark/cache";
import Dashboard from "./Dashboard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Spark | Ereteam", robots: { index: false, follow: false } };

export default async function SparkPage() {
  try {
    const { data, sourceState } = await getSparkData();
    return <Dashboard data={data} sources={sourceState} />;
  } catch (error) {
    return <main className="min-h-screen bg-slate-950 px-5 text-white flex items-center justify-center"><div className="max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8"><p className="text-xs font-bold uppercase tracking-[.2em] text-sky-300">Spark</p><h1 className="mt-3 text-3xl font-bold">Veri bağlantısı bekleniyor</h1><p className="mt-4 text-slate-300">Güncel rapor şu anda oluşturulamadı. Sunucu bağlantıları tamamlandığında sayfa otomatik olarak canlı veriyi gösterecek.</p><p className="mt-5 text-xs text-slate-500">{error instanceof Error ? error.message : "Bilinmeyen veri hatası"}</p></div></main>;
  }
}
