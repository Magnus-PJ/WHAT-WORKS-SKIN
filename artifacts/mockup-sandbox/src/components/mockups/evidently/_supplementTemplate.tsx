// _supplementTemplate — shared layout for supplement briefs.

import React from "react";
import { ArrowRight, Bookmark, Share2 } from "lucide-react";
import { T } from "./_theme";
import {
  SiteHeader, SiteFooter, Breadcrumbs, Container, Eyebrow, Folio,
  PaperGrain, LaidPaper, ColumnRules, TopVignette, AmbientFlask,
  SERIF, SERIF_ED, SANS, MONO,
} from "./_chrome";
import { linkifyText, slugForSupplementName } from "./_links";
import {
  SupplementEvidenceRows,
  SupplementFaqAccordion,
  type EvidenceRow,
  type FaqRow,
} from "./_supplementSections";

export type { EvidenceRow, FaqRow } from "./_supplementSections";
export type FormRow = { f: string; abs: string; note: string };

export type SupplementProps = {
  family: string;
  name: string;
  page: string;
  eyebrow: string;
  hero: string;
  subheadA: string;
  subheadB: string;
  dek: string;
  evidence: EvidenceRow[];
  forms: FormRow[];
  faq: FaqRow[];
  bottom: string;
};

export const SupplementPage: React.FC<SupplementProps> = ({
  family, name, page, eyebrow, hero, subheadA, subheadB, dek, evidence, forms, faq, bottom,
}) => {
  const selfSlug = slugForSupplementName(name);
  const excludeSlugs = selfSlug ? [selfSlug] : [];
  const linkOptions = { scope: "supplements" as const, excludeSlugs };
  return (
    <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
      <LaidPaper />
      <SiteHeader active="Supplements" />
      <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Supplements", href: "#" }, { label: name }]} />

      <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
        <TopVignette /><PaperGrain /><ColumnRules opacity={0.32} />
        <div aria-hidden className="absolute -right-16 -top-16 z-0"><AmbientFlask size={580} opacity={0.06} /></div>
        <Container>
          <div className="relative grid grid-cols-12 gap-10 py-24">
            <div className="col-span-12 lg:col-span-9 lg:pl-12">
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
                <Eyebrow color={T.accent}>{eyebrow}</Eyebrow>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>{page} · BRIEF</div>
              </div>
              <h1 className="mt-10" style={{ fontFamily: SERIF, fontSize: 124, lineHeight: 0.9, letterSpacing: "-0.05em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>{hero}</h1>
              <div className="mt-3" style={{ fontFamily: SERIF_ED, fontSize: 36, fontStyle: "italic", color: T.accent, letterSpacing: "-0.02em" }}>
                {subheadA} <span style={{ color: T.inkSoft, fontFamily: SERIF, fontStyle: "normal" }}>{subheadB}</span>
              </div>
              <p className="mt-9 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>{dek}</p>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <button className="inline-flex items-center gap-2 px-5 py-3" style={{ background: T.ink, color: T.paper, fontFamily: SANS, fontSize: 13, fontWeight: 500 }}>Read the brief <ArrowRight className="h-4 w-4" /></button>
                <button className="inline-flex items-center gap-2 border px-5 py-3" style={{ borderColor: T.rule, fontFamily: SANS, fontSize: 13, color: T.ink }}><Bookmark className="h-3.5 w-3.5" /> Save</button>
                <button className="inline-flex items-center gap-2 border px-5 py-3" style={{ borderColor: T.rule, fontFamily: SANS, fontSize: 13, color: T.ink }}><Share2 className="h-3.5 w-3.5" /> Share</button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="relative z-10 border-b" style={{ borderColor: T.rule, background: T.paper2 }}>
        <Container>
          <div className="py-20">
            <Folio>§ 01</Folio>
            <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, lineHeight: 1, letterSpacing: "-0.03em" }}>
              What the <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>literature actually shows.</span>
            </h2>
            <div className="mt-10">
              <SupplementEvidenceRows variant="table" rows={evidence} linkOptions={linkOptions} />
            </div>
          </div>
        </Container>
      </section>

      <section className="relative z-10 border-b" style={{ borderColor: T.rule }}>
        <Container>
          <div className="py-20">
            <Folio>§ 02</Folio>
            <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, lineHeight: 1, letterSpacing: "-0.03em" }}>
              Forms and <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>bioavailability.</span>
            </h2>
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {forms.map(f => (
                <div key={f.f} className="border bg-white px-6 py-7" style={{ borderColor: T.rule }}>
                  <h3 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 400, fontVariationSettings: '"opsz" 144', color: T.ink, lineHeight: 1.15 }}>{f.f}</h3>
                  <div className="mt-2" style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.14em", color: T.accent, textTransform: "uppercase" }}>Absorption · {f.abs}</div>
                  <p className="mt-4" style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.6, color: T.inkSoft }}>{linkifyText(f.note, linkOptions)}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="relative z-10 border-b" style={{ borderColor: T.rule, background: T.paper2 }}>
        <Container>
          <div className="py-20">
            <Folio>§ 03</Folio>
            <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, lineHeight: 1, letterSpacing: "-0.03em" }}>
              Common <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>questions.</span>
            </h2>
            <div className="mt-10">
              <SupplementFaqAccordion variant="table" items={faq} linkOptions={linkOptions} />
            </div>
            <div className="mt-12 border-l-4 pl-7 py-5 max-w-3xl" style={{ borderColor: T.accent, background: "white" }}>
              <Eyebrow color={T.accent}>Bottom line</Eyebrow>
              <p className="mt-2" style={{ fontFamily: SERIF, fontSize: 19, fontStyle: "italic", color: T.ink, lineHeight: 1.55 }}>{bottom}</p>
            </div>
          </div>
        </Container>
      </section>

      <SiteFooter />
    </div>
  );
};
