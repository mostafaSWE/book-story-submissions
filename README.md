# Book Story Submissions

Multilingual story-submission website for a printed book project. Readers select a language, submit contact details, upload a receipt image, write a story or upload written story-page photos, and admins review/export submissions from a protected dashboard.

## Projects in this repo

Two public sites and one shared admin. They share the Supabase project (one table each) and the Cloudflare account, nothing else.

| | «كتاب من قارئ إلى كاتب» | «أنت الكاتب» |
|---|---|---|
| Folder | repo root (`src/`) | `sites/anta/` (own `package.json`, lockfile, `wrangler.jsonc`; imports nothing from the root) |
| Domain | `readertowriter.net` | `anta.readertowriter.net` |
| Cloudflare Worker | `book-story-submissions` | `anta-alkateb` |
| Database table | `public.submissions` (+ Storage buckets `receipts`, `story-pages`) | `public.anta_contributions` |
| Public routes | `/`, `/share`, `/terms`, `/api/submissions` | `/ar`, `/en`, `/<lang>/write`, `/<lang>/privacy` |
| Admin (shared, on readertowriter.net) | `/admin/reader-to-writer`, `/admin/reader-to-writer/submissions/[id]`, `/api/admin/reader-to-writer/export` | `/admin/anta`, `/admin/anta/entries/[id]`, `/api/admin/anta/export` (`?status=selected`) |
| Deploys | Workers Builds on push to `main` (repo root, `npm run deploy`) | `cd sites/anta && npm run deploy` (or a Workers Builds project with root directory `sites/anta`) — see `sites/anta/README.md` |

- `/admin` is an overview with one section per book. Each book is a module in `src/books/<slug>/` (table, queries, list/detail views, CSV mapping, status logic), listed in `src/books/registry.js`; a module never imports another book's module. Adding a book = one more module + one line in the registry.
- Same admin login, credentials and session cookie for both books. Old admin URLs (`/admin?<filters>`, `/admin/submissions/[id]`, `/api/admin/export`) redirect to the «كتاب من قارئ إلى كاتب» paths.
- CSV exports (both books): UTF-8 BOM, line breaks kept, formula-injection guard; phone numbers are written as `="+971…"` so Excel keeps the `+`.
- Migrations live in `supabase/migrations/` and are applied by running their SQL (see each file); `20261001000000_create_anta_contributions.sql` only adds objects.
- Tests: `sites/anta` (`npm test`, `npm run test:e2e`; local Postgres + PostgREST in `sites/anta/tests/db`), and `tests/e2e` for the shared admin (local test DB only) plus read-only smoke tests of the root site.

## Tech Stack

- Next.js App Router
- React
- Supabase Postgres for submissions
- Supabase Storage for receipt and story-page images
- Cloudflare OpenNext adapter for full-stack deployment on Cloudflare Workers
- CSS modules are not used; global styling is in `src/app/globals.css`

## Main Routes

- `/` - language selection and submission flow
- `/share` - permanent QR-code entry path for the same submission flow
- `/admin/login` - protected admin login (shared by both books)
- `/admin` - overview of both books (counts, latest entries)
- `/admin/reader-to-writer` - submissions dashboard (old `/admin?<filters>` redirects here)
- `/admin/reader-to-writer/submissions/[id]` - full submission detail page (old `/admin/submissions/[id]` redirects here)
- `/admin/anta`, `/admin/anta/entries/[id]` - «أنت الكاتب» entries (list, detail, status, private note)
- `/api/submissions` - public submission endpoint
- `/api/admin/reader-to-writer/export` - authenticated CSV export (old `/api/admin/export` redirects here)
- `/api/admin/anta/export` - authenticated CSV export of «أنت الكاتب» entries (follows the list filters)
- `/api/admin/files/[...path]` - authenticated signed access to private Supabase Storage files

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file:

```bash
cp .env.example .env
```

3. Fill `.env` with a Supabase project URL, anon key, service role key, admin password hash, and session secret.

4. Generate an admin password hash:

```bash
npm run admin:hash -- "replace-with-a-strong-password"
```

5. Run locally:

```bash
npm run dev
```

## Environment Variables

Do not commit real `.env` files. Required variables are:

```bash
PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
PUBLIC_SUPABASE_ANON_KEY="replace-with-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="replace-with-supabase-service-role-key"
SITE_URL="https://your-future-domain.com"
ADMIN_USERNAME="admin"
ADMIN_EMAIL=""
ADMIN_PASSWORD_HASH="replace-with-output-from-npm-run-admin-hash"
SESSION_SECRET="replace-with-a-long-random-production-secret"
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only. It must only be configured as a Cloudflare secret or protected server environment variable, never used in client components or browser code.

## Supabase Setup

Create a fresh Supabase project for production. Do not import local test data, local SQLite files, or local upload folders.

For a new, empty project, apply the SQL migrations with `supabase db push`. On the existing production project, run a single new migration's SQL directly in the SQL editor instead, so nothing else gets applied by accident.

Paste and run this migration in the Supabase SQL editor:

```text
supabase/migrations/20260606000000_create_submissions.sql
```

The migration creates:

- `public.submissions`
- unique phone number constraint
- unique email constraint
- indexes for admin filtering/export
- `country` and `country_code` columns
- `receipt_image` JSON metadata
- `story_images` JSON metadata
- private Supabase Storage buckets

## Start With Empty Production Data

Use a new Supabase production project or clear the `public.submissions` table before launch. The repository intentionally does not include local submissions, local upload folders, `dev.db`, seed data, or mock submission data.

## Storage Buckets

Required private buckets:

- `receipts`
- `story-pages`

The migration creates both buckets with a 5 MB file limit and image MIME-type restrictions.

Receipt images and story-page images are stored separately. The admin detail page retrieves them through authenticated signed URLs.

## RLS and Storage Policies

The app uses `SUPABASE_SERVICE_ROLE_KEY` only in server-side code to insert submissions, upload private files, list submissions, export CSV, and create signed admin image URLs. Because the service role bypasses RLS, no public table or storage policies are required for this implementation.

Keep RLS enabled on `public.submissions` and keep both buckets private. If you later move uploads directly to the browser using the anon key, add explicit Supabase RLS/storage policies first.

## Admin Access

Set either:

- `ADMIN_USERNAME`
- or `ADMIN_EMAIL`

The login form submits the username field, and the app accepts `ADMIN_USERNAME` first, then `ADMIN_EMAIL`.

Set `ADMIN_PASSWORD_HASH` using:

```bash
npm run admin:hash -- "replace-with-a-strong-password"
```

The generated hash uses `100000` PBKDF2 iterations, which is compatible with Cloudflare Workers. If an older hash starts with `pbkdf2_sha256:310000:`, regenerate it and update the Cloudflare secret.

Set `SESSION_SECRET` to a long random value in production.

## Production Build

Validate the Next.js build locally:

```bash
npm run build
```

Preview the Cloudflare runtime build locally:

```bash
npm run preview
```

Deploy with:

```bash
npm run deploy
```

## Cloudflare Deployment

This app is not frontend-only. It has server-rendered admin pages and API routes, so plain static Cloudflare Pages output is not sufficient.

Use Cloudflare Workers with the OpenNext adapter. Cloudflare’s dashboard is under Workers & Pages; connect this GitHub repository and use the Workers/OpenNext flow.

Recommended settings:

- Build command: `npm run deploy` for direct deploy, or `opennextjs-cloudflare build` for CI build-only workflows
- Build-only command: `npm run build:cloudflare`
- Worker entry: `.open-next/worker.js`
- Static assets directory: `.open-next/assets`
- Compatibility flag: `nodejs_compat`
- Compatibility date: `2026-06-06` or newer

The repo includes:

- `open-next.config.ts`
- `wrangler.jsonc`

Configure these environment variables/secrets in Cloudflare:

- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SITE_URL`
- `ADMIN_USERNAME` or `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH`
- `SESSION_SECRET`

If you must use static Cloudflare Pages instead, deploy the backend/API/admin routes separately. Static Pages alone cannot handle protected admin sessions, Supabase service-role uploads, CSV export, or signed private image access.

## GitHub and Cloudflare Connection

1. Push this repository to GitHub.
2. In Cloudflare Workers & Pages, create a new application from GitHub.
3. Select this repository.
4. Use the OpenNext/Workers deployment settings above.
5. Add all environment variables and secrets before production deployment.

## Custom Domain and QR Code

Use a permanent custom domain before printing QR codes.

Recommended printed QR target:

```text
https://your-future-domain.com/share
```

Avoid printing the temporary `*.workers.dev` or `*.pages.dev` URL. You can point the custom domain to the Cloudflare deployment later without changing the printed QR path.
