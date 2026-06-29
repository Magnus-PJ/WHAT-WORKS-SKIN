// TrendWatch003 — Issue 003 archive: The peptide gold rush, sorted.

import React from "react";
import { T } from "./_theme";
import {
  SiteHeader, SiteFooter, Breadcrumbs, Container, Eyebrow, TierBadge,
  PaperGrain, LaidPaper, ColumnRules, TopVignette, AmbientFlask,
  SERIF, SERIF_ED, SANS, MONO,
} from "./_chrome";
import TrendWatchRelated from "./_TrendWatchRelated";

const VERDICTS = [
  { n: "01", name: "GHK-Cu 1% (copper tripeptide)", tier: "B" as const, verdict: "Partly True", color: T.tierB,
    body: "Copper peptides have a respectable basic-science file: GHK binds copper, and the resulting complex modulates wound-healing pathways in cell culture. The translation to topical cosmetic outcomes is real but small, and most positive trials use compositions that match the original patent rather than the bargain-shelf reformulations sold at one-tenth the price. Pair sensibly with a retinoid; do not stack with vitamin C, which destabilises the complex.",
    bottom: "Real molecule, modest endpoints. Buy serious formulations or skip." },
  { n: "02", name: "Matrixyl 3000 (palmitoyl tripeptide-1 + tetrapeptide-7)", tier: "A" as const, verdict: "Holds Up", color: T.tierA,
    body: "The peptide complex with the most reproducible 12-week wrinkle data, including independent (non-Sederma) trials. Mechanism is plausible (collagen and hyaluronan signalling), the formulations on shelf are stable, and the 5%–8% inclusion levels seen in serious products correspond to the published doses. Not retinoid-replacing — but the most defensible peptide in the category for prevention-stage anti-aging stacks.",
    bottom: "The peptide we actually recommend. Use alongside a retinoid, not instead of it." },
  { n: "03", name: "Argireline (acetyl hexapeptide-8)", tier: "D" as const, verdict: "Misleading", color: T.tierD,
    body: "Re-graded down. We weighted the early industry-funded trials too heavily in our original read; the independent literature, when assembled, does not support the 'topical Botox' claim. The molecule is too large to penetrate to the dermis at the concentrations used, and SNAP-25 inhibition by topical application has not been demonstrated in vivo. A reasonable humectant; a poor neuromodulator.",
    bottom: "We were wrong on first pass. The independent data does not support the marketing." },
];

const TrendWatch003: React.FC = () => (
  <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
    <LaidPaper />
    <SiteHeader active="Trend Watch" />
    <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Trend Watch", href: "#" }, { label: "Issue 003 · Archive" }]} />

    <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
      <TopVignette /><PaperGrain /><ColumnRules opacity={0.32} />
      <div aria-hidden className="absolute -right-16 -top-16 z-0"><AmbientFlask size={580} opacity={0.06} /></div>
      <Container>
        <div className="relative grid grid-cols-12 gap-10 py-24">
          <div className="col-span-12 lg:col-span-9 lg:pl-12">
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
              <Eyebrow color={T.accent}>Trend Watch · Issue 003 · 17 November 2025</Eyebrow>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>ARCHIVE</div>
            </div>
            <div className="mt-10 inline-flex items-center gap-3 px-4 py-2 border" style={{ borderColor: T.rule, background: T.paper2 }}>
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", color: T.muted, textTransform: "uppercase" }}>Issue № 003 · Archive</span>
            </div>
            <h1 className="mt-6" style={{ fontFamily: SERIF, fontSize: 110, lineHeight: 0.92, letterSpacing: "-0.045em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
              The peptide <br />
              <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>gold rush, sorted.</span>
            </h1>
            <p className="mt-9 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>
              Copper peptides, GHK, Matrixyl, palmitoyl tripeptide-1. We sorted the peptide aisle by what the independent literature actually supports — and revised one of our own grades downward.
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

    <TrendWatchRelated component="TrendWatch003" />

    <SiteFooter />
  </div>
);

export default TrendWatch003;
