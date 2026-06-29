// Pure back-link index builders.
//
// Extracted from `links.ts` so the back-link semantics can be exercised
// by `scripts/test-backlinks.ts` against a synthetic fixture without
// booting Astro (i.e. without pulling in the `astro:content` virtual
// module that the rest of `links.ts` depends on). The runtime
// `ingredientBacklinkIndex()` / `productBacklinkIndex()` wrappers in
// `links.ts` just call these with the live `getCollection` data and
// the live `findIngredientSlug` / `findProductSlug` resolvers.

export type ConcernBacklink = { slug: string; name: string; role?: string };
export type RoutineBacklink = {
  slug: string;
  title: string;
  sub: string;
  stepTitle?: string;
};

export type Backlinks = {
  concerns: ConcernBacklink[];
  routines: RoutineBacklink[];
};

export type BacklinkIndex = Map<string, Backlinks>;

/** Minimal shape consumed by the back-link builders. Wider data (full
 * brief schemas) is fine — the builders only read the listed fields. */
export type ConcernBacklinkInput = {
  data: {
    slug: string;
    name: string;
    ingredients?: { name?: string | null; role?: string }[];
    products?: { brand?: string | null; name?: string | null }[];
  };
};

export type RoutineBacklinkInput = {
  data: {
    slug: string;
    title: string;
    sub: string;
    steps?: {
      title?: string;
      sub?: string;
      activeKey?: string;
      activeVal?: string;
      products?: { brand?: string | null; name?: string | null }[];
    }[];
  };
};

export type IngredientResolver = (
  text?: string | null,
) => Promise<string | undefined> | string | undefined;

export type ProductResolver = (
  brand?: string | null,
  name?: string | null,
) => Promise<string | undefined> | string | undefined;

function ensureEntry(idx: BacklinkIndex, slug: string): Backlinks {
  let entry = idx.get(slug);
  if (!entry) {
    entry = { concerns: [], routines: [] };
    idx.set(slug, entry);
  }
  return entry;
}

/**
 * Build the ingredient-slug → {concerns,routines} back-link index.
 *
 * Invariants this function locks in (covered by `scripts/test-backlinks.ts`):
 *   • Dedup per concern: only the FIRST matching ingredient row in a
 *     concern contributes an entry for that concern, and the captured
 *     `role` is taken from that first row.
 *   • Dedup per routine: only the FIRST matching step (in declaration
 *     order) contributes an entry for that routine, and `stepTitle`
 *     comes from that first matching step.
 *   • Within each per-slug entry, `concerns` are sorted alphabetically
 *     by concern name and `routines` by routine sub-line — so the
 *     rendered "Where it appears" panels are stable across builds.
 */
export async function buildIngredientBacklinkIndex(
  concerns: readonly ConcernBacklinkInput[],
  routines: readonly RoutineBacklinkInput[],
  resolveIngredientSlug: IngredientResolver,
): Promise<BacklinkIndex> {
  const idx: BacklinkIndex = new Map();

  // Concerns: one entry per (concern, ingredient-slug). The original
  // helper broke on the first matching row per concern, so the role
  // we capture here is the role of that first matching row.
  for (const c of concerns) {
    const seen = new Set<string>();
    for (const row of c.data.ingredients ?? []) {
      const slug = await resolveIngredientSlug(row.name);
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);
      ensureEntry(idx, slug).concerns.push({
        slug: c.data.slug,
        name: c.data.name,
        role: row.role,
      });
    }
  }

  // Routines: one entry per (routine, ingredient-slug). The original
  // helper used the title of the first step that matched, so we walk
  // steps in declaration order and skip any slug we've already
  // recorded for this routine.
  for (const r of routines) {
    const seen = new Set<string>();
    for (const s of r.data.steps ?? []) {
      const haystack = `${s.title ?? ""} ${s.sub ?? ""} ${s.activeKey ?? ""} ${s.activeVal ?? ""}`;
      const slug = await resolveIngredientSlug(haystack);
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);
      ensureEntry(idx, slug).routines.push({
        slug: r.data.slug,
        title: r.data.title,
        sub: r.data.sub,
        stepTitle: s.title,
      });
    }
  }

  for (const entry of idx.values()) {
    entry.concerns.sort((a, b) => a.name.localeCompare(b.name));
    entry.routines.sort((a, b) => a.sub.localeCompare(b.sub));
  }
  return idx;
}

/**
 * Build the product-slug → {concerns,routines} back-link index.
 *
 * Same invariants as `buildIngredientBacklinkIndex` but keyed off the
 * product resolver: first matching `products[]` row per concern wins
 * the concern entry, first matching `steps[].products[]` row per
 * routine wins the routine entry (and its `stepTitle`), and the
 * per-slug lists are sorted alphabetically.
 */
export async function buildProductBacklinkIndex(
  concerns: readonly ConcernBacklinkInput[],
  routines: readonly RoutineBacklinkInput[],
  resolveProductSlug: ProductResolver,
): Promise<BacklinkIndex> {
  const idx: BacklinkIndex = new Map();

  for (const c of concerns) {
    const seen = new Set<string>();
    for (const p of c.data.products ?? []) {
      const slug = await resolveProductSlug(p.brand, p.name);
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);
      ensureEntry(idx, slug).concerns.push({
        slug: c.data.slug,
        name: c.data.name,
      });
    }
  }

  for (const r of routines) {
    const seen = new Set<string>();
    for (const s of r.data.steps ?? []) {
      const products = s.products ?? [];
      for (const p of products) {
        const slug = await resolveProductSlug(p?.brand, p?.name);
        if (!slug || seen.has(slug)) continue;
        seen.add(slug);
        ensureEntry(idx, slug).routines.push({
          slug: r.data.slug,
          title: r.data.title,
          sub: r.data.sub,
          stepTitle: s.title,
        });
      }
    }
  }

  for (const entry of idx.values()) {
    entry.concerns.sort((a, b) => a.name.localeCompare(b.name));
    entry.routines.sort((a, b) => a.sub.localeCompare(b.sub));
  }
  return idx;
}
