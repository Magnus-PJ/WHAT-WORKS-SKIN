// _supplementSections — shared evidence-row and FAQ-accordion building
// blocks used by both `_supplementTemplate.tsx` (variant="table") and
// the three custom supplement briefs (variant="callout"). Centralising
// the markup means cross-cutting changes (linkify scope, accessibility
// tweaks, copy adjustments) only have to be made in one place.

import React, { useState } from "react";
import { ArrowRight, Bookmark, ChevronDown, Share2 } from "lucide-react";
import { T } from "./_theme";
import {
  AmbientFlask, ColumnRules, Container, Eyebrow, PaperGrain, TierBadge, TopVignette,
  SERIF, SERIF_ED, SANS, MONO,
} from "./_chrome";
import { linkifyText, type LinkifyOptions } from "./_links";

type TierBadgeTier = React.ComponentProps<typeof TierBadge>["tier"];

export type EvidenceRow = { c: string; n: string; w: string; note: string };
export type FaqRow = { q: string; a: string };

export type SupplementSectionVariant = "table" | "callout";

type EvidenceProps = {
  rows: EvidenceRow[];
  variant: SupplementSectionVariant;
  linkOptions?: LinkifyOptions;
};

export const SupplementEvidenceRows: React.FC<EvidenceProps> = ({
  rows,
  variant,
  linkOptions,
}) => {
  if (variant === "table") {
    return (
      <div className="border bg-white" style={{ borderColor: T.rule }}>
        <div className="grid grid-cols-12 px-6 py-3 border-b" style={{ background: T.paper2, borderColor: T.rule }}>
          <div className="col-span-4" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", color: T.muted, textTransform: "uppercase" }}>Claim</div>
          <div className="col-span-3" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", color: T.muted, textTransform: "uppercase" }}>Strongest evidence</div>
          <div className="col-span-1" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", color: T.muted, textTransform: "uppercase" }}>Holds</div>
          <div className="col-span-4" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", color: T.muted, textTransform: "uppercase" }}>Notes</div>
        </div>
        {rows.map((e, i) => (
          <div key={e.c} className="grid grid-cols-12 px-6 py-5 items-center" style={{ borderTop: i === 0 ? "none" : `1px solid ${T.ruleSoft}` }}>
            <div className="col-span-4" style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 400, fontVariationSettings: '"opsz" 144', color: T.ink }}>{linkifyText(e.c, { scope: "concerns" })}</div>
            <div className="col-span-3" style={{ fontFamily: SERIF, fontSize: 14.5, fontStyle: "italic", color: T.muted }}>{e.n}</div>
            <div className="col-span-1" style={{ fontFamily: MONO, fontSize: 14, color: T.accent }}>{e.w}</div>
            <div className="col-span-4" style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.55, color: T.inkSoft }}>{linkifyText(e.note, linkOptions)}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {rows.map((e) => (
        <div key={e.c} className="grid grid-cols-12 gap-6 items-start">
          <div className="col-span-12 md:col-span-3">
            <div style={{ fontFamily: SERIF, fontSize: 19, color: T.ink, lineHeight: 1.2, fontVariationSettings: '"opsz" 144' }}>{linkifyText(e.c, { scope: "concerns" })}</div>
            <div className="mt-1" style={{ fontFamily: MONO, fontSize: 10, color: T.mutedSoft, letterSpacing: "0.12em", textTransform: "uppercase" }}>{e.n}</div>
          </div>
          <div className="col-span-12 md:col-span-7">
            <div className="h-1.5 w-full" style={{ background: T.ruleSoft }}><div className="h-full" style={{ background: T.accent, width: e.w }} /></div>
            <p className="mt-3" style={{ fontFamily: SERIF, fontSize: 15, color: T.muted, lineHeight: 1.55, fontStyle: "italic" }}>{linkifyText(e.note, linkOptions)}</p>
          </div>
          <div className="col-span-12 md:col-span-2 md:text-right"><span style={{ fontFamily: SERIF, fontSize: 30, fontVariationSettings: '"opsz" 144', color: T.ink }}>{e.w}</span></div>
        </div>
      ))}
    </div>
  );
};

type FaqProps = {
  items: FaqRow[];
  variant: SupplementSectionVariant;
  linkOptions?: LinkifyOptions;
  defaultOpenIndex?: number | null;
};

export const SupplementFaqAccordion: React.FC<FaqProps> = ({
  items,
  variant,
  linkOptions,
  defaultOpenIndex = 0,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(defaultOpenIndex);

  if (variant === "table") {
    return (
      <div className="border bg-white" style={{ borderColor: T.rule }}>
        {items.map((f, i) => (
          <div key={f.q} style={{ borderTop: i === 0 ? "none" : `1px solid ${T.ruleSoft}` }}>
            <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-6 py-5 text-left">
              <span style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 400, fontVariationSettings: '"opsz" 144', color: T.ink }}>{f.q}</span>
              <ChevronDown className="h-4 w-4" style={{ color: T.muted, transform: openFaq === i ? "rotate(180deg)" : "rotate(0)", transition: "transform 200ms" }} />
            </button>
            {openFaq === i && (
              <div className="px-6 pb-6" style={{ fontFamily: SERIF, fontSize: 16.5, lineHeight: 1.65, color: T.inkSoft }}>{linkifyText(f.a, linkOptions)}</div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="border-t" style={{ borderColor: T.rule }}>
      {items.map((f, i) => {
        const open = openFaq === i;
        return (
          <div key={f.q} className="border-b" style={{ borderColor: T.ruleSoft }}>
            <button onClick={() => setOpenFaq(open ? null : i)} className="w-full flex items-baseline justify-between gap-4 py-6 text-left">
              <span style={{ fontFamily: SERIF, fontSize: 22, color: T.ink, lineHeight: 1.35, fontVariationSettings: '"opsz" 144' }}>{f.q}</span>
              <ChevronDown className="h-5 w-5 flex-shrink-0" style={{ color: T.muted, transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
            </button>
            {open && <p className="pb-6 max-w-3xl" style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.65, color: T.inkSoft }}>{linkifyText(f.a, linkOptions)}</p>}
          </div>
        );
      })}
    </div>
  );
};

export type GlanceRow = readonly [string, string];

type SupplementBriefHeroProps = {
  eyebrow: React.ReactNode;
  folio: React.ReactNode;
  headline: React.ReactNode;
  headlineFontSize: number;
  headlineLineHeight?: number;
  headlineLetterSpacing?: string;
  dek?: { lead: React.ReactNode; trail?: React.ReactNode };
  subhead: React.ReactNode;
  tier: TierBadgeTier;
  glanceRows: ReadonlyArray<GlanceRow>;
};

export const SupplementBriefHero: React.FC<SupplementBriefHeroProps> = ({
  eyebrow,
  folio,
  headline,
  headlineFontSize,
  headlineLineHeight = 0.9,
  headlineLetterSpacing = "-0.05em",
  dek,
  subhead,
  tier,
  glanceRows,
}) => (
  <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
    <TopVignette /><PaperGrain /><ColumnRules opacity={0.32} />
    <div aria-hidden className="absolute -right-16 -top-16 z-0"><AmbientFlask size={580} opacity={0.06} /></div>

    <Container>
      <div className="relative grid grid-cols-12 gap-10 py-24">
        <div className="col-span-12 lg:col-span-8 lg:pl-12">
          <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
            <Eyebrow color={T.accent}>{eyebrow}</Eyebrow>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>{folio}</div>
          </div>

          <h1 className="mt-10" style={{ fontFamily: SERIF, fontSize: headlineFontSize, lineHeight: headlineLineHeight, letterSpacing: headlineLetterSpacing, fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
            {headline}
          </h1>

          {dek && (
            <div className="mt-3" style={{ fontFamily: SERIF_ED, fontSize: 38, fontStyle: "italic", color: T.accent, letterSpacing: "-0.02em" }}>
              {dek.lead}
              {dek.trail && <>{" "}<span style={{ color: T.inkSoft, fontFamily: SERIF, fontStyle: "normal" }}>{dek.trail}</span></>}
            </div>
          )}

          <p className="mt-9 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>
            {subhead}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <button className="inline-flex items-center gap-2 px-5 py-3" style={{ background: T.ink, color: T.paper, fontFamily: SANS, fontSize: 13, fontWeight: 500 }}>Read the brief <ArrowRight className="h-4 w-4" /></button>
            <button className="inline-flex items-center gap-2 border px-5 py-3" style={{ borderColor: T.rule, fontFamily: SANS, fontSize: 13, color: T.ink }}><Bookmark className="h-3.5 w-3.5" /> Save</button>
            <button className="inline-flex items-center gap-2 border px-5 py-3" style={{ borderColor: T.rule, fontFamily: SANS, fontSize: 13, color: T.ink }}><Share2 className="h-3.5 w-3.5" /> Share</button>
          </div>
        </div>

        <aside className="col-span-12 lg:col-span-4 lg:flex lg:items-end">
          <div className="border w-full" style={{ borderColor: T.rule, background: T.paper }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: T.rule, background: T.paper2 }}>
              <Eyebrow color={T.accent}>At a glance</Eyebrow>
              <TierBadge tier={tier} size="md" />
            </div>
            <dl>
              {glanceRows.map(([k, v]) => (
                <div key={k} className="px-6 py-3.5 border-b last:border-b-0" style={{ borderColor: T.ruleSoft }}>
                  <dt style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.16em", color: T.mutedSoft, textTransform: "uppercase" }}>{k}</dt>
                  <dd className="mt-1" style={{ fontFamily: SERIF, fontSize: 14.5, color: T.ink, lineHeight: 1.45 }}>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>
    </Container>
  </section>
);
