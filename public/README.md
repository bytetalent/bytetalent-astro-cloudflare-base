# `public/` — static assets

Files served as-is at the site root.

## What's here

| File | Purpose | Replace per project? |
|---|---|---|
| `favicon.svg` | Browser tab icon | ✅ yes — generate from the brand kit at scaffold time |
| `og.svg` | Social-share preview image | ✅ yes — generate from the brand kit; some platforms expect PNG so consider also producing `og.png` (1200×630) |
| `robots.txt` | Crawler policy + sitemap pointer | ✅ yes — update the `Sitemap:` host to match the project's deployed domain |

## Replacing OG images for production

`og.svg` works in Slack, Discord, and modern social previews. **Twitter/X and some scrapers expect PNG/JPEG** — for full coverage, also produce a `1200×630 og.png`.

Quick generation paths:
- **Manual:** open `og.svg` in any vector editor (Figma, Pencil, Illustrator), export as PNG at 1200×630
- **Automated (future):** add an Astro endpoint using `satori-html` or `@vercel/og` (the latter requires Edge runtime) to generate dynamic OG images per page

The base ships SVG-only because it's the lowest-friction path that works for ~80% of share scenarios.

## Other static assets to add per project

Common additions (none ship in the base):

- `apple-touch-icon.png` — 180×180 PNG for iOS home-screen shortcut
- `manifest.webmanifest` — PWA manifest if the site needs install-to-home-screen
- `humans.txt` — credits / team page (cute, optional)
- `.well-known/` — verification files for Apple Pay, Google Search Console, etc.
