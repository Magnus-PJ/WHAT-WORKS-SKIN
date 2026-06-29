import React from "react";
import { ProductTemplate, ProductData } from "./_ProductTemplate";

const D: ProductData = {
  brand: "Dot & Key",
  productName: "Vitamin C+E Super Bright Serum",
  tagline: "underdosed, well-marketed.",
  category: "Actives",
  pageRef: "P. 28",
  filed: "22-APR-2026",
  reviewer: "Dr. Aanya Mehta",
  eyebrow: "Product · Active · Vitamin C",
  tier: "B",
  hero: "Pleasant texture, watermelon-led marketing, and a vitamin-C dose well below the 10% efficacy threshold. Won't hurt; won't really help with pigment either. Better entries exist at this price.",
  facts: [
    ["Format", "Serum, 30 mL"],
    ["Vitamin C", "Ethyl ascorbic acid ~ 5%"],
    ["Vitamin E", "Yes (low %)"],
    ["Fragrance", "Yes (watermelon)"],
    ["Price", "₹ 695 / 30 mL"],
    ["Pregnancy-safe", "Yes"],
  ],
  scoreBreakdown: [
    { k: "Active concentration", v: 13, max: 25, n: "~5% C derivative is below the 10% threshold for clinical brightening." },
    { k: "Vehicle elegance", v: 19, max: 25, n: "Pleasant gel-serum; absorbs cleanly under SPF." },
    { k: "Evidence per claim", v: 14, max: 25, n: "Brand cites generic vitamin C class data; not product-specific." },
    { k: "Value", v: 19, max: 25, n: "₹ 695 / 30 mL — average for the underdosed formula." },
  ],
  ingredients: [
    { i: "Ethyl ascorbic acid", role: "Vitamin C derivative", tier: "B", note: "Stable; converts to L-AA in skin. ~5% well below clinical dose." },
    { i: "Tocopherol", role: "Vit E antioxidant", tier: "A", note: "Standard adjunct." },
    { i: "Watermelon extract", role: "Marketing antioxidant", tier: "C", note: "Real but cosmetic-grade; mostly here for the brand." },
    { i: "Niacinamide (low %)", role: "Brightening adjunct", tier: "B", note: "Below the 4-5% dose-response threshold." },
    { i: "Fragrance", role: "—", tier: "C", note: "Pleasant but the most common cosmetic allergen." },
  ],
  useCases: [
    { k: "Brand-curious daily AM", b: "If you like the texture and the smell. Don't expect it to do the job of an L-AA serum." },
    { k: "Layering under SPF", b: "Pleasant base; doesn't pill." },
    { k: "Sample-size travel", b: "Compact 30 mL bottle." },
  ],
  alts: [
    { brand: "SkinCeuticals", name: "C E Ferulic", tier: "A", score: 91, note: "The reference; 15% L-AA + E + ferulic. Premium but the real thing." },
    { brand: "The Ordinary", name: "Ascorbic Acid 8% + Alpha Arbutin 2%", tier: "A", score: 78, note: "Closer-to-clinical dose at one-third the price." },
    { brand: "Minimalist", name: "Vitamin C 10% Face Serum", tier: "A", score: 76, note: "10% L-AA at the dose-response threshold; better choice in this price band." },
  ],
  faq: [
    { q: "Is ethyl ascorbic acid 'as good' as L-AA?", a: "Roughly half as potent on a per-percent basis in clinical comparisons. So this 5% formula is functionally equivalent to a 2-3% L-AA serum — well below clinical brightening dose." },
    { q: "Why a B tier, not C?", a: "The product is well-formulated for what it is — pleasant base, stable derivative, no actively misleading ingredients. Just don't pay clinical-active prices for cosmetic-grade results." },
    { q: "Should I switch?", a: "If pigment is your goal — yes. Minimalist 10% C or The Ordinary 8% + Arbutin will outperform at the same price." },
    { q: "Can I layer it with my retinoid?", a: "AM C, PM retinoid is the safer split. Same-routine layering is fine on tolerant skin but adds little." },
  ],
  sources: [
    { n: "Pinnell SR et al. Topical L-ascorbic acid: percutaneous absorption studies. Dermatol Surg 2001.", w: "MECHANISM" },
    { n: "Stamford NPJ. Stability, transdermal penetration, and cutaneous effects of ascorbic acid. JCD 2012.", w: "REVIEW" },
    { n: "Telang PS. Vitamin C in dermatology. Indian Dermatol Online J 2013.", w: "REVIEW" },
  ],
};

const ProductDotKeyVitC: React.FC = () => <ProductTemplate d={D} />;
export default ProductDotKeyVitC;
