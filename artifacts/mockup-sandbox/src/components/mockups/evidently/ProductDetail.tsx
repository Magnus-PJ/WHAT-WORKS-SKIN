// ProductDetail — La Roche-Posay Anthelios UVMune 400 Invisible Fluid SPF 50+
// Evidence-first product review template. Design parity with IngredientDetail.

import React, { useState } from "react";
import { ChevronDown, ExternalLink, Bookmark, Share2, Check, X, ShoppingBag, ArrowRight, Beaker } from "lucide-react";
import { T, tierColor, tierBg } from "./_theme";
import {
  SiteHeader, SiteFooter, Breadcrumbs, Container, Eyebrow, Folio, TierBadge,
  PaperGrain, LaidPaper, ColumnRules, TopVignette, Asterism,
  SERIF, SERIF_ED, SANS, MONO,
} from "./_chrome";
import { linkForIngredientName } from "./_links";

const TOC = [
  { id: "verdict", label: "Verdict" },
  { id: "scoring", label: "How we scored it" },
  { id: "test", label: "The test protocol" },
  { id: "formula", label: "The formula" },
  { id: "performance", label: "Performance" },
  { id: "feel", label: "Texture & feel" },
  { id: "fit", label: "Best for / not for" },
  { id: "compare", label: "Comparison" },
  { id: "mistakes", label: "Common mistakes" },
  { id: "faq", label: "FAQ" },
  { id: "disclosure", label: "Disclosure" },
];

const FACTORS: { k: string; score: number; max: number; note: string }[] = [
  { k: "Evidence",      score: 5, max: 5, note: "Mexoryl 400 has published in vivo SPF and PPD data; full clinical dossier reviewed in CTA." },
  { k: "Concentration", score: 5, max: 5, note: "Filter system delivers UVA-PF 46 — the highest documented in a consumer fluid SPF." },
  { k: "Delivery",      score: 4, max: 5, note: "Truly invisible on light-to-medium skin; faintly chalky on deeper tones at high dose." },
  { k: "Safety",        score: 5, max: 5, note: "All filters EU-approved; no oxybenzone, no octinoxate; coral-reef-friendly." },
  { k: "Value",         score: 4, max: 5, note: "₹ 1,950 / 50 ml is steep for India, but on par with European pharmacy SPF." },
];

const FORMULA = [
  { ing: "Mexoryl 400 (MBBT-derivative)", tier: "A" as const, role: "UVA filter (380–400 nm)", note: "Closes the long-UVA gap that ages skin and worsens pigmentation." },
  { ing: "Tinosorb S (Bemotrizinol)",      tier: "A" as const, role: "Broad-spectrum UVA + UVB",  note: "Photostable, stabilises avobenzone, low penetration." },
  { ing: "Tinosorb M (Bisoctrizole)",      tier: "A" as const, role: "Broad-spectrum UVA + UVB",  note: "Hybrid micro-fine particle; reflects + absorbs." },
  { ing: "Uvinul A Plus",                  tier: "A" as const, role: "UVA filter",                 note: "Photostable UVA-I filter with low irritation profile." },
  { ing: "Uvinul T 150",                   tier: "A" as const, role: "UVB filter",                 note: "Stable, well-tolerated UVB workhorse." },
  { ing: "Mexoryl SX (Ecamsule)",          tier: "A" as const, role: "UVA-II filter",              note: "Long-standing L'Oréal-patented filter, excellent safety record." },
  { ing: "Glycerin",                        tier: "B" as const, role: "Humectant",                  note: "Standard moisture support; helps offset filter dryness." },
  { ing: "Tocopherol (Vit E)",              tier: "B" as const, role: "Antioxidant",                note: "Modest antioxidant boost; complements filter system." },
];

const PERFORMANCE = [
  { metric: "SPF (in vivo)",          claim: "50+",        verified: "60.4",  status: "ok" as const, note: "Independent ISO 24444 testing exceeds label claim." },
  { metric: "UVA-PF (in vivo)",       claim: "≥ 46",        verified: "46",   status: "ok" as const, note: "Highest UVA-PF in a consumer fluid SPF; PPD ratio > 1/3 of SPF." },
  { metric: "Critical wavelength",    claim: "≥ 380 nm",    verified: "381 nm", status: "ok" as const, note: "Meets FDA broad-spectrum threshold with margin." },
  { metric: "Water resistance",       claim: "40 min",      verified: "40 min", status: "ok" as const, note: "Re-apply after towel-drying or 80 min in water." },
  { metric: "Photostability (4 MED)", claim: "Stable",      verified: "Stable", status: "ok" as const, note: "Filter system retains > 90% protection after simulated solar exposure." },
  { metric: "White cast (deep skin)", claim: "Invisible",   verified: "Faint", status: "warn" as const, note: "Faintly visible on Fitzpatrick V–VI at full 2 mg/cm² dose." },
];

const COMPARE = [
  { brand: "La Roche-Posay", name: "Anthelios UVMune 400 Invisible Fluid", spf: "50+", uva: "46", price: "₹ 1,950", verdict: 89, tier: "A" as const, here: true },
  { brand: "Vichy",          name: "Capital Soleil UV-Age Daily SPF 50+",  spf: "50+", uva: "42", price: "₹ 2,100", verdict: 86, tier: "A" as const },
  { brand: "Bioderma",       name: "Photoderm Spot-Age SPF 50+",            spf: "50+", uva: "30", price: "₹ 1,800", verdict: 78, tier: "B" as const },
  { brand: "Avene",          name: "Cleanance SPF 50+",                      spf: "50+", uva: "27", price: "₹ 1,500", verdict: 74, tier: "B" as const },
  { brand: "Re'equil",       name: "Oxybenzone & OMC Free SPF 50",           spf: "50",  uva: "28", price: "₹ 595",   verdict: 72, tier: "B" as const },
];

const MISTAKES = [
  { t: "Under-applying", b: "Most people use a quarter of the test dose. You need ~1.2 g for the face — about two finger-lengths of fluid." },
  { t: "Skipping reapplication", b: "Even photostable filters lose 30–40% efficacy after 2 hours of outdoor exposure." },
  { t: "Layering with a heavy oil first", b: "Oil-on-fluid SPF can locally dilute filters. Apply SPF before any oil-based step." },
  { t: "Trusting it for tanning protection", b: "SPF prevents burning, not pigmentation in melanin-rich skin. UVA-PF is what matters — and you still need shade." },
];

const FAQ = [
  { q: "Is UVMune 400 the same as the old Anthelios?",
    a: "No. It is reformulated around Mexoryl 400 (MBBT-derivative), a UVA filter active in the 380–400 nm range that older Anthelios did not reach. It is the strongest long-UVA defence available in consumer skincare." },
  { q: "Does it work for melasma and PIH?",
    a: "Yes — long-UVA is the primary driver of pigment relapse. UVMune 400's UVA-PF of 46 makes it our default recommendation for pigment-prone and post-treatment skin." },
  { q: "Is it safe in pregnancy?",
    a: "All six filters are non-nano and EU-approved with negligible systemic absorption in the published literature. We score it safe for pregnancy and breastfeeding." },
  { q: "Why so expensive in India?",
    a: "Six premium filters, EU manufacturing, import duty. There are cheaper SPFs that perform well — see the comparison table — but no consumer SPF currently matches its UVA coverage." },
  { q: "Can I use it under makeup?",
    a: "Yes. Wait 60 seconds for the fluid to set, then apply foundation. It does not pill under most water-based or silicone primers we tested." },
];

const SECTION_PADDING = "py-20";

const ProductDetail: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
      <LaidPaper />
      <SiteHeader active="Products" />
      <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Products", href: "#" }, { label: "La Roche-Posay UVMune 400" }]} />

      {/* ─── HERO ───────────────────────────────────────────────────────── */}
      <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
        <TopVignette />
        <PaperGrain />
        <ColumnRules opacity={0.32} />

        {/* Ambient sun glyph */}
        <svg aria-hidden className="absolute -right-40 -top-32 z-0" width="780" height="780" viewBox="0 0 780 780" style={{ opacity: 0.05 }}>
          <g fill="none" stroke={T.ink} strokeWidth="1.2">
            <circle cx="390" cy="390" r="120" />
            {Array.from({ length: 24 }).map((_, i) => {
              const a = (i / 24) * Math.PI * 2;
              return <line key={i} x1={390 + Math.cos(a) * 150} y1={390 + Math.sin(a) * 150} x2={390 + Math.cos(a) * 280} y2={390 + Math.sin(a) * 280} />;
            })}
            <circle cx="390" cy="390" r="320" strokeDasharray="2 6" />
          </g>
        </svg>

        <Container>
          <div className="relative grid grid-cols-12 gap-10 py-20">
            {/* Vertical marginalia */}
            <div className="absolute left-0 top-20 bottom-20 hidden lg:flex flex-col items-center justify-between" style={{ width: 24 }}>
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                PRODUCT · 089 / 213
              </span>
              <div className="h-px w-3" style={{ background: T.rule }} />
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                FILED · 22 APR 2026
              </span>
            </div>

            {/* LEFT — title block */}
            <div className="col-span-12 lg:col-span-7 lg:pl-12">
              <div className="flex items-baseline justify-between border-b pb-4" style={{ borderColor: T.rule }}>
                <Eyebrow color={T.accent}>Sun Protection · Daily Fluid SPF</Eyebrow>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>P. 04 · REVIEW</div>
              </div>

              <div className="mt-10 flex items-center gap-4">
                <TierBadge tier="A" />
                <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", color: T.mutedSoft }}>EVIDENCE GRADE · CLINICAL</span>
              </div>

              {/* Brand */}
              <div className="mt-8" style={{ fontFamily: SANS, fontSize: 14, letterSpacing: "0.32em", textTransform: "uppercase", color: T.muted, fontWeight: 500 }}>
                La Roche-Posay
              </div>

              <h1 className="mt-3" style={{ fontFamily: SERIF, fontSize: 72, lineHeight: 0.98, letterSpacing: "-0.035em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
                Anthelios <br />UVMune 400
              </h1>
              <div className="mt-3" style={{ fontFamily: SERIF_ED, fontStyle: "italic", fontSize: 44, lineHeight: 1, color: T.accent, letterSpacing: "-0.02em" }}>
                Invisible Fluid <span style={{ color: T.inkSoft, fontFamily: SERIF, fontStyle: "normal" }}>SPF 50+</span>
              </div>

              <p className="mt-7" style={{ fontFamily: SERIF, fontSize: 18, lineHeight: 1.5, color: T.muted, fontStyle: "italic" }}>
                50 ml fluid · UVA-PF 46 · Mexoryl 400 + Tinosorb S/M · Made in France
              </p>

              <p className="mt-9 max-w-xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>
                The first consumer sunscreen to seriously close the long-UVA gap. Two years after launch, still the highest UVA-PF we can document in a fluid SPF — and the daily default we recommend for pigment, photoaging, and post-procedure skin.
              </p>

              {/* meta strip */}
              <div className="mt-9 flex flex-wrap items-baseline gap-x-8 gap-y-3" style={{ fontFamily: SANS, fontSize: 13, color: T.muted }}>
                <span><strong style={{ color: T.ink, fontWeight: 600 }}>Reviewed by</strong> Dr. Aanya Mehta, MD (Dermatology)</span>
                <span className="hidden md:inline" style={{ color: T.rule }}>·</span>
                <span><strong style={{ color: T.ink, fontWeight: 600 }}>Last tested</strong> 2026-04-22</span>
                <span className="hidden md:inline" style={{ color: T.rule }}>·</span>
                <span><strong style={{ color: T.ink, fontWeight: 600 }}>Methodology</strong> v1.0</span>
              </div>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <button className="inline-flex items-center gap-2 rounded-sm px-5 py-3" style={{ background: T.ink, color: T.paper, fontFamily: SANS, fontSize: 13, fontWeight: 500, letterSpacing: "0.02em" }}>
                  <ShoppingBag className="h-4 w-4" /> Where to buy
                </button>
                <button className="inline-flex items-center gap-2 rounded-sm border px-5 py-3" style={{ borderColor: T.rule, fontFamily: SANS, fontSize: 13, color: T.ink }}>
                  <Bookmark className="h-3.5 w-3.5" /> Save
                </button>
                <button className="inline-flex items-center gap-2 rounded-sm border px-5 py-3" style={{ borderColor: T.rule, fontFamily: SANS, fontSize: 13, color: T.ink }}>
                  <Share2 className="h-3.5 w-3.5" /> Share
                </button>
              </div>
            </div>

            {/* RIGHT — Verdict card */}
            <aside className="col-span-12 lg:col-span-5">
              <div className="border" style={{ borderColor: T.rule, background: T.paper }}>
                {/* score header */}
                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: T.rule, background: T.paper2 }}>
                  <Eyebrow color={T.accent}>This Issue · Highest Score</Eyebrow>
                  <span style={{ fontFamily: MONO, fontSize: 10.5, color: T.mutedSoft, letterSpacing: "0.12em" }}>№ 089</span>
                </div>

                {/* big score */}
                <div className="grid grid-cols-2 gap-0 border-b" style={{ borderColor: T.rule }}>
                  <div className="flex items-center justify-center py-9 border-r" style={{ borderColor: T.rule }}>
                    <div className="relative">
                      <svg width="180" height="180" viewBox="0 0 180 180" aria-hidden>
                        <circle cx="90" cy="90" r="78" fill="none" stroke={T.ruleSoft} strokeWidth="6" />
                        <circle
                          cx="90" cy="90" r="78" fill="none"
                          stroke={T.accent} strokeWidth="6" strokeLinecap="round"
                          strokeDasharray={`${(89 / 100) * (2 * Math.PI * 78)} 999`}
                          transform="rotate(-90 90 90)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span style={{ fontFamily: SERIF, fontSize: 64, lineHeight: 0.9, fontWeight: 400, fontVariationSettings: '"opsz" 144', color: T.ink, letterSpacing: "-0.03em" }}>89</span>
                        <span style={{ fontFamily: MONO, fontSize: 9.5, color: T.muted, letterSpacing: "0.18em", marginTop: 4 }}>/ 100</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center px-6 py-6">
                    <Eyebrow>Verdict</Eyebrow>
                    <div className="mt-3" style={{ fontFamily: SERIF, fontSize: 30, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144', color: T.ink, letterSpacing: "-0.02em" }}>Excellent</div>
                    <div className="mt-4 inline-flex w-fit"><TierBadge tier="A" /></div>
                    <div className="mt-3" style={{ fontFamily: SANS, fontSize: 12, color: T.muted, lineHeight: 1.5 }}>
                      The benchmark daily SPF for pigment-prone and post-procedure skin.
                    </div>
                  </div>
                </div>

                {/* factor mini */}
                <div className="grid grid-cols-5 gap-0">
                  {FACTORS.map((f, i) => (
                    <div key={f.k} className="px-3 py-4 text-center" style={{ borderRight: i < FACTORS.length - 1 ? `1px solid ${T.rule}` : "none" }}>
                      <div style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 400, fontVariationSettings: '"opsz" 144', color: T.ink, lineHeight: 1, letterSpacing: "-0.01em" }}>
                        {f.score}<span style={{ color: T.mutedSoft, fontSize: 13, marginLeft: 1 }}>⁄{f.max}</span>
                      </div>
                      <div className="mt-2" style={{ fontFamily: SANS, fontSize: 9.5, letterSpacing: "0.1em", color: T.muted, textTransform: "uppercase" }}>{f.k}</div>
                    </div>
                  ))}
                </div>

                {/* price + retailer */}
                <div className="border-t px-6 py-5" style={{ borderColor: T.rule, background: T.paper2 }}>
                  <div className="flex items-baseline justify-between">
                    <span style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.1em", color: T.muted, textTransform: "uppercase" }}>Bought retail at</span>
                    <span style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 400, fontVariationSettings: '"opsz" 144', color: T.ink, letterSpacing: "-0.02em" }}>₹ 1,950</span>
                  </div>
                  <div className="mt-1" style={{ fontFamily: SANS, fontSize: 12, color: T.muted }}>50 ml · ₹ 39 / ml · Cult Beauty India · 2026-04-09</div>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {/* ─── DOSSIER STATS BAND ─────────────────────────────────────────── */}
      <section className="relative z-10 border-b py-12" style={{ borderColor: T.rule, background: T.paper2 }}>
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {[
              ["UVA-PF", "46"],
              ["SPF (in vivo)", "60.4"],
              ["Filters", "6"],
              ["EU-approved", "100%"],
              ["Reef-safe", "Yes"],
            ].map(([k, v]) => (
              <div key={k as string}>
                <div style={{ fontFamily: SERIF, fontSize: 38, fontWeight: 400, fontVariationSettings: '"opsz" 144', color: T.accent, letterSpacing: "-0.02em", lineHeight: 1 }}>{v}</div>
                <div className="mt-2" style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.08em", color: T.muted, textTransform: "uppercase" }}>{k}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── BODY (TOC + CONTENT) ───────────────────────────────────────── */}
      <section className="relative z-10 border-b" style={{ borderColor: T.rule }}>
        <Container>
          <div className="grid grid-cols-12 gap-12 py-20">
            {/* TOC */}
            <aside className="col-span-12 lg:col-span-3">
              <div className="lg:sticky lg:top-24">
                <Eyebrow>On this page</Eyebrow>
                <ol className="mt-5 space-y-3">
                  {TOC.map((t, i) => (
                    <li key={t.id} className="flex gap-3 items-baseline" style={{ borderLeft: i === 1 ? `2px solid ${T.ink}` : `2px solid transparent`, paddingLeft: 10 }}>
                      <span style={{ fontFamily: MONO, fontSize: 10, color: T.mutedSoft, letterSpacing: "0.08em" }}>{String(i + 1).padStart(2, "0")}</span>
                      <a href={`#${t.id}`} style={{ fontFamily: SANS, fontSize: 13, color: i === 1 ? T.ink : T.inkSoft, fontWeight: i === 1 ? 600 : 400 }}>{t.label}</a>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>

            {/* CONTENT */}
            <article className="col-span-12 lg:col-span-9">
              {/* SCORING — five factors */}
              <div id="scoring">
                <Folio>§ 02</Folio>
                <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', letterSpacing: "-0.03em", color: T.ink }}>
                  How we <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>scored it.</span>
                </h2>
                <p className="mt-7 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.6, color: T.inkSoft }}>
                  Five factors. One honest score. Each is rated 1–5 against the same public rubric used for every product on this site — no weighting tweaks for products we like.
                </p>

                <div className="mt-10 border-t border-b" style={{ borderColor: T.rule }}>
                  {FACTORS.map((f, i) => (
                    <div key={f.k} className="grid grid-cols-12 gap-6 py-6" style={{ borderTop: i === 0 ? "none" : `1px solid ${T.rule}` }}>
                      <div className="col-span-3 md:col-span-2">
                        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft, textTransform: "uppercase" }}>0{i + 1}</div>
                        <div className="mt-1" style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 400, fontVariationSettings: '"opsz" 144', color: T.ink, letterSpacing: "-0.01em" }}>{f.k}</div>
                      </div>
                      <div className="col-span-9 md:col-span-7">
                        <p style={{ fontFamily: SERIF, fontSize: 16.5, lineHeight: 1.65, color: T.inkSoft }}>{f.note}</p>
                      </div>
                      <div className="col-span-12 md:col-span-3 flex items-center md:justify-end gap-2">
                        {Array.from({ length: f.max }).map((_, j) => (
                          <span key={j} className="inline-block" style={{ width: 14, height: 14, background: j < f.score ? T.accent : T.ruleSoft, border: `1px solid ${j < f.score ? T.accent : T.rule}` }} />
                        ))}
                        <span className="ml-2" style={{ fontFamily: MONO, fontSize: 11, color: T.muted }}>{f.score}/{f.max}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Asterism />

              {/* TEST PROTOCOL */}
              <div id="test" className="mt-4">
                <Folio>§ 03</Folio>
                <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', letterSpacing: "-0.03em", color: T.ink }}>
                  The <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>test protocol.</span>
                </h2>

                <div className="mt-8 grid grid-cols-12 gap-8">
                  <p className="col-span-12 md:col-span-7" style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.65, color: T.inkSoft }}>
                    <span style={{ float: "left", fontFamily: SERIF, fontSize: 86, lineHeight: 0.85, fontWeight: 400, fontVariationSettings: '"opsz" 144', color: T.ink, paddingRight: 14, paddingTop: 6, marginRight: 4 }}>W</span>
                    e bought two units at retail from Cult Beauty India on 2026-04-09 — no PR, no sample, no brand contact. One unit went to laboratory testing under <em>ISO 24444 (SPF)</em> and <em>ISO 24443 (UVA-PF)</em>. The second unit ran a six-week wear panel with eight subjects across Fitzpatrick II–VI, recording cosmetic acceptability, layering, and reapplication behaviour.
                  </p>
                  <aside className="col-span-12 md:col-span-5">
                    <div className="border p-6" style={{ borderColor: T.rule, background: T.paper2 }}>
                      <Eyebrow>Test inputs</Eyebrow>
                      <ul className="mt-5 space-y-3" style={{ fontFamily: SANS, fontSize: 13, color: T.inkSoft, lineHeight: 1.55 }}>
                        {[
                          ["Units tested", "2 (lab + wear panel)"],
                          ["Source", "Cult Beauty IN, retail"],
                          ["Lab", "Independent EU-accredited"],
                          ["Standards", "ISO 24444, 24443, 24442"],
                          ["Wear panel n", "8 (FST II–VI)"],
                          ["Duration", "6 weeks"],
                        ].map(([k, v]) => (
                          <li key={k} className="flex justify-between gap-4 border-b pb-2" style={{ borderColor: T.ruleSoft }}>
                            <span style={{ color: T.muted }}>{k}</span>
                            <strong style={{ color: T.ink, fontWeight: 600, textAlign: "right" }}>{v}</strong>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </aside>
                </div>
              </div>

              <Asterism />

              {/* FORMULA */}
              <div id="formula" className="mt-4">
                <Folio>§ 04</Folio>
                <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', letterSpacing: "-0.03em", color: T.ink }}>
                  The <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>formula.</span>
                </h2>
                <p className="mt-7 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 18, lineHeight: 1.6, color: T.inkSoft }}>
                  Six photoprotective filters — every one EU-approved, none below tier A. Each ingredient links to its own dossier.
                </p>

                <div className="mt-10 border" style={{ borderColor: T.rule }}>
                  <div className="grid grid-cols-12 px-5 py-3 border-b" style={{ borderColor: T.rule, background: T.paper2, fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.mutedSoft, textTransform: "uppercase" }}>
                    <div className="col-span-1">Tier</div>
                    <div className="col-span-4">Ingredient</div>
                    <div className="col-span-3">Role</div>
                    <div className="col-span-4">Note</div>
                  </div>
                  {FORMULA.map((row, i) => {
                    const href = linkForIngredientName(row.ing);
                    return (
                      <div key={row.ing} className="grid grid-cols-12 items-baseline px-5 py-4" style={{ borderTop: i === 0 ? "none" : `1px solid ${T.ruleSoft}` }}>
                        <div className="col-span-1"><TierBadge tier={row.tier} /></div>
                        <div className="col-span-4">
                          {href ? (
                            <a href={href} style={{ fontFamily: SERIF, fontSize: 17, color: T.ink, textDecoration: "underline", textUnderlineOffset: 3, textDecorationColor: T.rule }}>{row.ing}</a>
                          ) : (
                            <span style={{ fontFamily: SERIF, fontSize: 17, color: T.ink }}>{row.ing}</span>
                          )}
                        </div>
                        <div className="col-span-3" style={{ fontFamily: SANS, fontSize: 12.5, color: T.inkSoft }}>{row.role}</div>
                        <div className="col-span-4" style={{ fontFamily: SERIF, fontSize: 14.5, color: T.muted, lineHeight: 1.55, fontStyle: "italic" }}>{row.note}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Asterism />

              {/* PERFORMANCE */}
              <div id="performance" className="mt-4">
                <Folio>§ 05</Folio>
                <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', letterSpacing: "-0.03em", color: T.ink }}>
                  Claim vs. <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>verified.</span>
                </h2>
                <p className="mt-7 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 18, lineHeight: 1.6, color: T.inkSoft }}>
                  Every label claim, tested independently. Green ticks pass; amber means the claim is technically met but qualified.
                </p>

                <div className="mt-10 border" style={{ borderColor: T.rule }}>
                  {PERFORMANCE.map((p, i) => (
                    <div key={p.metric} className="grid grid-cols-12 items-center px-5 py-5" style={{ borderTop: i === 0 ? "none" : `1px solid ${T.ruleSoft}` }}>
                      <div className="col-span-12 md:col-span-3">
                        <div style={{ fontFamily: SERIF, fontSize: 17, color: T.ink }}>{p.metric}</div>
                      </div>
                      <div className="col-span-6 md:col-span-2">
                        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: T.mutedSoft, textTransform: "uppercase" }}>Claim</div>
                        <div className="mt-1" style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft }}>{p.claim}</div>
                      </div>
                      <div className="col-span-6 md:col-span-2">
                        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: T.mutedSoft, textTransform: "uppercase" }}>Verified</div>
                        <div className="mt-1 flex items-center gap-2" style={{ fontFamily: SERIF, fontSize: 16, color: T.ink }}>
                          {p.status === "ok"
                            ? <span className="inline-flex h-5 w-5 items-center justify-center rounded-full" style={{ background: T.tierAsoft, color: T.tierA, border: `1px solid ${T.tierA}55` }}><Check className="h-3 w-3" /></span>
                            : <span className="inline-flex h-5 w-5 items-center justify-center rounded-full" style={{ background: T.tierBsoft, color: T.tierB, border: `1px solid ${T.tierB}55` }}>!</span>}
                          {p.verified}
                        </div>
                      </div>
                      <div className="col-span-12 md:col-span-5 mt-2 md:mt-0" style={{ fontFamily: SERIF, fontSize: 14.5, color: T.muted, lineHeight: 1.55, fontStyle: "italic" }}>{p.note}</div>
                    </div>
                  ))}
                </div>
              </div>

              <Asterism />

              {/* TEXTURE & FEEL — quote */}
              <div id="feel" className="mt-4">
                <Folio>§ 06</Folio>
                <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', letterSpacing: "-0.03em", color: T.ink }}>
                  Texture &amp; <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>feel.</span>
                </h2>

                <blockquote className="mt-10 max-w-3xl border-l-2 pl-8" style={{ borderColor: T.accent }}>
                  <p style={{ fontFamily: SERIF, fontSize: 28, lineHeight: 1.4, color: T.ink, fontWeight: 400, letterSpacing: "-0.005em", fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
                    "It dries to a near-matte film in under a minute, behaves under makeup, and — for the first time in a high-UVA fluid — vanishes on FST IV at the test dose. On deeper skin you'll see a faint cast at the full 1.2 g face dose; for daily use most people will under-apply enough that this never registers."
                  </p>
                  <footer className="mt-6 flex items-center gap-3" style={{ fontFamily: SANS, fontSize: 13, color: T.muted }}>
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full" style={{ background: T.paper2, color: T.ink, fontFamily: SERIF, fontSize: 14, border: `1px solid ${T.rule}` }}>P</span>
                    <span><strong style={{ color: T.ink, fontWeight: 600 }}>Wear-test panel</strong> · n=12 · 6-week observation</span>
                  </footer>
                </blockquote>
              </div>

              <Asterism />

              {/* BEST FOR / NOT FOR */}
              <div id="fit" className="mt-4">
                <Folio>§ 07</Folio>
                <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', letterSpacing: "-0.03em", color: T.ink }}>
                  Best for, <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>not for.</span>
                </h2>

                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-0 border" style={{ borderColor: T.rule }}>
                  <div className="p-7 border-b md:border-b-0 md:border-r" style={{ borderColor: T.rule, background: T.paper }}>
                    <div className="flex items-center gap-2" style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.16em", color: T.tierA, textTransform: "uppercase", fontWeight: 600 }}>
                      <Check className="h-3.5 w-3.5" /> Best for
                    </div>
                    <ul className="mt-5 space-y-3" style={{ fontFamily: SERIF, fontSize: 16.5, color: T.inkSoft, lineHeight: 1.55 }}>
                      {[
                        "Melasma, PIH, and pigment-prone skin",
                        "Post-procedure recovery (lasers, peels, microneedling)",
                        "Daily wear under makeup",
                        "Active retinoid or AHA users",
                        "Outdoor commute / urban UV load",
                      ].map(b => (<li key={b} className="flex gap-3"><span style={{ color: T.tierA }}>✓</span>{b}</li>))}
                    </ul>
                  </div>
                  <div className="p-7" style={{ background: T.paper2 }}>
                    <div className="flex items-center gap-2" style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.16em", color: T.tierD, textTransform: "uppercase", fontWeight: 600 }}>
                      <X className="h-3.5 w-3.5" /> Not for
                    </div>
                    <ul className="mt-5 space-y-3" style={{ fontFamily: SERIF, fontSize: 16.5, color: T.inkSoft, lineHeight: 1.55 }}>
                      {[
                        "Beach / pool primary use (use a stick or cream variant)",
                        "Very deep skin tones at full label dose (visible cast)",
                        "Anyone needing reef-marine-grade wash-off claims",
                        "Budget under ₹ 600",
                      ].map(b => (<li key={b} className="flex gap-3"><span style={{ color: T.tierD }}>×</span>{b}</li>))}
                    </ul>
                  </div>
                </div>
              </div>

              <Asterism />

              {/* COMPARE */}
              <div id="compare" className="mt-4">
                <Folio>§ 08</Folio>
                <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', letterSpacing: "-0.03em", color: T.ink }}>
                  Against the <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>field.</span>
                </h2>
                <p className="mt-7 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 18, lineHeight: 1.6, color: T.inkSoft }}>
                  Five high-UVA daily fluids tested against the same rubric.
                </p>

                <div className="mt-10 overflow-x-auto border" style={{ borderColor: T.rule }}>
                  <table className="w-full" style={{ borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: T.paper2, fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.mutedSoft, textTransform: "uppercase" }}>
                        {["Brand", "Product", "SPF", "UVA-PF", "Price (50 ml)", "Verdict", "Tier"].map(h => (
                          <th key={h} className="text-left px-4 py-3 border-b" style={{ borderColor: T.rule, fontWeight: 500 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {COMPARE.map((c, i) => (
                        <tr key={c.name} style={{ background: c.here ? T.accentSoft : "transparent", borderTop: i === 0 ? "none" : `1px solid ${T.ruleSoft}` }}>
                          <td className="px-4 py-4" style={{ fontFamily: SANS, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: T.muted, fontWeight: 600 }}>{c.brand}</td>
                          <td className="px-4 py-4" style={{ fontFamily: SERIF, fontSize: 16, color: T.ink }}>
                            {c.name} {c.here && <span style={{ fontFamily: MONO, fontSize: 10, color: T.accent, letterSpacing: "0.16em", marginLeft: 6 }}>· REVIEWED</span>}
                          </td>
                          <td className="px-4 py-4" style={{ fontFamily: MONO, fontSize: 13, color: T.ink }}>{c.spf}</td>
                          <td className="px-4 py-4" style={{ fontFamily: MONO, fontSize: 13, color: T.ink }}>{c.uva}</td>
                          <td className="px-4 py-4" style={{ fontFamily: MONO, fontSize: 13, color: T.ink }}>{c.price}</td>
                          <td className="px-4 py-4" style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 400, fontVariationSettings: '"opsz" 144', color: T.ink, lineHeight: 1 }}>{c.verdict}</td>
                          <td className="px-4 py-4"><TierBadge tier={c.tier} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <Asterism />

              {/* MISTAKES */}
              <div id="mistakes" className="mt-4">
                <Folio>§ 09</Folio>
                <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', letterSpacing: "-0.03em", color: T.ink }}>
                  Common <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>mistakes.</span>
                </h2>

                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-0 border" style={{ borderColor: T.rule }}>
                  {MISTAKES.map((m, i) => (
                    <div key={m.t} className="p-7" style={{ borderRight: i % 2 === 0 ? `1px solid ${T.rule}` : "none", borderTop: i >= 2 ? `1px solid ${T.rule}` : "none" }}>
                      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.mutedSoft, textTransform: "uppercase" }}>{String(i + 1).padStart(2, "0")}</div>
                      <div className="mt-2" style={{ fontFamily: SERIF, fontSize: 22, lineHeight: 1.2, fontWeight: 400, fontVariationSettings: '"opsz" 144', color: T.ink, letterSpacing: "-0.01em" }}>{m.t}</div>
                      <p className="mt-3" style={{ fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.6, color: T.muted }}>{m.b}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Asterism />

              {/* FAQ */}
              <div id="faq" className="mt-4">
                <Folio>§ 10</Folio>
                <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', letterSpacing: "-0.03em", color: T.ink }}>
                  Frequently <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>asked.</span>
                </h2>

                <div className="mt-10 border-t" style={{ borderColor: T.rule }}>
                  {FAQ.map((f, i) => (
                    <div key={f.q} className="border-b" style={{ borderColor: T.rule }}>
                      <button
                        className="w-full flex items-baseline justify-between gap-6 py-6 text-left"
                        aria-expanded={openFaq === i}
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      >
                        <div className="flex items-baseline gap-5">
                          <span style={{ fontFamily: MONO, fontSize: 11, color: T.mutedSoft, letterSpacing: "0.14em" }}>Q.{String(i + 1).padStart(2, "0")}</span>
                          <span style={{ fontFamily: SERIF, fontSize: 21, color: T.ink, lineHeight: 1.3, fontWeight: 400, fontVariationSettings: '"opsz" 144' }}>{f.q}</span>
                        </div>
                        <ChevronDown className="h-4 w-4 shrink-0 transition-transform" style={{ color: T.muted, transform: openFaq === i ? "rotate(180deg)" : "rotate(0)" }} />
                      </button>
                      {openFaq === i && (
                        <div className="pb-7 pl-[88px] pr-12 -mt-1">
                          <p style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.65, color: T.inkSoft }}>{f.a}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Asterism />

              {/* DISCLOSURE */}
              <div id="disclosure" className="mt-4">
                <Folio>§ 11</Folio>
                <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', letterSpacing: "-0.03em", color: T.ink }}>
                  How this review <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>was paid for.</span>
                </h2>

                <div className="mt-10 border p-8" style={{ borderColor: T.rule, background: T.paper2 }}>
                  <ul className="space-y-4" style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.6, color: T.inkSoft }}>
                    <li className="flex gap-3"><span style={{ color: T.tierA }}>✓</span><span><strong style={{ color: T.ink, fontWeight: 600 }}>Bought retail.</strong> Two units, full price, no discount, no PR sample, no brand contact.</span></li>
                    <li className="flex gap-3"><span style={{ color: T.tierA }}>✓</span><span><strong style={{ color: T.ink, fontWeight: 600 }}>No affiliate.</strong> The "where to buy" link is a plain link. We earn nothing if you buy.</span></li>
                    <li className="flex gap-3"><span style={{ color: T.tierA }}>✓</span><span><strong style={{ color: T.ink, fontWeight: 600 }}>Lab independent.</strong> Tests commissioned from an EU-accredited contract lab; full results on file.</span></li>
                    <li className="flex gap-3"><span style={{ color: T.tierA }}>✓</span><span><strong style={{ color: T.ink, fontWeight: 600 }}>Reviewers disclose.</strong> Dr. Aanya Mehta has no consulting relationships with L'Oréal Group.</span></li>
                  </ul>
                  <a href="#" className="mt-6 inline-flex items-center gap-1.5" style={{ fontFamily: SANS, fontSize: 13, color: T.accent, textDecoration: "underline", textUnderlineOffset: 3 }}>
                    Read our full editorial policy <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </article>
          </div>
        </Container>
      </section>

      {/* ─── INVERTED CTA BAND ─────────────────────────────────────────── */}
      <section className="relative z-10 py-24" style={{ background: T.ink, color: T.paper }}>
        <Container>
          <div className="grid grid-cols-12 gap-10 items-end">
            <div className="col-span-12 lg:col-span-8">
              <Eyebrow color={T.invertAccent}>The Editor's Default</Eyebrow>
              <h2 className="mt-5" style={{ fontFamily: SERIF, fontSize: 64, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', letterSpacing: "-0.03em", color: T.paper }}>
                If you only buy <span style={{ fontStyle: "italic", color: T.invertAccent, fontFamily: SERIF_ED }}>one sunscreen</span> this year — buy this.
              </h2>
              <p className="mt-7 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.55, color: T.invertMuted }}>
                Two years on, no consumer SPF on the Indian market matches its long-UVA performance. For pigment, post-procedure, and active-ingredient routines, this is the daily default we recommend without hesitation.
              </p>
            </div>
            <div className="col-span-12 lg:col-span-4 lg:text-right">
              <a href="#" className="inline-flex items-center gap-2 px-6 py-4" style={{ background: T.paper, color: T.ink, fontFamily: SANS, fontSize: 13.5, fontWeight: 500, letterSpacing: "0.02em" }}>
                Find the best price <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </Container>
      </section>

      <SiteFooter />
    </div>
  );
};

export default ProductDetail;
