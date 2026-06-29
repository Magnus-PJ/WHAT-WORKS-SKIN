// Methodology — the trust spine of the publication.
// How we research, grade, review, declare conflicts, and update.

import React from "react";
import { ArrowRight, Check, X, FileText } from "lucide-react";
import { T, tierColor } from "./_theme";
import {
  SiteHeader, SiteFooter, Breadcrumbs, Container, Eyebrow, Folio, TierBadge,
  PaperGrain, LaidPaper, ColumnRules, TopVignette, Asterism, AmbientFlask,
  SERIF, SERIF_ED, SANS, MONO,
} from "./_chrome";

const TOC = [
  ["01", "Editorial principles"],
  ["02", "How we grade ingredients"],
  ["03", "How we grade products"],
  ["04", "How we grade supplements"],
  ["05", "Conflicts of interest"],
  ["06", "Review cadence"],
  ["07", "Corrections policy"],
  ["08", "Funding"],
];

const PRINCIPLES = [
  { n: "01", h: "Independence first.", b: "We earn no affiliate revenue, accept no brand sponsorship, and refuse PR samples." },
  { n: "02", h: "Evidence, then experience.",     b: "If an RCT contradicts what we see in clinic, we say both. The trial is the headline." },
  { n: "03", h: "Specificity over hedging.",     b: "If a product works, we say so. If it doesn't, we say so. No 'may help' wallpaper." },
  { n: "04", h: "Update or retire.",             b: "Every guide is reviewed at least every 12 months. If it can't be updated, it is retired." },
  { n: "05", h: "Make the boring honourable.",   b: "We do not chase novelty. We chase the molecule that holds up across replications." },
  { n: "06", h: "Two reviewers minimum.",        b: "Dr. Paul leads research; Dr. Sundeep leads medical review. Both sign every guide." },
];

const RUBRIC = [
  { tier: "A" as const, evidence: "≥ 2 RCTs, n > 50, vehicle-controlled, replicated end-points", consensus: "International guideline body lists as standard of care", recommended: "Recommended without qualification" },
  { tier: "B" as const, evidence: "1 RCT or strong observational data; mechanism well-established", consensus: "Mainstream practitioner adoption", recommended: "Recommended for the right person, with caveats" },
  { tier: "C" as const, evidence: "Mixed or modest data; small studies; preliminary signals", consensus: "Some practitioner support, no consensus", recommended: "Optional; try if low-cost and low-risk" },
  { tier: "D" as const, evidence: "No human evidence, contradicted by trials, or marketing-only claims", consensus: "Marketing exceeds science", recommended: "Skip" },
];

const Methodology: React.FC = () => {
  return (
    <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
      <LaidPaper />
      <SiteHeader active="Methodology" />
      <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Methodology" }]} />

      {/* MASTHEAD */}
      <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
        <TopVignette />
        <PaperGrain />
        <ColumnRules opacity={0.32} />
        <div aria-hidden className="absolute -right-24 -top-12 z-0"><AmbientFlask size={520} opacity={0.06} /></div>

        <Container>
          <div className="relative grid grid-cols-12 gap-10 py-24">
            <div className="absolute left-0 top-24 bottom-24 hidden lg:flex flex-col items-center justify-between" style={{ width: 24 }}>
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>SECTION 08 / METHODOLOGY</span>
              <div className="h-px w-3" style={{ background: T.rule }} />
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.3em", color: T.mutedSoft, writingMode: "vertical-rl", transform: "rotate(180deg)" }}>RUBRIC v1.0 · 2026</span>
            </div>

            <div className="col-span-12 lg:col-span-8 lg:pl-12">
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
                <Eyebrow color={T.accent}>Methodology · The Trust Spine</Eyebrow>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>P. 14 · DOSSIER</div>
              </div>

              <h1 className="mt-10" style={{ fontFamily: SERIF, fontSize: 110, lineHeight: 0.93, letterSpacing: "-0.045em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
                How we <br />
                <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>grade.</span>
              </h1>

              <p className="mt-10 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>
                Every claim on this site is filtered through the same rubric. This page is the rubric — written down, signed by both editors, updated quarterly, and open to challenge. If something feels wrong on a guide page, it should be checkable against the rules below.
              </p>
            </div>

            <aside className="col-span-12 lg:col-span-4 lg:flex lg:items-end">
              <div className="border p-7 w-full" style={{ borderColor: T.rule, background: T.paper2 }}>
                <Eyebrow color={T.accent}>Headline numbers</Eyebrow>
                <dl className="mt-5 divide-y" style={{ borderColor: T.rule }}>
                  {[
                    ["Guides published",       "184"],
                    ["Avg. sources per guide", "11"],
                    ["Reviewers per guide",    "2 minimum"],
                    ["Update cycle",           "12 months max"],
                    ["Affiliate revenue",      "₹ 0"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-baseline justify-between py-3" style={{ borderColor: T.ruleSoft }}>
                      <dt style={{ fontFamily: MONO, fontSize: 10.5, color: T.mutedSoft, letterSpacing: "0.14em", textTransform: "uppercase" }}>{k}</dt>
                      <dd style={{ fontFamily: SERIF, fontSize: 22, color: T.ink, fontVariationSettings: '"opsz" 144' }}>{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {/* BODY */}
      <Container>
        <div className="grid grid-cols-12 gap-10 py-20">
          <aside className="col-span-12 lg:col-span-3">
            <div className="lg:sticky lg:top-8">
              <Eyebrow>Inside this dossier</Eyebrow>
              <ol className="mt-5 space-y-2">
                {TOC.map(([n, t], i) => (
                  <li key={n} className="flex items-baseline gap-3 py-1" style={{ paddingLeft: i === 0 ? 12 : 0, borderLeft: i === 0 ? `2px solid ${T.accent}` : "none" }}>
                    <span style={{ fontFamily: MONO, fontSize: 10, color: i === 0 ? T.accent : T.mutedSoft, letterSpacing: "0.14em" }}>{n}</span>
                    <span style={{ fontFamily: SERIF, fontSize: 15, color: i === 0 ? T.ink : T.inkSoft, lineHeight: 1.3 }}>{t}</span>
                  </li>
                ))}
              </ol>

              <div className="mt-12 border p-5" style={{ borderColor: T.rule, background: T.paper2 }}>
                <Eyebrow>Download</Eyebrow>
                <p className="mt-3" style={{ fontFamily: SERIF, fontSize: 14, color: T.muted, fontStyle: "italic", lineHeight: 1.5 }}>
                  The full methodology dossier (12 pp) as a single PDF.
                </p>
                <a href="#" className="mt-4 inline-flex items-center gap-2" style={{ fontFamily: SANS, fontSize: 12, color: T.accent, textDecoration: "underline" }}>
                  <FileText className="h-3.5 w-3.5" /> methodology-v1.0.pdf
                </a>
              </div>
            </div>
          </aside>

          <div className="col-span-12 lg:col-span-9">
            {/* §01 PRINCIPLES */}
            <article>
              <Folio>§ 01</Folio>
              <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                Editorial <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>principles.</span>
              </h2>
              <p className="mt-7 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.65, color: T.inkSoft }}>
                Six rules that shape every page. They predate the rubric. They are the reason the rubric exists at all.
              </p>

              <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-0 border" style={{ borderColor: T.rule }}>
                {PRINCIPLES.map((p, i) => (
                  <div key={p.n} className="p-7" style={{
                    borderRight: (i % 2 === 0) ? `1px solid ${T.rule}` : "none",
                    borderTop: i >= 2 ? `1px solid ${T.rule}` : "none",
                    background: i % 2 === 0 ? T.paper : T.paper2,
                  }}>
                    <span style={{ fontFamily: SERIF, fontSize: 60, fontWeight: 400, color: T.accent, lineHeight: 0.85, fontVariationSettings: '"opsz" 144, "SOFT" 30', letterSpacing: "-0.04em" }}>{p.n}</span>
                    <h3 className="mt-5" style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144', lineHeight: 1.2, letterSpacing: "-0.015em" }}>{p.h}</h3>
                    <p className="mt-3" style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.6, color: T.muted }}>{p.b}</p>
                  </div>
                ))}
              </div>
            </article>

            <Asterism />

            {/* §02 INGREDIENT RUBRIC */}
            <article>
              <Folio>§ 02</Folio>
              <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                The four-tier <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>rubric.</span>
              </h2>
              <p className="mt-7 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.65, color: T.inkSoft }}>
                Tiers A–D apply to ingredients, products, and supplements alike. The criteria differ slightly by category (below). The badge stays the same so you can read it at a glance across the site.
              </p>

              <div className="mt-10 border" style={{ borderColor: T.rule }}>
                <div className="grid grid-cols-12 gap-3 px-5 py-3 border-b" style={{ borderColor: T.rule, background: T.paper2, fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.mutedSoft, textTransform: "uppercase" }}>
                  <div className="col-span-1">Tier</div>
                  <div className="col-span-5">Evidence threshold</div>
                  <div className="col-span-3">Consensus</div>
                  <div className="col-span-3">What we say</div>
                </div>
                {RUBRIC.map(r => (
                  <div key={r.tier} className="grid grid-cols-12 gap-3 px-5 py-6 border-b items-baseline" style={{ borderColor: T.ruleSoft }}>
                    <div className="col-span-1"><TierBadge tier={r.tier} /></div>
                    <div className="col-span-5" style={{ fontFamily: SERIF, fontSize: 16, color: T.inkSoft, lineHeight: 1.5 }}>{r.evidence}</div>
                    <div className="col-span-3" style={{ fontFamily: SERIF, fontSize: 15, color: T.muted, lineHeight: 1.5, fontStyle: "italic" }}>{r.consensus}</div>
                    <div className="col-span-3" style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.4 }}>{r.recommended}</div>
                  </div>
                ))}
              </div>
            </article>

            <Asterism />

            {/* §03–04 ADJUSTMENTS */}
            <article className="grid grid-cols-12 gap-6">
              <div className="col-span-12 md:col-span-6">
                <Folio>§ 03</Folio>
                <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 36, lineHeight: 1.05, fontWeight: 400, fontVariationSettings: '"opsz" 144', color: T.ink, letterSpacing: "-0.02em" }}>
                  Adjustments for <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>products.</span>
                </h2>
                <p className="mt-5" style={{ fontFamily: SERIF, fontSize: 16.5, lineHeight: 1.65, color: T.inkSoft }}>
                  A product Tier reflects the formulation as a whole — not just the active. We assess: in-spec dose of the active, vehicle quality (penetration / stability), realistic price-per-use, and complete ingredient list (we down-grade for known sensitisers in unnecessary positions).
                </p>
                <ul className="mt-5 space-y-2.5" style={{ fontFamily: SERIF, fontSize: 15.5, color: T.inkSoft, lineHeight: 1.5 }}>
                  {["Active concentration verified", "Vehicle pH where relevant", "Compatibility with claimed routine", "No known issue ingredients without reason"].map(s => (
                    <li key={s} className="flex gap-2 items-baseline"><Check className="h-3.5 w-3.5" style={{ color: T.accent }} />{s}</li>
                  ))}
                </ul>
              </div>

              <div className="col-span-12 md:col-span-6">
                <Folio>§ 04</Folio>
                <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 36, lineHeight: 1.05, fontWeight: 400, fontVariationSettings: '"opsz" 144', color: T.ink, letterSpacing: "-0.02em" }}>
                  Adjustments for <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>supplements.</span>
                </h2>
                <p className="mt-5" style={{ fontFamily: SERIF, fontSize: 16.5, lineHeight: 1.65, color: T.inkSoft }}>
                  Supplement tiers weight bioavailability, third-party testing, and human (not in-vitro) outcomes more heavily. Anything Rx-only carries a parallel safety review by Dr. Sundeep before publication.
                </p>
                <ul className="mt-5 space-y-2.5" style={{ fontFamily: SERIF, fontSize: 15.5, color: T.inkSoft, lineHeight: 1.5 }}>
                  {["Human RCTs, not in-vitro", "Standardised extract documented", "Realistic real-world dose", "Drug-interaction and pregnancy review"].map(s => (
                    <li key={s} className="flex gap-2 items-baseline"><Check className="h-3.5 w-3.5" style={{ color: T.accent }} />{s}</li>
                  ))}
                </ul>
              </div>
            </article>

            <Asterism />

            {/* §05 CONFLICTS */}
            <article>
              <Folio>§ 05</Folio>
              <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                Conflicts of <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>interest.</span>
              </h2>
              <p className="mt-7 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.65, color: T.inkSoft }}>
                We declare every relationship our editors have with the industry. Both editors clinical-practice; that practice is disclosed. Any product, brand, or molecule discussed on this site that touches an editor's practice is reviewed by the other editor only.
              </p>

              <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-0 border" style={{ borderColor: T.rule }}>
                <div className="p-7" style={{ borderRight: `1px solid ${T.rule}`, background: T.paper2 }}>
                  <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", color: T.tierA, textTransform: "uppercase", fontWeight: 600 }}>What we accept</div>
                  <ul className="mt-5 space-y-3" style={{ fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.55, color: T.inkSoft }}>
                    {[
                      "Reader donations (rare, capped, listed)",
                      "Publication revenue (book, course)",
                      "Honoraria for academic teaching (declared)",
                    ].map(s => (
                      <li key={s} className="flex gap-2 items-baseline"><Check className="h-3.5 w-3.5 mt-0.5" style={{ color: T.tierA }} />{s}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-7" style={{ background: T.paper }}>
                  <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", color: T.tierD, textTransform: "uppercase", fontWeight: 600 }}>What we never accept</div>
                  <ul className="mt-5 space-y-3" style={{ fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.55, color: T.inkSoft }}>
                    {[
                      "Affiliate links of any kind",
                      "Brand sponsorship or display ads",
                      "PR product samples",
                      "Paid placement in Trend Watch or guides",
                    ].map(s => (
                      <li key={s} className="flex gap-2 items-baseline"><X className="h-3.5 w-3.5 mt-0.5" style={{ color: T.tierD }} />{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>

            <Asterism />

            {/* §06 CADENCE */}
            <article>
              <Folio>§ 06</Folio>
              <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                Review <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>cadence.</span>
              </h2>

              <div className="mt-9 border" style={{ borderColor: T.rule }}>
                {[
                  ["WEEKLY",   "Trend Watch",            "Eight new claims graded each Monday."],
                  ["MONTHLY",  "Sources sweep",          "Every guide checked against new publications in the last 30 days."],
                  ["QUARTERLY","Tier audit",             "Reassign any guide where new evidence has shifted the tier."],
                  ["ANNUAL",   "Full editorial review",  "Every guide read end-to-end by the second editor; retired if not defensible."],
                ].map(([k, t, b], i) => (
                  <div key={k} className="grid grid-cols-12 gap-4 px-6 py-5 items-baseline border-b" style={{ borderColor: i === 3 ? "transparent" : T.ruleSoft }}>
                    <div className="col-span-2" style={{ fontFamily: MONO, fontSize: 11, color: T.accent, letterSpacing: "0.18em", fontWeight: 600 }}>{k}</div>
                    <div className="col-span-3" style={{ fontFamily: SERIF, fontSize: 19, color: T.ink, fontVariationSettings: '"opsz" 144', lineHeight: 1.25 }}>{t}</div>
                    <div className="col-span-7" style={{ fontFamily: SERIF, fontSize: 16, color: T.muted, fontStyle: "italic", lineHeight: 1.55 }}>{b}</div>
                  </div>
                ))}
              </div>
            </article>

            <Asterism />

            {/* §07 CORRECTIONS */}
            <article className="grid grid-cols-12 gap-6">
              <div className="col-span-12 md:col-span-7">
                <Folio>§ 07</Folio>
                <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 44, lineHeight: 1.05, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                  Corrections <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>policy.</span>
                </h2>
                <p className="mt-6" style={{ fontFamily: SERIF, fontSize: 17.5, lineHeight: 1.65, color: T.inkSoft }}>
                  If something on the site is wrong, we want to know. Substantive errors are corrected within seven days, with a dated note at the foot of the page describing what changed and why. We do not silently edit. The corrections log is public.
                </p>
                <a href="#" className="mt-6 inline-flex items-center gap-2" style={{ fontFamily: SANS, fontSize: 13, color: T.accent, textDecoration: "underline", textUnderlineOffset: 4 }}>
                  Read the corrections log <ArrowRight className="h-3 w-3" />
                </a>
              </div>
              <aside className="col-span-12 md:col-span-5">
                <div className="border p-6" style={{ borderColor: T.rule, background: T.paper2 }}>
                  <Eyebrow>Last 12 months</Eyebrow>
                  <dl className="mt-4 divide-y" style={{ borderColor: T.rule }}>
                    {[
                      ["Substantive corrections", "7"],
                      ["Tier downgrades", "11"],
                      ["Tier upgrades", "4"],
                      ["Guides retired", "3"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-baseline justify-between py-3" style={{ borderColor: T.ruleSoft }}>
                        <dt style={{ fontFamily: MONO, fontSize: 10.5, color: T.mutedSoft, letterSpacing: "0.14em", textTransform: "uppercase" }}>{k}</dt>
                        <dd style={{ fontFamily: SERIF, fontSize: 22, color: T.ink, fontVariationSettings: '"opsz" 144' }}>{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </aside>
            </article>

            <Asterism />

            {/* §08 FUNDING */}
            <article>
              <Folio>§ 08</Folio>
              <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
                Where the money <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>comes from.</span>
              </h2>
              <p className="mt-7 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.65, color: T.inkSoft }}>
                The site costs roughly ₹ 18,000 a month to run (hosting, citation tools, a research assistant). It is funded by reader donations and the editors' clinical practice. The complete annual budget is published every January.
              </p>

              <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-0 border" style={{ borderColor: T.rule }}>
                {[
                  ["Reader donations", "62%", "1,840 donors · capped at ₹ 5,000"],
                  ["Editor practice",  "31%", "Subsidised by clinical income"],
                  ["Speaking / books", "7%",  "Non-recurring, declared"],
                ].map(([k, v, n], i) => (
                  <div key={k} className="p-7" style={{ borderRight: i < 2 ? `1px solid ${T.rule}` : "none", background: i === 0 ? T.paper : T.paper2 }}>
                    <Eyebrow>{k}</Eyebrow>
                    <div className="mt-3" style={{ fontFamily: SERIF, fontSize: 60, fontWeight: 400, color: T.accent, lineHeight: 0.9, fontVariationSettings: '"opsz" 144, "SOFT" 30', letterSpacing: "-0.04em" }}>{v}</div>
                    <p className="mt-3" style={{ fontFamily: SERIF, fontSize: 14.5, color: T.muted, fontStyle: "italic", lineHeight: 1.55 }}>{n}</p>
                  </div>
                ))}
              </div>
            </article>

            {/* SIGN-OFF */}
            <div className="mt-16 border-t pt-10" style={{ borderColor: T.rule }}>
              <div className="grid grid-cols-2 gap-10">
                {["Dr. Paul · Research Lead", "Dr. Sundeep · Medical Review Lead"].map(name => (
                  <div key={name}>
                    <div style={{ fontFamily: SERIF_ED, fontSize: 38, color: T.ink, fontStyle: "italic", lineHeight: 1, letterSpacing: "-0.01em" }}>
                      {name.split(" ")[1]}
                    </div>
                    <div className="mt-3" style={{ fontFamily: MONO, fontSize: 10, color: T.mutedSoft, letterSpacing: "0.14em", textTransform: "uppercase" }}>{name}</div>
                  </div>
                ))}
              </div>
              <p className="mt-10" style={{ fontFamily: SERIF, fontSize: 14, color: T.muted, fontStyle: "italic" }}>
                Dossier last updated 2026-04-02. Signed by both editors. Public PDF on file.
              </p>
            </div>
          </div>
        </div>
      </Container>

      <SiteFooter />
    </div>
  );
};

export default Methodology;
