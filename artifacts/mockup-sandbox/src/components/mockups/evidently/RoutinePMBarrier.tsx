// RoutinePMBarrier — Evening barrier-repair protocol.

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
  { n: "01", time: "On returning home", title: "Cleanse — oil first, then gel",
    sub: "Two-step removal", body: "Sunscreen, sebum, particulate pollution. A cleansing oil emulsifies the lipid-soluble half; a low-pH gel removes the rest. Compromised skin should not skip the second step — but the first must be gentle.",
    products: [{ brand: "Bioderma", name: "Sensibio H2O Micellar", note: "Gentle removal", tier: "A" as const }] },
  { n: "02", time: "After patting dry", title: "Centella / panthenol serum",
    sub: "Anti-inflammatory layer", body: "Madecassoside or panthenol-5% as the calming primer. This is the layer that distinguishes a barrier-repair routine from a hydration routine.",
    products: [{ brand: "Skin1004", name: "Madagascar Centella Asiatica Ampoule", note: "Reference centella", tier: "A" as const }] },
  { n: "03", time: "0:05", title: "Ceramide-rich moisturiser",
    sub: "Lipid replacement", body: "Ceramides 3 + 1 + 6-II in a multi-vesicular emulsion. The biomimetic lipid stack the stratum corneum is missing.",
    products: [{ brand: "CeraVe", name: "Moisturising Cream", note: "Reference ceramide cream", tier: "A" as const }] },
  { n: "04", time: "0:08 · final layer", title: "Occlusive — Cicaplast or petrolatum",
    sub: "Seal the repair", body: "Slugging the perimeter (jawline, around the nose, anywhere visibly compromised). Petrolatum or Cicaplast Baume B5+. Skip if oily-prone.",
    products: [{ brand: "La Roche-Posay", name: "Cicaplast Baume B5+", note: "Default occlusive", tier: "A" as const }] },
];

const FAILS = [
  { t: "Adding 'just one' active", b: "A barrier-repair protocol IS the active. Reintroduce one molecule (azelaic, niacinamide) only after 14 nights of pure repair." },
  { t: "Hot water cleansing", b: "Lukewarm. Hot water solubilises the lipid layer you are trying to rebuild." },
  { t: "Skipping occlusion in dry climate", b: "TEWL spikes overnight. Without an occlusive top-coat, hydration evaporates by 3 AM." },
  { t: "Three-week impatience", b: "A compromised barrier needs 4–8 weeks to fully restore ceramide synthesis. Resist re-introducing acids or retinoids before week 6." },
];

const RoutinePMBarrier: React.FC = () => (
  <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
    <LaidPaper />
    <SiteHeader active="Routines" />
    <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Routines", href: "#" }, { label: "Evening · Barrier-repair" }]} />

    <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
      <TopVignette /><PaperGrain /><ColumnRules opacity={0.32} />
      {/* moon arc */}
      <svg aria-hidden className="absolute -right-32 -top-32 z-0" width="780" height="780" viewBox="0 0 780 780" style={{ opacity: 0.05 }}>
        <g fill="none" stroke={T.ink} strokeWidth="1.2">
          <circle cx="390" cy="390" r="200" />
          <circle cx="450" cy="370" r="180" fill={T.paper} />
          {Array.from({ length: 9 }).map((_, i) => (<circle key={i} cx={300 + i * 30} cy={250 + i * 15} r={i + 2} />))}
        </g>
      </svg>

      <Container>
        <div className="relative grid grid-cols-12 gap-10 py-24">
          <div className="col-span-12 lg:col-span-8 lg:pl-12">
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
              <Eyebrow color={T.accent}>Routine · Evening · Barrier-Repair</Eyebrow>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>P. 07 · PROTOCOL</div>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <Moon className="h-5 w-5" style={{ color: T.accent }} />
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", color: T.muted, textTransform: "uppercase" }}>The PM Stack · v1</span>
            </div>

            <h1 className="mt-6" style={{ fontFamily: SERIF, fontSize: 96, lineHeight: 0.95, letterSpacing: "-0.04em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
              Four steps. <br />
              <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>No actives.</span>
            </h1>

            <p className="mt-9 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>
              The protocol we hand to anyone whose skin has just been over-exfoliated, post-procedure, or stopped responding to "more". Six weeks of nothing-but-repair, then re-introduce actives one at a time. The most-recommended routine in our practice; the least-marketed in the industry.
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
                <Eyebrow color={T.accent}>The Protocol at a Glance</Eyebrow>
              </div>
              <div className="grid grid-cols-3">
                {[
                  { i: <Clock className="h-4 w-4" />, k: "Time",   v: "8 min" },
                  { i: <span style={{ fontFamily: SERIF, fontSize: 18 }}>★</span>, k: "Skill",  v: "Beginner" },
                  { i: <IndianRupee className="h-4 w-4" />, k: "Cost",   v: "₹ 3–5k" },
                ].map((m, i) => (
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
                  {["Over-exfoliated skin", "Post-laser & post-tret", "Perioral dermatitis cooldown", "Pregnancy-safe"].map(b => (
                    <li key={b} className="flex gap-2 items-center"><Check className="h-3 w-3" style={{ color: T.tierA }} />{b}</li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </section>

    {/* STEPS */}
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
                <h3 style={{ fontFamily: SERIF, fontSize: 44, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, lineHeight: 1.05, letterSpacing: "-0.025em" }}>{s.title}</h3>
                <div className="mt-3" style={{ fontFamily: SERIF, fontSize: 19, fontStyle: "italic", color: T.muted }}>{s.sub}</div>
                <p className="mt-7 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 17.5, lineHeight: 1.65, color: T.inkSoft }}>{linkifyText(s.body)}</p>
              </div>
              <aside className="col-span-12 lg:col-span-3">
                <div className="border p-5" style={{ borderColor: T.rule, background: T.paper2 }}>
                  <Eyebrow>Recommended</Eyebrow>
                  <ul className="mt-4 space-y-4">
                    {s.products.map(p => (
                      <RoutineProductPick key={p.name} p={p} pageSlug="RoutinePMBarrier" />
                    ))}
                  </ul>
                </div>
              </aside>
            </article>
          ))}
        </div>
      </Container>
    </section>

    {/* FAILS */}
    <section className="relative z-10 border-b py-20" style={{ borderColor: T.rule, background: T.paper2 }}>
      <Container>
        <Folio>§ 02</Folio>
        <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.03em" }}>
          Where this routine <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>fails.</span>
        </h2>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-0 border" style={{ borderColor: T.rule, background: T.paper }}>
          {FAILS.map((m, i) => (
            <div key={m.t} className="p-7" style={{ borderRight: i % 2 === 0 ? `1px solid ${T.rule}` : "none", borderTop: i >= 2 ? `1px solid ${T.rule}` : "none" }}>
              <h4 style={{ fontFamily: SERIF, fontSize: 22, color: T.ink, fontVariationSettings: '"opsz" 144', lineHeight: 1.3 }}>{m.t}</h4>
              <p className="mt-3" style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.6, color: T.inkSoft }}>{m.b}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>

    <EditorPageLink pageKind="routine" pageSlug="RoutinePMBarrier" />
    <SiteFooter />
  </div>
);

export default RoutinePMBarrier;
