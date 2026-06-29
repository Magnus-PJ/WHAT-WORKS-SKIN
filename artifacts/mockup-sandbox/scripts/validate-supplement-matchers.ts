/**
 * Validate that every supplement-name mention across the team's
 * supplement reference sources (the `_supplementCatalogue.ts` rows and
 * each supplement brief's evidence/forms/FAQ copy) either resolves to
 * a supplement slug via the matchers in `_links.tsx`, or does not
 * actually look like a known supplement.
 *
 * Mirrors `validate-ingredient-matchers.ts` for the supplement-side
 * cross-link map. The script fails when text contains a token that
 * fuzzy-matches the unique-distinguishing keyword of a supplement that
 * already has a brief page, but no matcher caught the mention — i.e.
 * a misspelling, a new phrasing, or a matcher we forgot to add.
 *
 * Run via: pnpm --filter @workspace/mockup-sandbox run validate:supplements
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import {
  INGREDIENTS,
  SUPPLEMENTS,
  SUPPLEMENT_MATCHERS,
} from "../src/components/mockups/evidently/_links";
import { SUPPLEMENT_ROWS } from "../src/components/mockups/evidently/_supplementCatalogue";

// ─────────────────────────────────────────────────────────────────────
// Distinctive-keyword extraction. Same shape as the ingredient script.
// Per-slug list of distinctive tokens we expect to see in any
// supplement name that should resolve to that slug. Built from the
// slug + display name, then filtered down to tokens that are unique
// enough to identify the supplement on their own. Generic tokens
// ("vitamin", "oral", "supplement", "skin", "iron"…) are dropped
// because they appear across many unrelated supplement names and
// would produce false positives.
// ─────────────────────────────────────────────────────────────────────
const GENERIC_TOKENS = new Set([
  // Mirrors the ingredient script's baseline.
  "acid", "acids", "the", "and", "for", "with", "vit", "vitamin",
  "oil", "extract", "complex", "salt", "ester", "form", "free", "low",
  "high", "oxide", "oxides", "zinc", "iron", "copper", "signal",
  "filter", "filters", "peptides", "peptide",
  // Tokens that recur across supplement names without being
  // distinctive on their own. "evening" and "magnesium" appear in
  // unrelated dosing/biochem prose ("evening dosing", "iodine,
  // magnesium…") so they're filtered here; the phrase / sibling
  // tokens ("primrose", "glycinate") still anchor those slugs.
  "oral", "supplement", "skin", "level", "dose", "daily", "weeks",
  "support", "brief", "deficient", "based", "from", "into", "when",
  "evening", "magnesium",
]);

const MIN_DISTINCTIVE_LEN = 7;

type SlugKeyword =
  | { kind: "single"; token: string }
  | { kind: "phrase"; tokens: string[] }
  // Built only for slugs whose distinctive token is shared with a
  // sibling brief (e.g. "glutathione" → glutathione-iv & glutathione-oral;
  // "collagen" → collagen & marine-collagen). The fuzzy keyword hit must
  // be flanked by a `required` qualifier and not by any `forbidden`
  // qualifier, both within QUALIFIER_WINDOW tokens of the keyword.
  | {
      kind: "qualified";
      token: string;
      required: string[];
      forbidden: string[];
    };

function tokensOf(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function keywordsFor(slug: string): SlugKeyword[] {
  const all = new Set<string>([
    ...slug.split("-"),
    ...tokensOf(SUPPLEMENTS[slug]?.name ?? ""),
  ]);
  const distinctive = [...all].filter(
    (t) => t.length >= MIN_DISTINCTIVE_LEN && !GENERIC_TOKENS.has(t),
  );
  if (distinctive.length > 0) {
    return distinctive.map((t) => ({ kind: "single", token: t }));
  }
  // Fall back to a phrase made of the slug's parts (excluding very
  // generic tokens). Requires every token to appear in the candidate
  // name to count as a hit.
  const phraseTokens = slug
    .split("-")
    .filter((t) => t.length >= 4 && !GENERIC_TOKENS.has(t));
  if (phraseTokens.length === 0) return [];
  return [{ kind: "phrase", tokens: phraseTokens }];
}

const KEYWORDS_BY_SLUG: Record<string, SlugKeyword[]> = {};
for (const slug of Object.keys(SUPPLEMENTS)) {
  const k = keywordsFor(slug);
  if (k.length > 0) KEYWORDS_BY_SLUG[slug] = k;
}

// Keywords shared by more than one slug used to be dropped wholesale —
// a bare fuzzy hit on "glutathione" or "collagen" is genuinely
// ambiguous between the IV/oral or plain/marine briefs. That meant a
// typo like "glutahione (oral)" or "marine colagen" slipped through.
//
// Instead we now turn each shared single-token keyword into a per-slug
// `qualified` pattern that asks for a sibling-distinguishing qualifier
// nearby (e.g. "iv" / "oral" for the two glutathione slugs, "marine"
// for marine-collagen). Slugs that contribute no qualifier of their
// own (e.g. plain "collagen" vs marine-collagen) are left without a
// pattern — a bare mention is still ambiguous and we'd rather miss it
// than misattribute it.
function keywordKey(k: SlugKeyword): string {
  switch (k.kind) {
    case "single":
      return `s:${k.token}`;
    case "phrase":
      return `p:${k.tokens.join("+")}`;
    case "qualified":
      return (
        `q:${k.token}|+${k.required.join(",")}` +
        `|-${k.forbidden.join(",")}`
      );
  }
}

// Per-slug disambiguator tokens drawn from the slug's own parts, minus
// the shared keyword itself. Generic tokens like "oral" / "iv" are
// allowed here on purpose — they're the only thing that distinguishes
// the sibling briefs even though they're filtered out of the keyword
// list.
function qualifiersFor(slug: string, sharedToken: string): string[] {
  const parts = slug
    .split("-")
    .filter((t) => t !== sharedToken && t.length >= 2);
  return [...new Set(parts)];
}

const SINGLE_KEY_OWNERS = new Map<string, Set<string>>();
for (const [slug, keywords] of Object.entries(KEYWORDS_BY_SLUG)) {
  for (const k of keywords) {
    if (k.kind !== "single") continue;
    if (!SINGLE_KEY_OWNERS.has(k.token)) {
      SINGLE_KEY_OWNERS.set(k.token, new Set());
    }
    SINGLE_KEY_OWNERS.get(k.token)!.add(slug);
  }
}

// Tokens drawn from ingredient brief slugs and display names. Used to
// detect when a supplement's distinctive keyword overlaps with the
// name of an ingredient that has its own brief page (e.g. supplement
// "ceramide-oral" shares "ceramide" with ingredient "ceramides", and
// "exosome-oral" shares "exosome" with "exosomes"). When that happens
// we can't treat a bare keyword hit as a supplement mention — the
// ingredient brief is allowed to talk about ceramides / exosomes
// without meaning the oral supplement. We force those supplement
// slugs into the `qualified` pattern so the keyword hit must be
// flanked by a sibling-distinguishing qualifier ("oral", "iv") drawn
// from the supplement slug parts.
const INGREDIENT_TOKENS: string[] = [];
for (const [slug, entry] of Object.entries(INGREDIENTS)) {
  for (const t of [
    ...slug.split("-"),
    ...tokensOf(entry.name ?? ""),
  ]) {
    if (t.length >= 4 && !INGREDIENT_TOKENS.includes(t)) {
      INGREDIENT_TOKENS.push(t);
    }
  }
}

function ingredientCollidesWith(keyword: string): boolean {
  for (const tok of INGREDIENT_TOKENS) {
    if (bestSingleMatch(tok, keyword)) return true;
  }
  return false;
}

const UNIQUE_KEYWORDS: Record<string, SlugKeyword[]> = {};
for (const [slug, keywords] of Object.entries(KEYWORDS_BY_SLUG)) {
  const out: SlugKeyword[] = [];
  for (const k of keywords) {
    if (k.kind === "single") {
      const owners = SINGLE_KEY_OWNERS.get(k.token);
      const sharedAcrossSupplements = !!owners && owners.size > 1;
      const sharedWithIngredient = ingredientCollidesWith(k.token);
      if (!sharedAcrossSupplements && !sharedWithIngredient) {
        out.push(k);
        continue;
      }
      // Shared single keyword (with another supplement and/or with an
      // ingredient brief): build a qualified pattern. Skip the slug
      // if it has no qualifier of its own (e.g. plain "collagen" vs
      // marine-collagen — bare collagen isn't disambiguable).
      const required = qualifiersFor(slug, k.token);
      if (required.length === 0) continue;
      const forbidden = new Set<string>();
      if (owners) {
        for (const sibling of owners) {
          if (sibling === slug) continue;
          for (const q of qualifiersFor(sibling, k.token)) {
            if (!required.includes(q)) forbidden.add(q);
          }
        }
      }
      out.push({
        kind: "qualified",
        token: k.token,
        required,
        forbidden: [...forbidden],
      });
    } else {
      // Phrase keywords don't currently overlap across slugs in
      // practice, so leave them as-is.
      out.push(k);
    }
  }
  if (out.length > 0) UNIQUE_KEYWORDS[slug] = out;
}

// ─────────────────────────────────────────────────────────────────────
// Fuzzy-match primitives. Mirrors validate-ingredient-matchers.ts.
// ─────────────────────────────────────────────────────────────────────
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

function tolerance(keyword: string): number {
  if (keyword.length >= 10) return 2;
  if (keyword.length >= 6) return 1;
  return 0;
}

function bestSingleMatch(
  token: string,
  keyword: string,
): { distance: number } | null {
  const tol = tolerance(keyword);
  if (Math.abs(token.length - keyword.length) > tol) return null;
  const d = levenshtein(token, keyword);
  return d <= tol ? { distance: d } : null;
}

// ─────────────────────────────────────────────────────────────────────
// Per-slug matcher access, so we can ask "does any matcher for slug X
// match in this text?" — independent of the priority order baked into
// `slugForSupplementName`.
// ─────────────────────────────────────────────────────────────────────
const MATCHERS_BY_SLUG: Record<string, RegExp[]> = {};
for (const [re, slug] of SUPPLEMENT_MATCHERS) {
  if (!MATCHERS_BY_SLUG[slug]) MATCHERS_BY_SLUG[slug] = [];
  MATCHERS_BY_SLUG[slug].push(re);
}

function matcherHits(text: string, slug: string): boolean {
  const list = MATCHERS_BY_SLUG[slug];
  if (!list) return false;
  return list.some((re) => re.test(text));
}

function inferSelfSlugFromText(text: string): string | undefined {
  for (const [re, slug] of SUPPLEMENT_MATCHERS) {
    if (re.test(text)) return slug;
  }
  return undefined;
}

function inferSelfSlugFromComponent(componentName: string): string | undefined {
  for (const [slug, entry] of Object.entries(SUPPLEMENTS)) {
    if (entry.component === componentName) return slug;
  }
  return undefined;
}

// ─────────────────────────────────────────────────────────────────────
// Source collection. Walks the catalogue rows and every
// supplement / routine / concern / ingredient brief .tsx file,
// pulling every double-quoted string literal that looks like prose.
// JSX attribute values that the brief templates hand to `linkifyText`
// (evidence rows, forms, faq, dek, bottom, etc.) are all
// double-quoted, so this catches the prose without needing an AST.
// Routine, concern, and ingredient briefs reference supplements in
// passing too (e.g. ConcernDetail's "Glutathione (topical)" row), and
// a typo there would otherwise slip past validation; only supplement
// briefs get a `selfSlug` to suppress a brief's own self-mentions.
// ─────────────────────────────────────────────────────────────────────
type Source = {
  label: string;
  text: string;
  /** Slug owned by this source — suppress its own self-mentions. */
  selfSlug?: string;
};

function collectSources(): { sources: Source[]; briefCount: number } {
  const sources: Source[] = [];

  // (a) Supplement catalogue rows.
  for (const row of SUPPLEMENT_ROWS) {
    const label = `_supplementCatalogue.ts › ${row.slug}`;
    const selfSlug = inferSelfSlugFromText(row.name);
    const fields: Array<[string, string]> = [
      ["name", row.name],
      ["family", row.family],
      ["target", row.target],
      ["dose", row.dose],
      ["oneliner", row.oneliner],
    ];
    for (const [field, text] of fields) {
      if (!text) continue;
      sources.push({ label: `${label} (${field})`, text, selfSlug });
    }
  }

  // (b) Supplement, routine, concern, and ingredient brief .tsx
  // files. Routine/concern/ingredient briefs mention supplements in
  // passing (e.g. a "Glutathione (topical)" row in ConcernDetail), so
  // typos in those mentions would otherwise slip through unchecked.
  const here = path.dirname(fileURLToPath(import.meta.url));
  const briefDir = path.join(
    here,
    "..",
    "src",
    "components",
    "mockups",
    "evidently",
  );
  const briefPrefixRe = /^(Supplement|Routine|Concern|Ingredient)/;
  const briefFiles = fs
    .readdirSync(briefDir)
    .filter(
      (f) =>
        briefPrefixRe.test(f) &&
        f.endsWith(".tsx") &&
        !f.startsWith("_"),
    )
    .sort();

  let briefCount = 0;
  for (const file of briefFiles) {
    briefCount += 1;
    const componentName = file.replace(/\.tsx$/, "");
    // Only supplement briefs own a supplement slug. Routine/concern/
    // ingredient briefs are just additional sources to scan, with no
    // self-mention to suppress.
    const selfSlug = file.startsWith("Supplement")
      ? inferSelfSlugFromComponent(componentName)
      : undefined;
    const fullPath = path.join(briefDir, file);
    const src = fs.readFileSync(fullPath, "utf8");
    // Strip line comments to avoid pulling stray "// foo" tokens that
    // aren't part of the rendered prose.
    const stripped = src.replace(/^\s*\/\/[^\n]*$/gm, "");
    // Pull every double-quoted string literal. The supplement
    // template (and the few hand-rolled briefs) keep all prose in
    // double-quoted strings, so this covers the relevant copy.
    const re = /"((?:[^"\\\n]|\\.)*)"/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(stripped)) !== null) {
      const text = m[1];
      // Skip strings that don't look like prose: too short, or no
      // letters at all (CSS-y values like "0.16em" or "1px").
      if (text.length < 8) continue;
      const letters = text.replace(/[^a-zA-Z]/g, "").length;
      if (letters < 4) continue;
      // Skip kebab-case identifiers (e.g. the literal slug string
      // "tranexamic-oral" passed as a `slug:` prop). They're not
      // prose and they exactly match a supplement slug by design.
      if (/^[a-z0-9]+(?:-[a-z0-9]+)+$/.test(text)) continue;
      sources.push({ label: file, text, selfSlug });
    }
  }

  return { sources, briefCount };
}

// ─────────────────────────────────────────────────────────────────────
// Validation.
// ─────────────────────────────────────────────────────────────────────
type Suspect = {
  source: string;
  excerpt: string;
  resemblesSlugs: string[];
  reason: string;
  rank: number; // lower is "more suspicious"
};

// Maximum token-distance between a fuzzy keyword hit and a qualifier
// token for a `qualified` keyword pattern to count as a match. Tight
// enough that the collagen brief's "...skin collagen) from either
// bovine or marine sources..." doesn't trip the marine-collagen
// pattern (collagen and marine are 5 tokens apart there), loose enough
// that "marine derived colagen" or "glutahione (oral)" still trip.
const QUALIFIER_WINDOW = 4;

type IndexedToken = { token: string; index: number };

function tokenizeIndexed(text: string, minLen: number): IndexedToken[] {
  const parts = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const out: IndexedToken[] = [];
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].length >= minLen) {
      out.push({ token: parts[i], index: i });
    }
  }
  return out;
}

function fuzzyHitsAt(
  positions: IndexedToken[],
  keyword: string,
): Array<{ pos: IndexedToken; distance: number }> {
  const out: Array<{ pos: IndexedToken; distance: number }> = [];
  for (const p of positions) {
    const hit = bestSingleMatch(p.token, keyword);
    if (hit) out.push({ pos: p, distance: hit.distance });
  }
  return out;
}

function bestMatchForSlugInText(
  text: string,
  slug: string,
): { rank: number; reason: string } | null {
  const tokens = tokenize(text);
  if (tokens.length === 0) return null;
  let best: { rank: number; reason: string } | null = null;

  // Lazily-built positional token list (>=2 chars) for qualified
  // patterns — they need short tokens like "iv" that `tokenize` skips.
  let tokensAll: IndexedToken[] | null = null;
  const allTokens = (): IndexedToken[] => {
    if (tokensAll === null) tokensAll = tokenizeIndexed(text, 2);
    return tokensAll;
  };

  for (const kw of UNIQUE_KEYWORDS[slug]!) {
    if (kw.kind === "single") {
      for (const tok of tokens) {
        const hit = bestSingleMatch(tok, kw.token);
        if (!hit) continue;
        const reason =
          `token "${tok}" ≈ "${kw.token}" (distance ${hit.distance})`;
        if (!best || hit.distance < best.rank) {
          best = { rank: hit.distance, reason };
        }
      }
    } else if (kw.kind === "phrase") {
      // Phrase: every phrase token must approximately appear in the
      // text's tokens. Sum the per-token distances as a soft rank.
      let totalDistance = 0;
      const matched: string[] = [];
      let ok = true;
      for (const phraseTok of kw.tokens) {
        let bestPhrase: { tok: string; d: number } | null = null;
        for (const tok of tokens) {
          const hit = bestSingleMatch(tok, phraseTok);
          if (hit && (!bestPhrase || hit.distance < bestPhrase.d)) {
            bestPhrase = { tok, d: hit.distance };
          }
        }
        if (!bestPhrase) {
          ok = false;
          break;
        }
        totalDistance += bestPhrase.d;
        matched.push(`"${bestPhrase.tok}"≈"${phraseTok}"`);
      }
      if (ok) {
        const rank = totalDistance + 0.5;
        const reason =
          `phrase ${matched.join(" + ")} (total distance ${totalDistance})`;
        if (!best || rank < best.rank) best = { rank, reason };
      }
    } else {
      // Qualified: fuzzy keyword hit must be within QUALIFIER_WINDOW
      // tokens of *every* required qualifier and within window of *no*
      // forbidden qualifier. Pre-compute hit positions once per token.
      const positions = allTokens();
      const kwHits = fuzzyHitsAt(positions, kw.token);
      if (kwHits.length === 0) continue;
      const reqHits = kw.required.map((r) => ({
        token: r,
        hits: fuzzyHitsAt(positions, r),
      }));
      const fbHits = kw.forbidden.map((f) => ({
        token: f,
        hits: fuzzyHitsAt(positions, f),
      }));

      for (const kwHit of kwHits) {
        const near = (
          hits: Array<{ pos: IndexedToken; distance: number }>,
        ) =>
          hits.find(
            (h) =>
              Math.abs(h.pos.index - kwHit.pos.index) <= QUALIFIER_WINDOW,
          );

        const reqMatched: string[] = [];
        let allReqOk = true;
        for (const r of reqHits) {
          const hit = near(r.hits);
          if (!hit) {
            allReqOk = false;
            break;
          }
          reqMatched.push(`"${hit.pos.token}"≈"${r.token}"`);
        }
        if (!allReqOk) continue;

        let blocking: string | null = null;
        for (const f of fbHits) {
          const hit = near(f.hits);
          if (hit) {
            blocking = f.token;
            break;
          }
        }
        if (blocking) continue;

        const parts = [
          `token "${kwHit.pos.token}" ≈ "${kw.token}" ` +
            `(distance ${kwHit.distance})`,
        ];
        if (reqMatched.length) {
          parts.push(`with ${reqMatched.join(" + ")} nearby`);
        }
        if (kw.forbidden.length) {
          parts.push(`no ${kw.forbidden.join("/")} nearby`);
        }
        const reason = parts.join(", ");
        if (!best || kwHit.distance < best.rank) {
          best = { rank: kwHit.distance, reason };
        }
      }
    }
  }
  return best;
}

const { sources, briefCount } = collectSources();

// Group suspects by (source, reason) so an exact same fuzzy hit that
// names multiple candidate slugs is reported once with all candidates.
const grouped = new Map<string, Suspect>();
for (const source of sources) {
  for (const slug of Object.keys(UNIQUE_KEYWORDS)) {
    if (slug === source.selfSlug) continue;
    if (matcherHits(source.text, slug)) continue;
    const hit = bestMatchForSlugInText(source.text, slug);
    if (!hit) continue;
    const key = `${source.label}::${hit.reason}`;
    const existing = grouped.get(key);
    if (existing) {
      if (!existing.resemblesSlugs.includes(slug)) {
        existing.resemblesSlugs.push(slug);
      }
      if (hit.rank < existing.rank) existing.rank = hit.rank;
    } else {
      grouped.set(key, {
        source: source.label,
        excerpt:
          source.text.length > 140
            ? source.text.slice(0, 137) + "…"
            : source.text,
        resemblesSlugs: [slug],
        reason: hit.reason,
        rank: hit.rank,
      });
    }
  }
}

const suspects = [...grouped.values()].sort((a, b) => a.rank - b.rank);

if (suspects.length === 0) {
  console.log(
    `✓ Supplement matchers OK — checked ${sources.length} text snippets ` +
      `across ${SUPPLEMENT_ROWS.length} catalogue rows and ${briefCount} ` +
      `brief pages.`,
  );
  process.exit(0);
}

console.error(
  `✗ Found ${suspects.length} text snippet(s) with no matcher hit that ` +
    `look like a supplement that already has a brief page.\n` +
    `   Either add a matcher in artifacts/mockup-sandbox/src/components/` +
    `mockups/evidently/_links.tsx, or correct the spelling on the ` +
    `supplement page.\n`,
);
for (const s of suspects) {
  console.error(
    `  • "${s.excerpt}"\n` +
      `      in:        ${s.source}\n` +
      `      resembles: ${s.resemblesSlugs.join(" or ")} (${s.reason})`,
  );
}
process.exit(1);
