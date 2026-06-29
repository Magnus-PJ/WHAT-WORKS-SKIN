// Pure data + helpers shared between the runtime cross-link resolver
// (`./links.ts`, which runs inside Astro and reads collections via
// `astro:content`) and the build-time cross-link coverage report
// (`scripts/report-cross-link-coverage.ts`, which reads the same
// content as raw JSON via Node fs). Keeping the alias maps and the
// normaliser in one module means the report and the renderer can
// never drift on what counts as a match.

/** Lower-case, strip diacritics and punctuation, collapse whitespace. */
export function norm(s: string | undefined | null): string {
  return (s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Remove concentration / dosage suffixes from an editorial ingredient
 * string so the surviving tokens can match an ingredient brief's
 * canonical name.
 *
 * Editorial shorthand routinely tags an ingredient name with its
 * strength ("Azelaic acid 15%", "Tretinoin 0.025% cream",
 * "L-ascorbic acid 10–15%") and we want those to resolve the same as
 * the bare molecule name. The matcher's word-boundary scan often
 * handles these already, but stripping the percentages first lets the
 * exact-name lookup hit too and keeps the matcher robust to minor
 * editorial wording drift (e.g. "Azelaic 15 %", "Vitamin C 10 %").
 */
export function stripConcentrations(s: string): string {
  return (s ?? "")
    // Ranges like "10–15%", "0.025–0.05%", "240–480 mg/d".
    .replace(
      /\d+(?:[.,]\d+)?\s*[-–—]\s*\d+(?:[.,]\d+)?\s*(?:%|mg(?:\s*\/\s*d)?)/gi,
      " ",
    )
    // Single concentrations like "15%", "0.1%", "100 mg/d".
    .replace(/\d+(?:[.,]\d+)?\s*(?:%|mg(?:\s*\/\s*d)?)/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Pull the first `(...)` clause out of an editorial string and return
 * the text outside the parens together with the text inside. Returns
 * `null` when no balanced paren clause is present. Used by
 * `matchPhraseSlug` to try the outside text alone (so
 * "PIH (post-inflammatory)" → "PIH" → `pih`) and an
 * "<inside> <outside>" reversal (so "Acne (comedonal)" →
 * "comedonal Acne" → `comedonal-acne`) as fallback variants.
 */
function firstParenthetical(
  s: string,
): { outside: string; inside: string } | null {
  const m = (s ?? "").match(/^([^()]*)\(([^()]+)\)([^()]*)$/);
  if (!m) return null;
  const outside = `${m[1]} ${m[3]}`.replace(/\s+/g, " ").trim();
  const inside = m[2].trim();
  if (!outside || !inside) return null;
  return { outside, inside };
}

// --------------------------------------------------------------------
// Shared phrase resolver
// --------------------------------------------------------------------

/**
 * Phrase index shape shared by the runtime resolver (`./links.ts`)
 * and the build-time coverage report. `byNameNorm` is the exact
 * normalised-string lookup; `phrases` is the longest-first scan list
 * (each canonical name + its aliases).
 */
export type PhraseIndex = {
  byNameNorm: Map<string, string>;
  phrases: { phrase: string; slug: string }[];
};

function scanPhraseIndex(
  idx: PhraseIndex,
  t: string,
  minPhraseLen: number,
): string | undefined {
  if (!t) return undefined;
  if (idx.byNameNorm.has(t)) return idx.byNameNorm.get(t);
  for (const { phrase, slug } of idx.phrases) {
    if (phrase.length < minPhraseLen) continue;
    const re = new RegExp(`(^|\\W)${escapeRegExp(phrase)}(\\W|$)`);
    if (re.test(t)) return slug;
  }
  return undefined;
}

/**
 * Procedural shorthand that, when present in an editorial reference,
 * means the row describes a clinic procedure rather than the topical
 * ingredient the matcher would otherwise resolve it to. Passed to
 * `matchPhraseSlug` as a deny-list when resolving ingredient
 * references so e.g. "Hyaluronic filler (clinic)" never wires to the
 * `hyaluronic-acid` serum brief, even if a future alias broadening
 * (see task #135) registered "hyaluronic" as a bare-molecule
 * shorthand.
 *
 * Keywords are matched on the normalised input (lower-case, punctuation
 * stripped) with word boundaries, so "(clinic)" matches via its bare
 * word "clinic" and "Multi-Acid Peel" matches via "peel". Keep this
 * list small and unambiguous — every keyword here will block the
 * matcher whenever it appears anywhere in the reference text.
 *
 * Trade-off worth monitoring: `clinic` is intentionally broad. Today
 * every editorial use of the bare word "clinic" inside an ingredient
 * reference is a procedural row (always the `(clinic)` suffix). If a
 * future editorial pattern uses "clinic" in a non-procedural context
 * (e.g. "clinic-prescribed tretinoin" inside an `ingredients[].name`
 * cell), the matcher will start under-resolving those rows. The fix
 * is to either rephrase the editorial label or replace `clinic` here
 * with a phrase-level guard (e.g. require " (clinic)" specifically)
 * — but that change should be driven by a real false-negative case,
 * not pre-emptively, since the current rule keeps the guard simple
 * and intuitive for editors.
 */
export const INGREDIENT_PROCEDURAL_DENY_KEYWORDS: readonly string[] = [
  "filler",
  "fillers",
  "injection",
  "injections",
  "injectable",
  "injectables",
  "laser",
  "peel",
  "peels",
  "microneedling",
  "clinic",
];

function hasDenyKeyword(tNorm: string, keywords: readonly string[]): boolean {
  if (!tNorm) return false;
  for (const k of keywords) {
    const kn = norm(k);
    if (!kn) continue;
    const re = new RegExp(`(^|\\W)${escapeRegExp(kn)}(\\W|$)`);
    if (re.test(tNorm)) return true;
  }
  return false;
}

/**
 * `true` when `text` references a clinic procedure that the ingredient
 * matcher should refuse to resolve. Re-uses the same word-boundary
 * scan used inside `matchPhraseSlug` so callers (e.g. the cross-link
 * coverage report) can classify these references consistently — they
 * are "no brief yet" entries, never matcher gaps, because the deny
 * list is intentionally blocking them.
 */
export function isProceduralReference(
  text: string | null | undefined,
): boolean {
  if (!text) return false;
  return hasDenyKeyword(norm(text), INGREDIENT_PROCEDURAL_DENY_KEYWORDS);
}

/**
 * Resolve a free-form text reference to a slug using a phrase index.
 * Tries an exact normalised match first, then a longest-phrase scan
 * with word-boundary regex; if neither hits, retries against a
 * percentage-stripped form of the input so editorial shorthand like
 * "Azelaic 15%" resolves the same as "Azelaic acid".
 *
 * If concentration-stripping still doesn't hit and the reference
 * carries a `(...)` parenthetical clause, two more variants are
 * tried: the text outside the parens alone (so "PIH (post-inflammatory)"
 * → "PIH" → `pih`) and the inside-then-outside reversal
 * (so "Acne (comedonal)" → "comedonal Acne" → `comedonal-acne`).
 * The deny-keyword guard is re-applied to every variant so a clinic
 * procedure like "Hyaluronic filler (clinic)" stays blocked even
 * after the parens are stripped away.
 *
 * `denyKeywords` is an optional guard: if any of the keywords appears
 * as a whole word in the (normalised) input, the matcher refuses to
 * resolve the reference and returns `undefined`. This lets ingredient
 * resolution opt into `INGREDIENT_PROCEDURAL_DENY_KEYWORDS` so a row
 * like "Hyaluronic filler (clinic)" is never confused with a topical
 * brief, while concern resolution (which uses procedural shorthand
 * like "post peel" / "post laser" deliberately) leaves it off.
 */
export function matchPhraseSlug(
  idx: PhraseIndex,
  text: string | null | undefined,
  minPhraseLen: number,
  denyKeywords?: readonly string[],
): string | undefined {
  if (!text) return undefined;
  const tNorm = norm(text);
  if (denyKeywords && denyKeywords.length > 0 && hasDenyKeyword(tNorm, denyKeywords)) {
    return undefined;
  }
  const direct = scanPhraseIndex(idx, tNorm, minPhraseLen);
  if (direct) return direct;

  const tryVariant = (raw: string): string | undefined => {
    const n = norm(raw);
    if (!n || n === tNorm) return undefined;
    if (denyKeywords && denyKeywords.length > 0 && hasDenyKeyword(n, denyKeywords)) {
      return undefined;
    }
    return scanPhraseIndex(idx, n, minPhraseLen);
  };

  const concResult = tryVariant(stripConcentrations(text));
  if (concResult) return concResult;

  // Parenthetical handling: editorial shorthand like "Acne (comedonal)"
  // or "PIH (post-inflammatory)" wraps the specific term inside a
  // category prefix. Try the outside text on its own first (so "PIH"
  // wins over a token-overlap-only match on "inflammatory"), then
  // "<inside> <outside>" reversed so "Acne (comedonal)" can resolve
  // via the existing "comedonal acne" alias.
  const parens = firstParenthetical(text);
  if (parens) {
    const outsideResult = tryVariant(parens.outside);
    if (outsideResult) return outsideResult;
    const reversedResult = tryVariant(`${parens.inside} ${parens.outside}`);
    if (reversedResult) return reversedResult;
  }

  return undefined;
}

// Manual aliases that improve recall on the loose strings used by
// concern / routine / product rows ("Centella / madecassoside",
// "Vitamin C", "Differin"). Slugs that don't appear here just match on
// their canonical `name` from the ingredient brief.
export const INGREDIENT_ALIASES: Record<string, string[]> = {
  centella: ["centella", "madecassoside", "cica"],
  ceramides: ["ceramide", "ceramides"],
  "l-ascorbic-acid": ["l ascorbic acid", "ascorbic acid", "vitamin c"],
  "peptides-copper": [
    "copper peptide",
    "copper peptides",
    "ghk cu",
    // Bare "Peptides" defaults to the copper-peptide brief — that's
    // the brief the editorial graph treats as the canonical peptides
    // entry (signal peptides are referenced explicitly as "signal
    // peptides", "matrixyl", or "argireline"). Catches the bare
    // pairings[].with = "Peptides" wording in retinol.json.
    "peptides",
  ],
  "peptides-signal": [
    "signal peptide",
    "signal peptides",
    "matrixyl",
    "argireline",
  ],
  "uv-filters": [
    "uv filter",
    "uv filters",
    "sunscreen filter",
    // "Mineral filters" lands here too — the uv-filters brief
    // covers both organic and mineral families, so the bare
    // pairings phrasing resolves to it rather than to a missing
    // "mineral-filters" brief.
    "mineral filters",
  ],
  retinol: ["retinol", "retinaldehyde", "retinyl"],
  tretinoin: [
    "tretinoin",
    "all trans retinoic acid",
    "retinoic acid",
    // Common editorial shorthand ("Tret 0.025% cream") and the
    // generic-Indian-pharma brand name "A-Ret" used in some product
    // briefs.
    "tret",
    "a ret",
  ],
  adapalene: ["adapalene", "differin"],
  "benzoyl-peroxide": ["benzoyl peroxide", "bpo"],
  "salicylic-acid": [
    "salicylic acid",
    "bha",
    // LHA = lipohydroxy acid = capryloyl salicylic acid, the
    // La Roche-Posay-branded salicylic-acid derivative. Both
    // halves of "LHA (capryloyl salicylic)" resolve to the
    // parent salicylic-acid brief — same molecule family.
    "lha",
    "capryloyl salicylic",
  ],
  "glycolic-acid": ["glycolic acid", "glycolic"],
  "lactic-acid": ["lactic acid", "lactic"],
  "mandelic-acid": ["mandelic acid", "mandelic"],
  "azelaic-acid": ["azelaic acid", "azelaic", "finacea"],
  "tranexamic-acid": ["tranexamic acid", "tranexamic"],
  "alpha-arbutin": ["alpha arbutin", "arbutin"],
  niacinamide: ["niacinamide", "nicotinamide"],
  "hyaluronic-acid": ["hyaluronic acid"],
  panthenol: ["panthenol", "pro vitamin b5", "provitamin b5"],
  bakuchiol: ["bakuchiol"],
  bemotrizinol: ["bemotrizinol", "tinosorb s"],
  exosomes: ["exosome", "exosomes"],
  propolis: ["propolis"],
  "snail-mucin": ["snail mucin", "snail secretion"],
  sulphur: ["sulphur", "sulfur"],
  "zinc-oxide": ["zinc oxide"],
};

// --------------------------------------------------------------------
// Product aliases
// --------------------------------------------------------------------

/**
 * Per-brand product alias map. Editorial copy in routines, concerns,
 * and "alt picks" rows often refers to a product with slightly drifted
 * wording from the brief's canonical `name` field — "Toleriane
 * Hydrating" vs the brief's "Toleriane Double Repair", "Effaclar
 * Foaming Gel" vs "Effaclar Purifying Foaming Gel", "Niacinamide 5% +
 * HA" vs "Niacinamide 5% + Hyaluronic Acid". The runtime resolver
 * already does brand-equality + name-substring matching, but those
 * variants don't share a common substring so they slip through.
 *
 * Each entry is keyed by `norm(brand)` and maps a canonical brief
 * `slug` to the list of editorial wordings that should resolve to it.
 * Aliases are matched exactly (after `norm()`) — substring matching
 * stays in the existing resolver.
 */
export type ProductAliasMap = Record<string, Record<string, string[]>>;

export const PRODUCT_ALIASES: ProductAliasMap = {
  cerave: {
    "cerave-foaming-facial-cleanser": [
      "sa smoothing cleanser",
      "hydrating cleanser",
      "pm facial lotion",
    ],
  },
  "la roche posay": {
    "la-roche-posay-toleriane-double-repair": [
      "toleriane hydrating",
      "toleriane hydrating gentle cleanser",
    ],
    "la-roche-posay-effaclar-purifying-foaming-gel": [
      "effaclar foaming gel",
      "effaclar purifying gel",
    ],
    "la-roche-posay-anthelios-uvmune-400-invisible-fluid-spf-50": [
      "anthelios uvmune 400 spf 50",
    ],
  },
  vanicream: {
    "vanicream-daily-facial-moisturizer": ["gentle facial cleanser"],
  },
  galderma: {
    "galderma-adapalene-01-gel-differin": ["differin gel 0 1"],
  },
  bioderma: {
    "bioderma-photoderm-spot-age-spf-50": ["photoderm spot age spf50"],
  },
  cetaphil: {
    "cetaphil-gentle-skin-cleanser": ["gentle cleanser"],
  },
  minimalist: {
    "minimalist-niacinamide-5-hyaluronic-acid": ["niacinamide 5 ha"],
  },
  "paula s choice": {
    "paulas-choice-2-bha-liquid-exfoliant": ["skin perfecting 2 bha liquid"],
  },
};

/**
 * Resolve a brand+name pair against a product alias map. Returns the
 * canonical brief slug when the normalised name exactly matches one
 * of the aliases registered under the normalised brand, otherwise
 * `undefined`. Both the runtime resolver (`./links.ts`) and the
 * build-time coverage report consult this so the two views agree on
 * which references count as resolved.
 */
export function matchProductAliasSlug(
  aliases: ProductAliasMap,
  brand: string | null | undefined,
  name: string | null | undefined,
): string | undefined {
  if (!brand || !name) return undefined;
  const byBrand = aliases[norm(brand)];
  if (!byBrand) return undefined;
  const n = norm(name);
  if (!n) return undefined;
  for (const [slug, names] of Object.entries(byBrand)) {
    for (const a of names) {
      if (norm(a) === n) return slug;
    }
  }
  return undefined;
}

// Aliases that help match short labels inside ingredient brief
// `byConcern` rows (e.g. "Acne · inflammatory" → inflammatory-acne).
export const CONCERN_ALIASES: Record<string, string[]> = {
  "inflammatory-acne": ["inflammatory acne", "papulopustular acne"],
  "comedonal-acne": ["comedonal acne", "comedones", "blackheads", "whiteheads"],
  "hormonal-acne": ["hormonal acne", "adult acne"],
  "fungal-acne": ["fungal acne", "malassezia", "pityrosporum"],
  rosacea: ["rosacea", "papulopustular rosacea"],
  melasma: ["melasma", "chloasma"],
  pih: ["pih", "post inflammatory hyperpigmentation", "hyperpigmentation"],
  "sun-spots": ["sun spots", "solar lentigines", "lentigines", "age spots"],
  "dark-circles": ["dark circles", "periorbital", "under eye"],
  "fine-lines": ["fine lines", "wrinkles", "early wrinkles"],
  photoaging: ["photoaging", "photo aging", "sun damage"],
  elasticity: ["elasticity", "firmness", "sagging", "loss of firmness"],
  scarring: ["scarring", "atrophic scars", "acne scars", "post acne scars"],
  "stretch-marks": ["stretch marks", "striae"],
  eczema: ["eczema", "atopic dermatitis", "atopy"],
  "compromised-barrier": [
    "compromised barrier",
    "barrier damage",
    "impaired barrier",
  ],
  "perioral-dermatitis": ["perioral dermatitis"],
  "post-isotretinoin": ["post isotretinoin", "post accutane"],
  "post-procedure": ["post procedure", "post laser", "post peel"],
  dullness: ["dullness", "lack of glow", "radiance"],
  "tone-texture": ["tone and texture", "uneven tone", "uneven texture"],
};
