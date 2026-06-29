// Suggestion helper for the editor shelf-click dashboard's truncation
// banner. When the API caps the response (`hasMore: true`) the banner
// already quotes the concrete miss ("most recent 1,000 of 12,438"),
// but the next step is ambiguous — editors have to eyeball the date
// chips and guess which one will shrink the window enough to fit
// under the cap. This module turns that guess into a one-click
// suggestion derived from the rows already on screen.
//
// Two strategies, in priority order:
//   1) "range"     — the largest built-in range strictly narrower
//                    than the current chip whose estimated click
//                    count is below the server's row cap. Estimated
//                    using the click density of the truncated slice
//                    that came back (rows / span-in-hours).
//   2) "pageKind"  — when no narrower built-in range fits (e.g. even
//                    Last 24 hours is over the cap) and the editor
//                    hasn't already pinned a kind chip, the kind
//                    whose share of the visible slice projects to a
//                    sub-cap count in the same window. Pre-selecting
//                    that kind in the chip filter narrows the dataset
//                    without forcing the editor to drill into a
//                    single guide.
//
// Returns `null` when nothing useful can be suggested (no rows yet,
// every kind still over the cap, single-instant slice, etc.) — the
// banner just keeps the existing "pick a tighter date range" copy in
// that case.
//
// Lives in its own module so the validation script in
// `scripts/validate-shelf-click-suggestion.ts` can exercise the logic
// without dragging the React component tree along.

export type SuggestionPageKind = "ingredient" | "routine" | "concern";

export type SuggestionRangeId = "24h" | "7d" | "30d" | "all";

export type SuggestionRange = {
  id: SuggestionRangeId;
  label: string;
  // `null` for "all recent" (no bounds sent server-side); the
  // suggester treats that as effectively infinite.
  hours: number | null;
};

// The dashboard's `RANGES` constant is duplicated here so the helper
// is self-contained and the validation script doesn't have to import
// from the component file. The lists must stay in sync (the Chip
// click handler uses the dashboard's copy); a static check at the
// bottom of `EditorShelfClicks.tsx` would be overkill — both lists
// are short and trivially compared by eye.
export const SUGGESTION_RANGES: ReadonlyArray<SuggestionRange> = [
  { id: "24h", label: "Last 24 hours", hours: 24 },
  { id: "7d", label: "Last 7 days", hours: 24 * 7 },
  { id: "30d", label: "Last 30 days", hours: 24 * 30 },
  { id: "all", label: "All recent", hours: null },
];

const PAGE_KIND_LABELS: Record<SuggestionPageKind, string> = {
  ingredient: "Ingredients",
  routine: "Routines",
  concern: "Concerns",
};

// Minimal row shape the suggester needs — pulled out of the full
// `ShelfClickRecord` so the validation script can build fixtures
// without re-declaring every field.
export type SuggestionRow = {
  createdAt: string;
  pageKind: SuggestionPageKind;
};

export type ShelfClickSuggestion =
  | {
      kind: "range";
      rangeId: SuggestionRangeId;
      label: string;
      // Estimated click count if the editor narrows to this range,
      // rounded to the nearest integer for display. Always strictly
      // less than `cap.limit`.
      estimate: number;
    }
  | {
      kind: "pageKind";
      pageKind: SuggestionPageKind;
      label: string;
      estimate: number;
    };

export type SuggestionCap = {
  // The server-applied row cap (echoed back as `limit` on the list
  // response). Suggestions must project below this number.
  limit: number;
  // True total of rows matching the request's filters, ignoring the
  // cap. Used to project per-kind counts back up to the full window.
  totalCount: number;
};

// Compute clicks-per-hour density from the truncated slice. We use
// the timestamp span of the rows that came back (newest minus oldest)
// rather than the chosen range's full window, because the slice is
// the most-recent N rows — its density reflects *recent* activity,
// which is what a narrower range would actually catch.
function densityPerHour(rows: ReadonlyArray<SuggestionRow>): number | null {
  if (rows.length < 2) return null;
  let minT = Number.POSITIVE_INFINITY;
  let maxT = Number.NEGATIVE_INFINITY;
  for (const r of rows) {
    const t = new Date(r.createdAt).getTime();
    if (!Number.isFinite(t)) continue;
    if (t < minT) minT = t;
    if (t > maxT) maxT = t;
  }
  if (!Number.isFinite(minT) || !Number.isFinite(maxT)) return null;
  const spanHours = (maxT - minT) / 3_600_000;
  if (spanHours <= 0) return null;
  return rows.length / spanHours;
}

function rangeHoursFor(id: SuggestionRangeId): number | null {
  const r = SUGGESTION_RANGES.find((x) => x.id === id);
  return r ? r.hours : null;
}

export function suggestNarrowing(
  rows: ReadonlyArray<SuggestionRow>,
  currentRange: SuggestionRangeId,
  currentKindFilter: SuggestionPageKind | "all",
  cap: SuggestionCap,
): ShelfClickSuggestion | null {
  if (rows.length === 0) return null;
  if (cap.limit <= 0) return null;

  // 1) Largest narrower built-in range that projects under the cap.
  const density = densityPerHour(rows);
  if (density !== null) {
    const currentHours = rangeHoursFor(currentRange);
    // "All recent" has no upper bound, so any bounded chip is a
    // narrowing of it; otherwise only chips with strictly fewer
    // hours qualify.
    const candidates = SUGGESTION_RANGES.filter((r) => {
      if (r.hours === null) return false;
      if (currentHours === null) return true;
      return r.hours < currentHours;
    }).sort((a, b) => (b.hours as number) - (a.hours as number));
    for (const r of candidates) {
      const hours = r.hours as number;
      const estimate = Math.round(density * hours);
      if (estimate > 0 && estimate < cap.limit) {
        return {
          kind: "range",
          rangeId: r.id,
          label: r.label,
          estimate,
        };
      }
    }
  }

  // 2) Pre-select a single page-kind chip. Only when the editor
  //    hasn't already pinned one — pivoting a pinned chip to a
  //    different kind would silently change what they're looking at.
  if (currentKindFilter !== "all") return null;

  const counts: Record<SuggestionPageKind, number> = {
    ingredient: 0,
    routine: 0,
    concern: 0,
  };
  for (const r of rows) counts[r.pageKind] += 1;

  const kindCandidates = (Object.keys(counts) as SuggestionPageKind[])
    .map((k) => ({
      kind: "pageKind" as const,
      pageKind: k,
      label: PAGE_KIND_LABELS[k],
      // Project the slice's per-kind share onto the full window's
      // total. Rounding can put a single-row kind below 1; clamp at
      // 1 so we don't recommend something we know has at least one
      // click in the window.
      estimate: Math.max(
        1,
        Math.round(cap.totalCount * (counts[k] / rows.length)),
      ),
    }))
    .filter((c) => counts[c.pageKind] > 0 && c.estimate < cap.limit)
    // Largest-but-still-fitting first, so the editor keeps the most
    // data on screen. Tie-break alphabetically for stable ordering
    // in tests.
    .sort(
      (a, b) =>
        b.estimate - a.estimate || a.pageKind.localeCompare(b.pageKind),
    );

  return kindCandidates[0] ?? null;
}
