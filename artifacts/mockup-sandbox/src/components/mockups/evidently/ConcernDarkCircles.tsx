// ConcernDarkCircles — Periorbital dark circles guide.

import React from "react";
import { ConcernPage } from "./_concernTemplate";

const ConcernDarkCircles: React.FC = () => (
  <ConcernPage
    pageSlug="ConcernDarkCircles"
    slug="dark-circles"
    title="Dark circles"
    page="P. 05"
    hero1="Three categories"
    hero2="masquerading as one."
    signs={[
      { k: "Skin lifts the same colour with stretch (pigmentary)", w: "62%", n: "Tyrosinase-driven. The category most-likely to respond to a topical regimen." },
      { k: "Bluish-purple tint, blanches with pressure (vascular)", w: "54%", n: "Visible vessels through thin periorbital skin. Topicals will not move this — laser or filler will." },
      { k: "Hollow shadow under orbital rim (structural)", w: "48%", n: "Anatomy, not pigment. The shadow is light, not melanin. Volume restoration is the only real fix." },
      { k: "Worse after poor sleep / dehydration", w: "76%", n: "Modulator, not cause. Sleep affects perfusion and lid puffiness, both of which deepen the appearance." },
    ]}
    ingredients={[
      { name: "Hydroquinone 2% periorbital", tier: "B", role: "Pigmentary", evidence: "Effective when pigmentation is the primary mechanism. Use only at lower strength near eyes." },
      { name: "Vitamin K + retinol eye cream", tier: "B", role: "Vascular adjunct", evidence: "Modest endpoints on perfusion and lid laxity. Slow." },
      { name: "Caffeine 5%", tier: "C", role: "Vasoconstrictor", evidence: "Hours-long perfusion shift. Useful cosmetically; not a treatment." },
      { name: "Tranexamic 3% periorbital", tier: "B", role: "Pigmentary", evidence: "Promising small-trial data; pairs with hydroquinone in skin of colour." },
      { name: "Hyaluronic filler (clinic)", tier: "A", role: "Structural", evidence: "Tear-trough volumisation. The single most effective intervention for true hollows." },
      { name: "Q-switched laser (clinic)", tier: "B", role: "Pigmentary", evidence: "Effective for dermal melanin; not for vascular or structural." },
    ]}
    phases={[
      { w: "Week 1", t: "Identify the type", b: "Stretch test in the mirror. Pigmentary stays brown; vascular fades; structural shifts as the light angle changes." },
      { w: "Week 1–8", t: "Topical trial", b: "If pigmentary: hydroquinone 2% PM + tranexamic 3% AM, with rigorous SPF. 8 weeks is the decision point." },
      { w: "Week 8+", t: "Escalate or pivot", b: "Vascular: KTP / pulsed-dye laser. Structural: tear-trough filler. Topicals will not move these categories." },
    ]}
    bottom="The most-misdiagnosed category in cosmetic dermatology. Identify which type you have first; spend the money second."
  />
);

export default ConcernDarkCircles;
