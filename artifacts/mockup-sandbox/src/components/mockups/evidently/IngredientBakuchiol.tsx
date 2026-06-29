// IngredientBakuchiol — full ingredient brief for bakuchiol.

import React, { useState } from "react";
import { ChevronDown, ArrowRight, Bookmark, Share2, ExternalLink } from "lucide-react";
import { T } from "./_theme";
import {
  SiteHeader, SiteFooter, Breadcrumbs, Container, Eyebrow, Folio, TierBadge,
  PaperGrain, LaidPaper, ColumnRules, TopVignette, Asterism, AmbientFlask,
  SERIF, SERIF_ED, SANS, MONO,
} from "./_chrome";
import { EditorPageLink } from "./_EditorPageLink";

import { FoundIn } from "./_FoundIn";
import { productLinkForBriefEntry, shelfOutboundClickHandler, linkifyText } from "./_links";

const concernLink = (text: string) => linkifyText(text, { scope: "concerns" });
const TOC = [
  ["01", "What it is — and what it isn't"],
  ["02", "The retinol-comparison study, parsed"],
  ["03", "Evidence overview"],
  ["04", "Concentration & vehicle"],
  ["05", "Who it's actually for"],
  ["06", "Pairings & conflicts"],
  ["07", "On our shelf"],
  ["08", "FAQ"],
];

const EVIDENCE = [
  { c: "Wrinkle reduction (vs retinol)", n: "Dhaliwal 2019 RCT, n=44", w: "55%", note: "Comparable wrinkle improvement, less irritation. Important caveat: small trial, single mfr.-funded follow-ups." },
  { c: "Pigment / dyspigmentation",        n: "Same trial, secondary",     w: "48%", note: "Modest improvement at 12 weeks. Slower than tretinoin or azelaic." },
  { c: "Tolerability",                       n: "Self-reported VAS",          w: "88%", note: "The headline finding. Stinging, peeling, redness all dramatically lower than retinol arm." },
  { c: "Photo-stability",                    n: "In vitro",                     w: "82%", note: "Photo-stable — usable AM, unlike most retinoids." },
];

export const PRODUCTS = [
  { brand: "Biossance", name: "Squalane + Phyto-Retinol Serum", tier: "B" as const, score: 78, note: "Best-formulated bakuchiol on the Indian market. 1% in clean vehicle." },
  { brand: "The Inkey List", name: "Bakuchiol", tier: "B" as const, score: 74, note: "1% in oil. Affordable entry; oil-vehicle limits stacking." },
  { brand: "Minimalist", name: "Bakuchiol 1%", tier: "B" as const, score: 72, note: "Indian-brand standout. Reasonable price, real concentration." },
  { brand: "Ole Henriksen", name: "Goodnight Glow", tier: "C" as const, score: 64, note: "Bakuchiol + AHA blend. Clever marketing, diluted dose." },
];

const FAQ = [
  { q: "Is bakuchiol really 'plant retinol'?", a: "No. It is a meroterpene from Psoralea corylifolia with no structural similarity to retinoids. The marketing claim rests entirely on one 12-week, single-centre, manufacturer-supported trial showing similar wrinkle endpoints. Calling it a retinol is shorthand for 'sometimes produces similar visible results.' It is not a chemical equivalent." },
  { q: "Should I switch from retinol to bakuchiol?", a: "Only if you cannot tolerate retinoids. Retinol and tretinoin still have decades more evidence and stronger pigment, acne, and collagen endpoints. Bakuchiol is the right choice when retinoids are not — pregnancy, severe sensitivity, post-procedure rebuild." },
  { q: "Can I use it AM and PM?", a: "Yes. Photo-stable, no photosensitivity. The closest thing to a 'use anytime' anti-aging active." },
  { q: "Does it really not cause irritation?", a: "It causes meaningfully less than retinoids in most people. 'No irritation' is overstated — psoraleas as a family have a small but real photosensitisation signal we still want longer follow-up on." },
];

const IngredientBakuchiol: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
      <LaidPaper />
      <SiteHeader active="Ingredients" />
      <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Ingredients", href: "#" }, { label: "Bakuchiol" }]} />

      <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
        <TopVignette /><PaperGrain /><ColumnRules opacity={0.32} />
        <div aria-hidden className="absolute -right-16 -top-16 z-0"><AmbientFlask size={560} opacity={0.06} /></div>

        <Container>
          <div className="relative grid grid-cols-12 gap-10 py-24">
            <div className="absolute left-0 top-24 bottom-24 hidden lg:flex flex-col items-center justify-between" style={{ width: 24 }}>
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>INGREDIENT · 19 / 28</span>
              <div className="h-px w-3" style={{ background: T.rule }} />
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>FILED · 18 APR 2026</span>
            </div>

            <div className="col-span-12 lg:col-span-8 lg:pl-12">
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
                <Eyebrow color={T.accent}>Ingredient · Meroterpene · Bakuchiol</Eyebrow>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>P. 19 · BRIEF</div>
              </div>

              <h1 className="mt-10" style={{ fontFamily: SERIF, fontSize: 124, lineHeight: 0.9, letterSpacing: "-0.05em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
                Bakuchiol.
              </h1>
              <div className="mt-3" style={{ fontFamily: SERIF_ED, fontSize: 36, fontStyle: "italic", color: T.accent, letterSpacing: "-0.02em" }}>
                One small RCT. <span style={{ color: T.inkSoft, fontFamily: SERIF, fontStyle: "normal" }}>Two billion marketing dollars.</span>
              </div>

              <p className="mt-9 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>
                {concernLink("Often called \"plant retinol.\" It is not a retinoid, not pharmacologically related to retinoids, and not as well-evidenced as retinoids. It is, however, a quietly useful anti-aging active for people who genuinely cannot tolerate them — pregnancy, severe sensitivity, post-procedure recovery. Calibrate expectations accordingly.")}
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <button className="inline-flex items-center gap-2 px-5 py-3" style={{ background: T.ink, color: T.paper, fontFamily: SANS, fontSize: 13, fontWeight: 500 }}>Read the brief <ArrowRight className="h-4 w-4" /></button>
                <button className="inline-flex items-center gap-2 border px-5 py-3" style={{ borderColor: T.rule, fontFamily: SANS, fontSize: 13, color: T.ink }}><Bookmark className="h-3.5 w-3.5" /> Save</button>
                <button className="inline-flex items-center gap-2 border px-5 py-3" style={{ borderColor: T.rule, fontFamily: SANS, fontSize: 13, color: T.ink }}><Share2 className="h-3.5 w-3.5" /> Share</button>
              </div>
            </div>

            <aside className="col-span-12 lg:col-span-4 lg:flex lg:items-end">
              <div className="border w-full" style={{ borderColor: T.rule, background: T.paper }}>
                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: T.rule, background: T.paper2 }}>
                  <Eyebrow color={T.accent}>At a glance</Eyebrow>
                  <TierBadge tier="B" size="md" />
                </div>
                <dl>
                  {[
                    ["INCI", "Bakuchiol"],
                    ["Family", "Meroterpene phenol"],
                    ["Source", "Psoralea corylifolia seeds"],
                    ["Useful range", "0.5 – 1.0%"],
                    ["pH window", "Vehicle-flexible"],
                    ["Pregnancy-safe", "Likely yes (limited data)"],
                    ["Photo-stable", "Yes"],
                    ["Reviewer", "Dr. Paul · 18-Apr-2026"],
                  ].map(([k, v]) => (
                    <div key={k} className="px-6 py-3.5 border-b last:border-b-0" style={{ borderColor: T.ruleSoft }}>
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

      <Container>
        <div className="grid grid-cols-12 gap-10 py-20">
          <aside className="col-span-12 lg:col-span-3">
            <div className="lg:sticky lg:top-8">
              <Eyebrow>Inside this brief</Eyebrow>
              <ol className="mt-5 space-y-2">
                {TOC.map(([n, t]) => (
                  <li key={n} className="flex items-baseline gap-3 py-1">
                    <span style={{ fontFamily: MONO, fontSize: 10, color: T.mutedSoft, letterSpacing: "0.14em" }}>{n}</span>
                    <span style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.3 }}>{t}</span>
                  </li>
                ))}
              </ol>
            </div>
          </aside>

          <div className="col-span-12 lg:col-span-9">
            <article>
              <Folio>§ 01</Folio>
              <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                What bakuchiol <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>actually is.</span>
              </h2>
              <p className="mt-7" style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.65, color: T.inkSoft }}>
                <span style={{ float: "left", fontFamily: SERIF, fontSize: 86, lineHeight: 0.85, fontWeight: 400, fontVariationSettings: '"opsz" 144', color: T.ink, paddingRight: 14, paddingTop: 6, marginRight: 4 }}>B</span>
                {concernLink("akuchiol is a phenolic meroterpene extracted from the seeds of ")}<em>Psoralea corylifolia</em>{concernLink(", a plant with a long history in Ayurveda and traditional Chinese medicine. Its current cosmetic celebrity rests almost entirely on a single 2019 randomised trial by Dhaliwal et al. that compared 0.5% bakuchiol against 0.5% retinol over 12 weeks and found broadly similar wrinkle and pigment endpoints with substantially less irritation. It is a real, replicable result — but a single trial is not the same as a 30-year evidence base. Industry has, predictably, treated the citation as if it were both.")}
              </p>
            </article>

            <Asterism />

            <article>
              <Folio>§ 02</Folio>
              <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                The trial, <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>parsed honestly.</span>
              </h2>
              <div className="mt-8 border" style={{ borderColor: T.rule }}>
                {[
                  ["Design", "Randomised, double-blind, split-face — n = 44 women, 12 weeks"],
                  ["Comparator", "0.5% retinol cream"],
                  ["Primary endpoint", "Wrinkle severity (modified Griffith score) — both arms improved similarly"],
                  ["Secondary endpoint", "Hyperpigmentation — both arms improved similarly"],
                  ["Tolerability finding", "Significantly less stinging, peeling, redness in bakuchiol arm"],
                  ["Caveats", "Single centre; manufacturer collaboration; no comparison to higher retinoid doses or to tretinoin"],
                ].map(([k, v], i) => (
                  <div key={k} className="grid grid-cols-12 gap-4 px-5 py-4 border-b last:border-b-0" style={{ borderColor: T.ruleSoft, background: i % 2 ? T.paper2 : T.paper }}>
                    <div className="col-span-12 md:col-span-3" style={{ fontFamily: MONO, fontSize: 10.5, color: T.mutedSoft, letterSpacing: "0.14em", textTransform: "uppercase" }}>{k}</div>
                    <div className="col-span-12 md:col-span-9" style={{ fontFamily: SERIF, fontSize: 15.5, color: T.ink, lineHeight: 1.55 }}>{v}</div>
                  </div>
                ))}
              </div>
            </article>

            <Asterism />

            <article>
              <Folio>§ 03</Folio>
              <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                The <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>evidence.</span>
              </h2>
              <div className="mt-9 space-y-5">
                {EVIDENCE.map((e) => (
                  <div key={e.c} className="grid grid-cols-12 gap-6 items-start">
                    <div className="col-span-12 md:col-span-3">
                      <div style={{ fontFamily: SERIF, fontSize: 19, color: T.ink, lineHeight: 1.2, fontVariationSettings: '"opsz" 144' }}>{concernLink(e.c)}</div>
                      <div className="mt-1" style={{ fontFamily: MONO, fontSize: 10, color: T.mutedSoft, letterSpacing: "0.12em", textTransform: "uppercase" }}>{e.n}</div>
                    </div>
                    <div className="col-span-12 md:col-span-7">
                      <div className="h-1.5 w-full" style={{ background: T.ruleSoft }}>
                        <div className="h-full" style={{ background: T.accent, width: e.w }} />
                      </div>
                      <p className="mt-3" style={{ fontFamily: SERIF, fontSize: 15, color: T.muted, lineHeight: 1.55, fontStyle: "italic" }}>{concernLink(e.note)}</p>
                    </div>
                    <div className="col-span-12 md:col-span-2 md:text-right">
                      <span style={{ fontFamily: SERIF, fontSize: 30, fontVariationSettings: '"opsz" 144', color: T.ink, fontWeight: 400, letterSpacing: "-0.02em" }}>{e.w}</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <Asterism />

            <article>
              <Folio>§ 05</Folio>
              <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                Who it's <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>actually for.</span>
              </h2>
              <div className="mt-9 grid grid-cols-1 md:grid-cols-2 gap-0 border-l border-t" style={{ borderColor: T.rule }}>
                {[
                  { k: "Yes", b: "Pregnancy. Severe retinoid intolerance. Post-laser rebuild. First-time anti-aging users wanting a soft on-ramp." },
                  { k: "No", b: "Anyone tolerating retinoids. Anyone hoping bakuchiol replaces tretinoin (it does not). Anyone wanting visible results in under 8 weeks." },
                ].map((x) => (
                  <div key={x.k} className="p-7 border-r border-b" style={{ borderColor: T.rule, background: T.paper }}>
                    <Eyebrow color={x.k === "Yes" ? T.accent : T.tierD}>{x.k}</Eyebrow>
                    <p className="mt-4" style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.6, color: T.inkSoft }}>{x.b}</p>
                  </div>
                ))}
              </div>
            </article>

            <Asterism />

            <article>
              <Folio>§ 07</Folio>
              <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                On <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>our shelf.</span>
              </h2>
              <div className="mt-9 grid grid-cols-1 md:grid-cols-2 gap-0 border-l border-t" style={{ borderColor: T.rule }}>
                {PRODUCTS.map((p) => {
                  const link = productLinkForBriefEntry(p.brand, p.name);
                  const inner = (
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <span style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.18em", color: T.muted, textTransform: "uppercase", fontWeight: 600 }}>{p.brand}</span>
                        <TierBadge tier={p.tier} />
                      </div>
                      <div style={{ fontFamily: SERIF, fontSize: 20, lineHeight: 1.25, color: T.ink, fontVariationSettings: '"opsz" 144' }}>{p.name}</div>
                      <p className="mt-4" style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.55, color: T.muted, fontStyle: "italic" }}>{p.note}</p>
                      <div className="mt-auto pt-5 flex items-baseline justify-between border-t" style={{ borderColor: T.ruleSoft }}>
                        <span style={{ fontFamily: SERIF, fontSize: 28, fontVariationSettings: '"opsz" 144', color: T.ink, letterSpacing: "-0.02em" }}>{p.score}<span style={{ color: T.mutedSoft, fontSize: 12, marginLeft: 2 }}>⁄100</span></span>
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
                  const sty = { borderColor: T.rule, background: T.paper };
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
                    pageSlug: "bakuchiol",
                  });
                  return (
                    <a key={p.name} href={link.href} className={cls} style={sty} onClick={onClick} {...externalProps}>{inner}</a>
                  );
                })}
              </div>
            </article>

            <Asterism />

            <article>
              <Folio>§ 08</Folio>
              <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                Frequently <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>asked.</span>
              </h2>
              <div className="mt-9 border-t" style={{ borderColor: T.rule }}>
                {FAQ.map((f, i) => {
                  const open = openFaq === i;
                  return (
                    <div key={f.q} className="border-b" style={{ borderColor: T.ruleSoft }}>
                      <button onClick={() => setOpenFaq(open ? null : i)} className="w-full flex items-baseline justify-between gap-4 py-6 text-left">
                        <span style={{ fontFamily: SERIF, fontSize: 22, color: T.ink, lineHeight: 1.35, fontVariationSettings: '"opsz" 144' }}>{f.q}</span>
                        <ChevronDown className="h-5 w-5 flex-shrink-0" style={{ color: T.muted, transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
                      </button>
                      {open && <p className="pb-6 max-w-3xl" style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.65, color: T.inkSoft }}>{concernLink(f.a)}</p>}
                    </div>
                  );
                })}
              </div>
            </article>
          </div>
        </div>
      </Container>
      <FoundIn ingredientSlug="bakuchiol" ingredientName="Bakuchiol" />


      <EditorPageLink pageKind="ingredient" pageSlug="bakuchiol" />
      <SiteFooter />
    </div>
  );
};

export default IngredientBakuchiol;
