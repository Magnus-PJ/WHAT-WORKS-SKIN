// Canonical concern catalogue.
//
// Single source of truth for the rows shown on `ConcernIndex` (the
// taxonomy hub) and the rows the search registry surfaces in the
// header overlay. Slug → component file lives here too so detail-page
// URLs stay consistent across both surfaces.
//
// Each row also carries the small `eyebrow` and `dek` data block that
// the detail page renders in its hero — kept here so the detail page
// doesn't redeclare prose that already lives in the catalogue, and
// so the header search overlay can surface the same one-line dek if
// it ever grows past the index `oneliner` it shows today.

const PREVIEW_BASE = "/__mockup/preview/evidently";

export type ConcernRow = {
  slug: string;
  name: string;
  oneliner: string;
  family: string;
  /** Hero eyebrow rendered on the detail page (e.g.
   *  `"Concern · Pigmentation · PIH"`). Includes the family so the
   *  detail page's hero never drifts from the catalogue's family. */
  eyebrow: string;
  /** Hero dek rendered on the detail page below the title — the
   *  longer cousin of `oneliner`. Detail pages read it from here so
   *  the prose lives next to the index/search row. */
  dek: string;
  ingredients: number;
  products: number;
  routines: number;
  reviewer: "Dr. Sundeep" | "Dr. Paul";
  featured?: number;
  rxOnly?: boolean;
};

export const CONCERN_ROWS: ConcernRow[] = [
  // Pigmentation
  { slug: "melasma", name: "Melasma", oneliner: "Symmetric, hormone-driven pigment. Controllable, not curable.", family: "Pigmentation",
    eyebrow: "Concern · Pigmentation Disorders · Melasma",
    dek: "The most-misunderstood pigment disorder we see. Hormone-sensitive, UV-driven, recurrence-prone. This is the protocol — molecules, products, routine, supplements, and what to avoid — for keeping it dormant.",
    ingredients: 8, products: 12, routines: 4, reviewer: "Dr. Sundeep", featured: 1 },
  { slug: "pih", name: "Post-inflammatory hyperpigmentation", oneliner: "Acne and injury aftermath. Faster to fade than melasma.", family: "Pigmentation",
    eyebrow: "Concern · Pigmentation · PIH",
    dek: "The flat, brown-to-violaceous patches that linger for months after a pimple resolves. More common, more persistent, and more under-treated in melanin-rich skin than the pigmentary concerns that get the airtime.",
    ingredients: 7, products: 9, routines: 3, reviewer: "Dr. Sundeep", featured: 2 },
  { slug: "sun-spots", name: "Sun spots & solar lentigines", oneliner: "Cumulative UV damage. Prevention beats correction.", family: "Pigmentation",
    eyebrow: "Concern · Pigmentation · Solar lentigines",
    dek: "Solar lentigines — the flat, sharply-edged brown patches on cheeks, dorsal hands, and forearms. Distinct from melasma in pattern, distinct from PIH in trigger, distinct from seborrheic keratoses in texture. Prevention is cheap; correction is harder.",
    ingredients: 5, products: 8, routines: 2, reviewer: "Dr. Sundeep" },
  { slug: "dark-circles", name: "Dark circles", oneliner: "Vascular, pigmentary, structural. Treat the right one.", family: "Pigmentation",
    eyebrow: "Concern · Pigmentation · Periorbital",
    dek: "Pigmentary, vascular, and structural dark circles look the same in the mirror but respond to entirely different things. The serum aisle treats them as one problem; we treat them as three.",
    ingredients: 4, products: 6, routines: 2, reviewer: "Dr. Sundeep" },

  // Acne family
  { slug: "comedonal-acne", name: "Comedonal acne", oneliner: "Whiteheads and blackheads. Adapalene-first territory.", family: "Acne",
    eyebrow: "Concern · Acne · Comedonal",
    dek: "Open and closed comedones, primarily on the T-zone and chin. Not inflammatory, not painful, but the most common reason adults reach for a salicylic toner — usually the wrong one. Built around retinoid discipline, not exfoliation theatre.",
    ingredients: 6, products: 11, routines: 3, reviewer: "Dr. Paul", featured: 3 },
  { slug: "inflammatory-acne", name: "Inflammatory acne", oneliner: "Papules, pustules, nodules. BPO + retinoid + sometimes oral.", family: "Acne",
    eyebrow: "Concern · Acne · Inflammatory",
    dek: "The painful, red, often pustular lesions that distinguish inflammatory acne from comedonal. The protocol shifts from retinoid-led to retinoid-plus-bactericidal, with a careful eye on antibiotic resistance — the single under-discussed risk in the category.",
    ingredients: 7, products: 10, routines: 4, reviewer: "Dr. Paul" },
  { slug: "hormonal-acne", name: "Hormonal acne", oneliner: "Jawline, premenstrual, persistent. Topical + sometimes systemic.", family: "Acne",
    eyebrow: "Concern · Acne · Hormonal pattern",
    dek: "Adult acne, jawline-clustered, premenstrually predictable, persistent past the years anyone told you it would be. Treated topically the same way as teen acne — but the third lever is systemic. The patients who do not improve on a topical-only protocol almost always benefit from a derm consult about spironolactone or COCPs.",
    ingredients: 6, products: 8, routines: 3, reviewer: "Dr. Paul" },
  { slug: "fungal-acne", name: "Fungal acne (Malassezia folliculitis)", oneliner: "Won't respond to BHA. Needs antifungals — diagnosis first.", family: "Acne",
    eyebrow: "Concern · Acne · Malassezia folliculitis",
    dek: "Malassezia folliculitis — small, monomorphic, itchy papules on the forehead, chest, and back that look like acne and respond to none of the acne treatments. Fungal, not bacterial. Different category, different protocol.",
    ingredients: 4, products: 5, routines: 2, reviewer: "Dr. Paul" },
  { slug: "scarring", name: "Acne scarring (atrophic)", oneliner: "Topicals soften, in-clinic procedures resolve.", family: "Acne",
    eyebrow: "Concern · Acne · Atrophic & rolling scars",
    dek: "Atrophic, rolling, ice-pick, and box-car scars require procedures, not serums. The honest version of the conversation: topical treatment helps with surrounding tone and texture, but the scar itself responds to needles, lasers, and time.",
    ingredients: 4, products: 5, routines: 2, reviewer: "Dr. Paul", rxOnly: true },

  // Aging
  { slug: "fine-lines", name: "Fine lines & early wrinkles", oneliner: "Retinoid-led prevention is the only conversation.", family: "Anti-aging",
    eyebrow: "Concern · Anti-aging · Fine lines",
    dek: "The conversation that should be entirely about prevention is, on social media, almost entirely about reversal. Topicals can soften visible lines and noticeably improve texture; they cannot replace the thirty years of high-UVA-PF SPF you should have started yesterday.",
    ingredients: 6, products: 10, routines: 3, reviewer: "Dr. Sundeep" },
  { slug: "elasticity", name: "Loss of firmness & elasticity", oneliner: "Topicals stall, energy-based devices reverse.", family: "Anti-aging",
    eyebrow: "Concern · Anti-aging · Elasticity",
    dek: "Three molecules genuinely move dermal elasticity over a 12-month timeline. Most of the rest is humectant theatre. The category with the worst signal-to-marketing ratio in skincare, which is saying something.",
    ingredients: 5, products: 7, routines: 2, reviewer: "Dr. Sundeep" },
  { slug: "tone-texture", name: "Uneven tone & texture", oneliner: "Vitamin C, AHAs, retinoids. The boring stack works.", family: "Anti-aging",
    eyebrow: "Concern · Anti-aging · Tone & texture",
    dek: "The catch-all category. Pore visibility, surface dullness, fine textural unevenness that the camera reads as 'tired.' Built around exfoliation discipline, retinoid layering, and rejecting the urge to add another acid every fortnight.",
    ingredients: 7, products: 9, routines: 3, reviewer: "Dr. Sundeep" },
  { slug: "photoaging", name: "Photoaging", oneliner: "Cumulative UV damage. Tretinoin reverses, SPF prevents.", family: "Anti-aging",
    eyebrow: "Concern · Anti-aging · Photoaging",
    dek: "The upstream story behind most of the visible aging conversation — solar elastosis, mottled pigment, dermal collagen loss, persistent erythema. Distinct from fine lines, which is one downstream sign. Built around the only common 'aging' diagnosis with a real prevention drug: daily SPF.",
    ingredients: 6, products: 9, routines: 2, reviewer: "Dr. Sundeep" },
  { slug: "stretch-marks", name: "Stretch marks (striae distensae)", oneliner: "Red phase responds. Silver phase rarely does.", family: "Anti-aging",
    eyebrow: "Concern · Anti-aging · Striae distensae",
    dek: "Two clinical phases with two very different prognoses. Striae rubrae — the early, inflammatory red phase — respond meaningfully to topical retinoids and fractional laser. Striae albae — the mature, atrophic white phase — respond to procedures, not serums. The honest version of the conversation, not the brand-aisle version.",
    ingredients: 5, products: 4, routines: 2, reviewer: "Dr. Paul" },

  // Barrier / sensitive
  { slug: "rosacea", name: "Rosacea", oneliner: "Vascular reactivity, not inflammation alone. Trigger-led.", family: "Sensitive & barrier",
    eyebrow: "Concern · Sensitive & Barrier · Rosacea",
    dek: "Persistent central-face redness, visible vessels, easy flushing, sometimes papules and pustules. The most-misdiagnosed condition we see — frequently treated with the same anti-acne stack that makes it worse. The fix is trigger management plus the right anti-inflammatory, not a stronger BHA.",
    ingredients: 5, products: 8, routines: 3, reviewer: "Dr. Sundeep", featured: 4 },
  { slug: "eczema", name: "Atopic dermatitis (eczema)", oneliner: "Barrier-first. Ceramides, then derm if it flares.", family: "Sensitive & barrier",
    eyebrow: "Concern · Sensitive & Barrier · Eczema",
    dek: "Atopic dermatitis is a chronic, relapsing inflammatory disease driven by filaggrin mutation, microbiome shifts, and Th2 inflammation. The skincare aisle treats it as a moisturiser problem; the dermatology literature treats it correctly. Both perspectives matter.",
    ingredients: 5, products: 9, routines: 3, reviewer: "Dr. Sundeep" },
  { slug: "compromised-barrier", name: "Compromised barrier", oneliner: "Over-exfoliated skin needs the boring stack for 8 weeks.", family: "Sensitive & barrier",
    eyebrow: "Concern · Sensitive & Barrier · Compromised barrier",
    dek: "The condition produced by skincare itself, more often than by anything else. Six weeks of strict, boring repair will resolve almost every case — but the temptation to \"add one active\" too early is the reason most people cycle through the same problem twice a year.",
    ingredients: 4, products: 7, routines: 2, reviewer: "Dr. Paul" },
  { slug: "perioral-dermatitis", name: "Perioral dermatitis", oneliner: "Stop everything. Then re-introduce, slowly. Often Rx.", family: "Sensitive & barrier",
    eyebrow: "Concern · Sensitive & Barrier · Perioral dermatitis",
    dek: "Small papules and pustules around the mouth, sometimes the nostrils and eyes. Often triggered by topical corticosteroids, fluoride toothpaste, or heavy occlusive products. The treatment is subtractive, not additive — the opposite of how most patients arrive.",
    ingredients: 3, products: 4, routines: 2, reviewer: "Dr. Sundeep", rxOnly: true },

  // Recovery
  { slug: "post-procedure", name: "Post-procedure recovery", oneliner: "Centella, panthenol, occlusion. Skip everything else.", family: "Recovery",
    eyebrow: "Concern · Recovery · Post-laser & post-microneedling",
    dek: "Centella, panthenol, mineral SPF, and a willingness to do nothing else. The single most important window in any procedural treatment, and the one most-often sabotaged by enthusiastic re-introduction of actives at day 5.",
    ingredients: 5, products: 7, routines: 2, reviewer: "Dr. Sundeep" },
  { slug: "post-isotretinoin", name: "Post-isotretinoin transition", oneliner: "How to rebuild a routine after a course finishes.", family: "Recovery",
    eyebrow: "Concern · Recovery · Post-isotretinoin",
    dek: "The skin coming off oral isotretinoin is differently dry, differently reactive, and differently sebum-suppressed than the skin that started the course. The reset routine matters as much as the course itself — and is almost never discussed at the prescribing visit.",
    ingredients: 4, products: 6, routines: 2, reviewer: "Dr. Paul" },

  // Dullness — has a built page even though it's not in the canonical
  // family taxonomy above; the row is parked under Anti-aging since
  // that's where the detail page sits the eyebrow.
  { slug: "dullness", name: "Dullness", oneliner: "Layered surface dehydration, slow turnover, pollutant load.", family: "Anti-aging",
    eyebrow: "Concern · Anti-aging · Dullness & tone",
    dek: "\"Dull skin\" is rarely a single condition. It is usually three small things stacked — surface dehydration, slowed turnover, and ambient pollutant load. Treating it as a single problem with one \"glow serum\" is exactly why nothing works. Treating each contributor separately, with the boring stack, works reliably.",
    ingredients: 5, products: 8, routines: 2, reviewer: "Dr. Sundeep" },
];

// Slug → detail page component file name (without .tsx). The hub also
// links a "compromised-barrier" alias under the legacy "barrier" key
// for any legacy links that still reach for it.
export const CONCERN_BUILT: Record<string, string> = {
  "melasma": "ConcernDetail",
  "rosacea": "ConcernRosacea",
  "hormonal-acne": "ConcernHormonalAcne",
  "barrier": "ConcernBarrier",
  "compromised-barrier": "ConcernBarrier",
  "fine-lines": "ConcernFineLines",
  "dullness": "ConcernDullness",
  "pih": "ConcernPIH",
  "sun-spots": "ConcernSunSpots",
  "dark-circles": "ConcernDarkCircles",
  "comedonal-acne": "ConcernComedonal",
  "inflammatory-acne": "ConcernInflammatory",
  "fungal-acne": "ConcernFungal",
  "scarring": "ConcernScarring",
  "elasticity": "ConcernElasticity",
  "tone-texture": "ConcernToneTexture",
  "photoaging": "ConcernPhotoaging",
  "stretch-marks": "ConcernStretchMarks",
  "eczema": "ConcernEczema",
  "perioral-dermatitis": "ConcernPerioral",
  "post-procedure": "ConcernPostProcedure",
  "post-isotretinoin": "ConcernPostIsotretinoin",
};

export function concernHrefFor(slug: string): string | null {
  const comp = CONCERN_BUILT[slug];
  return comp ? `${PREVIEW_BASE}/${comp}` : null;
}

/** Look up a row by slug. Detail pages call this to pull their
 *  eyebrow / family / dek out of the catalogue instead of redeclaring
 *  them inline. Throws on unknown slug — a missing row is a bug. */
export function concernRowFor(slug: string): ConcernRow {
  const row = CONCERN_ROWS.find((r) => r.slug === slug);
  if (!row) {
    throw new Error(`concernRowFor: no concern catalogue row for slug "${slug}"`);
  }
  return row;
}
