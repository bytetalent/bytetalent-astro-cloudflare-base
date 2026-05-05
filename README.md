# bytetalent-astro-cloudflare-base

Bytetalent's pattern-proving Astro + Cloudflare Pages marketing base. Pre-built section components wired to a per-project content manifest, with a working Resend-powered contact form.

This repo is **dogfooded** at [marketing.bytetalent.com](https://marketing.bytetalent.com) — every change here is verified by what ships to that URL.

## What's in here

- **10 section components** — `<HeroSection>`, `<FeaturesGrid>`, `<TestimonialStrip>`, `<PricingTable>`, `<FAQAccordion>`, `<TeamGrid>`, `<CTABanner>`, `<ContactForm>`, `<SiteFooter>`, `<SiteNav>`
- **Content manifest** — `src/content/site-content.ts` — typed per-project content (copy, links, pricing, testimonials, etc.)
- **Contact form** — `<ContactForm>` posts to `src/pages/api/contact.ts` which sends via Resend
- **Tailwind v4** — CSS-first config in `src/styles/globals.css` with `@theme` block
- **Cloudflare Pages adapter** — server output for the contact-form endpoint, builds to `dist/`
- **Per-stack docs/ overlay** — `docs/` references the universal [`bytetalent/docs`](https://github.com/bytetalent/docs) repo for cross-stack standards and adds Astro-specific patterns

## Quick start

```bash
bun install
cp .env.example .env.local      # fill in Resend + email values
bun run dev                     # http://localhost:4321
```

## Generated client repos

When the Bytetalent pipeline scaffolds a marketing-site project from this base, it:

1. Pulls this repo at its pinned version (per the new project's `bytetalent-base.json`)
2. Copies the files into the new client repo as the initial commit
3. Substitutes brand-kit values + project-specific content into `src/content/site-content.ts`
4. Layers any opt-in templates from `bytetalent/templates`
5. Opens PRs for any novel feature modules per the project's PRD

This base never ships unchanged to a real client — it's the **scaffold input** the pipeline reads. But it does ship as itself to `marketing.bytetalent.com` to prove it works.

## Agentic permissions

`.claude/settings.json` ships with this base and is copied into every generated client repo by the scaffold. It pre-approves the tool calls that Claude Code agents need for autonomous work — git, GitHub CLI, Astro dev tooling, Wrangler/Cloudflare CLI — and blocks reads of secrets files (`.env*`, `*.pem`, `*.key`) and destructive git/Wrangler operations.

When the scaffold generates a new client repo, the file carries over as-is. Project-specific additions (e.g. extra MCP server allow-entries) can be layered on top after scaffold.

## Universal skills

`skills/_universal/` is a vendored snapshot of the canonical skill library from [`bytetalent/docs/skills/`](https://github.com/bytetalent/docs). It is committed here so that Cloudflare Pages builds and generated client repos always have the full skill set without needing a second repo checkout.

```bash
# Re-sync after pulling changes to bytetalent/docs
npm run skills:sync

# Check for drift (run in CI when bytetalent/docs is checked out alongside)
npm run skills:check-drift
```

The sync script resolves the source via `BYTETALENT_DOCS_PATH` env var, or falls back to `../docs/` (standard sibling checkout layout). Skills are universal — stack-applicability filtering is a future concern tracked separately.

## Conventions

This repo follows [`bytetalent/docs`](https://github.com/bytetalent/docs) for universal cross-stack standards. Astro-specific deviations and patterns live in [`docs/guide-stack.md`](docs/guide-stack.md). See [`docs/README.md`](docs/README.md) for the overlay map.

## Documentation

| File | Purpose |
|---|---|
| [`docs/README.md`](docs/README.md) | Overlay map — what's universal vs. Astro-specific |
| [`docs/guide-stack.md`](docs/guide-stack.md) | Astro patterns: islands, content collections, component conventions |
| [`docs/guide-deploy.md`](docs/guide-deploy.md) | Cloudflare Pages deploy commands + env-var setup |
| [`docs/lessons.md`](docs/lessons.md) | Pattern-proving findings captured during the dogfood phase |

## License

Proprietary — Bytetalent internal use.
