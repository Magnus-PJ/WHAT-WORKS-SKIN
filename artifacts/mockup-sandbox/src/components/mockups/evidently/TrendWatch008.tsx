// TrendWatch008 — Issue 008 archive: The retinal vs retinol debate, again.

import React from "react";
import { T } from "./_theme";
import {
  SiteHeader, SiteFooter, Breadcrumbs, Container, Eyebrow, TierBadge,
  PaperGrain, LaidPaper, ColumnRules, TopVignette, AmbientFlask,
  SERIF, SERIF_ED, SANS, MONO,
} from "./_chrome";
import TrendWatchRelated from "./_TrendWatchRelated";

const VERDICTS = [
  { n: "01", name: "Retinaldehyde 0.05%", tier: "A" as const, verdict: "Holds Up", color: T.tierA,
    body: "Retinal sits one enzymatic step closer to retinoic acid than retinol does, and the comparator literature now consistently shows it producing equivalent endpoints at lower concentrations and shorter timelines. The ramping curve is gentler than tretinoin and steeper than retinol — exactly where intermediate-tolerance users belong. The remaining issue is formulation stability, which the better brands have largely solved with airless packaging.",
    bottom: "The most defensible 'between retinol and tretinoin' rung. Use 12 weeks before judging." },
  { n: "02", name: "Retinol 0.5% time-released", tier: "A" as const, verdict: "Holds Up", color: T.tierA,
    body: "Encapsulation and microsphere delivery genuinely flatten the irritation curve while preserving efficacy. Reformulations from three serious brands now produce data that matches free retinol of equivalent strength on outcomes, with significantly less stinging. For sensitive-leaning skin building a retinoid habit, encapsulated 0.5% is now the easiest defensible entry.",
    bottom: "Worth the formulation premium for anyone who has stung off classic retinol before." },
  { n: "03", name: "OTC 'retinol esters'", tier: "D" as const, verdict: "Misleading", color: T.tierD,
    body: "Retinyl palmitate and retinyl linoleate are technically retinoids, in the sense that water is technically a beverage. The conversion to retinoic acid is dilute, slow, and clinically irrelevant at the concentrations used. The reason these molecules dominate budget skincare is shelf-stability, not efficacy. Marketing them alongside true retinoids on the same shelf is the category's longest-running bait-and-switch.",
    bottom: "Technically retinoids. Functionally moisturisers. Skip." },
];

const TrendWatch008: React.FC = () => (
  <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
    <LaidPaper />
    <SiteHeader active="Trend Watch" />
    <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Trend Watch", href: "#" }, { label: "Issue 008 · Archive" }]} />

    <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
      <TopVignette /><PaperGrain /><ColumnRules opacity={0.32} />
      <div aria-hidden className="absolute -right-16 -top-16 z-0"><AmbientFlask size={580} opacity={0.06} /></div>
      <Container>
        <div className="relative grid grid-cols-12 gap-10 py-24">
          <div className="col-span-12 lg:col-span-9 lg:pl-12">
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
              <Eyebrow color={T.accent}>Trend Watch · Issue 008 · 26 January 2026</Eyebrow>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>ARCHIVE</div>
            </div>
            <div className="mt-10 inline-flex items-center gap-3 px-4 py-2 border" style={{ borderColor: T.rule, background: T.paper2 }}>
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", color: T.muted, textTransform: "uppercase" }}>Issue № 008 · Archive</span>
            </div>
            <h1 className="mt-6" style={{ fontFamily: SERIF, fontSize: 110, lineHeight: 0.92, letterSpacing: "-0.045em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
              Retinal vs retinol, <br />
              <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>finally settled.</span>
            </h1>
            <p className="mt-9 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>
              A reader asked us to settle it. We read 31 studies. The answer depends on which question you mean — but on three specific formats, the verdict is now clear.
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

    <TrendWatchRelated component="TrendWatch008" />

    <SiteFooter />
  </div>
);

export default TrendWatch008;
