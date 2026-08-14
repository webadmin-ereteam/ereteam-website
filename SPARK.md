# Spark Revenue Dashboard

Spark is an internal, password-protected revenue dashboard mounted at `/spark`.
It is intentionally separate from the Presales portal. Spark changes belong in
this file; do not use `PRESALES.md` as Spark documentation.

## Routes

- `/spark` — latest password-protected dashboard
- `/spark/login` — shared internal login
- `/api/cron/spark` — Vercel Cron endpoint
- `/api/spark/refresh` — Spark-session-protected manual refresh with a ten-minute cooldown
- `/api/spark/chat` — Spark-session-protected, salt-okunur canlı HubSpot veri asistanı
- `/api/spark/amplemarket/webhook` — authenticated Amplemarket event receiver

## Schedule and reporting window

Vercel Cron calls the production endpoint every day at `10:00 UTC`, which is
`13:00 Europe/Istanbul`. Each report covers the current Istanbul calendar day
and the seven preceding calendar days through `generatedAt`. YTD and
current-month values use the generation timestamp as their cutoff. On Vercel Hobby, the invocation can
occur at any time within the scheduled hour. Environment-variable changes only
reach a new deployment, so redeploy after changing a secret.

## Sources

- HubSpot API: deals, invoices, orders, associations, owners and drill-down links
- Vercel environment: reporting-year `Lisans + Servis` annual target
- Amplemarket: webhook events stored in `SparkAmplemarketEvent`; the API key is
  validated through `/account-info`

The dashboard does not include an admin screen or historical archive. Data is
cached and refreshed daily; source health is shown separately.
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
The planner uses Groq production models with automatic fallback (`gpt-oss-20b`,
Llama 8B, then `gpt-oss-120b`) when a model is rate-limited or returns an invalid
plan, and receives only question-relevant property catalog entries. The assistant is
read-only, never exposes tokens to the browser, rate
limits requests, and only works with a valid `spark_session`. Calculations use the
approved USD fields. Common Turkish periods (`bu/geçen ay`, `bu/geçen yıl`,
`ilk/ikinci/üçüncü/dördüncü çeyrek`, `Q1–Q4`, `yılın ilk/ikinci yarısı`, `H1/H2`,
`bugün`, `dün`, `son 7/30 gün`), record type,
amount/count intent and the matching
HubSpot date/amount fields are enforced deterministically after planning. Invalid
or incomplete filters, properties, sorting and aggregations trigger model fallback
instead of returning an over-broad total. Each answer exposes a compact interpretation
of its object, period, measure and filters. Follow-ups also carry the previous validated
query context—not record data—so short period changes and `bunların toplamı?` retain
the intended scope. Active pipeline, Won/Lost, open expected orders
and New Business-linked records use the same deterministic definitions as the dashboard.
Country intent uses the live `country` enum on deals, invoices and orders:
`Türkiye`/`Turkey` map to `Turkiye`; `Amerika`/`ABD`/`USA`/`United States` map to
`USA`. Country-only follow-ups retain the prior validated object and scope.
Vendor questions use `vendor_name` on all three objects. Revenue-type questions
use `revenue_type`; `License` and `SNS` together form license revenue, while the
remaining enum values form service/consulting revenue. Turkish questions such as
`ne kadarı lisanstı?` and `ne kadarı servisti?` use these grouped definitions. On deals, New Business and
Existing Business map to `dealtype = newbusiness|existingbusiness`.
Ereteam expertise questions use `ereteam_domain` on all three objects: data work
maps to `Data, Cloud & AI (DC&AI)`, finance work to `Enterprise Planning (EP)`,
and marketing work to `Intelligent MarTech (IM)`.
Owner questions use the live HubSpot owner directory. A first name or minor typo is
matched to the nearest unambiguous active owner name before records are filtered;
ambiguous low-confidence names are not guessed.

All chatbot business vocabulary is maintained centrally in
`lib/spark/chatKnowledge.ts`: HubSpot field contracts, enum values, Turkish/English
aliases, grouped revenue definitions, planner rules and regression examples. Update
that file first when a new interpretation gap is found; runtime guardrails and the
planner prompt both consume it. Run `npm run test:spark-chat` after every update;
its regression cases are maintained in the same knowledge file.
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
AMPLEMARKET_API_KEY=
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
- Order amount/date: `hs_homecurrency_amount`, `hs_processed_date` (internal only)
- Deal amount: `amount_in_home_currency`
- Country: `country` with enum values `Turkiye` and `USA` on deals, invoices and orders
- Vendor: `vendor_name` on deals, invoices and orders
- Revenue classification: `revenue_type`; license revenue = `License` + `SNS`, service revenue = all other values
- Deal business type: `dealtype = newbusiness|existingbusiness`
- Ereteam expertise: `ereteam_domain` with `Data, Cloud & AI (DC&AI)`, `Enterprise Planning (EP)`, and `Intelligent MarTech (IM)`
- New Business: `dealtype = newbusiness` and Closed Won
- Annual target: `SPARK_LICENSE_TARGET_<year>` + `SPARK_SERVICE_TARGET_<year>`

The technical order-date property name is never rendered in the UI.

## Reporting rules

- Target coverage is YTD invoices plus reporting-year open orders, divided by
  the annual `Lisans + Servis` target. Changing either target variable requires
  a redeploy before it affects Spark.
- Invoice, order and deal values must use the company/home-currency USD fields
  above. Never substitute example or remembered totals.
- New Business has two populations: all reporting-year invoices/open orders
  linked to any Closed Won New Business deal, and the subset linked to New
  Business deals closed in the reporting year. Carry-over rows are visually
  distinguishable in drill-downs.
- Monthly invoices/orders and weekly new/won/lost records have drill-down
  lists. Do not duplicate weekly deal movement elsewhere on the page.
- Monthly invoice/order cards use explicit record-count and `Kayıtları gör`
  calls to action. New Business drill-down controls live inside their metric
  cards; no separate list rows are shown below the cards, and only one inline
  record table is open at a time.
- Do not show Pipeline Health Score, external meetings, manually entered focus
  items, Business Development or automatically invented action priorities.
- The executive summary is numeric and source-derived.

## Amplemarket webhook

Use `/api/spark/amplemarket/webhook?key=<AMPLEMARKET_WEBHOOK_SECRET>` for all
three active feeds:

1. JSON Data: Email and LinkedIn activity on, `All new contacts`; this supplies
   sends and all replies.
2. Interested workflow: `event_type: positive`; this supplies the positive
   subset.
3. Meeting Booked workflow: `event_type: meeting`; this supplies meetings and
   their person/company details.

The separate All Replies workflow must remain paused because JSON Data already
supplies replies. `replies` counts only `reply` events; positive events are not
added again. Call, generic task, SMS/iMessage and WhatsApp JSON Data feeds are
off. Workflow headers remain empty because authentication uses the URL key.
Spark stores source events for rolling aggregation, not dashboard archives.
Remove dummy `John Doe`/`Jane Doe` events after testing.

Lead Generation follows the approved standalone HTML: exact sent, bulk, Duo,
reply, positive and meeting totals; person-level bulk/Duo/total send breakdown;
positive/reply conversion; and meetings booked within the rolling seven-day
window. Manually entered priorities and action lists are not rendered.

The live dashboard must preserve the visual hierarchy and interaction model of
the approved standalone Spark HTML: branded dark header, three written numeric
executive-summary cards, four KPI cards, dark weekly movement strip with inline
deal-list buttons, target and invoicing cards, grouped New Business view,
monthly trend, forecast and Lead Generation. Do not add a separate weekly deal
movement card. Million-scale compact values always show two decimal places.

The public Amplemarket REST API is used only for connection validation because
it does not expose historical weekly sent/reply analytics. Lead Generation is
calculated from stored JSON Data and workflow webhooks from the time those feeds
were enabled; never fill missing historical periods with sample values.

For the one-time pre-webhook gap, Amplemarket MCP Analytics can provide exact
daily owner and bulk/Duo aggregates. Submit those rows to the authenticated
`/api/spark/amplemarket/backfill` endpoint. The endpoint creates deterministic,
deduplicated source events, refreshes the dashboard cache, and is therefore safe
to submit repeatedly. This is bootstrap
only: after the gap is filled, Amplemarket webhooks and Vercel Cron operate in
the cloud without requiring the user's Mac or a Codex automation to be online.

## Commands

```bash
npm run test:spark-chat
npm run build
```

After deployment, verify `/spark/login`, `/spark` and one
authorized call to `/api/cron/spark` before considering the installation live.
Run `npm run build` and `git diff --check`; preserve unrelated worktree changes,
especially user-owned changes in `PRESALES.md`.
