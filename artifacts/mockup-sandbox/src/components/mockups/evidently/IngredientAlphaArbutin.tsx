// IngredientAlphaArbutin — full ingredient brief for alpha arbutin.
import React from "react";
import { IngredientBrief, type IngredientBriefData } from "./_IngredientBrief";

export const data: IngredientBriefData = {
  slug: "alpha-arbutin",
  name: "Alpha arbutin",
  number: "13 / 28",
  filed: "13 APR 2026",
  eyebrowKicker: "Ingredient · Hydroquinone glucoside · Alpha arbutin",
  tier: "B",
  headlineSize: 108,
  tagline: { italic: "Hydroquinone with the brakes on —", rest: "and that is the point." },
  lead:
    "A synthetic glucoside that releases hydroquinone slowly inside the skin. Less powerful than HQ itself, less aggressive too. The right pigment tool for users who want a tyrosinase inhibitor they can use indefinitely and during pregnancy with reasonable comfort.",
  atGlance: [
    ["INCI", "Alpha-arbutin"],
    ["Family", "Hydroquinone glucoside"],
    ["Useful range", "1 – 2%"],
    ["Vehicle", "Water-based serum"],
    ["Pregnancy-safe", "Limited data; widely considered cautious-OK"],
    ["Photo-stable", "Yes"],
    ["Reviewer", "Dr. Paul · 13-Apr-2026"],
  ],
  toc: [
    ["01", "What it is"],
    ["02", "Mechanism"],
    ["03", "Evidence overview"],
    ["04", "Concentration & vehicle"],
    ["05", "Where it earns its tier"],
    ["06", "Pairings & conflicts"],
    ["07", "On our shelf"],
    ["08", "FAQ"],
  ],
  whatItIs: {
    dropCap: "A",
    title: { plain: "What alpha arbutin", italic: "actually is." },
    body:
      "lpha arbutin is a synthetic α-glucoside of hydroquinone. Inside the skin, glucosidase enzymes cleave the glucose group and release hydroquinone slowly and locally — bypassing the bolus exposure that gives HQ its tolerability problems. The result is a tyrosinase inhibitor with a similar mechanism but a flatter activity curve and a much lower irritation signal.",
  },
  mechanism: [
    { k: "On tyrosinase", b: "Competitive inhibitor at the active site. Slower than HQ but mechanistically identical." },
    { k: "On melanosome maturation", b: "Reduces stage III/IV melanosome production over weeks of consistent use." },
    { k: "On skin tolerance", b: "Slow-release profile produces minimal irritation, even on sensitive skin." },
  ],
  evidence: [
    { c: "Melasma", n: "RCTs vs vehicle", w: "58%", note: "1–2% improves MASI scores modestly over 12 weeks. Slower than HQ or TXA." },
    { c: "PIH", n: "Smaller RCTs", w: "62%", note: "Useful adjunct for post-acne marks; pairs naturally with niacinamide." },
    { c: "General brightening", n: "Open-label", w: "55%", note: "Real but subtle. Best framed as maintenance, not transformation." },
    { c: "Tolerability", n: "VAS", w: "85%", note: "Among the most tolerable pigment actives. The reason it pairs with anything." },
  ],
  concentration: [
    { c: "1%", v: "Beginner serum", b: "Daily AM or PM. Most published studies use this dose." },
    { c: "2%", v: "Standard serum", b: "Diminishing returns above this. Cap here." },
    { c: "+ Niacinamide", v: "Pigment stack", b: "Multi-mechanism block. Widely studied combination." },
  ],
  pairings: [
    { with: "Niacinamide", verdict: "Synergistic", note: "Tyrosinase block + melanosome-transfer block. Classic combo.", ok: true },
    { with: "Vitamin C", verdict: "Excellent", note: "AM C, AM or PM arbutin. Antioxidant + tyrosinase inhibition.", ok: true },
    { with: "Retinoids", verdict: "Compatible", note: "PM retinoid, AM arbutin. Complementary mechanisms, no conflict.", ok: true },
    { with: "AHAs / BHAs", verdict: "Wait", note: "pH-sensitive enzymatic activation. Apply acid first, then arbutin.", ok: false },
  ],
  products: [
    { brand: "The Ordinary", name: "Alpha Arbutin 2% + HA", tier: "A", score: 82, note: "Reference cheap entry. Honest dose, simple vehicle." },
    { brand: "Minimalist", name: "Alpha Arbutin 2% Serum", tier: "B", score: 78, note: "Indian-market alternative. Identical molecule, ceramide-supported base." },
    { brand: "Naturium", name: "Alpha Arbutin Serum 2%", tier: "B", score: 76, note: "Good vehicle, fair price. Pairs naturally with their niacinamide." },
    { brand: "Dr Different", name: "Treatment Cream", tier: "B", score: 74, note: "K-beauty brightening-line cream. Comfortable vehicle when serums irritate." },
  ],
  faq: [
    { q: "Arbutin or hydroquinone?", a: "HQ for short-course flare control under a dermatologist. Arbutin for everyone else and for indefinite maintenance. Different tools for the same family of problem." },
    { q: "Will I see results?", a: "Yes, but slowly. Eight weeks for early signal, twelve to sixteen for confidence. If you want speed, pair with niacinamide and vitamin C and protect with sunscreen — that triad outperforms any single ingredient." },
    { q: "Is it safe in pregnancy?", a: "Topical arbutin lacks pregnancy-specific safety data, but its low systemic absorption and slow HQ release make it commonly accepted as cautious-OK. Discuss with your doctor; azelaic acid remains the most clearly-safe alternative." },
    { q: "Why does my serum smell odd?", a: "Arbutin formulations can develop a faint browning over months due to slow oxidation. Some discoloration is normal; rapid darkening means the bottle is past its useful life." },
  ],
};

const IngredientAlphaArbutin: React.FC = () => <IngredientBrief data={data} />;
export default IngredientAlphaArbutin;
