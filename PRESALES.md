# Presales Customer Journey Portal

Internal tool, built **additively** on top of the Ereteam marketing site. It does not
touch any marketing page, Sanity schema, or existing route — it only adds new files
under the paths listed in "File map" below. If this gets abandoned, delete those
paths (and the env vars listed below) and the rest of the site is unaffected.

Built on branch `feature/presales-portal`, merged to `main` and **live in
production** (`ereteam.com`, deployed on Vercel). See "Deployment notes" below
for the two production-only gotchas that came up going live.

## Why this exists (business goal)

Today, when a prospect enters the presales pipeline (first meeting requested →
technical demo → scoping → proposal → won/lost), there's no single place that
tracks: which stage they're in, what they were asked, what they answered, what
was sent to them (proposal, project plan, recording), and who owns the deal.
That data is scattered across email/Drive/memory. This tool gives:

- **The prospect**: a single no-login link (`/presales/j/[token]`) showing their
  timeline, estimated remaining time, pending surveys to fill, and documents shared
  with them.
- **The sales/presales team**: an admin panel (`/presales/admin`, Basic-Auth
  protected) to create journeys, customize each case's stages, build/send surveys
  (from reusable templates or from scratch, with skip logic and "Diğer" free-text
  options), upload deliverables, assign a sales rep and a product/expertise area,
  archive dead cases, and get email pings when a customer takes action.
- **Later (not built yet)**: this is explicitly the foundation for AI-assisted
  analysis of presales data — "what do won deals have in common," "what did
  companies in the finance vertical answer at the scoping stage," etc. The admin
  chatbot (see below) is the first small step in that direction.

Stages and questions are **data, not code** — the process shown in the original
6-stage diagram was a first draft, not final, so both are fully editable from the
admin UI without a deploy.

## Stack & why

| Choice | Why |
|---|---|
| **Postgres on Neon** (hosted, not local) | Prospects need a real link that works from any machine — this can't be stuck on one laptop. Same SQL dialect as the eventual AWS target. |
| **Prisma ORM 7** (driver adapters, `prisma-client` generator) | Typed queries/migrations; the schema reshapes often (stages, questions) so migrations matter. |
| **Google Drive** for file storage | Reuses existing Workspace infra so staff can browse uploads directly. **Configured** — credentials live in `.env.local` (`GOOGLE_SERVICE_ACCOUNT_KEY`, base64-encoded service account JSON; `GOOGLE_DRIVE_ROOT_FOLDER_ID`, a Shared Drive id). The first upload for a journey auto-creates its folder under that root, named identically to `Journey.name` ("Firma - Ürün - Tarih"); every later upload for that journey reuses the same folder. Inside it, documents are further sorted into type-named subfolders — see "Document types & Drive folder structure" below. |
| **HTTP Basic Auth** via `middleware.ts` | One shared username/password for the small internal team — least code for v1. Upgradeable to per-staff auth later without a schema change. Editable in-app at `/presales/admin/account` (see below). |
| **Groq (`llama-3.1-8b-instant`)** | Already integrated for the marketing site's chat widget (`lib/services/llmService.ts`); reused as-is for the admin chatbot. |
| **Gmail SMTP** (`nodemailer`) for sales-rep notifications | Resend (already used for the marketing site's lead form) needs a verified sending domain before it'll deliver to real inboxes — see "Email delivery" below. Gmail SMTP as a real Workspace mailbox + app password works today with no domain verification step. |
| **SheetJS (`xlsx`, installed from SheetJS's own CDN, not the stale npm package)** | Client-side Excel generation/parsing for bulk question import and the sample-template download; server-side reuse for the survey-answer export/archive. |
| **No new UI framework** | Drag-and-drop reordering uses the native HTML5 DnD API (`DragReorderList.tsx`), reused for both stages and survey questions — not a new dependency. |

Sanity was deliberately not reused: it's a read-only CMS client here (no write
token configured), and this data is relational (surveys → questions → responses →
documents with real foreign keys), which fits Postgres, not schemaless documents.

## Data model (`prisma/schema.prisma`)

- `Prospect` — a company + primary contact (name, email, phone). No "source/kaynak"
  field — removed as unused.
- `SalesRep` — internal reps, assignable to a journey; customer sees their contact
  card when assigned.
- `Product` — a product/expertise area (e.g. "Financial Performance & Intelligence"),
  assignable to a journey the same way; customer sees it next to the sales rep.
- `Journey` — one presales case for one prospect. Holds the no-login `accessToken`,
  `name` (set once at creation as "Firma - Ürün - Tarih", e.g. "Ereteam - IBM
  Planning Analytics - 07.07.2026" — kept identical to the Drive folder created
  for it at that same moment; neither renames itself later if the company/product
  changes, so the two never drift apart), `status` (active/won/lost/paused — the
  *outcome*), `archived` (a boolean, fully independent of `status` — a won or lost
  case can also be archived; see "Archiving a case" below), `proposalRequested`
  (a manual, admin-only note for when a proposal was asked for ahead of schedule —
  it does **not** move any stage), `salesRepId`, `productId`, `driveFolderId`, and
  `linkDisabled` (manual kill-switch for the customer link — see "Customer link
  activation" below).
- `StageTemplate` — a named, reusable stage flow (e.g. "Varsayılan", "Enterprise
  Süreç"). Picked once on "Yeni Prospect"; its `StageDefinition` rows are copied
  into that journey's own `JourneyStage` rows and never referenced again. Exactly
  one template is flagged `isDefault` (pre-selected on the create form). A template
  can be duplicated (handy for starting a variant from an existing flow) but not
  deleted while it's the default or the last one remaining.
- `StageDefinition` — one stage within a `StageTemplate` (name, description,
  customer-facing description, estimated duration, position). Editing a template
  never changes journeys that already copied from it.
- `JourneyStage` — a **per-case copy** of a stage, freely editable (rename, hide,
  add one-off stages, reorder) without touching the template or other cases.
  Tracks `status` (pending/active/completed/skipped) independently per stage.
  Stages always progress **strictly in order**: only the single derived "current"
  stage (`lib/presales/stageProgress.ts` — the first stage, in order, that isn't
  completed/skipped) can be advanced, via `completeCurrentStage` in
  `lib/presales/adminActions.ts`, which also refuses to advance past a stage that
  still has a survey sent-but-not-answered. There is no free-form status picker
  and no way to activate a later stage while earlier ones are open — a case that
  genuinely needs a different flow is built that way directly (reorder or hide
  stages for that case), not by letting the system jump ahead. Mistakes can be
  undone one step with `reopenLastCompletedStage`.
- `SurveyTemplate` / `SurveyTemplateItem` — named, reusable question lists,
  authored once from the admin's "Anket Şablonları" page, not tied to any stage.
  Loaded as an optional starting point when building a real survey, then freely
  edited before sending.
- `SurveyInstance` / `SurveyQuestionSelection` — the actual survey sent to one
  customer for one stage; a snapshot of question text/type/options at send time
  (editing a template later never retroactively changes a survey already sent).
  Both `SurveyTemplateItem` and `SurveyQuestionSelection` carry `conditionOnOrder`
  (Int?) and `conditionValues` (Json?) for skip logic — see "Survey authoring"
  below. `options` (Json, a `string[]`) can encode a "Diğer" (other) choice by
  appending an invisible marker suffix to that option's stored string (see
  `lib/presales/surveyOptions.ts`) — this keeps every existing reader of
  `options: string[]` working unchanged instead of reshaping the column.
- `SurveyResponse` — the customer's answer to one question (text, JSON, or a
  linked uploaded `Document`). When a "Diğer" choice is picked with accompanying
  free text, the stored answer is the human-readable combined string
  (`"<label>: <free text>"`), not the raw marker-suffixed option.
- `Document` — a deliverable (see the type list below), optionally scoped to a
  stage, optionally customer-visible.
- `AdminCredential` — a singleton (at most one row) holding the shared admin
  Basic-Auth login; see "Admin login" below.

Ordering (`order` field on `StageDefinition`/`JourneyStage`/questions) is
maintained purely by drag-and-drop in the UI — there's no manual "order number"
field to fill in anywhere; new items are appended at the end automatically.

## Document types & Drive folder structure

Every journey gets exactly one Drive folder (named identically to `Journey.name`),
and every document — admin-uploaded, customer-uploaded, or system-generated —
lands in one of its type-named subfolders (created lazily on first use, via
`lib/presales/documentTypes.ts`'s `DOCUMENT_TYPE_FOLDER` map):

| `Document.type` | Drive subfolder | How it gets there |
|---|---|---|
| `survey` | Anket | Admin picks "Anket" in the upload form |
| `proposal` | Teklif | Admin upload |
| `meeting_note` | Toplantı Kaydı/Notu | Admin upload |
| `project_plan` | Proje Planı | Admin upload |
| `contract` | Sözleşme | Admin upload |
| `other` | Diğer | Admin upload (default/catch-all) |
| `survey_export` | Anket | Auto-archived Excel snapshot of a completed survey — lands alongside manually uploaded "Anket" documents, not in a separate folder |
| `customer_upload` | Müşteri Yüklemeleri | A file the customer attached while answering a `file_upload`-type survey question |

Only the six admin-facing types are selectable from the "Belgeler" upload form
(`DOCUMENT_TYPES` in the same file); `survey_export` and `customer_upload` are
set programmatically and never shown as choices. Sharing (anyone-with-link,
reader) is granted once on the top-level journey folder and inherited by every
subfolder/file created under it — subfolders don't need their own permission call.

**Upload size limit**: every file upload (admin document upload, customer
survey `file_upload` answers) is capped at `MAX_UPLOAD_BYTES` (4MB,
`lib/presales/fileUpload.ts`) — comfortably under Vercel's ~4.5MB serverless
request body ceiling, which Next.js itself has no way to raise. Enforced twice:
client-side (`FileSizeInput.tsx` for admin uploads, inline in
`SurveyAnswerForm.tsx` for customer uploads — clears the invalid file and shows
an error immediately, before any upload is attempted) and server-side in both
`uploadDocument` and `submitSurveyResponses` (defense in depth, since the
client-side check can be bypassed). The customer-facing check validates every
file_upload answer *before* uploading any of them, so a submission either
uploads everything or nothing — never leaves an orphaned partial upload in Drive.

## File map (everything added; nothing outside this list was touched)

```
prisma/schema.prisma, prisma/migrations/**, prisma/seed.ts, prisma.config.ts

lib/presales/db.ts               Prisma client singleton
lib/presales/auth.ts             Basic-auth check used by middleware.ts
lib/presales/tokens.ts           no-login access token generation
lib/presales/drive.ts            Google Drive upload wrapper (creates/reuses the journey folder + type subfolders)
lib/presales/documentTypes.ts    Document type list/labels + their Drive subfolder names
lib/presales/notify.ts           Gmail SMTP email to sales rep on customer actions
lib/presales/adminActions.ts     all admin Server Actions (create/update/reorder/assign/...)
lib/presales/adminChatContext.ts builds a text dump of the DB for the admin chatbot
lib/presales/stageProgress.ts    derives the single "current" stage from ordered stage list
lib/presales/journeyLink.ts      derives whether the customer link is effectively active
lib/presales/journeyStatus.ts    Turkish display labels for Journey.status (DB values stay English)
lib/presales/surveyOptions.ts    encode/decode the "Diğer" (other) marker on option strings
lib/presales/surveyExcel.ts      builds an .xlsx buffer of a survey's questions/answers
lib/presales/fileUpload.ts       shared MAX_UPLOAD_BYTES constant (upload size guard, see below)
lib/generated/prisma/**          generated Prisma client (gitignored, regenerate with `npx prisma generate`)

middleware.ts                    Basic-Auth gate for /presales/admin/** and /api/presales/admin/**

app/presales/_components/**      shared UI atoms, QuestionListEditor, DragReorderList, SubmitButton, FileSizeInput
app/presales/j/[token]/**        customer-facing journey page + survey answer pages/form + actions.ts
app/presales/admin/**            admin dashboard, prospects/new, stages, survey-templates,
                                  sales-reps, products, journeys/[id]/** (stages/surveys/documents/settings),
                                  AdminNav.tsx, AdminChatWidget.tsx, layout.tsx

app/api/presales/admin/chat/route.ts                              admin chatbot endpoint
app/api/presales/admin/journeys/[id]/surveys/[surveyId]/export/route.ts   admin-side survey Excel download
app/api/presales/public/surveys/[token]/[surveyId]/export/route.ts       customer-side survey Excel download
```

## Key flows

**Creating a case**: admin → "Yeni Prospect" → fills company/contact, and must
pick a sales rep, a product/expertise, and a stage template right there (all
three required — the stage template selector defaults to whichever one is
flagged as default) → that template's active `StageDefinition` rows are copied
into `JourneyStage` rows for this journey → customer link (`/presales/j/[token]`)
is generated immediately.

**Survey authoring** (`QuestionListEditor.tsx`, shared by "Anket Şablonları",
template editing, and the per-case survey builder):
- Questions can be freely added/removed and **reordered by drag-and-drop**
  (reuses `DragReorderList`, the same component used for stages).
- Tek Seçim/Çoklu Seçim options can each be flagged **"Diğer (serbest yazı)"** —
  when a respondent picks that option, a free-text field appears and the final
  answer is stored as `"<seçenek>: <yazdıkları>"`.
- Any question (after the first) can be made **conditional**: "Koşullu göster"
  → pick an earlier Tek Seçim/Çoklu Seçim question and which of its answers
  should reveal this one. On the customer form (`SurveyAnswerForm.tsx`, a client
  component) this is evaluated live as they answer — hidden questions are
  `disabled` (so they're skipped and never block on `required`), not removed,
  so toggling an earlier answer can bring a question back without losing what
  was already typed.
- Bulk authoring via Excel: "Örnek Excel İndir" generates a sample workbook
  client-side (SheetJS), "Excel'den Yükle" parses one back into the question
  list. (Bulk import doesn't support flagging "Diğer" or conditions — those are
  editor-only touches after import.)
- Once sent, a survey's questions are frozen — only answers can be viewed after that.

**Answering a survey / documenting the result**: customer fills the (conditional,
"Diğer"-aware) form → `submitSurveyResponses` saves responses, combines "Diğer"
free text into the answer, and — best-effort, never blocking the actual
submission — generates an Excel snapshot of the completed survey and uploads it
into the journey's Drive folder as a `survey_export` Document. Anyone (admin on
the results page, or the customer on their own "Cevaplarımı Gör" page) can also
pull that same Excel on demand via an "Excel İndir" button, independent of the
auto-archived copy.

Once every survey for a stage is completed, the stage auto-completes and the
next pending stage auto-activates — the customer's "current stage" marker
follows automatically since it's derived, not stored.

**Managing stage templates**: "Aşama Şablonları" lists all named `StageTemplate`s
(stage counts, which one is default). "Düzenle" opens `/presales/admin/stages/[id]`
— the actual per-template stage editor (add/edit/reorder/hide stages, same
`DragReorderList` UI as before, just scoped to one template now). "Çoğalt" clones
a template (all its stages) under a new name — the fastest way to start a variant
flow. "Varsayılan yap" switches which template pre-selects on "Yeni Prospect".

**Reordering stages**: both a stage template's editor page and a case's
"Aşamalar" tab render cards via `DragReorderList` — drag a card up/down, drop it,
and the new order is persisted server-side (`reorderStageDefinitions` /
`reorderJourneyStages`). There is no manual order number anywhere in the UI.

**Advancing a stage that has no survey** (e.g. a meeting): the case's "Aşamalar"
tab shows a single "Tamamla ve sıradakine geç" button, only on the current stage,
only when it has no unanswered sent survey — clicking it marks that stage
completed and activates the next one. If you complete a stage by mistake, "Geri
al" appears on the most recently completed stage to undo exactly that step.

**Dashboard: filters, bulk actions, per-case shortcuts** (`app/presales/admin/page.tsx`
+ `JourneyListWithSelection.tsx`): five combinable filters — Ara (search),
Durum, Satışçı, Ürün, Arşiv, and Müşteri Linki. Each journey card's heading is
the full `Journey.name` (not just the company name), shows the outcome badge
plus a separate "Arşivlendi" badge when archived, a "Müşteri Linki: Aktif/Pasif"
line, and two small buttons at the bottom-right — copy the customer link, or
open it in a new tab (both stop the card's own click-through navigation).
Checkboxes let you multi-select journeys and, from the bulk-action bar that
appears, change Durum, reassign Satışçı, toggle Müşteri Linki, or
archive/unarchive — all in one call across the whole selection
(`bulkSetJourneyStatus`/`bulkAssignSalesRep`/`bulkSetJourneyLinkDisabled`/
`bulkSetJourneyArchived` in `lib/presales/adminActions.ts`).

**Durum labels & Kapanış Tarihi**: `Journey.status` values stay English in the
DB (`active`/`won`/`lost`/`paused`) but always display via the Turkish labels
in `lib/presales/journeyStatus.ts` (Aktif/Kazanıldı/Kaybedildi/Duraklatıldı) —
every status badge, dropdown, and filter across the admin panel goes through
that one map. Ayarlar → "Durum" also has a "Kapanış Tarihi" date field
(`Journey.outcomeSetAt`): leave it blank and set the status to
Kazanıldı/Kaybedildi and it auto-fills with today; type a specific date and
it's saved exactly as entered; revert the status to Aktif/Duraklatıldı and it
clears automatically (a close date only means something once a case is
actually closed).

**Save confirmation**: `SubmitButton.tsx` (shared by essentially every admin
form) flashes a "✓ Kaydedildi" checkmark for ~1.8s right after a Server Action
actually finishes — not just on click. This is one shared component, so it
applies automatically everywhere it's already used; no per-form wiring needed.

**Archiving a case**: `Journey.archived` is a boolean fully independent of
`Journey.status` — a won or lost case can also be archived (archiving is about
tidying up, not about outcome). Ayarlar has two separate controls: "Durum"
(the active/won/lost/paused outcome, `setJourneyOutcome`) and "Arşiv" (the
archive toggle, `setJourneyArchived`/`bulkSetJourneyArchived`). The dashboard
has a matching, separate "Arşiv" filter (Tümü/Arşivlenmemiş/Arşivlenmiş) plus
its own bulk-action buttons, and shows a distinct gray "Arşivlendi" badge next
to the outcome badge on any archived journey (dashboard rows and the journey
header) so both facts stay visible at once. Archiving a journey also
auto-disables its customer link — see next.

**Customer link activation**: the no-login link is only ever live when
`Journey.status === "active"`, it hasn't been manually disabled, and it isn't
archived (`lib/presales/journeyLink.ts`, `isJourneyLinkActive()`). Ayarlar →
"Müşteri Linki" shows the effective state (Aktif/Pasif badge) and a one-click
toggle (`setJourneyLinkDisabled`) independent of the outcome status. When
inactive, the customer sees a plain "Bu bağlantı artık aktif değil" screen
instead of any journey content — enforced identically on the main page, the
per-survey answers page, the submit action, and the public Excel-export
route, so a disabled/archived case can't leak data through any side door.

**Admin chatbot**: bottom-right widget on every `/presales/admin/**` page. On each
message it fetches essentially the whole presales DB (prospects, journeys, stages,
survey questions + answers, document titles — capped at the 150 most recent
journeys, answers truncated to 400 chars) via `buildAdminChatContext()`, stuffs it
into the Groq system prompt, and explicitly instructs the model to answer only from
that data and say "I don't have that" otherwise (`app/api/presales/admin/chat/route.ts`).
It reuses the same `generateChatResponse` helper the marketing site's chat already
uses — no new LLM integration, just a different context builder and system prompt.

## Email delivery: Gmail SMTP, not Resend

Sales-rep email notifications (`lib/presales/notify.ts`) send via **Gmail
SMTP** (`nodemailer`, `GMAIL_USER`/`GMAIL_APP_PASSWORD`), not Resend. Resend was
tried first (still used for the marketing site's lead form, `app/api/lead/route.ts`)
but its sandbox mode only delivers to the account owner's own address until a
sending domain is verified at resend.com/domains — confirmed by testing the API
directly. Gmail SMTP has no equivalent restriction: it sends as a real Workspace
mailbox (`kariturk@ereteam.com`, via an app password, not the account password),
so delivery to any real sales rep works immediately — confirmed live. If
`GMAIL_USER`/`GMAIL_APP_PASSWORD` are ever unset, notifications silently no-op
(logged to the server console, never surfaced to the customer, by design — a
notification failure must never block their submission).

## Admin login (editable in-app)

`/presales/admin/account` shows the current shared username/password in plain
text and lets you change them — saving writes to a singleton `AdminCredential`
DB row, which takes effect immediately (no redeploy). If no row exists yet, the
gate falls back to `ADMIN_BASIC_USER`/`ADMIN_BASIC_PASS`. `middleware.ts` runs
in the Edge Runtime, where the regular Prisma client (node-postgres driver)
isn't usable, so `lib/presales/auth.ts` reads this one table via
`@neondatabase/serverless`'s fetch-based client instead — the only place in the
codebase that bypasses the normal Prisma singleton. Changing the password
invalidates every open browser session's cached credentials immediately; the
next request from any of them gets a fresh 401 and browsers re-prompt.

## Deployment notes (two production-only bugs hit going live)

Both confirmed via live Vercel deployment/log inspection — neither reproduced
in local dev or a local production build (`next start`), which is exactly why
they're worth writing down:

- **Prisma client wasn't being generated on Vercel.** `lib/generated/prisma`
  is gitignored (it's generated output), and `npm run build` was just
  `next build` — nothing regenerated the client during Vercel's build, so it
  failed with `Module not found: Can't resolve '@/lib/generated/prisma/client'`.
  Fixed with a `postinstall: prisma generate` script in `package.json`, which
  runs automatically right after `npm install` on every install (Vercel's and
  a fresh local clone's alike) — always before `next build` runs.
- **Env vars pasted into Vercel's dashboard can carry a trailing newline.**
  `GOOGLE_DRIVE_ROOT_FOLDER_ID` had one in production, so every Drive call used
  `"<id>\n"` as the parent folder id — Drive doesn't fuzzy-match, so every
  upload failed with a 404 "File not found". Fixed by `.trim()`-ing every
  env var that's used as an exact-match value: `GOOGLE_DRIVE_ROOT_FOLDER_ID`
  (`lib/presales/drive.ts`), `ADMIN_BASIC_USER`/`ADMIN_BASIC_PASS`
  (`lib/presales/auth.ts`), and `GMAIL_USER`/`GMAIL_APP_PASSWORD`
  (`lib/presales/notify.ts`) — this fixes it in code regardless of whatever
  whitespace ends up stored in the hosting provider's env var UI, no need to
  also re-edit the value there.

## Known limitation: concurrent editing

The shared Basic-Auth login (see below) has no per-user identity, and no form or
action anywhere checks "has this record changed since I loaded it" (no optimistic
locking / version field). That's fine for a small team working on different cases,
but two people editing the *same* record within the same few seconds can clash:

- **Stale-field overwrite**: edit forms re-submit every field they render, filled
  with whatever was loaded when the page opened. If A opens a stage, B opens the
  same stage, B changes the description and saves, then A changes the name and
  saves — A's save still carries A's now-stale copy of the description and quietly
  reverts B's edit. No warning is shown either side.
- **Drag-and-drop reorder**: if two people reorder the same stage/question list at
  the same time, the last write wins; the other person's browser shows the old
  order until they reload. No data loss, just a stale view.
- **Document upload race**: `uploadDocument` (`lib/presales/adminActions.ts`) only
  creates a journey's Drive folder if `journey.driveFolderId` is still null at the
  time of upload, then writes the new folder id back. Two *simultaneous* first
  uploads to the same journey can each see `null`, each create their own Drive
  folder, and only one folder id ends up saved — the other upload's folder becomes
  orphaned/untracked.

None of these corrupt data outright, and the odds are low unless multiple people
are actively working the same case within the same moments. If concurrent editing
of the same case becomes a real workflow, the fix is per-staff login (instead of
one shared login) plus an `updatedAt`-based conflict check on writes.

## Environment variables

```
DATABASE_URL                 # Neon Postgres connection string
ADMIN_BASIC_USER             # shared admin login — fallback only; overridden once /presales/admin/account is used
ADMIN_BASIC_PASS
GROQ_API_KEY                 # already used by the marketing chat widget too
GMAIL_USER                   # sales-rep email notifications — a real Workspace mailbox (optional — logs a warning and skips if unset)
GMAIL_APP_PASSWORD           # app password for that mailbox, not its account password
NEXT_PUBLIC_APP_URL          # used to build links inside notification emails
GOOGLE_SERVICE_ACCOUNT_KEY   # base64-encoded service account JSON key
GOOGLE_DRIVE_ROOT_FOLDER_ID  # a Shared Drive id (not a regular "My Drive" folder — service
                             # accounts have no storage quota outside Shared Drives)
```

## Deferred / not built

- Customer-facing email notifications (survey assigned, document uploaded) —
  deliberately not built yet; only the sales-rep side sends email today.
- Per-staff login (currently one shared Basic-Auth login for the whole team).
- HubSpot / Fireflies / Google Forms integrations.
- Any automated AI analysis beyond the admin chatbot's read-only Q&A.

## If this gets abandoned

Delete `PRESALES.md`, the paths under "File map" above, and the env vars listed
above. Nothing else in the repo references them — the marketing site (`app/`,
`lib/sanity/**`, `lib/siteData.ts`, `lib/getChatContext.ts`, etc.) has zero
dependency on any of this.
