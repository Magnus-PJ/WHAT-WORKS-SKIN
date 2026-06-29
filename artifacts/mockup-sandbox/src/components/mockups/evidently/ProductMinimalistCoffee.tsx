import React from "react";
import { ProductTemplate, ProductData } from "./_ProductTemplate";

const D: ProductData = {
  brand: "Minimalist",
  productName: "Coffee 1% Cleanser",
  tagline: "marketing dressed as evidence.",
  category: "Cleansers",
  pageRef: "P. 20",
  filed: "22-APR-2026",
  reviewer: "Dr. Aanya Mehta",
  eyebrow: "Product · Cleanser · Trend pick",
  tier: "C",
  hero: "Coffee at 1% is too low to do anything mechanically (no scrub) and far too low to deliver meaningful caffeine to skin. The cleanser base is ordinary; the brand name is the active ingredient. There are better picks at the same price.",
  facts: [
    ["Format", "Foaming gel, 100 mL"],
    ["pH", "5.5"],
    ["Coffee", "1% (decorative)"],
    ["Surfactant", "Sodium cocoyl isethionate"],
    ["Price", "₹ 350 / 100 mL"],
    ["Pregnancy-safe", "Yes"],
  ],
  scoreBreakdown: [
    { k: "Surfactant gentleness", v: 17, max: 25, n: "Mild blend, but no remarkable barrier protection." },
    { k: "Active claim integrity", v: 8, max: 25, n: "1% coffee in a rinse-off is a graphics decision, not a formula." },
    { k: "pH alignment", v: 21, max: 25, n: "5.5 — at least the basics are right." },
    { k: "Value", v: 12, max: 25, n: "₹ 350 / 100 mL — equal to better-formulated peers." },
  ],
  ingredients: [
    { i: "Sodium cocoyl isethionate", role: "Mild surfactant", tier: "A", note: "Solid surfactant choice — the one bright spot." },
    { i: "Coffee extract 1%", role: "Marketing active", tier: "C", note: "Caffeine penetration in a 30s rinse-off is negligible." },
    { i: "Glycerin", role: "Humectant", tier: "A", note: "Standard issue. Cheap and effective." },
    { i: "Niacinamide (trace)", role: "Formulation support", tier: "B", note: "Below dose-response threshold." },
    { i: "Hyaluronic acid (trace)", role: "Marketing humectant", tier: "C", note: "Negligible in a rinse-off." },
  ],
  useCases: [
    { k: "Pleasant daily cleanse", b: "If you like the smell and the price. Evidence — none beyond a clean base." },
    { k: "Brand-curious users", b: "Use it as a gentle daily cleanser. Don't expect the coffee to do anything." },
    { k: "Sample-sized travel use", b: "100 mL packs well. That's the only real edge." },
  ],
  alts: [
    { brand: "CeraVe", name: "Foaming Facial Cleanser", tier: "A", score: 84, note: "Roughly 3× the price but built around real ceramide complex." },
    { brand: "Cetaphil", name: "Gentle Skin Cleanser", tier: "A", score: 82, note: "Sensitive-skin baseline, decades of evidence." },
    { brand: "Re'equil", name: "Oil Free Face Wash", tier: "B", score: 70, note: "Indian-priced alternative with real SA / zinc." },
  ],
  faq: [
    { q: "Doesn't caffeine do something for puffiness?", a: "Yes — when applied as a leave-on at 3-5%, with hours of contact. In a 30-second rinse-off at 1%, it does nothing." },
    { q: "Is it a bad cleanser?", a: "No — the base is fine. It just isn't the coffee that's working; it's the same surfactant blend you'd buy elsewhere for less." },
    { q: "Why a C tier, not D?", a: "Because the formula won't harm your skin. D is reserved for products that actively mislead with potentially harmful claims (e.g. plant stem cells)." },
    { q: "Better Indian alternates?", a: "At ₹ 300-400: Plum Green Tea Pore Cleansing Face Wash. At ₹ 500-700: CeraVe / Cetaphil. Both deliver more for the rupee." },
  ],
  sources: [
    { n: "Herman A, Herman AP. Caffeine's mechanisms of action. Skin Pharmacol Physiol 2013.", w: "REVIEW" },
    { n: "Otberg N et al. Topical penetration kinetics of caffeine. Int J Cosm Sci 2008.", w: "MECHANISM" },
    { n: "Surber C, Davis AF. Bioavailability and bioequivalence of dermatological formulations. CRC Press 2011.", w: "TEXTBOOK" },
  ],
};

const ProductMinimalistCoffee: React.FC = () => <ProductTemplate d={D} />;
export default ProductMinimalistCoffee;
