// ConcernFineLines — Fine lines & early wrinkles.

import React from "react";
import { ArrowRight, Bookmark, Share2 } from "lucide-react";
import { T } from "./_theme";
import {
  SiteHeader, SiteFooter, Breadcrumbs, Container, Eyebrow, Folio, TierBadge,
  PaperGrain, LaidPaper, ColumnRules, TopVignette, AmbientFlask,
  SERIF, SERIF_ED, SANS, MONO,
} from "./_chrome";
import { EditorPageLink } from "./_EditorPageLink";
import { concernRowFor } from "./_concernCatalogue";

// Hero eyebrow / dek live in the concern catalogue alongside the
// taxonomy hub row — the page reads them through `concernRowFor`
// so the prose stays in one place.
const ROW = concernRowFor("fine-lines");

const DRIVERS = [
  { k: "Cumulative UV (photoaging)", w: "75%", n: "The single largest contributor. SPF prevents what topicals can only partly reverse." },
  { k: "Intrinsic / chronological",  w: "55%", n: "Collagen synthesis declines ~1% per year after 25. Mostly genetic." },
  { k: "Glycation",                    w: "40%", n: "Sugar cross-linking with collagen. Diet contributes; topicals contribute less." },
  { k: "Tobacco / pollution",          w: "65%", n: "Free-radical load + microvascular damage. Quitting reverses some." },
];

const INGREDIENTS = [
  { name: "Tretinoin 0.025–0.05% (Rx)", tier: "A" as const, role: "Retinoid · gold-standard", evidence: "Most-evidenced cosmetic active in dermatology" },
  { name: "Retinol 0.3–1.0%",            tier: "A" as const, role: "OTC retinoid",              evidence: "Replicated wrinkle improvement; slower onset than tretinoin" },
  { name: "Sunscreen SPF 50+",            tier: "A" as const, role: "Photoprotection",          evidence: "Single most-evidenced anti-aging intervention" },
  { name: "Vitamin C 10–15%",            tier: "A" as const, role: "Antioxidant · collagen",   evidence: "Cofactor for prolyl hydroxylase; modest visible firmness" },
  { name: "Peptides (Matrixyl 3000)",   tier: "B" as const, role: "Signal peptide",             evidence: "Modest; works as a stack member, not solo" },
  { name: "Bakuchiol 1%",                tier: "B" as const, role: "Plant 'retinol' alt.",      evidence: "Single 12-week RCT vs retinol 0.5%; useful for retinoid-intolerant" },
];

const ConcernFineLines: React.FC = () => (
  <div className="relative" style={{ background: T.paper, color: T.ink, fontFamily: SANS }}>
    <LaidPaper />
    <SiteHeader active="Concerns" />
    <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Concerns", href: "#" }, { label: "Fine lines & early wrinkles" }]} />

    <section className="relative z-10 overflow-hidden border-b" style={{ borderColor: T.rule }}>
      <TopVignette /><PaperGrain /><ColumnRules opacity={0.32} />
      <div aria-hidden className="absolute -right-16 -top-16 z-0"><AmbientFlask size={580} opacity={0.06} /></div>

      <Container>
        <div className="relative grid grid-cols-12 gap-10 py-24">
          <div className="col-span-12 lg:col-span-8 lg:pl-12">
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: T.rule }}>
              <Eyebrow color={T.accent}>{ROW.eyebrow}</Eyebrow>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: T.mutedSoft }}>P. 16 · GUIDE</div>
            </div>

            <h1 className="mt-10" style={{ fontFamily: SERIF, fontSize: 108, lineHeight: 0.93, letterSpacing: "-0.045em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
              Fine lines & <br />
              <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>early wrinkles.</span>
            </h1>

            <p className="mt-9 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: T.inkSoft }}>
              {ROW.dek}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <button className="inline-flex items-center gap-2 px-5 py-3" style={{ background: T.ink, color: T.paper, fontFamily: SANS, fontSize: 13, fontWeight: 500 }}>Read the guide <ArrowRight className="h-4 w-4" /></button>
              <button className="inline-flex items-center gap-2 border px-5 py-3" style={{ borderColor: T.rule, fontFamily: SANS, fontSize: 13, color: T.ink }}><Bookmark className="h-3.5 w-3.5" /> Save</button>
              <button className="inline-flex items-center gap-2 border px-5 py-3" style={{ borderColor: T.rule, fontFamily: SANS, fontSize: 13, color: T.ink }}><Share2 className="h-3.5 w-3.5" /> Share</button>
            </div>
          </div>

          <aside className="col-span-12 lg:col-span-4 lg:flex lg:items-end">
            <div className="border" style={{ borderColor: T.rule, background: T.paper }}>
              <div className="px-6 py-4 border-b" style={{ borderColor: T.rule, background: T.paper2 }}>
                <Eyebrow color={T.accent}>At a glance</Eyebrow>
              </div>
              <dl className="divide-y" style={{ borderColor: T.rule }}>
                {[
                  ["Onset",  "Most adults notice from 28–35"],
                  ["Driver", "Photoaging > intrinsic > glycation"],
                  ["Lever",  "SPF + retinoid is 80% of the protocol"],
                  ["Outlook", "Slows the curve; does not reverse it fully"],
                  ["Reviewer", "Dr. Sundeep · 15-Apr-2026"],
                ].map(([k, v]) => (
                  <div key={k} className="px-6 py-3.5" style={{ borderColor: T.ruleSoft }}>
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

    <section className="relative z-10 border-b py-20" style={{ borderColor: T.rule }}>
      <Container>
        <Folio>§ 01</Folio>
        <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.03em" }}>
          The drivers, <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>weighted.</span>
        </h2>
        <div className="mt-10 space-y-5">
          {DRIVERS.map((t) => (
            <div key={t.k} className="grid grid-cols-12 gap-6 items-start">
              <div className="col-span-12 md:col-span-3"><div style={{ fontFamily: SERIF, fontSize: 22, color: T.ink, lineHeight: 1.2, fontVariationSettings: '"opsz" 144' }}>{t.k}</div></div>
              <div className="col-span-12 md:col-span-7">
                <div className="h-1.5 w-full" style={{ background: T.ruleSoft }}><div className="h-full" style={{ background: T.accent, width: t.w }} /></div>
                <p className="mt-3" style={{ fontFamily: SERIF, fontSize: 15, color: T.muted, lineHeight: 1.55, fontStyle: "italic" }}>{t.n}</p>
              </div>
              <div className="col-span-12 md:col-span-2 md:text-right"><span style={{ fontFamily: SERIF, fontSize: 32, fontVariationSettings: '"opsz" 144', color: T.ink }}>{t.w}</span></div>
            </div>
          ))}
        </div>
      </Container>
    </section>

    <section className="relative z-10 border-b py-20" style={{ borderColor: T.rule, background: T.paper2 }}>
      <Container>
        <Folio>§ 02</Folio>
        <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.03em" }}>
          The molecules <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>that work.</span>
        </h2>
        <div className="mt-9 border" style={{ borderColor: T.rule, background: T.paper }}>
          <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b" style={{ borderColor: T.rule, background: T.paper2, fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.mutedSoft, textTransform: "uppercase" }}>
            <div className="col-span-1">Tier</div>
            <div className="col-span-3">Molecule</div>
            <div className="col-span-3">Role</div>
            <div className="col-span-5">Evidence</div>
          </div>
          {INGREDIENTS.map((i) => (
            <a key={i.name} href="#" className="grid grid-cols-12 gap-4 px-5 py-5 items-center border-b last:border-b-0" style={{ borderColor: T.ruleSoft }}>
              <div className="col-span-1"><TierBadge tier={i.tier} /></div>
              <div className="col-span-3" style={{ fontFamily: SERIF, fontSize: 17, color: T.ink, fontVariationSettings: '"opsz" 144' }}>{i.name}</div>
              <div className="col-span-3" style={{ fontFamily: SANS, fontSize: 13, color: T.muted }}>{i.role}</div>
              <div className="col-span-5" style={{ fontFamily: SERIF, fontSize: 14.5, color: T.inkSoft, fontStyle: "italic", lineHeight: 1.5 }}>{i.evidence}</div>
            </a>
          ))}
        </div>
      </Container>
    </section>

    <section className="relative z-10 border-b py-20" style={{ borderColor: T.rule }}>
      <Container>
        <Folio>§ 03</Folio>
        <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.03em" }}>
          The <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>protocol.</span>
        </h2>
        <div className="mt-9 grid grid-cols-1 md:grid-cols-2 gap-0 border" style={{ borderColor: T.rule }}>
          <div className="p-8" style={{ borderRight: `1px solid ${T.rule}`, background: T.paper }}>
            <Eyebrow color={T.accent}>Morning</Eyebrow>
            <ol className="mt-5 space-y-3.5" style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.5 }}>
              {["Low-pH gel cleanser","Vitamin C 15% serum (LAA)","Light moisturiser","SPF 50+ with high UVA-PF — two finger-lengths"].map((s, i) => (
                <li key={s} className="flex gap-3 items-baseline"><span style={{ fontFamily: MONO, fontSize: 11, color: T.accent, letterSpacing: "0.12em" }}>0{i + 1}</span><span>{s}</span></li>
              ))}
            </ol>
          </div>
          <div className="p-8" style={{ background: T.paper2 }}>
            <Eyebrow color={T.accent}>Evening</Eyebrow>
            <ol className="mt-5 space-y-3.5" style={{ fontFamily: SERIF, fontSize: 16, color: T.ink, lineHeight: 1.5 }}>
              {["Cleansing oil → gel cleanser","Tretinoin 0.025% (or retinol 0.5–1%)","Buffer with ceramide cream","Optional: peptide serum on alternate nights"].map((s, i) => (
                <li key={s} className="flex gap-3 items-baseline"><span style={{ fontFamily: MONO, fontSize: 11, color: T.accent, letterSpacing: "0.12em" }}>0{i + 1}</span><span>{s}</span></li>
              ))}
            </ol>
          </div>
        </div>
      </Container>
    </section>

    <EditorPageLink pageKind="concern" pageSlug="ConcernFineLines" />
    <SiteFooter />
  </div>
);

export default ConcernFineLines;
