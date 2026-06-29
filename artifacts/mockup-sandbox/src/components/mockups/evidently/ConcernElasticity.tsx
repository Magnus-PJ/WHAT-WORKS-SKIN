// ConcernElasticity — Loss of skin elasticity guide.

import React from "react";
import { ConcernPage } from "./_concernTemplate";

const ConcernElasticity: React.FC = () => (
  <ConcernPage
    pageSlug="ConcernElasticity"
    slug="elasticity"
    title="Loss of elasticity"
    page="P. 11"
    hero1="The boring truth"
    hero2="about firming."
    signs={[
      { k: "Skin slow to recoil after pinch test", w: "78%", n: "The clinical sign. Pinch the back of the hand for 5 seconds; recoil should be immediate. Delay = elastosis." },
      { k: "Visible deepening of nasolabial folds", w: "85%", n: "Volume loss + skin laxity. The folds are partly anatomical, partly elasticity-driven." },
      { k: "Jowl formation along jawline", w: "62%", n: "Mid-face descent meets jawline laxity. Topicals will not address this; energy devices and threads might." },
      { k: "Crepe-paper texture on neck and décolleté", w: "70%", n: "Sun damage + collagen loss. The neck is often 5–10 years 'older' than the face if SPF was face-only." },
    ]}
    ingredients={[
      { name: "Tretinoin 0.025–0.05%", tier: "A", role: "Collagen synthesis", evidence: "12-month dermal collagen endpoints. The reference topical for true elasticity." },
      { name: "Ascorbic acid 15–20%", tier: "A", role: "Collagen cofactor", evidence: "Required for collagen cross-linking. AM, under SPF." },
      { name: "Peptide complexes (Matrixyl 3000)", tier: "B", role: "Collagen signalling", evidence: "Modest 12-week endpoints. Useful adjunct, not standalone." },
      { name: "RF microneedling (clinic)", tier: "A", role: "Procedural collagen", evidence: "3–4 sessions; the procedural standard for true elasticity restoration." },
      { name: "Ultherapy / HIFU (clinic)", tier: "A", role: "Lift, not surface", evidence: "Targets SMAS. Useful for early jawline laxity, not for textural concerns." },
      { name: "Sunscreen SPF 50+ daily", tier: "A", role: "Prevention", evidence: "The single highest-leverage intervention. Photoaging is 80%+ of visible aging." },
    ]}
    phases={[
      { w: "Year 1, AM", t: "C + SPF", b: "Vitamin C 15% AM under broad-spectrum SPF 50+. Two finger-lengths, every morning, including weekends." },
      { w: "Year 1, PM", t: "Tretinoin", b: "Tretinoin 0.025% nightly with ceramide buffer. The 12-week ramp matters more than the strength." },
      { w: "Year 2+", t: "Procedural layer", b: "Add RF microneedling annually. HIFU for early jawline laxity. Topicals continue indefinitely." },
    ]}
    bottom="Elasticity restoration is a multi-year project. Anyone selling you a 6-week firming serum is selling marketing, not endpoints. The boring stack outperforms in 18 months — and humectant peptide moisturisers do not."
  />
);

export default ConcernElasticity;
