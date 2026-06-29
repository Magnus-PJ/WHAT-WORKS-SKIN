// RoutinePMAging — Tretinoin without the chaos.

import React from "react";
import { Moon, Clock, IndianRupee, Bookmark, Share2, ArrowRight, Check } from "lucide-react";
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
  { n: "01", time: "PM", title: "Oil cleanser, then cream cleanser", sub: "Double cleanse, gentle",
    body: "An oil-then-cream double cleanse removes mineral SPF and the day's oxidative load without stripping the barrier. The single most-skipped step in PM anti-aging routines, and the one that determines whether tretinoin will actually be tolerated.",
    products: [{ brand: "DHC", name: "Deep Cleansing Oil", note: "Default oil", tier: "A" as const }, { brand: "Cetaphil", name: "Gentle Cleanser", note: "Cream step", tier: "A" as const }] },
  { n: "02", time: "PM", title: "Buffered tretinoin 0.025%", sub: "Wait 20 min, sandwich method",
    body: "Apply a pea-sized amount of tretinoin to a thin moisturiser layer (the buffer) on dry skin. Start twice weekly for two weeks, then alternate nights for four weeks, then nightly. The 12-week ramp matters far more than the strength.",
    products: [{ brand: "Galderma", name: "Retino-A 0.025%", note: "Default", tier: "A" as const }, { brand: "Janssen", name: "Retin-A Micro 0.04%", note: "Premium", tier: "A" as const }] },
  { n: "03", time: "PM", title: "Ceramide-rich night cream", sub: "Generous, occlusive",
    body: "The barrier-protecting layer that closes the sandwich. A ceramide + cholesterol + fatty acid blend in a richer texture preserves the lipid bilayer that tretinoin transiently disrupts. Apply 5–10 minutes after the tretinoin.",
    products: [{ brand: "CeraVe", name: "PM Facial Lotion", note: "Default", tier: "A" as const }, { brand: "La Roche-Posay", name: "Toleriane Riche", note: "Premium", tier: "A" as const }] },
  { n: "04", time: "PM", title: "Lip + eye occlusive", sub: "Targeted, petrolatum-based",
    body: "The first signs of tretinoin retinisation appear at the perioral and periorbital margins. A small petrolatum dot at these zones — applied before the tretinoin — preempts the cracking that would otherwise force you to pause the protocol.",
    products: [{ brand: "Aquaphor", name: "Healing Ointment", note: "Default", tier: "A" as const }, { brand: "Vaseline", name: "Original", note: "Budget", tier: "A" as const }] },
];

const RoutinePMAging: React.FC = () => (
  <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
    <LaidPaper />
    <SiteHeader active="Routines" />
    <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Routines", href: "#" }, { label: "PM · 35+ skin" }]} />

    <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
      <TopVignette /><PaperGrain /><ColumnRules opacity={0.32} />
      <Container>
        <div className="relative grid grid-cols-12 gap-10 py-24">
          <div className="col-span-12 lg:col-span-8 lg:pl-12">
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
              <Eyebrow color={T.accent}>Routine · PM · 35+ skin</Eyebrow>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>P. 15 · PROTOCOL</div>
            </div>
            <div className="mt-8 flex items-center gap-3">
              <Moon className="h-5 w-5" style={{ color: T.accent }} />
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", color: T.muted, textTransform: "uppercase" }}>4 Steps · 11 min · Advanced</span>
            </div>
            <h1 className="mt-6" style={{ fontFamily: SERIF, fontSize: 108, lineHeight: 0.93, letterSpacing: "-0.045em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
              Tretinoin without <br />
              <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>the chaos.</span>
            </h1>
            <p className="mt-9 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>
              Buffered tretinoin protocol with ceramide sandwich. Built for the 12-week ramp that everyone skips and then blames the molecule for. The most under-prescribed PM routine for 35+ skin in our consultations.
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
                {[{ i: <Clock className="h-4 w-4" />, k: "Time", v: "11 min" }, { i: <span style={{ fontFamily: SERIF, fontSize: 18 }}>★</span>, k: "Skill", v: "Advanced" }, { i: <IndianRupee className="h-4 w-4" />, k: "Cost", v: "₹ 5–9k" }].map((m, i) => (
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
                  {["Mature / normal skin", "12-week tretinoin ramp", "Pairs with AM C + SPF", "Not in pregnancy"].map(b => (
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
                      <RoutineProductPick key={p.name} p={p} pageSlug="RoutinePMAging" />
                    ))}
                  </ul>
                </div>
              </aside>
            </article>
          ))}
        </div>
      </Container>
    </section>

    <EditorPageLink pageKind="routine" pageSlug="RoutinePMAging" />
    <SiteFooter />
  </div>
);

export default RoutinePMAging;
