// RoutinePostProcedure — Post-procedure recovery (laser, microneedling, peel).

import React from "react";
import { Clock, IndianRupee, Bookmark, Share2, ArrowRight, Check, AlertTriangle } from "lucide-react";
import { T } from "./_theme";
import {
  SiteHeader, SiteFooter, Breadcrumbs, Container, Eyebrow, Folio, TierBadge,
  PaperGrain, LaidPaper, ColumnRules, TopVignette,
  SERIF, SERIF_ED, SANS, MONO,
} from "./_chrome";
import { EditorPageLink } from "./_EditorPageLink";
import { linkifyText } from "./_links";

const TIMELINE = [
  { d: "Day 0 (procedure day)", t: "Saline compresses + Cicaplast",
    body: "Cool saline-soaked gauze for 10 minutes every two hours. Cicaplast Baume B5+ as the only topical for the first 24 hours. Nothing else." },
  { d: "Days 1 – 3", t: "Gentle cleanser + occlusive only",
    body: "Lukewarm rinse with low-pH cleanser AM + PM. Re-apply Cicaplast or petrolatum 3–4× daily. Mineral SPF 50+ (zinc only) when going outside." },
  { d: "Days 4 – 7", t: "Add ceramide moisturiser",
    body: "Once peeling subsides, layer a ceramide cream after the occlusive. Centella ampoule optional for visible erythema." },
  { d: "Week 2", t: "Re-introduce hydrators",
    body: "Hyaluronic-acid serum, panthenol gels. Still no actives. Continue mineral-only SPF." },
  { d: "Weeks 3 – 4", t: "Re-introduce niacinamide",
    body: "Single active, 4–5%, AM + PM. Watch for any flush or sting; back off if either appears." },
  { d: "Week 4+", t: "Resume baseline routine",
    body: "Add back retinoids and acids one at a time, twice-weekly first, alternate-night by week 6. Resume normal SPF." },
];

const FORBIDDEN = [
  { d: "0 – 7", what: "Retinoids of any class · AHA / BHA · Vitamin C / LAA · Tranexamic acid · Hydroquinone" },
  { d: "0 – 14", what: "Active fragrance · Foaming surfactants · Mechanical exfoliation · Hot water · Workouts that flush the face" },
  { d: "0 – 28", what: "Direct sun without mineral SPF 50 reapplied 3-hourly · Outdoor swimming pools · Saunas / hot yoga" },
];

const RoutinePostProcedure: React.FC = () => (
  <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
    <LaidPaper />
    <SiteHeader active="Routines" />
    <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Routines", href: "#" }, { label: "Post-procedure recovery" }]} />

    <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
      <TopVignette /><PaperGrain /><ColumnRules opacity={0.32} />

      <Container>
        <div className="relative grid grid-cols-12 gap-10 py-24">
          <div className="col-span-12 lg:col-span-8 lg:pl-12">
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
              <Eyebrow color={T.accent}>Routine · Post-procedure · 28-day timeline</Eyebrow>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>P. 11 · PROTOCOL</div>
            </div>

            <h1 className="mt-10" style={{ fontFamily: SERIF, fontSize: 96, lineHeight: 0.95, letterSpacing: "-0.04em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
              The recovery <br />
              <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>protocol.</span>
            </h1>

            <p className="mt-9 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>
              For the four weeks after a laser, microneedling, peel, or aggressive in-clinic treatment. The most-skipped instructions in dermatology — and the single biggest reason people complain that their procedure "didn't work." It worked. The aftercare didn't.
            </p>

            <div className="mt-7 inline-flex items-start gap-3 px-4 py-3 border" style={{ borderColor: T.warning, background: T.warningSoft }}>
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: T.warning }} />
              <p style={{ fontFamily: SERIF, fontSize: 14.5, color: T.inkSoft, lineHeight: 1.5 }}>This is a general framework. Your treating dermatologist's specific instructions override anything on this page.</p>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <button className="inline-flex items-center gap-2 px-5 py-3" style={{ background: T.ink, color: T.paper, fontFamily: SANS, fontSize: 13, fontWeight: 500 }}>Print the timeline <ArrowRight className="h-4 w-4" /></button>
              <button className="inline-flex items-center gap-2 border px-5 py-3" style={{ borderColor: T.rule, fontFamily: SANS, fontSize: 13, color: T.ink }}><Bookmark className="h-3.5 w-3.5" /> Save</button>
              <button className="inline-flex items-center gap-2 border px-5 py-3" style={{ borderColor: T.rule, fontFamily: SANS, fontSize: 13, color: T.ink }}><Share2 className="h-3.5 w-3.5" /> Share</button>
            </div>
          </div>

          <aside className="col-span-12 lg:col-span-4">
            <div className="border" style={{ borderColor: T.rule, background: T.paper }}>
              <div className="px-6 py-4 border-b" style={{ borderColor: T.rule, background: T.paper2 }}>
                <Eyebrow color={T.accent}>Snapshot</Eyebrow>
              </div>
              <div className="grid grid-cols-3">
                {[
                  { i: <Clock className="h-4 w-4" />, k: "Window", v: "28 days" },
                  { i: <span style={{ fontFamily: SERIF, fontSize: 18 }}>★</span>, k: "Skill", v: "Discipline" },
                  { i: <IndianRupee className="h-4 w-4" />, k: "Cost", v: "₹ 4–6k" },
                ].map((m, i) => (
                  <div key={m.k} className="flex flex-col items-center justify-center py-7 px-3" style={{ borderRight: i < 2 ? `1px solid ${T.rule}` : "none" }}>
                    <span style={{ color: T.accent }}>{m.i}</span>
                    <span className="mt-3" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft, textTransform: "uppercase" }}>{m.k}</span>
                    <span className="mt-1" style={{ fontFamily: SERIF, fontSize: 18, color: T.ink, fontWeight: 400, fontVariationSettings: '"opsz" 144' }}>{m.v}</span>
                  </div>
                ))}
              </div>
              <div className="border-t px-6 py-5" style={{ borderColor: T.rule }}>
                <Eyebrow>Use after</Eyebrow>
                <ul className="mt-4 space-y-2" style={{ fontFamily: SANS, fontSize: 13, color: T.inkSoft, lineHeight: 1.55 }}>
                  {["Q-switched / pico laser", "Microneedling (RF or manual)", "Chemical peel (medium-deep)", "Tret overshoot / barrier injury"].map(b => (
                    <li key={b} className="flex gap-2 items-center"><Check className="h-3 w-3" style={{ color: T.tierA }} />{b}</li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </section>

    {/* TIMELINE */}
    <section className="relative z-10 border-b" style={{ borderColor: T.rule }}>
      <Container>
        <div className="py-20">
          <Folio>§ 01</Folio>
          <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.03em" }}>
            The 28-day <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>schedule.</span>
          </h2>
          <div className="mt-9 border-t" style={{ borderColor: T.rule }}>
            {TIMELINE.map((s) => (
              <div key={s.d} className="grid grid-cols-12 gap-6 py-8 border-b items-baseline" style={{ borderColor: T.ruleSoft }}>
                <div className="col-span-12 md:col-span-3" style={{ fontFamily: MONO, fontSize: 11, color: T.mutedSoft, letterSpacing: "0.16em", textTransform: "uppercase" }}>{s.d}</div>
                <div className="col-span-12 md:col-span-3" style={{ fontFamily: SERIF, fontSize: 26, color: T.accent, fontVariationSettings: '"opsz" 144', lineHeight: 1.2 }}>{s.t}</div>
                <div className="col-span-12 md:col-span-6" style={{ fontFamily: SERIF, fontSize: 17, color: T.inkSoft, lineHeight: 1.6 }}>{linkifyText(s.body)}</div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>

    {/* FORBIDDEN */}
    <section className="relative z-10 border-b py-20" style={{ borderColor: T.rule, background: T.paper2 }}>
      <Container>
        <Folio>§ 02</Folio>
        <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.03em" }}>
          What is <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>off the table.</span>
        </h2>
        <div className="mt-9 border" style={{ borderColor: T.rule, background: T.paper }}>
          {FORBIDDEN.map((f, i) => (
            <div key={f.d} className="grid grid-cols-12 gap-4 px-6 py-6 border-b last:border-b-0" style={{ borderColor: T.ruleSoft }}>
              <div className="col-span-12 md:col-span-2" style={{ fontFamily: MONO, fontSize: 11, color: T.tierD, letterSpacing: "0.16em", fontWeight: 700 }}>DAYS {f.d}</div>
              <div className="col-span-12 md:col-span-10" style={{ fontFamily: SERIF, fontSize: 17, color: T.inkSoft, lineHeight: 1.6 }}>{f.what}</div>
            </div>
          ))}
        </div>
      </Container>
    </section>

    <EditorPageLink pageKind="routine" pageSlug="RoutinePostProcedure" />
    <SiteFooter />
  </div>
);

export default RoutinePostProcedure;
