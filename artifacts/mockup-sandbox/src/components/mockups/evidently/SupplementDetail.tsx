// SupplementDetail — Polypodium leucotomos extract.
// The evidence-first oral supplement deep dive.

import React, { useState } from "react";
import { ChevronDown, ArrowRight, Bookmark, Share2, AlertTriangle, Pill } from "lucide-react";
import { T, tierColor } from "./_theme";
import {
  SiteHeader, SiteFooter, Breadcrumbs, Container, Eyebrow, Folio, TierBadge,
  PaperGrain, LaidPaper, ColumnRules, TopVignette, Asterism, AmbientFlask,
  SERIF, SERIF_ED, SANS, MONO,
} from "./_chrome";

const TOC = [
  ["01", "What it is"],
  ["02", "What it does"],
  ["03", "What the trials show"],
  ["04", "Dose & timing"],
  ["05", "Safety & interactions"],
  ["06", "Brands worth buying"],
  ["07", "What it doesn't do"],
  ["08", "FAQ"],
  ["09", "Sources"],
];

const TRIALS = [
  { yr: "2014", n: 22, design: "RCT, double-blind, crossover", dose: "240 mg × 2/d × 60 d", outcome: "Significant ↑ MED (minimum erythema dose) at 60 d", grade: "B" as const },
  { yr: "2018", n: 40, design: "RCT, melasma adjunct",         dose: "240 mg × 2/d × 12 wk", outcome: "MASI reduction 28% vs SPF-only 12%",                grade: "B" as const },
  { yr: "2020", n: 60, design: "RCT, vitiligo adjunct",        dose: "480 mg/d × 6 mo",      outcome: "Repigmentation rate ↑ vs phototherapy alone",     grade: "C" as const },
  { yr: "2022", n: 12, design: "Open-label pilot, polymorphic light eruption", dose: "480 mg/d × 8 wk", outcome: "Symptom severity ↓ in 9/12 subjects",              grade: "C" as const },
];

const BRANDS = [
  { brand: "Heliocare",        name: "Ultra Capsules",      tier: "A" as const, dose: "240 mg PLE",       price: "₹ 2,400 / 30",  why: "The clinical-trial brand. Most studies use this exact extract." },
  { brand: "Fernblock",        name: "Daily Capsules",      tier: "B" as const, dose: "240 mg PLE",       price: "₹ 1,800 / 30",  why: "Same patented extract under a different label. Same evidence." },
  { brand: "Setria / 3rd-party","name": "PLE 250 mg",        tier: "C" as const, dose: "250 mg generic",   price: "₹ 700 / 60",    why: "Generic PLE. Cheaper, no third-party confirmation of active fraction." },
];

const FAQ = [
  { q: "Does it replace sunscreen?",
    a: "No, and no credible practitioner has ever claimed it does. Polypodium adds a small fraction of additional protection from the inside — typically described as 'one-fifth of an SPF.' It's an adjunct, not a substitute. Skip the sunscreen and you skip the protection." },
  { q: "Will I notice anything in a week?",
    a: "Unlikely. The clinical signal builds at 6–8 weeks. Expect to commit to a full 12-week trial before deciding whether it's working for you." },
  { q: "Can I take it long-term?",
    a: "The longest published safety dataset is around 12 months at 480 mg/day. For longer use, build in a 4-week pause every 6 months and discuss with your physician — particularly if you take any anticoagulants." },
  { q: "Why is it Tier B and not Tier A?",
    a: "Because the clinical trials are small (typically n < 50), the effect sizes are modest, and the long-term outcomes are not as robust as we'd want for a Tier A. The molecule is supported, but the data isn't yet conclusive." },
];

const SupplementDetail: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
      <LaidPaper />
      <SiteHeader active="Supplements" />
      <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Supplements", href: "#" }, { label: "Polypodium leucotomos" }]} />

      {/* HERO */}
      <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
        <TopVignette />
        <PaperGrain />
        <ColumnRules opacity={0.32} />
        <div aria-hidden className="absolute -right-16 -top-16 z-0"><AmbientFlask size={580} opacity={0.06} /></div>

        <Container>
          <div className="relative grid grid-cols-12 gap-10 py-24">
            <div className="absolute left-0 top-24 bottom-24 hidden lg:flex flex-col items-center justify-between" style={{ width: 24 }}>
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>SUPPLEMENT · 014 / 36</span>
              <div className="h-px w-3" style={{ background: T.rule }} />
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>FILED · 06 APR 2026</span>
            </div>

            <div className="col-span-12 lg:col-span-8 lg:pl-12">
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
                <Eyebrow color={T.accent}>Supplement · Oral Photoprotection</Eyebrow>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>P. 11 · MONOGRAPH</div>
              </div>

              <div className="mt-8 flex items-center gap-2">
                <TierBadge tier="B" />
                <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", color: T.muted, textTransform: "uppercase" }}>Tier B · Adjunct, not replacement</span>
              </div>

              <h1 className="mt-5" style={{ fontFamily: SERIF, fontSize: 96, lineHeight: 0.92, letterSpacing: "-0.045em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
                Polypodium <br />
                <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>leucotomos.</span>
              </h1>

              <p className="mt-3" style={{ fontFamily: SERIF, fontSize: 19, fontStyle: "italic", color: T.muted }}>
                A South-American fern extract sold under Heliocare and Fernblock.
              </p>

              <p className="mt-9 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>
                The most-studied oral photoprotective supplement on the market. Adds a measurable but modest layer of protection on top of topical SPF — particularly useful in melasma, polymorphic light eruption, and high-UV holiday weeks. Worth the spend for the right person.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <button className="inline-flex items-center gap-2 px-5 py-3" style={{ background: T.ink, color: T.paper, fontFamily: SANS, fontSize: 13, fontWeight: 500 }}>
                  Read the trial summary <ArrowRight className="h-4 w-4" />
                </button>
                <button className="inline-flex items-center gap-2 border px-5 py-3" style={{ borderColor: T.rule, fontFamily: SANS, fontSize: 13, color: T.ink }}>
                  <Bookmark className="h-3.5 w-3.5" /> Save
                </button>
              </div>
            </div>

            {/* Verdict card */}
            <aside className="col-span-12 lg:col-span-4 lg:flex lg:items-end">
              <div className="border" style={{ borderColor: T.rule, background: T.paper }}>
                <div className="px-6 py-4 border-b" style={{ borderColor: T.rule, background: T.paper2 }}>
                  <Eyebrow color={T.accent}>Our verdict</Eyebrow>
                </div>
                <div className="px-6 py-6">
                  <div style={{ fontFamily: SERIF, fontSize: 32, color: T.ink, lineHeight: 1.1, fontWeight: 400, fontVariationSettings: '"opsz" 144' }}>
                    Worth taking <em style={{ color: T.accent, fontFamily: SERIF_ED }}>if</em> melasma, PLE, or chronic UV exposure.
                  </div>
                  <p className="mt-4" style={{ fontFamily: SERIF, fontSize: 14.5, color: T.muted, fontStyle: "italic", lineHeight: 1.55 }}>
                    Skip if you're using it as a sunscreen replacement. The marketing oversells; the science doesn't.
                  </p>
                </div>
                <dl className="border-t divide-y" style={{ borderColor: T.rule }}>
                  {[
                    ["Dose",     "240 mg × 2/d"],
                    ["Form",     "Capsule, oral"],
                    ["Window",   "Trial 12 weeks before judging"],
                    ["Cost",     "₹ 1,800 – 2,400 / month"],
                    ["Reviewer", "Dr. Sundeep · 2026-04-06"],
                  ].map(([k, v]) => (
                    <div key={k} className="px-6 py-3" style={{ borderColor: T.ruleSoft }}>
                      <dt style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.16em", color: T.mutedSoft, textTransform: "uppercase" }}>{k}</dt>
                      <dd className="mt-1" style={{ fontFamily: SERIF, fontSize: 14.5, color: T.ink, lineHeight: 1.4 }}>{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {/* SAFETY ALERT BAND */}
      <section className="relative z-10 border-b" style={{ borderColor: T.rule, background: "#fff7e6" }}>
        <Container>
          <div className="flex items-start gap-5 py-5">
            <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" style={{ color: "#a16207" }} />
            <div>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.18em", color: "#a16207", textTransform: "uppercase", fontWeight: 600 }}>
                Editorial Note · Discuss with your doctor
              </div>
              <p className="mt-1.5" style={{ fontFamily: SERIF, fontSize: 16, color: "#7c4a00", lineHeight: 1.55 }}>
                This is not medical advice. Anyone on anticoagulants, immunosuppressants, or with a known fern allergy should not start polypodium without speaking to their physician.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* BODY */}
      <Container>
        <div className="grid grid-cols-12 gap-10 py-20">
          <aside className="col-span-12 lg:col-span-3">
            <div className="lg:sticky lg:top-8">
              <Eyebrow>Inside this monograph</Eyebrow>
              <ol className="mt-5 space-y-2">
                {TOC.map(([n, t], i) => (
                  <li key={n} className="flex items-baseline gap-3 py-1" style={{ paddingLeft: i === 2 ? 12 : 0, borderLeft: i === 2 ? `2px solid ${T.accent}` : "none" }}>
                    <span style={{ fontFamily: MONO, fontSize: 10, color: i === 2 ? T.accent : T.mutedSoft, letterSpacing: "0.14em" }}>{n}</span>
                    <span style={{ fontFamily: SERIF, fontSize: 15, color: i === 2 ? T.ink : T.inkSoft, lineHeight: 1.3 }}>{t}</span>
                  </li>
                ))}
              </ol>
            </div>
          </aside>

          <div className="col-span-12 lg:col-span-9">
            {/* §01 */}
            <article>
              <Folio>§ 01</Folio>
              <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                What it <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>is.</span>
              </h2>
              <p className="mt-7" style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.65, color: T.inkSoft }}>
                <span style={{ float: "left", fontFamily: SERIF, fontSize: 86, lineHeight: 0.85, fontWeight: 400, fontVariationSettings: '"opsz" 144', color: T.ink, paddingRight: 14, paddingTop: 6, marginRight: 4 }}>P</span>
                olypodium leucotomos is a tropical fern native to Central and South America. The patented extract — sold under the brand names Heliocare (US/EU) and Fernblock (the underlying ingredient) — is standardised for a fraction of polyphenols (chlorogenic, ferulic, caffeic acids) thought to be the active photoprotective constituents. It has been studied since the early 2000s for both general UV protection and disease-specific use in pigmentary disorders.
              </p>
            </article>

            <Asterism />

            {/* §02 */}
            <article>
              <Folio>§ 02</Folio>
              <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                What it <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>does.</span>
              </h2>

              <div className="mt-8 grid grid-cols-12 gap-6">
                <div className="col-span-12 md:col-span-7">
                  <p style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.65, color: T.inkSoft }}>
                    The mechanism is multi-pathway: free radical scavenging, inhibition of UV-induced DNA damage (cyclobutane pyrimidine dimers), and modulation of the post-UV inflammatory cascade. In practice, this translates to a measurable rise in your skin's resistance to sunburn (the MED end-point in trials) and a small reduction in UV-driven pigment activation.
                  </p>
                  <p className="mt-5" style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.65, color: T.inkSoft }}>
                    The honest framing is this: it adds roughly the equivalent of one-fifth of an SPF on top of your existing topical sunscreen. Useful, but only useful — not transformative.
                  </p>
                </div>

                <aside className="col-span-12 md:col-span-5">
                  <div className="border p-6" style={{ borderColor: T.rule, background: T.paper2 }}>
                    <Eyebrow>What it targets</Eyebrow>
                    <ul className="mt-4 space-y-2.5" style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.45 }}>
                      {[
                        "Melasma (adjunct)",
                        "Polymorphic light eruption",
                        "Sunburn-prone fair skin",
                        "Vitiligo (with phototherapy)",
                        "Chronic high UV exposure",
                      ].map(s => (
                        <li key={s} className="flex gap-2 items-baseline">
                          <span style={{ color: T.accent }}>•</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </aside>
              </div>
            </article>

            <Asterism />

            {/* §03 trials */}
            <article>
              <Folio>§ 03</Folio>
              <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                What the <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>trials</span> show.
              </h2>

              <p className="mt-7 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 18, lineHeight: 1.6, color: T.inkSoft }}>
                Four representative trials, ordered by recency. The clinical signal is consistent — modest in size, but real.
              </p>

              <div className="mt-8 border" style={{ borderColor: T.rule }}>
                <div className="grid grid-cols-12 gap-3 px-5 py-3 border-b" style={{ borderColor: T.rule, background: T.paper2, fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.mutedSoft, textTransform: "uppercase" }}>
                  <div className="col-span-1">Yr</div>
                  <div className="col-span-1">N</div>
                  <div className="col-span-3">Design</div>
                  <div className="col-span-2">Dose</div>
                  <div className="col-span-4">Outcome</div>
                  <div className="col-span-1">Grade</div>
                </div>
                {TRIALS.map((t) => (
                  <div key={t.yr + t.n} className="grid grid-cols-12 gap-3 px-5 py-5 border-b items-center" style={{ borderColor: T.ruleSoft }}>
                    <div className="col-span-1" style={{ fontFamily: MONO, fontSize: 13, color: T.muted }}>{t.yr}</div>
                    <div className="col-span-1" style={{ fontFamily: SERIF, fontSize: 18, color: T.ink, fontVariationSettings: '"opsz" 144' }}>{t.n}</div>
                    <div className="col-span-3" style={{ fontFamily: SERIF, fontSize: 14.5, color: T.inkSoft, lineHeight: 1.45 }}>{t.design}</div>
                    <div className="col-span-2" style={{ fontFamily: MONO, fontSize: 12, color: T.muted }}>{t.dose}</div>
                    <div className="col-span-4" style={{ fontFamily: SERIF, fontSize: 14.5, color: T.inkSoft, fontStyle: "italic", lineHeight: 1.5 }}>{t.outcome}</div>
                    <div className="col-span-1"><TierBadge tier={t.grade} /></div>
                  </div>
                ))}
              </div>
              <p className="mt-4" style={{ fontFamily: SERIF, fontSize: 13, color: T.muted, fontStyle: "italic" }}>
                Grade reflects evidence quality (not commercial Tier).
              </p>
            </article>

            <Asterism />

            {/* §04 dose */}
            <article>
              <Folio>§ 04</Folio>
              <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                Dose & <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>timing.</span>
              </h2>

              <div className="mt-9 grid grid-cols-1 md:grid-cols-3 gap-0 border" style={{ borderColor: T.rule }}>
                {[
                  { k: "Daily maintenance", v: "240 mg × 2/d", n: "Morning + lunch. Take with food." },
                  { k: "High-UV days",      v: "240 mg + 240 mg",  n: "Second dose 30 min before peak exposure." },
                  { k: "Therapeutic (Rx)",  v: "480 mg/d × 6 mo",  n: "Vitiligo / melasma. Specialist guidance." },
                ].map((d, i) => (
                  <div key={d.k} className="p-7" style={{ borderRight: i < 2 ? `1px solid ${T.rule}` : "none", background: i === 0 ? T.paper : T.paper2 }}>
                    <Eyebrow color={T.accent}>{d.k}</Eyebrow>
                    <div className="mt-3" style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 400, fontVariationSettings: '"opsz" 144', color: T.ink, letterSpacing: "-0.02em", lineHeight: 1.1 }}>{d.v}</div>
                    <p className="mt-3" style={{ fontFamily: SERIF, fontSize: 14.5, color: T.muted, fontStyle: "italic", lineHeight: 1.55 }}>{d.n}</p>
                  </div>
                ))}
              </div>
            </article>

            <Asterism />

            {/* §05 safety */}
            <article>
              <Folio>§ 05</Folio>
              <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                Safety & <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>interactions.</span>
              </h2>

              <div className="mt-9 grid grid-cols-12 gap-6">
                <div className="col-span-12 md:col-span-6 border p-6" style={{ borderColor: T.rule, background: T.paper2 }}>
                  <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", color: T.tierA, textTransform: "uppercase", fontWeight: 600 }}>Generally safe at recommended dose</div>
                  <ul className="mt-4 space-y-2.5" style={{ fontFamily: SERIF, fontSize: 15.5, color: T.inkSoft, lineHeight: 1.5 }}>
                    {[
                      "Up to 12 months of continuous use studied",
                      "No clinically significant lab abnormalities reported",
                      "Pregnancy data limited — avoid",
                      "Mild GI upset is the most common side effect",
                    ].map(s => <li key={s} className="flex gap-2 items-baseline"><span style={{ color: T.tierA }}>✓</span>{s}</li>)}
                  </ul>
                </div>

                <div className="col-span-12 md:col-span-6 border p-6" style={{ borderColor: T.rule, background: "#fff7e6" }}>
                  <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", color: T.tierD, textTransform: "uppercase", fontWeight: 600 }}>Speak to your physician first</div>
                  <ul className="mt-4 space-y-2.5" style={{ fontFamily: SERIF, fontSize: 15.5, color: T.inkSoft, lineHeight: 1.5 }}>
                    {[
                      "On warfarin, NOACs, or high-dose aspirin",
                      "On immunosuppressants",
                      "Known fern / plant allergy",
                      "Pregnant or breastfeeding",
                    ].map(s => <li key={s} className="flex gap-2 items-baseline"><span style={{ color: T.tierD }}>!</span>{s}</li>)}
                  </ul>
                </div>
              </div>
            </article>

            <Asterism />

            {/* §06 brands */}
            <article>
              <Folio>§ 06</Folio>
              <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                Brands worth <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>buying.</span>
              </h2>

              <div className="mt-9 border-t" style={{ borderColor: T.rule }}>
                {BRANDS.map((b) => (
                  <a key={b.brand + b.name} href="#" className="grid grid-cols-12 gap-6 py-7 border-b items-baseline" style={{ borderColor: T.ruleSoft }}>
                    <div className="col-span-1"><TierBadge tier={b.tier} /></div>
                    <div className="col-span-3">
                      <div style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.18em", color: T.muted, textTransform: "uppercase", fontWeight: 600 }}>{b.brand}</div>
                      <div className="mt-1" style={{ fontFamily: SERIF, fontSize: 19, color: T.ink, fontVariationSettings: '"opsz" 144', lineHeight: 1.25 }}>{b.name}</div>
                    </div>
                    <div className="col-span-2" style={{ fontFamily: MONO, fontSize: 12, color: T.muted }}>{b.dose}</div>
                    <div className="col-span-4" style={{ fontFamily: SERIF, fontSize: 14.5, color: T.inkSoft, fontStyle: "italic", lineHeight: 1.5 }}>{b.why}</div>
                    <div className="col-span-2 text-right" style={{ fontFamily: MONO, fontSize: 13, color: T.ink }}>{b.price}</div>
                  </a>
                ))}
              </div>
            </article>

            <Asterism />

            {/* §07 doesn't do */}
            <article>
              <Folio>§ 07</Folio>
              <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                What it <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>doesn't do.</span>
              </h2>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-0 border" style={{ borderColor: T.rule, background: T.paper }}>
                {[
                  ["Replace your sunscreen.", "Equivalent to roughly one-fifth of an SPF, taken systemically. Insufficient on its own."],
                  ["Cure melasma.",            "It is an adjunct in melasma trials, never a monotherapy."],
                  ["Prevent skin cancer.",     "No evidence supports this. Don't extrapolate."],
                  ["Work in a week.",          "Build to clinical signal at 6–8 weeks. Patience is the dose."],
                ].map(([t, b], i) => (
                  <div key={t} className="p-7" style={{ borderRight: i % 2 === 0 ? `1px solid ${T.rule}` : "none", borderTop: i >= 2 ? `1px solid ${T.rule}` : "none" }}>
                    <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.tierD, textTransform: "uppercase" }}>Doesn't · {String(i + 1).padStart(2, "0")}</div>
                    <div className="mt-2" style={{ fontFamily: SERIF, fontSize: 22, lineHeight: 1.2, color: T.ink, fontVariationSettings: '"opsz" 144', letterSpacing: "-0.01em" }}>{t}</div>
                    <p className="mt-3" style={{ fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.6, color: T.muted }}>{b}</p>
                  </div>
                ))}
              </div>
            </article>

            <Asterism />

            {/* §08 FAQ */}
            <article>
              <Folio>§ 08</Folio>
              <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                Frequently <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>asked.</span>
              </h2>
              <div className="mt-9 border-t" style={{ borderColor: T.rule }}>
                {FAQ.map((f, i) => (
                  <div key={f.q} className="border-b" style={{ borderColor: T.rule }}>
                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-baseline justify-between gap-6 py-6 text-left">
                      <div className="flex items-baseline gap-5">
                        <span style={{ fontFamily: MONO, fontSize: 11, color: T.mutedSoft, letterSpacing: "0.14em" }}>Q.{String(i + 1).padStart(2, "0")}</span>
                        <span style={{ fontFamily: SERIF, fontSize: 21, color: T.ink, lineHeight: 1.3, fontWeight: 400, fontVariationSettings: '"opsz" 144' }}>{f.q}</span>
                      </div>
                      <ChevronDown className="h-4 w-4 shrink-0" style={{ color: T.muted, transform: openFaq === i ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s" }} />
                    </button>
                    {openFaq === i && (
                      <div className="pb-7 pl-[88px] pr-12 -mt-1">
                        <p style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.65, color: T.inkSoft }}>{f.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </article>

            {/* Sources */}
            <div className="mt-16 border-t pt-8" style={{ borderColor: T.rule }}>
              <Eyebrow>Sources & further reading</Eyebrow>
              <ol className="mt-4 space-y-2 list-decimal list-inside" style={{ fontFamily: SANS, fontSize: 12.5, color: T.muted, lineHeight: 1.6 }}>
                <li>Nestor MS et al. Polypodium leucotomos as an adjunct treatment of pigmentary disorders. JCAD 2014.</li>
                <li>Aguilera J et al. PLE oral photoprotection: a randomised double-blind crossover study. Photochem Photobiol 2018.</li>
                <li>Ahmed AM et al. PLE in melasma: an RCT. JAAD 2018.</li>
                <li>Pacifico A et al. PLE plus narrowband UVB in vitiligo. JEADV 2020.</li>
              </ol>
            </div>
          </div>
        </div>
      </Container>

      <SiteFooter />
    </div>
  );
};

export default SupplementDetail;
