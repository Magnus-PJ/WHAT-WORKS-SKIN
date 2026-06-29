/**
 * Validate that every ingredient name listed on a catalogued product
 * either resolves to an ingredient slug via the matchers in
 * `_links.tsx`, or is clearly an unrelated formulation ingredient
 * (preservatives, vehicles, fragrance, etc.).
 *
 * The script fails when an ingredient name has no matcher AND looks
 * like a known ingredient that already has a brief page — i.e. a
 * misspelling, a new formulation of an existing ingredient, or a
 * matcher we forgot to add. This is the exact regression we want to
 * catch automatically: a future product mentioning "niacinimide" or
 * "Vitamin-C" with no matcher would silently lose its cross-link.
 *
 * Run via: pnpm --filter @workspace/mockup-sandbox run validate:ingredients
 */

import {
  PRODUCTS,
  INGREDIENTS,
  ingredientNameFor,
  slugForIngredientName,
} from "../src/components/mockups/evidently/_links";

// Per-slug list of distinctive tokens we expect to see in any
// ingredient name that should resolve to that slug. Built from the
// slug + display name, then filtered down to tokens that are unique
// enough to identify the ingredient on their own. Generic chemistry
// words ("acid", "oxide", "zinc", "iron"…) are dropped because they
// appear in many unrelated formulation ingredients (Zinc PCA, Iron
// oxides, propylene glycol, etc.) and would produce false positives.
//
// A slug may map to either:
//   - one or more `singles` — distinctive single tokens, OR
//   - a `phrase` — a list of tokens that must all appear (used for
//     ingredients whose individual tokens are too generic to stand
//     alone, e.g. "zinc oxide", "benzoyl peroxide").
const GENERIC_TOKENS = new Set([
  "acid", "acids", "the", "and", "for", "with", "vit", "vitamin",
  "oil", "extract", "complex", "salt", "ester", "form", "free", "low",
  "high", "oxide", "oxides", "zinc", "iron", "copper", "signal",
  "filter", "filters", "peptides", "peptide",
]);

const MIN_DISTINCTIVE_LEN = 7;

type SlugKeyword =
  | { kind: "single"; token: string }
  | { kind: "phrase"; tokens: string[] };

function tokensOf(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function keywordsFor(slug: string): SlugKeyword[] {
  const allTokens = new Set<string>([
    ...slug.split("-"),
    ...tokensOf(ingredientNameFor(slug) ?? ""),
  ]);
  const distinctive = [...allTokens].filter(
    (t) => t.length >= MIN_DISTINCTIVE_LEN && !GENERIC_TOKENS.has(t),
  );
  if (distinctive.length > 0) {
    return distinctive.map((t) => ({ kind: "single", token: t }));
  }
  // Fall back to a phrase made of the slug's parts (excluding very
  // generic tokens). Requires every token to appear in the ingredient
  // name to count as a hit.
  const phraseTokens = slug
    .split("-")
    .filter((t) => t.length >= 4 && !GENERIC_TOKENS.has(t));
  if (phraseTokens.length === 0) {
    // Nothing distinctive to compare against — give up on this slug.
    return [];
  }
  return [{ kind: "phrase", tokens: phraseTokens }];
}

const KEYWORDS_BY_SLUG: Record<string, SlugKeyword[]> = {};
for (const slug of Object.keys(INGREDIENTS)) {
  KEYWORDS_BY_SLUG[slug] = keywordsFor(slug);
}

// Classic Levenshtein distance — small enough that a direct DP table
// is fine for our tiny inputs.
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const prev = new Array(b.length + 1);
  const curr = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
  }
  return prev[b.length];
}

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 4);
}

// Tolerated edit distance scales with keyword length: longer words
// get more slack but never more than 2 (which is enough for the kinds
// of typos we're trying to catch — duplicated/missing/swapped letters).
function tolerance(keyword: string): number {
  // Strict: only allow distance 2 for fairly long keywords, otherwise
  // we start matching distinct chemicals that share a Greek/Latin
  // stem (e.g. "glycol" in propylene glycol vs "glycolic" in
  // glycolic acid — same root, very different ingredients).
  if (keyword.length >= 10) return 2;
  if (keyword.length >= 6) return 1;
  return 0;
}

type Suspect = {
  product: string;
  ingredient: string;
  resemblesSlug: string;
  reason: string;
  rank: number; // lower is "more suspicious"
};

function bestSingleMatch(
  token: string,
  keyword: string,
): { distance: number } | null {
  const tol = tolerance(keyword);
  if (Math.abs(token.length - keyword.length) > tol) return null;
  const d = levenshtein(token, keyword);
  return d <= tol ? { distance: d } : null;
}

const suspects: Suspect[] = [];

for (const product of PRODUCTS) {
  if (!product.ingredients) continue;
  for (const raw of product.ingredients) {
    if (slugForIngredientName(raw) !== null) continue;

    const tokens = tokenize(raw);
    let bestForThisName: Suspect | null = null;

    for (const slug of Object.keys(KEYWORDS_BY_SLUG)) {
      for (const kw of KEYWORDS_BY_SLUG[slug]) {
        if (kw.kind === "single") {
          for (const tok of tokens) {
            const hit = bestSingleMatch(tok, kw.token);
            if (!hit) continue;
            const reason =
              `token "${tok}" ≈ "${kw.token}" (distance ${hit.distance})`;
            if (!bestForThisName || hit.distance < bestForThisName.rank) {
              bestForThisName = {
                product: `${product.brand} — ${product.name}`,
                ingredient: raw,
                resemblesSlug: slug,
                reason,
                rank: hit.distance,
              };
            }
          }
        } else {
          // Phrase: every phrase token must approximately appear in
          // the ingredient name's tokens.
          let totalDistance = 0;
          const matchedTokens: string[] = [];
          let ok = true;
          for (const phraseTok of kw.tokens) {
            let bestForPhraseTok: { tok: string; d: number } | null = null;
            for (const tok of tokens) {
              const hit = bestSingleMatch(tok, phraseTok);
              if (hit && (!bestForPhraseTok || hit.distance < bestForPhraseTok.d)) {
                bestForPhraseTok = { tok, d: hit.distance };
              }
            }
            if (!bestForPhraseTok) { ok = false; break; }
            totalDistance += bestForPhraseTok.d;
            matchedTokens.push(`"${bestForPhraseTok.tok}"≈"${phraseTok}"`);
          }
          if (ok) {
            const reason = `phrase ${matchedTokens.join(" + ")} ` +
              `(total distance ${totalDistance})`;
            // Rank phrase hits worse than perfect single-token hits.
            const rank = totalDistance + 0.5;
            if (!bestForThisName || rank < bestForThisName.rank) {
              bestForThisName = {
                product: `${product.brand} — ${product.name}`,
                ingredient: raw,
                resemblesSlug: slug,
                reason,
                rank,
              };
            }
          }
        }
      }
    }

    if (bestForThisName) suspects.push(bestForThisName);
  }
}

if (suspects.length === 0) {
  const total = PRODUCTS.reduce((n, p) => n + (p.ingredients?.length ?? 0), 0);
  console.log(
    `✓ Ingredient matchers OK — checked ${total} ingredient strings ` +
      `across ${PRODUCTS.length} catalogued products.`,
  );
  process.exit(0);
}

console.error(
  `✗ Found ${suspects.length} ingredient name(s) with no matcher that ` +
    `look like an ingredient that already has a brief page.\n` +
    `   Either add a matcher in artifacts/mockup-sandbox/src/components/` +
    `mockups/evidently/_links.tsx, or correct the spelling on the ` +
    `product page.\n`,
);
for (const s of suspects) {
  console.error(
    `  • "${s.ingredient}"\n` +
      `      in:        ${s.product}\n` +
      `      resembles: ${s.resemblesSlug} (${s.reason})`,
  );
}
process.exit(1);
