// ConcernScarring — Acne scarring guide.

import React from "react";
import { ConcernPage } from "./_concernTemplate";

const ConcernScarring: React.FC = () => (
  <ConcernPage
    pageSlug="ConcernScarring"
    slug="scarring"
    title="Acne scarring"
    page="P. 09"
    hero1="What topicals can"
    hero2="and cannot do."
    signs={[
      { k: "Indented texture visible in side lighting", w: "94%", n: "The defining sign. If the scar is visible only in flat front-on lighting, it is more likely PIH or texture, not true atrophic scar." },
      { k: "Rolling shadows on cheeks and temples", w: "78%", n: "Most amenable to clinic resurfacing — RF microneedling and subcision combined." },
      { k: "Ice-pick scars: deep, narrow, vertical", w: "52%", n: "Hardest to treat. TCA CROSS or punch excision are the workhorse procedures." },
      { k: "Box-car scars with sharp vertical walls", w: "45%", n: "Respond well to fractional CO2 and microneedling." },
    ]}
    ingredients={[
      { name: "Tretinoin 0.05% nightly", tier: "B", role: "Surrounding tone & texture", evidence: "12-week endpoints on tone, texture, and pore quality. Will not fill the scar." },
      { name: "Vitamin C 15% AM", tier: "B", role: "Collagen support", evidence: "Adjunctive collagen synthesis support. Helps the procedural protocol work better." },
      { name: "Subcision (clinic)", tier: "A", role: "Tethered rolling scars", evidence: "Single most underused intervention. Cuts the fibrotic bands that anchor the scar." },
      { name: "RF microneedling (clinic)", tier: "A", role: "Atrophic & box-car", evidence: "3–4 sessions, 4 weeks apart. The current procedural standard." },
      { name: "Fractional CO2 (clinic)", tier: "A", role: "Resurfacing", evidence: "Most effective for box-car. Significant downtime; significant endpoints." },
      { name: "TCA CROSS (clinic)", tier: "A", role: "Ice-pick scars", evidence: "Targeted high-strength TCA into individual ice-pick scars. Multiple sessions." },
    ]}
    phases={[
      { w: "Month 1–3", t: "Stabilise active acne", b: "Scar treatment requires no active inflammation. Stabilise acne first; subcision while breakouts continue is futile." },
      { w: "Month 3–9", t: "Procedural protocol", b: "Subcision + RF microneedling for rolling. CO2 for box-car. TCA CROSS for ice-pick. Combine modalities." },
      { w: "Month 9+", t: "Maintenance + topicals", b: "Continue tretinoin and SPF; expect 60–80% improvement, not 100%. Photograph at month 0 and month 9." },
    ]}
    bottom="Scarring is the one acne category where money does meaningfully better than discipline. Save the topical budget for procedures."
  />
);

export default ConcernScarring;
