/**
 * Contract test for the structured `verdict.body` helpers in
 * `src/lib/trend-watch-body.ts`.
 *
 * `TrendWatchIssue.astro` and the cross-link coverage report both
 * lean on `normaliseBody` / `extractLinks` to turn the on-disk body
 * (plain string OR rich-text segment array) into a uniform shape they
 * can render and validate. A regression that quietly accepts a
 * malformed link object, drops a string segment, or routes a kind to
 * the wrong page prefix would either render broken anchors on the
 * site or skew the cross-link coverage stats — this test pins down
 * each behaviour against in-memory fixtures so neither path can
 * silently rot.
 *
 * Run via:
 *   pnpm --filter @workspace/whatworksskin run test:trend-watch-body
 */

import {
  KIND_TO_ROUTE,
  extractLinks,
  isLinkSegment,
  normaliseBody,
} from "../src/lib/trend-watch-body.ts";

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
  if (a !== e) throw new Error(`${label}\n  expected: ${e}\n  actual:   ${a}`);
}

console.log("Trend Watch body — normaliseBody");

test("a plain string body becomes a single text segment", () => {
  expectEqual(normaliseBody("hello"), ["hello"], "string → [string]");
});

test("an empty string body normalises to an empty list", () => {
  expectEqual(normaliseBody(""), [], "empty string → []");
});

test("undefined / null bodies normalise to an empty list", () => {
  expectEqual(normaliseBody(undefined), [], "undefined → []");
  expectEqual(normaliseBody(null), [], "null → []");
});

test("a segment array preserves valid string + link segments in order", () => {
  const body = [
    "Lead-in ",
    { text: "UV filters brief", kind: "ingredient", slug: "uv-filters" },
    " — trailing.",
  ];
  expectEqual(
    normaliseBody(body),
    [
      "Lead-in ",
      { text: "UV filters brief", kind: "ingredient", slug: "uv-filters" },
      " — trailing.",
    ],
    "round-trips a mixed segment array",
  );
});

test("malformed link objects are dropped silently", () => {
  // Missing slug, missing kind, unknown kind — none should survive
  // normalisation. The renderer therefore never sees a half-built
  // link and the report never tries to look up an undefined slug.
  const body = [
    "ok ",
    { text: "no slug", kind: "ingredient" },
    { text: "bad kind", kind: "tablet", slug: "x" },
    { text: "no kind", slug: "x" },
    "still ok",
  ];
  expectEqual(normaliseBody(body), ["ok ", "still ok"], "malformed link objects dropped");
});

test("empty string segments inside the array are dropped", () => {
  const body = ["", "kept", ""];
  expectEqual(normaliseBody(body), ["kept"], "empty strings filtered out");
});

console.log("\nTrend Watch body — isLinkSegment");

test("isLinkSegment identifies a well-formed link object", () => {
  expectEqual(
    isLinkSegment({ text: "x", kind: "ingredient", slug: "y" }),
    true,
    "well-formed link",
  );
});

test("isLinkSegment rejects strings, nulls, and malformed objects", () => {
  expectEqual(isLinkSegment("plain"), false, "string");
  expectEqual(isLinkSegment(null), false, "null");
  expectEqual(isLinkSegment({ text: "x", kind: "wat", slug: "y" }), false, "bad kind");
  expectEqual(isLinkSegment({ text: "x", slug: "y" }), false, "no kind");
});

console.log("\nTrend Watch body — extractLinks");

test("extractLinks returns only the link segments", () => {
  const body = [
    "intro ",
    { text: "A", kind: "ingredient", slug: "a" },
    " mid ",
    { text: "B", kind: "supplement", slug: "b" },
  ];
  expectEqual(
    extractLinks(body),
    [
      { text: "A", kind: "ingredient", slug: "a" },
      { text: "B", kind: "supplement", slug: "b" },
    ],
    "two links extracted, strings dropped",
  );
});

test("extractLinks returns [] for a plain-string body", () => {
  expectEqual(extractLinks("just prose"), [], "no links in a string body");
});

console.log("\nTrend Watch body — KIND_TO_ROUTE");

test("every supported link kind maps to its plural page route", () => {
  expectEqual(KIND_TO_ROUTE.ingredient, "ingredients", "ingredient → ingredients");
  expectEqual(KIND_TO_ROUTE.concern, "concerns", "concern → concerns");
  expectEqual(KIND_TO_ROUTE.product, "products", "product → products");
  expectEqual(KIND_TO_ROUTE.supplement, "supplements", "supplement → supplements");
  expectEqual(KIND_TO_ROUTE.routine, "routines", "routine → routines");
});

console.log("");
if (failed > 0) {
  console.log(`✗ ${failed} failure(s):`);
  for (const f of failures) {
    console.log(`\n  ${f.name}\n    ${f.message.replace(/\n/g, "\n    ")}`);
  }
  process.exit(1);
}
console.log(`✓ All ${passed} trend-watch body cases passed.`);
