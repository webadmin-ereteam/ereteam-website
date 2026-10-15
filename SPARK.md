# Spark Revenue Dashboard

Spark is an internal, password-protected revenue dashboard mounted at `/spark`.
Its Turkish dashboard title is `Gelir ve Pipeline Raporu`.
It is intentionally separate from the Presales portal. Spark changes belong in
this file; do not use `PRESALES.md` as Spark documentation.

## Routes

- `/spark` — latest password-protected dashboard; `?year=YYYY` opens an available planning year or annual archive
- `/spark/login` — shared internal login
- `/api/cron/spark` — Vercel Cron endpoint
- `/api/spark/refresh` — Spark-session-protected manual refresh with a ten-minute cooldown
- `/api/spark/hygiene` — Spark-session-protected CRM enum catalog and allowlisted record updates
- `/api/spark/chat` — Spark-session-protected, salt-okunur canlı HubSpot veri asistanı
- `/api/spark/amplemarket/webhook` — legacy authenticated Amplemarket meeting receiver; not used by the dashboard

## Schedule and reporting window

Vercel Cron calls the production endpoint every day at `06:00 UTC` and `11:00 UTC`,
which are `09:00` and `14:00 Europe/Istanbul`. Each report covers the current Istanbul calendar day
and the seven preceding calendar days through `generatedAt`. Annual dashboard populations use
the complete reporting-year date range; weekly movement uses the generation timestamp as its cutoff. On Vercel Hobby, the invocation can
occur at any time within each scheduled hour. Environment-variable changes only
reach a new deployment, so redeploy after changing a secret.
An additional free-plan-compatible annual cron runs on 31 December at `20:00 UTC`.
Because Hobby scheduling precision is hourly, it runs between `23:00` and `23:59
Europe/Istanbul`, before the Istanbul year boundary. This is the final automatic
snapshot opportunity for that reporting year; no manual year-end refresh is required.

## Sources

- HubSpot API: deals, invoices, orders, associations, owners and drill-down links
- Vercel environment: reporting-year `Lisans + Servis` annual target

The management report includes guaranteed and weighted forecast target coverage,
current-month and current-quarter summaries, a visual 12-month operating view,
an active-pipeline stage funnel, country/vendor/revenue-type/domain composition
charts, a current-year versus carry-over New Business split, and an action-oriented
CRM-hygiene section. Every amount in these sections has a HubSpot record
drill-down. Activity, email and calendar metrics are intentionally excluded because
their integrations are not reliable enough to be management-report sources.
The executive overview has three combinable presentation-only filters: country
(`Tümü / TR / US`), Ereteam domain (`Tümü / DC&AI / EP / IM`), and revenue type
(`Tümü / Lisans / Servis`). Every dimension defaults to `Tümü`. Selections filter
only overview invoices, open orders, active and weighted pipeline, and weekly pipeline
movement; all sections below the overview remain unfiltered. `Lisans` contains
`License` and `SNS`; `Servis` contains every other revenue type. Because revenue type
is multi-select, a mixed record can match both groups. The annual target is company-wide,
so filtered views show the selected segment's contribution against that company target
and never invent a segment target. Active selections also show a persistent combined
scope badge beside the overview heading, so filtered values cannot be mistaken for the
default company-wide view. Persisted records carry country, domain, and all selected
revenue types; breakdown membership is retained as a fallback for older annual records.
Every executive metric card and the target-coverage card opens the shared record dialog
with the currently selected country/domain/revenue scope. These dialogs retain the global
search, sorting, country summary, HubSpot links, and Excel export behavior. Dialog
totals always match the headline formula: amount dialogs sum `amount`; weighted dialogs
sum `weightedAmount`; forecast dialogs (forecast coverage and target coverage) sum
invoice amounts + open-order amounts + deal weighted amounts, with the unweighted
pipeline total shown separately. Every dialog table adds a sortable contribution column
for weighted and forecast modes, and the Excel export includes the same contribution
column plus the calculation kind, with a scope-derived filename. The section navigation remains visible while scrolling and marks the currently active
report section.

The dashboard does not include an admin screen. The current snapshot and annual
snapshot aliases are persisted in PostgreSQL. Every successful refresh fetches HubSpot
once, derives both the current Istanbul year and the following planning year, and
atomically writes `current`, `year:<currentYear>`, and `year:<nextYear>`. Opening the
report only reads a snapshot and never queries HubSpot or changes `generatedAt`.
Deployments and platform cache misses therefore do not trigger data collection.
Cron and an explicit manual refresh are the only paths that collect HubSpot data
and replace the persisted snapshot. A non-expiring platform read cache sits in front
of PostgreSQL for fast page loads; a cache miss falls back only to the persisted
snapshot, never to HubSpot. The following year is labeled `Planlama` and remains mutable:
its future-dated invoices, open orders, active deals, monthly plan, funnel, breakdowns,
and hygiene checks update on every normal refresh. If its target environment variables
are not defined yet, monetary plan values remain visible but target percentages and
progress bars are replaced with `Hedef henüz tanımlanmadı`. The live year is derived
from the actual Istanbul calendar year, not from the persisted snapshot: at the year
boundary the planning year immediately becomes `Güncel` and the preceding year becomes
`Arşiv`, even before the first new-year refresh rewrites `current`. The global
report-year selector defaults to the live year and lists all available aliases. Historical
views are explicitly marked and read-only: stale warnings, manual refresh, live chat, and
CRM-hygiene writes are disabled, while record drill-downs and Excel export remain available.
Planning views allow refresh and hygiene correction but hide live chat because relative
chat periods refer to the actual current year. HubSpot links can show a record's current
state rather than its frozen snapshot state. Source health is stored with each snapshot;
a budget-source failure or a not-yet-defined target is shown as a distinct amber banner
instead of being silently presented as target zero. The header also shows the exact Istanbul update time. Authenticated users can
request a quiet manual refresh; requests made within ten minutes of the latest
generated report reuse the current snapshot instead of calling the sources. A
ten-minute distributed refresh lease in the snapshot table additionally guarantees
that only one collection runs at a time across cron deliveries, manual requests, and
separate serverless instances; a concurrent attempt returns an explicit
"already running" error instead of duplicating HubSpot reads. A refresh superseded by
a newer concurrent run reports the newer stored snapshot, never its own older result.
The browser does not poll or refresh Spark on an interval, but the stale-data check
re-evaluates every minute while a mutable report stays open. Data collection runs
only from the `09:00` and `14:00 Europe/Istanbul` cron jobs or an explicit manual
refresh. After a 75-minute delivery grace period, the dashboard shows a prominent
stale-data warning if the latest successful snapshot predates the most recently
expected cron run. A successful manual refresh updates the displayed server data
immediately. If the Spark session is no longer valid, the manual refresh sends the
user to the Spark login page instead of displaying a raw `Unauthorized` response.
Active Spark page requests renew the seven-day signed Spark session so an actively
used dashboard does not unexpectedly lose manual-refresh authorization. Spark session
tokens carry a `spark` audience claim and Spark routes reject tokens without it, so a
Presales session cookie replayed as `spark_session` never grants Spark access. The
Spark login preserves the full `?year=` return target across session expiry.
The header provides a temporary privacy view that masks every amount, percentage,
and business record count. While values are hidden, record drill-downs, Excel export,
manual refresh, and the live data assistant are disabled, and every data-derived
geometry (coverage progress bar, target scale, donut chart, monthly composition, and
funnel meters) is flattened so proportions cannot be inferred from shapes. A prominent red status
banner makes the active state clear. The setting does not persist across a page reload,
and it changes presentation only; normal-mode figures and persisted source data remain
unchanged.

The dashboard includes a password-protected Revenue Data Assistant. Groq is used
only to translate the natural-language question into a constrained query plan.
The server then queries HubSpot live and renders the result deterministically:
single-value questions return a metric card, while record/detail questions return
a table with HubSpot links. Record-table answers can be exported as an Excel
workbook from the chat panel; the export contains the displayed rows (the
assistant response limit is 100 records), the shown column labels, a HubSpot URL
column, and a scope-derived `spark-chat-…` filename. The spreadsheet library loads
only when the export is requested, matching the record-dialog export behavior.
HubSpot result rows are not sent back to Groq for answer
generation. The last five questions and compact result metadata are sent as
conversation context so follow-up questions work; detailed record rows are excluded.
The planner uses Groq strict JSON Schema output with automatic fallback
(`gpt-oss-120b`, then `gpt-oss-20b`) when a model is rate-limited or unavailable,
and receives only question-relevant property catalog entries. Strict constrained
output prevents malformed or schema-incomplete plans. A known Groq shape drift that
wraps the `properties` array in an `items` object is normalized only before the same
Zod, property-catalog and business guardrail validation; other unknown shapes remain
rejected. If a deterministic intent guardrail changes the planned HubSpot object,
fields from the superseded object are discarded and the approved core fields are used.
If both free-tier models are
rate-limited, the API returns an explicit `429` response telling the user to wait and
retry with one period and one metric. The assistant is
read-only, never exposes tokens to the browser, rate
limits requests, and only works with a valid `spark_session`. Calculations use the
approved USD fields. Common Turkish periods (`bu/geçen/gelecek ay`, named months,
`bu çeyrek`, `bu/geçen yıl`,
`ilk/ikinci/üçüncü/dördüncü çeyrek`, `Q1–Q4`, `yılın ilk/ikinci yarısı`, `H1/H2`,
`YTD/yılbaşından bugüne`, `MTD/aybaşından bugüne`, `bu/geçen hafta`, `bugün`,
`dün`, `son N gün` up to 365 days), record type,
amount/count intent and the matching
HubSpot date/amount fields are enforced deterministically after planning. Invalid
or incomplete filters, properties, sorting and aggregations trigger model fallback
instead of returning an over-broad total. Each answer exposes a compact interpretation
of its object, period, measure and filters. Follow-ups also carry the previous validated
query context—not record data—so short period, country and dimension changes retain
the intended object, aggregate and composite/weighted metric. The most recent validated
data context is retained even if an explanatory text turn intervenes. Active pipeline, Won/Lost, open expected orders
and New Business-linked records use the same deterministic definitions as the dashboard.
Every order query is restricted to open pipeline stages, so closed/cancelled orders
are excluded even when the user does not explicitly say `açık`. Explicit
`Cancelled`/`Canceled`/`İptal` stage markers are excluded even if their HubSpot
pipeline metadata is accidentally configured as open.
`Garanti gelir` is a deterministic composite metric: invoiced revenue plus open
orders in the same requested period. The answer shows both components and their total.
`Beklenen fatura/gelir toplamı` uses the same period-based composite calculation:
invoices already issued plus open orders. A request to list or show expected invoice
details remains an open-order record query rather than a composite total. Current-month
expected-invoice detail requests cover the full calendar month, not only month-to-date.
For the current month, issued invoices use the month-to-date cutoff while open orders
use the full calendar month through month-end. Composite business intent is represented
explicitly in the LLM query plan (`metricKind`), so natural paraphrases are not limited
to a fixed phrase list; deterministic code validates and executes the calculation.
`Weighted pipeline`, `ağırlıklı pipeline` and `weighted forecast` sum the live
`hs_projected_amount_in_home_currency` field for active deals; the chatbot does not
recalculate HubSpot's projected amount. Country, owner, stage, vendor, revenue type,
domain and customer breakdown requests retain their validated `groupBy` dimension.
Current-month active and weighted pipeline use the full close-date calendar month,
matching the dashboard rather than stopping at today.
Invoice queries first validate that the live catalog contains the custom `status`
enum with one option whose internal value case-insensitively equals `invoiced` and
one whose internal value case-insensitively equals `cancelled`. In this portal the
internal values are capitalized: `Invoiced` and `Cancelled`. Validation returns the
cancelled option's exact live internal value, and only records whose custom status
equals that exact value are excluded; blank, `Invoiced`, and any future
non-cancelled value remain included. This rule is shared by the dashboard and
assistant. Never hardcode a casing for the financial exclusion; always use the
live catalog value resolved at refresh or query time.
Deal Open/Won/Lost and order Open filters use virtual state fields derived from
HubSpot closed/won properties and live pipeline metadata. Stage labels are display
values only and are never parsed for state decisions.
Country intent uses the live `country` field on deals, invoices and orders.
`Türkiye`/`Turkiye`/`Turkey`/`TR` map to one canonical Türkiye group;
`Amerika`/`ABD`/`USA`/`US`/`United States` map to one canonical ABD group. The same
canonicalization is applied to user text, live catalog option labels and values, returned
HubSpot rows and grouped output, so object-specific enum spelling cannot produce a false
zero. Turkish suffixes such as `Türkiyedeki` are recognized. Country-only follow-ups
retain the prior validated object, measure and scope.
Customer/company intent such as `Migros'a kestiğimiz faturalar`, `Migros firmasının
siparişleri` or equivalent deal questions uses the virtual `_company_name` field on
all three objects. It is sourced from invoice latest company name, deal name, or an
order's associated deal names. When company-object access is available, the live HubSpot
company association is primary; those object-name fields remain controlled fallbacks for
records without an association. Vendor filtering is reserved for explicit
vendor/seller/producer/partner/business-partner wording and uses `vendor_name`;
for example, `vendorı IBM` or `partneri IBM olan` means vendor IBM. Revenue-type questions
use `revenue_type`; `License` and `SNS` together form license revenue, while the
remaining enum values form service/consulting revenue. Turkish questions such as
`ne kadarı lisanstı?` and `ne kadarı servisti?` use these grouped definitions. On deals, New Business and
Existing Business map to `dealtype = newbusiness|existingbusiness`; invoice and order
questions apply that classification through their associated deals. `vendor_name` and
`revenue_type` are multi-select fields, so a semicolon-separated value matches each of
its selected enums rather than behaving like one combined label.
The assistant receives live enum options for relevant catalog properties. Static
aliases recognize business language; execution resolves them to live enum values.
Service means every current `revenue_type` option except `License` and `SNS`, so a
new HubSpot service enum is not silently omitted. Mixed multi-select records such
as `License;Project` contribute to both license and service breakdown groups.
Ereteam expertise questions use `ereteam_domain` on all three objects: data work
maps to `Data, Cloud & AI (DC&AI)`, finance work to `Enterprise Planning (EP)`,
and marketing work to `Intelligent MarTech (IM)`.
Owner questions use the live HubSpot owner directory. A first name or minor typo is
matched to the nearest unambiguous active owner name before records are filtered;
ambiguous low-confidence names are not guessed.
Breakdowns retain missing classifications as `Belirtilmemiş`, so category totals do
not silently omit records with sparse country, domain or business-type data.
Annual target, remaining target, guaranteed coverage, forecast coverage and total
annual forecast questions are answered deterministically from the persisted Spark
dashboard snapshot. Currency conversion, activity/calendar counts and historical stage
conversion questions return an explicit scope explanation instead of inventing data.

All chatbot business vocabulary is maintained centrally in
`lib/spark/chatKnowledge.ts`: HubSpot field contracts, enum values, Turkish/English
aliases, grouped revenue definitions, planner rules and regression examples. Update
that file first when a new interpretation gap is found; runtime guardrails and the
planner prompt both consume it. Run `npm run test:spark-chat` after every update;
its regression cases are maintained in the same knowledge file.
`lib/spark/hubspot.ts` is the single runtime source for invoice inclusion,
deal-state and open-order classification. Do not duplicate these decisions in the
dashboard or chatbot. The regression suite covers custom invoice status, blank
status inclusion, metadata-based state decisions, live country enum/row aliases,
multi-select revenue grouping, owner matching, date periods, follow-up metric retention,
intent guardrails and field selection.
Metric questions can also return a deterministic multi-value breakdown through a
validated `groupBy` property. For example, a Türkiye/USA country comparison returns
both values and a short calculated difference sentence. Explanation, interpretation,
methodology and conversational questions may return a concise `text` response; live
record rows are still never sent to the planner.
Calendar date boundaries are interpreted at midnight in `Europe/Istanbul`, including
explicit years. A HubSpot datetime at `21:00Z` on 31 December therefore belongs to
1 January in Istanbul and is excluded from the preceding year. First-half/H1 ranges
are 1 January inclusive through 1 July exclusive; second-half/H2 ranges are 1 July
inclusive through the following 1 January exclusive. Quarter ranges use calendar
boundaries: Q1 January–March, Q2 April–June, Q3 July–September and Q4 October–December.
Turkish half-year aliases also accept case suffixes and compact spelling, including
`ilk yarısının`, `ilkyarısının`, `birinci yarı`, and the equivalent second-half forms.

The former manually entered weekly focus/priorities section is intentionally
excluded. The executive summary is generated only from current numerical
metrics: target coverage, reporting-year invoicing, open orders, pipeline and the rolling
seven-day deal movement.

## Environment variables

```text
HUBSPOT_ACCESS_TOKEN=
SPARK_PASSWORD=
SPARK_LICENSE_TARGET_2026=1846145
SPARK_SERVICE_TARGET_2026=4029926
# Add these values and redeploy before the first 2027 refresh:
SPARK_LICENSE_TARGET_2027=
SPARK_SERVICE_TARGET_2027=
CRON_SECRET=
AMPLEMARKET_WEBHOOK_SECRET=
```

The existing `DATABASE_URL` and `ADMIN_SESSION_SECRET` variables are reused.
`NODE_ENV` is supplied by Vercel.
Spark has its own `SPARK_PASSWORD` and `spark_session` cookie; Presales
credentials do not grant Spark access. Secrets must only be stored in Vercel.
`CRON_SECRET` is the standard name Vercel uses to attach the cron Authorization
header. `SPARK_CRON_SECRET` is legacy and can be removed.
Before each year rollover, define both `SPARK_LICENSE_TARGET_<nextYear>` and
`SPARK_SERVICE_TARGET_<nextYear>` in Vercel and redeploy. For the 2026 → 2027
rollover, the 2027 values are intentionally deferred until management supplies them;
do not copy or infer the 2026 targets. If either value is absent, the new year's
snapshot records a budget-source error and uses target `0` until configuration is fixed.

## HubSpot field contract

- Invoice amount/date: `hs_amount_billed_in_company_currency`, `hs_invoice_date`
- Invoice status: custom enum `status`. The live catalog is validated case-insensitively
  for one `invoiced` and one `cancelled` option, and the cancelled option's exact
  internal value (currently `Cancelled` in this portal) is excluded from every
  financial population; blank, `Invoiced`, and any other non-cancelled value stay
  included. Standard `hs_invoice_status` never filters invoices
  or changes financial metrics; it is monitored only as a CRM-hygiene field and
  every invoice is expected to have exact internal value `paid`.
- Amount parsing: blank or missing amount fields count as `0`; any non-numeric or
  non-finite value (for example `1,000` or `Infinity`) fails the refresh loudly
  instead of silently becoming `0`, so no malformed HubSpot amount can distort totals.
- Order amount/date: `hs_homecurrency_amount`, `hs_processed_date` (internal only)
- Deal amount: `amount_in_home_currency`
- Guaranteed revenue: period invoices + period open orders
- Expected invoice/revenue total: period invoices + period open orders; detail questions list open orders
- Weighted pipeline: sum `hs_projected_amount_in_home_currency` over active deals
- Deal state: `hs_is_closed`, `hs_is_closed_won`, and pipeline stage metadata;
  labels are display-only and are never parsed to decide Open/Won/Lost state
- Order state: pipeline stage metadata; explicit `Cancelled`/`Canceled`/`İptal`
  stage markers are always excluded
- Country: `country` with enum values `Turkiye` and `USA` on deals, invoices and orders
- Vendor: `vendor_name` on deals, invoices and orders
- Customer/company: virtual `_company_name`; direct HubSpot company association first, then invoice latest company name, deal name, or an order's associated deal names
- Revenue classification: `revenue_type`; license revenue = `License` + `SNS`,
  service revenue = all other live enum options
- Multi-select matching: `vendor_name` and `revenue_type` split HubSpot `;` values and match individual selected enums
- Deal business type: `dealtype = newbusiness|existingbusiness`
- Ereteam expertise: `ereteam_domain` with `Data, Cloud & AI (DC&AI)`, `Enterprise Planning (EP)`, and `Intelligent MarTech (IM)`
- New Business: `dealtype = newbusiness` and Closed Won
- Annual target: `SPARK_LICENSE_TARGET_<year>` + `SPARK_SERVICE_TARGET_<year>`

The technical order-date property name is never rendered in the UI.

## Reporting rules

- The global report-year selector changes the entire dashboard dataset. The live year
  uses `current`, the following year uses the mutable `year:<nextYear>` planning snapshot,
  and a past year uses its frozen `year:<year>` snapshot. Overview country, domain, and
  revenue-type filters remain presentation-only within the selected year's executive
  overview. Every refresh may update only the current and following years; never rebuild
  an older past-year alias from later mutable HubSpot state.
- Dashboard populations are canonical and must be reused by every headline metric,
  monthly/quarterly view, stage funnel, breakdown, hygiene classification, all-record
  list and drill-down: invoices require reporting-year `hs_invoice_date` and exclude
  only the exact live cancelled status value; orders require reporting-year
  `hs_processed_date` and Open stage metadata; pipeline deals require reporting-year
  `closedate` and Open state, excluding Won and Lost. Explicit Won/Lost and Closed Won
  New Business sections may use their named closed state. The missing-close-date CRM
  hygiene card is the sole date-scope exception because those Open deals have no date
  to test. Do not recreate looser local variants of these populations.
- Target coverage is reporting-year non-cancelled invoices plus reporting-year open orders, divided by
  the annual `Lisans + Servis` target. Changing either target variable requires
  a redeploy before it affects Spark.
- Forecast coverage is reporting-year invoices plus reporting-year open orders
  plus weighted active deals whose `closedate` is in the reporting year, divided
  by the same annual target.
- Invoice, order and deal values must use the company/home-currency USD fields
  above. Never substitute example or remembered totals.
- New Business has two populations: all reporting-year invoices/open orders
  linked to any Closed Won New Business deal, and the subset linked to New
  Business deals closed in the reporting year. Carry-over rows are visually
  distinguishable in drill-downs.
- Monthly invoices/orders and weekly new/won/lost records have drill-down
  lists. Monthly invoice, open-order and pipeline detail dialogs show TR and ABD
  amount/count splits alongside the overall total. Older persisted snapshots that
  predate the row-level country field resolve it by record ID from the existing country
  revenue breakdown. Do not duplicate weekly deal movement elsewhere on the page.
- Every visible data column in record-detail tables is sortable in both directions
  from its column header. Text uses Turkish alphabetical ordering; dates, age and
  amounts use chronological or numeric ordering. The active direction is visible in
  the header, and Excel export preserves the filtered, sorted row order.
- Weekly new deals are currently Open, have `closedate` in the reporting year,
  and have `createdate` in the rolling window covering the current Istanbul day plus
  the seven preceding calendar days (`Bugün + son 7 gün`). Weekly Won/Lost records
  use their explicit state and a reporting-year `closedate` in that same window.
- The 12-month operating table shows all reporting-year non-cancelled invoices, reporting-year open orders, active
  close-date pipeline and HubSpot projected weighted pipeline for every month in
  the reporting year. By default, completed months are condensed into one YTD row
  with an invoice mini-trend because their open-order and active-pipeline columns
  naturally become sparse. Users can expand the row to restore all 12 monthly rows;
  the current and future months always remain detailed.
- Revenue breakdowns use `country`, `vendor_name`, `revenue_type`, and
  `ereteam_domain`. Missing values remain visible as `Belirtilmemiş`. Vendor and
  revenue type are multi-select fields, so category totals may overlap. The chart
  legend amounts are invoice plus open-order totals and are explicitly labeled
  `Fatura + açık order`; the label belongs above the legend values, not above the donut.
- CRM hygiene shows overdue, missing-close-date, missing-owner and
  missing-amount active deals; the missing-amount check flags only blank or
  zero amounts, because negative amounts are legitimate adjustment values and
  stay in pipeline totals unflagged. Operational deal checks use reporting-year Open deals,
  except the missing-close-date check, which necessarily inspects Open deals without
  a date and is the only explicit reporting-year date exception. Separate classification cards check reporting-year
  invoices, reporting-year open orders, and reporting-year active deals for missing
  `country`, `vendor_name`, `revenue_type`, or `ereteam_domain` values; multi-select
  fields are flagged when no selected enum remains after splitting semicolon values,
  so a semicolon-only value cannot hide as classified. A separate
  reporting-year Invoice card tracks records whose `hs_invoice_status` is not exact
  `paid`; another reporting-year Invoice card tracks records with no associated Deal.
  These hygiene checks must never alter the canonical Invoice population. Detail rows
  identify whether the affected HubSpot record is an Invoice, Order, or Deal. A record
  may appear in more than one action group. By default the compact hygiene summary displays
  only checks with affected records and checks awaiting a data refresh. Known-zero checks
  are condensed into one `kontrol temiz` row and can be expanded without changing data;
  clicking a non-zero count opens its record details. Persisted snapshots
  created before either Invoice check show the relevant card as awaiting a data refresh rather
  than implying a zero result. Manual-refresh failures surface the server error message
  in the header so missing source configuration is diagnosable.
- CRM-hygiene detail dialogs can write only `country`, `vendor_name`, `revenue_type`,
  `ereteam_domain`, and Invoice-only `hs_invoice_status = paid`. Values are validated against the live enum catalog before the
  HubSpot update. Users can update one record or select up to 50 records for one bulk
  update. Non-Paid Invoice rows expose direct `Paid yap` and `Seçilenleri Paid yap`
  actions rather than a general status selector. Invoice rows with no Deal association
  expose a Deal selector; the server verifies that both records still exist and that the
  Invoice is still unassociated before creating the HubSpot association. Checkbox properties support multiple values, and mixed object selections use
  only enum options common to every selected object type. Successful writes immediately
  remove the corrected records from the current browser's hygiene card and dialog; the
  shared dashboard snapshot is fully reconciled by the next manual or scheduled refresh.
  The HubSpot private app therefore
  requires `crm.objects.deals.write`, `crm.objects.invoices.write`, and
  `crm.objects.orders.write` in addition to the existing read scopes.
- On 2026-09-23, all 1,830 existing HubSpot Invoice records were normalized to
  `hs_invoice_status = paid`; the hygiene card continuously catches future drift.
- Current-month open deals use `closedate` and exclude Closed Won and Closed Lost.
- Monthly, breakdown, funnel, New Business and hygiene values expose record-count
  drill-downs in one shared modal; only one record detail modal is open at a time.
  Every record detail modal closes from its close button, backdrop, or the Escape key.
  The stage-funnel header also provides one deduplicated list of all active deals
  represented across the reporting-year funnel stages. The monthly-operation header
  provides equivalent complete reporting-year lists for non-cancelled invoices and
  Open orders.
  Every record-detail modal can export its current rows to an Excel workbook with
  record metadata and HubSpot URLs. Text, object-type, stage, owner, and country
  filters apply to the displayed count, amount, table, and Excel export. The
  modal summary cards update with those filters and show record count, total amount,
  weighted amount when available, and TR/US amount-count splits when country data is
  available. The spreadsheet library loads only when export is requested.
  Record-detail tables do not show a separate company column because company data is
  not reliably populated by HubSpot and the record names already contain the useful
  company context.
- Do not show Pipeline Health Score, external meetings, manually entered focus
  items, Business Development or automatically invented action priorities.
- The executive summary is numeric and source-derived.

## Legacy Invoice exchange-rate recovery

- HubSpot's standard Invoice `hs_exchange_rate` is a read-only system value.
  Direct CRM PATCH and both CREATE/UPDATE imports reject it with
  `READ_ONLY_VALUE`; never delete records merely to map that field in an import.
- The legacy migration populated the system value indirectly: set the portal's
  live currency conversion rate, create the Invoice as Draft with its line item
  and associations, finalize it as Open, then set it to Paid. A Paid Invoice
  retains the rate captured at creation when the live portal rate later changes.
- For a repair, first match source rows deterministically by normalized Invoice
  name, `hs_invoice_date`, `hs_currency`, and `hs_subtotal`. Restrict the source
  population to the requested historical date range and do not use
  `hs_exchange_rate` as a reporting-population filter.
- Before any write, back up every source Invoice property, company/deal/contact
  association, line item and the full currency-rate history. Keep a per-source
  checkpoint containing replacement Invoice and line-item IDs.
- For each affected non-USD Invoice, temporarily set the portal currency rate to
  the desired final `hs_exchange_rate`, wait for HubSpot's rate cache, create a
  Draft replacement, recreate its line items and exact associations, then move it
  through Open to Paid. Verify rate (six-decimal tolerance), date, currency,
  subtotal, status, name, line items and associations before archiving the source
  Invoice and its old migration line item.
- HubSpot currency propagation is eventually consistent. If a replacement sees
  the previous rate, archive only that unverified replacement and its new line
  item, keep the source, wait 10 then 20 seconds, and retry without reposting the
  same rate. Retry transient `408`, `429` and `5xx` responses. Always restore each
  currency's original live rate in a `finally` path.
- After a rebuild, verify that every checkpoint is complete, every replacement
  matches its source row, all source IDs are inactive, no untracked replacement
  remains, all relationships match, and the portal rates equal their initial
  values. Inspect `hs_exchange_rate` and `hs_invoice_status` property history for
  every protected reporting-year Invoice and require zero migration-time changes.
- On 2026-09-23 this procedure rebuilt 505 pre-2026 Invoices (55 EUR, 447 TRY,
  3 GBP), while 1,180 already-correct historical Invoices remained untouched.
  Three spreadsheet rows with no HubSpot record were excluded. One additional
  Gilead row was matched safely by date, currency and subtotal despite its Excel
  name ending in `1/2` and HubSpot `invoice_name` ending in `1/3`. Final verification found 1,830
  active Paid Invoices, 505 valid replacements with 505 line items and all original
  company/deal associations, no orphan replacements, and zero migration-time
  changes across all 145 Invoices dated 2026 or later. Portal rates were restored
  to GBP `1.336`, EUR `1.146`, and TRY `0.0205`.
- The recovery requires Invoice and line-item read/write plus
  `settings.currencies.read` and `settings.currencies.write`. `crm.import` is useful
  only to prove the read-only import failure and is not part of the rebuild.

## Legacy Amplemarket webhook

The receiver and stored `SparkAmplemarketEvent` records remain available for
legacy integrations, but Spark no longer reads or reports Amplemarket data.

The live dashboard uses a minimal management-report hierarchy: branded dark
header, target/revenue/pipeline summary, compact weekly pipeline movement, month
and quarter cards, visual 12-month composition, color-separated stage flow, split
New Business cohorts, revenue charts, and CRM hygiene. Record
details open in one shared modal rather than expanding the page. Million-scale
compact values always show two decimal places. Responsive behavior is verified at
320px, 375px, 390px, and 768px widths for the dashboard, CRM detail editor, and chat;
the page must not introduce root-level horizontal overflow, while wide data tables
remain horizontally scrollable inside their own containers.
The report supports light and dark themes on desktop and mobile across the dashboard,
detail dialogs, and data assistant. The explicit browser choice is persisted locally;
without a saved choice, Spark follows the operating-system color preference. The
resolved theme is applied before the first paint by a small inline script on `/spark`
that resolves the persisted choice or the system preference onto the root element's
`data-spark-theme` attribute; dark CSS overrides key off that root attribute, and the
theme toggle and system-theme sync keep it current, so a reload or a report-year
navigation never flashes the light theme before the dark theme.

## Commands

```bash
npm run test:spark-chat
npm run test:spark-amplemarket
npm run build
```

After deployment, verify `/spark/login`, `/spark` and one
authorized call to `/api/cron/spark` before considering the installation live.
Run `npm run build` and `git diff --check`; preserve unrelated worktree changes,
especially user-owned changes in `PRESALES.md`.
