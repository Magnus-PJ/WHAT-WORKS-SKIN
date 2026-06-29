import React from "react";
import { ProductTemplate, ProductData } from "./_ProductTemplate";

const D: ProductData = {
  brand: "The Derma Co",
  productName: "Cica Calming Cream",
  tagline: "marketing-heavy soothing.",
  category: "Wellness adjuncts",
  pageRef: "P. 32",
  filed: "22-APR-2026",
  reviewer: "Dr. Aanya Mehta",
  eyebrow: "Product · Wellness · Cica",
  tier: "C",
  hero: "Centella at trace levels in a pleasant glycerin-rich cream. The active dose is well below what the 'cica calming' label implies, and the rest is filler. Use it as a moisturiser, not a soothing treatment.",
  facts: [
    ["Format", "Cream, 50 g"],
    ["Centella asiatica", "0.5% extract"],
    ["Madecassoside", "Trace"],
    ["Fragrance", "Yes (light)"],
    ["Price", "₹ 599 / 50 g"],
    ["Pregnancy-safe", "Yes"],
  ],
  scoreBreakdown: [
    { k: "Active concentration", v: 11, max: 25, n: "0.5% Centella extract is below the threshold for measurable soothing." },
    { k: "Vehicle elegance", v: 18, max: 25, n: "Pleasant cream; spreads cleanly." },
    { k: "Evidence per claim", v: 12, max: 25, n: "Cica class evidence is real; this product not separately RCT'd." },
    { k: "Value", v: 19, max: 25, n: "₹ 599 / 50 g — average for the category, behind LRP Cicaplast value-per-active." },
  ],
  ingredients: [
    { i: "Centella asiatica extract 0.5%", role: "Soothing claim", tier: "B", note: "Below clinical threshold; supports formulation only." },
    { i: "Madecassoside (trace)", role: "Anti-inflammatory", tier: "C", note: "Real ingredient at trace levels." },
    { i: "Glycerin", role: "Humectant", tier: "A", note: "Workhorse — drives most measurable benefit." },
    { i: "Niacinamide (trace)", role: "Brightening adjunct", tier: "B", note: "Below dose-response threshold." },
    { i: "Fragrance", role: "—", tier: "C", note: "Negative for sensitive / cica-target users." },
  ],
  useCases: [
    { k: "Pleasant daily moisturiser", b: "Use it as a moisturiser, judge it as a moisturiser." },
    { k: "Mid-tier sensitive-skin trial", b: "Better than nothing; not as good as Cicaplast for actual soothing." },
    { k: "Brand-curious daily use", b: "If the texture suits you. Don't expect 'calming' beyond what glycerin delivers." },
  ],
  alts: [
    { brand: "La Roche-Posay", name: "Cicaplast Baume B5+", tier: "A", score: 82, note: "Real panthenol 5% + madecassoside dose; the reference cica balm." },
    { brand: "Dr.Jart+", name: "Cicapair Tiger Grass Cream", tier: "B", score: 75, note: "Higher Centella complex; richer formulation." },
    { brand: "CeraVe", name: "Moisturizing Cream", tier: "A", score: 88, note: "Skip the cica branding; get real ceramide repair instead." },
  ],
  faq: [
    { q: "Will it actually soothe my redness?", a: "Glycerin and the cream base reduce dryness-driven redness. The Centella is too low to do the heavy lifting the label implies. For real soothing, Cicaplast." },
    { q: "Why a C tier, not D?", a: "It won't harm you. It just isn't the cica that's working. C tier is reserved for products where marketing exceeds formula but no harmful claim is made." },
    { q: "Better Indian alternates?", a: "At ₹ 600: try Plum Hello Aloe Caringly Hydrating Day Cream. At ₹ 1,400: jump to Cicaplast or CeraVe Cream. The middle isn't where this sub-category shines." },
    { q: "Daily use OK?", a: "Yes — the base is benign. Just don't pay 'soothing treatment' prices for moisturiser benefits." },
  ],
  sources: [
    { n: "Bylka W et al. Centella asiatica in cosmetology. Adv Dermatol Allergol 2013.", w: "REVIEW" },
    { n: "Hashim PW et al. Topical centella in scar management. JCD 2017.", w: "REVIEW" },
    { n: "Surber C, Davis AF. Bioavailability of dermatological formulations. CRC Press 2011.", w: "TEXTBOOK" },
  ],
};

const ProductDermaCoCica: React.FC = () => <ProductTemplate d={D} />;
export default ProductDermaCoCica;
