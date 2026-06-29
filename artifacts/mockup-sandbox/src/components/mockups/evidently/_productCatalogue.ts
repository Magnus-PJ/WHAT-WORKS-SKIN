// Canonical product catalogue.
//
// Single source of truth for the rows the search registry surfaces in
// the header overlay and for the cross-link helpers in `_links.tsx`
// that resolve "On our shelf" cards back to a reviewed product page or
// outbound brand link.
//
// Detail-page resolution and brief-entry matching helpers live in
// `_links.tsx` (which imports `PRODUCTS` from here) — the catalogue
// stays slug-keyed and free of presentational helpers so it can be
// safely imported from anywhere without pulling in chrome / theme
// code. `_links.tsx` re-exports `PRODUCTS` for back-compat.

import type { Tier } from "./_links";

// ─────────────────────────────────────────────────────────────────────
// Product catalogue. Each entry lists the ingredients that should
// resolve to an ingredient brief (so the "Found in" sections on
// ingredient pages can list this product).
//
// Most entries are reviewed products with a `component` page. Entries
// without a `component` represent products that appear on ingredient
// briefs' "On our shelf" lists but don't have an internal review yet —
// they carry a `purchaseUrl` so shelf cards can still link out to the
// brand or a retailer instead of being inert.
// ─────────────────────────────────────────────────────────────────────
export type ProductEntry = {
  /** Component name (without .tsx) for the product's review page.
   *  Absent for catalogue entries that exist only to provide an
   *  outbound purchase link from "On our shelf" cards. */
  component?: string;
  brand: string;
  name: string;
  /** Alternate names this product is known by — used so a brief's
   *  shelf entry can resolve to the catalogue entry even when the
   *  wording differs (e.g. "Differin Gel 0.1%" → "Adapalene 0.1% Gel
   *  (Differin)"). Matched on the same normalised exact-match path. */
  aliases?: string[];
  /** Tier rating. Required for reviewed products; omitted for
   *  unreviewed entries that only carry a purchase URL. */
  tier?: Tier;
  /** Raw ingredient strings as displayed in the product's formula
   *  table. Only present for reviewed products. */
  ingredients?: string[];
  /** Optional outbound URL (brand site or retailer). Used as a
   *  fallback when there's no `component` review to link to. */
  purchaseUrl?: string;
};

export const PRODUCTS: ProductEntry[] = [
  { component: "ProductDetail", brand: "La Roche-Posay", name: "Anthelios UVMune 400 Invisible Fluid SPF 50+", tier: "A",
    ingredients: ["Mexoryl 400 (MBBT-derivative)","Tinosorb S (Bemotrizinol)","Tinosorb M (Bisoctrizole)","Uvinul A Plus","Uvinul T 150","Mexoryl SX (Ecamsule)","Glycerin","Tocopherol (Vit E)"] },
  { component: "ProductCEFerulic", brand: "SkinCeuticals", name: "C E Ferulic", tier: "A",
    ingredients: ["L-ascorbic acid 15%","Tocopherol (Vit E) 1%","Ferulic acid 0.5%","Triethanolamine","Phenoxyethanol"] },
  { component: "ProductTretinoin", brand: "Generic (Rx)", name: "Tretinoin 0.025% / 0.05% Cream", tier: "A",
    ingredients: ["Tretinoin 0.025%","Stearic acid","Isopropyl myristate","Polyoxyl 40 stearate","BHT"] },
  { component: "ProductEffaclarDuo", brand: "La Roche-Posay", name: "Effaclar Duo+ M", tier: "B",
    ingredients: ["Niacinamide","LHA (capryloyl salicylic acid)","Salicylic acid","Zinc PCA","Mannose","Procerad ceramide"] },
  { component: "ProductAveneCleanance", brand: "Avène", name: "Cleanance SPF 50+", tier: "B",
    ingredients: ["Tinosorb S","Uvinul A Plus","Octocrylene","Silica / perlite","Avène thermal water"] },
  { component: "ProductBiodermaSpotAge", brand: "Bioderma", name: "Photoderm Spot-Age SPF 50+", tier: "B",
    ingredients: ["Tinosorb M / S","Bakuchiol","Ectoin","Vitamin E","Iron oxides"] },
  { component: "ProductCeraVeCream", brand: "CeraVe", name: "Moisturizing Cream", tier: "A",
    aliases: ["Moisturising Cream"],
    ingredients: ["Ceramide NP / AP / EOP","Cholesterol","Glycerin","Hyaluronic acid","Petrolatum"] },
  { component: "ProductCeraVeFoam", brand: "CeraVe", name: "Foaming Facial Cleanser", tier: "A",
    ingredients: ["Cocamidopropyl betaine","Ceramide NP / AP / EOP","Niacinamide","Hyaluronic acid","MVE delivery system"] },
  { component: "ProductCetaphilGentle", brand: "Cetaphil", name: "Gentle Skin Cleanser", tier: "A",
    ingredients: ["Cetyl alcohol","Sodium lauryl sulfate","Propylene glycol","Stearyl alcohol","Methylparaben"] },
  { component: "ProductCicaplast", brand: "La Roche-Posay", name: "Cicaplast Baume B5+", tier: "A",
    ingredients: ["Panthenol 5%","Madecassoside","Shea butter","Glycerin","Mannose"] },
  { component: "ProductDeconstructAza", brand: "Deconstruct", name: "Azelaic 15% Booster", tier: "A",
    ingredients: ["Azelaic acid 15%","Niacinamide (trace)","Glycerin","Squalane","Phenoxyethanol"] },
  { component: "ProductDeconstructExo", brand: "Deconstruct", name: "Exosome Repair Serum", tier: "D",
    ingredients: ["Plant exosome complex","Glycerin","Hyaluronic acid","Niacinamide (trace)","Phenoxyethanol"] },
  { component: "ProductDermaCoCica", brand: "The Derma Co", name: "Cica Calming Cream", tier: "C",
    ingredients: ["Centella asiatica extract 0.5%","Madecassoside (trace)","Glycerin","Niacinamide (trace)","Fragrance"] },
  { component: "ProductDifferin", brand: "Galderma", name: "Adapalene 0.1% Gel (Differin)", tier: "A",
    aliases: ["Differin Gel 0.1%"],
    ingredients: ["Adapalene 0.1%","Carbomer","Propylene glycol","Disodium edetate","Methylparaben"] },
  { component: "ProductDotKeyVitC", brand: "Dot & Key", name: "Vitamin C+E Super Bright Serum", tier: "B",
    ingredients: ["Ethyl ascorbic acid","Tocopherol","Watermelon extract","Niacinamide (low %)","Fragrance"] },
  { component: "ProductLRPEffaclarGel", brand: "La Roche-Posay", name: "Effaclar Purifying Foaming Gel", tier: "A",
    ingredients: ["Cocamidopropyl betaine","Salicylic acid (trace)","Zinc PCA","LHA (capryloyl salicylic)","La Roche-Posay thermal water"] },
  { component: "ProductLRPToleriane", brand: "La Roche-Posay", name: "Toleriane Double Repair", tier: "A",
    ingredients: ["Niacinamide","Ceramide-3 (NP)","Glycerin","Shea butter","Prebiotic thermal water"] },
  { component: "ProductMinimalistCoffee", brand: "Minimalist", name: "Coffee 1% Cleanser", tier: "C",
    ingredients: ["Sodium cocoyl isethionate","Coffee extract 1%","Glycerin","Niacinamide (trace)","Hyaluronic acid (trace)"] },
  { component: "ProductMinimalistNiacin", brand: "Minimalist", name: "Niacinamide 5% + Hyaluronic Acid", tier: "B",
    ingredients: ["Niacinamide 5%","Hyaluronic acid 1%","Zinc PCA","Glycerin","Phenoxyethanol"] },
  { component: "ProductMinimalistStem", brand: "Minimalist", name: "Plant Stem Cell Serum", tier: "D",
    ingredients: ["Plant stem cell extract","Resveratrol","Glycerin","Hyaluronic acid","Niacinamide (trace)"] },
  { component: "ProductMinimalistTX", brand: "Minimalist", name: "Tranexamic 03%", tier: "A",
    aliases: ["Tranexamic 03% Serum"],
    ingredients: ["Tranexamic acid 3%","Niacinamide 2%","HEPES","Glycerin","Sodium hyaluronate"] },
  { component: "ProductNeutrogenaHydro", brand: "Neutrogena", name: "Hydro Boost Water Gel", tier: "B",
    ingredients: ["Hyaluronic acid (multi-MW)","Glycerin","Dimethicone","Trehalose","Fragrance"] },
  { component: "ProductOrdinaryAza", brand: "The Ordinary", name: "Azelaic Acid Suspension 10%", tier: "A",
    ingredients: ["Azelaic acid 10%","Dimethicone / silicones","Tocopherol","Allantoin","Phenoxyethanol"] },
  { component: "ProductPaulasBHA", brand: "Paula's Choice", name: "2% BHA Liquid Exfoliant", tier: "A",
    ingredients: ["Salicylic acid 2%","Methylpropanediol","Camellia oleifera","Sodium hydroxide","Polysorbate 20"] },
  { component: "ProductReequilOSMF", brand: "Re'equil", name: "Oxybenzone & OMC Free SPF 50", tier: "B",
    ingredients: ["Tinosorb S","Uvinul A Plus","Zinc oxide","Glycerin","Tocopherol"] },
  { component: "ProductVanicream", brand: "Vanicream", name: "Daily Facial Moisturizer", tier: "A",
    ingredients: ["Glycerin","Squalane","Hyaluronic acid","Ceteareth-20","Phenoxyethanol"] },
  { component: "ProductVichyAgeDay", brand: "Vichy", name: "Capital Soleil UV-Age Daily SPF 50+", tier: "A",
    ingredients: ["Mexoryl 400","Tinosorb S","Uvinul A Plus","Niacinamide 4%","Phe-Resorcinol"] },

  // ── Unreviewed entries — referenced from "On our shelf" cards on
  //    ingredient briefs. No internal review yet, but readers can
  //    still act on the recommendation via the brand or a retailer.
  { brand: "Minimalist", name: "Niacinamide 10% + Matmarine",
    purchaseUrl: "https://beminimalist.co/products/niacinamide-10-matmarine-1" },
  { brand: "Paula's Choice", name: "10% Niacinamide Booster",
    purchaseUrl: "https://www.paulaschoice.com/10-niacinamide-booster/0790.html" },
  { brand: "The Ordinary", name: "Niacinamide 10% + Zinc 1%",
    purchaseUrl: "https://theordinary.com/en-us/niacinamide-10-zinc-1-serum-100436.html" },
  { brand: "CeraVe", name: "PM Facial Lotion",
    purchaseUrl: "https://www.cerave.com/skincare/moisturizers/facial-moisturizing-lotion-pm" },
  { brand: "Maelove", name: "Glow Maker",
    purchaseUrl: "https://maelove.com/products/the-glow-maker" },
  { brand: "Klairs", name: "Freshly Juiced Vitamin Drop",
    purchaseUrl: "https://klairs.com/product/freshly-juiced-vitamin-drop/" },
  { brand: "The Ordinary", name: "Ascorbyl Glucoside Solution 12%",
    purchaseUrl: "https://theordinary.com/en-us/ascorbyl-glucoside-solution-12-serum-100437.html" },
  { brand: "Paula's Choice", name: "10% Azelaic Acid Booster",
    purchaseUrl: "https://www.paulaschoice.com/10-azelaic-acid-booster/7900.html" },
  { brand: "Bioderma", name: "Sébium AKN",
    purchaseUrl: "https://www.bioderma.com/our-products/sebium/akn" },
  { brand: "Galderma", name: "Finacea Foam 15% (Rx)",
    purchaseUrl: "https://www.finacea.com/" },
  { brand: "Biossance", name: "Squalane + Phyto-Retinol Serum",
    purchaseUrl: "https://biossance.com/products/squalane-phyto-retinol-serum" },
  { brand: "The Inkey List", name: "Bakuchiol",
    purchaseUrl: "https://www.theinkeylist.com/products/bakuchiol-moisturizer" },
  { brand: "Minimalist", name: "Bakuchiol 1%",
    purchaseUrl: "https://beminimalist.co/products/bakuchiol-1" },
  { brand: "Ole Henriksen", name: "Goodnight Glow",
    purchaseUrl: "https://www.olehenriksen.com/goodnight-glow-retin-alt-sleeping-creme/" },
  { brand: "Galderma", name: "A-Ret 0.05% Gel",
    purchaseUrl: "https://www.1mg.com/search/all?name=a-ret%200.05%25%20gel" },
  { brand: "Obagi", name: "Tretinoin 0.05% Cream (Rx)",
    purchaseUrl: "https://www.obagi.com/" },

  // Adapalene brief
  { brand: "La Roche-Posay", name: "Effaclar Adapalene 0.1%",
    purchaseUrl: "https://www.laroche-posay.us/our-products/acne-oily-skin/effaclar/effaclar-adapalene-gel" },
  { brand: "Galderma", name: "Epiduo Forte 0.3% / 2.5%",
    purchaseUrl: "https://www.epiduoforte.com/" },
  // Brand intentionally stored without the "(generic)" suffix that
  // appears in the brief: keeping "generic" in the catalogue brand
  // would also match brief brand "Generic" used by IngredientDetail's
  // tretinoin shelf and break that resolution.
  { brand: "Acnatac", name: "Adapalene 0.1% Gel",
    purchaseUrl: "https://www.1mg.com/search/all?name=adapalene%200.1%25%20gel" },

  // Alpha arbutin brief
  { brand: "The Ordinary", name: "Alpha Arbutin 2% + HA",
    purchaseUrl: "https://theordinary.com/en-us/alpha-arbutin-2pct-ha-serum-100448.html" },
  { brand: "Minimalist", name: "Alpha Arbutin 2% Serum",
    purchaseUrl: "https://beminimalist.co/products/alpha-arbutin-2-serum" },
  { brand: "Naturium", name: "Alpha Arbutin Serum 2%",
    purchaseUrl: "https://naturium.com/products/alpha-arbutin-serum-2" },
  { brand: "Dr Different", name: "Treatment Cream",
    purchaseUrl: "https://www.amazon.com/stores/DrDifferent/page/0AC156FE-A766-47CE-B1B2-5165C5089CDB" },

  // Bemotrizinol / UV-filters briefs
  { brand: "Beauty of Joseon", name: "Relief Sun Rice + Probiotics",
    purchaseUrl: "https://beautyofjoseon.com/products/relief-sun-rice-probiotic-spf50-pa" },
  { brand: "Ultrasun", name: "Face Anti-Pigmentation SPF 50+",
    purchaseUrl: "https://ultrasun.com/en-ch/sunscreens/face-anti-pigmentation-spf50/50ml" },

  // Benzoyl peroxide brief
  { brand: "PanOxyl", name: "Acne Foaming Wash 4%",
    purchaseUrl: "https://panoxyl.com/products/panoxyl-acne-foaming-wash-4" },
  { brand: "Differin", name: "Daily Deep Cleanser BPO 5%",
    purchaseUrl: "https://www.differin.com/products/daily-deep-cleanser" },

  // Centella brief
  { brand: "Dr.Jart+", name: "Cicapair Tiger Grass Cream",
    purchaseUrl: "https://us.drjart.com/products/cica-cream" },
  // wearepurito.com gates the SKU behind a region picker, so we point
  // at the Amazon listing instead — same product, stable URL.
  { brand: "Purito", name: "Centella Green Level Buffet Serum",
    purchaseUrl: "https://www.amazon.com/PURITO-Centella-Green-Level-Buffect/dp/B078HLN8VF" },
  { brand: "SkinCeuticals", name: "Phyto Corrective Gel",
    purchaseUrl: "https://www.skinceuticals.com/skincare/face-serums/phyto-corrective/3606000434998.html" },

  // Ceramides brief
  { brand: "Dr. Jart+", name: "Ceramidin Cream",
    purchaseUrl: "https://www.drjart.com/product/28258/111504/moisturizers/ceramidintm-skin-barrier-moisturizing-cream" },
  { brand: "Skinfix", name: "Triple Lipid Peptide Cream",
    purchaseUrl: "https://www.skinfix.com/products/triple-lipid-peptide-collagen-cream" },
  { brand: "EltaMD", name: "Barrier Renewal Complex",
    purchaseUrl: "https://eltamd.com/products/eltamd-barrier-renewal-complex" },

  // Exosomes brief — the first two cards use category-descriptor
  // "brands" because no single SKU represents the segment; we point
  // them at the flagship SKU on a reputable retailer in each category
  // (ExoCoBio's ASCE+ SRLV exosome kit, and Rejuran's Healer Turnover
  // Ampoule for the salmon-PDRN segment).
  { brand: "Various clinical brands", name: "ASCE+ / ExoCobio / Plated",
    purchaseUrl: "https://e-fillers.com/product/exocobio-asce-srlv-20mg5ml" },
  { brand: "Salmon-PDRN serums", name: "Plump'n Glow / Rejuran-adjacent",
    purchaseUrl: "https://rejuranusa.com/products/healer-turnover-ampoule" },
  { brand: "Medicube", name: "Exosome Shot 2000",
    purchaseUrl: "https://www.medicube.us/products/exosome-shot-2000" },
  { brand: "Benev", name: "Exosome Regenerative Complex+",
    purchaseUrl: "https://www.benev.com/exosome-regenerative-complex-plus" },

  // Glycolic brief
  { brand: "Pixi", name: "Glow Tonic 5%",
    purchaseUrl: "https://www.pixibeauty.com/products/glow-tonic" },
  { brand: "The Ordinary", name: "Glycolic Acid 7% Toning Solution",
    purchaseUrl: "https://theordinary.com/en-us/glycolic-acid-7pct-toning-solution-100434.html" },
  { brand: "Drunk Elephant", name: "T.L.C. Framboos 12%",
    purchaseUrl: "https://www.drunkelephant.com/products/t-l-c-framboostm-glycolic-night-serum" },
  { brand: "Alpha-H", name: "Liquid Gold 5%",
    purchaseUrl: "https://alpha-h.com/products/liquid-gold" },

  // Hyaluronic / Panthenol briefs
  { brand: "The Ordinary", name: "Hyaluronic Acid 2% + B5",
    purchaseUrl: "https://theordinary.com/en-us/hyaluronic-acid-2pct-b5-hydration-support-formula-100432.html" },
  { brand: "La Roche-Posay", name: "Hyalu B5 Serum",
    purchaseUrl: "https://www.laroche-posay.us/our-products/face/face-serum/hyalu-b5-pure-hyaluronic-acid-serum" },
  { brand: "Minimalist", name: "Hyaluronic + PGA 2%",
    purchaseUrl: "https://beminimalist.co/products/hyaluronic-acid-pga-2" },
  { brand: "Hada Labo", name: "Gokujyun Hyaluronic Lotion",
    purchaseUrl: "https://us.hadalabo.com/products/gokujyun-hyaluronic-acid-lotion" },

  // Lactic brief
  { brand: "Sunday Riley", name: "Good Genes Lactic Acid",
    purchaseUrl: "https://sundayriley.com/products/good-genes-all-in-one-lactic-acid-treatment" },
  { brand: "The Ordinary", name: "Lactic Acid 10% + HA",
    purchaseUrl: "https://theordinary.com/en-us/lactic-acid-10pct-ha-serum-100442.html" },
  { brand: "Minimalist", name: "Lactic Acid 10% Cream",
    purchaseUrl: "https://beminimalist.co/products/lactic-acid-10" },
  { brand: "Naturium", name: "Lactic Acid 12% Serum",
    purchaseUrl: "https://naturium.com/products/lactic-acid-12-serum" },

  // Mandelic brief
  { brand: "By Wishtrend", name: "Mandelic Acid 5% Skin Prep Water",
    purchaseUrl: "https://bywishtrend.com/products/mandelic-acid-5-skin-prep-water" },
  { brand: "The Ordinary", name: "Mandelic Acid 10% + HA",
    purchaseUrl: "https://theordinary.com/en-us/mandelic-acid-10pct-ha-serum-100443.html" },
  { brand: "Naturium", name: "Mandelic Topical Acid 12%",
    purchaseUrl: "https://naturium.com/products/mandelic-topical-acid-12" },
  { brand: "Allies of Skin", name: "Mandelic Pigmentation Corrector",
    purchaseUrl: "https://www.alliesofskin.com/products/mandelic-pigmentation-corrector-night-serum" },

  // Panthenol brief
  { brand: "Bepanthen", name: "Sensiderm Cream",
    purchaseUrl: "https://www.bepanthen.com.au/products/sensiderm" },
  { brand: "Stratia", name: "Liquid Gold",
    purchaseUrl: "https://www.stratiaskin.com/products/liquid-gold" },

  // Copper peptides brief
  { brand: "NIOD", name: "Copper Amino Isolate Serum 3:1:1",
    purchaseUrl: "https://www.niod.com/en-us/copper-amino-isolate-serum-3-1-1-100396.html" },
  { brand: "The Ordinary", name: "'Buffet' + Copper Peptides 1%",
    purchaseUrl: "https://theordinary.com/en-us/buffet-copper-peptides-1pct-multi-technology-peptide-serum-100450.html" },
  { brand: "Skin Biology", name: "Copper Peptide Serum",
    purchaseUrl: "https://store.reverseskinaging.com/cp-serum/" },
  { brand: "Mad Hippie", name: "Hydra-Glow Copper Serum",
    purchaseUrl: "https://madhippie.com/products/hydra-glow-copper-serum" },

  // Signal peptides brief
  { brand: "The Ordinary", name: "Buffet (multi-peptide)",
    purchaseUrl: "https://theordinary.com/en-us/buffet-multi-technology-peptide-serum-100426.html" },
  { brand: "Olay", name: "Regenerist Micro-Sculpting Cream",
    purchaseUrl: "https://www.olay.com/skin-care/regenerist/micro-sculpting-cream" },
  { brand: "Medik8", name: "Liquid Peptides",
    purchaseUrl: "https://medik8.com/products/liquid-peptides" },
  { brand: "The Inkey List", name: "Peptide Moisturizer",
    purchaseUrl: "https://www.theinkeylist.com/products/peptide-moisturizer" },

  // Propolis brief
  { brand: "Beauty of Joseon", name: "Glow Serum (Propolis + Niacinamide)",
    purchaseUrl: "https://beautyofjoseon.com/products/glow-serum-propolis-niacinamide" },
  { brand: "COSRX", name: "Full Fit Propolis Light Ampoule",
    purchaseUrl: "https://www.cosrx.com/products/full-fit-propolis-light-ampoule" },
  { brand: "I'm From", name: "Honey Mask",
    purchaseUrl: "https://wishtrend.com/collections/im-from/products/honey-mask" },
  { brand: "Some By Mi", name: "Propolis Essence",
    purchaseUrl: "https://www.amazon.com/SOME-MI-Brightening-Acne-Fighting-Anti-Wrinkle/dp/B095Y62HJN" },

  // Retinol brief
  { brand: "La Roche-Posay", name: "Retinol B3 Serum",
    purchaseUrl: "https://www.laroche-posay.us/our-products/face/face-serum/retinol-b3-pure-retinol-face-serum" },
  { brand: "The Ordinary", name: "Retinol 0.5% in Squalane",
    purchaseUrl: "https://theordinary.com/en-us/retinol-0-5pct-in-squalane-100423.html" },
  { brand: "SkinCeuticals", name: "Retinol 0.3 / 0.5 / 1.0",
    purchaseUrl: "https://www.skinceuticals.com/skincare/face-serums/" },
  { brand: "Minimalist", name: "Retinol 0.3% Serum",
    purchaseUrl: "https://beminimalist.co/products/retinol-0-3" },

  // Salicylic brief
  { brand: "CeraVe", name: "SA Smoothing Cleanser",
    purchaseUrl: "https://www.cerave.com/skincare/cleansers/sa-smoothing-cleanser" },
  { brand: "The Ordinary", name: "Salicylic Acid 2% Solution",
    purchaseUrl: "https://theordinary.com/en-us/salicylic-acid-2pct-solution-100422.html" },
  { brand: "Stridex", name: "Maximum Pads (alcohol-free)",
    purchaseUrl: "https://stridex.com/" },

  // Snail mucin brief
  { brand: "COSRX", name: "Advanced Snail 96 Mucin Power Essence",
    purchaseUrl: "https://www.cosrx.com/products/advanced-snail-96-mucin-power-essence" },
  { brand: "Mizon", name: "Snail Repair Intensive Ampoule",
    purchaseUrl: "https://mizon.pfdbrand.com/snail-repair-intensive-ampoule.html" },
  { brand: "Some By Mi", name: "Snail Truecica Essence",
    purchaseUrl: "https://www.amazon.com/SOME-MI-Sensitive-Strengthen-Elasticity/dp/B07RT4JZQG" },
  { brand: "Numbuzin", name: "No.5 Vitamin Concentrated Serum",
    purchaseUrl: "https://us.numbuzin.com/products/no-5-vitamin-concentrated-serum" },

  // Sulphur brief
  { brand: "Mario Badescu", name: "Drying Lotion (sulphur + salicylic)",
    purchaseUrl: "https://www.mariobadescu.com/products/drying-lotion" },
  { brand: "De La Cruz", name: "Sulfur Ointment 10%",
    purchaseUrl: "https://www.delacruzproducts.com/skin-care/sulfur-ointment/" },
  { brand: "Kate Somerville", name: "EradiKate (sulphur 10%)",
    purchaseUrl: "https://www.katesomerville.com/products/eradikate-acne-treatment" },
  // Plexion is an Rx-only brand sold through pharmacies — drugs.com's
  // prescribing-info page is the most stable product-detail URL we
  // can give readers (the Medimetriks portfolio page changed shape
  // and dropped the SKU details).
  { brand: "Plexion", name: "Sulfacetamide 10% / Sulfur 5% Cleanser",
    purchaseUrl: "https://www.drugs.com/pro/plexion-cleanser.html" },

  // Tranexamic brief
  { brand: "SkinCeuticals", name: "Discoloration Defense (TXA + Niacin)",
    purchaseUrl: "https://www.skinceuticals.com/skincare/face-serums/discoloration-defense/3606000529960.html" },
  { brand: "Murad", name: "Replenishing Multi-Acid Peel + TXA",
    purchaseUrl: "https://www.murad.com/products/replenishing-multi-acid-peel" },
  { brand: "The Inkey List", name: "Tranexamic Acid Overnight Treatment",
    purchaseUrl: "https://www.theinkeylist.com/products/tranexamic-acid-night-treatment" },

  // UV-filters brief
  { brand: "EltaMD", name: "UV Clear SPF 46",
    purchaseUrl: "https://eltamd.com/products/uv-clear-broad-spectrum-spf-46" },

  // Zinc oxide brief
  { brand: "EltaMD", name: "UV Pure Broad-Spectrum SPF 47",
    purchaseUrl: "https://eltamd.com/products/eltamd-uv-pure-spf-47" },
  { brand: "Blue Lizard", name: "Sensitive Mineral SPF 50+",
    purchaseUrl: "https://www.bluelizard.com/products/sensitive-spf-50" },
  { brand: "Australian Gold", name: "Botanical Tinted Mineral SPF 50",
    purchaseUrl: "https://www.australiangold.com/botanical-spf-50-tinted-face-fair-light-3-fl-oz/5637144646.p" },
];
