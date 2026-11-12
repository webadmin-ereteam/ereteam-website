# Spark validation — 12 November 2026

## Scope and fixes

Read and write paths share the `2026-09` HubSpot transport. The Service Key has
deals/invoices/orders read and write scopes, companies/owners read scopes,
deals/invoices/orders schema read scopes and order pipeline read scope. Credentials
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

## Automated evidence

| Area | Verification |
| --- | --- |
| Transport | Object pagination, 100-record reads, 10-record invoice writes, all endpoint families, authorization rejection, partial 207 and missing IDs, association pagination/repeated cursors, empty 204 |
| Hygiene routes | 21 cases: Spark audience, Paid-only invoice restriction, enum allowlist/hidden values, 50-record cap, mixed-object validation before writing, multi-select sets, readback mismatch/missing records, denied writes, missing/already-associated invoices, association readback, fail-closed rate limiting |
| Collector | Five cases: headline/month/funnel population reconciliation, custom Cancelled exclusion, Paid hygiene independent of invoicing, negative adjustments, New Business carry-over, missing-close-date exception, weighted source values, Istanbul year boundary, malformed amounts and missing planning-year targets |
| Chat semantics | 45 regression scenarios plus owner/date/field and context assertions in the knowledge runner; the exact previously observed pipeline question is included with an incorrect planner-createdate filter |
| Existing tests | Full `npm test`, production build and scoped lint are required before release |

Tests use fixtures and mocked HubSpot responses. They verify code behavior but
cannot demonstrate that an actual HubSpot invoice transition is permitted.

## Live evidence and limitations

During the Service Key cutover, the production refresh succeeded at 15:27 Istanbul.
The report read 168 invoices and 23 open orders. A live explicit close-year detail
query returned 20 active deals and a follow-up returned USD 1,355,000, matching the
dashboard. Company associations and owner display were present. The UI also opened
the combined TR/DC&AI/license forecast dialog (35 rows, USD 830,446.44).
These observations are timestamped evidence, not fixed expected business totals.

The user confirmed there is no designated test Invoice/Deal. No real invoice was
changed to Paid, no customer classification was changed, and no real association
was created solely for testing. Therefore **live production writes, their resulting
HubSpot property histories, and the browser's removal of a real corrected issue
remain unverified**. Those need a designated test record or an actual intended
business correction. The automated server tests cover those success/error flows.

Excel download, responsive widths, complete keyboard navigation, historical-year
navigation and every UI action have not all been re-exercised in this run; do not
describe this report as a complete UI end-to-end certification. Active native
browser changes by the user interrupted further UI interactions.

The existing local refresh/caching edits predated this audit and are not part of
the audit fix commit. A missing 2027 target is an explicit supported warning state;
management must supply the 2027 targets before that year's target ratios are used.

## Remaining operational checks

- Verify a legitimate Paid operation and Invoice-to-Deal correction on designated
  records, then check HubSpot values/history, refresh and the hygiene counts.
- Finish the outstanding browser/export/responsive checks in an available session.
- Keep API version and Service Key lifecycle monitoring current. Tests cannot
  guarantee the future availability or behavior of an external API.
