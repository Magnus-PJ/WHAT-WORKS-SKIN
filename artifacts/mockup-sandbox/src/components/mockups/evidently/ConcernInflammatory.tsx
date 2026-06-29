// ConcernInflammatory — Inflammatory acne guide.

import React from "react";
import { ConcernPage } from "./_concernTemplate";

const ConcernInflammatory: React.FC = () => (
  <ConcernPage
    pageSlug="ConcernInflammatory"
    slug="inflammatory-acne"
    title="Inflammatory acne"
    page="P. 07"
    hero1="Red papules, pustules,"
    hero2="and the resistance question."
    signs={[
      { k: "Red, raised, tender papules", w: "94%", n: "The lesion that hurts when you press it. Inflammation is the dominant feature, not congestion." },
      { k: "Pustules with white-yellow heads", w: "82%", n: "The classic 'pimple.' BPO and topical retinoid is the workhorse combination." },
      { k: "Cysts or nodules (deep, painful)", w: "38%", n: "If present, escalate to a dermatologist. OTC routine alone is insufficient and risks scarring." },
      { k: "Post-inflammatory pigmentation after healing", w: "76%", n: "The shadow that remains for months after the lesion clears. Treat in parallel — see PIH guide." },
    ]}
    ingredients={[
      { name: "Benzoyl peroxide 2.5%", tier: "A", role: "Bactericidal", evidence: "First-line. Prevents C. acnes resistance. Pair with adapalene; spot-treat at first." },
      { name: "Adapalene 0.1%", tier: "A", role: "Retinoid", evidence: "OTC. Reduces both inflammatory and comedonal lesions. 12-week ramp." },
      { name: "Clindamycin 1% topical", tier: "B", role: "Antibiotic", evidence: "Effective; never use as monotherapy. Always pair with BPO to prevent resistance." },
      { name: "Azelaic 15%", tier: "A", role: "Anti-inflammatory + comedolytic", evidence: "Pregnancy-safe; useful in adult inflammatory cases. Slower than retinoids." },
      { name: "Oral isotretinoin (clinic)", tier: "A", role: "Sebum suppression", evidence: "Reference treatment for moderate-severe disease. Requires monitoring; remarkable endpoints." },
      { name: "Spironolactone (clinic)", tier: "A", role: "Anti-androgen", evidence: "First-line for adult female hormonal inflammatory acne. Not for male patients." },
    ]}
    phases={[
      { w: "Week 1–2", t: "BPO + barrier", b: "BPO 2.5% wash 3× per week. Cleanser, ceramide moisturiser, SPF. No actives stacked yet." },
      { w: "Week 3–6", t: "Add adapalene", b: "Adapalene 0.1% PM, alternate nights. BPO 2.5% spot AM as needed. Watch for resistance signs." },
      { w: "Week 6–12", t: "Combination", b: "Adapalene + BPO 2.5% combination (Epiduo) is the simplest single-product version of the gold standard." },
      { w: "Month 4+", t: "Reassess", b: "If inadequate response: dermatologist for oral spironolactone, doxycycline, or isotretinoin. Do not loop on OTC alone." },
    ]}
    bottom="If you have not improved on adapalene + BPO at month 4, see a clinician. Looping on OTC for a year leaves scars that no protocol can undo."
  />
);

export default ConcernInflammatory;
