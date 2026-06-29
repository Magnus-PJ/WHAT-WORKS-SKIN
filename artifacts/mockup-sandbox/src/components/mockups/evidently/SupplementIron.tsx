// SupplementIron — Iron supplementation for hair shedding.

import React from "react";
import { SupplementPage } from "./_supplementTemplate";

const SupplementIron: React.FC = () => (
  <SupplementPage
    family="Hair & nails"
    name="Iron (when deficient)"
    page="P. 08"
    eyebrow="Supplement · Hair & nails · Iron"
    hero="Iron."
    subheadA="Test ferritin first."
    subheadB="Treat the cause, not the symptom."
    dek="The single most common reversible cause of telogen effluvium in adult women. The supplement that genuinely changes outcomes — but only when you have actually documented low ferritin first. Empirical iron supplementation without testing is an avoidable category of harm."
    evidence={[
      { c: "Telogen effluvium with low ferritin", n: "Multiple observational series", w: "85%", note: "Strongly replicated. Serum ferritin <30 ng/mL in shedding patients should prompt iron repletion." },
      { c: "Hair shedding with normal ferritin", n: "Null trials", w: "15%", note: "Iron does not help shedding when iron status is already adequate. The evidence here is clear." },
      { c: "Pattern hair loss (AGA)", n: "Mixed", w: "25%", note: "Iron is not a treatment for androgenetic alopecia, though deficiency may worsen it. Repletion alongside minoxidil/finasteride." },
      { c: "Eyebrow / lash thinning with low ferritin", n: "Case series", w: "55%", note: "Same logic as scalp hair. Repletion often restores periorbital hair quality over 6 months." },
    ]}
    forms={[
      { f: "Ferrous sulphate 200 mg", abs: "Good", note: "Cheapest, most-evidenced. GI side effects are the limiter (constipation, dark stool, nausea)." },
      { f: "Ferrous bisglycinate (chelated)", abs: "Good", note: "Better tolerated. Premium pricing; equivalent endpoints in repletion trials." },
      { f: "Ferrous gluconate", abs: "Moderate", note: "Lower elemental iron per tablet. Useful as gentler bridging dose." },
      { f: "IV iron (clinic)", abs: "100%", note: "For severe deficiency, malabsorption, or oral intolerance. Faster repletion; clinic-administered." },
    ]}
    faq={[
      { q: "What ferritin level should trigger treatment?", a: "Different bodies use different thresholds. Most trichology references treat ferritin <30 ng/mL as actionable in shedding patients, with a target of >70 ng/mL for hair-cycle restoration. Below 12 ng/mL is overt deficiency requiring repletion regardless of hair status." },
      { q: "Why not supplement empirically?", a: "Iron overload (hemochromatosis, transfusion-dependent thalassemia, etc.) is more common than commonly recognised, and chronic over-supplementation can cause real organ damage. The 30-rupee ferritin test is dramatically cheaper than the consequences of empirical supplementation in someone iron-replete." },
      { q: "Why does it take so long to see hair improvement?", a: "Hair grows ~1 cm per month. Even after ferritin normalises, the hair cycle restoration takes 4–6 months to be visible at the scalp. Photograph at week 0 and month 6 — month 3 photos rarely show the change." },
      { q: "Should I take vitamin C with it?", a: "Yes — vitamin C ~250 mg with each iron dose meaningfully increases absorption. Avoid taking iron with calcium, coffee, tea, or dairy, all of which inhibit absorption." },
    ]}
    bottom="The supplement that genuinely matters in shedding — but only after you have tested. Spend the small amount on the ferritin test before spending the much-larger amount on supplements you may not need."
  />
);

export default SupplementIron;
