// IngredientZincOxide — full ingredient brief for zinc oxide.
import React from "react";
import { IngredientBrief, type IngredientBriefData } from "./_IngredientBrief";

export const data: IngredientBriefData = {
  slug: "zinc-oxide",
  name: "Zinc oxide",
  number: "21 / 28",
  filed: "10 APR 2026",
  eyebrowKicker: "Ingredient · Mineral filter · Zinc oxide",
  tier: "A",
  headlineSize: 116,
  tagline: { italic: "Broad-spectrum, photostable,", rest: "and the cast you can live with." },
  lead:
    "The most broadly-protective mineral filter, the safest pregnancy and infant option, and historically the worst on cosmetic finish. Modern non-nano dispersions and tinted vehicles have largely solved the white-cast problem. The honest answer is now: yes, you can wear it daily.",
  atGlance: [
    ["INCI", "Zinc oxide"],
    ["Family", "Mineral UV filter"],
    ["Useful range", "10 – 25%"],
    ["Coverage", "UVA1, UVA2, UVB"],
    ["Pregnancy-safe", "Yes — best-evidenced option"],
    ["Photo-stable", "Yes — does not degrade in sunlight"],
    ["Reviewer", "Dr. Paul · 10-Apr-2026"],
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
    dropCap: "Z",
    title: { plain: "What zinc oxide", italic: "actually is." },
    body:
      "inc oxide is an inorganic mineral that, in micron and nanoparticle dispersions, reflects, scatters, and absorbs UV across the entire UVA and UVB range. It is the most broadly-protective single sunscreen active available and the only filter you can use on a six-month-old infant. Its long-standing weakness — visible white cast — has been substantially addressed by non-nano dispersion technology and iron-oxide-tinted formulations.",
    body2:
      "It is also stubbornly itself: zinc oxide will never have the invisible cosmetic finish of a modern organic filter on darker skin tones. That is a real trade-off. Tinted formulations are now the answer for skin of colour; untinted for those who can wear them.",
  },
  mechanism: [
    { k: "On UVA", b: "Reflects and absorbs UVA1 (340–400 nm) — the wavelength most filters under-cover. The defining strength." },
    { k: "On UVB", b: "Absorbs and scatters; SPF rises with concentration up to a plateau around 25%." },
    { k: "On reactivity", b: "Inert mineral surface; no systemic absorption signal of clinical concern." },
  ],
  evidence: [
    { c: "Broad-spectrum coverage", n: "In-vitro spectroscopy", w: "94%", note: "The widest single-filter coverage on the market." },
    { c: "Skin cancer prevention", n: "Cohort, mineral SPF", w: "88%", note: "Equivalent to organic SPF at matched application." },
    { c: "Pregnancy / infant safety", n: "Long-term clinical use", w: "96%", note: "The reference safety profile. Default for sensitive populations." },
    { c: "Cosmetic acceptability", n: "Self-reported VAS", w: "62%", note: "Improved by non-nano dispersion and tinting; still the weakest dimension." },
  ],
  concentration: [
    { c: "10 – 15%", v: "Daily SPF 30", b: "Comfortable cosmetic finish, adequate everyday protection." },
    { c: "20 – 25%", v: "SPF 50+ formulations", b: "Higher protection, more visible cast without tinting." },
    { c: "Non-nano", v: "Eco / safety-led", b: "Larger particle, slightly heavier finish, marine-safe." },
    { c: "+ Iron oxides", v: "Tinted SPF", b: "Adds visible-light protection — important for melasma and skin of colour." },
  ],
  pairings: [
    { with: "Iron oxides", verdict: "Synergistic", note: "Adds blue-light and visible-light protection. The melasma-prevention combination.", ok: true },
    { with: "Niacinamide", verdict: "Excellent", note: "Frequently combined inside one formula. Calms zinc-oxide drying tendency.", ok: true },
    { with: "Vitamin C (AM)", verdict: "Compatible", note: "C first, sunscreen second. Standard layering.", ok: true },
    { with: "Heavy occlusive moisturisers", verdict: "Wait", note: "Can pill under or over zinc-oxide vehicles. Apply both thin, in the same direction.", ok: false },
    { with: "Silicone-heavy primers", verdict: "Variable", note: "Some pill, some don't. Test on jawline before application day.", ok: false },
  ],
  products: [
    { brand: "EltaMD", name: "UV Pure Broad-Spectrum SPF 47", tier: "A", score: 84, note: "Pure mineral, 10% zinc + 9% titanium. Sensitive-skin reference." },
    { brand: "Blue Lizard", name: "Sensitive Mineral SPF 50+", tier: "A", score: 82, note: "Pediatric-friendly. Honest dose, simple vehicle." },
    { brand: "Australian Gold", name: "Botanical Tinted Mineral SPF 50", tier: "A", score: 86, note: "Tinted zinc + titanium. Solves the cast for medium tones." },
    { brand: "Vichy", name: "Capital Soleil Mineral SPF 60", tier: "B", score: 78, note: "European mineral. Comfortable cosmetic finish, premium markup." },
  ],
  faq: [
    { q: "Zinc oxide or modern chemical filter?", a: "Both protect. Zinc wins on safety profile, sensitive skin, infants, and pregnancy. Modern chemical filters win on cosmetic finish and finish on darker skin tones. Pick by use case." },
    { q: "Is the white cast really still a problem?", a: "On medium and deep skin, yes — for untinted zinc. The solution is iron-oxide-tinted mineral SPF, not abandoning zinc. Modern tinted formulas are now genuinely good." },
    { q: "Is non-nano better?", a: "Slightly safer for marine ecosystems and avoids any (unlikely) systemic absorption concern. Cosmetically heavier. The choice is values, not skin outcome." },
    { q: "Is zinc oxide safe in pregnancy?", a: "Yes — comfortably the best-evidenced sunscreen filter for pregnancy and lactation. It is also the standard for paediatric SPF." },
  ],
};

const IngredientZincOxide: React.FC = () => <IngredientBrief data={data} />;
export default IngredientZincOxide;
