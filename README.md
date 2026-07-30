# Little Sprouts Nursery — Admin & Parent Portal

A full-stack nursery management app for children aged 6 months to 4 years, built with
Next.js (App Router), TypeScript, Prisma, PostgreSQL, NextAuth and Tailwind CSS.

It provides:

- **Admin/staff web dashboard** — manage children, parents & staff accounts, invoicing,
  newsletters, announcements, the daily diary, and EYFS observations & reports.
- **Parent portal** (responsive web app) — view invoices, newsletters, announcements,
  your child's daily diary, and their EYFS learning journey (observations + reports),
  all from a phone or desktop browser.

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

## Tech stack

- Next.js 14 (App Router) + TypeScript
- PostgreSQL + Prisma ORM
- NextAuth.js (credentials login, JWT sessions, role-based access: ADMIN / STAFF / PARENT)
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
npm run db:seed          # loads demo data
```

### 4. Run the app

```bash
npm run dev
```

Visit http://localhost:3000 and sign in with one of the seeded demo accounts
(password for all: `password123`):

- `admin@littlesprouts.test` — Admin
- `staff@littlesprouts.test` — Staff
- `parent@littlesprouts.test` — Parent (Sarah Chen, parent of Oliver & Ava Chen)

## Deployment

A `Dockerfile` and `render.yaml` are included for deploying to [Render](https://render.com):
it provisions a managed Postgres database and a Docker web service, running
`prisma migrate deploy` on boot. Set `NEXTAUTH_URL` to your deployed URL after the
first deploy.

For any other host, build the Docker image and provide `DATABASE_URL`,
`NEXTAUTH_URL`, and `NEXTAUTH_SECRET` environment variables.

## Notes on scope

This build focuses on a fully functional core: real authentication, a real
Postgres-backed data model, and working CRUD across every section. Invoicing
tracks and displays fees but does not process live card payments — invoices are
marked as sent/paid manually by staff (a natural place to add a Stripe Checkout
integration later, using the existing `Invoice` model).
