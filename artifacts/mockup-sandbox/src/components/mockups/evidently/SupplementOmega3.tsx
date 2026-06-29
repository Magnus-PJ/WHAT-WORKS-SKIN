// SupplementOmega3 — Omega-3 (EPA + DHA).

import React from "react";
import { SupplementPage } from "./_supplementTemplate";

const SupplementOmega3: React.FC = () => (
  <SupplementPage
    family="Barrier & inflammation"
    name="Omega-3 (EPA + DHA)"
    page="P. 09"
    eyebrow="Supplement · Barrier & inflammation · Omega-3"
    hero="Omega-3."
    subheadA="Inflammation baseline."
    subheadB="Real and slow."
    dek="The most-evidenced anti-inflammatory supplement in dermatology. Useful adjunct in inflammatory acne, atopic dermatitis, and rosacea — and a defensible foundational supplement for the same broader-health reasons. Slow timelines; modest individual effect; cumulative payoff."
    evidence={[
      { c: "Inflammatory acne adjunct", n: "Multiple RCTs, 2 g EPA+DHA/d", w: "65%", note: "Modest reduction in inflammatory lesion count over 10–12 weeks. Useful alongside topicals." },
      { c: "Atopic dermatitis severity", n: "Mixed RCTs", w: "55%", note: "Symptomatic improvement in itch and flare frequency. The fish-oil literature here is older; the algae-oil work is newer." },
      { c: "Photoprotection (acute UV)", n: "Small mechanistic studies", w: "50%", note: "Reduces UV-induced inflammation and erythema. Adjunct, not sunscreen replacement." },
      { c: "General inflammation markers (CRP)", n: "Replicated", w: "75%", note: "Strong, replicated effect on systemic inflammation biomarkers. Indirect skin benefit." },
    ]}
    forms={[
      { f: "Fish oil 1000 mg (300 mg EPA+DHA)", abs: "Good", note: "Standard. Take 2–3 capsules daily with food to reach 1–2 g EPA+DHA target." },
      { f: "Concentrated EPA+DHA 1000 mg", abs: "Good", note: "60–80% EPA+DHA per capsule. Premium pricing; fewer capsules per day." },
      { f: "Algae-derived omega-3", abs: "Good", note: "Vegetarian / vegan source. EPA+DHA equivalent; sustainable; no fishy aftertaste." },
      { f: "Krill oil", abs: "Better", note: "Phospholipid-bound omega-3; absorbs slightly better at lower doses. Premium pricing." },
      { f: "Flaxseed / chia (ALA)", abs: "Poor", note: "ALA conversion to EPA/DHA is <10% in humans. Not a substitute." },
    ]}
    faq={[
      { q: "How much EPA+DHA do I need?", a: "1–2 g/d combined for skin and inflammation endpoints. The American Heart Association cardioprotective dose (1 g/d) is in the same range. Most over-the-counter fish oil capsules contain 300 mg combined per 1000 mg total — read the label carefully." },
      { q: "How long until effect?", a: "10–12 weeks at minimum for inflammatory skin endpoints. CRP shifts can be measured by week 6. Patients who quit at week 4 because 'nothing has changed' are quitting before the published timelines." },
      { q: "Will it interact with anticoagulants?", a: "At doses ≥3 g/d combined EPA+DHA, mild antiplatelet effect is real. Discuss with your clinician if you take warfarin, DOACs, or daily aspirin. Most skin-dose protocols (1–2 g/d) sit safely below the threshold." },
      { q: "Why fish oil over flaxseed?", a: "ALA (the omega-3 in flax and chia) converts to EPA and DHA at <10% efficiency. To reach 1 g of EPA+DHA via flax, you would need to consume an unrealistic dietary volume. Fish oil or algae-derived oil are the practical routes." },
    ]}
    bottom="A defensible foundational supplement for inflammatory skin presentations. Slow, modest, cumulative — exactly the unsexy profile the marketing dislikes and the literature supports."
  />
);

export default SupplementOmega3;
