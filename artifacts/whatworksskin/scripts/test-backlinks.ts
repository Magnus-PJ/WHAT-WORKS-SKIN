/**
 * Contract test: back-link index builders preserve their semantics.
 *
 * `getIngredientBacklinks` and `getProductBacklinks` in
 * `src/lib/links.ts` power both the brief pages' "Where it appears"
 * panels and the catalogue index coverage badges. They're also the
 * only place we encode subtle invariants like "first matching row per
 * concern wins the role" and "first matching step per routine wins the
 * step title". This script exercises those invariants against a small
 * synthetic content fixture using deterministic in-test resolvers, so
 * a future refactor of the cache or matcher can't silently break the
 * rendered counts on the index pages or the back-link sections on the
 * brief pages.
 *
 * The test drives the same `buildIngredientBacklinkIndex` /
 * `buildProductBacklinkIndex` builders that the runtime
 * `ingredientBacklinkIndex()` / `productBacklinkIndex()` wrappers
 * call — so coverage here is on the real production code path, just
 * with synthetic concerns/routines and predictable resolver functions
 * instead of `getCollection` + the live alias-map matcher.
 *
 * Run via:
 *   pnpm --filter @workspace/whatworksskin run test:backlinks
 *
 * Exits non-zero on any failure so it can wire into CI alongside the
 * other `validate:*` scripts.
 */

import {
  buildIngredientBacklinkIndex,
  buildProductBacklinkIndex,
  type Backlinks,
  type ConcernBacklinkInput,
  type IngredientResolver,
  type ProductResolver,
  type RoutineBacklinkInput,
} from "../src/lib/backlinks.ts";

// ─────────────────────────────────────────────────────────────────────
// Test harness — minimal, no external deps so this stays a single
// `tsx` script like the other validate:* contract tests.
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
// Resolvers
//
// The runtime resolvers (`findIngredientSlug` / `findProductSlug`) do
// fuzzy alias-aware matching against the live catalogue. For these
// tests we want deterministic behaviour, so we drive the builders with
// dictionary-backed resolvers that are easy to reason about. The exact
// matching strategy doesn't matter — the builders' invariants
// (dedup-first-wins, alphabetical sort, unknown-slug-empty) are the
// thing under test.
// ─────────────────────────────────────────────────────────────────────

/** Match by trimmed/lowercased substring — the longest-key entry wins
 * so "vitamin c serum" prefers "vitamin c" over "vitamin". */
function makeIngredientResolver(
  table: Record<string, string>,
): IngredientResolver {
  const entries = Object.entries(table)
    .map(([phrase, slug]) => ({ phrase: phrase.toLowerCase(), slug }))
    .sort((a, b) => b.phrase.length - a.phrase.length);
  return (text) => {
    if (!text) return undefined;
    const hay = text.toLowerCase();
    for (const e of entries) {
      if (hay.includes(e.phrase)) return e.slug;
    }
    return undefined;
  };
}

/** Exact (brand, name) tuple lookup, case-insensitive. */
function makeProductResolver(
  table: { brand: string; name: string; slug: string }[],
): ProductResolver {
  const idx = new Map<string, string>();
  for (const e of table) {
    idx.set(`${e.brand.toLowerCase()}::${e.name.toLowerCase()}`, e.slug);
  }
  return (brand, name) => {
    if (!brand || !name) return undefined;
    return idx.get(`${brand.toLowerCase()}::${name.toLowerCase()}`);
  };
}

// ─────────────────────────────────────────────────────────────────────
// Tests — ingredient back-links
// ─────────────────────────────────────────────────────────────────────

console.log("Back-link helpers (ingredients)");

await test(
  "first matching ingredient row per concern wins the role; later duplicates dropped",
  async () => {
    const concerns: ConcernBacklinkInput[] = [
      {
        data: {
          slug: "acne",
          name: "Acne",
          ingredients: [
            { name: "Niacinamide 5%", role: "Adjunct" },
            { name: "Salicylic acid 2%", role: "Anchor" },
            // Dup of niacinamide later with a different role — must NOT
            // overwrite the "Adjunct" role captured from the first row.
            { name: "Niacinamide 4%", role: "Hero" },
          ],
        },
      },
    ];
    const resolve = makeIngredientResolver({
      niacinamide: "niacinamide",
      "salicylic acid": "salicylic-acid",
    });

    const idx = await buildIngredientBacklinkIndex(concerns, [], resolve);
    const niac = idx.get("niacinamide");
    expectEqual(niac?.concerns.length, 1, "niacinamide should appear once");
    expectEqual(niac?.concerns[0].role, "Adjunct", "role from first matching row");
    const sali = idx.get("salicylic-acid");
    expectEqual(sali?.concerns.length, 1, "salicylic-acid should appear once");
  },
);

await test(
  "first matching step per routine wins the stepTitle; later duplicates dropped",
  async () => {
    const routines: RoutineBacklinkInput[] = [
      {
        data: {
          slug: "barrier-rebuild",
          title: "Barrier rebuild",
          sub: "Gentle 4-step recovery",
          steps: [
            { title: "AM cleanse", sub: "fragrance-free wash" },
            { title: "AM treat", sub: "Niacinamide 5% serum" },
            // Same active appears in PM — should be ignored, AM treat
            // already captured the routine entry + stepTitle.
            { title: "PM treat", sub: "Niacinamide 4% serum" },
          ],
        },
      },
    ];
    const resolve = makeIngredientResolver({ niacinamide: "niacinamide" });

    const idx = await buildIngredientBacklinkIndex([], routines, resolve);
    const niac = idx.get("niacinamide");
    expectEqual(niac?.routines.length, 1, "routine should appear once");
    expectEqual(niac?.routines[0].stepTitle, "AM treat", "stepTitle from first match");
    expectEqual(niac?.routines[0].title, "Barrier rebuild", "routine title carried");
    expectEqual(niac?.routines[0].sub, "Gentle 4-step recovery", "routine sub carried");
  },
);

await test("alphabetical sort of concerns (by name) and routines (by sub)", async () => {
  const concerns: ConcernBacklinkInput[] = [
    {
      data: {
        slug: "rosacea",
        name: "Rosacea",
        ingredients: [{ name: "Niacinamide 4%", role: "Soothe" }],
      },
    },
    {
      data: {
        slug: "acne",
        name: "Acne",
        ingredients: [{ name: "Niacinamide 5%", role: "Adjunct" }],
      },
    },
    {
      data: {
        slug: "pih",
        name: "Hyperpigmentation",
        ingredients: [{ name: "Niacinamide 5%", role: "Brightener" }],
      },
    },
  ];
  const routines: RoutineBacklinkInput[] = [
    {
      data: {
        slug: "anti-aging",
        title: "Anti-aging",
        sub: "Z evening routine",
        steps: [{ title: "Treat", sub: "Niacinamide 5%" }],
      },
    },
    {
      data: {
        slug: "barrier",
        title: "Barrier",
        sub: "A morning routine",
        steps: [{ title: "Treat", sub: "Niacinamide 5%" }],
      },
    },
  ];
  const resolve = makeIngredientResolver({ niacinamide: "niacinamide" });

  const idx = await buildIngredientBacklinkIndex(concerns, routines, resolve);
  const niac = idx.get("niacinamide");
  expectEqual(
    niac?.concerns.map((c) => c.name),
    ["Acne", "Hyperpigmentation", "Rosacea"],
    "concerns sorted by name",
  );
  expectEqual(
    niac?.routines.map((r) => r.sub),
    ["A morning routine", "Z evening routine"],
    "routines sorted by sub",
  );
});

await test("unknown slug returns no entry (caller falls back to EMPTY)", async () => {
  const concerns: ConcernBacklinkInput[] = [
    {
      data: {
        slug: "acne",
        name: "Acne",
        ingredients: [{ name: "Niacinamide 5%", role: "Adjunct" }],
      },
    },
  ];
  const resolve = makeIngredientResolver({ niacinamide: "niacinamide" });

  const idx = await buildIngredientBacklinkIndex(concerns, [], resolve);
  expectEqual(idx.has("retinol"), false, "missing slug not in index");
  expectEqual(idx.get("retinol"), undefined, "missing slug returns undefined");
});

await test(
  "ingredient referenced by both a concern and a routine appears in both lists",
  async () => {
    const concerns: ConcernBacklinkInput[] = [
      {
        data: {
          slug: "acne",
          name: "Acne",
          ingredients: [{ name: "Niacinamide 5%", role: "Adjunct" }],
        },
      },
    ];
    const routines: RoutineBacklinkInput[] = [
      {
        data: {
          slug: "barrier",
          title: "Barrier",
          sub: "Morning recovery",
          steps: [{ title: "Treat", sub: "Niacinamide 5% serum" }],
        },
      },
    ];
    const resolve = makeIngredientResolver({ niacinamide: "niacinamide" });

    const idx = await buildIngredientBacklinkIndex(concerns, routines, resolve);
    const niac = idx.get("niacinamide");
    expectEqual(niac?.concerns.length, 1, "one concern entry");
    expectEqual(niac?.routines.length, 1, "one routine entry");
    expectEqual(niac?.concerns[0].slug, "acne", "concern slug carried");
    expectEqual(niac?.routines[0].slug, "barrier", "routine slug carried");
  },
);

await test(
  "haystack covers title/sub/activeKey/activeVal — match anywhere wins",
  async () => {
    const routines: RoutineBacklinkInput[] = [
      {
        data: {
          slug: "anti-aging",
          title: "Anti-aging",
          sub: "Evening retinization",
          steps: [
            // The actual molecule name only appears in `activeVal`,
            // not in `title` / `sub`. Test that the builder's haystack
            // assembly still feeds it to the resolver.
            {
              title: "Treat",
              sub: "Pea-sized application",
              activeKey: "active",
              activeVal: "Tretinoin 0.025% cream",
            },
          ],
        },
      },
    ];
    const resolve = makeIngredientResolver({ tretinoin: "tretinoin" });

    const idx = await buildIngredientBacklinkIndex([], routines, resolve);
    const tret = idx.get("tretinoin");
    expectEqual(tret?.routines.length, 1, "matched via activeVal");
    expectEqual(tret?.routines[0].stepTitle, "Treat", "stepTitle captured");
  },
);

// ─────────────────────────────────────────────────────────────────────
// Tests — product back-links
// ─────────────────────────────────────────────────────────────────────

console.log("\nBack-link helpers (products)");

await test("first matching product row per concern wins; later duplicates dropped", async () => {
  const concerns: ConcernBacklinkInput[] = [
    {
      data: {
        slug: "acne",
        name: "Acne",
        products: [
          { brand: "CeraVe", name: "SA Cleanser" },
          { brand: "Paula's Choice", name: "BHA 2%" },
          // Same product listed twice — must dedup.
          { brand: "CeraVe", name: "SA Cleanser" },
        ],
      },
    },
  ];
  const resolve = makeProductResolver([
    { brand: "CeraVe", name: "SA Cleanser", slug: "cerave-sa-cleanser" },
    { brand: "Paula's Choice", name: "BHA 2%", slug: "paulas-choice-bha-2" },
  ]);

  const idx = await buildProductBacklinkIndex(concerns, [], resolve);
  const cera = idx.get("cerave-sa-cleanser");
  expectEqual(cera?.concerns.length, 1, "duplicate product collapsed");
  const pc = idx.get("paulas-choice-bha-2");
  expectEqual(pc?.concerns.length, 1, "second product still linked");
});

await test("first matching step per routine wins the stepTitle (products)", async () => {
  const routines: RoutineBacklinkInput[] = [
    {
      data: {
        slug: "barrier",
        title: "Barrier",
        sub: "Gentle recovery",
        steps: [
          {
            title: "AM moisturize",
            products: [{ brand: "CeraVe", name: "Moisturizing Cream" }],
          },
          {
            // Same product later in the routine — should NOT overwrite
            // the AM stepTitle captured from the first matching step.
            title: "PM moisturize",
            products: [{ brand: "CeraVe", name: "Moisturizing Cream" }],
          },
        ],
      },
    },
  ];
  const resolve = makeProductResolver([
    { brand: "CeraVe", name: "Moisturizing Cream", slug: "cerave-mc" },
  ]);

  const idx = await buildProductBacklinkIndex([], routines, resolve);
  const cera = idx.get("cerave-mc");
  expectEqual(cera?.routines.length, 1, "routine appears once");
  expectEqual(cera?.routines[0].stepTitle, "AM moisturize", "stepTitle from first match");
});

await test("alphabetical sort of concerns (by name) and routines (by sub) — products", async () => {
  const concerns: ConcernBacklinkInput[] = [
    {
      data: {
        slug: "rosacea",
        name: "Rosacea",
        products: [{ brand: "CeraVe", name: "Moisturizing Cream" }],
      },
    },
    {
      data: {
        slug: "acne",
        name: "Acne",
        products: [{ brand: "CeraVe", name: "Moisturizing Cream" }],
      },
    },
  ];
  const routines: RoutineBacklinkInput[] = [
    {
      data: {
        slug: "evening",
        title: "PM",
        sub: "Z evening",
        steps: [
          { title: "Moisturize", products: [{ brand: "CeraVe", name: "Moisturizing Cream" }] },
        ],
      },
    },
    {
      data: {
        slug: "morning",
        title: "AM",
        sub: "A morning",
        steps: [
          { title: "Moisturize", products: [{ brand: "CeraVe", name: "Moisturizing Cream" }] },
        ],
      },
    },
  ];
  const resolve = makeProductResolver([
    { brand: "CeraVe", name: "Moisturizing Cream", slug: "cerave-mc" },
  ]);

  const idx = await buildProductBacklinkIndex(concerns, routines, resolve);
  const cera = idx.get("cerave-mc");
  expectEqual(
    cera?.concerns.map((c) => c.name),
    ["Acne", "Rosacea"],
    "concerns sorted by name",
  );
  expectEqual(
    cera?.routines.map((r) => r.sub),
    ["A morning", "Z evening"],
    "routines sorted by sub",
  );
});

await test("unknown product slug returns no entry", async () => {
  const concerns: ConcernBacklinkInput[] = [
    {
      data: {
        slug: "acne",
        name: "Acne",
        products: [{ brand: "CeraVe", name: "SA Cleanser" }],
      },
    },
  ];
  const resolve = makeProductResolver([
    { brand: "CeraVe", name: "SA Cleanser", slug: "cerave-sa-cleanser" },
  ]);
  const idx = await buildProductBacklinkIndex(concerns, [], resolve);
  expectEqual(idx.has("paulas-choice-bha-2"), false, "missing slug not in index");
});

await test(
  "product referenced by both a concern and a routine appears in both lists",
  async () => {
    const concerns: ConcernBacklinkInput[] = [
      {
        data: {
          slug: "acne",
          name: "Acne",
          products: [{ brand: "CeraVe", name: "SA Cleanser" }],
        },
      },
    ];
    const routines: RoutineBacklinkInput[] = [
      {
        data: {
          slug: "morning",
          title: "AM",
          sub: "Morning routine",
          steps: [
            { title: "Cleanse", products: [{ brand: "CeraVe", name: "SA Cleanser" }] },
          ],
        },
      },
    ];
    const resolve = makeProductResolver([
      { brand: "CeraVe", name: "SA Cleanser", slug: "cerave-sa-cleanser" },
    ]);
    const idx = await buildProductBacklinkIndex(concerns, routines, resolve);
    const cera: Backlinks | undefined = idx.get("cerave-sa-cleanser");
    expectEqual(cera?.concerns.length, 1, "one concern entry");
    expectEqual(cera?.routines.length, 1, "one routine entry");
    expectEqual(cera?.concerns[0].slug, "acne", "concern slug carried");
    expectEqual(cera?.routines[0].slug, "morning", "routine slug carried");
  },
);

await test("missing brand or name in a product row is silently skipped", async () => {
  const concerns: ConcernBacklinkInput[] = [
    {
      data: {
        slug: "acne",
        name: "Acne",
        products: [
          { brand: "CeraVe", name: undefined },
          { brand: undefined, name: "SA Cleanser" },
          { brand: "CeraVe", name: "SA Cleanser" },
        ],
      },
    },
  ];
  const resolve = makeProductResolver([
    { brand: "CeraVe", name: "SA Cleanser", slug: "cerave-sa-cleanser" },
  ]);
  const idx = await buildProductBacklinkIndex(concerns, [], resolve);
  expectEqual(idx.size, 1, "only the well-formed row contributes");
  expectEqual(
    idx.get("cerave-sa-cleanser")?.concerns.length,
    1,
    "the well-formed row resolved",
  );
});

// ─────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────

console.log("");
const total = passed + failed;
if (failed > 0) {
  console.error(`✗ ${failed} of ${total} back-link cases failed.`);
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
console.log(`✓ All ${total} back-link cases passed.`);
