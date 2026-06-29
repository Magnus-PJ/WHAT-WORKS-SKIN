// IngredientNiacinamide — full ingredient brief for niacinamide.

import React, { useState } from "react";
import { ChevronDown, ArrowRight, Bookmark, Share2, Check, ExternalLink } from "lucide-react";
import { T, tierColor } from "./_theme";
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
  ["01", "What it is"],
  ["02", "Mechanism"],
  ["03", "Evidence overview"],
  ["04", "Concentration & vehicle"],
  ["05", "Where it earns its tier"],
  ["06", "Pairings & conflicts"],
  ["07", "On our shelf"],
  ["08", "FAQ"],
  ["09", "Sources"],
];

const EVIDENCE = [
  { c: "Sebum reduction (oily skin)", n: "RCTs, 2-arm vs vehicle", w: "82%", note: "5% niacinamide reduced sebum excretion in multiple Asian-population trials at 4 wk." },
  { c: "Pigment / PIH",                n: "RCTs vs hydroquinone 4%", w: "62%", note: "Slower than HQ but with cleaner side-effect profile. 4–8% range." },
  { c: "Erythema (rosacea-like)",     n: "Open-label + small RCTs", w: "55%", note: "Reduces TEWL-driven flushing; pairs with azelaic." },
  { c: "Barrier / TEWL",                n: "Bioengineering studies", w: "78%", note: "Upregulates ceramide synthesis. Replicated across vehicles." },
  { c: "Fine lines & texture",          n: "Older RCTs (Bissett et al.)", w: "44%", note: "Modest, slow effect at 5%. Don't oversell it." },
];

const PAIRS = [
  { with: "L-ascorbic acid", verdict: "Compatible", note: "Old 'flush myth' debunked. Apply C first, niacinamide second.", ok: true },
  { with: "Retinoids",        verdict: "Excellent",   note: "Niacinamide buffers retinoid irritation and rebuilds barrier overnight.", ok: true },
  { with: "Tranexamic acid",  verdict: "Synergistic", note: "The pigment-blocker stack we recommend for melasma.", ok: true },
  { with: "AHAs at low pH",   verdict: "Wait",         note: "Apply AHA, give 20–30 min for pH normalisation, then niacinamide.", ok: false },
  { with: "Copper peptides", verdict: "Avoid layering", note: "Direct chelation reduces both. Use on opposite ends of routine.", ok: false },
];

export const PRODUCTS = [
  { brand: "Minimalist", name: "Niacinamide 10% + Matmarine", tier: "A" as const, score: 84, note: "Best-in-class Indian formulation. Clean vehicle, real concentration." },
  { brand: "Paula's Choice", name: "10% Niacinamide Booster", tier: "A" as const, score: 86, note: "Reference Western product. Higher cost-per-mL." },
  { brand: "The Ordinary", name: "Niacinamide 10% + Zinc 1%", tier: "B" as const, score: 70, note: "Cheapest entry. Pilling reports common; zinc serves no proven benefit." },
  { brand: "CeraVe", name: "PM Facial Lotion", tier: "A" as const, score: 81, note: "Niacinamide 4% in a barrier-rebuilding moisturiser. Quietly excellent." },
];

const FAQ = [
  { q: "Does niacinamide really 'flush' vitamin C?", a: "No. The original 1960s study used pure niacin (not niacinamide) at lab-grade purity and aggressive heat. Modern cosmetic formulations show no clinically meaningful loss when layered correctly." },
  { q: "What's the right concentration?", a: "4–5% covers barrier and oil control. 10% is the upper useful limit for pigment work. Beyond 10% the irritation curve overtakes the benefit curve in our experience." },
  { q: "Can I use it twice a day?", a: "Yes. Niacinamide is one of the few actives where AM + PM use makes sense. We recommend a 4–5% in a moisturiser for AM, and a 10% serum on PM pigment days." },
  { q: "Will it help my acne?", a: "Mildly. The sebum reduction is real; the anti-inflammatory effect is real. But it is not a substitute for a retinoid or BPO. Treat it as the supporting cast." },
];

const IngredientNiacinamide: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
      <LaidPaper />
      <SiteHeader active="Ingredients" />
      <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Ingredients", href: "#" }, { label: "Niacinamide" }]} />

      {/* HERO */}
      <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
        <TopVignette />
        <PaperGrain />
        <ColumnRules opacity={0.32} />
        <div aria-hidden className="absolute -right-16 -top-16 z-0"><AmbientFlask size={560} opacity={0.06} /></div>

        <Container>
          <div className="relative grid grid-cols-12 gap-10 py-24">
            <div className="absolute left-0 top-24 bottom-24 hidden lg:flex flex-col items-center justify-between" style={{ width: 24 }}>
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>INGREDIENT · 02 / 28</span>
              <div className="h-px w-3" style={{ background: T.rule }} />
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>FILED · 14 APR 2026</span>
            </div>

            <div className="col-span-12 lg:col-span-8 lg:pl-12">
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
                <Eyebrow color={T.accent}>Ingredient · Vitamin B family · Niacinamide</Eyebrow>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>P. 02 · BRIEF</div>
              </div>

              <h1 className="mt-10" style={{ fontFamily: SERIF, fontSize: 124, lineHeight: 0.9, letterSpacing: "-0.05em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
                Niacinamide.
              </h1>
              <div className="mt-3" style={{ fontFamily: SERIF_ED, fontSize: 38, fontStyle: "italic", color: T.accent, letterSpacing: "-0.02em" }}>
                The boring multi-tasker <span style={{ color: T.inkSoft, fontFamily: SERIF, fontStyle: "normal" }}>that earns its place.</span>
              </div>

              <p className="mt-9 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>
                {concernLink("The closest thing skincare has to a default. Reduces sebum, calms erythema, supports barrier, modestly fades pigment, plays well with almost every other active. The reason it isn't celebrated is the same reason it works: nothing dramatic, every time.")}
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <button className="inline-flex items-center gap-2 px-5 py-3" style={{ background: T.ink, color: T.paper, fontFamily: SANS, fontSize: 13, fontWeight: 500 }}>
                  Read the brief <ArrowRight className="h-4 w-4" />
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
              <div className="border w-full" style={{ borderColor: T.rule, background: T.paper }}>
                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: T.rule, background: T.paper2 }}>
                  <Eyebrow color={T.accent}>At a glance</Eyebrow>
                  <TierBadge tier="A" size="md" />
                </div>
                <dl>
                  {[
                    ["INCI", "Niacinamide"],
                    ["Family", "Vitamin B3 amide"],
                    ["Useful range", "2 – 10%"],
                    ["Vehicle", "Water-based serum or lotion"],
                    ["Pregnancy-safe", "Yes (topical)"],
                    ["Photo-stable", "Yes — AM and PM"],
                    ["Reviewer", "Dr. Paul · last reviewed 14-Apr-2026"],
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

      {/* BODY */}
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
              <Folio n="§ 01" />
              <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                What niacinamide <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>actually is.</span>
              </h2>
              <p className="mt-7" style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.65, color: T.inkSoft }}>
                <span style={{ float: "left", fontFamily: SERIF, fontSize: 86, lineHeight: 0.85, fontWeight: 400, fontVariationSettings: '"opsz" 144', color: T.ink, paddingRight: 14, paddingTop: 6, marginRight: 4 }}>N</span>
                {concernLink("iacinamide is the amide form of vitamin B3 — water-soluble, photo-stable, and in topical use for over four decades. Inside the cell it serves as a precursor to NAD+ and NADP+, the redox cofactors that drive sebum synthesis, ceramide assembly, and a number of inflammation pathways. That dependency is why niacinamide influences so many endpoints from a single molecule: you are tuning a metabolic input that several skin processes are downstream of.")}
              </p>
              <p className="mt-5" style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.65, color: T.inkSoft }}>
                {concernLink("It is not a scrub, a peel, or a \"treatment\" in the dramatic sense. It is a quiet metabolic adjustment that, used consistently for eight to twelve weeks, produces small, replicated improvements across oil, redness, pigment, and barrier function — without the irritation curve of a retinoid or the pH demands of an acid.")}
              </p>
            </article>

            <Asterism />

            <article>
              <Folio n="§ 02" />
              <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                Mechanism, <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>plainly.</span>
              </h2>
              <div className="mt-9 grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l" style={{ borderColor: T.rule }}>
                {[
                  { k: "On sebum", b: "Reduces fatty-acid synthesis and triglyceride output from sebocytes. Visible as less midday shine within four weeks." },
                  { k: "On pigment", b: "Inhibits melanosome transfer from melanocyte to keratinocyte — without inhibiting melanin synthesis itself. Result: slower fade than HQ, but cleaner." },
                  { k: "On barrier", b: "Upregulates ceramide and free-fatty-acid synthesis; reduces TEWL. The bedrock effect for compromised, over-exfoliated skin." },
                ].map((x) => (
                  <div key={x.k} className="p-7 border-r border-b" style={{ borderColor: T.rule, background: T.paper }}>
                    <Eyebrow color={T.accent}>{x.k}</Eyebrow>
                    <p className="mt-4" style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.6, color: T.inkSoft }}>{concernLink(x.b)}</p>
                  </div>
                ))}
              </div>
            </article>

            <Asterism />

            <article>
              <Folio n="§ 03" />
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
              <Folio n="§ 04" />
              <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                Concentration <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>& vehicle.</span>
              </h2>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-0 border-l border-t" style={{ borderColor: T.rule }}>
                {[
                  { c: "2 – 4%", v: "In moisturisers", b: "Barrier support. Twice-daily, indefinite." },
                  { c: "5%", v: "Serums", b: "Sebum + redness. The reasonable default." },
                  { c: "10%", v: "Targeted serums", b: "Pigment + oil control. Cap here." },
                  { c: "> 10%", v: "Marketing claims", b: "Diminishing returns; rising irritation." },
                ].map((x, i) => (
                  <div key={i} className="p-6 border-r border-b" style={{ borderColor: T.rule, background: T.paper }}>
                    <div style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 400, fontVariationSettings: '"opsz" 144', color: T.accent, letterSpacing: "-0.02em" }}>{x.c}</div>
                    <div className="mt-2" style={{ fontFamily: MONO, fontSize: 10, color: T.mutedSoft, letterSpacing: "0.14em", textTransform: "uppercase" }}>{x.v}</div>
                    <p className="mt-3" style={{ fontFamily: SERIF, fontSize: 14.5, lineHeight: 1.55, color: T.inkSoft }}>{x.b}</p>
                  </div>
                ))}
              </div>
            </article>

            <Asterism />

            <article>
              <Folio n="§ 06" />
              <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                Pairings <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>& conflicts.</span>
              </h2>
              <div className="mt-9 border" style={{ borderColor: T.rule }}>
                {PAIRS.map((p, i) => (
                  <div key={p.with} className="grid grid-cols-12 gap-4 px-5 py-5 items-center border-b last:border-b-0" style={{ borderColor: T.ruleSoft, background: i % 2 ? T.paper2 : T.paper }}>
                    <div className="col-span-12 md:col-span-3" style={{ fontFamily: SERIF, fontSize: 17, color: T.ink, fontVariationSettings: '"opsz" 144' }}>{p.with}</div>
                    <div className="col-span-12 md:col-span-2">
                      <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: p.ok ? T.tierA : T.tierD }}>{p.verdict}</span>
                    </div>
                    <div className="col-span-12 md:col-span-7" style={{ fontFamily: SERIF, fontSize: 14.5, color: T.muted, fontStyle: "italic", lineHeight: 1.55 }}>{concernLink(p.note)}</div>
                  </div>
                ))}
              </div>
            </article>

            <Asterism />

            <article>
              <Folio n="§ 07" />
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
                    pageSlug: "niacinamide",
                  });
                  return (
                    <a key={p.name} href={link.href} className={cls} style={sty} onClick={onClick} {...externalProps}>{inner}</a>
                  );
                })}
              </div>
            </article>

            <Asterism />

            <article>
              <Folio n="§ 08" />
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
      <FoundIn ingredientSlug="niacinamide" ingredientName="Niacinamide" />


      <EditorPageLink pageKind="ingredient" pageSlug="niacinamide" />
      <SiteFooter />
    </div>
  );
};

export default IngredientNiacinamide;
