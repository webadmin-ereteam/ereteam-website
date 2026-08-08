# Spark Revenue Dashboard

Spark is an internal, password-protected revenue dashboard mounted at
`/spark`. It is intentionally separate from the presales portal and its
documentation.

## Routes

- `/spark` — latest password-protected dashboard
- `/spark/login` — shared internal login
- `/api/cron/spark` — Vercel Cron endpoint

## Schedule and reporting window

Vercel Cron calls the production endpoint every day at `10:00 UTC`, which is
`13:00 Europe/Istanbul`. Each report covers the exact rolling window from
`generatedAt - 7 days` through `generatedAt`. YTD and current-month values use
the generation timestamp as their cutoff.

## Sources

- HubSpot API: deals, invoices, orders, associations, owners and drill-down links
- Google Sheets: `Sales` workbook, `Bütçe_Hedef` tab, `Lisans + Servis`
- Amplemarket: lead-generation metrics when a server-side analytics endpoint is configured
The dashboard does not include an admin screen or historical archive. Data is
cached and refreshed daily; source health is shown separately.

The former manually entered weekly focus/priorities section is intentionally
excluded. The executive summary is generated only from current numerical
metrics: target coverage, YTD invoicing, open orders, pipeline and the rolling
seven-day deal movement.

## Environment variables

```text
HUBSPOT_ACCESS_TOKEN=
SPARK_PASSWORD=
SPARK_SHEET_ID=1Yc-CO6QHlgOhVyvuuAp_2Oh4Ywm3kYKkfjFyZevfhyU
SPARK_CRON_SECRET=
AMPLEMARKET_API_KEY=
AMPLEMARKET_WEBHOOK_SECRET=
```

The existing `GOOGLE_SERVICE_ACCOUNT_KEY` and `ADMIN_SESSION_SECRET` variables
are reused. Spark has its own `SPARK_PASSWORD` and session cookie; Presales
credentials do not grant Spark access. Spark has no admin functionality.
Secrets must only be stored in Vercel environment variables.

## HubSpot field contract

- Invoice amount/date: `hs_amount_billed_in_company_currency`, `hs_invoice_date`
- Order amount/date: `hs_homecurrency_amount`, `hs_processed_date` (internal only)
- Deal amount: `amount_in_home_currency`
- New Business: `dealtype = newbusiness` and Closed Won
- Annual target: reporting-year rows in `Bütçe_Hedef`, `Lisans + Servis`

The technical order-date property name is never rendered in the UI.

## Amplemarket webhook

Configure Amplemarket JSON Data and interested-reply workflows to send events
to `/api/spark/amplemarket/webhook?key=<AMPLEMARKET_WEBHOOK_SECRET>`. Spark
stores source events only for rolling aggregation; it does not create report
archives. The REST API key is validated against Amplemarket's `/account-info`.
If a dedicated webhook secret is omitted, `SPARK_CRON_SECRET` is used.

## Commands

```bash
npm run build
```

After deployment, verify `/spark/login`, `/spark` and one
authorized call to `/api/cron/spark` before considering the installation live.
