// IngredientLAscorbic — full ingredient brief for L-ascorbic acid (vitamin C).

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
  ["01", "What it is"],
  ["02", "Why pH and pairing decide everything"],
  ["03", "Evidence overview"],
  ["04", "Forms compared (LAA, MAP, SAP, glucoside, ester)"],
  ["05", "Concentration & vehicle"],
  ["06", "Storage & oxidation"],
  ["07", "On our shelf"],
  ["08", "FAQ"],
];

const FORMS = [
  { f: "L-ascorbic acid (LAA)",        tier: "A" as const, ph: "≤ 3.5", note: "The reference. Photoprotective + adjunct lightening. Unstable; demands pH and packaging." },
  { f: "Magnesium ascorbyl phosphate", tier: "B" as const, ph: "6.5–7.0", note: "Stable, gentle, slower onset. Fine for sensitive skin and pregnancy." },
  { f: "Sodium ascorbyl phosphate",     tier: "B" as const, ph: "6.0–7.5", note: "Mild antibacterial as bonus; data thinner than MAP." },
  { f: "Ascorbyl glucoside",            tier: "B" as const, ph: "5.5–6.5", note: "The 'starter' vitamin C. Excellent tolerability, modest endpoints." },
  { f: "Tetrahexyldecyl ascorbate",      tier: "C" as const, ph: "Vehicle-dependent", note: "Lipid-soluble. Marketing claims outpace the human RCT data." },
  { f: "Ascorbic acid 2-glucoside",     tier: "B" as const, ph: "5.5", note: "Japanese reference for hyperpigmentation; replicated for melasma." },
];

const EVIDENCE = [
  { c: "Photoprotection adjunct", n: "RCTs vs vehicle, with SPF", w: "84%", note: "Doubles SPF biological-endpoint protection in some designs. Use under SPF, not instead." },
  { c: "Pigment / lightening",    n: "RCTs in melasma & PIH",     w: "62%", note: "Slower than azelaic. Strong adjunct, weak monotherapy." },
  { c: "Collagen synthesis",       n: "Bioengineering + biopsy",     w: "70%", note: "Cofactor for prolyl hydroxylase. Modest visible firmness benefit at ≥10%." },
  { c: "Wrinkle reduction",         n: "12-week RCTs",                  w: "48%", note: "Real but modest. Pair with retinoid PM for cumulative effect." },
];

export const PRODUCTS = [
  { brand: "SkinCeuticals", name: "C E Ferulic", tier: "A" as const, score: 88, note: "The reference. 15% LAA + 1% E + 0.5% ferulic. Stability and dose both delivered." },
  { brand: "Maelove", name: "Glow Maker", tier: "A" as const, score: 84, note: "Same trinity formulation at one-fifth the price. Excellent value entry." },
  { brand: "Klairs", name: "Freshly Juiced Vitamin Drop", tier: "B" as const, score: 72, note: "5% LAA at pH 4.5. Gentler ramp-up product." },
  { brand: "The Ordinary", name: "Ascorbyl Glucoside Solution 12%", tier: "B" as const, score: 70, note: "Pregnancy / sensitive alternative. No LAA shock." },
];

const FAQ = [
  { q: "How do I tell if my vitamin C has gone off?", a: "Colour. Fresh LAA is pale straw to light yellow. Once it turns orange, then brown, the active has oxidised to dehydroascorbic acid and beyond. Brown C is dead C — and trace iron in skincare can theoretically generate free radicals when applied. Bin it." },
  { q: "Why does my serum sting at the start?", a: "LAA at pH 3.0–3.5 stings normally on application. The sting should fade within five minutes. If it persists, your barrier is the bottleneck — back off frequency and rebuild with niacinamide for two weeks." },
  { q: "Can I really not use it with niacinamide?", a: "You can. The 'no-go' rule was based on a 1960s study using niacin (not niacinamide) at extreme heat. Modern formulations layer fine. Apply C first, give it five minutes, then niacinamide." },
  { q: "Morning or night?", a: "Morning, primarily — the photoprotection adjunct is its strongest claim. PM use is fine if you are pairing with a retinoid for collagen support." },
];

const IngredientLAscorbic: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
      <LaidPaper />
      <SiteHeader active="Ingredients" />
      <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Ingredients", href: "#" }, { label: "L-ascorbic acid" }]} />

      <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
        <TopVignette />
        <PaperGrain />
        <ColumnRules opacity={0.32} />
        <div aria-hidden className="absolute -right-16 -top-16 z-0"><AmbientFlask size={560} opacity={0.06} /></div>

        <Container>
          <div className="relative grid grid-cols-12 gap-10 py-24">
            <div className="absolute left-0 top-24 bottom-24 hidden lg:flex flex-col items-center justify-between" style={{ width: 24 }}>
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>INGREDIENT · 03 / 28</span>
              <div className="h-px w-3" style={{ background: T.rule }} />
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>FILED · 16 APR 2026</span>
            </div>

            <div className="col-span-12 lg:col-span-8 lg:pl-12">
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
                <Eyebrow color={T.accent}>Ingredient · Antioxidant · L-ascorbic acid (vitamin C)</Eyebrow>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>P. 03 · BRIEF</div>
              </div>

              <h1 className="mt-10" style={{ fontFamily: SERIF, fontSize: 116, lineHeight: 0.9, letterSpacing: "-0.05em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
                L-ascorbic <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>acid.</span>
              </h1>
              <div className="mt-3" style={{ fontFamily: SERIF_ED, fontSize: 36, fontStyle: "italic", color: T.accent, letterSpacing: "-0.02em" }}>
                The most-bought antioxidant. <span style={{ color: T.inkSoft, fontFamily: SERIF, fontStyle: "normal" }}>The most-misused, too.</span>
              </div>

              <p className="mt-9 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>
                {concernLink("Pure vitamin C — the L-stereoisomer — is the reference daytime antioxidant. It only works when the formulation lives at pH ≤ 3.5, in opaque packaging, freshly purchased, and applied to dry skin under SPF. Every \"underwhelming\" vitamin C result we audit fails one of those four conditions.")}
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
                  <TierBadge tier="A" size="md" />
                </div>
                <dl>
                  {[
                    ["INCI", "Ascorbic acid"],
                    ["Family", "Water-soluble antioxidant"],
                    ["Active range", "10 – 20%"],
                    ["pH window", "≤ 3.5 (LAA)"],
                    ["Pregnancy-safe", "Yes (topical)"],
                    ["Photo-stable?", "No — opaque packaging only"],
                    ["Shelf-life", "3 months once opened"],
                    ["Reviewer", "Dr. Paul · last reviewed 16-Apr-2026"],
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
              <Folio n="§ 01" />
              <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                What L-ascorbic acid <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>actually is.</span>
              </h2>
              <p className="mt-7" style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.65, color: T.inkSoft }}>
                <span style={{ float: "left", fontFamily: SERIF, fontSize: 86, lineHeight: 0.85, fontWeight: 400, fontVariationSettings: '"opsz" 144', color: T.ink, paddingRight: 14, paddingTop: 6, marginRight: 4 }}>L</span>
                {concernLink("-ascorbic acid is vitamin C in its biologically active L-stereoisomer. It is the only form the human cell uses directly — every other \"vitamin C\" on a label is a derivative that must convert to LAA inside the skin, with conversion rates ranging from genuine to negligible. The molecule is simultaneously skincare's most useful antioxidant and its most temperamental one: pH-dependent for absorption, oxygen-sensitive in storage, and easily inactivated by water, heat, and time on a shelf.")}
              </p>
              <p className="mt-5" style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.65, color: T.inkSoft }}>
                {concernLink("When formulated correctly — the SkinCeuticals C E Ferulic patent of 15% LAA, 1% α-tocopherol, 0.5% ferulic acid at pH ≤ 3.5 is the reference — it provides the strongest published in-vivo evidence for any over-the-counter daytime antioxidant. When formulated badly, you have brown water in a clear bottle.")}
              </p>
            </article>

            <Asterism />

            <article>
              <Folio n="§ 02" />
              <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                Why pH and pairing <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>decide everything.</span>
              </h2>
              <p className="mt-7" style={{ fontFamily: SERIF, fontSize: 18, lineHeight: 1.65, color: T.inkSoft }}>
                {concernLink("LAA is only meaningfully absorbed across the stratum corneum in its uncharged form, which exists below pH 3.5. Above pH 4 it dissociates and stops crossing the barrier in useful quantities. This is why a \"20% vitamin C\" at pH 5 underperforms a 10% formula at pH 3.2. Vitamin E (tocopherol) and ferulic acid extend stability and regenerate oxidised LAA in situ, which is why the Pinnell trio is still the formulation everyone benchmarks against twenty years on.")}
              </p>
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
                Forms, <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>compared.</span>
              </h2>
              <div className="mt-9 border" style={{ borderColor: T.rule }}>
                <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b" style={{ borderColor: T.rule, background: T.paper2, fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.mutedSoft, textTransform: "uppercase" }}>
                  <div className="col-span-1">Tier</div>
                  <div className="col-span-4">Form</div>
                  <div className="col-span-2">pH</div>
                  <div className="col-span-5">Notes</div>
                </div>
                {FORMS.map((f) => (
                  <div key={f.f} className="grid grid-cols-12 gap-4 px-5 py-5 items-center border-b last:border-b-0" style={{ borderColor: T.ruleSoft }}>
                    <div className="col-span-1"><TierBadge tier={f.tier} /></div>
                    <div className="col-span-4" style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, fontVariationSettings: '"opsz" 144' }}>{concernLink(f.f)}</div>
                    <div className="col-span-2" style={{ fontFamily: MONO, fontSize: 12, color: T.muted }}>{f.ph}</div>
                    <div className="col-span-5" style={{ fontFamily: SERIF, fontSize: 14.5, color: T.inkSoft, fontStyle: "italic", lineHeight: 1.5 }}>{concernLink(f.note)}</div>
                  </div>
                ))}
              </div>
            </article>

            <Asterism />

            <article>
              <Folio n="§ 06" />
              <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                Storage, <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>oxidation, life-span.</span>
              </h2>
              <div className="mt-9 grid grid-cols-1 md:grid-cols-3 gap-0 border-l border-t" style={{ borderColor: T.rule }}>
                {[
                  { k: "Buy small", b: "30 mL bottle. Anything more is waste once you account for oxidation kinetics." },
                  { k: "Store cool, dark", b: "Refrigerator is overkill but a closed cabinet is mandatory. Light and warmth halve shelf-life." },
                  { k: "Watch the colour", b: "Pale straw → orange → amber → bin. Once amber, the antioxidant is now a pro-oxidant." },
                ].map((x) => (
                  <div key={x.k} className="p-7 border-r border-b" style={{ borderColor: T.rule, background: T.paper }}>
                    <Eyebrow color={T.accent}>{x.k}</Eyebrow>
                    <p className="mt-4" style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.6, color: T.inkSoft }}>{x.b}</p>
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
                    pageSlug: "l-ascorbic-acid",
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
      <FoundIn ingredientSlug="l-ascorbic-acid" ingredientName="L-ascorbic acid" />


      <EditorPageLink pageKind="ingredient" pageSlug="l-ascorbic-acid" />
      <SiteFooter />
    </div>
  );
};

export default IngredientLAscorbic;
