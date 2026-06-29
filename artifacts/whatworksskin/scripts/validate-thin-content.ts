/**
 * Contract test: the thin-content detector's pure helpers preserve
 * their semantics.
 *
 * `scripts/port-content.mjs` runs the content port and walks the
 * per-kind output directories to flag thin / partially thin /
 * expected-skinny pages. The classification logic now lives in
 * `scripts/lib/thin-content.mjs` so it can be exercised here against
 * synthetic in-memory fixtures without re-running the full port.
 *
 * The cases below are the regressions that used to require eyeballing
 * the console output of `pnpm port:content` to catch:
 *   - all-full verdicts staying out of every report bucket
 *   - all-empty verdicts (placeholder rows from the catalogue
 *     fallback) landing in the `thin` bucket
 *   - mixed verdicts landing in the `partiallyThin` bucket with the
 *     correct `emptyIndices`
 *   - `EXPECTED_SKINNY` slugs being routed to `expectedSkinny` even
 *     when their verdicts would otherwise classify as partial / thin
 *   - non-trend-watch kinds always reporting an empty `partiallyThin`
 *     bucket, with thin detection driven by `BODY_SECTIONS`
 *
 * Run via:
 *   pnpm --filter @workspace/whatworksskin run validate:thin-content
 *
 * Exits non-zero on any failure so it can wire into the existing
 * validate workflow set alongside the matcher / shorthand checks.
 */

import {
  BODY_SECTIONS,
  EXPECTED_SKINNY,
  classifyTrendWatchVerdicts,
  isNonEmptyBody,
  summariseThinPages,
} from "./lib/thin-content.mjs";

// ─────────────────────────────────────────────────────────────────────
// Test harness — minimal, no external deps so this stays a single
// `tsx` script like the sibling `validate-*.ts` / `test-*.ts` checks.
// ─────────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures: { name: string; message: string }[] = [];

function test(name: string, fn: () => void): void {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    const message = err instanceof Error ? err.stack ?? err.message : String(err);
    failures.push({ name, message });
    console.log(`  ✗ ${name}`);
  }
}

function expectEqual<T>(actual: T, expected: T, label: string): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`${label}\n  expected: ${e}\n  actual:   ${a}`);
  }
}

// Fixture builders ----------------------------------------------------

function fullVerdicts(n: number): { body: string }[] {
  return Array.from({ length: n }, (_, i) => ({ body: `Verdict body ${i + 1}` }));
}

function emptyVerdicts(n: number): { body: string }[] {
  return Array.from({ length: n }, () => ({ body: "" }));
}

function mixedVerdicts(spec: ("full" | "empty")[]): { body: string }[] {
  return spec.map((s, i) => ({ body: s === "full" ? `Verdict body ${i + 1}` : "" }));
}

// ─────────────────────────────────────────────────────────────────────
console.log("classifyTrendWatchVerdicts");
// ─────────────────────────────────────────────────────────────────────

test("returns full for an all-populated verdicts array", () => {
  expectEqual(
    classifyTrendWatchVerdicts({ verdicts: fullVerdicts(3) }),
    { state: "full", emptyIndices: [] },
    "classification",
  );
});

test("returns thin for an all-empty verdicts array", () => {
  expectEqual(
    classifyTrendWatchVerdicts({ verdicts: emptyVerdicts(3) }),
    { state: "thin", emptyIndices: [0, 1, 2] },
    "classification",
  );
});

test("returns thin for a missing or empty verdicts array", () => {
  expectEqual(
    classifyTrendWatchVerdicts({}),
    { state: "thin", emptyIndices: [] },
    "missing verdicts",
  );
  expectEqual(
    classifyTrendWatchVerdicts({ verdicts: [] }),
    { state: "thin", emptyIndices: [] },
    "empty verdicts array",
  );
});

test("returns partial with the empty index list when verdicts are mixed", () => {
  expectEqual(
    classifyTrendWatchVerdicts({
      verdicts: mixedVerdicts(["full", "empty", "full", "empty", "empty"]),
    }),
    { state: "partial", emptyIndices: [1, 3, 4] },
    "classification",
  );
});

test("treats whitespace-only and missing body strings as empty", () => {
  expectEqual(
    classifyTrendWatchVerdicts({
      verdicts: [
        { body: "  \n  " },
        { body: "Real body" },
        {},
        null as unknown as { body: string },
      ],
    }),
    { state: "partial", emptyIndices: [0, 2, 3] },
    "classification",
  );
});

// ─────────────────────────────────────────────────────────────────────
console.log("");
console.log("summariseThinPages");
// ─────────────────────────────────────────────────────────────────────

test("all-full trend-watch verdicts route to no bucket (healthy)", () => {
  const report = summariseThinPages([
    { kind: "trend-watch", slug: "issue-100", data: { verdicts: fullVerdicts(4) } },
  ]);
  expectEqual(
    report["trend-watch"],
    { thin: [], partiallyThin: [], expectedSkinny: [] },
    "trend-watch buckets",
  );
});

test("all-empty trend-watch verdicts route to the thin bucket", () => {
  const report = summariseThinPages([
    { kind: "trend-watch", slug: "issue-101", data: { verdicts: emptyVerdicts(3) } },
  ]);
  expectEqual(report["trend-watch"].thin, ["issue-101"], "thin bucket");
  expectEqual(report["trend-watch"].partiallyThin, [], "partial bucket");
});

test("mixed trend-watch verdicts route to partiallyThin with emptyIndices", () => {
  const report = summariseThinPages([
    {
      kind: "trend-watch",
      slug: "issue-102",
      data: { verdicts: mixedVerdicts(["full", "empty", "full"]) },
    },
  ]);
  expectEqual(report["trend-watch"].thin, [], "thin bucket");
  expectEqual(
    report["trend-watch"].partiallyThin,
    [{ slug: "issue-102", emptyIndices: [1] }],
    "partial bucket",
  );
});

test("EXPECTED_SKINNY trend-watch slugs land in expectedSkinny even when partial", () => {
  // issue-007 is configured as expected-skinny — even when its verdicts
  // would otherwise classify as partial or thin, it must skip the warning
  // buckets and only show up in expectedSkinny.
  const expected = [...(EXPECTED_SKINNY["trend-watch"] || [])];
  if (expected.length === 0) {
    throw new Error("EXPECTED_SKINNY['trend-watch'] is unexpectedly empty");
  }
  const slug = expected[0];
  const report = summariseThinPages([
    {
      kind: "trend-watch",
      slug,
      data: { verdicts: mixedVerdicts(["full", "empty", "empty"]) },
    },
    {
      kind: "trend-watch",
      slug: expected[1] ?? "issue-014",
      data: { verdicts: emptyVerdicts(2) },
    },
  ]);
  expectEqual(report["trend-watch"].thin, [], "thin bucket");
  expectEqual(report["trend-watch"].partiallyThin, [], "partial bucket");
  expectEqual(
    report["trend-watch"].expectedSkinny,
    [...expected].sort(),
    "expectedSkinny bucket",
  );
});

test("non-trend-watch kinds always have an empty partiallyThin bucket", () => {
  const report = summariseThinPages([
    {
      kind: "concerns",
      slug: "concern-full",
      data: { triggers: ["sun"], faq: [{ q: "Q", a: "A" }] },
    },
    { kind: "concerns", slug: "concern-thin", data: { hero: "x" } },
    {
      kind: "products",
      slug: "product-full",
      data: { ingredients: [{ name: "Niacinamide" }] },
    },
    { kind: "products", slug: "product-thin", data: {} },
    { kind: "routines", slug: "routine-thin", data: { hero: "x" } },
    { kind: "supplements", slug: "supp-full", data: { evidence: ["RCT"] } },
  ]);
  for (const kind of ["concerns", "routines", "supplements", "products"] as const) {
    expectEqual(
      report[kind].partiallyThin,
      [],
      `${kind} partiallyThin should always be empty`,
    );
  }
  expectEqual(report.concerns.thin, ["concern-thin"], "concern thin bucket");
  expectEqual(report.products.thin, ["product-thin"], "product thin bucket");
  expectEqual(report.routines.thin, ["routine-thin"], "routine thin bucket");
  expectEqual(report.supplements.thin, [], "supplement thin bucket (healthy)");
});

test("non-trend-watch thin detection follows BODY_SECTIONS keys", () => {
  // Pages whose only populated keys are *not* in BODY_SECTIONS must
  // still classify as thin, otherwise hero-only briefs slip past.
  const report = summariseThinPages([
    {
      kind: "concerns",
      slug: "concern-hero-only",
      data: { hero: "anything", glance: { tldr: "x" } },
    },
    {
      kind: "concerns",
      slug: "concern-with-section",
      data: {
        // Pick any one BODY_SECTIONS entry to demonstrate it lifts the
        // page out of the thin bucket.
        [BODY_SECTIONS.concerns[0]]: ["non-empty"],
      } as Record<string, unknown>,
    },
  ]);
  expectEqual(report.concerns.thin, ["concern-hero-only"], "thin detection");
});

test("isNonEmptyBody treats empty arrays / strings / objects as empty", () => {
  expectEqual(isNonEmptyBody(undefined), false, "undefined");
  expectEqual(isNonEmptyBody(null), false, "null");
  expectEqual(isNonEmptyBody(""), false, "empty string");
  expectEqual(isNonEmptyBody("   "), false, "whitespace-only string");
  expectEqual(isNonEmptyBody([]), false, "empty array");
  expectEqual(isNonEmptyBody({}), false, "empty object");
  expectEqual(isNonEmptyBody(["x"]), true, "populated array");
  expectEqual(isNonEmptyBody({ a: 1 }), true, "populated object");
  expectEqual(isNonEmptyBody("hi"), true, "populated string");
});

test("entries for unknown kinds are ignored", () => {
  const report = summariseThinPages([
    { kind: "not-a-kind" as never, slug: "x", data: {} },
  ]);
  expectEqual(
    Object.keys(report).sort(),
    Object.keys(BODY_SECTIONS).sort(),
    "report keys",
  );
});

// ─────────────────────────────────────────────────────────────────────
console.log("");
console.log(`${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("");
  console.log("Failures:");
  for (const f of failures) {
    console.log(`  ✗ ${f.name}`);
    console.log(`    ${f.message.split("\n").join("\n    ")}`);
  }
  process.exit(1);
}
