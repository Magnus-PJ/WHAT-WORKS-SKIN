import React from "react";
import { ProductTemplate, ProductData } from "./_ProductTemplate";

const D: ProductData = {
  brand: "La Roche-Posay",
  productName: "Toleriane Double Repair",
  tagline: "the niacinamide ceramide cream.",
  category: "Moisturisers",
  pageRef: "P. 23",
  filed: "22-APR-2026",
  reviewer: "Dr. Aanya Mehta",
  eyebrow: "Product · Moisturiser · Daily",
  tier: "A",
  hero: "LRP's bid to dethrone CeraVe Cream: ceramide-3, niacinamide, glycerin, prebiotic thermal water, in a lighter texture than CeraVe but a slightly higher price. For combination-to-dry skin in humid climates, often the better daily choice.",
  facts: [
    ["Format", "Cream, 75 mL"],
    ["Niacinamide", "~ 2-4% (formulation grade)"],
    ["Ceramide-3", "Single ceramide"],
    ["Prebiotic thermal water", "Yes"],
    ["Price", "₹ 1,800 / 75 mL"],
    ["Pregnancy-safe", "Yes"],
  ],
  scoreBreakdown: [
    { k: "Barrier support", v: 21, max: 25, n: "Single ceramide vs CeraVe's 3 — slightly less depth." },
    { k: "Niacinamide bonus", v: 22, max: 25, n: "Real anti-pigment / barrier benefit at 2-4%." },
    { k: "Cosmetic elegance", v: 23, max: 25, n: "Lighter than CeraVe Cream; spreads cleanly under SPF." },
    { k: "Value", v: 17, max: 25, n: "₹ 1,800 / 75 mL — premium against CeraVe / Cetaphil." },
  ],
  ingredients: [
    { i: "Niacinamide", role: "Barrier / pigment", tier: "A", note: "Active dose; supports the daily-cream claim." },
    { i: "Ceramide-3 (NP)", role: "Barrier lipid", tier: "A", note: "Matches stratum corneum dominant ceramide." },
    { i: "Glycerin", role: "Humectant", tier: "A", note: "High % carrier." },
    { i: "Shea butter", role: "Emollient", tier: "A", note: "Soft occlusive; non-comedogenic at this dose." },
    { i: "Prebiotic thermal water", role: "Microbiome support", tier: "B", note: "Real but small effect on skin microbiota." },
  ],
  useCases: [
    { k: "Combination-to-dry daily moisturiser", b: "Especially in humid climates where CeraVe Cream feels heavy." },
    { k: "Pigment-prone skin", b: "Niacinamide adds a real (small) anti-pigment bonus to your routine." },
    { k: "Maintenance after barrier repair", b: "Once you've moved past Cicaplast / Vanicream, this is the daily." },
  ],
  alts: [
    { brand: "CeraVe", name: "Moisturizing Cream", tier: "A", score: 88, note: "More ceramide depth; heavier feel." },
    { brand: "Vanicream", name: "Daily Facial Moisturizer", tier: "A", score: 82, note: "Allergen-screened alternate for very sensitive skin." },
    { brand: "Neutrogena", name: "Hydro Boost Water Gel", tier: "B", score: 70, note: "Lighter alternate for oily skin; thinner barrier support." },
  ],
  faq: [
    { q: "Toleriane Sensitive vs Toleriane Double Repair?", a: "Sensitive is thinner, fragrance-free baseline (no niacinamide). Double Repair adds niacinamide and ceramides for daily moisturiser duty. Pick by need: bare baseline → Sensitive; daily workhorse → Double Repair." },
    { q: "Will it pill under sunscreen?", a: "Less than most. Apply a moderate dose, wait 60-90 seconds, then SPF. The cream phase sets enough to layer cleanly." },
    { q: "Suitable for acne-prone skin?", a: "Yes for adult acne with dry undertones. For very oily teen acne, switch to LRP Effaclar Mat." },
    { q: "Why pay 40% more than CeraVe Cream?", a: "Cosmetic elegance, daily-wear texture, and the niacinamide bonus. If you find CeraVe Cream too heavy or you want the niacinamide bundled in, the premium is fair." },
  ],
  sources: [
    { n: "Soma Y et al. Niacinamide in barrier repair. Br J Dermatol 2005.", w: "RCT" },
    { n: "Lynde CW et al. Ceramides as moisturizers. JCMS 2019.", w: "REVIEW" },
    { n: "LRP Toleriane dossier — in vivo TEWL data. 2022.", w: "MFR DATA" },
    { n: "Hakozaki T et al. Niacinamide in pigmentation. BJD 2002.", w: "MECHANISM" },
  ],
};

const ProductLRPToleriane: React.FC = () => <ProductTemplate d={D} />;
export default ProductLRPToleriane;
