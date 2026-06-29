// Pure cascade for resolving a free-form (brand, name) pair to the slug
// of an existing product brief. The runtime wrapper in `./links.ts`
// builds the index from the live `astro:content` products collection
// and feeds it to `resolveProductSlug`; the contract test in
// `scripts/test-product-resolver.ts` drives the same builder + cascade
// against a synthetic product fixture so a future refactor of the
// matching order or the brand-substring rule can't silently change
// which brief the catalogue links to.

import {
  matchProductAliasSlug,
  norm,
  type ProductAliasMap,
} from "./link-aliases";

/** Minimal shape this module needs from a product brief. */
export type ProductBrief = {
  slug: string;
  brand: string;
  name: string;
};

/**
 * Pre-bucketed lookup tables built from a product brief list. Kept as
 * a plain object (not a class) so the runtime cache in `./links.ts`
 * and the test harness can construct it the same way.
 */
export type ProductIndex = {
  /** `${norm(brand)}::${norm(name)}` → slug, for the exact-tuple step. */
  byBrandName: Map<string, string>;
  /** `norm(brand)` → list of (slug, normalised name) for the in-brand
   * norm-equality and substring fallback steps. */
  byBrand: Map<string, { slug: string; nameNorm: string }[]>;
};

/**
 * Bucket every product brief by `(brand, name)` for the exact-tuple
 * lookup and by brand alone for the in-brand norm-equality / substring
 * fallback. Insertion order inside each per-brand list is preserved so
 * the substring step's "first match wins" behaviour is deterministic.
 */
export function buildProductIndex(
  briefs: readonly ProductBrief[],
): ProductIndex {
  const byBrandName = new Map<string, string>();
  const byBrand = new Map<string, { slug: string; nameNorm: string }[]>();
  for (const p of briefs) {
    const b = norm(p.brand);
    const n = norm(p.name);
    byBrandName.set(`${b}::${n}`, p.slug);
    const arr = byBrand.get(b) ?? [];
    arr.push({ slug: p.slug, nameNorm: n });
    byBrand.set(b, arr);
  }
  return { byBrandName, byBrand };
}

/**
 * Four-step cascade used by the runtime resolver and the cross-link
 * coverage report:
 *
 *   1. Exact `(norm(brand), norm(name))` tuple match.
 *   2. Within the brand's bucket, `nameNorm` equality.
 *   3. Within the brand's bucket, two-way substring match
 *      (`candidate.includes(name) || name.includes(candidate)`).
 *   4. Curated `PRODUCT_ALIASES` per-brand fall-back for editorial
 *      wording drift the substring step can't bridge (e.g. "Toleriane
 *      Hydrating" → `la-roche-posay-toleriane-double-repair`).
 *
 * Returns `undefined` for missing brand or name and for any
 * (brand, name) pair the cascade can't resolve.
 */
export function resolveProductSlug(
  idx: ProductIndex,
  aliases: ProductAliasMap,
  brand?: string | null,
  name?: string | null,
): string | undefined {
  if (!brand || !name) return undefined;
  const b = norm(brand);
  const n = norm(name);
  const exact = idx.byBrandName.get(`${b}::${n}`);
  if (exact) return exact;
  const candidates = idx.byBrand.get(b);
  if (candidates) {
    for (const c of candidates) {
      if (c.nameNorm === n) return c.slug;
    }
    for (const c of candidates) {
      if (c.nameNorm.includes(n) || n.includes(c.nameNorm)) return c.slug;
    }
  }
  return matchProductAliasSlug(aliases, brand, name);
}
