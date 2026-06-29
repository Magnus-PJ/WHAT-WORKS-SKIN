/**
 * Contract test: the curated "Related ingredients" grid + the inverse
 * "Other briefs that mention this" list both preserve their semantics.
 *
 * `getIngredientCards` and `getIngredientMentionedBy` in
 * `src/lib/links.ts` are the two cross-link helpers a brief page leans
 * on for the "Related ingredients" grid and the inverse mentioned-by
 * list rendered under each ingredient brief. They each delegate to a
 * pure builder so the contract can be exercised here against synthetic
 * fixtures without booting Astro:
 *
 *   • `buildIngredientCards` in `src/lib/related-ingredients.ts`
 *     resolves a curated `relatedIngredients` ref list to display-ready
 *     cards. It encodes:
 *       – `deriveRelatedSub` strips the "Ingredient · " prefix and
 *         drops the trailing variant segment when it duplicates the
 *         ingredient name; non-duplicate trailing segments are kept.
 *       – per-card `sub` overrides win over the auto-derived value.
 *       – unknown / pre-publish slugs in `refs` are dropped silently.
 *       – output order matches the input `refs` order.
 *
 *   • `buildMentionedByIndex` in `src/lib/mentioned-by.ts` is the
 *     pure builder behind `getIngredientMentionedBy`. The inverse-graph
 *     contract is covered exhaustively by `scripts/test-mentioned-by.ts`,
 *     but the four invariants the task description calls out — self-
 *     reference skipped, per-source dup-once, pre-publish/typo slugs
 *     dropped, and per-target alphabetical sort — are re-asserted here
 *     so this test stands on its own as the contract for
 *     `getIngredientMentionedBy`.
 *
 * Run via:
 *   pnpm --filter @workspace/whatworksskin run test:related-ingredients
 *
 * Exits non-zero on any failure so it can wire into CI alongside the
 * sibling `test:backlinks` and `test:mentioned-by` contract tests.
 */

import {
  buildIngredientCards,
  deriveRelatedSub,
  type RelatedIngredientBrief,
} from "../src/lib/related-ingredients.ts";
import {
  buildMentionedByIndex,
  type MentionedByInput,
} from "../src/lib/mentioned-by.ts";

// ─────────────────────────────────────────────────────────────────────
// Test harness — minimal, no external deps so this stays a single
// `tsx` script like the sibling `test-backlinks.ts` /
// `test-mentioned-by.ts` contract tests.
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

// ─────────────────────────────────────────────────────────────────────
// Tests — deriveRelatedSub
// ─────────────────────────────────────────────────────────────────────

console.log("Related-ingredients sub derivation");

await test('strips a leading "Ingredient · " prefix', () => {
  expectEqual(
    deriveRelatedSub("Ingredient · Humectant", "Hyaluronic acid"),
    "Humectant",
    "Ingredient prefix dropped, remaining segment kept",
  );
});

await test(
  "drops a trailing segment that duplicates the ingredient name",
  () => {
    expectEqual(
      deriveRelatedSub(
        "Ingredient · Synthetic Retinoid · Adapalene",
        "Adapalene",
      ),
      "Synthetic Retinoid",
      "trailing duplicate of name removed",
    );
  },
);

await test(
  "keeps a trailing segment that does NOT duplicate the ingredient name",
  () => {
    // The trailing "Humectant" is a category descriptor, not a variant
    // of the molecule name — it must be preserved so the card sub still
    // tells the reader what kind of ingredient this is.
    expectEqual(
      deriveRelatedSub(
        "Ingredient · Hydrator · Humectant",
        "Hyaluronic acid",
      ),
      "Hydrator · Humectant",
      "non-duplicate trailing segment kept",
    );
  },
);

await test(
  'name-duplicate detection treats casing / punctuation drift as a match',
  () => {
    // The norm() helper lower-cases and strips punctuation, so
    // "L-Ascorbic acid" duplicating "L-ascorbic acid" must collapse.
    expectEqual(
      deriveRelatedSub(
        "Ingredient · Vitamin C · L-Ascorbic acid",
        "L-ascorbic acid",
      ),
      "Vitamin C",
      "casing/punctuation drift in the trailing segment still collapses",
    );
  },
);

await test(
  "leaves an eyebrow with no Ingredient prefix untouched apart from trailing dedup",
  () => {
    // Defensive: not every brief's eyebrowKicker is guaranteed to start
    // with "Ingredient ·", so the helper must not depend on it.
    expectEqual(
      deriveRelatedSub("Humectant", "Hyaluronic acid"),
      "Humectant",
      "no leading prefix, single segment kept",
    );
  },
);

// ─────────────────────────────────────────────────────────────────────
// Tests — buildIngredientCards
// ─────────────────────────────────────────────────────────────────────

console.log("\nRelated-ingredients card resolution");

const FIXTURE_BRIEFS: RelatedIngredientBrief[] = [
  {
    slug: "niacinamide",
    name: "Niacinamide",
    tier: "A",
    eyebrowKicker: "Ingredient · Vitamin B3 · Niacinamide",
  },
  {
    slug: "retinol",
    name: "Retinol",
    tier: "A",
    eyebrowKicker: "Ingredient · Retinoid · Retinol",
  },
  {
    slug: "ceramides",
    name: "Ceramides",
    tier: "A",
    eyebrowKicker: "Ingredient · Barrier lipid",
  },
  {
    slug: "hyaluronic-acid",
    name: "Hyaluronic acid",
    tier: "A",
    eyebrowKicker: "Ingredient · Hydrator · Humectant",
  },
];

await test("auto-derives sub from each brief's eyebrowKicker", () => {
  const cards = buildIngredientCards(["niacinamide", "retinol"], FIXTURE_BRIEFS);
  expectEqual(
    cards,
    [
      { slug: "niacinamide", name: "Niacinamide", tier: "A", sub: "Vitamin B3" },
      { slug: "retinol", name: "Retinol", tier: "A", sub: "Retinoid" },
    ],
    "Ingredient prefix + trailing-name segment stripped per card",
  );
});

await test("per-card `sub` override wins over the auto-derived value", () => {
  const cards = buildIngredientCards(
    [
      { slug: "retinol", sub: "Evening partner" },
      "niacinamide",
    ],
    FIXTURE_BRIEFS,
  );
  expectEqual(
    cards,
    [
      { slug: "retinol", name: "Retinol", tier: "A", sub: "Evening partner" },
      { slug: "niacinamide", name: "Niacinamide", tier: "A", sub: "Vitamin B3" },
    ],
    "override applies only to the card it's authored on",
  );
});

await test("unknown / pre-publish slugs in refs are dropped silently", () => {
  const cards = buildIngredientCards(
    ["niacinamide", "unpublished-active", "nicaniamide", "retinol"],
    FIXTURE_BRIEFS,
  );
  expectEqual(
    cards.map((c) => c.slug),
    ["niacinamide", "retinol"],
    "only resolvable refs survive; order of survivors preserved",
  );
});

await test("a non-duplicate trailing eyebrow segment is preserved on the card", () => {
  // The hyaluronic-acid brief's eyebrow is "Ingredient · Hydrator ·
  // Humectant" — neither tail segment duplicates the molecule name,
  // so both must reach the rendered card.
  const cards = buildIngredientCards(["hyaluronic-acid"], FIXTURE_BRIEFS);
  expectEqual(
    cards,
    [
      {
        slug: "hyaluronic-acid",
        name: "Hyaluronic acid",
        tier: "A",
        sub: "Hydrator · Humectant",
      },
    ],
    "non-duplicate tail segments survive auto-derivation",
  );
});

await test("empty / nullish refs return an empty card list without touching briefs", () => {
  expectEqual(buildIngredientCards(undefined, FIXTURE_BRIEFS), [], "undefined → []");
  expectEqual(buildIngredientCards(null, FIXTURE_BRIEFS), [], "null → []");
  expectEqual(buildIngredientCards([], FIXTURE_BRIEFS), [], "empty array → []");
});

await test("output order matches the input refs order, not the briefs order", () => {
  const cards = buildIngredientCards(
    ["retinol", "ceramides", "niacinamide"],
    FIXTURE_BRIEFS,
  );
  expectEqual(
    cards.map((c) => c.slug),
    ["retinol", "ceramides", "niacinamide"],
    "editor-curated order is the rendered order",
  );
});

// ─────────────────────────────────────────────────────────────────────
// Tests — getIngredientMentionedBy invariants (via buildMentionedByIndex)
//
// `getIngredientMentionedBy` is a thin wrapper around the cached
// `buildMentionedByIndex` result. The invariants the task description
// calls out for this helper are re-asserted here so this script
// stands on its own as the contract for the rendered "Mentioned by"
// list. A wider corpus-level + dedupe-against-curated-grid suite lives
// in `scripts/test-mentioned-by.ts`.
// ─────────────────────────────────────────────────────────────────────

console.log("\nMentioned-by helper (rendered list)");

await test("a self-reference (A → A) is skipped", () => {
  const briefs: MentionedByInput[] = [
    {
      slug: "retinol",
      name: "Retinol",
      tier: "A",
      // A self-link would render as a card pointing at the page the
      // reader is already on. The helper must filter it out.
      relatedIngredients: ["retinol", "bakuchiol"],
    },
    { slug: "bakuchiol", name: "Bakuchiol", tier: "B" },
  ];
  const idx = buildMentionedByIndex(briefs);
  expectEqual(
    idx.has("retinol"),
    false,
    "self-link does not produce a mentioned-by entry",
  );
  expectEqual(
    idx.get("bakuchiol")?.map((e) => e.slug),
    ["retinol"],
    "other refs in the same brief still produce inverse entries",
  );
});

await test(
  "a duplicate slug listed twice in one source contributes once",
  () => {
    const briefs: MentionedByInput[] = [
      {
        slug: "niacinamide",
        name: "Niacinamide",
        tier: "A",
        // Same target twice (once as a bare slug, once as an override
        // pair). The mentioned-by list for retinol must list niacinamide
        // exactly once, not twice.
        relatedIngredients: [
          "retinol",
          { slug: "retinol", sub: "Evening partner" },
        ],
      },
      { slug: "retinol", name: "Retinol", tier: "A" },
    ];
    const idx = buildMentionedByIndex(briefs);
    expectEqual(
      idx.get("retinol")?.map((e) => e.slug),
      ["niacinamide"],
      "duplicate ref in the same brief does not double-count",
    );
  },
);

await test("pre-publish / typo'd target slugs are dropped", () => {
  const briefs: MentionedByInput[] = [
    {
      slug: "niacinamide",
      name: "Niacinamide",
      tier: "A",
      // `unpublished-active` has no brief yet; `nicaniamide` is a
      // typo. Both must be dropped so the rendered list never points
      // at a non-existent brief.
      relatedIngredients: [
        "retinol",
        "unpublished-active",
        "nicaniamide",
      ],
    },
    { slug: "retinol", name: "Retinol", tier: "A" },
  ];
  const idx = buildMentionedByIndex(briefs);
  expectEqual(
    idx.has("unpublished-active"),
    false,
    "pre-publish slug never gets an entry",
  );
  expectEqual(
    idx.has("nicaniamide"),
    false,
    "typo'd slug never gets an entry",
  );
  expectEqual(
    idx.get("retinol")?.map((e) => e.slug),
    ["niacinamide"],
    "valid sibling refs still produce the inverse entry",
  );
});

await test(
  "per-target list is alphabetised by source ingredient name",
  () => {
    // Insertion order is intentionally not alphabetical so a missing
    // sort would surface as the briefs' authoring order instead of
    // the expected `["Alpha arbutin", "Azelaic acid", "Salicylic acid"]`.
    const briefs: MentionedByInput[] = [
      {
        slug: "salicylic-acid",
        name: "Salicylic acid",
        tier: "A",
        relatedIngredients: ["niacinamide"],
      },
      {
        slug: "azelaic-acid",
        name: "Azelaic acid",
        tier: "B",
        relatedIngredients: ["niacinamide"],
      },
      {
        slug: "alpha-arbutin",
        name: "Alpha arbutin",
        tier: "B",
        relatedIngredients: ["niacinamide"],
      },
      { slug: "niacinamide", name: "Niacinamide", tier: "A" },
    ];
    const idx = buildMentionedByIndex(briefs);
    expectEqual(
      idx.get("niacinamide")?.map((e) => e.name),
      ["Alpha arbutin", "Azelaic acid", "Salicylic acid"],
      "sources sorted alphabetically by name",
    );
  },
);

// ─────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────

console.log("");
const total = passed + failed;
if (failed > 0) {
  console.error(`✗ ${failed} of ${total} related-ingredients cases failed.`);
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
console.log(`✓ All ${total} related-ingredients cases passed.`);
