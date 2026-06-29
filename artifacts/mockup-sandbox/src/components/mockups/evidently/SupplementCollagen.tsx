// SupplementCollagen — Hydrolysed collagen peptides brief.

import React from "react";
import { T } from "./_theme";
import {
  SiteHeader, SiteFooter, Breadcrumbs, Container, Folio, TierBadge, LaidPaper,
  SERIF, SERIF_ED, SANS, MONO,
} from "./_chrome";
import { SupplementBriefHero, SupplementEvidenceRows, SupplementFaqAccordion } from "./_supplementSections";

const LINK_OPTS = { scope: "supplements" as const, excludeSlugs: ["collagen"] };

const EVIDENCE = [
  { c: "Skin elasticity",     n: "RCTs, 5–10 g/d, 8–12 wk", w: "72%", note: "Replicated improvement across 19+ trials. Effect size: small-to-moderate." },
  { c: "Hydration",            n: "RCTs",                       w: "65%", note: "Modest TEWL reduction; clinically visible at 12 weeks." },
  { c: "Visible wrinkles",    n: "Meta-analysis",                w: "55%", note: "Statistically significant, clinically subtle. Not a substitute for a retinoid." },
  { c: "Nail growth",          n: "Smaller trials",                w: "60%", note: "Real signal but trial quality variable." },
  { c: "'Joint glow' marketing", n: "—",                            w: "10%", note: "Wishful." },
];

const COMPARE = [
  { brand: "Vital Proteins", form: "Bovine type I/III", dose: "10 g", price: "₹ 4,500 / month", tier: "A" as const, note: "Reference Western brand; dye-free." },
  { brand: "Power Gummies",   form: "Marine type I", dose: "5 g",  price: "₹ 1,800 / month", tier: "B" as const, note: "Indian-market entry; dosing on the low end." },
  { brand: "Wellbeing Nutrition", form: "Marine type I", dose: "10 g", price: "₹ 2,400 / month", tier: "A" as const, note: "Best India-availability + honest dose." },
  { brand: "BeautyDose etc.", form: "'Marine 10g'", dose: "Variable", price: "₹ 3–4k", tier: "C" as const, note: "Marketing premium without formula advantage. Skip." },
];

const FAQ = [
  { q: "Does it actually rebuild collagen?", a: "Not directly — and any marketing that says so is wrong. The peptides are broken down to amino acids during digestion. The mechanism is plausibly upstream signalling (specifically dipeptides like Pro-Hyp) that stimulates fibroblast collagen synthesis. The result is real but modest, and takes 12 weeks to read on the face." },
  { q: "Does the type matter (I, II, III, marine, bovine)?", a: "For skin endpoints, less than the marketing suggests. Most positive trials use type I (the dominant skin collagen) from either bovine or marine sources at 5–10 g/d. Type II is for cartilage research. Match price and dose, not type." },
  { q: "Vegan alternatives?", a: "Not yet. 'Vegan collagen' powders contain amino acids that may support endogenous collagen synthesis but have no direct trial evidence for the same endpoints. Better to spend on diet protein + vitamin C and bank the remainder." },
  { q: "Coffee or tea?", a: "Either. Coffee is the most-popular vehicle and does not affect bioavailability." },
];

const GLANCE_ROWS = [
  ["Class",     "Hydrolysed protein peptide"],
  ["Source",    "Bovine type I/III · marine type I"],
  ["Dose",      "5 – 10 g/d"],
  ["Timeline",  "8 – 12 weeks visible"],
  ["Pregnancy", "Generally regarded as safe"],
  ["Reviewer",  "Dr. Sundeep · 18-Apr-2026"],
] as const;

const SupplementCollagen: React.FC = () => {
  return (
    <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
      <LaidPaper />
      <SiteHeader active="Supplements" />
      <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Supplements", href: "#" }, { label: "Collagen peptides" }]} />

      <SupplementBriefHero
        eyebrow="Supplement · Hair & nails · Collagen peptides"
        folio="P. 08 · BRIEF"
        headline={<>Collagen <br /><span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>peptides.</span></>}
        headlineFontSize={96}
        headlineLineHeight={0.92}
        headlineLetterSpacing="-0.04em"
        subhead={`One of very few "beauty supplements" with replicated, peer-reviewed positive data. The benefit is real — and modest. The marketing budget is, by an order of magnitude, larger than the effect size. Take it for what the evidence shows, not what the influencer says.`}
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
            Brand <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>comparison.</span>
          </h2>
          <div className="mt-9 border" style={{ borderColor: T.rule, background: T.paper }}>
            <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b" style={{ borderColor: T.rule, background: T.paper2, fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.mutedSoft, textTransform: "uppercase" }}>
              <div className="col-span-1">Tier</div>
              <div className="col-span-3">Brand</div>
              <div className="col-span-2">Form</div>
              <div className="col-span-1">Dose</div>
              <div className="col-span-2">Price</div>
              <div className="col-span-3">Notes</div>
            </div>
            {COMPARE.map((p) => (
              <div key={p.brand} className="grid grid-cols-12 gap-4 px-5 py-5 items-center border-b last:border-b-0" style={{ borderColor: T.ruleSoft }}>
                <div className="col-span-1"><TierBadge tier={p.tier} /></div>
                <div className="col-span-3" style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, fontVariationSettings: '"opsz" 144' }}>{p.brand}</div>
                <div className="col-span-2" style={{ fontFamily: SANS, fontSize: 13, color: T.muted }}>{p.form}</div>
                <div className="col-span-1" style={{ fontFamily: MONO, fontSize: 12, color: T.ink }}>{p.dose}</div>
                <div className="col-span-2" style={{ fontFamily: SERIF, fontSize: 15, color: T.ink }}>{p.price}</div>
                <div className="col-span-3" style={{ fontFamily: SERIF, fontSize: 14, color: T.inkSoft, fontStyle: "italic", lineHeight: 1.5 }}>{p.note}</div>
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

export default SupplementCollagen;
