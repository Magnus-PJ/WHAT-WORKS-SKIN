import React from "react";
import { ProductTemplate, ProductData } from "./_ProductTemplate";

const D: ProductData = {
  brand: "CeraVe",
  productName: "Foaming Facial Cleanser",
  tagline: "the daily workhorse.",
  category: "Cleansers",
  pageRef: "P. 17",
  filed: "22-APR-2026",
  reviewer: "Dr. Aanya Mehta",
  eyebrow: "Product · Cleanser · Foaming",
  tier: "A",
  hero: "The reference foaming cleanser for normal-to-oily and combination skin. Ceramides + niacinamide in a pH-balanced base, with the lowest irritation index in the price tier. Boring, replicable, gold-standard.",
  facts: [
    ["Format", "Foaming gel, 236 / 473 mL"],
    ["pH", "5.5 (skin-matched)"],
    ["Ceramide complex", "1, 3, 6-II"],
    ["Niacinamide", "Trace, formulation-supportive"],
    ["Price", "₹ 950 / 236 mL"],
    ["Pregnancy-safe", "Yes"],
  ],
  scoreBreakdown: [
    { k: "Surfactant gentleness", v: 22, max: 25, n: "Cocamidopropyl betaine + soft anionics. Non-stripping." },
    { k: "Barrier-supportive base", v: 22, max: 25, n: "Ceramide complex + MVE delivery — rare in a foaming cleanser." },
    { k: "pH alignment", v: 23, max: 25, n: "5.5 keeps acid-mantle integrity intact." },
    { k: "Value", v: 17, max: 25, n: "₹ 950 fair internationally; pricey vs Indian baseline." },
  ],
  ingredients: [
    { i: "Cocamidopropyl betaine", role: "Mild amphoteric surfactant", tier: "A", note: "Workhorse mild surfactant. Low-strip cleansing." },
    { i: "Ceramide NP / AP / EOP", role: "Barrier lipids", tier: "A", note: "Three-ceramide complex matches stratum corneum ratio." },
    { i: "Niacinamide", role: "Barrier / oil control", tier: "A", note: "Trace dose; supports formulation tolerability." },
    { i: "Hyaluronic acid", role: "Humectant", tier: "B", note: "Modest in a rinse-off product but real." },
    { i: "MVE delivery system", role: "Slow-release vehicle", tier: "B", note: "CeraVe's trademark — extends ceramide deposition slightly." },
  ],
  useCases: [
    { k: "Daily AM cleanser", b: "For normal-to-oily skin. PM after sunscreen and the day's grime." },
    { k: "Acne-prone skin", b: "Non-stripping; pairs cleanly with adapalene or BPO without rebound oil." },
    { k: "Post-procedure recovery", b: "Day 4+ after laser or peels — gentle enough, deep enough." },
  ],
  alts: [
    { brand: "Cetaphil", name: "Gentle Skin Cleanser", tier: "A", score: 82, note: "Lotion, not foaming. Drier-skin alternate." },
    { brand: "La Roche-Posay", name: "Effaclar Foaming Gel", tier: "A", score: 80, note: "Salicylic-touched alternate for oilier skin." },
    { brand: "Sebamed", name: "Clear Face Cleansing Foam", tier: "B", score: 71, note: "pH 5.5; weaker barrier complex." },
  ],
  faq: [
    { q: "Will it dry out my skin?", a: "Almost never. The surfactant blend is one of the gentlest at this foaming intensity. If your skin feels tight after, you've over-cleansed (twice in <12 hours, or with hot water)." },
    { q: "Is the niacinamide dose meaningful?", a: "It's formulation-grade — supports tolerability and trace barrier benefit. For real niacinamide therapy, layer a 5% serum after." },
    { q: "Can I use it twice daily?", a: "Yes. AM with water, PM with hands — neither requires a Clarisonic-style brush. The brush adds irritation, not benefit." },
    { q: "Hydrating Cleanser vs Foaming — which?", a: "Hydrating for dry / sensitive / mature; Foaming for normal-to-oily / acne-prone. Same family, picked by skin oil baseline, not season." },
  ],
  sources: [
    { n: "Draelos ZD et al. Ceramide-based cleansers in barrier repair. JDD 2018.", w: "RCT" },
    { n: "Mukhopadhyay P. pH and the acid mantle. Indian J Dermatol 2011.", w: "REVIEW" },
    { n: "CeraVe formulation dossier — MVE delivery. 2020.", w: "MFR DATA" },
    { n: "Ananthapadmanabhan KP et al. Surfactant-induced skin damage. Int J Cosm Sci 2004.", w: "MECHANISM" },
  ],
};

const ProductCeraVeFoam: React.FC = () => <ProductTemplate d={D} />;
export default ProductCeraVeFoam;
