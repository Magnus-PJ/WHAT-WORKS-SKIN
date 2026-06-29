// Pure helper for the catalogue index's per-card "Paired in N briefs"
// caption. Extracted from `src/pages/ingredients/index.astro` so the
// rendering path the live page uses is the SAME code path exercised by
// `scripts/test-catalogue-paired-badge.ts` — a future template-side
// edit (e.g. accidentally rendering "Paired in 0 briefs" or flipping
// the singular/plural wording) regresses the contract test instead of
// silently shipping.
//
// Inputs are deliberately minimal: just the inverse-index count for
// the slug. The caller decides where that count comes from (in the
// live template, it's `pairedCounts.get(slug) ?? 0`, computed from
// `getIngredientMentionedBy(slug).length`).

export type PairedBadge = {
  /** The label string used as the card's `aria-label`. */
  label: string;
  /** Visible word after the count: "brief" or "briefs". */
  noun: "brief" | "briefs";
  /** Echo of the input count, for convenient template use. */
  count: number;
};

/**
 * Build the per-card paired-badge view-model from the inverse-index
 * length, or return `null` to indicate the badge must be omitted
 * entirely (NOT rendered as "Paired in 0 briefs").
 *
 * Invariants this helper locks in (covered by
 * `scripts/test-catalogue-paired-badge.ts`):
 *   • Omit-when-zero: `paired === 0` returns `null` so the badge is
 *     not rendered at all.
 *   • Singular wording: `paired === 1` reads "Paired in 1 brief"
 *     (singular noun), not "Paired in 1 briefs".
 *   • Plural wording: `paired >= 2` reads "Paired in N briefs".
 *   • The `count` echoed back equals the input exactly — the badge
 *     never lies about how many inbound mentions a brief has.
 */
export function buildPairedBadge(paired: number): PairedBadge | null {
  if (paired <= 0) return null;
  const noun: "brief" | "briefs" = paired === 1 ? "brief" : "briefs";
  return {
    label: `Paired in ${paired} ${noun}`,
    noun,
    count: paired,
  };
}
