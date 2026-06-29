import React from "react";
import { ProductTemplate, ProductData } from "./_ProductTemplate";

const D: ProductData = {
  brand: "Minimalist",
  productName: "Plant Stem Cell Serum",
  tagline: "plant cells aren't stem cells.",
  category: "Trend Watch",
  pageRef: "P. 34",
  filed: "22-APR-2026",
  reviewer: "Dr. Aanya Mehta",
  eyebrow: "Product · Trend Watch · Plant stem cells",
  tier: "D",
  hero: "'Plant stem cells' is a marketing translation, not a scientific one. Plant meristematic cells share a name with mammalian stem cells but not the function — and even if they did, they'd be dead by the time they reached your face. Pseudoscience by terminology.",
  facts: [
    ["Format", "Serum, 30 mL"],
    ["Active claim", "Plant stem cell extract"],
    ["Active integrity", "Cells are non-viable in serum"],
    ["Mammalian stem-cell equivalence", "None"],
    ["Price", "₹ 749 / 30 mL"],
    ["Pregnancy-safe", "Yes (it's plant extract)"],
  ],
  scoreBreakdown: [
    { k: "Mechanistic plausibility", v: 6, max: 25, n: "Plant 'stem cells' do not function as mammalian regenerative cells." },
    { k: "Active integrity", v: 7, max: 25, n: "Even if relevant, the cells are dead and lysed by the time they're in your bottle." },
    { k: "Evidence per claim", v: 6, max: 25, n: "No topical RCTs supporting the headline mechanism." },
    { k: "Value", v: 13, max: 25, n: "₹ 749 for plant extract + glycerin is poor value." },
  ],
  ingredients: [
    { i: "Plant stem cell extract", role: "Marketing active", tier: "D", note: "Extract of meristematic plant cells; nothing 'stem' about its function in skin." },
    { i: "Resveratrol", role: "Antioxidant", tier: "B", note: "Real antioxidant at the dose used; small benefit." },
    { i: "Glycerin", role: "Humectant", tier: "A", note: "Workhorse — most of the measurable hydration." },
    { i: "Hyaluronic acid", role: "Humectant", tier: "A", note: "Surface binding." },
    { i: "Niacinamide (trace)", role: "Brightening", tier: "B", note: "Below dose-response threshold." },
  ],
  useCases: [
    { k: "Honest answer", b: "There isn't one we can recommend on evidence grounds." },
    { k: "If you bought it already", b: "Use as a humectant; don't displace a proven retinoid / SPF / niacinamide." },
    { k: "What to switch to", b: "Same brand makes Niacinamide 5% — same price tier, real evidence." },
  ],
  alts: [
    { brand: "Minimalist", name: "Niacinamide 5% + HA", tier: "A", score: 70, note: "Same brand, same price, real evidence." },
    { brand: "The Ordinary", name: "Resveratrol 3% + Ferulic Acid 3%", tier: "B", score: 71, note: "Pure antioxidant serum without the stem-cell theatre." },
    { brand: "La Roche-Posay", name: "Hyalu B5 Serum", tier: "A", score: 80, note: "Hydrator + B5 in a vehicle backed by research." },
  ],
  faq: [
    { q: "Why is it pseudoscience?", a: "Plant 'stem cells' (meristematic cells) are renewable in plant tissue. They have no equivalent function on human skin. The name traffics on the connotation of mammalian stem-cell research without the underlying science." },
    { q: "But aren't the antioxidants real?", a: "The resveratrol and trace plant polyphenols are real. Buy them as antioxidants if you want them — don't pay 'stem cell' premium for them." },
    { q: "What's the harm?", a: "Opportunity cost. ₹ 749 spent here is ₹ 749 not spent on a real retinoid or SPF that would do more for your skin." },
    { q: "Is Minimalist a good brand otherwise?", a: "Yes — most of their catalogue (Niacinamide 5%, Tranexamic 03%, Vit C 10%) is genuinely well-formulated and well-priced. This SKU is the outlier." },
  ],
  sources: [
    { n: "Trehan S et al. Plant stem cells in cosmetics: a critical review. Int J Cosm Sci 2017.", w: "REVIEW" },
    { n: "FDA. Cosmetic product claims and the 'stem cell' label. 2018.", w: "REGULATORY" },
    { n: "Schmid D et al. Apple stem cell extract for cosmetic use: a critical view. SOFW J 2008.", w: "INDUSTRY" },
  ],
};

const ProductMinimalistStem: React.FC = () => <ProductTemplate d={D} />;
export default ProductMinimalistStem;
