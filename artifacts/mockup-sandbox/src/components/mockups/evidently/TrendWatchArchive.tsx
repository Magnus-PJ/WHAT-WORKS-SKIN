import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import {
  SiteHeader, SiteFooter, Breadcrumbs, Container, Eyebrow, Folio, Asterism,
  TopVignette, LaidPaper, PaperGrain, AmbientFlask, SERIF, SERIF_ED, SANS, MONO,
} from "./_chrome";
import { T } from "./_theme";
import {
  TREND_WATCH_ISSUES,
  trendWatchHrefFor,
  type TrendWatchIssue,
  type Verdict,
} from "./_trendWatchCatalogue";

const VERDICT_COLOR: Record<Verdict, { c: string; bg: string }> = {
  "Holds up":    { c: T.tierA, bg: T.tierAsoft },
  "Partly true": { c: T.tierB, bg: T.tierBsoft },
  "Misleading":  { c: T.warning, bg: T.warningSoft },
  "Skip":        { c: T.tierD, bg: T.tierDsoft },
};

// Issues live in `_trendWatchCatalogue.ts` (the single source of truth
// shared with the search registry and the home-page Trend Watch
// ticker). We re-export `ISSUES` and `linkFor` so other modules (e.g.
// the homepage archive strip) render from the same list and resolve
// links through the same `TREND_WATCH_BUILT` lookup.
export type Issue = TrendWatchIssue;
export const ISSUES: Issue[] = TREND_WATCH_ISSUES;

const FILTERS = ["All", "Holds up", "Partly true", "Misleading", "Skip"] as const;

export const linkFor = (n: number) => trendWatchHrefFor(n) ?? "#";

// Cardinal number → English words for the hero headline ("Forty-six
// fortnightly issues."). The archive only ever shows the running issue
// count, so we cover 0–99 and fall back to digits beyond that.
const CARDINAL_ONES = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
];
const CARDINAL_TEENS = [
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
  "seventeen", "eighteen", "nineteen",
];
const CARDINAL_TENS = [
  "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety",
];
function cardinalWord(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n >= 100) return String(n);
  if (n < 10) return CARDINAL_ONES[n];
  if (n < 20) return CARDINAL_TEENS[n - 10];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return ones === 0 ? CARDINAL_TENS[tens] : `${CARDINAL_TENS[tens]}-${CARDINAL_ONES[ones]}`;
}
function capitalizeFirst(s: string): string {
  return s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1);
}

// Hero counts derived from the canonical catalogue so adding a new
// entry to `TREND_WATCH_ISSUES` automatically advances the eyebrow,
// headline, and stats strip.
const TOTAL_ISSUES = ISSUES.length;
const TOTAL_TRENDS_GRADED = ISSUES.reduce((sum, iss) => sum + iss.trends.length, 0);
const ISSUE_RANGE_UPPER = String(TOTAL_ISSUES).padStart(2, "0");
const ISSUE_COUNT_WORD = capitalizeFirst(cardinalWord(TOTAL_ISSUES));

// Year filter buttons are derived from the canonical catalogue so a new
// issue with a new year automatically grows the filter row — no edit
// here required. Sorted newest first, with "All" prepended.
const YEAR_FILTERS: Array<number | "All"> = [
  "All",
  ...Array.from(new Set(ISSUES.map((i) => i.year))).sort((a, b) => b - a),
];

const PAGE_SIZE = 6;

const TrendWatchArchive: React.FC = () => {
  const [year, setYear] = useState<number | "All">("All");
  const [filter, setFilter] = useState<typeof FILTERS[number]>("All");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      ISSUES.filter((i) => {
        if (year !== "All" && i.year !== year) return false;
        if (filter !== "All" && !i.trends.some((t) => t.verdict === filter)) return false;
        if (normalizedQuery === "") return true;
        return (
          i.headline.toLowerCase().includes(normalizedQuery) ||
          i.dek.toLowerCase().includes(normalizedQuery) ||
          i.signed.toLowerCase().includes(normalizedQuery) ||
          i.trends.some((t) => t.name.toLowerCase().includes(normalizedQuery))
        );
      }),
    [year, filter, normalizedQuery],
  );

  // Any time the filters change, jump back to page 1 so users don't get
  // stranded on a page that no longer exists in the new filtered slice.
  useEffect(() => {
    setPage(1);
  }, [year, filter, normalizedQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const visible = filtered.slice(pageStart, pageStart + PAGE_SIZE);
  const isFirstPage = safePage <= 1;
  const isLastPage = safePage >= totalPages;

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: T.paper, color: T.ink }}>
      <PaperGrain /><LaidPaper /><TopVignette />

      <SiteHeader active="Trend Watch" />
      <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Trend Watch", href: "#" }, { label: "Archive" }]} />

      {/* Hero */}
      <section className="relative z-10 border-b" style={{ borderColor: T.rule, background: `linear-gradient(180deg, ${T.paper2} 0%, ${T.paper} 100%)` }}>
        <Container>
          <div className="flex items-start justify-between py-14">
            <div className="max-w-3xl">
              <Eyebrow color={T.accent}>The Trend Watch · Issues 01–{ISSUE_RANGE_UPPER}</Eyebrow>
              <h1 className="mt-4" style={{ fontFamily: SERIF, fontSize: 86, lineHeight: 0.98, letterSpacing: "-0.035em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144' }}>
                {ISSUE_COUNT_WORD} fortnightly issues.<br/>
                <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>One running ledger.</span>
              </h1>
              <p className="mt-6" style={{ fontFamily: SERIF_ED, fontStyle: "italic", fontSize: 22, lineHeight: 1.5, color: T.muted }}>
                Every trend we've covered since the column began, with the original verdict, the date, and a link back to the receipts. Search it, filter it, change your mind in public.
              </p>
            </div>
            <Folio n="P. 33 · ARCHIVE" />
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-10 border-t pt-6" style={{ borderColor: T.rule }}>
            {[
              { k: String(TOTAL_ISSUES), v: "Issues" },
              { k: String(TOTAL_TRENDS_GRADED), v: "Trends graded" },
              { k: "23%", v: "Verdicts revised since" },
              { k: "0", v: "Sponsorships" },
            ].map((s) => (
              <div key={s.v}>
                <p style={{ fontFamily: SERIF, fontSize: 44, lineHeight: 1, color: T.ink, fontVariationSettings: '"opsz" 144' }}>{s.k}</p>
                <p className="mt-1" style={{ fontFamily: SANS, fontSize: 12, color: T.muted, letterSpacing: "0.04em" }}>{s.v}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Filter bar */}
      <section className="relative z-10 sticky top-0 border-b backdrop-blur" style={{ borderColor: T.rule, background: `${T.paper}ee` }}>
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-6 py-4">
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: MONO, fontSize: 10.5, color: T.mutedSoft, letterSpacing: "0.1em", marginRight: 4 }}>VERDICT</span>
              {FILTERS.map((f) => (
                <button key={f} onClick={() => setFilter(f)} className="px-3 py-1.5" style={{
                  fontFamily: SANS, fontSize: 12, fontWeight: filter === f ? 600 : 400,
                  border: `1px solid ${filter === f ? T.ink : T.rule}`,
                  color: filter === f ? T.paper : T.inkSoft,
                  background: filter === f ? T.ink : "transparent",
                }}>{f}</button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: MONO, fontSize: 10.5, color: T.mutedSoft, letterSpacing: "0.1em", marginRight: 4 }}>YEAR</span>
              {YEAR_FILTERS.map((y) => (
                <button key={String(y)} onClick={() => setYear(y)} className="px-3 py-1.5" style={{
                  fontFamily: SANS, fontSize: 12, fontWeight: year === y ? 600 : 400,
                  border: `1px solid ${year === y ? T.ink : T.rule}`,
                  color: year === y ? T.paper : T.inkSoft,
                  background: year === y ? T.ink : "transparent",
                }}>{String(y)}</button>
              ))}
            </div>
            <div className="flex items-center gap-2 ml-auto px-3 py-1.5 border" style={{ borderColor: T.rule }}>
              <Search className="h-3.5 w-3.5" style={{ color: T.muted }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search archive…"
                className="bg-transparent outline-none w-44"
                style={{ fontFamily: SANS, fontSize: 12, color: T.ink }}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Issue ledger */}
      <section className="relative z-10 py-16">
        <Container>
          <div className="flex flex-col" style={{ borderTop: `1px solid ${T.rule}` }}>
            {visible.map((iss) => (
              <a key={iss.n} href={linkFor(iss.n)} className="grid grid-cols-12 gap-6 py-10 border-b group" style={{ borderColor: T.rule }}>
                <div className="col-span-12 md:col-span-2">
                  <p style={{ fontFamily: SERIF, fontSize: 64, lineHeight: 0.9, color: T.ink, fontVariationSettings: '"opsz" 144' }}>
                    № {String(iss.n).padStart(2, "0")}
                  </p>
                  <p className="mt-2" style={{ fontFamily: MONO, fontSize: 10.5, color: T.mutedSoft, letterSpacing: "0.08em" }}>{iss.date.toUpperCase()}</p>
                </div>
                <div className="col-span-12 md:col-span-7">
                  <h3 style={{ fontFamily: SERIF, fontSize: 28, lineHeight: 1.15, letterSpacing: "-0.02em", fontWeight: 400, color: T.ink }}>
                    {iss.headline}
                  </h3>
                  <p className="mt-3" style={{ fontFamily: SERIF_ED, fontStyle: "italic", fontSize: 17, lineHeight: 1.5, color: T.muted }}>
                    {iss.dek}
                  </p>
                  <p className="mt-4" style={{ fontFamily: MONO, fontSize: 10.5, color: T.mutedSoft, letterSpacing: "0.08em" }}>
                    SIGNED · {iss.signed.toUpperCase()}
                  </p>
                </div>
                <div className="col-span-12 md:col-span-3 flex flex-col gap-2">
                  {iss.trends.map((t) => {
                    const v = VERDICT_COLOR[t.verdict];
                    return (
                      <div key={t.name} className="flex items-center justify-between gap-3 px-3 py-2" style={{ background: T.paper2, border: `1px solid ${T.rule}` }}>
                        <span style={{ fontFamily: SANS, fontSize: 12, color: T.ink, lineHeight: 1.3 }}>{t.name}</span>
                        <span className="shrink-0" style={{
                          fontFamily: SANS, fontSize: 9.5, letterSpacing: "0.12em", fontWeight: 700,
                          color: v.c, background: v.bg, border: `1px solid ${v.c}55`,
                          padding: "2px 6px", borderRadius: 2, textTransform: "uppercase",
                        }}>{t.verdict}</span>
                      </div>
                    );
                  })}
                  <span className="inline-flex items-center gap-1 mt-2" style={{ fontFamily: SANS, fontSize: 12, color: T.accent, fontWeight: 500 }}>
                    Read the issue <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </a>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 pt-12" style={{ fontFamily: SANS, fontSize: 13 }}>
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={isFirstPage}
              aria-label="Newer issues"
              className="px-4 py-2"
              style={{
                border: `1px solid ${isFirstPage ? T.rule : T.ink}`,
                background: isFirstPage ? "transparent" : T.paper,
                color: isFirstPage ? T.mutedSoft : T.ink,
                cursor: isFirstPage ? "not-allowed" : "pointer",
                opacity: isFirstPage ? 0.6 : 1,
              }}
            >
              ← Newer
            </button>
            <span style={{ fontFamily: MONO, fontSize: 11, color: T.mutedSoft, letterSpacing: "0.08em" }}>
              PAGE {String(safePage).padStart(2, "0")} · OF {String(totalPages).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={isLastPage}
              aria-label="Older issues"
              className="px-4 py-2"
              style={{
                border: `1px solid ${isLastPage ? T.rule : T.ink}`,
                background: isLastPage ? "transparent" : T.ink,
                color: isLastPage ? T.mutedSoft : T.paper,
                cursor: isLastPage ? "not-allowed" : "pointer",
                opacity: isLastPage ? 0.6 : 1,
              }}
            >
              Older →
            </button>
          </div>
        </Container>
      </section>

      <Asterism />

      {/* Updates ledger */}
      <section className="relative z-10 py-16 border-t" style={{ borderColor: T.rule, background: T.paper2 }}>
        <Container max={920}>
          <Eyebrow>Verdicts we revised</Eyebrow>
          <h2 className="mt-3" style={{ fontFamily: SERIF, fontSize: 42, lineHeight: 1.05, letterSpacing: "-0.025em", color: T.ink, fontWeight: 400, fontVariationSettings: '"opsz" 144' }}>
            We change our minds <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>in public.</span>
          </h2>
          <p className="mt-4 max-w-2xl" style={{ fontFamily: SERIF_ED, fontStyle: "italic", fontSize: 18, lineHeight: 1.55, color: T.muted }}>
            Thirty-two of the verdicts above have been re-graded since the original issue ran. The original ruling stays visible; the new one sits next to it with its date and reasoning.
          </p>

          <div className="mt-8 flex flex-col">
            {[
              { trend: "Bakuchiol as 'pregnancy-safe retinol'", from: "Partly true (Iss. 04, Sep '25)", to: "Misleading (Iss. 11, Mar '26)", why: "New review questioned the comparator dose. We re-read it." },
              { trend: "Snail secretion filtrate", from: "Skip (Iss. 02, Aug '25)", to: "Partly true (Iss. 13, Apr '26)", why: "Two RCTs published since changed the calculus on hydration claims." },
              { trend: "Argireline (acetyl hexapeptide-8)", from: "Holds up (Iss. 01, Jul '25)", to: "Misleading (Iss. 03, Nov '25)", why: "Industry-funded studies dominated our original read. We weighted them too heavily." },
            ].map((u) => (
              <div key={u.trend} className="grid grid-cols-12 gap-6 py-5 border-t" style={{ borderColor: T.rule }}>
                <div className="col-span-12 md:col-span-4">
                  <p style={{ fontFamily: SERIF, fontSize: 19, color: T.ink, lineHeight: 1.25 }}>{u.trend}</p>
                </div>
                <div className="col-span-6 md:col-span-3" style={{ fontFamily: MONO, fontSize: 11, color: T.muted, letterSpacing: "0.06em" }}>
                  <p style={{ color: T.mutedSoft }}>WAS</p>
                  <p className="mt-1">{u.from}</p>
                </div>
                <div className="col-span-6 md:col-span-3" style={{ fontFamily: MONO, fontSize: 11, color: T.ink, letterSpacing: "0.06em" }}>
                  <p style={{ color: T.accent }}>NOW</p>
                  <p className="mt-1">{u.to}</p>
                </div>
                <div className="col-span-12 md:col-span-2">
                  <p style={{ fontFamily: SERIF_ED, fontStyle: "italic", fontSize: 13.5, color: T.muted, lineHeight: 1.45 }}>{u.why}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <div className="absolute right-12 top-[80vh] z-0 hidden lg:block"><AmbientFlask size={300} opacity={0.04} /></div>

      <SiteFooter />
    </div>
  );
};

export default TrendWatchArchive;
