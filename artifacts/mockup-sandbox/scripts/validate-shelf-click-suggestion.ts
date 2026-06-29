/**
 * Validate the shelf-click truncation suggestion logic.
 *
 * The editor dashboard's truncation banner now offers a one-click
 * "narrow my filter" CTA derived from the row slice that came back
 * (see `_shelfClickSuggestion.ts`). This script locks down the
 * decision rules so a future tweak doesn't silently regress them:
 *
 *   1) When a narrower built-in date range exists whose projected
 *      count fits under the cap, the suggestion picks the *largest*
 *      such range (so the editor keeps the most data on screen).
 *   2) When even the smallest built-in range overshoots, the
 *      suggestion falls back to a single-kind chip — but only when
 *      the editor hasn't already pinned a kind (otherwise it would
 *      silently swap the kind they're inspecting).
 *   3) When the kind chip is already pinned and no narrower built-in
 *      range fits, the suggester returns `null` so the banner falls
 *      back to its existing "pick a tighter date range" prompt.
 *   4) Empty input, single-instant slices, and `limit <= 0` all
 *      return `null` — the banner stays in its plain prose state.
 *
 * Run via: pnpm --filter @workspace/mockup-sandbox run validate:shelf-click-suggestion
 */

import {
  suggestNarrowing,
  type SuggestionRow,
} from "../src/components/mockups/evidently/_shelfClickSuggestion";

const failures: string[] = [];

function expect(condition: boolean, message: string): void {
  if (!condition) failures.push(message);
}

function buildRows(
  count: number,
  spanHours: number,
  kindMix: ReadonlyArray<SuggestionRow["pageKind"]>,
): SuggestionRow[] {
  // Spread `count` rows evenly across `spanHours`, ending "now". The
  // density helper computes (max - min) / spanHours, so we pin the
  // first row at `now - spanHours * 3600s` and the last at `now`.
  const now = Date.now();
  const startMs = now - spanHours * 3_600_000;
  const stepMs = count > 1 ? (now - startMs) / (count - 1) : 0;
  const rows: SuggestionRow[] = [];
  for (let i = 0; i < count; i += 1) {
    const t = startMs + i * stepMs;
    rows.push({
      createdAt: new Date(t).toISOString(),
      pageKind: kindMix[i % kindMix.length],
    });
  }
  return rows;
}

// 1) "Last 7 days" view that's truncated and could comfortably fit
//    inside "Last 24 hours". Density: 1000 rows over ~36h ≈ 27.7/h
//    → 24h projects to ~666, well under the 1000 cap. The largest
//    narrower built-in range is 24h, so that's the one we expect.
{
  const rows = buildRows(1000, 36, ["ingredient", "routine", "concern"]);
  const suggestion = suggestNarrowing(rows, "7d", "all", {
    limit: 1000,
    totalCount: 4500,
  });
  expect(
    suggestion !== null && suggestion.kind === "range",
    "case 1: expected a range suggestion when 24h fits under the cap",
  );
  if (suggestion && suggestion.kind === "range") {
    expect(
      suggestion.rangeId === "24h",
      `case 1: expected rangeId="24h", got "${suggestion.rangeId}"`,
    );
    expect(
      suggestion.estimate > 0 && suggestion.estimate < 1000,
      `case 1: expected estimate within (0, 1000), got ${suggestion.estimate}`,
    );
  }
}

// 2) "All recent" + truncated. With density spread thinly enough
//    that "Last 30 days" still fits under the cap, the suggester
//    should pick 30d (largest narrower bounded range), not 24h.
{
  const rows = buildRows(1000, 24 * 60, ["ingredient", "routine", "concern"]); // 60d span
  const suggestion = suggestNarrowing(rows, "all", "all", {
    limit: 1000,
    totalCount: 2500,
  });
  expect(
    suggestion !== null && suggestion.kind === "range",
    "case 2: expected a range suggestion for an unbounded view",
  );
  if (suggestion && suggestion.kind === "range") {
    expect(
      suggestion.rangeId === "30d",
      `case 2: expected rangeId="30d" (largest narrower bounded), got "${suggestion.rangeId}"`,
    );
  }
}

// 3) Density so high that even Last 24 hours overshoots. With kind
//    mix dominated by "routine" and an "all" kind chip, the suggester
//    falls back to a kind chip pre-selection.
{
  // 1000 rows in 1 hour → 24000/h projected over 24h. Every range
  // chip overshoots, so kind suggestion takes over. Mix: 50% routine,
  // 30% ingredient, 20% concern → with totalCount 50000, projections
  // are 25000 / 15000 / 10000 — all over 1000. So even kind fallback
  // can't fit. Suggester returns null.
  const rows: SuggestionRow[] = [];
  const kinds: SuggestionRow["pageKind"][] = [
    ...Array(500).fill("routine") as SuggestionRow["pageKind"][],
    ...Array(300).fill("ingredient") as SuggestionRow["pageKind"][],
    ...Array(200).fill("concern") as SuggestionRow["pageKind"][],
  ];
  const now = Date.now();
  const startMs = now - 3_600_000; // 1h ago
  for (let i = 0; i < 1000; i += 1) {
    rows.push({
      createdAt: new Date(startMs + i * 3600).toISOString(),
      pageKind: kinds[i],
    });
  }
  const suggestion = suggestNarrowing(rows, "24h", "all", {
    limit: 1000,
    totalCount: 50000,
  });
  expect(
    suggestion === null,
    "case 3: expected null when no range fits and every kind still overshoots",
  );
}

// 4) Range overshoots, but a single kind would fit. 1000 rows in 1h
//    over a totalCount of 8000 — overall density blows past every
//    range. But concerns are only 5% of the slice (50 rows of 1000),
//    projecting to 400 of 8000 — under the cap. Suggester picks the
//    largest fitting kind, which here is "concern" (only one).
{
  const rows: SuggestionRow[] = [];
  const kinds: SuggestionRow["pageKind"][] = [
    ...Array(700).fill("routine") as SuggestionRow["pageKind"][], // 5600 projected
    ...Array(250).fill("ingredient") as SuggestionRow["pageKind"][], // 2000 projected
    ...Array(50).fill("concern") as SuggestionRow["pageKind"][], // 400 projected
  ];
  const now = Date.now();
  const startMs = now - 3_600_000;
  for (let i = 0; i < 1000; i += 1) {
    rows.push({
      createdAt: new Date(startMs + i * 3600).toISOString(),
      pageKind: kinds[i],
    });
  }
  const suggestion = suggestNarrowing(rows, "24h", "all", {
    limit: 1000,
    totalCount: 8000,
  });
  expect(
    suggestion !== null && suggestion.kind === "pageKind",
    "case 4: expected a pageKind suggestion when only one kind fits",
  );
  if (suggestion && suggestion.kind === "pageKind") {
    expect(
      suggestion.pageKind === "concern",
      `case 4: expected pageKind="concern", got "${suggestion.pageKind}"`,
    );
    expect(
      suggestion.estimate < 1000,
      `case 4: expected estimate < 1000, got ${suggestion.estimate}`,
    );
  }
}

// 5) Kind chip already pinned + no narrower range fits → null. The
//    suggester refuses to suggest a *different* kind because that
//    would silently change what the editor is looking at.
{
  const rows: SuggestionRow[] = [];
  const now = Date.now();
  const startMs = now - 3_600_000;
  for (let i = 0; i < 1000; i += 1) {
    rows.push({
      createdAt: new Date(startMs + i * 3600).toISOString(),
      pageKind: "ingredient",
    });
  }
  const suggestion = suggestNarrowing(rows, "24h", "ingredient", {
    limit: 1000,
    totalCount: 50000,
  });
  expect(
    suggestion === null,
    "case 5: expected null when the kind chip is pinned and no range fits",
  );
}

// 6) Empty rows / pathological inputs → null.
{
  const empty = suggestNarrowing([], "7d", "all", {
    limit: 1000,
    totalCount: 0,
  });
  expect(empty === null, "case 6a: expected null for an empty row set");

  const zeroCap = suggestNarrowing(
    buildRows(10, 24, ["ingredient"]),
    "7d",
    "all",
    { limit: 0, totalCount: 100 },
  );
  expect(zeroCap === null, "case 6b: expected null for cap.limit <= 0");

  const sameInstant = suggestNarrowing(
    [
      { createdAt: "2026-04-29T10:00:00.000Z", pageKind: "ingredient" },
      { createdAt: "2026-04-29T10:00:00.000Z", pageKind: "ingredient" },
    ],
    "7d",
    "all",
    { limit: 1000, totalCount: 5000 },
  );
  // No span → no density, but the kind fallback still applies because
  // the kind chip is "all". projections: ingredient = 5000 → over cap,
  // so the suggester returns null.
  expect(
    sameInstant === null,
    "case 6c: expected null for a zero-span slice with no fitting kind",
  );
}

// 7) Stable selection: when a narrower range fits, the suggester
//    must prefer it over a kind chip (range narrowing keeps the
//    editor on every kind, which is the more transparent narrowing).
{
  const rows = buildRows(1000, 36, ["routine"]); // single-kind slice
  const suggestion = suggestNarrowing(rows, "7d", "all", {
    limit: 1000,
    totalCount: 4500,
  });
  expect(
    suggestion !== null && suggestion.kind === "range",
    "case 7: expected range suggestion to take priority over kind even on a single-kind slice",
  );
}

// ─────────────────────────────────────────────────────────────────────
// Report.
// ─────────────────────────────────────────────────────────────────────
if (failures.length > 0) {
  console.error("Shelf-click suggestion validation failed:");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(
  "Shelf-click suggestion validation passed (7 cases: range pick, range with unbounded view, no-fit fallback, kind fallback, pinned-kind null, edge cases, range-over-kind priority).",
);
