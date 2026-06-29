// _concernTemplate — shared layout for concern guides.

import React from "react";
import { ArrowRight, Bookmark, Share2 } from "lucide-react";
import { T } from "./_theme";
import {
  SiteHeader, SiteFooter, Breadcrumbs, Container, Eyebrow, Folio, TierBadge,
  PaperGrain, LaidPaper, ColumnRules, TopVignette, AmbientFlask,
  SERIF, SERIF_ED, SANS, MONO,
} from "./_chrome";
import { linkForIngredientName } from "./_links";
import { concernRowFor } from "./_concernCatalogue";
import { EditorPageLink } from "./_EditorPageLink";

export type Sign = { k: string; w: string; n: string };
export type Ingredient = { name: string; tier: "A" | "B" | "C" | "D"; role: string; evidence: string };
export type Phase = { w: string; t: string; b: string };

export type ConcernProps = {
  /** Catalogue slug — the page reads its `family`, `eyebrow`, and
   *  hero `dek` from the matching `_concernCatalogue.ts` row so the
   *  detail page never redeclares prose that already lives there. */
  slug: string;
  /** Detail-page component file name (e.g. `ConcernComedonal`). Used
   *  as the `pageSlug` for the editor-only "Open shelf-click data for
   *  this page →" deep link so the dashboard's group key matches what
   *  bespoke concern pages (which already use the file name) send. */
  pageSlug: string;
  title: string;
  page: string;
  hero1: string;
  hero2: string;
  /** Optional override for the catalogue dek — only used when a page
   *  intentionally needs a different lede than the catalogue's row. */
  dek?: string;
  signs: Sign[];
  ingredients: Ingredient[];
  phases: Phase[];
  bottom: string;
};

export const ConcernPage: React.FC<ConcernProps> = ({
  slug, pageSlug, title, page, hero1, hero2, dek, signs, ingredients, phases, bottom,
}) => {
  const row = concernRowFor(slug);
  const family = row.family;
  const eyebrow = row.eyebrow;
  const resolvedDek = dek ?? row.dek;

  return (
  <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
    <LaidPaper />
    <SiteHeader active="Concerns" />
    <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Concerns", href: "#" }, { label: title }]} />

    <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
      <TopVignette /><PaperGrain /><ColumnRules opacity={0.32} />
      <div aria-hidden className="absolute -right-16 -top-16 z-0"><AmbientFlask size={580} opacity={0.06} /></div>
      <Container>
        <div className="relative grid grid-cols-12 gap-10 py-24">
          <div className="col-span-12 lg:col-span-9 lg:pl-12">
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
              <Eyebrow color={T.accent}>{eyebrow}</Eyebrow>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>{page} · {family.toUpperCase()}</div>
            </div>
            <h1 className="mt-10" style={{ fontFamily: SERIF, fontSize: 116, lineHeight: 0.92, letterSpacing: "-0.045em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
              {hero1} <br />
              <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>{hero2}</span>
            </h1>
            <p className="mt-9 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>{resolvedDek}</p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <button className="inline-flex items-center gap-2 px-5 py-3" style={{ background: T.ink, color: T.paper, fontFamily: SANS, fontSize: 13, fontWeight: 500 }}>Read the protocol <ArrowRight className="h-4 w-4" /></button>
              <button className="inline-flex items-center gap-2 border px-5 py-3" style={{ borderColor: T.rule, fontFamily: SANS, fontSize: 13, color: T.ink }}><Bookmark className="h-3.5 w-3.5" /> Save</button>
              <button className="inline-flex items-center gap-2 border px-5 py-3" style={{ borderColor: T.rule, fontFamily: SANS, fontSize: 13, color: T.ink }}><Share2 className="h-3.5 w-3.5" /> Share</button>
            </div>
          </div>
        </div>
      </Container>
    </section>

    <section className="relative z-10 border-b" style={{ borderColor: T.rule, background: T.paper2 }}>
      <Container>
        <div className="py-20 grid grid-cols-12 gap-10">
          <div className="col-span-12 lg:col-span-3">
            <Folio>§ 01</Folio>
            <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 48, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, lineHeight: 1, letterSpacing: "-0.025em" }}>
              Recognise <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>the signs.</span>
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-6">
            {signs.map(s => (
              <div key={s.k} className="border bg-white px-6 py-7" style={{ borderColor: T.rule }}>
                <div className="flex items-baseline justify-between border-b pb-3" style={{ borderColor: T.ruleSoft }}>
                  <h3 style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 400, fontVariationSettings: '"opsz" 144', color: T.ink, lineHeight: 1.15 }}>{s.k}</h3>
                  <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.12em", color: T.accent }}>{s.w}</span>
                </div>
                <p className="mt-4" style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.6, color: T.inkSoft }}>{s.n}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>

    <section className="relative z-10 border-b" style={{ borderColor: T.rule }}>
      <Container>
        <div className="py-20">
          <Folio>§ 02</Folio>
          <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, lineHeight: 1, letterSpacing: "-0.03em" }}>
            What the <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>literature supports.</span>
          </h2>
          <div className="mt-10 border" style={{ borderColor: T.rule }}>
            <div className="grid grid-cols-12 px-6 py-3 border-b" style={{ background: T.paper2, borderColor: T.rule }}>
              <div className="col-span-4" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", color: T.muted, textTransform: "uppercase" }}>Ingredient</div>
              <div className="col-span-1" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", color: T.muted, textTransform: "uppercase" }}>Tier</div>
              <div className="col-span-3" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", color: T.muted, textTransform: "uppercase" }}>Role</div>
              <div className="col-span-4" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", color: T.muted, textTransform: "uppercase" }}>Evidence</div>
            </div>
            {ingredients.map((ing, i) => {
              const href = linkForIngredientName(ing.name);
              return (
                <div key={ing.name} className="grid grid-cols-12 px-6 py-5 items-center" style={{ borderTop: i === 0 ? "none" : `1px solid ${T.ruleSoft}` }}>
                  <div className="col-span-4" style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 400, fontVariationSettings: '"opsz" 144', color: T.ink }}>
                    {href ? (
                      <a href={href} style={{ color: "inherit", textDecoration: "underline", textDecorationThickness: 1, textUnderlineOffset: 3, textDecorationColor: T.accent }}>{ing.name}</a>
                    ) : ing.name}
                  </div>
                  <div className="col-span-1"><TierBadge tier={ing.tier} /></div>
                  <div className="col-span-3" style={{ fontFamily: SERIF, fontSize: 14.5, fontStyle: "italic", color: T.muted }}>{ing.role}</div>
                  <div className="col-span-4" style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.55, color: T.inkSoft }}>{ing.evidence}</div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>

    <section className="relative z-10 border-b" style={{ borderColor: T.rule, background: T.paper2 }}>
      <Container>
        <div className="py-20">
          <Folio>§ 03</Folio>
          <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, lineHeight: 1, letterSpacing: "-0.03em" }}>
            The <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>protocol.</span>
          </h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {phases.map((p, i) => (
              <div key={p.w} className="border bg-white px-6 py-7" style={{ borderColor: T.rule }}>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.18em", color: T.mutedSoft, textTransform: "uppercase" }}>Phase {String(i + 1).padStart(2, "0")} · {p.w}</div>
                <h3 className="mt-3" style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, lineHeight: 1.05, letterSpacing: "-0.015em" }}>{p.t}</h3>
                <p className="mt-4" style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.6, color: T.inkSoft }}>{p.b}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 border-l-4 pl-7 py-5 max-w-3xl" style={{ borderColor: T.accent, background: "white" }}>
            <Eyebrow color={T.accent}>Bottom line</Eyebrow>
            <p className="mt-2" style={{ fontFamily: SERIF, fontSize: 19, fontStyle: "italic", color: T.ink, lineHeight: 1.55 }}>{bottom}</p>
          </div>
        </div>
      </Container>
    </section>

    <EditorPageLink pageKind="concern" pageSlug={pageSlug} />
    <SiteFooter />
  </div>
  );
};
