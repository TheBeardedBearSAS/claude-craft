# Vercel Tooling

> Covers the Vercel CLI, the Preview Deployments workflow, and `vercel.json` schema validation. Framework-specific dev servers (`vite`, `ng serve`, etc.) are documented in that stack's own `06-tooling.md` — the Vercel CLI wraps and defers to them via `vercel dev`.

## Vercel CLI Commands

Install once per machine (or use `npx vercel@latest` without a global install):

```bash
npm install -g vercel
```

| Command | Purpose |
|---------|---------|
| `vercel link` | Connect the local directory to a Vercel project (run once per repo/checkout) |
| `vercel dev` | Local dev server that emulates the platform (routes `api/**`, applies `vercel.json`, reads `.env.local`) |
| `vercel build` | Produce the same build output the platform would produce, without deploying — `.vercel/output/` |
| `vercel deploy` | Build and deploy; defaults to a **Preview** deployment unless `--prod` is passed |
| `vercel deploy --prebuilt` | Deploy the output of a prior `vercel build`, skipping a second build step (used in custom CI pipelines) |
| `vercel env pull` | Write the project's env vars (for a given environment) to a local `.env` file |
| `vercel env add` | Add a new env var to Development/Preview/Production, interactively or via stdin |
| `vercel logs <deployment-url>` | Stream or fetch runtime logs for a specific deployment |

```bash
# First-time setup in a repo
vercel link

# Local development — emulates api/**, vercel.json, cron auth headers
vercel dev

# Pull Development env vars before running anything locally
vercel env pull .env.local

# Add a Production-only secret
vercel env add CRON_SECRET production

# Build without deploying (inspect .vercel/output/)
vercel build

# Deploy a Preview (default — safe, does not touch production)
vercel deploy

# Deploy straight to Production
vercel deploy --prod

# CI pattern: build once, deploy the prebuilt output
vercel build --prod
vercel deploy --prebuilt --prod

# Fetch logs for a specific deployment
vercel logs my-project-abc123.vercel.app
```

**Rule**: `vercel dev` is the right tool for iterating on `api/**` handlers and `vercel.json` locally — it applies rewrites/redirects/headers exactly as the platform would. It does not replace the framework's own dev server for routing/rendering concerns already owned by that stack (see `02-architecture-vercel.md`'s decision tree); `vercel dev` proxies to the framework's dev server for those.

---

## Preview Deployments Workflow

Every push to a non-production branch (and every PR) triggers an isolated **Preview Deployment** — a full, URL-addressable deployment of that branch's state, separate from Production.

```
1. git push origin feature/add-webhook
       │
       ▼
2. Vercel builds the branch — a unique Preview URL is generated
   (e.g. my-project-git-feature-add-webhook-team.vercel.app)
       │
       ▼
3. Preview URL is posted as a GitHub/GitLab/Bitbucket PR check —
   reviewers click through to the live, running deployment
       │
       ▼
4. Preview env vars (scoped to "Preview" in the dashboard/CLI) are
   used — never Production secrets
       │
       ▼
5. On merge to the production branch (commonly `main`), Vercel
   promotes/builds a new Production deployment automatically
       │
       ▼
6. (Optional) An existing Preview deployment can be promoted
   directly to Production without a rebuild — "Promote to
   Production" in the dashboard, or `vercel promote <url>` — useful
   when the exact artifact already validated in Preview must reach
   Production unchanged.
```

**Rule**: never point a Preview deployment at Production data/secrets to "test with real data" — use the Preview-scoped env vars (a separate value can be set per environment for the same var name via `vercel env add <name> preview`), and seed Preview-safe data instead.

---

## `vercel.json` Schema Validation

Vercel publishes a JSON Schema for `vercel.json`. Reference it via `$schema` so editors (VS Code, JetBrains) validate keys and catch typos before deploy:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "functions": {
    "api/**/*.ts": { "memory": 1024 }
  }
}
```

CLI-side validation as part of a pre-deploy check (CI):

```bash
# Fail fast on a malformed vercel.json before triggering a build
npx ajv-cli validate -s https://openapi.vercel.sh/vercel.json -d vercel.json
```

**Rule**: keep the `$schema` key as the first key in `vercel.json` (see `03-coding-standards.md`'s key ordering) — it costs nothing at deploy time (Vercel ignores unknown top-level metadata keys it doesn't need) and gives immediate editor feedback on typos like `"corns"` instead of `"crons"`.

---

## Storage & Marketplace Tooling

Native (first-party) products are provisioned directly from the CLI or dashboard:

```bash
# Blob — native, first-party
vercel blob store add my-app-uploads
```

Everything else (Postgres, KV/Redis) is a **Marketplace** integration, not a first-party product — connect it from the dashboard's Integrations tab (or `vercel integration add <name>` where supported), which auto-injects the resulting connection env vars into the project. Do not install `@vercel/kv` or `@vercel/postgres` for new work — both are deprecated first-party packages, auto-migrated to Marketplace-backed equivalents:

| Deprecated | Current Marketplace path |
|------------|---------------------------|
| `@vercel/kv` | Upstash Redis integration → `@upstash/redis` client, env vars auto-injected |
| `@vercel/postgres` | Neon-backed Postgres integration → standard `pg`/ORM client, `DATABASE_URL` auto-injected |

**Rule**: when connecting a Marketplace database/cache, use the client library the Marketplace provider documents (`@upstash/redis`, a standard Postgres driver/ORM), read the connection string/token from the env var name the integration injects, and never vendor the deprecated `@vercel/kv` / `@vercel/postgres` packages into new code.

---

## CLI Command Summary Table

| Task | Command |
|------|---------|
| Connect repo to a project | `vercel link` |
| Local dev, platform-accurate | `vercel dev` |
| Build without deploying | `vercel build` |
| Deploy a Preview | `vercel deploy` |
| Deploy to Production | `vercel deploy --prod` |
| Deploy a prebuilt artifact (CI) | `vercel deploy --prebuilt` |
| Pull env vars locally | `vercel env pull` |
| Add an env var | `vercel env add <name> <environment>` |
| Tail deployment logs | `vercel logs <deployment-url>` |
