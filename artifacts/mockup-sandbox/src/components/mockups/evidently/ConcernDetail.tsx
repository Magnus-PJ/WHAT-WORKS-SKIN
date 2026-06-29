// ConcernDetail — Melasma. The cross-functional concern guide.

import React, { useState } from "react";
import { ChevronDown, ArrowRight, Bookmark, Share2, Check, ExternalLink } from "lucide-react";
import { T, tierColor } from "./_theme";
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
const ROW = concernRowFor("melasma");

const TOC = [
  ["01", "What melasma is"],
  ["02", "Triggers we know about"],
  ["03", "Ingredients that work"],
  ["04", "Products on our shelf"],
  ["05", "The protocol"],
  ["06", "Supplements (brief)"],
  ["07", "What to avoid"],
  ["08", "When to see a derm"],
  ["09", "Sources"],
];

const TRIGGERS = [
  { k: "Long-UVA exposure", w: "92%", n: "The single biggest driver. Visible-light contribution is real but secondary." },
  { k: "Hormonal change",    w: "70%", n: "Pregnancy, OCPs, HRT. Suppress the trigger, the pigment fades slowly." },
  { k: "Heat / IR",           w: "55%", n: "Cooking, hot yoga, steam. Underestimated in Indian kitchens." },
  { k: "Inflammation",        w: "44%", n: "Acne, eczema, post-procedure. PIH layered on melasma confounds diagnosis." },
];

const INGREDIENTS = [
  { slug: "tranexamic-acid", name: "Tranexamic acid", tier: "A" as const, evidence: "Multiple RCTs · oral & topical · gold-standard adjunct", role: "Pigment-blocker" },
  { slug: "azelaic-acid",    name: "Azelaic acid 15–20%",    tier: "A" as const, evidence: "RCTs comparable to hydroquinone 4% in some trials", role: "Tyrosinase inhibitor" },
  { slug: "tretinoin",       name: "Tretinoin 0.025–0.05%",  tier: "A" as const, evidence: "Combination therapy backbone (Kligman & beyond)", role: "Cell turnover, dispersal" },
  { slug: "l-ascorbic",      name: "L-ascorbic acid 10–15%", tier: "A" as const, evidence: "Photoprotective, mild lightening · adjunct only",      role: "Antioxidant" },
  { slug: "alpha-arbutin",   name: "Alpha arbutin 2%",       tier: "B" as const, evidence: "Smaller RCTs · gentler · pregnancy-friendly",          role: "Tyrosinase inhibitor" },
  { slug: "hydroquinone",    name: "Hydroquinone 2–4% (Rx)", tier: "A" as const, evidence: "The reference. Cycle 12 weeks on, off. Rx in India.",  role: "Tyrosinase inhibitor" },
  { slug: "kojic-acid",      name: "Kojic acid 1–2%",        tier: "C" as const, evidence: "Modest data · sensitisation risk in Indian skin",     role: "Tyrosinase inhibitor" },
  { slug: "glutathione-topical", name: "Glutathione (topical)", tier: "D" as const, evidence: "Largely marketing. Oral / IV is a different conversation.", role: "—" },
];

export const PRODUCTS = [
  { slug: "lrp-uvmune", brand: "La Roche-Posay", name: "Anthelios UVMune 400 Invisible Fluid SPF 50+", tier: "A" as const, score: 89, why: "Highest documented UVA-PF — the floor of any melasma plan." },
  { slug: "minimalist-tx", brand: "Minimalist", name: "Tranexamic 03%", tier: "A" as const, score: 78, why: "Real concentration at evidence-aligned dose. Indian-brand standout." },
  { slug: "the-ordinary-aza", brand: "The Ordinary", name: "Azelaic Acid Suspension 10%", tier: "A" as const, score: 80, why: "Cheapest serious azelaic in India. Twice-daily for 12 weeks." },
  { slug: "obagi-tret", brand: "Obagi", name: "Tretinoin 0.05% Cream (Rx)", tier: "A" as const, score: 80, why: "Cleaner vehicle for night use; warrants the price for severe cases." },
];

const AVOID = [
  { t: "DIY lightening compounds", b: "TikTok recipes featuring lemon, mercury creams, or steroid-laced 'fairness' creams. They damage faster than they fade." },
  { t: "Aggressive lasers as first-line", b: "Q-switched lasers can rebound melasma. Always trial a topical protocol for 12+ weeks first." },
  { t: "Daily AHAs / scrubs", b: "Inflammation re-triggers melanocytes. Less is more." },
  { t: "Spotty SPF habit", b: "The single biggest reason melasma plans fail. Two finger-lengths, every single day, indoors and out." },
];

const SUPPLEMENTS = [
  { slug: "polypodium",       name: "Polypodium leucotomos 240–480 mg/d", tier: "B" as const, body: "Oral photoprotection. Adjunct, not replacement for SPF." },
  { slug: "tranexamic-oral",  name: "Tranexamic acid (oral, Rx)",          tier: "A" as const, body: "250 mg twice-daily, 8–12 weeks. Screened for VTE risk by your derm." },
  { slug: "vit-c-oral",       name: "Vitamin C (oral)",                    tier: "C" as const, body: "Modest contribution. Diet-first." },
];

const FAQ = [
  { q: "Is melasma curable?", a: "It's controlled, not cured. The melanocytes that produce it remain hyperresponsive to UV — meaning long-term it's a maintenance condition. The good news: a strict protocol can keep it dormant for years." },
  { q: "Will SPF alone fix it?", a: "It will stabilise it. To actively fade existing pigment you need an active layer (azelaic, tranexamic, or — under derm care — a Kligman-style trio). SPF determines whether your improvement holds." },
  { q: "Can I do this without prescription tretinoin?", a: "Yes. Azelaic 10–20% twice daily, with daily SPF and tranexamic 3%, gets most patients meaningful improvement within 16 weeks." },
];

const ConcernDetail: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeSection] = useState("03");

  return (
    <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
      <LaidPaper />
      <SiteHeader active="Concerns" />
      <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Concerns", href: "#" }, { label: "Melasma" }]} />

      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
        <TopVignette />
        <PaperGrain />
        <ColumnRules opacity={0.32} />
        <div aria-hidden className="absolute -right-16 -top-16 z-0"><AmbientFlask size={580} opacity={0.06} /></div>

        <Container>
          <div className="relative grid grid-cols-12 gap-10 py-24">
            <div className="absolute left-0 top-24 bottom-24 hidden lg:flex flex-col items-center justify-between" style={{ width: 24 }}>
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>CONCERN · 03 / 18</span>
              <div className="h-px w-3" style={{ background: T.rule }} />
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>FILED · 09 APR 2026</span>
            </div>

            <div className="col-span-12 lg:col-span-8 lg:pl-12">
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
                <Eyebrow color={T.accent}>{ROW.eyebrow}</Eyebrow>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>P. 09 · GUIDE</div>
              </div>

              <h1 className="mt-10" style={{ fontFamily: SERIF, fontSize: 132, lineHeight: 0.9, letterSpacing: "-0.05em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
                Melasma.
              </h1>
              <div className="mt-3" style={{ fontFamily: SERIF_ED, fontSize: 42, fontStyle: "italic", color: T.accent, letterSpacing: "-0.02em" }}>
                A controllable condition, <span style={{ color: T.inkSoft, fontFamily: SERIF, fontStyle: "normal" }}>treated as if it were curable.</span>
              </div>

              <p className="mt-9 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>
                {ROW.dek}
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <button className="inline-flex items-center gap-2 px-5 py-3" style={{ background: T.ink, color: T.paper, fontFamily: SANS, fontSize: 13, fontWeight: 500 }}>
                  Read the protocol <ArrowRight className="h-4 w-4" />
                </button>
                <button className="inline-flex items-center gap-2 border px-5 py-3" style={{ borderColor: T.rule, fontFamily: SANS, fontSize: 13, color: T.ink }}>
                  <Bookmark className="h-3.5 w-3.5" /> Save
                </button>
                <button className="inline-flex items-center gap-2 border px-5 py-3" style={{ borderColor: T.rule, fontFamily: SANS, fontSize: 13, color: T.ink }}>
                  <Share2 className="h-3.5 w-3.5" /> Share
                </button>
              </div>
            </div>

            <aside className="col-span-12 lg:col-span-4 lg:flex lg:items-end">
              <div className="border" style={{ borderColor: T.rule, background: T.paper }}>
                <div className="px-6 py-4 border-b" style={{ borderColor: T.rule, background: T.paper2 }}>
                  <Eyebrow color={T.accent}>The condition at a glance</Eyebrow>
                </div>
                <dl className="divide-y" style={{ borderColor: T.rule }}>
                  {[
                    ["Prevalence", "~1.5% global · 9% in Indian women 25–45"],
                    ["Type",       "Acquired hyperpigmentation, often symmetric"],
                    ["Driver",     "Long-UVA + hormonal hypersensitivity"],
                    ["Diagnosis",  "Clinical · Wood's lamp · derm consultation"],
                    ["Outlook",    "Controllable with strict 12-week protocol"],
                    ["Reviewer",   "Dr. Sundeep · last reviewed 2026-04-09"],
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

      {/* ─── BODY w/ STICKY TOC ──────────────────────────────────── */}
      <Container>
        <div className="grid grid-cols-12 gap-10 py-20">
          {/* Sticky TOC */}
          <aside className="col-span-12 lg:col-span-3">
            <div className="lg:sticky lg:top-8">
              <Eyebrow>Inside this guide</Eyebrow>
              <ol className="mt-5 space-y-2">
                {TOC.map(([n, t]) => {
                  const active = n === activeSection;
                  return (
                    <li key={n} className="flex items-baseline gap-3 py-1" style={{ paddingLeft: active ? 12 : 0, borderLeft: active ? `2px solid ${T.accent}` : "none" }}>
                      <span style={{ fontFamily: MONO, fontSize: 10, color: active ? T.accent : T.mutedSoft, letterSpacing: "0.14em" }}>{n}</span>
                      <span style={{ fontFamily: SERIF, fontSize: 15, color: active ? T.ink : T.inkSoft, lineHeight: 1.3 }}>{t}</span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </aside>

          <div className="col-span-12 lg:col-span-9">
            {/* §01 What it is */}
            <article>
              <Folio>§ 01</Folio>
              <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                What melasma <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>is.</span>
              </h2>
              <p className="mt-7" style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.65, color: T.inkSoft }}>
                <span style={{ float: "left", fontFamily: SERIF, fontSize: 86, lineHeight: 0.85, fontWeight: 400, fontVariationSettings: '"opsz" 144', color: T.ink, paddingRight: 14, paddingTop: 6, marginRight: 4 }}>M</span>
                elasma is an acquired hyperpigmentation that presents as symmetric, irregular, brown-grey patches — typically across the cheekbones, forehead, and upper lip. Unlike post-inflammatory hyperpigmentation, melasma involves a hyperresponsive melanocyte: the same UV exposure that produces a tan in unaffected skin produces persistent, hormone-modulated pigment in melasma-prone skin. Once active, it is rarely fully cleared — but with strict daily protection and a 12-week active protocol, it can be brought into and held in remission.
              </p>
              <p className="mt-5" style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.65, color: T.inkSoft }}>
                It is not a cosmetic problem. It is a chronic dermatologic condition that responds to chronic dermatologic management — the same way eczema or rosacea do. The most damaging idea on social media is that you can "scrub it out" or "fade it overnight." You cannot. What you can do is protect, suppress, and disperse — slowly, consistently, for the rest of your skin's UV-exposed life.
              </p>
            </article>

            <Asterism />

            {/* §02 Triggers */}
            <article>
              <Folio>§ 02</Folio>
              <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                The triggers we <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>know about.</span>
              </h2>

              <div className="mt-9 space-y-5">
                {TRIGGERS.map((t) => (
                  <div key={t.k} className="grid grid-cols-12 gap-6 items-start">
                    <div className="col-span-12 md:col-span-3">
                      <div style={{ fontFamily: SERIF, fontSize: 21, color: T.ink, lineHeight: 1.2, fontWeight: 400, fontVariationSettings: '"opsz" 144' }}>{t.k}</div>
                    </div>
                    <div className="col-span-12 md:col-span-7">
                      <div className="h-1.5 w-full" style={{ background: T.ruleSoft }}>
                        <div className="h-full" style={{ background: T.accent, width: t.w }} />
                      </div>
                      <p className="mt-3" style={{ fontFamily: SERIF, fontSize: 15, color: T.muted, lineHeight: 1.55, fontStyle: "italic" }}>{t.n}</p>
                    </div>
                    <div className="col-span-12 md:col-span-2 md:text-right">
                      <span style={{ fontFamily: SERIF, fontSize: 32, fontVariationSettings: '"opsz" 144', color: T.ink, fontWeight: 400, letterSpacing: "-0.02em" }}>{t.w}</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <Asterism />

            {/* §03 Ingredients */}
            <article>
              <Folio>§ 03</Folio>
              <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                Ingredients that <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>actually work.</span>
              </h2>
              <p className="mt-7 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 18, lineHeight: 1.6, color: T.inkSoft }}>
                Tier-graded against our public rubric. Each links through to its own evidence-and-formulation review.
              </p>

              <div className="mt-8 border" style={{ borderColor: T.rule }}>
                <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b" style={{ borderColor: T.rule, background: T.paper2, fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.mutedSoft, textTransform: "uppercase" }}>
                  <div className="col-span-1">Tier</div>
                  <div className="col-span-3">Molecule</div>
                  <div className="col-span-3">Role</div>
                  <div className="col-span-5">Evidence</div>
                </div>
                {INGREDIENTS.map((i) => (
                  <a key={i.slug} href="#" className="grid grid-cols-12 gap-4 px-5 py-5 items-center border-b hover:bg-neutral-50 transition-colors" style={{ borderColor: T.ruleSoft }}>
                    <div className="col-span-1"><TierBadge tier={i.tier} /></div>
                    <div className="col-span-3" style={{ fontFamily: SERIF, fontSize: 17, color: T.ink, fontVariationSettings: '"opsz" 144' }}>{i.name}</div>
                    <div className="col-span-3" style={{ fontFamily: SANS, fontSize: 13, color: T.muted }}>{i.role}</div>
                    <div className="col-span-5" style={{ fontFamily: SERIF, fontSize: 14.5, color: T.inkSoft, fontStyle: "italic", lineHeight: 1.5 }}>{i.evidence}</div>
                  </a>
                ))}
              </div>
            </article>

            <Asterism />

            {/* §04 Products */}
            <article>
              <Folio>§ 04</Folio>
              <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
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
                        <span style={{ fontFamily: SERIF, fontSize: 28, fontVariationSettings: '"opsz" 144', color: T.ink, letterSpacing: "-0.02em" }}>
                          {p.score}<span style={{ color: T.mutedSoft, fontSize: 12, marginLeft: 2 }}>⁄100</span>
                        </span>
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
                    return <div key={p.slug} className={cls} style={style}>{cardBody}</div>;
                  }
                  const externalProps = link.external
                    ? { target: "_blank" as const, rel: "noopener noreferrer" }
                    : {};
                  const onClick = shelfOutboundClickHandler(link, {
                    brand: p.brand,
                    productName: p.name,
                    pageKind: "concern",
                    pageSlug: "ConcernDetail",
                  });
                  return (
                    <a key={p.slug} href={link.href} className={cls} style={style} onClick={onClick} {...externalProps}>{cardBody}</a>
                  );
                })}
              </div>
            </article>

            <Asterism />

            {/* §05 Protocol pull-quote */}
            <article>
              <Folio>§ 05</Folio>
              <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                The <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>protocol.</span>
              </h2>

              <div className="mt-9 grid grid-cols-1 md:grid-cols-2 gap-0 border" style={{ borderColor: T.rule }}>
                <div className="p-8" style={{ borderRight: `1px solid ${T.rule}`, background: T.paper }}>
                  <Eyebrow color={T.accent}>Morning</Eyebrow>
                  <ol className="mt-5 space-y-3.5" style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.5 }}>
                    {[
                      "Low-pH gel cleanser",
                      "L-ascorbic acid 10–15% serum",
                      "Tranexamic acid 3% + niacinamide",
                      "Lightweight ceramide moisturiser (optional)",
                      "SPF 50+ with UVA-PF ≥ 40 — two finger-lengths",
                    ].map((s, i) => (
                      <li key={s} className="flex gap-3 items-baseline">
                        <span style={{ fontFamily: MONO, fontSize: 11, color: T.accent, letterSpacing: "0.12em" }}>0{i + 1}</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ol>
                  <a href="#" className="mt-6 inline-flex items-center gap-1.5" style={{ fontFamily: SANS, fontSize: 12.5, color: T.accent, textDecoration: "underline", textUnderlineOffset: 3 }}>
                    Open the full AM routine <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
                <div className="p-8" style={{ background: T.paper2 }}>
                  <Eyebrow color={T.accent}>Evening</Eyebrow>
                  <ol className="mt-5 space-y-3.5" style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.5 }}>
                    {[
                      "Cleansing oil → gel cleanser",
                      "Azelaic acid 10–20%",
                      "Tretinoin 0.025–0.05% (or adapalene)",
                      "Buffer with ceramide cream",
                    ].map((s, i) => (
                      <li key={s} className="flex gap-3 items-baseline">
                        <span style={{ fontFamily: MONO, fontSize: 11, color: T.accent, letterSpacing: "0.12em" }}>0{i + 1}</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ol>
                  <a href="#" className="mt-6 inline-flex items-center gap-1.5" style={{ fontFamily: SANS, fontSize: 12.5, color: T.accent, textDecoration: "underline", textUnderlineOffset: 3 }}>
                    Open the full PM routine <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </article>

            <Asterism />

            {/* §06 Supplements */}
            <article>
              <Folio>§ 06</Folio>
              <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                Supplements <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>worth discussing.</span>
              </h2>
              <p className="mt-6 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 17, color: T.inkSoft, lineHeight: 1.6 }}>
                Topicals do most of the work. These three are the only oral adjuncts with credible data. Discuss with your physician — particularly oral tranexamic acid, which is prescription-only.
              </p>

              <div className="mt-8 border-t" style={{ borderColor: T.rule }}>
                {SUPPLEMENTS.map((s) => (
                  <a key={s.slug} href="#" className="grid grid-cols-12 gap-6 py-6 border-b" style={{ borderColor: T.ruleSoft }}>
                    <div className="col-span-1"><TierBadge tier={s.tier} /></div>
                    <div className="col-span-7" style={{ fontFamily: SERIF, fontSize: 20, color: T.ink, lineHeight: 1.3, fontVariationSettings: '"opsz" 144' }}>{s.name}</div>
                    <div className="col-span-3" style={{ fontFamily: SERIF, fontSize: 14.5, color: T.muted, fontStyle: "italic", lineHeight: 1.5 }}>{s.body}</div>
                    <div className="col-span-1 text-right"><ArrowRight className="h-3 w-3 inline" style={{ color: T.accent }} /></div>
                  </a>
                ))}
              </div>
            </article>

            <Asterism />

            {/* §07 Avoid */}
            <article>
              <Folio>§ 07</Folio>
              <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                What to <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>avoid.</span>
              </h2>

              <div className="mt-9 grid grid-cols-1 md:grid-cols-2 gap-0 border" style={{ borderColor: T.rule, background: T.paper }}>
                {AVOID.map((m, i) => (
                  <div key={m.t} className="p-7" style={{ borderRight: i % 2 === 0 ? `1px solid ${T.rule}` : "none", borderTop: i >= 2 ? `1px solid ${T.rule}` : "none" }}>
                    <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.tierD, textTransform: "uppercase" }}>{String(i + 1).padStart(2, "0")} · AVOID</div>
                    <div className="mt-2" style={{ fontFamily: SERIF, fontSize: 22, lineHeight: 1.2, color: T.ink, fontVariationSettings: '"opsz" 144', letterSpacing: "-0.01em" }}>{m.t}</div>
                    <p className="mt-3" style={{ fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.6, color: T.muted }}>{m.b}</p>
                  </div>
                ))}
              </div>
            </article>

            <Asterism />

            {/* §08 When to see derm */}
            <article>
              <div className="grid grid-cols-12 gap-8 items-start">
                <div className="col-span-12 md:col-span-7">
                  <Folio>§ 08</Folio>
                  <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                    When to see a <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>derm.</span>
                  </h2>
                  <p className="mt-6" style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.65, color: T.inkSoft }}>
                    Three signs you've outgrown self-management: the patches are deep dermal (grey-blue rather than brown), you've completed a full 16-week protocol with no fade, or you've had a flare with a clear hormonal trigger you cannot remove.
                  </p>
                  <p className="mt-4" style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.65, color: T.inkSoft }}>
                    A derm consultation opens up the prescription-only adjuncts — Kligman trio, oral tranexamic, conservative laser — that simply outperform OTC for resistant melasma.
                  </p>
                </div>
                <aside className="col-span-12 md:col-span-5">
                  <div className="border p-6" style={{ borderColor: T.rule, background: T.paper2 }}>
                    <Eyebrow>Red flags</Eyebrow>
                    <ul className="mt-4 space-y-2.5" style={{ fontFamily: SANS, fontSize: 13.5, color: T.inkSoft, lineHeight: 1.5 }}>
                      {["New asymmetric pigment", "Single rapidly-changing patch", "Bleeding, scaling, or itching", "Mole-like irregular borders"].map(s => (
                        <li key={s} className="flex gap-2 items-baseline"><span style={{ color: T.tierD }}>•</span>{s}</li>
                      ))}
                    </ul>
                    <div className="mt-5 pt-5 border-t" style={{ borderColor: T.ruleSoft }}>
                      <span style={{ fontFamily: SERIF, fontSize: 14.5, color: T.muted, fontStyle: "italic", lineHeight: 1.55 }}>
                        These are not melasma. See a dermatologist promptly.
                      </span>
                    </div>
                  </div>
                </aside>
              </div>
            </article>

            <Asterism />

            {/* §09 FAQ */}
            <article>
              <Folio>§ 09</Folio>
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
            </article>

            {/* Sources */}
            <div className="mt-16 border-t pt-8" style={{ borderColor: T.rule }}>
              <Eyebrow>Sources & further reading</Eyebrow>
              <ol className="mt-4 space-y-2 list-decimal list-inside" style={{ fontFamily: SANS, fontSize: 12.5, color: T.muted, lineHeight: 1.6 }}>
                <li>Sarkar R et al. Melasma: an update. Indian J Dermatol. 2023.</li>
                <li>Kim H, Choe S et al. Tranexamic acid for melasma: meta-analysis. JAAD 2022.</li>
                <li>Pandya A, Hexsel D. Topical azelaic acid in melasma. JEADV 2021.</li>
                <li>Polypodium leucotomos in pigmentary disorders. Int J Dermatol 2020.</li>
              </ol>
            </div>
          </div>
        </div>
      </Container>

      <EditorPageLink pageKind="concern" pageSlug="ConcernDetail" />
      <SiteFooter />
    </div>
  );
};

export default ConcernDetail;
