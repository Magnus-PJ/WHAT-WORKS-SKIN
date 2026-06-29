// IngredientAdapalene — full ingredient brief for adapalene.
import React from "react";
import { IngredientBrief, type IngredientBriefData } from "./_IngredientBrief";

export const data: IngredientBriefData = {
  slug: "adapalene",
  name: "Adapalene",
  number: "03 / 28",
  filed: "17 APR 2026",
  eyebrowKicker: "Ingredient · Synthetic Retinoid · Adapalene",
  tier: "A",
  tagline: { italic: "Prescription-grade acne care", rest: "without a prescription." },
  lead:
    "The only OTC retinoid the FDA has approved specifically for acne. Selective for the RAR-γ receptor, photo-stable, and meaningfully more tolerable than tretinoin. For comedonal and mild-to-moderate inflammatory acne, this is where the conversation should start.",
  atGlance: [
    ["INCI", "Adapalene"],
    ["Family", "Naphthoic-acid retinoid"],
    ["Useful range", "0.1% (OTC) – 0.3% (Rx)"],
    ["Vehicle", "Aqueous gel or cream"],
    ["Pregnancy-safe", "No"],
    ["Photo-stable", "Yes — but use PM"],
    ["Reviewer", "Dr. Paul · 17-Apr-2026"],
  ],
  toc: [
    ["01", "What it is"],
    ["02", "Why it differs from tretinoin"],
    ["03", "Evidence overview"],
    ["04", "Concentration & vehicle"],
    ["05", "Onboarding for acne"],
    ["06", "Pairings & conflicts"],
    ["07", "On our shelf"],
    ["08", "FAQ"],
  ],
  whatItIs: {
    dropCap: "A",
    title: { plain: "What adapalene", italic: "actually is." },
    body:
      "dapalene is a third-generation, fully synthetic retinoid built around a naphthoic-acid backbone rather than the polyene chain of natural vitamin A. That difference matters: adapalene binds RAR-β and RAR-γ but largely ignores RAR-α, which is the receptor most associated with retinoid irritation. The net effect is comparable comedolytic power to tretinoin with a fraction of the redness and peeling.",
    body2:
      "It is also photo-stable and oxidation-resistant — properties tretinoin and retinol cannot claim — which is why Differin gel survived decades on dermatology shelves before going OTC in 2016.",
  },
  mechanism: [
    { k: "On the comedone", b: "Normalises follicular keratinisation. Dissolves the microcomedone before it becomes a papule." },
    { k: "On inflammation", b: "Modulates AP-1 and Toll-like signalling. Modest direct anti-inflammatory effect on top of comedolysis." },
    { k: "On the barrier", b: "Less aggressive than tretinoin; most users acclimate within 4–6 weeks." },
  ],
  evidence: [
    { c: "Comedonal acne", n: "Multiple RCTs", w: "84%", note: "Reproducibly outperforms vehicle and is non-inferior to tretinoin 0.025% on lesion counts." },
    { c: "Inflammatory acne", n: "RCTs, 12-wk", w: "70%", note: "Solid as monotherapy; better when paired with BPO." },
    { c: "Tolerability vs tretinoin", n: "Head-to-head", w: "78%", note: "Less stinging, less scaling, faster acclimation." },
    { c: "Photoaging (off-label)", n: "Smaller trials", w: "52%", note: "Real but modest; tretinoin remains first-line for wrinkles." },
  ],
  concentration: [
    { c: "0.1%", v: "OTC gel/cream", b: "The default starting dose. Nightly after onboarding." },
    { c: "0.3%", v: "Prescription gel", b: "For stubborn comedonal acne not responding to 0.1%." },
    { c: "+ BPO 2.5%", v: "Combination Rx", b: "Epiduo. Synergistic for inflammatory acne, no resistance pathway." },
  ],
  pairings: [
    { with: "Benzoyl peroxide", verdict: "Synergistic", note: "Adapalene is uniquely BPO-stable — one of the few retinoids that can be layered with it.", ok: true },
    { with: "Niacinamide", verdict: "Excellent", note: "Calms onboarding redness without blunting efficacy.", ok: true },
    { with: "Salicylic acid", verdict: "Wait", note: "Compounded irritation early on. Reintroduce after 8 weeks of adapalene tolerance.", ok: false },
    { with: "AHAs", verdict: "Avoid layering", note: "Adapalene already exfoliates. Adding AHAs adds irritation, not results.", ok: false },
    { with: "Moisturisers", verdict: "Mandatory", note: "Apply over a ceramide moisturiser if onboarding is rough — does not reduce efficacy.", ok: true },
  ],
  products: [
    { brand: "Galderma", name: "Differin Gel 0.1%", tier: "A", score: 90, note: "The reference. Single active, clean vehicle, decades of safety data." },
    { brand: "La Roche-Posay", name: "Effaclar Adapalene 0.1%", tier: "A", score: 86, note: "Identical molecule, slightly richer base. Pick by skin feel." },
    { brand: "Galderma", name: "Epiduo Forte 0.3% / 2.5%", tier: "A", score: 88, note: "Prescription combo. The strongest legal acne hit you can apply at home." },
    { brand: "Acnatac (generic)", name: "Adapalene 0.1% Gel", tier: "A", score: 82, note: "House-brand version. Same molecule, often cheaper than Differin." },
  ],
  faq: [
    { q: "Adapalene or tretinoin for acne?", a: "Adapalene first. It is non-inferior on acne endpoints, more tolerable, photo-stable, and available without a prescription. Move to tretinoin only if you also want maximum anti-aging effect." },
    { q: "How long before my acne improves?", a: "Things often look worse for the first 4–6 weeks as microcomedones surface. Real improvement starts at week 8 and continues through month 4. Quitting early is the most common reason adapalene 'fails.'" },
    { q: "Can I use it with benzoyl peroxide?", a: "Yes — and you should, for inflammatory acne. Adapalene is the one retinoid that does not oxidise on contact with BPO." },
    { q: "Is it safe in pregnancy?", a: "No. Like all retinoids, adapalene is contraindicated in pregnancy. Azelaic acid is the standard safe alternative." },
  ],
};

const IngredientAdapalene: React.FC = () => <IngredientBrief data={data} />;
export default IngredientAdapalene;
