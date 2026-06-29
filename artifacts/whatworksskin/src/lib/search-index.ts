// Build-time search index. Walks every published row across the six
// content collections and produces a flat list of search entries plus
// a small ranked-search function the typeahead island calls in the
// browser.
//
// The builder is intentionally framework-agnostic: it accepts already-
// flattened collection rows (no `astro:content` import) so the same
// code path can be exercised from a Node script
// (`scripts/test-search-index.ts`) without booting Astro. The Astro
// page wraps it with the live `getCollection()` calls and passes the
// site's `url()` helper for href construction.

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
  // Lower-cased bag of words consumed by the matcher. Includes the
  // slug so a reader who half-remembers a URL fragment still lands on
  // the right brief.
  haystack: string;
};

// ---------------------------------------------------------------------
// Per-collection input shapes
// ---------------------------------------------------------------------
//
// Each shape is the minimal subset of a brief's `data` object the
// search index needs. The Astro page builds these by mapping the live
// collection entries; the Node test reads JSON files directly. Keep
// every field optional except `slug` so a brief that omits a future-
// optional caption still indexes cleanly.

export type IngredientInput = {
  slug: string;
  name: string;
  eyebrowKicker?: string;
  tier?: string;
  lead?: string;
  tagline?: { italic?: string; rest?: string } | null;
  chemistry?: string;
};

export type ProductInput = {
  slug: string;
  brand: string;
  name: string;
  tier?: string;
  hero?: string;
  category?: string;
};

export type RoutineInput = {
  slug: string;
  title: string;
  sub?: string;
  goal?: string;
  body?: string;
  time?: string;
};

export type ConcernInput = {
  slug: string;
  name: string;
  family?: string;
  oneliner?: string;
};

export type SupplementInput = {
  slug: string;
  name: string;
  family?: string;
  target?: string;
  oneliner?: string;
  tier?: string;
};

export type TrendWatchInput = {
  slug: string;
  n: number;
  date: string;
  headline: string;
  dek: string;
};

export type SearchInput = {
  ingredients: ReadonlyArray<IngredientInput>;
  products: ReadonlyArray<ProductInput>;
  routines: ReadonlyArray<RoutineInput>;
  concerns: ReadonlyArray<ConcernInput>;
  supplements: ReadonlyArray<SupplementInput>;
  trendWatch: ReadonlyArray<TrendWatchInput>;
};

// `urlFor(path)` should return the same site-base-aware href the rest
// of the templates produce. The Astro page passes the site's `url()`
// helper from `src/lib/url.ts`; the test passes a stub.
export type UrlFor = (path: string) => string;

function makeHaystack(parts: ReadonlyArray<string | number | undefined | null>): string {
  return parts
    .filter((p): p is string | number => p !== undefined && p !== null && p !== "")
    .map(String)
    .join(" ")
    .toLowerCase();
}

// ---------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------

/**
 * Flatten the six content collections into a single ranked-search-ready
 * list. Pure: same input + same `urlFor` always produces the same
 * output, so the test can pin the index against synthetic fixtures.
 *
 * Output order is collection-order: ingredients first, then products,
 * routines, concerns, supplements, trend-watch. Within each collection
 * the order matches the input (the page is responsible for sorting
 * inputs alphabetically / by issue number before calling).
 */
export function buildSearchEntries(
  input: SearchInput,
  urlFor: UrlFor,
): SearchEntry[] {
  const out: SearchEntry[] = [];

  for (const i of input.ingredients) {
    const taglineText = i.tagline
      ? [i.tagline.italic, i.tagline.rest].filter(Boolean).join(" ")
      : undefined;
    const oneliner = taglineText ?? i.lead ?? i.chemistry ?? "";
    const title = i.name;
    out.push({
      kind: "Ingredient",
      title,
      eyebrow: i.eyebrowKicker ?? "Ingredient",
      oneliner,
      href: urlFor(`ingredients/${i.slug}`),
      tier: i.tier,
      family: i.eyebrowKicker,
      // The final display title is included verbatim so a query for
      // the exact title (or any whitespace-tokenised slice of it) is
      // guaranteed to match — every other field below adds breadth.
      haystack: makeHaystack([
        title,
        i.eyebrowKicker,
        i.lead,
        taglineText,
        i.chemistry,
        i.slug,
      ]),
    });
  }

  for (const p of input.products) {
    const eyebrow = p.category ? `${p.brand} · ${p.category}` : p.brand;
    // Em-dash separator must be in the haystack verbatim so a copy-
    // paste query of the rendered title still tokenises and matches.
    const title = `${p.brand} — ${p.name}`;
    out.push({
      kind: "Product",
      title,
      eyebrow,
      oneliner: p.hero ?? "",
      href: urlFor(`products/${p.slug}`),
      tier: p.tier,
      family: p.category,
      haystack: makeHaystack([title, p.brand, p.name, p.category, p.hero, p.slug]),
    });
  }

  for (const r of input.routines) {
    const eyebrow = r.sub ?? r.goal ?? "Routine";
    out.push({
      kind: "Routine",
      title: r.title,
      eyebrow,
      oneliner: r.body ?? "",
      href: urlFor(`routines/${r.slug}`),
      family: r.goal,
      haystack: makeHaystack([
        r.title,
        r.sub,
        r.goal,
        r.time,
        r.body,
        r.slug,
      ]),
    });
  }

  for (const c of input.concerns) {
    out.push({
      kind: "Concern",
      title: c.name,
      eyebrow: c.family ?? "Concern",
      oneliner: c.oneliner ?? "",
      href: urlFor(`concerns/${c.slug}`),
      family: c.family,
      haystack: makeHaystack([c.name, c.family, c.oneliner, c.slug]),
    });
  }

  for (const s of input.supplements) {
    const eyebrowParts = [s.family, s.target].filter(Boolean);
    const eyebrow = eyebrowParts.length > 0 ? eyebrowParts.join(" · ") : "Supplement";
    out.push({
      kind: "Supplement",
      title: s.name,
      eyebrow,
      oneliner: s.oneliner ?? "",
      href: urlFor(`supplements/${s.slug}`),
      family: s.family,
      tier: s.tier,
      haystack: makeHaystack([
        s.name,
        s.family,
        s.target,
        s.oneliner,
        s.slug,
      ]),
    });
  }

  for (const t of input.trendWatch) {
    // Include both the padded ("Issue 001 · …") and natural ("issue 1")
    // forms in the haystack so readers can find a back-issue by either
    // phrasing.
    const title = `Issue ${String(t.n).padStart(3, "0")} · ${t.headline}`;
    out.push({
      kind: "Trend Watch",
      title,
      eyebrow: t.date,
      oneliner: t.dek,
      href: urlFor(`trend-watch/${t.slug}`),
      haystack: makeHaystack([
        title,
        `issue ${t.n}`,
        t.headline,
        t.dek,
        t.date,
        t.slug,
      ]),
    });
  }

  return out;
}

// ---------------------------------------------------------------------
// Searcher
// ---------------------------------------------------------------------
//
// Lightweight ranked search. Splits the query on whitespace, requires
// every token to appear in the haystack, then ranks by:
//   - exact whole-query title match (+200)
//   - whole-query title prefix (+80)
//   - per-token: title equals (+100), title prefix (+40), title
//     substring (+20), haystack-only (+4), kind-label hit (+6)
//
// Mirrors the mockup-sandbox reference closely. Substring matching
// only — no fuzzy / typo tolerance, per the task brief.

export function rankSearchEntries(
  query: string,
  entries: ReadonlyArray<SearchEntry>,
  limit = 12,
): SearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const tokens = q.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  const scored: { entry: SearchEntry; score: number }[] = [];
  for (const e of entries) {
    let allMatch = true;
    let score = 0;
    const title = e.title.toLowerCase();
    const kind = e.kind.toLowerCase();
    for (const t of tokens) {
      if (!e.haystack.includes(t)) {
        allMatch = false;
        break;
      }
      if (title === t) score += 100;
      else if (title.startsWith(t)) score += 40;
      else if (title.includes(t)) score += 20;
      else score += 4;
      if (kind.includes(t)) score += 6;
    }
    if (!allMatch) continue;
    if (title === q) score += 200;
    else if (title.startsWith(q)) score += 80;
    scored.push({ entry: e, score });
  }
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.entry.title.localeCompare(b.entry.title);
  });
  return scored.slice(0, limit).map((s) => s.entry);
}

// Route prefixes the contract test uses to verify every emitted href
// lands on a known section of the site. Kept here so the builder and
// the test can never disagree about which section labels are valid.
export const KIND_ROUTE_PREFIX: Record<SearchKind, string> = {
  Ingredient: "ingredients/",
  Product: "products/",
  Routine: "routines/",
  Concern: "concerns/",
  Supplement: "supplements/",
  "Trend Watch": "trend-watch/",
};
