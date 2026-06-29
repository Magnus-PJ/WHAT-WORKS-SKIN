// SupplementProbiotics — Probiotics for skin (Lactobacillus rhamnosus etc).

import React from "react";
import { SupplementPage } from "./_supplementTemplate";

const SupplementProbiotics: React.FC = () => (
  <SupplementPage
    family="Barrier & inflammation"
    name="Probiotics (Lactobacillus rhamnosus)"
    page="P. 11"
    eyebrow="Supplement · Barrier & inflammation · Probiotics"
    hero="Probiotics."
    subheadA="Strain matters."
    subheadB="Adult skin data thinner than the marketing."
    dek="The most exciting supplement category by trend volume; the most disappointing by adult skin endpoints. The strain-specific paediatric eczema literature is genuine; the adult skin literature, particularly for acne and rosacea, is far less developed than the marketing implies."
    evidence={[
      { c: "Paediatric eczema prevention", n: "RCTs, L. rhamnosus GG", w: "65%", note: "Real, strain-specific. Most consistent in high-risk infants with family history of atopy." },
      { c: "Adult atopic dermatitis", n: "Mixed RCTs", w: "40%", note: "Smaller, less consistent than paediatric data. Reasonable trial; manage expectations." },
      { c: "Inflammatory acne (adult)", n: "Small early trials", w: "35%", note: "Promising mechanistic story (gut-skin axis); the clinical trial evidence has not yet caught up." },
      { c: "Rosacea", n: "Tiny pilot trials", w: "30%", note: "Early signals on flushing and inflammation; not yet a treatment recommendation." },
    ]}
    forms={[
      { f: "L. rhamnosus GG 10⁹ CFU", abs: "Strain-specific", note: "The best-studied strain in paediatric eczema prevention. Adults: reasonable trial." },
      { f: "Multi-strain blends 10–25 billion CFU", abs: "Variable", note: "Most commercial 'skin probiotic' products. Strain blends rarely match published trial protocols." },
      { f: "L. paracasei ST11", abs: "Strain-specific", note: "Adult atopic skin data; small trials show modest barrier endpoints." },
      { f: "Bifidobacterium-led blends", abs: "Strain-specific", note: "Different mechanism; some constipation-and-skin overlap. Limited skin-specific evidence." },
    ]}
    faq={[
      { q: "Does it matter which strain?", a: "Yes, dramatically. Probiotic effects are strain-specific, not species-specific, and almost never genus-specific. A study showing benefit from L. rhamnosus GG does not generalise to L. rhamnosus more broadly, let alone to other Lactobacillus species. Match the strain on the label to the strain in the published trial; if unmatched, the published data does not apply." },
      { q: "How long should I trial?", a: "12 weeks at 10⁹–10¹⁰ CFU/d. If no measurable effect by then, the strain is not your bottleneck. Switch strain or pivot strategy rather than escalating dose indefinitely." },
      { q: "Does fermented food substitute?", a: "Partly. Yogurt, kefir, kimchi, and dosa-batter ferments deliver live cultures, but at variable strain composition and CFU count. They are reasonable as part of a broader gut-health strategy; they are not equivalent to a strain-matched supplement when treating a specific endpoint." },
      { q: "Should I refrigerate?", a: "Most live-culture probiotics genuinely require refrigeration to maintain CFU count to expiry. Spore-based or shelf-stable formulations are exceptions. Buy from a vendor with appropriate cold-chain practice." },
    ]}
    bottom="The category where strain discipline matters more than dose. Reasonable trial in atopic skin; weak evidence in adult acne. Match the strain to the trial."
  />
);

export default SupplementProbiotics;
