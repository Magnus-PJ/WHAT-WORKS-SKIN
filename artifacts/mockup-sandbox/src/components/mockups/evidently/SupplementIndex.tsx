// SupplementIndex — every supplement we've reviewed, tier-graded by evidence.

import React, { useState, useMemo } from "react";
import { ArrowRight, Pill, AlertTriangle } from "lucide-react";
import { T, tierColor } from "./_theme";
import {
  SiteHeader, SiteFooter, Breadcrumbs, Container, Eyebrow, Folio, TierBadge,
  PaperGrain, LaidPaper, ColumnRules, TopVignette, Asterism, AmbientFlask,
  SERIF, SERIF_ED, SANS, MONO,
} from "./_chrome";
import {
  SUPPLEMENT_ROWS,
  SUPPLEMENT_BUILT,
  linkForSupplement,
  type SupplementRow,
} from "./_supplementCatalogue";

// Supplement rows live in `_supplementCatalogue.ts` (the single source
// of truth shared with the search registry and the home-page strip).
// We re-export `SUPPS` and `linkForSupplement` so the home page can
// keep importing them from this module unchanged.
export type S = SupplementRow;
export const SUPPS: S[] = SUPPLEMENT_ROWS;
export { SUPPLEMENT_BUILT, linkForSupplement };

const FAMILIES = ["Photoprotection", "Pigmentation", "Hair & nails", "Barrier & inflammation", "Trend Watch"];

const TRENDING = SUPPS.filter(s => s.trending).sort((a, b) => a.trending! - b.trending!).slice(0, 4);

const linkFor = linkForSupplement;

const SupplementIndex: React.FC = () => {
  const [filter, setFilter] = useState<string | null>(null);
  const [tierFilter, setTierFilter] = useState<"A" | "B" | "C" | "D" | null>(null);

  const grouped = useMemo(() => {
    const list = SUPPS.filter(s =>
      (!filter || s.family === filter) &&
      (!tierFilter || s.tier === tierFilter)
    );
    const g: Record<string, S[]> = {};
    for (const s of list) {
      if (!g[s.family]) g[s.family] = [];
      g[s.family].push(s);
    }
    return Object.entries(g);
  }, [filter, tierFilter]);

  return (
    <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
      <LaidPaper />
      <SiteHeader active="Supplements" />
      <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Supplements" }]} />

      {/* HERO */}
      <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
        <TopVignette />
        <PaperGrain />
        <ColumnRules opacity={0.32} />
        <div aria-hidden className="absolute -right-24 -top-12 z-0"><AmbientFlask size={520} opacity={0.06} /></div>

        <Container>
          <div className="relative grid grid-cols-12 gap-10 py-24">
            <div className="absolute left-0 top-24 bottom-24 hidden lg:flex flex-col items-center justify-between" style={{ width: 24 }}>
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>SECTION 06 / SUPPLEMENTS</span>
              <div className="h-px w-3" style={{ background: T.rule }} />
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>{SUPPS.length} REVIEWED</span>
            </div>

            <div className="col-span-12 lg:col-span-8 lg:pl-12">
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
                <Eyebrow color={T.accent}>The Supplement Library · Evidence-Graded</Eyebrow>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>P. 12 · INDEX</div>
              </div>

              <h1 className="mt-10" style={{ fontFamily: SERIF, fontSize: 108, lineHeight: 0.93, letterSpacing: "-0.045em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
                What's worth <br />
                <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>swallowing.</span>
              </h1>

              <p className="mt-10 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>
                Sixteen supplements. Each graded against the same evidence rubric we use for topicals — Tier A is "RCTs hold up at the recommended dose," Tier D is "marketing wearing a lab coat." We do not sell supplements. We do not earn affiliate revenue from them. This is the list we'd hand you in clinic.
              </p>
            </div>

            <aside className="col-span-12 lg:col-span-4 lg:flex lg:items-end">
              <div className="border p-7 w-full" style={{ borderColor: T.rule, background: T.paper2 }}>
                <Eyebrow>Three honest rules</Eyebrow>
                <ol className="mt-5 space-y-3" style={{ fontFamily: SANS, fontSize: 13, color: T.inkSoft, lineHeight: 1.55 }}>
                  {[
                    ["Test, don't guess.", "Iron, vitamin D, ferritin — bloodwork before supplementation."],
                    ["Topicals do most of the work.", "Almost no skin condition is solved orally first."],
                    ["Speak to your doctor.", "Anything Rx-only, in pregnancy, or interactions."],
                  ].map(([k, v], i) => (
                    <li key={k} className="flex gap-3 items-baseline">
                      <span style={{ fontFamily: MONO, fontSize: 10, color: T.mutedSoft, letterSpacing: "0.08em" }}>{String(i + 1).padStart(2, "0")}</span>
                      <span><strong style={{ color: T.ink, fontWeight: 600 }}>{k}</strong> {v}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {/* WARNING BAND */}
      <section className="relative z-10 border-b" style={{ borderColor: T.rule, background: "#fff7e6" }}>
        <Container>
          <div className="flex items-center gap-5 py-5">
            <AlertTriangle className="h-5 w-5 shrink-0" style={{ color: "#a16207" }} />
            <div style={{ fontFamily: SERIF, fontSize: 16, color: "#7c4a00", lineHeight: 1.55, fontStyle: "italic" }}>
              Editorial caveat: nothing on this page is medical advice. Supplement choices, particularly any Rx-only items below, must go through your physician.
            </div>
          </div>
        </Container>
      </section>

      {/* TIER LADDER STRIP */}
      <section className="relative z-10 py-16 border-b" style={{ borderColor: T.rule, background: T.paper2 }}>
        <Container>
          <div className="flex items-end justify-between border-b pb-5 mb-10" style={{ borderColor: T.rule }}>
            <div>
              <Eyebrow>The evidence ladder</Eyebrow>
              <h2 className="mt-3" style={{ fontFamily: SERIF, fontSize: 40, fontWeight: 400, letterSpacing: "-0.025em", color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
                Where each <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>tier sits.</span>
              </h2>
            </div>
            <span style={{ fontFamily: MONO, fontSize: 10.5, color: T.mutedSoft, letterSpacing: "0.1em" }}>RUBRIC v1.0</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border-l border-t" style={{ borderColor: T.rule }}>
            {([
              ["A", "Robust RCTs at the recommended dose. Practitioner consensus.", SUPPS.filter(s => s.tier === "A").length],
              ["B", "Smaller RCTs or strong observational data. Worth trialling.", SUPPS.filter(s => s.tier === "B").length],
              ["C", "Mixed or modest data. Try if low-cost and low-risk.", SUPPS.filter(s => s.tier === "C").length],
              ["D", "Marketing exceeds science. Skip.", SUPPS.filter(s => s.tier === "D").length],
            ] as const).map(([t, body, count]) => (
              <button key={t} onClick={() => setTierFilter(tierFilter === t ? null : t)} className="text-left flex flex-col p-7 border-r border-b" style={{ borderColor: T.rule, background: tierFilter === t ? T.paper2 : T.paper, outline: tierFilter === t ? `2px solid ${tierColor(t)}` : "none", outlineOffset: -2 }}>
                <div className="flex items-baseline justify-between">
                  <span style={{ fontFamily: SERIF, fontSize: 64, fontWeight: 400, color: tierColor(t), lineHeight: 0.85, letterSpacing: "-0.04em", fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>Tier {t}</span>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: T.mutedSoft, letterSpacing: "0.14em" }}>{count} ITEMS</span>
                </div>
                <p className="mt-5" style={{ fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.55, color: T.muted, fontStyle: "italic" }}>{body}</p>
              </button>
            ))}
          </div>
          {tierFilter && (
            <div className="mt-4">
              <button onClick={() => setTierFilter(null)} style={{ fontFamily: SANS, fontSize: 12, color: T.accent, textDecoration: "underline" }}>Clear tier filter</button>
            </div>
          )}
        </Container>
      </section>

      {/* THE LIBRARY */}
      <section className="relative z-10 py-20" style={{ background: T.paper }}>
        <Container>
          <div className="border-b pb-5 mb-10 flex flex-wrap items-end justify-between" style={{ borderColor: T.rule }}>
            <div>
              <Eyebrow>The Library</Eyebrow>
              <h2 className="mt-3" style={{ fontFamily: SERIF, fontSize: 56, fontWeight: 400, letterSpacing: "-0.03em", color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30', lineHeight: 1 }}>
                Browse by <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>family.</span>
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
              <div className="flex items-baseline justify-between border-b pb-3 mb-4" style={{ borderColor: T.rule }}>
                <h3 style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 400, color: T.ink, letterSpacing: "-0.015em", fontVariationSettings: '"opsz" 144' }}>{family}</h3>
                <span style={{ fontFamily: MONO, fontSize: 11, color: T.mutedSoft, letterSpacing: "0.14em" }}>{list.length} ITEM{list.length !== 1 && "S"}</span>
              </div>

              <div className="border" style={{ borderColor: T.rule }}>
                <div className="grid grid-cols-12 gap-3 px-5 py-3 border-b" style={{ borderColor: T.rule, background: T.paper2, fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.mutedSoft, textTransform: "uppercase" }}>
                  <div className="col-span-1">Tier</div>
                  <div className="col-span-4">Supplement</div>
                  <div className="col-span-2">Target</div>
                  <div className="col-span-2">Typical dose</div>
                  <div className="col-span-3">Editor's note</div>
                </div>
                {list.map(s => (
                  <a key={s.slug} href={linkFor(s.slug)} className="grid grid-cols-12 gap-3 px-5 py-5 items-center border-b" style={{ borderColor: T.ruleSoft }}>
                    <div className="col-span-1"><TierBadge tier={s.tier} /></div>
                    <div className="col-span-4">
                      <div className="flex items-center gap-2">
                        <span style={{ fontFamily: SERIF, fontSize: 18, color: T.ink, fontVariationSettings: '"opsz" 144', lineHeight: 1.25 }}>{s.name}</span>
                        {s.rxOnly && <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.12em", color: T.tierD, padding: "1.5px 5px", border: `1px solid ${T.tierD}`, borderRadius: 2 }}>RX</span>}
                      </div>
                    </div>
                    <div className="col-span-2" style={{ fontFamily: SANS, fontSize: 12.5, color: T.muted }}>{s.target}</div>
                    <div className="col-span-2" style={{ fontFamily: MONO, fontSize: 12, color: T.muted }}>{s.dose}</div>
                    <div className="col-span-3 flex items-center justify-between gap-3">
                      <span style={{ fontFamily: SERIF, fontSize: 14, color: T.inkSoft, fontStyle: "italic", lineHeight: 1.45 }}>{s.oneliner}</span>
                      <ArrowRight className="h-3 w-3 shrink-0" style={{ color: T.accent }} />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}

          {grouped.length === 0 && (
            <div className="py-20 text-center" style={{ fontFamily: SERIF, fontSize: 18, color: T.muted, fontStyle: "italic" }}>
              No supplements match. Try clearing a filter.
            </div>
          )}
        </Container>
      </section>

      {/* DARK SHORTLIST */}
      <section className="relative z-10 py-24 border-y" style={{ borderColor: T.rule, background: T.ink, color: T.paper }}>
        <Container>
          <div className="grid grid-cols-12 gap-10 mb-10 items-end">
            <div className="col-span-12 lg:col-span-8">
              <Eyebrow color={T.invertAccent}>The honest shortlist</Eyebrow>
              <h2 className="mt-5" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', letterSpacing: "-0.03em", color: T.paper }}>
                If you took <span style={{ fontStyle: "italic", color: T.invertAccent, fontFamily: SERIF_ED }}>nothing else.</span>
              </h2>
            </div>
            <div className="col-span-12 lg:col-span-4 lg:text-right" style={{ fontFamily: SERIF, fontSize: 16, color: T.invertMuted, fontStyle: "italic", lineHeight: 1.55 }}>
              "Five supplements with the best risk-benefit ratio for adult skin in 2026."
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-0 border-l border-t" style={{ borderColor: T.invertMuted + "55" }}>
            {[
              { slug: "omega-3", name: "Omega-3", note: "Inflammation baseline.", tier: "A" as const },
              { slug: "vitamin-d", name: "Vitamin D", note: "If your levels are low.", tier: "B" as const },
              { slug: "polypodium", name: "Polypodium", note: "If you have melasma or PLE.", tier: "B" as const },
              { slug: "collagen-peptides", name: "Collagen peptides", note: "Modest, replicated benefit.", tier: "B" as const },
              { slug: "iron", name: "Iron (when low)", note: "Test before supplementing.", tier: "A" as const },
            ].map((s, i) => (
              <a key={s.slug} href={linkFor(s.slug)} className="flex flex-col p-7 border-r border-b" style={{ borderColor: T.invertMuted + "55" }}>
                <span style={{ fontFamily: SERIF, fontSize: 60, fontWeight: 400, color: T.invertAccent, lineHeight: 0.9, fontVariationSettings: '"opsz" 144, "SOFT" 30', letterSpacing: "-0.04em" }}>0{i + 1}</span>
                <div className="mt-5" style={{ fontFamily: SERIF, fontSize: 21, color: T.paper, lineHeight: 1.2, fontVariationSettings: '"opsz" 144' }}>{s.name}</div>
                <p className="mt-3 mb-auto" style={{ fontFamily: SERIF, fontSize: 14, color: T.invertMuted, fontStyle: "italic", lineHeight: 1.5 }}>{s.note}</p>
                <div className="mt-6 flex items-baseline justify-between pt-4">
                  <TierBadge tier={s.tier} />
                  <ArrowRight className="h-3 w-3" style={{ color: T.invertAccent }} />
                </div>
              </a>
            ))}
          </div>
        </Container>
      </section>

      <SiteFooter />
    </div>
  );
};

export default SupplementIndex;
