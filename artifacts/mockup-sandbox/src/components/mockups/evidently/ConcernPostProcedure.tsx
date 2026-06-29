// ConcernPostProcedure — Post-procedure recovery guide.

import React from "react";
import { ConcernPage } from "./_concernTemplate";

const ConcernPostProcedure: React.FC = () => (
  <ConcernPage
    pageSlug="ConcernPostProcedure"
    slug="post-procedure"
    title="Post-procedure recovery"
    page="P. 16"
    hero1="The 14 days"
    hero2="that determine the result."
    signs={[
      { k: "Erythema for 2–7 days post-procedure", w: "92%", n: "Expected. Should be steadily improving day-by-day. Worsening warrants a clinician call." },
      { k: "Crusting or fine scabbing", w: "68%", n: "Normal in the first week post-laser. Do not pick. Petrolatum keeps the surface moist and prevents post-inflammatory pigmentation." },
      { k: "Tightness without sting", w: "85%", n: "Barrier is healing. Apply ceramide cream every 4–6 hours during the first 72 hours." },
      { k: "Itch without rash from day 5–10", w: "62%", n: "Re-epithelialisation. Annoying but normal. Resist scratching, which produces hypertrophic scars." },
    ]}
    ingredients={[
      { name: "Centella triterpene complex (TECA)", tier: "A", role: "Wound healing", evidence: "Standardised triterpene fractions; the most-evidenced botanical for procedural recovery." },
      { name: "Panthenol 5%", tier: "A", role: "Re-epithelialisation", evidence: "Reduces TEWL within 48 hours; supports surface repair." },
      { name: "Petrolatum / Aquaphor", tier: "A", role: "Occlusive", evidence: "First 72 hours post-laser. Prevents crust formation and accelerates healing." },
      { name: "Hyaluronic acid + glycerin", tier: "A", role: "Hydration", evidence: "Layered under occlusive. Pulls water; the occlusive prevents evaporation." },
      { name: "Mineral SPF 50+ from day 4", tier: "A", role: "Pigment prevention", evidence: "Mandatory. Post-procedure skin is exquisitely UV-sensitive; PIH is the most common avoidable complication." },
      { name: "EGF (epidermal growth factor)", tier: "B", role: "Acceleration", evidence: "Promising for laser recovery; small trials. Premium adjunct, not requirement." },
    ]}
    phases={[
      { w: "Day 0–3", t: "Occlude + protect", b: "Petrolatum every 4 hours. Avoid sun completely. No actives, no acids, no retinoids." },
      { w: "Day 4–7", t: "Centella + SPF", b: "Switch to centella + panthenol cream. Add mineral SPF 50+ once any crust resolves. Indoor-only if possible." },
      { w: "Week 2", t: "Slow re-introduction", b: "Resume gentle cleanser and moisturiser. No retinoid until day 14. No exfoliant until week 3." },
      { w: "Week 3+", t: "Resume routine", b: "Reintroduce retinoid at half-cadence for 2 weeks before resuming nightly. Continue SPF religiously." },
    ]}
    bottom="The patients who re-introduce their full routine at day 5 are the patients who pay for procedures twice. Discipline in this window protects the investment."
  />
);

export default ConcernPostProcedure;
