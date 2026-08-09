"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Bot, Database, Send, X } from "lucide-react";
import styles from "./sparkChat.module.css";

type Column = { key: string; label: string; format: "currency" | "date" | "text" };
type QueryContext = {
  object: "deals" | "invoices" | "orders";
  filters: Array<{ property: string; operator: string; value?: string | null; values?: string[] | null }>;
  associatedDealFilters: Array<{ property: string; operator: string; value?: string | null; values?: string[] | null }>;
  aggregate?: { operation: "sum" | "count" | "average"; property?: string | null } | null;
};
type QueryResult =
  | { kind: "metric"; title: string; formattedValue: string; recordCount: number; interpretation: string; queryContext: QueryContext; queriedAt: string }
  | { kind: "records"; title: string; objectLabel: string; totalRecords: number; shownRecords: number; columns: Column[]; records: Array<{ id: string; url: string; values: Record<string, string> }>; interpretation: string; queryContext: QueryContext; queriedAt: string };
type HistoryItem = { question: string; result?: QueryResult; error?: string };

function compactContext(history: HistoryItem[]) {
  return history.filter((item) => item.result).slice(-5).map((item) => ({
    question: item.question,
    result: item.result!.kind === "metric"
      ? { kind: "metric" as const, title: item.result!.title, value: item.result!.formattedValue, recordCount: item.result!.recordCount, queryContext: item.result!.queryContext }
      : { kind: "records" as const, title: item.result!.title, recordCount: item.result!.totalRecords, objectLabel: item.result!.objectLabel, queryContext: item.result!.queryContext },
  }));
}

const suggestions = [
  "Bu ay beklenen fatura toplamı nedir?",
  "Bu ay beklenen faturaların detaylarını göster",
  "Açık orderları owner bazında listele",
];

function formatCell(value: string, format: Column["format"]) {
  if (!value) return "—";
  if (format === "currency") return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(Number(value) || 0);
  if (format === "date") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short", year: "numeric", timeZone: "Europe/Istanbul" }).format(date);
  }
  return value;
}

function ResultView({ result }: { result: QueryResult }) {
  const time = new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" }).format(new Date(result.queriedAt));
  if (result.kind === "metric") return (
    <section className={styles.metricResult}>
      <span>{result.title}</span>
      <strong>{result.formattedValue}</strong>
      <p className={styles.interpretation}>{result.interpretation}</p>
      <small>{result.recordCount} HubSpot kaydı · Canlı sorgu {time}</small>
    </section>
  );
  return (
    <section className={styles.recordsResult}>
      <div className={styles.resultHeader}>
        <div><b>{result.title}</b><p className={styles.interpretation}>{result.interpretation}</p><small>{result.totalRecords} kayıt · {result.shownRecords} gösteriliyor</small></div>
        <span>Canlı {time}</span>
      </div>
      {result.records.length ? <div className={styles.tableScroll}><table>
        <thead><tr>{result.columns.map((column) => <th key={column.key}>{column.label}</th>)}<th>HubSpot</th></tr></thead>
        <tbody>{result.records.map((record) => <tr key={record.id}>
          {result.columns.map((column) => <td key={column.key}>{formatCell(record.values[column.key], column.format)}</td>)}
          <td><a href={record.url} target="_blank" rel="noreferrer" aria-label={`${result.objectLabel} kaydını HubSpot'ta aç`}><ArrowUpRight size={15} /></a></td>
        </tr>)}</tbody>
      </table></div> : <div className={styles.empty}>Bu sorguyla eşleşen canlı HubSpot kaydı bulunamadı.</div>}
    </section>
  );
}

export default function SparkChatWidget() {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (open) window.setTimeout(() => inputRef.current?.focus(), 180); }, [open]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [history, loading]);

  async function send(value?: string) {
    const question = (value ?? input).trim();
    if (!question || loading) return;
    setInput(""); setLoading(true); setHistory((current) => [...current, { question }]);
    try {
      const response = await fetch("/api/spark/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question, context: compactContext(history) }) });
      const result = await response.json();
      setHistory((current) => current.map((item, index) => index === current.length - 1 ? { ...item, ...(response.ok ? { result } : { error: result.error || "Sorgu tamamlanamadı." }) } : item));
    } catch {
      setHistory((current) => current.map((item, index) => index === current.length - 1 ? { ...item, error: "Canlı veri bağlantısı şu anda yanıt vermiyor." } : item));
    } finally { setLoading(false); }
  }

  return <div className={styles.shell}>
    <AnimatePresence>{open && <motion.section className={styles.panel} initial={{ opacity: 0, y: 18, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: .97 }} transition={{ duration: .2 }} aria-label="Spark veri asistanı">
      <header className={styles.header}><div className={styles.identity}><span className={styles.icon}><Database size={17} /></span><div><b>Revenue Data Assistant</b><small>HubSpot canlı sorgu</small></div></div><button type="button" onClick={() => setOpen(false)} aria-label="Asistanı kapat"><X size={19} /></button></header>
      <div className={styles.scope}><Bot size={16} /><span>Groq yalnızca soruyu sorguya çevirir. Sonuçlar HubSpot API&apos;den canlı alınır ve doğrudan gösterilir.</span></div>
      <div className={styles.messages} aria-live="polite">
        {!history.length && <div className={styles.suggestions}><p>Tek bir değer veya kayıt listesi sorabilirsin.</p>{suggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => send(suggestion)}>{suggestion}</button>)}</div>}
        {history.map((item, index) => <div className={styles.queryBlock} key={`${item.question}-${index}`}><div className={styles.userMessage}>{item.question}</div>{item.result && <ResultView result={item.result} />}{item.error && <div className={styles.error}>{item.error}</div>}</div>)}
        {loading && <div className={styles.loading}><i /><i /><i /><span>HubSpot sorgulanıyor</span></div>}
        <div ref={bottomRef} />
      </div>
      <form className={styles.composer} onSubmit={(event) => { event.preventDefault(); send(); }}><input ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} placeholder="Bir değer veya kayıt sor…" aria-label="Sorunuz" /><button type="submit" disabled={!input.trim() || loading} aria-label="Soruyu gönder"><Send size={16} /></button></form>
    </motion.section>}</AnimatePresence>
    <motion.button className={styles.launcher} type="button" onClick={() => setOpen((current) => !current)} whileHover={{ y: -2 }} whileTap={{ scale: .97 }} aria-expanded={open}>{open ? <X size={19} /> : <Database size={19} />}<span>{open ? "Kapat" : "Veriye sor"}</span></motion.button>
  </div>;
}
