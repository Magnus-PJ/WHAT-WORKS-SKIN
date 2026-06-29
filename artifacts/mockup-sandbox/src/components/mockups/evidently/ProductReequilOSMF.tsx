import React from "react";
import { ProductTemplate, ProductData } from "./_ProductTemplate";

const D: ProductData = {
  brand: "Re'equil",
  productName: "Oxybenzone & OMC Free SPF 50",
  tagline: "the budget hero.",
  category: "Sun protection",
  pageRef: "P. 15",
  filed: "22-APR-2026",
  reviewer: "Dr. Aanya Mehta",
  eyebrow: "Product · Sun protection · Budget pick",
  tier: "B",
  hero: "₹ 595 buys a clean filter system, no oxybenzone, no octinoxate, and a moderate PPD that beats most of the price tier. Not a long-UVA hero, but the best-in-class daily for under ₹ 700.",
  facts: [
    ["Format", "Lotion, 50 g"],
    ["UVA-PF (PPD)", "~ 22"],
    ["SPF", "50"],
    ["Filter system", "Tinosorb S + Uvinul A Plus + zinc oxide"],
    ["Price", "₹ 595 / 50 g"],
    ["Pregnancy-safe", "Yes"],
  ],
  scoreBreakdown: [
    { k: "UVA-PF / SPF balance", v: 16, max: 25, n: "PPD ~22 — solid for the price, but a step behind premium." },
    { k: "Filter cleanliness", v: 22, max: 25, n: "No oxybenzone, no octinoxate, no controversy." },
    { k: "Cosmetic elegance", v: 16, max: 25, n: "Slight white cast on deeper skin; lighter than older Indian SPFs." },
    { k: "Value", v: 24, max: 25, n: "₹ 595 / 50 g is exceptional for the formula quality." },
  ],
  ingredients: [
    { i: "Tinosorb S", role: "Broad-spectrum", tier: "A", note: "Photostable EU filter — a real upgrade for the price band." },
    { i: "Uvinul A Plus", role: "Long-UVA", tier: "A", note: "Pure UVA support. Stabilises the system." },
    { i: "Zinc oxide", role: "Mineral filter", tier: "A", note: "Adds visible-light protection at modest concentration." },
    { i: "Glycerin", role: "Humectant", tier: "A", note: "Workhorse. Cheap, effective." },
    { i: "Tocopherol", role: "Antioxidant", tier: "B", note: "Standard-issue vitamin E adjunct." },
  ],
  useCases: [
    { k: "Student / first-job budgets", b: "Real EU filters at one-third the price of LRP." },
    { k: "Family bathroom SPF", b: "Big 50 g size; safe for teenage acne-prone skin." },
    { k: "Indian daily commute", b: "Decent reapplication tolerance over morning oils." },
  ],
  alts: [
    { brand: "La Roche-Posay", name: "Anthelios UVMune 400 SPF 50+", tier: "A", score: 89, note: "If budget allows, the long-UVA upgrade is real." },
    { brand: "Minimalist", name: "Multi-Vitamin SPF 50", tier: "B", score: 68, note: "Comparable filters; thinner UVA evidence." },
    { brand: "Dot & Key", name: "Vit C + E SPF 50", tier: "C", score: 60, note: "Marketing-led; underdosed actives." },
  ],
  faq: [
    { q: "Is it 'just as good' as LRP?", a: "On filter quality — close. On UVA-PF — no, premium long-UVA SPFs sit in a different league. For 30%+ less money you get 70% of the protection. That's a great trade for daily commute use." },
    { q: "Why no oxybenzone or octinoxate?", a: "Both are functional UV filters but oxybenzone has the highest contact-allergen rate in clinical practice and octinoxate is photo-unstable. Re'equil's choice to leave them out is sensible, not marketing fluff." },
    { q: "Will it whitecast on Type V-VI skin?", a: "Slight cast at full SPF dose (2 mg/cm²). Less than older mineral-heavy Indian SPFs but more than tinted European fluids. Buff with a damp sponge after 60 seconds." },
    { q: "Reapplication?", a: "Every 3 hours outdoors. Indoors, once at noon is fine. Don't reapply over makeup — you'll smear filters; instead use an SPF mist." },
  ],
  sources: [
    { n: "Re'equil clinical dossier, in vivo SPF 50 / PPD 22. 2022.", w: "MFR DATA" },
    { n: "Lim HW et al. UVA filter benchmarking. JID 2017.", w: "REVIEW" },
    { n: "Schauder S, Ippen H. Contact and photocontact sensitivity to oxybenzone. Contact Derm 1997.", w: "EPI" },
    { n: "Sambandan DR, Ratner D. Sunscreens: an overview. JAAD 2011.", w: "REVIEW" },
  ],
};

const ProductReequilOSMF: React.FC = () => <ProductTemplate d={D} />;
export default ProductReequilOSMF;
