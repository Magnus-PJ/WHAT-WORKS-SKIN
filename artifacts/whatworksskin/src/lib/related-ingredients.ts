// Pure helpers for the curated "Related ingredients" grid that
// renders under every ingredient brief.
//
// Extracted from `links.ts` so the card-resolution + sub-derivation
// contracts can be exercised by `scripts/test-related-ingredients.ts`
// against a synthetic fixture without booting Astro (i.e. without
// pulling in the `astro:content` virtual module that the rest of
// `links.ts` depends on). The runtime `getIngredientCards` wrapper
// in `links.ts` just calls these with the live `getCollection`
// ingredient data.

import { norm } from "./link-aliases";
import type { IngredientTier } from "./mentioned-by";

export type IngredientCard = {
  slug: string;
  name: string;
  tier: IngredientTier;
  sub: string;
};

/**
 * Authoring shape for a single entry in a brief's `relatedIngredients`
 * list: either a bare slug (auto-derived sub copy) or an
 * `{ slug, sub }` pair where `sub` overrides the auto-derived
 * descriptor under the rendered card.
 */
export type RelatedIngredientRef = string | { slug: string; sub: string };

/** Minimal shape consumed by `buildIngredientCards`. Wider data
 * (full brief schemas) is fine — the builder only reads the listed
 * fields. */
export type RelatedIngredientBrief = {
  slug: string;
  name: string;
  tier: IngredientTier;
  eyebrowKicker: string;
};

/**
 * Strip the "Ingredient · " prefix and the trailing variant segment
 * from an ingredient brief's `eyebrowKicker` so it can be re-used as
 * a short descriptor on a "Related ingredients" card. The trailing
 * segment is dropped when it duplicates the ingredient name (e.g.
 * "Ingredient · Synthetic Retinoid · Adapalene" → "Synthetic Retinoid"
 * for the Adapalene brief).
 */
export function deriveRelatedSub(eyebrow: string, name: string): string {
  const parts = eyebrow.split(/\s*·\s*/).filter((p) => p.trim().length > 0);
  while (parts.length > 0 && /^ingredient$/i.test(parts[0])) parts.shift();
  const nameN = norm(name);
  while (parts.length > 1) {
    const last = norm(parts[parts.length - 1]);
    if (
      last === nameN ||
      last.startsWith(nameN + " ") ||
      nameN.startsWith(last + " ") ||
      last.includes(nameN) ||
      nameN.includes(last)
    ) {
      parts.pop();
    } else {
      break;
    }
  }
  return parts.join(" · ");
}

/**
 * Resolve a curated list of ingredient references (as authored in a
 * brief's `relatedIngredients` field) to display-ready cards. Each
 * entry is either a bare slug (auto-derived sub) or an
 * `{ slug, sub }` pair where `sub` overrides the auto-derived
 * descriptor for that one card.
 *
 * Invariants this function locks in (covered by
 * `scripts/test-related-ingredients.ts`):
 *   • Unknown / pre-publish slugs in `refs` are dropped silently so
 *     a typo or pre-publish slug doesn't break the build.
 *   • Output order matches the input `refs` order — editors curate
 *     the grid in display order.
 *   • Per-card `sub` overrides win over the auto-derived value.
 *   • The auto-derived value comes from `deriveRelatedSub` against
 *     the resolved brief's `eyebrowKicker` and `name`.
 *   • `name` and `tier` come from the resolved brief.
 */
export function buildIngredientCards(
  refs: readonly RelatedIngredientRef[] | undefined | null,
  briefs: readonly RelatedIngredientBrief[],
): IngredientCard[] {
  if (!refs || refs.length === 0) return [];
  const bySlug = new Map(briefs.map((b) => [b.slug, b]));
  const out: IngredientCard[] = [];
  for (const ref of refs) {
    const slug = typeof ref === "string" ? ref : ref.slug;
    const override = typeof ref === "string" ? undefined : ref.sub;
    const data = bySlug.get(slug);
    if (!data) continue;
    out.push({
      slug,
      name: data.name,
      tier: data.tier,
      sub: override ?? deriveRelatedSub(data.eyebrowKicker, data.name),
    });
  }
  return out;
}
