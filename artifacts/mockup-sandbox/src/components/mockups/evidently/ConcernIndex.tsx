// ConcernIndex — every skin concern, organised editorially.

import React, { useState, useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { T, tierColor } from "./_theme";
import {
  SiteHeader, SiteFooter, Breadcrumbs, Container, Eyebrow, Folio,
  PaperGrain, LaidPaper, ColumnRules, TopVignette, AmbientFlask, Asterism,
  SERIF, SERIF_ED, SANS, MONO,
} from "./_chrome";
import { CONCERN_ROWS, concernHrefFor, type ConcernRow } from "./_concernCatalogue";

// Concern rows live in `_concernCatalogue.ts` (the single source of
// truth shared with the search registry and the home-page featured
// concerns block). We re-export `CONCERNS` so other modules can keep
// importing it from here.
export type C = ConcernRow;

export const CONCERNS: C[] = CONCERN_ROWS;

const FAMILIES = ["Pigmentation", "Acne", "Anti-aging", "Sensitive & barrier", "Recovery"];

const FEATURED = CONCERNS.filter(c => c.featured).sort((a, b) => a.featured! - b.featured!);

export const linkForConcern = (slug: string) => concernHrefFor(slug) ?? "#";
const linkFor = linkForConcern;

const ConcernIndex: React.FC = () => {
  const [filter, setFilter] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const f = filter ? CONCERNS.filter(c => c.family === filter) : CONCERNS;
    const g: Record<string, C[]> = {};
    for (const c of f) {
      if (!g[c.family]) g[c.family] = [];
      g[c.family].push(c);
    }
    return Object.entries(g);
  }, [filter]);

  return (
    <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
      <LaidPaper />
      <SiteHeader active="Concerns" />
      <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Concerns" }]} />

      {/* HERO */}
      <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
        <TopVignette />
        <PaperGrain />
        <ColumnRules opacity={0.32} />
        <div aria-hidden className="absolute -right-24 -top-12 z-0"><AmbientFlask size={520} opacity={0.06} /></div>

        <Container>
          <div className="relative grid grid-cols-12 gap-10 py-24">
            <div className="absolute left-0 top-24 bottom-24 hidden lg:flex flex-col items-center justify-between" style={{ width: 24 }}>
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>SECTION 05 / CONCERNS</span>
              <div className="h-px w-3" style={{ background: T.rule }} />
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>{CONCERNS.length} GUIDES</span>
            </div>

            <div className="col-span-12 lg:col-span-8 lg:pl-12">
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
                <Eyebrow color={T.accent}>The Concerns Library · {CONCERNS.length} Editorial Guides</Eyebrow>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>P. 10 · INDEX</div>
              </div>

              <h1 className="mt-10" style={{ fontFamily: SERIF, fontSize: 108, lineHeight: 0.93, letterSpacing: "-0.045em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
                Start with the <br />
                <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>concern.</span>
              </h1>

              <p className="mt-10 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>
                {CONCERNS.length} editorial guides — one per recognised skin concern. Each pulls together the molecules that work, the products on our shelf, and the routines we recommend. None of them feature an "amazing new ingredient." They feature the boring, evidence-supported one.
              </p>
            </div>

            <aside className="col-span-12 lg:col-span-4 lg:flex lg:items-end">
              <div className="border p-7 w-full" style={{ borderColor: T.rule, background: T.paper2 }}>
                <Eyebrow>How to use this library</Eyebrow>
                <p className="mt-4" style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, lineHeight: 1.6 }}>
                  Find your concern. Read the protocol. Cross-reference with the ingredients you already use. If our protocol calls for something you don't have — that's your shopping list. If it doesn't call for something you do — that's a savings.
                </p>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {/* FEATURED */}
      <section className="relative z-10 py-16 border-b" style={{ borderColor: T.rule, background: T.paper2 }}>
        <Container>
          <div className="flex items-end justify-between border-b pb-5 mb-10" style={{ borderColor: T.rule }}>
            <div>
              <Eyebrow color={T.tierD}>Most-read</Eyebrow>
              <h2 className="mt-3" style={{ fontFamily: SERIF, fontSize: 40, fontWeight: 400, letterSpacing: "-0.025em", color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
                Where the <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>questions land.</span>
              </h2>
            </div>
            <span style={{ fontFamily: MONO, fontSize: 10.5, color: T.mutedSoft, letterSpacing: "0.1em" }}>LAST 30 DAYS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border-l border-t" style={{ borderColor: T.rule }}>
            {FEATURED.map((c, i) => (
              <a key={c.slug} href={linkFor(c.slug)} className="flex flex-col p-7 border-r border-b" style={{ borderColor: T.rule, background: T.paper }}>
                <span style={{ fontFamily: SERIF, fontSize: 70, fontWeight: 400, color: T.tierD, lineHeight: 0.85, letterSpacing: "-0.04em", fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>{String(i + 1).padStart(2, "0")}</span>
                <div className="mt-5" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.18em", color: T.muted, textTransform: "uppercase" }}>{c.family}</div>
                <h3 className="mt-2" style={{ fontFamily: SERIF, fontSize: 26, lineHeight: 1.15, fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144', letterSpacing: "-0.015em" }}>{c.name}</h3>
                <p className="mt-3" style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.5, color: T.muted, fontStyle: "italic" }}>{c.oneliner}</p>
                <div className="mt-auto pt-5 border-t flex items-baseline justify-between" style={{ borderColor: T.ruleSoft, fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.12em", color: T.muted }}>
                  <span>{c.ingredients} INGREDIENTS · {c.products} PRODUCTS</span>
                  <ArrowRight className="h-3 w-3" style={{ color: T.accent }} />
                </div>
              </a>
            ))}
          </div>
        </Container>
      </section>

      {/* THE FULL TAXONOMY */}
      <section className="relative z-10 py-20" style={{ background: T.paper }}>
        <Container>
          <div className="border-b pb-5 mb-10 flex flex-wrap items-end justify-between" style={{ borderColor: T.rule }}>
            <div>
              <Eyebrow>The Full Taxonomy</Eyebrow>
              <h2 className="mt-3" style={{ fontFamily: SERIF, fontSize: 56, fontWeight: 400, letterSpacing: "-0.03em", color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30', lineHeight: 1 }}>
                Every concern, <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>indexed.</span>
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-6">
              <span style={{ fontFamily: MONO, fontSize: 10.5, color: T.mutedSoft, letterSpacing: "0.14em", marginRight: 6 }}>FAMILY</span>
              {FAMILIES.map(f => {
                const active = filter === f;
                return (
                  <button key={f} onClick={() => setFilter(active ? null : f)} className="rounded-full border px-4 py-1.5" style={{ borderColor: active ? T.ink : T.rule, color: active ? T.paper : T.inkSoft, background: active ? T.ink : "transparent", fontFamily: SANS, fontSize: 12 }}>
                    {f}
                  </button>
                );
              })}
              {filter && (
                <button onClick={() => setFilter(null)} style={{ fontFamily: SANS, fontSize: 12, color: T.accent, textDecoration: "underline", marginLeft: 6 }}>Clear</button>
              )}
            </div>
          </div>

          {grouped.map(([family, list]) => (
            <div key={family} className="mb-16">
              <div className="flex items-baseline justify-between border-b pb-3 mb-2" style={{ borderColor: T.rule }}>
                <h3 style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 400, color: T.ink, letterSpacing: "-0.015em", fontVariationSettings: '"opsz" 144' }}>{family}</h3>
                <span style={{ fontFamily: MONO, fontSize: 11, color: T.mutedSoft, letterSpacing: "0.14em" }}>{list.length} GUIDE{list.length !== 1 && "S"}</span>
              </div>

              <div>
                {list.map((c, i) => (
                  <a key={c.slug} href={linkFor(c.slug)} className="grid grid-cols-12 gap-6 py-7 border-b items-baseline" style={{ borderColor: T.ruleSoft }}>
                    <div className="col-span-12 md:col-span-1" style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 400, color: T.accent, fontVariationSettings: '"opsz" 144, "SOFT" 30', letterSpacing: "-0.03em", lineHeight: 0.9 }}>
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="col-span-12 md:col-span-6">
                      <div className="flex items-center gap-2">
                        <h4 style={{ fontFamily: SERIF, fontSize: 26, lineHeight: 1.15, fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144', letterSpacing: "-0.015em" }}>{c.name}</h4>
                        {c.rxOnly && <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.14em", color: T.tierD, padding: "2px 6px", border: `1px solid ${T.tierD}`, borderRadius: 2 }}>RX REGION</span>}
                      </div>
                      <p className="mt-2 max-w-xl" style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.55, color: T.muted, fontStyle: "italic" }}>{c.oneliner}</p>
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.mutedSoft, textTransform: "uppercase" }}>Inside</div>
                      <div className="mt-2" style={{ fontFamily: SERIF, fontSize: 14.5, color: T.inkSoft, lineHeight: 1.5 }}>
                        {c.ingredients} ingredients <br />
                        {c.products} products · {c.routines} routines
                      </div>
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.mutedSoft, textTransform: "uppercase" }}>Reviewer</div>
                      <div className="mt-2" style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, fontStyle: "italic" }}>{c.reviewer}</div>
                    </div>
                    <div className="col-span-12 md:col-span-1 md:text-right">
                      <span className="inline-flex items-center gap-1.5" style={{ fontFamily: SANS, fontSize: 12.5, color: T.accent, fontWeight: 500 }}>Read <ArrowRight className="h-3 w-3" /></span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </Container>
      </section>

      {/* DIAGNOSTIC CTA */}
      <section className="relative z-10 py-24 border-y" style={{ borderColor: T.rule, background: T.ink, color: T.paper }}>
        <Container>
          <div className="grid grid-cols-12 gap-10 items-end">
            <div className="col-span-12 lg:col-span-7">
              <Eyebrow color={T.invertAccent}>Not sure which concern fits you?</Eyebrow>
              <h2 className="mt-5" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', letterSpacing: "-0.03em", color: T.paper }}>
                Two questions, <span style={{ fontStyle: "italic", color: T.invertAccent, fontFamily: SERIF_ED }}>one shortlist.</span>
              </h2>
              <p className="mt-6 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 18, lineHeight: 1.6, color: T.invertMuted }}>
                The diagnostic is forty seconds. It returns the two or three concern guides that map most closely to what you described. No quiz fluff, no email gate.
              </p>
            </div>
            <div className="col-span-12 lg:col-span-5 lg:text-right">
              <a href="#" className="inline-flex items-center gap-2 px-6 py-4" style={{ background: T.paper, color: T.ink, fontFamily: SANS, fontSize: 13.5, fontWeight: 500 }}>
                Take the diagnostic <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </Container>
      </section>

      <SiteFooter />
    </div>
  );
};

export default ConcernIndex;
