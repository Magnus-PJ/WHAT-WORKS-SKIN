import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const tier = z.enum(["A", "B", "C", "D"]);

// Strict percent like "44%", "100%". Used directly as CSS width on the
// evidence bar fills, so anything outside 0–100% would visually break.
const percent = z
  .string()
  .regex(/^(?:100|[1-9]?\d)%$/, "Must be a percent string between 0% and 100%, e.g. 76%");

const ingredients = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/ingredients" }),
  schema: z
    .object({
      slug: z.string().min(1),
      name: z.string().min(1),
      number: z.string().min(1),
      filed: z.string().min(1),
      eyebrowKicker: z.string().min(1),
      tier,
      featured: z.boolean().optional(),
      headlineSize: z.number().int().positive().optional(),
      // Optional verbatim chemistry / sub-headline caption (e.g.
      // "all-trans retinoic acid · C₂₀H₂₈O₂ · MW 300.4 Da") rendered
      // under the H1 when the source mockup uses one in lieu of a
      // tagline.
      chemistry: z.string().optional(),
      tagline: z
        .object({ italic: z.string(), rest: z.string() })
        .strict()
        .optional(),
      lead: z.string().min(1),
      atGlance: z.array(z.tuple([z.string(), z.string()])).min(1),
      toc: z.array(z.tuple([z.string(), z.string()])).min(1),
      whatItIs: z
        .object({
          dropCap: z.string().length(1),
          title: z
            .object({ plain: z.string(), italic: z.string() })
            .strict(),
          body: z.string().min(1),
          body2: z.string().optional(),
        })
        .strict(),
      mechanism: z
        .array(z.object({ k: z.string(), b: z.string() }).strict())
        .optional(),
      evidence: z
        .array(
          z
            .object({
              c: z.string(),
              n: z.string(),
              w: percent,
              note: z.string(),
            })
            .strict(),
        )
        .optional(),
      // Verbatim study citations from source mockups that present
      // PMID-linked literature instead of evidence-bar widths.
      studies: z
        .array(
          z
            .object({
              authors: z.string(),
              journal: z.string(),
              year: z.union([z.number(), z.string()]),
              pmid: z.string(),
              n: z.union([z.number(), z.string()]).nullable().optional(),
              design: z.string(),
              duration: z.string(),
              finding: z.string(),
              grade: tier,
            })
            .strict(),
        )
        .optional(),
      concentration: z
        .array(z.object({ c: z.string(), v: z.string(), b: z.string() }).strict())
        .optional(),
      // Per-concern concentration table used by source mockups that
      // index dose ranges by clinical indication rather than by
      // headline percentage.
      byConcern: z
        .array(
          z
            .object({
              concern: z.string(),
              range: z.string(),
              note: z.string(),
              evidence: z.string(),
            })
            .strict(),
        )
        .optional(),
      // 2x2 (or N-card) "How to use" panel: schedule / dose /
      // application / AM ritual etc.
      howToUse: z
        .array(
          z
            .object({ eyebrow: z.string(), body: z.string() }).strict(),
        )
        .optional(),
      // Common mistakes — numbered list with title + body.
      mistakes: z
        .array(z.object({ t: z.string(), b: z.string() }).strict())
        .optional(),
      // Myths vs truth paired cards: m = myth quote, t = truth.
      myths: z
        .array(z.object({ m: z.string(), t: z.string() }).strict())
        .optional(),
      pairings: z
        .array(
          z
            .object({
              with: z.string(),
              verdict: z.string(),
              note: z.string(),
              ok: z.boolean(),
            })
            .strict(),
        )
        .optional(),
      products: z
        .array(
          z
            .object({
              brand: z.string(),
              name: z.string(),
              tier,
              // Either a 0-100 review score (default catalogue shape)
              // or a price string for prescription-only entries that
              // we don't grade.
              score: z.number().int().min(0).max(100).optional(),
              price: z.string().optional(),
              note: z.string(),
            })
            .strict(),
        )
        .min(1),
      faq: z.array(z.object({ q: z.string(), a: z.string() }).strict()).min(1),
      // "Related ingredients" cards rendered as a small grid.
      related: z
        .array(
          z
            .object({ tier, name: z.string(), sub: z.string() }).strict(),
        )
        .optional(),
      // Curated cross-links to 2–4 sibling ingredient briefs by slug.
      // The renderer resolves each slug to the target brief's name,
      // tier, and category so editors only have to maintain the slug
      // list — display copy stays in sync with the linked brief.
      // Each entry is either a bare slug (the default) or an
      // `{ slug, sub }` pair that overrides the auto-derived
      // one-line descriptor under the card. Use the override only
      // when the auto-derived sub reads awkwardly next to the card's
      // name (e.g. "Cell-derived vesicles · Cosmetic exosomes" under
      // an "Exosomes (cosmetic)" card).
      relatedIngredients: z
        .array(
          z.union([
            z.string().min(1),
            z
              .object({ slug: z.string().min(1), sub: z.string().min(1) })
              .strict(),
          ]),
        )
        .min(2)
        .max(4)
        .optional(),
      reviewer: z
        .object({
          name: z.string(),
          credentials: z.string().optional(),
          title: z.string(),
          // Optional verbatim pull-quote for ingredients with a
          // reviewer-note section in the source mockup.
          quote: z.string().optional(),
        })
        .strict()
        .optional(),
      // Optional explicit cross-references into the /sources catalogue.
      // IDs follow the same shape the index uses internally:
      // `pmid-<n>` for ingredient studies, `cite-<slug>` for product
      // sources. Unknown IDs are skipped silently by the index.
      citations: z.array(z.string().min(1)).optional(),
    })
    .strict()
    // The renderer maps `pairings` and `mistakes` to the same folio
    // (§ 06) under the legacy and extended layouts respectively, so
    // mixing the two on a single ingredient would cause a duplicate
    // section number. Any source mockup that needs both should be
    // reviewed and the renderer extended deliberately.
    .refine(
      (d) => !((d.pairings?.length ?? 0) > 0 && (d.mistakes?.length ?? 0) > 0),
      {
        message:
          "An ingredient cannot use both `pairings` (legacy § 06) and `mistakes` (extended § 06) — pick one layout.",
        path: ["pairings"],
      },
    ),
});

// Catalogue collections ported from the mockup sandbox. The source
// detail pages have varied internal shapes (hand-authored React
// components), so the schemas here are intentionally permissive:
// every section beyond the catalogue-row metadata is optional, and
// the inner shapes use loose object types so extraction-time variance
// doesn't break the build. Templates render sections only when their
// data is present.

const looseRows = z.array(z.unknown()).optional();
const faqList = z
  .array(z.object({ q: z.string(), a: z.string() }).passthrough())
  .optional();

const concerns = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/concerns" }),
  schema: z.object({
    slug: z.string().min(1),
    name: z.string().min(1),
    family: z.string().min(1),
    eyebrow: z.string().min(1),
    dek: z.string().min(1),
    oneliner: z.string().min(1),
    reviewer: z.string().optional(),
    pageRef: z.string().optional(),
    filed: z.string().optional(),
    // Editor flag: when true, this brief is pinned into the home
    // page's "Browse · Concerns" grid. When more than three are
    // flagged, the home page picks the first three alphabetically by
    // name. When fewer than three are flagged, it falls back to the
    // same alphabetical fill so the grid is never short.
    featured: z.boolean().optional(),
    // Two-line poster H1 from the JSX-prop concern pages — `hero1`
    // sits on top in the catalogue display face, `hero2` below in
    // italic accent. Optional: bare-metadata pages without a poster
    // line fall back to the catalogue `name`.
    hero1: z.string().optional(),
    hero2: z.string().optional(),
    // Bottom-line callout printed at the foot of the protocol /
    // phases section.
    bottom: z.string().optional(),
    triggers: z
      .array(
        z
          .object({ k: z.string(), w: z.string(), n: z.string() })
          .passthrough(),
      )
      .optional(),
    ingredients: z
      .array(
        z
          .object({
            name: z.string(),
            tier: tier.optional(),
            role: z.string().optional(),
            evidence: z.string().optional(),
          })
          .passthrough(),
      )
      .optional(),
    products: z
      .array(
        z
          .object({
            brand: z.string(),
            name: z.string(),
            tier: tier.optional(),
            score: z.number().optional(),
            why: z.string().optional(),
          })
          .passthrough(),
      )
      .optional(),
    phases: looseRows,
    protocolAm: looseRows,
    protocolPm: looseRows,
    avoid: looseRows,
    supplements: looseRows,
    faq: faqList,
    citations: z.array(z.string().min(1)).optional(),
  }),
});

const routines = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/routines" }),
  schema: z.object({
    slug: z.string().min(1),
    title: z.string().min(1),
    sub: z.string().min(1),
    // Editor flag: when true, this routine is pinned into the home
    // page's "Browse · Routines" grid. Same fill / cap rules as the
    // other catalogue collections.
    featured: z.boolean().optional(),
    goal: z.string().optional(),
    time: z.string().optional(),
    skinType: z.string().optional(),
    stepCount: z.number().optional(),
    minutes: z.number().optional(),
    cost: z.string().optional(),
    difficulty: z.string().optional(),
    body: z.string().optional(),
    reviewer: z.string().optional(),
    pageRef: z.string().optional(),
    filed: z.string().optional(),
    eyebrow: z.string().optional(),
    steps: z
      .array(
        z
          .object({
            n: z.string().optional(),
            t: z.string().optional(),
            time: z.string().optional(),
            title: z.string().optional(),
            sub: z.string().optional(),
            body: z.string().optional(),
            products: z.array(z.unknown()).optional(),
            activeKey: z.string().optional(),
            activeVal: z.string().optional(),
          })
          .passthrough(),
      )
      .optional(),
    timeline: z
      .array(
        z
          .object({ d: z.string(), t: z.string(), body: z.string() })
          .passthrough(),
      )
      .optional(),
    forbidden: z
      .array(
        z
          .object({ d: z.string(), what: z.string() })
          .passthrough(),
      )
      .optional(),
    citations: z.array(z.string().min(1)).optional(),
  }),
});

const supplements = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/supplements" }),
  schema: z.object({
    slug: z.string().min(1),
    name: z.string().min(1),
    family: z.string().min(1),
    target: z.string().min(1),
    tier,
    dose: z.string().optional(),
    rxOnly: z.boolean().optional(),
    oneliner: z.string().min(1),
    // Editor flag: when true, this supplement is pinned into the
    // home page's "Browse · Supplements" grid. Same fill / cap rules
    // as the other catalogue collections.
    featured: z.boolean().optional(),
    pageRef: z.string().optional(),
    filed: z.string().optional(),
    eyebrow: z.string().optional(),
    headline: z.string().optional(),
    // Lead paragraph from JSX-prop supplement pages — sits under the
    // tagline as the hero brief.
    dek: z.string().optional(),
    // Italic + plain tagline pair under the H1 (e.g. "Real for
    // deficiency. / Marketing for everyone else.")
    subheadA: z.string().optional(),
    subheadB: z.string().optional(),
    // Bottom-line italic callout above the FAQ.
    bottom: z.string().optional(),
    glance: z.array(z.tuple([z.string(), z.string()])).optional(),
    evidence: z
      .array(
        z
          .object({
            yr: z.string().optional(),
            n: z.union([z.string(), z.number()]).optional(),
            design: z.string().optional(),
            dose: z.string().optional(),
            outcome: z.string().optional(),
            grade: z.string().optional(),
          })
          .passthrough(),
      )
      .optional(),
    forms: z
      .array(
        z
          .object({
            // Two shapes are present in the source mockups: brand/name/dose
            // for the older comparison-table pages (polypodium et al.) and
            // f/abs/note for the JSX-prop pages. Both are accepted; the
            // renderer detects which keys are present.
            brand: z.string().optional(),
            name: z.string().optional(),
            dose: z.string().optional(),
            note: z.string().optional(),
            tier: tier.optional(),
            f: z.string().optional(),
            abs: z.string().optional(),
          })
          .passthrough(),
      )
      .optional(),
    faq: faqList,
    citations: z.array(z.string().min(1)).optional(),
  }),
});

const trendWatch = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/trend-watch" }),
  schema: z.object({
    slug: z.string().min(1),
    n: z.number().int().positive(),
    date: z.string().min(1),
    year: z.number().int(),
    headline: z.string().min(1),
    dek: z.string().min(1),
    signed: z.string().optional(),
    pageRef: z.string().optional(),
    eyebrow: z.string().optional(),
    verdicts: z
      .array(
        z
          .object({
            n: z.union([z.string(), z.number()]).optional(),
            name: z.string(),
            verdict: z.string(),
            tier: tier.optional(),
            // `body` is either a plain string (the historical shape)
            // or a structured rich-text array of segments where each
            // segment is either a string or an inline `{ text, kind,
            // slug }` link to a brief. `TrendWatchIssue.astro`
            // normalises the two shapes through `normaliseBody`; the
            // cross-link coverage report walks the link segments to
            // verify each `(kind, slug)` resolves and to credit them
            // toward the resolved-reference total.
            body: z
              .union([
                z.string(),
                z.array(
                  z.union([
                    z.string(),
                    z.object({
                      text: z.string().min(1),
                      kind: z.enum([
                        "ingredient",
                        "concern",
                        "product",
                        "supplement",
                        "routine",
                      ]),
                      slug: z.string().min(1),
                    }),
                  ]),
                ),
              ])
              .optional(),
            bottom: z.string().optional(),
          })
          .passthrough(),
      )
      .optional(),
    // Per-issue override for the home page's three "in-focus" cards.
    // When a slug is set here, the home page pins that brief for the
    // duration of this issue instead of using its auto-rotation pool.
    // The slug must still pass the band's rich-data check (triggers /
    // scoreBreakdown / bar-shape evidence); otherwise the home falls
    // back to the rotation pick so the page doesn't render half-empty.
    focus: z
      .object({
        concern: z.string().min(1).optional(),
        product: z.string().min(1).optional(),
        supplement: z.string().min(1).optional(),
      })
      .strict()
      .optional(),
    citations: z.array(z.string().min(1)).optional(),
  }),
});

const products = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/products" }),
  schema: z.object({
    slug: z.string().min(1),
    brand: z.string().min(1),
    name: z.string().min(1),
    tier,
    // Editor flag: when true, this product is pinned into the home
    // page's "Browse · Products" grid. Same fill / cap rules as the
    // other catalogue collections.
    featured: z.boolean().optional(),
    // Optional ProductTemplate-shaped fields lifted out of the source
    // `D: ProductData` constant so the brief can render the same chrome.
    category: z.string().optional(),
    tagline: z.string().optional(),
    reviewer: z.string().optional(),
    pageRef: z.string().optional(),
    filed: z.string().optional(),
    eyebrow: z.string().optional(),
    hero: z.string().optional(),
    // Optional one-sentence editorial verdict, mirroring the same field
    // on concerns and supplements. When present, the catalogue index
    // shows it as a bottom-line callout in place of the hero one-liner.
    bottom: z.string().optional(),
    score: z.number().optional(),
    maxScore: z.number().optional(),
    scoreBreakdown: z
      .array(
        z
          .object({
            k: z.string(),
            v: z.number().optional(),
            max: z.number().optional(),
            n: z.string().optional(),
          })
          .passthrough(),
      )
      .optional(),
    ingredients: z
      .array(
        z
          .object({
            i: z.string().optional(),
            name: z.string().optional(),
            role: z.string().optional(),
            tier: tier.optional(),
            note: z.string().optional(),
          })
          .passthrough(),
      )
      .optional(),
    facts: z.array(z.tuple([z.string(), z.string()])).optional(),
    useCases: z
      .array(
        z
          .object({ k: z.string(), b: z.string() })
          .passthrough(),
      )
      .optional(),
    alts: z
      .array(
        z
          .object({
            brand: z.string().optional(),
            name: z.string().optional(),
            tier: tier.optional(),
            score: z.number().optional(),
            note: z.string().optional(),
          })
          .passthrough(),
      )
      .optional(),
    faq: faqList,
    sources: z
      .array(
        z
          .object({ n: z.string(), w: z.string().optional() })
          .passthrough(),
      )
      .optional(),
    citations: z.array(z.string().min(1)).optional(),
  }),
});

// Single source of truth for the version, last-reviewed date, and
// changelog displayed across the transparency-style reader surfaces
// (/methodology, /how-we-rate, /sources, /corrections, plus the
// masthead pages /editors and /letters). One file, one entry; the
// pages all read from it so editors only have to bump the date /
// version in one place.
const transparency = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/transparency" }),
  schema: z
    .object({
      methodology: z
        .object({
          version: z.string().regex(/^v\d+\.\d+$/, "Use SemVer-ish e.g. v1.2"),
          lastUpdated: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, "ISO date like 2026-04-02"),
          changelog: z
            .array(
              z
                .object({
                  v: z.string().regex(/^v\d+\.\d+$/),
                  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
                  note: z.string().min(1),
                })
                .strict(),
            )
            .min(1),
        })
        .strict(),
      pages: z
        .object({
          methodology: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          howWeRate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          sources: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          corrections: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          editors: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          letters: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        })
        .strict(),
    })
    .strict(),
});

export const collections = {
  ingredients,
  concerns,
  routines,
  supplements,
  trendWatch,
  products,
  transparency,
};
