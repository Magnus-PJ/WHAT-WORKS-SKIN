/**
 * Contract test: every `citations: string[]` ID on a brief resolves
 * to a real entry in the /sources catalogue.
 *
 * The catalogue is built from two real sources of truth — ingredient
 * `studies` (PMID-keyed) and product `sources` (free-text tag). Other
 * brief kinds (supplements, concerns, routines, trend-watch) cite
 * those entries via an explicit `citations: string[]` array. The
 * runtime index in `src/lib/citations.ts` silently skips unknown IDs
 * so the build never fails, but unknown IDs would render as broken
 * footer links to a `#missing-id` anchor on `/sources`.
 *
 * This script reads the same JSON files Astro reads and reports any
 * unknown citation reference. Exits non-zero on failure so it can
 * wire into CI alongside the other validate:* contract tests.
 *
 * Run via:
 *   pnpm --filter @workspace/whatworksskin run validate:citation-refs
 */

import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "src", "content");

const PMID_RE = /^\d{4,9}$/;

const normaliseText = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[\u2010-\u2015\u2212]/g, "-")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

const slugify = (s: string, max = 80): string =>
  normaliseText(s)
    .replace(/\s/g, "-")
    .slice(0, max)
    .replace(/-+$/g, "") || "src";

function citationIdForStudy(study: { pmid?: string; authors?: string; journal?: string; year?: string | number }): string {
  if (study.pmid && PMID_RE.test(String(study.pmid).trim())) {
    return `pmid-${String(study.pmid).trim()}`;
  }
  const seed = [study.authors, study.journal, study.year].filter(Boolean).join(" ");
  return `cite-${slugify(seed)}`;
}

function citationIdForSource(source: { n: string }): string {
  return `cite-${slugify(source.n)}`;
}

type Json = Record<string, unknown>;

function loadDir(name: string): Array<{ file: string; data: Json }> {
  const dir = join(ROOT, name);
  let entries: string[];
  try {
    entries = readdirSync(dir).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }
  return entries.map((f) => ({
    file: `${name}/${f}`,
    data: JSON.parse(readFileSync(join(dir, f), "utf8")) as Json,
  }));
}

const ingredients = loadDir("ingredients");
const products = loadDir("products");
const supplements = loadDir("supplements");
const concerns = loadDir("concerns");
const routines = loadDir("routines");
const trendWatch = loadDir("trend-watch");

const known = new Set<string>();
for (const { data } of ingredients) {
  const studies = (data.studies as Array<Record<string, unknown>>) ?? [];
  for (const s of studies) known.add(citationIdForStudy(s as never));
}
for (const { data } of products) {
  const sources = (data.sources as Array<Record<string, unknown>>) ?? [];
  for (const s of sources) {
    if (typeof s.n === "string") known.add(citationIdForSource({ n: s.n }));
  }
}

const failures: string[] = [];
const checkRefs = (
  collection: Array<{ file: string; data: Json }>,
) => {
  for (const { file, data } of collection) {
    const refs = data.citations;
    if (!Array.isArray(refs)) continue;
    for (const id of refs) {
      if (typeof id !== "string") {
        failures.push(`${file}: non-string citation reference ${JSON.stringify(id)}`);
        continue;
      }
      if (!known.has(id)) {
        failures.push(`${file}: unknown citation id "${id}"`);
      }
    }
  }
};

for (const c of [ingredients, products, supplements, concerns, routines, trendWatch]) {
  checkRefs(c);
}

const total = known.size;
const checked =
  ingredients.length + products.length + supplements.length +
  concerns.length + routines.length + trendWatch.length;

if (failures.length > 0) {
  console.error(`citation-refs: ${failures.length} broken reference${failures.length === 1 ? "" : "s"}`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  console.error(`\n(${total} known citation IDs across ${checked} briefs)`);
  process.exit(1);
}

console.log(`citation-refs: OK — ${total} catalogue IDs, ${checked} briefs scanned, no broken references.`);
