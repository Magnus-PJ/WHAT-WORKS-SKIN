// TrendWatch001 — Issue 001 archive: Launch issue manifesto.

import React from "react";
import { T } from "./_theme";
import {
  SiteHeader, SiteFooter, Breadcrumbs, Container, Eyebrow, TierBadge,
  PaperGrain, LaidPaper, ColumnRules, TopVignette, AmbientFlask,
  SERIF, SERIF_ED, SANS, MONO,
} from "./_chrome";
import TrendWatchRelated from "./_TrendWatchRelated";

const VERDICTS = [
  { n: "01", name: "10-step K-beauty routines", tier: "D" as const, verdict: "Misleading", color: T.tierD,
    body: "The aesthetic appeal of an elaborate routine is real; the marginal benefit beyond a competent four-step protocol is, as far as the literature goes, indistinguishable from zero. Most of the steps in a 10-step regimen are duplicate humectants in different bottles, plus a couple of essences whose function the moisturiser already covers. The category sells variety, not endpoints. We are happy for anyone who enjoys it as a ritual — but the line at which we are willing to call something 'evidence-supported' sits well below ten products.",
    bottom: "Pleasing as ritual. Indefensible as efficacy. Five steps is plenty." },
  { n: "02", name: "Daily SPF (high UVA-PF)", tier: "A" as const, verdict: "Holds Up", color: T.tierA,
    body: "If we could only recommend one habit on the entire site, this would be it. The single most-replicated finding in cosmetic dermatology is that consistent daily application of broad-spectrum, high-UVA-PF sunscreen prevents both photo-aging and the slow accumulation of pigmentary disorder. The 2024 update of the long-running Australian RCT confirmed what we already knew: people who applied SPF 30+ daily for 4.5 years had measurably less photo-aging than the control group. Apply two finger-lengths. Reapply if outdoors.",
    bottom: "The single highest-leverage step in any routine. Two finger-lengths, every morning." },
  { n: "03", name: "'Skin types' as fixed identity", tier: "B" as const, verdict: "Partly True", color: T.tierB,
    body: "The Fitzpatrick scale is useful; the consumer language of 'I have combination skin' less so. Skin shifts seasonally, hormonally, with age, with climate. Treating one's skin type as a fixed identity locks people into product categories that no longer match what their skin is actually doing. The more useful question is 'what is my skin doing right now?' — answered every six to eight weeks. The four-square 'oily / dry / combination / sensitive' grid we have used for 40 years deserves retirement.",
    bottom: "Useful starting frame; bad as fixed identity. Re-assess seasonally." },
];

const TrendWatch001: React.FC = () => (
  <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
    <LaidPaper />
    <SiteHeader active="Trend Watch" />
    <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Trend Watch", href: "#" }, { label: "Issue 001 · Archive" }]} />

    <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
      <TopVignette /><PaperGrain /><ColumnRules opacity={0.32} />
      <div aria-hidden className="absolute -right-16 -top-16 z-0"><AmbientFlask size={580} opacity={0.06} /></div>
      <Container>
        <div className="relative grid grid-cols-12 gap-10 py-24">
          <div className="col-span-12 lg:col-span-9 lg:pl-12">
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
              <Eyebrow color={T.accent}>Trend Watch · Issue 001 · 20 October 2025 · Launch</Eyebrow>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>ARCHIVE</div>
            </div>
            <div className="mt-10 inline-flex items-center gap-3 px-4 py-2 border" style={{ borderColor: T.rule, background: T.paper2 }}>
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", color: T.muted, textTransform: "uppercase" }}>Issue № 001 · Founding</span>
            </div>
            <h1 className="mt-6" style={{ fontFamily: SERIF, fontSize: 110, lineHeight: 0.92, letterSpacing: "-0.045em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
              The launch issue. <br />
              <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>What we believe in.</span>
            </h1>
            <p className="mt-9 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>
              A founding manifesto disguised as a verdict column. Three trends, no advertisers, and three positions we would still defend in clinic the day this issue went live.
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

    <TrendWatchRelated component="TrendWatch001" />

    <SiteFooter />
  </div>
);

export default TrendWatch001;
