// TrendWatch013 — Issue 013 archive: Snail mucin, Polyglutamic Acid, Skin Cycling.

import React from "react";
import { ArrowRight, Bookmark, Share2, AlertTriangle } from "lucide-react";
import { T } from "./_theme";
import {
  SiteHeader, SiteFooter, Breadcrumbs, Container, Eyebrow, Folio, TierBadge,
  PaperGrain, LaidPaper, ColumnRules, TopVignette, Asterism, AmbientFlask,
  SERIF, SERIF_ED, SANS, MONO,
} from "./_chrome";
import TrendWatchRelated from "./_TrendWatchRelated";

const VERDICTS = [
  {
    n: "01",
    name: "Snail Mucin (Cosrx Advanced Snail 96)",
    tier: "B" as const,
    verdict: "Mostly Worth It",
    color: T.tierB,
    body: "Snail-secretion filtrate (SSF) at 96% is a humectant + glycoprotein cocktail with a small but replicated hydration and barrier-repair signal. The K-beauty cult treats it as a hero; the literature treats it as a competent moisturiser. Use as a hydrating layer in dry weather; it is not, however, an active ingredient and will not displace niacinamide or ceramides.",
    bottom: "Worth the ₹ 700–1,200 if you genuinely enjoy the texture; not worth the K-beauty premium beyond that."
  },
  {
    n: "02",
    name: "Polyglutamic Acid",
    tier: "B" as const,
    verdict: "Real, Modest",
    color: T.tierB,
    body: "PGA is a high-molecular-weight humectant that forms a thin film on skin and reportedly holds 4× the water of hyaluronic acid in vitro. The in-vivo data is positive but small. As a secondary humectant it works fine — but it is not the 'next-gen HA' some marketing implies. Hyaluronic acid + glycerin is cheaper and reaches similar endpoints.",
    bottom: "Useful in dry climates; redundant in humid ones. Not a must-buy."
  },
  {
    n: "03",
    name: "Skin Cycling (Whitney Bowe)",
    tier: "A" as const,
    verdict: "Excellent Idea",
    color: T.tierA,
    body: "The protocol — exfoliant Night 1, retinoid Night 2, recovery nights 3 and 4, repeat — is essentially a structured way to ladder a beginner into actives without barrier injury. There is nothing radical here; it's how derms have always introduced retinoids. The contribution is the naming and the schedule, both of which are genuinely useful.",
    bottom: "Adopt the framework. Skip the branded products."
  },
];

const TrendWatch013: React.FC = () => (
  <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
    <LaidPaper />
    <SiteHeader active="Trend Watch" />
    <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Trend Watch", href: "#" }, { label: "Issue 013 · Archive" }]} />

    <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
      <TopVignette /><PaperGrain /><ColumnRules opacity={0.32} />
      <div aria-hidden className="absolute -right-16 -top-16 z-0"><AmbientFlask size={580} opacity={0.06} /></div>

      <Container>
        <div className="relative grid grid-cols-12 gap-10 py-24">
          <div className="col-span-12 lg:col-span-9 lg:pl-12">
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
              <Eyebrow color={T.accent}>Trend Watch · Issue 013 · 06 April 2026</Eyebrow>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>ARCHIVE</div>
            </div>

            <div className="mt-10 inline-flex items-center gap-3 px-4 py-2 border" style={{ borderColor: T.rule, background: T.paper2 }}>
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", color: T.muted, textTransform: "uppercase" }}>Issue № 013 · Archive</span>
            </div>

            <h1 className="mt-6" style={{ fontFamily: SERIF, fontSize: 110, lineHeight: 0.92, letterSpacing: "-0.045em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
              Snails, polymers, <br />
              <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>and a useful framework.</span>
            </h1>

            <p className="mt-9 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>
              Three trends the algorithm fed us in the last fortnight, audited and graded. Two are humectants of varying value; one is a genuinely useful framework dressed up in branded packaging.
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

    <TrendWatchRelated component="TrendWatch013" />

    <SiteFooter />
  </div>
);

export default TrendWatch013;
