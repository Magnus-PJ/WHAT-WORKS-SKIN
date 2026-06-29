/**
 * Contract test: shorthand ingredient names resolve to the right brief.
 *
 * The runtime cross-link resolver in `src/lib/links.ts` runs inside
 * Astro and reads the live ingredient collection. To exercise the
 * matcher in isolation — without booting Astro — this script builds
 * a phrase index identically to the runtime (canonical name + every
 * `INGREDIENT_ALIASES` entry, longest-first) and exercises it via
 * the shared `matchPhraseSlug` helper.
 *
 * Each case below pairs an editorial shorthand string an editor might
 * write inside a concern / product / routine brief with the slug the
 * matcher should produce. The cases cover:
 *
 *   • Bare-molecule shorthand ("Azelaic 15%", "Lactic 5–10%",
 *     "Mandelic 10%", "Tret 0.025% cream") — these used to fall
 *     through to plain text because the alias map only carried the
 *     "<molecule> acid" form.
 *
 *   • Cases that already worked and must keep working — guards
 *     against regressions when extending the alias map.
 *
 *   • Negative cases where no brief should match — guards against
 *     overly-eager aliases (e.g. "Vitamin E", "Cholesterol").
 *
 * Run via:
 *   pnpm --filter @workspace/whatworksskin run validate:ingredient-shorthand
 *
 * Exits non-zero on any failure so it can wire into CI / the
 * `matchers` validation workflow.
 */

import {
  INGREDIENT_ALIASES,
  INGREDIENT_PROCEDURAL_DENY_KEYWORDS,
  matchPhraseSlug,
  norm,
  type PhraseIndex,
} from "../src/lib/link-aliases.ts";

// Canonical names mirror `src/content/ingredients/*.json`. Kept inline
// (rather than read from disk) so the test stays a self-contained
// contract test of the matcher logic, not a content snapshot.
const CANONICAL: Record<string, string> = {
  adapalene: "Adapalene",
  "alpha-arbutin": "Alpha arbutin",
  "azelaic-acid": "Azelaic acid",
  bakuchiol: "Bakuchiol",
  bemotrizinol: "Bemotrizinol",
  "benzoyl-peroxide": "Benzoyl peroxide",
  centella: "Centella asiatica",
  ceramides: "Ceramides",
  exosomes: "Exosomes",
  "glycolic-acid": "Glycolic acid",
  "hyaluronic-acid": "Hyaluronic acid",
  "lactic-acid": "Lactic acid",
  "l-ascorbic-acid": "L-ascorbic acid",
  "mandelic-acid": "Mandelic acid",
  niacinamide: "Niacinamide",
  panthenol: "Panthenol",
  "peptides-copper": "Copper peptides",
  "peptides-signal": "Signal peptides",
  propolis: "Propolis",
  retinol: "Retinol",
  "salicylic-acid": "Salicylic acid",
  "snail-mucin": "Snail mucin",
  sulphur: "Sulphur",
  "tranexamic-acid": "Tranexamic acid",
  tretinoin: "Tretinoin",
  "uv-filters": "UV filters",
  "zinc-oxide": "Zinc oxide",
};

function buildIndex(): PhraseIndex {
  const byNameNorm = new Map<string, string>();
  const phrases: { phrase: string; slug: string }[] = [];
  for (const [slug, name] of Object.entries(CANONICAL)) {
    const nameN = norm(name);
    byNameNorm.set(nameN, slug);
    phrases.push({ phrase: nameN, slug });
    for (const a of INGREDIENT_ALIASES[slug] ?? []) {
      const an = norm(a);
      if (!byNameNorm.has(an)) byNameNorm.set(an, slug);
      phrases.push({ phrase: an, slug });
    }
  }
  phrases.sort((a, b) => b.phrase.length - a.phrase.length);
  return { byNameNorm, phrases };
}

const idx = buildIndex();

type Case = { input: string; expect: string | undefined; why: string };

const cases: Case[] = [
  // Bare-molecule shorthand (the regression this task fixes).
  { input: "Azelaic 15%", expect: "azelaic-acid", why: "shorthand for Azelaic acid 15%" },
  { input: "Azelaic 10%", expect: "azelaic-acid", why: "shorthand, lower strength" },
  { input: "Azelaic 10% (after month 3)", expect: "azelaic-acid", why: "shorthand + parenthetical" },
  { input: "Lactic 5–10%", expect: "lactic-acid", why: "shorthand for Lactic acid range" },
  { input: "Mandelic 10%", expect: "mandelic-acid", why: "shorthand for Mandelic acid" },
  { input: "Tret 0.025%", expect: "tretinoin", why: "tret = tretinoin shorthand" },
  { input: "Tret 0.025% cream", expect: "tretinoin", why: "shorthand + form" },
  { input: "A-Ret 0.05% Gel", expect: "tretinoin", why: "A-Ret is a tretinoin brand" },

  // Cases that already worked — regression guards.
  { input: "Adapalene 0.1%", expect: "adapalene", why: "canonical molecule + %" },
  { input: "Benzoyl peroxide 2.5%", expect: "benzoyl-peroxide", why: "canonical name + %" },
  { input: "BPO 2.5%", expect: "benzoyl-peroxide", why: "BPO alias + %" },
  { input: "Vitamin C 10%", expect: "l-ascorbic-acid", why: "Vitamin C alias + %" },
  { input: "Vitamin C (oral)", expect: "l-ascorbic-acid", why: "Vitamin C alias + parenthetical" },
  { input: "L-ascorbic acid 10–15%", expect: "l-ascorbic-acid", why: "canonical + range" },
  { input: "Tretinoin 0.025–0.05%", expect: "tretinoin", why: "canonical + range" },
  { input: "Tretinoin 0.05% Cream (Rx)", expect: "tretinoin", why: "canonical + form + Rx" },
  { input: "Azelaic acid 15–20%", expect: "azelaic-acid", why: "canonical + range" },
  { input: "Tranexamic 5% topical", expect: "tranexamic-acid", why: "alias + form" },
  { input: "Niacinamide 4–10%", expect: "niacinamide", why: "canonical + range" },
  { input: "Salicylic acid 2%", expect: "salicylic-acid", why: "canonical + %" },

  // Negative cases — must not match anything.
  { input: "Cholesterol", expect: undefined, why: "no brief for cholesterol" },
  { input: "Petrolatum", expect: undefined, why: "no brief for petrolatum" },
  { input: "Caffeine 5%", expect: undefined, why: "no brief for caffeine" },
  { input: "Vitamin E", expect: undefined, why: "no brief; must not match L-ascorbic" },
  { input: "Hydroquinone 4%", expect: undefined, why: "no brief for hydroquinone" },
  { input: "Stretch marks", expect: undefined, why: "must not match 'tret' inside 'stretch'" },
];

let failed = 0;
for (const c of cases) {
  const got = matchPhraseSlug(idx, c.input, 3, INGREDIENT_PROCEDURAL_DENY_KEYWORDS);
  const ok = got === c.expect;
  if (!ok) failed++;
  const status = ok ? "✓" : "✗";
  const expect = c.expect ?? "(no match)";
  const gotStr = got ?? "(no match)";
  const detail = ok ? `→ ${expect}` : `→ expected ${expect}, got ${gotStr}`;
  console.log(`  ${status} ${JSON.stringify(c.input).padEnd(40)} ${detail}    [${c.why}]`);
}

// ─────────────────────────────────────────────────────────────────────
// Procedural deny-list cases.
//
// `INGREDIENT_PROCEDURAL_DENY_KEYWORDS` exists to stop the matcher
// from wiring clinic-procedure rows ("Hyaluronic filler (clinic)",
// "Q-switched laser (clinic)", "Multi-Acid Peel") to topical
// ingredient briefs whose names happen to share a token. The deny
// list also has to keep working if a future alias broadening
// registers a bare-molecule shorthand like "hyaluronic" — see task
// #135 — so we exercise it against an *augmented* index that includes
// that hypothetical alias. A naive match (no deny-list) would resolve
// "Hyaluronic filler (clinic)" to `hyaluronic-acid`; with the deny
// guard active it must return `undefined`.
// ─────────────────────────────────────────────────────────────────────

const proceduralIdx: PhraseIndex = (() => {
  const byNameNorm = new Map(idx.byNameNorm);
  const phrases = idx.phrases.slice();
  // Hypothetical "hyaluronic" bare-molecule shorthand — represents
  // the kind of alias broadening this guard has to survive.
  const extra = norm("hyaluronic");
  byNameNorm.set(extra, "hyaluronic-acid");
  phrases.push({ phrase: extra, slug: "hyaluronic-acid" });
  // Hypothetical "salicylic" shorthand — used to verify the deny on
  // "peel" stops a "Salicylic peel (clinic)" false positive.
  const extra2 = norm("salicylic");
  byNameNorm.set(extra2, "salicylic-acid");
  phrases.push({ phrase: extra2, slug: "salicylic-acid" });
  phrases.sort((a, b) => b.phrase.length - a.phrase.length);
  return { byNameNorm, phrases };
})();

const proceduralCases: Case[] = [
  {
    input: "Hyaluronic filler (clinic)",
    expect: undefined,
    why: "filler + (clinic) must not resolve to hyaluronic-acid serum",
  },
  {
    input: "Hyaluronic injection",
    expect: undefined,
    why: "injection is a procedure, not the topical brief",
  },
  {
    input: "Q-switched laser (clinic)",
    expect: undefined,
    why: "laser procedure must never match an ingredient brief",
  },
  {
    input: "Salicylic peel (clinic)",
    expect: undefined,
    why: "peel procedure must not resolve to salicylic-acid serum",
  },
  {
    input: "RF microneedling (clinic)",
    expect: undefined,
    why: "microneedling procedure must not match any ingredient brief",
  },
  // Regression guards: deny-list must not over-block non-procedural
  // references whose tokens look superficially similar to the
  // procedural keywords. These cases lock in the "doesn't drift into
  // false negatives" property the deny-list claims.
  {
    input: "Hyaluronic acid 2%",
    expect: "hyaluronic-acid",
    why: "topical hyaluronic acid still resolves under deny-list",
  },
  {
    input: "Salicylic acid 2%",
    expect: "salicylic-acid",
    why: "deny on 'peel' must not match 'salicylic' alone",
  },
  {
    input: "Niacinamide 5%",
    expect: "niacinamide",
    why: "ordinary topical reference, no procedural tokens — must resolve",
  },
  {
    input: "Tretinoin 0.05% Cream (Rx)",
    expect: "tretinoin",
    why: "Rx parenthetical is not (clinic) — must still resolve",
  },
];

for (const c of proceduralCases) {
  const got = matchPhraseSlug(proceduralIdx, c.input, 3, INGREDIENT_PROCEDURAL_DENY_KEYWORDS);
  const ok = got === c.expect;
  if (!ok) failed++;
  const status = ok ? "✓" : "✗";
  const expect = c.expect ?? "(no match)";
  const gotStr = got ?? "(no match)";
  const detail = ok ? `→ ${expect}` : `→ expected ${expect}, got ${gotStr}`;
  console.log(`  ${status} ${JSON.stringify(c.input).padEnd(40)} ${detail}    [${c.why}]`);
}

const total = cases.length + proceduralCases.length;
console.log("");
if (failed > 0) {
  console.error(`✗ ${failed} of ${total} ingredient shorthand cases failed.`);
  process.exit(1);
}
console.log(`✓ All ${total} ingredient shorthand cases resolved as expected.`);
