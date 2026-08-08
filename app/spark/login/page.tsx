import Image from "next/image";
import { loginSpark } from "@/lib/spark/sessionActions";

export const metadata = { title: "Spark Giriş | Ereteam", robots: { index: false, follow: false } };

export default function SparkLogin({ searchParams }: { searchParams: { error?: string; retry?: string } }) {
  return (
    <main className="min-h-screen bg-[#081523] px-5 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_20%_10%,#188ac744,transparent_35%),radial-gradient(circle_at_90%_80%,#d22e8b33,transparent_35%)]" />
      <form action={loginSpark} className="relative w-full max-w-sm rounded-[28px] border border-white/15 bg-white/[.97] p-8 shadow-2xl">
        <Image src="/logos/ereteam-logo.png" alt="Ereteam" width={180} height={70} className="mb-7 h-14 w-auto object-contain" priority />
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#347da5]">Revenue &amp; Growth</p>
        <h1 className="mt-2 text-3xl font-bold text-[#102238]">Spark</h1>
        <p className="mt-2 text-sm text-slate-500">Güncel raporu görüntülemek için giriş yapın.</p>
        <label className="mt-7 block text-sm font-semibold text-slate-700">Şifre</label>
        <input name="password" type="password" autoFocus required autoComplete="current-password" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#347da5] focus:ring-4 focus:ring-[#347da5]/10" />
        {searchParams.error === "locked" ? <p className="mt-4 text-sm text-red-600">Çok fazla deneme yapıldı. {searchParams.retry ?? "Birkaç"} dakika sonra tekrar deneyin.</p> : searchParams.error ? <p className="mt-4 text-sm text-red-600">Şifre hatalı.</p> : null}
        <button className="mt-6 w-full rounded-xl bg-[#102238] px-4 py-3 font-semibold text-white transition hover:bg-[#347da5]">Raporu aç</button>
      </form>
    </main>
  );
}
