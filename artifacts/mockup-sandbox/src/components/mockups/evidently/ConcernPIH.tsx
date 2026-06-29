// ConcernPIH — Post-inflammatory hyperpigmentation guide.

import React from "react";
import { ConcernPage } from "./_concernTemplate";

const ConcernPIH: React.FC = () => (
  <ConcernPage
    pageSlug="ConcernPIH"
    slug="pih"
    title="Post-inflammatory hyperpigmentation"
    page="P. 03"
    hero1="The brown shadow"
    hero2="acne leaves behind."
    signs={[
      { k: "Brown / dark patches at sites of past acne", w: "94%", n: "Flat, sharply circumscribed. Not raised, not pink. The marker that tells you it is PIH and not active inflammation." },
      { k: "Persists 3–18 months without active treatment", w: "82%", n: "Spontaneous resolution is real but slow. Treatment compresses the timeline by months." },
      { k: "Worsens with sun exposure even briefly", w: "88%", n: "UV is the single biggest accelerant. Daily SPF is the most consequential variable in any PIH protocol." },
      { k: "Triggered by friction, picking, or BPO sting", w: "71%", n: "The inflammation does not need to be acne-shaped. Any trauma can produce a PIH plaque." },
    ]}
    ingredients={[
      { name: "Azelaic acid 10–15%", tier: "A", role: "Tyrosinase inhibitor", evidence: "First-line, pregnancy-safe, replicated 12-week PIH endpoints across skin types." },
      { name: "Tranexamic 5% topical", tier: "A", role: "Plasmin inhibitor", evidence: "Replicated efficacy in skin of colour at 8–12 weeks. Pairs cleanly with azelaic." },
      { name: "Niacinamide 4–10%", tier: "A", role: "Melanosome transfer", evidence: "Slows pigment hand-off from melanocyte to keratinocyte. Strong barrier credentials." },
      { name: "Alpha arbutin 2%", tier: "B", role: "Tyrosinase inhibitor", evidence: "Gentler than hydroquinone, slower endpoints. Safe in pregnancy." },
      { name: "Cysteamine 5%", tier: "B", role: "Antioxidant pigment-blocker", evidence: "Promising in stubborn PIH; short contact protocol; smell remains the limiter." },
      { name: "Hydroquinone 4%", tier: "A", role: "Tyrosinase inhibitor", evidence: "Reference compound. Cycle 3 months on, 2 off. Not in pregnancy." },
    ]}
    phases={[
      { w: "Week 1–4", t: "SPF + barrier", b: "Mineral SPF 50+ daily, two finger-lengths. Ceramide moisturiser. No active layering yet — establish UV discipline first." },
      { w: "Week 4–8", t: "Add azelaic", b: "Azelaic 10% PM, build to nightly. Continue niacinamide AM. The 8-week mark is the earliest reasonable photo check." },
      { w: "Week 8–16", t: "Layer tranexamic", b: "Tranexamic 5% AM under SPF. Optional cysteamine introduction at week 12 if response plateaus." },
      { w: "Month 4+", t: "Maintenance", b: "Continue SPF and azelaic indefinitely; cycle hydroquinone or cysteamine in 3-month windows. Re-photograph every 8 weeks." },
    ]}
    bottom="The condition with the highest treatment-discipline payoff in pigmentation. Most failed cases are sun-discipline failures, not molecule failures. Photograph at month 0 and month 4 — you will not believe the change otherwise."
  />
);

export default ConcernPIH;
