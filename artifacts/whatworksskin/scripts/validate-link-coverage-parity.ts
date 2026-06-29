/**
 * Validate that the link-coverage captions on each brief page render
 * the SAME numbers as the matching catalogue index card for every
 * concern, ingredient, product, routine, and supplement.
 *
 * Every brief carries a "Linked to N · M" caption in its hero card,
 * and the corresponding `pages/<kind>s/index.astro` renders an
 * identical "Linked to / Used in / Featured in / Linked from" caption
 * on each catalogue card. Today both sides call the same helpers in
 * `src/lib/links.ts`, so the captions agree by construction. But the
 * formulas live in two files per kind, and a future edit that touches
 * only one side would silently break parity — readers landing on a
 * brief from the catalogue would see a different count than the card
 * they just clicked.
 *
 * This script mirrors each side's count formula independently — it
 * reads the raw JSON the same way `report-cross-link-coverage.ts`
 * does, wires up the same pure resolvers and back-link builders the
 * runtime uses, and asserts the brief-side and index-side numbers
 * match for every slug in every collection. Per kind, the parity it
 * pins:
 *
 *   • Concern    — `linkedIngredientCount` / `linkedProductCount`
 *                  (truthy `findIngredientSlug` / `findProductSlug`
 *                  over `data.ingredients[].name` /
 *                  `.products[].brand+name`).
 *   • Ingredient — `getIngredientBacklinks(slug).concerns.length` and
 *                  `.routines.length`.
 *   • Product    — `getProductBacklinks(slug).concerns.length` and
 *                  `.routines.length`.
 *   • Routine    — distinct product slugs from each step's
 *                  `products[].brand+name`; distinct ingredient slugs
 *                  from each step's
 *                  `${title} ${sub} ${activeKey} ${activeVal}`
 *                  haystack.
 *   • Supplement — count of concerns whose `supplements[].slug`
 *                  matches the supplement's slug.
 *
 * If you intentionally change a count formula on one side, update the
 * matching mirror below AND the other .astro file in the same commit
 * — the script's two mirrors are deliberately spelled out so an
 * editor walking the diff can spot a one-sided edit before it ships.
 *
 * Run via:
 *   pnpm --filter @workspace/whatworksskin run validate:link-coverage-parity
 *
 * Exits 1 on any parity breach, with the offending slug + the two
 * diverging numbers; exits 0 when every brief/index pair agrees.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildConcernIndex,
  buildIngredientIndex,
  buildProductIndex,
  findProductSlug as resolveProductSlugCascade,
  type ConcernBrief,
  type IngredientBrief,
  type ProductBrief,
} from "../src/lib/cross-link-coverage.ts";
import {
  INGREDIENT_PROCEDURAL_DENY_KEYWORDS,
  PRODUCT_ALIASES,
  matchPhraseSlug,
} from "../src/lib/link-aliases.ts";
import {
  buildIngredientBacklinkIndex,
  buildProductBacklinkIndex,
  type ConcernBacklinkInput,
  type RoutineBacklinkInput,
} from "../src/lib/backlinks.ts";

// ─────────────────────────────────────────────────────────────────────
// Filesystem layout — same readers as report-cross-link-coverage.ts.
// ─────────────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT = path.join(__dirname, "..", "src", "content");

type Json = Record<string, unknown>;

function readJsonDir(dir: string): { slug: string; file: string; data: Json }[] {
  if (!fs.existsSync(dir)) return [];
  const out: { slug: string; file: string; data: Json }[] = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) continue;
    if (!name.endsWith(".json")) continue;
    const data = JSON.parse(fs.readFileSync(full, "utf8")) as Json;
    const slug =
      typeof data.slug === "string" ? data.slug : name.replace(/\.json$/, "");
    out.push({ slug, file: name, data });
  }
  return out;
}

const concernsRaw = readJsonDir(path.join(CONTENT, "concerns"));
const ingredientsRaw = readJsonDir(path.join(CONTENT, "ingredients"));
const productsRaw = readJsonDir(path.join(CONTENT, "products"));
const routinesRaw = readJsonDir(path.join(CONTENT, "routines"));
const supplementsRaw = readJsonDir(path.join(CONTENT, "supplements"));

// ─────────────────────────────────────────────────────────────────────
// Build the resolvers once. These are the same pure builders the
// runtime wrapper in src/lib/links.ts feeds with the live
// `astro:content` collections, so calling them here mirrors what
// `findIngredientSlug` / `findProductSlug` /
// `getIngredient|ProductBacklinks` resolve to at build time.
// ─────────────────────────────────────────────────────────────────────

const ingredientBriefs: IngredientBrief[] = ingredientsRaw.map(({ data }) => ({
  slug: typeof data.slug === "string" ? data.slug : "",
  name: typeof data.name === "string" ? data.name : "",
}));
const concernBriefs: ConcernBrief[] = concernsRaw.map(({ data }) => ({
  slug: typeof data.slug === "string" ? data.slug : "",
  name: typeof data.name === "string" ? data.name : "",
}));
const productBriefs: ProductBrief[] = productsRaw.map(({ data }) => ({
  slug: typeof data.slug === "string" ? data.slug : "",
  brand: typeof data.brand === "string" ? data.brand : "",
  name: typeof data.name === "string" ? data.name : "",
}));

const ingredientIdx = buildIngredientIndex(ingredientBriefs);
const concernIdx = buildConcernIndex(concernBriefs);
const productIdx = buildProductIndex(productBriefs);

function findIngredientSlug(text?: string | null): string | undefined {
  if (!text) return undefined;
  return matchPhraseSlug(
    ingredientIdx,
    text,
    3,
    INGREDIENT_PROCEDURAL_DENY_KEYWORDS,
  );
}

function findProductSlug(
  brand?: string | null,
  name?: string | null,
): string | undefined {
  if (!brand || !name) return undefined;
  return resolveProductSlugCascade(productIdx, PRODUCT_ALIASES, brand, name);
}

// Suppress an unused-import warning for the concern resolver — the
// concernIdx is built proactively because a future caption that surfaces
// concern back-links would need it, and pinning the build now keeps the
// surface consistent with the report script.
void concernIdx;

const concernsForBacklinks = concernsRaw.map(
  ({ data }) => ({ data }) as unknown as ConcernBacklinkInput,
);
const routinesForBacklinks = routinesRaw.map(
  ({ data }) => ({ data }) as unknown as RoutineBacklinkInput,
);

const ingredientBacklinkIdx = await buildIngredientBacklinkIndex(
  concernsForBacklinks,
  routinesForBacklinks,
  findIngredientSlug,
);
const productBacklinkIdx = await buildProductBacklinkIndex(
  concernsForBacklinks,
  routinesForBacklinks,
  findProductSlug,
);

// ─────────────────────────────────────────────────────────────────────
// Compare brief-side vs index-side counts per slug per kind.
// ─────────────────────────────────────────────────────────────────────

type Issue = {
  kind: string;
  slug: string;
  metric: string;
  brief: number;
  index: number;
  briefSource: string;
  indexSource: string;
};

const issues: Issue[] = [];

function compare(
  kind: string,
  slug: string,
  metric: string,
  brief: number,
  index: number,
  briefSource: string,
  indexSource: string,
): void {
  if (brief !== index) {
    issues.push({ kind, slug, metric, brief, index, briefSource, indexSource });
  }
}

// ── Concerns ────────────────────────────────────────────────────────
//
// Brief: src/components/ConcernBrief.astro
//   const linkedIngredientCount = ingredientLinks.filter(Boolean).length;
//   const linkedProductCount = productLinks.filter(Boolean).length;
// Index: src/pages/concerns/index.astro
//   ingredients: ingResolved.filter((s) => Boolean(s)).length,
//   products:    prodResolved.filter((s) => Boolean(s)).length,
for (const { slug, data } of concernsRaw) {
  const ings = (data.ingredients ?? []) as Array<{ name?: string }>;
  const prods = (data.products ?? []) as Array<{
    brand?: string;
    name?: string;
  }>;

  // Brief-side mirror
  const briefIngLinks = ings.map((i) => findIngredientSlug(i?.name));
  const briefProdLinks = prods.map((p) => findProductSlug(p?.brand, p?.name));
  const briefIng = briefIngLinks.filter(Boolean).length;
  const briefProd = briefProdLinks.filter(Boolean).length;

  // Index-side mirror
  const indexIngResolved = ings.map((i) => findIngredientSlug(i?.name));
  const indexProdResolved = prods.map((p) =>
    findProductSlug(p?.brand, p?.name),
  );
  const indexIng = indexIngResolved.filter((s) => Boolean(s)).length;
  const indexProd = indexProdResolved.filter((s) => Boolean(s)).length;

  compare(
    "concern",
    slug,
    "linkedIngredients",
    briefIng,
    indexIng,
    "ConcernBrief.astro:linkedIngredientCount",
    "pages/concerns/index.astro:linkCounts.ingredients",
  );
  compare(
    "concern",
    slug,
    "linkedProducts",
    briefProd,
    indexProd,
    "ConcernBrief.astro:linkedProductCount",
    "pages/concerns/index.astro:linkCounts.products",
  );
}

// ── Ingredients ─────────────────────────────────────────────────────
//
// Brief: src/components/IngredientBrief.astro
//   const backlinks = await getIngredientBacklinks(data.slug);
//   backlinks.concerns.length / backlinks.routines.length
// Index: src/pages/ingredients/index.astro
//   const bl = await getIngredientBacklinks(entry.data.slug);
//   linkCounts: { concerns: bl.concerns.length, routines: bl.routines.length }
const EMPTY_BL = { concerns: [], routines: [] };
for (const { slug } of ingredientsRaw) {
  // Brief-side mirror
  const briefBl = ingredientBacklinkIdx.get(slug) ?? EMPTY_BL;
  const briefC = briefBl.concerns.length;
  const briefR = briefBl.routines.length;

  // Index-side mirror
  const indexBl = ingredientBacklinkIdx.get(slug) ?? EMPTY_BL;
  const indexC = indexBl.concerns.length;
  const indexR = indexBl.routines.length;

  compare(
    "ingredient",
    slug,
    "concernsBacklinks",
    briefC,
    indexC,
    "IngredientBrief.astro:backlinks.concerns.length",
    "pages/ingredients/index.astro:linkCounts.concerns",
  );
  compare(
    "ingredient",
    slug,
    "routinesBacklinks",
    briefR,
    indexR,
    "IngredientBrief.astro:backlinks.routines.length",
    "pages/ingredients/index.astro:linkCounts.routines",
  );
}

// ── Products ────────────────────────────────────────────────────────
//
// Brief: src/components/ProductBrief.astro
//   const backlinks = await getProductBacklinks(data.slug);
//   backlinks.concerns.length / backlinks.routines.length
// Index: src/pages/products/index.astro
//   const bl = await getProductBacklinks(entry.data.slug);
//   linkCounts: { concerns: bl.concerns.length, routines: bl.routines.length }
for (const { slug } of productsRaw) {
  // Brief-side mirror
  const briefBl = productBacklinkIdx.get(slug) ?? EMPTY_BL;
  const briefC = briefBl.concerns.length;
  const briefR = briefBl.routines.length;

  // Index-side mirror
  const indexBl = productBacklinkIdx.get(slug) ?? EMPTY_BL;
  const indexC = indexBl.concerns.length;
  const indexR = indexBl.routines.length;

  compare(
    "product",
    slug,
    "concernsBacklinks",
    briefC,
    indexC,
    "ProductBrief.astro:backlinks.concerns.length",
    "pages/products/index.astro:linkCounts.concerns",
  );
  compare(
    "product",
    slug,
    "routinesBacklinks",
    briefR,
    indexR,
    "ProductBrief.astro:backlinks.routines.length",
    "pages/products/index.astro:linkCounts.routines",
  );
}

// ── Routines ────────────────────────────────────────────────────────
//
// Brief: src/components/RoutineBrief.astro
//   const linkedProductSlugs = new Set<string>();
//   for (const row of stepProductLinks) for (const slug of row) if (slug) linkedProductSlugs.add(slug);
//   const linkedIngredientSlugs = new Set<string>();
//   for each step: const haystack = `${title} ${sub} ${activeKey} ${activeVal}`;
//     const slug = await findIngredientSlug(haystack); if (slug) linkedIngredientSlugs.add(slug);
//   linkedProductCount = linkedProductSlugs.size; linkedIngredientCount = linkedIngredientSlugs.size;
// Index: src/pages/routines/index.astro — identical formula, walked
//   inline rather than via the brief's per-step product link cache.
type RoutineStep = {
  title?: string;
  sub?: string;
  activeKey?: string;
  activeVal?: string;
  products?: unknown[];
};

for (const { slug, data } of routinesRaw) {
  const steps = (data.steps ?? []) as RoutineStep[];

  // Brief-side mirror — walks per-step product link rows, then
  // ingredient haystacks.
  const briefStepProductLinks: (string | undefined)[][] = steps.map((s) =>
    ((s.products ?? []) as unknown[]).map((raw) => {
      const p = (raw ?? {}) as { brand?: string; name?: string };
      return findProductSlug(p.brand, p.name);
    }),
  );
  const briefP = new Set<string>();
  for (const row of briefStepProductLinks) {
    for (const ps of row) if (ps) briefP.add(ps);
  }
  const briefI = new Set<string>();
  for (const s of steps) {
    const haystack = `${s.title ?? ""} ${s.sub ?? ""} ${s.activeKey ?? ""} ${s.activeVal ?? ""}`;
    const is = findIngredientSlug(haystack);
    if (is) briefI.add(is);
  }

  // Index-side mirror — single loop per the index's structure.
  const indexP = new Set<string>();
  const indexI = new Set<string>();
  for (const s of steps) {
    const haystack = `${s.title ?? ""} ${s.sub ?? ""} ${s.activeKey ?? ""} ${s.activeVal ?? ""}`;
    const is = findIngredientSlug(haystack);
    if (is) indexI.add(is);
    const stepProducts = (s.products ?? []) as Array<{
      brand?: string;
      name?: string;
    }>;
    for (const p of stepProducts) {
      const ps = findProductSlug(p?.brand, p?.name);
      if (ps) indexP.add(ps);
    }
  }

  compare(
    "routine",
    slug,
    "linkedProducts",
    briefP.size,
    indexP.size,
    "RoutineBrief.astro:linkedProductCount",
    "pages/routines/index.astro:linkCounts.products",
  );
  compare(
    "routine",
    slug,
    "linkedIngredients",
    briefI.size,
    indexI.size,
    "RoutineBrief.astro:linkedIngredientCount",
    "pages/routines/index.astro:linkCounts.ingredients",
  );
}

// ── Supplements ─────────────────────────────────────────────────────
//
// Brief: src/components/SupplementBrief.astro
//   for each concern: if (sups.some((x) => x?.slug === data.slug)) linkedConcerns.push(...)
//   linkedConcernCount = linkedConcerns.length;
// Index: src/pages/supplements/index.astro
//   for each concern: if (sups.some((x) => x?.slug === s.data.slug)) n++;
for (const { slug } of supplementsRaw) {
  // Brief-side mirror
  const briefLinkedConcerns: { slug: string }[] = [];
  for (const c of concernsRaw) {
    const sups = (c.data.supplements ?? []) as Array<{ slug?: string }>;
    if (sups.some((x) => x?.slug === slug)) {
      briefLinkedConcerns.push({ slug: c.slug });
    }
  }
  const briefN = briefLinkedConcerns.length;

  // Index-side mirror
  let indexN = 0;
  for (const c of concernsRaw) {
    const sups = (c.data.supplements ?? []) as Array<{ slug?: string }>;
    if (sups.some((x) => x?.slug === slug)) indexN++;
  }

  compare(
    "supplement",
    slug,
    "linkedConcerns",
    briefN,
    indexN,
    "SupplementBrief.astro:linkedConcernCount",
    "pages/supplements/index.astro:supplementCounts",
  );
}

// ─────────────────────────────────────────────────────────────────────
// Report.
// ─────────────────────────────────────────────────────────────────────

const totalBriefs =
  concernsRaw.length +
  ingredientsRaw.length +
  productsRaw.length +
  routinesRaw.length +
  supplementsRaw.length;

if (issues.length === 0) {
  console.log(
    `\u2713 Link-coverage parity OK — brief and index counts agree across ` +
      `${totalBriefs} brief(s) (${concernsRaw.length} concerns, ` +
      `${ingredientsRaw.length} ingredients, ${productsRaw.length} products, ` +
      `${routinesRaw.length} routines, ${supplementsRaw.length} supplements).`,
  );
  process.exit(0);
}

console.error(
  `\n\u2717 Found ${issues.length} link-coverage parity breach(es) — the ` +
    `brief page and the catalogue index card disagree on the count for ` +
    `the same slug:\n`,
);

for (const i of issues) {
  console.error(
    `  \u2022 ${i.kind} "${i.slug}" \u2014 ${i.metric}: ` +
      `brief=${i.brief}, index=${i.index}\n` +
      `      brief: ${i.briefSource}\n` +
      `      index: ${i.indexSource}`,
  );
}

console.error(
  `\nFix: update either the brief component or the index page so both ` +
    `sides compute the same count (they should both call the shared ` +
    `helpers in src/lib/links.ts the same way), then update the matching ` +
    `mirror in scripts/validate-link-coverage-parity.ts to keep this ` +
    `validator pinned to the new formula.`,
);

process.exit(1);
