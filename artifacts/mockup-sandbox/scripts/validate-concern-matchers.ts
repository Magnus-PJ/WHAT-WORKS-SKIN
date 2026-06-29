/**
 * Validate that every concern-shaped string across the team's brief
 * sources (ingredient, supplement, concern, routine, and product brief
 * .tsx files) resolves to a concern slug via the matchers in
 * `_links.tsx`.
 *
 * Mirrors `validate-ingredient-matchers.ts` and
 * `validate-supplement-matchers.ts` for the concern-side cross-link
 * map. The script fails when text contains a recognisable concern
 * keyword (Hyperpigmentation, Photoaging, Wrinkles, Erythema,
 * Melasma, Rosacea, Eczema, Comedones, Striae, etc.) or a structured
 * concern shorthand (the parenthetical forms "Acne (comedonal)",
 * "Stretch marks (early)") that is *not* covered by any regex in
 * `CONCERN_MATCHERS` — i.e. a parenthetical phrasing, a new shorthand,
 * or a matcher we forgot to add. Without this guard, mentions like
 * "Acne (comedonal)" and the bare word "hyperpigmentation" silently
 * fail to link to their guide, which is exactly the regression that
 * justified building this script.
 *
 * Scope notes:
 *  - Generic, intentionally-ambiguous tokens like bare "acne",
 *    "comedonal", or "scar/scars" are *not* checked. None of them map
 *    to a single guide today (acne fans out to four sub-types; "scar"
 *    also names retained scar tissue, etc.) and we'd rather miss them
 *    than chase false positives in every prose paragraph.
 *  - The structured shorthand check (`Acne (...)`, `Stretch marks
 *    (...)`) is what catches the regressions that motivated this
 *    script: those *are* concern labels and should always resolve.
 *
 * Run via: pnpm --filter @workspace/mockup-sandbox run validate:concerns
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import {
  CONCERN_MATCHERS,
  CONCERNS,
} from "../src/components/mockups/evidently/_links";

// ─────────────────────────────────────────────────────────────────────
// Concern keywords. Each entry names a token (or short phrase) that,
// when it appears in brief prose, should resolve to a built concern
// guide via CONCERN_MATCHERS. The `suggested` slug is what the failure
// message proposes adding a matcher for; it's a best-guess hint, not
// a constraint enforced by this script.
//
// Two kinds:
//   - "bare" — a single distinctive word the matchers already treat
//     as a bare-resolving concern reference (hyperpigmentation,
//     photoaging, melasma, rosacea, eczema, dullness, elasticity,
//     wrinkles, fine lines, erythema, comedones, striae, stretch
//     marks, dark circles, sun spots, solar lentigines, atopic /
//     perioral dermatitis, scarring with the -ing suffix only).
//   - "shorthand" — structured concern labels of the form
//     `Acne (qualifier)` / `Stretch marks (qualifier)` that look like
//     a structured concern label and should always resolve, even when
//     the bare token (acne, stretch marks) is otherwise ambiguous.
// ─────────────────────────────────────────────────────────────────────
type Keyword = {
  pattern: RegExp;
  label: string;
  suggested: string;
};

const KEYWORDS: Keyword[] = [
  // Bare-term keywords. The matchers already bare-resolve these and
  // any prose mention should link to the corresponding guide.
  { pattern: /\bhyperpigmentation\b/i,         label: "hyperpigmentation",     suggested: "pih" },
  { pattern: /\bmelasma\b/i,                   label: "melasma",               suggested: "melasma" },
  { pattern: /\bphoto[-\s]?ag(?:e?ing)\b/i,    label: "photoaging",            suggested: "photoaging" },
  { pattern: /\bwrinkles?\b/i,                 label: "wrinkles",              suggested: "fine-lines" },
  { pattern: /\bfine\s+lines?\b/i,             label: "fine lines",            suggested: "fine-lines" },
  { pattern: /\berythema\b/i,                  label: "erythema",              suggested: "rosacea" },
  { pattern: /\brosacea\b/i,                   label: "rosacea",               suggested: "rosacea" },
  { pattern: /\beczema\b/i,                    label: "eczema",                suggested: "eczema" },
  { pattern: /\batopic\s+dermatitis\b/i,       label: "atopic dermatitis",     suggested: "eczema" },
  { pattern: /\bperioral\s+dermatitis\b/i,     label: "perioral dermatitis",   suggested: "perioral-dermatitis" },
  // The matchers resolve `\bscarring\b` but not bare "scar" / "scars"
  // (which often refers to existing scar tissue rather than the
  // scarring concern). Restrict the keyword to the -ing suffix.
  { pattern: /\bscarring\b/i,                  label: "scarring",              suggested: "scarring" },
  { pattern: /\bcomedones?\b/i,                label: "comedones",             suggested: "comedonal-acne" },
  { pattern: /\bstriae\b/i,                    label: "striae",                suggested: "stretch-marks" },
  { pattern: /\bstretch\s+marks?\b/i,          label: "stretch marks",         suggested: "stretch-marks" },
  { pattern: /\bdark\s+circles?\b/i,           label: "dark circles",          suggested: "dark-circles" },
  { pattern: /\bsun\s+spots?\b/i,              label: "sun spots",             suggested: "sun-spots" },
  { pattern: /\bsolar\s+lentig(?:o|ines)\b/i,  label: "solar lentigines",      suggested: "sun-spots" },
  { pattern: /\bdullness\b/i,                  label: "dullness",              suggested: "dullness" },
  { pattern: /\belasticity\b/i,                label: "elasticity",            suggested: "elasticity" },

  // Structured shorthand keywords. These are parenthetical concern
  // labels that should always link, even when the bare token (acne,
  // stretch marks) is otherwise ambiguous in prose.
  { pattern: /\bacne\s*\([^)]+\)/i,            label: "Acne (qualifier)",      suggested: "comedonal-acne / inflammatory-acne / hormonal-acne / fungal-acne" },
  { pattern: /\bstretch\s+marks?\s*\([^)]+\)/i, label: "Stretch marks (qualifier)", suggested: "stretch-marks" },
];

// ─────────────────────────────────────────────────────────────────────
// Allow-list. Strings here are intentional non-matches — they describe
// concern-adjacent buckets that do not have (and should not have) a
// dedicated guide page. Add new entries with a one-line justification.
// ─────────────────────────────────────────────────────────────────────
const ALLOWED_STRINGS: ReadonlyArray<string> = [
  // L-Ascorbic evidence row groups two non-built concerns into a single
  // "lightening" bucket; melasma & PIH are linked separately in the
  // accompanying note.
  "Pigment / lightening",
];

const ALLOWED_SET = new Set(ALLOWED_STRINGS.map((s) => s.toLowerCase()));

// Concern slugs themselves appear in source code as literal strings
// (BUILT maps, CONCERNS records, slug-keyed shelves). Skip those — a
// slug literal isn't human-readable prose and the matchers are not
// expected to catch it.
const SLUG_LITERALS = new Set(Object.keys(CONCERNS));

// ─────────────────────────────────────────────────────────────────────
// Per-matcher span lookup. `slugForConcernName` only tells us *whether*
// any matcher matches the whole string; for prose paragraphs that
// mention several concerns, we need to know whether each individual
// keyword occurrence is covered. Walk every CONCERN_MATCHERS regex
// globally and check that some matcher's span overlaps the keyword's
// match span. Overlap (rather than full containment) is deliberate:
// the structured shorthand "Stretch marks (early)" should count as
// covered because the existing `\bstretch\s+marks?\b` matcher hits the
// prefix even though the parenthetical extends past the matcher span.
// ─────────────────────────────────────────────────────────────────────
function withGlobalFlag(re: RegExp): RegExp {
  return re.flags.includes("g") ? re : new RegExp(re.source, re.flags + "g");
}

const GLOBAL_MATCHERS: Array<[RegExp, string]> = CONCERN_MATCHERS.map(
  ([re, slug]) => [withGlobalFlag(re), slug],
);

function matcherCovers(
  text: string,
  span: { start: number; end: number },
): boolean {
  for (const [re] of GLOBAL_MATCHERS) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const start = m.index;
      const end = m.index + m[0].length;
      // Any non-empty overlap with the keyword span counts as covered.
      if (start < span.end && end > span.start) return true;
      if (m.index === re.lastIndex) re.lastIndex++;
    }
  }
  return false;
}

// ─────────────────────────────────────────────────────────────────────
// Source collection. Walks the prose-bearing files under evidently/
// and pulls every double-quoted string literal. Three families are
// included:
//   - Brief .tsx pages (Ingredient*/Supplement*/Concern*/Routine*/
//     Product*) — the original scope.
//   - The shared catalogue .ts files (`_*Catalogue.ts`) which carry
//     index-row blurbs, deks, taglines, and one-liners that render
//     verbatim on the index hubs and the search overlay.
//   - The Trend Watch article components (`TrendWatch*.tsx`) — column
//     copy that mentions concerns by name.
// All three keep their rendered prose in double-quoted strings, so a
// shared regex catches the relevant copy without needing an AST.
// ─────────────────────────────────────────────────────────────────────
type Source = {
  file: string;
  text: string;
};

const BRIEF_PREFIXES = [
  "Ingredient",
  "Supplement",
  "Concern",
  "Routine",
  "Product",
] as const;

const CATALOGUE_FILES: ReadonlySet<string> = new Set([
  "_concernCatalogue.ts",
  "_ingredientCatalogue.ts",
  "_supplementCatalogue.ts",
  "_routineCatalogue.ts",
  "_productCatalogue.ts",
  "_trendWatchCatalogue.ts",
]);

function isBriefFile(file: string): boolean {
  if (!file.endsWith(".tsx")) return false;
  if (file.startsWith("_")) return false;
  if (file.startsWith("TrendWatch")) return true;
  return BRIEF_PREFIXES.some((p) => file.startsWith(p));
}

function isCatalogueFile(file: string): boolean {
  return CATALOGUE_FILES.has(file);
}

function collectSources(): { sources: Source[]; fileCount: number } {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const briefDir = path.join(
    here,
    "..",
    "src",
    "components",
    "mockups",
    "evidently",
  );

  const allEntries = fs.readdirSync(briefDir).sort();
  const files = allEntries.filter(
    (f) => isBriefFile(f) || isCatalogueFile(f),
  );

  const sources: Source[] = [];
  for (const file of files) {
    const fullPath = path.join(briefDir, file);
    const src = fs.readFileSync(fullPath, "utf8");
    // Strip line comments to avoid pulling stray "// foo wrinkles"
    // tokens that aren't part of the rendered prose.
    const stripped = src.replace(/^\s*\/\/[^\n]*$/gm, "");
    const re = /"((?:[^"\\\n]|\\.)*)"/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(stripped)) !== null) {
      const text = m[1];
      // Skip strings that don't look like prose: too short or no
      // letters at all (CSS-y values like "0.16em", "1px").
      if (text.length < 4) continue;
      const letters = text.replace(/[^a-zA-Z]/g, "").length;
      if (letters < 4) continue;
      // Skip strings that are exactly a known concern slug literal.
      if (SLUG_LITERALS.has(text)) continue;
      sources.push({ file, text });
    }
  }
  return { sources, fileCount: files.length };
}

// ─────────────────────────────────────────────────────────────────────
// Validation.
// ─────────────────────────────────────────────────────────────────────
type Suspect = {
  file: string;
  excerpt: string;
  keyword: string;
  matched: string;
  suggested: string;
};

const { sources, fileCount } = collectSources();

const suspects: Suspect[] = [];
const seen = new Set<string>();

for (const source of sources) {
  if (ALLOWED_SET.has(source.text.toLowerCase())) continue;

  for (const kw of KEYWORDS) {
    const re = withGlobalFlag(kw.pattern);
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(source.text)) !== null) {
      const span = { start: m.index, end: m.index + m[0].length };
      if (matcherCovers(source.text, span)) {
        if (m.index === re.lastIndex) re.lastIndex++;
        continue;
      }

      // Build a focused excerpt around the offending keyword so the
      // failure message points right at the phrase.
      const ctxStart = Math.max(0, span.start - 30);
      const ctxEnd = Math.min(source.text.length, span.end + 30);
      const excerpt =
        (ctxStart > 0 ? "…" : "") +
        source.text.slice(ctxStart, ctxEnd) +
        (ctxEnd < source.text.length ? "…" : "");

      const key = `${source.file}::${kw.label}::${excerpt}`;
      if (!seen.has(key)) {
        seen.add(key);
        suspects.push({
          file: source.file,
          excerpt,
          keyword: kw.label,
          matched: m[0],
          suggested: kw.suggested,
        });
      }
      if (m.index === re.lastIndex) re.lastIndex++;
    }
  }
}

if (suspects.length === 0) {
  console.log(
    `✓ Concern matchers OK — checked ${sources.length} text snippets ` +
      `across ${fileCount} brief / catalogue / Trend Watch files.`,
  );
  process.exit(0);
}

console.error(
  `✗ Found ${suspects.length} concern-shaped phrase(s) with no matcher hit.\n` +
    `   Either add a matcher in artifacts/mockup-sandbox/src/components/` +
    `mockups/evidently/_links.tsx (CONCERN_MATCHERS), reword the phrase ` +
    `on the brief page, or — if the phrase is intentionally not a built ` +
    `concern — add it to ALLOWED_STRINGS in scripts/validate-concern-matchers.ts.\n`,
);
for (const s of suspects) {
  console.error(
    `  • "${s.excerpt}"\n` +
      `      in:        ${s.file}\n` +
      `      keyword:   "${s.matched}" (${s.keyword})\n` +
      `      suggested: add a CONCERN_MATCHERS entry mapping to ${s.suggested}`,
  );
}
process.exit(1);
