// TrendWatch005 — Issue 005 archive: Microneedling at home, a careful no.

import React from "react";
import { T } from "./_theme";
import {
  SiteHeader, SiteFooter, Breadcrumbs, Container, Eyebrow, TierBadge,
  PaperGrain, LaidPaper, ColumnRules, TopVignette, AmbientFlask,
  SERIF, SERIF_ED, SANS, MONO,
} from "./_chrome";
import TrendWatchRelated from "./_TrendWatchRelated";

const VERDICTS = [
  { n: "01", name: "0.5 mm at-home dermarollers", tier: "D" as const, verdict: "Skip", color: T.tierD,
    body: "Two new dermaroller brands sent us samples. The 0.5 mm needle length crosses into wound territory: real bleeding, real disruption of the stratum corneum, real infection risk in non-clinical hands. The cosmetic-grade rollers tested showed measurable burr defects under microscopy after one use, which compounds the trauma rather than the benefit. The procedure-grade alternative (clinic SkinPen, Dermapen) operates at controlled depth, with sterile single-use cartridges, and produces the published outcomes. Roller use at home produces injuries; clinic use produces results.",
    bottom: "Send the rollers back. Book a clinic session if you want the endpoint." },
  { n: "02", name: "0.25 mm dermastamps", tier: "B" as const, verdict: "Partly True", color: T.tierB,
    body: "Below 0.3 mm needle length, the procedure shifts from wounding to topical-penetration enhancement, and the safety profile narrows substantially. The literature on 0.2–0.25 mm dermastamps as adjuncts for topical actives is small but generally positive — particularly for vitamin C, peptide, and growth-factor delivery. Sterile single-use stamps, clean skin, and a sensible product to deliver afterwards. Not a replacement for clinical microneedling; a defensible at-home enhancer when used with discipline.",
    bottom: "Defensible at 0.2–0.25 mm. Above that, see a clinic." },
];

const TrendWatch005: React.FC = () => (
  <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
    <LaidPaper />
    <SiteHeader active="Trend Watch" />
    <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Trend Watch", href: "#" }, { label: "Issue 005 · Archive" }]} />

    <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
      <TopVignette /><PaperGrain /><ColumnRules opacity={0.32} />
      <div aria-hidden className="absolute -right-16 -top-16 z-0"><AmbientFlask size={580} opacity={0.06} /></div>
      <Container>
        <div className="relative grid grid-cols-12 gap-10 py-24">
          <div className="col-span-12 lg:col-span-9 lg:pl-12">
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
              <Eyebrow color={T.accent}>Trend Watch · Issue 005 · 15 December 2025</Eyebrow>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>ARCHIVE</div>
            </div>
            <div className="mt-10 inline-flex items-center gap-3 px-4 py-2 border" style={{ borderColor: T.rule, background: T.paper2 }}>
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", color: T.muted, textTransform: "uppercase" }}>Issue № 005 · Archive</span>
            </div>
            <h1 className="mt-6" style={{ fontFamily: SERIF, fontSize: 110, lineHeight: 0.92, letterSpacing: "-0.045em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
              Microneedling at home, <br />
              <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>a careful no.</span>
            </h1>
            <p className="mt-9 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>
              Two new derma-roller brands sent us samples. We sent them back. The category needs a careful distinction — between needle lengths, between rollers and stamps, and between clinic and bathroom.
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

    <TrendWatchRelated component="TrendWatch005" />

    <SiteFooter />
  </div>
);

export default TrendWatch005;
