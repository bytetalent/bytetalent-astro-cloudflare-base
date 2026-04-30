// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: cloudflare({
    platformProxy: { enabled: true },
  }),
  vite: {
    plugins: [tailwindcss()],
  },
  site: "https://marketing.bytetalent.com",
  // Stack-specific notes:
  //   - Astro 5+ with server output for the contact-form POST endpoint.
  //   - Cloudflare Pages adapter so dist/ deploys via wrangler.
  //   - Tailwind v4 via the @tailwindcss/vite plugin (CSS-first config in
  //     src/styles/globals.css with @theme block).
  //   - Per-stack overlay: see docs/guide-stack.md and docs/guide-deploy.md
  //     for the bytetalent/docs deviations specific to this base.
});
