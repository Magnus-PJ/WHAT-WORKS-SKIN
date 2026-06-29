import React from "react";
import { ProductTemplate, ProductData } from "./_ProductTemplate";

const D: ProductData = {
  brand: "The Ordinary",
  productName: "Azelaic Acid Suspension 10%",
  tagline: "cheapest serious azelaic.",
  category: "Actives",
  pageRef: "P. 26",
  filed: "22-APR-2026",
  reviewer: "Dr. Aanya Mehta",
  eyebrow: "Product · Active · Azelaic acid",
  tier: "A",
  hero: "Azelaic 10% in a silicone-cream suspension at the lowest price point on Earth. The vehicle is divisive — silicone-rich, slow to absorb — but the active is the real thing, and the only sub-₹ 1,000 entry into proper azelaic.",
  facts: [
    ["Format", "Cream-suspension, 30 mL"],
    ["Azelaic acid", "10%"],
    ["pH", "~ 4.0"],
    ["Vehicle", "Silicone-rich, fragrance-free"],
    ["Price", "₹ 850 / 30 mL"],
    ["Pregnancy-safe", "Yes"],
  ],
  scoreBreakdown: [
    { k: "Active concentration", v: 22, max: 25, n: "10% — at the lower end of clinical efficacy for melasma." },
    { k: "Vehicle quality", v: 14, max: 25, n: "Silicone-thick, slow-absorbing; pills under SPF." },
    { k: "Evidence per claim", v: 21, max: 25, n: "Azelaic class evidence is strong; this product not separately RCT'd." },
    { k: "Value", v: 23, max: 25, n: "₹ 850 / 30 mL is the cheapest serious azelaic in India." },
  ],
  ingredients: [
    { i: "Azelaic acid 10%", role: "Anti-acne / pigment", tier: "A", note: "Lower bound of clinical efficacy; useful for maintenance." },
    { i: "Dimethicone / silicones", role: "Vehicle", tier: "B", note: "Heavy slip; the source of the famous pilling." },
    { i: "Tocopherol", role: "Antioxidant", tier: "A", note: "Standard adjunct." },
    { i: "Allantoin", role: "Soothing", tier: "B", note: "Modest anti-irritant; useful given the active dose." },
    { i: "Phenoxyethanol", role: "Preservative", tier: "B", note: "Standard, well-tolerated." },
  ],
  useCases: [
    { k: "Mild rosacea", b: "Once-daily PM. The on-ramp before prescription Finacea." },
    { k: "Post-inflammatory pigmentation maintenance", b: "Cheaper PIH adjunct than Rx finacea." },
    { k: "Comedonal acne with sensitivity", b: "When BHA stings and tret is too aggressive." },
  ],
  alts: [
    { brand: "Deconstruct", name: "Azelaic 15% Booster", tier: "A", score: 79, note: "Higher concentration, lighter vehicle, similar price." },
    { brand: "Bayer", name: "Finacea Gel 15% (Rx)", tier: "A", score: 86, note: "True clinical-grade; gel vehicle, much higher cost." },
    { brand: "Naturium", name: "Azelaic Topical Acid 10%", tier: "B", score: 73, note: "Cleaner vehicle; harder to source in India." },
  ],
  faq: [
    { q: "Why does it pill under sunscreen?", a: "The silicone-rich vehicle. Apply, wait 5-10 minutes, then SPF — and use a thin, well-blended SPF layer over it. Or move it to PM-only." },
    { q: "10% vs 15% vs 20%?", a: "10% works for maintenance and mild rosacea. 15% (Deconstruct) is the value sweet spot. 20% (Rx Skinoren) for active rosacea or stubborn melasma." },
    { q: "Pregnancy?", a: "Yes — azelaic is one of the safest pregnancy actives we have. Use freely as a melasma adjunct in pregnancy when hydroquinone and tretinoin are off the table." },
    { q: "Stinging on first use?", a: "Common in week 1-2. Apply over a thin moisturiser layer; reduce frequency to every other night. Should settle by week 3." },
  ],
  sources: [
    { n: "Sieber MA, Hegel JK. Azelaic acid: properties and mode of action. Skin Pharmacol Physiol 2014.", w: "REVIEW" },
    { n: "Verallo-Rowell VM et al. Azelaic 20% vs hydroquinone 4% in melasma. Acta Derm Venereol 1989.", w: "RCT" },
    { n: "The Ordinary Az 10% formulation dossier. 2022.", w: "MFR DATA" },
    { n: "Liu RH et al. Azelaic acid in pregnancy. Am J Clin Dermatol 2020.", w: "REVIEW" },
  ],
};

const ProductOrdinaryAza: React.FC = () => <ProductTemplate d={D} />;
export default ProductOrdinaryAza;
