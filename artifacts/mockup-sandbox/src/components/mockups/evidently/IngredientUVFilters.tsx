// IngredientUVFilters — overview brief for UV filters (the category).
import React from "react";
import { IngredientBrief, type IngredientBriefData } from "./_IngredientBrief";

export const data: IngredientBriefData = {
  slug: "uv-filters",
  name: "UV filters",
  number: "20 / 28",
  filed: "10 APR 2026",
  eyebrowKicker: "Ingredient · Photoprotection · UV filter overview",
  tier: "A",
  headlineSize: 116,
  tagline: { italic: "The one non-negotiable", rest: "in the entire library." },
  lead:
    "Sunscreen actives are not a brand or a SPF number — they are a defined list of about thirty molecules that absorb or scatter UV. Modern long-UVA filters are the highest-impact intervention in skincare, and the regulatory geography of who can buy what is the single biggest reason American sunscreen lags the rest of the world.",
  atGlance: [
    ["INCI", "Bemotrizinol / Avobenzone / Tinosorb S/M / Mexoryl SX/XL / Zinc / Titanium"],
    ["Family", "Photoprotectants — organic and mineral"],
    ["Useful SPF", "30 minimum, 50+ for high exposure"],
    ["Required", "PA++++ or equivalent long-UVA rating"],
    ["Pregnancy-safe", "Mineral filters consistently; many organics OK"],
    ["Photo-stable", "Modern filters yes; avobenzone solo no"],
    ["Reviewer", "Dr. Paul · 10-Apr-2026"],
  ],
  toc: [
    ["01", "What 'UV filter' means"],
    ["02", "The three families"],
    ["03", "Evidence overview"],
    ["04", "Concentration & combinations"],
    ["05", "Where it earns its tier"],
    ["06", "Pairings & conflicts"],
    ["07", "On our shelf"],
    ["08", "FAQ"],
  ],
  whatItIs: {
    dropCap: "U",
    title: { plain: "What UV filters", italic: "actually are." },
    body:
      "V filters are the molecules — organic absorbers or mineral scatterers — that take the energy of UV photons before that energy reaches your DNA, your collagen, or your melanocytes. Everything else in skincare is downstream. A retinoid that you defend with sunscreen and a retinoid that you do not are practically two different molecules, because UV degrades retinoid-driven gains faster than any topical can rebuild them.",
    body2:
      "The world is split. Outside the United States, broad-spectrum long-UVA filters like bemotrizinol (Tinosorb S), bisoctrizole (Tinosorb M), and ecamsule (Mexoryl SX) have been licensed for two decades. Inside the United States, the FDA classifies sunscreen actives as drugs, and the new-active approval pipeline has been functionally frozen. American consumers are using a 1990s toolkit; everyone else has the modern one.",
  },
  mechanism: [
    { k: "Organic filters", b: "Absorb UV energy at characteristic wavelengths and dissipate it as heat. Lighter feel, often invisible." },
    { k: "Mineral filters", b: "Zinc oxide and titanium dioxide both absorb and scatter. Photo-stable, broad-spectrum, slight white cast." },
    { k: "Modern long-UVA", b: "Tinosorb S/M, Mexoryl SX/XL, bemotrizinol — the 2000s-onward generation built for stable long-UVA coverage." },
  ],
  evidence: [
    { c: "Skin cancer prevention", n: "Long-term cohort + RCTs", w: "94%", note: "The most evidenced cosmetic claim in the entire library. Daily SPF use measurably reduces SCC, BCC, and melanoma incidence." },
    { c: "Photoaging prevention", n: "RCTs + long-term cohort", w: "92%", note: "Single highest-impact anti-aging intervention. Replicated across populations." },
    { c: "Pigmentation prevention", n: "Cohort", w: "88%", note: "The substrate beneath every melasma and PIH treatment. Without sunscreen, nothing else holds." },
    { c: "Visible-light protection", n: "Newer RCTs", w: "62%", note: "Iron-oxide-tinted sunscreens for melasma in skin of colour. Important emerging area." },
  ],
  concentration: [
    { c: "SPF 30", v: "Daily minimum", b: "97% UVB block. The floor for indoor + commute use." },
    { c: "SPF 50+", v: "High exposure", b: "98% UVB block. Outdoor, travel, deliberate sun." },
    { c: "PA++++", v: "Long-UVA", b: "Asian rating system. The honest UVA standard." },
    { c: "PPD 16+", v: "EU standard", b: "European long-UVA rating; ≥1/3 of SPF as PPD is the rule." },
  ],
  pairings: [
    { with: "Retinoids", verdict: "Mandatory", note: "Sunscreen is the cost of admission to retinoid use. Skip it and you've accelerated the damage you're trying to undo.", ok: true },
    { with: "Vitamin C", verdict: "Synergistic", note: "C in AM extends sunscreen's antioxidant depth. Standard pairing.", ok: true },
    { with: "AHAs / BHAs", verdict: "Mandatory", note: "Acids increase UV sensitivity for up to a week. SPF is non-negotiable post-acid.", ok: true },
    { with: "Avobenzone alone", verdict: "Avoid", note: "Photo-degrades within 30 minutes. Always paired with a stabiliser (octocrylene, Tinosorb S).", ok: false },
  ],
  products: [
    { brand: "La Roche-Posay", name: "Anthelios UVMune 400", tier: "A", score: 94, note: "Reference modern formula. Mexoryl 400 covers ultra-long UVA. The current European standard." },
    { brand: "Beauty of Joseon", name: "Relief Sun Rice + Probiotics", tier: "A", score: 90, note: "Korean-market unicorn. Chemical filters, cosmetic finish, fair price." },
    { brand: "EltaMD", name: "UV Clear SPF 46", tier: "A", score: 86, note: "US-market reference. Best of what FDA allows. Niacinamide bonus." },
    { brand: "Bioderma", name: "Photoderm Spot-Age SPF50+", tier: "A", score: 88, note: "Modern UVA filters + antioxidants. Specifically built for melasma prevention." },
  ],
  faq: [
    { q: "Why is American sunscreen behind the world?", a: "FDA classifies sunscreen actives as drugs and has not approved a new active since 1999. Bemotrizinol, Tinosorb M, and Mexoryl SX are routine in the EU, Japan, Korea, and Australia. American consumers either use a 1990s palette or import." },
    { q: "Mineral or chemical?", a: "Both work. Mineral is preferred for sensitive skin, very young children, and pregnancy. Chemical (especially modern long-UVA filters) gives a better cosmetic finish for daily use. The category war is mostly marketing." },
    { q: "Do I need SPF indoors?", a: "Yes if you sit near a window — UVA penetrates glass. Yes for visible-light protection in melasma. No if you are entirely away from windows for the day." },
    { q: "Is SPF 100 better than SPF 50?", a: "Marginally. 50 blocks 98% of UVB; 100 blocks 99%. Real-world reapplication and even coverage matter more than the number on the bottle." },
  ],
};

const IngredientUVFilters: React.FC = () => <IngredientBrief data={data} />;
export default IngredientUVFilters;
