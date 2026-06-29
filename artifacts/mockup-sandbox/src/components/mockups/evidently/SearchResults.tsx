import React, { useState } from "react";
import { Search, ArrowRight, X } from "lucide-react";
import {
  SiteHeader, SiteFooter, Breadcrumbs, Container, Eyebrow, Folio, Asterism,
  TopVignette, LaidPaper, PaperGrain, AmbientFlask, TierBadge, SERIF, SERIF_ED, SANS, MONO,
} from "./_chrome";
import { T } from "./_theme";

type Result = {
  kind: "Ingredient" | "Product" | "Routine" | "Concern" | "Supplement" | "Trend Watch" | "Methodology";
  title: string;
  href: string;
  snippet: string;
  tier?: string;
  meta: string;
};

const RESULTS: Result[] = [
  { kind: "Ingredient", title: "Niacinamide", href: "ingredients/niacinamide", tier: "A",
    snippet: "<mark>Niacinamide</mark> remains one of the few topicals with consistent evidence across barrier function, sebum, and pigmentation. The 4–5% sweet spot, why 10% is rarely necessary, and the interaction myths we keep debunking.",
    meta: "Updated 12 Apr 2026 · 18 sources · Reviewed by Dr. Sundeep" },
  { kind: "Product", title: "The Ordinary Niacinamide 10% + Zinc 1%", href: "products/the-ordinary-niacinamide-10", tier: "C",
    snippet: "A low-priced niacinamide that gets the headline percentage right but the formulation wrong for sensitive skin. We score the texture, the sting, and whether the zinc adds anything.",
    meta: "Reviewed Jan 2026 · Re-reviewed scheduled Q3 · Works Score 64/100" },
  { kind: "Product", title: "Paula's Choice 10% Niacinamide Booster", href: "products/paulas-choice-10-niacinamide", tier: "B",
    snippet: "Cleaner formulation, fewer accessories, more honest copy. Where it sits relative to the category leader and why we still don't recommend 10% as a default.",
    meta: "Reviewed Mar 2026 · Works Score 78/100" },
  { kind: "Routine", title: "Pigment-prone AM routine", href: "routines/am-pigment-prone", tier: "A",
    snippet: "Five-step morning routine for skin that marks easily. <mark>Niacinamide</mark> sits at step three, after vitamin C and before sunscreen. Why we sequence it that way and what to drop if you can't tolerate the C.",
    meta: "Updated 04 Apr 2026 · Tested by 12 readers in our reader panel" },
  { kind: "Concern", title: "Melasma — the long answer", href: "concerns/melasma", tier: "A",
    snippet: "<mark>Niacinamide</mark> earns a place in the melasma stack as a barrier-supporting supporting actor, never as the primary lifter. Where it sits in the evidence ladder.",
    meta: "12,000-word guide · 41 sources · Co-signed by both editors" },
  { kind: "Trend Watch", title: "Issue 09 · Methylene blue, NMN, and the longevity-skincare overlap", href: "trend-watch/09",
    snippet: "Brief mention of <mark>niacinamide</mark> as a comparator in the NMN section. Not the focus of the issue.",
    meta: "09 Feb 2026 · Verdict: Skip (NMN), Partly true (others)" },
  { kind: "Methodology", title: "How we grade ingredients — § 3.4 Niacinamide-class actives", href: "methodology#niacinamide-class",
    snippet: "Our specific scoring rubric for <mark>niacinamide</mark> and adjacent vitamin-B3 forms. The four trial-quality bars we ask each piece of evidence to clear.",
    meta: "Methodology v1.0 · Last revised 02 Mar 2026" },
];

const FACETS = [
  { k: "All", n: 7 },
  { k: "Ingredient", n: 1 },
  { k: "Product", n: 2 },
  { k: "Routine", n: 1 },
  { k: "Concern", n: 1 },
  { k: "Supplement", n: 0 },
  { k: "Trend Watch", n: 1 },
  { k: "Methodology", n: 1 },
];

const KIND_TINT: Record<Result["kind"], string> = {
  "Ingredient": T.accent, "Product": T.tierB, "Routine": T.tierC,
  "Concern": T.tierD, "Supplement": "#7c3aed", "Trend Watch": T.warning, "Methodology": T.muted,
};

const SearchResults: React.FC = () => {
  const [q, setQ] = useState("niacinamide");
  const [facet, setFacet] = useState<typeof FACETS[number]["k"]>("All");

  const filtered = facet === "All" ? RESULTS : RESULTS.filter((r) => r.kind === facet);

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: T.paper, color: T.ink }}>
      <PaperGrain /><LaidPaper /><TopVignette />

      <SiteHeader />
      <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Search" }]} />

      {/* Hero search */}
      <section className="relative z-10 border-b" style={{ borderColor: T.rule, background: `linear-gradient(180deg, ${T.paper2} 0%, ${T.paper} 100%)` }}>
        <Container max={1100}>
          <div className="py-12">
            <div className="flex items-center justify-between mb-8">
              <Eyebrow color={T.accent}>Search · The full reference</Eyebrow>
              <Folio n="P. 47 · SEARCH" />
            </div>
            <div className="relative flex items-center border-b-2" style={{ borderColor: T.ink }}>
              <Search className="h-6 w-6" style={{ color: T.ink }} />
              <input value={q} onChange={(e) => setQ(e.target.value)} className="flex-1 bg-transparent outline-none px-5 py-5"
                style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, letterSpacing: "-0.02em", color: T.ink, fontVariationSettings: '"opsz" 144' }} />
              <button onClick={() => setQ("")} className="p-2" aria-label="Clear">
                <X className="h-5 w-5" style={{ color: T.muted }} />
              </button>
              <kbd className="hidden md:inline-block ml-3" style={{ fontFamily: MONO, fontSize: 11, padding: "3px 8px", border: `1px solid ${T.rule}`, color: T.muted }}>esc to clear</kbd>
            </div>
            <p className="mt-5" style={{ fontFamily: SERIF_ED, fontStyle: "italic", fontSize: 18, color: T.muted }}>
              {filtered.length} {filtered.length === 1 ? "result" : "results"} across the publication for <span style={{ color: T.ink }}>"{q}"</span>. Sorted by editorial relevance, not chronology.
            </p>
          </div>
        </Container>
      </section>

      {/* Body: facets + results */}
      <section className="relative z-10 py-14">
        <Container max={1100}>
          <div className="grid grid-cols-12 gap-10">
            {/* Facet sidebar */}
            <aside className="col-span-12 md:col-span-3">
              <div className="md:sticky md:top-6">
                <Eyebrow>Filter by section</Eyebrow>
                <ul className="mt-4 flex flex-col">
                  {FACETS.map((f) => {
                    const active = facet === f.k;
                    const disabled = f.n === 0;
                    return (
                      <li key={f.k}>
                        <button disabled={disabled} onClick={() => setFacet(f.k)} className="flex items-center justify-between w-full py-2.5 border-b" style={{
                          borderColor: T.rule, opacity: disabled ? 0.4 : 1,
                          fontFamily: SANS, fontSize: 13.5,
                          color: active ? T.ink : T.inkSoft, fontWeight: active ? 600 : 400,
                        }}>
                          <span className="flex items-center gap-2">
                            {active && <span style={{ width: 6, height: 6, background: T.accent, borderRadius: 999 }} />}
                            {f.k}
                          </span>
                          <span style={{ fontFamily: MONO, fontSize: 11, color: T.mutedSoft }}>{String(f.n).padStart(2, "0")}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-10 p-5 border" style={{ borderColor: T.rule, background: T.paper2 }}>
                  <Eyebrow color={T.accent}>Search tips</Eyebrow>
                  <ul className="mt-3 flex flex-col gap-2.5" style={{ fontFamily: SERIF_ED, fontStyle: "italic", fontSize: 14.5, color: T.inkSoft, lineHeight: 1.5 }}>
                    <li>Try INCI names: <span style={{ fontFamily: MONO, fontStyle: "normal", fontSize: 12 }}>tocopherol</span> finds vitamin E.</li>
                    <li>Quote phrases: <span style={{ fontFamily: MONO, fontStyle: "normal", fontSize: 12 }}>"barrier repair"</span></li>
                    <li>Filter by tier: <span style={{ fontFamily: MONO, fontStyle: "normal", fontSize: 12 }}>tier:A retinol</span></li>
                    <li>Concern shorthand: <span style={{ fontFamily: MONO, fontStyle: "normal", fontSize: 12 }}>concern:melasma</span></li>
                  </ul>
                </div>
              </div>
            </aside>

            {/* Results list */}
            <div className="col-span-12 md:col-span-9">
              <div className="flex flex-col" style={{ borderTop: `1px solid ${T.rule}` }}>
                {filtered.map((r, i) => (
                  <a key={r.title} href="#" className="grid grid-cols-12 gap-6 py-8 border-b group" style={{ borderColor: T.rule }}>
                    <div className="col-span-12 md:col-span-2">
                      <span style={{ fontFamily: MONO, fontSize: 11, color: T.mutedSoft, letterSpacing: "0.1em" }}>
                        {String(i + 1).padStart(2, "0")} ·
                      </span>
                      <p className="mt-1" style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", color: KIND_TINT[r.kind], textTransform: "uppercase" }}>
                        {r.kind}
                      </p>
                      {r.tier && <div className="mt-2"><TierBadge tier={r.tier} /></div>}
                    </div>
                    <div className="col-span-12 md:col-span-10">
                      <h3 style={{ fontFamily: SERIF, fontSize: 28, lineHeight: 1.15, letterSpacing: "-0.02em", fontWeight: 400, color: T.ink }}>
                        {r.title}
                      </h3>
                      <p className="mt-3" style={{ fontFamily: SERIF_ED, fontSize: 17.5, lineHeight: 1.55, color: T.inkSoft }}
                        dangerouslySetInnerHTML={{ __html: r.snippet.replace(/<mark>/g, `<mark style="background:${T.accent}22; color:${T.ink}; padding:0 2px;">`) }} />
                      <div className="mt-4 flex items-center gap-4">
                        <span style={{ fontFamily: MONO, fontSize: 10.5, color: T.mutedSoft, letterSpacing: "0.06em" }}>/{r.href}</span>
                        <span style={{ color: T.rule }}>·</span>
                        <span style={{ fontFamily: SANS, fontSize: 12, color: T.muted }}>{r.meta}</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              <div className="flex items-center justify-between pt-10">
                <span style={{ fontFamily: MONO, fontSize: 11, color: T.mutedSoft, letterSpacing: "0.08em" }}>SHOWING 01–{String(filtered.length).padStart(2, "0")} OF {String(filtered.length).padStart(2, "0")}</span>
                <a href="#" style={{ fontFamily: SANS, fontSize: 13, color: T.accent, fontWeight: 500 }} className="inline-flex items-center gap-2">
                  Subscribe to a saved search for "{q}" <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Asterism />

      {/* What we don't index */}
      <section className="relative z-10 py-16 border-t" style={{ borderColor: T.rule, background: T.paper2 }}>
        <Container max={920}>
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-4">
              <Eyebrow>What this search doesn't return</Eyebrow>
            </div>
            <div className="col-span-12 md:col-span-8">
              <p style={{ fontFamily: SERIF_ED, fontStyle: "italic", fontSize: 22, lineHeight: 1.5, color: T.ink }}>
                Sponsored placements, affiliate offers, paid review beds. There aren't any in the index because there aren't any in the publication.
              </p>
              <p className="mt-4" style={{ fontFamily: SANS, fontSize: 13.5, color: T.muted, lineHeight: 1.6 }}>
                Looking for something we haven't covered yet? <a href="#" style={{ color: T.accent, fontWeight: 500 }}>Suggest a topic to the editors</a> — readers shape the next four issues.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <div className="absolute left-8 top-[60vh] z-0 hidden lg:block"><AmbientFlask size={260} opacity={0.04} /></div>

      <SiteFooter />
    </div>
  );
};

export default SearchResults;
