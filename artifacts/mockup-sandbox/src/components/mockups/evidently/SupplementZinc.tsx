// SupplementZinc — Oral zinc for acne and hair shedding.

import React from "react";
import { AlertTriangle } from "lucide-react";
import { T } from "./_theme";
import {
  SiteHeader, SiteFooter, Breadcrumbs, Container, Folio, LaidPaper,
  SERIF, SERIF_ED, SANS,
} from "./_chrome";
import { linkifyText } from "./_links";
import { SupplementBriefHero, SupplementEvidenceRows, SupplementFaqAccordion } from "./_supplementSections";

const LINK_OPTS = { scope: "supplements" as const, excludeSlugs: ["zinc-oral"] };

const EVIDENCE = [
  { c: "Inflammatory acne",          n: "RCTs vs placebo, 30 mg/d", w: "65%", note: "Modest reduction in lesion count over 12 weeks. Adjunct, not monotherapy." },
  { c: "Acne vs minocycline",        n: "Comparator trials",         w: "55%", note: "Less effective than oral antibiotics, with cleaner side-effect profile." },
  { c: "Hair shedding (with deficiency)", n: "Observational + small RCTs", w: "70%", note: "Real benefit when zinc is genuinely low. Test before supplementing." },
  { c: "General 'glow' / immunity",  n: "—",                            w: "20%", note: "Marketing only. Treats deficiency, not vague complaints." },
];

const FORMS = [
  { f: "Zinc picolinate",  abs: "High",   note: "Best-tolerated form. The default for skin endpoints." },
  { f: "Zinc gluconate",   abs: "Good",   note: "Cheaper, well-studied for acne. Often used in older trials." },
  { f: "Zinc citrate",     abs: "Good",   note: "Pleasant taste; good for lozenges. Adequate for skin." },
  { f: "Zinc sulfate",     abs: "Moderate", note: "Highest GI upset risk. Older formulations only." },
  { f: "Zinc oxide (oral)", abs: "Poor",  note: "Absorption barely meaningful. Skip." },
];

const FAQ = [
  { q: "How much should I take?", a: "15–30 mg/d with food, ideally not on an empty stomach. Cap at 40 mg/d total dietary + supplement to avoid copper depletion. For acne, the published RCTs use 30 mg/d for 12 weeks." },
  { q: "Why does it upset my stomach?", a: "Zinc is gastric-irritant on its own. Always take with a meal that contains some fat. If still problematic, switch from sulfate to picolinate or citrate, and split the dose AM/PM." },
  { q: "Will it interact with antibiotics?", a: "Yes. Zinc reduces absorption of tetracyclines (including minocycline and doxycycline used for acne) and quinolones. Separate by at least two hours." },
  { q: "When can I expect to see acne improvement?", a: "Eight to twelve weeks at minimum. Zinc is a slow, modest player — useful as part of a stack alongside topical retinoids and BPO, rarely effective on its own for moderate-severe presentations." },
];

const GLANCE_ROWS = [
  ["Class",       "Trace mineral"],
  ["Form",        "Picolinate · gluconate · citrate"],
  ["Dose",        "15 – 30 mg/d with food"],
  ["Timeline",    "8 – 12 weeks for acne"],
  ["Cap",         "≤ 40 mg/d total dietary + supplement"],
  ["Pregnancy",   "Safe at RDA (11 mg/d)"],
  ["Reviewer",    "Dr. Paul · 18-Apr-2026"],
] as const;

const SupplementZinc: React.FC = () => {
  return (
    <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
      <LaidPaper />
      <SiteHeader active="Supplements" />
      <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Supplements", href: "#" }, { label: "Zinc" }]} />

      <SupplementBriefHero
        eyebrow="Supplement · Hair & nails · Zinc"
        folio="P. 10 · BRIEF"
        headline="Zinc."
        headlineFontSize={124}
        dek={{ lead: "Modest acne adjunct.", trail: "Real if you're deficient." }}
        subhead="The mineral with a long, modest record in inflammatory acne and hair shedding when there is documented deficiency. The headline finding is consistency: 12 weeks at 30 mg/d, taken with food. Not a star ingredient — but a useful supporting player when the rest of the stack is in place."
        tier="B"
        glanceRows={GLANCE_ROWS}
      />

      <section className="relative z-10 border-b py-20" style={{ borderColor: T.rule }}>
        <Container>
          <Folio>§ 01</Folio>
          <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.03em" }}>
            The <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>evidence.</span>
          </h2>
          <div className="mt-9">
            <SupplementEvidenceRows variant="callout" rows={EVIDENCE} linkOptions={LINK_OPTS} />
          </div>
        </Container>
      </section>

      <section className="relative z-10 border-b py-20" style={{ borderColor: T.rule, background: T.paper2 }}>
        <Container>
          <Folio>§ 02</Folio>
          <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.03em" }}>
            Forms <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>compared.</span>
          </h2>
          <div className="mt-9 border" style={{ borderColor: T.rule, background: T.paper }}>
            {FORMS.map((f, i) => (
              <div key={f.f} className="grid grid-cols-12 gap-4 px-5 py-5 items-center border-b last:border-b-0" style={{ borderColor: T.ruleSoft, background: i % 2 ? T.paper2 : T.paper }}>
                <div className="col-span-12 md:col-span-3" style={{ fontFamily: SERIF, fontSize: 17, color: T.ink, fontVariationSettings: '"opsz" 144' }}>{f.f}</div>
                <div className="col-span-12 md:col-span-2"><span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: f.abs === "High" ? T.tierA : f.abs === "Poor" ? T.tierD : T.tierB }}>{f.abs} abs.</span></div>
                <div className="col-span-12 md:col-span-7" style={{ fontFamily: SERIF, fontSize: 15, color: T.inkSoft, fontStyle: "italic", lineHeight: 1.55 }}>{linkifyText(f.note, LINK_OPTS)}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <Container>
        <div className="py-20">
          <Folio>§ 03</Folio>
          <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.03em" }}>
            Frequently <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>asked.</span>
          </h2>
          <div className="mt-9">
            <SupplementFaqAccordion variant="callout" items={FAQ} linkOptions={LINK_OPTS} />
          </div>
        </div>
      </Container>

      <SiteFooter />
    </div>
  );
};

export default SupplementZinc;
