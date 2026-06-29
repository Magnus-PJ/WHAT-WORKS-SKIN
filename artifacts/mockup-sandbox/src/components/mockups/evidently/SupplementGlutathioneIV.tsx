// SupplementGlutathioneIV — IV glutathione drip clinics.

import React from "react";
import { SupplementPage } from "./_supplementTemplate";

const SupplementGlutathioneIV: React.FC = () => (
  <SupplementPage
    family="Pigmentation"
    name="Glutathione (IV)"
    page="P. 05"
    eyebrow="Supplement · Pigmentation · IV glutathione"
    hero="IV glutathione."
    subheadA="Clinic marketing."
    subheadB="Evidence is thin."
    dek="The premium-priced sibling of the oral category, sold through aesthetic clinics as a 'whitening drip.' The published literature does not support the claims, the safety profile is more concerning than the marketing admits, and the FDA has issued warnings. Not a recommendation."
    evidence={[
      { c: "Tone lightening (peer-reviewed)", n: "Tiny trials, methodologically weak", w: "25%", note: "The few positive trials are small, short, and rarely placebo-controlled. The aesthetic literature is closer to marketing than evidence." },
      { c: "Melasma", n: "—", w: "15%", note: "No defensible RCT data. Oral tranexamic, topical hydroquinone, and azelaic vastly outperform on the endpoint and the cost ratio." },
      { c: "'Antioxidant boost'", n: "Acute biomarker shifts", w: "30%", note: "Real, transient. Whether this matters clinically is unestablished. The same biomarker shifts can be achieved more cheaply." },
      { c: "Adverse-event signal (Philippines FDA, 2011)", n: "Regulatory warning", w: "Caution", note: "Reported renal, hepatic, and dermatological toxicity at higher doses. Take the warning seriously." },
    ]}
    forms={[
      { f: "Clinic IV drip 600–1200 mg", abs: "100% bypassing gut", note: "Once or twice weekly for 6–10 sessions. Premium pricing per session." },
      { f: "Push injection 600 mg", abs: "100%", note: "Faster delivery; same efficacy questions. Same safety questions." },
      { f: "Compounded vitamin-C + glutathione drip", abs: "100%", note: "Common combination at aesthetic clinics. Adds vitamin C complications to glutathione's own profile." },
    ]}
    faq={[
      { q: "Why is the FDA concerned?", a: "The Philippines FDA issued a 2011 advisory citing reports of toxic epidermal necrolysis, Stevens-Johnson syndrome, renal and hepatic injury, and severe abdominal pain associated with IV glutathione marketed for skin lightening. The warning has been reiterated and other regulators have expressed similar caution." },
      { q: "Are clinic providers honest about the evidence?", a: "Variably. The marketing typically presents the procedure as well-established. The literature presents the procedure as poorly-studied with non-trivial safety questions. The two pictures are difficult to reconcile." },
      { q: "What should I use instead?", a: "Oral tranexamic acid (Tier A, RCT-supported), topical hydroquinone + tretinoin + niacinamide, and rigorous mineral SPF. The combination delivers measurably better melasma endpoints at a fraction of the cost and risk profile." },
      { q: "Is there any case where it makes sense?", a: "Outside of clinical trials, no — and we say this rarely. The procedure neither reliably delivers the endpoints it markets nor sits within a safety profile that we can endorse." },
    ]}
    bottom="A category we cannot recommend. The marketing has outrun the evidence, and the safety profile makes the gap especially difficult to defend."
  />
);

export default SupplementGlutathioneIV;
