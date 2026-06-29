// ConcernPerioral — Perioral dermatitis guide.

import React from "react";
import { ConcernPage } from "./_concernTemplate";

const ConcernPerioral: React.FC = () => (
  <ConcernPage
    pageSlug="ConcernPerioral"
    slug="perioral-dermatitis"
    title="Perioral dermatitis"
    page="P. 14"
    hero1="A rash that"
    hero2="hates skincare."
    signs={[
      { k: "Pinpoint papules ringing the mouth", w: "92%", n: "Spares a thin border at the lip margin. The 'clear zone' is the diagnostic giveaway." },
      { k: "Burning or stinging without itch", w: "76%", n: "Distinct from eczema — irritation is the dominant sensation, not itch." },
      { k: "Triggered by topical steroid use", w: "68%", n: "Often paradoxical. Steroid initially helps, then drives the rash. The single most common iatrogenic cause." },
      { k: "Worsens with heavy moisturisers / occlusives", w: "62%", n: "Occlusion concentrates whatever flora the rash dislikes. Switch to lighter, fragrance-free formulations." },
    ]}
    ingredients={[
      { name: "STOP topical steroids", tier: "A", role: "Trigger removal", evidence: "Universal. Including hydrocortisone. The rash flares for 1–2 weeks then improves." },
      { name: "Topical metronidazole 0.75%", tier: "A", role: "First-line", evidence: "8–12 weeks. The reference treatment in mild-moderate disease." },
      { name: "Topical erythromycin / clindamycin", tier: "B", role: "Alternative", evidence: "When metronidazole insufficient or unavailable." },
      { name: "Oral doxycycline 100 mg/d", tier: "A", role: "Moderate-severe", evidence: "8–12 week course. Effective; the workhorse oral. Standard dermatology prescription." },
      { name: "Pimecrolimus 1%", tier: "B", role: "Steroid-free", evidence: "Useful when patient cannot tolerate metronidazole or wants steroid-sparing alternative." },
      { name: "SLS-free, fluoride-free toothpaste", tier: "B", role: "Trigger removal", evidence: "Adjunctive trigger removal; small but consistent contribution to recurrence prevention." },
    ]}
    phases={[
      { w: "Week 1", t: "Strip everything", b: "Stop topical steroids, fragrance, heavy moisturisers. Cleanser + lightweight ceramide moisturiser only." },
      { w: "Week 1–8", t: "Metronidazole or doxycycline", b: "Topical metronidazole 0.75% twice daily. Oral doxycycline if widespread or stubborn. 8-week minimum." },
      { w: "Week 8–12", t: "Reassess", b: "Most cases clear by week 12. If persistent, second-line oral or biologic referral. Recurrence is common; trigger discipline matters." },
    ]}
    bottom="The single most useful step is the one patients resist most: stopping every product that touched the area. The rash hates skincare; the treatment hates skincare too."
  />
);

export default ConcernPerioral;
