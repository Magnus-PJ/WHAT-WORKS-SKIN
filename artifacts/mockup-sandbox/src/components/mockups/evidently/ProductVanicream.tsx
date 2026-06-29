import React from "react";
import { ProductTemplate, ProductData } from "./_ProductTemplate";

const D: ProductData = {
  brand: "Vanicream",
  productName: "Daily Facial Moisturizer",
  tagline: "for the truly stripped barrier.",
  category: "Moisturisers",
  pageRef: "P. 22",
  filed: "22-APR-2026",
  reviewer: "Dr. Aanya Mehta",
  eyebrow: "Product · Moisturiser · Allergen-screened",
  tier: "A",
  hero: "When every other moisturiser stings, this is what we reach for. Allergen-screened down to a five-ingredient core, fragrance-free, dye-free, and one of the few products to pass the North American Contact Dermatitis Group's stringent screen.",
  facts: [
    ["Format", "Lotion, 89 mL"],
    ["Allergen-screened", "NACDG core list"],
    ["Fragrance / dye / lanolin", "None"],
    ["Hyaluronic acid", "Yes"],
    ["Price", "₹ 1,400 / 89 mL"],
    ["Pregnancy-safe", "Yes"],
  ],
  scoreBreakdown: [
    { k: "Tolerability", v: 25, max: 25, n: "Highest scoring tolerability product in this catalogue." },
    { k: "Barrier support", v: 19, max: 25, n: "No ceramide complex; built around squalane + glycerin." },
    { k: "Cosmetic elegance", v: 18, max: 25, n: "Slightly tacky finish; medicinal feel some won't love." },
    { k: "Value", v: 19, max: 25, n: "₹ 1,400 — premium for a no-frills formula, justified by purity." },
  ],
  ingredients: [
    { i: "Glycerin", role: "Humectant", tier: "A", note: "Workhorse. High % drives most of the skin-feel." },
    { i: "Squalane", role: "Emollient lipid", tier: "A", note: "Mimics natural sebum; non-comedogenic, low-allergen." },
    { i: "Hyaluronic acid", role: "Humectant", tier: "A", note: "Standard surface hydrator." },
    { i: "Ceteareth-20", role: "Emulsifier", tier: "B", note: "Gentle, low-irritant emulsifier." },
    { i: "Phenoxyethanol", role: "Preservative", tier: "B", note: "Standard preservative; no parabens / formaldehyde donors." },
  ],
  useCases: [
    { k: "Severe sensitive / contact-allergy skin", b: "When every other moisturiser stings or breaks you out — start here." },
    { k: "Eczema / rosacea flares", b: "Pediatric and geriatric tolerance; safe on broken skin." },
    { k: "Drug-induced sensitivity", b: "Tretinoin overshoot, isotretinoin maintenance, post-radiation." },
  ],
  alts: [
    { brand: "CeraVe", name: "Moisturizing Cream", tier: "A", score: 88, note: "Higher ceramide depth; slightly more reactive in sensitive skin." },
    { brand: "Cetaphil", name: "Moisturizing Cream", tier: "A", score: 78, note: "Cheaper; less allergen-screened." },
    { brand: "La Roche-Posay", name: "Toleriane Sensitive", tier: "A", score: 80, note: "Niacinamide-light alternate; lighter texture." },
  ],
  faq: [
    { q: "What's the NACDG screen?", a: "The North American Contact Dermatitis Group maintains a list of common skin allergens (fragrance mix, formaldehyde donors, certain preservatives). Vanicream avoids all of them — uncommonly thorough for an OTC product." },
    { q: "Why is it so basic?", a: "Because every additional ingredient is a new allergen risk. For barrier-compromised skin, less is more. The minimalism is the feature." },
    { q: "Will it tame my eczema?", a: "It supports flare recovery and reduces TEWL. It is not a steroid — for active flares, treat with the prescribed topical first, then maintain with Vanicream." },
    { q: "Cetaphil Moisturizing Cream vs Vanicream?", a: "Cetaphil contains parabens and propylene glycol — generally fine but more reactor-prone in true contact-allergy patients. Vanicream is the safer bet when sensitivity is severe." },
  ],
  sources: [
    { n: "Warshaw EM et al. NACDG patch test results. Dermatitis 2020.", w: "EPI" },
    { n: "Zirwas MJ et al. The role of moisturizers in contact dermatitis. JCMS 2019.", w: "REVIEW" },
    { n: "Vanicream allergen-screening dossier. 2022.", w: "MFR DATA" },
    { n: "Loden M. Effect of moisturizers on epidermal barrier function. Clin Dermatol 2012.", w: "REVIEW" },
  ],
};

const ProductVanicream: React.FC = () => <ProductTemplate d={D} />;
export default ProductVanicream;
