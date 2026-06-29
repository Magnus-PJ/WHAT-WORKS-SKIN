import React, { useState, useMemo } from "react";
import { ArrowRight, Filter, X } from "lucide-react";
import { T, tierColor, tierBg } from "./_theme";
import { SiteHeader, SiteFooter, Breadcrumbs, Container, Eyebrow, Folio, PaperGrain, LaidPaper, ColumnRules, TopVignette, Asterism, AmbientFlask, SERIF, SERIF_ED, SANS, MONO } from "./_chrome";
import { ingredientHrefFor, ingredientNameFor } from "./_links";
import { getUnreviewedShelfProducts, type UnreviewedMention } from "./_unreviewedShelf";
import { INGREDIENT_ROWS, type IngredientRow } from "./_ingredientCatalogue";

// Display-ready ingredient row used by this hub. The row data lives in
// `_ingredientCatalogue.ts` (the single source of truth shared with
// the search registry); names come from the shared `INGREDIENTS` map
// in `_links.tsx` via `ingredientNameFor`.
type Ing = IngredientRow & { name: string };

const ING: Ing[] = INGREDIENT_ROWS.map((m) => ({
  ...m,
  name: ingredientNameFor(m.slug) ?? m.slug,
}));

const VIEWS = [
  { k: "concern", l: "Concern" },
  { k: "fnClass", l: "Functional class" },
  { k: "tier", l: "Tier" },
] as const;

const SEARCHES = [
  "retinol for beginners", "retinol vs retinal", "retinol purge", "retinol 0.3 vs 0.5",
  "tretinoin for acne", "tretinoin 0.025 vs 0.05", "niacinamide vs vitamin c",
  "bakuchiol vs retinol", "vitamin c forms", "azelaic acid for rosacea",
  "salicylic acid pH", "adapalene vs tretinoin",
];

const TRENDING = ING.filter((i) => i.trending).sort((a, b) => (a.trending! - b.trending!)).slice(0, 5);

// Slug → ingredient page URL is sourced from the shared catalogue
// (`_links.ts`) so adding a new ingredient page only requires one edit.
const linkFor = (slug: string) => ingredientHrefFor(slug) ?? "#";

const IngredientIndex: React.FC = () => {
  const [view, setView] = useState<"concern" | "fnClass" | "tier">("concern");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const groups = useMemo(() => {
    const g: Record<string, Ing[]> = {};
    for (const ing of ING) {
      const key = ing[view];
      if (!g[key]) g[key] = [];
      g[key].push(ing);
    }
    if (view === "tier") {
      return Object.entries(g).sort(([a], [b]) => a.localeCompare(b));
    }
    return Object.entries(g).sort(([, a], [, b]) => b.length - a.length);
  }, [view]);

  const visibleGroups = activeFilter ? groups.filter(([k]) => k === activeFilter) : groups;

  return (
    <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
      <LaidPaper />
      <SiteHeader active="Ingredients" />
      <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Ingredient library" }]} />

      {/* ─── HUB HERO ───────────────────────────────────────────────── */}
      <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
        <TopVignette />
        <PaperGrain />
        <ColumnRules opacity={0.35} />
        <div aria-hidden className="absolute -right-20 -top-10 z-0"><AmbientFlask size={520} opacity={0.06} /></div>
        <Container>
          <div className="relative grid grid-cols-12 gap-10 py-24">
            {/* Vertical marginalia */}
            <div className="absolute left-0 top-24 bottom-24 hidden lg:flex flex-col items-center justify-between" style={{ width: 24 }}>
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                SECTION 01 / LIBRARY
              </span>
              <div className="h-px w-3" style={{ background: T.rule }} />
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                {ING.length} ENTRIES
              </span>
            </div>

            <div className="col-span-12 lg:col-span-8 lg:pl-12">
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
                <Eyebrow color={T.accent}>The Ingredient Library · 30 Actives Graded</Eyebrow>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>P. 02 · INDEX</div>
              </div>

              <h1 className="mt-10" style={{ fontFamily: SERIF, fontSize: 108, lineHeight: 0.93, letterSpacing: "-0.045em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
                Start with the <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>molecule.</span>
              </h1>

              <p className="mt-10 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>
                Your skin doesn't need more products. It needs the right actives. Every ingredient below is graded under the same public rubric — no brand access, no honorariums, no hand-waving.
              </p>

              <div className="mt-10 grid grid-cols-4 gap-6 border-t pt-8 max-w-2xl" style={{ borderColor: T.rule }}>
                {[
                  ["30+", "actives graded"],
                  ["17", "Tier A"],
                  ["38yr", "longest data"],
                  ["v1.0", "method"],
                ].map(([k, v]) => (
                  <div key={k as string}>
                    <div style={{ fontFamily: SERIF, fontSize: 30, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144', letterSpacing: "-0.02em", color: T.ink }}>{k}</div>
                    <div className="mt-2" style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.04em", color: T.muted, textTransform: "uppercase" }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Methodology aside */}
            <aside className="col-span-12 lg:col-span-4 lg:flex lg:items-end">
              <div className="border p-7 w-full" style={{ borderColor: T.rule, background: T.paper2 }}>
                <Eyebrow>How a grade is set</Eyebrow>
                <ol className="mt-5 space-y-3" style={{ fontFamily: SANS, fontSize: 13, color: T.inkSoft, lineHeight: 1.55 }}>
                  {[
                    ["Evidence", "RCTs and meta-analyses weight heaviest."],
                    ["Concentration", "Is it at the dose proven to work?"],
                    ["Delivery", "Does the formula get it into skin?"],
                    ["Safety", "Does the label match what regulators allow?"],
                  ].map(([k, v], i) => (
                    <li key={k} className="flex gap-3 items-baseline">
                      <span style={{ fontFamily: MONO, fontSize: 10, color: T.mutedSoft, letterSpacing: "0.08em" }}>{String(i + 1).padStart(2, "0")}</span>
                      <span><strong style={{ color: T.ink, fontWeight: 600 }}>{k}.</strong> {v}</span>
                    </li>
                  ))}
                </ol>
                <a href="#" className="mt-5 inline-flex items-center gap-1.5" style={{ fontFamily: SANS, fontSize: 12.5, color: T.accent, textDecoration: "underline", textUnderlineOffset: 3 }}>
                  Read the full methodology <ArrowRight className="h-3 w-3" />
                </a>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {/* ─── TRENDING STRIP ─────────────────────────────────────────── */}
      <section className="relative z-10 py-16 border-b" style={{ borderColor: T.rule, background: T.paper2 }}>
        <Container>
          <div className="flex items-end justify-between border-b pb-5 mb-8" style={{ borderColor: T.rule }}>
            <div>
              <Eyebrow color={T.tierD}>Trending now</Eyebrow>
              <h2 className="mt-3" style={{ fontFamily: SERIF, fontSize: 36, fontWeight: 400, letterSpacing: "-0.02em", color: T.ink, fontVariationSettings: '"opsz" 144' }}>
                Most-searched <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>this month.</span>
              </h2>
            </div>
            <span style={{ fontFamily: MONO, fontSize: 10.5, color: T.mutedSoft, letterSpacing: "0.1em" }}>SOURCE · TIKTOK · GOOGLE TRENDS · INSTAGRAM</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-0 border" style={{ borderColor: T.rule }}>
            {TRENDING.map((ing, i) => (
              <a key={ing.slug} href={linkFor(ing.slug)} className="flex flex-col p-6 group" style={{ borderRight: i < TRENDING.length - 1 ? `1px solid ${T.rule}` : "none", background: T.paper }}>
                <div className="flex items-baseline justify-between mb-5">
                  <span style={{ fontFamily: SERIF, fontSize: 56, fontWeight: 400, color: T.tierD, letterSpacing: "-0.04em", lineHeight: 0.9, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ fontFamily: SANS, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.16em", color: tierColor(ing.tier), background: tierBg(ing.tier), border: `1px solid ${tierColor(ing.tier)}55`, padding: "2px 6px", borderRadius: 2 }}>
                    {ing.tier}
                  </span>
                </div>
                <h3 style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 400, color: T.ink, letterSpacing: "-0.015em", lineHeight: 1.2 }}>{ing.name}</h3>
                <p className="mt-2 flex-1" style={{ fontFamily: SANS, fontSize: 12, color: T.muted, lineHeight: 1.5 }}>{ing.concern}</p>
                <div className="mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition-all" style={{ fontFamily: SANS, fontSize: 11.5, color: T.accent }}>
                  Read <ArrowRight className="h-3 w-3" />
                </div>
              </a>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── FILTER BAR + GRID ──────────────────────────────────────── */}
      <section className="relative z-10 py-20 border-b" style={{ borderColor: T.rule }}>
        <Container>
          {/* View toggle */}
          <div className="flex flex-wrap items-end justify-between gap-6 mb-12 border-b pb-6" style={{ borderColor: T.rule }}>
            <div>
              <Eyebrow>The full library</Eyebrow>
              <h2 className="mt-3" style={{ fontFamily: SERIF, fontSize: 44, fontWeight: 400, letterSpacing: "-0.025em", color: T.ink, fontVariationSettings: '"opsz" 144', lineHeight: 1.05 }}>
                Browse by <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>{VIEWS.find((v) => v.k === view)?.l.toLowerCase()}.</span>
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <span style={{ fontFamily: MONO, fontSize: 10, color: T.mutedSoft, letterSpacing: "0.12em", textTransform: "uppercase" }}>View by</span>
              <div className="flex border" style={{ borderColor: T.ink }}>
                {VIEWS.map((v) => {
                  const active = view === v.k;
                  return (
                    <button
                      key={v.k}
                      onClick={() => { setView(v.k); setActiveFilter(null); }}
                      className="px-4 py-2"
                      style={{
                        fontFamily: SANS, fontSize: 12, fontWeight: active ? 600 : 500, letterSpacing: "0.02em",
                        color: active ? T.paper : T.ink, background: active ? T.ink : "transparent",
                        borderRight: v.k !== "tier" ? `1px solid ${T.ink}` : "none",
                      }}
                    >{v.l}</button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Filter chips */}
          <div className="mb-10 flex flex-wrap items-center gap-2">
            <Filter className="h-3.5 w-3.5" style={{ color: T.muted }} />
            <span style={{ fontFamily: MONO, fontSize: 10, color: T.mutedSoft, letterSpacing: "0.12em", textTransform: "uppercase", marginRight: 8 }}>Filter</span>
            {groups.map(([k, items]) => {
              const active = activeFilter === k;
              return (
                <button
                  key={k}
                  onClick={() => setActiveFilter(active ? null : k)}
                  className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5"
                  style={{
                    fontFamily: SANS, fontSize: 12,
                    color: active ? T.paper : T.inkSoft,
                    background: active ? T.ink : "transparent",
                    borderColor: active ? T.ink : T.rule,
                  }}
                >
                  <span>{k}</span>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: active ? T.paper : T.mutedSoft, opacity: 0.8 }}>{items.length}</span>
                </button>
              );
            })}
            {activeFilter && (
              <button onClick={() => setActiveFilter(null)} className="inline-flex items-center gap-1" style={{ fontFamily: SANS, fontSize: 11.5, color: T.accent }}>
                <X className="h-3 w-3" /> clear
              </button>
            )}
          </div>

          {/* Grouped grid */}
          <div className="space-y-16">
            {visibleGroups.map(([groupName, items]) => (
              <div key={groupName}>
                <div className="flex items-end justify-between mb-6 border-b pb-3" style={{ borderColor: T.rule }}>
                  <div className="flex items-baseline gap-4">
                    <h3 style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 400, letterSpacing: "-0.02em", color: T.ink, lineHeight: 1, fontVariationSettings: '"opsz" 144' }}>{groupName}</h3>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: T.mutedSoft, letterSpacing: "0.08em" }}>{items.length} ENTRIES</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0 border-l border-t" style={{ borderColor: T.rule }}>
                  {items.map((ing) => (
                    <a key={ing.slug} href={linkFor(ing.slug)} className="group flex flex-col p-5 border-r border-b" style={{ borderColor: T.rule, background: T.paper }}>
                      <div className="flex items-start justify-between">
                        <span style={{
                          fontFamily: SERIF, fontSize: 44, fontWeight: 400, color: tierColor(ing.tier),
                          letterSpacing: "-0.04em", lineHeight: 0.9, fontVariationSettings: '"opsz" 144, "SOFT" 30',
                        }}>{ing.tier}</span>
                        <ArrowRight className="h-3.5 w-3.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: T.muted }} />
                      </div>
                      <h4 className="mt-4" style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 500, color: T.ink, letterSpacing: "-0.005em", lineHeight: 1.2 }}>{ing.name}</h4>
                      <div className="mt-1.5" style={{ fontFamily: MONO, fontSize: 9.5, color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                        {ing.fnClass}
                      </div>
                      <p className="mt-3 flex-1" style={{ fontFamily: SANS, fontSize: 12.5, color: T.muted, lineHeight: 1.5 }}>{ing.blurb}</p>
                      {ing.usedIn > 0 && (
                        <div className="mt-4 pt-3 border-t" style={{ borderColor: T.ruleSoft, fontFamily: SANS, fontSize: 11, color: T.accent, letterSpacing: "0.02em" }}>
                          Used in {ing.usedIn} product{ing.usedIn === 1 ? "" : "s"}
                        </div>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── EDITOR'S SHORTLIST (pull spread) ───────────────────────── */}
      <section className="relative z-10 py-24 border-b" style={{ borderColor: T.rule, background: T.ink, color: T.paper }}>
        <Container narrow>
          <Eyebrow color={T.accent}>Editor's shortlist</Eyebrow>
          <h2 className="mt-5" style={{ fontFamily: SERIF, fontSize: 64, fontWeight: 400, letterSpacing: "-0.03em", lineHeight: 1.04, color: T.paper, fontVariationSettings: '"opsz" 144' }}>
            If you can only buy <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>five things —</span>
          </h2>
          <p className="mt-6 max-w-xl" style={{ fontFamily: SANS, fontSize: 15, color: "#c8c5be", lineHeight: 1.6 }}>
            From thirty graded actives, this is the shortlist Dr. Paul builds his own routine on. Different skin, same five.
          </p>
          <ol className="mt-12 space-y-4">
            {[
              ["A retinoid", "Tretinoin or retinol — non-negotiable for photoaging."],
              ["A vitamin C", "L-ascorbic 10–20% in the morning. Antioxidant insurance."],
              ["A modern sunscreen", "Long-UVA filter, SPF 30+. The single highest-impact step."],
              ["A barrier moisturiser", "Ceramide-led. Glue for everything else."],
              ["One concern-specific active", "Niacinamide, azelaic, or tranexamic — pick your battle."],
            ].map(([t, b], i) => (
              <li key={t} className="flex items-baseline gap-6 border-b pb-4" style={{ borderColor: "#2a2c33" }}>
                <span style={{ fontFamily: SERIF, fontSize: 44, color: T.accent, fontWeight: 400, letterSpacing: "-0.04em", lineHeight: 1, fontVariationSettings: '"opsz" 144' }}>0{i + 1}</span>
                <div>
                  <h3 style={{ fontFamily: SERIF, fontSize: 24, color: T.paper, fontWeight: 400, letterSpacing: "-0.015em" }}>{t}</h3>
                  <p className="mt-1" style={{ fontFamily: SANS, fontSize: 13.5, color: "#9a9890", lineHeight: 1.55 }}>{b}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* ─── PEOPLE ALSO SEARCH ─────────────────────────────────────── */}
      <section className="relative z-10 py-20 border-b" style={{ borderColor: T.rule, background: T.paper2 }}>
        <Container>
          <div className="flex items-end justify-between border-b pb-5 mb-8" style={{ borderColor: T.rule }}>
            <div>
              <Eyebrow>People also search for</Eyebrow>
              <h3 className="mt-3" style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 400, letterSpacing: "-0.02em", color: T.ink, fontVariationSettings: '"opsz" 144' }}>
                The questions <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>everyone</span> arrives with.
              </h3>
            </div>
            <Folio n="P. 03" />
          </div>
          <div className="flex flex-wrap gap-2">
            {SEARCHES.map((q) => (
              <a key={q} href="#" className="rounded-full border px-4 py-2" style={{ borderColor: T.rule, fontFamily: SANS, fontSize: 13, color: T.inkSoft, background: T.paper }}>
                {q}
              </a>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── EDITOR'S REVIEW BACKLOG ───────────────────────────────── */}
      <EditorBacklog />

      {/* ─── NEXT UP ───────────────────────────────────────────────── */}
      <section className="relative z-10 py-16" style={{ background: T.paper }}>
        <Container>
          <a href="#" className="flex items-center justify-between p-8 border" style={{ borderColor: T.ink }}>
            <div>
              <Eyebrow color={T.accent}>Continue reading</Eyebrow>
              <h3 className="mt-2" style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 400, letterSpacing: "-0.02em", color: T.ink }}>
                Into the <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>products →</span>
              </h3>
              <p className="mt-2" style={{ fontFamily: SANS, fontSize: 13.5, color: T.muted }}>31 scored products, sorted by evidence — not by budget.</p>
            </div>
            <div className="inline-flex items-center gap-2 px-5 py-3" style={{ background: T.ink, color: T.paper, fontFamily: SANS, fontSize: 13, fontWeight: 500 }}>
              Product analyses <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </a>
        </Container>
      </section>

      <SiteFooter />
    </div>
  );
};

// Per-source visual marker for the mention chips, so the editor can
// tell at a glance whether the citation comes from an ingredient brief,
// a routine, or a concern guide.
const KIND_MARKER: Record<UnreviewedMention["kind"], { label: string; tone: string }> = {
  ingredient: { label: "ING", tone: T.accent },
  routine:    { label: "RTN", tone: T.tierA },
  concern:    { label: "CNC", tone: T.tierD },
};

const MentionChip: React.FC<{ mention: UnreviewedMention }> = ({ mention }) => {
  const marker = KIND_MARKER[mention.kind];
  const chip = (
    <span
      className="inline-flex items-center gap-1.5"
      style={{ fontFamily: SANS, fontSize: 11, color: T.inkSoft, background: T.paper2, border: `1px solid ${T.ruleSoft}`, padding: "2px 8px", borderRadius: 999 }}
    >
      <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.1em", color: marker.tone }}>{marker.label}</span>
      <span>{mention.label}</span>
    </span>
  );
  return mention.href ? (
    <a href={mention.href} style={{ textDecoration: "none" }}>{chip}</a>
  ) : (
    chip
  );
};

// Editor-facing review backlog. Lists every brand/name pair recommended
// on the site's editorial pages — ingredient briefs, routines, and
// concern guides — that still has no catalogue page so the desk can
// prioritise reviews.
const EditorBacklog: React.FC = () => {
  const gaps = useMemo(() => getUnreviewedShelfProducts(), []);
  if (gaps.length === 0) return null;

  return (
    <section className="relative z-10 py-20 border-t border-b" style={{ borderColor: T.rule, background: T.paper2 }}>
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6 border-b pb-5 mb-8" style={{ borderColor: T.rule }}>
          <div>
            <Eyebrow color={T.tierD}>Editor's desk · review backlog</Eyebrow>
            <h2 className="mt-3" style={{ fontFamily: SERIF, fontSize: 36, fontWeight: 400, letterSpacing: "-0.02em", color: T.ink, fontVariationSettings: '"opsz" 144' }}>
              Mentioned on our shelves <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>but not yet reviewed.</span>
            </h2>
            <p className="mt-3 max-w-2xl" style={{ fontFamily: SANS, fontSize: 13.5, color: T.muted, lineHeight: 1.6 }}>
              Internal queue. Every product our ingredient briefs, routines, and concern guides recommend that does not yet resolve to a detail page — sorted by how many editorial pages cite it, so the highest-leverage reviews float to the top.
            </p>
          </div>
          <div className="flex items-baseline gap-3">
            <span style={{ fontFamily: SERIF, fontSize: 44, color: T.ink, fontVariationSettings: '"opsz" 144', letterSpacing: "-0.03em", lineHeight: 1 }}>{gaps.length}</span>
            <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.mutedSoft, textTransform: "uppercase" }}>open · {gaps.reduce((n, g) => n + g.mentions.length, 0)} mentions</span>
          </div>
        </div>

        <div className="border-l border-t" style={{ borderColor: T.rule }}>
          <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-r border-b items-baseline" style={{ borderColor: T.rule, background: T.paper, fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.14em", color: T.mutedSoft, textTransform: "uppercase" }}>
            <div className="col-span-3">Brand</div>
            <div className="col-span-5">Product</div>
            <div className="col-span-3">Cited on</div>
            <div className="col-span-1 text-right">×</div>
          </div>
          {gaps.map((g) => (
            <div key={`${g.brand}|${g.name}`} className="grid grid-cols-12 gap-4 px-5 py-4 border-r border-b items-baseline" style={{ borderColor: T.rule, background: T.paper }}>
              <div className="col-span-12 md:col-span-3" style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 600, letterSpacing: "0.14em", color: T.muted, textTransform: "uppercase" }}>
                {g.brand}
              </div>
              <div className="col-span-12 md:col-span-5" style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.3, color: T.ink, fontVariationSettings: '"opsz" 144' }}>
                {g.name}
              </div>
              <div className="col-span-10 md:col-span-3 flex flex-wrap gap-1.5">
                {g.mentions.map((m) => (
                  <MentionChip key={m.key} mention={m} />
                ))}
              </div>
              <div className="col-span-2 md:col-span-1 text-right" style={{ fontFamily: SERIF, fontSize: 22, color: T.accent, fontVariationSettings: '"opsz" 144', letterSpacing: "-0.02em" }}>
                {g.mentions.length}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default IngredientIndex;
