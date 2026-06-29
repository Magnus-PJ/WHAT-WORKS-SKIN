// SupplementMagnesium — Magnesium glycinate for skin recovery.

import React from "react";
import { SupplementPage } from "./_supplementTemplate";

const SupplementMagnesium: React.FC = () => (
  <SupplementPage
    family="Barrier & inflammation"
    name="Magnesium glycinate"
    page="P. 17"
    eyebrow="Supplement · Barrier & inflammation · Magnesium glycinate"
    hero="Magnesium glycinate."
    subheadA="Sleep is a skin variable."
    subheadB="Indirect benefit at best."
    dek="The supplement that the skincare community has discovered via the sleep route. Real evidence for sleep quality and muscle recovery; the skin effect is downstream of sleep, not direct. We include it because the indirect pathway is genuine, even if the marketing skips a step."
    evidence={[
      { c: "Sleep quality (with insufficiency)", n: "Multiple RCTs", w: "65%", note: "Real, replicated effect on sleep latency and quality, particularly in patients with documented magnesium insufficiency." },
      { c: "Skin endpoints (direct)", n: "—", w: "20%", note: "No defensible direct effect on skin. Any benefit is downstream of sleep, recovery, or stress modulation." },
      { c: "Anxiety / stress", n: "Mixed", w: "55%", note: "Reasonable signal in mild anxiety. The link to skin (acne, eczema flare frequency) is plausible but indirect." },
      { c: "Muscle cramp / restless legs", n: "Replicated", w: "65%", note: "Real benefit, particularly in pregnancy. Not a skin indication, but a common reason patients are already on it." },
    ]}
    forms={[
      { f: "Magnesium glycinate 200–400 mg", abs: "Excellent", note: "Best-tolerated form; minimal GI side effects. Standard for sleep and skin-adjacent indications." },
      { f: "Magnesium citrate 200–400 mg", abs: "Good", note: "Effective; mild laxative effect at higher doses. Useful for the constipation-prone." },
      { f: "Magnesium oxide 400 mg", abs: "Poor", note: "Cheap; high GI upset; unreliable absorption. Avoid for skin-adjacent use." },
      { f: "Magnesium L-threonate", abs: "Brain-targeting", note: "Premium-priced; some evidence for cognitive endpoints. Not the form for skin or sleep specifically." },
    ]}
    faq={[
      { q: "How does sleep help skin?", a: "Cortisol patterns, growth hormone secretion (largely nocturnal), and basal inflammation all track with sleep quality. Patients with chronic sleep insufficiency report more frequent acne flares, slower wound healing, and worsened atopic skin. The mechanism is well-established; magnesium supplementation contributes to that pathway only when sleep is genuinely the bottleneck." },
      { q: "Should I trial it for acne specifically?", a: "Only if you also have sleep complaints. Magnesium is not a primary acne treatment; topical retinoid + BPO + (optionally) oral spironolactone or doxycycline are. If your acne is partly stress-and-sleep-driven, magnesium can be a defensible adjunct, not a replacement." },
      { q: "When should I take it?", a: "30–60 minutes before bed, with food. The sleep-onset effect is most consistent with evening dosing. Daytime dosing is fine for muscle recovery indications but does not deliver the same sleep endpoints." },
      { q: "How long until effect?", a: "Sleep effects are often noticeable within 1–2 weeks. Skin-adjacent effects (downstream of sleep) take 8–12 weeks at minimum, and only in patients where sleep was the actual bottleneck." },
    ]}
    bottom="Useful supplement when sleep is the actual problem; misleading marketing when sold as a direct skin treatment. Treat the sleep, accept the indirect skin payoff."
  />
);

export default SupplementMagnesium;
