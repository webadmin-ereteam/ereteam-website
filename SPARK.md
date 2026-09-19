# Spark Revenue Dashboard

Spark is an internal, password-protected revenue dashboard mounted at `/spark`.
Its Turkish dashboard title is `Gelir Yönetim Merkezi`.
It is intentionally separate from the Presales portal. Spark changes belong in
this file; do not use `PRESALES.md` as Spark documentation.

## Routes

- `/spark` — latest password-protected dashboard
- `/spark/login` — shared internal login
- `/api/cron/spark` — Vercel Cron endpoint
- `/api/spark/refresh` — Spark-session-protected manual refresh with a ten-minute cooldown
- `/api/spark/hygiene` — Spark-session-protected CRM enum catalog and allowlisted record updates
- `/api/spark/chat` — Spark-session-protected, salt-okunur canlı HubSpot veri asistanı
- `/api/spark/amplemarket/webhook` — legacy authenticated Amplemarket meeting receiver; not used by the dashboard

## Schedule and reporting window

Vercel Cron calls the production endpoint every day at `06:00 UTC` and `11:00 UTC`,
which are `09:00` and `14:00 Europe/Istanbul`. Each report covers the current Istanbul calendar day
and the seven preceding calendar days through `generatedAt`. YTD and
current-month values use the generation timestamp as their cutoff. On Vercel Hobby, the invocation can
occur at any time within each scheduled hour. Environment-variable changes only
reach a new deployment, so redeploy after changing a secret.

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

The dashboard does not include an admin screen or historical archive. Data is
cached without age-based revalidation and refreshed twice daily by cron; opening
the report reuses the current snapshot instead of intentionally querying HubSpot.
If the platform cache is cold or evicted, the cache remains read-through and the
first request can repopulate it. Source health is shown separately.
The header also shows the exact Istanbul update time. Authenticated users can
request a quiet manual refresh; requests made within ten minutes of the latest
generated report reuse the current snapshot instead of calling the sources.

The dashboard includes a password-protected Revenue Data Assistant. Groq is used
only to translate the natural-language question into a constrained query plan.
The server then queries HubSpot live and renders the result deterministically:
single-value questions return a metric card, while record/detail questions return
a table with HubSpot links. HubSpot result rows are not sent back to Groq for answer
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
approved USD fields. Common Turkish periods (`bu/geçen ay`, `bu/geçen yıl`,
`ilk/ikinci/üçüncü/dördüncü çeyrek`, `Q1–Q4`, `yılın ilk/ikinci yarısı`, `H1/H2`,
`YTD/yılbaşından bugüne`, `MTD/aybaşından bugüne`, `bu/geçen hafta`, `bugün`,
`dün`, `son N gün` up to 365 days), record type,
amount/count intent and the matching
HubSpot date/amount fields are enforced deterministically after planning. Invalid
or incomplete filters, properties, sorting and aggregations trigger model fallback
instead of returning an over-broad total. Each answer exposes a compact interpretation
of its object, period, measure and filters. Follow-ups also carry the previous validated
query context—not record data—so short period changes and `bunların toplamı?` retain
the intended scope. Active pipeline, Won/Lost, open expected orders
and New Business-linked records use the same deterministic definitions as the dashboard.
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
recalculate HubSpot's projected amount.
Invoice queries first validate that the live catalog contains the custom `status`
enum with `invoiced` and `cancelled` options. Only records whose custom status is
exactly `cancelled` are excluded; blank, `invoiced`, and any future non-cancelled
value remain included. This rule is shared by the dashboard and assistant.
Deal Open/Won/Lost and order Open filters use virtual state fields derived from
HubSpot closed/won properties and live pipeline metadata. Stage labels are display
values only and are never parsed for state decisions.
Country intent uses the live `country` enum on deals, invoices and orders:
`Türkiye`/`Turkey` map to `Turkiye`; `Amerika`/`ABD`/`USA`/`United States` map to
`USA`. Country-only follow-ups retain the prior validated object and scope.
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

All chatbot business vocabulary is maintained centrally in
`lib/spark/chatKnowledge.ts`: HubSpot field contracts, enum values, Turkish/English
aliases, grouped revenue definitions, planner rules and regression examples. Update
that file first when a new interpretation gap is found; runtime guardrails and the
planner prompt both consume it. Run `npm run test:spark-chat` after every update;
its regression cases are maintained in the same knowledge file.
`lib/spark/hubspot.ts` is the single runtime source for invoice inclusion,
deal-state and open-order classification. Do not duplicate these decisions in the
dashboard or chatbot. The regression suite covers custom invoice status, blank
status inclusion, metadata-based state decisions, multi-select revenue grouping,
owner matching, date periods, intent guardrails and field selection.
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
metrics: target coverage, YTD invoicing, open orders, pipeline and the rolling
seven-day deal movement.

## Environment variables

```text
HUBSPOT_ACCESS_TOKEN=
SPARK_PASSWORD=
SPARK_LICENSE_TARGET_2026=1846145
SPARK_SERVICE_TARGET_2026=4029926
CRON_SECRET=
AMPLEMARKET_WEBHOOK_SECRET=
```

The existing `DATABASE_URL` and `ADMIN_SESSION_SECRET` variables are reused.
`NODE_ENV` is supplied by Vercel.
Spark has its own `SPARK_PASSWORD` and `spark_session` cookie; Presales
credentials do not grant Spark access. Secrets must only be stored in Vercel.
`CRON_SECRET` is the standard name Vercel uses to attach the cron Authorization
header. `SPARK_CRON_SECRET` is legacy and can be removed.

## HubSpot field contract

- Invoice amount/date: `hs_amount_billed_in_company_currency`, `hs_invoice_date`
- Invoice status: custom enum `status`, with contract values `invoiced` and
  `cancelled`. Exclude only exact `cancelled`; include blank, `invoiced`, and any
  other non-cancelled value. Do not use standard `hs_invoice_status`.
- Order amount/date: `hs_homecurrency_amount`, `hs_processed_date` (internal only)
- Deal amount: `amount_in_home_currency`
- Guaranteed revenue: period invoices + period open orders
- Expected invoice/revenue total: period invoices + period open orders; detail questions list open orders
- Weighted pipeline: sum `hs_projected_amount_in_home_currency` over active deals
- Deal state: `hs_is_closed`, `hs_is_closed_won`, and pipeline stage metadata;
  labels are display-only and are never parsed to decide Open/Won/Lost state
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

- Target coverage is invoices through `generatedAt` plus reporting-year open orders, divided by
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
  lists. Do not duplicate weekly deal movement elsewhere on the page.
- Weekly new deals use `createdate` across all deals, regardless of their current
  open/won/lost state.
- The 12-month operating table shows non-cancelled invoices through `generatedAt`, open orders, active
  close-date pipeline and HubSpot projected weighted pipeline for every month in
  the reporting year.
- Revenue breakdowns use `country`, `vendor_name`, `revenue_type`, and
  `ereteam_domain`. Missing values remain visible as `Belirtilmemiş`. Vendor and
  revenue type are multi-select fields, so category totals may overlap. The chart
  legend amounts are invoice plus open-order totals and are explicitly labeled
  `Fatura + açık order`; the label belongs above the legend values, not above the donut.
- CRM hygiene shows overdue, 90+ day, missing-close-date, missing-owner and
  missing-amount active deals. Separate classification cards check reporting-year
  invoices, reporting-year open orders, and reporting-year active deals for missing
  `country`, `vendor_name`, `revenue_type`, or `ereteam_domain` values. Detail rows
  identify whether the affected HubSpot record is an Invoice, Order, or Deal. A record
  may appear in more than one action group. Deal-only operational cards label their
  amount as `pipeline`; mixed Invoice/Order/Deal classification cards label it as
  `toplam tutar` and must not describe the mixed amount as pipeline.
- CRM-hygiene detail dialogs can write only `country`, `vendor_name`, `revenue_type`,
  and `ereteam_domain`. Values are validated against the live enum catalog before the
  HubSpot update. Users can update one record or select up to 50 records for one bulk
  update. Checkbox properties support multiple values, and mixed object selections use
  only enum options common to every selected object type. Successful writes immediately
  remove the corrected records from the current browser's hygiene card and dialog; the
  shared dashboard snapshot is fully reconciled by the next manual or scheduled refresh.
  The HubSpot private app therefore
  requires `crm.objects.deals.write`, `crm.objects.invoices.write`, and
  `crm.objects.orders.write` in addition to the existing read scopes.
- Current-month open deals use `closedate` and exclude Closed Won and Closed Lost.
- Monthly, breakdown, funnel, New Business and hygiene values expose record-count
  drill-downs in one shared modal; only one record detail modal is open at a time.
- Do not show Pipeline Health Score, external meetings, manually entered focus
  items, Business Development or automatically invented action priorities.
- The executive summary is numeric and source-derived.

## Legacy Amplemarket webhook

The receiver and stored `SparkAmplemarketEvent` records remain available for
legacy integrations, but Spark no longer reads or reports Amplemarket data.

The live dashboard uses a minimal management-report hierarchy: branded dark
header, target/revenue/pipeline summary, compact weekly pipeline movement, month
and quarter cards, visual 12-month composition, color-separated stage flow, revenue
charts, split New Business cohorts, and CRM hygiene. Record
details open in one shared modal rather than expanding the page. Million-scale
compact values always show two decimal places. Responsive behavior is verified at
320px, 375px, 390px, and 768px widths for the dashboard, CRM detail editor, and chat;
the page must not introduce root-level horizontal overflow, while wide data tables
remain horizontally scrollable inside their own containers.

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
