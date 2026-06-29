// ProductEffaclarDuo — La Roche-Posay Effaclar Duo+ review.

import React, { useState } from "react";
import { ChevronDown, ArrowRight, Bookmark, Share2 } from "lucide-react";
import { T } from "./_theme";
import {
  SiteHeader, SiteFooter, Breadcrumbs, Container, Eyebrow, Folio, TierBadge,
  PaperGrain, LaidPaper, ColumnRules, TopVignette, Asterism,
  SERIF, SERIF_ED, SANS, MONO,
} from "./_chrome";
import { getReviewer } from "./_reviewers";
import { ReviewerBioSection, ReviewerSidebarCredit } from "./_ReviewerBio";

const SCORE_BREAKDOWN = [
  { k: "Formulation integrity", v: 19, max: 25, n: "Niacinamide + LHA + zinc PCA in lightweight base. Smart but mild." },
  { k: "Evidence per claim",    v: 17, max: 25, n: "Replicated reduction in lesion count, but vs placebo not vs adapalene." },
  { k: "Tolerability",            v: 23, max: 25, n: "One of the gentlest 'spot' treatments — usable on whole face daily." },
  { k: "Value",                    v: 17, max: 25, n: "₹ 1,950 / 40 mL is mid-range. Cheaper niacinamide+BHA combos exist." },
];

const VS = [
  { x: "Effaclar Duo+", a: "Niacinamide + LHA + zinc", b: "Whole-face daily, mild acne maintenance", tier: "A" as const },
  { x: "Adapalene 0.1% gel", a: "Retinoid", b: "Reference for moderate comedonal acne", tier: "A" as const },
  { x: "BPO 2.5% gel", a: "Benzoyl peroxide", b: "Reference for inflammatory acne", tier: "A" as const },
  { x: "The Ordinary Niacinamide 10% + Zinc", a: "Niacinamide + zinc", b: "Cheapest niacinamide-led entry", tier: "B" as const },
];

const FAQ = [
  { q: "Is it actually a 'duo'?", a: "The +' refers to the addition of zinc PCA and mannose to the original Effaclar Duo formula. The marketing positions it as 'two-in-one' (treatment + moisturiser) — in practice it's a niacinamide-led lotion with a mild BHA assist. Useful, but not a substitute for adapalene if you have moderate-to-severe acne." },
  { q: "Will it 'fade' acne marks?", a: "Slowly. The niacinamide and LHA combination produces real but modest PIH reduction over 12 weeks. For faster fade, layer azelaic acid 10% twice-daily." },
  { q: "Use AM or PM?", a: "AM is fine — there is no photo-sensitisation issue at the LHA concentration used. Many users prefer PM after a low-pH cleanser." },
  { q: "Is it enough on its own?", a: "For mild, occasional breakouts and PIH cleanup — yes. For active moderate acne — no. Pair with a retinoid PM and a BPO spot treatment." },
];

const REVIEWER = getReviewer("Dr. Aanya Mehta, MD (Dermatology)");
const FILED = "22 APR 2026";

const ProductEffaclarDuo: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const total = SCORE_BREAKDOWN.reduce((a, b) => a + b.v, 0);

  return (
    <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
      <LaidPaper />
      <SiteHeader active="Products" />
      <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Products", href: "#" }, { label: "LRP Effaclar Duo+" }]} />

      <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
        <TopVignette /><PaperGrain /><ColumnRules opacity={0.32} />

        <Container>
          <div className="relative grid grid-cols-12 gap-10 py-24">
            <div className="absolute left-0 top-24 bottom-24 hidden lg:flex flex-col items-center justify-between" style={{ width: 24 }}>
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>PRODUCT · 09 / 26</span>
              <div className="h-px w-3" style={{ background: T.rule }} />
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>FILED · 22 APR 2026</span>
            </div>

            <div className="col-span-12 lg:col-span-8 lg:pl-12">
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
                <Eyebrow color={T.accent}>Product · Acne maintenance · Niacinamide-led</Eyebrow>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>P. 18 · REVIEW</div>
              </div>

              <div className="mt-8" style={{ fontFamily: SANS, fontSize: 13, letterSpacing: "0.18em", color: T.muted, textTransform: "uppercase", fontWeight: 600 }}>La Roche-Posay</div>

              <h1 className="mt-3" style={{ fontFamily: SERIF, fontSize: 96, lineHeight: 0.92, letterSpacing: "-0.04em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
                Effaclar Duo+ <br />
                <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED, fontSize: 56 }}>useful, oversold.</span>
              </h1>

              <p className="mt-9 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>
                The whole-face mild-acne lotion the pharmacy reaches for first. Niacinamide, LHA, zinc, mannose. Genuinely good adjunct for ongoing maintenance and PIH cleanup — but no substitute for a retinoid when acne is active.
              </p>

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
                    ["Format", "Lotion, 40 mL"],
                    ["Active", "Niacinamide + LHA + zinc PCA"],
                    ["Price", "₹ 1,950 / 40 mL"],
                    ["Pregnancy-safe", "Yes"],
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

      <section className="relative z-10 border-b py-20" style={{ borderColor: T.rule }}>
        <Container>
          <Folio>§ 02</Folio>
          <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.03em" }}>
            How it stacks up <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>against alternatives.</span>
          </h2>
          <div className="mt-9 border" style={{ borderColor: T.rule }}>
            <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b" style={{ borderColor: T.rule, background: T.paper2, fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.mutedSoft, textTransform: "uppercase" }}>
              <div className="col-span-1">Tier</div>
              <div className="col-span-3">Product</div>
              <div className="col-span-3">Active class</div>
              <div className="col-span-5">Best use</div>
            </div>
            {VS.map((v) => (
              <div key={v.x} className="grid grid-cols-12 gap-4 px-5 py-5 items-center border-b last:border-b-0" style={{ borderColor: T.ruleSoft }}>
                <div className="col-span-1"><TierBadge tier={v.tier} /></div>
                <div className="col-span-3" style={{ fontFamily: SERIF, fontSize: 17, color: T.ink, fontVariationSettings: '"opsz" 144' }}>{v.x}</div>
                <div className="col-span-3" style={{ fontFamily: SANS, fontSize: 13, color: T.muted }}>{v.a}</div>
                <div className="col-span-5" style={{ fontFamily: SERIF, fontSize: 14.5, color: T.inkSoft, fontStyle: "italic", lineHeight: 1.5 }}>{v.b}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <Container>
        <div className="py-20">
          <Folio>§ 03</Folio>
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

      <ReviewerBioSection reviewer={REVIEWER} filed={FILED} folio="§ 04" />

      <SiteFooter />
    </div>
  );
};

export default ProductEffaclarDuo;
