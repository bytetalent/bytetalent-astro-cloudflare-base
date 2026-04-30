# Astro Stack — Patterns

Astro-specific patterns that complement [`bytetalent/docs`](https://github.com/bytetalent/docs).

## 1. File Conventions

```
src/
  components/                # .astro components
    sections/                # marketing section components (this base's main surface)
  layouts/                   # .astro layouts (head, fonts, theme)
  pages/                     # routes — file-based; .astro for HTML, .ts for API
  content/                   # typed content (site-content.ts, optional Astro content collections)
  styles/                    # CSS files
```

### Component naming

- `.astro` files: `PascalCase.astro` for components used as JSX-like tags (`<HeroSection>`, `<FeaturesGrid>`)
- TS files: `kebab-case.ts` (matches the universal convention from [`bytetalent/docs/guide-code.md`](https://github.com/bytetalent/docs/blob/main/guide-code.md))
- API routes: `kebab-case.ts` under `src/pages/api/`

The `comp-` prefix from the universal guide applies to **React** components in stacks where they're used (Next.js base). In an Astro-only base, the prefix is dropped — Astro components use `PascalCase.astro` natively.

## 2. Server-First by Default

Astro defaults are aligned with the [`bytetalent/docs/guide-code.md`](https://github.com/bytetalent/docs/blob/main/guide-code.md) "server first" principle:

- `.astro` components render server-side (or at build time) and ship zero JavaScript by default
- Inline `<script>` tags in `.astro` files run client-side — use sparingly
- For interactive UI, use **Astro Islands** (`client:load`, `client:visible`, `client:idle`) — only the islands ship JS

This base avoids islands entirely — every section is server-rendered. The contact form has a small inline script for the AJAX submit. Add islands only when interactivity demands it.

## 3. Output Mode — `output: "server"`

This base uses `output: "server"` (in `astro.config.mjs`) for the contact-form POST endpoint. Marketing pages still pre-render at build; `/api/contact.ts` runs on Cloudflare Workers per request.

If you don't need server endpoints, switch to `output: "static"` for pure SSG.

## 4. Tailwind v4 (CSS-First)

This base uses Tailwind v4 via the `@tailwindcss/vite` plugin — no JS config file. Everything lives in `src/styles/globals.css`:

```css
@import "tailwindcss";

@theme {
  --color-primary: #96c237;
  --font-sans: "Inter", ...;
}
```

Token names follow [`bytetalent/docs/guide-design.md`](https://github.com/bytetalent/docs/blob/main/guide-design.md). Per-project value substitution happens at scaffold time when the pipeline generates a client repo.

For utility classes:
```css
@utility text-section-heading {
  font-size: 1.875rem;
  ...
}
```

## 5. Content Manifest Pattern

The 10 section components are wired to `src/content/site-content.ts` — a typed object per project. Component code stays the same; only the manifest values change.

```typescript
import { siteContent } from "@/content/site-content";
// ...
<HeroSection hero={siteContent.hero} />
```

When the pipeline scaffolds a generated client repo, it produces a new `site-content.ts` populated from the project's PRD + brand kit. The components don't change — they read from the manifest.

This is **strategic decision #6** in the pipeline plan: code-gen for marketing surfaces becomes content-manifest generation, not JSX synthesis.

## 6. Cloudflare Adapter — `locals.runtime.env`

In production on Cloudflare Pages, environment variables and bindings are accessed via `locals.runtime.env`:

```typescript
export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any)?.runtime?.env ?? import.meta.env;
  const apiKey = env.RESEND_API_KEY;
  // ...
};
```

In dev, `import.meta.env` works as the fallback (loads from `.env.local`).

Set production env vars via:
- `wrangler pages secret put RESEND_API_KEY` (from CLI)
- Cloudflare dashboard → Pages → Settings → Environment variables

## 7. Forms — No Library, AJAX Submit

Per [`bytetalent/docs/guide-forms.md`](https://github.com/bytetalent/docs/blob/main/guide-forms.md), no form library. The contact form uses:

- Native HTML `<form>` with `method="POST"` + `action="/api/contact"` (works without JS)
- An inline `<script>` that intercepts submit, posts JSON, and updates the result region (progressive enhancement)
- A honeypot field (`name="website"`) at `position: absolute; left: -9999px` — bots fill it, humans don't see it

If JavaScript is disabled, the form still works via standard form post — Cloudflare returns the JSON response and the browser shows it as the next page. The script just makes the result render inline.

## 8. SEO + Meta

`src/layouts/Layout.astro` handles:

- Title + description from the content manifest's `meta` block
- Canonical link from `Astro.url.pathname` + `PUBLIC_SITE_URL`
- OG / Twitter meta
- Font preconnect

Per-page overrides via `<Layout title="..." description="...">`.

## 9. Image Handling

Use Astro's built-in `<Image>` from `astro:assets` for optimized images:

```astro
---
import { Image } from "astro:assets";
import heroImage from "@/assets/hero.jpg";
---
<Image src={heroImage} alt="..." width={800} height={400} />
```

For external images (e.g., from a CMS or the brand kit), use `<img>` directly with explicit `width`/`height` attrs to prevent layout shift.

## 10. Astro-Specific Conventions

- `client:` directives only on islands that genuinely need interactivity
- `define:vars={{ ... }}` on `<script>` blocks to pass server values to client scripts (used in `ContactForm.astro`)
- `class:list={[...]}` for conditional classes (Astro's built-in)
- `Astro.props` is the prop entry; types declared via `interface Props`

## Related

- [`docs/guide-deploy.md`](guide-deploy.md) — Cloudflare Pages deploy commands
- [`docs/lessons.md`](lessons.md) — pattern-proving findings
- [`bytetalent/docs/guide-code.md`](https://github.com/bytetalent/docs/blob/main/guide-code.md) — universal coding standards
- [`bytetalent/docs/guide-design.md`](https://github.com/bytetalent/docs/blob/main/guide-design.md) — design tokens, typography, marketing spacing scale
