// ConcernRosacea — Rosacea (vascular reactivity) guide.

import React from "react";
import { ArrowRight, Bookmark, Share2, ExternalLink } from "lucide-react";
import { T } from "./_theme";
import {
  SiteHeader, SiteFooter, Breadcrumbs, Container, Eyebrow, Folio, TierBadge,
  PaperGrain, LaidPaper, ColumnRules, TopVignette, Asterism, AmbientFlask,
  SERIF, SERIF_ED, SANS, MONO,
} from "./_chrome";
import { EditorPageLink } from "./_EditorPageLink";
import { concernRowFor } from "./_concernCatalogue";
import { productLinkForBriefEntry, shelfOutboundClickHandler } from "./_links";

// Hero eyebrow / dek live in the concern catalogue alongside the
// taxonomy hub row — the page reads them through `concernRowFor`
// so the prose stays in one place.
const ROW = concernRowFor("rosacea");

const TRIGGERS = [
  { k: "Sun & UVA",         w: "85%", n: "The single largest trigger. Daily SPF non-negotiable." },
  { k: "Heat & spice",        w: "62%", n: "Hot food, hot showers, hot yoga, summer cooking. The Indian kitchen is rosacea-hostile." },
  { k: "Alcohol",              w: "70%", n: "Particularly red wine and dark spirits. Vasoactive sulphites." },
  { k: "Topical irritants",   w: "55%", n: "Fragrance, alcohol denat., AHAs, retinoids — at the wrong dose." },
];

const INGREDIENTS = [
  { name: "Azelaic acid 15% (Rx)",   tier: "A" as const, role: "Anti-inflammatory · papulopustular", evidence: "First-line, multiple RCTs" },
  { name: "Metronidazole 0.75%",     tier: "A" as const, role: "Anti-inflammatory · Rx",                evidence: "Reference Rx for decades" },
  { name: "Ivermectin 1% (Rx)",      tier: "A" as const, role: "Anti-Demodex · Rx",                     evidence: "Strong RCT data, faster onset than azelaic" },
  { name: "Niacinamide 4–5%",        tier: "A" as const, role: "Erythema · barrier",                    evidence: "Replicated reduction in flushing" },
  { name: "Centella / madecassoside", tier: "B" as const, role: "Calming",                                evidence: "Open-label & small RCTs · symptomatic" },
  { name: "Brimonidine 0.33% (Rx)",  tier: "B" as const, role: "Vasoconstrictor — short-term",         evidence: "Rebound flushing common; reserve for events" },
];

export const PRODUCTS = [
  { brand: "Galderma", name: "Finacea Foam 15% (Rx)", tier: "A" as const, score: 90, why: "Reference azelaic for papular rosacea. Foam vehicle excels." },
  { brand: "La Roche-Posay", name: "Toleriane Sensitive Riche", tier: "A" as const, score: 84, why: "Fragrance-free, neurosensitive-tested. Minimalist barrier cream." },
  { brand: "Avène", name: "Antirougeurs DAY", tier: "B" as const, score: 76, why: "Ruscus extract + thermal water. Mild redness reduction over 4 weeks." },
  { brand: "Skin1004", name: "Madagascar Centella Ampoule", tier: "A" as const, score: 82, why: "Cleanest centella formula at honest price. Soothes flares." },
];

const ConcernRosacea: React.FC = () => (
  <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
    <LaidPaper />
    <SiteHeader active="Concerns" />
    <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Concerns", href: "#" }, { label: "Rosacea" }]} />

    <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
      <TopVignette /><PaperGrain /><ColumnRules opacity={0.32} />
      <div aria-hidden className="absolute -right-16 -top-16 z-0"><AmbientFlask size={580} opacity={0.06} /></div>

      <Container>
        <div className="relative grid grid-cols-12 gap-10 py-24">
          <div className="col-span-12 lg:col-span-8 lg:pl-12">
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
              <Eyebrow color={T.accent}>{ROW.eyebrow}</Eyebrow>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>P. 13 · GUIDE</div>
            </div>

            <h1 className="mt-10" style={{ fontFamily: SERIF, fontSize: 124, lineHeight: 0.9, letterSpacing: "-0.05em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
              Rosacea.
            </h1>
            <div className="mt-3" style={{ fontFamily: SERIF_ED, fontSize: 38, fontStyle: "italic", color: T.accent, letterSpacing: "-0.02em" }}>
              Vascular reactivity. <span style={{ color: T.inkSoft, fontFamily: SERIF, fontStyle: "normal" }}>Treated, often, as if it were acne.</span>
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
                <Eyebrow color={T.accent}>The condition at a glance</Eyebrow>
              </div>
              <dl className="divide-y" style={{ borderColor: T.rule }}>
                {[
                  ["Prevalence", "~5% globally · slightly higher in women 30–50"],
                  ["Subtypes",   "Erythematotelangiectatic · papulopustular · phymatous · ocular"],
                  ["Driver",     "Vascular & immune dysregulation; Demodex implicated"],
                  ["Diagnosis",  "Clinical · derm consultation"],
                  ["Outlook",    "Controllable with trigger management + topical Rx"],
                  ["Reviewer",   "Dr. Sundeep · last reviewed 2026-04-13"],
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

    {/* TRIGGERS */}
    <section className="relative z-10 border-b py-20" style={{ borderColor: T.rule }}>
      <Container>
        <Folio>§ 01</Folio>
        <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.03em" }}>
          The triggers <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>worth tracking.</span>
        </h2>
        <div className="mt-10 space-y-5">
          {TRIGGERS.map((t) => (
            <div key={t.k} className="grid grid-cols-12 gap-6 items-start">
              <div className="col-span-12 md:col-span-3"><div style={{ fontFamily: SERIF, fontSize: 22, color: T.ink, lineHeight: 1.2, fontVariationSettings: '"opsz" 144' }}>{t.k}</div></div>
              <div className="col-span-12 md:col-span-7">
                <div className="h-1.5 w-full" style={{ background: T.ruleSoft }}><div className="h-full" style={{ background: T.accent, width: t.w }} /></div>
                <p className="mt-3" style={{ fontFamily: SERIF, fontSize: 15, color: T.muted, lineHeight: 1.55, fontStyle: "italic" }}>{t.n}</p>
              </div>
              <div className="col-span-12 md:col-span-2 md:text-right"><span style={{ fontFamily: SERIF, fontSize: 32, fontVariationSettings: '"opsz" 144', color: T.ink, letterSpacing: "-0.02em" }}>{t.w}</span></div>
            </div>
          ))}
        </div>
      </Container>
    </section>

    {/* INGREDIENTS */}
    <section className="relative z-10 border-b py-20" style={{ borderColor: T.rule, background: T.paper2 }}>
      <Container>
        <Folio>§ 02</Folio>
        <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.03em" }}>
          Ingredients that <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>actually work.</span>
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

    {/* PRODUCTS */}
    <section className="relative z-10 border-b py-20" style={{ borderColor: T.rule }}>
      <Container>
        <Folio>§ 03</Folio>
        <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.03em" }}>
          On <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>our shelf.</span>
        </h2>
        <div className="mt-9 grid grid-cols-1 md:grid-cols-2 gap-0 border-l border-t" style={{ borderColor: T.rule }}>
          {PRODUCTS.map((p) => {
            const link = productLinkForBriefEntry(p.brand, p.name);
            const cardBody = (
              <>
                <div className="flex items-start justify-between mb-3">
                  <span style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.18em", color: T.muted, textTransform: "uppercase", fontWeight: 600 }}>{p.brand}</span>
                  <TierBadge tier={p.tier} />
                </div>
                <div style={{ fontFamily: SERIF, fontSize: 20, lineHeight: 1.25, color: T.ink, fontVariationSettings: '"opsz" 144' }}>{p.name}</div>
                <p className="mt-4" style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.55, color: T.muted, fontStyle: "italic" }}>{p.why}</p>
                <div className="mt-auto pt-5 flex items-baseline justify-between border-t" style={{ borderColor: T.ruleSoft }}>
                  <span style={{ fontFamily: SERIF, fontSize: 28, fontVariationSettings: '"opsz" 144', color: T.ink, letterSpacing: "-0.02em" }}>{p.score}<span style={{ color: T.mutedSoft, fontSize: 12 }}>⁄100</span></span>
                  {link?.external ? (
                    <span className="inline-flex items-center gap-1.5" style={{ fontFamily: SANS, fontSize: 12, color: T.accent }}>Visit brand <ExternalLink className="h-3 w-3" /></span>
                  ) : link ? (
                    <span className="inline-flex items-center gap-1.5" style={{ fontFamily: SANS, fontSize: 12, color: T.accent }}>Read review <ArrowRight className="h-3 w-3" /></span>
                  ) : (
                    <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.mutedSoft, textTransform: "uppercase" }}>Not yet reviewed</span>
                  )}
                </div>
              </>
            );
            const cls = "flex flex-col p-7 border-r border-b";
            const style = { borderColor: T.rule, background: T.paper };
            if (!link) {
              return <div key={p.name} className={cls} style={style}>{cardBody}</div>;
            }
            const externalProps = link.external
              ? { target: "_blank" as const, rel: "noopener noreferrer" }
              : {};
            const onClick = shelfOutboundClickHandler(link, {
              brand: p.brand,
              productName: p.name,
              pageKind: "concern",
              pageSlug: "ConcernRosacea",
            });
            return (
              <a key={p.name} href={link.href} className={cls} style={style} onClick={onClick} {...externalProps}>{cardBody}</a>
            );
          })}
        </div>
      </Container>
    </section>

    <EditorPageLink pageKind="concern" pageSlug="ConcernRosacea" />
    <SiteFooter />
  </div>
);

export default ConcernRosacea;
