// IngredientSnailMucin — full ingredient brief for snail mucin.
import React from "react";
import { IngredientBrief, type IngredientBriefData } from "./_IngredientBrief";

export const data: IngredientBriefData = {
  slug: "snail-mucin",
  name: "Snail mucin",
  number: "23 / 28",
  filed: "18 APR 2026",
  eyebrowKicker: "Ingredient · Biofiltrate · Snail secretion",
  tier: "C",
  headlineSize: 116,
  tagline: { italic: "K-beauty's biggest export —", rest: "with a real but modest signal." },
  lead:
    "A complex secretion containing glycoproteins, hyaluronic acid, glycolic acid, and antimicrobial peptides. The marketing claims regularly outrun the data, but the data is not nothing: real barrier signal in modest amounts, useful as a supportive layer rather than as a treatment in itself.",
  atGlance: [
    ["INCI", "Snail Secretion Filtrate"],
    ["Family", "Animal-derived biofiltrate"],
    ["Useful range", "70 – 96% of formula (essence format)"],
    ["Vehicle", "Aqueous essence or ampoule"],
    ["Pregnancy-safe", "Generally yes (topical)"],
    ["Photo-stable", "Yes"],
    ["Reviewer", "Dr. Paul · 18-Apr-2026"],
  ],
  toc: [
    ["01", "What it is"],
    ["02", "What's actually in it"],
    ["03", "Evidence overview"],
    ["04", "Concentration & vehicle"],
    ["05", "Where it earns its tier"],
    ["06", "Pairings & conflicts"],
    ["07", "On our shelf"],
    ["08", "FAQ"],
  ],
  whatItIs: {
    dropCap: "S",
    title: { plain: "What snail mucin", italic: "actually is." },
    body:
      "nail secretion filtrate is exactly what the name says: a filtered version of the mucus produced by helix aspersa müller (the common garden snail). Its composition includes hyaluronic acid, glycolic acid in trace amounts, allantoin, copper peptides, and a long tail of glycoproteins. Most of those ingredients are individually well-evidenced; the question is whether the snail-derived blend offers anything beyond what you'd get from a well-formulated essence with the same individual actives.",
    body2:
      "The honest answer is: probably a little, in some skin types. Not enough to deserve the cult status. Enough to deserve a Tier C — present, useful, oversold.",
  },
  mechanism: [
    { k: "Surface hydration", b: "HA and allantoin component bind water at the corneocyte surface; standard humectant role." },
    { k: "Mild barrier support", b: "Glycoprotein matrix supports stratum-corneum integrity in repeated-use studies." },
    { k: "Wound-healing signalling", b: "In vitro upregulation of fibroblast proliferation; modest cosmetic translation." },
  ],
  evidence: [
    { c: "Surface hydration", n: "Bioengineering", w: "70%", note: "Real, replicable, equivalent to a well-formulated HA + allantoin essence." },
    { c: "Wound healing (post-procedure)", n: "Smaller RCTs", w: "62%", note: "Some signal in superficial post-procedure recovery; effect size modest." },
    { c: "Wrinkle / firmness", n: "Smaller RCTs", w: "44%", note: "Effect at 12+ weeks; outperformed by retinoids and peptides." },
    { c: "Acne / scarring", n: "Limited", w: "32%", note: "Marketing claim. Evidence does not support headline use." },
  ],
  concentration: [
    { c: "70%", v: "Standard essence", b: "The classic K-beauty format. Daily layering, fair price." },
    { c: "92 – 96%", v: "Premium essence", b: "Higher concentration, marginal additional benefit, premium markup." },
    { c: "10 – 20%", v: "Supportive ingredient", b: "Used in moisturisers as part of a blended hydrator system." },
  ],
  pairings: [
    { with: "Niacinamide", verdict: "Excellent", note: "Snail mucin essence first, niacinamide serum second. Clean layering.", ok: true },
    { with: "Hyaluronic acid", verdict: "Compatible", note: "Functionally redundant — snail mucin already contains HA. Pick one.", ok: true },
    { with: "Retinoids", verdict: "Excellent", note: "Snail mucin softens retinoid onboarding. The pairing K-beauty got right.", ok: true },
    { with: "Active acids", verdict: "Wait", note: "Apply acid first, normalise pH, then mucin essence as the calming layer.", ok: false },
    { with: "Vegan / cruelty-free routine", verdict: "Avoid", note: "Animal-derived ingredient. Look for plant-based glycoprotein alternatives.", ok: false },
  ],
  products: [
    { brand: "COSRX", name: "Advanced Snail 96 Mucin Power Essence", tier: "B", score: 80, note: "The reference. 96% mucin, fair price, decade of consistent quality." },
    { brand: "Mizon", name: "Snail Repair Intensive Ampoule", tier: "B", score: 76, note: "Higher-viscosity ampoule. Useful for drier, more compromised skin." },
    { brand: "Some By Mi", name: "Snail Truecica Essence", tier: "C", score: 70, note: "Snail + cica blend. Mixed-active vehicle dilutes both cases." },
    { brand: "Numbuzin", name: "No.5 Vitamin Concentrated Serum", tier: "B", score: 74, note: "Snail mucin + vitamin C derivative. Solid combination, modest scale." },
  ],
  faq: [
    { q: "Does snail mucin really work?", a: "For surface hydration and mild barrier support: yes, modestly. For 'reverses aging' and 'fades scars overnight' marketing claims: no. Frame it as a comfort layer in a routine, not as a treatment." },
    { q: "Is it cruelty-free?", a: "No — it requires extracting mucus from snails. Production methods vary in animal welfare standards; there is no industry-wide certification. Vegan alternatives use snow mushroom and plant glycoproteins to similar effect." },
    { q: "Snail mucin or hyaluronic acid?", a: "Functionally similar at the surface-hydration level. Snail mucin adds glycoproteins and trace allantoin; HA is cheaper and vegan. Pick by values and price, not expected outcome." },
    { q: "Will it heal my acne scars?", a: "It supports the healing environment. It will not flatten an atrophic scar. For real scar work, look at retinoids, microneedling, or in-clinic procedures." },
  ],
};

const IngredientSnailMucin: React.FC = () => <IngredientBrief data={data} />;
export default IngredientSnailMucin;
