// TrendWatch012 — Issue 012 archive: Collagen drinks, exosomes, "skin gut" probiotics.

import React from "react";
import { T } from "./_theme";
import {
  SiteHeader, SiteFooter, Breadcrumbs, Container, Eyebrow, TierBadge,
  PaperGrain, LaidPaper, ColumnRules, TopVignette, AmbientFlask,
  SERIF, SERIF_ED, SANS, MONO,
} from "./_chrome";
import TrendWatchRelated from "./_TrendWatchRelated";

const VERDICTS = [
  {
    n: "01",
    name: "Liquid Collagen Drinks",
    tier: "C" as const,
    verdict: "Marketing Premium",
    color: T.tierC,
    body: "Most beauty 'collagen drinks' (Hum, Vital, Crushed Tonic) deliver 5–10 g of collagen peptides identical to powder format, plus added sugar, flavours, and ₹ 200 per dose of bottling cost. The active ingredient works (see our Collagen Peptides brief) — the delivery format is a tax. Powder, mixed into coffee, gives the same endpoint at one-third the cost.",
    bottom: "Same molecule. 3× the price. Buy the powder."
  },
  {
    n: "02",
    name: "Topical Exosomes (post-procedure)",
    tier: "C" as const,
    verdict: "Premature",
    color: T.tierC,
    body: "Exosomes are nano-vesicles released by cells; in vitro and animal data on wound healing are genuinely interesting. Human topical-cosmetic data is, at this point, very thin — no large RCTs, regulatory frameworks unclear, and the 'plant-derived exosomes' marketed by most clinics may not be exosomes at all by accepted molecular biology criteria. Charging ₹ 25,000 per facial for a poorly characterised ingredient is, kindly, premature.",
    bottom: "Wait for the human RCTs. Save the money for sunscreen."
  },
  {
    n: "03",
    name: "Skin-Gut Axis Probiotics (oral)",
    tier: "C" as const,
    verdict: "Promising, Unclear",
    color: T.tierC,
    body: "The skin-gut-microbiome axis is real and an active research area. The available human RCTs of oral probiotics (Lactobacillus rhamnosus, Bifidobacterium) for atopic dermatitis show modest improvement in children; adult skin-condition data is much thinner. The marketing has galloped well ahead of the literature. If you have eczema-prone children, worth a conversation with your derm. For adult 'glow' — the evidence does not yet support the spend.",
    bottom: "Real research direction. Premature consumer market. Wait three years."
  },
];

const TrendWatch012: React.FC = () => (
  <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
    <LaidPaper />
    <SiteHeader active="Trend Watch" />
    <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Trend Watch", href: "#" }, { label: "Issue 012 · Archive" }]} />

    <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
      <TopVignette /><PaperGrain /><ColumnRules opacity={0.32} />
      <div aria-hidden className="absolute -right-16 -top-16 z-0"><AmbientFlask size={580} opacity={0.06} /></div>

      <Container>
        <div className="relative grid grid-cols-12 gap-10 py-24">
          <div className="col-span-12 lg:col-span-9 lg:pl-12">
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
              <Eyebrow color={T.accent}>Trend Watch · Issue 012 · 23 March 2026</Eyebrow>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>ARCHIVE</div>
            </div>

            <div className="mt-10 inline-flex items-center gap-3 px-4 py-2 border" style={{ borderColor: T.rule, background: T.paper2 }}>
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", color: T.muted, textTransform: "uppercase" }}>Issue № 012 · Archive</span>
            </div>

            <h1 className="mt-6" style={{ fontFamily: SERIF, fontSize: 110, lineHeight: 0.92, letterSpacing: "-0.045em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
              Drinkable collagen, <br />
              <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>exosomes & gut-skin.</span>
            </h1>

            <p className="mt-9 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>
              Three categories whose marketing is a generation ahead of their evidence. None are scams — but all carry premiums the data does not justify. The pattern, when you see it twice, is not coincidence.
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

    <TrendWatchRelated component="TrendWatch012" />

    <SiteFooter />
  </div>
);

export default TrendWatch012;
