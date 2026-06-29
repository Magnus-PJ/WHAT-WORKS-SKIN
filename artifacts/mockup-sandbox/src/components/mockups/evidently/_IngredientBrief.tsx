// _IngredientBrief — shared layout for ingredient detail pages.
// Underscore prefix excludes it from preview auto-registration.

import React, { useState } from "react";
import { ChevronDown, ArrowRight, Bookmark, Share2, ExternalLink } from "lucide-react";
import { T } from "./_theme";
import {
  SiteHeader, SiteFooter, Breadcrumbs, Container, Eyebrow, Folio, TierBadge,
  PaperGrain, LaidPaper, ColumnRules, TopVignette, Asterism, AmbientFlask,
  SERIF, SERIF_ED, SANS, MONO,
} from "./_chrome";
import { FoundIn } from "./_FoundIn";
import { productLinkForBriefEntry, shelfOutboundClickHandler, linkifyText } from "./_links";
import { EditorPageLink } from "./_EditorPageLink";

const concernLink = (text: string) => linkifyText(text, { scope: "concerns" });

type Tier = "A" | "B" | "C" | "D";

export type IngredientBriefData = {
  /** Catalogue slug — used to find products that contain this ingredient. */
  slug?: string;
  name: string;
  number: string;
  filed: string;
  eyebrowKicker: string;
  tier: Tier;
  headlineSize?: number;
  tagline: { italic: string; rest: string };
  lead: string;
  atGlance: [string, string][];
  toc: [string, string][];
  whatItIs: { dropCap: string; title: { plain: string; italic: string }; body: string; body2?: string };
  mechanism?: { k: string; b: string }[];
  evidence: { c: string; n: string; w: string; note: string }[];
  concentration?: { c: string; v: string; b: string }[];
  pairings?: { with: string; verdict: string; note: string; ok: boolean }[];
  products: { brand: string; name: string; tier: Tier; score: number; note: string }[];
  faq: { q: string; a: string }[];
};

const GRID_COLS_MD: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
};

export const IngredientBrief: React.FC<{ data: IngredientBriefData }> = ({ data }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const headlineSize = data.headlineSize ?? 124;

  return (
    <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
      <LaidPaper />
      <SiteHeader active="Ingredients" />
      <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Ingredients", href: "#" }, { label: data.name }]} />

      {/* HERO */}
      <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
        <TopVignette /><PaperGrain /><ColumnRules opacity={0.32} />
        <div aria-hidden className="absolute -right-16 -top-16 z-0"><AmbientFlask size={560} opacity={0.06} /></div>

        <Container>
          <div className="relative grid grid-cols-12 gap-10 py-24">
            <div className="absolute left-0 top-24 bottom-24 hidden lg:flex flex-col items-center justify-between" style={{ width: 24 }}>
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>INGREDIENT · {data.number}</span>
              <div className="h-px w-3" style={{ background: T.rule }} />
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>FILED · {data.filed}</span>
            </div>

            <div className="col-span-12 lg:col-span-8 lg:pl-12">
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
                <Eyebrow color={T.accent}>{data.eyebrowKicker}</Eyebrow>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>P. {data.number.split(" ")[0]} · BRIEF</div>
              </div>

              <h1 className="mt-10" style={{ fontFamily: SERIF, fontSize: headlineSize, lineHeight: 0.9, letterSpacing: "-0.05em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
                {data.name}.
              </h1>
              <div className="mt-3" style={{ fontFamily: SERIF_ED, fontSize: 36, fontStyle: "italic", color: T.accent, letterSpacing: "-0.02em" }}>
                {data.tagline.italic} <span style={{ color: T.inkSoft, fontFamily: SERIF, fontStyle: "normal" }}>{data.tagline.rest}</span>
              </div>

              <p className="mt-9 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>
                {concernLink(data.lead)}
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
                  <TierBadge tier={data.tier} size="md" />
                </div>
                <dl>
                  {data.atGlance.map(([k, v]) => (
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
                {data.toc.map(([n, t]) => (
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
                {data.whatItIs.title.plain} <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>{data.whatItIs.title.italic}</span>
              </h2>
              <p className="mt-7" style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.65, color: T.inkSoft }}>
                <span style={{ float: "left", fontFamily: SERIF, fontSize: 86, lineHeight: 0.85, fontWeight: 400, fontVariationSettings: '"opsz" 144', color: T.ink, paddingRight: 14, paddingTop: 6, marginRight: 4 }}>{data.whatItIs.dropCap}</span>
                {concernLink(data.whatItIs.body)}
              </p>
              {data.whatItIs.body2 && (
                <p className="mt-5" style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.65, color: T.inkSoft }}>{concernLink(data.whatItIs.body2)}</p>
              )}
            </article>

            {data.mechanism && data.mechanism.length > 0 && (
              <>
                <Asterism />
                <article>
                  <Folio n="§ 02" />
                  <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                    Mechanism, <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>plainly.</span>
                  </h2>
                  <div className={`mt-9 grid grid-cols-1 ${GRID_COLS_MD[Math.min(data.mechanism.length, 3)]} gap-0 border-t border-l`} style={{ borderColor: T.rule }}>
                    {data.mechanism.map((x) => (
                      <div key={x.k} className="p-7 border-r border-b" style={{ borderColor: T.rule, background: T.paper }}>
                        <Eyebrow color={T.accent}>{x.k}</Eyebrow>
                        <p className="mt-4" style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.6, color: T.inkSoft }}>{concernLink(x.b)}</p>
                      </div>
                    ))}
                  </div>
                </article>
              </>
            )}

            <Asterism />

            <article>
              <Folio n="§ 03" />
              <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                The <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>evidence.</span>
              </h2>
              <div className="mt-9 space-y-5">
                {data.evidence.map((e) => (
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

            {data.concentration && data.concentration.length > 0 && (
              <>
                <Asterism />
                <article>
                  <Folio n="§ 04" />
                  <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                    Concentration <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>& vehicle.</span>
                  </h2>
                  <div className={`mt-8 grid grid-cols-1 ${GRID_COLS_MD[Math.min(data.concentration.length, 4)]} gap-0 border-l border-t`} style={{ borderColor: T.rule }}>
                    {data.concentration.map((x, i) => (
                      <div key={i} className="p-6 border-r border-b" style={{ borderColor: T.rule, background: T.paper }}>
                        <div style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 400, fontVariationSettings: '"opsz" 144', color: T.accent, letterSpacing: "-0.02em" }}>{x.c}</div>
                        <div className="mt-2" style={{ fontFamily: MONO, fontSize: 10, color: T.mutedSoft, letterSpacing: "0.14em", textTransform: "uppercase" }}>{x.v}</div>
                        <p className="mt-3" style={{ fontFamily: SERIF, fontSize: 14.5, lineHeight: 1.55, color: T.inkSoft }}>{x.b}</p>
                      </div>
                    ))}
                  </div>
                </article>
              </>
            )}

            {data.pairings && data.pairings.length > 0 && (
              <>
                <Asterism />
                <article>
                  <Folio n="§ 06" />
                  <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                    Pairings <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>& conflicts.</span>
                  </h2>
                  <div className="mt-9 border" style={{ borderColor: T.rule }}>
                    {data.pairings.map((p, i) => (
                      <div key={p.with} className="grid grid-cols-12 gap-4 px-5 py-5 items-center border-b last:border-b-0" style={{ borderColor: T.ruleSoft, background: i % 2 ? T.paper2 : T.paper }}>
                        <div className="col-span-12 md:col-span-3" style={{ fontFamily: SERIF, fontSize: 17, color: T.ink, fontVariationSettings: '"opsz" 144' }}>{p.with}</div>
                        <div className="col-span-12 md:col-span-2">
                          <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: p.ok ? T.tierA : T.tierD }}>{p.verdict}</span>
                        </div>
                        <div className="col-span-12 md:col-span-7" style={{ fontFamily: SERIF, fontSize: 14.5, color: T.muted, fontStyle: "italic", lineHeight: 1.55 }}>{p.note}</div>
                      </div>
                    ))}
                  </div>
                </article>
              </>
            )}

            <Asterism />

            <article>
              <Folio n="§ 07" />
              <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                On <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>our shelf.</span>
              </h2>
              <div className="mt-9 grid grid-cols-1 md:grid-cols-2 gap-0 border-l border-t" style={{ borderColor: T.rule }}>
                {data.products.map((p) => {
                  const link = productLinkForBriefEntry(p.brand, p.name);
                  const cardBody = (
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
                    pageKind: "ingredient",
                    pageSlug: data.slug ?? "",
                  });
                  return (
                    <a key={p.name} href={link.href} className={cls} style={style} onClick={onClick} {...externalProps}>{cardBody}</a>
                  );
                })}
              </div>
            </article>

            {data.slug && <FoundIn ingredientSlug={data.slug} ingredientName={data.name} folio="§ 7b" wrap={false} />}

            <Asterism />

            <article>
              <Folio n="§ 08" />
              <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                Frequently <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>asked.</span>
              </h2>
              <div className="mt-9 border-t" style={{ borderColor: T.rule }}>
                {data.faq.map((f, i) => {
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

      <EditorPageLink pageKind="ingredient" pageSlug={data.slug ?? ""} />
      <SiteFooter />
    </div>
  );
};

export default IngredientBrief;
