// Pure inverse-graph builder for the "Mentioned by" / "Also paired
// with" section on every ingredient brief.
//
// Extracted from `links.ts` so the inverse-graph contract can be
// exercised by `scripts/test-mentioned-by.ts` against a synthetic
// fixture without booting Astro (i.e. without pulling in the
// `astro:content` virtual module that the rest of `links.ts` depends
// on). The runtime `mentionedByIndex()` wrapper in `links.ts` just
// calls `buildMentionedByIndex` with the live `getCollection`
// ingredient data and caches the result for the build.

export type IngredientTier = "A" | "B" | "C" | "D";

export type MentionedByEntry = {
  slug: string;
  name: string;
  tier: IngredientTier;
};

export type MentionedByIndex = Map<string, MentionedByEntry[]>;

/** Minimal shape consumed by the builder. Wider data (full brief
 * schemas) is fine — the builder only reads the listed fields. */
export type MentionedByInput = {
  slug: string;
  name: string;
  tier: IngredientTier;
  relatedIngredients?:
    | ReadonlyArray<string | { slug: string; sub?: string }>
    | null;
};

/**
 * Build the ingredient-slug → mentioned-by[] inverse index from every
 * brief's curated `relatedIngredients` graph.
 *
 * Invariants this function locks in (covered by
 * `scripts/test-mentioned-by.ts`):
 *   • Inverse-graph contract: every `A → B` curated link in any brief
 *     produces a `B ← A` entry in the index for `B`.
 *   • Self-links (`A → A`) are ignored — they would render as a card
 *     pointing back at the page the reader is already on.
 *   • Per-source dedup: if a brief's `relatedIngredients` lists the
 *     same target slug twice, only the first occurrence contributes.
 *   • Unknown / pre-publish slugs are dropped from the inverse index
 *     so the rendered list never points at a non-existent brief.
 *   • Within each per-target entry, sources are sorted alphabetically
 *     by name so the rendered list reads stably across builds.
 *
 * Note: the dedupe-against-curated-grid rule (if A curates B and B
 * curates A, then A is hidden from B's rendered mentioned-by list) is
 * applied by the renderer in `IngredientBrief.astro` against the set
 * of slugs already shown on the curated grid above. This builder
 * intentionally returns the full inverse — callers are responsible
 * for filtering.
 */
export function buildMentionedByIndex(
  briefs: readonly MentionedByInput[],
): MentionedByIndex {
  const known = new Set<string>();
  for (const b of briefs) known.add(b.slug);

  const idx: MentionedByIndex = new Map();
  for (const b of briefs) {
    const fromSlug = b.slug;
    const refs = b.relatedIngredients ?? [];
    const seen = new Set<string>();
    for (const ref of refs) {
      const targetSlug = typeof ref === "string" ? ref : ref?.slug;
      if (!targetSlug || targetSlug === fromSlug) continue;
      if (seen.has(targetSlug)) continue;
      seen.add(targetSlug);
      if (!known.has(targetSlug)) continue;
      let arr = idx.get(targetSlug);
      if (!arr) {
        arr = [];
        idx.set(targetSlug, arr);
      }
      arr.push({ slug: fromSlug, name: b.name, tier: b.tier });
    }
  }
  for (const arr of idx.values()) {
    arr.sort((a, b) => a.name.localeCompare(b.name));
  }
  return idx;
}

/**
 * Apply the dedupe-against-curated-grid rule: drop any mentioned-by
 * entry whose slug is already shown on the curated grid above. This
 * is the exact filter `IngredientBrief.astro` applies after calling
 * `getIngredientMentionedBy`, factored out here so the renderer and
 * `scripts/test-mentioned-by.ts` exercise the same code path — a
 * future change to the filter semantics gets caught by the contract
 * test instead of silently double-listing curated peers in the
 * rendered "Mentioned by" grid.
 */
export function filterRenderedMentionedBy(
  entries: readonly MentionedByEntry[] | undefined | null,
  renderedRelatedSlugs: ReadonlySet<string>,
): MentionedByEntry[] {
  if (!entries || entries.length === 0) return [];
  return entries.filter((m) => !renderedRelatedSlugs.has(m.slug));
}

/**
 * Visible-cap for the rendered "Mentioned by" / "Also paired with"
 * grid on every ingredient brief.
 *
 * Hub ingredients (niacinamide, salicylic-acid, …) accumulate a long
 * tail of inverse mentions as more briefs ship. Without a cap, the
 * section would dwarf the curated grid above and crowd out the
 * back-link "Where it appears" panel below. 12 = 4 full rows in the
 * 3-column desktop layout — scannable, and seats the largest current
 * hub without much overflow.
 *
 * Briefs at or under the cap render every entry inline with no
 * disclosure UI. Above the cap, the renderer keeps `MENTIONED_BY_CAP`
 * entries visible and hides the rest behind a CSS-only checkbox
 * toggle ("Show all N").
 *
 * Locked in by `scripts/test-mentioned-by-cap.ts` against synthetic
 * corpora with both shapes.
 */
export const MENTIONED_BY_CAP = 12;

export type MentionedByCapSplit = {
  visible: MentionedByEntry[];
  overflow: MentionedByEntry[];
  total: number;
  cap: number;
  hasOverflow: boolean;
  toggleLabel: string;
};

/**
 * Split a rendered mentioned-by list into the visible head and the
 * overflow tail according to `MENTIONED_BY_CAP`. The renderer in
 * `IngredientBrief.astro` consumes this verbatim so the cap contract
 * (visible head, overflow tail with the `mb-overflow` class, and the
 * "Show all N" toggle label) lives in one place — pinned by
 * `scripts/test-mentioned-by-cap.ts`.
 */
export function splitMentionedByForCap(
  entries: readonly MentionedByEntry[],
): MentionedByCapSplit {
  const total = entries.length;
  const visible = entries.slice(0, MENTIONED_BY_CAP);
  const overflow = entries.slice(MENTIONED_BY_CAP);
  return {
    visible,
    overflow,
    total,
    cap: MENTIONED_BY_CAP,
    hasOverflow: overflow.length > 0,
    toggleLabel: `Show all ${total}`,
  };
}
