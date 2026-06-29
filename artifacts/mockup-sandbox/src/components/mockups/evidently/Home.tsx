import React, { useState, useContext, createContext, useMemo } from "react";
import { ArrowRight, Search, FileText, Mail, Sun, Moon } from "lucide-react";
import { LaidPaper, ColumnRules, TopVignette, SearchOverlay, useSearchShortcut } from "./_chrome";
import { ingredientHrefFor, INGREDIENTS as INGREDIENT_CATALOGUE, PRODUCTS } from "./_links";
import { SUPPS, linkForSupplement } from "./SupplementIndex";
import { CONCERNS as CATALOGUE_CONCERNS, linkForConcern } from "./ConcernIndex";
import { ISSUES as TREND_ISSUES, linkFor as linkForTrendIssue } from "./TrendWatchArchive";

// Catalogue-derived counts so the homepage callouts stay in sync as new
// briefs, products, or trend issues are added — no hand-typed numbers.
// PRODUCTS in `_links.tsx` mixes reviewed entries (with a tier and a
// review component) and unreviewed shelf entries (purchaseUrl only) —
// the "products scored" headline only counts the reviewed ones.
const INGREDIENT_COUNT = Object.keys(INGREDIENT_CATALOGUE).length;
const SCORED_PRODUCT_COUNT = PRODUCTS.filter((p) => p.tier != null).length;
const TREND_ISSUE_COUNT = TREND_ISSUES.length;
const TREND_VERDICT_COUNT = TREND_ISSUES.reduce(
  (n, i) => n + i.trends.length,
  0,
);

// ─── palettes ──────────────────────────────────────────────────────────────
const LIGHT = {
  paper: "#fafaf7",
  paper2: "#f4f2eb",
  ink: "#111214",
  inkSoft: "#2a2c33",
  muted: "#5a5c61",
  mutedSoft: "#8a8c92",
  rule: "#e4e2db",
  ruleSoft: "#ecebe4",
  accent: "#0f766e",
  accentSoft: "#e6f4f2",
  tierA: "#047857",
  tierAsoft: "#e6f4ee",
  tierB: "#b45309",
  tierBsoft: "#fdf2e3",
  tierC: "#475569",
  tierCsoft: "#eef1f4",
  tierD: "#9f1239",
  tierDsoft: "#fbe8ec",
  // ethos band + manifesto invert (stays "ink" on light, paper-on-paper on dark)
  invertBg: "#111214",
  invertFg: "#fafaf7",
  invertMuted: "#6b6e75",
  invertAccent: "#5eead4",
  grainOpacity: 0.04,
  grainBlend: "multiply" as const,
};

// "Editor's Edition" — warm graphite, evening light
const DARK = {
  paper: "#1a1816",
  paper2: "#221f1c",
  ink: "#ece8df",
  inkSoft: "#cfcabf",
  muted: "#8e8a82",
  mutedSoft: "#6a665f",
  rule: "#2e2a26",
  ruleSoft: "#262320",
  accent: "#5eead4",
  accentSoft: "#1f3a36",
  tierA: "#34d399",
  tierAsoft: "#1c2f2a",
  tierB: "#fbbf24",
  tierBsoft: "#332a18",
  tierC: "#94a3b8",
  tierCsoft: "#262a30",
  tierD: "#fb7185",
  tierDsoft: "#3a2025",
  // invert sections become CREAM in dark mode (reversed contrast — like a foldout)
  invertBg: "#ece8df",
  invertFg: "#1a1816",
  invertMuted: "#5a5c61",
  invertAccent: "#0f766e",
  grainOpacity: 0.06,
  grainBlend: "overlay" as const,
};

type Palette = Omit<typeof LIGHT, "grainBlend"> & { grainBlend: "multiply" | "overlay" };

const ThemeCtx = createContext<Palette>(LIGHT);
const useT = () => useContext(ThemeCtx);

const SERIF = "'Fraunces', ui-serif, Georgia, serif";
const SERIF_ED = "'Instrument Serif', 'Fraunces', ui-serif, Georgia, serif";
const SANS = "'Inter', ui-sans-serif, system-ui, sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, monospace";

const tierColor = (T: Palette, t: string) =>
  ({ A: T.tierA, B: T.tierB, C: T.tierC, D: T.tierD } as Record<string, string>)[t.toUpperCase()] || T.tierC;
const tierBg = (T: Palette, t: string) =>
  ({ A: T.tierAsoft, B: T.tierBsoft, C: T.tierCsoft, D: T.tierDsoft } as Record<string, string>)[t.toUpperCase()] || T.tierCsoft;
const verdictForScore = (s: number) =>
  s >= 85 ? "Excellent" : s >= 70 ? "Strong" : s >= 55 ? "Moderate" : s >= 40 ? "Limited" : "Insufficient";
const tierForScore = (s: number) => (s >= 85 ? "A" : s >= 70 ? "A" : s >= 55 ? "B" : s >= 40 ? "C" : "D");

// ─── tiny atoms ────────────────────────────────────────────────────────────
const Eyebrow: React.FC<React.PropsWithChildren<{ color?: string; className?: string }>> = ({ children, color, className = "" }) => {
  const T = useT();
  return (
    <p
      className={`uppercase ${className}`}
      style={{ fontFamily: SANS, fontSize: 10.5, letterSpacing: "0.18em", fontWeight: 600, color: color || T.muted }}
    >
      {children}
    </p>
  );
};

const Folio: React.FC<{ n: string }> = ({ n }) => {
  const T = useT();
  return (
    <div className="flex items-baseline gap-2" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", color: T.mutedSoft }}>
      <span>—</span>
      <span>{n}</span>
    </div>
  );
};

const Wordmark: React.FC<{ size?: number }> = ({ size = 22 }) => {
  const T = useT();
  return (
    <span
      className="inline-flex items-baseline"
      style={{ fontFamily: SERIF, fontSize: size, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1 }}
    >
      <span style={{ color: T.ink }}>What&nbsp;Works</span>
      <span style={{ color: T.accent, fontStyle: "italic", marginLeft: size * 0.18 }}>Skin</span>
    </span>
  );
};

const TierBadge: React.FC<{ tier: string; size?: "sm" | "md" }> = ({ tier, size = "sm" }) => {
  const T = useT();
  return (
    <span
      className="inline-flex items-center justify-center"
      style={{
        fontFamily: SANS,
        fontSize: size === "md" ? 11 : 10,
        letterSpacing: "0.16em",
        fontWeight: 700,
        color: tierColor(T, tier),
        background: tierBg(T, tier),
        border: `1px solid ${tierColor(T, tier)}55`,
        padding: size === "md" ? "4px 10px" : "3px 8px",
        borderRadius: 2,
        textTransform: "uppercase",
      }}
    >
      Tier&nbsp;{tier.toUpperCase()}
    </span>
  );
};

const VerdictPill: React.FC<{ kind: string }> = ({ kind }) => {
  const T = useT();
  const map: Record<string, { c: string; bg: string }> = {
    Hype: { c: T.tierD, bg: T.tierDsoft },
    Supported: { c: T.tierA, bg: T.tierAsoft },
    Mixed: { c: T.tierB, bg: T.tierBsoft },
    Emerging: { c: T.accent, bg: T.accentSoft },
    Contested: { c: T.tierC, bg: T.tierCsoft },
  };
  const m = map[kind] || map.Mixed;
  return (
    <span
      style={{
        fontFamily: SANS, fontSize: 10, letterSpacing: "0.14em", fontWeight: 700,
        color: m.c, background: m.bg, border: `1px solid ${m.c}55`,
        padding: "3px 9px", borderRadius: 2, textTransform: "uppercase",
      }}
    >{kind}</span>
  );
};

const ScoreNumeral: React.FC<{ score: number; size?: number; color?: string }> = ({ score, size = 64, color }) => {
  const T = useT();
  return (
    <span
      className="tabular-nums"
      style={{ fontFamily: SERIF, fontSize: size, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', letterSpacing: "-0.04em", lineHeight: 0.9, color: color || T.ink }}
    >
      {score}
    </span>
  );
};

const ScoreRing: React.FC<{ score: number; size?: number; stroke?: number; color: string }> = ({ score, size = 56, stroke = 2, color }) => {
  const T = useT();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (score / 100) * c;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.rule} strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" />
    </svg>
  );
};

// ─── data ──────────────────────────────────────────────────────────────────
const PICKS: Record<string, { brand: string; name: string; sub: string; score: number; img: string }[]> = {
  "anti-aging": [
    { brand: "SkinCeuticals", name: "C E Ferulic", sub: "15% L-ascorbic + 1% tocopherol + 0.5% ferulic", score: 86, img: "C E\nFerulic" },
    { brand: "The Ordinary", name: "Retinal 0.2% Emulsion", sub: "Retinaldehyde at a proven dose, skin-friendly base", score: 82, img: "Retinal\n0.2%" },
    { brand: "Differin", name: "Adapalene 0.1% Gel", sub: "Third-gen retinoid. OTC anti-aging bonus.", score: 84, img: "Adapalene\n0.1%" },
  ],
  "pigmentation": [
    { brand: "Good Molecules", name: "Discoloration Correcting Serum", sub: "Tranexamic acid + niacinamide", score: 78, img: "Tranex.\nSerum" },
    { brand: "Minimalist", name: "Niacinamide 10%", sub: "Above the proven 4–5% ceiling", score: 74, img: "Niacin.\n10%" },
    { brand: "The Ordinary", name: "Ascorbic Acid 8% + Alpha Arbutin 2%", sub: "L-AA entry combo, oxidation-prone", score: 68, img: "AA 8%" },
  ],
  "acne": [
    { brand: "Paula's Choice", name: "2% BHA Liquid Exfoliant", sub: "Salicylic acid at therapeutic pH", score: 85, img: "BHA 2%" },
    { brand: "Differin", name: "Adapalene 0.1% Gel", sub: "Only OTC retinoid FDA-approved for acne", score: 84, img: "Adapalene" },
    { brand: "COSRX", name: "Advanced Snail 96 Mucin Essence", sub: "Emerging post-acne barrier support", score: 64, img: "Snail 96" },
  ],
  "barrier": [
    { brand: "La Roche-Posay", name: "Anthelios UVMune 400 SPF 50+", sub: "Photostable, long-UVA filter system", score: 89, img: "Anthelios\nSPF50+" },
    { brand: "CeraVe", name: "Moisturising Cream", sub: "Three ceramides + cholesterol + fatty acids", score: 88, img: "CeraVe\nCream" },
    { brand: "Dr Sheth's", name: "Centella Oat Soothing Moisturiser", sub: "Oat extract + madecassoside, India-formulated", score: 72, img: "Centella\nGel" },
  ],
  "budget": [
    { brand: "Beauty of Joseon", name: "Relief Sun: Rice + Probiotics SPF50+", sub: "Elegant low-cost chemical sunscreen", score: 80, img: "BoJ\nRice SPF" },
    { brand: "Minimalist", name: "Niacinamide 10%", sub: "Sub-₹400 niacinamide at clinical ceiling", score: 74, img: "Niacin.\n10%" },
    { brand: "CeraVe", name: "Moisturising Cream", sub: "Evidence-grade barrier repair, supermarket pricing", score: 88, img: "CeraVe" },
  ],
};

const TRENDS = [
  { kind: "Hype", title: "Exosome creams", body: "Cosmetic exosomes are not the same as the biotech you've read about." },
  { kind: "Supported", title: "Retinol vs retinal", body: "Both work. Retinal works faster. Tretinoin still wins on data." },
  { kind: "Mixed", title: "Vitamin C forms", body: "L-ascorbic acid has the data. The stable cousins have convenience." },
  { kind: "Emerging", title: "Collagen supplements", body: "Peptides beat powders. Skin effects are small but real." },
  { kind: "Contested", title: "Sleep gummies", body: "Magnesium glycinate, yes. 5 mg melatonin nightly, probably not." },
];

const INGREDIENTS: { tier: string; name: string; note: string; slug: string }[] = [
  { tier: "A", slug: "uv-filters", name: "UV filters", note: "The one non-negotiable. Modern long-UVA preferred." },
  { tier: "A", slug: "bemotrizinol", name: "Bemotrizinol", note: "Best-in-class long-UVA filter. Outside US markets." },
  { tier: "A", slug: "tretinoin", name: "Tretinoin", note: "Prescription retinoid. Most data, period." },
  { tier: "A", slug: "retinol", name: "Retinol", note: "Gold-standard anti-aging active. 0.3–1%." },
  { tier: "A", slug: "adapalene", name: "Adapalene", note: "Only OTC retinoid FDA-approved for acne." },
  { tier: "A", slug: "l-ascorbic-acid", name: "L-ascorbic acid", note: "The vitamin C with the data. pH < 3.5." },
  { tier: "A", slug: "niacinamide", name: "Niacinamide", note: "Barrier, oil, mild pigmentation. Tolerates everything." },
  { tier: "A", slug: "tranexamic-acid", name: "Tranexamic acid", note: "Topical melasma go-to." },
  { tier: "A", slug: "azelaic-acid", name: "Azelaic acid", note: "Rosacea, acne, pigment — all in one." },
  { tier: "A", slug: "ceramides", name: "Ceramides", note: "Barrier lipids. Non-negotiable for compromised skin." },
  { tier: "A", slug: "salicylic-acid", name: "Salicylic acid", note: "Oil-soluble. Acne BHA default at pH ≤ 4." },
  { tier: "A", slug: "glycolic-acid", name: "Glycolic acid", note: "AHA with the most clinical data." },
  { tier: "A", slug: "zinc-oxide", name: "Zinc oxide", note: "Mineral filter. Photostable, baby-safe." },
  { tier: "B", slug: "bakuchiol", name: "Bakuchiol", note: "Plant retinoid analogue. Pregnancy-friendly." },
  { tier: "B", slug: "peptides-copper", name: "Copper peptides", note: "GHK-Cu. Anti-aging and wound support." },
  { tier: "D", slug: "exosomes", name: "Exosomes", note: "Cosmetic claims > available data." },
];

// Curated rotation surfaced above the full library — a mix of seasonal
// (UV filters in spring), tier-A workhorses, and recent additions.
const TRENDING_INGREDIENTS: { tier: string; name: string; slug: string; reason: string }[] = [
  { tier: "A", slug: "bemotrizinol", name: "Bemotrizinol", reason: "Spring sun · the long-UVA filter to know" },
  { tier: "A", slug: "uv-filters", name: "UV filters", reason: "Issue 014 explainer · what's actually in your SPF" },
  { tier: "A", slug: "tranexamic-acid", name: "Tranexamic acid", reason: "Stubborn pigment retinoids miss" },
  { tier: "B", slug: "peptides-copper", name: "Copper peptides", reason: "GHK-Cu · the peptide with real data" },
  { tier: "A", slug: "azelaic-acid", name: "Azelaic acid", reason: "Rosacea, acne, PIH — quietly multitasks" },
];

const FACTORS = [
  { n: "01", title: "Evidence strength", body: "Does the active have real clinical data — or just molecular marketing?" },
  { n: "02", title: "Active concentration", body: "Is it at the dose proven to work, or a sprinkle for the label?" },
  { n: "03", title: "Delivery technology", body: "Does the formula actually deliver the active into skin, or sit on top?" },
  { n: "04", title: "Safety & claims", body: "Does the label match what regulators actually let brands say?" },
  { n: "05", title: "Price vs value", body: "Is it what the evidence deserves — or what the packaging asks?" },
];

const CONCERNS = [
  "Breakouts & acne", "Dark spots & melasma", "Fine lines", "Sensitive, reactive skin",
  "Dullness & uneven tone", "Over-exfoliated barrier", "Hormonal shifts", "Pregnancy & postpartum",
];

const WELLNESS = [
  { tier: "A", title: "Creatine monohydrate", body: "The most-studied supplement, period. Skin-agnostic but performance-positive." },
  { tier: "B", title: "Magnesium glycinate", body: "Sleep quality and stress-skin axis. Glycinate tolerates best." },
  { tier: "C", title: "Melatonin", body: "0.3–1 mg is a sleep-timing tool, not a sedative." },
  { tier: "Emerging", title: "Collagen peptides", body: "Small but measurable effects on skin elasticity and hydration." },
  { tier: "Hype", title: "Biotin for hair", body: "Only helps if you're actually deficient. Most people aren't." },
  { tier: "Mixed", title: "Probiotics for acne", body: "Some strain-specific signal. Most OTC products are under-dosed." },
];

const CITED = ["PubMed", "FDA", "AAD", "MFDS", "TGA", "CDSCO", "FSSAI", "NIH", "ScienceDirect"];

// ─── new content surfacing (Trend Watch · Concerns · Supplements) ─────────
// Everything below is derived from the catalogue modules so adding a
// new Trend Watch issue, bumping a supplement's `trending` rank, or
// changing a concern's `featured` rank flows into the homepage with
// no edits required here.

// Compact "06 Apr 2026" formatting for the archive strip — the
// catalogue stores the long form ("06 April 2026") that the archive
// page prefers.
const SHORT_MONTHS: Record<string, string> = {
  January: "Jan", February: "Feb", March: "Mar", April: "Apr", May: "May", June: "Jun",
  July: "Jul", August: "Aug", September: "Sep", October: "Oct", November: "Nov", December: "Dec",
};
const shortDate = (d: string) =>
  d.replace(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/,
    (m) => SHORT_MONTHS[m] || m);

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;
const MONTH_INDEX: Record<string, number> = MONTH_NAMES.reduce(
  (acc, name, i) => ({ ...acc, [name]: i }),
  {} as Record<string, number>,
);
const parseLongDate = (s: string): Date | null => {
  const m = s.match(/^(\d{1,2}) (\w+) (\d{4})$/);
  if (!m || !(m[2] in MONTH_INDEX)) return null;
  return new Date(Date.UTC(Number(m[3]), MONTH_INDEX[m[2]], Number(m[1])));
};
const formatDayMonth = (d: Date): string =>
  `${String(d.getUTCDate()).padStart(2, "0")} ${MONTH_NAMES[d.getUTCMonth()]}`;

const TREND_LATEST_ISSUE = TREND_ISSUES[0];
const TREND_LATEST = {
  n: TREND_LATEST_ISSUE.n,
  date: TREND_LATEST_ISSUE.date,
  headline: TREND_LATEST_ISSUE.headline,
  dek: TREND_LATEST_ISSUE.dek,
  signed: TREND_LATEST_ISSUE.signed,
  href: linkForTrendIssue(TREND_LATEST_ISSUE.n),
};

// Issues ship fortnightly, so the masthead's "Next" date is +14 days
// from the most recent issue. Falls back to a static line if the date
// in the catalogue is malformed for any reason.
const MASTHEAD_LINE = ((): string => {
  const issueNo = String(TREND_LATEST_ISSUE.n).padStart(3, "0");
  const latest = parseLongDate(TREND_LATEST_ISSUE.date);
  if (!latest) return `Issue ${issueNo} · ${TREND_LATEST_ISSUE.date}`;
  const next = new Date(latest);
  next.setUTCDate(next.getUTCDate() + 14);
  return `Issue ${issueNo} · ${TREND_LATEST_ISSUE.date} · Next: ${formatDayMonth(next)}`;
})();

type FeaturedConcern = { slug: string; name: string; family: string; oneliner: string; reviewer: string; href: string };
const FEATURED_CONCERNS: FeaturedConcern[] = CATALOGUE_CONCERNS
  .filter((c) => c.featured != null)
  .sort((a, b) => a.featured! - b.featured!)
  .slice(0, 3)
  .map((c) => ({
    slug: c.slug,
    name: c.name,
    family: c.family,
    oneliner: c.oneliner,
    reviewer: c.reviewer,
    href: linkForConcern(c.slug),
  }));

// Reader-favourite supplements are derived from the SupplementIndex
// `trending` field (top 3 by rank) so the homepage stays in sync as the
// supplement library is curated.
const TRENDING_SUPPS = SUPPS
  .filter((s) => s.trending != null)
  .sort((a, b) => (a.trending! - b.trending!))
  .slice(0, 3)
  .map((s) => ({
    slug: s.slug,
    name: s.name,
    tier: s.tier,
    target: s.target,
    dose: s.dose,
    oneliner: s.oneliner,
    href: linkForSupplement(s.slug),
  }));

// ─── shared ────────────────────────────────────────────────────────────────
const PaperGrain: React.FC = () => {
  const T = useT();
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        opacity: T.grainOpacity, mixBlendMode: T.grainBlend,
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
      }}
    />
  );
};

const Container: React.FC<React.PropsWithChildren<{ narrow?: boolean }>> = ({ children, narrow }) => (
  <div className="mx-auto px-8" style={{ maxWidth: narrow ? 920 : 1200 }}>{children}</div>
);

const SectionHead: React.FC<{ eyebrow: string; title: React.ReactNode; sub?: React.ReactNode; right?: React.ReactNode; folio?: string; eyebrowColor?: string }> = ({ eyebrow, title, sub, right, folio, eyebrowColor }) => {
  const T = useT();
  return (
    <div className="mb-12 flex items-end justify-between gap-12 border-b pb-6" style={{ borderColor: T.rule }}>
      <div className="max-w-3xl">
        <Eyebrow color={eyebrowColor}>{eyebrow}</Eyebrow>
        <h2 className="mt-3" style={{ fontFamily: SERIF, fontSize: 44, lineHeight: 1.05, letterSpacing: "-0.025em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144' }}>{title}</h2>
        {sub && <p className="mt-4 max-w-2xl" style={{ fontFamily: SANS, fontSize: 16, lineHeight: 1.55, color: T.muted }}>{sub}</p>}
      </div>
      <div className="flex shrink-0 items-end gap-6">
        {right}
        {folio && <Folio n={folio} />}
      </div>
    </div>
  );
};

// ─── theme toggle ──────────────────────────────────────────────────────────
const ThemeToggle: React.FC<{ mode: "light" | "dark"; onToggle: () => void }> = ({ mode, onToggle }) => {
  const T = useT();
  return (
    <button
      onClick={onToggle}
      aria-label={`Switch to ${mode === "light" ? "Editor's Edition (dark)" : "Daylight Edition (light)"}`}
      title={mode === "light" ? "Editor's Edition · Evening" : "Daylight Edition · Morning"}
      className="group flex items-center gap-2 rounded-sm border px-2.5 py-1.5 transition-colors"
      style={{
        borderColor: T.rule,
        background: "transparent",
        fontFamily: MONO,
        fontSize: 9.5,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: T.muted,
      }}
    >
      {mode === "light" ? (
        <>
          <Sun className="h-3 w-3" style={{ color: T.ink }} />
          <span style={{ color: T.muted }}>·</span>
          <Moon className="h-3 w-3" />
          <span className="hidden md:inline" style={{ marginLeft: 4 }}>Day</span>
        </>
      ) : (
        <>
          <Sun className="h-3 w-3" />
          <span style={{ color: T.muted }}>·</span>
          <Moon className="h-3 w-3" style={{ color: T.accent }} />
          <span className="hidden md:inline" style={{ marginLeft: 4, color: T.accent }}>Editor</span>
        </>
      )}
    </button>
  );
};

// ───────────────────────────────────────────────────────────────────────────
const Home: React.FC = () => {
  const [tab, setTab] = useState("anti-aging");
  const initialMode: "light" | "dark" =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("theme") === "dark"
      ? "dark"
      : "light";
  const [mode, setMode] = useState<"light" | "dark">(initialMode);
  const T = useMemo(() => (mode === "dark" ? DARK : LIGHT), [mode]);
  const [searchOpen, setSearchOpen] = useState(false);
  useSearchShortcut(setSearchOpen);
  const [concernIdx, setConcernIdx] = useState(() => {
    // Deterministic rotation by week-of-year so the featured concern
    // changes weekly but is stable within a week / between page loads.
    const d = new Date();
    const start = new Date(d.getFullYear(), 0, 1);
    const week = Math.floor((d.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
    return week % FEATURED_CONCERNS.length;
  });
  const featuredConcern = FEATURED_CONCERNS[concernIdx];

  return (
    <ThemeCtx.Provider value={T}>
      <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
        {mode === "light" && <LaidPaper />}
        {/* TOP MASTHEAD BAR */}
        <div className="relative z-20 border-b" style={{ borderColor: T.rule, background: T.paper }}>
          <Container>
            <div className="flex items-center justify-between py-2.5" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: T.mutedSoft, textTransform: "uppercase" }}>
              <span>What Works Skin — Independent · Evidence-First · Ad-Free</span>
              <span className="hidden md:inline">{MASTHEAD_LINE}</span>
              <div className="flex items-center gap-4">
                <span className="hidden lg:inline">whatworksskin.com</span>
                <ThemeToggle mode={mode} onToggle={() => setMode(mode === "light" ? "dark" : "light")} />
              </div>
            </div>
          </Container>
        </div>

        {/* HEADER */}
        <header className="relative z-10 border-b" style={{ borderColor: T.rule, background: `${T.paper}f2`, backdropFilter: "blur(8px)" }}>
          <Container>
            <div className="flex items-center justify-between py-5">
              <a href="#" className="flex items-center gap-3" aria-label="What Works Skin home">
                <Wordmark size={22} />
              </a>
              <nav className="hidden items-center gap-7 md:flex" style={{ fontFamily: SANS, fontSize: 13.5, color: T.inkSoft }}>
                {["Ingredients", "Products", "Routines", "Supplements", "Trend Watch", "Concerns", "Methodology"].map((l) => (
                  <a key={l} href="#" style={{ transition: "color .15s" }}>{l}</a>
                ))}
              </nav>
              <div className="flex items-center gap-3">
                <button onClick={() => setSearchOpen(true)} aria-label="Open search" className="flex items-center gap-2 rounded-sm border px-3 py-1.5" style={{ borderColor: T.rule, fontFamily: SANS, fontSize: 12, color: T.muted }}>
                  <Search className="h-3.5 w-3.5" />
                  <span>Search</span>
                  <kbd style={{ fontFamily: MONO, fontSize: 10, padding: "1px 5px", border: `1px solid ${T.rule}`, borderRadius: 2 }}>/</kbd>
                </button>
              </div>
            </div>
          </Container>
        </header>

        {/* ─── HERO ─────────────────────────────────────────────────────── */}
        <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
          {mode === "light" && <TopVignette />}
          <PaperGrain />
          {mode === "light" && <ColumnRules opacity={0.32} />}
          <Container>
            <div className="relative grid grid-cols-12 gap-10 py-20">
              {/* vertical marginalia */}
              <div className="absolute left-0 top-20 bottom-20 hidden lg:flex flex-col items-center justify-between" style={{ width: 24 }}>
                <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                  ISSUE 014 — 04 / 2026
                </span>
                <div className="h-px w-3" style={{ background: T.rule }} />
                <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                  FILED · 20 APR
                </span>
              </div>

              {/* LEFT */}
              <div className="col-span-12 lg:col-span-7 lg:pl-12">
                <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
                  <Eyebrow color={T.accent}>Independent · Peer-reviewed · Ad-free</Eyebrow>
                  <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>P. 01 · COVER</div>
                </div>

                <h1
                  className="mt-10"
                  style={{ fontFamily: SERIF, fontSize: 92, lineHeight: 0.95, letterSpacing: "-0.04em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}
                >
                  What actually works
                  <span style={{ fontFamily: SERIF_ED, fontStyle: "italic", color: T.accent, fontWeight: 400 }}> for your skin.</span>
                </h1>

                <p className="mt-10 max-w-xl" style={{ fontFamily: SANS, fontSize: 17.5, lineHeight: 1.6, color: T.inkSoft }}>
                  <span
                    style={{
                      fontFamily: SERIF, fontSize: 78, lineHeight: 0.78,
                      color: T.accent, float: "left", marginRight: 12, marginTop: 4,
                      fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30',
                    }}
                  >E</span>
                  vidence-based skincare, ingredients, and products — decoded so you don't waste money on what doesn't work. Every score is set by two doctors against the same public rubric. No sponsorship. No brand access. No exceptions.
                </p>

                <div className="mt-10 flex flex-wrap items-center gap-3">
                  <a href="#" className="inline-flex items-center gap-2 rounded-sm px-5 py-3" style={{ background: T.ink, color: T.paper, fontFamily: SANS, fontSize: 13, fontWeight: 500, letterSpacing: "0.02em" }}>
                    Check a product <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                  <a href="#" className="inline-flex items-center gap-2 rounded-sm border px-5 py-3" style={{ borderColor: T.ink, color: T.ink, fontFamily: SANS, fontSize: 13, fontWeight: 500 }}>
                    Browse ingredients
                  </a>
                  <a href="#" className="inline-flex items-center gap-1" style={{ fontFamily: SANS, fontSize: 13, color: T.accent, textDecoration: "underline", textUnderlineOffset: 4 }}>
                    Find what works for you →
                  </a>
                </div>

                <div className="mt-12 grid grid-cols-4 gap-6 border-t pt-8" style={{ borderColor: T.rule }}>
                  {[
                    [String(INGREDIENT_COUNT), "ingredients graded"],
                    [String(SCORED_PRODUCT_COUNT), "products scored"],
                    [String(TREND_VERDICT_COUNT), "trend verdicts"],
                    ["02", "doctors, one rubric"],
                  ].map(([k, v]) => (
                    <div key={v as string}>
                      <div style={{ fontFamily: SERIF, fontSize: 30, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144', letterSpacing: "-0.02em", color: T.ink }}>{k}</div>
                      <div className="mt-2" style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.04em", color: T.muted, textTransform: "uppercase" }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT: featured */}
              <aside className="col-span-12 lg:col-span-5">
                <div className="border" style={{ borderColor: T.rule, background: T.paper }}>
                  <div className="border-b px-6 py-3 flex items-center justify-between" style={{ borderColor: T.rule, background: T.paper2 }}>
                    <Eyebrow>This Issue · Highest Score</Eyebrow>
                    <span style={{ fontFamily: MONO, fontSize: 10, color: T.mutedSoft, letterSpacing: "0.08em" }}>№ 089</span>
                  </div>
                  <div className="p-7">
                    <div className="flex items-baseline gap-1 mb-2" style={{ fontFamily: SANS, fontSize: 11.5, letterSpacing: "0.16em", color: T.muted, textTransform: "uppercase", fontWeight: 600 }}>
                      La Roche-Posay
                    </div>
                    <h3 style={{ fontFamily: SERIF, fontSize: 36, lineHeight: 1.05, letterSpacing: "-0.02em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144' }}>
                      Anthelios UVMune 400 Invisible Fluid <span style={{ color: T.accent, fontStyle: "italic", fontFamily: SERIF_ED }}>SPF&nbsp;50+</span>
                    </h3>
                    <p className="mt-4" style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.6, color: T.muted }}>
                      Photostable filter system with long-UVA protection — the dermatology default for sun-driven aging and pigment prevention. Barrier preservation starts here.
                    </p>

                    <div className="mt-7 flex items-center gap-6 border-t pt-7" style={{ borderColor: T.rule }}>
                      <div className="flex items-center gap-4">
                        <ScoreRing score={89} size={70} stroke={2} color={T.tierA} />
                        <ScoreNumeral score={89} size={72} />
                      </div>
                      <div className="flex flex-col gap-1.5 border-l pl-6" style={{ borderColor: T.rule }}>
                        <Eyebrow>Verdict</Eyebrow>
                        <span style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 400, letterSpacing: "-0.01em", color: T.ink }}>Excellent</span>
                        <TierBadge tier="A" size="md" />
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-4 border-t pt-5" style={{ borderColor: T.ruleSoft }}>
                      {[["Evidence", "5/5"], ["Concentration", "5/5"], ["Delivery", "4/5"]].map(([k, v]) => (
                        <div key={k}>
                          <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.12em", color: T.mutedSoft, textTransform: "uppercase" }}>{k}</div>
                          <div className="mt-1" style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 400, color: T.ink }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t px-6 py-3 flex items-center justify-between" style={{ borderColor: T.rule, background: T.paper2 }}>
                    <span style={{ fontFamily: SANS, fontSize: 11, color: T.muted, letterSpacing: "0.04em" }}>Reviewed by Dr. Sundeep · Filed by Dr. Paul</span>
                    <a href="#" style={{ fontFamily: SANS, fontSize: 12, color: T.accent, textDecoration: "underline", textUnderlineOffset: 3 }}>Read scoring →</a>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[["86", "C E Ferulic"], ["88", "CeraVe Cream"], ["85", "Paula's BHA"]].map(([s, n]) => (
                    <div key={n} className="border px-3 py-3" style={{ borderColor: T.rule, background: T.paper }}>
                      <div style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 400, letterSpacing: "-0.02em", color: T.tierA }}>{s}</div>
                      <div className="mt-1" style={{ fontFamily: SANS, fontSize: 11, color: T.muted, letterSpacing: "0.02em" }}>{n}</div>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </Container>
        </section>

        {/* ETHOS STRIP — inverted band */}
        <div className="relative z-10 border-b" style={{ borderColor: T.rule, background: T.invertBg, color: T.invertFg }}>
          <Container>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-2 py-3.5" style={{ fontFamily: SANS, fontSize: 13, letterSpacing: "0.02em" }}>
              <span><strong style={{ fontWeight: 600 }}>No paid rankings.</strong></span>
              <span style={{ color: T.invertMuted }}>·</span>
              <span><strong style={{ fontWeight: 600 }}>No hidden sponsorships.</strong></span>
              <span style={{ color: T.invertMuted }}>·</span>
              <span><strong style={{ fontWeight: 600 }}>Only what works.</strong></span>
            </div>
          </Container>
        </div>

        {/* ─── THIS WEEK · CONCERN · TRENDING SUPPS ─────────────────────── */}
        <section className="relative z-10 py-24 border-b" style={{ borderColor: T.rule, background: T.paper }}>
          <Container>
            <SectionHead
              eyebrow="This week on What Works Skin"
              title={<>Fresh from the desk, <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>not the algorithm.</span></>}
              sub={<>The latest Trend Watch, the concern guide most readers landed on, and three supplements earning their shelf space.</>}
              folio="P. 1B"
              right={<div className="hidden md:flex items-end gap-2" style={{ fontFamily: MONO, fontSize: 10, color: T.mutedSoft, letterSpacing: "0.1em" }}>UPDATED FORTNIGHTLY</div>}
            />

            <div className="grid grid-cols-12 gap-0 border" style={{ borderColor: T.rule }}>
              {/* Trend Watch hero */}
              <a href={TREND_LATEST.href} className="col-span-12 lg:col-span-7 p-10 lg:border-r border-b lg:border-b-0 group" style={{ borderColor: T.rule, background: T.paper2 }}>
                <div className="flex items-center justify-between border-b pb-3 mb-7" style={{ borderColor: T.rule }}>
                  <Eyebrow color={T.tierD}>This week's Trend Watch · № {String(TREND_LATEST.n).padStart(2, "0")}</Eyebrow>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: T.mutedSoft, letterSpacing: "0.1em" }}>{TREND_LATEST.date.toUpperCase()}</span>
                </div>
                <h3 style={{ fontFamily: SERIF, fontSize: 44, lineHeight: 1.05, fontWeight: 400, letterSpacing: "-0.025em", color: T.ink, fontVariationSettings: '"opsz" 144' }}>
                  {TREND_LATEST.headline}
                </h3>
                <p className="mt-5 max-w-2xl" style={{ fontFamily: SERIF_ED, fontStyle: "italic", fontSize: 19, lineHeight: 1.5, color: T.muted }}>
                  {TREND_LATEST.dek}
                </p>
                <div className="mt-8 flex items-center justify-between border-t pt-5" style={{ borderColor: T.ruleSoft }}>
                  <span style={{ fontFamily: MONO, fontSize: 10.5, color: T.mutedSoft, letterSpacing: "0.1em" }}>SIGNED · {TREND_LATEST.signed.toUpperCase()}</span>
                  <span className="inline-flex items-center gap-1.5 group-hover:gap-2 transition-all" style={{ fontFamily: SANS, fontSize: 13, color: T.accent, fontWeight: 500 }}>
                    Read the issue <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </a>

              {/* Featured concern */}
              <div className="col-span-12 lg:col-span-5 p-10 flex flex-col">
                <div className="flex items-center justify-between border-b pb-3 mb-7" style={{ borderColor: T.rule }}>
                  <Eyebrow>Concern of the week</Eyebrow>
                  <div className="flex items-center gap-1.5" role="tablist" aria-label="Featured concern">
                    {FEATURED_CONCERNS.map((c, i) => (
                      <button
                        key={c.slug}
                        role="tab"
                        aria-selected={i === concernIdx}
                        aria-label={c.name}
                        onClick={() => setConcernIdx(i)}
                        className="h-1.5 w-7"
                        style={{ background: i === concernIdx ? T.ink : T.rule, transition: "background .15s" }}
                      />
                    ))}
                  </div>
                </div>
                <a href={featuredConcern.href} className="flex flex-col flex-1 group">
                  <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.18em", color: T.muted, textTransform: "uppercase" }}>{featuredConcern.family}</div>
                  <h3 className="mt-3" style={{ fontFamily: SERIF, fontSize: 32, lineHeight: 1.1, fontWeight: 400, letterSpacing: "-0.02em", color: T.ink, fontVariationSettings: '"opsz" 144' }}>
                    {featuredConcern.name}
                  </h3>
                  <p className="mt-4 flex-1" style={{ fontFamily: SERIF_ED, fontStyle: "italic", fontSize: 17, lineHeight: 1.55, color: T.muted }}>
                    {featuredConcern.oneliner}
                  </p>
                  <div className="mt-6 flex items-baseline justify-between border-t pt-5" style={{ borderColor: T.ruleSoft }}>
                    <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>REVIEWED · {featuredConcern.reviewer.toUpperCase()}</span>
                    <span className="inline-flex items-center gap-1.5 group-hover:gap-2 transition-all" style={{ fontFamily: SANS, fontSize: 13, color: T.accent, fontWeight: 500 }}>
                      Read the guide <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </a>
              </div>
            </div>

            {/* Reader-favourite supplements */}
            <div className="mt-16">
              <div className="flex items-end justify-between border-b pb-3 mb-5" style={{ borderColor: T.rule }}>
                <div className="flex items-baseline gap-4">
                  <Eyebrow>Reader-favourite supplements</Eyebrow>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: T.mutedSoft, letterSpacing: "0.12em", textTransform: "uppercase" }}>From the library</span>
                </div>
                <a href="/__mockup/preview/evidently/SupplementIndex" style={{ fontFamily: SANS, fontSize: 12, color: T.accent, textDecoration: "underline", textUnderlineOffset: 3 }}>All supplements →</a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l" style={{ borderColor: T.rule }}>
                {TRENDING_SUPPS.map((s, i) => (
                  <a key={s.slug} href={s.href} className="group flex flex-col p-7 border-r border-b" style={{ borderColor: T.rule, background: T.paper }}>
                    <div className="flex items-baseline justify-between mb-5">
                      <span style={{ fontFamily: SERIF, fontSize: 44, color: T.accent, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', letterSpacing: "-0.04em", lineHeight: 0.9 }}>0{i + 1}</span>
                      <TierBadge tier={s.tier} />
                    </div>
                    <h3 style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 400, letterSpacing: "-0.015em", lineHeight: 1.2, color: T.ink, fontVariationSettings: '"opsz" 144' }}>{s.name}</h3>
                    <div className="mt-2" style={{ fontFamily: MONO, fontSize: 11, color: T.muted, letterSpacing: "0.06em" }}>{s.target} · {s.dose}</div>
                    <p className="mt-3 flex-1" style={{ fontFamily: SERIF_ED, fontStyle: "italic", fontSize: 14.5, lineHeight: 1.5, color: T.muted }}>{s.oneliner}</p>
                    <div className="mt-5 inline-flex items-center gap-1.5 group-hover:gap-2 transition-all" style={{ fontFamily: SANS, fontSize: 12.5, color: T.accent, fontWeight: 500 }}>
                      Read the brief <ArrowRight className="h-3 w-3" />
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Archive strip */}
            <div className="mt-16">
              <div className="flex items-end justify-between border-b pb-3 mb-5" style={{ borderColor: T.rule }}>
                <Eyebrow>From the Trend Watch archive</Eyebrow>
                <a href="/__mockup/preview/evidently/TrendWatchArchive" style={{ fontFamily: SANS, fontSize: 12, color: T.accent, textDecoration: "underline", textUnderlineOffset: 3 }}>All {TREND_ISSUE_COUNT} issues →</a>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-0 border-t border-l" style={{ borderColor: T.rule }}>
                {TREND_ISSUES.slice(1, 7).map((iss) => (
                  <a key={iss.n} href={linkForTrendIssue(iss.n)} className="group flex flex-col p-5 border-r border-b" style={{ borderColor: T.rule, background: T.paper2, minHeight: 180 }}>
                    <div className="flex items-baseline justify-between" style={{ fontFamily: MONO, fontSize: 9.5, color: T.mutedSoft, letterSpacing: "0.12em" }}>
                      <span>№ {String(iss.n).padStart(2, "0")}</span>
                      <span>{shortDate(iss.date).toUpperCase()}</span>
                    </div>
                    <h4 className="mt-4 flex-1" style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 400, lineHeight: 1.25, letterSpacing: "-0.01em", color: T.ink }}>{iss.headline}</h4>
                    <span className="mt-3 inline-flex items-center gap-1 group-hover:gap-1.5 transition-all" style={{ fontFamily: SANS, fontSize: 11.5, color: T.accent, fontWeight: 500 }}>
                      Read <ArrowRight className="h-3 w-3" />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* ─── HOW WE DECIDE ────────────────────────────────────────────── */}
        <section className="relative z-10 py-24 border-b" style={{ borderColor: T.rule }}>
          <Container>
            <SectionHead
              eyebrow="How we decide what works"
              title={<>Five factors. <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>One honest score.</span></>}
              sub={<>Every product is scored against the same five questions. No sponsorship, no brand access, no exceptions. <a href="#" style={{ color: T.accent, textDecoration: "underline", textUnderlineOffset: 3 }}>Read the full methodology →</a></>}
              folio="P. 02"
              right={<div className="hidden md:flex items-end gap-2" style={{ fontFamily: MONO, fontSize: 10, color: T.mutedSoft, letterSpacing: "0.1em" }}>METHOD v1.0</div>}
            />

            <div className="grid grid-cols-1 md:grid-cols-5 gap-0 border-t" style={{ borderColor: T.rule }}>
              {FACTORS.map((f, i) => (
                <div key={f.n} className="p-7 border-b md:border-b-0" style={{ borderColor: T.rule, borderRight: i < FACTORS.length - 1 ? `1px solid ${T.rule}` : "none" }}>
                  <div className="flex items-baseline justify-between mb-6">
                    <span style={{ fontFamily: SERIF, fontSize: 44, fontWeight: 400, color: T.accent, letterSpacing: "-0.04em", lineHeight: 1, fontVariationSettings: '"opsz" 144' }}>{f.n}</span>
                    <span style={{ fontFamily: MONO, fontSize: 9.5, color: T.mutedSoft, letterSpacing: "0.1em" }}>FACTOR</span>
                  </div>
                  <h3 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 500, lineHeight: 1.2, color: T.ink, letterSpacing: "-0.01em" }}>{f.title}</h3>
                  <p className="mt-3" style={{ fontFamily: SANS, fontSize: 13.5, lineHeight: 1.55, color: T.muted }}>{f.body}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex items-center gap-4 border-t pt-6" style={{ borderColor: T.rule }}>
              <Eyebrow>Weighting</Eyebrow>
              <div className="flex flex-1 items-center gap-1 overflow-hidden rounded-sm" style={{ height: 8 }}>
                {[
                  ["Evidence", 30, T.tierA],
                  ["Concentration", 20, T.accent],
                  ["Delivery", 15, mode === "dark" ? "#22d3ee" : "#0e7490"],
                  ["Formula", 15, mode === "dark" ? "#0ea5e9" : "#155e75"],
                  ["Safety", 10, T.tierC],
                  ["Value", 10, T.tierB],
                ].map(([label, w, c]) => (
                  <div key={label as string} title={`${label} ${w}%`} style={{ flex: w as number, background: c as string, height: "100%" }} />
                ))}
              </div>
              <span style={{ fontFamily: MONO, fontSize: 10, color: T.muted, letterSpacing: "0.08em" }}>= 100%</span>
            </div>
          </Container>
        </section>

        {/* ─── FROM THE EDITOR ───────────────────────────────────────────── */}
        <section className="relative z-10 py-20 border-b" style={{ borderColor: T.rule, background: T.paper2 }}>
          <Container narrow>
            <div className="grid grid-cols-12 gap-10 items-start">
              <div className="col-span-12 md:col-span-3 border-r pr-6" style={{ borderColor: T.rule }}>
                <Eyebrow>From the editor</Eyebrow>
                <p className="mt-4" style={{ fontFamily: SANS, fontSize: 12.5, color: T.muted, lineHeight: 1.55 }}>
                  A note on what we changed in Issue 014, and why we think you should care.
                </p>
                <Folio n="P. 03" />
              </div>
              <div className="col-span-12 md:col-span-9">
                <p style={{ fontFamily: SERIF_ED, fontSize: 36, lineHeight: 1.25, fontStyle: "italic", color: T.ink, letterSpacing: "-0.01em" }}>
                  "<span style={{ color: T.accent }}>Skincare gets noisier every season.</span> Our job is the opposite — to be quieter, slower, and harder to buy. A score here is the <span style={{ color: T.accent }}>longest, least dramatic</span> way to tell you whether something is worth your skin and your money."
                </p>
                <div className="mt-8 flex items-center gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border" style={{ borderColor: T.ink, color: T.ink, fontFamily: SERIF, fontSize: 14, fontWeight: 500 }}>P</div>
                  <div>
                    <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 500, color: T.ink }}>Dr. Paul</div>
                    <div style={{ fontFamily: SANS, fontSize: 11.5, color: T.muted }}>Research Lead · MBBS, MD</div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* ─── TREND VS TRUTH ────────────────────────────────────────────── */}
        <section className="relative z-10 py-24 border-b" style={{ borderColor: T.rule }}>
          <Container>
            <SectionHead
              eyebrow="Trend vs Truth"
              eyebrowColor={T.tierD}
              title={<>What TikTok says. <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>What the evidence says.</span></>}
              sub="Viral doesn't mean validated. Here's what the latest social hype actually stands on."
              folio="P. 04"
            />
            <div className="grid grid-cols-1 md:grid-cols-5 gap-0 border" style={{ borderColor: T.rule }}>
              {TRENDS.map((t, i) => (
                <a key={t.title} href="#" className="group p-6 border-b md:border-b-0" style={{ borderColor: T.rule, borderRight: i < TRENDS.length - 1 ? `1px solid ${T.rule}` : "none", background: T.paper }}>
                  <VerdictPill kind={t.kind} />
                  <h3 className="mt-5" style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 400, letterSpacing: "-0.015em", lineHeight: 1.2, color: T.ink }}>{t.title}</h3>
                  <p className="mt-3" style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.55, color: T.muted }}>{t.body}</p>
                  <div className="mt-6 inline-flex items-center gap-1 group-hover:gap-2 transition-all" style={{ fontFamily: SANS, fontSize: 12, color: T.accent, letterSpacing: "0.02em" }}>
                    Read verdict <ArrowRight className="h-3 w-3" />
                  </div>
                </a>
              ))}
            </div>
            <div className="mt-10 text-center">
              <a href="#" className="inline-flex items-center gap-2 border px-6 py-3" style={{ borderColor: T.ink, color: T.ink, fontFamily: SANS, fontSize: 13, fontWeight: 500 }}>See all {TREND_VERDICT_COUNT} trend verdicts →</a>
            </div>
          </Container>
        </section>

        {/* ─── BEST PICKS (TABS) ─────────────────────────────────────────── */}
        <section className="relative z-10 py-24 border-b" style={{ borderColor: T.rule }}>
          <Container>
            <SectionHead
              eyebrow="Top products that actually work"
              title={<>Sorted by <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>evidence,</span> not by budget.</>}
              sub="These aren't the best-selling. They're the highest-scoring under our public rubric."
              folio="P. 05"
            />

            <div className="mb-10 flex flex-wrap items-center gap-1 border-b" style={{ borderColor: T.rule }}>
              {[
                ["anti-aging", "Anti-aging"],
                ["pigmentation", "Pigmentation"],
                ["acne", "Acne"],
                ["barrier", "Barrier repair"],
                ["budget", "Budget"],
              ].map(([k, l]) => {
                const active = tab === k;
                return (
                  <button
                    key={k}
                    onClick={() => setTab(k)}
                    className="relative px-5 py-3 -mb-px"
                    style={{
                      fontFamily: SANS, fontSize: 13, fontWeight: active ? 600 : 500, letterSpacing: "0.01em",
                      color: active ? T.ink : T.muted,
                      borderBottom: active ? `2px solid ${T.accent}` : "2px solid transparent",
                    }}
                  >{l}</button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l" style={{ borderColor: T.rule }}>
              {PICKS[tab].map((p) => {
                const tier = tierForScore(p.score);
                const c = tierColor(T, tier);
                return (
                  <a key={p.name} href="#" className="group flex flex-col border-r border-b" style={{ borderColor: T.rule, background: T.paper }}>
                    <div className="relative aspect-[4/3] flex items-center justify-center border-b overflow-hidden" style={{ borderColor: T.rule, background: tierBg(T, tier) }}>
                      <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(circle at 30% 30%, ${c}33, transparent 60%)` }} />
                      <div className="text-center" style={{ fontFamily: SERIF_ED, fontSize: 36, fontStyle: "italic", color: c, lineHeight: 1.05, letterSpacing: "-0.01em", whiteSpace: "pre-line" }}>{p.img}</div>
                      <div className="absolute top-3 left-3"><TierBadge tier={tier} /></div>
                      <div className="absolute top-3 right-3" style={{ fontFamily: MONO, fontSize: 10, color: T.muted, letterSpacing: "0.08em" }}>№ {String(p.score).padStart(3, "0")}</div>
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <div style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: T.muted, fontWeight: 600 }}>{p.brand}</div>
                      <h3 className="mt-2" style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 400, lineHeight: 1.2, letterSpacing: "-0.015em", color: T.ink }}>{p.name}</h3>
                      <p className="mt-3 flex-1" style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.55, color: T.muted }}>{p.sub}</p>
                      <div className="mt-6 flex items-end justify-between border-t pt-5" style={{ borderColor: T.ruleSoft }}>
                        <div className="flex items-center gap-3">
                          <ScoreNumeral score={p.score} size={42} color={c} />
                          <div className="flex flex-col">
                            <Eyebrow>Verdict</Eyebrow>
                            <span style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 400, color: T.ink }}>{verdictForScore(p.score)}</span>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-all" style={{ color: T.ink, opacity: 0.5 }} />
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>

            <div className="mt-10 text-center">
              <a href="#" className="inline-flex items-center gap-2 border px-6 py-3" style={{ borderColor: T.ink, color: T.ink, fontFamily: SANS, fontSize: 13, fontWeight: 500 }}>See all scored products →</a>
            </div>
          </Container>
        </section>

        {/* ─── TIER SPECIMEN STRIP ──────────────────────────────────────── */}
        <section className="relative z-10 py-20 border-b" style={{ borderColor: T.rule, background: T.paper2 }}>
          <Container>
            <div className="mb-10 flex items-end justify-between border-b pb-4" style={{ borderColor: T.rule }}>
              <Eyebrow>Verdict bands</Eyebrow>
              <span style={{ fontFamily: MONO, fontSize: 10, color: T.mutedSoft, letterSpacing: "0.1em" }}>SPECIMEN · A B C D</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border" style={{ borderColor: T.rule }}>
              {[
                { tier: "A", label: "Excellent", range: "85 – 100", body: "Meets or exceeds the clinical dose, proven delivery, no red flags." },
                { tier: "B", label: "Strong", range: "70 – 84", body: "Evidence-grade active with minor formula or value concerns." },
                { tier: "C", label: "Moderate", range: "55 – 69", body: "Mechanism is credible; execution or concentration holds it back." },
                { tier: "D", label: "Limited", range: "< 55", body: "Thin evidence, sub-clinical dose, or claims that overreach." },
              ].map((t, i) => (
                <div key={t.tier} className="p-7 border-b md:border-b-0" style={{ borderColor: T.rule, borderRight: i < 3 ? `1px solid ${T.rule}` : "none", background: T.paper }}>
                  <div style={{ fontFamily: SERIF, fontSize: 120, lineHeight: 0.9, fontWeight: 400, color: tierColor(T, t.tier), letterSpacing: "-0.06em", fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>{t.tier}</div>
                  <div className="mt-3" style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 400, color: T.ink }}>{t.label}</div>
                  <div className="mt-1" style={{ fontFamily: MONO, fontSize: 11, color: T.muted, letterSpacing: "0.08em" }}>{t.range}</div>
                  <p className="mt-4" style={{ fontFamily: SANS, fontSize: 12.5, lineHeight: 1.55, color: T.muted }}>{t.body}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ─── INGREDIENT LIBRARY ───────────────────────────────────────── */}
        <section className="relative z-10 py-24 border-b" style={{ borderColor: T.rule }}>
          <Container>
            <SectionHead
              eyebrow="Featured ingredients"
              title={<>Your skin doesn't need more products. <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>It needs the right ones.</span></>}
              sub={`Start with the molecule. ${INGREDIENT_COUNT} graded actives, clear evidence tiers, real concentration ranges.`}
              folio="P. 06"
            />

            {/* Trending this issue — curated rotation of new + seasonal briefs */}
            <div className="mb-12">
              <div className="mb-5 flex items-end justify-between border-b pb-3" style={{ borderColor: T.rule }}>
                <div className="flex items-baseline gap-4">
                  <Eyebrow color={T.tierD}>Trending this issue</Eyebrow>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: T.mutedSoft, letterSpacing: "0.12em", textTransform: "uppercase" }}>Rotated 04 / 2026</span>
                </div>
                <a href="#" style={{ fontFamily: SANS, fontSize: 12, color: T.accent, textDecoration: "underline", textUnderlineOffset: 3 }}>Why these →</a>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-0 border" style={{ borderColor: T.rule }}>
                {TRENDING_INGREDIENTS.map((ing, i) => (
                  <a
                    key={ing.slug}
                    href={ingredientHrefFor(ing.slug) ?? "#"}
                    className="group flex flex-col p-6"
                    style={{ borderRight: i < TRENDING_INGREDIENTS.length - 1 ? `1px solid ${T.rule}` : "none", background: T.paper }}
                  >
                    <div className="flex items-baseline justify-between mb-5">
                      <span style={{ fontFamily: SERIF, fontSize: 44, fontWeight: 400, color: T.tierD, letterSpacing: "-0.04em", lineHeight: 0.9, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <TierBadge tier={ing.tier} />
                    </div>
                    <h3 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 400, color: T.ink, letterSpacing: "-0.015em", lineHeight: 1.2 }}>{ing.name}</h3>
                    <p className="mt-2 flex-1" style={{ fontFamily: SANS, fontSize: 12, color: T.muted, lineHeight: 1.5 }}>{ing.reason}</p>
                    <div className="mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition-all" style={{ fontFamily: SANS, fontSize: 11.5, color: T.accent }}>
                      Read brief <ArrowRight className="h-3 w-3" />
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-t border-l" style={{ borderColor: T.rule }}>
              {INGREDIENTS.map((ing) => {
                const href = ingredientHrefFor(ing.slug);
                return (
                  <a
                    key={ing.slug}
                    href={href ?? "#"}
                    className="group flex flex-col gap-3 p-5 border-r border-b"
                    style={{ borderColor: T.rule, background: T.paper }}
                  >
                    <div className="flex items-center justify-between">
                      <span style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 400, lineHeight: 1, color: tierColor(T, ing.tier), letterSpacing: "-0.04em" }}>{ing.tier}</span>
                      <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: T.muted }} />
                    </div>
                    <h3 style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 500, letterSpacing: "-0.01em", lineHeight: 1.2, color: T.ink }}>{ing.name}</h3>
                    <p style={{ fontFamily: SANS, fontSize: 12, lineHeight: 1.5, color: T.muted }}>{ing.note}</p>
                  </a>
                );
              })}
            </div>
            <div className="mt-10 text-center">
              <a href="#" className="inline-flex items-center gap-2 border px-6 py-3" style={{ borderColor: T.ink, color: T.ink, fontFamily: SANS, fontSize: 13, fontWeight: 500 }}>All {INGREDIENT_COUNT} ingredients →</a>
            </div>
          </Container>
        </section>

        {/* ─── SKIN + WELLNESS ──────────────────────────────────────────── */}
        <section className="relative z-10 py-24 border-b" style={{ borderColor: T.rule }}>
          <Container>
            <SectionHead
              eyebrow="Skin + wellness"
              title={<>Skincare doesn't end <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>at the jawline.</span></>}
              sub="Sleep, supplements, and systemic inputs that actually move the needle on skin."
              folio="P. 07"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l" style={{ borderColor: T.rule }}>
              {WELLNESS.map((w) => {
                const isTier = ["A", "B", "C", "D"].includes(w.tier);
                return (
                  <a key={w.title} href="#" className="flex flex-col p-7 border-r border-b" style={{ borderColor: T.rule, background: T.paper }}>
                    <div>
                      {isTier ? <TierBadge tier={w.tier} /> : <VerdictPill kind={w.tier} />}
                    </div>
                    <h3 className="mt-5" style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 400, letterSpacing: "-0.015em", color: T.ink }}>{w.title}</h3>
                    <p className="mt-3" style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.55, color: T.muted }}>{w.body}</p>
                  </a>
                );
              })}
            </div>
          </Container>
        </section>

        {/* ─── TELL US YOUR CONCERN ─────────────────────────────────────── */}
        <section className="relative z-10 py-24 border-b" style={{ borderColor: T.rule, background: T.paper2 }}>
          <Container narrow>
            <div className="text-center">
              <Eyebrow>Tell us your concern</Eyebrow>
              <h2 className="mt-4" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1.05, letterSpacing: "-0.025em", fontWeight: 400, fontVariationSettings: '"opsz" 144', color: T.ink }}>
                You deserve <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>clarity —</span> not confusion.
              </h2>
              <p className="mx-auto mt-5 max-w-xl" style={{ fontFamily: SANS, fontSize: 15.5, lineHeight: 1.6, color: T.muted }}>
                Pick what's actually on your mind. We'll show you the shortest route to what works.
              </p>
            </div>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
              {CONCERNS.map((c) => (
                <a key={c} href="#" className="rounded-full border px-5 py-2.5" style={{ borderColor: T.ink, fontFamily: SANS, fontSize: 13, color: T.ink }}>
                  {c}
                </a>
              ))}
            </div>
          </Container>
        </section>

        {/* ─── BRAND ETHOS MANIFESTO — inverted ──────────────────────────── */}
        <section className="relative z-10 py-28 border-b" style={{ borderColor: T.rule, background: T.invertBg, color: T.invertFg }}>
          <Container narrow>
            <p className="uppercase" style={{ fontFamily: SANS, fontSize: 10.5, letterSpacing: "0.18em", fontWeight: 600, color: T.invertMuted }}>
              Our ethos
            </p>
            <h2 className="mt-5" style={{ fontFamily: SERIF, fontSize: 64, lineHeight: 1.04, letterSpacing: "-0.03em", fontWeight: 400, fontVariationSettings: '"opsz" 144' }}>
              This is not a brand showroom.
            </h2>
            <div className="mt-12 grid gap-2" style={{ fontFamily: SERIF, fontSize: 32, lineHeight: 1.35, fontWeight: 400 }}>
              <p>No paid rankings. <span style={{ color: T.invertAccent, fontStyle: "italic", fontFamily: SERIF_ED }}>Ever.</span></p>
              <p>No hidden sponsorships. <span style={{ color: T.invertAccent, fontStyle: "italic", fontFamily: SERIF_ED }}>At all.</span></p>
              <p>Only what <span style={{ color: T.invertAccent, fontStyle: "italic", fontFamily: SERIF_ED }}>actually</span> works.</p>
            </div>
            <div className="mt-12 flex flex-wrap items-center gap-3">
              <a href="#" className="inline-flex items-center gap-2 rounded-sm px-5 py-3" style={{ background: T.invertFg, color: T.invertBg, fontFamily: SANS, fontSize: 13, fontWeight: 500 }}>Read how we score</a>
              <a href="#" className="inline-flex items-center gap-1" style={{ fontFamily: SANS, fontSize: 13, color: T.invertFg, textDecoration: "underline", textUnderlineOffset: 4 }}>Submit a correction →</a>
            </div>
          </Container>
        </section>

        {/* ─── BEHIND THE RESEARCH ──────────────────────────────────────── */}
        <section className="relative z-10 py-24 border-b" style={{ borderColor: T.rule }}>
          <Container narrow>
            <div className="text-center">
              <Eyebrow>Behind the research</Eyebrow>
              <h2 className="mt-4" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1.05, letterSpacing: "-0.025em", fontWeight: 400, fontVariationSettings: '"opsz" 144', color: T.ink }}>
                Two doctors. <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>One standard.</span>
              </h2>
              <p className="mx-auto mt-5 max-w-xl" style={{ fontFamily: SANS, fontSize: 15.5, lineHeight: 1.6, color: T.muted }}>
                Every page you read here has been researched, written, and reviewed by the same two people. That is the accountability floor.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-0 border" style={{ borderColor: T.rule }}>
              {[
                { initial: "P", name: "Dr. Paul", role: "Research Lead · MBBS, MD", body: "Leads evidence grading, ingredient rubric, and product scoring. All scoring calls are his, against the public rubric — not against what brands send." },
                { initial: "S", name: "Dr. Sundeep", role: "Medical Review Lead · MBBS, MD", body: "Reviews every ingredient and product page for clinical accuracy, safety flags, and pregnancy/paediatric guidance before it goes live." },
              ].map((d, i) => (
                <div key={d.name} className="p-9 flex gap-7 items-start" style={{ borderRight: i === 0 ? `1px solid ${T.rule}` : "none", background: T.paper }}>
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full" style={{ background: T.accentSoft, color: T.accent, fontFamily: SERIF, fontSize: 32, fontWeight: 400, fontVariationSettings: '"opsz" 144' }}>{d.initial}</div>
                  <div>
                    <h3 style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 400, letterSpacing: "-0.02em", color: T.ink }}>{d.name}</h3>
                    <div className="mt-1" style={{ fontFamily: SANS, fontSize: 12, color: T.accent, letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 600 }}>{d.role}</div>
                    <p className="mt-4" style={{ fontFamily: SANS, fontSize: 13.5, lineHeight: 1.6, color: T.muted }}>{d.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <a href="#" className="inline-flex items-center gap-2 border px-6 py-3 mr-2" style={{ borderColor: T.ink, color: T.ink, fontFamily: SANS, fontSize: 13, fontWeight: 500 }}>About What Works Skin</a>
              <a href="#" className="inline-flex items-center gap-1" style={{ fontFamily: SANS, fontSize: 13, color: T.accent, textDecoration: "underline", textUnderlineOffset: 4 }}>Full masthead →</a>
            </div>
          </Container>
        </section>

        {/* ─── CITED IN THIS ISSUE ──────────────────────────────────────── */}
        <section className="relative z-10 py-12 border-b" style={{ borderColor: T.rule, background: T.paper2 }}>
          <Container>
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <FileText className="h-4 w-4" style={{ color: T.muted }} />
                <Eyebrow>Cited in this issue</Eyebrow>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2" style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 400, color: T.inkSoft, letterSpacing: "0.01em" }}>
                {CITED.map((c, i) => (
                  <React.Fragment key={c}>
                    <span>{c}</span>
                    {i < CITED.length - 1 && <span style={{ color: T.mutedSoft }}>·</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* ─── NEWSLETTER ──────────────────────────────────────────────── */}
        <section className="relative z-10 py-20 border-b" style={{ borderColor: T.rule }}>
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center border p-10" style={{ borderColor: T.rule, background: T.paper }}>
              <div>
                <Eyebrow color={T.accent}>Newsletter</Eyebrow>
                <h3 className="mt-4" style={{ fontFamily: SERIF, fontSize: 38, lineHeight: 1.05, letterSpacing: "-0.025em", fontWeight: 400, fontVariationSettings: '"opsz" 144', color: T.ink }}>
                  Once a fortnight. <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>Never a sell.</span>
                </h3>
                <p className="mt-4 max-w-md" style={{ fontFamily: SANS, fontSize: 14.5, lineHeight: 1.6, color: T.muted }}>
                  New ingredient grades, updated product scores, and trend verdicts from Dr. Paul and Dr. Sundeep. No affiliate links, no sponsorships, no product launches we don't believe in.
                </p>
              </div>
              <div>
                <form className="flex border" style={{ borderColor: T.ink }}>
                  <input type="email" placeholder="you@inbox.com" className="flex-1 bg-transparent px-4 py-3.5 outline-none" style={{ fontFamily: SANS, fontSize: 14, color: T.ink }} />
                  <button className="px-6 py-3.5 inline-flex items-center gap-2" style={{ background: T.ink, color: T.paper, fontFamily: SANS, fontSize: 13, fontWeight: 500 }}>
                    <Mail className="h-3.5 w-3.5" /> Subscribe
                  </button>
                </form>
                <p className="mt-3" style={{ fontFamily: SANS, fontSize: 11.5, color: T.mutedSoft }}>
                  3,400+ readers · Plain-text · One unsubscribe link, no ceremony.
                </p>
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
                <p className="mt-5" style={{ fontFamily: MONO, fontSize: 10.5, color: T.mutedSoft, letterSpacing: "0.08em" }}>
                  © 2026 WHAT WORKS SKIN · METHODOLOGY v1.0
                </p>
              </div>
              {[
                { h: "Evidence", l: ["Ingredients", "Products", "Supplements", "Trend Watch", "Compare"] },
                { h: "Tools", l: ["Works Score calculator", "Routine builder", "Ingredient match", "Concerns"] },
                { h: "Transparency", l: ["Methodology", "How we rate", "Sources", "Corrections"] },
              ].map((col) => (
                <div key={col.h}>
                  <Eyebrow>{col.h}</Eyebrow>
                  <ul className="mt-4 flex flex-col gap-2.5">
                    {col.l.map((x) => (
                      <li key={x}><a href="#" style={{ fontFamily: SANS, fontSize: 13, color: T.inkSoft }}>{x}</a></li>
                    ))}
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
      </div>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </ThemeCtx.Provider>
  );
};

export default Home;
