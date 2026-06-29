/**
 * Cross-link coverage report for the What Works Skin catalogue.
 *
 * The renderer in `src/lib/links.ts` resolves every brand+name /
 * ingredient / concern reference inside a brief to a slug at build
 * time, and silently falls back to plain text when no brief exists
 * for the referenced thing. That fallback keeps the page from
 * breaking but also hides a real editorial signal: an unlinked row
 * means either "we owe a brief here" or "the matcher missed".
 *
 * This script walks every concern, routine, supplement, product, and
 * ingredient brief, replays the same resolution rules used by the
 * runtime resolver against raw JSON content (so we don't need to
 * boot Astro), and prints a grouped report of the references that
 * did NOT resolve to an existing brief slug. Each unresolved
 * reference is classified as one of:
 *
 *   • NO BRIEF YET     — the reference looks like a thing we just
 *                        haven't written a brief for, or a generic
 *                        formulation ingredient (Cocamidopropyl
 *                        betaine, MVE delivery system, etc.).
 *   • MATCHER GAP      — the reference shares a distinctive token
 *                        with an existing brief, so the brief IS
 *                        there but the matcher / alias map missed
 *                        the phrasing. Editors should add an alias
 *                        to `src/lib/link-aliases.ts`.
 *
 * Run via:
 *   pnpm --filter @workspace/whatworksskin run report:cross-links
 *
 * The script always exits 0 — it is a build-time report, not a
 * pass/fail validation. Editors can prioritise the gaps it surfaces
 * issue by issue.
 *
 * The pure helpers behind this report (index builders, classifier,
 * missing-briefs aggregation) live in `src/lib/cross-link-coverage.ts`
 * so they can be exercised in isolation by
 * `scripts/test-cross-link-coverage.ts`. The report's presentation
 * layer (the `renderReport` formatter) lives in the same module and
 * is golden-tested by `scripts/test-cross-link-coverage-report.ts`.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import {
  makeTryContext,
  renderReport,
  tryConcern,
  tryIngredient,
  tryProduct,
  type ConcernBrief,
  type IngredientBrief,
  type ProductBrief,
  type Unresolved,
} from "../src/lib/cross-link-coverage.ts";
import {
  extractLinks,
  KIND_TO_ROUTE,
  type TrendWatchLinkKind,
} from "../src/lib/trend-watch-body.ts";

// ─────────────────────────────────────────────────────────────────────
// Filesystem layout
// ─────────────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT = path.join(__dirname, "..", "src", "content");

type Json = Record<string, unknown>;

function readJsonDir(dir: string): { slug: string; file: string; data: Json }[] {
  if (!fs.existsSync(dir)) return [];
  const out: { slug: string; file: string; data: Json }[] = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) continue; // skip _drafts/ etc.
    if (!name.endsWith(".json")) continue;
    const data = JSON.parse(fs.readFileSync(full, "utf8")) as Json;
    const slug = typeof data.slug === "string" ? data.slug : name.replace(/\.json$/, "");
    out.push({ slug, file: name, data });
  }
  return out;
}

const concerns = readJsonDir(path.join(CONTENT, "concerns"));
const ingredients = readJsonDir(path.join(CONTENT, "ingredients"));
const products = readJsonDir(path.join(CONTENT, "products"));
const routines = readJsonDir(path.join(CONTENT, "routines"));
const supplements = readJsonDir(path.join(CONTENT, "supplements"));
const trendWatch = readJsonDir(path.join(CONTENT, "trend-watch"));

// Project the on-disk JSON down to the minimal shapes the pure
// helpers in `cross-link-coverage.ts` consume.
const ingredientBriefs: IngredientBrief[] = ingredients.map(({ data }) => ({
  slug: typeof data.slug === "string" ? data.slug : "",
  name: typeof data.name === "string" ? data.name : "",
}));
const concernBriefs: ConcernBrief[] = concerns.map(({ data }) => ({
  slug: typeof data.slug === "string" ? data.slug : "",
  name: typeof data.name === "string" ? data.name : "",
}));
const productBriefs: ProductBrief[] = products.map(({ data }) => ({
  slug: typeof data.slug === "string" ? data.slug : "",
  brand: typeof data.brand === "string" ? data.brand : "",
  name: typeof data.name === "string" ? data.name : "",
}));

const ctx = makeTryContext({
  ingredients: ingredientBriefs,
  concerns: concernBriefs,
  products: productBriefs,
});

// ─────────────────────────────────────────────────────────────────────
// Walk all references and collect unresolved ones.
// ─────────────────────────────────────────────────────────────────────

const unresolved: Unresolved[] = [];

function push(row: Unresolved | null): void {
  if (row) unresolved.push(row);
}

function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
}

function s(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}

// Concerns — `ingredients[].name` (ingredient) + `products[].brand+name` (product).
for (const { slug, data } of concerns) {
  const ings = asArray(data.ingredients);
  ings.forEach((row, i) => {
    const r = asRecord(row);
    push(
      tryIngredient(ctx, s(r.name), {
        collection: "concerns",
        slug,
        field: `ingredients[${i}].name`,
      }),
    );
  });
  const prods = asArray(data.products);
  prods.forEach((row, i) => {
    const r = asRecord(row);
    push(
      tryProduct(ctx, s(r.brand), s(r.name), {
        collection: "concerns",
        slug,
        field: `products[${i}]`,
      }),
    );
  });
}

// Routines — `steps[].products[].brand+name` (product).
for (const { slug, data } of routines) {
  const steps = asArray(data.steps);
  steps.forEach((step, si) => {
    const sr = asRecord(step);
    const prods = asArray(sr.products);
    prods.forEach((row, pi) => {
      const r = asRecord(row);
      push(
        tryProduct(ctx, s(r.brand), s(r.name), {
          collection: "routines",
          slug,
          field: `steps[${si}].products[${pi}]`,
        }),
      );
    });
  });
}

// Supplements — `forms[].brand+name` (product) when in shelf-card shape.
for (const { slug, data } of supplements) {
  const forms = asArray(data.forms);
  forms.forEach((form, i) => {
    const r = asRecord(form);
    // The f/abs shape (JSX-prop pages) doesn't carry product
    // references — skip those rows.
    if (typeof r.f === "string" && typeof r.abs === "string") return;
    push(
      tryProduct(ctx, s(r.brand), s(r.name), {
        collection: "supplements",
        slug,
        field: `forms[${i}]`,
      }),
    );
  });
}

// Products — `ingredients[].i ?? .name` (ingredient) + `alts[].brand+name` (product).
for (const { slug, data } of products) {
  const ings = asArray(data.ingredients);
  ings.forEach((row, i) => {
    const r = asRecord(row);
    const text = s(r.i) ?? s(r.name);
    push(
      tryIngredient(ctx, text, {
        collection: "products",
        slug,
        field: `ingredients[${i}].${typeof r.i === "string" ? "i" : "name"}`,
      }),
    );
  });
  const alts = asArray(data.alts);
  alts.forEach((row, i) => {
    const r = asRecord(row);
    push(
      tryProduct(ctx, s(r.brand), s(r.name), {
        collection: "products",
        slug,
        field: `alts[${i}]`,
      }),
    );
  });
}

// Ingredients — relatedIngredients (slug-keyed), products (brand+name),
// byConcern[].concern (concern), pairings[].with (ingredient),
// related[].name (ingredient).
const ingredientSlugSet = new Set(ingredients.map((e) => e.slug));
for (const { slug, data } of ingredients) {
  const related = asArray(data.relatedIngredients);
  related.forEach((entry, i) => {
    // Each entry is either a bare slug string or an `{ slug, sub }`
    // override object; both shapes resolve to the same slug graph.
    const v = typeof entry === "string" ? entry : s(asRecord(entry).slug);
    if (!v || ingredientSlugSet.has(v)) return;
    // Slug-keyed reference whose slug doesn't exist — definitionally
    // "no brief yet" (or a typo, which the editor will spot).
    unresolved.push({
      kind: "ingredient",
      display: v,
      origin: { collection: "ingredients", slug, field: `relatedIngredients[${i}]` },
      classification: "no-brief",
    });
  });
  const prods = asArray(data.products);
  prods.forEach((row, i) => {
    const r = asRecord(row);
    push(
      tryProduct(ctx, s(r.brand), s(r.name), {
        collection: "ingredients",
        slug,
        field: `products[${i}]`,
      }),
    );
  });
  const byConcern = asArray(data.byConcern);
  byConcern.forEach((row, i) => {
    const r = asRecord(row);
    push(
      tryConcern(ctx, s(r.concern), {
        collection: "ingredients",
        slug,
        field: `byConcern[${i}].concern`,
      }),
    );
  });
  const pairings = asArray(data.pairings);
  pairings.forEach((row, i) => {
    const r = asRecord(row);
    push(
      tryIngredient(ctx, s(r.with), {
        collection: "ingredients",
        slug,
        field: `pairings[${i}].with`,
      }),
    );
  });
  const relatedCards = asArray(data.related);
  relatedCards.forEach((row, i) => {
    const r = asRecord(row);
    push(
      tryIngredient(ctx, s(r.name), {
        collection: "ingredients",
        slug,
        field: `related[${i}].name`,
      }),
    );
  });
}

// Trend Watch — `verdicts[].body` may be a structured rich-text array
// where individual segments carry inline `(kind, slug)` links to an
// existing brief. Walking those segments here gives us two things at
// once: it credits each inline link as a resolved cross-reference (so
// editors get the same "you cross-linked to a real brief" signal they
// would from any other surface), and it surfaces typos / stale slugs
// as a "no-brief" entry so the report flags them instead of letting
// them ship as broken anchors.
const slugSetByKind: Record<TrendWatchLinkKind, Set<string>> = {
  ingredient: new Set(ingredients.map((e) => e.slug)),
  concern: new Set(concerns.map((e) => e.slug)),
  product: new Set(products.map((e) => e.slug)),
  supplement: new Set(supplements.map((e) => e.slug)),
  routine: new Set(routines.map((e) => e.slug)),
};

// Map a trend-watch link kind to the `TargetKind` the report's
// classifier already understands. Supplement/routine links share the
// product / concern bucket only for reporting purposes — they're
// never truly "no brief" because a missing slug here is an editor
// typo, not a missing-brief opportunity, but bucketing them keeps the
// per-kind totals interpretable.
const KIND_TO_TARGET: Record<TrendWatchLinkKind, "ingredient" | "product" | "concern"> = {
  ingredient: "ingredient",
  concern: "concern",
  product: "product",
  supplement: "ingredient",
  routine: "concern",
};

let trendWatchLinksResolved = 0;
for (const { slug, data } of trendWatch) {
  const verdicts = asArray(data.verdicts);
  verdicts.forEach((verdict, vi) => {
    const v = asRecord(verdict);
    const links = extractLinks(v.body);
    links.forEach((link, li) => {
      if (slugSetByKind[link.kind].has(link.slug)) {
        trendWatchLinksResolved++;
        return;
      }
      // Slug doesn't exist for the declared kind — flag as a broken
      // inline link so editors fix the typo or write the brief.
      unresolved.push({
        kind: KIND_TO_TARGET[link.kind],
        display: `${link.text} (${KIND_TO_ROUTE[link.kind]}/${link.slug})`,
        origin: {
          collection: "trend-watch",
          slug,
          field: `verdicts[${vi}].body[link ${li}]`,
        },
        classification: "no-brief",
      });
    });
  });
}

// ─────────────────────────────────────────────────────────────────────
// Render the report.
//
// Delegated to the pure `renderReport` formatter so the presentation
// layer can be golden-tested in isolation by
// `scripts/test-cross-link-coverage-report.ts`.
// ─────────────────────────────────────────────────────────────────────

console.log(
  renderReport({
    unresolved,
    briefsScanned: {
      concerns: concerns.length,
      ingredients: ingredients.length,
      products: products.length,
      routines: routines.length,
      supplements: supplements.length,
    },
  }),
);

// Always exit 0 — this is an informational report, not a gate.
process.exit(0);
