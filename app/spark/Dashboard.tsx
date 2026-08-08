"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type {
  SparkData,
  SparkRecord,
  SparkSourceState,
} from "@/lib/spark/types";
import styles from "./spark.module.css";

const exactMoney = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
const shortMoney = (n: number) => {
  const sign = n < 0 ? "-" : "";
  const value = Math.abs(n);
  if (value >= 1_000_000) return `${sign}$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000)
    return `${sign}$${new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value / 1_000)}K`;
  return `${sign}$${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)}`;
};
const date = (value?: string) =>
  value
    ? new Intl.DateTimeFormat("tr-TR", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Europe/Istanbul",
      }).format(new Date(value))
    : "-";
const dateTime = (value?: string) =>
  value
    ? new Intl.DateTimeFormat("tr-TR", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Istanbul",
      }).format(new Date(value))
    : "-";
const monthName = (value: string) =>
  new Intl.DateTimeFormat("tr-TR", {
    month: "long",
    timeZone: "Europe/Istanbul",
  }).format(new Date(value));
const sum = (rows: SparkRecord[]) =>
  rows.reduce((total, row) => total + row.amount, 0);
const pct = (part: number, whole: number) => (whole ? (part / whole) * 100 : 0);
const ownerName = (value: string) =>
  value.includes("@")
    ? value
        .split("@")[0]
        .split(/[._-]/)
        .map((part) =>
          part ? part[0].toLocaleUpperCase("tr-TR") + part.slice(1) : "",
        )
        .join(" ")
    : value;

function RecordTable({
  rows,
  carryover = false,
}: {
  rows: SparkRecord[];
  carryover?: boolean;
}) {
  return (
    <div className={styles.tableWrap}>
      <table>
        <thead>
          <tr>
            <th>Kayıt</th>
            <th>Şirket</th>
            <th>Tarih</th>
            <th>Tutar</th>
            <th>Owner</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={carryover && row.carryover ? styles.carryover : ""}
            >
              <td>
                <a href={row.url} target="_blank" rel="noreferrer">
                  {row.name}
                </a>
              </td>
              <td>{row.company || "-"}</td>
              <td>{date(row.date)}</td>
              <td>
                <b>{exactMoney(row.amount)}</b>
              </td>
              <td>{row.owner || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.metric}>
      <b>{value}</b>
      <small>{label}</small>
    </div>
  );
}

export default function Dashboard({
  data,
  sources,
}: {
  data: SparkData;
  sources: SparkSourceState;
}) {
  const router = useRouter();
  const [dealPanel, setDealPanel] = useState<"new" | "won" | "lost" | null>(
    null,
  );
  const [billingPanel, setBillingPanel] = useState<"invoice" | "order" | null>(
    null,
  );
  const [newBusinessPanel, setNewBusinessPanel] = useState<
    | "allInvoices"
    | "allOrders"
    | "sameYearDeals"
    | "sameYearInvoices"
    | "sameYearOrders"
    | null
  >(null);
  const [monthListOpen, setMonthListOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState("");
  const coverage = data.ytdInvoice + data.openOrders;
  const coveragePct = pct(coverage, data.target);
  const invoicePct = pct(data.ytdInvoice, data.target);
  const orderPct = pct(data.openOrders, data.target);
  const remaining = Math.max(data.target - coverage, 0);
  const won = sum(data.weeklyWon);
  const lost = sum(data.weeklyLost);
  const net = won - lost;
  const maxTrend = Math.max(
    ...data.monthlyInvoiceTrend.map((item) => item.amount),
    1,
  );
  const positiveRate = data.leadGeneration.replies
    ? pct(data.leadGeneration.positive ?? 0, data.leadGeneration.replies)
    : 0;
  const owners = data.leadGeneration.owners ?? [];
  const nb = data.newBusiness;
  const currentMonth = monthName(data.periodEnd);
  const dealRows =
    dealPanel === "new"
      ? data.weeklyNewDeals
      : dealPanel === "won"
        ? data.weeklyWon
        : data.weeklyLost;
  const dealLabel =
    dealPanel === "new"
      ? "Bu hafta açılan fırsatlar"
      : dealPanel === "won"
        ? "Bu hafta kazanılan deallar"
        : "Bu hafta kaybedilen deallar";
  const newBusinessLists = {
    allInvoices: {
      label: "Tüm New Business faturaları",
      rows: nb.invoices,
      carryover: true,
    },
    allOrders: {
      label: "Tüm New Business açık siparişleri",
      rows: nb.orders,
      carryover: true,
    },
    sameYearDeals: {
      label: "2026'da kazanılan New Business deallar",
      rows: nb.sameYearDeals,
      carryover: false,
    },
    sameYearInvoices: {
      label: "2026'da kazanılan yeni işlere bağlı faturalar",
      rows: nb.sameYearInvoices,
      carryover: false,
    },
    sameYearOrders: {
      label: "2026'da kazanılan yeni işlere bağlı açık siparişler",
      rows: nb.sameYearOrders,
      carryover: false,
    },
  };
  const activeNewBusinessList = newBusinessPanel
    ? newBusinessLists[newBusinessPanel]
    : null;

  const refreshDashboard = async () => {
    if (refreshing) return;
    setRefreshing(true);
    setRefreshMessage("");
    try {
      const response = await fetch("/api/spark/refresh", { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Yenileme başarısız.");
      setRefreshMessage(
        result.refreshed ? "Güncellendi" : result.message || "Zaten güncel",
      );
      router.refresh();
    } catch {
      setRefreshMessage("Şu anda yenilenemedi");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.logoBox}>
          <Image
            src="/logos/ereteam-logo.png"
            alt="Ereteam"
            width={150}
            height={110}
            priority
          />
        </div>
        <div className={styles.brand}>
          <div className={styles.eyebrow}>Ereteam Spark</div>
          <h1>Revenue &amp; Growth</h1>
          <div className={styles.period}>
            {date(data.periodStart)}–{date(data.periodEnd)} · Haftalık yönetim
            görünümü
          </div>
        </div>
        <div className={styles.refreshArea}>
          <div className={styles.status}>
            <span /> Son güncelleme · {dateTime(data.generatedAt)}
          </div>
          <button
            className={styles.refreshButton}
            type="button"
            onClick={refreshDashboard}
            disabled={refreshing}
          >
            {refreshing ? "Yenileniyor…" : "Şimdi yenile"}
          </button>
          {refreshMessage ? (
            <small className={styles.refreshMessage} aria-live="polite">
              {refreshMessage}
            </small>
          ) : null}
        </div>
      </header>

      <section>
        <div className={styles.sectionTitle}>
          <h2>Yönetici Özeti</h2>
          <span>30 saniyelik görünüm</span>
        </div>
        <div className={styles.summary}>
          <article
            className={`${styles.card} ${styles.summaryCard} ${styles.summaryGreen}`}
          >
            <h3>
              <i>↗</i> Revenue durumu
            </h3>
            <ul>
              <li>
                Fatura + açık sipariş toplamı <b>{shortMoney(coverage)}</b>;
                yıllık hedefin <b>%{coveragePct.toFixed(2)}</b>&apos;si görünür
                durumda.
              </li>
              <li>
                YTD fatura <b>{shortMoney(data.ytdInvoice)}</b>, açık sipariş{" "}
                <b>{shortMoney(data.openOrders)}</b>.
              </li>
              <li>
                Hedefe kalan fark <b>{exactMoney(remaining)}</b>.
              </li>
            </ul>
          </article>
          <article
            className={`${styles.card} ${styles.summaryCard} ${styles.summaryRed}`}
          >
            <h3>
              <i>!</i> Haftalık hareket
            </h3>
            <ul>
              <li>
                <b>{shortMoney(data.weeklyNewPipeline)}</b> değerinde{" "}
                {data.weeklyNewDeals.length} yeni fırsat açıldı.
              </li>
              <li>
                <b>{shortMoney(won)}</b> Won&apos;a karşılık{" "}
                <b>{shortMoney(lost)}</b> Lost gerçekleşti.
              </li>
              <li>
                Haftalık net kapanış etkisi <b>{shortMoney(net)}</b>.
              </li>
            </ul>
          </article>
          <article
            className={`${styles.card} ${styles.summaryCard} ${styles.summaryBlue}`}
          >
            <h3>
              <i>→</i> Forecast görünümü
            </h3>
            <ul>
              <li>
                Aktif pipeline <b>{shortMoney(data.pipeline)}</b>; ağırlıklı
                forecast <b>{shortMoney(data.weightedForecast)}</b>.
              </li>
              <li>
                Weighted forecast, kalan farkın{" "}
                <b>%{pct(data.weightedForecast, remaining).toFixed(1)}</b>
                &apos;ini karşılıyor.
              </li>
              <li>
                Pipeline&apos;da <b>{data.activeDeals}</b> aktif opportunity
                bulunuyor.
              </li>
            </ul>
          </article>
        </div>
      </section>

      <section>
        <div className={styles.sectionTitle}>
          <h2>Ana Göstergeler</h2>
          <span>YTD ve mevcut durum</span>
        </div>
        <div className={styles.kpis}>
          <article
            className={`${styles.card} ${styles.kpi} ${styles.kpiGreen}`}
          >
            <div className={styles.label}>Yıl hedefi · Fatura + sipariş</div>
            <div className={styles.value}>%{coveragePct.toFixed(2)}</div>
            <div className={styles.sub}>
              {shortMoney(coverage)} / {shortMoney(data.target)}
            </div>
            <span className={styles.chip}>Lisans + Servis</span>
          </article>
          <article className={`${styles.card} ${styles.kpi} ${styles.kpiBlue}`}>
            <div className={styles.label}>Toplam pipeline</div>
            <div className={styles.value}>{shortMoney(data.pipeline)}</div>
            <div className={styles.sub}>
              {data.activeDeals} aktif opportunity
            </div>
            <span className={styles.chip}>Canlı HubSpot</span>
          </article>
          <article
            className={`${styles.card} ${styles.kpi} ${styles.kpiViolet}`}
          >
            <div className={styles.label}>YTD fatura</div>
            <div className={styles.value}>{shortMoney(data.ytdInvoice)}</div>
            <div className={styles.sub}>Şirket para birimi · USD</div>
            <span className={styles.chip}>{exactMoney(data.ytdInvoice)}</span>
          </article>
          <article
            className={`${styles.card} ${styles.kpi} ${styles.kpiAmber}`}
          >
            <div className={styles.label}>2026 açık sipariş</div>
            <div className={styles.value}>{shortMoney(data.openOrders)}</div>
            <div className={styles.sub}>Ana para birimi · USD</div>
            <span className={styles.chip}>{exactMoney(data.openOrders)}</span>
          </article>
        </div>
      </section>

      <section className={`${styles.card} ${styles.delta}`}>
        <div>
          <span className={styles.label}>Yeni pipeline</span>
          <strong className={styles.deltaGreen}>
            {shortMoney(data.weeklyNewPipeline)}
          </strong>
        </div>
        <div>
          <span className={styles.label}>Yeni fırsat</span>
          <div className={styles.metricLine}>
            <strong>{data.weeklyNewDeals.length}</strong>
            <button
              onClick={() => setDealPanel(dealPanel === "new" ? null : "new")}
            >
              Liste
            </button>
          </div>
        </div>
        <div>
          <span className={styles.label}>Closed Won</span>
          <div className={styles.metricLine}>
            <strong className={styles.deltaGreen}>{shortMoney(won)}</strong>
            <button
              onClick={() => setDealPanel(dealPanel === "won" ? null : "won")}
            >
              {data.weeklyWon.length} deal
            </button>
          </div>
        </div>
        <div>
          <span className={styles.label}>Closed Lost</span>
          <div className={styles.metricLine}>
            <strong className={styles.deltaRed}>{shortMoney(lost)}</strong>
            <button
              onClick={() => setDealPanel(dealPanel === "lost" ? null : "lost")}
            >
              {data.weeklyLost.length} deal
            </button>
          </div>
        </div>
      </section>
      {dealPanel ? (
        <section className={`${styles.card} ${styles.dealPanel}`}>
          <div className={styles.cardHead}>
            <h3>{dealLabel}</h3>
            <button onClick={() => setDealPanel(null)}>Kapat ×</button>
          </div>
          <RecordTable rows={dealRows} />
        </section>
      ) : null}

      <section className={styles.twoCol}>
        <article className={`${styles.card} ${styles.pad}`}>
          <div className={styles.cardHead}>
            <h3>Hedef görünümü</h3>
            <small>Fatura + kesinleşmiş sipariş</small>
          </div>
          <div className={styles.progressMeta}>
            <b>Yıllık revenue coverage</b>
            <span>%{coveragePct.toFixed(2)}</span>
          </div>
          <div className={styles.track}>
            <div
              className={styles.fill}
              style={{ width: `${Math.min(coveragePct, 100)}%` }}
            />
          </div>
          <div className={styles.flow}>
            <div>
              <small>Fatura payı</small>
              <b>%{invoicePct.toFixed(2)}</b>
            </div>
            <div>
              <small>Açık sipariş payı</small>
              <b>%{orderPct.toFixed(2)}</b>
            </div>
            <div>
              <small>Kalan</small>
              <b className={styles.red}>
                %{Math.max(100 - coveragePct, 0).toFixed(2)}
              </b>
            </div>
          </div>
          <div className={styles.insight}>
            <b>AI Insight:</b> {exactMoney(data.target)} yıllık hedefe kalan
            fark {exactMoney(remaining)}.
          </div>
        </article>
        <article className={`${styles.card} ${styles.pad}`}>
          <div className={styles.cardHead}>
            <h3>Faturalama özeti</h3>
            <small>{currentMonth} 2026</small>
          </div>
          <div className={styles.billingLayout}>
            <div className={styles.billingPrimary}>
              <div
                className={`${styles.billingMetric} ${styles.billingActual}`}
              >
                <div className={styles.billingMetricHead}>
                  <small>Bu ay faturalandı</small>
                  <span>Gerçekleşen</span>
                </div>
                <b>{shortMoney(data.monthInvoice)}</b>
                <em>{exactMoney(data.monthInvoice)}</em>
                <button
                  className={styles.recordCta}
                  aria-expanded={billingPanel === "invoice"}
                  onClick={() =>
                    setBillingPanel(
                      billingPanel === "invoice" ? null : "invoice",
                    )
                  }
                >
                  <span>{data.monthInvoices.length} fatura</span>
                  <span>
                    {billingPanel === "invoice"
                      ? "Listeyi kapat ↑"
                      : "Listeyi aç →"}
                  </span>
                </button>
              </div>
              <div
                className={`${styles.billingMetric} ${styles.billingExpected}`}
              >
                <div className={styles.billingMetricHead}>
                  <small>Bu ay beklenen fatura</small>
                  <span>Planlanan</span>
                </div>
                <b>{shortMoney(data.monthExpected)}</b>
                <em>{exactMoney(data.monthExpected)}</em>
                <button
                  className={styles.recordCta}
                  aria-expanded={billingPanel === "order"}
                  onClick={() =>
                    setBillingPanel(billingPanel === "order" ? null : "order")
                  }
                >
                  <span>{data.monthOrders.length} order</span>
                  <span>
                    {billingPanel === "order"
                      ? "Listeyi kapat ↑"
                      : "Listeyi aç →"}
                  </span>
                </button>
              </div>
            </div>
            <aside className={styles.billingRatios}>
              <small>Bu ayın payı</small>
              <div>
                <span>YTD fatura içinde</span>
                <b>%{pct(data.monthInvoice, data.ytdInvoice).toFixed(2)}</b>
              </div>
              <div>
                <span>Yıllık hedef içinde</span>
                <b>%{pct(data.monthInvoice, data.target).toFixed(2)}</b>
              </div>
            </aside>
          </div>
          <div className={styles.insight}>
            <b>AI Insight:</b> {currentMonth} tarihli {data.monthOrders.length}{" "}
            açık orderdan {exactMoney(data.monthExpected)} fatura bekleniyor.
            Tamamı kesilirse ay sonu toplamı{" "}
            {exactMoney(data.monthInvoice + data.monthExpected)} olur.
          </div>
          {billingPanel ? (
            <div className={styles.inlinePanel}>
              <div className={styles.cardHead}>
                <h3>
                  {billingPanel === "invoice"
                    ? `${currentMonth} faturaları`
                    : `${currentMonth} açık orderları`}
                </h3>
                <button
                  className={styles.lightButton}
                  onClick={() => setBillingPanel(null)}
                >
                  Kapat ×
                </button>
              </div>
              <RecordTable
                rows={
                  billingPanel === "invoice"
                    ? data.monthInvoices
                    : data.monthOrders
                }
              />
            </div>
          ) : null}
        </article>
      </section>

      <section className={`${styles.card} ${styles.pad}`}>
        <div className={styles.cardHead}>
          <h3>New Business performansı</h3>
          <small>2026 YTD</small>
        </div>
        <div className={styles.nbOverview}>
          <article className={`${styles.nbGroup} ${styles.nbTotal}`}>
            <div className={styles.nbHead}>
              <div>
                <h4>Tüm New Business kaynakları</h4>
                <p>Dealın kapanış yılından bağımsız, 2026 gelir görünümü</p>
              </div>
              <span>GENEL</span>
            </div>
            <div className={styles.nbMetricsTwo}>
              <div>
                <small>Fatura</small>
                <b>{shortMoney(sum(nb.invoices))}</b>
                <em>{exactMoney(sum(nb.invoices))}</em>
                <button
                  className={styles.nbRecordButton}
                  aria-expanded={newBusinessPanel === "allInvoices"}
                  onClick={() =>
                    setNewBusinessPanel(
                      newBusinessPanel === "allInvoices" ? null : "allInvoices",
                    )
                  }
                >
                  <span>{nb.invoices.length} kayıt</span>
                  <span>Görüntüle →</span>
                </button>
              </div>
              <div>
                <small>Açık sipariş</small>
                <b>{shortMoney(sum(nb.orders))}</b>
                <em>{exactMoney(sum(nb.orders))}</em>
                <button
                  className={styles.nbRecordButton}
                  aria-expanded={newBusinessPanel === "allOrders"}
                  onClick={() =>
                    setNewBusinessPanel(
                      newBusinessPanel === "allOrders" ? null : "allOrders",
                    )
                  }
                >
                  <span>{nb.orders.length} kayıt</span>
                  <span>Görüntüle →</span>
                </button>
              </div>
            </div>
          </article>
          <article className={`${styles.nbGroup} ${styles.nbCurrent}`}>
            <div className={styles.nbHead}>
              <div>
                <h4>Bu yıl kazanılan yeni işler</h4>
                <p>2026 içinde Closed Won olan New Business deallar</p>
              </div>
              <span>2026</span>
            </div>
            <div className={styles.nbMetricsThree}>
              <div>
                <small>Kazanılan deal</small>
                <b>{shortMoney(sum(nb.sameYearDeals))}</b>
                <em>{exactMoney(sum(nb.sameYearDeals))}</em>
                <button
                  className={styles.nbRecordButton}
                  aria-expanded={newBusinessPanel === "sameYearDeals"}
                  onClick={() =>
                    setNewBusinessPanel(
                      newBusinessPanel === "sameYearDeals"
                        ? null
                        : "sameYearDeals",
                    )
                  }
                >
                  <span>{nb.sameYearDeals.length} kayıt</span>
                  <span>Görüntüle →</span>
                </button>
              </div>
              <div>
                <small>Bağlı fatura</small>
                <b>{shortMoney(sum(nb.sameYearInvoices))}</b>
                <em>{exactMoney(sum(nb.sameYearInvoices))}</em>
                <button
                  className={styles.nbRecordButton}
                  aria-expanded={newBusinessPanel === "sameYearInvoices"}
                  onClick={() =>
                    setNewBusinessPanel(
                      newBusinessPanel === "sameYearInvoices"
                        ? null
                        : "sameYearInvoices",
                    )
                  }
                >
                  <span>{nb.sameYearInvoices.length} kayıt</span>
                  <span>Görüntüle →</span>
                </button>
              </div>
              <div>
                <small>Açık sipariş</small>
                <b>{shortMoney(sum(nb.sameYearOrders))}</b>
                <em>{exactMoney(sum(nb.sameYearOrders))}</em>
                <button
                  className={styles.nbRecordButton}
                  aria-expanded={newBusinessPanel === "sameYearOrders"}
                  onClick={() =>
                    setNewBusinessPanel(
                      newBusinessPanel === "sameYearOrders"
                        ? null
                        : "sameYearOrders",
                    )
                  }
                >
                  <span>{nb.sameYearOrders.length} kayıt</span>
                  <span>Görüntüle →</span>
                </button>
              </div>
            </div>
          </article>
        </div>
        {activeNewBusinessList ? (
          <div className={`${styles.inlinePanel} ${styles.nbInlinePanel}`}>
            <div className={styles.cardHead}>
              <h3>{activeNewBusinessList.label}</h3>
              <button
                className={styles.lightButton}
                onClick={() => setNewBusinessPanel(null)}
              >
                Kapat ×
              </button>
            </div>
            <RecordTable
              rows={activeNewBusinessList.rows}
              carryover={activeNewBusinessList.carryover}
            />
            {activeNewBusinessList.carryover ? (
              <div className={styles.legend}>
                Önceki yıllarda kapanan deallardan gelen kayıtlar farklı renkle
                gösterilir.
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className={`${styles.card} ${styles.pad}`}>
        <div className={styles.cardHead}>
          <h3>Aylık faturalama trendi</h3>
          <button
            className={styles.lightButton}
            onClick={() => setMonthListOpen(!monthListOpen)}
          >
            {currentMonth} listesini {monthListOpen ? "kapat" : "aç"}
          </button>
        </div>
        <div className={styles.chart}>
          {data.monthlyInvoiceTrend.map((item) => (
            <div className={styles.barCol} key={item.month}>
              <span>{shortMoney(item.amount)}</span>
              <div
                style={{
                  height: `${Math.max((item.amount / maxTrend) * 100, 2)}%`,
                }}
              />
              <small>{item.month}</small>
            </div>
          ))}
        </div>
        {monthListOpen ? (
          <div className={styles.inlinePanel}>
            <RecordTable rows={data.monthInvoices} />
          </div>
        ) : null}
      </section>

      <section className={`${styles.card} ${styles.pad}`}>
        <div className={styles.cardHead}>
          <h3>Forecast</h3>
          <small>Aktif pipeline</small>
        </div>
        {[
          ["Weighted forecast", data.weightedForecast, "green"],
          ["Toplam aktif pipeline", data.pipeline, "blue"],
          ["Hedefe kalan fark", remaining, "amber"],
        ].map(([label, value, color]) => (
          <div className={styles.progressRow} key={String(label)}>
            <div className={styles.progressMeta}>
              <b>{label}</b>
              <span>{shortMoney(Number(value))}</span>
            </div>
            <div className={styles.track}>
              <div
                className={`${styles.forecastFill} ${styles[String(color)]}`}
                style={{
                  width: `${Math.min(pct(Number(value), Math.max(data.pipeline, remaining, 1)), 100)}%`,
                }}
              />
            </div>
          </div>
        ))}
        <div className={styles.insight}>
          <b>AI Insight:</b> Weighted forecast, hedefe kalan farkın %
          {pct(data.weightedForecast, remaining).toFixed(1)}&apos;ini
          karşılıyor.
        </div>
      </section>

      <section className={`${styles.card} ${styles.pad}`}>
        <div className={styles.cardHead}>
          <h3>Lead generation</h3>
          <small>Amplemarket funnel · son 7 gün</small>
        </div>
        {sources.amplemarket.ok ? (
          <>
            <div className={styles.metricStrip}>
              <Metric
                label="Sent"
                value={String(data.leadGeneration.sent ?? 0)}
              />
              <Metric
                label="Toplu sequence"
                value={String(data.leadGeneration.bulk ?? 0)}
              />
              <Metric
                label="Duo sequence"
                value={String(data.leadGeneration.duo ?? 0)}
              />
              <Metric
                label="Reply"
                value={String(data.leadGeneration.replies ?? 0)}
              />
              <Metric
                label="Positive"
                value={String(data.leadGeneration.positive ?? 0)}
              />
              <Metric
                label="Meeting"
                value={String(data.leadGeneration.meetings.length)}
              />
            </div>
            <div className={styles.cardHead}>
              <h3>Kişi bazında gönderimler</h3>
              <small>Toplu + Duo</small>
            </div>
            {owners.length ? (
              <div className={styles.tableWrap}>
                <table>
                  <thead>
                    <tr>
                      <th>Kişi</th>
                      <th>Toplu sequence</th>
                      <th>Duo sequence</th>
                      <th>Toplam</th>
                    </tr>
                  </thead>
                  <tbody>
                    {owners.map((owner) => (
                      <tr key={owner.owner}>
                        <td>
                          <b>{ownerName(owner.owner)}</b>
                        </td>
                        <td>{owner.bulk}</td>
                        <td>{owner.duo}</td>
                        <td>
                          <b>{owner.total}</b>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td>
                        <b>Toplam</b>
                      </td>
                      <td>
                        <b>{data.leadGeneration.bulk ?? 0}</b>
                      </td>
                      <td>
                        <b>{data.leadGeneration.duo ?? 0}</b>
                      </td>
                      <td>
                        <b>{data.leadGeneration.sent ?? 0}</b>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.empty}>
                Webhook etkinleştirildikten sonra oluşan haftalık gönderim
                bulunmuyor.
              </div>
            )}
            <div className={styles.progressRow}>
              <div className={styles.progressMeta}>
                <b>Positive / reply</b>
                <span>%{positiveRate.toFixed(1)}</span>
              </div>
              <div className={styles.track}>
                <div
                  className={`${styles.forecastFill} ${styles.green}`}
                  style={{ width: `${Math.min(positiveRate, 100)}%` }}
                />
              </div>
            </div>
            <div className={styles.insight}>
              <b>AI Insight:</b> {data.leadGeneration.positive ?? 0} olumlu
              yanıt, {data.leadGeneration.replies ?? 0} toplam yanıtın %
              {positiveRate.toFixed(1)}&apos;ini oluşturuyor.
            </div>
            <div className={styles.cardHead}>
              <h3>Bu hafta ayarlanan toplantılar</h3>
              <small>Ayarlanma tarihi esas alınır</small>
            </div>
            {data.leadGeneration.meetings.length ? (
              <div className={styles.tableWrap}>
                <table>
                  <thead>
                    <tr>
                      <th>Kişi</th>
                      <th>Şirket</th>
                      <th>Owner</th>
                      <th>Ayarlanma tarihi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.leadGeneration.meetings.map((meeting, index) => (
                      <tr key={`${meeting.person}-${index}`}>
                        <td>
                          <b>{meeting.person}</b>
                        </td>
                        <td>{meeting.company}</td>
                        <td>
                          {meeting.owner ? ownerName(meeting.owner) : "-"}
                        </td>
                        <td>{date(meeting.bookedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.empty}>
                Amplemarket&apos;te bu hafta yeni ayarlanan toplantı bulunmuyor.
              </div>
            )}
          </>
        ) : (
          <div className={styles.empty}>
            Amplemarket bağlantısı şu anda veri sağlayamıyor.
          </div>
        )}
      </section>

      <footer>
        Ereteam · Revenue &amp; Growth · Spark Dashboard ·{" "}
        {date(data.generatedAt)}
      </footer>
    </main>
  );
}
