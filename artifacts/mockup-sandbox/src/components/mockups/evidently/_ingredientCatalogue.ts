// Canonical ingredient catalogue.
//
// Single source of truth for the rows shown on `IngredientIndex` and
// the rows the search registry surfaces in the header overlay.
//
// Display names and detail-page URLs live in `_links.tsx` (the
// `INGREDIENTS` map, accessed via `ingredientNameFor()` /
// `ingredientHrefFor()`) — the catalogue stays
// slug-keyed and free of presentational helpers so it can be safely
// imported from anywhere without pulling in chrome / theme code.

import type { Tier } from "./_links";

export type IngredientRow = {
  slug: string;
  tier: Tier;
  fnClass: string;
  concern: string;
  blurb: string;
  /** How many reviewed products feature this ingredient (manual). */
  usedIn: number;
  /** Trending rank if surfaced in the hub's "trending now" strip. */
  trending?: number;
};

export const INGREDIENT_ROWS: IngredientRow[] = [
  { slug: "tretinoin", tier: "A", fnClass: "Retinoid", concern: "Anti-aging", blurb: "Prescription gold-standard. Most-studied retinoid in dermatology.", usedIn: 4, trending: 5 },
  { slug: "retinol", tier: "A", fnClass: "Retinoid", concern: "Anti-aging", blurb: "OTC retinoid. Anti-aging, tone, texture — works at 0.3–1%.", usedIn: 6, trending: 1 },
  { slug: "adapalene", tier: "A", fnClass: "Retinoid", concern: "Acne", blurb: "Only OTC retinoid FDA-approved for acne. Comedonal skin's best friend.", usedIn: 1, trending: 4 },
  { slug: "bakuchiol", tier: "B", fnClass: "Botanical", concern: "Anti-aging", blurb: "Plant-based retinoid analogue. Pregnancy-friendly anti-aging.", usedIn: 2 },
  { slug: "niacinamide", tier: "A", fnClass: "Antioxidant", concern: "Barrier", blurb: "Barrier, oil control, mild pigmentation. Tolerates almost everything.", usedIn: 12, trending: 2 },
  { slug: "l-ascorbic-acid", tier: "A", fnClass: "Antioxidant", concern: "Pigmentation", blurb: "Vitamin C with the most clinical data. Needs pH < 3.5.", usedIn: 2, trending: 6 },
  { slug: "azelaic-acid", tier: "A", fnClass: "Antibacterial", concern: "Acne", blurb: "Rosacea, acne, PIH. The 'multitasker that doesn't oversell.'", usedIn: 0 },
  { slug: "salicylic-acid", tier: "A", fnClass: "BHA", concern: "Acne", blurb: "Oil-soluble. Acne BHA default — therapeutic at pH ≤ 4.", usedIn: 1 },
  { slug: "glycolic-acid", tier: "A", fnClass: "AHA", concern: "Exfoliation", blurb: "AHA with the most clinical data. Tone, texture, fine lines.", usedIn: 0 },
  { slug: "lactic-acid", tier: "A", fnClass: "AHA", concern: "Exfoliation", blurb: "Gentler than glycolic, hydrating bonus.", usedIn: 0 },
  { slug: "mandelic-acid", tier: "B", fnClass: "AHA", concern: "Sensitive", blurb: "Largest molecule AHA. Sensitive-skin exfoliation.", usedIn: 0 },
  { slug: "tranexamic-acid", tier: "A", fnClass: "Antioxidant", concern: "Pigmentation", blurb: "Topical melasma go-to. Works on stubborn pigment retinoids miss.", usedIn: 1 },
  { slug: "alpha-arbutin", tier: "B", fnClass: "Antioxidant", concern: "Pigmentation", blurb: "Gentler pigment inhibitor. Pregnancy-safe option.", usedIn: 0 },
  { slug: "hyaluronic-acid", tier: "A", fnClass: "Hydrator", concern: "Hydration", blurb: "Humectant. Effect is real but cosmetic and surface-level.", usedIn: 0 },
  { slug: "ceramides", tier: "A", fnClass: "Lipid", concern: "Barrier", blurb: "Barrier lipids. Non-negotiable for compromised skin.", usedIn: 0 },
  { slug: "centella", tier: "B", fnClass: "Botanical", concern: "Sensitive", blurb: "Soothing. Good post-procedure support.", usedIn: 1 },
  { slug: "panthenol", tier: "B", fnClass: "Hydrator", concern: "Hydration", blurb: "Pro-vitamin B5. Modest, consistent barrier benefits.", usedIn: 0 },
  { slug: "peptides-signal", tier: "B", fnClass: "Peptide", concern: "Anti-aging", blurb: "Modest, consistent anti-aging. Slower than retinoids.", usedIn: 1 },
  { slug: "peptides-copper", tier: "B", fnClass: "Peptide", concern: "Anti-aging", blurb: "GHK-Cu. Anti-aging and wound support — promising data.", usedIn: 0 },
  { slug: "uv-filters", tier: "A", fnClass: "Photoprotection", concern: "Sun protection", blurb: "The one non-negotiable. Modern long-UVA filters preferred.", usedIn: 8 },
  { slug: "zinc-oxide", tier: "A", fnClass: "Photoprotection", concern: "Sun protection", blurb: "Mineral filter. Broad-spectrum, photostable, baby-safe.", usedIn: 2 },
  { slug: "bemotrizinol", tier: "A", fnClass: "Photoprotection", concern: "Sun protection", blurb: "Best-in-class long-UVA chemical filter. Outside US markets.", usedIn: 1 },
  { slug: "snail-mucin", tier: "C", fnClass: "Hydrator", concern: "Barrier", blurb: "K-beauty staple. Real but modest barrier signal.", usedIn: 1 },
  { slug: "propolis", tier: "C", fnClass: "Botanical", concern: "Sensitive", blurb: "Bee resin. Antimicrobial, mild anti-inflammatory.", usedIn: 0 },
  { slug: "benzoyl-peroxide", tier: "A", fnClass: "Antibacterial", concern: "Acne", blurb: "Kills C. acnes without resistance. Bleaches fabrics.", usedIn: 0 },
  { slug: "sulphur", tier: "B", fnClass: "Antibacterial", concern: "Acne", blurb: "Old-school. Spot treatment for inflammatory papules.", usedIn: 0 },
  { slug: "exosomes", tier: "D", fnClass: "Botanical", concern: "Anti-aging", blurb: "Marketed for anti-aging, 'regeneration'. Evidence does not match claims.", usedIn: 0 },
];
