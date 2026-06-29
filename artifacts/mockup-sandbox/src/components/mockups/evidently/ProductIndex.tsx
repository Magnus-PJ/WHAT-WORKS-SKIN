// ProductIndex — the full product catalogue, by category / brand / tier
import React, { useState, useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { T, tierColor, tierBg } from "./_theme";
import {
  SiteHeader, SiteFooter, Breadcrumbs, Container, Eyebrow, Folio,
  PaperGrain, LaidPaper, ColumnRules, TopVignette, Asterism, AmbientFlask,
  TierBadge, SERIF, SERIF_ED, SANS, MONO,
} from "./_chrome";

type P = {
  slug: string; brand: string; name: string;
  category: string; tier: "A" | "B" | "C" | "D";
  score: number; price: string;
  blurb: string;
  trending?: number;
};

const PRODUCTS: P[] = [
  // Sun protection
  { slug: "lrp-uvmune", brand: "La Roche-Posay", name: "Anthelios UVMune 400 Invisible Fluid SPF 50+", category: "Sun protection", tier: "A", score: 89, price: "₹ 1,950", blurb: "Highest UVA-PF on the market. Daily default.", trending: 1 },
  { slug: "vichy-ageday", brand: "Vichy", name: "Capital Soleil UV-Age Daily SPF 50+", category: "Sun protection", tier: "A", score: 86, price: "₹ 2,100", blurb: "Niacinamide + high UVA. Pigment-prone skin." },
  { slug: "bioderma-spotage", brand: "Bioderma", name: "Photoderm Spot-Age SPF 50+", category: "Sun protection", tier: "B", score: 78, price: "₹ 1,800", blurb: "Antioxidant-loaded; UVA modest." },
  { slug: "reequil-osmf", brand: "Re'equil", name: "Oxybenzone & OMC Free SPF 50", category: "Sun protection", tier: "B", score: 72, price: "₹ 595", blurb: "Solid budget pick. Moderate UVA." },
  { slug: "avene-cleanance-spf", brand: "Avene", name: "Cleanance SPF 50+", category: "Sun protection", tier: "B", score: 74, price: "₹ 1,500", blurb: "Mattifying for oily skin; UVA average." },

  // Cleansers
  { slug: "cerave-foam", brand: "CeraVe", name: "Foaming Facial Cleanser", category: "Cleansers", tier: "A", score: 84, price: "₹ 950", blurb: "Ceramides + niacinamide. Daily workhorse." },
  { slug: "cetaphil-gentle", brand: "Cetaphil", name: "Gentle Skin Cleanser", category: "Cleansers", tier: "A", score: 82, price: "₹ 720", blurb: "The barrier-safe baseline. Sensitive default.", trending: 4 },
  { slug: "lrp-effaclar-gel", brand: "La Roche-Posay", name: "Effaclar Purifying Foaming Gel", category: "Cleansers", tier: "A", score: 80, price: "₹ 1,150", blurb: "Salicylic acid trace. Oily/acne." },
  { slug: "minimalist-coffee", brand: "Minimalist", name: "Coffee 1% Cleanser", category: "Cleansers", tier: "C", score: 58, price: "₹ 350", blurb: "Marketing-led; weak active dose." },

  // Moisturisers
  { slug: "cerave-cream", brand: "CeraVe", name: "Moisturizing Cream", category: "Moisturisers", tier: "A", score: 88, price: "₹ 1,250", blurb: "Ceramide complex; the boring gold-standard.", trending: 3 },
  { slug: "vanicream-light", brand: "Vanicream", name: "Daily Facial Moisturizer", category: "Moisturisers", tier: "A", score: 81, price: "₹ 1,400", blurb: "Hypoallergenic; for stripped barriers." },
  { slug: "lrp-toleriane-ds", brand: "La Roche-Posay", name: "Toleriane Double Repair", category: "Moisturisers", tier: "A", score: 85, price: "₹ 1,800", blurb: "Niacinamide + ceramides. Sensitive-rich." },
  { slug: "neutrogena-hydro", brand: "Neutrogena", name: "Hydro Boost Water Gel", category: "Moisturisers", tier: "B", score: 70, price: "₹ 850", blurb: "Pleasant texture; modest claims hold." },

  // Actives
  { slug: "paulas-bha", brand: "Paula's Choice", name: "2% BHA Liquid Exfoliant", category: "Actives", tier: "A", score: 85, price: "₹ 3,200", blurb: "Sal acid 2% at correct pH. Reference BHA.", trending: 2 },
  { slug: "the-ordinary-aza", brand: "The Ordinary", name: "Azelaic Acid Suspension 10%", category: "Actives", tier: "A", score: 80, price: "₹ 850", blurb: "Cheapest serious azelaic in India." },
  { slug: "minimalist-tx", brand: "Minimalist", name: "Tranexamic 03%", category: "Actives", tier: "A", score: 78, price: "₹ 700", blurb: "Real concentration; melasma adjunct." },
  { slug: "dot-key-vitc", brand: "Dot & Key", name: "Vitamin C+E Super Bright Serum", category: "Actives", tier: "B", score: 65, price: "₹ 695", blurb: "Pleasant but underdosed L-AA." },
  { slug: "deconstruct-aza15", brand: "Deconstruct", name: "Azelaic 15% Booster", category: "Actives", tier: "A", score: 79, price: "₹ 549", blurb: "High concentration, value pick." },

  // Retinoids
  { slug: "differin", brand: "Galderma", name: "Adapalene 0.1% Gel (Differin)", category: "Retinoids", tier: "A", score: 87, price: "₹ 320", blurb: "OTC retinoid. Acne first-line.", trending: 5 },
  { slug: "aret-005", brand: "Galderma", name: "A-Ret 0.05% Gel", category: "Retinoids", tier: "A", score: 83, price: "₹ 320", blurb: "Generic tretinoin starter strength." },
  { slug: "obagi-tret", brand: "Obagi", name: "Tretinoin 0.05% Cream (Rx)", category: "Retinoids", tier: "A", score: 80, price: "₹ 4,400", blurb: "Cleaner vehicle, much higher cost." },

  // Wellness
  { slug: "minimalist-niacin", brand: "Minimalist", name: "Niacinamide 5% + Hyaluronic Acid", category: "Wellness adjuncts", tier: "B", score: 70, price: "₹ 449", blurb: "Niacinamide at evidence-aligned 5%." },
  { slug: "the-derma-co-cica", brand: "The Derma Co", name: "Cica Calming Cream", category: "Wellness adjuncts", tier: "C", score: 60, price: "₹ 599", blurb: "Marketing-heavy; modest soothing." },

  // Trend-watch / D-tier
  { slug: "deconstruct-exo", brand: "Deconstruct", name: "Exosome Repair Serum", category: "Trend Watch", tier: "D", score: 38, price: "₹ 1,499", blurb: "Cosmetic-grade exosomes — claims outpace evidence." },
  { slug: "minimalist-stem", brand: "Minimalist", name: "Plant Stem Cell Serum", category: "Trend Watch", tier: "D", score: 32, price: "₹ 749", blurb: "Plant cells ≠ stem cells. Pseudoscience." },
];

const VIEWS = [
  { k: "category", l: "Category" },
  { k: "brand", l: "Brand" },
  { k: "tier", l: "Tier" },
] as const;

const TRENDING = PRODUCTS.filter(p => p.trending).sort((a, b) => a.trending! - b.trending!).slice(0, 5);

const SHORTLIST = [
  { slug: "lrp-uvmune", category: "Sunscreen", line: "If you only buy one." },
  { slug: "cerave-cream", category: "Moisturiser", line: "The boring, brilliant default." },
  { slug: "differin", category: "Retinoid", line: "OTC, ₹ 320, evidence-rich." },
  { slug: "paulas-bha", category: "BHA", line: "The reference exfoliant." },
];

const BUILT: Record<string, string> = {
  "lrp-uvmune": "ProductDetail",
  "lrp-cicaplast": "ProductCicaplast",
  "cicaplast": "ProductCicaplast",
  "obagi-tret": "ProductTretinoin",
  "aret-005": "ProductTretinoin",
  "ce-ferulic": "ProductCEFerulic",
  "skinceuticals-ce": "ProductCEFerulic",
  "lrp-effaclar-duo": "ProductEffaclarDuo",
  "effaclar-duo": "ProductEffaclarDuo",
  "vichy-ageday": "ProductVichyAgeDay",
  "bioderma-spotage": "ProductBiodermaSpotAge",
  "reequil-osmf": "ProductReequilOSMF",
  "avene-cleanance-spf": "ProductAveneCleanance",
  "cerave-foam": "ProductCeraVeFoam",
  "cetaphil-gentle": "ProductCetaphilGentle",
  "lrp-effaclar-gel": "ProductLRPEffaclarGel",
  "minimalist-coffee": "ProductMinimalistCoffee",
  "cerave-cream": "ProductCeraVeCream",
  "vanicream-light": "ProductVanicream",
  "lrp-toleriane-ds": "ProductLRPToleriane",
  "neutrogena-hydro": "ProductNeutrogenaHydro",
  "paulas-bha": "ProductPaulasBHA",
  "the-ordinary-aza": "ProductOrdinaryAza",
  "minimalist-tx": "ProductMinimalistTX",
  "dot-key-vitc": "ProductDotKeyVitC",
  "deconstruct-aza15": "ProductDeconstructAza",
  "differin": "ProductDifferin",
  "minimalist-niacin": "ProductMinimalistNiacin",
  "the-derma-co-cica": "ProductDermaCoCica",
  "deconstruct-exo": "ProductDeconstructExo",
  "minimalist-stem": "ProductMinimalistStem",
};
const linkFor = (slug: string) => BUILT[slug] ? `/__mockup/preview/evidently/${BUILT[slug]}` : "#";

const ProductIndex: React.FC = () => {
  const [view, setView] = useState<"category" | "brand" | "tier">("category");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const groups = useMemo(() => {
    const g: Record<string, P[]> = {};
    for (const p of PRODUCTS) {
      const key = p[view];
      if (!g[key]) g[key] = [];
      g[key].push(p);
    }
    if (view === "tier") return Object.entries(g).sort(([a], [b]) => a.localeCompare(b));
    return Object.entries(g).sort(([, a], [, b]) => b.length - a.length);
  }, [view]);

  const visibleGroups = activeFilter ? groups.filter(([k]) => k === activeFilter) : groups;

  return (
    <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
      <LaidPaper />
      <SiteHeader active="Products" />
      <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Product catalogue" }]} />

      {/* ─── HERO ───────────────────────────────────────────────────── */}
      <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
        <TopVignette />
        <PaperGrain />
        <ColumnRules opacity={0.32} />
        <div aria-hidden className="absolute -right-24 -top-12 z-0"><AmbientFlask size={520} opacity={0.06} /></div>

        <Container>
          <div className="relative grid grid-cols-12 gap-10 py-24">
            <div className="absolute left-0 top-24 bottom-24 hidden lg:flex flex-col items-center justify-between" style={{ width: 24 }}>
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                SECTION 02 / CATALOGUE
              </span>
              <div className="h-px w-3" style={{ background: T.rule }} />
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                {PRODUCTS.length} REVIEWS
              </span>
            </div>

            <div className="col-span-12 lg:col-span-8 lg:pl-12">
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
                <Eyebrow color={T.accent}>The Product Catalogue · {PRODUCTS.length} Reviewed</Eyebrow>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>P. 03 · CATALOGUE</div>
              </div>

              <h1 className="mt-10" style={{ fontFamily: SERIF, fontSize: 108, lineHeight: 0.93, letterSpacing: "-0.045em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
                Every product, <br />
                <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>scored.</span>
              </h1>

              <p className="mt-10 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>
                Bought retail. Tested in lab and on skin. Scored against the same five-factor rubric — Evidence, Concentration, Delivery, Safety, Value. No paid placements, no affiliate inflation.
              </p>

              <div className="mt-10 grid grid-cols-4 gap-6 border-t pt-8 max-w-2xl" style={{ borderColor: T.rule }}>
                {[
                  ["213", "products tested"],
                  ["41", "Tier A"],
                  ["100%", "bought retail"],
                  ["v1.0", "rubric"],
                ].map(([k, v]) => (
                  <div key={k as string}>
                    <div style={{ fontFamily: SERIF, fontSize: 30, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144', letterSpacing: "-0.02em", color: T.ink }}>{k}</div>
                    <div className="mt-2" style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.04em", color: T.muted, textTransform: "uppercase" }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Methodology aside */}
            <aside className="col-span-12 lg:col-span-4 lg:flex lg:items-end">
              <div className="border p-7 w-full" style={{ borderColor: T.rule, background: T.paper2 }}>
                <Eyebrow>How a product is scored</Eyebrow>
                <ol className="mt-5 space-y-3" style={{ fontFamily: SANS, fontSize: 13, color: T.inkSoft, lineHeight: 1.55 }}>
                  {[
                    ["Evidence", "Are the actives proven?"],
                    ["Concentration", "Is the dose effective?"],
                    ["Delivery", "Does the formula get them in?"],
                    ["Safety", "Label match regulators?"],
                    ["Value", "Cost per ml of effect."],
                  ].map(([k, v], i) => (
                    <li key={k} className="flex gap-3 items-baseline">
                      <span style={{ fontFamily: MONO, fontSize: 10, color: T.mutedSoft, letterSpacing: "0.08em" }}>{String(i + 1).padStart(2, "0")}</span>
                      <span><strong style={{ color: T.ink, fontWeight: 600 }}>{k}.</strong> {v}</span>
                    </li>
                  ))}
                </ol>
                <a href="#" className="mt-5 inline-flex items-center gap-1.5" style={{ fontFamily: SANS, fontSize: 12.5, color: T.accent, textDecoration: "underline", textUnderlineOffset: 3 }}>
                  Read the methodology <ArrowRight className="h-3 w-3" />
                </a>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {/* ─── TRENDING STRIP ────────────────────────────────────────── */}
      <section className="relative z-10 py-16 border-b" style={{ borderColor: T.rule, background: T.paper2 }}>
        <Container>
          <div className="flex items-end justify-between border-b pb-5 mb-8" style={{ borderColor: T.rule }}>
            <div>
              <Eyebrow color={T.tierD}>Trending now</Eyebrow>
              <h2 className="mt-3" style={{ fontFamily: SERIF, fontSize: 36, fontWeight: 400, letterSpacing: "-0.02em", color: T.ink, fontVariationSettings: '"opsz" 144' }}>
                Most-shopped <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>this month.</span>
              </h2>
            </div>
            <span style={{ fontFamily: MONO, fontSize: 10.5, color: T.mutedSoft, letterSpacing: "0.1em" }}>SOURCE · NYKAA · TIRA · AMAZON</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-0 border" style={{ borderColor: T.rule }}>
            {TRENDING.map((p, i) => (
              <a key={p.slug} href={linkFor(p.slug)} className="flex flex-col p-6 group" style={{ borderRight: i < TRENDING.length - 1 ? `1px solid ${T.rule}` : "none", background: T.paper }}>
                <div className="flex items-baseline justify-between mb-5">
                  <span style={{ fontFamily: SERIF, fontSize: 56, fontWeight: 400, color: T.tierD, letterSpacing: "-0.04em", lineHeight: 0.9, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>{String(i + 1).padStart(2, "0")}</span>
                  <TierBadge tier={p.tier} />
                </div>
                <div style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.18em", color: T.muted, textTransform: "uppercase", fontWeight: 600 }}>{p.brand}</div>
                <div className="mt-2" style={{ fontFamily: SERIF, fontSize: 18, lineHeight: 1.25, color: T.ink, fontWeight: 400, fontVariationSettings: '"opsz" 144' }}>{p.name}</div>
                <div className="mt-auto flex items-baseline justify-between pt-5">
                  <span style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 400, fontVariationSettings: '"opsz" 144', color: T.ink }}>{p.score}</span>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: T.muted }}>{p.price}</span>
                </div>
              </a>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── BROWSE BY ─────────────────────────────────────────────── */}
      <section className="relative z-10 py-20 border-b" style={{ borderColor: T.rule }}>
        <Container>
          <div className="flex flex-wrap items-end justify-between border-b pb-5 mb-12" style={{ borderColor: T.rule }}>
            <div>
              <Eyebrow>The Full Catalogue</Eyebrow>
              <h2 className="mt-3" style={{ fontFamily: SERIF, fontSize: 56, fontWeight: 400, letterSpacing: "-0.03em", color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30', lineHeight: 1 }}>
                Browse by <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>{VIEWS.find(v => v.k === view)?.l.toLowerCase()}.</span>
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: MONO, fontSize: 10.5, color: T.mutedSoft, letterSpacing: "0.14em", marginRight: 8 }}>VIEW BY</span>
              {VIEWS.map(v => {
                const active = view === v.k;
                return (
                  <button key={v.k} onClick={() => { setView(v.k as any); setActiveFilter(null); }} className="px-4 py-2 border" style={{ borderColor: active ? T.ink : T.rule, color: active ? T.paper : T.ink, background: active ? T.ink : "transparent", fontFamily: SANS, fontSize: 12, fontWeight: 500 }}>
                    {v.l}
                  </button>
                );
              })}
            </div>
          </div>

          {/* filter chips */}
          <div className="mb-12 flex flex-wrap items-center gap-2">
            <span style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.16em", color: T.muted, textTransform: "uppercase", fontWeight: 600, marginRight: 8 }}>Filter</span>
            {groups.map(([k, items]) => {
              const active = activeFilter === k;
              return (
                <button key={k} onClick={() => setActiveFilter(active ? null : k)} className="rounded-full border px-4 py-1.5" style={{ borderColor: active ? T.ink : T.rule, color: active ? T.paper : T.inkSoft, background: active ? T.ink : "transparent", fontFamily: SANS, fontSize: 12 }}>
                  {k} <span style={{ color: active ? T.invertMuted : T.mutedSoft, marginLeft: 4 }}>{items.length}</span>
                </button>
              );
            })}
            {activeFilter && (
              <button onClick={() => setActiveFilter(null)} style={{ fontFamily: SANS, fontSize: 12, color: T.accent, textDecoration: "underline", marginLeft: 6 }}>Clear</button>
            )}
          </div>

          {/* groups */}
          {visibleGroups.map(([key, items]) => (
            <div key={key} className="mb-16">
              <div className="flex items-baseline justify-between border-b pb-3 mb-6" style={{ borderColor: T.rule }}>
                <h3 style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 400, color: T.ink, letterSpacing: "-0.015em", fontVariationSettings: '"opsz" 144' }}>
                  {view === "tier" ? <span style={{ color: tierColor(key as any) }}>Tier {key}</span> : key}
                </h3>
                <span style={{ fontFamily: MONO, fontSize: 11, color: T.mutedSoft, letterSpacing: "0.14em" }}>{items.length} ITEM{items.length !== 1 && "S"}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-l border-t" style={{ borderColor: T.rule }}>
                {items.map((p) => (
                  <a key={p.slug} href={linkFor(p.slug)} className="flex flex-col p-6 border-r border-b" style={{ borderColor: T.rule, background: T.paper }}>
                    <div className="flex items-start justify-between mb-3">
                      <span style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.18em", color: T.muted, textTransform: "uppercase", fontWeight: 600 }}>{p.brand}</span>
                      <TierBadge tier={p.tier} />
                    </div>
                    <div style={{ fontFamily: SERIF, fontSize: 18, lineHeight: 1.25, color: T.ink, fontWeight: 400, fontVariationSettings: '"opsz" 144' }}>{p.name}</div>
                    <p className="mt-3" style={{ fontFamily: SERIF, fontSize: 14.5, lineHeight: 1.5, color: T.muted, fontStyle: "italic" }}>{p.blurb}</p>
                    <div className="mt-auto flex items-baseline justify-between pt-5 border-t" style={{ borderColor: T.ruleSoft }}>
                      <span style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 400, fontVariationSettings: '"opsz" 144', color: T.ink, letterSpacing: "-0.02em", lineHeight: 1 }}>
                        {p.score}<span style={{ color: T.mutedSoft, fontSize: 12, marginLeft: 2 }}>⁄100</span>
                      </span>
                      <span style={{ fontFamily: MONO, fontSize: 12, color: T.inkSoft }}>{p.price}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </Container>
      </section>

      {/* ─── EDITOR'S SHORTLIST (DARK SPREAD) ─────────────────────── */}
      <section className="relative z-10 py-24 border-b" style={{ borderColor: T.rule, background: T.ink, color: T.paper }}>
        <Container>
          <div className="grid grid-cols-12 gap-10 mb-12 items-end">
            <div className="col-span-12 lg:col-span-8">
              <Eyebrow color={T.invertAccent}>The Editor's Shortlist</Eyebrow>
              <h2 className="mt-5" style={{ fontFamily: SERIF, fontSize: 64, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', letterSpacing: "-0.03em", color: T.paper }}>
                Four products. <span style={{ fontStyle: "italic", color: T.invertAccent, fontFamily: SERIF_ED }}>Most skin needs nothing else.</span>
              </h2>
            </div>
            <div className="col-span-12 lg:col-span-4 lg:text-right" style={{ fontFamily: SERIF, fontSize: 16, color: T.invertMuted, fontStyle: "italic", lineHeight: 1.55 }}>
              "Routine, not collection. Each chosen because it earns its place every morning."
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border-l border-t" style={{ borderColor: T.invertMuted + "55" }}>
            {SHORTLIST.map((s, i) => {
              const p = PRODUCTS.find(x => x.slug === s.slug)!;
              return (
                <a key={s.slug} href={linkFor(s.slug)} className="flex flex-col p-7 border-r border-b" style={{ borderColor: T.invertMuted + "55" }}>
                  <span style={{ fontFamily: SERIF, fontSize: 70, fontWeight: 400, color: T.invertAccent, lineHeight: 0.9, fontVariationSettings: '"opsz" 144, "SOFT" 30', letterSpacing: "-0.04em" }}>0{i + 1}</span>
                  <span className="mt-6" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.18em", color: T.invertMuted, textTransform: "uppercase" }}>{s.category}</span>
                  <span className="mt-2" style={{ fontFamily: SERIF, fontSize: 22, lineHeight: 1.2, color: T.paper, fontWeight: 400, fontVariationSettings: '"opsz" 144' }}>{p.brand}</span>
                  <span className="mt-1" style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.3, color: T.invertFg }}>{p.name}</span>
                  <p className="mt-4" style={{ fontFamily: SERIF, fontSize: 14, color: T.invertMuted, fontStyle: "italic", lineHeight: 1.5 }}>{s.line}</p>
                  <div className="mt-auto flex items-baseline justify-between pt-6">
                    <span style={{ fontFamily: SERIF, fontSize: 26, color: T.invertAccent, fontVariationSettings: '"opsz" 144' }}>{p.score}</span>
                    <span style={{ fontFamily: MONO, fontSize: 12, color: T.invertMuted }}>{p.price}</span>
                  </div>
                </a>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ─── BRAND TRUST BAND ──────────────────────────────────────── */}
      <section className="relative z-10 py-16" style={{ background: T.paper }}>
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-6 border-y py-8" style={{ borderColor: T.rule }}>
            <div style={{ fontFamily: SERIF, fontSize: 21, color: T.inkSoft, fontStyle: "italic", maxWidth: 720, lineHeight: 1.5 }}>
              Every product on this page was bought at retail. We accept no PR samples, no sponsored placements, and no affiliate revenue. Methodology v1.0 is public.
            </div>
            <div className="inline-flex items-center gap-2 px-5 py-3" style={{ background: T.ink, color: T.paper, fontFamily: SANS, fontSize: 13, fontWeight: 500 }}>
              Read the editorial policy <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </Container>
      </section>

      <SiteFooter />
    </div>
  );
};

export default ProductIndex;
