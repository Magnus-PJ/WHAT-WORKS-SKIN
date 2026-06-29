// IngredientMandelic — full ingredient brief for mandelic acid.
import React from "react";
import { IngredientBrief, type IngredientBriefData } from "./_IngredientBrief";

export const data: IngredientBriefData = {
  slug: "mandelic-acid",
  name: "Mandelic acid",
  number: "11 / 28",
  filed: "13 APR 2026",
  eyebrowKicker: "Ingredient · Alpha-hydroxy Acid · Mandelic",
  tier: "B",
  headlineSize: 116,
  tagline: { italic: "The biggest AHA molecule —", rest: "for the most reactive skin." },
  lead:
    "The largest alpha-hydroxy acid in cosmetic use. Slow-penetrating, mild, and uniquely friendly to deeper skin tones where post-inflammatory pigment is the real risk of any acid. The right tool for sensitive, reactive, or melanin-rich skin — and an underrated one for early acne in those same groups.",
  atGlance: [
    ["INCI", "Mandelic acid"],
    ["Family", "Alpha-hydroxy acid (AHA)"],
    ["Useful range", "5 – 10% (leave-on)"],
    ["pH window", "3.5 – 4.0"],
    ["Pregnancy-safe", "Yes (topical)"],
    ["Photo-stable", "Yes"],
    ["Reviewer", "Dr. Paul · 13-Apr-2026"],
  ],
  toc: [
    ["01", "What it is"],
    ["02", "Why molecule size matters"],
    ["03", "Evidence overview"],
    ["04", "Concentration & vehicle"],
    ["05", "For deeper skin tones"],
    ["06", "Pairings & conflicts"],
    ["07", "On our shelf"],
    ["08", "FAQ"],
  ],
  whatItIs: {
    dropCap: "M",
    title: { plain: "What mandelic acid", italic: "actually is." },
    body:
      "andelic acid is derived from bitter almonds and is, by molecular weight, the largest AHA in routine use — roughly twice the size of lactic and three times the size of glycolic. Bigger molecule means slower diffusion through the stratum corneum, which means a flatter irritation curve, which is the entire point. Mandelic produces gentler, more uniform exfoliation with a meaningfully lower risk of post-inflammatory hyperpigmentation in deeper skin tones.",
  },
  mechanism: [
    { k: "On exfoliation", b: "Loosens corneocyte adhesion at the surface. Slowest of the AHAs by depth." },
    { k: "On bacteria", b: "Mild antibacterial activity, including against C. acnes — useful in acne-prone skin." },
    { k: "On pigment", b: "Tyrosinase inhibition at higher concentrations. Particularly useful for melasma in skin of colour." },
  ],
  evidence: [
    { c: "Mild acne", n: "RCTs vs salicylic", w: "62%", note: "10% mandelic non-inferior to 2% SA on lesion counts in some Indian-population trials, with less irritation." },
    { c: "PIH in skin of colour", n: "Smaller RCTs", w: "68%", note: "The differentiator. Substantially lower PIH risk than glycolic or salicylic at equivalent benefit." },
    { c: "Texture / tone", n: "Open-label", w: "60%", note: "Slower than glycolic but more comfortable for reactive skin." },
    { c: "Tolerability", n: "VAS", w: "84%", note: "The most forgiving AHA. The reason it earns its tier." },
  ],
  concentration: [
    { c: "5%", v: "Beginner serum", b: "Nightly. The default for sensitive skin." },
    { c: "10%", v: "Standard serum", b: "Effective, still tolerable. Sweet spot for most." },
    { c: "+ Salicylic", v: "Acne combo", b: "Mandelic + 1% SA for oily, acne-prone, easily-pigmented skin." },
    { c: "20 – 50%", v: "Clinical peel", b: "In-office only. Lowest PIH risk among acid peels." },
  ],
  pairings: [
    { with: "Niacinamide", verdict: "Excellent", note: "Calms residual flush, supports barrier overnight.", ok: true },
    { with: "Salicylic acid", verdict: "Compatible", note: "Together for oily, acne-prone skin. Watch total acid load.", ok: true },
    { with: "Retinoids", verdict: "Wait", note: "Alternate nights early on. Both turnover-accelerating.", ok: false },
    { with: "Vitamin C", verdict: "Compatible", note: "AM C, PM mandelic. Both photo-stable.", ok: true },
  ],
  products: [
    { brand: "By Wishtrend", name: "Mandelic Acid 5% Skin Prep Water", tier: "A", score: 82, note: "Beginner-friendly, sensitive-skin standard. Gentle vehicle." },
    { brand: "The Ordinary", name: "Mandelic Acid 10% + HA", tier: "B", score: 76, note: "Cheapest credible 10%. Honest dose, simple vehicle." },
    { brand: "Naturium", name: "Mandelic Topical Acid 12%", tier: "B", score: 74, note: "Higher concentration, clean formulation. For experienced users." },
    { brand: "Allies of Skin", name: "Mandelic Pigmentation Corrector", tier: "A", score: 80, note: "Premium pigment-targeted blend. Good for mid-tone PIH." },
  ],
  faq: [
    { q: "Mandelic or glycolic?", a: "Mandelic if you have sensitive, reactive, or deeper-pigmented skin — particularly Fitzpatrick IV–VI, where glycolic's PIH risk is real. Glycolic if you have established tolerance and want maximum exfoliation." },
    { q: "Will it actually clear my acne?", a: "For mild comedonal and inflammatory acne, often yes. For moderate-to-severe, it is an adjunct — not a replacement for adapalene or BPO." },
    { q: "Is it safe daily?", a: "Yes, at 5–10%. The forgiving curve is exactly the point. Daily nightly use is the norm, not the exception." },
    { q: "Why is it pricier than glycolic?", a: "Lower-volume production and patent-protected delivery systems in some premium products. The molecule itself is not exotic." },
  ],
};

const IngredientMandelic: React.FC = () => <IngredientBrief data={data} />;
export default IngredientMandelic;
