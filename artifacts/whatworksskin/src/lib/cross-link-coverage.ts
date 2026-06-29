// Pure helpers behind the cross-link coverage report
// (`scripts/report-cross-link-coverage.ts`).
//
// The script itself reads JSON content off disk and renders a grouped
// console report. Everything in this module is the side-effect-free
// core: index builders that mirror the runtime resolver, the
// matcher-gap vs no-brief classifier, and the "most-referenced
// missing briefs" aggregation. Keeping these as plain functions over
// in-memory fixtures lets the contract test in
// `scripts/test-cross-link-coverage.ts` exercise them without touching
// the live content tree.

import {
  CONCERN_ALIASES,
  INGREDIENT_ALIASES,
  INGREDIENT_PROCEDURAL_DENY_KEYWORDS,
  PRODUCT_ALIASES,
  isProceduralReference,
  matchPhraseSlug,
  matchProductAliasSlug,
  norm,
  type PhraseIndex,
  type ProductAliasMap,
} from "./link-aliases";

// ─────────────────────────────────────────────────────────────────────
// Minimal brief shapes consumed by the report. The script's own
// readers project the on-disk JSON down to these fields.
// ─────────────────────────────────────────────────────────────────────

export type IngredientBrief = { slug: string; name: string };
export type ConcernBrief = { slug: string; name: string };
export type ProductBrief = { slug: string; brand: string; name: string };

// ─────────────────────────────────────────────────────────────────────
// Index builders — mirror the runtime resolver in `./links.ts` so the
// report classifies a reference as "resolved" exactly when the live
// site does. The shared phrase-index shape comes from `./link-aliases`.
// ─────────────────────────────────────────────────────────────────────

export type ProductIndex = {
  /** `${norm(brand)}::${norm(name)}` → slug, for the exact-tuple step. */
  byBrandName: Map<string, string>;
  /** `norm(brand)` → list of (slug, normalised name) for the in-brand
   * norm-equality and substring fallback steps. */
  byBrand: Map<string, { slug: string; nameNorm: string }[]>;
};

export function buildProductIndex(
  briefs: readonly ProductBrief[],
): ProductIndex {
  const byBrandName = new Map<string, string>();
  const byBrand = new Map<string, { slug: string; nameNorm: string }[]>();
  for (const p of briefs) {
    const b = norm(p.brand);
    const n = norm(p.name);
    byBrandName.set(`${b}::${n}`, p.slug);
    const arr = byBrand.get(b) ?? [];
    arr.push({ slug: p.slug, nameNorm: n });
    byBrand.set(b, arr);
  }
  return { byBrandName, byBrand };
}

export function findProductSlug(
  idx: ProductIndex,
  aliases: ProductAliasMap,
  brand?: string | null,
  name?: string | null,
): string | undefined {
  if (!brand || !name) return undefined;
  const b = norm(brand);
  const n = norm(name);
  const exact = idx.byBrandName.get(`${b}::${n}`);
  if (exact) return exact;
  const candidates = idx.byBrand.get(b);
  if (candidates) {
    for (const c of candidates) if (c.nameNorm === n) return c.slug;
    for (const c of candidates) {
      if (c.nameNorm.includes(n) || n.includes(c.nameNorm)) return c.slug;
    }
  }
  return matchProductAliasSlug(aliases, brand, name);
}

export function buildIngredientIndex(
  briefs: readonly IngredientBrief[],
  aliasMap: Record<string, readonly string[]> = INGREDIENT_ALIASES,
): PhraseIndex {
  const byNameNorm = new Map<string, string>();
  const phrases: { phrase: string; slug: string }[] = [];
  for (const { slug, name } of briefs) {
    const nameN = norm(name);
    byNameNorm.set(nameN, slug);
    phrases.push({ phrase: nameN, slug });
    for (const a of aliasMap[slug] ?? []) {
      const an = norm(a);
      if (!byNameNorm.has(an)) byNameNorm.set(an, slug);
      phrases.push({ phrase: an, slug });
    }
  }
  phrases.sort((a, b) => b.phrase.length - a.phrase.length);
  return { byNameNorm, phrases };
}

export function buildConcernIndex(
  briefs: readonly ConcernBrief[],
  aliasMap: Record<string, readonly string[]> = CONCERN_ALIASES,
): PhraseIndex {
  const byNameNorm = new Map<string, string>();
  const phrases: { phrase: string; slug: string }[] = [];
  for (const { slug, name } of briefs) {
    const nameN = norm(name);
    byNameNorm.set(nameN, slug);
    phrases.push({ phrase: nameN, slug });
    const slugAsPhrase = norm(slug.replace(/-/g, " "));
    phrases.push({ phrase: slugAsPhrase, slug });
    for (const a of aliasMap[slug] ?? []) {
      const an = norm(a);
      if (!byNameNorm.has(an)) byNameNorm.set(an, slug);
      phrases.push({ phrase: an, slug });
    }
  }
  phrases.sort((a, b) => b.phrase.length - a.phrase.length);
  return { byNameNorm, phrases };
}

// ─────────────────────────────────────────────────────────────────────
// "Brief exists but matcher failed" classification.
//
// For each unresolved free-text reference we check whether the
// reference shares a distinctive token (≥ 5 chars, not a generic
// stop word) with any existing brief's name. When it does, the brief
// IS there — so the only reason the matcher missed is that the alias
// map doesn't carry this phrasing yet.
// ─────────────────────────────────────────────────────────────────────

export const STOPWORDS: ReadonlySet<string> = new Set([
  "acid", "acids", "the", "and", "for", "with", "vit", "vitamin",
  "oil", "extract", "complex", "salt", "ester", "form", "free", "low",
  "high", "skin", "face", "post", "cream", "serum", "lotion", "gel",
  "wash", "fluid", "balm", "spray", "drops", "drop", "anti", "care",
  "daily", "night", "morning", "spf", "uvb", "uva",
]);

export const MIN_DISTINCTIVE_LEN = 5;

export function distinctiveTokens(s: string): string[] {
  return norm(s)
    .split(" ")
    .filter((t) => t.length >= MIN_DISTINCTIVE_LEN && !STOPWORDS.has(t));
}

export type BriefLookup = { slug: string; tokens: Set<string> };

/**
 * Build the per-brief "distinctive tokens" lookup the closest-brief
 * scan walks. `fields` controls which fields contribute tokens —
 * passing `["name", "slug"]` (the default) mirrors what the report
 * uses for products today; concerns and ingredients use just `name`.
 *
 * For the `slug` field, the slug-as-words form is also tokenised so
 * "azelaic-acid" contributes "azelaic" alongside the slug itself.
 */
export function buildBriefLookup<T extends { slug: string; name?: string }>(
  entries: readonly T[],
  fields: ReadonlyArray<keyof T> = ["name", "slug"] as ReadonlyArray<keyof T>,
): BriefLookup[] {
  return entries.map((entry) => {
    const slug = entry.slug;
    const tokens = new Set<string>();
    for (const f of fields) {
      const v = entry[f];
      if (typeof v !== "string") continue;
      for (const t of distinctiveTokens(v)) tokens.add(t);
      if (f === "slug") {
        for (const t of distinctiveTokens(v.replace(/-/g, " "))) tokens.add(t);
      }
    }
    return { slug, tokens };
  });
}

/**
 * Distinctive-token overlap scan. Returns the slug of the brief that
 * shares the most distinctive tokens with `ref`, or `undefined` if no
 * brief shares any. Ties resolve to the first brief in the input
 * order so callers see deterministic output.
 */
export function closestBriefSlug(
  briefs: readonly BriefLookup[],
  ref: string,
): string | undefined {
  const refTokens = new Set(distinctiveTokens(ref));
  if (refTokens.size === 0) return undefined;
  let bestSlug: string | undefined;
  let bestOverlap = 0;
  for (const brief of briefs) {
    let overlap = 0;
    for (const t of refTokens) if (brief.tokens.has(t)) overlap++;
    if (overlap > bestOverlap) {
      bestOverlap = overlap;
      bestSlug = brief.slug;
    }
  }
  return bestOverlap > 0 ? bestSlug : undefined;
}

/**
 * For an unresolved product reference, surface the closest same-brand
 * brief (if any) as an editorial hint. The runtime resolver already
 * does brand-equality + name-substring matching, so anything it failed
 * on is genuinely a different product even if the brand matches —
 * this hint is informational, never a "matcher gap".
 */
export function nearbyProductHint(
  productBriefs: readonly BriefLookup[],
  products: readonly ProductBrief[],
  brand: string | undefined,
  name: string | undefined,
): string | undefined {
  if (!brand || !name) return undefined;
  const sameBrand = productBriefs.filter(
    (_, i) => norm(products[i].brand) === norm(brand),
  );
  if (sameBrand.length === 0) return undefined;
  return closestBriefSlug(sameBrand, name);
}

// ─────────────────────────────────────────────────────────────────────
// Reference classification — the per-reference decision the script
// makes on every walked row. The script supplies the index of briefs
// per kind; this module decides whether a reference resolves, and if
// not, whether it's a matcher gap or a brief that doesn't exist yet.
// ─────────────────────────────────────────────────────────────────────

export type TargetKind = "ingredient" | "product" | "concern";

export type Origin = {
  /** "concerns" | "routines" | … — the directory the source lives in. */
  collection: string;
  /** Slug of the source brief. */
  slug: string;
  /** Where inside the source brief the reference appears. */
  field: string;
};

export type Unresolved = {
  kind: TargetKind;
  /** Display text shown to the editor (brand · name for products). */
  display: string;
  origin: Origin;
  classification: "no-brief" | "matcher-gap";
  /**
   * Slug of the closest existing brief. For matcher-gap entries this
   * is the brief whose alias map should be extended; for no-brief
   * entries (currently only products) it is purely informational.
   */
  resemblesSlug?: string;
};

/**
 * Decide the classification for an unresolved free-text reference of
 * a given kind. Returns "matcher-gap" when an existing brief shares a
 * distinctive token with the reference (the brief IS there but the
 * alias map missed the phrasing) and "no-brief" otherwise.
 */
export function classifyReference(
  kind: TargetKind,
  display: string,
  briefsByKind: Record<TargetKind, readonly BriefLookup[]>,
): { classification: "no-brief" | "matcher-gap"; resemblesSlug?: string } {
  const briefs = briefsByKind[kind];
  const resemblesSlug = closestBriefSlug(briefs, display);
  return {
    classification: resemblesSlug ? "matcher-gap" : "no-brief",
    resemblesSlug,
  };
}

// ─────────────────────────────────────────────────────────────────────
// Try-resolve helpers — the `tryProduct` / `tryIngredient` /
// `tryConcern` entry points used by the script's per-collection walk.
// They share the "if resolved, drop; otherwise classify and record"
// shape so the script can stay a thin loop over the content tree.
// ─────────────────────────────────────────────────────────────────────

export type TryContext = {
  productIdx: ProductIndex;
  productAliases: ProductAliasMap;
  ingredientIdx: PhraseIndex;
  concernIdx: PhraseIndex;
  briefsByKind: Record<TargetKind, readonly BriefLookup[]>;
  /** Closest same-brand product brief lookup (informational hint). */
  productBriefs: readonly BriefLookup[];
  productBriefsSource: readonly ProductBrief[];
  /** Procedural-deny keyword list passed to the ingredient matcher. */
  ingredientDenyKeywords?: readonly string[];
};

export function makeTryContext(args: {
  ingredients: readonly IngredientBrief[];
  concerns: readonly ConcernBrief[];
  products: readonly ProductBrief[];
  ingredientAliases?: Record<string, readonly string[]>;
  concernAliases?: Record<string, readonly string[]>;
  productAliases?: ProductAliasMap;
  ingredientDenyKeywords?: readonly string[];
}): TryContext {
  const ingredientAliases = args.ingredientAliases ?? INGREDIENT_ALIASES;
  const concernAliases = args.concernAliases ?? CONCERN_ALIASES;
  const productAliases = args.productAliases ?? PRODUCT_ALIASES;
  const productIdx = buildProductIndex(args.products);
  const ingredientIdx = buildIngredientIndex(args.ingredients, ingredientAliases);
  const concernIdx = buildConcernIndex(args.concerns, concernAliases);
  const ingredientBriefs = buildBriefLookup(args.ingredients, ["name"]);
  const concernBriefs = buildBriefLookup(args.concerns, ["name"]);
  // Products intentionally exclude `brand` tokens — see
  // `report-cross-link-coverage.ts` for the rationale.
  const productBriefs = buildBriefLookup(args.products, ["name", "slug"]);
  return {
    productIdx,
    productAliases,
    ingredientIdx,
    concernIdx,
    briefsByKind: {
      ingredient: ingredientBriefs,
      product: productBriefs,
      concern: concernBriefs,
    },
    productBriefs,
    productBriefsSource: args.products,
    ingredientDenyKeywords:
      args.ingredientDenyKeywords ?? INGREDIENT_PROCEDURAL_DENY_KEYWORDS,
  };
}

/**
 * Attempt to resolve a product reference. Returns `null` when the
 * reference resolves to an existing brief (the caller drops it).
 * Otherwise returns an `Unresolved` row classified as "no-brief" with
 * a same-brand sibling hint when one exists — for products the
 * runtime matcher already does brand-equality + name-substring
 * matching, so an unresolved ref is by construction a brief that
 * doesn't exist yet, never a matcher gap.
 */
export function tryProduct(
  ctx: TryContext,
  brand: string | undefined,
  name: string | undefined,
  origin: Origin,
): Unresolved | null {
  if (!brand && !name) return null;
  if (findProductSlug(ctx.productIdx, ctx.productAliases, brand, name)) {
    return null;
  }
  const display = `${brand ?? "?"} · ${name ?? "?"}`;
  return {
    kind: "product",
    display,
    origin,
    classification: "no-brief",
    resemblesSlug: nearbyProductHint(
      ctx.productBriefs,
      ctx.productBriefsSource,
      brand,
      name,
    ),
  };
}

/**
 * Attempt to resolve an ingredient reference. Returns `null` when the
 * matcher hits. Procedural references (e.g. "Hyaluronic filler
 * (clinic)") are forced into the "no-brief" bucket without a
 * resemblance hint so the matcher-gap report stays focused on real
 * alias-map work.
 */
export function tryIngredient(
  ctx: TryContext,
  text: string | undefined,
  origin: Origin,
): Unresolved | null {
  if (!text) return null;
  if (matchPhraseSlug(ctx.ingredientIdx, text, 3, ctx.ingredientDenyKeywords)) {
    return null;
  }
  if (isProceduralReference(text)) {
    return {
      kind: "ingredient",
      display: text,
      origin,
      classification: "no-brief",
    };
  }
  const c = classifyReference("ingredient", text, ctx.briefsByKind);
  return {
    kind: "ingredient",
    display: text,
    origin,
    classification: c.classification,
    resemblesSlug: c.resemblesSlug,
  };
}

/**
 * Attempt to resolve a concern reference. Returns `null` when the
 * matcher hits, otherwise an `Unresolved` row classified by
 * `classifyReference`.
 */
export function tryConcern(
  ctx: TryContext,
  text: string | undefined,
  origin: Origin,
): Unresolved | null {
  if (!text) return null;
  if (matchPhraseSlug(ctx.concernIdx, text, 4)) return null;
  const c = classifyReference("concern", text, ctx.briefsByKind);
  return {
    kind: "concern",
    display: text,
    origin,
    classification: c.classification,
    resemblesSlug: c.resemblesSlug,
  };
}

// ─────────────────────────────────────────────────────────────────────
// Most-referenced missing briefs aggregation.
//
// Inverts the per-source view to surface the would-be brief slugs
// that, if written, would unlock the most internal cross-links.
// Procedural ingredient references are filtered out because they're
// blocked by the matcher's deny-list and will never become briefs.
// ─────────────────────────────────────────────────────────────────────

export function slugify(s: string): string {
  return norm(s).replace(/\s+/g, "-");
}

export function canonicalSlugGuess(kind: TargetKind, display: string): string {
  if (kind !== "product") return slugify(display);
  // Product display is "brand · name" (with "?" placeholders for
  // missing halves). Mirror the on-disk product slug shape.
  const sep = display.indexOf(" · ");
  const brand = sep >= 0 ? display.slice(0, sep) : "";
  const name = sep >= 0 ? display.slice(sep + 3) : display;
  const b = brand && brand !== "?" ? slugify(brand) : "";
  const n = name && name !== "?" ? slugify(name) : "";
  if (b && n) return `${b}-${n}`;
  return b || n || slugify(display);
}

export type MissingBrief = {
  kind: TargetKind;
  slugGuess: string;
  /** First-seen display text — keeps the editor-friendly phrasing. */
  display: string;
  /** Distinct "collection/slug" source pages that mention this target. */
  sources: Set<string>;
};

/**
 * Aggregate "no-brief" entries by `(kind, canonical-slug-guess)` and
 * return one `MissingBrief` per group. Each entry's `sources` set
 * counts distinct source pages (`collection/slug`), so two refs from
 * the same brief don't double-count. Procedural ingredient refs are
 * skipped — they're blocked by the matcher's deny-list and will never
 * become briefs, so they shouldn't pad the editorial backlog.
 */
export function aggregateMissingBriefs(
  noBrief: readonly Unresolved[],
): Map<string, MissingBrief> {
  const out = new Map<string, MissingBrief>();
  for (const u of noBrief) {
    if (u.kind === "ingredient" && isProceduralReference(u.display)) continue;
    const slugGuess = canonicalSlugGuess(u.kind, u.display);
    const key = `${u.kind}::${slugGuess}`;
    let entry = out.get(key);
    if (!entry) {
      entry = {
        kind: u.kind,
        slugGuess,
        display: u.display,
        sources: new Set<string>(),
      };
      out.set(key, entry);
    }
    entry.sources.add(`${u.origin.collection}/${u.origin.slug}`);
  }
  return out;
}

/**
 * Sort a missing-brief list by inbound-count (descending), breaking
 * ties on `slugGuess` ascending. Returns a new array; the input is
 * not mutated. The script renders this per-kind so editors can pick
 * the highest-impact next brief inside a category.
 */
export function sortMissingBriefs(
  briefs: readonly MissingBrief[],
): MissingBrief[] {
  return [...briefs].sort(
    (a, b) =>
      b.sources.size - a.sources.size ||
      a.slugGuess.localeCompare(b.slugGuess),
  );
}

// ─────────────────────────────────────────────────────────────────────
// Report renderer.
//
// The presentation layer that the script in
// `scripts/report-cross-link-coverage.ts` used to inline. Pulling it
// into a pure string-returning function lets
// `scripts/test-cross-link-coverage-report.ts` golden-test the report
// shape (summary counts, section headers, resemblance hints,
// per-source sort order, per-collection totals) against an in-memory
// corpus without spawning a subprocess.
//
// `renderReport()` is intentionally side-effect-free: it returns a
// single multi-line string the script then prints in one call. Each
// helper here mirrors a distinct visual element of the report so a
// regression that, say, drops the resemblance hint or double-counts
// the per-collection totals fails its dedicated test.
// ─────────────────────────────────────────────────────────────────────

export type BriefsScanned = {
  concerns: number;
  ingredients: number;
  products: number;
  routines: number;
  supplements: number;
};

export const DEFAULT_COLLECTION_ORDER = [
  "concerns",
  "ingredients",
  "products",
  "routines",
  "supplements",
] as const;

const KIND_LABEL: Record<TargetKind, string> = {
  ingredient: "Ingredient references",
  product: "Product references",
  concern: "Concern references",
};

const KIND_HEADER: Record<TargetKind, string> = {
  ingredient: "Ingredient briefs",
  product: "Product briefs",
  concern: "Concern briefs",
};

const KIND_ORDER: readonly TargetKind[] = ["ingredient", "product", "concern"];

function formatHeader(text: string): string {
  return `\n${text}\n${"─".repeat(text.length)}`;
}

function groupByKind<T extends { kind: TargetKind }>(
  rows: readonly T[],
): Record<TargetKind, T[]> {
  const out: Record<TargetKind, T[]> = {
    ingredient: [],
    product: [],
    concern: [],
  };
  for (const r of rows) out[r.kind].push(r);
  return out;
}

function groupBySource<
  T extends { display: string; origin: Origin; resemblesSlug?: string },
>(rows: readonly T[]): Map<string, T[]> {
  const out = new Map<string, T[]>();
  for (const r of rows) {
    const key = `${r.origin.collection}/${r.origin.slug}`;
    const arr = out.get(key) ?? [];
    arr.push(r);
    out.set(key, arr);
  }
  return out;
}

function renderUnresolvedSection(
  title: string,
  rows: readonly Unresolved[],
): string[] {
  if (rows.length === 0) return [];
  const lines: string[] = [];
  lines.push(formatHeader(title));
  const byKind = groupByKind(rows);
  for (const kind of KIND_ORDER) {
    const list = byKind[kind];
    if (list.length === 0) continue;
    lines.push(`\n  ${KIND_LABEL[kind]} (${list.length}):`);
    const grouped = groupBySource(list);
    const keys = [...grouped.keys()].sort();
    for (const key of keys) {
      lines.push(`    • ${key}`);
      for (const r of grouped.get(key)!) {
        const hint = r.resemblesSlug
          ? ` → resembles "${r.resemblesSlug}"`
          : "";
        lines.push(`        - "${r.display}" (${r.origin.field})${hint}`);
      }
    }
  }
  return lines;
}

function renderMissingBriefsSection(
  missingByKey: ReadonlyMap<string, MissingBrief>,
): string[] {
  if (missingByKey.size === 0) return [];
  const lines: string[] = [];
  lines.push(
    formatHeader(
      `MOST-REFERENCED MISSING BRIEFS — top write-next opportunities (${missingByKey.size})`,
    ),
  );
  lines.push("  Each row is a brief that doesn't exist yet, sorted by how many");
  lines.push("  pages already mention it. Writing the top entries unlocks the");
  lines.push("  most inbound cross-links per unit of editorial effort.");

  for (const kind of KIND_ORDER) {
    const list = sortMissingBriefs(
      [...missingByKey.values()].filter((m) => m.kind === kind),
    );
    if (list.length === 0) continue;
    lines.push(`\n  ${KIND_HEADER[kind]} (${list.length}):`);
    for (const m of list) {
      const n = m.sources.size;
      const refLabel = `${n} ref${n === 1 ? "" : "s"}`;
      lines.push(`    • ${m.slugGuess}  [${refLabel}]  — "${m.display}"`);
      const srcs = [...m.sources].sort();
      for (const src of srcs) {
        lines.push(`        ← ${src}`);
      }
    }
  }
  return lines;
}

function renderTotalsBlock(
  unresolved: readonly Unresolved[],
  collectionOrder: readonly string[],
): string[] {
  const totalsByCollection = new Map<string, number>();
  for (const { origin } of unresolved) {
    totalsByCollection.set(
      origin.collection,
      (totalsByCollection.get(origin.collection) ?? 0) + 1,
    );
  }
  const lines: string[] = [];
  lines.push(formatHeader("Per-collection totals"));
  for (const c of collectionOrder) {
    const n = totalsByCollection.get(c) ?? 0;
    lines.push(`  ${c.padEnd(12)} ${n}`);
  }
  return lines;
}

export type RenderReportInput = {
  unresolved: readonly Unresolved[];
  briefsScanned: BriefsScanned;
  /** Order in which to print rows in the per-collection totals block. */
  collectionOrder?: readonly string[];
};

/**
 * Render the cross-link coverage report as a single multi-line string.
 *
 * The shape is the script's user-facing contract: editors scan the
 * top summary line, jump to the matcher-gap section to add aliases,
 * and then triage the "no brief yet" list. A regression that quietly
 * drops a section, double-counts a row, or breaks the alphabetical
 * sort within a kind is a real editorial bug — the sibling test in
 * `scripts/test-cross-link-coverage-report.ts` pins down each piece.
 */
export function renderReport(input: RenderReportInput): string {
  const { unresolved, briefsScanned } = input;
  const collectionOrder = input.collectionOrder ?? DEFAULT_COLLECTION_ORDER;
  const lines: string[] = [];

  lines.push("Cross-link coverage report — What Works Skin");
  lines.push("=".repeat(60));
  lines.push(
    `Briefs scanned: ${briefsScanned.concerns} concerns, ${briefsScanned.ingredients} ingredients, ` +
      `${briefsScanned.products} products, ${briefsScanned.routines} routines, ` +
      `${briefsScanned.supplements} supplements.`,
  );

  if (unresolved.length === 0) {
    lines.push("");
    lines.push(
      "All cross-references resolve to existing briefs. Nothing to do.",
    );
    return lines.join("\n");
  }

  const matcherGaps = unresolved.filter(
    (u) => u.classification === "matcher-gap",
  );
  const noBrief = unresolved.filter((u) => u.classification === "no-brief");

  lines.push("");
  lines.push(
    `${unresolved.length} unresolved reference(s): ` +
      `${matcherGaps.length} matcher gap(s), ${noBrief.length} brief(s) not yet written.`,
  );

  lines.push(
    ...renderUnresolvedSection(
      `MATCHER GAPS — brief exists, alias missing (${matcherGaps.length})`,
      matcherGaps,
    ),
  );
  lines.push(
    ...renderUnresolvedSection(
      `NO BRIEF YET — referenced thing has no brief (${noBrief.length})`,
      noBrief,
    ),
  );

  const missingByKey = aggregateMissingBriefs(noBrief);
  lines.push(...renderMissingBriefsSection(missingByKey));

  lines.push(...renderTotalsBlock(unresolved, collectionOrder));

  lines.push("");
  lines.push(
    `Tip: matcher gaps usually mean a missing entry in ` +
      `src/lib/link-aliases.ts (INGREDIENT_ALIASES / CONCERN_ALIASES / ` +
      `PRODUCT_ALIASES). "No brief yet" entries indicate which brief to ` +
      `write next.`,
  );

  return lines.join("\n");
}
