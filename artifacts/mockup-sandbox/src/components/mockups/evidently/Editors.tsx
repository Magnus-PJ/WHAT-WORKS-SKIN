// Editors — the masthead. Who reviews each page, and why their bylines mean something.

import React from "react";
import { ArrowRight, ArrowUpRight, Mail, FileText, BarChart3, Radar, Inbox } from "lucide-react";
import { T } from "./_theme";
import {
  SiteHeader, SiteFooter, Breadcrumbs, Container, Eyebrow, Folio,
  PaperGrain, LaidPaper, ColumnRules, TopVignette, Asterism, AmbientFlask,
  SERIF, SERIF_ED, SANS, MONO,
} from "./_chrome";

type Editor = {
  id: string;
  name: string;
  signature: string;
  role: string;
  hue: string;
  pull: string;
  bio: string[];
  credentials: { k: string; v: string }[];
  publications: { yr: string; t: string; venue: string }[];
  remit: string[];
  conflicts: string[];
  recent: { date: string; title: string; kind: string }[];
};

const PAUL: Editor = {
  id: "paul",
  name: "Dr. Paul",
  signature: "Paul",
  role: "Research Lead",
  hue: T.accent,
  pull: "An ingredient is innocent until a trial proves it works. The boring molecule that holds up across replications is what we publish.",
  bio: [
    "Paul leads research for What Works Skin. He spends his weeks reading dermatology literature, talking to formulators, and arguing with the second editor about whether a new molecule deserves a Tier B or a Tier C.",
    "He trained in clinical pharmacology before moving into dermatologic research and has spent fifteen years building structured-evidence reviews for skincare ingredients. He runs a private clinic two days a week — that practice is fully disclosed in the methodology dossier.",
  ],
  credentials: [
    { k: "MBBS",        v: "Christian Medical College, Vellore · 2008" },
    { k: "MD Pharm.",   v: "AIIMS Delhi · 2012" },
    { k: "Diplomate",   v: "Indian Society of Dermatologic Research · 2017" },
    { k: "Member",      v: "International Cosmetic Chemists Society" },
  ],
  publications: [
    { yr: "2024", t: "Niacinamide tolerability ceiling: a 600-patient observational review.", venue: "JCAD" },
    { yr: "2022", t: "Adapalene in adult comedonal acne: meta-review of 22 trials.",          venue: "Indian J Derm" },
    { yr: "2021", t: "Vitamin C topical concentration: where the curve flattens.",             venue: "Cosmet Sci" },
  ],
  remit: [
    "Ingredient research, dose-response review, formulation analysis",
    "Tier rubric authorship and quarterly audit",
    "First-pass review of every guide before medical sign-off",
    "Trend Watch lead author for ingredient and product claims",
  ],
  conflicts: [
    "Operates clinical practice (whatworksclinic.com)",
    "Honoraria: AIIMS Delhi guest lectures (2023, 2024)",
    "Author royalties: 'Skincare, Honestly' (Pan Macmillan India, 2025)",
    "No equity in any cosmeceutical or supplement company.",
  ],
  recent: [
    { date: "20 APR 2026", title: "Beef tallow vs ceramide creams — the receipts",  kind: "Trend Watch" },
    { date: "13 APR 2026", title: "Adapalene microsphere — formulation deep dive",   kind: "Ingredient" },
    { date: "06 APR 2026", title: "Polypodium leucotomos — supplement monograph",    kind: "Supplement" },
    { date: "30 MAR 2026", title: "AM/Pigment-prone routine — 4-step rebuild",       kind: "Routine" },
  ],
};

const SUNDEEP: Editor = {
  id: "sundeep",
  name: "Dr. Sundeep",
  signature: "Sundeep",
  role: "Medical Review Lead",
  hue: "#0b3b5e", // a quieter ink-blue, different from Paul's teal
  pull: "Every guide gets read by the editor who didn't write it. That second pair of eyes is the only thing standing between a guide and our readers.",
  bio: [
    "Sundeep is medical review lead. Every page on this site is signed by both editors; his name appears second only because he reads what Paul writes after Paul writes it.",
    "He is a board-certified dermatologist with a particular interest in pigmentary disorders, melasma in skin of colour, and post-inflammatory hyperpigmentation. He maintains a hospital clinic three mornings a week, which informs the practical 'what we'd actually prescribe' framing in every detail page.",
  ],
  credentials: [
    { k: "MBBS",                v: "Madras Medical College · 2006" },
    { k: "MD Dermatology",      v: "PGIMER Chandigarh · 2011" },
    { k: "Fellowship",          v: "Pigmentary disorders, NSC Singapore · 2014" },
    { k: "Board-certified",     v: "Indian Association of Dermatologists · 2015" },
  ],
  publications: [
    { yr: "2025", t: "Tranexamic acid in melasma: oral vs topical, a head-to-head RCT.",            venue: "JAAD" },
    { yr: "2023", t: "Melasma in Indian skin: a pragmatic protocol for primary-care practice.",     venue: "IJDVL" },
    { yr: "2020", t: "Post-inflammatory hyperpigmentation after acne: 12-week protocol outcomes.",  venue: "Indian J Derm" },
  ],
  remit: [
    "Final medical review and sign-off on every guide",
    "Safety and drug-interaction review for all supplements",
    "Lead author on pigmentation, rosacea, and skin-of-colour content",
    "Reader correspondence with a clinical question",
  ],
  conflicts: [
    "Hospital clinic at Apollo, Chennai (3 mornings/week)",
    "Honoraria: Indian Association of Dermatologists CME (2024, 2025)",
    "Reviewer for IJDVL (unpaid)",
    "No industry consultancy in the last five years.",
  ],
  recent: [
    { date: "20 APR 2026", title: "Melasma — the controllable, not curable protocol", kind: "Concern" },
    { date: "13 APR 2026", title: "UVMune 400 in pigmentary skin — verdict",          kind: "Product" },
    { date: "06 APR 2026", title: "Polypodium — medical sign-off",                    kind: "Supplement" },
    { date: "23 MAR 2026", title: "Topical tranexamic acid — what 'cures' means",     kind: "Trend Watch" },
  ],
};

const EditorPanel: React.FC<{ e: Editor; idx: number }> = ({ e, idx }) => (
  <article id={e.id} className="border-t pt-20 mt-12" style={{ borderColor: T.rule }}>
    {/* Folio + name */}
    <header className="grid grid-cols-12 gap-10 items-end">
      <div className="col-span-12 lg:col-span-8">
        <div className="flex items-center gap-3" style={{ fontFamily: MONO, fontSize: 10, color: T.mutedSoft, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          <span>Editor · {String(idx + 1).padStart(2, "0")} of 02</span>
          <span style={{ color: T.rule }}>·</span>
          <span>{e.role}</span>
        </div>

        <h2 className="mt-5" style={{ fontFamily: SERIF, fontSize: 132, lineHeight: 0.9, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.045em" }}>
          {e.name.split(" ")[0]}{" "}
          <span style={{ fontStyle: "italic", color: e.hue, fontFamily: SERIF_ED }}>{e.name.split(" ")[1]}.</span>
        </h2>
      </div>

      {/* Portrait */}
      <div className="col-span-12 lg:col-span-4 lg:flex lg:justify-end">
        <div className="border" style={{ borderColor: T.rule, background: T.paper2, padding: 14, width: 280 }}>
          <div style={{
            width: "100%", aspectRatio: "4 / 5",
            background: `radial-gradient(circle at 35% 30%, ${e.hue}33, transparent 60%), linear-gradient(160deg, ${T.paper2}, #e6e2d3)`,
            position: "relative", overflow: "hidden",
          }}>
            {/* Engraved silhouette using letterform */}
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
              <span style={{ fontFamily: SERIF_ED, fontStyle: "italic", fontSize: 220, color: e.hue, opacity: 0.42, lineHeight: 1, letterSpacing: "-0.04em" }}>
                {e.name.split(" ")[1].charAt(0)}.
              </span>
            </div>
            {/* Crosshatch lines for "engraving" feel */}
            <div aria-hidden style={{
              position: "absolute", inset: 0, opacity: 0.18, mixBlendMode: "multiply",
              backgroundImage: `repeating-linear-gradient(43deg, ${T.ink} 0 0.4px, transparent 0.4px 4px)`,
            }} />
          </div>
          <div className="mt-3 flex items-baseline justify-between" style={{ fontFamily: MONO, fontSize: 10, color: T.mutedSoft, letterSpacing: "0.16em" }}>
            <span>PORTRAIT · ENGRAVED</span>
            <span>NO. {String(idx + 1).padStart(3, "0")}</span>
          </div>
        </div>
      </div>
    </header>

    {/* Pull quote in editor's hue */}
    <blockquote className="mt-12 border-l-4 pl-8 max-w-4xl" style={{ borderColor: e.hue, fontFamily: SERIF, fontSize: 32, lineHeight: 1.3, color: T.ink, fontWeight: 400, letterSpacing: "-0.015em", fontVariationSettings: '"opsz" 144' }}>
      <span style={{ fontFamily: SERIF_ED, fontStyle: "italic", color: e.hue }}>"</span>
      {e.pull}
      <span style={{ fontFamily: SERIF_ED, fontStyle: "italic", color: e.hue }}>"</span>
    </blockquote>

    {/* Body */}
    <div className="grid grid-cols-12 gap-10 mt-16">
      {/* Bio */}
      <div className="col-span-12 lg:col-span-7">
        <Eyebrow color={e.hue}>Biography</Eyebrow>
        <div className="mt-5 space-y-5">
          {e.bio.map((p, i) => (
            <p key={i} style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.7, color: T.inkSoft }}>
              {i === 0 && (
                <span style={{ float: "left", fontFamily: SERIF, fontSize: 80, lineHeight: 0.85, fontWeight: 400, fontVariationSettings: '"opsz" 144', color: T.ink, paddingRight: 12, paddingTop: 6 }}>
                  {p.charAt(0)}
                </span>
              )}
              {i === 0 ? p.slice(1) : p}
            </p>
          ))}
        </div>

        <div className="mt-12">
          <Eyebrow>What this editor reviews</Eyebrow>
          <ul className="mt-5 space-y-3">
            {e.remit.map(r => (
              <li key={r} className="flex gap-4 items-baseline pb-3 border-b" style={{ borderColor: T.ruleSoft, fontFamily: SERIF, fontSize: 17, color: T.inkSoft, lineHeight: 1.5 }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: e.hue, flexShrink: 0, transform: "translateY(2px)" }} />
                {r}
              </li>
            ))}
          </ul>
        </div>

        {/* Selected publications */}
        <div className="mt-12">
          <Eyebrow>Selected publications</Eyebrow>
          <ul className="mt-5 border-t" style={{ borderColor: T.rule }}>
            {e.publications.map(p => (
              <li key={p.t} className="grid grid-cols-12 gap-4 py-5 border-b items-baseline" style={{ borderColor: T.ruleSoft }}>
                <div className="col-span-2" style={{ fontFamily: SERIF, fontSize: 28, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: e.hue, fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 0.9 }}>{p.yr}</div>
                <div className="col-span-8" style={{ fontFamily: SERIF, fontSize: 17, color: T.ink, lineHeight: 1.45, fontStyle: "italic" }}>{p.t}</div>
                <div className="col-span-2 text-right" style={{ fontFamily: MONO, fontSize: 11, color: T.muted, letterSpacing: "0.14em", textTransform: "uppercase" }}>{p.venue}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Credentials sidebar */}
      <aside className="col-span-12 lg:col-span-5">
        <div className="border" style={{ borderColor: T.rule }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: T.rule, background: T.paper2 }}>
            <Eyebrow color={e.hue}>Credentials</Eyebrow>
          </div>
          <dl className="divide-y" style={{ borderColor: T.rule }}>
            {e.credentials.map(c => (
              <div key={c.k} className="px-6 py-4" style={{ borderColor: T.ruleSoft }}>
                <dt style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.16em", color: T.mutedSoft, textTransform: "uppercase", fontWeight: 600 }}>{c.k}</dt>
                <dd className="mt-1.5" style={{ fontFamily: SERIF, fontSize: 15.5, color: T.ink, lineHeight: 1.45 }}>{c.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-8 border" style={{ borderColor: T.rule, background: T.paper2 }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: T.rule }}>
            <Eyebrow>Declared conflicts</Eyebrow>
          </div>
          <ul className="px-6 py-4 space-y-2.5" style={{ fontFamily: SERIF, fontSize: 14.5, color: T.inkSoft, lineHeight: 1.5 }}>
            {e.conflicts.map(c => (
              <li key={c} className="flex gap-2 items-baseline">
                <span style={{ color: e.hue, fontFamily: SERIF, fontSize: 16, lineHeight: 1 }}>—</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recent bylines */}
        <div className="mt-8 border" style={{ borderColor: T.rule }}>
          <div className="px-6 py-4 border-b flex items-baseline justify-between" style={{ borderColor: T.rule, background: T.paper2 }}>
            <Eyebrow>Recent bylines</Eyebrow>
            <span style={{ fontFamily: MONO, fontSize: 9.5, color: T.mutedSoft, letterSpacing: "0.14em" }}>LAST 30 D</span>
          </div>
          <ul className="divide-y" style={{ borderColor: T.rule }}>
            {e.recent.map(b => (
              <li key={b.title}>
                <a href="#" className="block px-6 py-4 group" style={{ borderColor: T.ruleSoft }}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.14em", color: T.muted, textTransform: "uppercase" }}>{b.kind}</span>
                    <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.12em", color: T.mutedSoft }}>{b.date}</span>
                  </div>
                  <div className="mt-1.5 flex items-baseline justify-between gap-2">
                    <span style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, fontVariationSettings: '"opsz" 144', lineHeight: 1.35 }}>{b.title}</span>
                    <ArrowRight className="h-3 w-3 shrink-0" style={{ color: e.hue }} />
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>

    {/* Sign-off */}
    <div className="mt-16 flex items-end justify-between border-t pt-10" style={{ borderColor: T.rule }}>
      <div>
        <div style={{ fontFamily: SERIF_ED, fontSize: 56, color: e.hue, fontStyle: "italic", lineHeight: 1, letterSpacing: "-0.015em" }}>{e.signature}</div>
        <div className="mt-3" style={{ fontFamily: MONO, fontSize: 10, color: T.mutedSoft, letterSpacing: "0.16em", textTransform: "uppercase" }}>{e.name} · {e.role}</div>
      </div>
      <div className="flex items-center gap-4">
        <a href="#" className="inline-flex items-center gap-2 px-4 py-3 border" style={{ borderColor: T.rule, fontFamily: SANS, fontSize: 12, color: T.ink }}>
          <Mail className="h-3.5 w-3.5" /> Write to {e.name.split(" ")[1]}
        </a>
        <a href="#" className="inline-flex items-center gap-2 px-4 py-3 border" style={{ borderColor: T.rule, fontFamily: SANS, fontSize: 12, color: T.ink }}>
          <FileText className="h-3.5 w-3.5" /> Full bibliography
        </a>
      </div>
    </div>
  </article>
);

const Editors: React.FC = () => {
  return (
    <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
      <LaidPaper />
      <SiteHeader />
      <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Editors" }]} />

      {/* MASTHEAD */}
      <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
        <TopVignette />
        <PaperGrain />
        <ColumnRules opacity={0.32} />
        <div aria-hidden className="absolute -right-24 -top-12 z-0"><AmbientFlask size={520} opacity={0.06} /></div>

        <Container>
          <div className="relative grid grid-cols-12 gap-10 py-24">
            <div className="absolute left-0 top-24 bottom-24 hidden lg:flex flex-col items-center justify-between" style={{ width: 24 }}>
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>SECTION 09 / EDITORS</span>
              <div className="h-px w-3" style={{ background: T.rule }} />
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>MASTHEAD · 02 BYLINES</span>
            </div>

            <div className="col-span-12 lg:col-span-8 lg:pl-12">
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
                <Eyebrow color={T.accent}>The Masthead</Eyebrow>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>P. 15 · DOSSIER</div>
              </div>

              <h1 className="mt-10" style={{ fontFamily: SERIF, fontSize: 110, lineHeight: 0.93, letterSpacing: "-0.045em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
                Two names, <br />
                <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>two signatures.</span>
              </h1>

              <p className="mt-10 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>
                Every page on this site is written and reviewed by the same two people. Dr. Paul leads research; Dr. Sundeep leads medical review. Neither name appears alone. If a guide is published here, both editors have signed off on it — and either of them can be written to about it.
              </p>
            </div>

            <aside className="col-span-12 lg:col-span-4 lg:flex lg:items-end">
              <div className="border p-7 w-full" style={{ borderColor: T.rule, background: T.paper2 }}>
                <Eyebrow>The bylines, in numbers</Eyebrow>
                <dl className="mt-5 divide-y" style={{ borderColor: T.rule }}>
                  {[
                    ["Combined years in dermatology", "33"],
                    ["Combined peer-reviewed papers", "47"],
                    ["Both editors sign every page", "100%"],
                    ["Industry consultancy income",  "₹ 0"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-baseline justify-between py-3" style={{ borderColor: T.ruleSoft }}>
                      <dt style={{ fontFamily: MONO, fontSize: 10.5, color: T.mutedSoft, letterSpacing: "0.14em", textTransform: "uppercase" }}>{k}</dt>
                      <dd style={{ fontFamily: SERIF, fontSize: 22, color: T.ink, fontVariationSettings: '"opsz" 144' }}>{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <Container>
        <EditorPanel e={PAUL} idx={0} />
        <Asterism />
        <EditorPanel e={SUNDEEP} idx={1} />

        {/* Workflow strip */}
        <section className="mt-24 border-t pt-16" style={{ borderColor: T.rule }}>
          <Eyebrow color={T.accent}>How a guide gets to you</Eyebrow>
          <h2 className="mt-5" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
            Five-stage <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>review.</span>
          </h2>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-5 gap-0 border-l border-t" style={{ borderColor: T.rule }}>
            {[
              ["01", "Lit search",       "Paul builds the source list. Last 5 years prioritised."],
              ["02", "First draft",      "Author drafts against the rubric. Tier provisional."],
              ["03", "Editor cross-read", "Second editor red-pencils. Disagreements are logged."],
              ["04", "Tier sign-off",    "Final tier set jointly. Both names attached."],
              ["05", "Publish + diary",  "Diary date set for next review (≤ 12 months)."],
            ].map(([n, t, b], i) => (
              <div key={n} className="p-7 border-r border-b" style={{ borderColor: T.rule, background: i % 2 === 0 ? T.paper : T.paper2 }}>
                <div style={{ fontFamily: MONO, fontSize: 11, color: T.accent, letterSpacing: "0.18em", fontWeight: 600 }}>STAGE {n}</div>
                <h3 className="mt-3" style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144', lineHeight: 1.15, letterSpacing: "-0.015em" }}>{t}</h3>
                <p className="mt-3" style={{ fontFamily: SERIF, fontSize: 14.5, lineHeight: 1.55, color: T.muted, fontStyle: "italic" }}>{b}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Editor desk · dashboards. Canonical home for editor-only
            instrumentation pages so they're reachable without typing
            the URL. Add new editorial dashboards to this list. */}
        <section className="mt-24 border-t pt-16" style={{ borderColor: T.rule }}>
          <div className="flex items-baseline justify-between gap-6 flex-wrap">
            <div>
              <Eyebrow color={T.accent}>Editor desk · dashboards</Eyebrow>
              <h2 className="mt-5" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                Editor-only <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>instrumentation.</span>
              </h2>
            </div>
            <p className="max-w-md" style={{ fontFamily: SERIF_ED, fontStyle: "italic", fontSize: 16, lineHeight: 1.55, color: T.muted }}>
              Internal pages we look at when we're deciding what to write next. Not linked from the public site.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <a
              href="/__mockup/preview/evidently/EditorShelfClicks"
              className="group block border p-7 transition-colors"
              style={{ borderColor: T.rule, background: T.paper }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span
                    className="inline-flex items-center justify-center"
                    style={{ width: 36, height: 36, background: T.accentSoft, color: T.accent, border: `1px solid ${T.accent}55` }}
                  >
                    <BarChart3 className="h-4 w-4" />
                  </span>
                  <div style={{ fontFamily: MONO, fontSize: 10.5, color: T.mutedSoft, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600 }}>
                    Analytics · live
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4" style={{ color: T.accent }} />
              </div>
              <h3 className="mt-5" style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144', lineHeight: 1.15, letterSpacing: "-0.02em" }}>
                Shelf clicks <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>dashboard</span>
              </h3>
              <p className="mt-3" style={{ fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.55, color: T.muted }}>
                Every &ldquo;Visit brand&rdquo; click leaving an editorial page, grouped by source. Useful for deciding which routine and concern guides are actually doing the job.
              </p>
            </a>

            <a
              href="/__mockup/preview/evidently/EditorTrendQueue"
              className="group block border p-7 transition-colors"
              style={{ borderColor: T.rule, background: T.paper }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span
                    className="inline-flex items-center justify-center"
                    style={{ width: 36, height: 36, background: T.accentSoft, color: T.accent, border: `1px solid ${T.accent}55` }}
                  >
                    <Radar className="h-4 w-4" />
                  </span>
                  <div style={{ fontFamily: MONO, fontSize: 10.5, color: T.mutedSoft, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600 }}>
                    Trend Radar · queue
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4" style={{ color: T.accent }} />
              </div>
              <h3 className="mt-5" style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144', lineHeight: 1.15, letterSpacing: "-0.02em" }}>
                Trend Radar <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>reviewer</span>
              </h3>
              <p className="mt-3" style={{ fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.55, color: T.muted }}>
                Candidate trends clustered nightly from Reddit, PubMed, Google Trends, and FDA news. Approve, reject, or snooze each one — approvals publish straight into the next site build.
              </p>
            </a>

            <a
              href="/__mockup/preview/evidently/EditorCorrections"
              className="group block border p-7 transition-colors"
              style={{ borderColor: T.rule, background: T.paper }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span
                    className="inline-flex items-center justify-center"
                    style={{ width: 36, height: 36, background: T.accentSoft, color: T.accent, border: `1px solid ${T.accent}55` }}
                  >
                    <Inbox className="h-4 w-4" />
                  </span>
                  <div style={{ fontFamily: MONO, fontSize: 10.5, color: T.mutedSoft, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600 }}>
                    Reader corrections · inbox
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4" style={{ color: T.accent }} />
              </div>
              <h3 className="mt-5" style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144', lineHeight: 1.15, letterSpacing: "-0.02em" }}>
                Corrections <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>inbox</span>
              </h3>
              <p className="mt-3" style={{ fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.55, color: T.muted }}>
                Errors flagged by readers via the &ldquo;Submit a correction&rdquo; form. Triage each one through new → triaged → applied or dismissed, with internal notes that never reach the reader.
              </p>
            </a>
          </div>
        </section>
      </Container>

      {/* CONTACT BAND */}
      <section className="relative z-10 mt-24 py-24 border-y" style={{ borderColor: T.rule, background: T.ink, color: T.paper }}>
        <Container>
          <div className="grid grid-cols-12 gap-10 items-end">
            <div className="col-span-12 lg:col-span-7">
              <Eyebrow color={T.invertAccent}>Reader correspondence · open</Eyebrow>
              <h2 className="mt-5" style={{ fontFamily: SERIF, fontSize: 60, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', letterSpacing: "-0.03em", color: T.paper }}>
                Spotted an <span style={{ fontStyle: "italic", color: T.invertAccent, fontFamily: SERIF_ED }}>error?</span>
              </h2>
              <p className="mt-6 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 18, lineHeight: 1.6, color: T.invertMuted }}>
                Substantive corrections are made within seven days, with a public note at the foot of the page. We answer reader letters within two weeks. We do not offer individual medical consultations by email.
              </p>
            </div>
            <div className="col-span-12 lg:col-span-5 lg:text-right">
              <a href="#" className="inline-flex items-center gap-2 px-6 py-4" style={{ background: T.paper, color: T.ink, fontFamily: SANS, fontSize: 13.5, fontWeight: 500 }}>
                Write to the editors <ArrowRight className="h-4 w-4" />
              </a>
              <div className="mt-4" style={{ fontFamily: MONO, fontSize: 11, color: T.invertMuted, letterSpacing: "0.16em" }}>
                editors@whatworksskin.com · ≈ 14 day response
              </div>
            </div>
          </div>
        </Container>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Editors;
