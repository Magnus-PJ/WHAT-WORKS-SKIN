// SupplementAstaxanthin — Astaxanthin oral antioxidant brief.

import React from "react";
import { AlertTriangle } from "lucide-react";
import { T } from "./_theme";
import {
  SiteHeader, SiteFooter, Breadcrumbs, Container, Eyebrow, Folio, LaidPaper,
  SERIF, SERIF_ED, SANS,
} from "./_chrome";
import { linkifyText } from "./_links";
import { SupplementBriefHero, SupplementEvidenceRows, SupplementFaqAccordion } from "./_supplementSections";

const LINK_OPTS = { scope: "supplements" as const, excludeSlugs: ["astaxanthin"] };

const EVIDENCE = [
  { c: "UV-induced erythema",  n: "RCTs vs placebo", w: "62%", note: "Modest reduction in MED at 4–6 mg/d after 9 weeks. Not a sunscreen replacement." },
  { c: "Skin elasticity",        n: "RCTs, 4–12 mg/d", w: "55%", note: "Replicated bioengineering improvement; visible benefit modest." },
  { c: "Hydration / TEWL",       n: "Bioengineering",   w: "48%", note: "Statistically real, clinically subtle." },
  { c: "Wrinkle reduction",       n: "12-wk RCTs",       w: "40%", note: "Some signal; not the headline most marketing implies." },
];

const STACK = [
  { k: "Best paired with", v: "Sunscreen + topical vitamin C. Astaxanthin is an *adjunct* to photoprotection, not a stand-in." },
  { k: "Form",              v: "Natural (Haematococcus pluvialis) preferred — synthetic exists but data thinner." },
  { k: "Dose",              v: "4–12 mg/d with food; 6–8 mg covers most published endpoints." },
  { k: "Timeline",          v: "9–12 weeks before judging effect. Stop earlier and you've wasted the trial." },
];

const FAQ = [
  { q: "Does it actually 'replace' sunscreen?", a: "No, and any marketing that implies so is misleading. Oral astaxanthin produces a modest reduction in UV-induced erythema after 6–9 weeks, on the order of 10–20% — useful as an adjunct, useless as a substitute." },
  { q: "Natural or synthetic?", a: "Natural Haematococcus-derived astaxanthin has the bulk of the published in-vivo skin data. Synthetic astaxanthin (used in aquaculture) is structurally similar but its published clinical data is thinner. Spend the small premium for the natural form." },
  { q: "Is it safe long-term?", a: "Yes — well-tolerated up to 12 mg/d in trials lasting 6 months. Mild stool-orange discoloration possible at high doses (it is a carotenoid)." },
  { q: "Will it interact with anything?", a: "Mild blood-thinning effect at high doses. If you are on warfarin or DOACs, mention to your doctor before starting." },
];

const GLANCE_ROWS = [
  ["Class",        "Carotenoid (xanthophyll)"],
  ["Source",       "Haematococcus pluvialis (natural)"],
  ["Dose",         "4 – 12 mg/d with food"],
  ["Timeline",     "9 – 12 weeks for effect"],
  ["Pregnancy",    "Insufficient data — defer"],
  ["Interactions", "Mild antiplatelet at high dose"],
  ["Reviewer",     "Dr. Paul · 17-Apr-2026"],
] as const;

const SupplementAstaxanthin: React.FC = () => {
  return (
    <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
      <LaidPaper />
      <SiteHeader active="Supplements" />
      <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Supplements", href: "#" }, { label: "Astaxanthin" }]} />

      <SupplementBriefHero
        eyebrow="Supplement · Carotenoid · Astaxanthin"
        folio="P. 06 · BRIEF"
        headline="Astaxanthin."
        headlineFontSize={116}
        dek={{ lead: "Photoprotective adjunct.", trail: "Not a sunscreen." }}
        subhead="The carotenoid microalgae produce when stressed — bright pink, lipophilic, and one of the better-evidenced oral photoprotectants outside Polypodium leucotomos. Real adjunct. Marketed as a miracle. Calibrate accordingly."
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
            How to take it <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>well.</span>
          </h2>
          <div className="mt-9 grid grid-cols-1 md:grid-cols-2 gap-0 border" style={{ borderColor: T.rule, background: T.paper }}>
            {STACK.map((s, i) => (
              <div key={s.k} className="p-7" style={{ borderRight: i % 2 === 0 ? `1px solid ${T.rule}` : "none", borderTop: i >= 2 ? `1px solid ${T.rule}` : "none" }}>
                <Eyebrow color={T.accent}>{s.k}</Eyebrow>
                <p className="mt-4" style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.6, color: T.inkSoft }}>{linkifyText(s.v, LINK_OPTS)}</p>
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

export default SupplementAstaxanthin;
