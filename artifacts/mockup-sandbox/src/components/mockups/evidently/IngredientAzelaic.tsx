// IngredientAzelaic — full ingredient brief for azelaic acid.

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
  ["02", "Mechanism — three jobs at once"],
  ["03", "Evidence overview"],
  ["04", "OTC vs Rx (10% vs 15–20%)"],
  ["05", "Pregnancy & melasma"],
  ["06", "Pairings & conflicts"],
  ["07", "On our shelf"],
  ["08", "FAQ"],
];

const EVIDENCE = [
  { c: "Inflammatory acne",       n: "RCTs vs BPO 5%",       w: "78%", note: "20% azelaic reaches BPO efficacy without the bleach-and-burn profile." },
  { c: "Comedonal acne",            n: "Open-label 12 wk",      w: "62%", note: "Slower than adapalene; useful in adapalene-intolerant patients." },
  { c: "Rosacea (papulopustular)", n: "RCTs vs metronidazole", w: "82%", note: "First-line in many derm guidelines. The molecule rosacea was waiting for." },
  { c: "Melasma / PIH",             n: "RCT vs HQ 4%",          w: "70%", note: "Comparable endpoints to hydroquinone in some 24-week trials." },
];

export const PRODUCTS = [
  { brand: "The Ordinary", name: "Azelaic Acid Suspension 10%", tier: "A" as const, score: 80, note: "Cheapest serious azelaic in India. Twice-daily for 12 weeks." },
  { brand: "Paula's Choice", name: "10% Azelaic Acid Booster", tier: "A" as const, score: 84, note: "Better vehicle, less pilling. Worth the premium for sensitive skin." },
  { brand: "Bioderma", name: "Sébium AKN", tier: "B" as const, score: 76, note: "Azelaic + niacinamide combo. Convenient single-step option." },
  { brand: "Galderma", name: "Finacea Foam 15% (Rx)", tier: "A" as const, score: 90, note: "Rx-strength reference for rosacea. Foam vehicle is genuinely elegant." },
];

const FAQ = [
  { q: "Why does it tingle for the first week?", a: "Azelaic at clinical doses produces transient burning or tingling for 5–10 minutes after application — it's a pharmacological signature, not damage. Almost universal in week one, fades by week three. If it persists past four weeks, switch vehicle (foam over gel) or move to alternate-day." },
  { q: "Is the OTC 10% strong enough?", a: "For acne and PIH, yes — particularly twice-daily for the full 12 weeks. For severe rosacea or melasma, the 15–20% prescription forms are meaningfully stronger and worth the consultation." },
  { q: "Can I use it with retinoids?", a: "Yes — among the most reliable pairings we recommend. Azelaic morning, retinoid evening. Or alternate nights if your skin tolerates both poorly. The mechanisms complement; the irritation does not stack much." },
  { q: "Safe in pregnancy?", a: "Yes — one of very few actives with clear pregnancy-safe data. Often the only effective choice when retinoids and tranexamic acid are off the table." },
];

const IngredientAzelaic: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
      <LaidPaper />
      <SiteHeader active="Ingredients" />
      <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Ingredients", href: "#" }, { label: "Azelaic acid" }]} />

      <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
        <TopVignette /><PaperGrain /><ColumnRules opacity={0.32} />
        <div aria-hidden className="absolute -right-16 -top-16 z-0"><AmbientFlask size={560} opacity={0.06} /></div>

        <Container>
          <div className="relative grid grid-cols-12 gap-10 py-24">
            <div className="absolute left-0 top-24 bottom-24 hidden lg:flex flex-col items-center justify-between" style={{ width: 24 }}>
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>INGREDIENT · 04 / 28</span>
              <div className="h-px w-3" style={{ background: T.rule }} />
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>FILED · 17 APR 2026</span>
            </div>

            <div className="col-span-12 lg:col-span-8 lg:pl-12">
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
                <Eyebrow color={T.accent}>Ingredient · Dicarboxylic acid · Azelaic</Eyebrow>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>P. 04 · BRIEF</div>
              </div>

              <h1 className="mt-10" style={{ fontFamily: SERIF, fontSize: 116, lineHeight: 0.9, letterSpacing: "-0.05em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
                Azelaic <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>acid.</span>
              </h1>
              <div className="mt-3" style={{ fontFamily: SERIF_ED, fontSize: 36, fontStyle: "italic", color: T.accent, letterSpacing: "-0.02em" }}>
                Three jobs at once. <span style={{ color: T.inkSoft, fontFamily: SERIF, fontStyle: "normal" }}>Quietly underused.</span>
              </div>

              <p className="mt-9 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>
                {concernLink("The molecule that treats acne, rosacea, and pigment from a single jar — without bleaching towels, drying skin, or being banned in pregnancy. The fact that you have not heard of it the way you have heard of retinol is a marketing failure, not a clinical one.")}
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
                    ["INCI", "Azelaic acid"],
                    ["Family", "Saturated dicarboxylic acid"],
                    ["OTC range", "10%"],
                    ["Rx range", "15 – 20%"],
                    ["pH window", "4.0 – 5.0"],
                    ["Pregnancy-safe", "Yes — one of very few"],
                    ["Photo-stable", "Yes — AM/PM"],
                    ["Reviewer", "Dr. Sundeep · 17-Apr-2026"],
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
                What azelaic <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>actually is.</span>
              </h2>
              <p className="mt-7" style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.65, color: T.inkSoft }}>
                <span style={{ float: "left", fontFamily: SERIF, fontSize: 86, lineHeight: 0.85, fontWeight: 400, fontVariationSettings: '"opsz" 144', color: T.ink, paddingRight: 14, paddingTop: 6, marginRight: 4 }}>A</span>
                {concernLink("zelaic acid is a saturated, nine-carbon dicarboxylic acid produced by the yeast ")}<em>Malassezia furfur</em>{concernLink(", the same skin-resident organism implicated in pityriasis and fungal acne. The body has been making and tolerating azelaic acid on the skin's surface for millennia; topical formulations replicate that exposure at therapeutic doses. The result is a molecule with antibacterial, anti-inflammatory, comedolytic, and tyrosinase-inhibiting effects all from a single application — a pharmacological elegance no other OTC active matches.")}
              </p>
              <p className="mt-5" style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.65, color: T.inkSoft }}>
                {concernLink("The reason it is under-prescribed in India is partly cultural — patients want \"lightening creams\" not anti-inflammatories — and partly pharmacy economics: at ₹400 a tube, the marketing budget is small.")}
              </p>
            </article>

            <Asterism />

            <article>
              <Folio>§ 02</Folio>
              <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                Three jobs <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>at once.</span>
              </h2>
              <div className="mt-9 grid grid-cols-1 md:grid-cols-3 gap-0 border-l border-t" style={{ borderColor: T.rule }}>
                {[
                  { k: "Antibacterial", b: "Selectively suppresses C. acnes proliferation in the follicle. Reaches BPO-comparable endpoints in some RCTs." },
                  { k: "Anti-inflammatory", b: "Reduces ROS in keratinocytes; calms papular rosacea. The endpoint dermatologists actually prescribe it for." },
                  { k: "Tyrosinase inhibition", b: "Selectively targets hyperactive melanocytes (i.e., PIH, melasma) without affecting baseline pigment." },
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
              <Folio>§ 04</Folio>
              <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                10% OTC vs <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>15–20% Rx.</span>
              </h2>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-0 border-l border-t" style={{ borderColor: T.rule }}>
                {[
                  { c: "10% (OTC)", note: "Adequate for mild–moderate acne and most PIH. Twice-daily, 12 weeks." },
                  { c: "15% (Rx)", note: "Reference for papulopustular rosacea. Foam or gel vehicle." },
                  { c: "20% (Rx cream)", note: "Strongest documented efficacy for melasma. Slower vehicle, more pilling." },
                  { c: "Compounded", note: "Not necessary in most cases. The OTC and Rx ladder covers the use cases." },
                ].map((x, i) => (
                  <div key={i} className="p-6 border-r border-b" style={{ borderColor: T.rule, background: T.paper }}>
                    <div style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 400, fontVariationSettings: '"opsz" 144', color: T.accent, letterSpacing: "-0.02em" }}>{x.c}</div>
                    <p className="mt-3" style={{ fontFamily: SERIF, fontSize: 14.5, lineHeight: 1.6, color: T.inkSoft }}>{x.note}</p>
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
                    pageSlug: "azelaic-acid",
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
      <FoundIn ingredientSlug="azelaic-acid" ingredientName="Azelaic acid" />


      <EditorPageLink pageKind="ingredient" pageSlug="azelaic-acid" />
      <SiteFooter />
    </div>
  );
};

export default IngredientAzelaic;
