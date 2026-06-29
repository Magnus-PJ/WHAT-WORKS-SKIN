// RoutinePMAcne — Adapalene the right way.

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
  { n: "01", time: "PM", title: "Gentle non-foaming cleanser", sub: "Low pH, fragrance-free",
    body: "Adapalene's tolerance window is set by what you do before it. A non-foaming, low-pH cleanser preserves the acid mantle and avoids the cumulative micro-injury that turns a tolerable retinoid into an intolerable one.",
    products: [{ brand: "Cetaphil", name: "Gentle Skin Cleanser", note: "Default", tier: "A" as const }, { brand: "La Roche-Posay", name: "Toleriane Hydrating", note: "For dryness", tier: "A" as const }] },
  { n: "02", time: "PM", title: "Adapalene 0.1% gel", sub: "Pea-sized, dry skin",
    body: "Apply to fully dry skin (wait 20 minutes after cleansing) at a pea-sized dose for the entire face. Start three nights a week for two weeks, then alternate nights for two weeks, then every night. The biggest mistake is starting nightly — and quitting in the third week.",
    products: [{ brand: "Differin", name: "Adapalene Gel 0.1%", note: "Default", tier: "A" as const }, { brand: "Galderma", name: "Deriva-CMS", note: "With moisturiser", tier: "A" as const }] },
  { n: "03", time: "PM", title: "Ceramide moisturiser", sub: "Wait 5 minutes after adapalene",
    body: "Sandwiching the retinoid between moisturiser layers (the so-called 'sandwich method') significantly improves tolerance with minimal efficacy loss. We prefer the simpler 'wait + buffer' approach for adult acne — moisturiser five minutes after the adapalene, slightly more generously than usual.",
    products: [{ brand: "CeraVe", name: "PM Facial Lotion", note: "Default", tier: "A" as const }, { brand: "La Roche-Posay", name: "Cicaplast Baume B5+", note: "For irritation", tier: "A" as const }] },
  { n: "04", time: "PM", title: "Spot treatment as needed", sub: "Benzoyl peroxide 2.5%, 2× per week",
    body: "On active inflammatory lesions only. BPO is bactericidal and prevents adapalene resistance over years; nightly full-face use is unnecessary and dries the surrounding skin. Apply to the lesion, wait, moisturise around it.",
    products: [{ brand: "PanOxyl", name: "BPO 2.5%", note: "Default", tier: "A" as const }, { brand: "La Roche-Posay", name: "Effaclar Duo+M", note: "Combination", tier: "A" as const }] },
];

const RoutinePMAcne: React.FC = () => (
  <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
    <LaidPaper />
    <SiteHeader active="Routines" />
    <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Routines", href: "#" }, { label: "PM · Adult acne" }]} />

    <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
      <TopVignette /><PaperGrain /><ColumnRules opacity={0.32} />
      <Container>
        <div className="relative grid grid-cols-12 gap-10 py-24">
          <div className="col-span-12 lg:col-span-8 lg:pl-12">
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
              <Eyebrow color={T.accent}>Routine · PM · Adult acne</Eyebrow>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>P. 09 · PROTOCOL</div>
            </div>
            <div className="mt-8 flex items-center gap-3">
              <Moon className="h-5 w-5" style={{ color: T.accent }} />
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", color: T.muted, textTransform: "uppercase" }}>4 Steps · 9 min · Beginner</span>
            </div>
            <h1 className="mt-6" style={{ fontFamily: SERIF, fontSize: 108, lineHeight: 0.93, letterSpacing: "-0.045em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
              Adapalene, <br />
              <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>the right way.</span>
            </h1>
            <p className="mt-9 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>
              The OTC retinoid most clinicians wish patients started with first. Built around dose discipline, ramp-up, and the boring buffering steps that determine whether you stay on it for the eight months it takes to actually work.
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
                {[{ i: <Clock className="h-4 w-4" />, k: "Time", v: "9 min" }, { i: <span style={{ fontFamily: SERIF, fontSize: 18 }}>★</span>, k: "Skill", v: "Beginner" }, { i: <IndianRupee className="h-4 w-4" />, k: "Cost", v: "₹ 1–3k" }].map((m, i) => (
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
                  {["Comedonal & mild-moderate acne", "Adult onset & late persistence", "Pairs with AM salicylic routine", "12-week ramp"].map(b => (
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
                      <RoutineProductPick key={p.name} p={p} pageSlug="RoutinePMAcne" />
                    ))}
                  </ul>
                </div>
              </aside>
            </article>
          ))}
        </div>
      </Container>
    </section>

    <section className="relative z-10 border-b py-20" style={{ borderColor: T.rule, background: T.paper2 }}>
      <Container>
        <Folio>§ 02</Folio>
        <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.03em" }}>
          The 12-week <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>retinisation curve.</span>
        </h2>
        <p className="mt-7 max-w-3xl" style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.65, color: T.inkSoft }}>
          Weeks 2–6 are statistically the worst — comedones surface, the skin looks <em>more</em> congested before it improves, and most people stop. Don't. Document with photos at week 0 and week 12. Adjust the cadence, not the product.
        </p>
      </Container>
    </section>

    <EditorPageLink pageKind="routine" pageSlug="RoutinePMAcne" />
    <SiteFooter />
  </div>
);

export default RoutinePMAcne;
