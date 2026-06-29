// ConcernDullness — Uneven tone, dullness, lack of "glow."

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
const ROW = concernRowFor("dullness");

const CAUSES = [
  { k: "Slow desquamation",            w: "60%", n: "Stratum corneum cell turnover slows after 30. Light scatter dulls." },
  { k: "Surface dehydration",            w: "55%", n: "Distinct from skin-type dryness. Gives the matte/grey appearance." },
  { k: "Pollution & free radicals",     w: "70%", n: "PM2.5 oxidative load — dramatically higher in Indian metros." },
  { k: "Subclinical pigment scatter",  w: "45%", n: "Diffuse, sub-spot pigment that reads as 'tired.'" },
];

const INGREDIENTS = [
  { name: "Vitamin C 10–15% (LAA)", tier: "A" as const, role: "Antioxidant · brightening", evidence: "Replicated radiance + adjunct lightening" },
  { name: "Glycolic acid 5–10%",     tier: "A" as const, role: "AHA · turnover",            evidence: "Reference exfoliant for tone & texture" },
  { name: "Lactic acid 5–10%",       tier: "A" as const, role: "AHA · gentler",             evidence: "Hydration-friendly · lower PIH risk than glycolic" },
  { name: "Mandelic acid 5–10%",     tier: "B" as const, role: "AHA · gentlest",            evidence: "Larger molecule; pigment-friendly for darker skin" },
  { name: "Niacinamide 4–10%",       tier: "A" as const, role: "Tone evening",              evidence: "Reduces melanosome transfer; modest brightness" },
  { name: "Tranexamic acid 3%",      tier: "A" as const, role: "Pigment-blocker",            evidence: "Strong adjunct for diffuse PIH-driven dullness" },
];

const PROTOCOL = [
  "Low-pH gel cleanser AM + PM",
  "Vitamin C 10–15% (LAA) — every morning, on dry skin",
  "Niacinamide 5–10% — AM + PM in moisturiser or serum",
  "AHA night, twice weekly (lactic 10% or glycolic 5%)",
  "SPF 50+ daily — non-negotiable. Dullness rebounds without it",
  "Evening retinoid 2–3 nights/week — for cumulative texture",
];

const ConcernDullness: React.FC = () => (
  <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
    <LaidPaper />
    <SiteHeader active="Concerns" />
    <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Concerns", href: "#" }, { label: "Dullness & uneven tone" }]} />

    <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
      <TopVignette /><PaperGrain /><ColumnRules opacity={0.32} />
      <div aria-hidden className="absolute -right-16 -top-16 z-0"><AmbientFlask size={580} opacity={0.06} /></div>

      <Container>
        <div className="relative grid grid-cols-12 gap-10 py-24">
          <div className="col-span-12 lg:col-span-8 lg:pl-12">
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
              <Eyebrow color={T.accent}>{ROW.eyebrow}</Eyebrow>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>P. 17 · GUIDE</div>
            </div>

            <h1 className="mt-10" style={{ fontFamily: SERIF, fontSize: 124, lineHeight: 0.9, letterSpacing: "-0.05em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
              Dullness.
            </h1>
            <div className="mt-3" style={{ fontFamily: SERIF_ED, fontSize: 38, fontStyle: "italic", color: T.accent, letterSpacing: "-0.02em" }}>
              The complaint that <span style={{ color: T.inkSoft, fontFamily: SERIF, fontStyle: "normal" }}>shouldn't be a complaint.</span>
            </div>

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
                  ["Pattern",   "Diffuse, no specific lesion · grey/yellow undertone"],
                  ["Drivers",   "Dehydration · slow turnover · pollution · subclinical pigment"],
                  ["Lever",     "Vitamin C + AHA + niacinamide stack"],
                  ["Outlook",   "Visible improvement at 4 weeks, durable at 12"],
                  ["Reviewer",  "Dr. Paul · 16-Apr-2026"],
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
          What's <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>actually causing it.</span>
        </h2>
        <div className="mt-10 space-y-5">
          {CAUSES.map((t) => (
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
          Ingredients that <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>actually brighten.</span>
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
          The <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>protocol.</span>
        </h2>
        <ol className="mt-9 space-y-4" style={{ fontFamily: SERIF, fontSize: 18, color: T.ink, lineHeight: 1.55 }}>
          {PROTOCOL.map((s, i) => (
            <li key={s} className="flex gap-4 border-b pb-4 items-baseline" style={{ borderColor: T.ruleSoft }}>
              <span style={{ fontFamily: SERIF, fontSize: 36, color: T.accent, lineHeight: 0.9, fontVariationSettings: '"opsz" 144, "SOFT" 30', letterSpacing: "-0.02em" }}>{String(i + 1).padStart(2, "0")}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </Container>
    </section>

    <EditorPageLink pageKind="concern" pageSlug="ConcernDullness" />
    <SiteFooter />
  </div>
);

export default ConcernDullness;
