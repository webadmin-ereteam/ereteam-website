"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CircleDollarSign,
  Info,
  RefreshCw,
  X,
} from "lucide-react";
import type { SparkBreakdownEntry, SparkData, SparkRecord } from "@/lib/spark/types";
import SparkChatWidget from "./SparkChatWidget";
import styles from "./spark.module.css";

const exactMoney = (value: number) => new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format(value);

const shortMoney = (value: number) => {
  const sign = value < 0 ? "-" : "";
  const absolute = Math.abs(value);
  if (absolute >= 1_000_000) return `${sign}$${(absolute / 1_000_000).toFixed(2)}M`;
  if (absolute >= 1_000) return `${sign}$${new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(absolute / 1_000)}K`;
  return `${sign}$${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(absolute)}`;
};

const formatDate = (value?: string, withTime = false) => value
  ? new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
      timeZone: "Europe/Istanbul",
    }).format(new Date(value))
  : "-";

const sum = (rows: SparkRecord[]) => rows.reduce((total, row) => total + row.amount, 0);
const pct = (part: number, whole: number) => whole ? (part / whole) * 100 : 0;
type EditableProperty = "country" | "vendor_name" | "revenue_type" | "ereteam_domain";
type EditableCatalog = Record<NonNullable<SparkRecord["objectType"]>, Record<EditableProperty, {
  label: string;
  multiple: boolean;
  options: Array<{ label: string; value: string }>;
}>>;
const issueProperties: Record<string, EditableProperty> = {
  "Ülke eksik": "country",
  "Vendor eksik": "vendor_name",
  "Revenue type eksik": "revenue_type",
  "Ereteam domain eksik": "ereteam_domain",
};
const editablePropertyFor = (row: SparkRecord) => row.issues?.map((issue) => issueProperties[issue]).find(Boolean);

function InfoNote({ children }: { children: React.ReactNode }) {
  return <div className={styles.infoNote}><Info size={15} aria-hidden />{children}</div>;
}

function OpenRecordsButton({
  rows,
  label,
  onOpen,
  children,
}: {
  rows: SparkRecord[];
  label: string;
  onOpen: (title: string, rows: SparkRecord[]) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={styles.valueButton}
      disabled={!rows.length}
      onClick={() => onOpen(label, rows)}
      aria-label={`${label}: ${rows.length} kayıt`}
    >
      {children}
      {rows.length ? <ArrowUpRight size={13} aria-hidden /> : null}
    </button>
  );
}

function EnumEditor({
  catalog,
  saving,
  onSave,
}: {
  catalog?: EditableCatalog["Deal"][EditableProperty];
  saving: boolean;
  onSave: (values: string[]) => void;
}) {
  const [values, setValues] = useState<string[]>([]);
  if (!catalog) return <span className={styles.editorStatus}>Seçenekler yükleniyor</span>;
  return (
    <div className={styles.enumEditor}>
      <select
        multiple={catalog.multiple}
        size={catalog.multiple ? Math.min(Math.max(catalog.options.length, 2), 4) : undefined}
        value={catalog.multiple ? values : values[0] ?? ""}
        onChange={(event) => setValues(Array.from(event.currentTarget.selectedOptions, (option) => option.value).filter(Boolean))}
        aria-label={catalog.label}
      >
        {!catalog.multiple ? <option value="">Seçin</option> : null}
        {catalog.options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
      </select>
      <button type="button" disabled={saving || !values.length} onClick={() => onSave(values)}>{saving ? "Kaydediliyor" : "Kaydet"}</button>
    </div>
  );
}

function RecordTable({
  rows,
  onRecordsUpdated,
}: {
  rows: SparkRecord[];
  onRecordsUpdated?: (rows: SparkRecord[], property: EditableProperty) => void;
}) {
  const showObjectType = rows.some((row) => row.objectType);
  const showStage = rows.some((row) => row.stage);
  const showAge = rows.some((row) => row.ageDays != null);
  const showWeighted = rows.some((row) => row.weightedAmount != null);
  const showIssue = rows.some((row) => row.issues?.length);
  const editableRows = rows.filter((row) => row.objectType && editablePropertyFor(row));
  const property = editableRows.length ? editablePropertyFor(editableRows[0]) : undefined;
  const [catalogs, setCatalogs] = useState<EditableCatalog | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!property) return;
    const controller = new AbortController();
    fetch("/api/spark/hygiene", { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Seçenekler alınamadı.");
        setCatalogs(result.objects);
      })
      .catch((error) => {
        if (error instanceof Error && error.name !== "AbortError") setMessage(error.message);
      });
    return () => controller.abort();
  }, [property]);

  useEffect(() => {
    setSelected((current) => new Set(Array.from(current).filter((url) => rows.some((row) => row.url === url))));
  }, [rows]);

  const save = async (records: SparkRecord[], values: string[], key: string) => {
    if (!property || !records.length || records.some((row) => !row.objectType)) return;
    setSaving(key);
    setMessage("");
    try {
      const response = await fetch("/api/spark/hygiene", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          records: records.map((row) => ({ objectType: row.objectType, id: row.id })),
          property,
          values,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Güncelleme başarısız.");
      setMessage(`${records.length} kayıt HubSpot'ta güncellendi.`);
      setSelected(new Set());
      onRecordsUpdated?.(records, property);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Güncelleme başarısız.");
    } finally {
      setSaving("");
    }
  };

  const selectedRows = editableRows.filter((row) => selected.has(row.url));
  const selectedTypes = Array.from(new Set(selectedRows.map((row) => row.objectType).filter(Boolean))) as Array<NonNullable<SparkRecord["objectType"]>>;
  const bulkCatalog = property && selectedTypes.length && catalogs
    ? {
        ...catalogs[selectedTypes[0]][property],
        options: catalogs[selectedTypes[0]][property].options.filter((option) =>
          selectedTypes.every((type) => catalogs[type][property].options.some((candidate) => candidate.value === option.value)),
        ),
        multiple: selectedTypes.every((type) => catalogs[type][property].multiple),
      }
    : undefined;
  return (
    <div className={styles.tableWrap}>
      {property ? (
        <div className={styles.bulkEditor}>
          <label><input type="checkbox" checked={editableRows.length > 0 && selected.size === editableRows.length} onChange={(event) => setSelected(event.target.checked ? new Set(editableRows.map((row) => row.url)) : new Set())} /> Tümünü seç</label>
          <span>{selectedRows.length} kayıt seçili</span>
          {selectedRows.length ? <EnumEditor catalog={bulkCatalog} saving={saving === "bulk"} onSave={(values) => save(selectedRows, values, "bulk")} /> : <small>Toplu güncellemek için kayıt seçin.</small>}
          {message ? <b className={styles.editorStatus}>{message}</b> : null}
        </div>
      ) : null}
      <table>
        <thead>
          <tr>
            {property ? <th>Seç</th> : null}
            <th>Kayıt</th>
            {showObjectType ? <th>Tür</th> : null}
            {showStage ? <th>Stage</th> : null}
            <th>Tarih</th>
            {showAge ? <th>Yaş</th> : null}
            <th>Tutar</th>
            {showWeighted ? <th>Weighted</th> : null}
            <th>Owner</th>
            {showIssue ? <th>Kontrol</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.url} className={row.carryover ? styles.carryover : ""}>
              {property ? <td><input type="checkbox" checked={selected.has(row.url)} onChange={(event) => setSelected((current) => { const next = new Set(current); if (event.target.checked) next.add(row.url); else next.delete(row.url); return next; })} aria-label={`${row.name} kaydını seç`} /></td> : null}
              <td><a href={row.url} target="_blank" rel="noreferrer">{row.name}<ArrowUpRight size={12} /></a></td>
              {showObjectType ? <td><span className={styles.objectPill}>{row.objectType || "-"}</span></td> : null}
              {showStage ? <td><span className={styles.stagePill}>{row.stage || "-"}</span></td> : null}
              <td>{formatDate(row.date)}</td>
              {showAge ? <td>{row.ageDays != null ? `${row.ageDays} gün` : "-"}</td> : null}
              <td><b>{exactMoney(row.amount)}</b></td>
              {showWeighted ? <td>{exactMoney(row.weightedAmount ?? 0)}</td> : null}
              <td>{row.owner || "-"}</td>
              {showIssue ? (
                <td>
                  <span className={styles.issueLabel}>{row.issues?.join(", ") || "-"}</span>
                  {property && row.objectType ? <EnumEditor catalog={catalogs?.[row.objectType][property]} saving={saving === row.url} onSave={(values) => save([row], values, row.url)} /> : null}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RecordDialog({
  title,
  rows,
  onClose,
  onRecordsUpdated,
}: {
  title: string;
  rows: SparkRecord[];
  onClose: () => void;
  onRecordsUpdated?: (rows: SparkRecord[], property: EditableProperty) => void;
}) {
  return (
    <div className={styles.dialogBackdrop} role="presentation" onMouseDown={onClose}>
      <section className={styles.dialog} role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
        <div className={styles.dialogHead}>
          <div>
            <span>Kayıt detayı</span>
            <h2>{title}</h2>
            <p>{rows.length} kayıt · {exactMoney(sum(rows))}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Kapat"><X size={20} /></button>
        </div>
        {rows.length ? <RecordTable rows={rows} onRecordsUpdated={onRecordsUpdated} /> : <div className={styles.empty}>Kayıt bulunmuyor.</div>}
      </section>
    </div>
  );
}

const chartColors = ["#087f71", "#4f7cac", "#d99532", "#845ec2", "#2c9fb3", "#c85272"];

function DonutChart({ entries, overlapping }: { entries: Array<{ label: string; value: number }>; overlapping: boolean }) {
  const ranked = entries.filter((entry) => entry.value > 0).sort((left, right) => right.value - left.value);
  const visible = ranked.slice(0, 5);
  const other = ranked.slice(5).reduce((total, entry) => total + entry.value, 0);
  const items = other ? [...visible, { label: "Diğer", value: other }] : visible;
  const total = items.reduce((sumValue, entry) => sumValue + entry.value, 0);
  let cursor = 0;
  const gradient = items.map((entry, index) => {
    const start = cursor;
    cursor += pct(entry.value, total);
    return `${chartColors[index % chartColors.length]} ${start}% ${cursor}%`;
  }).join(", ");

  return (
    <div className={styles.breakdownVisual}>
      <div className={styles.donut} style={{ background: gradient ? `conic-gradient(${gradient})` : "#e8edeb" }}>
        <div><strong>{items.length}</strong><span>{overlapping ? "kategori" : "pay"}</span></div>
      </div>
      <div className={styles.donutLegend}>
        <span className={styles.breakdownLegendTitle}>Fatura + açık order</span>
        {items.map((entry, index) => (
          <div key={entry.label}>
            <i style={{ background: chartColors[index % chartColors.length] }} />
            <span>{entry.label}</span>
            <b>{shortMoney(entry.value)}</b>
            {!overlapping ? <small>%{pct(entry.value, total).toFixed(1)}</small> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard({ data }: { data: SparkData }) {
  const router = useRouter();
  const [detail, setDetail] = useState<{ title: string; rows: SparkRecord[] } | null>(null);
  const [breakdownKey, setBreakdownKey] = useState(data.revenueBreakdowns[0]?.key ?? "country");
  const [hygiene, setHygiene] = useState(data.hygiene);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState("");
  const year = Number(data.reportDate.slice(0, 4));
  const currentMonth = Number(data.reportDate.slice(5, 7));
  const guaranteedCoverage = data.ytdInvoice + data.openOrders;
  const remaining = Math.max(data.target - guaranteedCoverage, 0);
  const forecastCoverage = guaranteedCoverage + data.yearWeightedPipeline;
  const won = sum(data.weeklyWon);
  const lost = sum(data.weeklyLost);
  const selectedBreakdown = data.revenueBreakdowns.find((item) => item.key === breakdownKey) ?? data.revenueBreakdowns[0];
  const breakdownChart = selectedBreakdown?.entries.map((entry) => ({
    label: entry.label,
    value: sum(entry.invoices) + sum(entry.orders),
  })) ?? [];
  const currentMonthData = data.monthlyPerformance.find((item) => item.month === currentMonth);
  const currentQuarter = Math.floor((currentMonth - 1) / 3) + 1;
  const quarterMonths = data.monthlyPerformance.slice((currentQuarter - 1) * 3, currentQuarter * 3);
  const monthInvoices = currentMonthData?.invoices ?? [];
  const monthOrders = currentMonthData?.orders ?? [];
  const monthDeals = currentMonthData?.deals ?? [];
  const quarterInvoices = quarterMonths.flatMap((item) => item.invoices);
  const quarterOrders = quarterMonths.flatMap((item) => item.orders);
  const quarterDeals = quarterMonths.flatMap((item) => item.deals);
  const quarterWeighted = quarterMonths.reduce((total, item) => total + item.weightedPipeline, 0);
  const nbCarryoverInvoices = data.newBusiness.invoices.filter((row) => row.carryover);
  const nbCarryoverOrders = data.newBusiness.orders.filter((row) => row.carryover);
  const funnelMax = Math.max(...data.stageFunnel.map((stage) => sum(stage.records)), 1);
  const openRecords = (title: string, rows: SparkRecord[]) => setDetail({ title, rows });
  const handleRecordsUpdated = (updatedRows: SparkRecord[], property: EditableProperty) => {
    const urls = new Set(updatedRows.map((row) => row.url));
    setHygiene((groups) => groups.map((group) => group.key === `missing-${property}`
      ? { ...group, records: group.records.filter((row) => !urls.has(row.url)) }
      : group));
    setDetail((current) => current ? { ...current, rows: current.rows.filter((row) => !urls.has(row.url)) } : null);
  };

  const refreshDashboard = async () => {
    if (refreshing) return;
    setRefreshing(true);
    setRefreshMessage("");
    try {
      const response = await fetch("/api/spark/refresh", { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Yenileme başarısız.");
      setRefreshMessage(result.refreshed ? "Güncellendi" : result.message || "Zaten güncel");
      router.refresh();
    } catch {
      setRefreshMessage("Şu anda yenilenemedi");
    } finally {
      setRefreshing(false);
    }
  };

  const breakdownRows = (entry: SparkBreakdownEntry, kind: "invoices" | "orders" | "deals") => entry[kind];

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.brandLockup}>
          <div className={styles.logoBox}><Image src="/logos/ereteam-logo.png" alt="Ereteam" width={132} height={76} priority /></div>
          <div>
            <span className={styles.eyebrow}>Ereteam Spark</span>
            <h1>Gelir Yönetim Merkezi</h1>
            <p>{year} görünümü · HubSpot canlı operasyon verisi</p>
          </div>
        </div>
        <div className={styles.refreshArea}>
          <span>Son güncelleme {formatDate(data.generatedAt, true)}</span>
          <button type="button" onClick={refreshDashboard} disabled={refreshing}>
            <RefreshCw size={14} className={refreshing ? styles.spinning : ""} />
            {refreshing ? "Yenileniyor" : "Veriyi yenile"}
          </button>
          {refreshMessage ? <small aria-live="polite">{refreshMessage}</small> : null}
        </div>
      </header>

      <nav className={styles.sectionNav} aria-label="Rapor bölümleri">
        <a href="#overview">Özet</a>
        <a href="#months">Aylık görünüm</a>
        <a href="#funnel">Stage funnel</a>
        <a href="#breakdowns">Revenue kırılımları</a>
        <a href="#new-business">New Business</a>
        <a href="#hygiene">CRM hygiene</a>
      </nav>

      <section id="overview">
        <div className={styles.sectionHead}>
          <div><span>01</span><h2>Yönetici özeti</h2></div>
          <p>Hedef, gerçekleşen gelir ve canlı pipeline</p>
        </div>
        <div className={styles.heroMetrics}>
          <article className={`${styles.metricCard} ${styles.metricPrimary}`}>
            <span>Garanti revenue coverage</span>
            <strong>%{pct(guaranteedCoverage, data.target).toFixed(1)}</strong>
            <p>{shortMoney(guaranteedCoverage)} / {shortMoney(data.target)}</p>
            <div className={styles.progress}><i style={{ width: `${Math.min(pct(guaranteedCoverage, data.target), 100)}%` }} /></div>
          </article>
          <article className={styles.metricCard}>
            <span>YTD fatura</span><strong>{shortMoney(data.ytdInvoice)}</strong><p>Open + Paid invoice</p>
          </article>
          <article className={styles.metricCard}>
            <span>Açık order</span><strong>{shortMoney(data.openOrders)}</strong><p>{year} faturalanma planı</p>
          </article>
          <article className={`${styles.metricCard} ${styles.metricForecast}`}>
            <span>Forecast coverage</span><strong>%{pct(forecastCoverage, data.target).toFixed(1)}</strong><p>{shortMoney(forecastCoverage)} · weighted dahil</p>
          </article>
          <article className={styles.metricCard}>
            <span>Aktif pipeline</span><strong>{shortMoney(data.pipeline)}</strong><p>{data.activeDeals} opportunity</p>
          </article>
        </div>

        <div className={styles.overviewGrid}>
          <article className={styles.targetCard}>
            <div className={styles.targetTop}>
              <div><span>Hedefe kalan</span><strong>{shortMoney(remaining)}</strong></div>
              <div className={styles.coverageBadge}>Forecast ile %{pct(forecastCoverage, data.target).toFixed(1)}</div>
            </div>
            <div className={styles.targetScale}>
              <i className={styles.invoiceSegment} style={{ width: `${Math.min(pct(data.ytdInvoice, data.target), 100)}%` }} />
              <i className={styles.orderSegment} style={{ width: `${Math.min(pct(data.openOrders, data.target), Math.max(100 - pct(data.ytdInvoice, data.target), 0))}%` }} />
              <i className={styles.forecastSegment} style={{ width: `${Math.min(pct(data.yearWeightedPipeline, data.target), Math.max(100 - pct(guaranteedCoverage, data.target), 0))}%` }} />
            </div>
            <div className={styles.legendRow}>
              <span><i className={styles.dotInvoice} />Fatura {shortMoney(data.ytdInvoice)}</span>
              <span><i className={styles.dotOrder} />Order {shortMoney(data.openOrders)}</span>
              <span><i className={styles.dotForecast} />Weighted {shortMoney(data.yearWeightedPipeline)}</span>
            </div>
          </article>
          <article className={styles.weeklyCard}>
            <div className={styles.cardTitle}><span>Son 7 gün · Pipeline hareketi</span><small>{formatDate(data.periodStart)} – {formatDate(data.periodEnd)}</small></div>
            <div className={styles.weeklyMetrics}>
              <OpenRecordsButton rows={data.weeklyNewDeals} label="Bu hafta açılan fırsatlar" onOpen={openRecords}><span>Yeni pipeline</span><b>{shortMoney(data.weeklyNewPipeline)}</b><small>{data.weeklyNewDeals.length} fırsat</small></OpenRecordsButton>
              <OpenRecordsButton rows={data.weeklyWon} label="Bu hafta kazanılan fırsatlar" onOpen={openRecords}><span>Won pipeline</span><b>{shortMoney(won)}</b><small>{data.weeklyWon.length} fırsat</small></OpenRecordsButton>
              <OpenRecordsButton rows={data.weeklyLost} label="Bu hafta kaybedilen fırsatlar" onOpen={openRecords}><span>Lost pipeline</span><b>{shortMoney(lost)}</b><small>{data.weeklyLost.length} fırsat</small></OpenRecordsButton>
            </div>
          </article>
        </div>
        <InfoNote>Weighted forecast doğrudan HubSpot <code>Projected amount in company currency</code> alanından gelir. Custom <code>status</code> alanı Cancelled olan faturalar tüm hesaplardan çıkarılır; boş ve Invoiced değerleri dahil edilir.</InfoNote>
      </section>

      <section id="months">
        <div className={styles.sectionHead}>
          <div><span>02</span><h2>Aylık operasyon görünümü</h2></div>
          <p>{year} · 12 aylık revenue ve pipeline planı</p>
        </div>
        <div className={styles.periodGrid}>
          <article className={`${styles.periodCard} ${styles.periodMonth}`}>
            <div className={styles.periodTitle}><span>Bu ay</span><b>{currentMonthData?.label}</b></div>
            <div className={styles.periodMetrics}>
              <OpenRecordsButton rows={monthInvoices} label="Bu ay faturalar" onOpen={openRecords}><span>Fatura</span><b>{shortMoney(sum(monthInvoices))}</b><small>{monthInvoices.length} kayıt</small></OpenRecordsButton>
              <OpenRecordsButton rows={monthOrders} label="Bu ay açık orderlar" onOpen={openRecords}><span>Açık order</span><b>{shortMoney(sum(monthOrders))}</b><small>{monthOrders.length} kayıt</small></OpenRecordsButton>
              <OpenRecordsButton rows={monthDeals} label="Bu ay kapanış planlı aktif fırsatlar" onOpen={openRecords}><span>Pipeline</span><b>{shortMoney(sum(monthDeals))}</b><small>{monthDeals.length} fırsat</small></OpenRecordsButton>
              <OpenRecordsButton rows={monthDeals} label="Bu ay weighted pipeline" onOpen={openRecords}><span>Weighted</span><b>{shortMoney(currentMonthData?.weightedPipeline ?? 0)}</b><small>HubSpot projected</small></OpenRecordsButton>
            </div>
          </article>
          <article className={`${styles.periodCard} ${styles.periodQuarter}`}>
            <div className={styles.periodTitle}><span>Bu çeyrek</span><b>Q{currentQuarter}</b></div>
            <div className={styles.periodMetrics}>
              <OpenRecordsButton rows={quarterInvoices} label={`Q${currentQuarter} faturaları`} onOpen={openRecords}><span>Fatura</span><b>{shortMoney(sum(quarterInvoices))}</b><small>{quarterInvoices.length} kayıt</small></OpenRecordsButton>
              <OpenRecordsButton rows={quarterOrders} label={`Q${currentQuarter} açık orderları`} onOpen={openRecords}><span>Açık order</span><b>{shortMoney(sum(quarterOrders))}</b><small>{quarterOrders.length} kayıt</small></OpenRecordsButton>
              <OpenRecordsButton rows={quarterDeals} label={`Q${currentQuarter} kapanış planlı aktif fırsatlar`} onOpen={openRecords}><span>Pipeline</span><b>{shortMoney(sum(quarterDeals))}</b><small>{quarterDeals.length} fırsat</small></OpenRecordsButton>
              <OpenRecordsButton rows={quarterDeals} label={`Q${currentQuarter} weighted pipeline`} onOpen={openRecords}><span>Weighted</span><b>{shortMoney(quarterWeighted)}</b><small>HubSpot projected</small></OpenRecordsButton>
            </div>
          </article>
        </div>
        <article className={styles.dataCard}>
          <div className={styles.tableWrap}>
            <table className={styles.monthTable}>
              <thead><tr><th>Ay</th><th>Revenue kompozisyonu</th><th>Fatura</th><th>Açık order</th><th>Aktif pipeline</th><th>Weighted pipeline</th><th>Fırsat</th></tr></thead>
              <tbody>
                {data.monthlyPerformance.map((item) => {
                  const invoiceAmount = sum(item.invoices);
                  const orderAmount = sum(item.orders);
                  const forecastAmount = invoiceAmount + orderAmount + item.weightedPipeline;
                  const rowClass = [
                    item.month === currentMonth ? styles.currentRow : "",
                    item.month < currentMonth ? styles.pastRow : "",
                    item.month > currentMonth ? styles.futureRow : "",
                    [1, 4, 7, 10].includes(item.month) ? styles.quarterStart : "",
                  ].filter(Boolean).join(" ");
                  return (
                    <tr key={item.month} className={rowClass}>
                      <td><b>{item.label}</b>{item.month === currentMonth ? <span className={styles.nowPill}>Bu ay</span> : null}{[1, 4, 7, 10].includes(item.month) ? <small>Q{Math.floor((item.month - 1) / 3) + 1}</small> : null}</td>
                      <td>
                        <div className={styles.monthComposition} aria-label={`${item.label} revenue kompozisyonu`}>
                          <div><i className={styles.invoiceSegment} style={{ width: `${pct(invoiceAmount, forecastAmount)}%` }} /><i className={styles.orderSegment} style={{ width: `${pct(orderAmount, forecastAmount)}%` }} /><i className={styles.forecastSegment} style={{ width: `${pct(item.weightedPipeline, forecastAmount)}%` }} /></div>
                          <span><b>{shortMoney(invoiceAmount + orderAmount)}</b> garanti · {shortMoney(forecastAmount)} forecast</span>
                        </div>
                      </td>
                      <td><OpenRecordsButton rows={item.invoices} label={`${item.label} faturaları`} onOpen={openRecords}><b>{shortMoney(invoiceAmount)}</b><small>{item.invoices.length} kayıt</small></OpenRecordsButton></td>
                      <td><OpenRecordsButton rows={item.orders} label={`${item.label} açık orderları`} onOpen={openRecords}><b>{shortMoney(orderAmount)}</b><small>{item.orders.length} kayıt</small></OpenRecordsButton></td>
                      <td><OpenRecordsButton rows={item.deals} label={`${item.label} kapanış tarihli aktif fırsatlar`} onOpen={openRecords}><b>{shortMoney(sum(item.deals))}</b><small>{item.deals.length} kayıt</small></OpenRecordsButton></td>
                      <td><OpenRecordsButton rows={item.deals} label={`${item.label} weighted pipeline kayıtları`} onOpen={openRecords}><b>{shortMoney(item.weightedPipeline)}</b><small>HubSpot projected</small></OpenRecordsButton></td>
                      <td><span className={styles.countCell}>{item.deals.length}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </article>
        <InfoNote>Order ayı HubSpot faturalanma tarihi olan processed date’e, fırsat ayı planlanan close date’e göre belirlenir. Tutarların üzerindeki bağlantı ilgili HubSpot kayıtlarını açar.</InfoNote>
      </section>

      <section id="funnel">
        <div className={styles.sectionHead}>
          <div><span>03</span><h2>Pipeline stage funnel</h2></div>
          <p>Açık fırsatların stage bazında dağılımı</p>
        </div>
        <article className={styles.dataCard}>
          {data.stageFunnel.length ? (
            <div className={styles.funnelFlow}>
              {data.stageFunnel.map((stage, index) => {
                const stageAmount = sum(stage.records);
                const color = chartColors[index % chartColors.length];
                return (
                  <button
                    type="button"
                    key={stage.id}
                    style={{ borderTopColor: color, background: `linear-gradient(145deg, ${color}14, #fff 58%)` }}
                    onClick={() => openRecords(`${stage.label} fırsatları`, stage.records)}
                  >
                    <span className={styles.funnelStageHead}><i style={{ background: color }}>{String(index + 1).padStart(2, "0")}</i><b>{stage.label}</b><ArrowUpRight size={15} /></span>
                    <strong>{shortMoney(stageAmount)}</strong>
                    <span className={styles.funnelStageStats}><span><b>{stage.records.length}</b> fırsat</span><span><b>%{(stage.probability * 100).toFixed(0)}</b> olasılık</span><span><b>{stage.averageAgeDays.toFixed(0)}</b> gün</span></span>
                    <span className={styles.funnelMeter}><i style={{ width: `${Math.max((stageAmount / funnelMax) * 100, 2)}%`, background: color }} /></span>
                    <span className={styles.funnelWeighted}><b>{shortMoney(stage.weightedPipeline)}</b> weighted pipeline</span>
                  </button>
                );
              })}
            </div>
          ) : <div className={styles.empty}>Aktif pipeline stage’i bulunmuyor.</div>}
        </article>
        <InfoNote>Funnel yalnız aktif fırsatları gösterir. Won, Lost ve Open ayrımı stage adından değil HubSpot closed/won alanları ve pipeline metadata’sından yapılır.</InfoNote>
      </section>

      <section id="breakdowns">
        <div className={styles.sectionHead}>
          <div><span>04</span><h2>Revenue kırılımları</h2></div>
          <p>Gerçekleşen, planlanan ve pipeline kompozisyonu</p>
        </div>
        <div className={styles.tabs} role="tablist" aria-label="Revenue kırılımı">
          {data.revenueBreakdowns.map((breakdown) => (
            <button type="button" role="tab" aria-selected={breakdown.key === selectedBreakdown?.key} key={breakdown.key} onClick={() => setBreakdownKey(breakdown.key)}>{breakdown.label}</button>
          ))}
        </div>
        <article className={styles.dataCard}>
          {selectedBreakdown?.entries.length ? (
            <div>
              <DonutChart entries={breakdownChart} overlapping={selectedBreakdown.multiValue} />
              <div className={styles.tableWrap}>
                <table className={styles.breakdownTable}>
                  <thead><tr><th>{selectedBreakdown.label}</th><th>Fatura</th><th>Açık order</th><th>Aktif pipeline</th><th>Weighted</th><th>Garanti gelir</th></tr></thead>
                  <tbody>
                    {selectedBreakdown.entries.map((entry) => {
                      const realized = sum(entry.invoices) + sum(entry.orders);
                      return (
                        <tr key={entry.key}>
                          <td><b>{entry.label}</b></td>
                          <td><OpenRecordsButton rows={breakdownRows(entry, "invoices")} label={`${entry.label} faturaları`} onOpen={openRecords}>{shortMoney(sum(entry.invoices))}</OpenRecordsButton></td>
                          <td><OpenRecordsButton rows={breakdownRows(entry, "orders")} label={`${entry.label} açık orderları`} onOpen={openRecords}>{shortMoney(sum(entry.orders))}</OpenRecordsButton></td>
                          <td><OpenRecordsButton rows={breakdownRows(entry, "deals")} label={`${entry.label} aktif fırsatları`} onOpen={openRecords}>{shortMoney(sum(entry.deals))}</OpenRecordsButton></td>
                          <td><OpenRecordsButton rows={breakdownRows(entry, "deals")} label={`${entry.label} weighted fırsatları`} onOpen={openRecords}>{shortMoney(entry.weightedPipeline)}</OpenRecordsButton></td>
                          <td><b>{shortMoney(realized)}</b><small> fatura + order</small></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : <div className={styles.empty}>Bu kırılım için sınıflandırılmış kayıt bulunmuyor.</div>}
        </article>
        <InfoNote>{selectedBreakdown?.multiValue ? `${selectedBreakdown.label} çoklu seçim alanıdır. Bir kayıt seçili her kategoride tam tutarıyla yer alabileceği için satır toplamları genel toplamı aşabilir.` : "Belirtilmemiş satırı, ilgili HubSpot alanı boş olan kayıtları görünür tutar."}</InfoNote>
      </section>

      <section id="new-business">
        <div className={styles.sectionHead}>
          <div><span>05</span><h2>New Business</h2></div>
          <p>Toplam portföy ve {year} kazanım kohortu</p>
        </div>
        <div className={styles.nbSplit}>
          <article className={`${styles.nbPanel} ${styles.nbAll}`}>
            <div className={styles.nbPanelHead}>
              <div><span>Tüm New Business portföyü</span><small>Önceki yıllarda ve bu yıl kazanılan deal&apos;lere bağlı {year} geliri</small></div>
              <div className={styles.nbTotal}><small>Fatura + açık order</small><strong>{shortMoney(sum(data.newBusiness.invoices) + sum(data.newBusiness.orders))}</strong></div>
            </div>
            <div className={styles.nbMetrics}>
              <OpenRecordsButton rows={data.newBusiness.invoices} label="Tüm New Business faturaları" onOpen={openRecords}><span>Fatura edilen</span><b>{shortMoney(sum(data.newBusiness.invoices))}</b><small>{data.newBusiness.invoices.length} kayıt</small></OpenRecordsButton>
              <OpenRecordsButton rows={data.newBusiness.orders} label="Tüm New Business açık orderları" onOpen={openRecords}><span>Açık order</span><b>{shortMoney(sum(data.newBusiness.orders))}</b><small>{data.newBusiness.orders.length} kayıt</small></OpenRecordsButton>
              <OpenRecordsButton rows={[...nbCarryoverInvoices, ...nbCarryoverOrders]} label="Önceki yıl kazanımlarından taşınan New Business geliri" onOpen={openRecords}><span>Geçmiş yıl kazanımları</span><b>{shortMoney(sum(nbCarryoverInvoices) + sum(nbCarryoverOrders))}</b><small>{nbCarryoverInvoices.length + nbCarryoverOrders.length} kayıt</small></OpenRecordsButton>
            </div>
          </article>
          <article className={`${styles.nbPanel} ${styles.nbCurrent}`}>
            <div className={styles.nbPanelHead}>
              <div><span>{year} kazanımları</span><small>Yalnız bu yıl Closed Won olan New Business deal&apos;leri ve bağlı gelir</small></div>
              <div className={styles.nbTotal}><small>Fatura + açık order</small><strong>{shortMoney(sum(data.newBusiness.sameYearInvoices) + sum(data.newBusiness.sameYearOrders))}</strong></div>
            </div>
            <div className={styles.nbMetrics}>
              <OpenRecordsButton rows={data.newBusiness.sameYearDeals} label={`${year} kazanılan New Business fırsatları`} onOpen={openRecords}><span>Closed Won deal</span><b>{shortMoney(sum(data.newBusiness.sameYearDeals))}</b><small>{data.newBusiness.sameYearDeals.length} fırsat</small></OpenRecordsButton>
              <OpenRecordsButton rows={data.newBusiness.sameYearInvoices} label={`${year} kazanımlarına bağlı faturalar`} onOpen={openRecords}><span>Fatura edilen</span><b>{shortMoney(sum(data.newBusiness.sameYearInvoices))}</b><small>{data.newBusiness.sameYearInvoices.length} kayıt</small></OpenRecordsButton>
              <OpenRecordsButton rows={data.newBusiness.sameYearOrders} label={`${year} kazanımlarına bağlı açık orderlar`} onOpen={openRecords}><span>Açık order</span><b>{shortMoney(sum(data.newBusiness.sameYearOrders))}</b><small>{data.newBusiness.sameYearOrders.length} kayıt</small></OpenRecordsButton>
            </div>
          </article>
        </div>
      </section>

      <section id="hygiene">
        <div className={styles.sectionHead}>
          <div><span>06</span><h2>CRM hygiene</h2></div>
          <p>Fatura, order ve deal kayıtlarında operasyon ve sınıflandırma kontrolleri</p>
        </div>
        <div className={styles.hygieneGrid}>
          {hygiene.map((group, index) => (
            <article className={`${styles.hygieneCard} ${group.key.startsWith("missing-") ? styles.hygieneClassification : ""}`} key={group.key}>
              <div className={styles.hygieneIcon}>{index < 2 ? <AlertTriangle size={18} /> : index === 4 ? <CircleDollarSign size={18} /> : <BarChart3 size={18} />}</div>
              <span>{group.label}</span>
              <strong>{group.records.length}</strong>
              <p>{shortMoney(sum(group.records))} {group.key.startsWith("missing-") ? "toplam tutar" : "pipeline"}</p>
              <small>{group.description}</small>
              <button type="button" disabled={!group.records.length} onClick={() => openRecords(group.label, group.records)}>Kayıtları incele <ArrowUpRight size={13} /></button>
            </article>
          ))}
        </div>
        <InfoNote>CRM hygiene göstergeleri performans puanı değildir. Operasyon kontrolleri aktif pipeline&apos;ı; sınıflandırma kontrolleri ise {year} faturalarını, açık orderları ve yıl kapanış planındaki aktif deal&apos;leri kapsar. Aynı kayıt birden fazla grupta yer alabilir.</InfoNote>
      </section>

      <footer>Ereteam · Spark Gelir Yönetim Merkezi · {formatDate(data.generatedAt)}</footer>
      {detail ? <RecordDialog title={detail.title} rows={detail.rows} onClose={() => setDetail(null)} onRecordsUpdated={handleRecordsUpdated} /> : null}
      <SparkChatWidget />
    </main>
  );
}
