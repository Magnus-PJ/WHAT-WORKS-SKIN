// TrendWatch006 — Issue 006 archive: 2025 year-end ledger.

import React from "react";
import { T } from "./_theme";
import {
  SiteHeader, SiteFooter, Breadcrumbs, Container, Eyebrow, TierBadge,
  PaperGrain, LaidPaper, ColumnRules, TopVignette, AmbientFlask,
  SERIF, SERIF_ED, SANS, MONO,
} from "./_chrome";
import TrendWatchRelated from "./_TrendWatchRelated";

const VERDICTS = [
  { n: "01", name: "Tranexamic acid (oral)", tier: "A" as const, verdict: "Holds Up", color: T.tierA,
    body: "The most consequential pigmentation-supplement story of 2025. Three new RCTs confirmed the meta-analysis signal: 250 mg twice daily for 8–12 weeks produces measurable, replicated reduction in melasma severity, with adjunct topicals stacking favourably. Screen for VTE risk, work with a dermatologist, and treat as a course rather than a habit. Earned its Tier-A grade and held it through the year.",
    bottom: "The supplement that genuinely changed our prescribing in 2025." },
  { n: "02", name: "Heliocare (Polypodium leucotomos)", tier: "A" as const, verdict: "Holds Up", color: T.tierA,
    body: "Re-graded up from Tier B at the start of the year. The accumulated evidence on UV-induced erythema, MED extension, and PLE prophylaxis is now substantial enough that we recommend it routinely as an adjunct for melasma and photodermatosis patients. It does not replace SPF; it complements one. The peri-laser protocol literature, in particular, became hard to argue with.",
    bottom: "Adjunct, not replacement. The clearest 2025 upgrade in our supplement section." },
  { n: "03", name: "Centella asiatica triterpenes (TECA)", tier: "A" as const, verdict: "Holds Up", color: T.tierA,
    body: "The standardised triterpene fraction (asiaticoside, madecassoside, asiatic acid) — distinct from generic 'centella' marketing — earned the upgrade after a strong 2025 wound-healing literature year. The peri-procedure data is now unambiguous; the rosacea and barrier-flare data is encouraging if more modest. The labelling issue remains: not every centella product contains the standardised fraction.",
    bottom: "Buy on standardised triterpene content. Marketing 'centella' is not the same molecule." },
];

const TrendWatch006: React.FC = () => (
  <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
    <LaidPaper />
    <SiteHeader active="Trend Watch" />
    <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Trend Watch", href: "#" }, { label: "Issue 006 · Archive" }]} />

    <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
      <TopVignette /><PaperGrain /><ColumnRules opacity={0.32} />
      <div aria-hidden className="absolute -right-16 -top-16 z-0"><AmbientFlask size={580} opacity={0.06} /></div>
      <Container>
        <div className="relative grid grid-cols-12 gap-10 py-24">
          <div className="col-span-12 lg:col-span-9 lg:pl-12">
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
              <Eyebrow color={T.accent}>Trend Watch · Issue 006 · 29 December 2025</Eyebrow>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>ARCHIVE</div>
            </div>
            <div className="mt-10 inline-flex items-center gap-3 px-4 py-2 border" style={{ borderColor: T.rule, background: T.paper2 }}>
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", color: T.muted, textTransform: "uppercase" }}>Issue № 006 · Archive · Year-end</span>
            </div>
            <h1 className="mt-6" style={{ fontFamily: SERIF, fontSize: 110, lineHeight: 0.92, letterSpacing: "-0.045em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
              The five upgrades <br />
              <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>of 2025.</span>
            </h1>
            <p className="mt-9 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>
              The molecules that earned a Tier-A grade through the year, and three that lost theirs. Year-end ledger, no recap-style boilerplate, no influencer round-up.
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

    <TrendWatchRelated component="TrendWatch006" />

    <SiteFooter />
  </div>
);

export default TrendWatch006;
