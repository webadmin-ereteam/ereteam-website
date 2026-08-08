import Image from "next/image";
import type { SparkData, SparkRecord, SparkSourceState } from "@/lib/spark/types";
import styles from "./spark.module.css";

const money = (n: number, compact = false) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: compact ? "compact" : "standard", maximumFractionDigits: compact ? 1 : 2 }).format(n);
const date = (v?: string) => v ? new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short", year: "numeric", timeZone: "Europe/Istanbul" }).format(new Date(v)) : "-";
const sum = (r: SparkRecord[]) => r.reduce((a, b) => a + b.amount, 0);

function Records({ label, rows, carryover = false }: { label: string; rows: SparkRecord[]; carryover?: boolean }) {
  return <details className={styles.records}><summary><span>{label}</span><span>{rows.length} kayıt ↓</span></summary><div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Kayıt</th><th>Tarih</th><th>Owner</th><th>Tutar</th></tr></thead><tbody>{rows.map(r => <tr key={r.id} className={carryover && r.carryover ? styles.carry : ""}><td><a href={r.url} target="_blank" rel="noreferrer">{r.name}</a>{r.company ? <small> · {r.company}</small> : null}</td><td>{date(r.date)}</td><td>{r.owner || "-"}</td><td>{money(r.amount)}</td></tr>)}</tbody></table></div></details>;
}
function Kpi({ label, value, detail, accent }: { label: string; value: string; detail: string; accent?: string }) { return <div className={styles.card} style={{ "--accent": accent } as React.CSSProperties}><div className={styles.label}>{label}</div><div className={styles.value}>{value}</div><div className={styles.detail}>{detail}</div></div>; }
function Mini({ label, value, rows }: { label: string; value: string; rows?: SparkRecord[] }) { return <div className={styles.mini}><span className={styles.label}>{label}</span><b>{value}</b>{rows ? <Records label="Listeyi aç" rows={rows} /> : null}</div>; }

export default function Dashboard({ data, sources }: { data: SparkData; sources: SparkSourceState }) {
  const coverage = data.ytdInvoice + data.openOrders;
  const coveragePct = data.target ? coverage / data.target * 100 : 0;
  const maxTrend = Math.max(...data.monthlyInvoiceTrend.map(x => x.amount), 1);
  const nb = data.newBusiness;
  return <main className={styles.page}><div className={styles.shell}>
    <header className={styles.hero}><div className={styles.heroTop}><Image src="/logos/ereteam-logo.png" alt="Ereteam" width={180} height={70} className={styles.logo} priority/><span className={styles.live}>Güncel veri</span></div><div className={styles.eyebrow}>Revenue &amp; Growth</div><h1>Spark</h1><div className={styles.meta}>{date(data.periodStart)} – {date(data.periodEnd)} · Son yenileme {date(data.generatedAt)}</div></header>

    <section className={styles.section}><div className={styles.titleRow}><h2>Yönetici özeti</h2><span className={styles.subtle}>Karar için öne çıkan göstergeler</span></div><div className={styles.grid4}>
      <Kpi label="Hedef karşılama · Fatura + sipariş" value={`%${coveragePct.toFixed(1)}`} detail={`${money(coverage,true)} / ${money(data.target,true)}`} accent="#1a9b70" />
      <Kpi label="YTD fatura" value={money(data.ytdInvoice,true)} detail="Şirket para birimi · USD" accent="#388bb7" />
      <Kpi label="Açık sipariş" value={money(data.openOrders,true)} detail={`${data.monthOrders.length} kayıt bu ay bekleniyor`} accent="#f0a52e" />
      <Kpi label="Aktif pipeline" value={money(data.pipeline,true)} detail={`${data.activeDeals} aktif fırsat · ağırlıklı ${money(data.weightedForecast,true)}`} accent="#d22e8b" />
    </div><div className={styles.strip}>
      <div className={styles.stripItem}><span className={styles.label}>Yeni pipeline</span><div className={`${styles.stripValue} ${styles.green}`}>{money(data.weeklyNewPipeline,true)}</div></div>
      <div className={styles.stripItem}><span className={styles.label}>Yeni fırsat</span><div className={styles.stripValue}>{data.weeklyNewDeals.length}</div></div>
      <div className={styles.stripItem}><span className={styles.label}>Closed Won</span><div className={`${styles.stripValue} ${styles.green}`}>{money(sum(data.weeklyWon),true)}</div></div>
      <div className={styles.stripItem}><span className={styles.label}>Closed Lost</span><div className={`${styles.stripValue} ${styles.red}`}>{money(sum(data.weeklyLost),true)}</div></div>
    </div></section>

    <section className={`${styles.section} ${styles.twoCol}`}><div className={styles.panel}><div className={styles.titleRow}><h3>Bütçe hedef takibi</h3><span className={styles.subtle}>Fatura + kesinleşmiş sipariş</span></div><div className={styles.progressLabel}><span>Yıllık revenue coverage</span><span>{money(coverage,true)} / {money(data.target,true)}</span></div><div className={styles.track}><div className={styles.fill} style={{width:`${Math.min(coveragePct,100)}%`}} /></div><div className={styles.insight}><strong>Insight:</strong> Hedefin %{coveragePct.toFixed(1)}’i fatura ve açık siparişlerle karşılanıyor. Kalan fark {money(Math.max(data.target-coverage,0))}.</div></div>
    <div className={styles.panel}><div className={styles.titleRow}><h3>Faturalama özeti</h3><span className={styles.subtle}>Bu ay</span></div><div className={styles.miniGrid}><Mini label="Bu ay faturalandı" value={money(data.monthInvoice,true)} rows={data.monthInvoices}/><Mini label="Bu ay beklenen fatura" value={money(data.monthExpected,true)} rows={data.monthOrders}/></div><div className={styles.insight}><strong>Insight:</strong> Bu ay fatura ve beklenen sipariş toplamı {money(data.monthInvoice+data.monthExpected)}.</div></div></section>

    <section className={styles.section}><div className={styles.titleRow}><h2>Yeni iş performansı</h2><span className={styles.subtle}>2026 YTD · New Business</span></div><div className={styles.panel}><div className={styles.nbGroups}>
      <div className={styles.group}><div className={styles.groupHead}><div><h3>Tüm New Business bağlantılı</h3><p>Önceki yıllarda kazanılan işler dahil</p></div></div><div className={styles.statRow}><Mini label="Fatura" value={money(sum(nb.invoices),true)}/><Mini label="Açık sipariş" value={money(sum(nb.orders),true)}/></div><Records label="Bağlı faturaları görüntüle" rows={nb.invoices} carryover/><Records label="Bağlı siparişleri görüntüle" rows={nb.orders} carryover/><div className={styles.legend}><i/> Önceki yıllarda kapanan deallardan gelen kayıtlar</div></div>
      <div className={styles.group}><div className={styles.groupHead}><div><h3>Bu yıl kazanılan yeni işler</h3><p>Bu yıl Closed Won olan New Business deallar</p></div></div><div className={styles.statRow}><Mini label="Kazanılan deal" value={money(sum(nb.sameYearDeals),true)}/><Mini label="Bağlı fatura" value={money(sum(nb.sameYearInvoices),true)}/><Mini label="Açık sipariş" value={money(sum(nb.sameYearOrders),true)}/></div><Records label="Kazanılan dealları görüntüle" rows={nb.sameYearDeals}/><Records label="Bağlı faturaları görüntüle" rows={nb.sameYearInvoices}/><Records label="Bağlı siparişleri görüntüle" rows={nb.sameYearOrders}/></div>
    </div></div></section>

    <section className={`${styles.section} ${styles.twoCol}`}><div className={styles.panel}><div className={styles.titleRow}><h3>Aylık faturalama</h3><span className={styles.subtle}>YTD trend</span></div><div className={styles.trend}>{data.monthlyInvoiceTrend.map(x=><div className={styles.barItem} key={x.month}><span className={styles.barValue}>{money(x.amount,true)}</span><div className={styles.bar} style={{height:`${Math.max(x.amount/maxTrend*100,2)}%`}}/><span className={styles.barLabel}>{x.month}</span></div>)}</div><Records label="Bu ayın faturalarını görüntüle" rows={data.monthInvoices}/></div>
    <div className={styles.panel}><div className={styles.titleRow}><h3>Haftalık deal hareketi</h3><span className={styles.subtle}>Son 7 gün</span></div><Records label="Yeni fırsatları görüntüle" rows={data.weeklyNewDeals}/><Records label="Won dealları görüntüle" rows={data.weeklyWon}/><Records label="Lost dealları görüntüle" rows={data.weeklyLost}/><div className={styles.insight}><strong>Insight:</strong> Dönemde {data.weeklyNewDeals.length} yeni fırsat açıldı; {data.weeklyWon.length} won, {data.weeklyLost.length} lost kaydı oluştu.</div></div></section>

    <section className={styles.section}><div className={styles.panel}><div className={styles.titleRow}><h3>Lead generation</h3><span className={styles.subtle}>Toplu + Duo sequences</span></div>{sources.amplemarket.ok ? <><div className={styles.lead}><Mini label="Gönderilen" value={String(data.leadGeneration.sent ?? 0)}/><Mini label="Toplu" value={String(data.leadGeneration.bulk ?? 0)}/><Mini label="Duo" value={String(data.leadGeneration.duo ?? 0)}/><Mini label="Yanıt" value={String(data.leadGeneration.replies ?? 0)}/><Mini label="Pozitif" value={String(data.leadGeneration.positive ?? 0)}/></div><h3 className="mt-6">Bu hafta ayarlanan toplantılar</h3>{data.leadGeneration.meetings.length ? data.leadGeneration.meetings.map((m,i)=><div className={styles.meeting} key={`${m.person}-${i}`}><b>{m.person}</b><span>{m.company}</span><span>{date(m.bookedAt)}</span></div>) : <div className={styles.empty}>Bu dönemde ayarlanan toplantı bulunmuyor.</div>}</> : <div className={styles.empty}>Amplemarket bağlantısı yapılandırıldığında tam sequence ve toplantı verileri burada gösterilecek.</div>}</div></section>
    <p className={styles.footerNote}>Ereteam iç kullanımı · Kaynaklar: HubSpot, Sales / Bütçe_Hedef{sources.amplemarket.ok ? ", Amplemarket" : ""}</p>
  </div></main>;
}
