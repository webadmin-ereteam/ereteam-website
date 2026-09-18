"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

function RecordTable({ rows }: { rows: SparkRecord[] }) {
  const showStage = rows.some((row) => row.stage);
  const showAge = rows.some((row) => row.ageDays != null);
  const showWeighted = rows.some((row) => row.weightedAmount != null);
  const showIssue = rows.some((row) => row.issues?.length);
  return (
    <div className={styles.tableWrap}>
      <table>
        <thead>
          <tr>
            <th>Kayıt</th>
            <th>Şirket</th>
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
              <td><a href={row.url} target="_blank" rel="noreferrer">{row.name}<ArrowUpRight size={12} /></a></td>
              <td>{row.company || "-"}</td>
              {showStage ? <td><span className={styles.stagePill}>{row.stage || "-"}</span></td> : null}
              <td>{formatDate(row.date)}</td>
              {showAge ? <td>{row.ageDays != null ? `${row.ageDays} gün` : "-"}</td> : null}
              <td><b>{exactMoney(row.amount)}</b></td>
              {showWeighted ? <td>{exactMoney(row.weightedAmount ?? 0)}</td> : null}
              <td>{row.owner || "-"}</td>
              {showIssue ? <td>{row.issues?.join(", ") || "-"}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RecordDialog({ title, rows, onClose }: { title: string; rows: SparkRecord[]; onClose: () => void }) {
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
        {rows.length ? <RecordTable rows={rows} /> : <div className={styles.empty}>Kayıt bulunmuyor.</div>}
      </section>
    </div>
  );
}

export default function Dashboard({ data }: { data: SparkData }) {
  const router = useRouter();
  const [detail, setDetail] = useState<{ title: string; rows: SparkRecord[] } | null>(null);
  const [breakdownKey, setBreakdownKey] = useState(data.revenueBreakdowns[0]?.key ?? "country");
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState("");
  const year = Number(data.reportDate.slice(0, 4));
  const currentMonth = Number(data.reportDate.slice(5, 7));
  const coverage = data.ytdInvoice + data.openOrders;
  const remaining = Math.max(data.target - coverage, 0);
  const forecastCoverage = coverage + data.yearWeightedPipeline;
  const won = sum(data.weeklyWon);
  const lost = sum(data.weeklyLost);
  const selectedBreakdown = data.revenueBreakdowns.find((item) => item.key === breakdownKey) ?? data.revenueBreakdowns[0];
  const openRecords = (title: string, rows: SparkRecord[]) => setDetail({ title, rows });

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
            <h1>Revenue command center</h1>
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
        <a href="#hygiene">Pipeline hygiene</a>
      </nav>

      <section id="overview">
        <div className={styles.sectionHead}>
          <div><span>01</span><h2>Yönetici özeti</h2></div>
          <p>Hedef, gerçekleşen gelir ve canlı pipeline</p>
        </div>
        <div className={styles.heroMetrics}>
          <article className={`${styles.metricCard} ${styles.metricPrimary}`}>
            <span>Revenue coverage</span>
            <strong>%{pct(coverage, data.target).toFixed(1)}</strong>
            <p>{shortMoney(coverage)} / {shortMoney(data.target)}</p>
            <div className={styles.progress}><i style={{ width: `${Math.min(pct(coverage, data.target), 100)}%` }} /></div>
          </article>
          <article className={styles.metricCard}>
            <span>YTD fatura</span><strong>{shortMoney(data.ytdInvoice)}</strong><p>Open + Paid invoice</p>
          </article>
          <article className={styles.metricCard}>
            <span>Açık order</span><strong>{shortMoney(data.openOrders)}</strong><p>{year} faturalanma planı</p>
          </article>
          <article className={styles.metricCard}>
            <span>Weighted forecast</span><strong>{shortMoney(data.weightedForecast)}</strong><p>HubSpot projected amount</p>
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
              <i className={styles.forecastSegment} style={{ width: `${Math.min(pct(data.yearWeightedPipeline, data.target), Math.max(100 - pct(coverage, data.target), 0))}%` }} />
            </div>
            <div className={styles.legendRow}>
              <span><i className={styles.dotInvoice} />Fatura {shortMoney(data.ytdInvoice)}</span>
              <span><i className={styles.dotOrder} />Order {shortMoney(data.openOrders)}</span>
              <span><i className={styles.dotForecast} />Weighted {shortMoney(data.yearWeightedPipeline)}</span>
            </div>
          </article>
          <article className={styles.weeklyCard}>
            <div className={styles.cardTitle}><span>Son 7 gün</span><small>{formatDate(data.periodStart)} – {formatDate(data.periodEnd)}</small></div>
            <div className={styles.weeklyMetrics}>
              <OpenRecordsButton rows={data.weeklyNewDeals} label="Bu hafta açılan fırsatlar" onOpen={openRecords}><span>Yeni</span><b>{shortMoney(data.weeklyNewPipeline)}</b><small>{data.weeklyNewDeals.length} kayıt</small></OpenRecordsButton>
              <OpenRecordsButton rows={data.weeklyWon} label="Bu hafta kazanılan fırsatlar" onOpen={openRecords}><span>Won</span><b>{shortMoney(won)}</b><small>{data.weeklyWon.length} kayıt</small></OpenRecordsButton>
              <OpenRecordsButton rows={data.weeklyLost} label="Bu hafta kaybedilen fırsatlar" onOpen={openRecords}><span>Lost</span><b>{shortMoney(lost)}</b><small>{data.weeklyLost.length} kayıt</small></OpenRecordsButton>
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
        <article className={styles.dataCard}>
          <div className={styles.tableWrap}>
            <table className={styles.monthTable}>
              <thead><tr><th>Ay</th><th>Fatura</th><th>Açık order</th><th>Aktif pipeline</th><th>Weighted pipeline</th><th>Fırsat</th></tr></thead>
              <tbody>
                {data.monthlyPerformance.map((item) => (
                  <tr key={item.month} className={item.month === currentMonth ? styles.currentRow : ""}>
                    <td><b>{item.label}</b>{item.month === currentMonth ? <span className={styles.nowPill}>Bu ay</span> : null}</td>
                    <td><OpenRecordsButton rows={item.invoices} label={`${item.label} faturaları`} onOpen={openRecords}><b>{shortMoney(sum(item.invoices))}</b><small>{item.invoices.length} kayıt</small></OpenRecordsButton></td>
                    <td><OpenRecordsButton rows={item.orders} label={`${item.label} açık orderları`} onOpen={openRecords}><b>{shortMoney(sum(item.orders))}</b><small>{item.orders.length} kayıt</small></OpenRecordsButton></td>
                    <td><OpenRecordsButton rows={item.deals} label={`${item.label} kapanış tarihli aktif fırsatlar`} onOpen={openRecords}><b>{shortMoney(sum(item.deals))}</b><small>{item.deals.length} kayıt</small></OpenRecordsButton></td>
                    <td><OpenRecordsButton rows={item.deals} label={`${item.label} weighted pipeline kayıtları`} onOpen={openRecords}><b>{shortMoney(item.weightedPipeline)}</b><small>HubSpot projected</small></OpenRecordsButton></td>
                    <td><span className={styles.countCell}>{item.deals.length}</span></td>
                  </tr>
                ))}
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
            <div className={styles.funnelList}>
              {data.stageFunnel.map((stage, index) => {
                const stageAmount = sum(stage.records);
                const maxAmount = Math.max(...data.stageFunnel.map((item) => sum(item.records)), 1);
                return (
                  <button type="button" key={stage.id} onClick={() => openRecords(`${stage.label} fırsatları`, stage.records)}>
                    <span className={styles.stageIndex}>{String(index + 1).padStart(2, "0")}</span>
                    <span className={styles.stageName}><b>{stage.label}</b><small>%{(stage.probability * 100).toFixed(0)} olasılık · ort. {stage.averageAgeDays.toFixed(0)} gün</small></span>
                    <span className={styles.stageBar}><i style={{ width: `${Math.max((stageAmount / maxAmount) * 100, 2)}%` }} /></span>
                    <span className={styles.stageValue}><b>{shortMoney(stageAmount)}</b><small>{stage.records.length} fırsat</small></span>
                    <span className={styles.stageWeighted}><b>{shortMoney(stage.weightedPipeline)}</b><small>weighted</small></span>
                    <ArrowUpRight size={15} />
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
            <div className={styles.tableWrap}>
              <table className={styles.breakdownTable}>
                <thead><tr><th>{selectedBreakdown.label}</th><th>Fatura</th><th>Açık order</th><th>Aktif pipeline</th><th>Weighted</th><th>Coverage</th></tr></thead>
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
          ) : <div className={styles.empty}>Bu kırılım için sınıflandırılmış kayıt bulunmuyor.</div>}
        </article>
        <InfoNote>{selectedBreakdown?.multiValue ? `${selectedBreakdown.label} çoklu seçim alanıdır. Bir kayıt seçili her kategoride tam tutarıyla yer alabileceği için satır toplamları genel toplamı aşabilir.` : "Belirtilmemiş satırı, ilgili HubSpot alanı boş olan kayıtları görünür tutar."}</InfoNote>
      </section>

      <section>
        <div className={styles.sectionHead}>
          <div><span>05</span><h2>New Business</h2></div>
          <p>{year} gelir ve kazanım takibi</p>
        </div>
        <div className={styles.nbGrid}>
          <article className={styles.nbCard}>
            <span>New Business faturaları</span><strong>{shortMoney(sum(data.newBusiness.invoices))}</strong>
            <button type="button" onClick={() => openRecords("New Business faturaları", data.newBusiness.invoices)}>{data.newBusiness.invoices.length} kaydı gör <ArrowUpRight size={13} /></button>
          </article>
          <article className={styles.nbCard}>
            <span>New Business açık order</span><strong>{shortMoney(sum(data.newBusiness.orders))}</strong>
            <button type="button" onClick={() => openRecords("New Business açık orderları", data.newBusiness.orders)}>{data.newBusiness.orders.length} kaydı gör <ArrowUpRight size={13} /></button>
          </article>
          <article className={styles.nbCard}>
            <span>{year} kazanılan deal</span><strong>{shortMoney(sum(data.newBusiness.sameYearDeals))}</strong>
            <button type="button" onClick={() => openRecords(`${year} kazanılan New Business fırsatları`, data.newBusiness.sameYearDeals)}>{data.newBusiness.sameYearDeals.length} kaydı gör <ArrowUpRight size={13} /></button>
          </article>
          <article className={styles.nbCard}>
            <span>Kazanımlara bağlı gelir</span><strong>{shortMoney(sum(data.newBusiness.sameYearInvoices) + sum(data.newBusiness.sameYearOrders))}</strong>
            <button type="button" onClick={() => openRecords(`${year} kazanımlarına bağlı fatura ve orderlar`, [...data.newBusiness.sameYearInvoices, ...data.newBusiness.sameYearOrders])}>{data.newBusiness.sameYearInvoices.length + data.newBusiness.sameYearOrders.length} kaydı gör <ArrowUpRight size={13} /></button>
          </article>
        </div>
      </section>

      <section id="hygiene">
        <div className={styles.sectionHead}>
          <div><span>06</span><h2>Pipeline hygiene</h2></div>
          <p>Satış ekibinin kontrol etmesi gereken kayıtlar</p>
        </div>
        <div className={styles.hygieneGrid}>
          {data.hygiene.map((group, index) => (
            <article className={styles.hygieneCard} key={group.key}>
              <div className={styles.hygieneIcon}>{index < 2 ? <AlertTriangle size={18} /> : index === 4 ? <CircleDollarSign size={18} /> : <BarChart3 size={18} />}</div>
              <span>{group.label}</span>
              <strong>{group.records.length}</strong>
              <p>{shortMoney(sum(group.records))} pipeline</p>
              <small>{group.description}</small>
              <button type="button" disabled={!group.records.length} onClick={() => openRecords(group.label, group.records)}>Kayıtları incele <ArrowUpRight size={13} /></button>
            </article>
          ))}
        </div>
        <InfoNote>Hygiene göstergeleri performans puanı değildir. Aynı fırsat birden fazla kontrol grubunda yer alabilir; amaç eksik veya gecikmiş kayıtları aksiyona dönüştürmektir.</InfoNote>
      </section>

      <footer>Ereteam · Spark Revenue Command Center · {formatDate(data.generatedAt)}</footer>
      {detail ? <RecordDialog title={detail.title} rows={detail.rows} onClose={() => setDetail(null)} /> : null}
      <SparkChatWidget />
    </main>
  );
}
