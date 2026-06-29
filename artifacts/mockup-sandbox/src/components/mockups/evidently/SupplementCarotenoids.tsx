// SupplementCarotenoids — Beta-carotene + lycopene oral.

import React from "react";
import { SupplementPage } from "./_supplementTemplate";

const SupplementCarotenoids: React.FC = () => (
  <SupplementPage
    family="Photoprotection"
    name="Beta-carotene + lycopene"
    page="P. 03"
    eyebrow="Supplement · Photoprotection · Carotenoids"
    hero="Carotenoids."
    subheadA="Diet first."
    subheadB="Supplement secondary."
    dek="Beta-carotene and lycopene are real molecules with real photoprotective signal — primarily from dietary intake. Supplementation contributes a modest, slow extension to MED. Useful adjunct; not a sunscreen substitute, not a transformative addition."
    evidence={[
      { c: "MED extension over 8–12 weeks", n: "Meta-analyses", w: "55%", note: "Statistically significant but modest. The literature supports an SPF-equivalent of perhaps 2–3 — meaningful only as adjunct." },
      { c: "Erythema reduction post-UV", n: "Small RCTs", w: "50%", note: "Real, modest. Most consistent in fair-skinned populations with high baseline UV exposure." },
      { c: "Melasma / pigment work", n: "—", w: "15%", note: "Not the indication. Use targeted oral or topical pigmentation work instead." },
      { c: "Lung cancer in heavy smokers", n: "Beta-carotene RCTs", w: "Caution", note: "The CARET and ATBC trials showed increased lung cancer risk in smokers on high-dose beta-carotene. Not for current smokers." },
    ]}
    forms={[
      { f: "Mixed carotenoid blend (10 mg)", abs: "Modest", note: "Default for skin endpoints. Pair with dietary intake." },
      { f: "Lycopene 25 mg (tomato-derived)", abs: "Good", note: "Best-studied carotenoid for skin. Tomato paste is dietary alternative." },
      { f: "Beta-carotene isolate 25 mg", abs: "Good", note: "Avoid in current smokers. Mixed carotenoids preferred for safety." },
    ]}
    faq={[
      { q: "Will this replace sunscreen?", a: "No. The MED extension translates to an effective SPF of roughly 2–3, against products that deliver SPF 30–50. Use as adjunct on top of daily mineral SPF, never as substitute." },
      { q: "Diet vs supplement?", a: "Tomato paste, watermelon, carrots, sweet potatoes, and red bell peppers all deliver lycopene and beta-carotene at meaningful doses. We prefer dietary sources where realistic; supplementation is reasonable when diet is constrained." },
      { q: "Will it turn my skin orange?", a: "At 10–15 mg/d, no. At higher doses (25 mg+), carotenodermia (yellow-orange palms and soles) is reversible and harmless but cosmetically obvious. Cap at 15 mg if you want to avoid the conversation." },
      { q: "How long until effect?", a: "8–12 weeks at minimum. Carotenoids accumulate in the stratum corneum slowly. Stop the supplement and the photoprotective contribution fades over 4–6 weeks." },
    ]}
    bottom="A small, slow contributor. Defensible for fair-skinned, high-UV-exposure individuals. Skip if you are a current smoker. Diet outperforms supplement for most people."
  />
);

export default SupplementCarotenoids;
