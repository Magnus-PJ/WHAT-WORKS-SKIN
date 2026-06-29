import React from "react";
import { ArrowRight, Mail, Quote } from "lucide-react";
import {
  SiteHeader, SiteFooter, Breadcrumbs, Container, Eyebrow, Folio, Asterism,
  TopVignette, LaidPaper, PaperGrain, AmbientFlask, SERIF, SERIF_ED, SANS, MONO,
} from "./_chrome";
import { T } from "./_theme";

type Letter = {
  initials: string;
  name: string;
  city: string;
  date: string;
  subject: string;
  body: string;
  reply: { editor: "Dr. Paul" | "Dr. Sundeep"; text: string };
  tag: "Question" | "Pushback" | "Correction" | "Praise we kept";
};

const LETTERS: Letter[] = [
  {
    initials: "MA", name: "M. Adetola", city: "Lagos, Nigeria", date: "11 April 2026",
    subject: "On Issue 12, the collagen drinks piece",
    body: "You graded hydrolysed collagen 'Partly true' on the basis of skin elasticity endpoints. But two of the meta-analysis trials measured wrinkle depth, not elasticity. The wrinkle data is weaker. I think your grade is too generous unless you separate those endpoints in the next revision.",
    reply: { editor: "Dr. Paul", text: "You're right that we conflated endpoints. We've revised the piece (Issue 12 update, posted 18 April) and split the verdict: 'Partly true' for elasticity, 'Skip' for wrinkle-depth claims. Thank you — this is the kind of letter we hope for." },
    tag: "Pushback",
  },
  {
    initials: "JS", name: "J. Sørensen", city: "Copenhagen", date: "04 April 2026",
    subject: "Polypodium dosing for fair, rosacea-prone skin",
    body: "Your supplement piece recommends 240mg twice daily. My derm here suggested 480mg morning only. Is the split-dose preference based on PK, on convenience, or on the trials? I tolerate Heliocare fine but would rather take it once.",
    reply: { editor: "Dr. Sundeep", text: "Split-dose is a habit from the original Spanish trials, not a pharmacokinetic requirement. The half-life of Polypodium's active fragments supports once-daily 480mg if you take it with food. We've added a sentence to the supplement page making this explicit." },
    tag: "Question",
  },
  {
    initials: "RV", name: "R. Vargas", city: "Mexico City", date: "29 March 2026",
    subject: "Methodology § 4.2 — the diagnostic weighting",
    body: "I love the diagnostic but it routed me to the wrong concern guide. I described pigment + reactive skin, and got Melasma + UVMune. But I have post-inflammatory hyperpigmentation from acne, not melasma. The two need different treatment ladders. Worth distinguishing in the routing logic?",
    reply: { editor: "Dr. Paul", text: "A real gap. We've added a follow-up question — 'Did the marks appear after spots or independently?' — that splits PIH from melasma at the routing layer. Live since Issue 14. Thank you for the specifics." },
    tag: "Correction",
  },
  {
    initials: "EK", name: "E. Kaur", city: "Toronto", date: "22 March 2026",
    subject: "On the LED mask piece",
    body: "I bought the Currentbody mask three months ago. Your 'Partly true' verdict matches what I'm seeing in the mirror — modest, real, slow. The thing I appreciated most was that you didn't tell me to return it.",
    reply: { editor: "Dr. Sundeep", text: "Glad the verdict held up. The honest version is that 'modest, real, slow' is what most evidence-based skincare looks like. We try to match the pace of the language to the pace of the result." },
    tag: "Praise we kept",
  },
];

const TAG_COLOR: Record<Letter["tag"], { c: string; bg: string }> = {
  "Question":      { c: T.tierC, bg: T.tierCsoft },
  "Pushback":      { c: T.tierB, bg: T.tierBsoft },
  "Correction":    { c: T.tierD, bg: T.tierDsoft },
  "Praise we kept":{ c: T.tierA, bg: T.tierAsoft },
};

const Letters: React.FC = () => (
  <div className="relative min-h-screen overflow-hidden" style={{ background: T.paper, color: T.ink }}>
    <PaperGrain /><LaidPaper /><TopVignette />

    <SiteHeader />
    <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Letters to the Editors" }]} />

    {/* Hero */}
    <section className="relative z-10 border-b overflow-hidden" style={{ borderColor: T.rule, background: `linear-gradient(180deg, ${T.paper2} 0%, ${T.paper} 100%)` }}>
      <Container>
        <div className="grid grid-cols-12 gap-8 py-16">
          <div className="col-span-12 md:col-span-8">
            <Eyebrow color={T.accent}>Correspondence · Published every fortnight</Eyebrow>
            <h1 className="mt-4" style={{ fontFamily: SERIF, fontSize: 92, lineHeight: 0.95, letterSpacing: "-0.035em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144' }}>
              Letters<br/>
              <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>to the Editors.</span>
            </h1>
            <p className="mt-7 max-w-2xl" style={{ fontFamily: SERIF_ED, fontStyle: "italic", fontSize: 22, lineHeight: 1.5, color: T.muted }}>
              Pushback, corrections, sharper questions, occasional praise we couldn't bring ourselves to delete. Published verbatim with first initial and city. The editors reply in print, signed.
            </p>
            <div className="mt-8 flex items-center gap-6">
              <a href="#write" className="inline-flex items-center gap-3 px-6 py-3.5" style={{ background: T.ink, color: T.paper, fontFamily: SANS, fontSize: 13.5, fontWeight: 500, letterSpacing: "0.04em" }}>
                <Mail className="h-4 w-4" /> Write to the editors
              </a>
              <span style={{ fontFamily: SANS, fontSize: 12.5, color: T.muted }}>
                editorial@whatworksskin.com · Median reply time, 6 days
              </span>
            </div>
          </div>
          <div className="col-span-12 md:col-span-4 flex md:justify-end">
            <div className="relative inline-flex items-center justify-center" style={{ width: 200, height: 200 }}>
              <div className="absolute inset-0" style={{ border: `1px solid ${T.muted}` }} />
              <div className="absolute" style={{ inset: 8, border: `1px solid ${T.rule}` }} />
              <Quote className="absolute" style={{ width: 84, height: 84, color: T.accent, opacity: 0.85 }} />
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2" style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.18em", color: T.mutedSoft }}>
                EST. 2025
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-10 border-t pt-6" style={{ borderColor: T.rule }}>
          {[
            { k: "412", v: "Letters published" },
            { k: "94%", v: "Replied to within 14 days" },
            { k: "31", v: "Pieces revised because of a letter" },
            { k: "0", v: "Letters edited for content" },
          ].map((s) => (
            <div key={s.v}>
              <p style={{ fontFamily: SERIF, fontSize: 44, lineHeight: 1, color: T.ink, fontVariationSettings: '"opsz" 144' }}>{s.k}</p>
              <p className="mt-1" style={{ fontFamily: SANS, fontSize: 12, color: T.muted }}>{s.v}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>

    {/* Letters body */}
    <section className="relative z-10 py-20">
      <Container max={1040}>
        <div className="flex items-baseline justify-between mb-12">
          <Eyebrow>This issue's correspondence</Eyebrow>
          <span style={{ fontFamily: MONO, fontSize: 10.5, color: T.mutedSoft, letterSpacing: "0.08em" }}>ISSUE 014 · 04 LETTERS PUBLISHED</span>
        </div>

        <div className="flex flex-col gap-16">
          {LETTERS.map((l, i) => {
            const t = TAG_COLOR[l.tag];
            return (
              <article key={l.subject} className="grid grid-cols-12 gap-8">
                {/* Initial mark */}
                <div className="col-span-12 md:col-span-2">
                  <div className="inline-flex items-center justify-center" style={{
                    width: 88, height: 88, border: `1px solid ${T.ink}`,
                    fontFamily: SERIF, fontSize: 38, color: T.ink, letterSpacing: "0.02em",
                    fontVariationSettings: '"opsz" 144',
                  }}>{l.initials}</div>
                  <p className="mt-3" style={{ fontFamily: SERIF, fontSize: 16, color: T.ink }}>{l.name}</p>
                  <p style={{ fontFamily: MONO, fontSize: 10.5, color: T.mutedSoft, letterSpacing: "0.08em", marginTop: 2 }}>
                    {l.city.toUpperCase()}
                  </p>
                  <p className="mt-2" style={{ fontFamily: MONO, fontSize: 10, color: T.mutedSoft, letterSpacing: "0.08em" }}>
                    {l.date.toUpperCase()}
                  </p>
                </div>

                {/* Letter + reply */}
                <div className="col-span-12 md:col-span-10">
                  <div className="flex items-center justify-between mb-3">
                    <span style={{ fontFamily: MONO, fontSize: 10.5, color: T.mutedSoft, letterSpacing: "0.1em" }}>
                      LETTER № {String(i + 1).padStart(3, "0")}
                    </span>
                    <span style={{
                      fontFamily: SANS, fontSize: 9.5, letterSpacing: "0.16em", fontWeight: 700,
                      color: t.c, background: t.bg, border: `1px solid ${t.c}55`,
                      padding: "3px 8px", borderRadius: 2, textTransform: "uppercase",
                    }}>{l.tag}</span>
                  </div>
                  <h2 style={{ fontFamily: SERIF, fontSize: 32, lineHeight: 1.15, letterSpacing: "-0.02em", color: T.ink, fontWeight: 400 }}>
                    "{l.subject}"
                  </h2>
                  <p className="mt-5" style={{ fontFamily: SERIF_ED, fontSize: 19, lineHeight: 1.65, color: T.inkSoft }}>
                    {l.body}
                  </p>

                  {/* Reply */}
                  <div className="mt-8 pl-8 border-l-2" style={{ borderColor: T.accent, background: T.paper2, padding: "20px 24px 24px 32px" }}>
                    <span style={{ fontFamily: MONO, fontSize: 10.5, color: T.accent, letterSpacing: "0.12em", fontWeight: 600 }}>
                      THE EDITORS REPLY · {l.reply.editor.toUpperCase()}
                    </span>
                    <p className="mt-3" style={{ fontFamily: SERIF_ED, fontStyle: "italic", fontSize: 19, lineHeight: 1.6, color: T.ink }}>
                      {l.reply.text}
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <span style={{ fontFamily: SERIF, fontSize: 22, color: T.ink, fontStyle: "italic", letterSpacing: "0.02em" }}>
                        — {l.reply.editor}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-16 flex items-center justify-center gap-4 border-t pt-10" style={{ borderColor: T.rule }}>
          <button className="px-4 py-2" style={{ border: `1px solid ${T.rule}`, color: T.muted, fontFamily: SANS, fontSize: 13 }}>← Issue 013</button>
          <a href="#" style={{ fontFamily: SANS, fontSize: 13, color: T.accent, fontWeight: 500 }}>Browse all 412 letters →</a>
        </div>
      </Container>
    </section>

    <Asterism />

    {/* Write form */}
    <section id="write" className="relative z-10 py-20 border-t" style={{ borderColor: T.rule, background: T.paper2 }}>
      <Container max={920}>
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-12 md:col-span-5">
            <Eyebrow color={T.accent}>Submit a letter</Eyebrow>
            <h2 className="mt-4" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1.02, letterSpacing: "-0.025em", color: T.ink, fontVariationSettings: '"opsz" 144', fontWeight: 400 }}>
              Push us back, sharper.
            </h2>
            <p className="mt-5" style={{ fontFamily: SERIF_ED, fontStyle: "italic", fontSize: 18, lineHeight: 1.55, color: T.muted }}>
              The most useful letters point to a specific paragraph, cite a paper we missed, or describe what your skin actually did. Two paragraphs is plenty.
            </p>

            <ul className="mt-8 flex flex-col gap-3" style={{ fontFamily: SANS, fontSize: 13.5, color: T.inkSoft }}>
              <li className="flex gap-3"><span style={{ color: T.accent, fontFamily: MONO }}>01.</span> We publish your first initial and city, never your full name unless you ask.</li>
              <li className="flex gap-3"><span style={{ color: T.accent, fontFamily: MONO }}>02.</span> Letters are printed verbatim. We do not edit for tone.</li>
              <li className="flex gap-3"><span style={{ color: T.accent, fontFamily: MONO }}>03.</span> The reply is signed by the editor whose piece you wrote about.</li>
              <li className="flex gap-3"><span style={{ color: T.accent, fontFamily: MONO }}>04.</span> If we got something wrong, the correction goes in the corrections log too.</li>
            </ul>
          </div>

          <div className="col-span-12 md:col-span-7">
            <form className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2" style={{ fontFamily: MONO, fontSize: 10.5, color: T.muted, letterSpacing: "0.1em" }}>FIRST NAME / INITIAL</label>
                  <input className="w-full bg-transparent px-4 py-3 border" style={{ borderColor: T.ink, fontFamily: SERIF, fontSize: 17, color: T.ink }} defaultValue="J." />
                </div>
                <div>
                  <label className="block mb-2" style={{ fontFamily: MONO, fontSize: 10.5, color: T.muted, letterSpacing: "0.1em" }}>CITY</label>
                  <input className="w-full bg-transparent px-4 py-3 border" style={{ borderColor: T.ink, fontFamily: SERIF, fontSize: 17, color: T.ink }} defaultValue="" />
                </div>
              </div>
              <div>
                <label className="block mb-2" style={{ fontFamily: MONO, fontSize: 10.5, color: T.muted, letterSpacing: "0.1em" }}>EMAIL · NEVER PUBLISHED</label>
                <input type="email" className="w-full bg-transparent px-4 py-3 border" style={{ borderColor: T.ink, fontFamily: SERIF, fontSize: 17, color: T.ink }} placeholder="you@inbox.com" />
              </div>
              <div>
                <label className="block mb-2" style={{ fontFamily: MONO, fontSize: 10.5, color: T.muted, letterSpacing: "0.1em" }}>RE · WHICH ISSUE OR PAGE?</label>
                <input className="w-full bg-transparent px-4 py-3 border" style={{ borderColor: T.ink, fontFamily: SERIF, fontSize: 17, color: T.ink }} placeholder="e.g. Issue 12 — collagen drinks" />
              </div>
              <div>
                <label className="block mb-2" style={{ fontFamily: MONO, fontSize: 10.5, color: T.muted, letterSpacing: "0.1em" }}>YOUR LETTER</label>
                <textarea rows={8} className="w-full bg-transparent px-4 py-3 border" style={{ borderColor: T.ink, fontFamily: SERIF_ED, fontSize: 18, lineHeight: 1.55, color: T.ink, resize: "vertical" }}
                  placeholder="Be specific. Cite paragraphs. Push us." />
              </div>
              <div className="flex items-center justify-between mt-3">
                <span style={{ fontFamily: SANS, fontSize: 12, color: T.muted }}>
                  By submitting, you agree to publication of your first initial + city.
                </span>
                <button className="inline-flex items-center gap-3 px-6 py-3.5" style={{ background: T.ink, color: T.paper, fontFamily: SANS, fontSize: 13.5, fontWeight: 500, letterSpacing: "0.04em" }}>
                  Send to editors <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </Container>
    </section>

    <div className="absolute right-12 top-[40vh] z-0 hidden lg:block"><AmbientFlask size={300} opacity={0.04} /></div>

    <SiteFooter />
  </div>
);

export default Letters;
