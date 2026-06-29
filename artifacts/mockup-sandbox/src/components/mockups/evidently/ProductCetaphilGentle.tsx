import React from "react";
import { ProductTemplate, ProductData } from "./_ProductTemplate";

const D: ProductData = {
  brand: "Cetaphil",
  productName: "Gentle Skin Cleanser",
  tagline: "the sensitive-skin baseline.",
  category: "Cleansers",
  pageRef: "P. 18",
  filed: "22-APR-2026",
  reviewer: "Dr. Aanya Mehta",
  eyebrow: "Product · Cleanser · Lotion",
  tier: "A",
  hero: "The 70-year-old prescription pad cleanser. A near-foam-free lotion that wipes off without disturbing the barrier. The default we hand to rosacea, eczema, and post-procedure patients before anything else.",
  facts: [
    ["Format", "Lotion cleanser, 250 / 500 mL"],
    ["pH", "6.8 (close-to-skin)"],
    ["Surfactant load", "Very low"],
    ["Rinse profile", "Minimal foam; tissue-removable"],
    ["Price", "₹ 720 / 250 mL"],
    ["Pregnancy-safe", "Yes"],
  ],
  scoreBreakdown: [
    { k: "Surfactant gentleness", v: 24, max: 25, n: "Lowest irritation index of any drugstore cleanser tested." },
    { k: "Sensitive-skin tolerance", v: 23, max: 25, n: "70+ years of pediatric and adult sensitive-skin use." },
    { k: "Cleansing depth", v: 16, max: 25, n: "Trade-off — light cleansing only. Won't strip SPF residue." },
    { k: "Value", v: 19, max: 25, n: "₹ 720 / 250 mL — fair, half the price abroad." },
  ],
  ingredients: [
    { i: "Cetyl alcohol", role: "Emollient / co-surfactant", tier: "A", note: "Soft fatty alcohol — softens cleansing." },
    { i: "Sodium lauryl sulfate", role: "Mild surfactant (low %)", tier: "B", note: "At the dose used here it functions as emulsifier, not detergent." },
    { i: "Propylene glycol", role: "Humectant", tier: "B", note: "Mild humectant carrier. Rare reactor." },
    { i: "Stearyl alcohol", role: "Emollient", tier: "A", note: "Rebuilds skin slip during cleanse." },
    { i: "Methylparaben", role: "Preservative", tier: "C", note: "Established safety; use unaffected by recent panic." },
  ],
  useCases: [
    { k: "Rosacea / sensitive skin", b: "First-choice cleanser. The reason it lives on every dermatologist's shelf." },
    { k: "Post-procedure days 1–3", b: "Wipe with damp cotton or rinse. No active filming." },
    { k: "Pediatric or geriatric skin", b: "70-year track record. Eczema, diaper area, frail skin — safe everywhere." },
  ],
  alts: [
    { brand: "CeraVe", name: "Hydrating Cleanser", tier: "A", score: 83, note: "Adds ceramides; slightly heavier. Drier-skin alternate." },
    { brand: "La Roche-Posay", name: "Toleriane Hydrating Gentle Cleanser", tier: "A", score: 82, note: "Comparable; thinner consistency, often preferred in summer." },
    { brand: "Bioderma", name: "Sensibio H2O Micellar", tier: "A", score: 80, note: "No-rinse equivalent; great as a second-step morning cleanse." },
  ],
  faq: [
    { q: "Wait — there's SLS in here. Isn't that bad?", a: "Not at this dose. SLS is irritating at high % in shampoos and hand soaps; here it sits below the irritation threshold and functions as an emulsifier. Decades of sensitive-skin trials confirm tolerance." },
    { q: "Can I use it without water?", a: "Yes — wipe on with cotton, lift off with tissue. The no-rinse use is exactly why it became the post-procedure default." },
    { q: "Will it remove SPF?", a: "On its own, not fully. Double-cleanse PM: oil cleanser or micellar first, then Cetaphil. Don't ask one product to do two jobs." },
    { q: "Cetaphil vs CeraVe Hydrating — which?", a: "Both excellent. Cetaphil is gentler; CeraVe Hydrating adds ceramides at a slightly heavier feel. Sensitive default → Cetaphil. Dry-skin default → CeraVe Hydrating." },
  ],
  sources: [
    { n: "Subramanyan K. Mild cleansing technologies. Cosmet Dermatol 2004.", w: "REVIEW" },
    { n: "Bikowski J. The use of cleansers as therapeutic concomitants. JDD 2001.", w: "REVIEW" },
    { n: "Galderma Cetaphil dossier — 70-year sensitive-skin data. 2020.", w: "MFR DATA" },
    { n: "Tsai TF, Maibach HI. SLS irritation thresholds. Contact Derm 1999.", w: "MECHANISM" },
  ],
};

const ProductCetaphilGentle: React.FC = () => <ProductTemplate d={D} />;
export default ProductCetaphilGentle;
