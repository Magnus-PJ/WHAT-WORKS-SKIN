// TrendWatch — the receipts column.
// Tracks the loud claims, grades the evidence, links the original source.

import React from "react";
import { ArrowRight, TrendingUp, TrendingDown, Minus, ExternalLink } from "lucide-react";
import { T, tierColor } from "./_theme";
import {
  SiteHeader, SiteFooter, Breadcrumbs, Container, Eyebrow, Folio,
  PaperGrain, LaidPaper, ColumnRules, TopVignette, Asterism, AmbientFlask,
  SERIF, SERIF_ED, SANS, MONO,
} from "./_chrome";

type Verdict = "Holds up" | "Partly true" | "Misleading" | "Skip";
const VERDICT_COLOR: Record<Verdict, string> = {
  "Holds up":     T.tierA,
  "Partly true":  T.tierB,
  "Misleading":   T.tierC,
  "Skip":         T.tierD,
};

type Item = {
  n: string;
  date: string;
  source: string;
  claim: string;
  reality: string;
  verdict: Verdict;
  category: string;
  tier: "A" | "B" | "C" | "D";
  trend: "up" | "down" | "flat";
  reviewer: "Dr. Paul" | "Dr. Sundeep";
  excerpt?: string;
  hero?: boolean;
};

const ITEMS: Item[] = [
  {
    n: "014",
    date: "20 APR 2026",
    source: "TikTok · 4.2M views",
    claim: "Beef tallow restores your skin barrier better than ceramide creams.",
    reality: "Tallow is occlusive and can soothe in the short term, but contains no ceramides and lacks any RCT vs a ceramide formulation. The barrier 'restoration' you feel is mostly the occlusion.",
    verdict: "Misleading",
    category: "Ingredient claim",
    tier: "C",
    trend: "up",
    reviewer: "Dr. Sundeep",
    hero: true,
    excerpt: "We tracked the original 90-second video, the three subsequent 'before/afters,' and the manufacturer pages it linked to. There is no clinical comparison. The claim relies entirely on user testimonial and on conflating 'feels nice' with 'restores barrier function.' For most barrier dysfunction we still recommend a ceramide-and-cholesterol stack, with an occlusive layer on top if you want one.",
  },
  {
    n: "013", date: "13 APR 2026", source: "Instagram · derm-influencer",
    claim: "Niacinamide above 5% causes flushing and skin damage.",
    reality: "Tolerability ceilings vary, but the headline overstates the data. Most adult skin tolerates 5–10% niacinamide; flushing is rare, transient, and almost always cosmetic.",
    verdict: "Partly true", category: "Ingredient claim", tier: "B", trend: "flat", reviewer: "Dr. Paul",
  },
  {
    n: "012", date: "06 APR 2026", source: "Brand campaign · global launch",
    claim: "A new SPF molecule offers '8 hours of UV protection from a single morning application.'",
    reality: "Photostability does not equal substantivity. Sunscreen reapplication is needed because of physical removal, sweat, and rub-off. The molecule is excellent. The claim is marketing.",
    verdict: "Misleading", category: "Sunscreen claim", tier: "C", trend: "up", reviewer: "Dr. Sundeep",
  },
  {
    n: "011", date: "30 MAR 2026", source: "YouTube · 1.1M views",
    claim: "Snail mucin is identical to a peptide serum.",
    reality: "Snail filtrate contains glycoproteins, hyaluronic acid, and trace peptides. Useful — but not interchangeable with a targeted Matrixyl-class peptide blend. Different molecules, different evidence, different dose.",
    verdict: "Skip", category: "Ingredient swap", tier: "D", trend: "down", reviewer: "Dr. Paul",
  },
  {
    n: "010", date: "23 MAR 2026", source: "Print · skincare media",
    claim: "Tranexamic acid topical 'cures' melasma in six weeks.",
    reality: "Topical tranexamic acid has good supporting RCTs at 3–5%, but melasma recurs without strict UV avoidance. 'Cures' is the wrong word for a chronic relapsing condition.",
    verdict: "Partly true", category: "Pigmentation claim", tier: "B", trend: "flat", reviewer: "Dr. Sundeep",
  },
  {
    n: "009", date: "16 MAR 2026", source: "Wellness brand · DTC",
    claim: "Drinking 'exosome elixirs' rejuvenates skin from the inside.",
    reality: "Oral peptide soup, broken down by gastric acid before it reaches anything. No human skin RCTs. Save the spend for SPF and a retinoid.",
    verdict: "Skip", category: "Supplement claim", tier: "D", trend: "down", reviewer: "Dr. Paul",
  },
  {
    n: "008", date: "09 MAR 2026", source: "Reddit megathread",
    claim: "Slugging with petrolatum cures retinoid irritation.",
    reality: "It buffers retinoid sting and improves transepidermal water loss overnight. 'Cures' overstates it; manages it. Acne-prone skin should patch test first.",
    verdict: "Holds up", category: "Routine technique", tier: "A", trend: "flat", reviewer: "Dr. Paul",
  },
  {
    n: "007", date: "02 MAR 2026", source: "Brand launch · India",
    claim: "Vitamin C 30% delivers 3× more brightening than 10%.",
    reality: "Penetration of L-ascorbic acid plateaus around 20%. Higher concentrations correlate with more irritation, not more efficacy. 10–15% is the published sweet spot.",
    verdict: "Misleading", category: "Brightening claim", tier: "C", trend: "up", reviewer: "Dr. Sundeep",
  },
];

const VerdictPill: React.FC<{ v: Verdict; small?: boolean }> = ({ v, small }) => (
  <span style={{
    fontFamily: MONO, fontSize: small ? 9.5 : 10.5, letterSpacing: "0.16em", textTransform: "uppercase",
    color: VERDICT_COLOR[v], padding: small ? "3px 8px" : "5px 11px",
    border: `1px solid ${VERDICT_COLOR[v]}`, borderRadius: 999, fontWeight: 600,
    background: T.paper,
  }}>{v}</span>
);

const TrendIcon: React.FC<{ trend: Item["trend"] }> = ({ trend }) => {
  if (trend === "up") return <TrendingUp className="h-3.5 w-3.5" style={{ color: T.tierD }} />;
  if (trend === "down") return <TrendingDown className="h-3.5 w-3.5" style={{ color: T.tierA }} />;
  return <Minus className="h-3.5 w-3.5" style={{ color: T.muted }} />;
};

const TrendWatch: React.FC = () => {
  const hero = ITEMS.find(i => i.hero)!;
  const rest = ITEMS.filter(i => !i.hero);

  return (
    <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
      <LaidPaper />
      <SiteHeader active="Trend Watch" />
      <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Trend Watch" }]} />

      {/* MASTHEAD */}
      <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
        <TopVignette />
        <PaperGrain />
        <ColumnRules opacity={0.32} />
        <div aria-hidden className="absolute -right-24 -top-12 z-0"><AmbientFlask size={520} opacity={0.06} /></div>

        <Container>
          <div className="relative grid grid-cols-12 gap-10 py-24">
            <div className="absolute left-0 top-24 bottom-24 hidden lg:flex flex-col items-center justify-between" style={{ width: 24 }}>
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>SECTION 07 / TREND WATCH</span>
              <div className="h-px w-3" style={{ background: T.rule }} />
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>WEEKLY · ISSUE 014</span>
            </div>

            <div className="col-span-12 lg:col-span-8 lg:pl-12">
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
                <Eyebrow color={T.accent}>Trend Watch · The Receipts Column</Eyebrow>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>P. 13 · COLUMN</div>
              </div>

              <h1 className="mt-10" style={{ fontFamily: SERIF, fontSize: 110, lineHeight: 0.93, letterSpacing: "-0.045em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
                We watch <br />
                <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>so you don't.</span>
              </h1>

              <p className="mt-10 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>
                Every Monday we publish eight new claims circulating in skincare media — the viral, the brand-launched, the reasonable-sounding — and grade each one against the literature. The claim. The reality. Our verdict. The original source. No engagement bait, no pile-ons.
              </p>
            </div>

            <aside className="col-span-12 lg:col-span-4 lg:flex lg:items-end">
              <div className="border p-7 w-full" style={{ borderColor: T.rule, background: T.paper2 }}>
                <Eyebrow>This issue · 014</Eyebrow>
                <ul className="mt-5 space-y-3" style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft }}>
                  {[
                    ["Holds up", "1"],
                    ["Partly true", "2"],
                    ["Misleading", "3"],
                    ["Skip", "2"],
                  ].map(([v, c]) => (
                    <li key={v} className="flex items-baseline justify-between gap-3 border-b pb-2" style={{ borderColor: T.ruleSoft }}>
                      <VerdictPill v={v as Verdict} small />
                      <span style={{ fontFamily: SERIF, fontSize: 22, color: T.ink, fontVariationSettings: '"opsz" 144' }}>{c}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 pt-3 border-t" style={{ borderColor: T.rule, fontFamily: MONO, fontSize: 10, color: T.mutedSoft, letterSpacing: "0.16em", textTransform: "uppercase" }}>
                  Eight claims · Reviewed in ≈ 4 hours
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {/* HERO LEAD STORY */}
      <section className="relative z-10 py-20 border-b" style={{ borderColor: T.rule, background: T.paper2 }}>
        <Container>
          <div className="border-b pb-5 mb-10 flex items-end justify-between" style={{ borderColor: T.rule }}>
            <div>
              <Eyebrow color={T.tierD}>The lead claim · This week</Eyebrow>
              <h2 className="mt-3" style={{ fontFamily: SERIF, fontSize: 40, fontWeight: 400, letterSpacing: "-0.025em", color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
                The one we keep <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>getting asked.</span>
              </h2>
            </div>
            <span style={{ fontFamily: MONO, fontSize: 10.5, color: T.mutedSoft, letterSpacing: "0.1em" }}>NO. {hero.n} · {hero.date}</span>
          </div>

          <div className="grid grid-cols-12 gap-10">
            <div className="col-span-12 lg:col-span-7">
              <div className="flex items-center gap-3 mb-6">
                <VerdictPill v={hero.verdict} />
                <span style={{ fontFamily: MONO, fontSize: 10.5, color: T.mutedSoft, letterSpacing: "0.16em", textTransform: "uppercase" }}>{hero.category} · {hero.source}</span>
                <TrendIcon trend={hero.trend} />
              </div>

              <blockquote style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1.05, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                <span style={{ color: T.accent, fontFamily: SERIF_ED, fontStyle: "italic", fontSize: 70, lineHeight: 0.5, verticalAlign: "-0.18em", marginRight: 4 }}>"</span>
                {hero.claim}
                <span style={{ color: T.accent, fontFamily: SERIF_ED, fontStyle: "italic", fontSize: 70, lineHeight: 0.5, verticalAlign: "-0.18em", marginLeft: 4 }}>"</span>
              </blockquote>

              <Asterism />

              <div className="mt-6">
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.18em", color: T.accent, textTransform: "uppercase" }}>The reality</div>
                <p className="mt-4" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.6, color: T.inkSoft }}>
                  <span style={{ float: "left", fontFamily: SERIF, fontSize: 80, lineHeight: 0.85, fontWeight: 400, fontVariationSettings: '"opsz" 144', color: T.ink, paddingRight: 12, paddingTop: 6 }}>{hero.reality.charAt(0)}</span>
                  {hero.reality.slice(1)}
                </p>
                <p className="mt-6" style={{ fontFamily: SERIF, fontSize: 18, lineHeight: 1.65, color: T.muted, fontStyle: "italic" }}>
                  {hero.excerpt}
                </p>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <a href="#" className="inline-flex items-center gap-2" style={{ fontFamily: SANS, fontSize: 13, color: T.accent, textDecoration: "underline", textUnderlineOffset: 4 }}>
                  Read the full review <ArrowRight className="h-3 w-3" />
                </a>
                <span style={{ color: T.muted }}>·</span>
                <a href="#" className="inline-flex items-center gap-1" style={{ fontFamily: SANS, fontSize: 13, color: T.muted }}>
                  Original source <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Reviewer card */}
            <aside className="col-span-12 lg:col-span-5">
              <div className="border p-7" style={{ borderColor: T.rule, background: T.paper }}>
                <Eyebrow>Reviewer's note</Eyebrow>
                <p className="mt-4" style={{ fontFamily: SERIF, fontSize: 18, lineHeight: 1.6, color: T.inkSoft, fontStyle: "italic" }}>
                  "We are not anti-tallow. We are anti-overstated claims for products that have never been compared to the standard of care. The bar for 'restores skin barrier' should be a barrier-function measurement, not a glow."
                </p>
                <div className="mt-6 flex items-center gap-4 pt-4 border-t" style={{ borderColor: T.rule }}>
                  <div className="rounded-full" style={{ width: 56, height: 56, background: `linear-gradient(135deg, ${T.accent}, ${T.ink})` }} />
                  <div>
                    <div style={{ fontFamily: SERIF, fontSize: 19, color: T.ink, fontVariationSettings: '"opsz" 144' }}>{hero.reviewer}</div>
                    <div style={{ fontFamily: MONO, fontSize: 10, color: T.mutedSoft, letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 2 }}>Medical Review Lead</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 border p-6" style={{ borderColor: T.rule, background: T.paper2 }}>
                <Eyebrow>Trend trajectory</Eyebrow>
                <div className="mt-4 flex items-baseline justify-between">
                  <span style={{ fontFamily: SERIF, fontSize: 36, fontWeight: 400, color: T.tierD, fontVariationSettings: '"opsz" 144, "SOFT" 30', letterSpacing: "-0.02em" }}>↑ Rising</span>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: T.mutedSoft, letterSpacing: "0.14em" }}>+340% / 30 D</span>
                </div>
                <p className="mt-3" style={{ fontFamily: SERIF, fontSize: 14, lineHeight: 1.5, color: T.muted, fontStyle: "italic" }}>
                  Driven by three creator videos crossing one million views since the start of April.
                </p>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {/* THE LIST */}
      <section className="relative z-10 py-20" style={{ background: T.paper }}>
        <Container>
          <div className="border-b pb-5 mb-10 flex items-end justify-between" style={{ borderColor: T.rule }}>
            <h2 style={{ fontFamily: SERIF, fontSize: 44, fontWeight: 400, color: T.ink, letterSpacing: "-0.025em", fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
              The rest of <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>this issue.</span>
            </h2>
            <span style={{ fontFamily: MONO, fontSize: 10.5, color: T.mutedSoft, letterSpacing: "0.1em" }}>SEVEN MORE CLAIMS</span>
          </div>

          <div className="border-t" style={{ borderColor: T.rule }}>
            {rest.map((item, i) => (
              <article key={item.n} className="grid grid-cols-12 gap-6 py-8 border-b" style={{ borderColor: T.ruleSoft }}>
                {/* Folio */}
                <div className="col-span-12 md:col-span-1">
                  <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", color: T.mutedSoft }}>NO.</div>
                  <div style={{ fontFamily: SERIF, fontSize: 36, fontWeight: 400, color: T.accent, lineHeight: 0.9, fontVariationSettings: '"opsz" 144, "SOFT" 30', letterSpacing: "-0.03em" }}>{item.n}</div>
                  <div className="mt-2" style={{ fontFamily: MONO, fontSize: 10, color: T.muted, letterSpacing: "0.12em" }}>{item.date}</div>
                </div>

                {/* Claim */}
                <div className="col-span-12 md:col-span-7">
                  <div className="flex items-center gap-2 mb-3">
                    <VerdictPill v={item.verdict} small />
                    <span style={{ fontFamily: MONO, fontSize: 10, color: T.mutedSoft, letterSpacing: "0.14em", textTransform: "uppercase" }}>{item.category} · {item.source}</span>
                    <TrendIcon trend={item.trend} />
                  </div>
                  <blockquote style={{ fontFamily: SERIF, fontSize: 26, lineHeight: 1.25, fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144', letterSpacing: "-0.015em" }}>
                    <span style={{ color: T.accent, fontFamily: SERIF_ED, fontStyle: "italic" }}>"</span>{item.claim}<span style={{ color: T.accent, fontFamily: SERIF_ED, fontStyle: "italic" }}>"</span>
                  </blockquote>
                  <p className="mt-3" style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.55, color: T.muted, fontStyle: "italic" }}>
                    {item.reality}
                  </p>
                </div>

                {/* Reviewer */}
                <div className="col-span-6 md:col-span-2">
                  <div style={{ fontFamily: MONO, fontSize: 10, color: T.mutedSoft, letterSpacing: "0.14em", textTransform: "uppercase" }}>Reviewer</div>
                  <div className="mt-2" style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, fontStyle: "italic" }}>{item.reviewer}</div>
                </div>

                {/* CTA */}
                <div className="col-span-6 md:col-span-2 md:text-right">
                  <a href="#" className="inline-flex items-center gap-1.5" style={{ fontFamily: SANS, fontSize: 12.5, color: T.accent, fontWeight: 500 }}>
                    Full review <ArrowRight className="h-3 w-3" />
                  </a>
                  <div className="mt-2" style={{ fontFamily: MONO, fontSize: 10, color: T.mutedSoft, letterSpacing: "0.12em" }}>EVIDENCE TIER {item.tier}</div>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* SUBSCRIBE / ARCHIVE */}
      <section className="relative z-10 py-24 border-y" style={{ borderColor: T.rule, background: T.ink, color: T.paper }}>
        <Container>
          <div className="grid grid-cols-12 gap-10 items-end">
            <div className="col-span-12 lg:col-span-7">
              <Eyebrow color={T.invertAccent}>Mondays · 06:30 IST</Eyebrow>
              <h2 className="mt-5" style={{ fontFamily: SERIF, fontSize: 60, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', letterSpacing: "-0.03em", color: T.paper }}>
                Eight claims, <span style={{ fontStyle: "italic", color: T.invertAccent, fontFamily: SERIF_ED }}>one inbox.</span>
              </h2>
              <p className="mt-6 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 18, lineHeight: 1.6, color: T.invertMuted }}>
                Trend Watch is the only thing we email. No tracking pixels, no affiliate links, no upsell. Unsubscribe in two clicks. We've published forty-six issues without missing a Monday.
              </p>
            </div>
            <div className="col-span-12 lg:col-span-5">
              <form className="flex flex-col gap-3">
                <label style={{ fontFamily: MONO, fontSize: 10, color: T.invertMuted, letterSpacing: "0.16em", textTransform: "uppercase" }}>Your email</label>
                <input type="email" placeholder="reader@whatworksskin.com" className="px-5 py-4 w-full" style={{ background: "transparent", border: `1px solid ${T.invertMuted}`, color: T.paper, fontFamily: SANS, fontSize: 14 }} />
                <button className="inline-flex items-center justify-center gap-2 px-5 py-4" style={{ background: T.paper, color: T.ink, fontFamily: SANS, fontSize: 13, fontWeight: 500 }}>
                  Receive Trend Watch <ArrowRight className="h-4 w-4" />
                </button>
                <a href="#" style={{ fontFamily: SANS, fontSize: 12, color: T.invertMuted, textAlign: "center", textDecoration: "underline" }}>
                  Browse the full archive · 46 issues
                </a>
              </form>
            </div>
          </div>
        </Container>
      </section>

      <SiteFooter />
    </div>
  );
};

export default TrendWatch;
