# Spark validation — 12 November 2026

## Scope and fixes

Read and write paths share the `2026-09` HubSpot transport. The Service Key has
all 22 scopes of the legacy app, including the runtime's deals/invoices/orders
read/write, companies/owners read, schema read and order pipeline read scopes. Credentials
remain in Vercel, not in this report or repository.

This validation found and corrected:

1. Batch updates could report success after a partial HubSpot response. Explicit
   errors and missing updated IDs now fail. Hygiene also reads the selected field
   back before returning success. Multi-select comparison is order independent.
2. Invoice-to-Deal creation had no readback check. The association is now checked
   before the browser removes the hygiene issue.
3. Association batch reads ignored per-record pagination. All pages are merged,
   duplicates removed, and repeated cursors rejected.
4. General active-pipeline questions could retain the planner's `createdate`
   filter, producing a different population from the dashboard. Pipeline defaults
   to `closedate`; explicit creation-date requests retain `createdate`. Superseded
   date filters are removed.
5. Successful empty HTTP 204 responses no longer cause JSON parsing errors.
6. Live association reads revealed HubSpot's ID-scoped `OBJECT_NOT_FOUND` response
   with messages such as `No deal is associated with invoice <id>.` This means
   an empty link set, not an unavailable object. Only explicit empty-link messages
   matching the requested source ID are normalized. Genuine missing-object,
   permission and other partial errors still fail.
7. The pre-existing local refresh lease changes were validated and included:
   leases are released on success and failure using an ownership token, and
   simultaneous manual requests coalesce. A failed refresh no longer unnecessarily
   blocks another attempt for ten minutes.
8. A live pipeline rerun exposed a planner-selected weighted metric for a plain
   active-pipeline question. Explicit plain pipeline now rejects that override;
   amount-and-count wording returns the amount with the existing record count,
   instead of letting count intent or an invented weighted intent override it.
9. A weighted-pipeline detail request was forced into a metric. It now returns
   records with the projected-amount column and retains the validated weighted
   context for subsequent questions.
10. A live expected-invoice detail question exposed a corrected object retaining
    invoice-specific sort/status fields. When invoice intent is corrected to
    orders, date/amount sorting now uses the approved order fields. An unsolicited
    invoice status filter is removed; explicitly requested filters still undergo
    catalog validation rather than being silently weakened.

## Automated evidence

| Area | Verification |
| --- | --- |
| Transport | Object pagination, 100-record reads, 10-record invoice writes, all endpoint families, authorization rejection, partial 207 and missing IDs, association pagination/repeated cursors, explicit empty-link messages, empty 204 |
| Hygiene routes | 21 cases: Spark audience, Paid-only invoice restriction, enum allowlist/hidden values, 50-record cap, mixed-object validation before writing, multi-select sets, readback mismatch/missing records, denied writes, missing/already-associated invoices, association readback, fail-closed rate limiting |
| Collector | Five cases: headline/month/funnel population reconciliation, custom Cancelled exclusion, Paid hygiene independent of invoicing, negative adjustments, New Business carry-over, missing-close-date exception, weighted source values, Istanbul year boundary, malformed amounts and missing planning-year targets |
| Chat semantics | 47 regression scenarios plus owner/date/field and context assertions in the knowledge runner; the exact previously observed pipeline question is included with incorrect planner-createdate and weighted overrides |
| Refresh | Seven tests for lease ownership/contention/release on failure/success, current+planning writes only, manual request coalescing and retry after failure |
| Existing tests | Full `npm test`, production build and scoped lint are required before release |

Tests use fixtures and mocked HubSpot responses. They verify code behavior but
cannot demonstrate that an actual HubSpot invoice transition is permitted.
The final suite includes 69 unit tests, eight survey tests, 47 Spark chat scenarios
and six Amplemarket checks; production build and scoped lint pass.

## Live evidence and limitations

During the Service Key cutover, the production refresh succeeded at 15:27 Istanbul.
The report read 168 invoices and 23 open orders. A live explicit close-year detail
query returned 20 active deals and a follow-up returned USD 1,355,000, matching the
dashboard. Company associations and owner display were present. The UI also opened
the combined TR/DC&AI/license forecast dialog (35 rows, USD 830,446.44).
These observations are timestamped evidence, not fixed expected business totals.
After empty-link normalization, the production snapshot was successfully refreshed
again at 16:15 Istanbul. The intermediate strict-reader failures preserved the
previous snapshot rather than saving a partial population.

The user confirmed there is no designated test Invoice/Deal. No real invoice was
changed to Paid, no customer classification was changed, and no real association
was created solely for testing. Therefore **live production writes, their resulting
HubSpot property histories, and the browser's removal of a real corrected issue
remain unverified**. Those need a designated test record or an actual intended
business correction. The automated server tests cover those success/error flows.

Additional live UI checks passed: combined overview filters and forecast modal,
sorting, empty search with zero filtered totals, Escape dismissal, privacy masking
with disabled refresh/detail actions, theme switching, and 2027 planning navigation
with missing-target warning and hidden live chat. The actual downloaded Excel file
contains 35 rows, all HubSpot URLs, forecast calculation labels and a contribution
sum of USD 830,446.44298, matching the displayed USD 830,446.44.

Unauthenticated requests to hygiene GET/PATCH/POST, chat, manual refresh and cron
returned HTTP 401. The report-year URL redirected to login with its year preserved.

Responsive screenshots were inspected at 320, 375, 390 and 768 CSS pixels. The
390px record dialog and 320px chat panel fit their viewports; wide tables and
navigation/filter strips retain their own scrolling. Complete keyboard navigation
and historical-year navigation have not all been re-exercised. The portal exposes only current and
planning snapshots, so an actual frozen historical snapshot is unavailable for a
live archive test. Do not describe this as complete UI end-to-end certification.

A missing 2027 target is an explicit supported warning state;
management must supply the 2027 targets before that year's target ratios are used.

## Remaining operational checks

- Verify a legitimate Paid operation and Invoice-to-Deal correction on designated
  records, then check HubSpot values/history, refresh and the hygiene counts.
- Finish complete-keyboard/archive checks when a historical snapshot is available.
- Keep API version and Service Key lifecycle monitoring current. Tests cannot
  guarantee the future availability or behavior of an external API.

## Live permission comparison

The legacy app still exists under **Spark Dashboard** (app ID `48480812`). Its
Auth screen exposes 22 scopes. The replacement **Spark** Service Key (ID
`61485015`) initially exposed 12, covering the current runtime. The user explicitly
approved adding the remaining ten scopes. The saved detail page now exposes
**all 22 with zero missing and zero extra scopes** compared with the old app.

| Scope | Legacy app | Service Key |
| --- | --- | --- |
| `crm.objects.deals.read` | Yes | Yes |
| `crm.objects.deals.write` | Yes | Yes |
| `crm.objects.invoices.read` | Yes | Yes |
| `crm.objects.invoices.write` | Yes | Yes |
| `crm.objects.orders.read` | Yes | Yes |
| `crm.objects.orders.write` | Yes | Yes |
| `crm.objects.companies.read` | Yes | Yes |
| `crm.objects.owners.read` | Yes | Yes |
| `crm.schemas.deals.read` | Yes | Yes |
| `crm.schemas.invoices.read` | Yes | Yes |
| `crm.schemas.orders.read` | Yes | Yes |
| `crm.pipelines.orders.read` | Yes | Yes |
| `crm.objects.line_items.read` | Yes | Yes |
| `crm.objects.line_items.write` | Yes | Yes |
| `crm.import` | Yes | Yes |
| `crm.objects.users.read` | Yes | Yes |
| `crm.objects.products.read` | Yes | Yes |
| `settings.currencies.read` | Yes | Yes |
| `settings.currencies.write` | Yes | Yes |
| `crm.pipelines.stage_permissions.read` | Yes | Yes |
| `crm.objects.contacts.read` | Yes | Yes |
| `crm.schemas.companies.read` | Yes | Yes |

Paid updates use the existing invoice-write scope. Classification updates use the
matching deal/invoice/order-write scopes. Invoice-to-Deal links have both invoice
and deal write access. The remaining ten legacy scopes are not used by the current
Spark source; some relate to historical invoice/line-item/currency migration.
The scope update retained the same Service Key; no token rotation or second
credential entry was needed. Scope parity is confirmed from HubSpot's saved UI;
it does not substitute for executing live writes on designated test records.

After the final pipeline changes, a fresh production refresh succeeded at 20:38
Istanbul. The exact original pipeline question returned USD 1,355,000 and 20 records
at 20:39, matching the dashboard; its detail follow-up returned 20 records.

The final code release `e0e85b4` reached Ready through the GitHub-triggered Vercel
deployment `dpl_Ckzeezfy5kLzuYA5j7FWwK6VBZQK`, including `ereteam.com` and
`www.ereteam.com`. The previously failing exact question, “Bu ay beklenen
faturaların detaylarını göster”, then returned eight open orders for November,
matching the dashboard's monthly order count. An unknown-company invoice query
returned the expected concise empty result. A further manual refresh succeeded
at **20:51 Istanbul**, retaining 168 invoices, 23 open orders and 20 active deals.
The six unauthenticated API checks were repeated during the final review; all
returned 401. This final review changes documentation only; the 130-check suite,
production build and scoped lint had passed on the same runtime source.
