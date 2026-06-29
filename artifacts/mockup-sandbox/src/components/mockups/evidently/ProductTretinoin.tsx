// ProductTretinoin — Tretinoin 0.025% / 0.05% (Rx) review.

import React, { useState } from "react";
import { ChevronDown, ArrowRight, Bookmark, Share2, AlertTriangle } from "lucide-react";
import { T } from "./_theme";
import {
  SiteHeader, SiteFooter, Breadcrumbs, Container, Eyebrow, Folio, TierBadge,
  PaperGrain, LaidPaper, ColumnRules, TopVignette, Asterism,
  SERIF, SERIF_ED, SANS, MONO,
} from "./_chrome";
import { getReviewer } from "./_reviewers";
import { ReviewerBioSection, ReviewerSidebarCredit } from "./_ReviewerBio";

const SCORE_BREAKDOWN = [
  { k: "Formulation integrity", v: 23, max: 25, n: "Standardised pharma-grade. Vehicle differs by brand; cream beats gel for most Indian skin." },
  { k: "Evidence per claim",    v: 25, max: 25, n: "The most-evidenced topical in dermatology. Pigment, acne, photoaging, all replicated." },
  { k: "Tolerability",            v: 16, max: 25, n: "Predictable retinisation: weeks 2–6 of redness, peeling. Buffering and slow ramp resolve." },
  { k: "Value",                    v: 22, max: 25, n: "₹ 250 / 30 g. Cheapest serious actives in skincare." },
];

const BRANDS = [
  { brand: "Janssen", name: "Retino-A 0.025% Cream", tier: "A" as const, score: 88, note: "The Indian default. Cream vehicle, smooth ramp-up." },
  { brand: "Janssen", name: "Retino-A 0.05% Cream", tier: "A" as const, score: 88, note: "Same vehicle, double strength. For experienced users only." },
  { brand: "Obagi", name: "Tretinoin 0.05% Cream", tier: "A" as const, score: 90, note: "Cleaner vehicle for sensitive skin. Worth the premium." },
  { brand: "Compounded", name: "Kligman trio (HQ + tret + steroid)", tier: "A" as const, score: 80, note: "Reference combination for severe melasma. 12 weeks on, 12 off." },
];

const PHASES = [
  { w: "Week 0", t: "Patch test", b: "Apply pea-sized to one cheek twice. If no reaction, proceed." },
  { w: "Weeks 1–2", t: "Twice weekly", b: "Pea-sized, every third night. Buffer with moisturiser if needed." },
  { w: "Weeks 3–6", t: "Retinisation", b: "Expected: redness, dryness, peeling. Push to alternate nights only when settled." },
  { w: "Weeks 7+", t: "Nightly", b: "Pea-sized for the entire face. Adjust down if tolerance becomes an issue." },
  { w: "Months 3–6", t: "Plateau", b: "Visible texture, pigment, fine-line improvement. Continue indefinitely." },
];

const FAQ = [
  { q: "Tretinoin vs adapalene vs retinol?", a: "Tretinoin is the strongest OTC-class retinoid (in India, prescription-only). Adapalene is gentler and OTC; retinol is the weakest, requiring conversion in skin. Match strength to tolerance and goals: severe acne or visible photoaging → tretinoin. Mild acne → adapalene. Maintenance / pre-emptive use → retinol." },
  { q: "Why did my acne get worse first?", a: "The 'tretinoin purge' is real for the first 4–6 weeks. Tretinoin accelerates microcomedone-to-pustule transit — meaning lesions that would have surfaced over months instead surface in weeks. Push through; patients who quit at week 4 miss the inflection. If the purge persists past 8 weeks, see a derm." },
  { q: "Can I use it with vitamin C?", a: "Yes, but split AM (vitamin C) and PM (tretinoin). Direct layering raises stability and tolerability concerns without practical benefit." },
  { q: "Pregnancy?", a: "No. Topical tretinoin is contraindicated in pregnancy and while trying to conceive. Switch to azelaic acid or bakuchiol." },
];

const REVIEWER = getReviewer("Dr. Aanya Mehta, MD (Dermatology)");
const FILED = "22 APR 2026";

const ProductTretinoin: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const total = SCORE_BREAKDOWN.reduce((a, b) => a + b.v, 0);

  return (
    <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
      <LaidPaper />
      <SiteHeader active="Products" />
      <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Products", href: "#" }, { label: "Tretinoin (Rx)" }]} />

      <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
        <TopVignette /><PaperGrain /><ColumnRules opacity={0.32} />

        <Container>
          <div className="relative grid grid-cols-12 gap-10 py-24">
            <div className="absolute left-0 top-24 bottom-24 hidden lg:flex flex-col items-center justify-between" style={{ width: 24 }}>
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>PRODUCT · 02 / 26</span>
              <div className="h-px w-3" style={{ background: T.rule }} />
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>FILED · 22 APR 2026</span>
            </div>

            <div className="col-span-12 lg:col-span-8 lg:pl-12">
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
                <Eyebrow color={T.accent}>Product · Retinoid · Prescription only</Eyebrow>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>P. 14 · REVIEW</div>
              </div>

              <div className="mt-8" style={{ fontFamily: SANS, fontSize: 13, letterSpacing: "0.18em", color: T.muted, textTransform: "uppercase", fontWeight: 600 }}>Janssen / Compounding chemists</div>

              <h1 className="mt-3" style={{ fontFamily: SERIF, fontSize: 96, lineHeight: 0.92, letterSpacing: "-0.04em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
                Tretinoin <br />
                <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED, fontSize: 56 }}>0.025 — 0.05% cream.</span>
              </h1>

              <p className="mt-9 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>
                The reference topical retinoid. The most-evidenced active in dermatology. Costs less than a single influencer serum and outperforms all of them. The only barrier between most patients and visible improvement is whether they can adhere to the six-week retinisation period.
              </p>

              <div className="mt-7 inline-flex items-start gap-3 px-4 py-3 border" style={{ borderColor: T.warning, background: T.warningSoft }}>
                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: T.warning }} />
                <div>
                  <div style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.14em", color: T.warning, textTransform: "uppercase", fontWeight: 700 }}>Prescription only in India</div>
                  <p className="mt-1" style={{ fontFamily: SERIF, fontSize: 14.5, color: T.inkSoft, lineHeight: 1.5 }}>Tretinoin requires a derm consult. Avoid online "compounded" tretinoin without a verified prescription.</p>
                </div>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <button className="inline-flex items-center gap-2 px-5 py-3" style={{ background: T.ink, color: T.paper, fontFamily: SANS, fontSize: 13, fontWeight: 500 }}>Read the review <ArrowRight className="h-4 w-4" /></button>
                <button className="inline-flex items-center gap-2 border px-5 py-3" style={{ borderColor: T.rule, fontFamily: SANS, fontSize: 13, color: T.ink }}><Bookmark className="h-3.5 w-3.5" /> Save</button>
                <button className="inline-flex items-center gap-2 border px-5 py-3" style={{ borderColor: T.rule, fontFamily: SANS, fontSize: 13, color: T.ink }}><Share2 className="h-3.5 w-3.5" /> Share</button>
              </div>
            </div>

            <aside className="col-span-12 lg:col-span-4 lg:flex lg:items-end">
              <div className="border w-full" style={{ borderColor: T.rule, background: T.paper }}>
                <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: T.rule, background: T.paper2 }}>
                  <Eyebrow>Works Score</Eyebrow>
                  <TierBadge tier="A" size="md" />
                </div>
                <div className="px-6 py-7 text-center border-b" style={{ borderColor: T.rule }}>
                  <div style={{ fontFamily: SERIF, fontSize: 88, fontWeight: 400, color: T.ink, lineHeight: 1, fontVariationSettings: '"opsz" 144, "SOFT" 30', letterSpacing: "-0.04em" }}>
                    {total}<span style={{ color: T.mutedSoft, fontSize: 22 }}>/100</span>
                  </div>
                  <div className="mt-3" style={{ fontFamily: MONO, fontSize: 10, color: T.mutedSoft, letterSpacing: "0.18em" }}>METHODOLOGY V1.0</div>
                </div>
                <dl>
                  {[
                    ["Format", "Cream — 30 g / 0.025% or 0.05%"],
                    ["Active", "Tretinoin (all-trans retinoic acid)"],
                    ["Price", "₹ 250 / 30 g (Janssen)"],
                    ["Rx required", "Yes — derm consult"],
                    ["Pregnancy-safe", "No"],
                  ].map(([k, v]) => (
                    <div key={k} className="px-6 py-3.5 border-b" style={{ borderColor: T.ruleSoft }}>
                      <dt style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.16em", color: T.mutedSoft, textTransform: "uppercase" }}>{k}</dt>
                      <dd className="mt-1" style={{ fontFamily: SERIF, fontSize: 14.5, color: T.ink, lineHeight: 1.45 }}>{v}</dd>
                    </div>
                  ))}
                </dl>
                <ReviewerSidebarCredit reviewer={REVIEWER} filed={FILED} />
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {/* SCORE */}
      <section className="relative z-10 border-b py-20" style={{ borderColor: T.rule, background: T.paper2 }}>
        <Container>
          <Folio>§ 01</Folio>
          <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.03em" }}>
            How the score <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>breaks down.</span>
          </h2>
          <div className="mt-10 space-y-6">
            {SCORE_BREAKDOWN.map((s) => (
              <div key={s.k} className="grid grid-cols-12 gap-6 items-center">
                <div className="col-span-12 md:col-span-3" style={{ fontFamily: SERIF, fontSize: 19, color: T.ink, fontVariationSettings: '"opsz" 144' }}>{s.k}</div>
                <div className="col-span-12 md:col-span-7">
                  <div className="h-2 w-full" style={{ background: T.ruleSoft }}>
                    <div className="h-full" style={{ background: T.accent, width: `${(s.v / s.max) * 100}%` }} />
                  </div>
                  <p className="mt-2" style={{ fontFamily: SERIF, fontSize: 14.5, color: T.muted, fontStyle: "italic" }}>{s.n}</p>
                </div>
                <div className="col-span-12 md:col-span-2 md:text-right" style={{ fontFamily: SERIF, fontSize: 30, fontVariationSettings: '"opsz" 144', color: T.ink }}>{s.v}<span style={{ color: T.mutedSoft, fontSize: 14 }}>/{s.max}</span></div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* PHASES */}
      <section className="relative z-10 border-b py-20" style={{ borderColor: T.rule }}>
        <Container>
          <Folio>§ 02</Folio>
          <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.03em" }}>
            The first <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>twelve weeks.</span>
          </h2>
          <div className="mt-9 border-t" style={{ borderColor: T.rule }}>
            {PHASES.map((p, i) => (
              <div key={p.w} className="grid grid-cols-12 gap-4 py-7 border-b items-baseline" style={{ borderColor: T.ruleSoft }}>
                <div className="col-span-12 md:col-span-2" style={{ fontFamily: MONO, fontSize: 12, color: T.mutedSoft, letterSpacing: "0.14em", textTransform: "uppercase" }}>{p.w}</div>
                <div className="col-span-12 md:col-span-3" style={{ fontFamily: SERIF, fontSize: 26, color: T.accent, fontVariationSettings: '"opsz" 144', lineHeight: 1.2 }}>{p.t}</div>
                <div className="col-span-12 md:col-span-7" style={{ fontFamily: SERIF, fontSize: 17, color: T.inkSoft, lineHeight: 1.6 }}>{p.b}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* BRANDS */}
      <section className="relative z-10 border-b py-20" style={{ borderColor: T.rule, background: T.paper2 }}>
        <Container>
          <Folio>§ 03</Folio>
          <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.03em" }}>
            Available in <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>India.</span>
          </h2>
          <div className="mt-9 grid grid-cols-1 md:grid-cols-2 gap-0 border-l border-t" style={{ borderColor: T.rule }}>
            {BRANDS.map((p) => (
              <a key={p.name} href="#" className="flex flex-col p-7 border-r border-b" style={{ borderColor: T.rule, background: T.paper }}>
                <div className="flex items-start justify-between mb-3">
                  <span style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.18em", color: T.muted, textTransform: "uppercase", fontWeight: 600 }}>{p.brand}</span>
                  <TierBadge tier={p.tier} />
                </div>
                <div style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.25, color: T.ink, fontVariationSettings: '"opsz" 144' }}>{p.name}</div>
                <p className="mt-3" style={{ fontFamily: SERIF, fontSize: 14.5, lineHeight: 1.55, color: T.muted, fontStyle: "italic" }}>{p.note}</p>
                <div className="mt-auto pt-5 flex items-baseline justify-between border-t" style={{ borderColor: T.ruleSoft }}>
                  <span style={{ fontFamily: SERIF, fontSize: 26, fontVariationSettings: '"opsz" 144', color: T.ink }}>{p.score}<span style={{ color: T.mutedSoft, fontSize: 12 }}>⁄100</span></span>
                  <ArrowRight className="h-3.5 w-3.5" style={{ color: T.accent }} />
                </div>
              </a>
            ))}
          </div>
        </Container>
      </section>

      <Container>
        <div className="py-20">
          <Folio>§ 04</Folio>
          <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.03em" }}>
            Frequently <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>asked.</span>
          </h2>
          <div className="mt-9 border-t" style={{ borderColor: T.rule }}>
            {FAQ.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={f.q} className="border-b" style={{ borderColor: T.ruleSoft }}>
                  <button onClick={() => setOpenFaq(open ? null : i)} className="w-full flex items-baseline justify-between gap-4 py-6 text-left">
                    <span style={{ fontFamily: SERIF, fontSize: 22, color: T.ink, lineHeight: 1.35, fontVariationSettings: '"opsz" 144' }}>{f.q}</span>
                    <ChevronDown className="h-5 w-5 flex-shrink-0" style={{ color: T.muted, transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
                  </button>
                  {open && <p className="pb-6 max-w-3xl" style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.65, color: T.inkSoft }}>{f.a}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </Container>

      <ReviewerBioSection reviewer={REVIEWER} filed={FILED} folio="§ 05" />

      <SiteFooter />
    </div>
  );
};

export default ProductTretinoin;
