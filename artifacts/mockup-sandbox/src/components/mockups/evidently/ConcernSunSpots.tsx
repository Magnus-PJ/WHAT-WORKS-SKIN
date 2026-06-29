// ConcernSunSpots — Solar lentigines guide.

import React from "react";
import { ConcernPage } from "./_concernTemplate";

const ConcernSunSpots: React.FC = () => (
  <ConcernPage
    pageSlug="ConcernSunSpots"
    slug="sun-spots"
    title="Sun spots / Solar lentigines"
    page="P. 04"
    hero1="The flat brown spots"
    hero2="that read as age."
    signs={[
      { k: "Sharply demarcated brown / tan macules", w: "96%", n: "The defining feature. Edges are crisp; colour is uniform; surface is flat. If raised, consider seborrheic keratosis." },
      { k: "Sun-exposed sites: cheeks, hands, forearms", w: "89%", n: "Distribution maps to lifetime UV dose. The dorsal hands often outpace the face in the 50s." },
      { k: "Increases gradually after age 40", w: "78%", n: "Cumulative dose-response. Onset before 40 is unusual and warrants a closer look." },
      { k: "No itch, no irritation, no growth", w: "85%", n: "Static. New, growing, or itching pigmented lesions need a clinic visit, not a serum." },
    ]}
    ingredients={[
      { name: "Mineral SPF 50+ daily", tier: "A", role: "Prevention", evidence: "The single highest-leverage variable. The Australian RCT remains the reference." },
      { name: "Hydroquinone 4%", tier: "A", role: "Tyrosinase inhibitor", evidence: "First-line for established lentigines. Cycle 3 months on, 2 off." },
      { name: "Tretinoin 0.025–0.05%", tier: "A", role: "Cell turnover", evidence: "Doubles the response when paired with hydroquinone. The classic Kligman cocktail." },
      { name: "Glycolic 8–10% leave-on", tier: "B", role: "Surface exfoliation", evidence: "Adjunct, not solo. Useful for textural unevenness over time." },
      { name: "Q-switched laser (clinic)", tier: "A", role: "Selective destruction", evidence: "Single-session clearance for discrete lentigines. The procedural gold standard." },
      { name: "Cryotherapy (clinic)", tier: "B", role: "Selective destruction", evidence: "Effective; risk of post-procedure hypopigmentation in darker skin." },
    ]}
    phases={[
      { w: "Week 1–8", t: "SPF + topical start", b: "Mineral SPF 50+ daily. Begin Kligman cocktail (hydroquinone + tretinoin + low-potency steroid) at night, 5 nights a week." },
      { w: "Week 8–12", t: "First photo check", b: "8-week response is your decision point. If significant fade, continue another 4 weeks. If minimal, escalate to clinic." },
      { w: "Month 4", t: "Procedural option", b: "Q-switched laser is the most efficient single-session route for stubborn lentigines. Pair with continued SPF." },
      { w: "Maintenance", t: "Lifelong SPF", b: "Pigment returns within 2 years of inconsistent SPF. Treat sunscreen as the prevention drug it is." },
    ]}
    bottom="The category where prevention is dramatically cheaper than correction. People who started SPF in their 30s do not have this conversation in their 50s."
  />
);

export default ConcernSunSpots;
