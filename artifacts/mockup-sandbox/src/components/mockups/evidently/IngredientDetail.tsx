import React, { useState } from "react";
import { ChevronDown, ExternalLink, Copy, Bookmark, Share2, AlertTriangle, Check, X, FlaskConical, ArrowRight } from "lucide-react";
import { T, F, tierColor, tierBg } from "./_theme";
import { SiteHeader, SiteFooter, Breadcrumbs, Container, Eyebrow, Folio, TierBadge, PaperGrain, LaidPaper, ColumnRules, TopVignette, Asterism, Wordmark, SERIF, SERIF_ED, SANS, MONO } from "./_chrome";
import { EditorPageLink } from "./_EditorPageLink";

import { FoundIn } from "./_FoundIn";
import { productLinkForBriefEntry, shelfOutboundClickHandler, linkifyText } from "./_links";

const concernLink = (text: string) => linkifyText(text, { scope: "concerns" });
const TOC = [
  { id: "at-a-glance", label: "At a glance" },
  { id: "how-it-works", label: "How it works" },
  { id: "evidence", label: "The evidence" },
  { id: "by-concern", label: "Concentration by concern" },
  { id: "how-to-use", label: "How to use" },
  { id: "mistakes", label: "Common mistakes" },
  { id: "myths", label: "Myths vs truth" },
  { id: "faq", label: "FAQ" },
  { id: "alternatives", label: "Safer alternatives" },
  { id: "products", label: "Products that use it" },
  { id: "related", label: "Related ingredients" },
  { id: "reviewer", label: "Reviewer note" },
];

const STUDIES = [
  {
    authors: "Weiss et al.", journal: "JAMA", year: 1988, pmid: "2909796",
    n: 40, design: "Double-blind RCT", duration: "16 wk",
    finding: "0.05% tretinoin cream improved photoaging signs (fine wrinkling, mottled hyperpigmentation, sallowness, tactile roughness) significantly over vehicle in a double-blind randomised controlled trial.",
    grade: "A",
  },
  {
    authors: "Kang et al.", journal: "Arch Dermatol", year: 2005, pmid: "16230554",
    n: 204, design: "Multicentre RCT", duration: "24 wk",
    finding: "0.02% tretinoin significantly improved fine wrinkles, mottling, roughness, and laxity over 24 weeks at the lowest commercially available concentration.",
    grade: "A",
  },
  {
    authors: "Thielitz et al.", journal: "Am J Clin Dermatol", year: 2008, pmid: "18793029",
    n: null, design: "Systematic review", duration: "—",
    finding: "Topical retinoids remain first-line for comedonal and mild inflammatory acne, with tretinoin and adapalene having the strongest evidence base.",
    grade: "A",
  },
  {
    authors: "Mukherjee et al.", journal: "Clin Interv Aging", year: 2006, pmid: "18046911",
    n: null, design: "Narrative review", duration: "—",
    finding: "Tretinoin remains the gold-standard topical retinoid for photoaging reversal, with histologic and clinical evidence accumulated over four decades.",
    grade: "A",
  },
];

const CONCENTRATION = [
  { concern: "Photoaging", range: "0.025 – 0.05%", note: "0.025% is the sweet spot for tolerability and results — most patients should never need higher.", evidence: "Tier A" },
  { concern: "Acne (comedonal)", range: "0.025%", note: "Pair with BP short-contact to reduce resistance risk.", evidence: "Tier A" },
  { concern: "Acne (inflammatory)", range: "0.05 – 0.1%", note: "Often combined with oral therapy for moderate-severe acne.", evidence: "Tier A" },
  { concern: "PIH (post-inflammatory)", range: "0.025%", note: "Slow but durable; combine with sunscreen and azelaic acid.", evidence: "Tier B" },
  { concern: "Stretch marks (early)", range: "0.05 – 0.1%", note: "Only the red phase responds. Older silver striae do not.", evidence: "Tier B" },
];

const MISTAKES = [
  { t: "Applying to damp skin", b: "Damp skin amplifies penetration and irritation. Wait 10 minutes after washing." },
  { t: "Layering with strong AHAs the same night", b: "Acid-on-retinoid stacks the irritation. Alternate nights." },
  { t: "Going from nothing to 0.1%", b: "Start at 0.025% every third night. Escalate over weeks." },
  { t: "Stopping after a week of peeling", b: "Peeling is the expected acclimation phase, not failure." },
  { t: "Using a tiny dot for the whole face", b: "Pea-sized. Less is not safer; less is just under-dosed." },
];

const MYTHS = [
  { m: "Tretinoin is too harsh for dry skin.", t: "Dry skin needs more buffering — moisturiser sandwich, alternate nights — but benefits equally from long-term use." },
  { m: "Natural retinol alternatives work as well.", t: "Bakuchiol shows promising retinoid-like gene modulation but does not match tretinoin's RCT evidence base." },
  { m: "You can't use tretinoin in summer.", t: "You can. Don't stop. Just be meticulous with broad-spectrum SPF — that's true year-round anyway." },
  { m: "Tretinoin thins the skin.", t: "It thins the stratum corneum (good — that's how it works) and thickens the dermis (also good — that's the anti-aging effect)." },
];

const FAQ = [
  { q: "How long to see results?", a: "Acne improvements at 8–12 weeks. Photoaging improvements at 24–48 weeks of consistent use. Anything you notice in week one is mostly the acclimation phase." },
  { q: "Can I use tretinoin forever?", a: "Yes — long-term studies show maintained benefit without tolerance loss. Use the lowest effective frequency after the acclimation phase." },
  { q: "Tretinoin and benzoyl peroxide?", a: "Older formulations were inactivated by BP. Modern tretinoin microsphere and lotion formulations are BP-compatible, or simply alternate nights." },
  { q: "Tretinoin in summer?", a: "Fine — do not stop. Just be meticulous with broad-spectrum SPF." },
  { q: "Do I need a prescription?", a: "In most markets, yes. Some markets sell it OTC (e.g., parts of South-East Asia). A dermatologist consult is strongly preferred." },
  { q: "Does benzoyl peroxide destroy tretinoin?", a: "Classic tretinoin degrades in the presence of BP. Modern microsphere or polymeric emulsions of tretinoin are stable with BP, but alternating nights remains the safest approach." },
];

export const PRODUCTS = [
  { brand: "Generic", name: "Tretinoin 0.025% Cream", price: "₹ 180", note: "Multiple Indian generics; Galderma & Sun Pharma most reliable." },
  { brand: "Galderma", name: "A-Ret 0.05% Gel", price: "₹ 320", note: "Common starter strength for acne." },
  { brand: "Obagi", name: "Tretinoin 0.05% Cream (Rx)", price: "₹ 4,400", note: "Cleaner vehicle, much higher cost." },
];

const RELATED = [
  { tier: "A", name: "Retinol", sub: "Anti-aging, tone, texture" },
  { tier: "A", name: "Adapalene", sub: "Acne, comedonal skin" },
  { tier: "B", name: "Bakuchiol", sub: "Plant-based retinoid analogue" },
  { tier: "A", name: "Azelaic acid", sub: "Rosacea, acne, PIH" },
];

const SECTION_PADDING = "py-20";

const IngredientDetail: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeToc] = useState("how-it-works");

  return (
    <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
      <LaidPaper />
      <SiteHeader active="Ingredients" />
      <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Ingredients", href: "#" }, { label: "Tretinoin" }]} />

      {/* ─── HERO ───────────────────────────────────────────────────────── */}
      <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
        <TopVignette />
        <PaperGrain />
        <ColumnRules opacity={0.32} />

        {/* Ambient molecule glyph */}
        <svg aria-hidden className="absolute -right-32 -top-20 z-0" width="780" height="780" viewBox="0 0 780 780" style={{ opacity: 0.06 }}>
          <g fill="none" stroke={T.ink} strokeWidth="1.4">
            {Array.from({ length: 6 }).map((_, i) => {
              const a = (i / 6) * Math.PI * 2;
              const cx = 390 + Math.cos(a) * 200;
              const cy = 390 + Math.sin(a) * 200;
              return <circle key={i} cx={cx} cy={cy} r="46" />;
            })}
            <circle cx="390" cy="390" r="46" />
            <circle cx="390" cy="390" r="280" />
            <circle cx="390" cy="390" r="340" />
          </g>
        </svg>

        <Container>
          <div className="relative grid grid-cols-12 gap-10 py-20">
            {/* Vertical marginalia */}
            <div className="absolute left-0 top-20 bottom-20 hidden lg:flex flex-col items-center justify-between" style={{ width: 24 }}>
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                INGREDIENT № 001 / 30
              </span>
              <div className="h-px w-3" style={{ background: T.rule }} />
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                FILED 18 APR 2026
              </span>
            </div>

            {/* LEFT — title block */}
            <div className="col-span-12 lg:col-span-8 lg:pl-12">
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
                <div className="flex items-center gap-3">
                  <Eyebrow color={T.accent}>Ingredient · Anti-aging & fine lines</Eyebrow>
                </div>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>P. 04 · DOSSIER</div>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <TierBadge tier="A" size="lg" />
                <span style={{ fontFamily: MONO, fontSize: 10.5, color: T.muted, letterSpacing: "0.12em" }}>EVIDENCE GRADE · CLINICAL</span>
              </div>

              <h1 className="mt-6" style={{ fontFamily: SERIF, fontSize: 132, lineHeight: 0.92, letterSpacing: "-0.045em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
                Tretinoin
              </h1>

              <p className="mt-2" style={{ fontFamily: SERIF_ED, fontSize: 22, fontStyle: "italic", color: T.muted, letterSpacing: "-0.005em" }}>
                all-trans retinoic acid · C<sub style={{ fontSize: 14 }}>20</sub>H<sub style={{ fontSize: 14 }}>28</sub>O<sub style={{ fontSize: 14 }}>2</sub> · MW 300.4 Da
              </p>

              <p className="mt-10 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 22, lineHeight: 1.5, color: T.inkSoft, fontWeight: 400 }}>
                {concernLink("Prescription all-trans retinoic acid. The most-studied topical retinoid in dermatology — and the standard against which every other anti-aging molecule is measured.")}
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2" style={{ fontFamily: SANS, fontSize: 12.5, color: T.muted, letterSpacing: "0.02em" }}>
                <span><strong style={{ color: T.ink, fontWeight: 600 }}>Research</strong> Dr. Paul</span>
                <span style={{ color: T.mutedSoft }}>·</span>
                <span><strong style={{ color: T.ink, fontWeight: 600 }}>Reviewed</strong> Dr. Sundeep</span>
                <span style={{ color: T.mutedSoft }}>·</span>
                <span>Last reviewed 2026-04-18</span>
                <span style={{ color: T.mutedSoft }}>·</span>
                <span>Methodology v1.0</span>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button className="inline-flex items-center gap-2 border px-4 py-2.5" style={{ borderColor: T.ink, color: T.ink, fontFamily: SANS, fontSize: 12.5, fontWeight: 500 }}>
                  <Bookmark className="h-3.5 w-3.5" /> Save
                </button>
                <button className="inline-flex items-center gap-2 border px-4 py-2.5" style={{ borderColor: T.ink, color: T.ink, fontFamily: SANS, fontSize: 12.5, fontWeight: 500 }}>
                  <Share2 className="h-3.5 w-3.5" /> Share
                </button>
                <a href="#evidence" className="inline-flex items-center gap-2 px-4 py-2.5" style={{ background: T.ink, color: T.paper, fontFamily: SANS, fontSize: 12.5, fontWeight: 500 }}>
                  Jump to evidence <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* RIGHT — at a glance card */}
            <aside className="col-span-12 lg:col-span-4">
              <div className="border" style={{ borderColor: T.rule, background: T.paper }}>
                <div className="border-b px-5 py-3 flex items-center justify-between" style={{ borderColor: T.rule, background: T.paper2 }}>
                  <Eyebrow>At a glance</Eyebrow>
                  <FlaskConical className="h-3.5 w-3.5" style={{ color: T.muted }} />
                </div>
                <div className="px-5 py-5 space-y-4" style={{ fontFamily: SANS, fontSize: 13 }}>
                  {[
                    { k: "Pregnancy", v: "Avoid", flag: "danger" },
                    { k: "Breastfeeding", v: "Avoid", flag: "danger" },
                    { k: "Paediatric", v: "Derm supervision", flag: "warning" },
                    { k: "Photosensitivity", v: "Yes — wear SPF", flag: "warning" },
                    { k: "Sensitive skin", v: "Buffer required", flag: "warning" },
                  ].map((r) => {
                    const c = r.flag === "danger" ? T.danger : r.flag === "warning" ? T.warning : T.ok;
                    const bg = r.flag === "danger" ? T.dangerSoft : r.flag === "warning" ? T.warningSoft : T.okSoft;
                    return (
                      <div key={r.k} className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0" style={{ borderColor: T.ruleSoft }}>
                        <span style={{ color: T.muted, letterSpacing: "0.02em" }}>{r.k}</span>
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5" style={{ color: c, background: bg, border: `1px solid ${c}33`, borderRadius: 2, fontSize: 11.5, fontWeight: 600, letterSpacing: "0.02em" }}>
                          {r.flag === "danger" ? <X className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                          {r.v}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="px-5 py-4 border-t grid grid-cols-2 gap-3" style={{ borderColor: T.rule, background: T.paper2 }}>
                  <div>
                    <div style={{ fontFamily: MONO, fontSize: 9.5, color: T.mutedSoft, letterSpacing: "0.12em" }}>EVIDENCE-GRADE DOSE</div>
                    <div className="mt-1.5" style={{ fontFamily: SERIF, fontSize: 22, color: T.ink, fontWeight: 400, letterSpacing: "-0.01em" }}>0.025–0.1%</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: MONO, fontSize: 9.5, color: T.mutedSoft, letterSpacing: "0.12em" }}>RX STATUS</div>
                    <div className="mt-1.5" style={{ fontFamily: SERIF, fontSize: 22, color: T.ink, fontWeight: 400, letterSpacing: "-0.01em" }}>Prescription</div>
                  </div>
                </div>
              </div>

              {/* Quick scoring snapshot */}
              <div className="mt-4 border p-5" style={{ borderColor: T.rule, background: T.paper }}>
                <Eyebrow>Evidence dossier</Eyebrow>
                <div className="mt-4 space-y-2.5" style={{ fontFamily: SANS, fontSize: 12.5 }}>
                  {[
                    ["Clinical RCTs", 12, T.tierA],
                    ["Reviews / meta", 8, T.tierA],
                    ["Years of data", 38, T.tierA],
                    ["FDA-approved indications", 3, T.tierA],
                  ].map(([k, v, c]) => (
                    <div key={k as string} className="flex items-baseline justify-between">
                      <span style={{ color: T.muted }}>{k as string}</span>
                      <span style={{ color: c as string, fontFamily: SERIF, fontSize: 18, fontWeight: 400, letterSpacing: "-0.01em" }}>{v as number}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {/* ─── ARTICLE BODY ─────────────────────────────────────────────────── */}
      <section className={`relative z-10 ${SECTION_PADDING}`} style={{ background: T.paper }}>
        <Container>
          <div className="grid grid-cols-12 gap-12">
            {/* TOC SIDEBAR */}
            <aside className="col-span-12 lg:col-span-3">
              <div className="sticky top-8">
                <Eyebrow>On this page</Eyebrow>
                <ol className="mt-5 space-y-2 border-l" style={{ borderColor: T.rule }}>
                  {TOC.map((t, i) => {
                    const active = t.id === activeToc;
                    return (
                      <li key={t.id}>
                        <a href={`#${t.id}`} className="flex items-baseline gap-3 -ml-px pl-4 py-1" style={{
                          fontFamily: SANS, fontSize: 12.5, color: active ? T.ink : T.muted,
                          fontWeight: active ? 600 : 400,
                          borderLeft: active ? `2px solid ${T.accent}` : "2px solid transparent",
                          marginLeft: -1,
                        }}>
                          <span style={{ fontFamily: MONO, fontSize: 10, color: T.mutedSoft, letterSpacing: "0.06em" }}>{String(i + 1).padStart(2, "0")}</span>
                          <span>{t.label}</span>
                        </a>
                      </li>
                    );
                  })}
                </ol>

                {/* Cite card */}
                <div className="mt-10 border p-4" style={{ borderColor: T.rule }}>
                  <div className="flex items-center justify-between mb-3">
                    <Eyebrow>Cite this page</Eyebrow>
                    <button className="inline-flex items-center gap-1" style={{ fontFamily: SANS, fontSize: 11, color: T.accent }}>
                      <Copy className="h-3 w-3" /> Copy
                    </button>
                  </div>
                  <p style={{ fontFamily: MONO, fontSize: 10.5, lineHeight: 1.55, color: T.muted }}>
                    What Works Skin. (2026). <em>Tretinoin — ingredient evidence summary.</em> Retrieved from whatworksskin.com/ingredients/tretinoin
                  </p>
                </div>
              </div>
            </aside>

            {/* MAIN PROSE */}
            <article className="col-span-12 lg:col-span-9 lg:pl-6">
              {/* HOW IT WORKS */}
              <section id="how-it-works" className="scroll-mt-24">
                <div className="flex items-baseline justify-between border-b pb-3 mb-8" style={{ borderColor: T.rule }}>
                  <h2 style={{ fontFamily: SERIF, fontSize: 44, fontWeight: 400, letterSpacing: "-0.02em", color: T.ink, fontVariationSettings: '"opsz" 144' }}>
                    How it <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>works</span>
                  </h2>
                  <Folio n="§ 02" />
                </div>
                <p style={{ fontFamily: SERIF, fontSize: 19.5, lineHeight: 1.65, color: T.inkSoft, fontWeight: 400 }}>
                  <span style={{ fontFamily: SERIF, fontSize: 64, lineHeight: 0.78, color: T.accent, float: "left", marginRight: 10, marginTop: 6, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>R</span>
                  eady-to-bind retinoic acid (MW ~300 Da) — it skips the two oxidation steps that retinol must complete inside skin cells. It preferentially binds <em>RAR-γ</em> and <em>RAR-β</em> nuclear receptors in fibroblasts and keratinocytes, shifting transcription toward new collagen synthesis, faster corneocyte turnover, and melanocyte suppression.
                </p>
                <p className="mt-5" style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.7, color: T.inkSoft }}>
                  {concernLink("It is the most comprehensively documented topical for photoageing reversal — the molecule that established the entire category. When studies say \"retinoid,\" they almost always mean tretinoin or its derivatives.")}
                </p>

                {/* Mechanism diagram */}
                <div className="mt-10 border p-8" style={{ borderColor: T.rule, background: T.paper2 }}>
                  <Eyebrow>Mechanism · simplified</Eyebrow>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-0">
                    {[
                      { n: "01", t: "Binds nuclear receptor", b: "Tretinoin → RAR-γ / RAR-β in keratinocytes & fibroblasts." },
                      { n: "02", t: "Shifts transcription", b: "Up-regulates pro-collagen I & III, down-regulates MMP-1." },
                      { n: "03", t: "Remodels skin", b: "Thickened dermis, faster turnover, tone evened over months." },
                    ].map((s, i) => (
                      <div key={s.n} className="px-6 first:pl-0 last:pr-0" style={{ borderRight: i < 2 ? `1px solid ${T.rule}` : "none" }}>
                        <span style={{ fontFamily: SERIF, fontSize: 36, fontWeight: 400, color: T.accent, letterSpacing: "-0.04em", lineHeight: 1, fontVariationSettings: '"opsz" 144' }}>{s.n}</span>
                        <h4 className="mt-3" style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 500, color: T.ink, letterSpacing: "-0.005em" }}>{s.t}</h4>
                        <p className="mt-2" style={{ fontFamily: SANS, fontSize: 12.5, lineHeight: 1.55, color: T.muted }}>{concernLink(s.b)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* EVIDENCE */}
              <section id="evidence" className="scroll-mt-24 mt-20">
                <div className="flex items-baseline justify-between border-b pb-3 mb-8" style={{ borderColor: T.rule }}>
                  <h2 style={{ fontFamily: SERIF, fontSize: 44, fontWeight: 400, letterSpacing: "-0.02em", color: T.ink, fontVariationSettings: '"opsz" 144' }}>
                    The <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>evidence</span>
                  </h2>
                  <Folio n="§ 03" />
                </div>

                <p style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.7, color: T.inkSoft }}>
                  Selected primary literature. Each citation links to PubMed. We weight RCTs and large meta-analyses heaviest; case reports do not move our grade.
                </p>

                <div className="mt-8 border-t" style={{ borderColor: T.rule }}>
                  {STUDIES.map((s, i) => (
                    <div key={s.pmid} className="grid grid-cols-12 gap-6 py-7 border-b" style={{ borderColor: T.rule }}>
                      <div className="col-span-12 md:col-span-3 flex flex-col">
                        <div style={{ fontFamily: MONO, fontSize: 10, color: T.mutedSoft, letterSpacing: "0.1em" }}>STUDY № {String(i + 1).padStart(2, "0")}</div>
                        <div className="mt-2" style={{ fontFamily: SERIF, fontSize: 22, color: T.ink, fontWeight: 400, letterSpacing: "-0.015em", lineHeight: 1.15 }}>{s.authors}</div>
                        <div className="mt-1" style={{ fontFamily: SERIF_ED, fontSize: 15, fontStyle: "italic", color: T.muted }}>{s.journal} · {s.year}</div>
                        <a href={`https://pubmed.ncbi.nlm.nih.gov/${s.pmid}/`} className="mt-3 inline-flex items-center gap-1.5" style={{ fontFamily: MONO, fontSize: 10.5, color: T.accent, letterSpacing: "0.04em" }}>
                          PMID {s.pmid} <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <div className="col-span-12 md:col-span-7">
                        <p style={{ fontFamily: SERIF, fontSize: 16.5, lineHeight: 1.6, color: T.inkSoft }}>{concernLink(s.finding)}</p>
                        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1" style={{ fontFamily: MONO, fontSize: 11, color: T.muted, letterSpacing: "0.04em" }}>
                          <span>Design · {s.design}</span>
                          {s.n && <span>n = {s.n}</span>}
                          <span>Duration · {s.duration}</span>
                        </div>
                      </div>
                      <div className="col-span-12 md:col-span-2 flex md:justify-end">
                        <TierBadge tier={s.grade} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center gap-3" style={{ fontFamily: SANS, fontSize: 12, color: T.muted }}>
                  <span>4 of 12 selected studies shown.</span>
                  <a href="#" style={{ color: T.accent, textDecoration: "underline", textUnderlineOffset: 3 }}>See full evidence dossier →</a>
                </div>
              </section>

              {/* CONCENTRATION TABLE */}
              <section id="by-concern" className="scroll-mt-24 mt-20">
                <div className="flex items-baseline justify-between border-b pb-3 mb-8" style={{ borderColor: T.rule }}>
                  <h2 style={{ fontFamily: SERIF, fontSize: 44, fontWeight: 400, letterSpacing: "-0.02em", color: T.ink, fontVariationSettings: '"opsz" 144' }}>
                    Concentration <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>by concern</span>
                  </h2>
                  <Folio n="§ 04" />
                </div>
                <div className="border" style={{ borderColor: T.rule }}>
                  <div className="grid grid-cols-12 border-b py-3 px-5" style={{ borderColor: T.rule, background: T.paper2, fontFamily: MONO, fontSize: 10, color: T.mutedSoft, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                    <div className="col-span-3">Concern</div>
                    <div className="col-span-3">Evidence-grade range</div>
                    <div className="col-span-5">Note</div>
                    <div className="col-span-1 text-right">Grade</div>
                  </div>
                  {CONCENTRATION.map((row) => (
                    <div key={row.concern} className="grid grid-cols-12 items-baseline border-b py-5 px-5" style={{ borderColor: T.rule }}>
                      <div className="col-span-3" style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 500, color: T.ink, letterSpacing: "-0.005em" }}>{concernLink(row.concern)}</div>
                      <div className="col-span-3" style={{ fontFamily: SERIF, fontSize: 19, color: T.accent, fontWeight: 400, letterSpacing: "-0.01em" }}>{row.range}</div>
                      <div className="col-span-5" style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.55, color: T.muted }}>{concernLink(row.note)}</div>
                      <div className="col-span-1 flex justify-end">
                        <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color: tierColor(row.evidence.split(" ")[1]), background: tierBg(row.evidence.split(" ")[1]), border: `1px solid ${tierColor(row.evidence.split(" ")[1])}55`, padding: "2px 7px", borderRadius: 2 }}>
                          {row.evidence.split(" ")[1]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* HOW TO USE */}
              <section id="how-to-use" className="scroll-mt-24 mt-20">
                <div className="flex items-baseline justify-between border-b pb-3 mb-8" style={{ borderColor: T.rule }}>
                  <h2 style={{ fontFamily: SERIF, fontSize: 44, fontWeight: 400, letterSpacing: "-0.02em", color: T.ink, fontVariationSettings: '"opsz" 144' }}>
                    How to <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>use</span>
                  </h2>
                  <Folio n="§ 05" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border" style={{ borderColor: T.rule }}>
                  {[
                    { eyebrow: "Schedule", body: "Begin every third night for two weeks, then every other night for two weeks, then nightly. If irritation: drop one rung." },
                    { eyebrow: "Dose", body: "Pea-sized for the entire face. Less is not safer; less is just under-dosed and slower to results." },
                    { eyebrow: "Application", body: "Apply to dry skin (10 min after washing). Buffer with moisturiser sandwich if sensitive — moisturiser → tretinoin → moisturiser." },
                    { eyebrow: "AM ritual", body: "SPF 30+ broad-spectrum every morning. This is non-negotiable on tretinoin." },
                  ].map((b, i) => (
                    <div key={b.eyebrow} className="p-7" style={{ borderRight: i % 2 === 0 ? `1px solid ${T.rule}` : "none", borderBottom: i < 2 ? `1px solid ${T.rule}` : "none" }}>
                      <Eyebrow>{b.eyebrow}</Eyebrow>
                      <p className="mt-3" style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.6, color: T.inkSoft }}>{b.body}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* MISTAKES */}
              <section id="mistakes" className="scroll-mt-24 mt-20">
                <div className="flex items-baseline justify-between border-b pb-3 mb-8" style={{ borderColor: T.rule }}>
                  <h2 style={{ fontFamily: SERIF, fontSize: 44, fontWeight: 400, letterSpacing: "-0.02em", color: T.ink, fontVariationSettings: '"opsz" 144' }}>
                    Common <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>mistakes</span>
                  </h2>
                  <Folio n="§ 06" />
                </div>
                <div className="space-y-0 border-t" style={{ borderColor: T.rule }}>
                  {MISTAKES.map((m, i) => (
                    <div key={m.t} className="grid grid-cols-12 gap-6 py-6 border-b" style={{ borderColor: T.rule }}>
                      <div className="col-span-2" style={{ fontFamily: SERIF, fontSize: 56, fontWeight: 400, color: T.tierD, letterSpacing: "-0.04em", lineHeight: 0.9, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>{String(i + 1).padStart(2, "0")}</div>
                      <div className="col-span-10">
                        <h3 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 400, color: T.ink, letterSpacing: "-0.015em", lineHeight: 1.2 }}>{m.t}</h3>
                        <p className="mt-2" style={{ fontFamily: SANS, fontSize: 14.5, lineHeight: 1.6, color: T.muted }}>{m.b}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* MYTHS VS TRUTH */}
              <section id="myths" className="scroll-mt-24 mt-20">
                <div className="flex items-baseline justify-between border-b pb-3 mb-8" style={{ borderColor: T.rule }}>
                  <h2 style={{ fontFamily: SERIF, fontSize: 44, fontWeight: 400, letterSpacing: "-0.02em", color: T.ink, fontVariationSettings: '"opsz" 144' }}>
                    Myths vs <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>truth</span>
                  </h2>
                  <Folio n="§ 07" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {MYTHS.map((m, i) => (
                    <div key={i} className="border" style={{ borderColor: T.rule }}>
                      <div className="border-b px-5 py-3 flex items-center gap-2" style={{ borderColor: T.dangerSoft, background: T.dangerSoft }}>
                        <X className="h-3.5 w-3.5" style={{ color: T.danger }} />
                        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", color: T.danger, fontWeight: 700, textTransform: "uppercase" }}>Myth</span>
                      </div>
                      <p className="px-5 py-4" style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.5, color: T.ink, fontStyle: "italic" }}>"{m.m}"</p>
                      <div className="border-t px-5 py-3 flex items-center gap-2" style={{ borderColor: T.okSoft, background: T.okSoft }}>
                        <Check className="h-3.5 w-3.5" style={{ color: T.ok }} />
                        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", color: T.ok, fontWeight: 700, textTransform: "uppercase" }}>Truth</span>
                      </div>
                      <p className="px-5 py-4" style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.6, color: T.inkSoft }}>{m.t}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* FAQ */}
              <section id="faq" className="scroll-mt-24 mt-20">
                <div className="flex items-baseline justify-between border-b pb-3 mb-8" style={{ borderColor: T.rule }}>
                  <h2 style={{ fontFamily: SERIF, fontSize: 44, fontWeight: 400, letterSpacing: "-0.02em", color: T.ink, fontVariationSettings: '"opsz" 144' }}>
                    Frequently <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>asked</span>
                  </h2>
                  <Folio n="§ 08" />
                </div>
                <div className="border-t" style={{ borderColor: T.rule }}>
                  {FAQ.map((f, i) => {
                    const open = openFaq === i;
                    return (
                      <div key={f.q} className="border-b" style={{ borderColor: T.rule }}>
                        <button
                          onClick={() => setOpenFaq(open ? null : i)}
                          aria-expanded={open}
                          aria-controls={`faq-panel-${i}`}
                          className="w-full flex items-baseline justify-between gap-6 py-5 text-left"
                        >
                          <div className="flex items-baseline gap-5">
                            <span style={{ fontFamily: MONO, fontSize: 11, color: T.mutedSoft, letterSpacing: "0.08em" }}>Q.{String(i + 1).padStart(2, "0")}</span>
                            <h3 style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 400, color: T.ink, letterSpacing: "-0.01em", lineHeight: 1.3 }}>{f.q}</h3>
                          </div>
                          <ChevronDown className="h-4 w-4 shrink-0 transition-transform" style={{ color: T.muted, transform: open ? "rotate(180deg)" : "none" }} />
                        </button>
                        {open && (
                          <div className="pl-[80px] pb-6 max-w-3xl">
                            <p style={{ fontFamily: SERIF, fontSize: 16.5, lineHeight: 1.65, color: T.inkSoft }}>{concernLink(f.a)}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* PRODUCTS THAT USE IT */}
              <section id="products" className="scroll-mt-24 mt-20">
                <div className="flex items-baseline justify-between border-b pb-3 mb-8" style={{ borderColor: T.rule }}>
                  <h2 style={{ fontFamily: SERIF, fontSize: 44, fontWeight: 400, letterSpacing: "-0.02em", color: T.ink, fontVariationSettings: '"opsz" 144' }}>
                    Products that <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>use it</span>
                  </h2>
                  <Folio n="§ 09" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-l border-t" style={{ borderColor: T.rule }}>
                  {PRODUCTS.map((p) => {
                    const link = productLinkForBriefEntry(p.brand, p.name);
                    const inner = (
                      <>
                        <div style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.16em", color: T.muted, fontWeight: 600, textTransform: "uppercase" }}>{p.brand}</div>
                        <h3 className="mt-2" style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 400, color: T.ink, letterSpacing: "-0.015em", lineHeight: 1.2 }}>{p.name}</h3>
                        <p className="mt-3 flex-1" style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.55, color: T.muted }}>{p.note}</p>
                        <div className="mt-5 flex items-baseline justify-between border-t pt-4" style={{ borderColor: T.ruleSoft }}>
                          <span style={{ fontFamily: SERIF, fontSize: 22, color: T.ink, fontWeight: 400 }}>{p.price}</span>
                          {link?.external ? (
                            <span className="inline-flex items-center gap-1.5" style={{ fontFamily: SANS, fontSize: 11, color: T.accent, letterSpacing: "0.04em" }}>
                              Visit brand <ExternalLink className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-all" />
                            </span>
                          ) : link ? (
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-all" style={{ color: T.accent }} />
                          ) : (
                            <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.14em", color: T.mutedSoft, textTransform: "uppercase" }}>No review yet</span>
                          )}
                        </div>
                      </>
                    );
                    const cls = "group p-6 border-r border-b flex flex-col";
                    const sty = { borderColor: T.rule };
                    if (!link) {
                      return <div key={p.name} className={cls} style={sty}>{inner}</div>;
                    }
                    const externalProps = link.external
                      ? { target: "_blank" as const, rel: "noopener noreferrer" }
                      : {};
                    const onClick = shelfOutboundClickHandler(link, {
                      brand: p.brand,
                      productName: p.name,
                      pageKind: "ingredient",
                      pageSlug: "tretinoin",
                    });
                    return (
                      <a key={p.name} href={link.href} className={cls} style={sty} onClick={onClick} {...externalProps}>{inner}</a>
                    );
                  })}
                </div>
              </section>

              {/* RELATED */}
              <section id="related" className="scroll-mt-24 mt-20">
                <div className="flex items-baseline justify-between border-b pb-3 mb-8" style={{ borderColor: T.rule }}>
                  <h2 style={{ fontFamily: SERIF, fontSize: 44, fontWeight: 400, letterSpacing: "-0.02em", color: T.ink, fontVariationSettings: '"opsz" 144' }}>
                    Related <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>ingredients</span>
                  </h2>
                  <Folio n="§ 10" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-l border-t" style={{ borderColor: T.rule }}>
                  {RELATED.map((r) => (
                    <a key={r.name} href="#" className="flex flex-col p-5 border-r border-b" style={{ borderColor: T.rule }}>
                      <span style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 400, color: tierColor(r.tier), letterSpacing: "-0.04em", lineHeight: 1, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>{r.tier}</span>
                      <h3 className="mt-3" style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 500, color: T.ink, letterSpacing: "-0.01em" }}>{r.name}</h3>
                      <p className="mt-1" style={{ fontFamily: SANS, fontSize: 12.5, color: T.muted }}>{r.sub}</p>
                    </a>
                  ))}
                </div>
              </section>

              {/* REVIEWER */}
              <section id="reviewer" className="scroll-mt-24 mt-20">
                <div className="border-l-2 pl-8 py-2" style={{ borderColor: T.accent }}>
                  <Eyebrow color={T.accent}>Reviewer note</Eyebrow>
                  <p className="mt-4" style={{ fontFamily: SERIF_ED, fontSize: 26, lineHeight: 1.45, fontStyle: "italic", color: T.ink, letterSpacing: "-0.005em" }}>
                    "Tretinoin remains the highest-evidence anti-aging molecule we recommend. Pregnancy is the only absolute contraindication. Everything else is a tolerability question — and tolerability is solved by dose and frequency, not by abandoning the molecule."
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border" style={{ borderColor: T.ink, color: T.ink, fontFamily: SERIF, fontSize: 14, fontWeight: 500 }}>S</div>
                    <div>
                      <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 500, color: T.ink }}>Dr. Sundeep</div>
                      <div style={{ fontFamily: SANS, fontSize: 11.5, color: T.muted }}>Medical Review Lead · Reviewed 2026-04-18</div>
                    </div>
                  </div>
                  <p className="mt-6" style={{ fontFamily: SANS, fontSize: 12.5, color: T.muted, lineHeight: 1.6 }}>
                    This page is re-reviewed every 90 days, or sooner when new Tier A evidence prompts a change. All revisions are logged publicly on the <a href="#" style={{ color: T.accent, textDecoration: "underline", textUnderlineOffset: 3 }}>Corrections page</a>.
                  </p>
                </div>
              </section>

              {/* NEXT UP */}
              <a href="#" className="mt-20 flex items-center justify-between p-8 border" style={{ borderColor: T.ink, background: T.ink, color: T.paper }}>
                <div>
                  <Eyebrow color={T.accent}>Next up · Apply this</Eyebrow>
                  <h3 className="mt-2" style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 400, letterSpacing: "-0.02em", color: T.paper }}>
                    Build a tretinoin-safe <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>PM routine →</span>
                  </h3>
                </div>
                <div className="inline-flex items-center gap-2 border px-5 py-3" style={{ borderColor: T.paper, color: T.paper, fontFamily: SANS, fontSize: 13, fontWeight: 500 }}>
                  Continue <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </a>
            </article>
          </div>
        </Container>
      </section>
      <FoundIn ingredientSlug="tretinoin" ingredientName="Tretinoin" />


      <EditorPageLink pageKind="ingredient" pageSlug="tretinoin" />
      <SiteFooter />
    </div>
  );
};

export default IngredientDetail;
