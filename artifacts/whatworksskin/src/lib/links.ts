// Cross-link resolution between concerns, ingredients, products,
// supplements, and routines. The catalogue JSON files use loose
// human-authored strings (e.g. "Azelaic acid 15% (Rx)") which need to
// be resolved to canonical slugs at build time so the templates can
// emit hrefs to the right detail page when — and only when — a brief
// for the referenced thing actually exists.
//
// All lookups are best-effort: an unresolved reference simply renders
// as plain text rather than a broken link.

import { getCollection } from "astro:content";
import {
  CONCERN_ALIASES,
  INGREDIENT_ALIASES,
  INGREDIENT_PROCEDURAL_DENY_KEYWORDS,
  PRODUCT_ALIASES,
  matchPhraseSlug,
  norm,
} from "./link-aliases";
import {
  buildProductIndex,
  resolveProductSlug,
  type ProductIndex,
} from "./product-resolver";
import {
  buildIngredientBacklinkIndex,
  buildProductBacklinkIndex,
  type BacklinkIndex,
  type Backlinks,
  type ConcernBacklink,
  type ConcernBacklinkInput,
  type RoutineBacklink,
  type RoutineBacklinkInput,
} from "./backlinks";
import {
  buildMentionedByIndex,
  type MentionedByEntry,
  type MentionedByIndex,
  type MentionedByInput,
} from "./mentioned-by";
import {
  buildIngredientCards,
  type IngredientCard,
  type RelatedIngredientBrief,
  type RelatedIngredientRef,
} from "./related-ingredients";

export type { Backlinks, BacklinkIndex, ConcernBacklink, RoutineBacklink };
export {
  buildIngredientBacklinkIndex,
  buildProductBacklinkIndex,
} from "./backlinks";
export type { MentionedByEntry } from "./mentioned-by";
export type {
  IngredientCard,
  RelatedIngredientRef,
} from "./related-ingredients";

export { norm };

// --------------------------------------------------------------------
// Products
//
// The pure index builder + cascade live in `./product-resolver` so
// they can be exercised from a Node script (`scripts/test-product-resolver.ts`)
// without pulling in `astro:content`. This module just feeds the
// builder the live products collection and caches the index per build.
// --------------------------------------------------------------------

let _productIndex: Promise<ProductIndex> | null = null;
function productIndex(): Promise<ProductIndex> {
  if (_productIndex) return _productIndex;
  _productIndex = (async () => {
    const all = await getCollection("products");
    return buildProductIndex(
      all.map((p) => ({
        slug: p.data.slug,
        brand: p.data.brand,
        name: p.data.name,
      })),
    );
  })();
  return _productIndex;
}

/**
 * Resolve a brand+name pair (as authored in a concern, routine, or
 * supplement shelf entry) to the slug of an existing product brief.
 * Returns `undefined` when no brief exists yet. The four-step cascade
 * (exact tuple → in-brand norm equality → in-brand substring →
 * curated `PRODUCT_ALIASES` fall-back) lives in
 * `resolveProductSlug` so it can be unit-tested in isolation.
 */
export async function findProductSlug(
  brand?: string | null,
  name?: string | null,
): Promise<string | undefined> {
  if (!brand || !name) return undefined;
  const idx = await productIndex();
  return resolveProductSlug(idx, PRODUCT_ALIASES, brand, name);
}

// --------------------------------------------------------------------
// Ingredients
// --------------------------------------------------------------------

type IngredientIndex = {
  byNameNorm: Map<string, string>;
  phrases: { phrase: string; slug: string }[];
};

let _ingIndex: Promise<IngredientIndex> | null = null;
function ingredientIndex(): Promise<IngredientIndex> {
  if (_ingIndex) return _ingIndex;
  _ingIndex = (async () => {
    const all = await getCollection("ingredients");
    const byNameNorm = new Map<string, string>();
    const phrases: { phrase: string; slug: string }[] = [];
    for (const e of all) {
      const slug = e.data.slug;
      const nameN = norm(e.data.name);
      byNameNorm.set(nameN, slug);
      phrases.push({ phrase: nameN, slug });
      for (const a of INGREDIENT_ALIASES[slug] ?? []) {
        const an = norm(a);
        if (!byNameNorm.has(an)) byNameNorm.set(an, slug);
        phrases.push({ phrase: an, slug });
      }
    }
    // Longest-phrase-wins so "hyaluronic acid" beats a future "ha".
    phrases.sort((a, b) => b.phrase.length - a.phrase.length);
    return { byNameNorm, phrases };
  })();
  return _ingIndex;
}

/**
 * Resolve a curated list of ingredient references (as authored in a
 * brief's `relatedIngredients` field) to display-ready cards. Thin
 * wrapper around the pure `buildIngredientCards` builder so the live
 * site uses the same code path as the contract test in
 * `scripts/test-related-ingredients.ts`.
 */
export async function getIngredientCards(
  refs: readonly RelatedIngredientRef[] | undefined | null,
): Promise<IngredientCard[]> {
  if (!refs || refs.length === 0) return [];
  const all = await getCollection("ingredients");
  const briefs: RelatedIngredientBrief[] = all.map((e) => ({
    slug: e.data.slug,
    name: e.data.name,
    tier: e.data.tier,
    eyebrowKicker: e.data.eyebrowKicker,
  }));
  return buildIngredientCards(refs, briefs);
}

// --------------------------------------------------------------------
// Mentioned-by (inverse `relatedIngredients` graph)
//
// The pure inverse-graph builder lives in `./mentioned-by` so it can
// be exercised from a Node script (`scripts/test-mentioned-by.ts`)
// without pulling in `astro:content`. This module just feeds it the
// live ingredient collection and caches the result per build.
// --------------------------------------------------------------------

let _mentionedByIndex: Promise<MentionedByIndex> | null = null;

function mentionedByIndex(): Promise<MentionedByIndex> {
  if (_mentionedByIndex) return _mentionedByIndex;
  _mentionedByIndex = (async () => {
    const all = await getCollection("ingredients");
    const briefs: MentionedByInput[] = all.map((e) => ({
      slug: e.data.slug,
      name: e.data.name,
      tier: e.data.tier,
      relatedIngredients: e.data.relatedIngredients,
    }));
    return buildMentionedByIndex(briefs);
  })();
  return _mentionedByIndex;
}

/**
 * Inverse of the curated `relatedIngredients` graph: returns every
 * other ingredient brief whose own `relatedIngredients` list names the
 * given slug. Used to surface intentional one-way picks (e.g. the long
 * tail of `X → niacinamide`) so readers landing on a hub ingredient
 * don't dead-end when its 4 reserved curated slots are full.
 *
 * Computed once per build and cached. Caller is responsible for
 * filtering out entries that are already on the curated grid.
 */
export async function getIngredientMentionedBy(
  ingredientSlug: string,
): Promise<MentionedByEntry[]> {
  const idx = await mentionedByIndex();
  return idx.get(ingredientSlug) ?? [];
}

/**
 * Resolve a free-form ingredient string (e.g. "Azelaic acid 15% (Rx)",
 * "Centella / madecassoside", "Vitamin C") to the slug of an existing
 * ingredient brief, or `undefined` when no brief matches.
 */
export async function findIngredientSlug(
  text?: string | null,
): Promise<string | undefined> {
  if (!text) return undefined;
  const idx = await ingredientIndex();
  return matchPhraseSlug(idx, text, 3, INGREDIENT_PROCEDURAL_DENY_KEYWORDS);
}

// --------------------------------------------------------------------
// Concerns
// --------------------------------------------------------------------

type ConcernIndex = {
  byNameNorm: Map<string, string>;
  phrases: { phrase: string; slug: string }[];
};

let _concernIndex: Promise<ConcernIndex> | null = null;
function concernIndex(): Promise<ConcernIndex> {
  if (_concernIndex) return _concernIndex;
  _concernIndex = (async () => {
    const all = await getCollection("concerns");
    const byNameNorm = new Map<string, string>();
    const phrases: { phrase: string; slug: string }[] = [];
    for (const e of all) {
      const slug = e.data.slug;
      const nameN = norm(e.data.name);
      byNameNorm.set(nameN, slug);
      phrases.push({ phrase: nameN, slug });
      const slugAsPhrase = norm(slug.replace(/-/g, " "));
      phrases.push({ phrase: slugAsPhrase, slug });
      for (const a of CONCERN_ALIASES[slug] ?? []) {
        const an = norm(a);
        if (!byNameNorm.has(an)) byNameNorm.set(an, slug);
        phrases.push({ phrase: an, slug });
      }
    }
    phrases.sort((a, b) => b.phrase.length - a.phrase.length);
    return { byNameNorm, phrases };
  })();
  return _concernIndex;
}

export async function findConcernSlug(
  text?: string | null,
): Promise<string | undefined> {
  if (!text) return undefined;
  const idx = await concernIndex();
  return matchPhraseSlug(idx, text, 4);
}

// --------------------------------------------------------------------
// Back-link aggregation
//
// The pure index builders, types, and `Backlinks` shape live in
// `./backlinks` so they can be exercised from a Node script without
// pulling in `astro:content`. This module just wires them up to the
// live collections and caches the result per build.
// --------------------------------------------------------------------

const EMPTY_BACKLINKS: Backlinks = Object.freeze({
  concerns: Object.freeze([]) as unknown as ConcernBacklink[],
  routines: Object.freeze([]) as unknown as RoutineBacklink[],
}) as Backlinks;

// Precomputed back-link maps. Each index page used to call
// `getIngredientBacklinks` / `getProductBacklinks` once per card,
// and each helper re-walked every concern × routine — so an N-card
// index ran in O(N · concerns · routines · rows). We now walk concerns
// and routines exactly once per build and bucket every reference by the
// slug it resolves to; per-slug lookups become O(1).
let _ingredientBacklinks: Promise<BacklinkIndex> | null = null;
let _productBacklinks: Promise<BacklinkIndex> | null = null;

function ingredientBacklinkIndex(): Promise<BacklinkIndex> {
  if (_ingredientBacklinks) return _ingredientBacklinks;
  _ingredientBacklinks = (async () => {
    const [concerns, routines] = await Promise.all([
      getCollection("concerns"),
      getCollection("routines"),
    ]);
    return buildIngredientBacklinkIndex(
      concerns as unknown as ConcernBacklinkInput[],
      routines as unknown as RoutineBacklinkInput[],
      findIngredientSlug,
    );
  })();
  return _ingredientBacklinks;
}

function productBacklinkIndex(): Promise<BacklinkIndex> {
  if (_productBacklinks) return _productBacklinks;
  _productBacklinks = (async () => {
    const [concerns, routines] = await Promise.all([
      getCollection("concerns"),
      getCollection("routines"),
    ]);
    return buildProductBacklinkIndex(
      concerns as unknown as ConcernBacklinkInput[],
      routines as unknown as RoutineBacklinkInput[],
      findProductSlug,
    );
  })();
  return _productBacklinks;
}

/**
 * Find every concern and routine that references the given ingredient
 * slug — used by `IngredientBrief` to render a "Where it appears"
 * back-link section, and by the catalogue index to render coverage
 * badges. Backed by a build-time index so calling this once per
 * catalogue card stays O(N) overall.
 */
export async function getIngredientBacklinks(
  ingredientSlug: string,
): Promise<Backlinks> {
  const idx = await ingredientBacklinkIndex();
  return idx.get(ingredientSlug) ?? EMPTY_BACKLINKS;
}

/**
 * Find every concern and routine that references the given product
 * slug — used by `ProductBrief` to render a "Where it appears"
 * back-link section so a product brief can lead readers back to the
 * concerns it solves and the routines that include it. Backed by the
 * same build-time index pattern as the ingredient helper above.
 */
export async function getProductBacklinks(
  productSlug: string,
): Promise<Backlinks> {
  const idx = await productBacklinkIndex();
  return idx.get(productSlug) ?? EMPTY_BACKLINKS;
}
