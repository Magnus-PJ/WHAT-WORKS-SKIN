// ─────────────────────────────────────────────────────────────────────────
// Pure helpers for the thin-content detector.
//
// These were extracted from `scripts/port-content.mjs` so the same helpers
// the content port uses to flag thin / partially thin / expected-skinny
// pages can be exercised against in-memory fixtures by
// `scripts/validate-thin-content.ts` without re-running the full port.
//
// The disk-walking `findThinPages` in port-content.mjs is now a thin
// wrapper around `summariseThinPages` here: it reads the per-kind output
// directories and feeds the parsed JSON entries through the same pure
// classifier the test suite uses.
// ─────────────────────────────────────────────────────────────────────────

export const BODY_SECTIONS = {
  concerns: ["triggers", "ingredients", "products", "phases", "protocolAm", "protocolPm", "avoid", "supplements", "faq"],
  routines: ["steps", "timeline", "forbidden"],
  supplements: ["evidence", "forms", "faq"],
  products: ["scoreBreakdown", "ingredients", "useCases", "alts", "facts", "faq", "sources"],
  // trend-watch is special-cased: a verdicts array of placeholder rows
  // with empty `body` strings counts as thin, and a mix of populated and
  // placeholder rows counts as partially thin (see
  // classifyTrendWatchVerdicts below).
  "trend-watch": ["verdicts"],
};

export const EXPECTED_SKINNY = {
  "trend-watch": new Set(["issue-007", "issue-014"]),
};

// Classifies a trend-watch issue's verdicts as either fully populated,
// fully empty (placeholder rows from the catalogue fallback), or a mix.
// The mixed case ("partial") is the one a bare "any verdict has a body"
// check would otherwise let slip through unnoticed.
//
// Returns:
//   { state: "full",    emptyIndices: [] }
//   { state: "partial", emptyIndices: [<verdict index>, ...] }
//   { state: "thin",    emptyIndices: [<verdict index>, ...] }
export function classifyTrendWatchVerdicts(data) {
  const v = Array.isArray(data?.verdicts) ? data.verdicts : [];
  const emptyIndices = [];
  let filled = 0;
  v.forEach((row, i) => {
    // `body` can be a plain string (the historical shape) or a
    // structured rich-text array of segments (`string | { text, kind,
    // slug }`). Both forms count as filled when they carry any text;
    // only an absent / empty body marks the verdict as a placeholder
    // row from the catalogue fallback.
    const body = row && row.body;
    let hasText = false;
    if (typeof body === "string") {
      hasText = body.trim().length > 0;
    } else if (Array.isArray(body)) {
      hasText = body.some((seg) => {
        if (typeof seg === "string") return seg.trim().length > 0;
        if (seg && typeof seg === "object" && typeof seg.text === "string") {
          return seg.text.trim().length > 0;
        }
        return false;
      });
    }
    if (hasText) {
      filled += 1;
    } else {
      emptyIndices.push(i);
    }
  });
  if (v.length === 0 || filled === 0) return { state: "thin", emptyIndices };
  if (emptyIndices.length === 0) return { state: "full", emptyIndices: [] };
  return { state: "partial", emptyIndices };
}

export function isNonEmptyBody(value) {
  if (value === undefined || value === null) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

/**
 * Aggregates the per-kind thin / partially-thin / expected-skinny buckets
 * from a list of `{ kind, slug, data }` entries. Entries for kinds not in
 * `BODY_SECTIONS` are ignored.
 *
 * The shape mirrors what `findThinPages` returns and what the printable
 * console report + `thin-content-report.json` consume.
 *
 * @typedef {"concerns" | "routines" | "supplements" | "products" | "trend-watch"} ThinKind
 * @typedef {{ thin: string[], partiallyThin: { slug: string, emptyIndices: number[] }[], expectedSkinny: string[] }} ThinKindReport
 * @typedef {Record<ThinKind, ThinKindReport>} ThinReport
 *
 * @param {{ kind: string, slug: string, data: any }[]} entries
 * @returns {ThinReport}
 */
export function summariseThinPages(entries) {
  const report = {};
  for (const kind of Object.keys(BODY_SECTIONS)) {
    report[kind] = { thin: [], partiallyThin: [], expectedSkinny: [] };
  }
  for (const { kind, slug, data } of entries) {
    if (!report[kind]) continue;
    const exceptions = EXPECTED_SKINNY[kind] || new Set();
    if (exceptions.has(slug)) {
      report[kind].expectedSkinny.push(slug);
      continue;
    }
    if (kind === "trend-watch") {
      const { state, emptyIndices } = classifyTrendWatchVerdicts(data);
      if (state === "thin") report[kind].thin.push(slug);
      else if (state === "partial") report[kind].partiallyThin.push({ slug, emptyIndices });
    } else {
      const hasBody = BODY_SECTIONS[kind].some((k) => isNonEmptyBody(data?.[k]));
      if (!hasBody) report[kind].thin.push(slug);
    }
  }
  // Keep slugs deterministic (mirrors the readdirSync().sort() in the
  // disk walker so JSON snapshots stay stable).
  for (const kind of Object.keys(report)) {
    report[kind].thin.sort();
    report[kind].expectedSkinny.sort();
    report[kind].partiallyThin.sort((a, b) => a.slug.localeCompare(b.slug));
  }
  return report;
}
