// IngredientHyaluronic — full ingredient brief for hyaluronic acid.
import React from "react";
import { IngredientBrief, type IngredientBriefData } from "./_IngredientBrief";

export const data: IngredientBriefData = {
  slug: "hyaluronic-acid",
  name: "Hyaluronic acid",
  number: "14 / 28",
  filed: "14 APR 2026",
  eyebrowKicker: "Ingredient · Glycosaminoglycan · Hyaluronic",
  tier: "A",
  headlineSize: 100,
  tagline: { italic: "Real, useful, and", rest: "comprehensively oversold." },
  lead:
    "A genuine humectant that draws and holds water in the upper skin layers. The effect is real — and it is also surface-level, dose-modest, and entirely dependent on the humidity of the room you are standing in. Worth using; not worth deifying.",
  atGlance: [
    ["INCI", "Sodium hyaluronate / Hyaluronic acid"],
    ["Family", "Glycosaminoglycan (GAG)"],
    ["Useful range", "0.1 – 2.0% blended weights"],
    ["Vehicle", "Aqueous serum"],
    ["Pregnancy-safe", "Yes"],
    ["Photo-stable", "Yes"],
    ["Reviewer", "Dr. Paul · 14-Apr-2026"],
  ],
  toc: [
    ["01", "What it is"],
    ["02", "Mechanism"],
    ["03", "Evidence overview"],
    ["04", "Molecular weight matters"],
    ["05", "Where it earns its tier"],
    ["06", "Pairings & conflicts"],
    ["07", "On our shelf"],
    ["08", "FAQ"],
  ],
  whatItIs: {
    dropCap: "H",
    title: { plain: "What hyaluronic acid", italic: "actually is." },
    body:
      "yaluronic acid is a glycosaminoglycan — a long sugar polymer your dermis produces in volume — that binds many times its own weight in water. Topical HA does not refill that dermal reservoir; molecular weight prevents it. What topical HA does, well, is hold water at the corneocyte surface, plump the upper stratum corneum visibly within minutes, and make almost any active feel less harsh on the way in.",
    body2:
      "That is a useful, modest, replicable cosmetic effect. It is not anti-aging in any meaningful sense, it does not 'rebuild,' and it does not survive a dry environment without an occlusive layer above it.",
  },
  mechanism: [
    { k: "Surface hydration", b: "Binds atmospheric and applied water at the stratum corneum. Visible plumping in minutes." },
    { k: "Vehicle for actives", b: "Functions as a delivery medium that improves the comfort of harsher actives applied alongside." },
    { k: "Barrier stabilisation", b: "Mild TEWL reduction, particularly when sealed by an occlusive moisturiser." },
  ],
  evidence: [
    { c: "Surface hydration", n: "Bioengineering", w: "82%", note: "Reproducibly increases stratum-corneum water content within 30 minutes." },
    { c: "Plumping (cosmetic)", n: "Self-reported VAS", w: "78%", note: "Almost universally noticed; effect washes out by next morning if not occluded." },
    { c: "Wrinkles / collagen", n: "Insufficient", w: "20%", note: "Topical HA does not reach the dermis. Cosmetic only." },
    { c: "Dehydrated-skin tightness", n: "RCTs vs vehicle", w: "70%", note: "Real and rapid relief; pair with ceramides for durability." },
  ],
  concentration: [
    { c: "0.1 – 0.5%", v: "Standard", b: "Most aqueous serums live here. Effect is qualitative, not dose-dependent." },
    { c: "Multi-MW blends", v: "Premium serums", b: "Mix of high, medium, and low-MW HA for layered hydration." },
    { c: "Cross-linked", v: "Polymer films", b: "Forms a thin film that holds hydration through the morning." },
    { c: "Injectable HA", v: "Clinical only", b: "Different category entirely. Not what is in the bottle." },
  ],
  pairings: [
    { with: "Ceramide moisturiser", verdict: "Mandatory", note: "HA without an occlusive seal evaporates and may pull moisture from below in dry air. Always cap.", ok: true },
    { with: "Niacinamide", verdict: "Excellent", note: "Layer freely; complementary surface and barrier effects.", ok: true },
    { with: "Vitamin C", verdict: "Compatible", note: "C first, HA second. HA buffers the C vehicle.", ok: true },
    { with: "Retinoids", verdict: "Excellent", note: "HA before retinoid blunts onboarding sting; safe and helpful.", ok: true },
    { with: "Cold dry climate use alone", verdict: "Wait", note: "HA without a moisturiser on top will not survive winter air. Always seal.", ok: false },
  ],
  products: [
    { brand: "The Ordinary", name: "Hyaluronic Acid 2% + B5", tier: "A", score: 84, note: "Reference cheap entry. Multi-MW blend, honest dose." },
    { brand: "La Roche-Posay", name: "Hyalu B5 Serum", tier: "A", score: 86, note: "Premium HA + panthenol. Vehicle work makes the difference." },
    { brand: "Minimalist", name: "Hyaluronic + PGA 2%", tier: "B", score: 78, note: "Indian market staple. Solid dose, fair price." },
    { brand: "Hada Labo", name: "Gokujyun Hyaluronic Lotion", tier: "A", score: 82, note: "The Japanese reference. Lotion-format, perfect first layer." },
  ],
  faq: [
    { q: "Will hyaluronic acid plump my wrinkles?", a: "It plumps your stratum corneum, which makes fine lines look softer for a few hours. Topical HA does not reach the dermis. Injectable HA is a different category entirely." },
    { q: "Why does my skin feel drier after using it?", a: "Low humidity. In dry air, HA can pull water from your skin instead of from the atmosphere. Always seal with a ceramide moisturiser." },
    { q: "How many HA layers should I use?", a: "One thin layer on damp skin, sealed by a moisturiser. The 'seven-skin method' is theatre; the second layer is mostly evaporating." },
    { q: "Is it the same as the filler?", a: "Same molecule, fundamentally different application. Filler is cross-linked HA injected into the dermis. Topical HA never gets past the epidermis." },
  ],
};

const IngredientHyaluronic: React.FC = () => <IngredientBrief data={data} />;
export default IngredientHyaluronic;
