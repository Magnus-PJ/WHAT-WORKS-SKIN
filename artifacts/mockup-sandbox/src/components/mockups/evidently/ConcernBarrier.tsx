// ConcernBarrier — Compromised barrier guide.

import React from "react";
import { ArrowRight, Bookmark, Share2 } from "lucide-react";
import { T } from "./_theme";
import {
  SiteHeader, SiteFooter, Breadcrumbs, Container, Eyebrow, Folio, TierBadge,
  PaperGrain, LaidPaper, ColumnRules, TopVignette, AmbientFlask,
  SERIF, SERIF_ED, SANS, MONO,
} from "./_chrome";
import { EditorPageLink } from "./_EditorPageLink";
import { concernRowFor } from "./_concernCatalogue";

// Hero eyebrow / dek live in the concern catalogue alongside the
// taxonomy hub row — the page reads them through `concernRowFor`
// so the prose stays in one place.
const ROW = concernRowFor("compromised-barrier");

const SIGNS = [
  { k: "Stinging on water alone",     w: "92%", n: "The cardinal sign. Means the stratum corneum is no longer intact." },
  { k: "Tightness within minutes",     w: "85%", n: "TEWL has spiked. Hydration evaporates faster than it can be replaced." },
  { k: "Sudden product intolerance",  w: "78%", n: "Things that worked last month now sting. Your barrier is the variable." },
  { k: "Visible flaking / micropeel", w: "65%", n: "Stratum corneum desquamation is disorganised. Often confused for 'glow'." },
];

const INGREDIENTS = [
  { name: "Ceramides 3 + 1 + 6-II",  tier: "A" as const, role: "Lipid replacement",   evidence: "Biomimetic ratios. Multi-vesicular emulsion preferred." },
  { name: "Cholesterol",                tier: "A" as const, role: "Lipid replacement",   evidence: "Rebuilds the stratum-corneum bilayer alongside ceramides." },
  { name: "Free fatty acids",          tier: "A" as const, role: "Lipid replacement",   evidence: "Linoleic acid; supports the third pillar of the bilayer." },
  { name: "Panthenol 5%",              tier: "A" as const, role: "Hydration · soothing", evidence: "Pro-vitamin B5. Reduces TEWL within 48 hours." },
  { name: "Niacinamide 4–5%",          tier: "A" as const, role: "Ceramide upregulation", evidence: "Replicated upregulation of endogenous ceramide synthesis." },
  { name: "Centella asiatica",          tier: "B" as const, role: "Anti-inflammatory",    evidence: "Symptomatic relief; modest barrier endpoints." },
  { name: "Petrolatum",                  tier: "A" as const, role: "Occlusive",            evidence: "Reduces TEWL by ~99%. The reference occlusive." },
];

const PHASES = [
  { w: "Week 1–2", t: "Strip back", b: "Cleanser + ceramide moisturiser + SPF only. No actives, no acids, no retinoids, no fragrance." },
  { w: "Week 3–4", t: "Add panthenol", b: "Centella or panthenol serum AM + PM. Continue zero-active routine." },
  { w: "Week 5–6", t: "First active", b: "Niacinamide 4–5% in moisturiser only. Watch for sting; hold if any." },
  { w: "Week 7+",  t: "Slow re-introduction", b: "Twice-weekly retinoid OR azelaic — never both, never more than twice a week to start." },
];

const ConcernBarrier: React.FC = () => (
  <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
    <LaidPaper />
    <SiteHeader active="Concerns" />
    <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Concerns", href: "#" }, { label: "Compromised barrier" }]} />

    <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
      <TopVignette /><PaperGrain /><ColumnRules opacity={0.32} />
      <div aria-hidden className="absolute -right-16 -top-16 z-0"><AmbientFlask size={580} opacity={0.06} /></div>

      <Container>
        <div className="relative grid grid-cols-12 gap-10 py-24">
          <div className="col-span-12 lg:col-span-8 lg:pl-12">
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
              <Eyebrow color={T.accent}>{ROW.eyebrow}</Eyebrow>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>P. 15 · GUIDE</div>
            </div>

            <h1 className="mt-10" style={{ fontFamily: SERIF, fontSize: 108, lineHeight: 0.93, letterSpacing: "-0.045em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
              Compromised <br />
              <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>barrier.</span>
            </h1>

            <p className="mt-9 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>
              {ROW.dek}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <button className="inline-flex items-center gap-2 px-5 py-3" style={{ background: T.ink, color: T.paper, fontFamily: SANS, fontSize: 13, fontWeight: 500 }}>Read the guide <ArrowRight className="h-4 w-4" /></button>
              <button className="inline-flex items-center gap-2 border px-5 py-3" style={{ borderColor: T.rule, fontFamily: SANS, fontSize: 13, color: T.ink }}><Bookmark className="h-3.5 w-3.5" /> Save</button>
              <button className="inline-flex items-center gap-2 border px-5 py-3" style={{ borderColor: T.rule, fontFamily: SANS, fontSize: 13, color: T.ink }}><Share2 className="h-3.5 w-3.5" /> Share</button>
            </div>
          </div>

          <aside className="col-span-12 lg:col-span-4 lg:flex lg:items-end">
            <div className="border" style={{ borderColor: T.rule, background: T.paper }}>
              <div className="px-6 py-4 border-b" style={{ borderColor: T.rule, background: T.paper2 }}>
                <Eyebrow color={T.accent}>At a glance</Eyebrow>
              </div>
              <dl className="divide-y" style={{ borderColor: T.rule }}>
                {[
                  ["Prevalence", "Underdiagnosed; we estimate 1 in 4 routine-using adults"],
                  ["Driver",      "Over-exfoliation · over-active stacking · physical injury"],
                  ["Recovery",    "4 – 8 weeks with strict protocol"],
                  ["Outlook",     "Excellent — fully reversible if you let it heal"],
                  ["Reviewer",    "Dr. Paul · 14-Apr-2026"],
                ].map(([k, v]) => (
                  <div key={k} className="px-6 py-3.5" style={{ borderColor: T.ruleSoft }}>
                    <dt style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.16em", color: T.mutedSoft, textTransform: "uppercase" }}>{k}</dt>
                    <dd className="mt-1" style={{ fontFamily: SERIF, fontSize: 14.5, color: T.ink, lineHeight: 1.45 }}>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>
      </Container>
    </section>

    <section className="relative z-10 border-b py-20" style={{ borderColor: T.rule }}>
      <Container>
        <Folio>§ 01</Folio>
        <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.03em" }}>
          The signs <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>worth taking seriously.</span>
        </h2>
        <div className="mt-10 space-y-5">
          {SIGNS.map((t) => (
            <div key={t.k} className="grid grid-cols-12 gap-6 items-start">
              <div className="col-span-12 md:col-span-3"><div style={{ fontFamily: SERIF, fontSize: 22, color: T.ink, lineHeight: 1.2, fontVariationSettings: '"opsz" 144' }}>{t.k}</div></div>
              <div className="col-span-12 md:col-span-7">
                <div className="h-1.5 w-full" style={{ background: T.ruleSoft }}><div className="h-full" style={{ background: T.accent, width: t.w }} /></div>
                <p className="mt-3" style={{ fontFamily: SERIF, fontSize: 15, color: T.muted, lineHeight: 1.55, fontStyle: "italic" }}>{t.n}</p>
              </div>
              <div className="col-span-12 md:col-span-2 md:text-right"><span style={{ fontFamily: SERIF, fontSize: 32, fontVariationSettings: '"opsz" 144', color: T.ink }}>{t.w}</span></div>
            </div>
          ))}
        </div>
      </Container>
    </section>

    <section className="relative z-10 border-b py-20" style={{ borderColor: T.rule, background: T.paper2 }}>
      <Container>
        <Folio>§ 02</Folio>
        <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.03em" }}>
          The repair <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>molecules.</span>
        </h2>
        <div className="mt-9 border" style={{ borderColor: T.rule, background: T.paper }}>
          <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b" style={{ borderColor: T.rule, background: T.paper2, fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.mutedSoft, textTransform: "uppercase" }}>
            <div className="col-span-1">Tier</div>
            <div className="col-span-3">Molecule</div>
            <div className="col-span-3">Role</div>
            <div className="col-span-5">Evidence</div>
          </div>
          {INGREDIENTS.map((i) => (
            <a key={i.name} href="#" className="grid grid-cols-12 gap-4 px-5 py-5 items-center border-b last:border-b-0" style={{ borderColor: T.ruleSoft }}>
              <div className="col-span-1"><TierBadge tier={i.tier} /></div>
              <div className="col-span-3" style={{ fontFamily: SERIF, fontSize: 17, color: T.ink, fontVariationSettings: '"opsz" 144' }}>{i.name}</div>
              <div className="col-span-3" style={{ fontFamily: SANS, fontSize: 13, color: T.muted }}>{i.role}</div>
              <div className="col-span-5" style={{ fontFamily: SERIF, fontSize: 14.5, color: T.inkSoft, fontStyle: "italic", lineHeight: 1.5 }}>{i.evidence}</div>
            </a>
          ))}
        </div>
      </Container>
    </section>

    <section className="relative z-10 border-b py-20" style={{ borderColor: T.rule }}>
      <Container>
        <Folio>§ 03</Folio>
        <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.03em" }}>
          The 8-week <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>rebuild.</span>
        </h2>
        <div className="mt-9 border-t" style={{ borderColor: T.rule }}>
          {PHASES.map((p) => (
            <div key={p.w} className="grid grid-cols-12 gap-6 py-7 border-b items-baseline" style={{ borderColor: T.ruleSoft }}>
              <div className="col-span-12 md:col-span-2" style={{ fontFamily: MONO, fontSize: 11, color: T.mutedSoft, letterSpacing: "0.16em", textTransform: "uppercase" }}>{p.w}</div>
              <div className="col-span-12 md:col-span-3" style={{ fontFamily: SERIF, fontSize: 24, color: T.accent, fontVariationSettings: '"opsz" 144', lineHeight: 1.2 }}>{p.t}</div>
              <div className="col-span-12 md:col-span-7" style={{ fontFamily: SERIF, fontSize: 17, color: T.inkSoft, lineHeight: 1.6 }}>{p.b}</div>
            </div>
          ))}
        </div>
      </Container>
    </section>

    <EditorPageLink pageKind="concern" pageSlug="ConcernBarrier" />
    <SiteFooter />
  </div>
);

export default ConcernBarrier;
