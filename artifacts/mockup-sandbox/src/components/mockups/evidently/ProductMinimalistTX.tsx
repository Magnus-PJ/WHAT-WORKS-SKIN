import React from "react";
import { ProductTemplate, ProductData } from "./_ProductTemplate";

const D: ProductData = {
  brand: "Minimalist",
  productName: "Tranexamic 03%",
  tagline: "the melasma adjunct, real.",
  category: "Actives",
  pageRef: "P. 27",
  filed: "22-APR-2026",
  reviewer: "Dr. Aanya Mehta",
  eyebrow: "Product · Active · Tranexamic acid",
  tier: "A",
  hero: "One of the few Indian-priced products that delivers a real clinical-grade dose of tranexamic acid (3%). Pairs with niacinamide and HEPES as a thoughtful melasma-adjunct serum. Not a replacement for oral TXA in resistant cases — but a serious topical option.",
  facts: [
    ["Format", "Serum, 30 mL"],
    ["Tranexamic acid", "3%"],
    ["Niacinamide", "2%"],
    ["HEPES", "Yes (gentle exfoliant)"],
    ["Price", "₹ 700 / 30 mL"],
    ["Pregnancy-safe", "Yes (topical)"],
  ],
  scoreBreakdown: [
    { k: "Active concentration", v: 22, max: 25, n: "3% TXA is the clinically validated topical sweet spot." },
    { k: "Adjunct stack", v: 20, max: 25, n: "Niacinamide + HEPES make this more than a single-active serum." },
    { k: "Evidence per claim", v: 19, max: 25, n: "TXA class evidence is solid; product itself not RCT'd." },
    { k: "Value", v: 23, max: 25, n: "₹ 700 / 30 mL — exceptional for the active depth." },
  ],
  ingredients: [
    { i: "Tranexamic acid 3%", role: "Anti-pigment", tier: "A", note: "Inhibits plasmin-mediated melanogenesis." },
    { i: "Niacinamide 2%", role: "Pigment / barrier", tier: "A", note: "Synergistic with TXA in melasma." },
    { i: "HEPES", role: "Buffered exfoliant", tier: "B", note: "Mild keratolytic; supports actives' delivery." },
    { i: "Glycerin", role: "Humectant", tier: "A", note: "Workhorse." },
    { i: "Sodium hyaluronate", role: "Humectant", tier: "B", note: "Surface hydrator." },
  ],
  useCases: [
    { k: "Melasma maintenance", b: "PM after barrier moisturiser. Pairs with daily Mexoryl-class SPF." },
    { k: "PIH from acne", b: "Particularly Type IV-V skin where Hydroquinone is over-aggressive." },
    { k: "Pregnancy melasma", b: "Topical TXA is a rare safe option in pregnancy when most pigment actives are off the table." },
  ],
  alts: [
    { brand: "SkinCeuticals", name: "Discoloration Defense", tier: "A", score: 81, note: "TXA + kojic + HEPES; heavily marketed, much higher price." },
    { brand: "The Inkey List", name: "Tranexamic Acid Overnight Treatment", tier: "B", score: 72, note: "Lower TXA dose; cheaper alternate." },
    { brand: "Dot & Key", name: "10% Niacinamide + Tranexamic", tier: "B", score: 70, note: "Lower TXA; niacinamide-led. Indian alternate." },
  ],
  faq: [
    { q: "Topical TXA vs oral?", a: "Oral TXA (250-500 mg BD, dermatologist supervised) outperforms topical for moderate-severe melasma. Topical is the safer first-line and the maintenance option after oral." },
    { q: "How long until I see a result?", a: "8-12 weeks for visible change. Photograph month 0, 1, 2, 3 in identical light. Without measurement, your eyes lie about pigment." },
    { q: "Layer with vitamin C?", a: "Yes — C in AM, TXA in PM. Or both in the same routine if your skin tolerates them; TXA after C." },
    { q: "Pregnancy / breastfeeding?", a: "Topical TXA at this dose is generally considered safe in pregnancy — but always confirm with your OB. Oral TXA in pregnancy is contraindicated." },
  ],
  sources: [
    { n: "Bala HR et al. Topical tranexamic acid in melasma. JEADV 2018.", w: "META" },
    { n: "Kim SJ et al. Efficacy and safety of topical TXA. Acta Derm Venereol 2017.", w: "RCT" },
    { n: "Tse TW, Hui E. Tranexamic acid: an important adjuvant in melasma. JCD 2013.", w: "REVIEW" },
    { n: "Minimalist TXA dossier. 2023.", w: "MFR DATA" },
  ],
};

const ProductMinimalistTX: React.FC = () => <ProductTemplate d={D} />;
export default ProductMinimalistTX;
