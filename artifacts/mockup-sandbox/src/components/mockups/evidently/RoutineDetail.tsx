// RoutineDetail — "The Morning Routine for Pigment-Prone Skin"
// Step-by-step layered protocol with timing, pH, alternatives, mistakes.

import React, { useState } from "react";
import { ChevronDown, Sun, Clock, IndianRupee, Bookmark, Share2, ArrowRight, Check, X } from "lucide-react";
import { T, tierColor, tierBg } from "./_theme";
import {
  SiteHeader, SiteFooter, Breadcrumbs, Container, Eyebrow, Folio, TierBadge,
  PaperGrain, LaidPaper, ColumnRules, TopVignette, Asterism,
  SERIF, SERIF_ED, SANS, MONO,
} from "./_chrome";
import { EditorPageLink } from "./_EditorPageLink";
import { linkifyText } from "./_links";
import { RoutineProductPick } from "./_RoutineProductPick";

export const STEPS = [
  {
    n: "01", t: "0:00", time: "On waking",
    title: "Cleanse",
    sub: "Low-foam, low-pH cleanser",
    body: "Skip the heavy foaming wash in the morning. A low-pH gel preserves the acid mantle that built up overnight and prevents the early-AM barrier dip we see in pigment-prone skin.",
    products: [
      { brand: "CeraVe", name: "Hydrating Cleanser", note: "Default", tier: "A" as const },
      { brand: "Cetaphil", name: "Gentle Skin Cleanser", note: "Sensitive", tier: "A" as const },
    ],
    activeKey: "—", activeVal: "Surfactants", activePh: "5.5",
    waitMins: 1,
  },
  {
    n: "02", t: "0:02", time: "After patting dry",
    title: "Antioxidant serum",
    sub: "L-ascorbic acid 10–15% (or alternative)",
    body: "Vitamin C provides daytime free-radical defence and amplifies SPF efficacy. For pigment-prone skin, this is the layer that does the slow work no SPF alone can.",
    products: [
      { brand: "SkinCeuticals", name: "C E Ferulic", note: "Reference", tier: "A" as const },
      { brand: "The Ordinary", name: "Ascorbyl Glucoside Solution 12%", note: "Sensitive alternative", tier: "B" as const },
    ],
    activeKey: "L-ascorbic acid", activeVal: "10–15%", activePh: "≤ 3.5",
    waitMins: 5,
  },
  {
    n: "03", t: "0:08", time: "Once C is dry",
    title: "Pigment-targeted treatment",
    sub: "Tranexamic acid + niacinamide",
    body: "On melasma and stubborn PIH, the daytime pigment-blocker layer is what closes the gap retinoid nights cannot. Tranexamic acid + niacinamide is the most evidence-aligned combination available OTC in India.",
    products: [
      { brand: "Minimalist", name: "Tranexamic 03%", note: "Default", tier: "A" as const },
      { brand: "The Ordinary", name: "Alpha Arbutin 2% + HA", note: "Pregnancy alt.", tier: "B" as const },
    ],
    activeKey: "Tranexamic acid", activeVal: "3%", activePh: "5.5–6.5",
    waitMins: 2,
  },
  {
    n: "04", t: "0:10", time: "Always last",
    title: "Sun protection",
    sub: "Broad-spectrum, high UVA-PF SPF 50+",
    body: "Long-UVA is what drives pigment relapse. Use the highest UVA-PF fluid you can afford, two finger-lengths to the face, every day, indoors and out.",
    products: [
      { brand: "La Roche-Posay", name: "UVMune 400 Invisible Fluid", note: "Highest UVA-PF", tier: "A" as const },
      { brand: "Re'equil", name: "Oxybenzone & OMC Free SPF 50", note: "Budget pick", tier: "B" as const },
    ],
    activeKey: "Mexoryl 400 + Tinosorb", activeVal: "UVA-PF 46", activePh: "—",
    waitMins: 0,
  },
];

const SUBSTITUTIONS = [
  { step: "Step 02 — Antioxidant", sensitive: "Ascorbyl glucoside 12%", pregnant: "Niacinamide 5%", oily: "C E Ferulic", dry: "MAP (mag-ascorbyl-phosphate) 10%" },
  { step: "Step 03 — Pigment", sensitive: "Alpha arbutin 2%", pregnant: "Alpha arbutin 2%", oily: "Tranexamic 3% + niacinamide 5%", dry: "Tranexamic 3% in HA base" },
  { step: "Step 04 — SPF",        sensitive: "Mineral SPF 50 (zinc only)", pregnant: "Mineral SPF 50 (zinc only)", oily: "UVMune 400 Fluid (matte)", dry: "UVMune 400 Hydrating Cream" },
];

const MISTAKES = [
  { t: "Layering vitamin C over a wet face", b: "Water raises pH and blunts the L-ascorbic. Pat skin completely dry first." },
  { t: "Stacking AHAs in the morning", b: "AM is for protection. Save acids for night routines." },
  { t: "Skipping the wait time", b: "Each layer needs to set, or you're rubbing pilled film into your face." },
  { t: "Pea-sized SPF", b: "You need ~1.2 g — two finger-lengths. Anything less and the SPF claim collapses." },
  { t: "Same routine year-round in melasma", b: "Step up tranexamic in summer; step back in winter. Pigment cycles with UV." },
];

const FAQ = [
  { q: "Can I use a moisturiser between steps 03 and 04?",
    a: "Yes — slot it after the pigment treatment, before SPF. Use a lightweight gel (Toleriane Double Repair or CeraVe AM) and wait one minute before the SPF." },
  { q: "Why no retinoid in the morning?",
    a: "Retinoids are photo-degraded and increase short-term photosensitivity. They earn their place at night, where the slow rebuild happens. Layering tretinoin in the AM is one of the most common reasons pigment routines stall." },
  { q: "Is this routine safe in pregnancy?",
    a: "Replace tranexamic acid (limited data) with alpha arbutin 2%. Replace L-ascorbic acid with niacinamide if you're avoiding all acids. Mineral-only SPF (zinc oxide) is the safest filter system in pregnancy." },
  { q: "How long until I see pigment improvement?",
    a: "Plan for 12 weeks. The earliest visible change is at 8 weeks with strict sun protection; lasting fade at 16–24 weeks. Adherence is the variable that matters most." },
  { q: "Can I add an exfoliant?",
    a: "Once a week, at night, away from this AM stack. Daily AHA / BHA undermines the pigment plan by re-triggering the inflammatory pathway you're trying to suppress." },
];

const RoutineDetail: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
      <LaidPaper />
      <SiteHeader active="Routines" />
      <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Routines", href: "#" }, { label: "Morning · Pigment-prone" }]} />

      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
        <TopVignette />
        <PaperGrain />
        <ColumnRules opacity={0.32} />

        {/* Sun arc ambient */}
        <svg aria-hidden className="absolute -right-32 -top-32 z-0" width="780" height="780" viewBox="0 0 780 780" style={{ opacity: 0.05 }}>
          <g fill="none" stroke={T.ink} strokeWidth="1.2">
            <path d="M 100 600 A 290 290 0 0 1 680 600" />
            <circle cx="390" cy="600" r="40" />
            {Array.from({ length: 9 }).map((_, i) => {
              const a = (i / 8) * Math.PI;
              return <line key={i} x1={390 - Math.cos(a) * 70} y1={600 - Math.sin(a) * 70} x2={390 - Math.cos(a) * 110} y2={600 - Math.sin(a) * 110} />;
            })}
          </g>
        </svg>

        <Container>
          <div className="relative grid grid-cols-12 gap-10 py-24">
            <div className="absolute left-0 top-24 bottom-24 hidden lg:flex flex-col items-center justify-between" style={{ width: 24 }}>
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                ROUTINE · 04 / 26
              </span>
              <div className="h-px w-3" style={{ background: T.rule }} />
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                FILED · 12 APR 2026
              </span>
            </div>

            <div className="col-span-12 lg:col-span-8 lg:pl-12">
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
                <Eyebrow color={T.accent}>Routine · Morning · Pigment-Prone Skin</Eyebrow>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>P. 06 · PROTOCOL</div>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <Sun className="h-5 w-5" style={{ color: T.accent }} />
                <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", color: T.muted, textTransform: "uppercase" }}>The AM Stack · v1</span>
              </div>

              <h1 className="mt-6" style={{ fontFamily: SERIF, fontSize: 96, lineHeight: 0.95, letterSpacing: "-0.04em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
                Four steps. <br />
                <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>Twelve minutes.</span>
              </h1>

              <p className="mt-9 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>
                The morning protocol we recommend for melasma, post-inflammatory hyperpigmentation, and any skin where pigment is the daily complaint. Built around three layered actives and one non-negotiable: long-UVA defence.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <button className="inline-flex items-center gap-2 rounded-sm px-5 py-3" style={{ background: T.ink, color: T.paper, fontFamily: SANS, fontSize: 13, fontWeight: 500 }}>
                  Print the protocol <ArrowRight className="h-4 w-4" />
                </button>
                <button className="inline-flex items-center gap-2 rounded-sm border px-5 py-3" style={{ borderColor: T.rule, fontFamily: SANS, fontSize: 13, color: T.ink }}>
                  <Bookmark className="h-3.5 w-3.5" /> Save
                </button>
                <button className="inline-flex items-center gap-2 rounded-sm border px-5 py-3" style={{ borderColor: T.rule, fontFamily: SANS, fontSize: 13, color: T.ink }}>
                  <Share2 className="h-3.5 w-3.5" /> Share
                </button>
              </div>
            </div>

            {/* Routine summary card */}
            <aside className="col-span-12 lg:col-span-4">
              <div className="border" style={{ borderColor: T.rule, background: T.paper }}>
                <div className="px-6 py-4 border-b" style={{ borderColor: T.rule, background: T.paper2 }}>
                  <Eyebrow color={T.accent}>The Protocol at a Glance</Eyebrow>
                </div>
                <div className="grid grid-cols-3">
                  {[
                    { i: <Clock className="h-4 w-4" />, k: "Time",   v: "12 min" },
                    { i: <span style={{ fontFamily: SERIF, fontSize: 18 }}>★</span>, k: "Skill",  v: "Beginner" },
                    { i: <IndianRupee className="h-4 w-4" />, k: "Cost",   v: "₹ 4–7k" },
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
                    {["Melasma & PIH", "Pregnancy-prone skin", "Post-laser recovery", "All Fitzpatrick types"].map(b => (
                      <li key={b} className="flex gap-2 items-center"><Check className="h-3 w-3" style={{ color: T.tierA }} />{b}</li>
                    ))}
                  </ul>
                </div>

                <div className="border-t px-6 py-5" style={{ borderColor: T.rule, background: T.paper2 }}>
                  <Eyebrow>Reviewed by</Eyebrow>
                  <div className="mt-3" style={{ fontFamily: SANS, fontSize: 13, color: T.inkSoft, lineHeight: 1.55 }}>
                    <strong style={{ color: T.ink, fontWeight: 600 }}>Dr. Sundeep</strong> · Medical Review Lead
                    <br /><span style={{ color: T.muted }}>Last reviewed 2026-04-12 · Methodology v1.0</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {/* ─── STEP TIMELINE BAR ─────────────────────────────────────── */}
      <section className="relative z-10 border-b py-12" style={{ borderColor: T.rule, background: T.paper2 }}>
        <Container>
          <div className="flex items-center justify-between mb-6">
            <Eyebrow>Timeline</Eyebrow>
            <span style={{ fontFamily: MONO, fontSize: 10.5, color: T.mutedSoft, letterSpacing: "0.14em" }}>0 → 12 MIN</span>
          </div>
          <div className="relative">
            <div className="absolute left-0 right-0 top-1/2 h-px" style={{ background: T.rule }} />
            <div className="relative grid grid-cols-4 gap-0">
              {STEPS.map((s, i) => (
                <div key={s.n} className="flex flex-col items-center text-center px-3" style={{ borderRight: i < STEPS.length - 1 ? `1px solid ${T.rule}` : "none" }}>
                  <span style={{ fontFamily: SERIF, fontSize: 38, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.accent, letterSpacing: "-0.03em", lineHeight: 1, background: T.paper2, padding: "0 8px", zIndex: 1 }}>{s.n}</span>
                  <div className="mt-3" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.18em", color: T.mutedSoft, textTransform: "uppercase" }}>{s.t}</div>
                  <div className="mt-2" style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.2 }}>{s.title}</div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ─── STEPS BODY ────────────────────────────────────────────── */}
      <section className="relative z-10 border-b" style={{ borderColor: T.rule }}>
        <Container>
          <div className="py-20">
            {STEPS.map((s, i) => (
              <article key={s.n} className="grid grid-cols-12 gap-10 py-16" style={{ borderTop: i === 0 ? "none" : `1px solid ${T.rule}` }}>
                {/* Step number column */}
                <div className="col-span-12 lg:col-span-2">
                  <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.18em", color: T.mutedSoft, textTransform: "uppercase" }}>{s.time}</div>
                  <div className="mt-2" style={{ fontFamily: SERIF, fontSize: 110, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.accent, lineHeight: 0.85, letterSpacing: "-0.05em" }}>
                    {s.n}
                  </div>
                </div>

                {/* Content */}
                <div className="col-span-12 lg:col-span-7">
                  <h3 style={{ fontFamily: SERIF, fontSize: 48, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, lineHeight: 1, letterSpacing: "-0.025em" }}>
                    {s.title}
                  </h3>
                  <div className="mt-3" style={{ fontFamily: SERIF, fontSize: 19, fontStyle: "italic", color: T.muted }}>{s.sub}</div>

                  <p className="mt-7 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 17.5, lineHeight: 1.65, color: T.inkSoft }}>
                    {linkifyText(s.body)}
                  </p>

                  {/* Active spec strip */}
                  <div className="mt-8 grid grid-cols-3 border" style={{ borderColor: T.rule }}>
                    {[
                      ["Active", s.activeKey],
                      ["Concentration", s.activeVal],
                      ["pH", s.activePh],
                    ].map(([k, v], j) => (
                      <div key={k as string} className="px-4 py-4" style={{ borderRight: j < 2 ? `1px solid ${T.rule}` : "none", background: j % 2 ? T.paper2 : T.paper }}>
                        <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.14em", color: T.mutedSoft, textTransform: "uppercase" }}>{k}</div>
                        <div className="mt-1" style={{ fontFamily: SERIF, fontSize: 17, color: T.ink, fontVariationSettings: '"opsz" 144' }}>{v}</div>
                      </div>
                    ))}
                  </div>

                  {s.waitMins > 0 && (
                    <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-sm" style={{ background: T.accentSoft, color: T.accent, fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em" }}>
                      <Clock className="h-3 w-3" /> WAIT {s.waitMins} MIN BEFORE NEXT STEP
                    </div>
                  )}
                </div>

                {/* Product picks */}
                <aside className="col-span-12 lg:col-span-3">
                  <div className="border p-5" style={{ borderColor: T.rule, background: T.paper2 }}>
                    <Eyebrow>Recommended</Eyebrow>
                    <ul className="mt-4 space-y-4">
                      {s.products.map(p => (
                        <RoutineProductPick key={p.name} p={p} pageSlug="RoutineDetail" />
                      ))}
                    </ul>
                  </div>
                </aside>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── WHY THIS ORDER ───────────────────────────────────────── */}
      <section className="relative z-10 border-b" style={{ borderColor: T.rule, background: T.paper2 }}>
        <Container>
          <div className="grid grid-cols-12 gap-10 py-20">
            <div className="col-span-12 lg:col-span-5">
              <Folio>§ 02</Folio>
              <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', letterSpacing: "-0.03em", color: T.ink }}>
                Why <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>this order.</span>
              </h2>
            </div>
            <div className="col-span-12 lg:col-span-7">
              <p style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.65, color: T.inkSoft }}>
                <span style={{ float: "left", fontFamily: SERIF, fontSize: 86, lineHeight: 0.85, fontWeight: 400, fontVariationSettings: '"opsz" 144', color: T.ink, paddingRight: 14, paddingTop: 6, marginRight: 4 }}>L</span>
                ayering follows two simple rules: pH first, then weight. L-ascorbic acid needs an acidic environment to stay in its active form, so it goes immediately after a low-pH cleanser — before any neutralising humectant, peptide, or moisturiser raises the surface pH and inactivates it. The pigment-blocker layer (tranexamic + niacinamide) is pH-flexible and slots in comfortably after vitamin C has set. SPF goes last, always — it's the protective film that nothing should land on top of.
              </p>
              <p className="mt-6" style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.65, color: T.inkSoft }}>
                The wait times are not aesthetic. They prevent each layer from physically diluting the one below — the most common reason "all the right products" produce no results.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── SUBSTITUTIONS TABLE ──────────────────────────────────── */}
      <section className="relative z-10 border-b" style={{ borderColor: T.rule }}>
        <Container>
          <div className="py-20">
            <Folio>§ 03</Folio>
            <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', letterSpacing: "-0.03em", color: T.ink }}>
              If your skin is <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>different.</span>
            </h2>
            <p className="mt-7 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 18, lineHeight: 1.6, color: T.inkSoft }}>
              Same protocol, swap the molecule. Each cell is graded against the same Tier rubric.
            </p>

            <div className="mt-10 overflow-x-auto border" style={{ borderColor: T.rule }}>
              <table className="w-full" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: T.paper2, fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.mutedSoft, textTransform: "uppercase" }}>
                    {["Step", "Sensitive", "Pregnancy", "Oily / Acne-prone", "Dry / Reactive"].map(h => (
                      <th key={h} className="text-left px-5 py-3 border-b" style={{ borderColor: T.rule, fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SUBSTITUTIONS.map((s, i) => (
                    <tr key={s.step} style={{ borderTop: i === 0 ? "none" : `1px solid ${T.ruleSoft}` }}>
                      <td className="px-5 py-5" style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.4 }}>{s.step}</td>
                      <td className="px-5 py-5" style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5 }}>{s.sensitive}</td>
                      <td className="px-5 py-5" style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5 }}>{s.pregnant}</td>
                      <td className="px-5 py-5" style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5 }}>{s.oily}</td>
                      <td className="px-5 py-5" style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.5 }}>{s.dry}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── MISTAKES ─────────────────────────────────────────────── */}
      <section className="relative z-10 border-b" style={{ borderColor: T.rule, background: T.paper2 }}>
        <Container>
          <div className="py-20">
            <Folio>§ 04</Folio>
            <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', letterSpacing: "-0.03em", color: T.ink }}>
              Where this <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>routine fails.</span>
            </h2>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-0 border" style={{ borderColor: T.rule, background: T.paper }}>
              {MISTAKES.map((m, i) => (
                <div key={m.t} className="p-7" style={{ borderRight: i % 2 === 0 ? `1px solid ${T.rule}` : "none", borderTop: i >= 2 ? `1px solid ${T.rule}` : "none" }}>
                  <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.tierD, textTransform: "uppercase" }}>{String(i + 1).padStart(2, "0")} · MISTAKE</div>
                  <div className="mt-2" style={{ fontFamily: SERIF, fontSize: 22, lineHeight: 1.2, fontWeight: 400, fontVariationSettings: '"opsz" 144', color: T.ink, letterSpacing: "-0.01em" }}>{m.t}</div>
                  <p className="mt-3" style={{ fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.6, color: T.muted }}>{m.b}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────────── */}
      <section className="relative z-10 border-b" style={{ borderColor: T.rule }}>
        <Container>
          <div className="py-20">
            <Folio>§ 05</Folio>
            <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', letterSpacing: "-0.03em", color: T.ink }}>
              Frequently <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>asked.</span>
            </h2>

            <div className="mt-10 border-t" style={{ borderColor: T.rule }}>
              {FAQ.map((f, i) => (
                <div key={f.q} className="border-b" style={{ borderColor: T.rule }}>
                  <button
                    className="w-full flex items-baseline justify-between gap-6 py-6 text-left"
                    aria-expanded={openFaq === i}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <div className="flex items-baseline gap-5">
                      <span style={{ fontFamily: MONO, fontSize: 11, color: T.mutedSoft, letterSpacing: "0.14em" }}>Q.{String(i + 1).padStart(2, "0")}</span>
                      <span style={{ fontFamily: SERIF, fontSize: 21, color: T.ink, lineHeight: 1.3, fontWeight: 400, fontVariationSettings: '"opsz" 144' }}>{f.q}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform" style={{ color: T.muted, transform: openFaq === i ? "rotate(180deg)" : "rotate(0)" }} />
                  </button>
                  {openFaq === i && (
                    <div className="pb-7 pl-[88px] pr-12 -mt-1">
                      <p style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.65, color: T.inkSoft }}>{f.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ─── PAIR WITH ─────────────────────────────────────────── */}
      <section className="relative z-10 py-20" style={{ background: T.ink, color: T.paper }}>
        <Container>
          <div className="grid grid-cols-12 gap-10 items-end">
            <div className="col-span-12 lg:col-span-7">
              <Eyebrow color={T.invertAccent}>Pair this protocol with</Eyebrow>
              <h2 className="mt-5" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', letterSpacing: "-0.03em", color: T.paper }}>
                The matching <span style={{ fontStyle: "italic", color: T.invertAccent, fontFamily: SERIF_ED }}>night routine.</span>
              </h2>
              <p className="mt-6 max-w-xl" style={{ fontFamily: SERIF, fontSize: 18, lineHeight: 1.55, color: T.invertMuted }}>
                Built around tretinoin, azelaic acid, and a barrier-rebuild seal. The slow-work counterpart to this morning protection.
              </p>
            </div>
            <div className="col-span-12 lg:col-span-5 lg:text-right">
              <a href="#" className="inline-flex items-center gap-2 px-6 py-4" style={{ background: T.paper, color: T.ink, fontFamily: SANS, fontSize: 13.5, fontWeight: 500 }}>
                See the PM routine <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </Container>
      </section>

      <EditorPageLink pageKind="routine" pageSlug="RoutineDetail" />
      <SiteFooter />
    </div>
  );
};

export default RoutineDetail;
