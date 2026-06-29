// IngredientSalicylic — full ingredient brief for salicylic acid.
import React from "react";
import { IngredientBrief, type IngredientBriefData } from "./_IngredientBrief";

export const data: IngredientBriefData = {
  slug: "salicylic-acid",
  name: "Salicylic acid",
  number: "08 / 28",
  filed: "12 APR 2026",
  eyebrowKicker: "Ingredient · Beta-hydroxy Acid · Salicylic",
  tier: "A",
  headlineSize: 108,
  tagline: { italic: "Oil-soluble, pore-soluble,", rest: "and quietly indispensable." },
  lead:
    "The one beta-hydroxy acid worth knowing. Lipophilic enough to penetrate sebum, anti-inflammatory enough to calm the papule it just unblocked. The default acid for oily, acne-prone, and congested skin — but only at the right pH.",
  atGlance: [
    ["INCI", "Salicylic acid"],
    ["Family", "Beta-hydroxy acid (BHA)"],
    ["Useful range", "0.5 – 2.0% (leave-on)"],
    ["pH window", "3.0 – 4.0"],
    ["Pregnancy-safe", "Limited topical use OK"],
    ["Photo-stable", "Yes"],
    ["Reviewer", "Dr. Paul · 12-Apr-2026"],
  ],
  toc: [
    ["01", "What it is"],
    ["02", "Why oil-solubility matters"],
    ["03", "Evidence overview"],
    ["04", "Concentration & vehicle"],
    ["05", "Where it earns its tier"],
    ["06", "Pairings & conflicts"],
    ["07", "On our shelf"],
    ["08", "FAQ"],
  ],
  whatItIs: {
    dropCap: "S",
    title: { plain: "What salicylic acid", italic: "actually is." },
    body:
      "alicylic acid is a beta-hydroxy acid derived historically from willow bark. The single methyl-group difference from a typical AHA changes everything: it is lipophilic, which lets it dissolve into sebum and follicular debris rather than skating across the corneocyte surface. That is why it works inside the pore and most AHAs do not.",
    body2:
      "It is also a salicylate, structurally adjacent to aspirin, with measurable anti-inflammatory activity. The ingredient calms the redness around a comedone while it dismantles the comedone itself — a combination most acne actives cannot claim.",
  },
  mechanism: [
    { k: "On the pore", b: "Dissolves into the lipid plug. Loosens corneocyte adhesion within the follicle." },
    { k: "On inflammation", b: "Inhibits COX-2-driven prostaglandin signalling. Mild but real anti-inflammatory effect." },
    { k: "On surface texture", b: "Modest keratolysis on the stratum corneum. Smoother feel within 2 weeks." },
  ],
  evidence: [
    { c: "Comedonal acne", n: "RCTs vs vehicle", w: "76%", note: "0.5–2% leave-on reduces non-inflammatory lesions reproducibly across 8–12 wk trials." },
    { c: "Inflammatory acne", n: "RCTs, mostly combo", w: "58%", note: "Useful adjunct, not monotherapy. Pairs naturally with BPO or adapalene." },
    { c: "Sebum control", n: "Bioengineering", w: "62%", note: "Real reduction in midday shine; effect plateaus after 6 weeks." },
    { c: "Pigment / PIH", n: "Smaller trials", w: "44%", note: "Helpful for post-acne marks; outperformed by azelaic and tranexamic on melasma." },
  ],
  concentration: [
    { c: "0.5%", v: "Cleansers", b: "Brief contact. Useful for daily oil control." },
    { c: "1 – 2%", v: "Leave-on toner / serum", b: "The therapeutic range. Nightly or alternate nights." },
    { c: "2%", v: "Targeted gel", b: "Spot use on active comedones." },
    { c: "20 – 30%", v: "In-clinic peel", b: "Procedural only. Not a home product." },
  ],
  pairings: [
    { with: "Benzoyl peroxide", verdict: "Compatible", note: "Apply BHA first, BPO second; or AM/PM split.", ok: true },
    { with: "Niacinamide", verdict: "Excellent", note: "Wait 20–30 min after BHA for pH normalisation, then layer.", ok: true },
    { with: "Retinoids", verdict: "Wait", note: "Alternate nights during retinoid onboarding to avoid compounded irritation.", ok: false },
    { with: "Vitamin C (LAA)", verdict: "Avoid same step", note: "Both pH-dependent. Use C in AM, BHA in PM.", ok: false },
  ],
  products: [
    { brand: "Paula's Choice", name: "2% BHA Liquid Exfoliant", tier: "A", score: 92, note: "Reference product. Honest pH, well-buffered, the BHA the rest are measured against." },
    { brand: "CeraVe", name: "SA Smoothing Cleanser", tier: "B", score: 76, note: "Brief-contact, but the ceramide base means it doesn't strip." },
    { brand: "The Ordinary", name: "Salicylic Acid 2% Solution", tier: "B", score: 72, note: "Cheap and effective; thin vehicle pills under sunscreen." },
    { brand: "Stridex", name: "Maximum Pads (alcohol-free)", tier: "A", score: 84, note: "The pharmacy classic. 2% in a clean vehicle, near-perfect pH." },
  ],
  faq: [
    { q: "Salicylic acid or glycolic acid for acne?", a: "Salicylic. It penetrates the lipid environment of the follicle, which is where acne starts. Glycolic acid stays on the surface and works on tone and texture instead." },
    { q: "Why does pH matter so much?", a: "Salicylic acid only works in its non-ionised form, which dominates below pH 4. Above pH 5 most of it is inert. A 2% serum at pH 6 is essentially an expensive moisturiser." },
    { q: "Can I use it every day?", a: "Most oily and acne-prone skin tolerates daily 1–2% indefinitely. Drier skin should alternate nights and pair with a barrier moisturiser." },
    { q: "Is it safe in pregnancy?", a: "Topical use at standard cosmetic concentrations is generally considered acceptable. Avoid prescription-strength peels and any oral salicylate during pregnancy." },
  ],
};

const IngredientSalicylic: React.FC = () => <IngredientBrief data={data} />;
export default IngredientSalicylic;
