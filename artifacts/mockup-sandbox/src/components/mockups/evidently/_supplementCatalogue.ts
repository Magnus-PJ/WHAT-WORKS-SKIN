// Canonical supplement catalogue.
//
// Single source of truth for the rows shown on `SupplementIndex`, the
// rows the search registry surfaces in the header overlay, and the
// home-page "On our shelf" supplement strip. Slug → component file
// map and the resolver helper live here so detail-page URLs stay
// consistent across all consumers.

const PREVIEW_BASE = "/__mockup/preview/evidently";

export type SupplementRow = {
  slug: string;
  name: string;
  family: string;
  target: string;
  tier: "A" | "B" | "C" | "D";
  dose: string;
  rxOnly?: boolean;
  oneliner: string;
  trending?: number;
};

export const SUPPLEMENT_ROWS: SupplementRow[] = [
  // Photoprotection
  { slug: "polypodium",       name: "Polypodium leucotomos", family: "Photoprotection", target: "UV defence", tier: "B", dose: "240 mg × 2/d", oneliner: "Most-studied oral photoprotectant. Adjunct, not replacement.", trending: 1 },
  { slug: "tranexamic-oral",  name: "Tranexamic acid (oral)", family: "Photoprotection", target: "Melasma", tier: "A", dose: "250 mg × 2/d × 8–12 wk", rxOnly: true, oneliner: "Strong RCT data in melasma. Screened for VTE risk.", trending: 2 },
  { slug: "carotenoids",      name: "Beta-carotene + lycopene", family: "Photoprotection", target: "UV defence", tier: "C", dose: "10 mg / 25 mg / d", oneliner: "Modest, slow contribution. Diet-first option exists." },

  // Pigment / inflammation
  { slug: "glutathione-oral", name: "Glutathione (oral)",   family: "Pigmentation", target: "Tone", tier: "C", dose: "250–500 mg/d × 12 wk", oneliner: "Mixed signals. Bioavailability is the open question." },
  { slug: "glutathione-iv",   name: "Glutathione (IV)",     family: "Pigmentation", target: "Tone", tier: "D", dose: "Clinic-administered", rxOnly: true, oneliner: "Clinic marketing. Evidence does not match the price tag." },
  { slug: "n-acetylcysteine", name: "N-acetylcysteine",     family: "Pigmentation", target: "Acne / inflammation", tier: "B", dose: "600 mg × 2/d", oneliner: "Antioxidant precursor. Modest acne-mood data." },

  // Hair / Skin / Nails (general)
  { slug: "biotin",           name: "Biotin",               family: "Hair & nails", target: "Hair / nails", tier: "C", dose: "30–100 mcg/d (RDA)", oneliner: "Real for documented deficiency. Otherwise, marketing.", trending: 4 },
  { slug: "collagen-peptides", name: "Hydrolysed collagen peptides", family: "Hair & nails", target: "Skin elasticity", tier: "B", dose: "5–10 g/d × 12 wk", oneliner: "Modest, replicated benefit on elasticity. Quality varies by brand.", trending: 3 },
  { slug: "iron",             name: "Iron (when deficient)", family: "Hair & nails", target: "Hair shedding", tier: "A", dose: "Per ferritin level", rxOnly: true, oneliner: "Treat the cause. Don't supplement blindly — get tested." },
  { slug: "zinc",             name: "Zinc",                 family: "Hair & nails", target: "Acne · hair shedding", tier: "B", dose: "15–30 mg/d, with food", oneliner: "Mild acne benefit. Cap at 40 mg/d to avoid copper depletion." },

  // Skin barrier / hydration
  { slug: "omega-3",          name: "Omega-3 (EPA + DHA)",  family: "Barrier & inflammation", target: "Inflammation", tier: "A", dose: "1–2 g EPA+DHA/d", oneliner: "Reduces general inflammation signalling. Fish-oil or algae form." },
  { slug: "vitamin-d",        name: "Vitamin D",            family: "Barrier & inflammation", target: "Eczema · acne", tier: "B", dose: "Per 25(OH)D level", rxOnly: false, oneliner: "Test before supplementing. Most Indian adults are insufficient." },
  { slug: "probiotics-skin",  name: "Probiotics (Lactobacillus rhamnosus)", family: "Barrier & inflammation", target: "Atopic skin", tier: "C", dose: "10⁹ CFU/d × 12 wk", oneliner: "Promising in eczema-prone children; adult data thinner." },

  // Trending pseudo
  { slug: "marine-collagen-mega", name: "Marine collagen 10 g 'beauty'", family: "Trend Watch", target: "Anti-aging", tier: "C", dose: "10 g/d", oneliner: "Indistinguishable from generic peptide; marketing premium." },
  { slug: "ceramide-oral",    name: "Ceramide capsules",    family: "Trend Watch", target: "Hydration", tier: "C", dose: "30 mg/d", oneliner: "Modest hydration data. Topical ceramides outperform per rupee." },
  { slug: "exosome-oral",     name: "Oral 'exosome' beverages", family: "Trend Watch", target: "Anti-aging", tier: "D", dose: "Marketing-defined", oneliner: "Drinking peptide soup. Save your money for SPF." },
  { slug: "sea-moss",         name: "Sea moss capsules",    family: "Trend Watch", target: "Vague", tier: "D", dose: "1–2 g/d", oneliner: "TikTok cure-all. No skin-specific human data." },

  // Antioxidants & longevity adjuncts
  { slug: "astaxanthin",      name: "Astaxanthin",          family: "Photoprotection", target: "UV defence · elasticity", tier: "B", dose: "4–12 mg/d × 12 wk", oneliner: "Carotenoid antioxidant with replicated elasticity and MED data." },
  { slug: "vitamin-c-oral",   name: "Vitamin C (oral)",     family: "Pigmentation", target: "Antioxidant baseline", tier: "C", dose: "500–1000 mg/d", oneliner: "Topical outperforms oral for skin endpoints. Real for deficiency only." },
  { slug: "magnesium-glycinate", name: "Magnesium glycinate", family: "Barrier & inflammation", target: "Sleep · skin recovery", tier: "C", dose: "200–400 mg/d, evening", oneliner: "Sleep is a skin variable. Indirect benefit at best." },
  { slug: "evening-primrose", name: "Evening primrose oil", family: "Barrier & inflammation", target: "Atopic skin", tier: "C", dose: "500–1000 mg/d × 12 wk", oneliner: "GLA precursor. Mixed eczema data; safer than spectacular." },
  { slug: "spirulina",        name: "Spirulina",            family: "Trend Watch", target: "Vague", tier: "C", dose: "2–5 g/d", oneliner: "Algae protein with micronutrient profile. No skin-specific RCTs." },
];

// Slug → detail page component file name (without .tsx). A few legacy
// slug aliases (`polypodium-leucotomos`, `collagen`) are kept so older
// links continue resolving.
export const SUPPLEMENT_BUILT: Record<string, string> = {
  "polypodium-leucotomos": "SupplementDetail",
  "polypodium": "SupplementDetail",
  "astaxanthin": "SupplementAstaxanthin",
  "collagen-peptides": "SupplementCollagen",
  "collagen": "SupplementCollagen",
  "zinc": "SupplementZinc",
  "tranexamic-oral": "SupplementTranexamic",
  "carotenoids": "SupplementCarotenoids",
  "glutathione-oral": "SupplementGlutathioneOral",
  "glutathione-iv": "SupplementGlutathioneIV",
  "n-acetylcysteine": "SupplementNAC",
  "biotin": "SupplementBiotin",
  "iron": "SupplementIron",
  "omega-3": "SupplementOmega3",
  "vitamin-d": "SupplementVitaminD",
  "probiotics-skin": "SupplementProbiotics",
  "marine-collagen-mega": "SupplementMarineCollagen",
  "ceramide-oral": "SupplementCeramide",
  "exosome-oral": "SupplementExosome",
  "sea-moss": "SupplementSeaMoss",
  "vitamin-c-oral": "SupplementVitaminC",
  "magnesium-glycinate": "SupplementMagnesium",
  "evening-primrose": "SupplementEveningPrimrose",
  "spirulina": "SupplementSpirulina",
};

export function linkForSupplement(slug: string): string {
  return SUPPLEMENT_BUILT[slug] ? `${PREVIEW_BASE}/${SUPPLEMENT_BUILT[slug]}` : "#";
}
