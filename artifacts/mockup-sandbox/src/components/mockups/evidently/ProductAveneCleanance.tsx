import React from "react";
import { ProductTemplate, ProductData } from "./_ProductTemplate";

const D: ProductData = {
  brand: "Avene",
  productName: "Cleanance SPF 50+",
  tagline: "the matte oily-skin daily.",
  category: "Sun protection",
  pageRef: "P. 16",
  filed: "22-APR-2026",
  reviewer: "Dr. Aanya Mehta",
  eyebrow: "Product · Sun protection · Mattifying",
  tier: "B",
  hero: "Avène's mattifying SPF for oily and acne-prone skin. The finish is the win — silica-led, genuinely matte, comfortable through a tropical day. UVA-PF is mid-pack; don't expect it to outperform UVMune on photoprotection.",
  facts: [
    ["Format", "Mattifying fluid, 50 mL"],
    ["UVA-PF (PPD)", "~ 25"],
    ["SPF", "50+"],
    ["Finish", "Matte, silica-mediated"],
    ["Price", "₹ 1,500 / 50 mL"],
    ["Pregnancy-safe", "Yes"],
  ],
  scoreBreakdown: [
    { k: "UVA-PF / SPF balance", v: 17, max: 25, n: "PPD ~25 — average. Below long-UVA premium SPFs." },
    { k: "Mattifying finish", v: 23, max: 25, n: "Best-in-class silica + perlite mattifier. No mid-day shine." },
    { k: "Acne-friendly base", v: 21, max: 25, n: "Non-comedogenic. Tested in seborrheic skin trials." },
    { k: "Value", v: 13, max: 25, n: "₹ 1,500 for moderate PPD is steep." },
  ],
  ingredients: [
    { i: "Tinosorb S", role: "Broad-spectrum", tier: "A", note: "Photostable EU filter." },
    { i: "Uvinul A Plus", role: "UVA filter", tier: "A", note: "Pure UVA support." },
    { i: "Octocrylene", role: "UVB / stabiliser", tier: "B", note: "Photo-stabilises but contact-allergen risk in some patients." },
    { i: "Silica / perlite", role: "Mattifier", tier: "A", note: "Real oil-absorbing capacity at the dosage used." },
    { i: "Avène thermal water", role: "Soothing carrier", tier: "C", note: "Marketing centerpiece. Real bottling, modest skin benefit." },
  ],
  useCases: [
    { k: "Acne-prone Type IV-V skin", b: "Matte finish through humid days; no acne-pore impact in 12-week trials." },
    { k: "Under makeup", b: "Best primer-finish SPF in this catalogue. Foundation grips well." },
    { k: "Mid-day reapplication via mist or stick", b: "Doesn't disturb the matte base." },
  ],
  alts: [
    { brand: "La Roche-Posay", name: "Effaclar Duo SPF 50+", tier: "A", score: 81, note: "Salicylic-touched alternate; comparable matte." },
    { brand: "Vichy", name: "Capital Soleil UV-Age Daily SPF 50+", tier: "A", score: 86, note: "Higher PPD; less matte. For pigment-prone oily skin." },
    { brand: "Re'equil", name: "Sebum Control Sunscreen SPF 50", tier: "B", score: 73, note: "Budget mattifier; cast slightly more visible." },
  ],
  faq: [
    { q: "Will it actually stay matte through the day?", a: "Through 6-8 hours of moderate humidity, yes. By hour 9 you'll need to blot — but you won't need to reapply the SPF, just touch up the shine." },
    { q: "Octocrylene — is it a problem?", a: "It's a real but uncommon allergen. If you've reacted to sunscreens before, look for one without it (Re'equil OSMF). For most skin, no issue." },
    { q: "Can I use it after AM tretinoin?", a: "Yes — Avène's anti-irritant base tolerates retinoid-thinned skin. Wait 20 minutes after the tret to apply." },
    { q: "Pore-clogging?", a: "Tested non-comedogenic in seborrheic skin. The silica is inert; the filters are non-comedogenic. If your acne flares, the trigger isn't here." },
  ],
  sources: [
    { n: "Avène clinical dossier, in vivo PPD/SPF for Cleanance Solaire. 2023.", w: "MFR DATA" },
    { n: "Draelos ZD. Cosmeceuticals for sebum control. Dermatol Ther 2008.", w: "REVIEW" },
    { n: "Bryden AM et al. Contact allergy to octocrylene. BJD 2006.", w: "EPI" },
    { n: "Surber C et al. Sunscreen vehicle and acne. JEADV 2018.", w: "REVIEW" },
  ],
};

const ProductAveneCleanance: React.FC = () => <ProductTemplate d={D} />;
export default ProductAveneCleanance;
