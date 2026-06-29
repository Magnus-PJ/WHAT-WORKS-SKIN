// RoutineAMAging — The AM anti-aging stack.

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
  { n: "01", time: "AM", title: "Cream cleanser", sub: "Non-stripping, low-pH",
    body: "Mature skin loses ceramides faster than younger skin replaces them; a foaming cleanser amplifies this. A short, gentle cream cleanse — 30 seconds, lukewarm water — preserves the lipid envelope that the rest of the stack depends on.",
    products: [{ brand: "La Roche-Posay", name: "Toleriane Hydrating", note: "Default", tier: "A" as const }, { brand: "Avène", name: "Tolérance Cleansing Lotion", note: "Sensitive", tier: "A" as const }] },
  { n: "02", time: "AM", title: "Vitamin C serum 10–15%", sub: "L-ascorbic, pH 3.5",
    body: "Vitamin C is the AM antioxidant with the strongest 12-week wrinkle and pigment evidence. Apply to dry skin before any peptide or moisturiser. Replace formulations that turn amber within four months — oxidised C does nothing.",
    products: [{ brand: "SkinCeuticals", name: "C E Ferulic", note: "Reference", tier: "A" as const }, { brand: "Dot & Key", name: "10% Vitamin C + E", note: "Budget", tier: "B" as const }] },
  { n: "03", time: "AM", title: "Peptide moisturiser", sub: "Matrixyl 3000 or copper peptides",
    body: "The peptide tier with the most replicated 12-week firmness data. Layer over the C while it is still slightly tacky. Mature skin tolerates the additional layer; combination skin may want a lighter texture.",
    products: [{ brand: "Olay", name: "Regenerist Micro-Sculpting", note: "Default", tier: "A" as const }, { brand: "Niod", name: "Multi-Molecular Hyaluronic", note: "Premium", tier: "A" as const }] },
  { n: "04", time: "AM", title: "Eye cream with peptides", sub: "Periorbital, ring-finger application",
    body: "The skin around the eye is genuinely thinner and ages on a faster timeline. A targeted eye cream is one of the few 'specialty' products with reasonable evidence; use a peptide-led formula, not a caffeine-led one (caffeine shifts puffiness for hours, not endpoints).",
    products: [{ brand: "Kiehl's", name: "Avocado Eye Treatment", note: "Default", tier: "B" as const }, { brand: "The Ordinary", name: "Argireline Solution", note: "Budget", tier: "C" as const }] },
  { n: "05", time: "AM", title: "Mineral SPF 50+", sub: "PA++++, broad-spectrum",
    body: "Photo-aging is the dominant variable in visible aging through the 30s and 40s; the morning SPF carries roughly half the effect of the entire stack. Two finger-lengths, every morning, including the rainy season.",
    products: [{ brand: "La Roche-Posay", name: "UVMune 400", note: "Default", tier: "A" as const }, { brand: "Vichy", name: "Capital Soleil UV-Age Daily", note: "Tinted", tier: "A" as const }] },
];

const RoutineAMAging: React.FC = () => (
  <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
    <LaidPaper />
    <SiteHeader active="Routines" />
    <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Routines", href: "#" }, { label: "AM · 35+ skin" }]} />

    <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
      <TopVignette /><PaperGrain /><ColumnRules opacity={0.32} />
      <Container>
        <div className="relative grid grid-cols-12 gap-10 py-24">
          <div className="col-span-12 lg:col-span-8 lg:pl-12">
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
              <Eyebrow color={T.accent}>Routine · AM · 35+ skin</Eyebrow>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>P. 14 · PROTOCOL</div>
            </div>
            <div className="mt-8 flex items-center gap-3">
              <Sun className="h-5 w-5" style={{ color: T.accent }} />
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", color: T.muted, textTransform: "uppercase" }}>5 Steps · 14 min · Intermediate</span>
            </div>
            <h1 className="mt-6" style={{ fontFamily: SERIF, fontSize: 108, lineHeight: 0.93, letterSpacing: "-0.045em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
              The AM <br />
              <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>anti-aging stack.</span>
            </h1>
            <p className="mt-9 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>
              Built around prevention, not correction. The morning that does the heavy lifting on photo-aging through your 30s and 40s — when the easiest, cheapest, most evidence-supported stack is also the one most often skipped.
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
                {[{ i: <Clock className="h-4 w-4" />, k: "Time", v: "14 min" }, { i: <span style={{ fontFamily: SERIF, fontSize: 18 }}>★</span>, k: "Skill", v: "Intermediate" }, { i: <IndianRupee className="h-4 w-4" />, k: "Cost", v: "₹ 8–14k" }].map((m, i) => (
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
                  {["Mature / normal skin", "Prevention-stage approach", "35–55 age range", "Pairs with PM tretinoin"].map(b => (
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
                      <RoutineProductPick key={p.name} p={p} pageSlug="RoutineAMAging" />
                    ))}
                  </ul>
                </div>
              </aside>
            </article>
          ))}
        </div>
      </Container>
    </section>

    <EditorPageLink pageKind="routine" pageSlug="RoutineAMAging" />
    <SiteFooter />
  </div>
);

export default RoutineAMAging;
