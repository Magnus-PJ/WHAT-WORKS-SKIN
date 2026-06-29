import React, { useState } from "react";
import { ChevronDown, ArrowRight, Bookmark, Share2 } from "lucide-react";
import { T } from "./_theme";
import {
  SiteHeader, SiteFooter, Breadcrumbs, Container, Eyebrow, Folio, TierBadge,
  PaperGrain, LaidPaper, ColumnRules, TopVignette,
  SERIF, SERIF_ED, SANS, MONO,
} from "./_chrome";
import { linkForIngredientName } from "./_links";
import { getReviewer } from "./_reviewers";
import { ReviewerBioSection, ReviewerSidebarCredit } from "./_ReviewerBio";

export type ProductData = {
  brand: string;
  productName: string;
  tagline: string;
  category: string;
  pageRef: string;
  filed: string;
  reviewer: string;
  eyebrow: string;
  tier: "A" | "B" | "C" | "D";
  hero: string;
  facts: [string, string][];
  scoreBreakdown: { k: string; v: number; max: number; n: string }[];
  ingredients: { i: string; role: string; tier: "A" | "B" | "C" | "D"; note: string }[];
  useCases: { k: string; b: string }[];
  alts: { brand: string; name: string; tier: "A" | "B" | "C" | "D"; score: number; note: string }[];
  faq: { q: string; a: string }[];
  sources: { n: string; w: string }[];
};

export const ProductTemplate: React.FC<{ d: ProductData }> = ({ d }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const total = d.scoreBreakdown.reduce((a, b) => a + b.v, 0);
  const reviewer = getReviewer(d.reviewer);
  const reviewerLine = reviewer.credentials
    ? `${reviewer.name}, ${reviewer.credentials}`
    : reviewer.name;

  return (
    <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
      <LaidPaper />
      <SiteHeader active="Products" />
      <Breadcrumbs trail={[{ label: "Home", href: "/__mockup/preview/evidently/Home" }, { label: "Products", href: "/__mockup/preview/evidently/ProductIndex" }, { label: d.productName }]} />

      <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
        <TopVignette /><PaperGrain /><ColumnRules opacity={0.32} />
        <Container>
          <div className="relative grid grid-cols-12 gap-10 py-24">
            <div className="absolute left-0 top-24 bottom-24 hidden lg:flex flex-col items-center justify-between" style={{ width: 24 }}>
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>{d.pageRef}</span>
              <div className="h-px w-3" style={{ background: T.rule }} />
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>FILED · {d.filed}</span>
            </div>

            <div className="col-span-12 lg:col-span-8 lg:pl-12">
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
                <Eyebrow color={T.accent}>{d.eyebrow}</Eyebrow>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>{d.pageRef} · REVIEW</div>
              </div>

              <div className="mt-8" style={{ fontFamily: SANS, fontSize: 13, letterSpacing: "0.18em", color: T.muted, textTransform: "uppercase", fontWeight: 600 }}>{d.brand}</div>

              <h1 className="mt-3" style={{ fontFamily: SERIF, fontSize: 80, lineHeight: 0.95, letterSpacing: "-0.04em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
                {d.productName} <br />
                <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED, fontSize: 48 }}>{d.tagline}</span>
              </h1>

              <p className="mt-9 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>{d.hero}</p>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <button className="inline-flex items-center gap-2 px-5 py-3" style={{ background: T.ink, color: T.paper, fontFamily: SANS, fontSize: 13, fontWeight: 500 }}>Read the review <ArrowRight className="h-4 w-4" /></button>
                <button className="inline-flex items-center gap-2 border px-5 py-3" style={{ borderColor: T.rule, fontFamily: SANS, fontSize: 13, color: T.ink }}><Bookmark className="h-3.5 w-3.5" /> Save</button>
                <button className="inline-flex items-center gap-2 border px-5 py-3" style={{ borderColor: T.rule, fontFamily: SANS, fontSize: 13, color: T.ink }}><Share2 className="h-3.5 w-3.5" /> Share</button>
              </div>
            </div>

            <aside className="col-span-12 lg:col-span-4 lg:flex lg:items-end">
              <div className="border w-full" style={{ borderColor: T.rule, background: T.paper }}>
                <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: T.rule, background: T.paper2 }}>
                  <Eyebrow>Works Score</Eyebrow>
                  <TierBadge tier={d.tier} size="md" />
                </div>
                <div className="px-6 py-7 text-center border-b" style={{ borderColor: T.rule }}>
                  <div style={{ fontFamily: SERIF, fontSize: 88, fontWeight: 400, color: T.ink, lineHeight: 1, fontVariationSettings: '"opsz" 144, "SOFT" 30', letterSpacing: "-0.04em" }}>
                    {total}<span style={{ color: T.mutedSoft, fontSize: 22, marginLeft: 4 }}>/100</span>
                  </div>
                  <div className="mt-3" style={{ fontFamily: MONO, fontSize: 10, color: T.mutedSoft, letterSpacing: "0.18em" }}>METHODOLOGY V1.0</div>
                </div>
                <dl>
                  {d.facts.map(([k, v]) => (
                    <div key={k} className="px-6 py-3.5 border-b" style={{ borderColor: T.ruleSoft }}>
                      <dt style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.16em", color: T.mutedSoft, textTransform: "uppercase" }}>{k}</dt>
                      <dd className="mt-1" style={{ fontFamily: SERIF, fontSize: 14.5, color: T.ink, lineHeight: 1.45 }}>{v}</dd>
                    </div>
                  ))}
                </dl>
                <ReviewerSidebarCredit reviewer={reviewer} filed={d.filed} />
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <section className="relative z-10 border-b py-20" style={{ borderColor: T.rule, background: T.paper2 }}>
        <Container>
          <Folio>§ 01</Folio>
          <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.03em" }}>
            How the score <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>breaks down.</span>
          </h2>
          <div className="mt-10 space-y-6">
            {d.scoreBreakdown.map((s) => (
              <div key={s.k} className="grid grid-cols-12 gap-6 items-center">
                <div className="col-span-12 md:col-span-3" style={{ fontFamily: SERIF, fontSize: 19, color: T.ink, fontVariationSettings: '"opsz" 144' }}>{s.k}</div>
                <div className="col-span-12 md:col-span-7">
                  <div className="h-2 w-full" style={{ background: T.ruleSoft }}>
                    <div className="h-full" style={{ background: T.accent, width: `${(s.v / s.max) * 100}%` }} />
                  </div>
                  <p className="mt-2" style={{ fontFamily: SERIF, fontSize: 14.5, color: T.muted, fontStyle: "italic" }}>{s.n}</p>
                </div>
                <div className="col-span-12 md:col-span-2 md:text-right" style={{ fontFamily: SERIF, fontSize: 30, fontVariationSettings: '"opsz" 144', color: T.ink, letterSpacing: "-0.02em" }}>
                  {s.v}<span style={{ color: T.mutedSoft, fontSize: 14 }}>/{s.max}</span>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="relative z-10 border-b py-20" style={{ borderColor: T.rule }}>
        <Container>
          <Folio>§ 02</Folio>
          <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.03em" }}>
            Inside the <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>tube.</span>
          </h2>
          <div className="mt-9 border" style={{ borderColor: T.rule }}>
            <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b" style={{ borderColor: T.rule, background: T.paper2, fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.mutedSoft, textTransform: "uppercase" }}>
              <div className="col-span-1">Tier</div>
              <div className="col-span-3">Ingredient</div>
              <div className="col-span-3">Role</div>
              <div className="col-span-5">Notes</div>
            </div>
            {d.ingredients.map((x) => {
              const href = linkForIngredientName(x.i);
              return (
                <div key={x.i} className="grid grid-cols-12 gap-4 px-5 py-5 items-center border-b last:border-b-0" style={{ borderColor: T.ruleSoft }}>
                  <div className="col-span-1"><TierBadge tier={x.tier} /></div>
                  <div className="col-span-3" style={{ fontFamily: SERIF, fontSize: 17, color: T.ink, fontVariationSettings: '"opsz" 144' }}>
                    {href ? (
                      <a href={href} style={{ color: T.ink, textDecoration: "underline", textUnderlineOffset: 3, textDecorationColor: T.rule }}>{x.i}</a>
                    ) : x.i}
                  </div>
                  <div className="col-span-3" style={{ fontFamily: SANS, fontSize: 13, color: T.muted }}>{x.role}</div>
                  <div className="col-span-5" style={{ fontFamily: SERIF, fontSize: 14.5, color: T.inkSoft, fontStyle: "italic", lineHeight: 1.5 }}>{x.note}</div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="relative z-10 border-b py-20" style={{ borderColor: T.rule, background: T.paper2 }}>
        <Container>
          <Folio>§ 03</Folio>
          <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.03em" }}>
            What it's <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>for.</span>
          </h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-0 border-l border-t" style={{ borderColor: T.rule }}>
            {d.useCases.map((x) => (
              <div key={x.k} className="p-7 border-r border-b" style={{ borderColor: T.rule, background: T.paper }}>
                <Eyebrow color={T.accent}>{x.k}</Eyebrow>
                <p className="mt-4" style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.6, color: T.inkSoft }}>{x.b}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="relative z-10 border-b py-20" style={{ borderColor: T.rule }}>
        <Container>
          <Folio>§ 04</Folio>
          <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.03em" }}>
            Worthy <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>alternates.</span>
          </h2>
          <div className="mt-9 grid grid-cols-1 md:grid-cols-3 gap-0 border-l border-t" style={{ borderColor: T.rule }}>
            {d.alts.map((p) => (
              <div key={p.name} className="flex flex-col p-7 border-r border-b" style={{ borderColor: T.rule, background: T.paper }}>
                <div className="flex items-start justify-between mb-3">
                  <span style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.18em", color: T.muted, textTransform: "uppercase", fontWeight: 600 }}>{p.brand}</span>
                  <TierBadge tier={p.tier} />
                </div>
                <div style={{ fontFamily: SERIF, fontSize: 18, lineHeight: 1.25, color: T.ink, fontVariationSettings: '"opsz" 144' }}>{p.name}</div>
                <p className="mt-3" style={{ fontFamily: SERIF, fontSize: 14, lineHeight: 1.55, color: T.muted, fontStyle: "italic" }}>{p.note}</p>
                <div className="mt-auto pt-5 flex items-baseline justify-between border-t" style={{ borderColor: T.ruleSoft }}>
                  <span style={{ fontFamily: SERIF, fontSize: 26, fontVariationSettings: '"opsz" 144', color: T.ink, letterSpacing: "-0.02em" }}>{p.score}<span style={{ color: T.mutedSoft, fontSize: 12 }}>⁄100</span></span>
                  <ArrowRight className="h-3.5 w-3.5" style={{ color: T.accent }} />
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <Container>
        <div className="py-20 border-b" style={{ borderColor: T.rule }}>
          <Folio>§ 05</Folio>
          <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.03em" }}>
            Frequently <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>asked.</span>
          </h2>
          <div className="mt-9 border-t" style={{ borderColor: T.rule }}>
            {d.faq.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={f.q} className="border-b" style={{ borderColor: T.ruleSoft }}>
                  <button onClick={() => setOpenFaq(open ? null : i)} className="w-full flex items-baseline justify-between gap-4 py-6 text-left">
                    <span style={{ fontFamily: SERIF, fontSize: 22, color: T.ink, lineHeight: 1.35, fontVariationSettings: '"opsz" 144' }}>{f.q}</span>
                    <ChevronDown className="h-5 w-5 flex-shrink-0" style={{ color: T.muted, transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
                  </button>
                  {open && <p className="pb-6 max-w-3xl" style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.65, color: T.inkSoft }}>{f.a}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </Container>

      <ReviewerBioSection reviewer={reviewer} filed={d.filed} folio="§ 06" />

      <Container>
        <div className="py-20">
          <Folio>§ 07</Folio>
          <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.03em" }}>
            <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>Sources.</span>
          </h2>
          <ol className="mt-9 border-t" style={{ borderColor: T.rule }}>
            {d.sources.map((s, i) => (
              <li key={i} className="flex gap-5 py-4 border-b" style={{ borderColor: T.ruleSoft }}>
                <span style={{ fontFamily: MONO, fontSize: 11, color: T.mutedSoft, letterSpacing: "0.1em", minWidth: 26 }}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.55, flex: 1 }}>{s.n}</span>
                <span style={{ fontFamily: MONO, fontSize: 10, color: T.mutedSoft, letterSpacing: "0.1em", textTransform: "uppercase" }}>{s.w}</span>
              </li>
            ))}
          </ol>
          <div className="mt-6" style={{ fontFamily: SERIF, fontSize: 14, color: T.muted, fontStyle: "italic" }}>
            Reviewed by {reviewerLine}. Last updated {d.filed}. Methodology v1.0.
          </div>
        </div>
      </Container>

      <SiteFooter />
    </div>
  );
};
