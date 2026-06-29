// ConcernToneTexture — Uneven tone & texture guide.

import React from "react";
import { ConcernPage } from "./_concernTemplate";

const ConcernToneTexture: React.FC = () => (
  <ConcernPage
    pageSlug="ConcernToneTexture"
    slug="tone-texture"
    title="Uneven tone & texture"
    page="P. 12"
    hero1="Surface roughness,"
    hero2="and how to actually fix it."
    signs={[
      { k: "Pore visibility on T-zone in flat lighting", w: "72%", n: "Often less about pore size than about peri-pore congestion and oxidation. Treat the contents, not the diameter." },
      { k: "Surface roughness on cheeks (felt, not seen)", w: "68%", n: "Stratum corneum disorganisation. Responds to gentle, regular keratolytic exfoliation." },
      { k: "Light reflects unevenly across cheek", w: "78%", n: "The 'glow' problem. Improvement here usually drives the perceived skincare-is-working signal." },
      { k: "Diffuse mild redness through transitions", w: "54%", n: "Vascular reactivity that often resolves once the routine simplifies. Sometimes signals barrier compromise." },
    ]}
    ingredients={[
      { name: "Glycolic 8–10% leave-on", tier: "A", role: "AHA exfoliation", evidence: "Twice-weekly, alternated with retinoid. Reference for tone and texture across 12 weeks." },
      { name: "Lactic 5–10%", tier: "A", role: "Gentler AHA", evidence: "Larger molecule, slower penetration. Better for sensitive skin." },
      { name: "Mandelic 10%", tier: "A", role: "AHA + acne adjacent", evidence: "Best AHA for melanin-rich and reactive skin. Slower endpoints, fewer flares." },
      { name: "Adapalene / tretinoin", tier: "A", role: "Retinoid", evidence: "Pore quality and tone respond at 12 weeks. The most under-prescribed step in this category." },
      { name: "Niacinamide 4–10%", tier: "A", role: "Tone", evidence: "Daily; useful supporting active. Pairs cleanly with retinoid and AHA." },
      { name: "Microneedling (clinic)", tier: "A", role: "Procedural texture", evidence: "Single best intervention for textural endpoints over 4–6 sessions." },
    ]}
    phases={[
      { w: "Week 1–4", t: "Simplify", b: "Cleanser, niacinamide moisturiser, SPF. Stop physical scrubs and stacked acids." },
      { w: "Week 4–8", t: "Add retinoid", b: "Adapalene 0.1% PM, alternate nights. The boring foundation under all texture work." },
      { w: "Week 8+", t: "Layer AHA", b: "Glycolic 8% leave-on twice a week, on non-retinoid nights. Photograph at week 0 and week 16." },
    ]}
    bottom="Pick one AHA, one retinoid, and one niacinamide. Stick with them for 16 weeks. Stacking five exfoliants does not exfoliate five times harder; it just compromises the barrier."
  />
);

export default ConcernToneTexture;
