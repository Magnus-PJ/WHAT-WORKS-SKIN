import React from "react";
import { ArrowRight, AlertCircle, FileText, RefreshCw, XCircle } from "lucide-react";
import {
  SiteHeader, SiteFooter, Breadcrumbs, Container, Eyebrow, Folio, Asterism,
  TopVignette, LaidPaper, PaperGrain, AmbientFlask, SERIF, SERIF_ED, SANS, MONO,
} from "./_chrome";
import { T } from "./_theme";

type Severity = "Typo" | "Clarification" | "Factual" | "Interpretive" | "Retraction";

const SEV_META: Record<Severity, { c: string; bg: string; icon: React.ReactNode; weight: number }> = {
  "Typo":          { c: T.muted,  bg: T.paper2,    icon: <FileText className="h-3 w-3" />,    weight: 1 },
  "Clarification": { c: T.tierC,  bg: T.tierCsoft, icon: <RefreshCw className="h-3 w-3" />,   weight: 2 },
  "Factual":       { c: T.tierB,  bg: T.tierBsoft, icon: <AlertCircle className="h-3 w-3" />, weight: 3 },
  "Interpretive":  { c: T.warning,bg: T.warningSoft, icon: <AlertCircle className="h-3 w-3" />, weight: 4 },
  "Retraction":    { c: T.tierD,  bg: T.tierDsoft, icon: <XCircle className="h-3 w-3" />,     weight: 5 },
};

type Correction = {
  date: string; page: string; severity: Severity; what: string; why: string; ttf: string; logged: string;
};

const CORRECTIONS: Correction[] = [
  { date: "18 April 2026", page: "Trend Watch · Issue 12 — Collagen drinks",
    severity: "Interpretive", what: "Verdict on hydrolysed collagen split into two endpoints (elasticity vs wrinkle depth). Original blanket grade was too generous on wrinkle data.",
    why: "Reader letter (M. Adetola, Lagos) flagged the conflated endpoints. We re-read the meta-analysis.", ttf: "7 days", logged: "by Dr. Paul" },
  { date: "11 April 2026", page: "Concerns · Melasma — the long answer",
    severity: "Factual", what: "Hydroquinone 4% maximum US OTC concentration corrected from 'banned' to 'restricted' (Rx-only since FDA 2020 ruling).",
    why: "Original phrasing was sloppy. The substance isn't banned, it requires a prescription.", ttf: "3 days", logged: "by Dr. Sundeep" },
  { date: "06 April 2026", page: "Methodology · § 4.2 Diagnostic weighting",
    severity: "Clarification", what: "Added a routing question to distinguish PIH (post-acne) from melasma. Both routed to the Melasma guide previously.",
    why: "Reader letter (R. Vargas, Mexico City). Genuinely useful catch.", ttf: "5 days", logged: "by Dr. Paul" },
  { date: "29 March 2026", page: "Products · UVMune 400",
    severity: "Typo", what: "PA grade typo: 'PA+++' corrected to 'PA++++' in the at-a-glance card.",
    why: "Spotted internally during routine audit.", ttf: "1 day", logged: "by Dr. Paul" },
  { date: "22 March 2026", page: "Ingredients · Tranexamic acid",
    severity: "Factual", what: "Oral dosing range corrected from '500–1500mg' to '500–1000mg'. The upper figure was extrapolated from a single off-label study.",
    why: "Caught during the supplement page build, where we re-checked the original Suzuki et al. 2007 paper.", ttf: "2 days", logged: "by Dr. Sundeep" },
  { date: "08 March 2026", page: "Trend Watch · Issue 03 — Peptide gold rush",
    severity: "Interpretive", what: "Argireline (acetyl hexapeptide-8) verdict revised from 'Holds up' to 'Misleading'. Original ruling weighted industry-funded studies too heavily.",
    why: "Internal re-grade after the Issue 11 bakuchiol piece prompted a sweep of 2022 verdicts.", ttf: "12 days", logged: "by both editors" },
  { date: "24 February 2026", page: "Routines · AM Pigment-prone",
    severity: "Clarification", what: "Step 03 (niacinamide) note added: 'Skip if vitamin C causes flushing — they don't antagonise but the cumulative tingle does.'",
    why: "Three reader letters in two weeks asking the same question.", ttf: "9 days", logged: "by Dr. Paul" },
  { date: "10 February 2026", page: "Supplements · Polypodium leucotomos",
    severity: "Factual", what: "Half-life of active fragments corrected from '~3 hrs' to '~6 hrs'. Original figure was for the parent compound, not the active metabolites.",
    why: "Spotted during the dosing question reply (J. Sørensen letter).", ttf: "4 days", logged: "by Dr. Sundeep" },
  { date: "27 January 2026", page: "Editorial · Annual Letter 2025",
    severity: "Retraction", what: "Paragraph claiming 'no industry funding has ever been offered to us' retracted. We did receive — and decline — two offers in Q3 2025.",
    why: "Phrasing was technically incorrect even though the policy outcome is the same. Letter retracted, full account published in Issue 09.", ttf: "1 day", logged: "by both editors" },
];

const Corrections: React.FC = () => {
  const counts = (Object.keys(SEV_META) as Severity[]).map((s) => ({
    s, n: CORRECTIONS.filter((c) => c.severity === s).length,
  }));

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: T.paper, color: T.ink }}>
      <PaperGrain /><LaidPaper /><TopVignette />

      <SiteHeader />
      <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Transparency", href: "#" }, { label: "Corrections Log" }]} />

      {/* Hero */}
      <section className="relative z-10 border-b overflow-hidden" style={{ borderColor: T.rule, background: `linear-gradient(180deg, ${T.paper2} 0%, ${T.paper} 100%)` }}>
        <Container>
          <div className="grid grid-cols-12 gap-8 py-16">
            <div className="col-span-12 md:col-span-8">
              <Eyebrow color={T.accent}>Transparency · The Corrections Log</Eyebrow>
              <h1 className="mt-4" style={{ fontFamily: SERIF, fontSize: 92, lineHeight: 0.95, letterSpacing: "-0.035em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144' }}>
                Every error,<br/>
                <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>kept on the record.</span>
              </h1>
              <p className="mt-7 max-w-2xl" style={{ fontFamily: SERIF_ED, fontStyle: "italic", fontSize: 22, lineHeight: 1.5, color: T.muted }}>
                Twenty-three corrections over the last twelve months. Each one names the page, the severity, the editor responsible, and how long it took us to fix it. The original wording stays visible in the page history.
              </p>
            </div>
            <div className="col-span-12 md:col-span-4 flex md:justify-end">
              <div className="relative inline-flex flex-col items-center justify-center gap-2 px-8 py-10" style={{ border: `1px solid ${T.muted}`, background: T.paper }}>
                <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.18em", color: T.mutedSoft }}>MEDIAN TIME-TO-FIX</span>
                <span style={{ fontFamily: SERIF, fontSize: 78, lineHeight: 1, color: T.ink, fontVariationSettings: '"opsz" 144' }}>4d</span>
                <span style={{ fontFamily: SERIF_ED, fontStyle: "italic", fontSize: 14, color: T.muted }}>since methodology v1.0</span>
              </div>
            </div>
          </div>

          {/* Severity legend / counts */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-px pb-10" style={{ background: T.rule }}>
            {counts.map(({ s, n }) => {
              const m = SEV_META[s];
              return (
                <div key={s} className="px-5 py-5" style={{ background: T.paper }}>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5" style={{
                      fontFamily: SANS, fontSize: 9.5, letterSpacing: "0.16em", fontWeight: 700,
                      color: m.c, background: m.bg, border: `1px solid ${m.c}55`,
                      padding: "3px 8px", borderRadius: 2, textTransform: "uppercase",
                    }}>{m.icon}{s}</span>
                    <span style={{ fontFamily: SERIF, fontSize: 32, lineHeight: 1, color: T.ink, fontVariationSettings: '"opsz" 144' }}>{n}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* The log itself */}
      <section className="relative z-10 py-20">
        <Container max={1100}>
          <div className="flex items-baseline justify-between mb-10">
            <Eyebrow>The ledger · Most recent first</Eyebrow>
            <span style={{ fontFamily: MONO, fontSize: 10.5, color: T.mutedSoft, letterSpacing: "0.08em" }}>
              SHOWING 09 OF 23 · ALL TIME 47
            </span>
          </div>

          {/* Table-like ledger */}
          <div style={{ borderTop: `2px solid ${T.ink}` }}>
            <div className="hidden md:grid grid-cols-12 gap-4 py-3 border-b" style={{ borderColor: T.rule, fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>
              <div className="col-span-2">DATE</div>
              <div className="col-span-3">PAGE</div>
              <div className="col-span-1">SEVERITY</div>
              <div className="col-span-4">WHAT CHANGED</div>
              <div className="col-span-1">TIME-TO-FIX</div>
              <div className="col-span-1">LOGGED</div>
            </div>

            {CORRECTIONS.map((c, i) => {
              const m = SEV_META[c.severity];
              return (
                <article key={i} className="grid grid-cols-12 gap-4 py-7 border-b" style={{ borderColor: T.rule }}>
                  <div className="col-span-12 md:col-span-2">
                    <p style={{ fontFamily: SERIF, fontSize: 17, color: T.ink, lineHeight: 1.2 }}>{c.date}</p>
                    <p className="mt-1" style={{ fontFamily: MONO, fontSize: 10, color: T.mutedSoft, letterSpacing: "0.08em" }}>
                      № {String(i + 1).padStart(3, "0")}
                    </p>
                  </div>
                  <div className="col-span-12 md:col-span-3">
                    <a href="#" style={{ fontFamily: SERIF, fontSize: 17, color: T.ink, lineHeight: 1.3 }}>{c.page}</a>
                    <span className="mt-2 inline-flex items-center gap-1" style={{ fontFamily: SANS, fontSize: 11.5, color: T.accent, fontWeight: 500 }}>
                      View original <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                  <div className="col-span-6 md:col-span-1 flex md:items-start md:pt-1">
                    <span className="inline-flex items-center gap-1.5" style={{
                      fontFamily: SANS, fontSize: 9.5, letterSpacing: "0.14em", fontWeight: 700,
                      color: m.c, background: m.bg, border: `1px solid ${m.c}55`,
                      padding: "3px 7px", borderRadius: 2, textTransform: "uppercase",
                    }}>{m.icon}{c.severity}</span>
                  </div>
                  <div className="col-span-12 md:col-span-4">
                    <p style={{ fontFamily: SERIF_ED, fontSize: 16.5, lineHeight: 1.55, color: T.inkSoft }}>{c.what}</p>
                    <p className="mt-2" style={{ fontFamily: SANS, fontSize: 12.5, color: T.muted, lineHeight: 1.5 }}>
                      <span style={{ fontFamily: MONO, fontSize: 10, color: T.mutedSoft, letterSpacing: "0.1em", marginRight: 6 }}>WHY</span>
                      {c.why}
                    </p>
                  </div>
                  <div className="col-span-6 md:col-span-1" style={{ fontFamily: SERIF, fontSize: 22, color: T.ink, fontVariationSettings: '"opsz" 144' }}>
                    {c.ttf}
                  </div>
                  <div className="col-span-12 md:col-span-1" style={{ fontFamily: SANS, fontSize: 12, color: T.muted }}>
                    {c.logged}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-10">
            <span style={{ fontFamily: MONO, fontSize: 11, color: T.mutedSoft, letterSpacing: "0.08em" }}>
              09 OF 47 · DATA EXPORTABLE AS CSV
            </span>
            <a href="#" style={{ fontFamily: SANS, fontSize: 13, color: T.accent, fontWeight: 500 }} className="inline-flex items-center gap-2">
              See the full archive (47 entries) <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </Container>
      </section>

      <Asterism />

      {/* Methodology changelog + policy */}
      <section className="relative z-10 py-20 border-t" style={{ borderColor: T.rule, background: T.paper2 }}>
        <Container max={1040}>
          <div className="grid grid-cols-12 gap-12">
            {/* Methodology versions */}
            <div className="col-span-12 md:col-span-7">
              <Eyebrow color={T.accent}>The methodology changelog</Eyebrow>
              <h2 className="mt-3" style={{ fontFamily: SERIF, fontSize: 42, lineHeight: 1.05, letterSpacing: "-0.025em", color: T.ink, fontVariationSettings: '"opsz" 144', fontWeight: 400 }}>
                Versioned, like software.
              </h2>
              <p className="mt-4" style={{ fontFamily: SERIF_ED, fontStyle: "italic", fontSize: 18, lineHeight: 1.55, color: T.muted }}>
                Each rubric change ships with a version bump and a written rationale. Old verdicts that depended on a deprecated rubric are flagged for re-grading.
              </p>

              <div className="mt-8 flex flex-col">
                {[
                  { v: "v1.2", date: "02 March 2026", note: "Added § 4.2 — diagnostic routing weights. Split PIH from melasma." },
                  { v: "v1.1", date: "14 January 2026", note: "Industry-funded study weighting reduced from 0.7× to 0.4×. Triggered re-grades on 31 verdicts." },
                  { v: "v1.0", date: "08 July 2025", note: "Initial public methodology. Tier A/B/C/D rubric, sourcing standards, conflicts policy." },
                ].map((v) => (
                  <div key={v.v} className="grid grid-cols-12 gap-4 py-5 border-t" style={{ borderColor: T.rule }}>
                    <div className="col-span-3" style={{ fontFamily: MONO, fontSize: 13, color: T.accent, letterSpacing: "0.06em" }}>{v.v}</div>
                    <div className="col-span-3" style={{ fontFamily: MONO, fontSize: 11, color: T.mutedSoft, letterSpacing: "0.08em", paddingTop: 2 }}>{v.date.toUpperCase()}</div>
                    <div className="col-span-12 md:col-span-6" style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.4 }}>{v.note}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Policy column */}
            <aside className="col-span-12 md:col-span-5 p-8" style={{ border: `1px solid ${T.ink}`, background: T.paper }}>
              <Eyebrow>Our corrections policy</Eyebrow>
              <h3 className="mt-3" style={{ fontFamily: SERIF, fontSize: 28, lineHeight: 1.1, letterSpacing: "-0.02em", color: T.ink, fontWeight: 400, fontVariationSettings: '"opsz" 144' }}>
                Five rules we enforce on ourselves.
              </h3>
              <ol className="mt-6 flex flex-col gap-4" style={{ fontFamily: SERIF_ED, fontStyle: "italic", fontSize: 16.5, lineHeight: 1.55, color: T.inkSoft }}>
                {[
                  "If a paragraph changes, the original wording is preserved in the page history. Nothing is silently rewritten.",
                  "Every correction is logged here within 48 hours of the edit going live.",
                  "Severity is assigned by the editor who didn't write the original piece.",
                  "Anything graded Factual or above is announced in the next Trend Watch, with attribution to the reader if one prompted it.",
                  "Retractions stay visible. We do not unpublish.",
                ].map((r, i) => (
                  <li key={i} className="flex gap-3">
                    <span style={{ fontFamily: MONO, fontStyle: "normal", fontSize: 12, color: T.accent, letterSpacing: "0.06em", paddingTop: 4 }}>0{i + 1}</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-8 pt-6 border-t" style={{ borderColor: T.rule }}>
                <a href="#" className="inline-flex items-center gap-2" style={{ fontFamily: SANS, fontSize: 13.5, color: T.accent, fontWeight: 500 }}>
                  Spotted an error? Write to the editors <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <div className="absolute right-12 top-[40vh] z-0 hidden lg:block"><AmbientFlask size={300} opacity={0.04} /></div>

      <SiteFooter />
    </div>
  );
};

export default Corrections;
