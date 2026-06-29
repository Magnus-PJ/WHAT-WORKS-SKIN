// RoutinePregnancyAM — Pregnancy-safe morning.

import React from "react";
import { Sun, Clock, IndianRupee, Bookmark, Share2, ArrowRight, Check } from "lucide-react";
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
  { n: "01", time: "AM", title: "Gentle cleanser", sub: "Fragrance-free, low-pH",
    body: "A simple, fragrance-free cleanser. The hormonal shifts of pregnancy frequently push reactive episodes; this is not the trimester to introduce new actives or a foaming wash.",
    products: [{ brand: "Cetaphil", name: "Gentle Skin Cleanser", note: "Default", tier: "A" as const }, { brand: "Vanicream", name: "Gentle Facial Cleanser", note: "Sensitive", tier: "A" as const }] },
  { n: "02", time: "AM", title: "Alpha arbutin 2%", sub: "Pigment-blocker, pregnancy-safe",
    body: "Melasma is the most common pregnancy-related skin concern, and the standard pigment regimen — hydroquinone, retinoids, oral tranexamic — is off-limits. Alpha arbutin is the best-evidenced safe substitute. Apply to dry skin under the moisturiser.",
    products: [{ brand: "The Ordinary", name: "Alpha Arbutin 2% + HA", note: "Default", tier: "A" as const }, { brand: "Minimalist", name: "Alpha Arbutin 2%", note: "Budget", tier: "A" as const }] },
  { n: "03", time: "AM", title: "Niacinamide moisturiser", sub: "4% niacinamide + ceramides",
    body: "Niacinamide is fully pregnancy-safe and addresses the redness and reactivity that come with hormonal shifts. The ceramide pairing addresses the dryness many people experience in the second trimester.",
    products: [{ brand: "CeraVe", name: "PM Facial Lotion", note: "Default (AM use OK)", tier: "A" as const }, { brand: "La Roche-Posay", name: "Toleriane Sensitive", note: "Sensitive", tier: "A" as const }] },
  { n: "04", time: "AM", title: "Mineral SPF 50+", sub: "Zinc-only, no chemical filters",
    body: "Pregnancy melasma is heavily UV-sensitive; SPF is the single most consequential variable. Mineral filters are universally recognised as pregnancy-safe and avoid the absorption-and-fetal-exposure questions that sit around chemical filters. Two finger-lengths, every morning.",
    products: [{ brand: "Re'equil", name: "Sheer Zinc SPF 50", note: "Default", tier: "A" as const }, { brand: "ISDIN", name: "Eryfotona Ageless", note: "Premium", tier: "A" as const }] },
];

const RoutinePregnancyAM: React.FC = () => (
  <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
    <LaidPaper />
    <SiteHeader active="Routines" />
    <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Routines", href: "#" }, { label: "AM · Pregnancy" }]} />

    <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
      <TopVignette /><PaperGrain /><ColumnRules opacity={0.32} />
      <Container>
        <div className="relative grid grid-cols-12 gap-10 py-24">
          <div className="col-span-12 lg:col-span-8 lg:pl-12">
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
              <Eyebrow color={T.accent}>Routine · AM · Pregnancy</Eyebrow>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>P. 18 · PROTOCOL</div>
            </div>
            <div className="mt-8 flex items-center gap-3">
              <Sun className="h-5 w-5" style={{ color: T.accent }} />
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", color: T.muted, textTransform: "uppercase" }}>4 Steps · 10 min · Beginner</span>
            </div>
            <h1 className="mt-6" style={{ fontFamily: SERIF, fontSize: 108, lineHeight: 0.93, letterSpacing: "-0.045em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
              Pregnancy-safe <br />
              <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>morning.</span>
            </h1>
            <p className="mt-9 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>
              The list of what you <em>can</em> do, not what you can't. No retinoids, no salicylic, no hydroquinone, no oral tranexamic — but plenty of pigment, barrier, and SPF work to handle. Built for the 9-month window and the postpartum continuation.
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
                {[{ i: <Clock className="h-4 w-4" />, k: "Time", v: "10 min" }, { i: <span style={{ fontFamily: SERIF, fontSize: 18 }}>★</span>, k: "Skill", v: "Beginner" }, { i: <IndianRupee className="h-4 w-4" />, k: "Cost", v: "₹ 3–6k" }].map((m, i) => (
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
                  {["All trimesters", "Melasma-prevention focus", "Postpartum-safe", "Lactation-safe"].map(b => (
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
                      <RoutineProductPick key={p.name} p={p} pageSlug="RoutinePregnancyAM" />
                    ))}
                  </ul>
                </div>
              </aside>
            </article>
          ))}
        </div>
      </Container>
    </section>

    <EditorPageLink pageKind="routine" pageSlug="RoutinePregnancyAM" />
    <SiteFooter />
  </div>
);

export default RoutinePregnancyAM;
