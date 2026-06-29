import React from "react";
import { ProductTemplate, ProductData } from "./_ProductTemplate";

const D: ProductData = {
  brand: "Deconstruct",
  productName: "Exosome Repair Serum",
  tagline: "claims outpace evidence.",
  category: "Trend Watch",
  pageRef: "P. 33",
  filed: "22-APR-2026",
  reviewer: "Dr. Aanya Mehta",
  eyebrow: "Product · Trend Watch · Exosomes",
  tier: "D",
  hero: "Cosmetic-grade exosomes at retail. The science is exciting in injectable / clinical settings — the topical evidence is thin, the regulatory ground is unsettled, and the dose claims are unverifiable. Save your money.",
  facts: [
    ["Format", "Serum, 30 mL"],
    ["Exosome source", "Plant-derived (claimed)"],
    ["Verified concentration", "Not disclosed"],
    ["Independent RCTs (topical)", "None published"],
    ["Price", "₹ 1,499 / 30 mL"],
    ["Pregnancy-safe", "Insufficient data"],
  ],
  scoreBreakdown: [
    { k: "Mechanistic plausibility (topical)", v: 8, max: 25, n: "Exosomes are large vesicles; topical penetration through intact stratum corneum is questionable." },
    { k: "Evidence per claim", v: 7, max: 25, n: "Almost all positive data comes from injectable, not topical, exosomes." },
    { k: "Regulatory / quality control", v: 9, max: 25, n: "Cosmetic-grade exosome supply chains lack standardised QC." },
    { k: "Value", v: 14, max: 25, n: "₹ 1,499 for unverifiable active is poor value." },
  ],
  ingredients: [
    { i: "Plant exosome complex", role: "Marketing active", tier: "D", note: "Concentration not disclosed; topical evidence absent." },
    { i: "Glycerin", role: "Humectant", tier: "A", note: "The one ingredient definitely doing something." },
    { i: "Hyaluronic acid", role: "Humectant", tier: "A", note: "Standard surface hydrator." },
    { i: "Niacinamide (trace)", role: "Brightening adjunct", tier: "B", note: "Below dose-response threshold." },
    { i: "Phenoxyethanol", role: "Preservative", tier: "B", note: "Standard." },
  ],
  useCases: [
    { k: "Honest answer", b: "There isn't one we can recommend on evidence grounds." },
    { k: "If you must try it", b: "Treat it as an expensive humectant. Don't displace a proven retinoid / SPF / niacinamide for it." },
    { k: "Wait for the data", b: "If exosomes prove out in topical RCTs, formulas will be reformulated and prices will move. Today is too early." },
  ],
  alts: [
    { brand: "Minimalist", name: "Niacinamide 5% + HA", tier: "A", score: 70, note: "1/3 the price; real evidence base; daily-use safe." },
    { brand: "The Ordinary", name: "Buffet (peptide complex)", tier: "B", score: 68, note: "Comparable 'modern serum' positioning; more conservative claims." },
    { brand: "La Roche-Posay", name: "Hyalu B5 Serum", tier: "A", score: 80, note: "Hydrator + B5 in a vehicle backed by clinical research." },
  ],
  faq: [
    { q: "Aren't exosomes the next big thing?", a: "In injectable post-procedure use — possibly. In a topical retail serum — very unlikely at present formulation standards. Don't conflate the two." },
    { q: "What's a D tier for?", a: "Products where marketing claims significantly exceed the topical evidence base. D doesn't mean 'will harm you' — it means 'won't deliver what's promised at this price'." },
    { q: "Is it dangerous?", a: "Not on a tolerability basis. The concern is opportunity cost — the money would do more elsewhere." },
    { q: "What should I buy instead?", a: "If the goal is anti-ageing: SPF + retinoid + niacinamide. If the goal is hydration: hyaluronic + ceramide moisturiser. The basics, dosed correctly." },
  ],
  sources: [
    { n: "Kalluri R, LeBleu VS. The biology, function, and biomedical applications of exosomes. Science 2020.", w: "REVIEW" },
    { n: "Kim YJ et al. Exosomes derived from stem cells in skin: current status. Cells 2020.", w: "REVIEW" },
    { n: "FDA. Important warnings related to use of exosome products. 2019 statement.", w: "REGULATORY" },
    { n: "EMA. Reflection paper on extracellular vesicles. 2023.", w: "REGULATORY" },
  ],
};

const ProductDeconstructExo: React.FC = () => <ProductTemplate d={D} />;
export default ProductDeconstructExo;
