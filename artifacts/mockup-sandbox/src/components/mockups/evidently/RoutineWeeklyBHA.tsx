// RoutineWeeklyBHA — The weekly BHA reset.

import React from "react";
import { Sparkles, Clock, IndianRupee, Bookmark, Share2, ArrowRight, Check } from "lucide-react";
import { T } from "./_theme";
import {
  SiteHeader, SiteFooter, Breadcrumbs, Container, Eyebrow, Folio, TierBadge,
  PaperGrain, LaidPaper, ColumnRules, TopVignette,
  SERIF, SERIF_ED, SANS, MONO,
} from "./_chrome";
import { EditorPageLink } from "./_EditorPageLink";
import { linkifyText } from "./_links";

import { RoutineProductPick } from "./_RoutineProductPick";
export const STEPS = [
  { n: "01", time: "Step 1", title: "Kaolin clay mask", sub: "10 minutes, do not let dry fully",
    body: "A 10-minute clay mask draws sebum and surface debris without the over-drying that comes from leaving it on until cracking. Apply to clean, slightly damp skin. The mask should still feel cool when you remove it.",
    products: [{ brand: "L'Oréal", name: "Pure Clay Detox Mask", note: "Default", tier: "A" as const }, { brand: "Innisfree", name: "Volcanic Pore Clay Mask", note: "Premium", tier: "A" as const }] },
  { n: "02", time: "Step 2", title: "BHA 2% leave-on", sub: "15-minute dwell, do not rinse",
    body: "After the clay mask is removed, apply a thin layer of 2% salicylic acid to dry skin. Allow it to dwell for 15 minutes — this is the active step that delivers the actual exfoliation. Do not stack with retinoids on the same night.",
    products: [{ brand: "Paula's Choice", name: "Skin Perfecting 2% BHA Liquid", note: "Default", tier: "A" as const }, { brand: "The Ordinary", name: "Salicylic Acid 2% Solution", note: "Budget", tier: "A" as const }] },
  { n: "03", time: "Step 3", title: "Barrier seal moisturiser", sub: "Generous, ceramide-rich",
    body: "After the BHA dwell, apply a thicker-than-usual layer of ceramide moisturiser. The night of the reset is not the night to add anything else — no retinoid, no acid serum, no fragrance. The point is recovery as much as exfoliation.",
    products: [{ brand: "CeraVe", name: "Moisturising Cream", note: "Default", tier: "A" as const }, { brand: "Bioderma", name: "Atoderm Cream", note: "Premium", tier: "A" as const }] },
];

const RoutineWeeklyBHA: React.FC = () => (
  <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
    <LaidPaper />
    <SiteHeader active="Routines" />
    <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Routines", href: "#" }, { label: "Weekly · Pore reset" }]} />

    <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
      <TopVignette /><PaperGrain /><ColumnRules opacity={0.32} />
      <Container>
        <div className="relative grid grid-cols-12 gap-10 py-24">
          <div className="col-span-12 lg:col-span-8 lg:pl-12">
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
              <Eyebrow color={T.accent}>Routine · Weekly · Pore reset</Eyebrow>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>P. 11 · PROTOCOL</div>
            </div>
            <div className="mt-8 flex items-center gap-3">
              <Sparkles className="h-5 w-5" style={{ color: T.accent }} />
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", color: T.muted, textTransform: "uppercase" }}>3 Steps · 15 min · Intermediate</span>
            </div>
            <h1 className="mt-6" style={{ fontFamily: SERIF, fontSize: 108, lineHeight: 0.93, letterSpacing: "-0.045em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
              The weekly <br />
              <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>BHA reset.</span>
            </h1>
            <p className="mt-9 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>
              A once-weekly clay-then-BHA-then-seal that resets pore congestion without stacking on top of an existing retinoid routine. Built for combination and oily skin already running an adult-acne stack who want one targeted exfoliation moment without compounding irritation.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <button className="inline-flex items-center gap-2 px-5 py-3" style={{ background: T.ink, color: T.paper, fontFamily: SANS, fontSize: 13, fontWeight: 500 }}>Print the protocol <ArrowRight className="h-4 w-4" /></button>
              <button className="inline-flex items-center gap-2 border px-5 py-3" style={{ borderColor: T.rule, fontFamily: SANS, fontSize: 13, color: T.ink }}><Bookmark className="h-3.5 w-3.5" /> Save</button>
              <button className="inline-flex items-center gap-2 border px-5 py-3" style={{ borderColor: T.rule, fontFamily: SANS, fontSize: 13, color: T.ink }}><Share2 className="h-3.5 w-3.5" /> Share</button>
            </div>
          </div>
          <aside className="col-span-12 lg:col-span-4">
            <div className="border" style={{ borderColor: T.rule, background: T.paper }}>
              <div className="px-6 py-4 border-b" style={{ borderColor: T.rule, background: T.paper2 }}>
                <Eyebrow color={T.accent}>At a glance</Eyebrow>
              </div>
              <div className="grid grid-cols-3">
                {[{ i: <Clock className="h-4 w-4" />, k: "Time", v: "15 min" }, { i: <span style={{ fontFamily: SERIF, fontSize: 18 }}>★</span>, k: "Skill", v: "Intermediate" }, { i: <IndianRupee className="h-4 w-4" />, k: "Cost", v: "₹ 2k" }].map((m, i) => (
                  <div key={m.k} className="flex flex-col items-center justify-center py-7 px-3" style={{ borderRight: i < 2 ? `1px solid ${T.rule}` : "none" }}>
                    <span style={{ color: T.accent }}>{m.i}</span>
                    <span className="mt-3" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft, textTransform: "uppercase" }}>{m.k}</span>
                    <span className="mt-1" style={{ fontFamily: SERIF, fontSize: 18, color: T.ink, fontWeight: 400, fontVariationSettings: '"opsz" 144' }}>{m.v}</span>
                  </div>
                ))}
              </div>
              <div className="border-t px-6 py-5" style={{ borderColor: T.rule }}>
                <Eyebrow>Built for</Eyebrow>
                <ul className="mt-4 space-y-2" style={{ fontFamily: SANS, fontSize: 13, color: T.inkSoft, lineHeight: 1.55 }}>
                  {["Combination & oily skin", "Comedonal congestion", "Once weekly only", "Pair with retinoid-free night"].map(b => (
                    <li key={b} className="flex gap-2 items-center"><Check className="h-3 w-3" style={{ color: T.tierA }} />{b}</li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </section>

    <section className="relative z-10 border-b" style={{ borderColor: T.rule }}>
      <Container>
        <div className="py-20">
          {STEPS.map((s, i) => (
            <article key={s.n} className="grid grid-cols-12 gap-10 py-16" style={{ borderTop: i === 0 ? "none" : `1px solid ${T.rule}` }}>
              <div className="col-span-12 lg:col-span-2">
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.18em", color: T.mutedSoft, textTransform: "uppercase" }}>{s.time}</div>
                <div className="mt-2" style={{ fontFamily: SERIF, fontSize: 110, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.accent, lineHeight: 0.85, letterSpacing: "-0.05em" }}>{s.n}</div>
              </div>
              <div className="col-span-12 lg:col-span-7">
                <h3 style={{ fontFamily: SERIF, fontSize: 48, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, lineHeight: 1, letterSpacing: "-0.025em" }}>{s.title}</h3>
                <div className="mt-3" style={{ fontFamily: SERIF, fontSize: 19, fontStyle: "italic", color: T.muted }}>{s.sub}</div>
                <p className="mt-7 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 17.5, lineHeight: 1.65, color: T.inkSoft }}>{linkifyText(s.body)}</p>
              </div>
              <aside className="col-span-12 lg:col-span-3">
                <div className="border p-5" style={{ borderColor: T.rule, background: T.paper2 }}>
                  <Eyebrow>Recommended</Eyebrow>
                  <ul className="mt-4 space-y-4">
                    {s.products.map(p => (
                      <RoutineProductPick key={p.name} p={p} pageSlug="RoutineWeeklyBHA" />
                    ))}
                  </ul>
                </div>
              </aside>
            </article>
          ))}
        </div>
      </Container>
    </section>

    <EditorPageLink pageKind="routine" pageSlug="RoutineWeeklyBHA" />
    <SiteFooter />
  </div>
);

export default RoutineWeeklyBHA;
