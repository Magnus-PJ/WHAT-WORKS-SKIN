/**
 * Contract test: the cross-link coverage report's pure helpers preserve
 * their semantics.
 *
 * `scripts/report-cross-link-coverage.ts` is the build-time report
 * editors lean on to triage matcher gaps and "write this next" briefs.
 * Its index builders, the matcher-gap classifier, and the new
 * "most-referenced missing briefs" aggregation all live in
 * `src/lib/cross-link-coverage.ts` so they can be exercised here
 * against synthetic content fixtures without booting Astro.
 *
 * The script delegates the per-reference decision to those helpers, so
 * a future refactor of the cascade order or the classification rule
 * that quietly changes which references the report flags — or how
 * many inbound links it credits a missing brief with — will fail this
 * script.
 *
 * Run via:
 *   pnpm --filter @workspace/whatworksskin run test:cross-link-coverage
 *
 * Exits non-zero on any failure so it can wire into CI alongside the
 * sibling `test:backlinks` / `test:mentioned-by` /
 * `test:related-ingredients` / `test:product-resolver` contract tests.
 */

import {
  aggregateMissingBriefs,
  buildConcernIndex,
  buildIngredientIndex,
  canonicalSlugGuess,
  closestBriefSlug,
  makeTryContext,
  sortMissingBriefs,
  tryConcern,
  tryIngredient,
  tryProduct,
  type ConcernBrief,
  type IngredientBrief,
  type ProductBrief,
  type Unresolved,
} from "../src/lib/cross-link-coverage.ts";
import {
  matchPhraseSlug,
  type ProductAliasMap,
} from "../src/lib/link-aliases.ts";

// ─────────────────────────────────────────────────────────────────────
// Test harness — minimal, no external deps so this stays a single
// `tsx` script like the sibling `test-*.ts` contract tests.
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

function expectTruthy(actual: unknown, label: string): void {
  if (!actual) {
    throw new Error(`${label}\n  expected: truthy\n  actual:   ${JSON.stringify(actual)}`);
  }
}

function expectFalsy(actual: unknown, label: string): void {
  if (actual) {
    throw new Error(`${label}\n  expected: falsy\n  actual:   ${JSON.stringify(actual)}`);
  }
}

// ─────────────────────────────────────────────────────────────────────
// Synthetic content fixture
//
// A tiny corpus that exercises every classification path the report
// renders. Aliases are local to this script (kept independent of the
// real `INGREDIENT_ALIASES` / `CONCERN_ALIASES` / `PRODUCT_ALIASES`)
// so the assertions don't shift when an editor adds a new alias to
// the live content tree.
// ─────────────────────────────────────────────────────────────────────

const ingredientBriefs: IngredientBrief[] = [
  { slug: "niacinamide", name: "Niacinamide" },
  { slug: "retinol", name: "Retinol" },
  { slug: "azelaic-acid", name: "Azelaic acid" },
  { slug: "hyaluronic-acid", name: "Hyaluronic acid" },
];

const concernBriefs: ConcernBrief[] = [
  { slug: "inflammatory-acne", name: "Inflammatory acne" },
  { slug: "melasma", name: "Melasma" },
  // Multi-token name on purpose: lets the matcher-gap test below
  // cite a phrase that shares only `barrier` with the brief but
  // doesn't trigger the canonical-name word-boundary scan.
  { slug: "compromised-barrier", name: "Compromised barrier" },
];

const productBriefs: ProductBrief[] = [
  {
    slug: "cerave-moisturizing-cream",
    brand: "CeraVe",
    name: "Moisturizing Cream",
  },
  {
    slug: "cerave-foaming-facial-cleanser",
    brand: "CeraVe",
    name: "Foaming Facial Cleanser",
  },
];

const ingredientAliases: Record<string, readonly string[]> = {
  // Editorial shorthand the matcher must accept as `niacinamide`.
  niacinamide: ["niacinamide", "nicotinamide"],
};

const concernAliases: Record<string, readonly string[]> = {
  "inflammatory-acne": ["inflammatory acne", "papulopustular acne"],
};

const productAliases: ProductAliasMap = {
  cerave: {
    "cerave-foaming-facial-cleanser": ["sa smoothing cleanser"],
  },
};

const ctx = makeTryContext({
  ingredients: ingredientBriefs,
  concerns: concernBriefs,
  products: productBriefs,
  ingredientAliases,
  concernAliases,
  productAliases,
});

const ORIGIN = { collection: "concerns", slug: "fixture", field: "row[0]" };

// ─────────────────────────────────────────────────────────────────────
// Tests — index builders mirror the runtime resolver
// ─────────────────────────────────────────────────────────────────────

console.log("Cross-link coverage — index builders");

await test("ingredient index resolves a brief by canonical name", () => {
  const idx = buildIngredientIndex(ingredientBriefs, ingredientAliases);
  expectEqual(
    matchPhraseSlug(idx, "Niacinamide", 3),
    "niacinamide",
    "exact canonical name resolves",
  );
});

await test("ingredient index resolves a brief via its alias map", () => {
  // `nicotinamide` is registered as an alias for the niacinamide
  // brief — the index builder must register that phrase so the
  // matcher hits it.
  const idx = buildIngredientIndex(ingredientBriefs, ingredientAliases);
  expectEqual(
    matchPhraseSlug(idx, "Nicotinamide 5%", 3),
    "niacinamide",
    "alias + concentration shorthand both resolve",
  );
});

await test(
  "ingredient index leaves an unrelated phrase unresolved",
  () => {
    const idx = buildIngredientIndex(ingredientBriefs, ingredientAliases);
    expectEqual(
      matchPhraseSlug(idx, "Cocamidopropyl betaine", 3),
      undefined,
      "phrase with no canonical name or alias does not resolve",
    );
  },
);

await test(
  "concern index resolves a brief via its slug-as-words form",
  () => {
    // "Inflammatory acne" appears in editorial copy as the slug
    // form too — the builder pushes `slug.replace(/-/g, " ")` as a
    // synthetic phrase so the matcher hits it without needing an
    // explicit alias.
    const idx = buildConcernIndex(concernBriefs, {});
    expectEqual(
      matchPhraseSlug(idx, "inflammatory acne", 4),
      "inflammatory-acne",
      "slug-as-words synthetic phrase resolves",
    );
  },
);

await test(
  "concern index alias map fills the gaps the slug form can't reach",
  () => {
    const idx = buildConcernIndex(concernBriefs, concernAliases);
    expectEqual(
      matchPhraseSlug(idx, "papulopustular acne", 4),
      "inflammatory-acne",
      "registered alias resolves to canonical slug",
    );
  },
);

// ─────────────────────────────────────────────────────────────────────
// Tests — resolved references are dropped (the script never collects
// them as unresolved). This is the per-reference contract editors lean
// on so the report only flags real gaps.
// ─────────────────────────────────────────────────────────────────────

console.log("\nCross-link coverage — resolved references are dropped");

await test("a resolved ingredient reference returns null", () => {
  expectEqual(
    tryIngredient(ctx, "Niacinamide", ORIGIN),
    null,
    "matcher hit → no unresolved row",
  );
});

await test(
  "an alias-resolved ingredient reference returns null",
  () => {
    expectEqual(
      tryIngredient(ctx, "nicotinamide", ORIGIN),
      null,
      "alias match → no unresolved row",
    );
  },
);

await test("a resolved concern reference returns null", () => {
  expectEqual(
    tryConcern(ctx, "Melasma", ORIGIN),
    null,
    "concern matcher hit → no unresolved row",
  );
});

await test(
  "a resolved product reference (exact tuple) returns null",
  () => {
    expectEqual(
      tryProduct(ctx, "CeraVe", "Moisturizing Cream", ORIGIN),
      null,
      "exact (brand, name) → no unresolved row",
    );
  },
);

await test(
  "a resolved product reference (per-brand alias) returns null",
  () => {
    // The editorial wording "SA Smoothing Cleanser" doesn't share a
    // substring with the brief's canonical name "Foaming Facial
    // Cleanser", so resolution leans on the per-brand alias map. A
    // hit there must still drop the row.
    expectEqual(
      tryProduct(ctx, "CeraVe", "SA Smoothing Cleanser", ORIGIN),
      null,
      "per-brand alias match → no unresolved row",
    );
  },
);

// ─────────────────────────────────────────────────────────────────────
// Tests — matcher-gap vs no-brief classification
// ─────────────────────────────────────────────────────────────────────

console.log("\nCross-link coverage — matcher-gap vs no-brief classification");

await test(
  'ingredient ref sharing a distinctive token with a brief is a "matcher gap"',
  () => {
    // "Azelaic 15%" doesn't normalise to the canonical "azelaic
    // acid" phrase nor to a registered alias (we deliberately leave
    // azelaic-acid out of `ingredientAliases` here). The matcher
    // misses it, but the brief IS there — `azelaic` is a distinctive
    // token shared with the brief's name. Expected classification is
    // matcher-gap with the brief slug surfaced as the alias-edit
    // hint.
    const row = tryIngredient(ctx, "Azelaic 15%", ORIGIN);
    expectTruthy(row, "ref is collected as unresolved");
    expectEqual(row?.classification, "matcher-gap", "classification");
    expectEqual(row?.resemblesSlug, "azelaic-acid", "resembles hint");
  },
);

await test(
  'ingredient ref sharing no distinctive token with any brief is "no brief yet"',
  () => {
    // "Cocamidopropyl betaine" is a generic formulation surfactant —
    // no ingredient brief covers it and no token overlaps any brief
    // name. Expected classification is no-brief without a hint.
    const row = tryIngredient(ctx, "Cocamidopropyl betaine", ORIGIN);
    expectTruthy(row, "ref is collected as unresolved");
    expectEqual(row?.classification, "no-brief", "classification");
    expectEqual(row?.resemblesSlug, undefined, "no resembles hint");
  },
);

await test(
  'a procedural ingredient ref is forced to "no brief yet" without a hint',
  () => {
    // "Hyaluronic filler (clinic)" carries `clinic` and `filler`,
    // both on the procedural deny list. The matcher refuses to
    // resolve it, AND the classifier must skip the token-overlap
    // step — otherwise it would surface `hyaluronic-acid` as a
    // bogus matcher-gap target. The brief here is "no brief yet"
    // with no hint, keeping the matcher-gap bucket focused on real
    // alias-map work.
    const row = tryIngredient(ctx, "Hyaluronic filler (clinic)", ORIGIN);
    expectTruthy(row, "procedural ref is still collected");
    expectEqual(row?.classification, "no-brief", "classification");
    expectEqual(row?.resemblesSlug, undefined, "no hint, even though token would overlap");
  },
);

await test(
  'concern ref sharing a distinctive token with a brief is a "matcher gap"',
  () => {
    // The brief "Compromised barrier" carries `compromised` and
    // `barrier` as distinctive tokens. The reference "Barrier
    // strain" doesn't trigger the canonical-name word-boundary
    // scan (the canonical phrase is "compromised barrier") and we
    // deliberately leave the brief out of `concernAliases` here.
    // The matcher misses, but `barrier` is a distinctive token
    // shared with the brief — expected classification is
    // matcher-gap with the brief slug surfaced as the alias-edit
    // hint.
    const row = tryConcern(ctx, "Barrier strain", ORIGIN);
    expectTruthy(row, "ref is collected as unresolved");
    expectEqual(row?.classification, "matcher-gap", "classification");
    expectEqual(row?.resemblesSlug, "compromised-barrier", "resembles hint");
  },
);

await test(
  'an unresolved product ref is always "no brief yet" with a same-brand hint',
  () => {
    // The runtime matcher already does brand-equality + name-substring
    // matching, so anything that slips through is by construction a
    // genuinely different product even when the brand matches. The
    // report still surfaces the closest same-brand brief as an
    // editorial hint — never elevates to a matcher gap.
    //
    // "Moisturizing Lotion" doesn't share a name substring with
    // either CeraVe brief (the canonical CeraVe moisturizer is
    // "Moisturizing Cream"; substring matching fails on the
    // `Cream` / `Lotion` tail). The distinctive-token scan still
    // picks `moisturizing` as the shared token, so the closest
    // same-brand brief is the moisturizing-cream entry.
    const row = tryProduct(ctx, "CeraVe", "Moisturizing Lotion", ORIGIN);
    expectTruthy(row, "ref is collected as unresolved");
    expectEqual(row?.classification, "no-brief", "products never become matcher gaps");
    expectEqual(
      row?.resemblesSlug,
      "cerave-moisturizing-cream",
      "closest same-brand brief surfaced as hint",
    );
  },
);

await test(
  "an unresolved product ref for a brand with no briefs has no hint",
  () => {
    const row = tryProduct(ctx, "Unknown Brand", "Mystery Serum", ORIGIN);
    expectTruthy(row, "ref is collected as unresolved");
    expectEqual(row?.classification, "no-brief", "classification");
    expectEqual(row?.resemblesSlug, undefined, "no same-brand brief → no hint");
  },
);

await test(
  "closestBriefSlug returns undefined when no token overlaps",
  () => {
    // Direct unit test of the classifier's core scan, independent
    // of the try-* wrappers. A reference whose distinctive tokens
    // share nothing with any brief returns undefined so the caller
    // classifies it as no-brief.
    const briefs = [
      { slug: "azelaic-acid", tokens: new Set(["azelaic"]) },
      { slug: "niacinamide", tokens: new Set(["niacinamide"]) },
    ];
    expectEqual(
      closestBriefSlug(briefs, "Cocamidopropyl betaine"),
      undefined,
      "no token overlap → undefined",
    );
  },
);

await test(
  "closestBriefSlug picks the brief with the highest token overlap",
  () => {
    // Two briefs share tokens with the reference; the one with the
    // larger overlap (2) wins over the one with smaller (1).
    const briefs = [
      { slug: "azelaic-acid", tokens: new Set(["azelaic"]) },
      {
        slug: "azelaic-acid-cream",
        tokens: new Set(["azelaic", "cream", "moisturizer"]),
      },
    ];
    expectEqual(
      closestBriefSlug(briefs, "Azelaic moisturizer"),
      "azelaic-acid-cream",
      "highest overlap wins",
    );
  },
);

// ─────────────────────────────────────────────────────────────────────
// Tests — most-referenced missing briefs aggregation
// ─────────────────────────────────────────────────────────────────────

console.log("\nCross-link coverage — most-referenced missing briefs");

await test(
  "two refs to the same target from one source page count as one inbound link",
  () => {
    // Both rows live on `concerns/acne` and reference the same
    // would-be ingredient brief. The aggregation must count
    // distinct source pages (collection/slug), so the inbound count
    // is 1, not 2.
    const noBrief: Unresolved[] = [
      {
        kind: "ingredient",
        display: "Cocamidopropyl betaine",
        origin: { collection: "concerns", slug: "acne", field: "ingredients[0].name" },
        classification: "no-brief",
      },
      {
        kind: "ingredient",
        display: "Cocamidopropyl betaine",
        origin: { collection: "concerns", slug: "acne", field: "ingredients[3].name" },
        classification: "no-brief",
      },
    ];
    const map = aggregateMissingBriefs(noBrief);
    expectEqual(map.size, 1, "one missing brief tracked");
    const entry = [...map.values()][0];
    expectEqual(entry.sources.size, 1, "two refs from one page → one inbound link");
    expectEqual(
      [...entry.sources][0],
      "concerns/acne",
      "source page captured exactly once",
    );
  },
);

await test(
  "refs from distinct source pages each count once",
  () => {
    const noBrief: Unresolved[] = [
      {
        kind: "ingredient",
        display: "Cocamidopropyl betaine",
        origin: { collection: "concerns", slug: "acne", field: "x" },
        classification: "no-brief",
      },
      {
        kind: "ingredient",
        display: "Cocamidopropyl betaine",
        origin: { collection: "products", slug: "cerave-cleanser", field: "y" },
        classification: "no-brief",
      },
    ];
    const map = aggregateMissingBriefs(noBrief);
    const entry = [...map.values()][0];
    expectEqual(entry.sources.size, 2, "distinct source pages count separately");
  },
);

await test(
  "sorting orders missing briefs by inbound count, descending",
  () => {
    const noBrief: Unresolved[] = [
      // 1 inbound: products/single
      {
        kind: "ingredient",
        display: "Single ref ingredient",
        origin: { collection: "products", slug: "single", field: "x" },
        classification: "no-brief",
      },
      // 3 inbounds: distinct pages, but listed twice on one of them
      {
        kind: "ingredient",
        display: "Popular ingredient",
        origin: { collection: "concerns", slug: "a", field: "x" },
        classification: "no-brief",
      },
      {
        kind: "ingredient",
        display: "Popular ingredient",
        origin: { collection: "concerns", slug: "a", field: "y" },
        classification: "no-brief",
      },
      {
        kind: "ingredient",
        display: "Popular ingredient",
        origin: { collection: "concerns", slug: "b", field: "x" },
        classification: "no-brief",
      },
      {
        kind: "ingredient",
        display: "Popular ingredient",
        origin: { collection: "products", slug: "p", field: "x" },
        classification: "no-brief",
      },
      // 2 inbounds
      {
        kind: "ingredient",
        display: "Mid ref ingredient",
        origin: { collection: "concerns", slug: "a", field: "x" },
        classification: "no-brief",
      },
      {
        kind: "ingredient",
        display: "Mid ref ingredient",
        origin: { collection: "concerns", slug: "b", field: "x" },
        classification: "no-brief",
      },
    ];
    const map = aggregateMissingBriefs(noBrief);
    const sorted = sortMissingBriefs([...map.values()]).map((m) => ({
      slug: m.slugGuess,
      count: m.sources.size,
    }));
    expectEqual(
      sorted,
      [
        { slug: "popular-ingredient", count: 3 },
        { slug: "mid-ref-ingredient", count: 2 },
        { slug: "single-ref-ingredient", count: 1 },
      ],
      "descending by inbound count, distinct source pages only",
    );
  },
);

await test(
  "sorting breaks ties on slugGuess ascending",
  () => {
    // Two missing briefs each with 2 inbound links — tie must
    // resolve alphabetically so the report is deterministic.
    const noBrief: Unresolved[] = [
      {
        kind: "ingredient",
        display: "Zeta peptide",
        origin: { collection: "concerns", slug: "a", field: "x" },
        classification: "no-brief",
      },
      {
        kind: "ingredient",
        display: "Zeta peptide",
        origin: { collection: "concerns", slug: "b", field: "x" },
        classification: "no-brief",
      },
      {
        kind: "ingredient",
        display: "Alpha peptide",
        origin: { collection: "concerns", slug: "a", field: "x" },
        classification: "no-brief",
      },
      {
        kind: "ingredient",
        display: "Alpha peptide",
        origin: { collection: "concerns", slug: "b", field: "x" },
        classification: "no-brief",
      },
    ];
    const map = aggregateMissingBriefs(noBrief);
    const sorted = sortMissingBriefs([...map.values()]).map((m) => m.slugGuess);
    expectEqual(
      sorted,
      ["alpha-peptide", "zeta-peptide"],
      "tie broken by slugGuess ascending",
    );
  },
);

await test(
  "procedural ingredient refs are skipped from the missing-briefs aggregation",
  () => {
    // `Hyaluronic filler (clinic)` carries the procedural deny
    // keywords `clinic` and `filler`. It should never become an
    // ingredient brief, so the aggregation must skip it — even
    // though it's classified as "no-brief" by the per-reference
    // classifier.
    const noBrief: Unresolved[] = [
      {
        kind: "ingredient",
        display: "Hyaluronic filler (clinic)",
        origin: { collection: "ingredients", slug: "hyaluronic-acid", field: "x" },
        classification: "no-brief",
      },
      {
        kind: "ingredient",
        display: "Cocamidopropyl betaine",
        origin: { collection: "concerns", slug: "acne", field: "x" },
        classification: "no-brief",
      },
    ];
    const map = aggregateMissingBriefs(noBrief);
    expectEqual(map.size, 1, "only the non-procedural ref aggregates");
    const entry = [...map.values()][0];
    expectEqual(
      entry.slugGuess,
      "cocamidopropyl-betaine",
      "non-procedural ref kept",
    );
  },
);

await test(
  "product missing briefs use a brand-name slug guess",
  () => {
    // The product display is "brand · name"; the canonical-slug
    // guess must mirror the on-disk product slug shape so editors
    // can paste it as a starting filename.
    const noBrief: Unresolved[] = [
      {
        kind: "product",
        display: "CeraVe · Eye Repair Cream",
        origin: { collection: "concerns", slug: "dark-circles", field: "products[0]" },
        classification: "no-brief",
        resemblesSlug: "cerave-moisturizing-cream",
      },
    ];
    const map = aggregateMissingBriefs(noBrief);
    const entry = [...map.values()][0];
    expectEqual(
      entry.slugGuess,
      "cerave-eye-repair-cream",
      "product slug guess mirrors on-disk shape",
    );
  },
);

await test(
  'canonicalSlugGuess handles "?" placeholders in product display',
  () => {
    // When a product reference is missing one half (brand or name),
    // the display carries "?" as a placeholder. The slug guess must
    // drop the placeholder rather than produce a literal "?-name"
    // slug that no editor would ever use.
    expectEqual(
      canonicalSlugGuess("product", "Vital Proteins · ?"),
      "vital-proteins",
      "missing name placeholder dropped",
    );
    expectEqual(
      canonicalSlugGuess("product", "? · Mystery Serum"),
      "mystery-serum",
      "missing brand placeholder dropped",
    );
  },
);

await test(
  "non-product kinds use a flat kebab-case slug guess",
  () => {
    expectEqual(
      canonicalSlugGuess("ingredient", "Cocamidopropyl betaine"),
      "cocamidopropyl-betaine",
      "ingredient slug guess",
    );
    expectEqual(
      canonicalSlugGuess("concern", "Post-Treatment Recovery"),
      "post-treatment-recovery",
      "concern slug guess",
    );
  },
);

await test(
  "missing briefs are bucketed separately per kind, even when slugs collide",
  () => {
    // Two refs share a slug guess but live in different `kind`
    // buckets — the aggregation key is `${kind}::${slug}` so they
    // must remain distinct entries.
    const noBrief: Unresolved[] = [
      {
        kind: "ingredient",
        display: "Vitamin K",
        origin: { collection: "concerns", slug: "a", field: "x" },
        classification: "no-brief",
      },
      {
        kind: "concern",
        display: "Vitamin K",
        origin: { collection: "ingredients", slug: "b", field: "y" },
        classification: "no-brief",
      },
    ];
    const map = aggregateMissingBriefs(noBrief);
    expectEqual(map.size, 2, "kind disambiguates same-slug missing briefs");
    expectTruthy(map.has("ingredient::vitamin-k"), "ingredient bucket");
    expectTruthy(map.has("concern::vitamin-k"), "concern bucket");
  },
);

await test(
  'aggregation preserves the first-seen "display" text',
  () => {
    // Two refs normalise to the same slug guess but carry slightly
    // different editorial phrasings. The first-seen display wins so
    // the report's "— "<display>"" hint is stable.
    const noBrief: Unresolved[] = [
      {
        kind: "ingredient",
        display: "MVE delivery system",
        origin: { collection: "concerns", slug: "a", field: "x" },
        classification: "no-brief",
      },
      {
        kind: "ingredient",
        display: "mve  delivery   system",
        origin: { collection: "concerns", slug: "b", field: "x" },
        classification: "no-brief",
      },
    ];
    const map = aggregateMissingBriefs(noBrief);
    expectEqual(map.size, 1, "both rows fold into one entry");
    const entry = [...map.values()][0];
    expectEqual(
      entry.display,
      "MVE delivery system",
      "first-seen display preserved",
    );
    expectEqual(
      entry.sources.size,
      2,
      "both source pages still counted",
    );
  },
);

await test(
  "aggregating an empty list returns an empty map",
  () => {
    const map = aggregateMissingBriefs([]);
    expectEqual(map.size, 0, "no unresolved refs → no missing briefs");
    expectFalsy(map.has("ingredient::anything"), "no entries");
  },
);

// ─────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────

console.log("");
const total = passed + failed;
if (failed > 0) {
  console.error(`✗ ${failed} of ${total} cross-link coverage cases failed.`);
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
console.log(`✓ All ${total} cross-link coverage cases passed.`);
