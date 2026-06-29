/**
 * Golden test: the cross-link coverage report's printed output stays
 * shaped the way editors expect.
 *
 * Task #167 added unit tests for the helpers behind
 * `scripts/report-cross-link-coverage.ts` (index builders, classifier,
 * missing-briefs aggregation). Those guard the *decisions* the report
 * makes per reference. This file guards the *presentation* layer the
 * editors actually read: the summary line at the top, the section
 * headers, the "    • collection/slug" indentation, the per-source
 * sort, the "← source" lines under each missing brief, the resemblance
 * hint formatting, and the per-collection totals block.
 *
 * The script delegates rendering to `renderReport()` in
 * `src/lib/cross-link-coverage.ts` so this test can drive it against
 * a small in-memory corpus without touching the live content tree.
 *
 * Run via:
 *   pnpm --filter @workspace/whatworksskin run test:cross-link-coverage-report
 *
 * Exits non-zero on any failure so it can wire into CI alongside the
 * sibling `test:cross-link-coverage` contract test.
 */

import {
  renderReport,
  type Unresolved,
} from "../src/lib/cross-link-coverage.ts";

// ─────────────────────────────────────────────────────────────────────
// Test harness — mirrors the sibling `test-cross-link-coverage.ts`
// pattern: tiny, self-contained, no external deps.
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

function expectIncludes(haystack: string, needle: string, label: string): void {
  if (!haystack.includes(needle)) {
    throw new Error(
      `${label}\n  expected output to include:\n    ${JSON.stringify(needle)}\n  actual output:\n${haystack}`,
    );
  }
}

function expectNotIncludes(haystack: string, needle: string, label: string): void {
  if (haystack.includes(needle)) {
    throw new Error(
      `${label}\n  expected output NOT to include:\n    ${JSON.stringify(needle)}\n  actual output:\n${haystack}`,
    );
  }
}

/**
 * Find the index of the first line that contains `needle`. Returns -1
 * when no line matches. Used to assert *relative* ordering of two
 * lines without pinning their absolute positions.
 */
function indexOfLine(lines: readonly string[], needle: string): number {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(needle)) return i;
  }
  return -1;
}

const ZERO_BRIEFS = {
  concerns: 0,
  ingredients: 0,
  products: 0,
  routines: 0,
  supplements: 0,
};

// ─────────────────────────────────────────────────────────────────────
// Header / summary line
// ─────────────────────────────────────────────────────────────────────

console.log("Cross-link coverage report — header & summary");

await test("the report opens with the title and a 60-char rule", () => {
  const out = renderReport({ unresolved: [], briefsScanned: ZERO_BRIEFS });
  const lines = out.split("\n");
  expectEqual(
    lines[0],
    "Cross-link coverage report — What Works Skin",
    "title is the first line",
  );
  expectEqual(lines[1], "=".repeat(60), "second line is a 60-char === rule");
});

await test("the briefs-scanned line uses the supplied per-collection counts", () => {
  const out = renderReport({
    unresolved: [],
    briefsScanned: {
      concerns: 12,
      ingredients: 34,
      products: 56,
      routines: 7,
      supplements: 8,
    },
  });
  expectIncludes(
    out,
    "Briefs scanned: 12 concerns, 34 ingredients, 56 products, 7 routines, 8 supplements.",
    "exact briefs-scanned line",
  );
});

await test(
  "with no unresolved refs the report prints the all-clear message and stops",
  () => {
    const out = renderReport({ unresolved: [], briefsScanned: ZERO_BRIEFS });
    expectIncludes(
      out,
      "All cross-references resolve to existing briefs. Nothing to do.",
      "all-clear sentinel printed",
    );
    expectNotIncludes(out, "MATCHER GAPS", "no matcher-gaps section");
    expectNotIncludes(out, "NO BRIEF YET", "no no-brief section");
    expectNotIncludes(out, "Per-collection totals", "no totals block");
    expectNotIncludes(out, "Tip:", "no tip footer");
  },
);

await test(
  "the unresolved-summary line tallies matcher gaps and no-brief refs",
  () => {
    const unresolved: Unresolved[] = [
      {
        kind: "ingredient",
        display: "Azelaic 15%",
        origin: { collection: "products", slug: "ordinary-azelaic", field: "ingredients[0].i" },
        classification: "matcher-gap",
        resemblesSlug: "azelaic-acid",
      },
      {
        kind: "ingredient",
        display: "Cocamidopropyl betaine",
        origin: { collection: "products", slug: "cerave-cleanser", field: "ingredients[2].i" },
        classification: "no-brief",
      },
      {
        kind: "ingredient",
        display: "MVE delivery system",
        origin: { collection: "products", slug: "cerave-cleanser", field: "ingredients[3].i" },
        classification: "no-brief",
      },
    ];
    const out = renderReport({ unresolved, briefsScanned: ZERO_BRIEFS });
    expectIncludes(
      out,
      "3 unresolved reference(s): 1 matcher gap(s), 2 brief(s) not yet written.",
      "summary tallies all three buckets",
    );
  },
);

// ─────────────────────────────────────────────────────────────────────
// MATCHER GAPS section
// ─────────────────────────────────────────────────────────────────────

console.log("\nCross-link coverage report — MATCHER GAPS section");

await test(
  "matcher-gap section header carries the count and an underline rule",
  () => {
    const unresolved: Unresolved[] = [
      {
        kind: "ingredient",
        display: "Azelaic 15%",
        origin: { collection: "products", slug: "p", field: "x" },
        classification: "matcher-gap",
        resemblesSlug: "azelaic-acid",
      },
    ];
    const out = renderReport({ unresolved, briefsScanned: ZERO_BRIEFS });
    const title = "MATCHER GAPS — brief exists, alias missing (1)";
    expectIncludes(out, title, "section title with count");
    // Each section header is followed by a U+2500 underline of the
    // exact same visual length — pulling it via the title's char
    // count keeps the assertion stable as the header text evolves.
    expectIncludes(
      out,
      `${title}\n${"─".repeat(title.length)}`,
      "underline matches title length",
    );
  },
);

await test("matcher-gap rows render the resemblance hint", () => {
  const unresolved: Unresolved[] = [
    {
      kind: "ingredient",
      display: "Azelaic 15%",
      origin: { collection: "products", slug: "ordinary-azelaic", field: "ingredients[0].i" },
      classification: "matcher-gap",
      resemblesSlug: "azelaic-acid",
    },
  ];
  const out = renderReport({ unresolved, briefsScanned: ZERO_BRIEFS });
  expectIncludes(
    out,
    `        - "Azelaic 15%" (ingredients[0].i) → resembles "azelaic-acid"`,
    "row formatted with display, field, and resemblance hint",
  );
});

await test("rows without a resemblance hint omit the arrow", () => {
  const unresolved: Unresolved[] = [
    {
      kind: "ingredient",
      display: "Cocamidopropyl betaine",
      origin: { collection: "products", slug: "cerave-cleanser", field: "ingredients[2].i" },
      classification: "no-brief",
    },
  ];
  const out = renderReport({ unresolved, briefsScanned: ZERO_BRIEFS });
  expectIncludes(
    out,
    `        - "Cocamidopropyl betaine" (ingredients[2].i)`,
    "row without arrow",
  );
  expectNotIncludes(
    out,
    `"Cocamidopropyl betaine" (ingredients[2].i) →`,
    "no resembles arrow without a hint",
  );
});

await test(
  "matcher-gap section sub-groups refs by kind with per-kind counts",
  () => {
    const unresolved: Unresolved[] = [
      {
        kind: "ingredient",
        display: "Azelaic 15%",
        origin: { collection: "products", slug: "p1", field: "x" },
        classification: "matcher-gap",
        resemblesSlug: "azelaic-acid",
      },
      {
        kind: "ingredient",
        display: "Nicotinamide PC",
        origin: { collection: "products", slug: "p2", field: "x" },
        classification: "matcher-gap",
        resemblesSlug: "niacinamide",
      },
      {
        kind: "concern",
        display: "Barrier strain",
        origin: { collection: "concerns", slug: "c1", field: "x" },
        classification: "matcher-gap",
        resemblesSlug: "compromised-barrier",
      },
    ];
    const out = renderReport({ unresolved, briefsScanned: ZERO_BRIEFS });
    expectIncludes(out, "  Ingredient references (2):", "ingredient sub-group count");
    expectIncludes(out, "  Concern references (1):", "concern sub-group count");
    expectNotIncludes(out, "Product references", "no empty product sub-group");
  },
);

await test(
  "matcher-gap rows with multiple sources sort source pages alphabetically",
  () => {
    const unresolved: Unresolved[] = [
      // Deliberately push in non-alpha order — the renderer must sort
      // the per-source bullet keys so the output is deterministic.
      {
        kind: "ingredient",
        display: "Azelaic 15%",
        origin: { collection: "products", slug: "zeta-product", field: "x" },
        classification: "matcher-gap",
        resemblesSlug: "azelaic-acid",
      },
      {
        kind: "ingredient",
        display: "Azelaic 10%",
        origin: { collection: "concerns", slug: "acne", field: "y" },
        classification: "matcher-gap",
        resemblesSlug: "azelaic-acid",
      },
      {
        kind: "ingredient",
        display: "Azelaic 20%",
        origin: { collection: "concerns", slug: "rosacea", field: "z" },
        classification: "matcher-gap",
        resemblesSlug: "azelaic-acid",
      },
    ];
    const out = renderReport({ unresolved, briefsScanned: ZERO_BRIEFS });
    const lines = out.split("\n");
    const i1 = indexOfLine(lines, "    • concerns/acne");
    const i2 = indexOfLine(lines, "    • concerns/rosacea");
    const i3 = indexOfLine(lines, "    • products/zeta-product");
    if (i1 < 0 || i2 < 0 || i3 < 0) {
      throw new Error(`expected all three source bullets present (got ${i1}, ${i2}, ${i3})`);
    }
    if (!(i1 < i2 && i2 < i3)) {
      throw new Error(
        `expected ascending order concerns/acne < concerns/rosacea < products/zeta-product, got ${i1} < ${i2} < ${i3}`,
      );
    }
  },
);

// ─────────────────────────────────────────────────────────────────────
// NO BRIEF YET section
// ─────────────────────────────────────────────────────────────────────

console.log("\nCross-link coverage report — NO BRIEF YET section");

await test("no-brief section header carries the count", () => {
  const unresolved: Unresolved[] = [
    {
      kind: "ingredient",
      display: "Cocamidopropyl betaine",
      origin: { collection: "products", slug: "p", field: "x" },
      classification: "no-brief",
    },
    {
      kind: "ingredient",
      display: "MVE delivery system",
      origin: { collection: "products", slug: "p", field: "y" },
      classification: "no-brief",
    },
  ];
  const out = renderReport({ unresolved, briefsScanned: ZERO_BRIEFS });
  expectIncludes(
    out,
    "NO BRIEF YET — referenced thing has no brief (2)",
    "no-brief title with count",
  );
});

await test(
  "matcher-gap and no-brief refs appear in their respective sections only",
  () => {
    const unresolved: Unresolved[] = [
      {
        kind: "ingredient",
        display: "Azelaic 15%",
        origin: { collection: "products", slug: "p1", field: "x" },
        classification: "matcher-gap",
        resemblesSlug: "azelaic-acid",
      },
      {
        kind: "ingredient",
        display: "Cocamidopropyl betaine",
        origin: { collection: "products", slug: "p2", field: "y" },
        classification: "no-brief",
      },
    ];
    const out = renderReport({ unresolved, briefsScanned: ZERO_BRIEFS });
    const lines = out.split("\n");
    const matcherIdx = indexOfLine(lines, "MATCHER GAPS");
    const azelaicIdx = indexOfLine(lines, "Azelaic 15%");
    const noBriefIdx = indexOfLine(lines, "NO BRIEF YET");
    const cocaIdx = indexOfLine(lines, "Cocamidopropyl betaine");
    if (!(matcherIdx < azelaicIdx && azelaicIdx < noBriefIdx && noBriefIdx < cocaIdx)) {
      throw new Error(
        `expected ordering: MATCHER GAPS < Azelaic < NO BRIEF YET < Cocamidopropyl, got ${matcherIdx}, ${azelaicIdx}, ${noBriefIdx}, ${cocaIdx}`,
      );
    }
  },
);

// ─────────────────────────────────────────────────────────────────────
// MOST-REFERENCED MISSING BRIEFS section
// ─────────────────────────────────────────────────────────────────────

console.log(
  "\nCross-link coverage report — MOST-REFERENCED MISSING BRIEFS section",
);

await test(
  "missing-briefs section header carries the distinct-brief count",
  () => {
    // Two refs to the same target → one missing brief; the header
    // count must show distinct briefs, not raw row count.
    const unresolved: Unresolved[] = [
      {
        kind: "ingredient",
        display: "Cocamidopropyl betaine",
        origin: { collection: "concerns", slug: "a", field: "x" },
        classification: "no-brief",
      },
      {
        kind: "ingredient",
        display: "Cocamidopropyl betaine",
        origin: { collection: "concerns", slug: "b", field: "y" },
        classification: "no-brief",
      },
    ];
    const out = renderReport({ unresolved, briefsScanned: ZERO_BRIEFS });
    expectIncludes(
      out,
      "MOST-REFERENCED MISSING BRIEFS — top write-next opportunities (1)",
      "header counts distinct missing briefs",
    );
  },
);

await test(
  'missing-briefs row formats slug guess, ref count, and "← source" lines',
  () => {
    const unresolved: Unresolved[] = [
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
    const out = renderReport({ unresolved, briefsScanned: ZERO_BRIEFS });
    expectIncludes(
      out,
      `    • cocamidopropyl-betaine  [2 refs]  — "Cocamidopropyl betaine"`,
      "missing-brief row carries slug guess, plural ref count, and display",
    );
    expectIncludes(out, "        ← concerns/acne", "first source link");
    expectIncludes(
      out,
      "        ← products/cerave-cleanser",
      "second source link",
    );
  },
);

await test(
  'a single-source missing brief renders the singular "ref" label',
  () => {
    const unresolved: Unresolved[] = [
      {
        kind: "ingredient",
        display: "MVE delivery system",
        origin: { collection: "products", slug: "cerave-cream", field: "x" },
        classification: "no-brief",
      },
    ];
    const out = renderReport({ unresolved, briefsScanned: ZERO_BRIEFS });
    expectIncludes(
      out,
      `    • mve-delivery-system  [1 ref]  — "MVE delivery system"`,
      "singular [1 ref] label, no trailing s",
    );
  },
);

await test(
  "missing briefs sort by inbound count descending within a kind",
  () => {
    const unresolved: Unresolved[] = [
      // 1 inbound
      {
        kind: "ingredient",
        display: "Single ref ingredient",
        origin: { collection: "products", slug: "single", field: "x" },
        classification: "no-brief",
      },
      // 3 inbounds
      {
        kind: "ingredient",
        display: "Popular ingredient",
        origin: { collection: "concerns", slug: "a", field: "x" },
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
    const out = renderReport({ unresolved, briefsScanned: ZERO_BRIEFS });
    const lines = out.split("\n");
    const popular = indexOfLine(lines, "popular-ingredient");
    const mid = indexOfLine(lines, "mid-ref-ingredient");
    const single = indexOfLine(lines, "single-ref-ingredient");
    if (!(popular < mid && mid < single)) {
      throw new Error(
        `expected descending order popular(3) < mid(2) < single(1), got ${popular}, ${mid}, ${single}`,
      );
    }
  },
);

await test(
  "missing briefs are bucketed per kind under their own sub-header",
  () => {
    const unresolved: Unresolved[] = [
      {
        kind: "ingredient",
        display: "Cocamidopropyl betaine",
        origin: { collection: "products", slug: "p1", field: "x" },
        classification: "no-brief",
      },
      {
        kind: "concern",
        display: "Post-treatment recovery",
        origin: { collection: "ingredients", slug: "i1", field: "y" },
        classification: "no-brief",
      },
      {
        kind: "product",
        display: "CeraVe · Eye Repair Cream",
        origin: { collection: "concerns", slug: "dark-circles", field: "z" },
        classification: "no-brief",
      },
    ];
    const out = renderReport({ unresolved, briefsScanned: ZERO_BRIEFS });
    expectIncludes(out, "  Ingredient briefs (1):", "ingredient bucket header");
    expectIncludes(out, "  Product briefs (1):", "product bucket header");
    expectIncludes(out, "  Concern briefs (1):", "concern bucket header");
    expectIncludes(
      out,
      "    • cerave-eye-repair-cream",
      "product slug guess uses brand-name shape",
    );
  },
);

// ─────────────────────────────────────────────────────────────────────
// Per-collection totals block
// ─────────────────────────────────────────────────────────────────────

console.log("\nCross-link coverage report — Per-collection totals block");

await test(
  "totals block tallies one row per source per collection (no double-count)",
  () => {
    // Three refs from the same `products/p` source page should still
    // count three towards the `products` total — the per-collection
    // total is a row count, not a distinct-source count.
    const unresolved: Unresolved[] = [
      {
        kind: "ingredient",
        display: "A",
        origin: { collection: "products", slug: "p", field: "ingredients[0].i" },
        classification: "no-brief",
      },
      {
        kind: "ingredient",
        display: "B",
        origin: { collection: "products", slug: "p", field: "ingredients[1].i" },
        classification: "no-brief",
      },
      {
        kind: "ingredient",
        display: "C",
        origin: { collection: "products", slug: "p", field: "ingredients[2].i" },
        classification: "no-brief",
      },
      {
        kind: "concern",
        display: "Barrier strain",
        origin: { collection: "concerns", slug: "c", field: "x" },
        classification: "matcher-gap",
        resemblesSlug: "compromised-barrier",
      },
    ];
    const out = renderReport({ unresolved, briefsScanned: ZERO_BRIEFS });
    expectIncludes(out, "  concerns     1", "concerns total");
    expectIncludes(out, "  ingredients  0", "ingredients total (no rows)");
    expectIncludes(out, "  products     3", "products total counts all rows");
    expectIncludes(out, "  routines     0", "routines total (no rows)");
    expectIncludes(
      out,
      "  supplements  0",
      "supplements total (no rows)",
    );
  },
);

await test(
  "totals block prints all collections in the canonical order even when zero",
  () => {
    const unresolved: Unresolved[] = [
      {
        kind: "ingredient",
        display: "A",
        origin: { collection: "concerns", slug: "c", field: "x" },
        classification: "no-brief",
      },
    ];
    const out = renderReport({ unresolved, briefsScanned: ZERO_BRIEFS });
    const lines = out.split("\n");
    const concernsIdx = indexOfLine(lines, "  concerns     ");
    const ingredientsIdx = indexOfLine(lines, "  ingredients  ");
    const productsIdx = indexOfLine(lines, "  products     ");
    const routinesIdx = indexOfLine(lines, "  routines     ");
    const supplementsIdx = indexOfLine(lines, "  supplements  ");
    if (
      !(
        concernsIdx > 0 &&
        concernsIdx < ingredientsIdx &&
        ingredientsIdx < productsIdx &&
        productsIdx < routinesIdx &&
        routinesIdx < supplementsIdx
      )
    ) {
      throw new Error(
        `expected canonical totals order (concerns < ingredients < products < routines < supplements), got ${concernsIdx}, ${ingredientsIdx}, ${productsIdx}, ${routinesIdx}, ${supplementsIdx}`,
      );
    }
  },
);

await test(
  "an unknown collection in `collectionOrder` renders as zero, not skipped",
  () => {
    // Defensive: callers can pass a custom order and we must still
    // print every name so editors don't silently lose a row.
    const unresolved: Unresolved[] = [
      {
        kind: "ingredient",
        display: "A",
        origin: { collection: "concerns", slug: "c", field: "x" },
        classification: "no-brief",
      },
    ];
    const out = renderReport({
      unresolved,
      briefsScanned: ZERO_BRIEFS,
      collectionOrder: ["concerns", "made-up"],
    });
    expectIncludes(out, "  concerns     1", "known collection");
    expectIncludes(out, "  made-up      0", "unknown collection rendered as zero");
  },
);

// ─────────────────────────────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────────────────────────────

console.log("\nCross-link coverage report — footer");

await test("the report ends with the editor tip pointing at link-aliases.ts", () => {
  const unresolved: Unresolved[] = [
    {
      kind: "ingredient",
      display: "Azelaic 15%",
      origin: { collection: "products", slug: "p", field: "x" },
      classification: "matcher-gap",
      resemblesSlug: "azelaic-acid",
    },
  ];
  const out = renderReport({ unresolved, briefsScanned: ZERO_BRIEFS });
  expectIncludes(
    out,
    "Tip: matcher gaps usually mean a missing entry in src/lib/link-aliases.ts",
    "tip footer present",
  );
});

// ─────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────

console.log("");
const total = passed + failed;
if (failed > 0) {
  console.error(`✗ ${failed} of ${total} cross-link coverage report cases failed.`);
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
console.log(`✓ All ${total} cross-link coverage report cases passed.`);
