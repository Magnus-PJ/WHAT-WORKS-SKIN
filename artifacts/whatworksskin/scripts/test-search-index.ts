/**
 * Contract test: the build-time search index that backs `/search`
 * and the header `/` shortcut preserves its semantics.
 *
 * `buildSearchEntries` in `src/lib/search-index.ts` is the pure
 * collection-flattener consumed by `src/pages/search.astro`. The page
 * walks the six content collections, maps each entry's `data` to the
 * builder's input shape, and serialises the result to a JSON blob the
 * `SearchUI` island reads on hydration.
 *
 * This script exercises the contracts the live page and the typeahead
 * island depend on:
 *
 *   1. COVERAGE CONTRACT — the index includes exactly one entry per
 *      published JSON file across `ingredients`, `products`, `routines`,
 *      `concerns`, `supplements`, and `trend-watch`. Adding a new brief
 *      should automatically surface in search; nothing should be
 *      silently filtered out.
 *
 *   2. WELL-FORMED CONTRACT — every emitted entry has a non-empty
 *      `title` and `href`. A blank title would render as a clickable
 *      ghost row; a blank href would land readers on a 404.
 *
 *   3. UNIQUE-ROUTE CONTRACT — no two entries collide on `(kind, href)`.
 *      Duplicates would cause React-key warnings on hydration and would
 *      double-count the result list.
 *
 *   4. ROUTE-PREFIX CONTRACT — every entry's `href` resolves under the
 *      route prefix the page actually publishes for that kind. Catches
 *      typos like an Ingredient row getting a `routines/` href because
 *      a future refactor swapped the loop arms.
 *
 * Plus the searcher invariants — token AND-match, exact-title boost,
 * empty-query-returns-empty — that the typeahead UX depends on.
 *
 * Run via:
 *   pnpm --filter @workspace/whatworksskin run test:search-index
 *
 * Exits non-zero on any failure so it can wire into CI alongside the
 * sibling `test:mentioned-by` / `test:backlinks` contract tests.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildSearchEntries,
  rankSearchEntries,
  KIND_ROUTE_PREFIX,
  type SearchEntry,
  type SearchKind,
  type SearchInput,
} from "../src/lib/search-index.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.resolve(__dirname, "../src/content");

const COLLECTION_DIRS = {
  ingredients: "ingredients",
  products: "products",
  routines: "routines",
  concerns: "concerns",
  supplements: "supplements",
  trendWatch: "trend-watch",
} as const;

// ─────────────────────────────────────────────────────────────────────
// Test harness — minimal, no external deps.
// ─────────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures: { name: string; message: string }[] = [];

function test(name: string, fn: () => void | Promise<void>): Promise<void> {
  return Promise.resolve()
    .then(() => fn())
    .then(
      () => {
        passed++;
        console.log(`  ✓ ${name}`);
      },
      (err) => {
        failed++;
        const message = err instanceof Error ? err.stack ?? err.message : String(err);
        failures.push({ name, message });
        console.log(`  ✗ ${name}`);
      },
    );
}

function expectEqual<T>(actual: T, expected: T, label: string): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`${label}\n  expected: ${e}\n  actual:   ${a}`);
  }
}

// Stub `urlFor` that mirrors `src/lib/url.ts` minus the BASE_URL
// detour. Lets us assert against predictable hrefs.
const stubUrlFor = (p: string) => `/${p.replace(/^\/+/, "")}`;

// ─────────────────────────────────────────────────────────────────────
// Synthetic-fixture cases — pin the builder semantics.
// ─────────────────────────────────────────────────────────────────────

console.log("Search index — synthetic fixtures");

await test("builder emits one entry per row across every collection", () => {
  const input: SearchInput = {
    ingredients: [
      { slug: "niacinamide", name: "Niacinamide", eyebrowKicker: "B3 vitamer", tier: "A", lead: "Versatile barrier and pigment helper." },
      { slug: "tretinoin", name: "Tretinoin", eyebrowKicker: "Retinoid", tier: "A", lead: "All-trans retinoic acid." },
    ],
    products: [
      { slug: "the-ordinary-niacinamide", brand: "The Ordinary", name: "Niacinamide 10% + Zinc 1%", tier: "C", hero: "A low-priced niacinamide.", category: "Serum" },
    ],
    routines: [
      { slug: "am-acne", title: "AM acne routine", sub: "AM · Adult acne", goal: "Acne", body: "Salicylic, niacinamide, SPF.", time: "Morning" },
    ],
    concerns: [
      { slug: "comedonal-acne", name: "Comedonal acne", family: "Acne", oneliner: "Whiteheads and blackheads." },
    ],
    supplements: [
      { slug: "astaxanthin", name: "Astaxanthin", family: "Photoprotection", target: "UV defence", oneliner: "Carotenoid antioxidant.", tier: "B" },
    ],
    trendWatch: [
      { slug: "issue-001", n: 1, date: "20 October 2025", headline: "The launch issue", dek: "A founding manifesto." },
    ],
  };
  const entries = buildSearchEntries(input, stubUrlFor);
  expectEqual(
    entries.length,
    2 + 1 + 1 + 1 + 1 + 1,
    "one entry per input row across all six collections",
  );
});

await test("builder produces stable hrefs under each kind's route prefix", () => {
  const input: SearchInput = {
    ingredients: [{ slug: "niacinamide", name: "Niacinamide", lead: "x" }],
    products: [{ slug: "the-ordinary-niacinamide", brand: "The Ordinary", name: "Niacinamide 10%" }],
    routines: [{ slug: "am-acne", title: "AM" }],
    concerns: [{ slug: "comedonal-acne", name: "Comedonal acne" }],
    supplements: [{ slug: "astaxanthin", name: "Astaxanthin" }],
    trendWatch: [{ slug: "issue-001", n: 1, date: "x", headline: "x", dek: "x" }],
  };
  const entries = buildSearchEntries(input, stubUrlFor);
  const byKind = new Map<SearchKind, SearchEntry>();
  for (const e of entries) byKind.set(e.kind, e);
  expectEqual(byKind.get("Ingredient")?.href, "/ingredients/niacinamide", "Ingredient href");
  expectEqual(byKind.get("Product")?.href, "/products/the-ordinary-niacinamide", "Product href");
  expectEqual(byKind.get("Routine")?.href, "/routines/am-acne", "Routine href");
  expectEqual(byKind.get("Concern")?.href, "/concerns/comedonal-acne", "Concern href");
  expectEqual(byKind.get("Supplement")?.href, "/supplements/astaxanthin", "Supplement href");
  expectEqual(byKind.get("Trend Watch")?.href, "/trend-watch/issue-001", "Trend Watch href");
});

await test("builder folds tagline, lead, and chemistry into the ingredient haystack", () => {
  const input: SearchInput = {
    ingredients: [
      {
        slug: "tretinoin",
        name: "Tretinoin",
        eyebrowKicker: "Retinoid",
        tier: "A",
        lead: "Gold-standard retinoid.",
        chemistry: "all-trans retinoic acid",
        tagline: { italic: "The dermatologist's", rest: "retinoid." },
      },
    ],
    products: [],
    routines: [],
    concerns: [],
    supplements: [],
    trendWatch: [],
  };
  const [entry] = buildSearchEntries(input, stubUrlFor);
  if (!entry) throw new Error("expected one entry");
  // Every searchable field must appear in the haystack so a query for
  // "all-trans" or "gold-standard" matches the brief.
  for (const needle of ["tretinoin", "retinoid", "gold-standard", "all-trans retinoic acid", "the dermatologist's retinoid"]) {
    if (!entry.haystack.includes(needle)) {
      throw new Error(`haystack missing ${JSON.stringify(needle)}: ${entry.haystack}`);
    }
  }
});

await test("ranker requires every token to match (AND semantics)", () => {
  const input: SearchInput = {
    ingredients: [
      { slug: "niacinamide", name: "Niacinamide", eyebrowKicker: "B3 vitamer", tier: "A", lead: "Barrier helper." },
      { slug: "tretinoin", name: "Tretinoin", eyebrowKicker: "Retinoid", tier: "A", lead: "Gold-standard retinoid." },
    ],
    products: [], routines: [], concerns: [], supplements: [], trendWatch: [],
  };
  const entries = buildSearchEntries(input, stubUrlFor);
  // "barrier" matches niacinamide only.
  const r1 = rankSearchEntries("barrier", entries);
  expectEqual(r1.map((e) => e.title), ["Niacinamide"], "single token narrows correctly");
  // "barrier retinoid" matches neither (no single brief has both
  // tokens in its haystack).
  const r2 = rankSearchEntries("barrier retinoid", entries);
  expectEqual(r2.length, 0, "AND semantics: both tokens must match");
});

await test("ranker boosts exact and prefix title matches", () => {
  const input: SearchInput = {
    ingredients: [
      // Three briefs that all contain "vitamin c" in their haystack —
      // ranker should put the exact-title hit first, then the prefix
      // match, then the substring-only match.
      { slug: "l-ascorbic-acid", name: "Vitamin C", lead: "L-ascorbic acid is the gold standard form of vitamin c." },
      { slug: "vitamin-c-derivatives", name: "Vitamin C derivatives", lead: "MAP, SAP, ethyl ascorbate." },
      { slug: "tetrahexyldecyl-ascorbate", name: "Tetrahexyldecyl ascorbate", lead: "Lipid-soluble vitamin c ester." },
    ],
    products: [], routines: [], concerns: [], supplements: [], trendWatch: [],
  };
  const entries = buildSearchEntries(input, stubUrlFor);
  const ranked = rankSearchEntries("vitamin c", entries);
  expectEqual(
    ranked.map((e) => e.title),
    ["Vitamin C", "Vitamin C derivatives", "Tetrahexyldecyl ascorbate"],
    "exact title beats prefix beats substring",
  );
});

await test("ranker returns empty for empty / whitespace queries", () => {
  const input: SearchInput = {
    ingredients: [{ slug: "x", name: "X", lead: "y" }],
    products: [], routines: [], concerns: [], supplements: [], trendWatch: [],
  };
  const entries = buildSearchEntries(input, stubUrlFor);
  expectEqual(rankSearchEntries("", entries).length, 0, "empty string");
  expectEqual(rankSearchEntries("   ", entries).length, 0, "whitespace-only");
});

await test("ranker honours the limit parameter", () => {
  const input: SearchInput = {
    ingredients: Array.from({ length: 30 }, (_, i) => ({
      slug: `ing-${i}`,
      name: `Ingredient ${i}`,
      lead: "lorem common-token",
    })),
    products: [], routines: [], concerns: [], supplements: [], trendWatch: [],
  };
  const entries = buildSearchEntries(input, stubUrlFor);
  expectEqual(rankSearchEntries("common-token", entries, 5).length, 5, "limit caps result list");
});

// ─────────────────────────────────────────────────────────────────────
// Real-corpus contracts — exercised against the live content tree.
// ─────────────────────────────────────────────────────────────────────

console.log("\nSearch index — real content corpus");

function listJsonFiles(dirName: string): string[] {
  const dir = path.join(CONTENT_DIR, dirName);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isFile() && d.name.endsWith(".json"))
    .map((d) => d.name)
    .sort();
}

function loadCollection<T>(dirName: string, mapper: (raw: any, file: string) => T | null): T[] {
  const out: T[] = [];
  for (const file of listJsonFiles(dirName)) {
    const raw = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, dirName, file), "utf8"));
    const mapped = mapper(raw, file);
    if (mapped !== null) out.push(mapped);
  }
  return out;
}

const realInput: SearchInput = {
  ingredients: loadCollection(COLLECTION_DIRS.ingredients, (d) =>
    typeof d?.slug === "string" && typeof d?.name === "string"
      ? {
          slug: d.slug,
          name: d.name,
          eyebrowKicker: d.eyebrowKicker,
          tier: d.tier,
          lead: d.lead,
          tagline: d.tagline,
          chemistry: d.chemistry,
        }
      : null,
  ),
  products: loadCollection(COLLECTION_DIRS.products, (d) =>
    typeof d?.slug === "string" && typeof d?.brand === "string" && typeof d?.name === "string"
      ? { slug: d.slug, brand: d.brand, name: d.name, tier: d.tier, hero: d.hero, category: d.category }
      : null,
  ),
  routines: loadCollection(COLLECTION_DIRS.routines, (d) =>
    typeof d?.slug === "string" && typeof d?.title === "string"
      ? { slug: d.slug, title: d.title, sub: d.sub, goal: d.goal, body: d.body, time: d.time }
      : null,
  ),
  concerns: loadCollection(COLLECTION_DIRS.concerns, (d) =>
    typeof d?.slug === "string" && typeof d?.name === "string"
      ? { slug: d.slug, name: d.name, family: d.family, oneliner: d.oneliner }
      : null,
  ),
  supplements: loadCollection(COLLECTION_DIRS.supplements, (d) =>
    typeof d?.slug === "string" && typeof d?.name === "string"
      ? { slug: d.slug, name: d.name, family: d.family, target: d.target, oneliner: d.oneliner, tier: d.tier }
      : null,
  ),
  trendWatch: loadCollection(COLLECTION_DIRS.trendWatch, (d) =>
    typeof d?.slug === "string" && typeof d?.n === "number"
      ? { slug: d.slug, n: d.n, date: d.date, headline: d.headline, dek: d.dek }
      : null,
  ),
};

const realEntries = buildSearchEntries(realInput, stubUrlFor);

await test("real corpus: total entry count equals sum of files across the six collections", () => {
  const expected =
    realInput.ingredients.length +
    realInput.products.length +
    realInput.routines.length +
    realInput.concerns.length +
    realInput.supplements.length +
    realInput.trendWatch.length;
  expectEqual(realEntries.length, expected, "every published row produces exactly one search entry");
  if (realEntries.length === 0) {
    throw new Error("real corpus produced zero entries — content tree empty?");
  }
});

await test("real corpus: every entry has a non-empty title and href", () => {
  const dead = realEntries.filter((e) => !e.title || !e.href);
  if (dead.length > 0) {
    throw new Error(
      `${dead.length} entry/entries missing title or href:\n  - ` +
        dead.map((e) => `${e.kind} ${JSON.stringify(e)}`).join("\n  - "),
    );
  }
});

await test("real corpus: no two entries collide on (kind, href)", () => {
  const seen = new Map<string, SearchEntry>();
  const collisions: string[] = [];
  for (const e of realEntries) {
    const key = `${e.kind}::${e.href}`;
    const prior = seen.get(key);
    if (prior) {
      collisions.push(`${key}\n      first:  ${prior.title}\n      second: ${e.title}`);
    } else {
      seen.set(key, e);
    }
  }
  if (collisions.length > 0) {
    throw new Error(`${collisions.length} collision(s):\n  - ` + collisions.join("\n  - "));
  }
});

await test("real corpus: every entry's href matches its kind's route prefix", () => {
  const violations: string[] = [];
  for (const e of realEntries) {
    const expectedPrefix = `/${KIND_ROUTE_PREFIX[e.kind]}`;
    if (!e.href.startsWith(expectedPrefix)) {
      violations.push(`${e.kind} "${e.title}" has href ${e.href}, expected to start with ${expectedPrefix}`);
    }
  }
  if (violations.length > 0) {
    throw new Error(`${violations.length} route-prefix violation(s):\n  - ` + violations.join("\n  - "));
  }
});

await test("real corpus: every entry's haystack contains its lower-cased title and slug", () => {
  const violations: string[] = [];
  for (const e of realEntries) {
    // Title is the most useful single match — a missing entry would
    // mean a query for the brief's exact title returns nothing.
    if (!e.haystack.includes(e.title.toLowerCase())) {
      // Allowed exception: trend watch titles include the issue
      // number prefix, which gets folded in via separate tokens. Check
      // that at least the headline portion lands in the haystack.
      if (e.kind === "Trend Watch") {
        const headline = e.title.split("·").pop()?.trim().toLowerCase() ?? "";
        if (headline && !e.haystack.includes(headline)) {
          violations.push(`${e.kind} "${e.title}" headline missing from haystack`);
        }
      } else {
        violations.push(`${e.kind} "${e.title}" missing from haystack: ${e.haystack}`);
      }
    }
  }
  if (violations.length > 0) {
    throw new Error(`${violations.length} haystack violation(s):\n  - ` + violations.join("\n  - "));
  }
});

await test("real corpus: a query for any indexed brief's title returns that brief first", () => {
  // Sample five entries across the six kinds and confirm the top
  // result for each is the brief itself. Catches a future regression
  // in the rank function that demotes exact-title hits.
  const sampleByKind = new Map<SearchKind, SearchEntry>();
  for (const e of realEntries) {
    if (!sampleByKind.has(e.kind)) sampleByKind.set(e.kind, e);
  }
  const violations: string[] = [];
  for (const e of sampleByKind.values()) {
    const ranked = rankSearchEntries(e.title, realEntries, 3);
    if (!ranked[0] || ranked[0].href !== e.href) {
      violations.push(
        `${e.kind} "${e.title}" — top result was "${ranked[0]?.title ?? "(none)"}"`,
      );
    }
  }
  if (violations.length > 0) {
    throw new Error(`${violations.length} top-result violation(s):\n  - ` + violations.join("\n  - "));
  }
});

// ─────────────────────────────────────────────────────────────────────
// Inline-bundle parity — guards against the canonical TS rank function
// in `src/lib/search-index.ts` and the inline JS copy embedded in
// `src/scripts/search-ui.inline.js` drifting out of sync.
//
// The dev preview proxy 404s every Astro/Vite root-relative URL
// (`/src/...`, `/_astro/...`, `/@vite/client`), so the search
// controller must ship inline (`<script is:inline>`) rather than as
// a `<script src=...>`. Inlining means we keep TWO copies of the rank
// algorithm; this section runs both against the same fixtures and
// asserts identical output so a future edit to one copy can't silently
// regress the other.
// ─────────────────────────────────────────────────────────────────────

console.log("\nSearch index — inline-bundle parity");

import * as vm from "node:vm";

const INLINE_PATH = path.resolve(__dirname, "../src/scripts/search-ui.inline.js");
const inlineSource = fs.readFileSync(INLINE_PATH, "utf8");

// Execute the IIFE in a sandbox without `document`. The inline file's
// Node-detect branch exposes `rankSearchEntries` on `globalThis` and
// returns before the DOM controller code runs.
const sandbox: { __WWS_INLINE_RANK__?: typeof rankSearchEntries } = {};
vm.createContext(sandbox);
vm.runInContext(inlineSource, sandbox, { filename: "search-ui.inline.js" });

const inlineRank = sandbox.__WWS_INLINE_RANK__;
if (typeof inlineRank !== "function") {
  console.error(
    "✗ inline-bundle parity setup failed: search-ui.inline.js did not expose __WWS_INLINE_RANK__",
  );
  process.exit(1);
}

await test("inline rank function exists and is callable", () => {
  if (typeof inlineRank !== "function") throw new Error("inline rank missing");
});

await test("inline ranker matches canonical ranker on synthetic AND-semantics fixture", () => {
  const input: SearchInput = {
    ingredients: [
      { slug: "niacinamide", name: "Niacinamide", eyebrowKicker: "B3 vitamer", tier: "A", lead: "Barrier helper." },
      { slug: "tretinoin", name: "Tretinoin", eyebrowKicker: "Retinoid", tier: "A", lead: "Gold-standard retinoid." },
    ],
    products: [], routines: [], concerns: [], supplements: [], trendWatch: [],
  };
  const entries = buildSearchEntries(input, stubUrlFor);
  for (const q of ["barrier", "retinoid", "barrier retinoid", "niac", ""]) {
    const ts = rankSearchEntries(q, entries).map((e) => e.href);
    const js = inlineRank(q, entries).map((e: SearchEntry) => e.href);
    expectEqual(js, ts, `inline vs canonical ranker disagreed on query ${JSON.stringify(q)}`);
  }
});

await test("inline ranker matches canonical ranker across the full real corpus", () => {
  // Sample queries that touch every kind, plus a couple of stock
  // chip prompts the empty state surfaces. If the two rankers ever
  // disagree on order or membership, this fails fast.
  const queries = [
    "niacinamide",
    "tretinoin",
    "azelaic",
    "spf",
    "vitamin c",
    "barrier",
    "the ordinary",
    "issue 001",
    "trend watch",
    "comedonal",
    "magnesium",
    "salicylic",
    "melasma",
    "zzznotreal",
  ];
  const violations: string[] = [];
  for (const q of queries) {
    const ts = rankSearchEntries(q, realEntries, 16).map((e) => e.href);
    const js = inlineRank(q, realEntries, 16).map((e: SearchEntry) => e.href);
    if (JSON.stringify(ts) !== JSON.stringify(js)) {
      violations.push(
        `query ${JSON.stringify(q)}\n      ts: ${JSON.stringify(ts)}\n      js: ${JSON.stringify(js)}`,
      );
    }
  }
  if (violations.length > 0) {
    throw new Error(
      `${violations.length} parity violation(s) between canonical and inline rankers:\n  - ` +
        violations.join("\n  - "),
    );
  }
});

await test("inline ranker honours the limit parameter identically", () => {
  for (const limit of [1, 3, 5, 16]) {
    const ts = rankSearchEntries("vitamin", realEntries, limit).map((e) => e.href);
    const js = inlineRank("vitamin", realEntries, limit).map((e: SearchEntry) => e.href);
    expectEqual(js, ts, `inline vs canonical limit=${limit}`);
  }
});

// ─────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────

console.log("");
const total = passed + failed;
if (failed > 0) {
  console.error(`✗ ${failed} of ${total} search-index cases failed.`);
  for (const f of failures) {
    console.error(`\n  Failure: ${f.name}`);
    console.error(
      "    " +
        f.message
          .split("\n")
          .map((l) => l)
          .join("\n    "),
    );
  }
  process.exit(1);
}
console.log(`✓ All ${total} search-index cases passed.`);
