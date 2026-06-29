// ProductCEFerulic — SkinCeuticals C E Ferulic review.

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
  { k: "Formulation integrity", v: 25, max: 25, n: "The Pinnell trio reference: 15% LAA + 1% E + 0.5% ferulic at pH 3.2. Patent-defining." },
  { k: "Evidence per claim",    v: 24, max: 25, n: "Multiple in-vivo, replicated. The most-cited cosmetic antioxidant." },
  { k: "Tolerability",            v: 18, max: 25, n: "First-week sting universal; persistent stinging means a barrier-rebuild detour." },
  { k: "Value",                    v: 11, max: 25, n: "₹ 12,000 / 30 mL is the price of the patent. Maelove Glow Maker reaches 80% of the formula at one-fifth." },
];

const PRICING = [
  { region: "USA", v: "$182 / 30 mL", note: "Reference market pricing." },
  { region: "EU",  v: "€169 / 30 mL", note: "Pharmacy-channel pricing." },
  { region: "India", v: "₹ 12,000 / 30 mL", note: "Imported, MRP set against US." },
  { region: "Refurb / 'dupe'", v: "₹ 2,200 / 30 mL", note: "Maelove Glow Maker — same formula trinity, 80%+ overlap." },
];

const ALTS = [
  { brand: "Maelove", name: "Glow Maker", tier: "A" as const, score: 84, note: "Same trinity. The honest dupe." },
  { brand: "Timeless", name: "20% C + E + Ferulic", tier: "B" as const, score: 78, note: "Higher LAA, less stable. Refrigerate." },
  { brand: "Klairs", name: "Freshly Juiced 5% Vit C", tier: "B" as const, score: 72, note: "Gentler ramp — 5% LAA at pH 4.5." },
];

const FAQ = [
  { q: "Is it really worth ₹12,000?", a: "The patent-pure formulation is real and slightly outperforms generic equivalents in stability over 6 months. But a Maelove Glow Maker at ₹2,200 reaches roughly 85% of the same in-vivo endpoints. If you can spend it without flinching, the original is excellent. If not, the Maelove is not a compromise — it is a sensible choice." },
  { q: "Does it expire?", a: "Yes. Three months once opened, six unopened. The colour is your guide: pale straw → orange → bin." },
  { q: "Why does it tingle?", a: "L-ascorbic acid at pH 3.2 is irritating to the stratum corneum on application. The tingle should fade within 5 minutes. Persistent stinging means your barrier is the bottleneck — back off, build with niacinamide for two weeks, return at every-other-day." },
  { q: "Can I use it under sunscreen?", a: "Yes — that is its primary job. Apply on dry skin, wait 5 minutes, then layer SPF. C E Ferulic compounds the biological photoprotection of SPF, it does not replace it." },
];

const REVIEWER = getReviewer("Dr. Aanya Mehta, MD (Dermatology)");
const FILED = "22 APR 2026";

const ProductCEFerulic: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const total = SCORE_BREAKDOWN.reduce((a, b) => a + b.v, 0);

  return (
    <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
      <LaidPaper />
      <SiteHeader active="Products" />
      <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Products", href: "#" }, { label: "SkinCeuticals C E Ferulic" }]} />

      <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
        <TopVignette /><PaperGrain /><ColumnRules opacity={0.32} />

        <Container>
          <div className="relative grid grid-cols-12 gap-10 py-24">
            <div className="absolute left-0 top-24 bottom-24 hidden lg:flex flex-col items-center justify-between" style={{ width: 24 }}>
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>PRODUCT · 03 / 26</span>
              <div className="h-px w-3" style={{ background: T.rule }} />
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>FILED · 22 APR 2026</span>
            </div>

            <div className="col-span-12 lg:col-span-8 lg:pl-12">
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
                <Eyebrow color={T.accent}>Product · Antioxidant serum · Reference</Eyebrow>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>P. 16 · REVIEW</div>
              </div>

              <div className="mt-8" style={{ fontFamily: SANS, fontSize: 13, letterSpacing: "0.18em", color: T.muted, textTransform: "uppercase", fontWeight: 600 }}>SkinCeuticals</div>

              <h1 className="mt-3" style={{ fontFamily: SERIF, fontSize: 96, lineHeight: 0.92, letterSpacing: "-0.04em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
                C E Ferulic <br />
                <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED, fontSize: 56 }}>the original.</span>
              </h1>

              <p className="mt-9 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>
                The Pinnell trio — 15% L-ascorbic acid, 1% α-tocopherol, 0.5% ferulic acid at pH 3.2. The formulation that defined the modern vitamin C serum twenty years ago and remains the benchmark every generic is judged against.
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
                    ["Format", "Serum, 30 mL amber bottle"],
                    ["Active", "15% LAA + 1% E + 0.5% ferulic"],
                    ["pH", "3.2"],
                    ["Shelf-life", "3 months opened, 6 sealed"],
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

      {/* PRICING */}
      <section className="relative z-10 border-b py-20" style={{ borderColor: T.rule }}>
        <Container>
          <Folio>§ 02</Folio>
          <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.03em" }}>
            The pricing <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>conversation.</span>
          </h2>
          <div className="mt-9 border" style={{ borderColor: T.rule }}>
            {PRICING.map((p, i) => (
              <div key={p.region} className="grid grid-cols-12 gap-4 px-6 py-5 border-b last:border-b-0 items-baseline" style={{ borderColor: T.ruleSoft, background: i % 2 ? T.paper2 : T.paper }}>
                <div className="col-span-12 md:col-span-3" style={{ fontFamily: MONO, fontSize: 11, color: T.mutedSoft, letterSpacing: "0.16em", textTransform: "uppercase" }}>{p.region}</div>
                <div className="col-span-12 md:col-span-3" style={{ fontFamily: SERIF, fontSize: 22, color: T.ink, fontVariationSettings: '"opsz" 144' }}>{p.v}</div>
                <div className="col-span-12 md:col-span-6" style={{ fontFamily: SERIF, fontSize: 15, color: T.muted, fontStyle: "italic", lineHeight: 1.5 }}>{p.note}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ALTS */}
      <section className="relative z-10 border-b py-20" style={{ borderColor: T.rule, background: T.paper2 }}>
        <Container>
          <Folio>§ 03</Folio>
          <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.03em" }}>
            Honest <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>dupes.</span>
          </h2>
          <div className="mt-9 grid grid-cols-1 md:grid-cols-3 gap-0 border-l border-t" style={{ borderColor: T.rule }}>
            {ALTS.map((p) => (
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

export default ProductCEFerulic;
