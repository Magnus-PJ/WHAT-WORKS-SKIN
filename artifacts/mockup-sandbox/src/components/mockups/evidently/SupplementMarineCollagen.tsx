// SupplementMarineCollagen — Marine collagen 10g 'beauty' powders.

import React from "react";
import { SupplementPage } from "./_supplementTemplate";

const SupplementMarineCollagen: React.FC = () => (
  <SupplementPage
    family="Trend Watch"
    name="Marine collagen 10 g 'beauty'"
    page="P. 12"
    eyebrow="Supplement · Trend Watch · Marine collagen"
    hero="Marine collagen."
    subheadA="Indistinguishable from peptide powder."
    subheadB="Marketing premium."
    dek="The premium-priced fork of the broader collagen category, sold on dose escalation, marine sourcing, and packaging design. The literature does not support paying 4× the price for the marine version of what is mechanistically — once digested into amino acids — exactly the same molecule."
    evidence={[
      { c: "Skin elasticity (vs placebo)", n: "Replicated, 10 g/d", w: "60%", note: "Real but modest 12-week elasticity endpoints. The same effect appears in trials of generic bovine peptides." },
      { c: "Marine vs bovine peptide head-to-head", n: "Tiny trials", w: "20%", note: "No defensible difference in skin endpoints. The amino-acid pool delivered is broadly equivalent." },
      { c: "Wrinkle depth", n: "Small RCTs", w: "45%", note: "Modest reduction at 12 weeks. Topical retinoid produces dramatically larger endpoints at a fraction of the cost." },
      { c: "Marketing 'glow' / hydration", n: "Self-reported", w: "30%", note: "Real subjective response, partly placebo. Hard to disentangle from concurrent hydration habits." },
    ]}
    forms={[
      { f: "Marine collagen peptides 10 g", abs: "Good", note: "The premium-priced 'beauty' format. Hydrolysed; mixes into water cleanly." },
      { f: "Bovine collagen peptides 10 g", abs: "Good", note: "Functionally equivalent at 1/3 the price. Same hydrolysate; same amino-acid pool." },
      { f: "Collagen + vitamin C combination", abs: "Good", note: "Useful — vitamin C is the cofactor for endogenous collagen synthesis. Adds genuine value over collagen alone." },
      { f: "Vegan 'collagen-builder' (proline + glycine + vit C)", abs: "Good", note: "Provides the precursors without the animal source. Reasonable alternative for vegetarians." },
    ]}
    faq={[
      { q: "Does the source actually matter?", a: "Once digested, no. Whether your collagen is from cod skin, cow hide, or chicken cartilage, it is hydrolysed in the gut to constituent amino acids — primarily glycine, proline, and hydroxyproline — which are then available for the body to use as it sees fit. The 'marine' premium is marketing; the molecule is the same." },
      { q: "Should I take it with vitamin C?", a: "Yes. Vitamin C is an enzymatic cofactor for collagen cross-linking and is the most useful pairing. Many products include vitamin C in the blend; otherwise add a separate 250–500 mg dose." },
      { q: "How long until effect?", a: "12 weeks at 10 g/d. Modest effect; do not expect dramatic. Photograph at week 0 and week 12 to make the comparison honest." },
      { q: "Is the trend worth the spend?", a: "Marginally. The category delivers a small, real effect — but generic peptide powder delivers the same effect at one-third the price. Pay for the brand if the texture or routine fits; do not pay for the molecule." },
    ]}
    bottom="Real, modest effect. Premium-priced packaging. The category survives on aspiration; pay for generic peptide if you want the endpoint at honest price."
  />
);

export default SupplementMarineCollagen;
