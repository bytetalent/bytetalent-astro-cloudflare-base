/**
 * sync-universal-skills.mjs
 *
 * Copies the canonical universal skills from the bytetalent/docs sibling repo
 * into skills/_universal/ in this repo. The output is committed to source
 * control so Cloudflare Pages (and any other environment that doesn't check
 * out the bytetalent/docs repo) always has the full universal skill set
 * available.
 *
 * Usage:
 *   node scripts/sync-universal-skills.mjs
 *
 * The source is resolved in the following order:
 *   1. BYTETALENT_DOCS_PATH env var (absolute path to bytetalent/docs root)
 *   2. ../docs relative to this repo root (standard sibling checkout layout)
 *
 * Runs idempotently — existing files are overwritten, stale files (slugs
 * that no longer exist in the source) are deleted.
 *
 * After running, commit the resulting changes in skills/_universal/ to keep
 * the production copy up to date.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, rmSync } from "fs";
import { join, resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ---------------------------------------------------------------------------
// Resolve paths
// ---------------------------------------------------------------------------

const REPO_ROOT = resolve(__dirname, "..");
const DEST_DIR = join(REPO_ROOT, "skills", "_universal");

function resolveSourceDir() {
  const override = process.env["BYTETALENT_DOCS_PATH"];
  if (override) {
    const candidate = join(resolve(override), "skills");
    if (existsSync(candidate)) return candidate;
    console.error(`BYTETALENT_DOCS_PATH is set but skills/ not found at: ${candidate}`);
    process.exit(1);
  }

  // Default: sibling repo layout — bytetalent/docs is checked out next to
  // bytetalent-astro-cloudflare-base (one level up).
  const sibling = resolve(REPO_ROOT, "..", "docs", "skills");
  if (existsSync(sibling)) return sibling;

  console.error(
    "Cannot find bytetalent/docs/skills/. Set BYTETALENT_DOCS_PATH or check out " +
      "the bytetalent/docs repo as a sibling to this repo.\n" +
      `Tried: ${sibling}`
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Copy helpers
// ---------------------------------------------------------------------------

/**
 * Recursively copies src directory into dest. Creates dest if it doesn't
 * exist. Returns the set of relative file paths that were copied.
 */
function copyDir(src, dest) {
  if (!existsSync(dest)) mkdirSync(dest, { recursive: true });

  const entries = readdirSync(src, { withFileTypes: true });
  const copied = new Set();

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      const nested = copyDir(srcPath, destPath);
      for (const f of nested) copied.add(join(entry.name, f));
    } else if (entry.isFile()) {
      const content = readFileSync(srcPath);
      const existing = existsSync(destPath) ? readFileSync(destPath) : null;
      if (!existing || !content.equals(existing)) {
        writeFileSync(destPath, content);
      }
      copied.add(entry.name);
    }
  }

  return copied;
}

/**
 * Removes slugs from DEST_DIR that no longer exist in the source.
 * Returns array of removed slug names.
 */
function removeStaleSkills(srcDir, destDir) {
  if (!existsSync(destDir)) return [];

  const srcSlugs = new Set(
    readdirSync(srcDir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
  );

  const destSlugs = readdirSync(destDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  const removed = [];
  for (const slug of destSlugs) {
    if (!srcSlugs.has(slug)) {
      rmSync(join(destDir, slug), { recursive: true, force: true });
      removed.push(slug);
    }
  }
  return removed;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const SOURCE_DIR = resolveSourceDir();

console.log(`Source : ${SOURCE_DIR}`);
console.log(`Dest   : ${DEST_DIR}`);

// Ensure dest root exists.
if (!existsSync(DEST_DIR)) mkdirSync(DEST_DIR, { recursive: true });

// Remove slugs that have been deleted from the source.
const removed = removeStaleSkills(SOURCE_DIR, DEST_DIR);

// Copy each skill directory.
const srcSlugs = readdirSync(SOURCE_DIR, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name);

let copied = 0;
let unchanged = 0;

function countFiles(dir) {
  let count = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isFile()) count++;
    else if (entry.isDirectory()) count += countFiles(join(dir, entry.name));
  }
  return count;
}

for (const slug of srcSlugs) {
  const srcSlug = join(SOURCE_DIR, slug);
  const destSlug = join(DEST_DIR, slug);
  const wasPresent = existsSync(destSlug);

  const before = wasPresent ? countFiles(destSlug) : 0;
  copyDir(srcSlug, destSlug);
  const after = countFiles(destSlug);

  if (!wasPresent || after !== before) {
    copied++;
    console.log(`  + ${slug}`);
  } else {
    unchanged++;
  }
}

// Write a manifest file recording the sync state.
const manifestPath = join(DEST_DIR, "_SYNC_MANIFEST.json");
const manifest = {
  syncedAt: new Date().toISOString(),
  sourceDir: SOURCE_DIR,
  slugCount: srcSlugs.length,
  slugs: srcSlugs.sort(),
};
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

// Summary
console.log(`\nSync complete:`);
console.log(`  ${srcSlugs.length} total slugs`);
if (copied > 0) console.log(`  ${copied} updated/added`);
if (unchanged > 0) console.log(`  ${unchanged} already up to date`);
if (removed.length > 0) console.log(`  ${removed.length} removed (stale): ${removed.join(", ")}`);
console.log(`\nCommit the changes in skills/_universal/ to keep production in sync.`);
