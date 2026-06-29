// Aggregated search registry — pulls every page the publication has
// built (or stubbed at the index level) into a single flat list so the
// header search overlay can fuzzy-match across the whole site.
//
// Each row carries enough context (kind, eyebrow, one-liner, family,
// tier) to render a meaningful result card and to power simple ranked
// matching.
//
// The data comes from the per-section row catalogues that the index
// pages also consume. There is no duplicated row data here — adding
// or editing a row in a catalogue flows straight through to search.

import {
  ingredientHrefFor,
  ingredientNameFor,
  supplementHrefFor,
  productHref,
} from "./_links";

import { PRODUCTS } from "./_productCatalogue";
import { INGREDIENT_ROWS } from "./_ingredientCatalogue";
import { CONCERN_ROWS, concernHrefFor } from "./_concernCatalogue";
import { ROUTINE_ROWS, routineHrefFor } from "./_routineCatalogue";
import {
  SUPPLEMENT_ROWS,
  linkForSupplement,
} from "./_supplementCatalogue";
import {
  TREND_WATCH_ISSUES,
  trendWatchHrefFor,
} from "./_trendWatchCatalogue";

export type SearchKind =
  | "Ingredient"
  | "Product"
  | "Routine"
  | "Concern"
  | "Supplement"
  | "Trend Watch";

export type SearchEntry = {
  kind: SearchKind;
  title: string;
  eyebrow: string;
  oneliner: string;
  href: string;
  family?: string;
  tier?: string;
  // bag of words used by the matcher (lowercased)
  haystack: string;
};

const PREVIEW_BASE = "/__mockup/preview/evidently";
const TREND_INDEX_HREF = `${PREVIEW_BASE}/TrendWatchArchive`;

function makeHaystack(parts: (string | undefined)[]): string {
  return parts.filter(Boolean).join(" ").toLowerCase();
}

const ENTRIES: SearchEntry[] = [
  ...INGREDIENT_ROWS.map<SearchEntry>((i) => {
    const name = ingredientNameFor(i.slug) ?? i.slug;
    return {
      kind: "Ingredient",
      title: name,
      eyebrow: `${i.fnClass} · ${i.concern}`,
      oneliner: i.blurb,
      href: ingredientHrefFor(i.slug) ?? `${PREVIEW_BASE}/IngredientIndex`,
      family: i.fnClass,
      tier: i.tier,
      haystack: makeHaystack([name, i.fnClass, i.concern, i.blurb, i.slug]),
    };
  }),
  ...PRODUCTS
    // Only reviewed products are searchable — purchase-link-only
    // entries don't have an internal page to navigate to.
    .filter((p): p is typeof p & { component: string; ingredients: string[]; tier: NonNullable<typeof p.tier> } =>
      Boolean(p.component) && Boolean(p.ingredients) && Boolean(p.tier),
    )
    .map<SearchEntry>((p) => ({
      kind: "Product",
      title: `${p.brand} — ${p.name}`,
      eyebrow: p.brand,
      oneliner: p.ingredients.slice(0, 4).join(" · "),
      href: productHref(p.component),
      tier: p.tier,
      haystack: makeHaystack([p.brand, p.name, p.ingredients.join(" "), p.component]),
    })),
  ...CONCERN_ROWS.map<SearchEntry>((c) => ({
    kind: "Concern",
    title: c.name,
    eyebrow: c.family,
    oneliner: c.oneliner,
    href: concernHrefFor(c.slug) ?? `${PREVIEW_BASE}/ConcernIndex`,
    family: c.family,
    haystack: makeHaystack([c.name, c.family, c.oneliner, c.slug]),
  })),
  ...ROUTINE_ROWS.map<SearchEntry>((r) => ({
    kind: "Routine",
    title: r.title,
    eyebrow: r.sub,
    oneliner: r.body,
    href: routineHrefFor(r.slug) ?? `${PREVIEW_BASE}/RoutineIndex`,
    family: r.goal,
    haystack: makeHaystack([r.title, r.sub, r.goal, r.time, r.body, r.slug]),
  })),
  ...SUPPLEMENT_ROWS.map<SearchEntry>((s) => {
    const built = linkForSupplement(s.slug);
    const href = built !== "#"
      ? built
      : (supplementHrefFor(s.slug) ?? `${PREVIEW_BASE}/SupplementIndex`);
    return {
      kind: "Supplement",
      title: s.name,
      eyebrow: `${s.family} · ${s.target}`,
      oneliner: s.oneliner,
      href,
      family: s.family,
      tier: s.tier,
      haystack: makeHaystack([s.name, s.family, s.target, s.oneliner, s.slug]),
    };
  }),
  ...TREND_WATCH_ISSUES.map<SearchEntry>((t) => ({
    kind: "Trend Watch",
    title: `Issue ${String(t.n).padStart(2, "0")} · ${t.headline}`,
    eyebrow: t.date,
    oneliner: t.dek,
    href: trendWatchHrefFor(t.n) ?? TREND_INDEX_HREF,
    haystack: makeHaystack([`issue ${t.n}`, t.headline, t.dek, t.date]),
  })),
];

export const SEARCH_ENTRIES: SearchEntry[] = ENTRIES;

// Lightweight ranked search. Splits the query on whitespace, requires
// every token to appear in the haystack, then ranks by:
//   - exact title match
//   - title prefix match
//   - title substring match
//   - kind label match
//   - count of matching tokens
export function searchEntries(query: string, limit = 12): SearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const tokens = q.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  const scored: { entry: SearchEntry; score: number }[] = [];
  for (const e of SEARCH_ENTRIES) {
    let allMatch = true;
    let score = 0;
    const title = e.title.toLowerCase();
    for (const t of tokens) {
      if (!e.haystack.includes(t)) { allMatch = false; break; }
      if (title === t) score += 100;
      else if (title.startsWith(t)) score += 40;
      else if (title.includes(t)) score += 20;
      else score += 4;
      if (e.kind.toLowerCase().includes(t)) score += 6;
    }
    if (!allMatch) continue;
    if (title === q) score += 200;
    else if (title.startsWith(q)) score += 80;
    scored.push({ entry: e, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.entry);
}
