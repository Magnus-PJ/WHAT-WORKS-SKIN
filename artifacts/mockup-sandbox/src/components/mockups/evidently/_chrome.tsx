import React from "react";
import { Search, Mail, ArrowRight, X, CornerDownLeft } from "lucide-react";
import { T, F } from "./_theme";
import { searchEntries, SEARCH_ENTRIES, type SearchEntry, type SearchKind } from "./_searchIndex";

export const SERIF = F.serif;
export const SERIF_ED = F.serifEd;
export const SANS = F.sans;
export const MONO = F.mono;

export const Eyebrow: React.FC<React.PropsWithChildren<{ color?: string; className?: string }>> = ({ children, color, className = "" }) => (
  <p className={`uppercase ${className}`} style={{ fontFamily: SANS, fontSize: 10.5, letterSpacing: "0.18em", fontWeight: 600, color: color || T.muted }}>{children}</p>
);

export const Folio: React.FC<React.PropsWithChildren<{ n?: string }>> = ({ n, children }) => (
  <div className="flex items-baseline gap-2" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", color: T.mutedSoft }}>
    <span>—</span><span>{n ?? children}</span>
  </div>
);

export const Wordmark: React.FC<{ size?: number }> = ({ size = 22 }) => (
  <span className="inline-flex items-baseline" style={{ fontFamily: SERIF, fontSize: size, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1 }}>
    <span style={{ color: T.ink }}>What&nbsp;Works</span>
    <span style={{ color: T.accent, fontStyle: "italic", marginLeft: size * 0.18 }}>Skin</span>
  </span>
);

export const TierBadge: React.FC<{ tier: string; size?: "sm" | "md" | "lg" }> = ({ tier, size = "sm" }) => {
  const c = ({ A: T.tierA, B: T.tierB, C: T.tierC, D: T.tierD } as Record<string, string>)[tier.toUpperCase()] || T.tierC;
  const bg = ({ A: T.tierAsoft, B: T.tierBsoft, C: T.tierCsoft, D: T.tierDsoft } as Record<string, string>)[tier.toUpperCase()] || T.tierCsoft;
  const sz = size === "lg" ? { fs: 12, p: "5px 12px" } : size === "md" ? { fs: 11, p: "4px 10px" } : { fs: 10, p: "3px 8px" };
  return (
    <span className="inline-flex items-center justify-center" style={{
      fontFamily: SANS, fontSize: sz.fs, letterSpacing: "0.16em", fontWeight: 700,
      color: c, background: bg, border: `1px solid ${c}55`, padding: sz.p, borderRadius: 2, textTransform: "uppercase",
    }}>Tier&nbsp;{tier.toUpperCase()}</span>
  );
};

export const Container: React.FC<React.PropsWithChildren<{ narrow?: boolean; max?: number }>> = ({ children, narrow, max }) => (
  <div className="mx-auto px-8" style={{ maxWidth: max || (narrow ? 920 : 1200) }}>{children}</div>
);

export const PaperGrain: React.FC = () => (
  <div aria-hidden className="pointer-events-none absolute inset-0 z-0" style={{
    opacity: 0.07, mixBlendMode: "multiply",
    backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
  }} />
);

// Faint horizontal "laid paper" lines — like cream printing stock
export const LaidPaper: React.FC = () => (
  <div aria-hidden className="pointer-events-none absolute inset-0 z-0" style={{
    opacity: 0.5, mixBlendMode: "multiply",
    backgroundImage: `repeating-linear-gradient(0deg, transparent 0px, transparent 23px, ${T.rule}22 23px, ${T.rule}22 24px)`,
  }} />
);

// 12-column hairline grid — sits behind heroes & long sections
export const ColumnRules: React.FC<{ cols?: number; opacity?: number }> = ({ cols = 12, opacity = 0.5 }) => (
  <div aria-hidden className="pointer-events-none absolute inset-0 z-0 mx-auto" style={{ maxWidth: 1200, opacity }}>
    <div className="grid h-full px-8" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, columnGap: 24 }}>
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} style={{ borderLeft: `1px solid ${T.rule}`, borderRight: i === cols - 1 ? `1px solid ${T.rule}` : "none" }} />
      ))}
    </div>
  </div>
);

// Warm vignette — top edge cream wash
export const TopVignette: React.FC = () => (
  <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-0" style={{
    height: 320, background: `linear-gradient(180deg, ${T.paper3} 0%, ${T.paper2} 38%, transparent 100%)`,
  }} />
);

// Asterism divider — classic editorial section break
export const Asterism: React.FC<{ color?: string }> = ({ color }) => (
  <div className="flex items-center justify-center gap-6 py-10">
    <div className="h-px w-24" style={{ background: T.rule }} />
    <span style={{ fontFamily: SERIF, fontSize: 22, color: color || T.muted, letterSpacing: "0.4em", lineHeight: 1, fontVariationSettings: '"opsz" 144' }}>⁂</span>
    <div className="h-px w-24" style={{ background: T.rule }} />
  </div>
);

// Engraved frame ornament — corner brackets
export const CornerBrackets: React.FC = () => (
  <>
    {[
      { top: 16, left: 16, rot: 0 },
      { top: 16, right: 16, rot: 90 },
      { bottom: 16, right: 16, rot: 180 },
      { bottom: 16, left: 16, rot: 270 },
    ].map((p, i) => (
      <div key={i} aria-hidden className="absolute z-0" style={{ ...p, width: 14, height: 14, transform: `rotate(${p.rot}deg)`, borderTop: `1px solid ${T.muted}`, borderLeft: `1px solid ${T.muted}` }} />
    ))}
  </>
);

// Faint chemistry illustration — used as ambient backdrop
export const AmbientFlask: React.FC<{ size?: number; opacity?: number }> = ({ size = 380, opacity = 0.05 }) => (
  <svg aria-hidden width={size} height={size} viewBox="0 0 200 200" style={{ opacity }}>
    <g fill="none" stroke={T.ink} strokeWidth="1.2">
      <path d="M80 30 L80 80 L50 150 Q50 180 100 180 Q150 180 150 150 L120 80 L120 30 Z" />
      <line x1="70" y1="30" x2="130" y2="30" strokeWidth="2" />
      <line x1="65" y1="115" x2="135" y2="115" strokeDasharray="2 4" />
      <circle cx="85" cy="145" r="3" />
      <circle cx="105" cy="155" r="2" />
      <circle cx="120" cy="140" r="4" />
    </g>
  </svg>
);

const KIND_TINT: Record<SearchKind, string> = {
  "Ingredient": T.accent,
  "Product": T.tierB,
  "Routine": T.tierC,
  "Concern": T.tierD,
  "Supplement": "#7c3aed",
  "Trend Watch": T.warning,
};

const TIER_TINT: Record<string, string> = { A: T.tierA, B: T.tierB, C: T.tierC, D: T.tierD };

type FilterDim = "kinds" | "families" | "tiers";
type Filters = { kinds: Set<string>; families: Set<string>; tiers: Set<string> };
const emptyFilters = (): Filters => ({ kinds: new Set(), families: new Set(), tiers: new Set() });
const filtersActive = (f: Filters) => f.kinds.size + f.families.size + f.tiers.size > 0;

function applyFilters(entries: SearchEntry[], f: Filters): SearchEntry[] {
  if (!filtersActive(f)) return entries;
  return entries.filter((e) => {
    if (f.kinds.size && !f.kinds.has(e.kind)) return false;
    if (f.families.size && (!e.family || !f.families.has(e.family))) return false;
    if (f.tiers.size && (!e.tier || !f.tiers.has(e.tier))) return false;
    return true;
  });
}

function facetCounts(entries: SearchEntry[], dim: FilterDim): Map<string, number> {
  const m = new Map<string, number>();
  for (const e of entries) {
    const v = dim === "kinds" ? e.kind : dim === "families" ? e.family : e.tier;
    if (v == null) continue;
    m.set(v, (m.get(v) ?? 0) + 1);
  }
  return m;
}

const FilterChip: React.FC<{
  label: string;
  count: number;
  active: boolean;
  tint?: string;
  onClick: () => void;
}> = ({ label, count, active, tint, onClick }) => {
  const color = tint || T.ink;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="inline-flex items-center gap-1.5"
      style={{
        fontFamily: SANS,
        fontSize: 10.5,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        fontWeight: active ? 700 : 600,
        color: active ? color : T.muted,
        background: active ? `${color}1a` : "transparent",
        border: `1px solid ${active ? `${color}66` : T.rule}`,
        padding: "3px 8px",
        borderRadius: 2,
        lineHeight: 1.2,
      }}>
      <span>{label}</span>
      <span style={{ fontFamily: MONO, fontSize: 9.5, color: active ? color : T.mutedSoft, fontWeight: 500 }}>{count}</span>
    </button>
  );
};

// Curated default list shown when the overlay first opens. Pulls every
// Tier-A entry the publication has reviewed so the chip row has real
// results to act on before the user types — turning the overlay into a
// proper "browse-and-filter" surface, not just a typeahead.
const BROWSE_DEFAULTS: SearchEntry[] = SEARCH_ENTRIES
  .filter((e) => e.tier === "A")
  .slice()
  .sort((a, b) => a.title.localeCompare(b.title));

// How many family chips to surface before collapsing the long tail
// behind a "+ N more" toggle. Six keeps the chip row to roughly three
// rows on the typical viewport, even with kinds and tiers visible.
const FAMILY_CHIP_LIMIT = 6;

export const SearchOverlay: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [q, setQ] = React.useState("");
  const [active, setActive] = React.useState(0);
  const [filters, setFilters] = React.useState<Filters>(emptyFilters);
  const [familiesExpanded, setFamiliesExpanded] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const baseResults = React.useMemo<SearchEntry[]>(
    () => (q.trim() ? searchEntries(q, 500) : SEARCH_ENTRIES),
    [q],
  );
  const filteredAll = React.useMemo(() => applyFilters(baseResults, filters), [baseResults, filters]);
  // The overlay opens straight into a "browse" state: chip row populated
  // from the full registry, plus a curated Tier-A list so users can pick
  // a chip and immediately see it narrow real results.
  const isIntroState = q.trim() === "" && !filtersActive(filters);
  const visibleAll = isIntroState ? BROWSE_DEFAULTS : filteredAll;
  // Show every match — the overlay body scrolls (maxHeight: 60vh) so even
  // long filtered lists stay reachable. Capping at 10 used to hide relevant
  // entries the moment a Kind/Family/Tier chip widened the result set.
  const results = visibleAll;
  const itemRefs = React.useRef<Array<HTMLAnchorElement | null>>([]);

  React.useEffect(() => {
    itemRefs.current.length = results.length;
  }, [results.length]);

  React.useEffect(() => {
    if (!open) return;
    const node = itemRefs.current[active];
    if (node && typeof node.scrollIntoView === "function") {
      node.scrollIntoView({ block: "nearest" });
    }
  }, [active, open, results.length]);

  // Counts per facet dimension respect the OTHER active dimensions, so a
  // selected chip never causes its own row to collapse.
  const kindCounts = React.useMemo(
    () => facetCounts(applyFilters(baseResults, { ...filters, kinds: new Set<string>() }), "kinds"),
    [baseResults, filters],
  );
  const familyCounts = React.useMemo(
    () => facetCounts(applyFilters(baseResults, { ...filters, families: new Set<string>() }), "families"),
    [baseResults, filters],
  );
  const tierCounts = React.useMemo(
    () => facetCounts(applyFilters(baseResults, { ...filters, tiers: new Set<string>() }), "tiers"),
    [baseResults, filters],
  );

  // Chips are available from the moment the overlay opens so users can
  // browse by Kind/Family/Tier without typing first. They only stay hidden
  // when the user has typed a query that has no matches AND no filter is
  // active — there's literally nothing to filter in that state.
  const showChips = baseResults.length > 0 || filtersActive(filters);

  React.useEffect(() => {
    if (!open) return;
    setActive(0);
    setQ("");
    setFilters(emptyFilters());
    setFamiliesExpanded(false);
    const t = window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => window.clearTimeout(t);
  }, [open]);

  React.useEffect(() => { setActive(0); }, [q, filters]);

  const toggleFilter = (dim: FilterDim, value: string) => {
    setFilters((prev) => {
      const next = new Set(prev[dim]);
      if (next.has(value)) next.delete(value); else next.add(value);
      return { ...prev, [dim]: next };
    });
  };
  const clearFilters = () => setFilters(emptyFilters());

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (results.length === 0 ? 0 : (i + 1) % results.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (results.length === 0 ? 0 : (i - 1 + results.length) % results.length));
    } else if (e.key === "Enter") {
      const r = results[active];
      if (r) { e.preventDefault(); window.location.assign(r.href); }
    }
  };

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const sortByCountDesc = (a: [string, number], b: [string, number]) => b[1] - a[1] || a[0].localeCompare(b[0]);
  const kindEntries = [...kindCounts.entries()].sort(sortByCountDesc);
  const familyEntries = [...familyCounts.entries()].sort(sortByCountDesc);
  const tierEntries = [...tierCounts.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  // Family list can sprawl past 20 entries with the full registry visible
  // on open. Collapse the long tail behind a "+ N more" toggle, but keep
  // any selected family chip visible so the user never loses sight of an
  // active filter.
  const showFamilyToggle = familyEntries.length > FAMILY_CHIP_LIMIT;
  const visibleFamilyEntries = (() => {
    if (!showFamilyToggle || familiesExpanded) return familyEntries;
    const top = familyEntries.slice(0, FAMILY_CHIP_LIMIT);
    const topKeys = new Set(top.map(([k]) => k));
    const pinnedSelected = familyEntries.filter(
      ([k]) => filters.families.has(k) && !topKeys.has(k),
    );
    return [...top, ...pinnedSelected];
  })();
  const hiddenFamilyCount = familyEntries.length - visibleFamilyEntries.length;

  const filterSummary = (() => {
    const parts: string[] = [];
    if (filters.kinds.size) parts.push([...filters.kinds].join(" / "));
    if (filters.families.size) parts.push([...filters.families].join(" / "));
    if (filters.tiers.size) parts.push([...filters.tiers].map((t) => `Tier ${t}`).join(" / "));
    return parts.join(" · ");
  })();

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-20 pb-10"
      style={{ background: "rgba(17,18,20,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <div className="w-full max-w-2xl border shadow-xl"
        style={{ background: T.paper, borderColor: T.rule }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: T.rule }}>
          <Search className="h-4 w-4" style={{ color: T.muted }} />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Search ingredients, products, routines, concerns…"
            className="flex-1 bg-transparent outline-none"
            style={{ fontFamily: SERIF, fontSize: 22, color: T.ink, fontVariationSettings: '"opsz" 144' }}
          />
          <kbd style={{ fontFamily: MONO, fontSize: 10, padding: "2px 6px", border: `1px solid ${T.rule}`, color: T.mutedSoft, borderRadius: 2 }}>ESC</kbd>
          <button onClick={onClose} className="p-1" aria-label="Close search">
            <X className="h-4 w-4" style={{ color: T.muted }} />
          </button>
        </div>

        {showChips && (kindEntries.length + familyEntries.length + tierEntries.length > 0 || filtersActive(filters)) && (
          <div className="px-5 py-3 border-b" style={{ borderColor: T.ruleSoft, background: T.paper2 }}>
            <div className="flex flex-wrap items-center gap-1.5">
              {kindEntries.map(([k, n]) => (
                <FilterChip
                  key={`k-${k}`}
                  label={k}
                  count={n}
                  active={filters.kinds.has(k)}
                  tint={KIND_TINT[k as SearchKind]}
                  onClick={() => toggleFilter("kinds", k)}
                />
              ))}
              {visibleFamilyEntries.length > 0 && (
                <span className="mx-1" style={{ color: T.mutedSoft, fontFamily: MONO, fontSize: 11 }}>·</span>
              )}
              {visibleFamilyEntries.map(([f, n]) => (
                <FilterChip
                  key={`f-${f}`}
                  label={f}
                  count={n}
                  active={filters.families.has(f)}
                  onClick={() => toggleFilter("families", f)}
                />
              ))}
              {showFamilyToggle && (familiesExpanded || hiddenFamilyCount > 0) && (
                <button
                  type="button"
                  onClick={() => setFamiliesExpanded((v) => !v)}
                  aria-expanded={familiesExpanded}
                  className="inline-flex items-center"
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: T.muted,
                    border: `1px dashed ${T.rule}`,
                    padding: "3px 8px",
                    borderRadius: 2,
                    lineHeight: 1.2,
                  }}>
                  {familiesExpanded ? "Show fewer" : `+ ${hiddenFamilyCount} more`}
                </button>
              )}
              {tierEntries.length > 0 && (
                <span className="mx-1" style={{ color: T.mutedSoft, fontFamily: MONO, fontSize: 11 }}>·</span>
              )}
              {tierEntries.map(([t, n]) => (
                <FilterChip
                  key={`t-${t}`}
                  label={`Tier ${t}`}
                  count={n}
                  active={filters.tiers.has(t)}
                  tint={TIER_TINT[t]}
                  onClick={() => toggleFilter("tiers", t)}
                />
              ))}
              {filtersActive(filters) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="ml-auto inline-flex items-center gap-1"
                  style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.muted, textTransform: "uppercase" }}
                  aria-label="Clear all filters">
                  <X className="h-3 w-3" /> Clear
                </button>
              )}
            </div>
          </div>
        )}

        <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
          {isIntroState && results.length > 0 && (
            <div className="px-5 pt-3 pb-2 flex items-baseline justify-between border-b" style={{ borderColor: T.ruleSoft }}>
              <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: T.muted, textTransform: "uppercase" }}>
                Browse · Tier A picks
              </span>
              <span style={{ fontFamily: SERIF_ED, fontStyle: "italic", fontSize: 12.5, color: T.mutedSoft }}>
                Type to search, or pick a chip to narrow.
              </span>
            </div>
          )}
          {results.length === 0 ? (
            <div className="px-5 py-8" style={{ fontFamily: SERIF_ED, fontStyle: "italic", fontSize: 15, color: T.muted }}>
              {filtersActive(filters)
                ? (q.trim()
                  ? `Nothing matches "${q}" within ${filterSummary}. Clear a chip or try a different word.`
                  : `No entries match ${filterSummary}. Try clearing a chip.`)
                : q.trim()
                  ? `Nothing matches "${q}" yet. Try a different word — INCI names, concerns or brand names work best.`
                  : `Start typing to search — or pick a chip above to browse by kind, family or tier.`}
            </div>
          ) : (
            <ul>
              {results.map((r, i) => (
                <li key={`${r.kind}-${r.title}-${i}`}>
                  <a
                    href={r.href}
                    ref={(el) => { itemRefs.current[i] = el; }}
                    onMouseEnter={() => setActive(i)}
                    className="block px-5 py-3 border-b"
                    style={{
                      borderColor: T.ruleSoft,
                      background: i === active ? T.paper2 : "transparent",
                    }}>
                    <div className="flex items-baseline gap-3">
                      <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", color: KIND_TINT[r.kind], textTransform: "uppercase", minWidth: 78 }}>
                        {r.kind}
                      </span>
                      <span className="flex-1" style={{ fontFamily: SERIF, fontSize: 17, color: T.ink, lineHeight: 1.3, fontVariationSettings: '"opsz" 144' }}>
                        {r.title}
                      </span>
                      {r.tier && (
                        <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.14em", color: T.muted, border: `1px solid ${T.rule}`, padding: "1.5px 5px", borderRadius: 2 }}>
                          TIER {r.tier}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span style={{ fontFamily: MONO, fontSize: 10, color: T.mutedSoft, letterSpacing: "0.06em" }}>{r.eyebrow}</span>
                    </div>
                    <div className="mt-1" style={{ fontFamily: SERIF_ED, fontStyle: "italic", fontSize: 13.5, color: T.muted, lineHeight: 1.45 }}>
                      {r.oneliner}
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: T.rule, background: T.paper2, fontFamily: MONO, fontSize: 10, color: T.mutedSoft, letterSpacing: "0.1em" }}>
          <span>
            {visibleAll.length} RESULT{visibleAll.length === 1 ? "" : "S"}
            {isIntroState
              ? " · BROWSE · TIER A"
              : filtersActive(filters) && q.trim()
                ? " · FILTERED"
                : filtersActive(filters)
                  ? " · BROWSING"
                  : ""}
          </span>
          <span className="inline-flex items-center gap-3">
            <span className="inline-flex items-center gap-1">↑ ↓ NAVIGATE</span>
            <span className="inline-flex items-center gap-1"><CornerDownLeft className="h-3 w-3" /> OPEN</span>
          </span>
        </div>
      </div>
    </div>
  );
};

// Shared "/" keyboard shortcut. Used both by SiteHeader and by the
// bespoke header in Home.tsx so the search overlay opens consistently.
export function useSearchShortcut(setOpen: (open: boolean) => void): void {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA" || (target?.isContentEditable ?? false);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);
}

export const SiteHeader: React.FC<{ active?: string }> = ({ active }) => {
  const [searchOpen, setSearchOpen] = React.useState(false);
  useSearchShortcut(setSearchOpen);

  return (
    <>
      {/* Masthead bar */}
      <div className="relative z-20 border-b" style={{ borderColor: T.rule, background: T.paper }}>
        <Container>
          <div className="flex items-center justify-between py-2.5" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: T.mutedSoft, textTransform: "uppercase" }}>
            <span>What Works Skin — Independent · Evidence-First · Ad-Free</span>
            <span className="hidden md:inline">Issue 014 · 20 April 2026 · Next: 04 May</span>
            <span className="hidden lg:inline">whatworksskin.com</span>
          </div>
        </Container>
      </div>
      {/* Header */}
      <header className="relative z-10 border-b" style={{ borderColor: T.rule, background: `${T.paper}f2`, backdropFilter: "blur(8px)" }}>
        <Container>
          <div className="flex items-center justify-between py-5">
            <a href="#" className="flex items-center gap-3" aria-label="What Works Skin home"><Wordmark size={22} /></a>
            <nav className="hidden items-center gap-7 md:flex" style={{ fontFamily: SANS, fontSize: 13.5, color: T.inkSoft }}>
              {["Ingredients", "Products", "Routines", "Supplements", "Trend Watch", "Concerns", "Methodology"].map((l) => {
                const isActive = active && l.toLowerCase() === active.toLowerCase();
                return (
                  <a key={l} href="#" style={{ color: isActive ? T.ink : T.inkSoft, fontWeight: isActive ? 600 : 400, borderBottom: isActive ? `2px solid ${T.accent}` : "none", paddingBottom: 2 }}>{l}</a>
                );
              })}
            </nav>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 rounded-sm border px-3 py-1.5"
                style={{ borderColor: T.rule, fontFamily: SANS, fontSize: 12, color: T.muted }}
                aria-label="Open search">
                <Search className="h-3.5 w-3.5" />
                <span>Search</span>
                <kbd style={{ fontFamily: MONO, fontSize: 10, padding: "1px 5px", border: `1px solid ${T.rule}`, borderRadius: 2 }}>/</kbd>
              </button>
            </div>
          </div>
        </Container>
      </header>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export const Breadcrumbs: React.FC<{ trail: { label: string; href?: string }[] }> = ({ trail }) => (
  <div className="relative z-10 border-b" style={{ borderColor: T.rule, background: T.paper }}>
    <Container>
      <ol className="flex items-center gap-2 py-3" style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.08em", color: T.mutedSoft, textTransform: "uppercase" }}>
        {trail.map((t, i) => (
          <React.Fragment key={t.label}>
            {i > 0 && <span style={{ color: T.mutedSoft }}>/</span>}
            {t.href ? <a href={t.href} style={{ color: i === trail.length - 1 ? T.ink : T.mutedSoft }}>{t.label}</a> : <span style={{ color: T.ink }}>{t.label}</span>}
          </React.Fragment>
        ))}
      </ol>
    </Container>
  </div>
);

export const SiteFooter: React.FC = () => (
  <>
    <section className="relative z-10 py-20 border-y" style={{ borderColor: T.rule, background: T.paper }}>
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center border p-10" style={{ borderColor: T.rule }}>
          <div>
            <Eyebrow color={T.accent}>Newsletter</Eyebrow>
            <h3 className="mt-4" style={{ fontFamily: SERIF, fontSize: 38, lineHeight: 1.05, letterSpacing: "-0.025em", fontWeight: 400, fontVariationSettings: '"opsz" 144', color: T.ink }}>
              Once a fortnight. <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>Never a sell.</span>
            </h3>
            <p className="mt-4 max-w-md" style={{ fontFamily: SANS, fontSize: 14.5, lineHeight: 1.6, color: T.muted }}>
              New ingredient grades, updated product scores, and trend verdicts from Dr. Paul and Dr. Sundeep.
            </p>
          </div>
          <div>
            <form className="flex border" style={{ borderColor: T.ink }}>
              <input type="email" placeholder="you@inbox.com" className="flex-1 bg-transparent px-4 py-3.5 outline-none" style={{ fontFamily: SANS, fontSize: 14, color: T.ink }} />
              <button className="px-6 py-3.5 inline-flex items-center gap-2" style={{ background: T.ink, color: T.paper, fontFamily: SANS, fontSize: 13, fontWeight: 500 }}>
                <Mail className="h-3.5 w-3.5" /> Subscribe
              </button>
            </form>
            <p className="mt-3" style={{ fontFamily: SANS, fontSize: 11.5, color: T.mutedSoft }}>3,400+ readers · Plain-text · One unsubscribe link.</p>
          </div>
        </div>
      </Container>
    </section>
    <footer className="relative z-10 py-16" style={{ background: T.paper }}>
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 pb-12 border-b" style={{ borderColor: T.rule }}>
          <div className="col-span-2">
            <Wordmark size={20} />
            <p className="mt-5 max-w-xs" style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.6, color: T.muted }}>
              An independent, ad-free, evidence-first skincare reference. Led by Dr. Paul and Dr. Sundeep.
            </p>
            <p className="mt-5" style={{ fontFamily: MONO, fontSize: 10.5, color: T.mutedSoft, letterSpacing: "0.08em" }}>© 2026 WHAT WORKS SKIN · METHODOLOGY v1.0</p>
          </div>
          {[
            { h: "Evidence", l: ["Ingredients", "Products", "Supplements", "Trend Watch", "Compare"] },
            { h: "Tools", l: ["Works Score calculator", "Routine builder", "Ingredient match", "Concerns"] },
            { h: "Transparency", l: ["Methodology", "How we rate", "Sources", "Corrections"] },
          ].map((col) => (
            <div key={col.h}>
              <Eyebrow>{col.h}</Eyebrow>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.l.map((x) => (<li key={x}><a href="#" style={{ fontFamily: SANS, fontSize: 13, color: T.inkSoft }}>{x}</a></li>))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-6 flex flex-wrap items-center justify-between gap-4" style={{ fontFamily: SANS, fontSize: 11.5, color: T.muted }}>
          <span>Information only. Not medical advice. Editorial prose CC BY-NC 4.0 · Data CC BY 4.0.</span>
          <span>whatworksskin.com · editorial@whatworksskin.com</span>
        </div>
      </Container>
    </footer>
  </>
);

export const Arrow: React.FC<{ size?: number; className?: string }> = ({ size = 14, className }) => (
  <ArrowRight className={className} style={{ width: size, height: size }} />
);
