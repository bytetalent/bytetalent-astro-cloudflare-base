# Deploy — Astro on Cloudflare Pages

Stack-specific deploy commands for this base. Universal deploy principles in [`bytetalent/docs/guide-deploy.md`](https://github.com/bytetalent/docs/blob/main/guide-deploy.md).

## Prerequisites

1. **Cloudflare account** with Workers + Pages enabled
2. **Resend account** with a verified sending domain
3. **Domain** pointed to Cloudflare nameservers (or DNS pointed at Cloudflare for proxying)

## One-time setup

### Install Wrangler

Already in `devDependencies`. Verify:

```bash
bunx wrangler --version
```

### Authenticate

```bash
bunx wrangler login
```

This opens a browser to your Cloudflare account.

### Create the Pages project

```bash
bunx wrangler pages project create bytetalent-marketing --production-branch main
```

Project name should match `name` in `wrangler.toml`.

### Set production secrets

```bash
bunx wrangler pages secret put RESEND_API_KEY --project-name bytetalent-marketing
bunx wrangler pages secret put CONTACT_TO_EMAIL --project-name bytetalent-marketing
bunx wrangler pages secret put CONTACT_FROM_EMAIL --project-name bytetalent-marketing
```

You'll be prompted for each value. They're stored encrypted in Cloudflare.

### Custom domain

Cloudflare dashboard → Pages → bytetalent-marketing → Custom domains → Set up a custom domain.

For `marketing.bytetalent.com`:
- Add a CNAME `marketing` → `bytetalent-marketing.pages.dev`
- Cloudflare automatically provisions SSL

## Local development

```bash
cp .env.example .env.local
# Fill in RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL
bun install
bun run dev
```

Dev server runs at `http://localhost:4321`. The contact form posts to `/api/contact`, which calls Resend if env vars are set or returns a `CONFIG_ERROR` 503 if not.

## Building

```bash
bun run build
```

Output lands in `dist/`. Verify the build:

```bash
bun run preview
```

This runs `wrangler pages dev dist` against the built output, simulating Cloudflare's runtime.

## Deploying

### Manual deploy

```bash
bun run build
bun run deploy
```

`deploy` runs `wrangler pages deploy dist`.

### CI deploy (GitHub Actions)

Set up Cloudflare API token in GitHub repo secrets as `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Then a workflow:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run build
      - uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: bytetalent-marketing
          directory: dist
```

### Preview deploys (per PR)

Cloudflare Pages auto-creates a preview deploy for every push to a non-production branch. URL pattern: `<commit-hash>.bytetalent-marketing.pages.dev`.

## Rollback

Cloudflare dashboard → Pages → bytetalent-marketing → Deployments → click an earlier deployment → "Rollback to this deployment."

No CLI for this; UI-only.

## Migrations

This base doesn't ship a database. If you add one (Cloudflare D1, Supabase, etc.), see [`bytetalent/docs/guide-db.md`](https://github.com/bytetalent/docs/blob/main/guide-db.md) for migration discipline + add the apply step to your CI workflow.

## Health check

The base doesn't ship a `/api/healthz` endpoint by default — Astro's pre-rendered marketing pages are inherently observable via 200 OK on `/`. If you add a server-side data dependency, add a health endpoint per [`bytetalent/docs/guide-api.md`](https://github.com/bytetalent/docs/blob/main/guide-api.md) §10.
