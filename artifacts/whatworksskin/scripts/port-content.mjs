// Extracts catalogue + per-detail-page data from the mockup sandbox source
// and writes per-slug JSON content files into src/content/.
//
// Usage: node artifacts/whatworksskin/scripts/port-content.mjs

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..", "..");
const SRC = join(ROOT, "artifacts/mockup-sandbox/src/components/mockups/evidently");
const OUT_BASE = join(__dirname, "..", "src/content");

// ─────────────────────────────────────────────────────────────────────────
// Generic constant extractor
// ─────────────────────────────────────────────────────────────────────────
function stripTypeAssertions(src) {
  // String-aware stripper: only removes ` as const` / ` as <Ident>` /
  // ` as "literal"` outside of string and template literals.
  let out = "";
  let i = 0;
  let inStr = null;   // '"' | "'" | null
  let inTpl = false;
  while (i < src.length) {
    const c = src[i];
    if (inStr) {
      out += c;
      if (c === "\\") { out += src[i + 1] || ""; i += 2; continue; }
      if (c === inStr) inStr = null;
      i++; continue;
    }
    if (inTpl) {
      out += c;
      if (c === "\\") { out += src[i + 1] || ""; i += 2; continue; }
      if (c === "`") inTpl = false;
      i++; continue;
    }
    if (c === '"' || c === "'") { inStr = c; out += c; i++; continue; }
    if (c === "`") { inTpl = true; out += c; i++; continue; }
    // Try to match ` as <something>` here
    if ((c === " " || c === "\t" || c === "\n") && /^\s+as\s+/.test(src.slice(i))) {
      const m = src.slice(i).match(/^\s+as\s+(?:const|readonly\s+\w+|"[^"]*"|'[^']*'|\w+(?:\s*\|\s*\w+)*)/);
      if (m) { i += m[0].length; continue; }
    }
    out += c;
    i++;
  }
  return out;
}

function extractTopLevelConsts(source) {
  // Walk line-by-line, find `const NAME = ` or `export const NAME = `, then
  // balance brackets to find the matching `;` at depth 0.
  const consts = {};
  const re = /^(?:export\s+)?const\s+([A-Z][A-Z0-9_]*)\s*(?::\s*[^=]+)?=\s*([\s\S]*)$/;
  let i = 0;
  const lines = source.split("\n");
  while (i < lines.length) {
    const line = lines[i];
    const m = line.match(re);
    if (!m) { i++; continue; }
    const name = m[1];
    let body = m[2];
    let consumed = 1;
    // Balance brackets / quotes
    function findEnd(text) {
      let depth = 0;
      let inStr = null;
      let inTpl = false;
      for (let j = 0; j < text.length; j++) {
        const c = text[j];
        if (inStr) {
          if (c === "\\") { j++; continue; }
          if (c === inStr) inStr = null;
          continue;
        }
        if (inTpl) {
          if (c === "\\") { j++; continue; }
          if (c === "`") inTpl = false;
          continue;
        }
        if (c === '"' || c === "'") { inStr = c; continue; }
        if (c === "`") { inTpl = true; continue; }
        if (c === "{" || c === "[" || c === "(") depth++;
        else if (c === "}" || c === "]" || c === ")") depth--;
        else if (c === ";" && depth === 0) return j;
      }
      return -1;
    }
    let end = findEnd(body);
    while (end < 0 && i + consumed < lines.length) {
      body += "\n" + lines[i + consumed];
      consumed++;
      end = findEnd(body);
    }
    if (end < 0) { i += consumed; continue; }
    let valueText = body.slice(0, end).trim();
    // Only attempt to evaluate object/array/string/number literals.
    if (!/^[\[\{"`\d\-]/.test(valueText)) {
      i += consumed;
      continue;
    }
    valueText = stripTypeAssertions(valueText);
    // Replace theme references like `T.tierD` with empty strings so eval
    // doesn't choke. They're presentation-only and we don't render them.
    valueText = valueText.replace(/\bT\.\w+/g, '""');
    try {
      const value = new Function("return (" + valueText + ");")();
      consts[name] = value;
    } catch {
      // ignore — likely contains JSX or references identifiers
    }
    i += consumed;
  }
  return consts;
}

function readSourceFile(name) {
  const p = join(SRC, name + ".tsx");
  return readFileSync(p, "utf8");
}

function tryReadConsts(name) {
  try {
    return extractTopLevelConsts(readSourceFile(name));
  } catch (e) {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────
// JSX-prop extractor
//
// Many of the source mockups define their data inline as props on a
// shared template tag, e.g. `<ConcernPage signs={[...]} ingredients={[...]} />`.
// This walks the source from the opening tag forward, parses each
// `name="..."` or `name={...}` pair (with brace/quote/template balancing),
// and evaluates the JS expression bodies inside the braces using the same
// `new Function` trick the const extractor uses.
//
// Returns `null` when the tag isn't present (callers OR with `{}` so they
// can keep destructuring) and the partial-props object on success. Hard
// parse errors inside individual prop expressions are swallowed so a
// single broken prop doesn't sink the whole extraction.
// ─────────────────────────────────────────────────────────────────────────
function extractJsxProps(src, tagName) {
  const tagOpen = `<${tagName}`;
  let idx = -1;
  // Find the opening tag, ensuring it's not part of a longer identifier.
  let from = 0;
  while ((from = src.indexOf(tagOpen, from)) !== -1) {
    const next = src[from + tagOpen.length];
    if (next === undefined || /[\s/>]/.test(next)) { idx = from; break; }
    from += tagOpen.length;
  }
  if (idx < 0) return null;
  let i = idx + tagOpen.length;
  const props = {};
  while (i < src.length) {
    while (i < src.length && /\s/.test(src[i])) i++;
    if (i >= src.length) break;
    if (src[i] === "/" || src[i] === ">") break;
    const nameStart = i;
    while (i < src.length && /[A-Za-z0-9_]/.test(src[i])) i++;
    const propName = src.slice(nameStart, i);
    if (!propName) break;
    while (i < src.length && /\s/.test(src[i])) i++;
    if (src[i] !== "=") {
      props[propName] = true;
      continue;
    }
    i++;
    while (i < src.length && /\s/.test(src[i])) i++;
    if (src[i] === '"' || src[i] === "'") {
      const quote = src[i];
      i++;
      let val = "";
      while (i < src.length && src[i] !== quote) {
        if (src[i] === "\\") { val += src[i + 1] || ""; i += 2; continue; }
        val += src[i++];
      }
      i++;
      props[propName] = val;
    } else if (src[i] === "{") {
      let depth = 1;
      let inStr = null;
      let inTpl = false;
      const start = i + 1;
      i++;
      while (i < src.length && depth > 0) {
        const c = src[i];
        if (inStr) {
          if (c === "\\") { i += 2; continue; }
          if (c === inStr) inStr = null;
          i++; continue;
        }
        if (inTpl) {
          if (c === "\\") { i += 2; continue; }
          if (c === "`") inTpl = false;
          i++; continue;
        }
        if (c === '"' || c === "'") { inStr = c; i++; continue; }
        if (c === "`") { inTpl = true; i++; continue; }
        if (c === "{") depth++;
        else if (c === "}") { depth--; if (depth === 0) break; }
        i++;
      }
      const expr = src.slice(start, i).trim();
      i++;
      let sanitized = stripTypeAssertions(expr).replace(/\bT\.\w+/g, '""');
      try {
        props[propName] = new Function("return (" + sanitized + ");")();
      } catch {
        // ignore — likely contains identifiers we don't have in scope
      }
    } else {
      // Unknown token — bail to avoid running off the rails.
      break;
    }
  }
  return props;
}

function tryReadJsxProps(name, tagName) {
  try {
    return extractJsxProps(readSourceFile(name), tagName);
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Catalogue extraction (for the canonical metadata rows)
// ─────────────────────────────────────────────────────────────────────────
function extractCatalogue(file, exportName) {
  const src = readFileSync(join(SRC, file), "utf8");
  // Find `export const EXPORT: TYPE = [ ... ];` or similar.
  const re = new RegExp(
    `(?:export\\s+)?const\\s+${exportName}(?:\\s*:\\s*[^=]+)?\\s*=\\s*([\\s\\S]*)$`,
    "m"
  );
  const m = src.match(re);
  if (!m) throw new Error(`Could not find ${exportName} in ${file}`);
  const startIdx = m.index + m[0].indexOf("=") + 1;
  const tail = src.slice(startIdx);
  // Balance brackets to find matching `;`
  let depth = 0, inStr = null, inTpl = false;
  let j = 0;
  for (; j < tail.length; j++) {
    const c = tail[j];
    if (inStr) {
      if (c === "\\") { j++; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (inTpl) {
      if (c === "\\") { j++; continue; }
      if (c === "`") inTpl = false;
      continue;
    }
    if (c === '"' || c === "'") { inStr = c; continue; }
    if (c === "`") { inTpl = true; continue; }
    if (c === "{" || c === "[" || c === "(") depth++;
    else if (c === "}" || c === "]" || c === ")") depth--;
    else if (c === ";" && depth === 0) break;
  }
  const body = stripTypeAssertions(tail.slice(0, j).trim());
  return new Function("return (" + body + ");")();
}

// ─────────────────────────────────────────────────────────────────────────
// Output helpers
// ─────────────────────────────────────────────────────────────────────────
function ensureCleanDir(p) {
  if (existsSync(p)) {
    for (const f of readdirSync(p)) {
      rmSync(join(p, f), { force: true, recursive: true });
    }
  } else {
    mkdirSync(p, { recursive: true });
  }
}

function writeJson(dir, slug, data) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${slug}.json`), JSON.stringify(data, null, 2) + "\n");
}

// ─────────────────────────────────────────────────────────────────────────
// Catalogues
// ─────────────────────────────────────────────────────────────────────────
const CONCERN_ROWS = extractCatalogue("_concernCatalogue.ts", "CONCERN_ROWS");
const CONCERN_BUILT = extractCatalogue("_concernCatalogue.ts", "CONCERN_BUILT");
const ROUTINE_ROWS = extractCatalogue("_routineCatalogue.ts", "ROUTINE_ROWS");
const ROUTINE_BUILT = extractCatalogue("_routineCatalogue.ts", "ROUTINE_BUILT");
const SUPPLEMENT_ROWS = extractCatalogue("_supplementCatalogue.ts", "SUPPLEMENT_ROWS");
const SUPPLEMENT_BUILT = extractCatalogue("_supplementCatalogue.ts", "SUPPLEMENT_BUILT");
const PRODUCTS_CATALOGUE = extractCatalogue("_productCatalogue.ts", "PRODUCTS");
const TREND_WATCH_ISSUES = extractCatalogue("_trendWatchCatalogue.ts", "TREND_WATCH_ISSUES");
const TREND_WATCH_BUILT = extractCatalogue("_trendWatchCatalogue.ts", "TREND_WATCH_BUILT");

// ─────────────────────────────────────────────────────────────────────────
// CONCERNS
// ─────────────────────────────────────────────────────────────────────────
function buildConcerns() {
  const dir = join(OUT_BASE, "concerns");
  ensureCleanDir(dir);
  // Use the slug → component map but skip duplicate `barrier` alias —
  // the canonical slug is `compromised-barrier`.
  const seen = new Set();
  for (const slug of Object.keys(CONCERN_BUILT)) {
    if (slug === "barrier") continue;
    if (seen.has(slug)) continue;
    seen.add(slug);
    const row = CONCERN_ROWS.find(r => r.slug === slug);
    if (!row) continue;
    const compName = CONCERN_BUILT[slug];
    const consts = tryReadConsts(compName) || {};
    // JSX-prop pages pass `signs / ingredients / phases / bottom / hero1 / hero2`
    // to <ConcernPage>. Top-level-const pages (rosacea, melasma, etc.) define
    // TRIGGERS / INGREDIENTS / PRODUCTS / PHASES directly. We try both and
    // merge with const-form winning since it's the older, fuller shape.
    const jsx = tryReadJsxProps(compName, "ConcernPage") || {};

    // Pick the most common shapes
    const triggers = consts.TRIGGERS || consts.SIGNS || consts.PATTERNS || consts.DRIVERS || consts.CAUSES || consts.FACTORS || jsx.signs || null;
    const ingredients = consts.INGREDIENTS || consts.MOLECULES || jsx.ingredients || [];
    const products = consts.PRODUCTS || consts.SHELF || [];
    const phases = consts.PHASES || consts.PROTOCOL || consts.TIMELINE || jsx.phases || null;
    const protocolAm = consts.PROTOCOL_AM || consts.AM || null;
    const protocolPm = consts.PROTOCOL_PM || consts.PM || null;
    const faq = consts.FAQ || null;
    const avoid = consts.AVOID || null;
    const supplements = consts.SUPPLEMENTS || null;
    const bottom = typeof jsx.bottom === "string" ? jsx.bottom : undefined;
    const hero1 = typeof jsx.hero1 === "string" ? jsx.hero1 : undefined;
    const hero2 = typeof jsx.hero2 === "string" ? jsx.hero2 : undefined;

    const out = {
      slug,
      name: row.name,
      family: row.family,
      eyebrow: row.eyebrow,
      dek: row.dek,
      oneliner: row.oneliner,
      reviewer: row.reviewer,
      pageRef: `P. ${(15 + Object.keys(CONCERN_BUILT).indexOf(slug)).toString()}`,
      filed: "22 APR 2026",
      hero1,
      hero2,
      bottom,
      triggers: triggers && Array.isArray(triggers) ? triggers : undefined,
      ingredients: Array.isArray(ingredients) && ingredients.length > 0 ? ingredients : undefined,
      products: Array.isArray(products) && products.length > 0 ? products : undefined,
      phases: phases && Array.isArray(phases) ? phases : undefined,
      protocolAm: Array.isArray(protocolAm) ? protocolAm : undefined,
      protocolPm: Array.isArray(protocolPm) ? protocolPm : undefined,
      avoid: Array.isArray(avoid) ? avoid : undefined,
      supplements: Array.isArray(supplements) ? supplements : undefined,
      faq: Array.isArray(faq) ? faq : undefined,
    };
    writeJson(dir, slug, prune(out));
  }
}

function prune(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    out[k] = v;
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────
// ROUTINES
// ─────────────────────────────────────────────────────────────────────────
function buildRoutines() {
  const dir = join(OUT_BASE, "routines");
  ensureCleanDir(dir);
  const seen = new Set();
  for (const slug of Object.keys(ROUTINE_BUILT)) {
    if (seen.has(slug)) continue;
    seen.add(slug);
    const row = ROUTINE_ROWS.find(r => r.slug === slug);
    if (!row) continue;
    const compName = ROUTINE_BUILT[slug];
    const consts = tryReadConsts(compName) || {};
    const steps = consts.STEPS || consts.ROUTINE || null;
    const timeline = consts.TIMELINE || null;
    const forbidden = consts.FORBIDDEN || null;

    const out = {
      slug,
      title: row.title,
      sub: row.sub,
      goal: row.goal,
      time: row.time,
      skinType: row.skinType,
      stepCount: row.steps,
      minutes: row.minutes,
      cost: row.cost,
      difficulty: row.difficulty,
      body: row.body,
      reviewer: row.reviewer,
      pageRef: `P. ${(4 + Object.keys(ROUTINE_BUILT).indexOf(slug)).toString().padStart(2, "0")}`,
      filed: "20 APR 2026",
      eyebrow: `Routine · ${row.sub}`,
      steps: Array.isArray(steps) ? steps : undefined,
      timeline: Array.isArray(timeline) ? timeline : undefined,
      forbidden: Array.isArray(forbidden) ? forbidden : undefined,
    };
    writeJson(dir, slug, prune(out));
  }
}

// ─────────────────────────────────────────────────────────────────────────
// SUPPLEMENTS
// ─────────────────────────────────────────────────────────────────────────
function buildSupplements() {
  const dir = join(OUT_BASE, "supplements");
  ensureCleanDir(dir);
  // Canonical slugs (skip aliases that point to same component)
  const aliasMap = { "polypodium-leucotomos": "polypodium", "collagen": "collagen-peptides" };
  const seen = new Set();
  for (const slug of Object.keys(SUPPLEMENT_BUILT)) {
    if (aliasMap[slug]) continue;
    if (seen.has(slug)) continue;
    seen.add(slug);
    const row = SUPPLEMENT_ROWS.find(r => r.slug === slug);
    if (!row) continue;
    const compName = SUPPLEMENT_BUILT[slug];
    const consts = tryReadConsts(compName) || {};
    // JSX-prop pages pass `family/name/page/eyebrow/hero/subheadA/subheadB/dek
    // /evidence/forms/faq/bottom` to <SupplementPage>. Top-level-const pages
    // (polypodium, astaxanthin, collagen-peptides, zinc) define EVIDENCE etc.
    // directly. Try both.
    const jsx = tryReadJsxProps(compName, "SupplementPage") || {};

    const evidence = consts.EVIDENCE || consts.TRIALS || jsx.evidence || null;
    const forms = consts.FORMS || consts.STACK || consts.COMPARE || consts.BRANDS || jsx.forms || null;
    const faq = consts.FAQ || jsx.faq || null;
    const glance = consts.GLANCE_ROWS || null;
    const dek = typeof jsx.dek === "string" ? jsx.dek : undefined;
    const subheadA = typeof jsx.subheadA === "string" ? jsx.subheadA : undefined;
    const subheadB = typeof jsx.subheadB === "string" ? jsx.subheadB : undefined;
    const bottom = typeof jsx.bottom === "string" ? jsx.bottom : undefined;
    const heroOverride = typeof jsx.hero === "string" ? jsx.hero.replace(/\.$/, "") : undefined;

    const out = {
      slug,
      name: row.name,
      family: row.family,
      target: row.target,
      tier: row.tier,
      dose: row.dose,
      rxOnly: row.rxOnly || false,
      oneliner: row.oneliner,
      pageRef: `P. ${(4 + Object.keys(SUPPLEMENT_BUILT).indexOf(slug)).toString().padStart(2, "0")}`,
      filed: "17 APR 2026",
      eyebrow: typeof jsx.eyebrow === "string" ? jsx.eyebrow : `Supplement · ${row.family} · ${row.name}`,
      headline: heroOverride || row.name,
      dek,
      subheadA,
      subheadB,
      bottom,
      glance: glance ? glance : undefined,
      evidence: Array.isArray(evidence) ? evidence : undefined,
      forms: Array.isArray(forms) ? forms : undefined,
      faq: Array.isArray(faq) ? faq : undefined,
    };
    writeJson(dir, slug, prune(out));
  }
}

// ─────────────────────────────────────────────────────────────────────────
// TREND WATCH
// ─────────────────────────────────────────────────────────────────────────
function buildTrendWatch() {
  const dir = join(OUT_BASE, "trend-watch");
  ensureCleanDir(dir);
  for (const issue of TREND_WATCH_ISSUES) {
    const compName = TREND_WATCH_BUILT[issue.n];
    if (!compName) continue;
    const consts = tryReadConsts(compName) || {};
    const verdicts = consts.VERDICTS || [];
    const slug = `issue-${String(issue.n).padStart(3, "0")}`;
    const out = {
      slug,
      n: issue.n,
      date: issue.date,
      year: issue.year,
      headline: issue.headline,
      dek: issue.dek,
      signed: issue.signed,
      pageRef: `P. ${String(issue.n).padStart(2, "0")}`,
      eyebrow: `Trend Watch · Issue ${String(issue.n).padStart(3, "0")} · ${issue.date}`,
      verdicts: Array.isArray(verdicts) && verdicts.length > 0 ? verdicts : issue.trends.map((t, i) => ({
        n: i + 1, name: t.name, verdict: t.verdict, body: "", tier: "B"
      })),
    };
    writeJson(dir, slug, prune(out));
  }
}

// ─────────────────────────────────────────────────────────────────────────
// PRODUCTS
// ─────────────────────────────────────────────────────────────────────────
function slugifyProductName(brand, name) {
  return (brand + "-" + name)
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildProducts() {
  const dir = join(OUT_BASE, "products");
  ensureCleanDir(dir);
  for (const p of PRODUCTS_CATALOGUE) {
    if (!p.component) continue;
    const consts = tryReadConsts(p.component) || {};
    // ProductTemplate-shaped pages declare a single `D: ProductData` const
    // and pass it as `<ProductTemplate d={D} />`. Bespoke pages declare
    // SCORE_BREAKDOWN / INGREDIENTS / USE_CASES / etc. as top-level consts.
    // Always check D first, then fall back to top-level consts.
    const D = consts.D || {};
    const scoreBreakdown = D.scoreBreakdown || consts.SCORE_BREAKDOWN || consts.SCORES || null;
    const ingredients = D.ingredients || consts.INGREDIENTS || null;
    const useCases = D.useCases || consts.USE_CASES || consts.USES || null;
    const alts = D.alts || consts.ALTS || consts.ALTERNATIVES || consts.VS || null;
    const faq = D.faq || consts.FAQ || null;
    const sources = D.sources || consts.SOURCES || null;
    const facts = D.facts || consts.FACTS || null;

    // Read the source for fallbacks (eyebrow/pageRef regex picks up bespoke
    // pages that emit those tags inline; D-shaped pages pull them from D).
    let src = "";
    try { src = readSourceFile(p.component); } catch {}
    const eyebrowMatch = src.match(/<Eyebrow[^>]*>\s*([A-Za-z0-9·\s\-+&%']+?)\s*<\/Eyebrow>/);
    const pageRefMatch = src.match(/(P\.\s*\d+)\s*·\s*REVIEW/);

    const slug = slugifyProductName(p.brand, p.name);
    const out = {
      slug,
      brand: p.brand,
      name: p.name,
      category: D.category,
      tagline: D.tagline,
      reviewer: D.reviewer,
      tier: D.tier || p.tier || "B",
      pageRef: D.pageRef || (pageRefMatch ? pageRefMatch[1] : `P. ${PRODUCTS_CATALOGUE.indexOf(p) + 1}`),
      filed: D.filed || "22 APR 2026",
      eyebrow: D.eyebrow || (eyebrowMatch ? eyebrowMatch[1].trim() : `Product · ${p.brand}`),
      hero: D.hero || extractHeroLead(src) || `${p.brand} ${p.name}.`,
      score: scoreBreakdown ? scoreBreakdown.reduce((a, b) => a + (b.v || 0), 0) : undefined,
      maxScore: scoreBreakdown ? scoreBreakdown.reduce((a, b) => a + (b.max || 25), 0) : undefined,
      scoreBreakdown: Array.isArray(scoreBreakdown) ? scoreBreakdown : undefined,
      ingredients: Array.isArray(ingredients) ? ingredients : (Array.isArray(p.ingredients) ? p.ingredients.map(i => ({ i, role: "", note: "" })) : undefined),
      useCases: Array.isArray(useCases) ? useCases : undefined,
      alts: Array.isArray(alts) ? alts : undefined,
      facts: Array.isArray(facts) ? facts : undefined,
      faq: Array.isArray(faq) ? faq : undefined,
      sources: Array.isArray(sources) ? sources : undefined,
    };
    writeJson(dir, slug, prune(out));
  }
}

function extractHeroLead(src) {
  // Find the first <p ... fontSize: 21 ...> ... </p> after the H1 — that's the
  // hero lead in the mockups. Use a permissive regex.
  const m = src.match(/<p[^>]*fontSize:\s*21[^>]*>\s*([\s\S]+?)\s*<\/p>/);
  if (!m) return null;
  return m[1].replace(/\{[^}]+\}/g, "").replace(/<[^>]+>/g, "").trim();
}

// ─────────────────────────────────────────────────────────────────────────
// Thin-page detector
//
// After extraction, walk each per-kind output directory and flag slugs whose
// JSON has only hero/glance metadata — i.e. none of the body-section keys
// listed below are present and non-empty. These are pages that render with
// just a hero and no `§` sections; an editor needs to enrich the source
// mockup (either as top-level constants or as JSX props on the template tag)
// before the catalogue page becomes useful.
//
// `EXPECTED_SKINNY` lists slugs that are intentionally thin in the source
// mockups — they are reported separately so editors can see them, but kept
// out of the "needs enrichment" warning list.
// ─────────────────────────────────────────────────────────────────────────
import { BODY_SECTIONS, summariseThinPages } from "./lib/thin-content.mjs";

function findThinPages() {
  const entries = [];
  for (const kind of Object.keys(BODY_SECTIONS)) {
    const dir = join(OUT_BASE, kind);
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir).sort()) {
      if (!file.endsWith(".json")) continue;
      const slug = file.replace(/\.json$/, "");
      let data;
      try {
        data = JSON.parse(readFileSync(join(dir, file), "utf8"));
      } catch {
        continue;
      }
      entries.push({ kind, slug, data });
    }
  }
  // Drop kinds whose output directory does not exist, mirroring the
  // pre-refactor behaviour where missing dirs simply skipped the kind.
  const report = summariseThinPages(entries);
  for (const kind of Object.keys(report)) {
    if (!existsSync(join(OUT_BASE, kind))) delete report[kind];
  }
  return report;
}

function printThinReport(report) {
  const totalThin = Object.values(report).reduce((a, r) => a + r.thin.length, 0);
  const totalPartial = Object.values(report).reduce(
    (a, r) => a + (r.partiallyThin ? r.partiallyThin.length : 0),
    0,
  );
  const totalExpected = Object.values(report).reduce((a, r) => a + r.expectedSkinny.length, 0);
  console.log("");
  console.log("Thin-content report:");
  if (totalThin === 0 && totalPartial === 0) {
    console.log("  (no thin pages — every catalogue entry has at least one body section)");
  } else if (totalThin > 0) {
    console.log(`  ${totalThin} page(s) need enrichment (only hero/glance metadata — no § sections):`);
    for (const [kind, { thin }] of Object.entries(report)) {
      if (thin.length === 0) continue;
      console.log(`    ${kind}:`);
      for (const slug of thin) console.log(`      - ${slug}`);
    }
  }
  if (totalPartial > 0) {
    console.log(`  ${totalPartial} page(s) partially thin (some verdicts still placeholder rows):`);
    for (const [kind, { partiallyThin }] of Object.entries(report)) {
      if (!partiallyThin || partiallyThin.length === 0) continue;
      console.log(`    ${kind}:`);
      for (const { slug, emptyIndices } of partiallyThin) {
        console.log(`      - ${slug} (verdicts ${emptyIndices.join(", ")})`);
      }
    }
  }
  if (totalExpected > 0) {
    console.log(`  ${totalExpected} page(s) intentionally skinny (excluded from warning list):`);
    for (const [kind, { expectedSkinny }] of Object.entries(report)) {
      if (expectedSkinny.length === 0) continue;
      console.log(`    ${kind}:`);
      for (const slug of expectedSkinny) console.log(`      - ${slug}`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────
buildConcerns();
buildRoutines();
buildSupplements();
buildTrendWatch();
buildProducts();

// Summary
function count(dir) { return existsSync(dir) ? readdirSync(dir).length : 0; }
console.log("Wrote:");
console.log("  concerns:", count(join(OUT_BASE, "concerns")));
console.log("  routines:", count(join(OUT_BASE, "routines")));
console.log("  supplements:", count(join(OUT_BASE, "supplements")));
console.log("  trend-watch:", count(join(OUT_BASE, "trend-watch")));
console.log("  products:", count(join(OUT_BASE, "products")));

const thinReport = findThinPages();
printThinReport(thinReport);
writeFileSync(
  join(__dirname, "thin-content-report.json"),
  JSON.stringify(thinReport, null, 2) + "\n"
);
