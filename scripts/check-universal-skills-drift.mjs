/**
 * check-universal-skills-drift.mjs
 *
 * CI/pre-commit check: verifies that skills/_universal/ is up to date with
 * bytetalent/docs/skills/. Exits with code 1 if drift is detected.
 *
 * Usage:
 *   node scripts/check-universal-skills-drift.mjs
 *
 * Run this in CI when the bytetalent/docs repo is checked out alongside this
 * repo (e.g. in a monorepo CI setup). If the sibling repo is not present this
 * script exits 0 (skip) rather than failing — drift checks only work when
 * both repos are available.
 *
 * The check covers:
 *   - slug presence (new skills added to docs not yet synced here)
 *   - slug removal (skills deleted from docs but still present here)
 *   - SKILL.md content (modified skills not yet re-synced here)
 */

import { existsSync, readdirSync, readFileSync } from "fs";
import { join, resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REPO_ROOT = resolve(__dirname, "..");
const COMMITTED_DIR = join(REPO_ROOT, "skills", "_universal");

// ---------------------------------------------------------------------------
// Resolve source (same logic as sync-universal-skills.mjs)
// ---------------------------------------------------------------------------

function resolveSourceDir() {
  const override = process.env["BYTETALENT_DOCS_PATH"];
  if (override) {
    const candidate = join(resolve(override), "skills");
    return existsSync(candidate) ? candidate : null;
  }
  // Default: sibling repo layout — one level up from bytetalent-astro-cloudflare-base/
  const sibling = resolve(REPO_ROOT, "..", "docs", "skills");
  return existsSync(sibling) ? sibling : null;
}

const SOURCE_DIR = resolveSourceDir();

if (!SOURCE_DIR) {
  // bytetalent/docs not checked out — skip drift check.
  console.log("check-universal-skills-drift: bytetalent/docs not found, skipping drift check.");
  process.exit(0);
}

if (!existsSync(COMMITTED_DIR)) {
  console.error(
    "ERROR: skills/_universal/ does not exist in this repo.\n" +
      "Run: node scripts/sync-universal-skills.mjs && git commit skills/_universal/"
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Compare
// ---------------------------------------------------------------------------

const srcSlugs = new Set(
  readdirSync(SOURCE_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
);

// Filter out the _SYNC_MANIFEST.json file from committed dir listing.
const committedSlugs = new Set(
  readdirSync(COMMITTED_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
);

const missing = [...srcSlugs].filter((s) => !committedSlugs.has(s));
const stale = [...committedSlugs].filter((s) => !srcSlugs.has(s));
const modified = [];

for (const slug of srcSlugs) {
  if (!committedSlugs.has(slug)) continue; // already captured in missing

  const srcFile = join(SOURCE_DIR, slug, "SKILL.md");
  const destFile = join(COMMITTED_DIR, slug, "SKILL.md");

  if (!existsSync(srcFile) || !existsSync(destFile)) continue;

  const srcContent = readFileSync(srcFile, "utf8");
  const destContent = readFileSync(destFile, "utf8");

  if (srcContent !== destContent) {
    modified.push(slug);
  }
}

if (missing.length === 0 && stale.length === 0 && modified.length === 0) {
  console.log("check-universal-skills-drift: skills/_universal/ is up to date.");
  process.exit(0);
}

// Report drift.
console.error("\nERROR: skills/_universal/ is out of sync with bytetalent/docs/skills/\n");

if (missing.length > 0) {
  console.error(`  New skills in bytetalent/docs not yet synced (${missing.length}):`);
  for (const s of missing) console.error(`    + ${s}`);
}
if (stale.length > 0) {
  console.error(`  Skills removed from bytetalent/docs but still present here (${stale.length}):`);
  for (const s of stale) console.error(`    - ${s}`);
}
if (modified.length > 0) {
  console.error(`  Modified skills not yet re-synced (${modified.length}):`);
  for (const s of modified) console.error(`    ~ ${s}`);
}

console.error("\nFix: node scripts/sync-universal-skills.mjs && git add skills/_universal/ && git commit");
process.exit(1);
