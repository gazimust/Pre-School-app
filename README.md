# Sprout — Multi-Tenant Nursery Management Platform

A full-stack, multi-tenant nursery management platform for children aged 6 months to 4
years, built with Next.js (App Router), TypeScript, Prisma, PostgreSQL, NextAuth and
Tailwind CSS.

It provides:

- **Platform admin console** (`/master`) — the platform owner's view: create and manage
  nursery accounts, suspend/reactivate them, and log in as any nursery's admin for support.
- **Admin/staff web dashboard** (`/admin`) — per-nursery: manage children, parents & staff
  accounts, invoicing, newsletters, announcements, the daily diary, and EYFS observations
  & reports.
- **Parent portal** (`/parent`, responsive web app) — view invoices, newsletters,
  announcements, your child's daily diary, and their EYFS learning journey (observations
  + reports), all from a phone or desktop browser.

Every nursery's data is fully isolated from every other nursery — enforced both by the
data model (every tenant-owned record carries a `nurseryId`) and by scoping every query
and mutation to the signed-in user's nursery.

## Sections

| Section | Admin/staff | Parent |
|---|---|---|
| Invoicing | Create/send/mark-paid invoices, download PDF | View invoices, download PDF |
| Newsletters | Compose & publish | Read published newsletters |
| Announcements | Publish with priority levels | View active announcements |
| Daily diary | Log meals, naps, nappy changes, mood, activities | View child's daily diary |
| EYFS observations | Record observations tagged to the 7 EYFS areas of learning | View child's learning journey |
| EYFS reports | Generate termly/2-year-check/transition reports, download PDF | View shared reports, download PDF |

### The EYFS framework

Observations and reports are structured around England's **Early Years Foundation
Stage (EYFS)** framework: the 3 prime areas (Communication and Language, Physical
Development, Personal Social and Emotional Development) and 4 specific areas
(Literacy, Mathematics, Understanding the World, Expressive Arts and Design), assessed
against the two current age bands — **Birth to Three** and **Three and Four-Year-Olds**.
Report types include the statutory **2-Year-Old Progress Check**, termly summaries,
room transition reports, and school readiness reports.

## Multi-tenancy

- One shared login page — every account (platform admin, nursery admin, staff, parent)
  signs in the same way, and is automatically scoped to their nursery (or, for the
  platform admin, to no nursery at all).
- A `Nursery` is a fully isolated account: its own children, families, staff, invoices,
  newsletters, announcements, diary entries, observations and reports.
- The platform admin (`PLATFORM_ADMIN` role) creates new nursery accounts — including
  their first admin login — from `/master`, and can suspend/reactivate a nursery or
  temporarily **log in as** its admin for support. A banner shows while impersonating,
  with a one-click return to the platform admin.
- The EYFS areas of learning are shared reference data (the framework is national, not
  nursery-specific) and aren't duplicated per tenant.

## Tech stack

- Next.js 14 (App Router) + TypeScript
- PostgreSQL + Prisma ORM
- NextAuth.js (credentials login, JWT sessions, role-based access: PLATFORM_ADMIN / ADMIN / STAFF / PARENT)
- Tailwind CSS
- `@react-pdf/renderer` for invoice & report PDFs

## Local development

### 1. Start Postgres

```bash
docker compose up -d
```

### 2. Configure environment

```bash
cp .env.example .env
# edit .env if needed — defaults match docker-compose
```

### 3. Install dependencies & set up the database

```bash
npm install
npm run prisma:migrate   # creates tables
npm run db:seed          # loads demo data (platform admin + 2 demo nurseries)
```

### 4. Run the app

```bash
npm run dev
```

Visit http://localhost:3000 and sign in with one of the seeded demo accounts
(password for all: `password123`):

- `owner@platform.test` — Platform admin (manage nursery accounts, `/master`)
- **Little Sprouts Nursery**: `admin@littlesprouts.test` (Admin), `staff@littlesprouts.test` (Staff),
  `parent@littlesprouts.test` (Parent — Sarah Chen, parent of Oliver & Ava Chen)
- **Sunflower Fields Nursery**: `admin@sunflowerfields.test` (Admin), `staff@sunflowerfields.test` (Staff),
  `parent@sunflowerfields.test` (Parent — Aisha Bello, parent of Noah)

The two demo nurseries have separate data end-to-end — signing in as one nursery's
admin never shows the other's children, invoices, newsletters, etc.

## Deployment

### Render

A `Dockerfile` and `render.yaml` are included for deploying to [Render](https://render.com):
it provisions a managed Postgres database and a Docker web service, running
`prisma migrate deploy` on boot. Set `NEXTAUTH_URL` to your deployed URL after the
first deploy.

### Vercel

Vercel builds this repo directly from source (the `Dockerfile`/`render.yaml` are ignored)
and doesn't host Postgres itself, so you need an external database.

1. **Provision Postgres** — [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
   (Neon-backed), or Neon/Supabase/Railway directly. Copy its connection string.
2. **Import the repo** into Vercel; it auto-detects Next.js, no extra config needed.
3. **Set environment variables** (Project → Settings → Environment Variables), for
   Production (and Preview, if you want preview deploys to work):
   - `DATABASE_URL` — the connection string from step 1
   - `NEXTAUTH_SECRET` — a fresh secret, e.g. `openssl rand -base64 32` (don't reuse the
     local dev value from `.env`)
   - `NEXTAUTH_URL` — your deployed URL, e.g. `https://your-app.vercel.app`
4. **Deploy.** The `vercel-build` script (`package.json`) runs `prisma generate && prisma
   migrate deploy && next build` — Vercel automatically uses `vercel-build` over `build`
   when it's present, so migrations are applied on every deploy with no manual step.
5. **Seed data (optional, one-time)** — Vercel doesn't run the seed script for you. From
   your machine, point `DATABASE_URL` at the production database and run
   `npm run db:seed`, or use `vercel env pull` to fetch the production env vars locally
   first.

Caveat: because `vercel-build` runs `prisma migrate deploy` on *every* build, preview
deployments (e.g. one per pull request) will also apply pending migrations against
whatever `DATABASE_URL` they're configured with. Point Preview environment variables at
a separate, non-production database if you don't want preview branches applying schema
changes to production data.

### Any other host

Build the Docker image (or run `npm run build && npm start`) and provide `DATABASE_URL`,
`NEXTAUTH_URL`, and `NEXTAUTH_SECRET` environment variables, applying migrations
(`npx prisma migrate deploy`) before starting the app.

## Notes on scope

This build focuses on a fully functional core: real authentication, a real
Postgres-backed multi-tenant data model, and working CRUD across every section.
Invoicing tracks and displays fees but does not process live card payments —
invoices are marked as sent/paid manually by staff (a natural place to add a Stripe
Checkout integration later, using the existing `Invoice` model). Nurseries are
currently accessed via a single shared login (no per-nursery subdomains/custom domains).
