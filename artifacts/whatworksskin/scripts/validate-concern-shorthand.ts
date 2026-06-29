/**
 * Contract test: shorthand concern names resolve to the right brief.
 *
 * The runtime cross-link resolver in `src/lib/links.ts` runs inside
 * Astro and reads the live concern collection. To exercise the
 * matcher in isolation — without booting Astro — this script builds
 * a phrase index identically to the runtime (canonical name +
 * slug-as-phrase + every `CONCERN_ALIASES` entry, longest-first) and
 * exercises it via the shared `matchPhraseSlug` helper.
 *
 * Each case below pairs an editorial shorthand string an editor might
 * write inside an ingredient brief's `byConcern[].concern` field with
 * the slug the matcher should produce. The cases cover:
 *
 *   • Parenthetical category prefixes ("Acne (comedonal)",
 *     "Acne (inflammatory)", "PIH (post-inflammatory)") — these used
 *     to fall through because the alias map only carried the
 *     "<modifier> <category>" word order, while the editorial
 *     shorthand inverts it. The matcher now tries the outside text
 *     and an inside-then-outside reversal as fallbacks.
 *
 *   • Cases that already worked and must keep working — guards
 *     against regressions when extending the parenthetical handling.
 *
 *   • Negative cases where no brief should match — guards against
 *     overly-eager fallbacks (e.g. a bare category like "Acne" alone
 *     must not pick a sibling sub-concern).
 *
 * Run via:
 *   pnpm --filter @workspace/whatworksskin run validate:concern-shorthand
 *
 * Exits non-zero on any failure so it can wire into CI / the
 * `matchers` validation workflow.
 */

import {
  CONCERN_ALIASES,
  matchPhraseSlug,
  norm,
  type PhraseIndex,
} from "../src/lib/link-aliases.ts";

// Canonical names mirror `src/content/concerns/*.json`. Kept inline
// (rather than read from disk) so the test stays a self-contained
// contract test of the matcher logic, not a content snapshot.
const CANONICAL: Record<string, string> = {
  "comedonal-acne": "Comedonal acne",
  "compromised-barrier": "Compromised barrier",
  "dark-circles": "Dark circles",
  dullness: "Dullness",
  eczema: "Eczema",
  elasticity: "Elasticity",
  "fine-lines": "Fine lines",
  "fungal-acne": "Fungal acne",
  "hormonal-acne": "Hormonal acne",
  "inflammatory-acne": "Inflammatory acne",
  melasma: "Melasma",
  "perioral-dermatitis": "Perioral dermatitis",
  photoaging: "Photoaging",
  pih: "Post-inflammatory hyperpigmentation",
  "post-isotretinoin": "Post-isotretinoin",
  "post-procedure": "Post-procedure",
  rosacea: "Rosacea",
  scarring: "Scarring",
  "stretch-marks": "Stretch marks",
  "sun-spots": "Sun spots",
  "tone-texture": "Tone & texture",
};

function buildIndex(): PhraseIndex {
  const byNameNorm = new Map<string, string>();
  const phrases: { phrase: string; slug: string }[] = [];
  for (const [slug, name] of Object.entries(CANONICAL)) {
    const nameN = norm(name);
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
}

const idx = buildIndex();

type Case = { input: string; expect: string | undefined; why: string };

const cases: Case[] = [
  // Parenthetical category-prefix shorthand (the regression this task fixes).
  {
    input: "Acne (comedonal)",
    expect: "comedonal-acne",
    why: "category-then-modifier shorthand — reversed alias 'comedonal acne' wins",
  },
  {
    input: "Acne (inflammatory)",
    expect: "inflammatory-acne",
    why: "category-then-modifier shorthand — reversed alias 'inflammatory acne' wins",
  },
  {
    input: "Acne (hormonal)",
    expect: "hormonal-acne",
    why: "extends to other 'Acne (X)' shorthands editors might write",
  },
  {
    input: "Acne (fungal)",
    expect: "fungal-acne",
    why: "extends to other 'Acne (X)' shorthands editors might write",
  },
  {
    input: "PIH (post-inflammatory)",
    expect: "pih",
    why: "outside-text 'PIH' wins via byNameNorm even though it's only 3 chars",
  },

  // Cases that already worked — regression guards.
  {
    input: "Photoaging",
    expect: "photoaging",
    why: "bare canonical name resolves directly",
  },
  {
    input: "Stretch marks (early)",
    expect: "stretch-marks",
    why: "direct word-boundary match on 'stretch marks' alias",
  },
  {
    input: "Inflammatory acne",
    expect: "inflammatory-acne",
    why: "canonical wording resolves directly",
  },
  {
    input: "Comedonal acne",
    expect: "comedonal-acne",
    why: "canonical wording resolves directly",
  },
  {
    input: "Post-inflammatory hyperpigmentation",
    expect: "pih",
    why: "canonical pih name resolves directly",
  },
  {
    input: "Hyperpigmentation",
    expect: "pih",
    why: "single-word alias for pih resolves directly",
  },

  // Negative cases — must not match anything (parenthetical fallback
  // must not over-resolve a bare category that has no brief of its
  // own and would otherwise pick a sibling sub-concern at random).
  {
    input: "Acne",
    expect: undefined,
    why: "no 'acne' base brief; must not pick a sibling sub-concern",
  },
  {
    input: "Pigmentation",
    expect: undefined,
    why: "no pigmentation brief; alias broadening must not over-reach",
  },
];

let failed = 0;
for (const c of cases) {
  // Concerns use minPhraseLen=4 to mirror the runtime resolver in
  // `src/lib/links.ts` (`findConcernSlug`). Concern resolution does
  // not pass the procedural deny-list — see `INGREDIENT_PROCEDURAL_DENY_KEYWORDS`
  // for the rationale (concern shorthand legitimately uses words like
  // "post peel" and "post laser").
  const got = matchPhraseSlug(idx, c.input, 4);
  const ok = got === c.expect;
  if (!ok) failed++;
  const status = ok ? "✓" : "✗";
  const expect = c.expect ?? "(no match)";
  const gotStr = got ?? "(no match)";
  const detail = ok ? `→ ${expect}` : `→ expected ${expect}, got ${gotStr}`;
  console.log(`  ${status} ${JSON.stringify(c.input).padEnd(40)} ${detail}    [${c.why}]`);
}

console.log("");
if (failed > 0) {
  console.error(`✗ ${failed} of ${cases.length} concern shorthand cases failed.`);
  process.exit(1);
}
console.log(`✓ All ${cases.length} concern shorthand cases resolved as expected.`);
