# Astro Marketing Base — Docs Overlay

This is the **Astro-stack-specific overlay**. It complements the universal [`bytetalent/docs`](https://github.com/bytetalent/docs) repo with patterns and details that are only relevant when you're building on Astro + Cloudflare Pages.

## How to read this overlay

Always start with [`bytetalent/docs`](https://github.com/bytetalent/docs) for cross-stack standards. Come here only for Astro-specific details — file conventions, deploy commands, framework idioms.

| Concern | Where |
|---|---|
| Coding standards (TypeScript discipline, naming, file size, security) | [`bytetalent/docs/guide-code.md`](https://github.com/bytetalent/docs/blob/main/guide-code.md) |
| Architecture decisions (access paths, ETag/If-Match, RLS) | [`bytetalent/docs/guide-arch.md`](https://github.com/bytetalent/docs/blob/main/guide-arch.md) |
| Database conventions (audit fields, soft-delete, JSONB shape) | [`bytetalent/docs/guide-db.md`](https://github.com/bytetalent/docs/blob/main/guide-db.md) (this base doesn't ship a DB by default — applies if you add one) |
| API contract (REST handlers, error response, validation) | [`bytetalent/docs/guide-api.md`](https://github.com/bytetalent/docs/blob/main/guide-api.md) |
| Design tokens, typography, theming, marketing patterns | [`bytetalent/docs/guide-design.md`](https://github.com/bytetalent/docs/blob/main/guide-design.md) |
| Form patterns, validation discipline | [`bytetalent/docs/guide-forms.md`](https://github.com/bytetalent/docs/blob/main/guide-forms.md) |
| Code review categories | [`bytetalent/docs/guide-review.md`](https://github.com/bytetalent/docs/blob/main/guide-review.md) |
| Testing principles | [`bytetalent/docs/guide-testing.md`](https://github.com/bytetalent/docs/blob/main/guide-testing.md) |
| **Astro-specific patterns** (this overlay) | [`guide-stack.md`](guide-stack.md) |
| **Cloudflare Pages deploy** (this overlay) | [`guide-deploy.md`](guide-deploy.md) |
| **Pattern-proving findings** (this base only) | [`lessons.md`](lessons.md) |

## What's in this base

```
src/
  components/
    sections/                # 10 section components — Hero, Features, Pricing, FAQ, etc.
  content/
    site-content.ts          # typed per-project content manifest
  layouts/
    Layout.astro             # root layout — head, fonts, OG meta
  pages/
    index.astro              # demo page using all sections
    api/
      contact.ts             # POST /api/contact — Resend handler
  styles/
    globals.css              # Tailwind v4 + design tokens (@theme block)
public/                       # static assets
design/                       # paired .pen baseline (slot)
docs/                         # this overlay
bytetalent-base.json          # version manifest
astro.config.mjs              # Astro + Cloudflare adapter + Tailwind v4 vite plugin
wrangler.toml                 # Cloudflare Pages config
```
