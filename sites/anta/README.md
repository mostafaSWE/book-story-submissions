# «أنت الكاتب» — anta.readertowriter.net

Public site where readers of «أنت الكاتب» (Abdullah Al-Hashemi, Dar Al-Afaq) send their own wisdom; the best is
published, with the writer's name, in the second volume. Arabic first, English second.

Self-contained Next.js 16 app deployed as its own Cloudflare Worker (`anta-alkateb`). It imports nothing from the
repo-root site and writes only to `public.anta_contributions`. Entries are read in the shared admin at
`https://readertowriter.net/admin/anta` (lives in the repo-root app).

## Run locally

```bash
cd sites/anta
npm install
npm run db:up      # local Postgres 17 + PostgREST with the repo's migrations (Docker)
npm run db:rest    # serves it as http://127.0.0.1:18321/rest/v1 (keep running)
```

Create `sites/anta/.env.local` (gitignored, local only):

```
PUBLIC_SUPABASE_URL=http://127.0.0.1:18321
SUPABASE_SERVICE_ROLE_KEY=<node -e "import('./tests/db/rest-proxy.mjs').then(m=>console.log(m.localKey('service_role')))">
IP_HASH_SECRET=anything-local
```

Then `npm run dev` (http://127.0.0.1:3100) or `npm run preview` (the real Workers runtime, http://127.0.0.1:8788).

## Tests

```bash
npm test                                   # unit + integration (vitest)
E2E_DB=local npm run test:e2e              # Playwright, AR/EN, 390 px + 1440 px, axe; BASE_URL=… to target another server
python tests/visual/shoot.py               # screenshots + side-by-side with the approved prototype
docker compose -f tests/db/docker-compose.yml exec -T db psql -U postgres -v ON_ERROR_STOP=1 < tests/db/db-checks.sql   # DB checks (rolls back)
```

## Deploy

Secrets come only from Cloudflare — never from `.env` files. OpenNext embeds `.env*` values (from this folder and
the repo root) into the Worker, so `npm run deploy` refuses to upload if any were embedded
(`scripts/check-bundle-env.mjs`). Deploy from a clean checkout, or delete local `.env*` files first.

```bash
npx wrangler login
npx wrangler secret put PUBLIC_SUPABASE_URL          # same project as the root site
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY    # same key as the root site
npx wrangler secret put IP_HASH_SECRET               # new random value, e.g. node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
npm run deploy                                       # build → guard → populate page cache → deploy
```

Always deploy with `npm run deploy` / `npx opennextjs-cloudflare deploy` (not `wrangler deploy`): it also uploads the
prerendered pages' cache. Optional runtime var: `PRIVACY_CONTACT_EMAIL` (shown on the privacy note).

Workers Builds alternative: root directory `sites/anta`, build command `npm ci && npm run build:cloudflare && node scripts/check-bundle-env.mjs`,
deploy command `npx opennextjs-cloudflare deploy`, build watch paths `sites/anta/**`.

## Content

- `messages/<lang>.json` — all interface copy. Adding a language = adding one file (the build picks it up).
- `content/quotes.json` — the 40 approved quotes (Arabic verbatim from the book, English as approved).
- After changing an Arabic heading or the form intro/placeholder/privacy lead, run
  `python scripts/subset-title-font.py` (a unit test fails until you do).
