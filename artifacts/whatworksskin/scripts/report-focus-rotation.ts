/**
 * Editor preview: upcoming "in-focus" auto-rotated picks.
 *
 * The home page (`src/pages/index.astro`) surfaces three "in-focus"
 * cards — one each for concerns, products, and supplements — that
 * rotate deterministically per Trend Watch issue. The picker is
 *
 *     pool[issueIndex % pool.length]
 *
 * where `issueIndex` is the latest published Trend Watch issue
 * number, and `pool` is the band's curated "preferred" slug list
 * followed by every other focus-ready entry in a deterministic
 * fallback order. An editor can pin a specific brief for an issue
 * via that issue's `focus: { concern, product, supplement }` field;
 * pinned slugs must still pass the band's rich-data check, otherwise
 * the rotation pick wins so the page never renders half-empty.
 *
 * Editors planning ahead can't see what issues 015, 016, 017… will
 * land on without walking the rotation pool by hand. This script
 * replays the rotation rules from `index.astro` against the raw
 * JSON content (no Astro boot needed) and prints:
 *
 *   1. The rotation pool for each band, in pool order, so editors
 *      know what's eligible and where each entry sits.
 *   2. The auto-picked brief for the next several upcoming issues
 *      per band — including the current latest issue, so editors
 *      can sanity-check what readers see today.
 *   3. A "pinned" flag against any upcoming issue that already has
 *      a `focus.<band>` override, so editors can tell at a glance
 *      which issues are already curated and which still need
 *      thought.
 *
 * Run via:
 *   pnpm --filter @workspace/whatworksskin run report:focus-rotation
 *
 * The script is dev-only — it reads the catalogue, prints a
 * report, and always exits 0. It is not a build-time validator.
 *
 * Optional CLI flags:
 *   --issues=N       How many upcoming issues to preview. Default 4.
 *   --start=N        Issue number to start the preview from. Defaults
 *                    to the latest published issue's number, so the
 *                    first row is "what readers see right now".
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT = path.join(__dirname, "..", "src", "content");

// ─────────────────────────────────────────────────────────────────────
// CLI args
// ─────────────────────────────────────────────────────────────────────

function parseIntArg(name: string, fallback: number): number {
  for (const arg of process.argv.slice(2)) {
    const m = arg.match(new RegExp(`^--${name}=(-?\\d+)$`));
    if (m) {
      const n = Number.parseInt(m[1], 10);
      if (Number.isFinite(n)) return n;
    }
  }
  return fallback;
}

const PREVIEW_COUNT = Math.max(1, parseIntArg("issues", 4));
const START_OVERRIDE = parseIntArg("start", -1);

// ─────────────────────────────────────────────────────────────────────
// Filesystem layout
// ─────────────────────────────────────────────────────────────────────

type Json = Record<string, unknown>;

function readJsonDir(dir: string): { slug: string; data: Json }[] {
  if (!fs.existsSync(dir)) return [];
  const out: { slug: string; data: Json }[] = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) continue; // skip _drafts/ etc.
    if (!name.endsWith(".json")) continue;
    const data = JSON.parse(fs.readFileSync(full, "utf8")) as Json;
    const slug = typeof data.slug === "string" ? data.slug : name.replace(/\.json$/, "");
    out.push({ slug, data });
  }
  return out;
}

const concernsAll = readJsonDir(path.join(CONTENT, "concerns"));
const productsAll = readJsonDir(path.join(CONTENT, "products"));
const supplementsAll = readJsonDir(path.join(CONTENT, "supplements"));
const trendIssues = readJsonDir(path.join(CONTENT, "trend-watch"));

// ─────────────────────────────────────────────────────────────────────
// Mirror the home page's featured-grid pickers so we can compute the
// `gridSlugs` exclusion sets the same way `index.astro` does.
// ─────────────────────────────────────────────────────────────────────

const FEATURED_PER_BAND = 3;
const tierRank: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };

function pickFeatured<T extends { data: Json }>(
  all: T[],
  fallbackSort: (a: T, b: T) => number,
  cap: number = FEATURED_PER_BAND,
): T[] {
  const flagged = all.filter((e) => e.data.featured === true);
  flagged.sort(fallbackSort);
  const picks = flagged.slice(0, cap);
  if (picks.length < cap) {
    const fallback = [...all].sort(fallbackSort);
    for (const e of fallback) {
      if (picks.length >= cap) break;
      if (!picks.includes(e)) picks.push(e);
    }
  }
  return picks;
}

const featuredConcernSlugs = new Set(
  pickFeatured(concernsAll, (a, b) =>
    String(a.data.name ?? "").localeCompare(String(b.data.name ?? "")),
  ).map((e) => e.slug),
);

const featuredProductSlugs = new Set(
  pickFeatured(productsAll, (a, b) => {
    const ta = (tierRank[String(a.data.tier ?? "")] ?? 9);
    const tb = (tierRank[String(b.data.tier ?? "")] ?? 9);
    if (ta !== tb) return ta - tb;
    const sa = typeof a.data.score === "number" ? a.data.score : -Infinity;
    const sb = typeof b.data.score === "number" ? b.data.score : -Infinity;
    return sb - sa;
  }).map((e) => e.slug),
);

const featuredSupplementSlugs = new Set(
  pickFeatured(supplementsAll, (a, b) => {
    const ta = (tierRank[String(a.data.tier ?? "")] ?? 9);
    const tb = (tierRank[String(b.data.tier ?? "")] ?? 9);
    if (ta !== tb) return ta - tb;
    return String(a.data.name ?? "").localeCompare(String(b.data.name ?? ""));
  }).map((e) => e.slug),
);

// ─────────────────────────────────────────────────────────────────────
// Mirror the rotation-pool builder from `index.astro`.
// Keep the focus-readiness checks identical to the runtime — if these
// drift, the report stops matching what readers actually see.
// ─────────────────────────────────────────────────────────────────────

type Entry = { slug: string; data: Json };

function buildRotationPool(
  preferredSlugs: readonly string[],
  all: readonly Entry[],
  isFocusReady: (e: Entry) => boolean,
  gridSlugs: Set<string>,
  fallbackSort: (a: Entry, b: Entry) => number,
): Entry[] {
  const bySlug = new Map(all.map((e) => [e.slug, e]));
  const pool: Entry[] = [];
  const seen = new Set<string>();
  for (const s of preferredSlugs) {
    const e = bySlug.get(s);
    if (!e || seen.has(s)) continue;
    if (!isFocusReady(e) || gridSlugs.has(s)) continue;
    pool.push(e);
    seen.add(s);
  }
  for (const e of [...all].sort(fallbackSort)) {
    if (seen.has(e.slug)) continue;
    if (!isFocusReady(e) || gridSlugs.has(e.slug)) continue;
    pool.push(e);
    seen.add(e.slug);
  }
  return pool;
}

// Concern band — preferred slugs and readiness check copied from
// `index.astro`. Update both sides together if the home page changes.
const concernFocusPreferred = [
  "eczema",
  "pih",
  "sun-spots",
  "post-procedure",
  "comedonal-acne",
] as const;
const concernIsFocusReady = (e: Entry): boolean =>
  Array.isArray(e.data.triggers) &&
  (e.data.triggers as unknown[]).length > 0 &&
  typeof e.data.bottom === "string" &&
  (e.data.bottom as string).length > 0;
const concernRotation = buildRotationPool(
  concernFocusPreferred,
  concernsAll,
  concernIsFocusReady,
  featuredConcernSlugs,
  (a, b) => String(a.data.name ?? "").localeCompare(String(b.data.name ?? "")),
);

// Product band.
const productFocusPreferred = [
  "paulas-choice-2-bha-liquid-exfoliant",
  "skinceuticals-c-e-ferulic",
  "deconstruct-azelaic-15-booster",
  "the-ordinary-azelaic-acid-suspension-10",
  "minimalist-tranexamic-03",
] as const;
const productIsFocusReady = (e: Entry): boolean =>
  e.data.tier === "A" &&
  typeof e.data.score === "number" &&
  Array.isArray(e.data.scoreBreakdown) &&
  (e.data.scoreBreakdown as unknown[]).length > 0;
const productRotation = buildRotationPool(
  productFocusPreferred,
  productsAll,
  productIsFocusReady,
  featuredProductSlugs,
  (a, b) => {
    const sa = typeof a.data.score === "number" ? a.data.score : 0;
    const sb = typeof b.data.score === "number" ? b.data.score : 0;
    return sb - sa;
  },
);

// Supplement band.
const supplementFocusPreferred = [
  "glutathione-iv",
  "sea-moss",
  "exosome-oral",
  "biotin",
  "marine-collagen-mega",
] as const;
const supplementIsFocusReady = (e: Entry): boolean => {
  if (!Array.isArray(e.data.evidence)) return false;
  const ev = e.data.evidence as unknown[];
  if (ev.length === 0) return false;
  if (
    !ev.every(
      (x) =>
        typeof (x as { c?: unknown }).c === "string" &&
        typeof (x as { w?: unknown }).w === "string",
    )
  ) {
    return false;
  }
  return typeof e.data.bottom === "string" && (e.data.bottom as string).length > 0;
};
const supplementRotation = buildRotationPool(
  supplementFocusPreferred,
  supplementsAll,
  supplementIsFocusReady,
  featuredSupplementSlugs,
  (a, b) => String(a.data.name ?? "").localeCompare(String(b.data.name ?? "")),
);

// ─────────────────────────────────────────────────────────────────────
// Issue index — keyed by issue number so we can flag pinned overrides
// against any upcoming issue that already has a focus block written.
// ─────────────────────────────────────────────────────────────────────

type IssueFocus = { concern?: string; product?: string; supplement?: string };

const issuesByN = new Map<number, { n: number; date: string; focus: IssueFocus }>();
for (const { data } of trendIssues) {
  if (typeof data.n !== "number") continue;
  const focus = (data.focus ?? {}) as IssueFocus;
  issuesByN.set(data.n, {
    n: data.n,
    date: typeof data.date === "string" ? data.date : "",
    focus: {
      concern: typeof focus.concern === "string" ? focus.concern : undefined,
      product: typeof focus.product === "string" ? focus.product : undefined,
      supplement: typeof focus.supplement === "string" ? focus.supplement : undefined,
    },
  });
}

const sortedIssues = [...issuesByN.values()].sort((a, b) => b.n - a.n);
const latestN = sortedIssues[0]?.n ?? 0;
const startN = START_OVERRIDE >= 0 ? START_OVERRIDE : latestN;

// ─────────────────────────────────────────────────────────────────────
// Report rendering
// ─────────────────────────────────────────────────────────────────────

function fmtIssue(n: number): string {
  return `№ ${String(n).padStart(3, "0")}`;
}

function entryLabel(e: Entry, kind: "concern" | "product" | "supplement"): string {
  const slug = e.slug;
  if (kind === "product") {
    const brand = typeof e.data.brand === "string" ? e.data.brand : "";
    const name = typeof e.data.name === "string" ? e.data.name : "";
    return `${brand} — ${name}  [${slug}]`;
  }
  const name = typeof e.data.name === "string" ? e.data.name : slug;
  return `${name}  [${slug}]`;
}

function rule(char: string = "─", width: number = 72): string {
  return char.repeat(width);
}

function printPool(
  bandLabel: string,
  pool: Entry[],
  preferred: readonly string[],
  kind: "concern" | "product" | "supplement",
): void {
  console.log(`\n${bandLabel} — rotation pool (${pool.length} entries)`);
  console.log(rule());
  if (pool.length === 0) {
    console.log("  (empty — no focus-ready entries)");
    return;
  }
  const preferredSet = new Set(preferred);
  pool.forEach((e, i) => {
    const tag = preferredSet.has(e.slug) ? "★ preferred" : "  fallback ";
    const idx = String(i).padStart(2, " ");
    console.log(`  ${idx}. ${tag}  ${entryLabel(e, kind)}`);
  });
}

function pickAuto(pool: Entry[], n: number): Entry | undefined {
  if (pool.length === 0) return undefined;
  return pool[n % pool.length];
}

function previewPick(
  pool: Entry[],
  bySlug: Map<string, Entry>,
  isFocusReady: (e: Entry) => boolean,
  n: number,
  pinnedSlug: string | undefined,
  kind: "concern" | "product" | "supplement",
): { label: string; pinNote: string } {
  // Mirror `pickFocus` from index.astro: pinned wins if it passes the
  // band's readiness check, otherwise we drop back to the rotation
  // pick. We surface BOTH so editors can see what an invalid pin
  // would silently fall back to.
  const auto = pickAuto(pool, n);
  if (pinnedSlug) {
    const pinned = bySlug.get(pinnedSlug);
    if (pinned && isFocusReady(pinned)) {
      return {
        label: `📌 PINNED  ${entryLabel(pinned, kind)}`,
        pinNote: `(auto would have picked: ${auto ? entryLabel(auto, kind) : "—"})`,
      };
    }
    const reason = !pinned ? "slug not found" : "not focus-ready";
    return {
      label: `⚠ pin ignored (${reason}: ${pinnedSlug}) → ${auto ? entryLabel(auto, kind) : "—"}`,
      pinNote: "",
    };
  }
  return {
    label: `   auto      ${auto ? entryLabel(auto, kind) : "—"}`,
    pinNote: "",
  };
}

function printPreview(
  bandLabel: string,
  pool: Entry[],
  isFocusReady: (e: Entry) => boolean,
  pickPin: (focus: IssueFocus) => string | undefined,
  kind: "concern" | "product" | "supplement",
): void {
  console.log(`\n${bandLabel} — upcoming issue picks`);
  console.log(rule());
  const bySlug = new Map(pool.map((e) => [e.slug, e]));
  // Also make pin lookup work for slugs OUTSIDE the rotation pool
  // (e.g. an editor pinning a featured-grid slug). The home page
  // resolves pinned slugs against the full collection, not the pool.
  const allBySlug = new Map(
    (kind === "concern"
      ? concernsAll
      : kind === "product"
        ? productsAll
        : supplementsAll
    ).map((e) => [e.slug, e]),
  );
  const lookup = new Map<string, Entry>([...allBySlug, ...bySlug]);
  for (let i = 0; i < PREVIEW_COUNT; i++) {
    const n = startN + i;
    const issue = issuesByN.get(n);
    const pinned = issue ? pickPin(issue.focus) : undefined;
    const result = previewPick(pool, lookup, isFocusReady, n, pinned, kind);
    const headTag = issue ? `published · ${issue.date}` : "future · not yet written";
    const head = `${fmtIssue(n)}  (${headTag})`;
    console.log(`  ${head}`);
    console.log(`     ${result.label}`);
    if (result.pinNote) console.log(`     ${result.pinNote}`);
  }
}

// ─────────────────────────────────────────────────────────────────────
// Output
// ─────────────────────────────────────────────────────────────────────

console.log(rule("═"));
console.log("Home page — In-focus rotation preview");
console.log(rule("═"));
console.log(
  `Latest published issue: ${latestN > 0 ? fmtIssue(latestN) : "(none yet — issueIndex defaults to 0)"}`,
);
console.log(`Previewing ${PREVIEW_COUNT} issue(s) starting at ${fmtIssue(startN)}.`);
console.log(
  "Picker: pool[issueN % pool.length], with editor pins from each issue's `focus` field winning when focus-ready.",
);

printPool(
  "CONCERNS",
  concernRotation,
  concernFocusPreferred,
  "concern",
);
printPreview(
  "CONCERNS",
  concernRotation,
  concernIsFocusReady,
  (f) => f.concern,
  "concern",
);

printPool(
  "PRODUCTS",
  productRotation,
  productFocusPreferred,
  "product",
);
printPreview(
  "PRODUCTS",
  productRotation,
  productIsFocusReady,
  (f) => f.product,
  "product",
);

printPool(
  "SUPPLEMENTS",
  supplementRotation,
  supplementFocusPreferred,
  "supplement",
);
printPreview(
  "SUPPLEMENTS",
  supplementRotation,
  supplementIsFocusReady,
  (f) => f.supplement,
  "supplement",
);

console.log("");
console.log(rule("═"));
console.log(
  "Tip: pin a brief by adding `\"focus\": { \"concern\": \"<slug>\", ... }` to the issue's JSON.",
);
console.log(rule("═"));

// Always exit 0 — this is a planning report, not a validator.
process.exit(0);
