// SupplementSeaMoss — Sea moss capsules.

import React from "react";
import { SupplementPage } from "./_supplementTemplate";

const SupplementSeaMoss: React.FC = () => (
  <SupplementPage
    family="Trend Watch"
    name="Sea moss capsules"
    page="P. 15"
    eyebrow="Supplement · Trend Watch · Sea moss"
    hero="Sea moss."
    subheadA="TikTok cure-all."
    subheadB="No skin-specific human data."
    dek="The 2023–24 wellness trend that washed up on Indian shelves a year later. A red algae with genuine micronutrient content (iodine, magnesium, potassium) — and nothing in the published literature that justifies the 'cure-all' positioning. We say no."
    evidence={[
      { c: "Skin endpoints (any)", n: "—", w: "10%", note: "No defensible human RCTs on sea moss for skin endpoints. The category is built entirely on social-media testimonial." },
      { c: "Iodine repletion (when deficient)", n: "Established", w: "70%", note: "Sea moss contains highly variable iodine content — sometimes much more than recommended daily intake. Not a controlled iodine source." },
      { c: "Mineral content (Mg, K, Ca)", n: "Established", w: "60%", note: "Real micronutrient profile. The same micronutrients are available from a multivitamin at one-tenth the price and with predictable dosing." },
      { c: "Heavy metal contamination", n: "Surveillance studies", w: "Caution", note: "Wild-harvested sea moss frequently shows arsenic, cadmium, and lead above advisable thresholds. Source matters; testing is essential." },
    ]}
    forms={[
      { f: "Raw sea moss gel", abs: "Variable", note: "Home-soaked dried algae. Iodine and contaminant content unpredictable. Hard to dose responsibly." },
      { f: "Sea moss capsules 1000 mg", abs: "Variable", note: "Standardised packaging; ingredient consistency depends on the brand and harvest source." },
      { f: "'Sea moss + bladderwrack + burdock'", abs: "Variable", note: "The 'Dr. Sebi-inspired' combination popular on social. No skin-specific evidence; iodine content can be very high." },
    ]}
    faq={[
      { q: "Why is iodine a concern?", a: "Sea moss is iodine-rich and iodine content varies widely between batches. Excess iodine can trigger thyroid dysfunction (both hyper- and hypothyroid presentations, depending on baseline status), and a daily sea moss habit can substantially exceed recommended iodine intake without the consumer realising. People with pre-existing thyroid disease should not take sea moss." },
      { q: "What about the heavy metal stories?", a: "Wild-harvested sea moss accumulates ocean-water heavy metals (particularly arsenic and cadmium). Lab testing of commercial samples has repeatedly shown contamination above advisory thresholds. Buy only from vendors who provide third-party heavy-metal testing per batch — and most do not." },
      { q: "Is there any defensible use case?", a: "Sea moss is a perfectly fine occasional addition to a varied diet, like other seaweeds. The case against is not for the food; it is for the daily-supplement form sold with skin and 'wellness' marketing claims that the evidence does not support." },
      { q: "What should I take instead?", a: "If your concern is mineral micronutrient sufficiency, a tested multivitamin with appropriate iodine (~150 mcg/d) does the same job at one-tenth the cost and one-hundredth the contamination risk. If your concern is skin, see the rest of this section." },
    ]}
    bottom="A trend with no skin-specific evidence and a real safety conversation around iodine and heavy metals. Skip."
  />
);

export default SupplementSeaMoss;
