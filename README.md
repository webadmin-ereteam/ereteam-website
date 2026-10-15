# Ereteam Web Platform

Ereteam's public website and two authenticated internal products are deployed as
one Next.js application:

- Marketing website and public AI assistant
- Presales customer journey portal at `/presales`
- Spark revenue dashboard at `/spark`

The products share deployment infrastructure and selected server utilities, but
their business logic and documentation must remain separate.

## Technology

- Next.js 14 App Router, React 18, TypeScript, Tailwind CSS
- PostgreSQL (Neon) with Prisma
- Sanity CMS for marketing content
- Groq for the three AI assistants
- HubSpot for Spark revenue data
- Google Drive and Gmail SMTP for Presales files and notifications
- Resend for public website leads
- Vercel for hosting and scheduled Spark refreshes

## Repository Map

```text
app/                    Pages, Server Components, Server Actions and API routes
components/             Shared marketing UI
hooks/                  Public website client hooks
lib/presales/           Presales domain, auth, Drive and notification services
lib/spark/              Spark collection, cache and AI query planning
lib/services/           Shared external service clients
lib/sanity/             Sanity client, queries and schemas
prisma/                 Database schema, migrations and seed
scripts/                Migration and Spark regression scripts
```

Read the relevant product document before changing a product:

- `PRESALES.md`
- `SPARK.md`
- `WEBSITE_AI.md`
- `AGENTS.md` for repository-specific engineering rules

## Local Setup

Requirements: Node.js 24 LTS, npm and access to the development database and
external service credentials.

```bash
npm install
cp .env.local.example .env.local
npx prisma migrate deploy
npm run dev
```

Fill `.env.local` with development credentials only. Production credentials
belong in Vercel's encrypted environment settings and must never be committed or
included in handoff archives.

## Quality Checks

Run all available checks before deployment:

```bash
npm test
npm run test:integration # requires an isolated TEST_DATABASE_URL
npm run lint
npm run build
git diff --check
```

`npm test` covers signed sessions, distributed rate-limit behavior, public lead
and chat APIs, Presales survey validation, Spark chatbot rules and legacy
Amplemarket mapping. PostgreSQL concurrency tests are kept separate and refuse to
use the normal application database.

## Database Changes

Change `prisma/schema.prisma`, create a migration, inspect the generated SQL and
test it against a non-production database before deployment. Production uses:

```bash
npx prisma migrate deploy
```

Do not use `prisma db push` as a production deployment procedure. Prisma client
generation runs automatically through `postinstall`.

## Deployment

Production is hosted on Vercel. `vercel.json` defines the Spark and expired
rate-limit cleanup cron schedules.
After changing environment variables, redeploy so serverless functions receive
the new values.

Minimum smoke checks after deployment:

1. Open the public home page and submit a non-production test chat request.
2. Sign in to Presales and verify one read-only journey page and admin export.
3. Sign in to Spark, open the current report and verify an authenticated API call.
4. Confirm the latest database migration and scheduled Spark refresh status.

## Security And Operations

- Rotate all credentials before handing the repository to another person.
- Presales admin access is a shared credential; use the account screen's session
  revocation after personnel changes.
- Customer Presales URLs are bearer links. Disable a journey link when access is
  no longer required and do not send links through public channels.
- Presales documents currently inherit link-readable Google Drive permissions.
  Migrating to private files served through token-validated download routes is a
  high-priority hardening task; changing folder permissions alone would break
  existing customer links.
- Public and authenticated API limits use atomic PostgreSQL buckets shared by all
  serverless instances. A limiter database failure fails closed with HTTP 503.
- Presales admin AI sends selected database context to Groq. Review data
  processing, retention and PII minimization requirements before broad adoption.
- Production uses Next.js 16, React 19, Tailwind 4 and Node.js 24. Dependency
  advisories must still be reviewed regularly, including development-only tools.

## Ownership Boundaries

- Marketing content: Sanity and `lib/siteData.ts`
- Public assistant: `app/api/chat`, `lib/getChatContext.ts`, `WEBSITE_AI.md`
- Presales: `app/presales`, `app/api/presales`, `lib/presales`, `PRESALES.md`
- Spark: `app/spark`, `app/api/spark`, `lib/spark`, `SPARK.md`
- Shared database contract: `prisma/schema.prisma` and migrations

Avoid putting product-specific prompts or business rules in shared service
clients. Shared modules should provide transport and infrastructure only.
