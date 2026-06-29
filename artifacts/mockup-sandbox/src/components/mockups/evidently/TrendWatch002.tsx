// TrendWatch002 — Issue 002 archive: Slugging, vaseline, and the petrolatum question.

import React from "react";
import { T } from "./_theme";
import {
  SiteHeader, SiteFooter, Breadcrumbs, Container, Eyebrow, TierBadge,
  PaperGrain, LaidPaper, ColumnRules, TopVignette, AmbientFlask,
  SERIF, SERIF_ED, SANS, MONO,
} from "./_chrome";
import TrendWatchRelated from "./_TrendWatchRelated";

const VERDICTS = [
  { n: "01", name: "Overnight slugging (full-face)", tier: "B" as const, verdict: "Partly True", color: T.tierB,
    body: "Petrolatum's TEWL-reduction credentials are essentially uncontested — it cuts transepidermal water loss by ~99% and has 60+ years of dermatology use behind it. Whether you should slug your whole face every night depends on skin type. For very dry, low-sebum, mature skin in winter, the practice is reasonable and well-tolerated. For oily, acne-prone, or combination skin, occluding the face overnight is a recipe for follicular irritation and breakouts within two to three weeks. Map it to your skin, not to the trend.",
    bottom: "Defensible for dry skin in winter. A bad idea for oily or acne-prone surfaces." },
  { n: "02", name: "Petrolatum on barrier flares", tier: "A" as const, verdict: "Holds Up", color: T.tierA,
    body: "Targeted, short-term petrolatum application on cracked corners, peri-procedure, eczema flare patches, and post-laser areas is one of the most evidence-supported moves in dermatology. It is the reference occlusive against which every barrier cream is measured, and we use it routinely in clinic. Branded balms (Aquaphor, Vaseline Healing Jelly) are often appropriate; the generic plain white petroleum jelly is, for most cases, indistinguishable.",
    bottom: "The reference occlusive. Use as targeted spot-treatment, not as identity." },
  { n: "03", name: "Slugging over actives (BHA, retinoid, AHA)", tier: "D" as const, verdict: "Misleading", color: T.tierD,
    body: "The most consequential slugging mistake we see is occlusion over freshly-applied actives. Petrolatum dramatically increases the residence time and effective dose of whatever sits underneath it, which is exactly what you do not want with a retinoid, BHA, or AHA. The result is a category of barrier injury that did not exist five years ago. If you are slugging, do it over a moisturiser layer — never directly over an active.",
    bottom: "Slug over moisturiser. Never over a retinoid or acid." },
];

const TrendWatch002: React.FC = () => (
  <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
    <LaidPaper />
    <SiteHeader active="Trend Watch" />
    <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Trend Watch", href: "#" }, { label: "Issue 002 · Archive" }]} />

    <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
      <TopVignette /><PaperGrain /><ColumnRules opacity={0.32} />
      <div aria-hidden className="absolute -right-16 -top-16 z-0"><AmbientFlask size={580} opacity={0.06} /></div>
      <Container>
        <div className="relative grid grid-cols-12 gap-10 py-24">
          <div className="col-span-12 lg:col-span-9 lg:pl-12">
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
              <Eyebrow color={T.accent}>Trend Watch · Issue 002 · 03 November 2025</Eyebrow>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>ARCHIVE</div>
            </div>
            <div className="mt-10 inline-flex items-center gap-3 px-4 py-2 border" style={{ borderColor: T.rule, background: T.paper2 }}>
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", color: T.muted, textTransform: "uppercase" }}>Issue № 002 · Archive</span>
            </div>
            <h1 className="mt-6" style={{ fontFamily: SERIF, fontSize: 110, lineHeight: 0.92, letterSpacing: "-0.045em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
              Slugging, vaseline, <br />
              <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>and petrolatum.</span>
            </h1>
            <p className="mt-9 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>
              TikTok rediscovered occlusion. We re-read the dermatology literature so you don't have to. Useful technique, mismatched audience, one rule that the trend keeps breaking.
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

    <TrendWatchRelated component="TrendWatch002" />

    <SiteFooter />
  </div>
);

export default TrendWatch002;
