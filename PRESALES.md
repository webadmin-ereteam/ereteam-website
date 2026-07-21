# Presales Customer Journey Portal

Internal tool, built **additively** on top of the Ereteam marketing site — it
adds new files under the paths listed in "File map" below, plus a handful of
one-line touches to shared marketing files (hiding the marketing nav/footer/chat
widget on `/presales/**`, a robots.txt disallow, and one CookieYes-banner fix —
all called out explicitly in the file map). If this gets abandoned, delete
those paths and touches (and the env vars listed below) and the rest of the
site is unaffected.

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
- **The sales/presales team**: an admin panel (`/presales/admin`, behind a login
  page) to create journeys, customize each case's stages, build/send surveys
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
| **Signed session cookie** via `middleware.ts` | One shared username/password for the small internal team, entered on a real login page (`/presales/login`) instead of the browser's native Basic-Auth prompt — see "Admin login" below. Upgradeable to per-staff auth later without a schema change. |
| **Groq (`llama-3.1-8b-instant`)** | Already integrated for the marketing site's chat widget (`lib/services/llmService.ts`); reused as-is for the admin chatbot. |
| **Gmail SMTP** (`nodemailer`) for sales-rep notifications | Resend (already used for the marketing site's lead form) needs a verified sending domain before it'll deliver to real inboxes — see "Email delivery" below. Gmail SMTP as a real Workspace mailbox + app password works today with no domain verification step. |
| **SheetJS (`xlsx`, installed from SheetJS's own CDN, not the stale npm package)** | Client-side Excel generation/parsing for bulk question import and the sample-template download; server-side reuse for the survey-answer export/archive. |
| **No new UI framework** | Drag-and-drop reordering uses the native HTML5 DnD API (`DragReorderList.tsx`), reused for both stages and survey questions — not a new dependency. |

Sanity was deliberately not reused: it's a read-only CMS client here (no write
token configured), and this data is relational (surveys → questions → responses →
documents with real foreign keys), which fits Postgres, not schemaless documents.

## Data model (`prisma/schema.prisma`)

- `Prospect` — a company + primary contact (name, email, phone). No "source/kaynak"
  field — removed as unused. `logoDriveFileId`/`logoUrl` hold an optional company
  logo, `logoAlign` (`"left"` default / `"center"` / `"right"`) its horizontal
  position on the customer page — see "Company logo" below.
- `SalesRep` — internal reps, assignable to a journey; customer sees their contact
  card when assigned.
- `TechnicalLead` — mirrors `SalesRep` (same CRUD at `/presales/admin/technical-leads`,
  reassignable any time from Ayarlar) but is **never shown to the customer**.
  Its only purpose is a second, silent notification target: when a survey is
  completed, `notifyTechnicalLead` (in `notify.ts`) emails them the raw
  answers as an Excel attachment — the same buffer built for the Drive
  archive in `j/[token]/actions.ts` — instead of the "view journey" link
  `notifySalesRep` sends, since a technical lead isn't expected to log into
  the admin tool. Unlike `salesRepId`, `technicalLeadId` on `Journey` is
  required at creation (same as `salesRepId`/`productId` — `createProspectAndJourney`
  rejects a missing one), even though the column itself stays nullable —
  it's only optional in the schema so `deleteTechnicalLead`'s `ON DELETE
  SET NULL` has somewhere to fall back to, not because a new case can skip it.
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
  it does **not** move any stage, but is surfaced as a pink "Teklif talep edildi"
  badge on the dashboard card and the Genel Bakış banner, and as a customer-facing
  "Teklif talebiniz alındı..." notice card on their journey page, so marking it
  actually shows up somewhere instead of being buried in Ayarlar), `salesRepId`,
  `productId`, `driveFolderId`, and `linkDisabled` (manual kill-switch for the
  customer link — see "Customer link activation" below). `productId` is set
  once at creation and **locked after that** — `assignProduct` refuses a second
  call once it's non-null, and the Ayarlar tab shows the product as read-only
  text instead of a form once assigned (a journey's name and Drive folder are
  both derived from the product chosen at creation, so changing it later would
  desync them). A journey can be deleted outright (`deleteJourney`, Ayarlar
  tab "Tehlikeli Bölge") — see "Deleting a journey" below.
- `StageTemplate` — a named, reusable stage flow (e.g. "Varsayılan", "Enterprise
  Süreç"). Picked explicitly every time on "Yeni Prospect" — no default is
  pre-selected, so it's always a deliberate choice; its `StageDefinition` rows
  are copied into that journey's own `JourneyStage` rows and never referenced
  again. There used to be an `isDefault` flag (one template pre-selected on
  the create form) — removed after it caused confusion (a renamed/no-longer-
  intended-default template kept showing as default on "Yeni Prospect" due to
  a caching bug, see below), so now every case starts by explicitly picking a
  template. A template can be duplicated (handy for starting a variant from an
  existing flow) but not deleted while it's the last one remaining.
- `StageDefinition` — one stage within a `StageTemplate` (name, customer-facing
  fields, estimated duration, position). Editing a template never changes
  journeys that already copied from it. The schema still has an internal-only
  `description` column, but neither stage editor (template or per-case)
  exposes it in the UI anymore — it added nothing the customer-facing fields
  didn't already cover, so it was dropped from both the bulk-edit cards and
  the "Yeni Aşama Ekle" form. The bulk-save action no longer writes that
  column at all (rather than writing it as blank), so whatever value old rows
  already have is left untouched. Two customer-facing fields remain, both
  shown while the stage is current — there is **no "only while the ball is in
  our court" gating anymore**, that restriction was removed:
  - `customerDescription` ("Timeline altında gösterilen açıklama") — a short
    line rendered directly under the stage's step marker in the timeline.
  - `customerWaitingMessage` ("Müşteri ekranında gösterilen ana mesaj") — the
    stage's main message, rendered as its own card above whatever else is
    showing (a pending survey form, or the "nothing to do right now" card).
    It used to only render inside that empty-state card, so it silently
    disappeared the moment a survey was sent for the stage — now it always
    shows for the current stage regardless of pending surveys. Renders
    nothing if left blank (the empty-state card still shows its own fixed
    copy in that case).
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
  undone one step with `reopenLastCompletedStage`. Both `StageDefinition` and
  `JourneyStage` rows can be deleted outright now (`deleteStageDefinition`/
  `deleteJourneyStage`) — see "Deleting a stage" below for the safety rules
  around each.
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
  (`"<label>: <free text>"`), not the raw marker-suffixed option. Rows are
  written via **upsert**, not create-only — a "Taslağı Kaydet" (draft save,
  see "Answering a survey" below) can write a row before the real "Gönder"
  does, and the final submit revises it in place rather than colliding on the
  unique `surveyQuestionSelectionId` constraint.
- `Document` — a deliverable (see the type list below), optionally scoped to a
  stage, optionally customer-visible. Visibility on the customer page is
  driven **solely** by `customerVisible` — it used to also require the
  document's stage to have started, which silently hid documents uploaded
  ahead of time for a future stage; that extra gate was removed.
- `AdminCredential` — a singleton (at most one row) holding the shared admin
  login; see "Admin login" below.

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
lib/presales/auth.ts             getEffectiveAdminCredentials() — used by the login page + account settings page
lib/presales/session.ts          signs/verifies the admin session cookie (Web Crypto, no DB access — middleware-safe)
lib/presales/sessionActions.ts   loginAdmin / logoutAdmin Server Actions
lib/presales/tokens.ts           no-login access token generation
lib/presales/drive.ts            Google Drive upload wrapper (creates/reuses the journey folder + type subfolders);
                                  uploadFileToDrive() creates file metadata and media content in two separate
                                  calls (not one combined multipart request) — googleapis' multipart upload
                                  doesn't declare a charset on the metadata part, which mangled Turkish
                                  characters (ı/ş/ğ/ü/ö/ç) in file names; copyExistingDriveFile() + extractDriveFileId()
                                  handle linking an already-existing Drive file instead of uploading one (see below)
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
lib/presales/dateRangePresets.ts DATE_RANGE_PRESETS + resolveDateRangePreset() — Bugün/Bu Ay/Geçen
                                  Ay/Bu Yıl presets shared by the dashboard's Kapanış/Oluşturma filters
lib/presales/formatDate.ts       formatDisplayDate() — shared "-" fallback for null dates
lib/generated/prisma/**          generated Prisma client (gitignored, regenerate with `npx prisma generate`)

middleware.ts                    session-cookie gate for /presales/admin/** and /api/presales/admin/**

app/presales/login/page.tsx      admin login form (posts to loginAdmin)
app/presales/_components/**      shared UI atoms, QuestionListEditor, DragReorderList, SubmitButton, FileSizeInput
app/presales/j/[token]/**        customer-facing journey page + survey answer pages/form + actions.ts
app/presales/admin/**            admin dashboard, prospects/new, stages, survey-templates (+ [id] editor),
                                  sales-reps (incl. SalesRepRow.tsx — inline edit toggle), products,
                                  journeys/[id]/** — page.tsx is "Genel Bakış" (the
                                  default landing tab, see below), stages/ is the old per-case stage editor
                                  (moved out of the base route to make room for Genel Bakış), plus
                                  surveys/documents/settings, AdminNav.tsx (incl. logout button),
                                  AdminChatWidget.tsx, layout.tsx

app/api/presales/admin/chat/route.ts                              admin chatbot endpoint
app/api/presales/admin/journeys/[id]/surveys/[surveyId]/export/route.ts   admin-side survey Excel download
app/api/presales/public/surveys/[token]/[surveyId]/export/route.ts       customer-side survey Excel download

--- one-line touches to existing marketing-site files (not new files) ---
app/robots.ts                     added Disallow: /presales/j/ and /presales/admin/
components/layout/Navbar.tsx      renders null on any /presales/** path
components/layout/Footer.tsx      renders null on any /presales/** path
components/ChatWidget.tsx         renders null on any /presales/** path
components/CookieBannerGate.tsx   NEW — hides the CookieYes consent banner on /presales/** (it's a
                                   raw <Script>, so it can't self-check the route like the three above)
app/layout.tsx                    renders <CookieBannerGate /> alongside Navbar/Footer/ChatWidget
lib/services/llmService.ts        generateChatResponse() takes an optional {model,temperature,maxTokens}
                                   argument now, reused as-is by the admin chatbot; unchanged for existing callers
```

## Key flows

**Creating a case**: admin → "Yeni Prospect" → fills company/contact, and must
pick a sales rep, a technical lead, a product/expertise, and a stage template
right there (all four required, none pre-selected — every "Seçiniz" dropdown
starts blank, deliberately, after the old stage-template-default confusion)
→ that template's active `StageDefinition` rows are copied into `JourneyStage`
rows for this journey → customer link (`/presales/j/[token]`) is generated
immediately.

**Creating a survey template** ("Anket Şablonları"): same two-step shape as
stage templates — the list page's "Yeni Şablon Oluştur" only asks for a name
(`createSurveyTemplate`, no questions required), then redirects straight to a
dedicated editor at `survey-templates/[id]` where the actual question editor
lives. Editing later reopens that same page (`renameSurveyTemplate` for the
name field, `updateSurveyTemplate` for the question list) — the list page
itself never shows a question editor inline anymore. "Çoğalt"
(`duplicateSurveyTemplate`) clones a template and all its questions under
`"<isim> (kopya)"` — same fixed-suffix convention as `duplicateStageTemplate`
for stage templates, not a counter, so duplicating the same template twice
stacks `"(kopya) (kopya)"`. Nothing enforces unique template names at the DB
level; this exists purely so two templates never look identical in the list
by accident.

**Creating a per-case survey** (`surveys/new`, `createSurveyInstance`): pick a
stage (only stages with `surveysEnabled` show up) and optionally load a
`SurveyTemplate` as a starting point, then customize freely before saving as
`status: "draft"`. Saving redirects to the case's **Anketler** tab, not back
to Genel Bakış — that list shows every survey for the case with the "Gönder"
button right on it, so the draft just built is immediately there to send
instead of requiring a click back into it. The "Aşama" selector defaults to
the case's actual **current stage** (`findCurrentStage`) when reached without
a `?stageId=` — as from the "Anketler" tab's generic "+ Yeni Anket" button —
falling back to the first surveys-enabled stage only if the current stage
doesn't take surveys. This used to default to `stages[0]` unconditionally,
i.e. always the *first* surveys-enabled stage regardless of where the case
actually was; a real journey hit this — a survey meant for "Teknik Demo
Soruları" got silently created under "İlk Anket" instead, which meant that
survey's completion never auto-advanced the stage it was actually answering
(its stage's own auto-advance check only ever looks at surveys attached to
*that* stageId) and "Teknik Demo Soruları" itself never got the answers
associated with it. The "Anket Oluştur" link on Genel Bakış was never
affected — it always passed `?stageId=${currentStage.id}` explicitly.

**Editing a draft survey** (`surveys/[surveyId]/edit`, `updateSurveyInstance`):
while a per-case survey is still `status: "draft"` it can be reopened from the
**Anketler** tab's "Düzenle" button and its title/questions edited freely,
same `QuestionListEditor` as creation — deletes and recreates the
`SurveyQuestionSelection` rows, mirroring `updateSurveyTemplate`. The action
throws if the survey isn't a draft, and the edit page itself redirects a
`sent`/`completed` survey straight to the read-only results page instead of
showing a form that would just error on submit — once a survey is sent a
customer may already be looking at (or have answered) the questions, so this
is the same "can't change a sent survey's questions" rule as before, just
now with an actual editor available beforehand instead of only being able to
delete-and-recreate the whole survey to fix a typo in a draft.

**Deleting a sent/completed survey** (`deleteSurveyInstance`): the Anketler
tab's "Sil" button next to "Sonuçları Gör" removes a `sent` or `completed`
survey instance and its `SurveyQuestionSelection`/`SurveyResponse` rows
outright — since the customer page just filters `journey.surveyInstances` by
status, deleting the row is what makes it disappear from the customer's
screen too (both paths revalidated). What it deliberately does **not** touch
is the `survey_export` `Document` row (and the actual Excel file in Drive)
that gets created when a survey is completed — same "never touch Drive
automatically" rule as `deleteJourney` — so if the survey had already been
answered, that Excel snapshot survives the delete even though the
`SurveyInstance` it came from is gone. `SubmitButton`'s `confirmMessage`
warns about this distinction before submitting (different wording for
completed vs. merely sent, since only the former has answers/an export to
lose).

**Survey authoring** (`QuestionListEditor.tsx`, shared by "Anket Şablonları",
template editing, and the per-case survey builder):
- Questions can be freely added/removed and **reordered by drag-and-drop**
  (reuses `DragReorderList`, the same component used for stages).
- Tek Seçim/Çoklu Seçim questions can have **one "Diğer" option**, added via
  its own "+ Diğer seçeneği ekle" button (hidden once the question already
  has one) rather than a per-option checkbox — pre-filled with the text
  "Diğer" so it's never saved blank. That matters because `parseQuestionSlots`
  silently drops any option whose text is blank, `isOther` flag included; the
  original per-option-checkbox design let someone check "Diğer" on a
  freshly-added, still-empty option and have it vanish on save with no
  indication why. When a respondent picks the "Diğer" option, a free-text
  field appears and the final answer is stored as `"<seçenek>: <yazdıkları>"`.
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
  editor-only touches after import.) "Soruları Excel'e Aktar" is the reverse
  direction — exports the editor's *current* question list (not a sample) in
  the exact same column shape "Excel'den Yükle" reads, so a template (or a
  survey being built) can be pulled out, edited, and re-imported. It reads
  only live in-memory state, so it works identically everywhere
  `QuestionListEditor` is used; each call site passes an `exportFileNameHint`
  (the template/survey name) to name the downloaded file.
- Once sent, a survey's questions are frozen — only answers can be viewed after that.

**Answering a survey / documenting the result**: customer fills the (conditional,
"Diğer"-aware) form → `submitSurveyResponses` saves responses, combines "Diğer"
free text into the answer, and — best-effort, never blocking the actual
submission — generates an Excel snapshot of the completed survey and uploads it
into the journey's Drive folder as a `survey_export` Document. Anyone (admin on
the results page, or the customer on their own "Cevaplarımı Gör" page) can also
pull that same Excel on demand via an "Excel İndir" button, independent of the
auto-archived copy.

The two on-demand "Excel İndir" API routes (`.../surveys/[surveyId]/export`,
admin and public) used to **fail outright** — not just show a mangled name —
for essentially every real Turkish survey title. `Content-Disposition:
attachment; filename="..."` is a raw HTTP header value, and `ı`/`ğ`/`ş`/`İ`
(routine in Turkish — "sorular**ı**" alone triggers it) sit outside Latin-1,
so `new Response()` threw `Cannot convert argument to a ByteString` while
constructing the response, before any bytes were ever sent. Fixed by
`contentDispositionHeader()` in `lib/presales/surveyExcel.ts`, which emits
both an ASCII-safe `filename="..."` fallback and the RFC 5987
`filename*=UTF-8''<percent-encoded>` form browsers actually use — same
pattern that already made the Drive upload path safe for Turkish characters,
just applied to an HTTP header instead of a Drive API field.

**Saving a survey as a draft** (`saveSurveyDraft` in `app/presales/j/[token]/actions.ts`):
a second button, "Taslağı Kaydet", sits next to "Gönder" on every pending
survey — it uses `formNoValidate` so partially-filled required fields don't
block it, upserts whatever's been answered so far, and leaves the survey
`status` at `"sent"` (no completion side-effects: no stage auto-advance, no
sales-rep notification, no Excel export). The customer can leave and come back
to the same link later — `SurveyAnswerForm.tsx` prefills every field
(including which "Diğer" option was picked and its free text) from any prior
draft response. File-upload questions show "Zaten yüklendi: <ad>" once
answered and stop being required, so re-saving without re-choosing a file
doesn't block submission or wipe out the earlier upload.

Once every survey for a stage is completed, the stage auto-completes and the
next pending stage auto-activates — the customer's "current stage" marker
follows automatically since it's derived, not stored.

**Managing stage templates**: "Aşama Şablonları" lists all named `StageTemplate`s
(stage counts). "Düzenle" opens `/presales/admin/stages/[id]` — the actual
per-template stage editor (add/edit/reorder/hide stages, same `DragReorderList`
UI as before, just scoped to one template now). "Çoğalt" clones a template
(all its stages) under a new name — the fastest way to start a variant flow.
"Sil" (`deleteStageTemplate`) removes a template outright — the action refuses
to delete the last remaining template (so there's always at least one to pick
from on "Yeni Prospect"), no other restriction. Every create/rename/duplicate/
delete here also revalidates `/presales/admin/prospects/new`, not just
`/presales/admin/stages` — that page reads the same table independently, and
missing this revalidation used to be exactly why a newly created template
didn't show up there without an unrelated page load happening to refresh it
first. Same fix applied to sales reps/technical leads/products, which had the
same gap.

**Company logo** (`uploadCompanyLogo`/`removeCompanyLogo` in
`lib/presales/adminActions.ts`, `uploadLogoToDrive()`/`trashDriveFile()` in
`lib/presales/drive.ts`): an optional image, settable either right on "Yeni
Prospect" alongside the rest of the intake info, or later from a journey's
Ayarlar tab, where "Kaldır" removes it again (clears `Prospect.logoDriveFileId`/
`logoUrl` and trashes the Drive file — best-effort, doesn't block the DB
update if the Drive call fails). Stored in its own top-level Drive folder,
`_Logolar` — deliberately **not** inside any journey's own folder, since a
logo is a small website asset, not a business document, and shouldn't clutter
a journey's real deliverables. `_Logolar` gets its own "anyone can view"
permission grant at creation (it has no parent journey folder to inherit
sharing from). `Prospect.logoUrl` is a Drive **thumbnail-serving** link
(`drive.google.com/thumbnail?id=...`), not `webViewLink` — the latter opens
Drive's own viewer page and isn't directly usable as an `<img src>`; the
thumbnail endpoint does preserve PNG transparency (confirmed: fetching it
back returns an 8-bit RGBA PNG). On the customer page it's shown **large**
(h-11, h-14 on `sm`+) directly above the "Merhaba X" heading, not cropped
into a small circle — a first version squeezed it into the tiny 20px
company-name pill with a forced `rounded-full` + white background, which
looked cramped and put a visible white halo around anything that wasn't
already a circular logo. `object-contain`, no background, no rounding — we
tell admins to upload a transparent PNG so it just sits on the gradient. The
"Yeni Prospect" and Ayarlar upload forms don't set a background either, for
the same reason. Only the logo/company-name row itself gets a `text-align`
from `Prospect.logoAlign` (`setProspectLogoAlign`, a "Sola/Ortaya/Sağa"
select on the Ayarlar tab, right under the logo preview) — not the whole
hero column — since the "Merhaba X" heading below it is usually wider than
the logo, which otherwise looks pinned to the left edge under it with no
way for an admin to fix it themselves (different logos need different
positions depending on their own whitespace/aspect ratio).

**Managing sales reps** (`/presales/admin/sales-reps`, `SalesRepRow.tsx`):
each rep row has its own client-side "Düzenle" toggle — clicking it swaps the
row for an inline form (name/email/phone/title, `updateSalesRep`) in place,
no separate edit page. "Vazgeç" collapses it back without saving. Reps can
also be activated/deactivated or deleted from the same row; only active reps
are offered when assigning a rep to a journey. The "Yeni Satışçı Ekle" /
"Yeni Ürün / Uzmanlık Ekle" forms on this page and `/presales/admin/products`
are likewise collapsed behind a "+ ..." toggle button by default
(`NewSalesRepForm.tsx`/`NewProductForm.tsx`, both the same
`useState`-toggle-then-await-then-collapse shape as `SalesRepRow.tsx`'s
inline edit) rather than sitting permanently open at the bottom of the
list — the always-visible form read as the primary thing on the page even
though adding a new one is the rarer action next to editing existing rows.

**Reordering stages**: both a stage template's editor page and a case's
"Aşamalar" tab render cards via `DragReorderList` — drag a card up/down, drop it,
and the new order is persisted server-side (`reorderStageDefinitions` /
`reorderJourneyStages`). There is no manual order number anywhere in the UI.

**Editing several stages at once**: both stage screens used to have a separate
"Kaydet" per card — editing five stages meant five saves. Now every card on
the screen lives inside **one shared `<form>`**, fields named `stage_{index}_*`
(same convention `parseQuestionSlots` uses for survey questions), with a single
sticky "Tüm Değişiklikleri Kaydet" button at the bottom (`saveAllStageDefinitions`
/ `saveAllJourneyStages`, one transaction per save). Reordering, activate/
deactivate, complete/reopen, and delete all stay **instant, single-click**
actions — each is a `<button formAction={...}>` inside that same shared form
(not its own nested `<form>`, which HTML doesn't allow), so clicking one of
them doesn't require or wait on the "Tüm Değişiklikleri Kaydet" button.

**Deleting a stage** — the safety rules differ by which screen you're on:
- A **template** stage (`deleteStageDefinition`) is always safe to delete —
  journeys that already copied it keep their own independent `JourneyStage`
  row regardless, so their `sourceStageDefinitionId` is just nulled out
  (lineage pointer only, nothing functional depends on it) before the delete.
- A **case's own** stage (`deleteJourneyStage`) can have real history —
  `SurveyInstance.stageId` is required, so a stage with any survey already
  attached **refuses to delete** ("Bu aşamaya bağlı anket(ler) var..." — use
  "Bu case'te gizle" instead). A stage with no surveys deletes cleanly; any
  `Document` scoped to it just loses that scoping (`Document.stageId` is
  optional) and becomes "genel" instead of being deleted or blocking the stage.

**Deleting a journey** (`deleteJourney`, Ayarlar tab "Tehlikeli Bölge"):
deletes the journey and everything in Postgres that points at it — documents,
survey responses/selections/instances, stages — in one transaction, then
redirects to the dashboard. Deliberately does **not** touch Drive: the
journey's Drive folder can hold real business files (proposals, meeting
recordings), and an automated delete there is unrecoverable if a folder id
ever pointed at the wrong place, unlike a DB row. So Drive cleanup stays a
manual step — the warning text links straight to the folder
(`drive.google.com/drive/folders/<driveFolderId>`, or names it by journey
name if the folder was never lazily created) and repeats the same warning
inside the native `confirm()` prompt (`SubmitButton`'s new `confirmMessage`
prop) before the delete actually fires. `Prospect` is left alone too — a
company record can outlive any one journey against it.

**Admin visual language** (`app/presales/_components/ui.tsx`): shared
primitives (`Card`, `Badge`, `FieldLabel`, `inputClass`, `buttonPrimaryClass`)
were refined for a cleaner, more "enterprise SaaS" look — softer/layered card
shadows, an "outlined tint" badge style (low-opacity background + thin
matching ring, e.g. `bg-emerald-500/[0.08]` + a ring, not a flat pastel
`bg-emerald-100` fill) instead of solid pastel pills, and a new `FieldLabel`
atom for form fields whose meaning isn't obvious from placeholder text alone
(placeholder disappears once you start typing — the three free-text fields on
a stage card are exactly this case). Two specific choices worth calling out
because they were reverted once already: the **dashboard stat cards** went
through a "single unified strip with dot accents" redesign that read as
worse, not better, and were reverted back to five separate icon-in-a-tinted-box
`Card`s (the original shape) — so don't re-attempt that particular strip
layout without a concrete reason. Primary buttons (`buttonPrimaryClass`) and
initials-avatar circles (journey cards, journey header, sales rep rows) both
used to be a blue→magenta gradient; both are now a **solid** `bg-brand-primary`
fill (avatars: a soft `bg-brand-primary/10` tint with brand-primary text) —
a two-color diagonal gradient repeated on every button/avatar read as
"template-y" rather than premium once actually compared side by side.
A later pass added real branding to the three places that still used a
generic placeholder (`AdminNav.tsx`'s sidebar header and `presales/login`
both had a plain "Sparkles" icon in a gradient box) — both now show the
actual `public/logos/ereteam-logo.png` lockup, `brightness-0 invert`'d to
white on their dark backgrounds, matching exactly how the main site's
`Navbar`/`Footer` already treat this same asset on dark backgrounds; the
login page keeps it in full color since its card sits on white. Gradient use
stayed confined to **decoration only** (a second background blob on the
sidebar/login, a short gradient accent bar above `PageHeader` titles reusing
the same brand-primary→brand-magenta pair as the sidebar's active-nav
indicator and a survey card's top strip) — never on buttons or avatars,
per the reverted-gradient lesson directly above.

**Uploading documents — two ways** (`journeys/[id]/documents`): a normal
browser upload (`uploadDocument`, capped at `MAX_UPLOAD_BYTES` = 4MB — Vercel's
serverless payload limit) for anything small, and a second form, "Var Olan
Drive Dosyasını Bağla" (`linkExistingDriveFile`), for files that already exist
elsewhere in Drive — meeting recordings especially, routinely ~40-50MB and
already saved there as a matter of course. It takes a pasted Drive share link
or bare file id (`extractDriveFileId()` in `lib/presales/drive.ts` parses
either), and copies the file **server-to-server** via `drive.files.copy`
straight into the journey's folder — no bytes ever pass through our app or
browser, so the 4MB guard doesn't apply. Requires the service account to
already have read access to the source file (same Shared Drive, or explicitly
shared with its email) — otherwise the copy 404s.

**Advancing a stage that has no survey** (e.g. a meeting): the case's "Aşamalar"
tab shows a single "Tamamla ve sıradakine geç" button, only on the current stage,
only when it has no unanswered sent survey — clicking it marks that stage
completed and activates the next one. If you complete a stage by mistake, "Geri
al" appears on the most recently completed stage to undo exactly that step.

**Dashboard: filters, bulk actions, per-case shortcuts** (`app/presales/admin/page.tsx`
+ `JourneyListWithSelection.tsx`): combinable filters — Ara (search), Durum,
Satışçı, Teknik Sorumlu, Ürün, Arşiv, Müşteri Linki, Aksiyon (Aksiyon Bizde / Müşteride —
same "whose turn" logic as the Genel Bakış tab below, computed per journey
from its survey statuses), and two separate date filters, **Kapanış Tarihi**
(`Journey.outcomeSetAt`) and **Oluşturma Tarihi** (`Journey.createdAt`). Both
render as a single preset dropdown (Tümü/Bugün/Bu Ay/Geçen Ay/Bu Yıl,
`lib/presales/dateRangePresets.ts`) rather than raw date pickers — a raw
from/to pair was confusing for two single-value dates people actually think
of in "this month" / "last month" terms. **Arşiv defaults to "Arşivlenmemiş"**
the moment no filter param is present at all — archived cases never show up by
accident, you have to explicitly pick "Arşivlenmiş" or "Tümü (arşiv dahil)" to
see them. Each journey card's heading is the full `Journey.name` (not just the
company name), with the assigned **satışçı right underneath it** (the
prospect's own contact name/email moved down into the bottom meta row instead
— sales rep is the more actionable field to see at a glance, and it's the one
that gets reassigned often). The top-right of the card also shows **Açılış**
(`createdAt`) and **Kapanış** (`outcomeSetAt`, "-" until an outcome is set) —
`formatDisplayDate()` in `lib/presales/formatDate.ts` is the shared "-"
fallback used both here and on the journey header below. Also shows the
outcome badge plus a separate "Arşivlendi" badge when archived, a "Müşteri
Linki: Aktif/Pasif" line, and two small buttons at the bottom-right — copy the
customer link, or open it in a new tab (both stop the card's own click-through
navigation). Checkboxes let you
multi-select journeys and, from the bulk-action bar that appears, change
Durum, reassign Satışçı, toggle Müşteri Linki, or archive/unarchive — all in
one call across the whole selection (`bulkSetJourneyStatus`/
`bulkAssignSalesRep`/`bulkSetJourneyLinkDisabled`/`bulkSetJourneyArchived` in
`lib/presales/adminActions.ts`); each bulk action flashes a "✓ N journey's..."
confirmation line in the bulk bar once it actually finishes, not just a
generic "Uygulanıyor..." spinner. Reassigning a sales rep (single or bulk)
also revalidates the customer's own page (`/presales/j/[token]`), so the
"Satış Temsilciniz" card there updates immediately, not just the admin views.

**Journey detail header** (`app/presales/admin/journeys/[id]/layout.tsx`): same
pattern as the dashboard card — heading is `Journey.name`, with the assigned
satışçı directly underneath, the prospect's contact info as a smaller line
below that, and an **Açılış / Kapanış** date line below that (same
`formatDisplayDate()` fallback as the dashboard card, "-" until an outcome is
set). The "Müşteri Linki" box (top-right) has copy + open-in-new-tab
buttons next to the link code (`CustomerLinkActions.tsx`, a small client
component — everything else on this layout is a Server Component, so copying
to the clipboard is the one thing that needs to be pulled out client-side).

**Journey tabs — "Genel Bakış" is the default landing tab, not "Aşamalar"**
(`JourneyTabs.tsx`): opening a journey used to drop you straight into the
stage-configuration editor — useful for *setting up* a case, useless for
answering "what do I actually need to do right now." `page.tsx` is now a
read-only **Genel Bakış** tab that answers exactly that:
- A banner — **Aksiyon Bizde** (pink) if any sent survey has been completed by
  the customer but its stage isn't marked done yet, or the current stage takes
  no survey and needs a manual complete, or no survey has been sent for the
  current stage yet; **Müşteride Bekliyor** (amber) if a survey is sent and
  still unanswered; a neutral badge if the case is closed/archived or every
  stage is done.
- The current stage's name/description, with the actual action button inline
  — "Tamamla ve sıradakine geç" once nothing's blocking it, or "Anket Oluştur"
  (linking straight into `surveys/new?stageId=`) if the stage takes a survey
  and none has been sent yet.
- A list of completed-but-unreviewed surveys, each linking straight to its
  results page, and a list of surveys still sitting with the customer.
- **Süreç Akışı**: every active stage in order, with a status dot
  (completed/current/upcoming), entered/completed dates, and how many surveys
  each stage has — the whole flow at a glance, without switching to the
  "Aşamalar" tab.
- **Tüm Anketler ve Cevaplar**: every survey on the case (draft/sent/completed,
  badge per status), and for completed ones the actual question/answer pairs
  rendered inline (`AnswerPreview`, same encode/decode helpers as the survey
  results page) — no click-through needed just to read what the customer said.
  A "Detay / Excel" link still goes to the full per-question results page for
  exporting or reviewing file-upload answers.

The old stage editor (add/reorder/hide stages, `JourneyStagesList.tsx`) moved
to its own **Aşamalar** tab at `journeys/[id]/stages/` — same component, same
behavior, just no longer the first thing you see. All the stage-mutating
actions (`completeCurrentStage`, `reopenLastCompletedStage`,
`createJourneyStage`, `updateJourneyStage`, `setJourneyStageActive`,
`reorderJourneyStages`) now revalidate both `journeys/[id]` (Genel Bakış) and
`journeys/[id]/stages`, since either tab can trigger them.

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

**Customer-facing page design** (`app/presales/j/[token]/page.tsx`): a
"glassmorphism" look — soft, low-opacity blurred color blobs fixed behind the
whole page, with every card (hero, timeline, action panel, sidebar) a
semi-transparent, backdrop-blurred surface floating on top rather than a flat
solid background. The timeline is the visual centerpiece (its own large card),
with a compact header above it (company logo/badge, greeting, a circular
%-progress ring) rather than the full-height hero band it started as. Colors
are deliberately restrained — the hero gradient is mostly brand-dark→primary
with only a small magenta glow accent, and decorative shadows/blobs are kept
at low opacity — a first pass with more saturated color and heavier glow
effects read as "busy" rather than elegant. A stage's `customerDescription`
caption only shows for the **current** stage, not every stage — an earlier
version showed it under all of them as a "preview the whole journey" idea,
but that read as cluttered, so it went back to "see it once you get there."
Below the `sm` breakpoint the timeline is a **vertical stepper** (own block,
`sm:hidden`), not the same horizontally-scrolling row shrunk down — a
sideways-scrolling strip of 5-6 stops has no visual affordance telling a
phone user to swipe, so most people would never see stages past the first
couple. `sm` and up render the original horizontal row (`hidden sm:flex`);
both versions exist in the DOM at all times, CSS `display` picks the right
one, so there's no client JS needed to switch between them.

**Admin chatbot**: bottom-right widget on every `/presales/admin/**` page. On each
message it fetches essentially the whole presales DB (prospects, journeys, stages,
survey questions + answers, document titles — capped at the 150 most recent
journeys, answers truncated to 400 chars) via `buildAdminChatContext()`, stuffs it
into the Groq system prompt, and explicitly instructs the model to answer only from
that data and say "I don't have that" otherwise (`app/api/presales/admin/chat/route.ts`).
It reuses the same `generateChatResponse` helper the marketing site's chat already
uses — no new LLM integration, just a different context builder and system prompt.
Two correctness fixes to `buildAdminChatContext()` worth knowing about: a
`file_upload` answer's `SurveyResponse.answerText` is the raw Google Drive
file id (that's what the customer-facing submit flow writes there) — showing
that to the model is meaningless, so it's resolved through the linked
`Document` row (`SurveyResponse.document`) to the file's real title instead.
And a `Document`'s listing includes which stage it belongs to, since two
documents can end up with the identical auto-generated title (two completed
surveys both literally named "İlk Anket Soruları" each export an
"İlk-Anket-Soruları-cevaplari.xlsx") — the stage name is what actually tells
them apart. `multi_choice` answers are also joined into plain
comma-separated text instead of raw `JSON.stringify` output, and stage/
document `notes` (admin-only free text) are included when present.

## Email delivery: Gmail SMTP, not Resend

Sales-rep email notifications (`lib/presales/notify.ts`) send via **Gmail
SMTP** (`nodemailer`, `GMAIL_USER`/`GMAIL_APP_PASSWORD`), not Resend. Resend was
tried first (still used for the marketing site's lead form, `app/api/lead/route.ts`)
but its sandbox mode only delivers to the account owner's own address until a
sending domain is verified at resend.com/domains — confirmed by testing the API
directly. Gmail SMTP has no equivalent restriction: it sends as a real Workspace
mailbox (`sales@ereteam.com`, via an app password, not the account password),
so delivery to any real sales rep works immediately — confirmed live. If
`GMAIL_USER`/`GMAIL_APP_PASSWORD` are ever unset, notifications silently no-op
(logged to the server console, never surfaced to the customer, by design — a
notification failure must never block their submission).

## Admin login

A real login page at `/presales/login` (not the browser's native Basic-Auth
prompt — that was the original v1 gate and the UX was rough: no branding, no
logout, credentials cached indefinitely by the browser). How it works:

- **Login** (`loginAdmin` in `lib/presales/sessionActions.ts`): first checks
  `checkLoginLock()` (`lib/presales/loginRateLimit.ts`) — if the shared login
  is currently locked out from repeated failures, it redirects straight back
  with `?error=locked&retry=<minutes>` without even checking the password.
  Otherwise it checks the submitted username/password via
  `verifyAdminPassword()` (`lib/presales/auth.ts` — reads the singleton
  `AdminCredential` DB row, or falls back to `ADMIN_BASIC_USER`/
  `ADMIN_BASIC_PASS` if that row doesn't exist yet), records the result
  (`recordLoginResult`), and on success signs a session token
  (`lib/presales/session.ts`) and sets it as an HttpOnly cookie
  (`presales_admin_session`, 7-day expiry), then redirects to wherever the
  visitor was headed (`?next=`). On failure it redirects back with `?error=1`.
- **Password storage** (`lib/presales/passwordHash.ts`): `AdminCredential.password`
  is a scrypt hash (`<16-byte salt hex>:<64-byte key hex>`), never the raw
  value, compared with `crypto.timingSafeEqual`. `verifyPassword()` detects
  the hash format and falls back to a constant-time *direct* compare for two
  cases that can't be hashed: a DB row saved before hashing existed, and the
  `ADMIN_BASIC_PASS` env-var fallback (there's nowhere durable to keep a salt
  for a value re-read fresh from the environment on every call).
- **Rate limiting** (`lib/presales/loginRateLimit.ts`, singleton
  `AdminLoginAttempt` row): 6 consecutive failures locks the shared login for
  10 minutes. Global, not per-IP/per-user — there's exactly one shared login
  for the whole team, so one counter is enough and needed no new
  infrastructure (Redis/Upstash) beyond the Postgres already used everywhere
  else. A success resets the counter; a lock that already expired doesn't
  carry its old count into the next attempt.
- **Gate** (`middleware.ts`): only ever checks that cookie's signature and
  expiry (`verifySessionToken`) — no DB call at all. This is why it can run
  in the Edge Runtime with zero special-casing: the token is signed with
  HMAC-SHA256 via Web Crypto (`crypto.subtle`, available in both Edge and
  Node), keyed by `ADMIN_SESSION_SECRET`. Missing/invalid/expired cookie →
  redirect to `/presales/login?next=<original path>` for page requests, or a
  plain 401 JSON for `/api/presales/admin/**` requests.
- **Logout** (`logoutAdmin`): clears the cookie, redirects to the login page.
  A "Çıkış Yap" button lives at the bottom of `AdminNav.tsx`.
- **Changing the login** (`/presales/admin/account`): shows the current
  username (never the password — there's nothing to show anymore once it's
  hashed) and lets you change either. The password field is optional: left
  blank, the existing hash is untouched, so changing just the username
  doesn't force a password reset too. Saving writes to the same
  `AdminCredential` row, effective immediately (no redeploy). This does
  **not** invalidate already-issued session cookies (they're signed
  independently of the password) — change `ADMIN_SESSION_SECRET` instead if
  you need to force every open session to log out at once.

## Security hardening (from a full review — see git log around this section)

A full pass turned up a handful of gaps beyond login (covered above). Fixed:

- **HTTP security headers** (`next.config.mjs`): `X-Content-Type-Options: nosniff`
  and `Referrer-Policy: strict-origin-when-cross-origin` site-wide (neither
  restricts scripts/styles/fonts, so nothing here risks breaking the
  marketing site's third-party embeds like HubSpot or CookieYes).
  `X-Frame-Options: DENY` + `Content-Security-Policy: frame-ancestors 'none'`
  scoped specifically to `/presales/:path*` — both the admin login and the
  no-login customer survey link take sensitive input (a password, or real
  business answers) that clickjacking via an invisible iframe overlay could
  target. `poweredByHeader: false` drops the `X-Powered-By: Next.js` header.
  Deliberately **not** a full CSP (`script-src` etc.) — that needs auditing
  every third-party script the marketing site loads elsewhere first, a
  separate piece of work.
- **File-upload MIME allowlist** (`lib/presales/fileUpload.ts`,
  `ALLOWED_UPLOAD_MIME_TYPES`/`ALLOWED_UPLOAD_ACCEPT`/`ALLOWED_UPLOAD_LABEL`):
  customer file-upload survey answers were size-capped only, any file type
  accepted. Now checked client-side (`accept` attribute + `handleFileChange`
  in `SurveyAnswerForm.tsx`) and server-side (`uploadNewFileAnswers` in
  `app/presales/j/[token]/actions.ts`) against an allowlist of ordinary
  business-document types (PDF/Office/images/txt/csv/zip). This is a soft
  check — `file.type` comes from the browser, and a deliberate attacker
  crafting a raw multipart request could still set it to anything — the
  real backstop stays Drive's own scanning plus admins not blindly opening
  unexpected files; this just closes the ordinary/accidental case.
- **HTML-escaped fields in outbound email** (`lib/presales/escapeHtml.ts`,
  used in `lib/presales/notify.ts` and where `actionSummary` is built in
  `app/presales/j/[token]/actions.ts`): company/contact/rep names and survey
  titles — all admin-authored, never customer-controlled — were interpolated
  into the sales-rep notification email's HTML body unescaped. `subject`
  also gets `stripNewlines()` before being handed to nodemailer, since a
  known CRLF-header-injection class of nodemailer bug means a stray
  `\r\n` in a header-bound field shouldn't be trusted verbatim.
- **KVKK notice on the customer page** (`app/presales/j/[token]/page.tsx`,
  bottom of the page): a short note that contact info and survey answers are
  processed only for this presales engagement, and how to ask for deletion
  (`deleteJourney` is the actual mechanism, see "Deleting a journey" above).
  This is placeholder-quality legal copy, not reviewed by counsel — treat it
  as a starting point, not a finished KVKK aydınlatma metni.
- **`npm audit fix`** (non-breaking only — `package.json` itself didn't
  change, only lockfile-level transitive-dependency patch bumps): took
  the project from 43 known advisories down to 26, all remaining ones
  either requiring a breaking major-version bump (Sanity Studio tooling,
  not part of the presales runtime path) or affecting `next` itself, which
  has no non-breaking fix available within the installed 14.x line — a
  deliberate, separate major-version upgrade is the real fix there and
  wasn't attempted in this pass given the blast radius (the whole site, not
  just presales).

**Deliberately not done in this pass** (each needs its own dedicated,
lower-risk piece of work): the Next.js major-version upgrade above;
narrowing what Shared Drives the Google service account actually belongs to
(the OAuth scope itself has to stay broad — `drive`, not `drive.file` — for
the "link an existing Drive file" feature to keep working); and turning the
KVKK note into a properly reviewed aydınlatma metni with an actual, decided
retention period (a business/legal decision, not a coding one).

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

The shared login (see "Admin login" above) has no per-user identity, and no form or
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
ADMIN_SESSION_SECRET         # signs the login session cookie — keep secret; changing it logs everyone out
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
- Per-staff login (currently one shared login for the whole team).
- HubSpot / Fireflies / Google Forms integrations.
- Any automated AI analysis beyond the admin chatbot's read-only Q&A.

## If this gets abandoned

Delete `PRESALES.md`, the paths under "File map" above, and the env vars listed
above. Also revert the one-line marketing-file touches listed at the bottom of
"File map" (the `pathname.startsWith("/presales")` early-returns in
Navbar/Footer/ChatWidget, the `<CookieBannerGate />` line and its import in
`app/layout.tsx`, and the robots.txt disallow rules) — otherwise those files
keep a dangling reference to deleted code. Everything else in the marketing
site (`app/`, `lib/sanity/**`, `lib/siteData.ts`, `lib/getChatContext.ts`,
etc.) has zero dependency on any of this.
