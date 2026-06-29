// RoutineIndex — browse all editorial routines, organised by goal / time / skin type.
import React, { useState, useMemo } from "react";
import { ArrowRight, Sun, Moon, Sparkles, Clock } from "lucide-react";
import { T, tierColor } from "./_theme";
import {
  SiteHeader, SiteFooter, Breadcrumbs, Container, Eyebrow, Folio, TierBadge,
  PaperGrain, LaidPaper, ColumnRules, TopVignette, Asterism, AmbientFlask,
  SERIF, SERIF_ED, SANS, MONO,
} from "./_chrome";
import { ROUTINE_ROWS, routineHrefFor, type RoutineRow } from "./_routineCatalogue";

// Routine rows live in `_routineCatalogue.ts` (the single source of
// truth shared with the search registry).
type R = RoutineRow;

const ROUTINES: R[] = ROUTINE_ROWS;

const GOALS = ["Pigmentation", "Acne", "Anti-aging", "Sensitive", "Pregnancy", "Recovery"];
const TIMES = ["Morning", "Evening", "Weekly"] as const;

const FEATURED = ROUTINES.filter(r => r.featured).sort((a, b) => a.featured! - b.featured!);

const linkFor = (slug: string) => routineHrefFor(slug) ?? "#";

const RoutineIndex: React.FC = () => {
  const [goalFilter, setGoalFilter] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<string | null>(null);

  const visible = useMemo(() => ROUTINES.filter(r =>
    (!goalFilter || r.goal === goalFilter) && (!timeFilter || r.time === timeFilter)
  ), [goalFilter, timeFilter]);

  const grouped = useMemo(() => {
    const g: Record<string, R[]> = {};
    for (const r of visible) {
      if (!g[r.goal]) g[r.goal] = [];
      g[r.goal].push(r);
    }
    return Object.entries(g);
  }, [visible]);

  return (
    <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
      <LaidPaper />
      <SiteHeader active="Routines" />
      <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Routines" }]} />

      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
        <TopVignette />
        <PaperGrain />
        <ColumnRules opacity={0.32} />
        <div aria-hidden className="absolute -right-24 -top-12 z-0"><AmbientFlask size={520} opacity={0.06} /></div>

        <Container>
          <div className="relative grid grid-cols-12 gap-10 py-24">
            <div className="absolute left-0 top-24 bottom-24 hidden lg:flex flex-col items-center justify-between" style={{ width: 24 }}>
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>SECTION 04 / PROTOCOLS</span>
              <div className="h-px w-3" style={{ background: T.rule }} />
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>{ROUTINES.length} ROUTINES</span>
            </div>

            <div className="col-span-12 lg:col-span-8 lg:pl-12">
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
                <Eyebrow color={T.accent}>The Routine Library · {ROUTINES.length} Editorial Protocols</Eyebrow>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>P. 07 · LIBRARY</div>
              </div>

              <h1 className="mt-10" style={{ fontFamily: SERIF, fontSize: 108, lineHeight: 0.93, letterSpacing: "-0.045em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
                Routines, <br />
                <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>not collections.</span>
              </h1>

              <p className="mt-10 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>
                Every protocol on this page has been built around a goal, ordered by chemistry, and reviewed by one of our editors. No "here are nine serums you'll never use." Pick the one that matches your skin and your time.
              </p>
            </div>

            <aside className="col-span-12 lg:col-span-4 lg:flex lg:items-end">
              <div className="border p-7 w-full" style={{ borderColor: T.rule, background: T.paper2 }}>
                <Eyebrow>Choosing a routine</Eyebrow>
                <ol className="mt-5 space-y-3" style={{ fontFamily: SANS, fontSize: 13, color: T.inkSoft, lineHeight: 1.55 }}>
                  {[
                    ["Pick the goal", "Not the brand or the trend."],
                    ["Pick the time", "AM and PM solve different problems."],
                    ["Match your skin type", "Substitutions are listed in every routine."],
                    ["Stay 12 weeks", "Anything earlier is noise."],
                  ].map(([k, v], i) => (
                    <li key={k} className="flex gap-3 items-baseline">
                      <span style={{ fontFamily: MONO, fontSize: 10, color: T.mutedSoft, letterSpacing: "0.08em" }}>{String(i + 1).padStart(2, "0")}</span>
                      <span><strong style={{ color: T.ink, fontWeight: 600 }}>{k}.</strong> {v}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {/* ─── FEATURED FOUR ────────────────────────────────────────── */}
      <section className="relative z-10 py-16 border-b" style={{ borderColor: T.rule, background: T.paper2 }}>
        <Container>
          <div className="flex items-end justify-between border-b pb-5 mb-10" style={{ borderColor: T.rule }}>
            <div>
              <Eyebrow color={T.tierD}>The editor's four</Eyebrow>
              <h2 className="mt-3" style={{ fontFamily: SERIF, fontSize: 40, fontWeight: 400, letterSpacing: "-0.025em", color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
                Most-prescribed <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>this season.</span>
              </h2>
            </div>
            <span style={{ fontFamily: MONO, fontSize: 10.5, color: T.mutedSoft, letterSpacing: "0.1em" }}>QUARTER · Q2 2026</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border-l border-t" style={{ borderColor: T.rule }}>
            {FEATURED.map((r, i) => (
              <a key={r.slug} href={linkFor(r.slug)} className="flex flex-col p-7 border-r border-b" style={{ borderColor: T.rule, background: T.paper }}>
                <div className="flex items-baseline justify-between mb-6">
                  <span style={{ fontFamily: SERIF, fontSize: 70, fontWeight: 400, color: T.tierD, lineHeight: 0.85, letterSpacing: "-0.04em", fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>{String(i + 1).padStart(2, "0")}</span>
                  <span className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1" style={{ background: r.time === "Morning" ? T.accentSoft : r.time === "Evening" ? "#1112140e" : "#fff7e6", color: r.time === "Evening" ? T.ink : T.accent, fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                    {r.time === "Morning" ? <Sun className="h-2.5 w-2.5" /> : r.time === "Evening" ? <Moon className="h-2.5 w-2.5" /> : <Sparkles className="h-2.5 w-2.5" />}
                    {r.time}
                  </span>
                </div>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.18em", color: T.muted, textTransform: "uppercase" }}>{r.goal}</div>
                <h3 className="mt-2" style={{ fontFamily: SERIF, fontSize: 22, lineHeight: 1.2, fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144' }}>{r.title}</h3>
                <p className="mt-3" style={{ fontFamily: SERIF, fontSize: 14.5, color: T.muted, fontStyle: "italic", lineHeight: 1.5 }}>{r.body}</p>
                <div className="mt-auto pt-6 flex items-baseline justify-between border-t" style={{ borderColor: T.ruleSoft }}>
                  <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.12em", color: T.muted }}>{r.steps} STEPS · {r.minutes} MIN</span>
                  <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.12em", color: T.muted }}>{r.cost}</span>
                </div>
              </a>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── BROWSE ────────────────────────────────────────────── */}
      <section className="relative z-10 py-20" style={{ background: T.paper }}>
        <Container>
          <div className="border-b pb-5 mb-10" style={{ borderColor: T.rule }}>
            <Eyebrow>The Full Library</Eyebrow>
            <h2 className="mt-3" style={{ fontFamily: SERIF, fontSize: 56, fontWeight: 400, letterSpacing: "-0.03em", color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30', lineHeight: 1 }}>
              Browse by <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>goal.</span>
            </h2>
          </div>

          {/* Filter bars */}
          <div className="space-y-4 mb-12">
            <div className="flex flex-wrap items-center gap-2">
              <span style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.16em", color: T.muted, textTransform: "uppercase", fontWeight: 600, marginRight: 6, minWidth: 60 }}>Goal</span>
              {GOALS.map(g => {
                const active = goalFilter === g;
                return (
                  <button key={g} onClick={() => setGoalFilter(active ? null : g)} className="rounded-full border px-4 py-1.5" style={{ borderColor: active ? T.ink : T.rule, color: active ? T.paper : T.inkSoft, background: active ? T.ink : "transparent", fontFamily: SANS, fontSize: 12 }}>
                    {g}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.16em", color: T.muted, textTransform: "uppercase", fontWeight: 600, marginRight: 6, minWidth: 60 }}>Time</span>
              {TIMES.map(t => {
                const active = timeFilter === t;
                return (
                  <button key={t} onClick={() => setTimeFilter(active ? null : t)} className="rounded-full border px-4 py-1.5 inline-flex items-center gap-1.5" style={{ borderColor: active ? T.ink : T.rule, color: active ? T.paper : T.inkSoft, background: active ? T.ink : "transparent", fontFamily: SANS, fontSize: 12 }}>
                    {t === "Morning" ? <Sun className="h-3 w-3" /> : t === "Evening" ? <Moon className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                    {t}
                  </button>
                );
              })}
              {(goalFilter || timeFilter) && (
                <button onClick={() => { setGoalFilter(null); setTimeFilter(null); }} style={{ fontFamily: SANS, fontSize: 12, color: T.accent, textDecoration: "underline", marginLeft: 6 }}>Clear all</button>
              )}
            </div>
          </div>

          {/* Grouped routines as editorial table */}
          {grouped.map(([goal, list]) => (
            <div key={goal} className="mb-16">
              <div className="flex items-baseline justify-between border-b pb-3 mb-4" style={{ borderColor: T.rule }}>
                <h3 style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 400, color: T.ink, letterSpacing: "-0.015em", fontVariationSettings: '"opsz" 144' }}>{goal}</h3>
                <span style={{ fontFamily: MONO, fontSize: 11, color: T.mutedSoft, letterSpacing: "0.14em" }}>{list.length} ROUTINE{list.length !== 1 && "S"}</span>
              </div>

              <div>
                {list.map((r, i) => (
                  <a key={r.slug} href={linkFor(r.slug)} className="grid grid-cols-12 gap-6 py-7 border-b group" style={{ borderColor: T.ruleSoft }}>
                    <div className="col-span-12 md:col-span-1 flex items-baseline">
                      <span style={{ fontFamily: SERIF, fontSize: 36, fontWeight: 400, color: T.accent, fontVariationSettings: '"opsz" 144, "SOFT" 30', letterSpacing: "-0.03em", lineHeight: 0.9 }}>{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <div className="col-span-12 md:col-span-6">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1 rounded-sm px-2 py-0.5" style={{ background: r.time === "Morning" ? T.accentSoft : r.time === "Evening" ? "#1112140e" : "#fff7e6", color: r.time === "Evening" ? T.ink : T.accent, fontFamily: MONO, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                          {r.time === "Morning" ? <Sun className="h-2 w-2" /> : r.time === "Evening" ? <Moon className="h-2 w-2" /> : <Sparkles className="h-2 w-2" />}
                          {r.time}
                        </span>
                        <span style={{ fontFamily: MONO, fontSize: 10, color: T.mutedSoft, letterSpacing: "0.12em", textTransform: "uppercase" }}>{r.skinType}</span>
                      </div>
                      <h4 style={{ fontFamily: SERIF, fontSize: 26, lineHeight: 1.15, fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144', letterSpacing: "-0.015em" }}>
                        {r.title}
                      </h4>
                      <p className="mt-2 max-w-xl" style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.55, color: T.muted, fontStyle: "italic" }}>{r.body}</p>
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.mutedSoft, textTransform: "uppercase" }}>Stats</div>
                      <div className="mt-2" style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft }}>{r.steps} steps</div>
                      <div style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft }}>{r.minutes} min · {r.cost}</div>
                      <div className="mt-1" style={{ fontFamily: SANS, fontSize: 11.5, color: T.muted }}>{r.difficulty}</div>
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.mutedSoft, textTransform: "uppercase" }}>Reviewed</div>
                      <div className="mt-2" style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, fontStyle: "italic" }}>{r.reviewer}</div>
                    </div>
                    <div className="col-span-12 md:col-span-1 md:flex md:items-center md:justify-end">
                      <span className="inline-flex items-center gap-1.5" style={{ fontFamily: SANS, fontSize: 12.5, color: T.accent, fontWeight: 500, letterSpacing: "0.02em" }}>
                        Read <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}

          {visible.length === 0 && (
            <div className="py-20 text-center" style={{ fontFamily: SERIF, fontSize: 18, color: T.muted, fontStyle: "italic" }}>
              No routines match. Try clearing a filter.
            </div>
          )}
        </Container>
      </section>

      {/* ─── METHODOLOGY CTA STRIP ────────────────────────────────── */}
      <section className="relative z-10 py-20 border-y" style={{ borderColor: T.rule, background: T.paper2 }}>
        <Container>
          <div className="grid grid-cols-12 gap-10 items-center">
            <div className="col-span-12 lg:col-span-8">
              <Eyebrow>How we build a routine</Eyebrow>
              <h2 className="mt-4" style={{ fontFamily: SERIF, fontSize: 44, lineHeight: 1.05, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', letterSpacing: "-0.025em", color: T.ink }}>
                Goal first, then chemistry, then <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>tolerance.</span>
              </h2>
              <p className="mt-5 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.6, color: T.inkSoft }}>
                Every protocol is reverse-engineered from a single outcome — fade pigment, control acne, recover from a procedure — using only the molecules with adequate evidence at the dose recommended.
              </p>
            </div>
            <div className="col-span-12 lg:col-span-4 lg:text-right">
              <a href="#" className="inline-flex items-center gap-2 px-6 py-4" style={{ background: T.ink, color: T.paper, fontFamily: SANS, fontSize: 13.5, fontWeight: 500 }}>
                Read the full methodology <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </Container>
      </section>

      <SiteFooter />
    </div>
  );
};

export default RoutineIndex;
