import { getSparkData, getSparkYears } from "@/lib/spark/cache";
import { istanbulParts } from "@/lib/spark/time";
import Dashboard from "./Dashboard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Spark | Ereteam", robots: { index: false, follow: false } };

export default async function SparkPage({ searchParams }: { searchParams?: { year?: string | string[] } }) {
  try {
    const rawYear = Array.isArray(searchParams?.year) ? searchParams.year[0] : searchParams?.year;
    if (rawYear && !/^20\d{2}$/.test(rawYear)) throw new Error("Geçersiz rapor yılı.");
    const requestedYear = rawYear ? Number(rawYear) : undefined;
    const [current, availableYears] = await Promise.all([getSparkData(), getSparkYears()]);
    const snapshotYear = Number(current.data.reportDate.slice(0, 4));
    const istanbulYear = istanbulParts(new Date()).year;
    const liveYear = availableYears.includes(istanbulYear) ? istanbulYear : snapshotYear;
    const selectedYear = requestedYear ?? liveYear;
    if (!availableYears.includes(selectedYear)) throw new Error(`${selectedYear} yılı için arşivlenmiş Spark raporu bulunamadı.`);
    const snapshot = selectedYear === snapshotYear ? current : await getSparkData(selectedYear);
    const reportMode = selectedYear === liveYear ? "current" : selectedYear > liveYear ? "planning" : "archive";
    return <Dashboard key={selectedYear} data={snapshot.data} availableYears={availableYears} liveYear={liveYear} reportMode={reportMode} sourceState={snapshot.sourceState} />;
  } catch (error) {
    return <main className="min-h-screen bg-slate-950 px-5 text-white flex items-center justify-center"><div className="max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8"><p className="text-xs font-bold uppercase tracking-[.2em] text-sky-300">Spark</p><h1 className="mt-3 text-3xl font-bold">Veri bağlantısı bekleniyor</h1><p className="mt-4 text-slate-300">Güncel rapor şu anda oluşturulamadı. Sunucu bağlantıları tamamlandığında sayfa otomatik olarak canlı veriyi gösterecek.</p><p className="mt-5 text-xs text-slate-500">{error instanceof Error ? error.message : "Bilinmeyen veri hatası"}</p></div></main>;
  }
}
