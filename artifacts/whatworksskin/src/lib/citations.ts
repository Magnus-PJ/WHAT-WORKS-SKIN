// Shared citation index. The /sources page is the catalogue; every
// brief contributes to it in two ways:
//
//   1. Ingredient `studies` (with PMIDs) and product `sources` (free
//      text + a short tag) are real bibliographic citations on those
//      briefs themselves. They become catalogue entries with stable
//      IDs (`pmid-<n>` for studies, `cite-<slug>` for source rows)
//      and the brief that owns them is automatically listed under
//      `citedBy`.
//
//   2. Every brief — including routines and trend-watch issues that
//      have no per-row citation data of their own — may carry an
//      optional `citations: string[]` array of catalogue IDs it
//      references. We re-scan all six collections for these arrays
//      and append the brief to `citedBy` of each matched citation.
//
// Editorial evidence summaries (supplement evidence-bar rows like
// "RCTs vs placebo", concern per-ingredient evidence strings) are
// intentionally *not* ingested as citations — they're claim summaries,
// not bibliographic references. To cite the underlying source on a
// supplement or concern brief, the editor adds the citation ID to the
// brief's `citations: string[]` array.

import type { CollectionEntry } from "astro:content";

export type CitationFamily = "primary" | "regulator" | "consensus" | "dossier";

export type CitedKind =
  | "ingredient"
  | "product"
  | "supplement"
  | "concern"
  | "routine"
  | "trendwatch";

export type CitationCitedBy = {
  kind: CitedKind;
  slug: string;
  title: string;
  href: string;
};

export type Citation = {
  id: string;
  family: CitationFamily;
  /** Human-readable citation string for the index. */
  label: string;
  /** Optional structured fields when the source carried them. */
  pmid?: string;
  authors?: string;
  journal?: string;
  year?: string;
  /** Short tag from the source brief (RCT, REVIEW, MFR DATA, …). */
  tag?: string;
  citedBy: CitationCitedBy[];
};

const PMID_RE = /^\d{4,9}$/;

const normaliseText = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[\u2010-\u2015\u2212]/g, "-")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

const slugify = (s: string, max = 80): string =>
  normaliseText(s)
    .replace(/\s/g, "-")
    .slice(0, max)
    .replace(/-+$/g, "") || "src";

/** Stable hash-style ID for a study citation on an ingredient brief. */
export function citationIdForStudy(study: { pmid?: string; authors?: string; journal?: string; year?: string | number }): string {
  if (study.pmid && PMID_RE.test(String(study.pmid).trim())) {
    return `pmid-${String(study.pmid).trim()}`;
  }
  const seed = [study.authors, study.journal, study.year].filter(Boolean).join(" ");
  return `cite-${slugify(seed)}`;
}

/** Stable hash-style ID for a free-text source citation on a product brief. */
export function citationIdForSource(source: { n: string }): string {
  return `cite-${slugify(source.n)}`;
}

const FAMILY_BY_TAG: Record<string, CitationFamily> = {
  rct: "primary",
  meta: "primary",
  trial: "primary",
  review: "consensus",
  guideline: "consensus",
  consensus: "consensus",
  mechanism: "primary",
  "mfr data": "dossier",
  dossier: "dossier",
  formulation: "dossier",
  regulator: "regulator",
  regulatory: "regulator",
};

const REGULATOR_HINTS = [
  "fda",
  "ema",
  "cdsco",
  "mfds",
  "kfda",
  "tga",
  "phmra",
  "regulation",
  "cosmetic regulation",
  "monograph",
];

const DOSSIER_HINTS = ["dossier", "white paper", "technical sheet", "formulation"];

const CONSENSUS_HINTS = ["guideline", "guidelines", "consensus", "review", "systematic review"];

function classifyFromText(text: string, tag?: string): CitationFamily {
  const t = (tag ?? "").trim().toLowerCase();
  if (t && FAMILY_BY_TAG[t]) return FAMILY_BY_TAG[t];
  const norm = normaliseText(text);
  if (REGULATOR_HINTS.some((h) => norm.includes(h))) return "regulator";
  if (DOSSIER_HINTS.some((h) => norm.includes(h))) return "dossier";
  if (CONSENSUS_HINTS.some((h) => norm.includes(h))) return "consensus";
  return "primary";
}

const FAMILY_ORDER: CitationFamily[] = ["primary", "regulator", "consensus", "dossier"];

export const FAMILY_LABEL: Record<CitationFamily, string> = {
  primary: "Primary literature",
  regulator: "Regulatory filings",
  consensus: "Guideline & consensus reviews",
  dossier: "Manufacturer dossiers",
};

export const FAMILY_DESCRIPTION: Record<CitationFamily, string> = {
  primary:
    "Peer-reviewed clinical trials, meta-analyses, and mechanistic studies. PubMed-indexed where possible.",
  regulator:
    "Filings and registers from regulators (US FDA, EU 1223/2009, India CDSCO, Korea MFDS).",
  consensus:
    "Guideline-body recommendations and systematic / narrative reviews of an existing evidence base.",
  dossier:
    "Manufacturer-supplied technical data. Read but down-weighted per methodology v1.1.",
};

type IngredientEntry = CollectionEntry<"ingredients">;
type ProductEntry = CollectionEntry<"products">;
type SupplementEntry = CollectionEntry<"supplements">;
type ConcernEntry = CollectionEntry<"concerns">;
type RoutineEntry = CollectionEntry<"routines">;
type TrendWatchEntry = CollectionEntry<"trendWatch">;

export type CitationIndex = {
  citations: Citation[];
  byFamily: Array<{ family: CitationFamily; label: string; description: string; items: Citation[] }>;
  total: number;
  /** Per-collection counts of briefs that contributed to the index
   * (either as the owner of the citation rows or via an explicit
   * `citations: []` reference). */
  contributingCounts: Record<CitedKind, number>;
};

/**
 * Build the deduped, sorted citation catalogue from the published
 * briefs. `urlFor` mints absolute hrefs for the citing brief; pass
 * the page's `url()` helper.
 */
export function buildCitationIndex(
  ingredients: IngredientEntry[],
  products: ProductEntry[],
  supplements: SupplementEntry[],
  concerns: ConcernEntry[],
  routines: RoutineEntry[],
  trendWatch: TrendWatchEntry[],
  urlFor: (path: string) => string,
): CitationIndex {
  const map = new Map<string, Citation>();
  const counts: Record<CitedKind, number> = {
    ingredient: 0,
    product: 0,
    supplement: 0,
    concern: 0,
    routine: 0,
    trendwatch: 0,
  };
  const contributors: Record<CitedKind, Set<string>> = {
    ingredient: new Set(),
    product: new Set(),
    supplement: new Set(),
    concern: new Set(),
    routine: new Set(),
    trendwatch: new Set(),
  };

  const noteContributor = (kind: CitedKind, slug: string) => {
    contributors[kind].add(slug);
  };

  const upsert = (id: string, base: Omit<Citation, "id" | "citedBy">, citedBy: CitationCitedBy) => {
    const existing = map.get(id);
    if (existing) {
      const dup = existing.citedBy.find(
        (c) => c.kind === citedBy.kind && c.slug === citedBy.slug,
      );
      if (!dup) existing.citedBy.push(citedBy);
      return;
    }
    map.set(id, { id, ...base, citedBy: [citedBy] });
  };

  // 1. Ingredient `studies` → real primary-literature citations.
  for (const ing of ingredients) {
    const studies = ing.data.studies ?? [];
    if (!studies.length) continue;
    noteContributor("ingredient", ing.data.slug);
    const citedBy: CitationCitedBy = {
      kind: "ingredient",
      slug: ing.data.slug,
      title: ing.data.name,
      href: urlFor(`ingredients/${ing.data.slug}`),
    };
    for (const s of studies) {
      const id = citationIdForStudy(s);
      const yr = s.year != null ? String(s.year) : undefined;
      const label = [s.authors, `${s.journal}${yr ? ` · ${yr}` : ""}`]
        .filter(Boolean)
        .join(" — ");
      upsert(
        id,
        {
          family: "primary",
          label,
          pmid: s.pmid,
          authors: s.authors,
          journal: s.journal,
          year: yr,
          tag: s.design,
        },
        citedBy,
      );
    }
  }

  // 2. Product `sources` → free-text citations classified by tag/keywords.
  for (const prod of products) {
    const sources = prod.data.sources ?? [];
    if (!sources.length) continue;
    noteContributor("product", prod.data.slug);
    const citedBy: CitationCitedBy = {
      kind: "product",
      slug: prod.data.slug,
      title: `${prod.data.brand} — ${prod.data.name}`,
      href: urlFor(`products/${prod.data.slug}`),
    };
    for (const s of sources) {
      const id = citationIdForSource(s);
      upsert(
        id,
        {
          family: classifyFromText(s.n, s.w),
          label: s.n,
          tag: s.w,
        },
        citedBy,
      );
    }
  }

  // 3. Explicit `citations: string[]` references from any brief in
  //    any collection. Append to the matching citation's `citedBy`.
  //    Unknown IDs are skipped silently — editors can stage references
  //    ahead of the citation existing in the catalogue without breaking
  //    the build.
  const appendRefs = (
    refs: string[] | undefined,
    citedBy: CitationCitedBy,
  ): boolean => {
    if (!refs || refs.length === 0) return false;
    let any = false;
    for (const id of refs) {
      const existing = map.get(id);
      if (!existing) continue;
      const dup = existing.citedBy.find(
        (c) => c.kind === citedBy.kind && c.slug === citedBy.slug,
      );
      if (!dup) existing.citedBy.push(citedBy);
      any = true;
    }
    return any;
  };

  for (const ing of ingredients) {
    const refs = (ing.data as { citations?: string[] }).citations;
    if (
      appendRefs(refs, {
        kind: "ingredient",
        slug: ing.data.slug,
        title: ing.data.name,
        href: urlFor(`ingredients/${ing.data.slug}`),
      })
    ) {
      noteContributor("ingredient", ing.data.slug);
    }
  }
  for (const prod of products) {
    const refs = (prod.data as { citations?: string[] }).citations;
    if (
      appendRefs(refs, {
        kind: "product",
        slug: prod.data.slug,
        title: `${prod.data.brand} — ${prod.data.name}`,
        href: urlFor(`products/${prod.data.slug}`),
      })
    ) {
      noteContributor("product", prod.data.slug);
    }
  }
  for (const sup of supplements) {
    const refs = (sup.data as { citations?: string[] }).citations;
    if (
      appendRefs(refs, {
        kind: "supplement",
        slug: sup.data.slug,
        title: sup.data.name,
        href: urlFor(`supplements/${sup.data.slug}`),
      })
    ) {
      noteContributor("supplement", sup.data.slug);
    }
  }
  for (const cn of concerns) {
    const refs = (cn.data as { citations?: string[] }).citations;
    if (
      appendRefs(refs, {
        kind: "concern",
        slug: cn.data.slug,
        title: cn.data.name,
        href: urlFor(`concerns/${cn.data.slug}`),
      })
    ) {
      noteContributor("concern", cn.data.slug);
    }
  }
  for (const r of routines) {
    const refs = (r.data as { citations?: string[] }).citations;
    if (
      appendRefs(refs, {
        kind: "routine",
        slug: r.data.slug,
        title: r.data.title,
        href: urlFor(`routines/${r.data.slug}`),
      })
    ) {
      noteContributor("routine", r.data.slug);
    }
  }
  for (const tw of trendWatch) {
    const refs = (tw.data as { citations?: string[] }).citations;
    if (
      appendRefs(refs, {
        kind: "trendwatch",
        slug: tw.data.slug,
        title: tw.data.headline,
        href: urlFor(`trend-watch/${tw.data.slug}`),
      })
    ) {
      noteContributor("trendwatch", tw.data.slug);
    }
  }

  for (const k of Object.keys(counts) as CitedKind[]) {
    counts[k] = contributors[k].size;
  }

  const all = Array.from(map.values()).sort((a, b) =>
    a.label.localeCompare(b.label, "en", { sensitivity: "base" }),
  );

  const byFamily = FAMILY_ORDER.map((family) => ({
    family,
    label: FAMILY_LABEL[family],
    description: FAMILY_DESCRIPTION[family],
    items: all.filter((c) => c.family === family),
  })).filter((g) => g.items.length > 0);

  return { citations: all, byFamily, total: all.length, contributingCounts: counts };
}

export const KIND_LABEL: Record<CitedKind, string> = {
  ingredient: "Ingredient",
  product: "Product",
  supplement: "Supplement",
  concern: "Concern",
  routine: "Routine",
  trendwatch: "Trend Watch",
};
