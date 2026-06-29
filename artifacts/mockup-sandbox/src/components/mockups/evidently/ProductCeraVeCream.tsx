import React from "react";
import { ProductTemplate, ProductData } from "./_ProductTemplate";

const D: ProductData = {
  brand: "CeraVe",
  productName: "Moisturizing Cream",
  tagline: "the boring gold standard.",
  category: "Moisturisers",
  pageRef: "P. 21",
  filed: "22-APR-2026",
  reviewer: "Dr. Aanya Mehta",
  eyebrow: "Product · Moisturiser · Barrier repair",
  tier: "A",
  hero: "The dermatologist-recommended moisturiser more often than any other in the past decade. Three ceramides, two humectants, MVE delivery, no fragrance. Thick enough to feel like medicine, light enough to wear daily.",
  facts: [
    ["Format", "Tub or tube cream, 340 g / 50 mL"],
    ["Ceramides", "1, 3, 6-II"],
    ["Humectants", "Glycerin + hyaluronic acid"],
    ["Fragrance", "None"],
    ["Price", "₹ 1,250 / 50 mL"],
    ["Pregnancy-safe", "Yes"],
  ],
  scoreBreakdown: [
    { k: "Barrier-restoration evidence", v: 23, max: 25, n: "Multiple RCTs in eczema and post-procedure populations." },
    { k: "Formulation depth", v: 22, max: 25, n: "3-ceramide complex at physiological ratio. Rare combo." },
    { k: "Tolerability", v: 24, max: 25, n: "Fragrance-free, dye-free; gentle for sensitive and pediatric skin." },
    { k: "Value", v: 19, max: 25, n: "₹ 1,250 / 50 mL fair internationally; pricey vs Indian baseline." },
  ],
  ingredients: [
    { i: "Ceramide NP / AP / EOP", role: "Barrier lipids", tier: "A", note: "Three-ceramide complex matches stratum corneum lipid ratios." },
    { i: "Cholesterol", role: "Barrier lipid", tier: "A", note: "Completes the ceramide / cholesterol / fatty acid triad." },
    { i: "Glycerin", role: "Humectant", tier: "A", note: "Workhorse. High % here." },
    { i: "Hyaluronic acid", role: "Humectant", tier: "A", note: "Surface-level moisture binding." },
    { i: "Petrolatum", role: "Occlusive", tier: "A", note: "TEWL-reducer at 99%. Underrated in modern formulas." },
  ],
  useCases: [
    { k: "Eczema / atopic skin", b: "First-line barrier repair adjunct. RCT-validated in mild-moderate AD." },
    { k: "Post-procedure days 3-14", b: "After laser, microneedling, peels — once the wound has closed." },
    { k: "Daily PM moisturiser for dry-to-normal skin", b: "Layer over a serum; sealing without comedone risk." },
  ],
  alts: [
    { brand: "Vanicream", name: "Moisturizing Cream", tier: "A", score: 82, note: "Slightly thicker; for severely allergy-prone skin." },
    { brand: "La Roche-Posay", name: "Toleriane Double Repair", tier: "A", score: 85, note: "Adds niacinamide; lighter texture for oilier skin." },
    { brand: "Aveeno", name: "Restorative Skin Therapy", tier: "B", score: 76, note: "Oat-based; comparable comfort, less ceramide depth." },
  ],
  faq: [
    { q: "Tub or tube?", a: "Tube for face — sanitary, controllable. Tub is fine for body if you scoop with clean hands. Both contain the same formula." },
    { q: "Too heavy for oily skin?", a: "Often yes — try CeraVe PM Lotion or LRP Toleriane Sensitive Fluide instead. The cream is built for dry-to-normal." },
    { q: "Does it really repair the barrier?", a: "It restores the lipid matrix the barrier needs to repair itself. Healing is biological; the moisturiser feeds the process. Multiple TEWL studies show measurable repair within 7-14 days." },
    { q: "Vanicream vs CeraVe Cream?", a: "Vanicream is fragrance-free, preservative-light, allergen-screened — best for severe sensitivity. CeraVe wins on ceramide content. For most skin, CeraVe; for problem skin with multi-allergen history, Vanicream." },
  ],
  sources: [
    { n: "Lynde CW et al. Ceramides as moisturizers. JCMS 2019.", w: "REVIEW" },
    { n: "Spada F et al. CeraVe Moisturizing Cream in eczema. JDD 2018.", w: "RCT" },
    { n: "Draelos ZD. Therapeutic moisturizers. Dermatol Clin 2000.", w: "REVIEW" },
    { n: "CeraVe MVE delivery dossier. 2020.", w: "MFR DATA" },
  ],
};

const ProductCeraVeCream: React.FC = () => <ProductTemplate d={D} />;
export default ProductCeraVeCream;
