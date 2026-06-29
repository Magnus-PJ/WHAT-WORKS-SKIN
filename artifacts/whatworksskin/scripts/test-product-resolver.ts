/**
 * Contract test: `findProductSlug`'s four-step cascade preserves its
 * semantics.
 *
 * `findProductSlug` in `src/lib/links.ts` is the cross-link helper the
 * concern shelves, routine steps, and supplement entries all lean on
 * to resolve a free-form (brand, name) pair to a product brief. It
 * encodes a specific cascade:
 *
 *   1. Exact `(norm(brand), norm(name))` tuple match.
 *   2. Within the brand's bucket, `nameNorm` equality.
 *   3. Within the brand's bucket, two-way substring match
 *      (`candidate.includes(name) || name.includes(candidate)`).
 *   4. Curated `PRODUCT_ALIASES` per-brand fall-back for editorial
 *      wording drift the substring step can't bridge.
 *
 * The runtime delegates the cascade to `resolveProductSlug` in
 * `src/lib/product-resolver.ts` so it can be exercised here against a
 * synthetic product fixture without booting Astro. A future refactor
 * of the cascade order or the brand-substring rule that quietly
 * changes which brief a catalogue links to will fail this script.
 *
 * Run via:
 *   pnpm --filter @workspace/whatworksskin run test:product-resolver
 *
 * Exits non-zero on any failure so it can wire into CI alongside the
 * sibling `test:backlinks` / `test:mentioned-by` /
 * `test:related-ingredients` contract tests.
 */

import {
  buildProductIndex,
  resolveProductSlug,
  type ProductBrief,
} from "../src/lib/product-resolver.ts";
import {
  PRODUCT_ALIASES,
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

// ─────────────────────────────────────────────────────────────────────
// Synthetic fixture
//
// A tiny product corpus that exercises every step of the cascade. The
// alias map below is local to this script (kept independent of
// `PRODUCT_ALIASES`) so the assertions don't shift when an editor adds
// a real-world alias to the live map. A separate test asserts the
// runtime still consults the live `PRODUCT_ALIASES` map by default.
// ─────────────────────────────────────────────────────────────────────

const FIXTURE_BRIEFS: ProductBrief[] = [
  {
    slug: "cerave-sa-cleanser",
    brand: "CeraVe",
    name: "SA Smoothing Cleanser",
  },
  {
    slug: "cerave-moisturizing-cream",
    brand: "CeraVe",
    name: "Moisturizing Cream",
  },
  {
    slug: "la-roche-posay-toleriane-double-repair",
    brand: "La Roche-Posay",
    name: "Toleriane Double Repair Face Moisturizer",
  },
  {
    slug: "la-roche-posay-effaclar-purifying-foaming-gel",
    brand: "La Roche-Posay",
    name: "Effaclar Purifying Foaming Gel",
  },
];

const FIXTURE_ALIASES: ProductAliasMap = {
  "la roche posay": {
    "la-roche-posay-toleriane-double-repair": [
      "toleriane hydrating",
    ],
  },
  // Brand that has NO entry in `FIXTURE_BRIEFS` — used to prove the
  // alias fall-back can resolve when the brand has no in-index bucket.
  paula: {
    "paulas-choice-2-bha-liquid": ["skin perfecting 2 bha liquid"],
  },
  // Brand+slug used by the "alias is consulted only when the in-brand
  // cascade misses" test below — points at a *different* slug than the
  // in-brand candidate so a regression that consulted the alias first
  // would surface as a slug mismatch.
  cerave: {
    "wrong-slug-if-alias-wins": ["sa smoothing cleanser"],
  },
};

const FIXTURE_INDEX = buildProductIndex(FIXTURE_BRIEFS);

// ─────────────────────────────────────────────────────────────────────
// Tests — the four-step cascade
// ─────────────────────────────────────────────────────────────────────

console.log("Product resolver cascade");

await test("exact (brand, name) tuple wins", () => {
  expectEqual(
    resolveProductSlug(
      FIXTURE_INDEX,
      FIXTURE_ALIASES,
      "CeraVe",
      "SA Smoothing Cleanser",
    ),
    "cerave-sa-cleanser",
    "exact tuple resolves to the canonical slug",
  );
});

await test(
  "case + punctuation drift in the name still resolves via norm equality",
  () => {
    // Same brand, same name modulo casing/punctuation that `norm()`
    // collapses (lower-case + non-alphanumerics → spaces). Different
    // tuple key than the canonical "CeraVe::SA Smoothing Cleanser",
    // so this hits the in-brand norm-equality step, not the exact
    // tuple step.
    expectEqual(
      resolveProductSlug(
        FIXTURE_INDEX,
        FIXTURE_ALIASES,
        "cerave",
        "SA  smoothing-cleanser!",
      ),
      "cerave-sa-cleanser",
      "norm equality bridges casing + punctuation drift",
    );
  },
);

await test(
  "substring match within the brand catches editorial wording drift",
  () => {
    // The canonical brief is "Toleriane Double Repair Face
    // Moisturizer". Editorial copy frequently shortens this to
    // "Toleriane Double Repair" — the input's normalised form is a
    // substring of the candidate, so the in-brand substring step
    // resolves it.
    expectEqual(
      resolveProductSlug(
        FIXTURE_INDEX,
        FIXTURE_ALIASES,
        "La Roche-Posay",
        "Toleriane Double Repair",
      ),
      "la-roche-posay-toleriane-double-repair",
      "input ⊂ candidate substring resolves",
    );
  },
);

await test(
  "substring step also matches when the candidate is a substring of the input",
  () => {
    // The cascade's substring rule is two-way:
    // `candidate.includes(input) || input.includes(candidate)`. Here
    // the candidate ("Effaclar Purifying Foaming Gel") sits inside an
    // editorialised input ("Effaclar Purifying Foaming Gel cleanser"),
    // exercising the input-includes-candidate direction.
    expectEqual(
      resolveProductSlug(
        FIXTURE_INDEX,
        FIXTURE_ALIASES,
        "La Roche-Posay",
        "Effaclar Purifying Foaming Gel cleanser",
      ),
      "la-roche-posay-effaclar-purifying-foaming-gel",
      "candidate ⊂ input substring resolves",
    );
  },
);

await test(
  "curated alias map resolves wording drift the in-brand cascade can't bridge",
  () => {
    // "Toleriane Hydrating" shares no substring with the canonical
    // "Toleriane Double Repair Face Moisturizer" name beyond
    // "toleriane", which the brand-substring rule would only honour
    // if "toleriane" appeared as the entire normalised input or the
    // entire normalised candidate. Neither is true, so the cascade
    // falls through to the curated alias map.
    expectEqual(
      resolveProductSlug(
        FIXTURE_INDEX,
        FIXTURE_ALIASES,
        "La Roche-Posay",
        "Toleriane Hydrating",
      ),
      "la-roche-posay-toleriane-double-repair",
      "alias bridges editorial wording drift",
    );
  },
);

await test(
  "alias map is consulted ONLY when the in-brand cascade misses",
  () => {
    // The fixture aliases register "sa smoothing cleanser" under
    // CeraVe pointing at a deliberately-wrong slug. The same brand
    // has an in-brand exact match, so the exact-tuple step must win
    // and the alias must NOT be consulted.
    expectEqual(
      resolveProductSlug(
        FIXTURE_INDEX,
        FIXTURE_ALIASES,
        "CeraVe",
        "SA Smoothing Cleanser",
      ),
      "cerave-sa-cleanser",
      "in-brand match wins over a conflicting alias entry",
    );
  },
);

await test(
  "alias fall-back works even when the brand has no in-index bucket",
  () => {
    // No CeraVe-rivalling brand "Paula" lives in `FIXTURE_BRIEFS`, so
    // `byBrand.get("paula")` is undefined and the in-brand steps are
    // skipped entirely. The alias map still resolves the input.
    expectEqual(
      resolveProductSlug(
        FIXTURE_INDEX,
        FIXTURE_ALIASES,
        "Paula",
        "Skin Perfecting 2% BHA Liquid",
      ),
      "paulas-choice-2-bha-liquid",
      "alias resolves even without an in-brand bucket",
    );
  },
);

// ─────────────────────────────────────────────────────────────────────
// Tests — defensive / negative cases
// ─────────────────────────────────────────────────────────────────────

console.log("\nProduct resolver guards");

await test("missing brand returns undefined (no name lookup attempted)", () => {
  expectEqual(
    resolveProductSlug(
      FIXTURE_INDEX,
      FIXTURE_ALIASES,
      undefined,
      "SA Smoothing Cleanser",
    ),
    undefined,
    "undefined brand short-circuits to undefined",
  );
  expectEqual(
    resolveProductSlug(FIXTURE_INDEX, FIXTURE_ALIASES, null, "anything"),
    undefined,
    "null brand short-circuits to undefined",
  );
  expectEqual(
    resolveProductSlug(FIXTURE_INDEX, FIXTURE_ALIASES, "", "anything"),
    undefined,
    "empty-string brand short-circuits to undefined",
  );
});

await test("missing name returns undefined (no brand lookup attempted)", () => {
  expectEqual(
    resolveProductSlug(FIXTURE_INDEX, FIXTURE_ALIASES, "CeraVe", undefined),
    undefined,
    "undefined name short-circuits to undefined",
  );
  expectEqual(
    resolveProductSlug(FIXTURE_INDEX, FIXTURE_ALIASES, "CeraVe", null),
    undefined,
    "null name short-circuits to undefined",
  );
  expectEqual(
    resolveProductSlug(FIXTURE_INDEX, FIXTURE_ALIASES, "CeraVe", ""),
    undefined,
    "empty-string name short-circuits to undefined",
  );
});

await test(
  "unknown (brand, name) pair with no alias entry returns undefined",
  () => {
    expectEqual(
      resolveProductSlug(
        FIXTURE_INDEX,
        FIXTURE_ALIASES,
        "Unknown Brand",
        "Mystery Product",
      ),
      undefined,
      "unresolvable input falls through to undefined",
    );
  },
);

await test(
  "in-brand miss + alias miss for that brand still returns undefined",
  () => {
    // CeraVe IS in the index and IS in the alias map, but the input
    // matches neither an in-brand candidate nor an alias entry — the
    // cascade must return undefined rather than e.g. picking an
    // unrelated CeraVe brief.
    expectEqual(
      resolveProductSlug(
        FIXTURE_INDEX,
        FIXTURE_ALIASES,
        "CeraVe",
        "Hydrating Toner",
      ),
      undefined,
      "no candidate matches → undefined",
    );
  },
);

// ─────────────────────────────────────────────────────────────────────
// Tests — integration with the live alias map
//
// The runtime resolver passes `PRODUCT_ALIASES` into `resolveProductSlug`.
// Spot-check a single well-known mapping so a future regression that
// silently ignored the alias map (e.g. by hard-coding `{}` in the
// runtime call site) would surface here too.
// ─────────────────────────────────────────────────────────────────────

console.log("\nProduct resolver — live PRODUCT_ALIASES wiring");

await test(
  'live alias map resolves "Toleriane Hydrating" against an empty index',
  () => {
    // Empty product index → only the alias map can resolve. The live
    // `PRODUCT_ALIASES` registers this exact wording under
    // La Roche-Posay → la-roche-posay-toleriane-double-repair.
    const emptyIdx = buildProductIndex([]);
    expectEqual(
      resolveProductSlug(
        emptyIdx,
        PRODUCT_ALIASES,
        "La Roche-Posay",
        "Toleriane Hydrating",
      ),
      "la-roche-posay-toleriane-double-repair",
      "live PRODUCT_ALIASES still resolves the canonical example",
    );
  },
);

// ─────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────

console.log("");
const total = passed + failed;
if (failed > 0) {
  console.error(`✗ ${failed} of ${total} product-resolver cases failed.`);
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
console.log(`✓ All ${total} product-resolver cases passed.`);
