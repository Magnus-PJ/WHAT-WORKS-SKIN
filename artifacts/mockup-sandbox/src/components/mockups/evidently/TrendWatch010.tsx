// TrendWatch010 — Issue 010 archive: Mineral SPF catches up; reef-safe & SPF moisturisers.

import React from "react";
import { T } from "./_theme";
import {
  SiteHeader, SiteFooter, Breadcrumbs, Container, Eyebrow, TierBadge,
  PaperGrain, LaidPaper, ColumnRules, TopVignette, AmbientFlask,
  SERIF, SERIF_ED, SANS, MONO,
} from "./_chrome";
import TrendWatchRelated from "./_TrendWatchRelated";

const VERDICTS = [
  { n: "01", name: "New zinc-only PA++++ filters", tier: "A" as const, verdict: "Holds Up", color: T.tierA,
    body: "Four mineral SPF 50 formulations now hit PA++++ UVA protection — historically the territory of chemical filters alone. Optimised dispersion and finer particle size are the reasons. Cosmetic acceptability has improved enough that we now recommend mineral as the default for sensitive, post-procedure, and paediatric skin. The chemical category leaders remain marginally more elegant; the gap is the narrowest it has been in fifteen years.",
    bottom: "Mineral has caught up. Choose by texture and finish, not by category panic." },
  { n: "02", name: "'Reef-safe' marketing claims", tier: "D" as const, verdict: "Misleading", color: T.tierD,
    body: "There is no regulatory definition of 'reef-safe.' The phrase typically excludes oxybenzone and octinoxate (reasonably, given the Hawaii ban evidence) but is silent on the much larger consumer-protection concern: real-world UVA protection. Several 'reef-safe' fluids underperform on UVA-PF, the variable that matters most for skin aging. Buy by SPF, by UVA-PF, and by re-application behaviour — not by a marketing claim with no agreed referent.",
    bottom: "A meaningless badge. UVA-PF is the metric, not reef rhetoric." },
  { n: "03", name: "SPF in moisturisers", tier: "D" as const, verdict: "Skip", color: T.tierD,
    body: "Moisturisers labelled 'SPF 30' almost never deliver SPF 30 in real-world use. The application thickness assumed by the label test (2 mg/cm²) is almost three times what people apply when using a moisturiser. The result, repeatedly demonstrated in independent testing, is real-world protection of SPF 8–12 — useful, but a long way from advertised. Use a dedicated sunscreen as the last AM step.",
    bottom: "Marketing convenience. Apply a real sunscreen as a separate step." },
];

const TrendWatch010: React.FC = () => (
  <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
    <LaidPaper />
    <SiteHeader active="Trend Watch" />
    <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Trend Watch", href: "#" }, { label: "Issue 010 · Archive" }]} />

    <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
      <TopVignette /><PaperGrain /><ColumnRules opacity={0.32} />
      <div aria-hidden className="absolute -right-16 -top-16 z-0"><AmbientFlask size={580} opacity={0.06} /></div>
      <Container>
        <div className="relative grid grid-cols-12 gap-10 py-24">
          <div className="col-span-12 lg:col-span-9 lg:pl-12">
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
              <Eyebrow color={T.accent}>Trend Watch · Issue 010 · 23 February 2026</Eyebrow>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>ARCHIVE</div>
            </div>
            <div className="mt-10 inline-flex items-center gap-3 px-4 py-2 border" style={{ borderColor: T.rule, background: T.paper2 }}>
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", color: T.muted, textTransform: "uppercase" }}>Issue № 010 · Archive</span>
            </div>
            <h1 className="mt-6" style={{ fontFamily: SERIF, fontSize: 110, lineHeight: 0.92, letterSpacing: "-0.045em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
              Mineral SPF, <br />
              <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>quietly catching up.</span>
            </h1>
            <p className="mt-9 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>
              We tested four new zinc-only formulations against the chemical category leader. The category gap is real, and it is closing. Two adjacent claims, however, remain marketing.
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

    <TrendWatchRelated component="TrendWatch010" />

    <SiteFooter />
  </div>
);

export default TrendWatch010;
