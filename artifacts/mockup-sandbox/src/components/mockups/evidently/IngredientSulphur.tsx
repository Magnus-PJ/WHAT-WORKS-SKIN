// IngredientSulphur — full ingredient brief for sulphur (sulfur).
import React from "react";
import { IngredientBrief, type IngredientBriefData } from "./_IngredientBrief";

export const data: IngredientBriefData = {
  slug: "sulphur",
  name: "Sulphur",
  number: "26 / 28",
  filed: "11 APR 2026",
  eyebrowKicker: "Ingredient · Antimicrobial · Elemental sulphur",
  tier: "B",
  headlineSize: 124,
  tagline: { italic: "Old-school,", rest: "still useful, smells terrible." },
  lead:
    "One of the oldest acne actives on the planet. Antibacterial, mildly keratolytic, and uniquely useful for inflammatory papules in users who cannot use BPO or are sensitive to retinoids. Smell is the price of admission.",
  atGlance: [
    ["INCI", "Sulfur (precipitated or colloidal)"],
    ["Family", "Element / mineral active"],
    ["Useful range", "2 – 10%"],
    ["Vehicle", "Spot mask, gel, lotion"],
    ["Pregnancy-safe", "Generally yes (one of the safest acne actives)"],
    ["Photo-stable", "Yes"],
    ["Reviewer", "Dr. Paul · 11-Apr-2026"],
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
    dropCap: "S",
    title: { plain: "What sulphur", italic: "actually is." },
    body:
      "ulphur in dermatology is just the element — usually as precipitated or colloidal sulphur — applied topically. It has been in use for skin disease since antiquity, predating modern dermatology by centuries. The mechanism is a mix of mild keratolysis and direct antimicrobial activity, particularly against the demodex mite and some bacterial overgrowth patterns associated with inflammatory acne and rosacea-overlap conditions.",
    body2:
      "It is not a fashionable ingredient. It is also one of the few actives in this library that is reliably pregnancy-safe, gentler than BPO, and cheap enough to be a credible spot treatment. The trade-off is olfactory.",
  },
  mechanism: [
    { k: "On bacteria & demodex", b: "Direct antimicrobial activity, including against C. acnes and demodex folliculorum. Useful in rosacea-overlap acne." },
    { k: "On keratinisation", b: "Mild keratolytic effect on the comedone surface. Slower than salicylic acid." },
    { k: "On inflammation", b: "Anti-inflammatory activity at the papule level; unique value in pustular flares." },
  ],
  evidence: [
    { c: "Inflammatory papules", n: "RCTs and pharmacy use", w: "68%", note: "Reproducibly reduces papule resolution time when applied as overnight spot treatment." },
    { c: "Rosacea (papulopustular)", n: "Smaller RCTs", w: "70%", note: "Sulphur + sodium sulfacetamide is a long-standing dermatology combination for papulopustular rosacea." },
    { c: "Comedonal acne", n: "Limited", w: "44%", note: "Outperformed by salicylic acid and retinoids on comedolytic endpoints." },
    { c: "Pregnancy-safe acne care", n: "Long use history", w: "85%", note: "One of the few well-tolerated acne options across pregnancy." },
  ],
  concentration: [
    { c: "2 – 5%", v: "Standard mask / gel", b: "Brief-contact or overnight spot. The default range." },
    { c: "10%", v: "Maximum OTC", b: "Spot treatment only; whole-face use is impractical (smell, dryness)." },
    { c: "+ Sodium sulfacetamide 10%", v: "Rx combo", b: "Standard for papulopustular rosacea; dermatology-led." },
  ],
  pairings: [
    { with: "Niacinamide", verdict: "Excellent", note: "Calms residual inflammation around the spot; good supporting layer.", ok: true },
    { with: "BPO", verdict: "Wait", note: "Both drying. Stagger; sulphur as spot, BPO as broader treatment.", ok: false },
    { with: "Retinoids", verdict: "Wait", note: "Apply retinoid first, sulphur as spot only. Avoid full-face same-night.", ok: false },
    { with: "Pregnancy-safe routines", verdict: "Excellent", note: "One of the few acne options that holds up across pregnancy and lactation.", ok: true },
    { with: "Same day as silver jewellery", verdict: "Avoid", note: "Sulphur tarnishes silver on contact. Remove jewellery before application.", ok: false },
  ],
  products: [
    { brand: "Mario Badescu", name: "Drying Lotion (sulphur + salicylic)", tier: "B", score: 78, note: "The cult spot treatment. Pink-on-clear, sulphur sediment, dries papules overnight." },
    { brand: "De La Cruz", name: "Sulfur Ointment 10%", tier: "B", score: 76, note: "Pharmacy-grade, single-ingredient. Honest, cheap, smelly, effective." },
    { brand: "Kate Somerville", name: "EradiKate (sulphur 10%)", tier: "C", score: 70, note: "Premium re-packaging of the De La Cruz idea. Pretty bottle, premium markup." },
    { brand: "Plexion", name: "Sulfacetamide 10% / Sulfur 5% Cleanser", tier: "A", score: 84, note: "Prescription rosacea workhorse. The one to ask your dermatologist about." },
  ],
  faq: [
    { q: "Sulphur or BPO for spots?", a: "BPO for ongoing inflammatory acne management; sulphur for the surprise papule, the pregnancy routine, or the BPO-intolerant user. They occupy adjacent but distinct slots." },
    { q: "Why does it smell?", a: "Trace hydrogen sulphide compounds released by elemental sulphur on skin. There is no formulation trick that fully fixes this — newer microencapsulated versions reduce but do not eliminate." },
    { q: "Is it safe in pregnancy?", a: "Yes — among the most reliably pregnancy-safe acne actives in routine cosmetic use. Worth knowing for users who lose access to retinoids." },
    { q: "How often can I use it?", a: "Spot treatment overnight is fine indefinitely. Whole-face use should be limited to 2–3 nights weekly; otherwise dryness compounds quickly." },
  ],
};

const IngredientSulphur: React.FC = () => <IngredientBrief data={data} />;
export default IngredientSulphur;
