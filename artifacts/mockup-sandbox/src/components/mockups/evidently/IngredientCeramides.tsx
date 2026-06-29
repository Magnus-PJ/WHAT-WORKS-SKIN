// IngredientCeramides — full ingredient brief for ceramides.
import React from "react";
import { IngredientBrief, type IngredientBriefData } from "./_IngredientBrief";

export const data: IngredientBriefData = {
  slug: "ceramides",
  name: "Ceramides",
  number: "15 / 28",
  filed: "14 APR 2026",
  eyebrowKicker: "Ingredient · Sphingolipids · Ceramides",
  tier: "A",
  headlineSize: 116,
  tagline: { italic: "The lipids your skin makes —", rest: "until it doesn't." },
  lead:
    "The structural lipids that hold the stratum corneum together. Native production drops with age, retinoid use, surfactant exposure, eczema, and almost every form of barrier insult. Topical replacement is one of the few skincare interventions whose evidence is essentially uncontroversial.",
  atGlance: [
    ["INCI", "Ceramide NP / AP / EOP / EOS / multi-blend"],
    ["Family", "Sphingolipid"],
    ["Useful range", "0.1 – 5% in formula"],
    ["Vehicle", "Cream, lotion, lipid emulsion"],
    ["Pregnancy-safe", "Yes"],
    ["Photo-stable", "Yes"],
    ["Reviewer", "Dr. Paul · 14-Apr-2026"],
  ],
  toc: [
    ["01", "What they are"],
    ["02", "Mechanism"],
    ["03", "Evidence overview"],
    ["04", "Why ratios matter"],
    ["05", "Where they earn their tier"],
    ["06", "Pairings & conflicts"],
    ["07", "On our shelf"],
    ["08", "FAQ"],
  ],
  whatItIs: {
    dropCap: "C",
    title: { plain: "What ceramides", italic: "actually are." },
    body:
      "eramides are sphingolipid molecules that, with cholesterol and free fatty acids, build the lamellar matrix of the stratum corneum — the structural mortar between corneocytes. They are the skin's primary water-retention infrastructure. When that matrix breaks down (age, harsh cleansers, retinoid onboarding, eczema, winter air), transepidermal water loss rises and almost every active becomes harsher than it should be.",
    body2:
      "Topical ceramides — particularly when delivered with cholesterol and fatty acids in physiologic ratios — measurably restore that matrix. This is one of the rare skincare claims supported by both bioengineering data and decades of clinical use in atopic dermatitis. It is also one of the most undersold ingredients on the market.",
  },
  mechanism: [
    { k: "On TEWL", b: "Reduces transepidermal water loss by reinforcing the lamellar matrix between corneocytes." },
    { k: "On barrier recovery", b: "Accelerates repair after surfactant exposure, retinoid use, or post-procedure healing." },
    { k: "On reactivity", b: "A restored barrier is a less reactive barrier. Most 'sensitive' skin is barrier-compromised skin." },
  ],
  evidence: [
    { c: "Atopic dermatitis", n: "Clinical RCTs", w: "82%", note: "Ceramide-led emollients reduce flare frequency reproducibly. National Eczema Society endorsed." },
    { c: "Post-retinoid recovery", n: "RCTs vs petrolatum", w: "76%", note: "Faster TEWL normalisation when ceramides are added on top of standard moisturiser." },
    { c: "Stratum-corneum hydration", n: "Bioengineering", w: "78%", note: "Reproducibly increases hydration with durable effect — unlike HA, holds overnight." },
    { c: "Anti-aging (direct)", n: "Limited", w: "44%", note: "Indirect: a healthier barrier ages more slowly. Not a wrinkle ingredient." },
  ],
  concentration: [
    { c: "Single ceramide", v: "Adequate", b: "Useful supportive ingredient in any cream." },
    { c: "Multi-ceramide blend", v: "Better", b: "Multiple subtypes mimic native composition more closely." },
    { c: "3:1:1 ratio", v: "Best", b: "Ceramide / cholesterol / FFA in physiologic ratio. The Elias model." },
    { c: "MVE delivery", v: "Premium", b: "Multivesicular emulsion technology — slow-release through the day." },
  ],
  pairings: [
    { with: "Retinoids", verdict: "Mandatory", note: "Ceramide moisturiser before or after retinoid is the single best onboarding tool. Use both.", ok: true },
    { with: "AHAs / BHAs", verdict: "Excellent", note: "Apply acid, normalise pH, then ceramide cream. Restores what the acid stripped.", ok: true },
    { with: "Hyaluronic acid", verdict: "Synergistic", note: "HA holds water at the surface, ceramides seal it in. Standard pair.", ok: true },
    { with: "Niacinamide", verdict: "Excellent", note: "Niacinamide upregulates native ceramide synthesis. Combo amplifies both.", ok: true },
    { with: "Harsh foaming cleansers", verdict: "Avoid", note: "SLS / SLES strips lipid matrix faster than topicals can rebuild. Switch to non-stripping cleanser first.", ok: false },
  ],
  products: [
    { brand: "CeraVe", name: "Moisturising Cream", tier: "A", score: 90, note: "The reference. Ceramide 1/3/6-II + cholesterol + MVE delivery. Quietly excellent at low cost." },
    { brand: "Dr. Jart+", name: "Ceramidin Cream", tier: "A", score: 86, note: "Korean reference. 5-ceramide blend, plush vehicle, premium markup." },
    { brand: "Skinfix", name: "Triple Lipid Peptide Cream", tier: "A", score: 88, note: "Physiologic 3:1:1 ratio formulation. Best-in-class for compromised skin." },
    { brand: "EltaMD", name: "Barrier Renewal Complex", tier: "A", score: 84, note: "Lighter texture; ceramide-led with niacinamide. Good for oilier skin." },
  ],
  faq: [
    { q: "Are all ceramide creams equal?", a: "No. The presence of ceramides is necessary but not sufficient. Ratio with cholesterol and free fatty acids, delivery system, and absence of stripping surfactants in the same formula all matter. Read the full INCI." },
    { q: "Can I have too much barrier support?", a: "Practically no. Ceramides do not over-correct. The risk is using them as cover for a stripping cleanser or aggressive routine — fix the cause too." },
    { q: "Do I need them if my skin is fine?", a: "If you are using any retinoid, exfoliating acid, BPO, or vitamin C, your barrier is regularly under load. A ceramide moisturiser is preventative infrastructure." },
    { q: "Synthetic vs plant-derived?", a: "Synthetic ceramides are biochemically identical to native sphingolipids and more consistent. 'Plant ceramides' is largely marketing — usually phytosphingosines, which are precursors, not finished molecules." },
  ],
};

const IngredientCeramides: React.FC = () => <IngredientBrief data={data} />;
export default IngredientCeramides;
