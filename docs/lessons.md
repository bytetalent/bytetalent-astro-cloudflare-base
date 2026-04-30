# Lessons — Pattern-Proving Findings

This file accumulates findings from the dogfood phase of the Astro base. Each lesson informs:

- Iterations on this base (v1.1.0, v1.2.0, etc.)
- The Next.js base (`bytetalent-nextjs-clerk-supabase-base`) — patterns proven here apply with adjustments
- The pipeline's R1-1 capture matrix (`docs/app-plan.md` in `bytetalent/bt-ai-web`)

## Format

Each lesson:

```
## YYYY-MM-DD — short title

What we tried, what we found, what changed.
- For the base: vN.M.K — what changed in this repo
- For the Next.js base: what to do differently when applying this pattern
- For the pipeline: signal type (UX punch list / base coverage gap / convention violation / etc.)
```

---

## 2026-04-30 — initial v1.0.0 release

First commit. Captures the section-component + content-manifest pattern; demonstrates Tailwind v4 CSS-first config; ships a working Resend contact form on Cloudflare Pages with honeypot anti-spam.

What's intentional vs. deferred:
- **Single-page demo** at `/`. Multi-page navigation (separate `/about`, `/pricing`, etc.) deferred until a real client engagement asks for it. The 10 sections fit on a single home page well enough for proof-of-concept.
- **No image generation step yet.** Hero images, feature icons, and team photos are placeholder. The pipeline will fill these from PRD + brand kit at scaffold time; the base just leaves the slot.
- **No Astro content collections** for blog/case-studies. Decision per [`docs/app-plan.md`](https://github.com/bytetalent/bt-ai-web/blob/main/docs/app-plan.md) R1-2: those become **opt-in templates** in `bytetalent/templates`, not part of the base. A marketing site that needs a blog applies the `blog-mdx` template at scaffold time.
- **No island components** in the base. Everything is server-rendered. If a real engagement needs interactivity beyond the contact form, an island gets added then.
- **No tests.** A smoke test that verifies the build succeeds is sufficient for a marketing base; component tests aren't a base requirement (per [`bytetalent/docs/guide-testing.md`](https://github.com/bytetalent/docs/blob/main/guide-testing.md)).

Open questions to capture as engagements run:

- Is the section-component contract too rigid? Some clients may want a section variant we don't ship — does that become an opt-in template, or a base v1.x.0 addition?
- Is the content manifest type the right shape? Does it need recursion (e.g., FAQ items containing sub-items)?
- Does Tailwind v4 CSS-first scale to client brand-kit substitutions cleanly? Is one big `@theme` block enough or do we need stack-specific token files?
- Does the contact form need rate limiting beyond the honeypot? (Cloudflare's default DDoS protection covers gross abuse, but per-IP rate limiting via Cloudflare Workers KV would be a small addition.)

---

(Add new lessons below this line as they happen.)
