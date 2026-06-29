// Editorial helper: collects every brand/name pair recommended on the
// site's editorial pages — ingredient briefs, routine step "Recommended"
// shelves, and concern-guide product picks — that does NOT yet resolve
// to a catalogue product detail page. The result powers a single
// editor-facing review backlog on the ingredient hub so the catalogue
// can be filled in the order our own editorial already prioritises.

import { ingredientHrefFor, ingredientNameFor, productComponentForBriefEntry } from "./_links";
import { ROUTINE_BUILT, ROUTINE_ROWS } from "./_routineCatalogue";
import { CONCERN_BUILT, CONCERN_ROWS } from "./_concernCatalogue";

const PREVIEW_BASE = "/__mockup/preview/evidently";

// ── Ingredient brief shelves ───────────────────────────────────────
import { data as adapaleneData } from "./IngredientAdapalene";
import { data as alphaArbutinData } from "./IngredientAlphaArbutin";
import { data as bemotrizinolData } from "./IngredientBemotrizinol";
import { data as benzoylPeroxideData } from "./IngredientBenzoylPeroxide";
import { data as centellaData } from "./IngredientCentella";
import { data as ceramidesData } from "./IngredientCeramides";
import { data as exosomesData } from "./IngredientExosomes";
import { data as glycolicData } from "./IngredientGlycolic";
import { data as hyaluronicData } from "./IngredientHyaluronic";
import { data as lacticData } from "./IngredientLactic";
import { data as mandelicData } from "./IngredientMandelic";
import { data as panthenolData } from "./IngredientPanthenol";
import { data as peptidesCopperData } from "./IngredientPeptidesCopper";
import { data as peptidesSignalData } from "./IngredientPeptidesSignal";
import { data as propolisData } from "./IngredientPropolis";
import { data as retinolData } from "./IngredientRetinol";
import { data as salicylicData } from "./IngredientSalicylic";
import { data as snailMucinData } from "./IngredientSnailMucin";
import { data as sulphurData } from "./IngredientSulphur";
import { data as tranexamicData } from "./IngredientTranexamic";
import { data as uvFiltersData } from "./IngredientUVFilters";
import { data as zincOxideData } from "./IngredientZincOxide";

import { PRODUCTS as azelaicProducts } from "./IngredientAzelaic";
import { PRODUCTS as bakuchiolProducts } from "./IngredientBakuchiol";
import { PRODUCTS as lAscorbicProducts } from "./IngredientLAscorbic";
import { PRODUCTS as niacinamideProducts } from "./IngredientNiacinamide";
import { PRODUCTS as tretinoinProducts } from "./IngredientDetail";

// ── Routine step recommendations ───────────────────────────────────
import { STEPS as routineDetailSteps } from "./RoutineDetail";
import { STEPS as routineAMAcneSteps } from "./RoutineAMAcne";
import { STEPS as routineAMAgingSteps } from "./RoutineAMAging";
import { STEPS as routineBareMinimumSteps } from "./RoutineBareMinimum";
import { STEPS as routineOilyBalanceSteps } from "./RoutineOilyBalance";
import { STEPS as routinePMAcneSteps } from "./RoutinePMAcne";
import { STEPS as routinePMAgingSteps } from "./RoutinePMAging";
import { STEPS as routinePMBarrierSteps } from "./RoutinePMBarrier";
import { STEPS as routinePregnancyAMSteps } from "./RoutinePregnancyAM";
import { STEPS as routinePregnancyPMSteps } from "./RoutinePregnancyPM";
import { STEPS as routineWeeklyBHASteps } from "./RoutineWeeklyBHA";

// ── Concern guide "what to use" product picks ──────────────────────
import { PRODUCTS as concernMelasmaProducts } from "./ConcernDetail";
import { PRODUCTS as concernRosaceaProducts } from "./ConcernRosacea";

type ShelfEntry = { brand: string; name: string };

type BriefShelf = {
  slug: string;
  ingredient: string;
  shelf: ShelfEntry[];
};

type RoutineShelf = {
  /** Detail-page component file (without .tsx). Used both as the
   *  source identifier and to derive an internal href. */
  component: string;
  title: string;
  shelf: ShelfEntry[];
};

type ConcernShelf = {
  component: string;
  title: string;
  shelf: ShelfEntry[];
};

const named = (slug: string): string => ingredientNameFor(slug) ?? slug;

const BRIEF_SHELVES: BriefShelf[] = [
  { slug: "tretinoin",        ingredient: named("tretinoin"),        shelf: tretinoinProducts },
  { slug: "retinol",          ingredient: named("retinol"),          shelf: retinolData.products },
  { slug: "adapalene",        ingredient: named("adapalene"),        shelf: adapaleneData.products },
  { slug: "bakuchiol",        ingredient: named("bakuchiol"),        shelf: bakuchiolProducts },
  { slug: "niacinamide",      ingredient: named("niacinamide"),      shelf: niacinamideProducts },
  { slug: "l-ascorbic-acid",  ingredient: named("l-ascorbic-acid"),  shelf: lAscorbicProducts },
  { slug: "azelaic-acid",     ingredient: named("azelaic-acid"),     shelf: azelaicProducts },
  { slug: "salicylic-acid",   ingredient: named("salicylic-acid"),   shelf: salicylicData.products },
  { slug: "glycolic-acid",    ingredient: named("glycolic-acid"),    shelf: glycolicData.products },
  { slug: "lactic-acid",      ingredient: named("lactic-acid"),      shelf: lacticData.products },
  { slug: "mandelic-acid",    ingredient: named("mandelic-acid"),    shelf: mandelicData.products },
  { slug: "tranexamic-acid",  ingredient: named("tranexamic-acid"),  shelf: tranexamicData.products },
  { slug: "alpha-arbutin",    ingredient: named("alpha-arbutin"),    shelf: alphaArbutinData.products },
  { slug: "hyaluronic-acid",  ingredient: named("hyaluronic-acid"),  shelf: hyaluronicData.products },
  { slug: "ceramides",        ingredient: named("ceramides"),        shelf: ceramidesData.products },
  { slug: "centella",         ingredient: named("centella"),         shelf: centellaData.products },
  { slug: "panthenol",        ingredient: named("panthenol"),        shelf: panthenolData.products },
  { slug: "peptides-signal",  ingredient: named("peptides-signal"),  shelf: peptidesSignalData.products },
  { slug: "peptides-copper",  ingredient: named("peptides-copper"),  shelf: peptidesCopperData.products },
  { slug: "uv-filters",       ingredient: named("uv-filters"),       shelf: uvFiltersData.products },
  { slug: "zinc-oxide",       ingredient: named("zinc-oxide"),       shelf: zincOxideData.products },
  { slug: "bemotrizinol",     ingredient: named("bemotrizinol"),     shelf: bemotrizinolData.products },
  { slug: "snail-mucin",      ingredient: named("snail-mucin"),      shelf: snailMucinData.products },
  { slug: "propolis",         ingredient: named("propolis"),         shelf: propolisData.products },
  { slug: "benzoyl-peroxide", ingredient: named("benzoyl-peroxide"), shelf: benzoylPeroxideData.products },
  { slug: "sulphur",          ingredient: named("sulphur"),          shelf: sulphurData.products },
  { slug: "exosomes",         ingredient: named("exosomes"),         shelf: exosomesData.products },
];

// Each routine's `STEPS` array exposes `products: { brand, name }[]` on
// every step. Flatten those into a single shelf per routine so the same
// matcher used for ingredient briefs can decide whether each entry has
// a catalogue page yet.
//
// Note: shelves are keyed by component file (not catalogue slug) on
// purpose. ROUTINE_BUILT can map several slugs to the same component
// (e.g. multiple variants alias `RoutineBareMinimum`); we only want to
// flag a brand+name pair *once* per source page in the editor backlog,
// so collapsing on component is the right granularity.
const flattenStepProducts = (
  steps: ReadonlyArray<{ products?: ReadonlyArray<ShelfEntry> }>,
): ShelfEntry[] =>
  steps.flatMap((s) => (s.products ?? []).map((p) => ({ brand: p.brand, name: p.name })));

// Routine slug → display title (from the canonical catalogue), so
// chips in the backlog read "AM · Pigment-prone" rather than a raw
// component file name.
const routineTitleForComponent = (component: string): string => {
  const slug = Object.entries(ROUTINE_BUILT).find(([, c]) => c === component)?.[0];
  if (!slug) return component;
  return ROUTINE_ROWS.find((r) => r.slug === slug)?.sub ?? component;
};

const ROUTINE_SHELVES: RoutineShelf[] = [
  { component: "RoutineDetail",       shelf: flattenStepProducts(routineDetailSteps),       title: routineTitleForComponent("RoutineDetail") },
  { component: "RoutineAMAcne",       shelf: flattenStepProducts(routineAMAcneSteps),       title: routineTitleForComponent("RoutineAMAcne") },
  { component: "RoutineAMAging",      shelf: flattenStepProducts(routineAMAgingSteps),      title: routineTitleForComponent("RoutineAMAging") },
  { component: "RoutineBareMinimum",  shelf: flattenStepProducts(routineBareMinimumSteps),  title: routineTitleForComponent("RoutineBareMinimum") },
  { component: "RoutineOilyBalance",  shelf: flattenStepProducts(routineOilyBalanceSteps),  title: routineTitleForComponent("RoutineOilyBalance") },
  { component: "RoutinePMAcne",       shelf: flattenStepProducts(routinePMAcneSteps),       title: routineTitleForComponent("RoutinePMAcne") },
  { component: "RoutinePMAging",      shelf: flattenStepProducts(routinePMAgingSteps),      title: routineTitleForComponent("RoutinePMAging") },
  { component: "RoutinePMBarrier",    shelf: flattenStepProducts(routinePMBarrierSteps),    title: routineTitleForComponent("RoutinePMBarrier") },
  { component: "RoutinePregnancyAM",  shelf: flattenStepProducts(routinePregnancyAMSteps),  title: routineTitleForComponent("RoutinePregnancyAM") },
  { component: "RoutinePregnancyPM",  shelf: flattenStepProducts(routinePregnancyPMSteps),  title: routineTitleForComponent("RoutinePregnancyPM") },
  { component: "RoutineWeeklyBHA",    shelf: flattenStepProducts(routineWeeklyBHASteps),    title: routineTitleForComponent("RoutineWeeklyBHA") },
];

// Concern slug → display name, looked up via the canonical catalogue.
const concernTitleForComponent = (component: string): string => {
  const slug = Object.entries(CONCERN_BUILT).find(([, c]) => c === component)?.[0];
  if (!slug) return component;
  return CONCERN_ROWS.find((r) => r.slug === slug)?.name ?? component;
};

const CONCERN_SHELVES: ConcernShelf[] = [
  { component: "ConcernDetail",  shelf: concernMelasmaProducts.map((p) => ({ brand: p.brand, name: p.name })), title: concernTitleForComponent("ConcernDetail") },
  { component: "ConcernRosacea", shelf: concernRosaceaProducts.map((p) => ({ brand: p.brand, name: p.name })), title: concernTitleForComponent("ConcernRosacea") },
];

// A single mention of an unreviewed product on some editorial page.
// The kind tells the UI how to label it (and influences the chip
// colour); `href` is the internal page link to deep-link the editor
// straight to the source.
export type UnreviewedMention = {
  kind: "ingredient" | "routine" | "concern";
  /** Stable per-source key, used for de-dup within mentions[]. */
  key: string;
  /** Display label shown on the chip. */
  label: string;
  /** Internal href to the source page, when one exists. */
  href: string | null;
};

export type UnreviewedProduct = {
  brand: string;
  name: string;
  // Editorial pages that mention this brand+name pair without a review.
  mentions: UnreviewedMention[];
};

function addMention(
  byKey: Map<string, UnreviewedProduct>,
  brand: string,
  name: string,
  mention: UnreviewedMention,
): void {
  const key = `${brand.toLowerCase()}|${name.toLowerCase()}`;
  const existing = byKey.get(key);
  if (existing) {
    if (!existing.mentions.some((m) => m.key === mention.key)) {
      existing.mentions.push(mention);
    }
  } else {
    byKey.set(key, { brand, name, mentions: [mention] });
  }
}

// Aggregate every shelf entry that doesn't currently resolve to a
// product detail page. Same brand+name across multiple sources collapses
// into one entry so the editor sees the highest-leverage gaps first.
export function getUnreviewedShelfProducts(): UnreviewedProduct[] {
  const byKey = new Map<string, UnreviewedProduct>();

  for (const brief of BRIEF_SHELVES) {
    for (const entry of brief.shelf) {
      if (productComponentForBriefEntry(entry.brand, entry.name) !== null) continue;
      addMention(byKey, entry.brand, entry.name, {
        kind: "ingredient",
        key: `ingredient:${brief.slug}`,
        label: brief.ingredient,
        href: ingredientHrefFor(brief.slug),
      });
    }
  }

  for (const routine of ROUTINE_SHELVES) {
    for (const entry of routine.shelf) {
      if (productComponentForBriefEntry(entry.brand, entry.name) !== null) continue;
      addMention(byKey, entry.brand, entry.name, {
        kind: "routine",
        key: `routine:${routine.component}`,
        label: routine.title,
        href: `${PREVIEW_BASE}/${routine.component}`,
      });
    }
  }

  for (const concern of CONCERN_SHELVES) {
    for (const entry of concern.shelf) {
      if (productComponentForBriefEntry(entry.brand, entry.name) !== null) continue;
      addMention(byKey, entry.brand, entry.name, {
        kind: "concern",
        key: `concern:${concern.component}`,
        label: concern.title,
        href: `${PREVIEW_BASE}/${concern.component}`,
      });
    }
  }

  return Array.from(byKey.values()).sort((a, b) => {
    if (b.mentions.length !== a.mentions.length) return b.mentions.length - a.mentions.length;
    if (a.brand !== b.brand) return a.brand.localeCompare(b.brand);
    return a.name.localeCompare(b.name);
  });
}
