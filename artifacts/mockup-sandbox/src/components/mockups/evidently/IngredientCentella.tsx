// IngredientCentella — full ingredient brief for centella asiatica.
import React from "react";
import { IngredientBrief, type IngredientBriefData } from "./_IngredientBrief";

export const data: IngredientBriefData = {
  slug: "centella",
  name: "Centella asiatica",
  number: "16 / 28",
  filed: "15 APR 2026",
  eyebrowKicker: "Ingredient · Botanical · Centella · 'Cica'",
  tier: "B",
  headlineSize: 92,
  tagline: { italic: "The 'cica' in K-beauty —", rest: "and its honest evidence floor." },
  lead:
    "A pentacyclic-triterpenoid-rich botanical with a long pharmacy history and a respectable, mid-sized evidence base for soothing, post-procedure recovery, and mild anti-inflammatory support. Often oversold; rarely useless.",
  atGlance: [
    ["INCI", "Centella asiatica extract / Madecassoside / Asiaticoside"],
    ["Family", "Botanical · pentacyclic triterpenoids"],
    ["Useful range", "0.5 – 5% extract; 0.1 – 0.4% isolated TECA"],
    ["Vehicle", "Cream, ampoule, gel"],
    ["Pregnancy-safe", "Topical: generally OK; oral: avoid"],
    ["Photo-stable", "Yes"],
    ["Reviewer", "Dr. Paul · 15-Apr-2026"],
  ],
  toc: [
    ["01", "What it is"],
    ["02", "Active fractions"],
    ["03", "Evidence overview"],
    ["04", "Concentration & vehicle"],
    ["05", "Where it earns its tier"],
    ["06", "Pairings & conflicts"],
    ["07", "On our shelf"],
    ["08", "FAQ"],
  ],
  whatItIs: {
    dropCap: "C",
    title: { plain: "What centella", italic: "actually is." },
    body:
      "entella asiatica — also called gotu kola, 'cica' in cosmetic shorthand — is a swamp-growing herb used in Ayurvedic and Chinese medicine for centuries. The cosmetic fraction that matters is TECA (titrated extract of centella asiatica): a standardised mixture of asiatic acid, madecassic acid, asiaticoside, and madecassoside. Generic 'centella extract' on a label without standardisation is a gamble; standardised TECA at known concentrations is where the real data lives.",
  },
  mechanism: [
    { k: "On collagen", b: "Asiaticoside upregulates type I collagen synthesis and modulates fibroblast activity. Slow but measurable." },
    { k: "On inflammation", b: "Madecassoside dampens NF-κB signalling and reduces oxidative stress markers." },
    { k: "On wound healing", b: "Long pharmacy history in burns and surgical wound care; modern RCTs replicate." },
  ],
  evidence: [
    { c: "Post-procedure recovery", n: "RCTs vs vehicle", w: "72%", note: "Reduces erythema and downtime after laser, peels, and microneedling. The strongest cosmetic claim." },
    { c: "Sensitive / reactive skin", n: "Cohort", w: "64%", note: "Soothing benefit replicated across multiple Asian-population studies." },
    { c: "Stretch marks / scars", n: "Mixed RCTs", w: "52%", note: "Real but modest. Useful adjunct to silicone gel, not a primary tool." },
    { c: "Anti-aging (direct)", n: "Limited", w: "40%", note: "Some collagen signal; not a substitute for a retinoid." },
  ],
  concentration: [
    { c: "Generic extract", v: "Cosmetic only", b: "Avoid as the lone active. Useful as supportive ingredient." },
    { c: "Standardised TECA", v: "Therapeutic", b: "Look for asiaticoside / madecassoside listed by name and percentage." },
    { c: "Madecassoside 0.1%", v: "Targeted", b: "Most-studied isolated fraction. Post-procedure default." },
  ],
  pairings: [
    { with: "Retinoids", verdict: "Excellent", note: "Layer cica cream over retinoid to blunt onboarding redness without losing efficacy.", ok: true },
    { with: "Niacinamide", verdict: "Synergistic", note: "Both anti-inflammatory; combo is the workhorse of redness routines.", ok: true },
    { with: "Vitamin C", verdict: "Compatible", note: "C in AM, cica throughout. No conflict.", ok: true },
    { with: "Active acids", verdict: "Wait", note: "Apply acid, normalise pH, then cica cream as the calming finisher.", ok: false },
  ],
  products: [
    { brand: "La Roche-Posay", name: "Cicaplast Baume B5", tier: "A", score: 88, note: "Reference post-procedure cream. Madecassoside + panthenol + zinc + shea." },
    { brand: "Dr.Jart+", name: "Cicapair Tiger Grass Cream", tier: "B", score: 78, note: "Korean original. Heavier vehicle, real TECA dose." },
    { brand: "Purito", name: "Centella Green Level Buffet Serum", tier: "B", score: 76, note: "Multi-fraction extract, thin serum format. Honest at the price." },
    { brand: "SkinCeuticals", name: "Phyto Corrective Gel", tier: "A", score: 84, note: "Centella + thyme + cucumber. Soothing across redness types." },
  ],
  faq: [
    { q: "Cica or niacinamide for redness?", a: "Both, often together. Niacinamide for sebum-driven flushing and barrier work, cica for post-inflammatory and post-procedure redness. Different mechanisms, complementary results." },
    { q: "Will it actually heal a scar?", a: "It supports the healing environment. Combine with silicone gel for hypertrophic scars. Centella alone is supportive, not curative." },
    { q: "Is generic centella extract a waste?", a: "Often. Without standardisation you have no idea how much active triterpenoid you are getting. Look for named fractions on the label." },
    { q: "Can I use it long-term?", a: "Yes. Cica is one of the few actives where indefinite use is the intended pattern." },
  ],
};

const IngredientCentella: React.FC = () => <IngredientBrief data={data} />;
export default IngredientCentella;
