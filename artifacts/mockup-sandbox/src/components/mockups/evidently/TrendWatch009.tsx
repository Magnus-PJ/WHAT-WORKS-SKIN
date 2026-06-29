// TrendWatch009 — Issue 009 archive: Methylene blue, NMN, and longevity-skincare overlap.

import React from "react";
import { T } from "./_theme";
import {
  SiteHeader, SiteFooter, Breadcrumbs, Container, Eyebrow, TierBadge,
  PaperGrain, LaidPaper, ColumnRules, TopVignette, AmbientFlask,
  SERIF, SERIF_ED, SANS, MONO,
} from "./_chrome";
import TrendWatchRelated from "./_TrendWatchRelated";

const VERDICTS = [
  { n: "01", name: "Topical methylene blue", tier: "B" as const, verdict: "Real, Modest", color: T.tierB,
    body: "Methylene blue is a redox dye with bona fide mitochondrial activity in vitro and on cultured skin fibroblasts. Two small human studies suggest improvements in elasticity and wound healing endpoints over 12 weeks. The molecule is real; the formulations available to consumers are inconsistent in concentration and stability. Worth following — not yet worth recommending as part of a routine.",
    bottom: "Genuine science. Premature consumer category. Hold." },
  { n: "02", name: "Oral NMN for skin", tier: "D" as const, verdict: "Skip", color: T.tierD,
    body: "Nicotinamide mononucleotide is a precursor to NAD+, with interesting longevity literature in mice. The human skin-specific data is essentially absent. The supplement market has nonetheless built a multi-hundred-dollar-per-month category around skin claims that the literature does not support. If you want the niacinamide pathway worked on, use topical 4–5% niacinamide — which has 20+ years of replicated dermatology evidence behind it.",
    bottom: "Save the money. Use topical niacinamide instead." },
  { n: "03", name: "Glycine + NAC stack", tier: "B" as const, verdict: "Partly True", color: T.tierB,
    body: "The glycine + N-acetylcysteine combination (often sold as 'GlyNAC') has small but interesting RCT data on glutathione restoration in older adults. The skin-specific implications — antioxidant capacity, possibly inflammatory acne benefit via NAC — are extrapolations rather than direct findings. Reasonable for adults over 50 with multiple inflammatory drivers; overpromised for everyone else.",
    bottom: "Defensible for older adults. Not a youth elixir." },
];

const TrendWatch009: React.FC = () => (
  <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
    <LaidPaper />
    <SiteHeader active="Trend Watch" />
    <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Trend Watch", href: "#" }, { label: "Issue 009 · Archive" }]} />

    <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
      <TopVignette /><PaperGrain /><ColumnRules opacity={0.32} />
      <div aria-hidden className="absolute -right-16 -top-16 z-0"><AmbientFlask size={580} opacity={0.06} /></div>
      <Container>
        <div className="relative grid grid-cols-12 gap-10 py-24">
          <div className="col-span-12 lg:col-span-9 lg:pl-12">
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
              <Eyebrow color={T.accent}>Trend Watch · Issue 009 · 09 February 2026</Eyebrow>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>ARCHIVE</div>
            </div>
            <div className="mt-10 inline-flex items-center gap-3 px-4 py-2 border" style={{ borderColor: T.rule, background: T.paper2 }}>
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", color: T.muted, textTransform: "uppercase" }}>Issue № 009 · Archive</span>
            </div>
            <h1 className="mt-6" style={{ fontFamily: SERIF, fontSize: 110, lineHeight: 0.92, letterSpacing: "-0.045em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
              Longevity meets <br />
              <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>the skincare aisle.</span>
            </h1>
            <p className="mt-9 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>
              Three molecules that crossed over from the longevity world into our inbox this fortnight. One is interesting, one is empty, and one sits in the middle.
            </p>
          </div>
        </div>
      </Container>
    </section>

    <Container>
      <div className="py-20 space-y-20">
        {VERDICTS.map((v) => (
          <article key={v.n} className="grid grid-cols-12 gap-10 pb-20 border-b last:border-b-0" style={{ borderColor: T.rule }}>
            <div className="col-span-12 lg:col-span-2">
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.18em", color: T.mutedSoft, textTransform: "uppercase" }}>Verdict № {v.n}</div>
              <div className="mt-2" style={{ fontFamily: SERIF, fontSize: 96, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.accent, lineHeight: 0.85, letterSpacing: "-0.05em" }}>{v.n}</div>
              <div className="mt-6"><TierBadge tier={v.tier} size="md" /></div>
            </div>
            <div className="col-span-12 lg:col-span-10">
              <h2 style={{ fontFamily: SERIF, fontSize: 48, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, lineHeight: 1.05, letterSpacing: "-0.025em" }}>{v.name}</h2>
              <div className="mt-4" style={{ fontFamily: SERIF_ED, fontSize: 26, fontStyle: "italic", color: v.color, letterSpacing: "-0.015em" }}>{v.verdict}</div>
              <p className="mt-7 max-w-3xl" style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.65, color: T.inkSoft }}>{v.body}</p>
              <div className="mt-7 max-w-3xl border-l-4 pl-6 py-3" style={{ borderColor: v.color, background: T.paper2 }}>
                <Eyebrow color={v.color}>Bottom line</Eyebrow>
                <p className="mt-2" style={{ fontFamily: SERIF, fontSize: 18, fontStyle: "italic", color: T.ink, lineHeight: 1.5 }}>{v.bottom}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Container>

    <TrendWatchRelated component="TrendWatch009" />

    <SiteFooter />
  </div>
);

export default TrendWatch009;
