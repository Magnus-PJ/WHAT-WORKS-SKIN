import React, { useState } from "react";
import { ArrowRight, ArrowLeft, Check, Clock, Lock, Shield, Sparkles } from "lucide-react";
import {
  SiteHeader, SiteFooter, Breadcrumbs, Container, Eyebrow, Folio, Asterism,
  TopVignette, LaidPaper, PaperGrain, AmbientFlask, TierBadge, SERIF, SERIF_ED, SANS, MONO,
} from "./_chrome";
import { T } from "./_theme";

type Q = { id: string; section: string; prompt: string; sub: string; opts: { id: string; label: string; hint?: string }[]; multi?: boolean };

const QUESTIONS: Q[] = [
  {
    id: "skin", section: "§ 01 · Baseline",
    prompt: "Where does your skin sit on a normal Tuesday?",
    sub: "Not after a flare, not after a holiday. The middle of an ordinary week.",
    opts: [
      { id: "dry", label: "Dry — tightness, occasional flake" },
      { id: "balanced", label: "Balanced — neither tight nor shiny" },
      { id: "combo", label: "Combination — oily T-zone, drier cheeks" },
      { id: "oily", label: "Oily — visible shine by midday" },
      { id: "reactive", label: "Reactive — stings with most actives" },
    ],
  },
  {
    id: "concern", section: "§ 02 · Concern",
    prompt: "What would you most like the next six months to change?",
    sub: "Pick the one you'd notice in a mirror first. You can add more later.",
    opts: [
      { id: "pigment", label: "Pigment — melasma, post-inflammatory marks, sun damage" },
      { id: "lines", label: "Texture & lines — fine lines, crepiness, loss of bounce" },
      { id: "acne", label: "Acne — active breakouts or recurring spots" },
      { id: "redness", label: "Redness — rosacea, persistent flushing" },
      { id: "barrier", label: "Barrier — sensitised, stinging, over-exfoliated" },
      { id: "dullness", label: "Dullness — uneven tone, lack of glow" },
    ],
  },
  {
    id: "climate", section: "§ 03 · Context",
    prompt: "What does the air around you look like?",
    sub: "Climate moves the routine more than most people realise.",
    opts: [
      { id: "humid", label: "Hot & humid — coastal, tropical, Gulf" },
      { id: "dry-hot", label: "Hot & dry — desert, Mediterranean summer" },
      { id: "temperate", label: "Temperate — most of Europe, US east coast" },
      { id: "cold-dry", label: "Cold & dry — Nordic winter, high altitude" },
      { id: "indoor", label: "Mostly indoors, air-conditioned" },
    ],
  },
  {
    id: "age", section: "§ 04 · Decade",
    prompt: "Which decade are you in?",
    sub: "Used only to weight prevention vs repair. Never stored beyond this session.",
    opts: [
      { id: "20s", label: "20s — under 30" },
      { id: "30s", label: "30s" },
      { id: "40s", label: "40s" },
      { id: "50s", label: "50s" },
      { id: "60+", label: "60 and over" },
    ],
  },
  {
    id: "intensity", section: "§ 05 · Tolerance",
    prompt: "How does your skin respond to actives?",
    sub: "Honest answer. There is no virtue in tolerating retinoids that wreck your barrier.",
    opts: [
      { id: "novice", label: "I've barely used any. Start me gently." },
      { id: "moderate", label: "I tolerate most things at moderate strength." },
      { id: "veteran", label: "I tolerate prescription tretinoin without flinching." },
      { id: "scarred", label: "I've over-done it before and want to be cautious." },
    ],
  },
];

const RESULTS = [
  { tier: "A", title: "Melasma — the long answer", reason: "Matches: pigment concern + temperate climate + 30s. The sunscreen-first protocol.", href: "concerns/melasma" },
  { tier: "A", title: "The pigment-prone AM routine", reason: "5-step morning routine for skin that marks easily. Built around UVMune 400.", href: "routines/am-pigment-prone" },
  { tier: "B", title: "Tranexamic acid — what we know", reason: "Most-cited ingredient for your concern. Tier B oral, Tier C topical.", href: "ingredients/tranexamic-acid" },
];

const Question: React.FC<{ q: Q; idx: number; total: number; value?: string; onPick: (id: string) => void; onBack?: () => void; onNext?: () => void; canNext: boolean }> = ({ q, idx, total, value, onPick, onBack, onNext, canNext }) => (
  <div>
    <div className="flex items-center justify-between mb-10">
      <Eyebrow color={T.accent}>{q.section}</Eyebrow>
      <span style={{ fontFamily: MONO, fontSize: 11, color: T.mutedSoft, letterSpacing: "0.1em" }}>QUESTION {String(idx + 1).padStart(2, "0")} OF {String(total).padStart(2, "0")}</span>
    </div>
    <h2 style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1.05, letterSpacing: "-0.025em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144' }}>
      {q.prompt}
    </h2>
    <p className="mt-5 max-w-2xl" style={{ fontFamily: SERIF_ED, fontStyle: "italic", fontSize: 19, lineHeight: 1.55, color: T.muted }}>
      {q.sub}
    </p>
    <div className="mt-12 grid grid-cols-1 gap-3">
      {q.opts.map((o) => {
        const selected = value === o.id;
        return (
          <button key={o.id} onClick={() => onPick(o.id)} className="text-left transition-colors" style={{
            border: `1px solid ${selected ? T.ink : T.rule}`,
            background: selected ? T.paper2 : T.paper,
            padding: "20px 24px",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
            fontFamily: SERIF, fontSize: 19.5, color: T.ink, lineHeight: 1.3,
          }}>
            <span>{o.label}</span>
            <span className="inline-flex items-center justify-center" style={{
              width: 24, height: 24, borderRadius: 999,
              border: `1px solid ${selected ? T.ink : T.rule}`,
              background: selected ? T.ink : "transparent",
            }}>
              {selected && <Check className="h-3.5 w-3.5" style={{ color: T.paper }} />}
            </span>
          </button>
        );
      })}
    </div>
    <div className="mt-12 flex items-center justify-between">
      <button onClick={onBack} disabled={!onBack} className="inline-flex items-center gap-2 disabled:opacity-30" style={{ fontFamily: SANS, fontSize: 13, color: T.muted, letterSpacing: "0.04em" }}>
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <button onClick={onNext} disabled={!canNext} className="inline-flex items-center gap-3 disabled:opacity-30 px-6 py-3" style={{
        background: T.ink, color: T.paper, fontFamily: SANS, fontSize: 13.5, fontWeight: 500, letterSpacing: "0.04em",
      }}>
        {idx === total - 1 ? "See your guides" : "Continue"} <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  </div>
);

const Diagnostic: React.FC = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const total = QUESTIONS.length;
  const isResult = step >= total;
  const q = QUESTIONS[Math.min(step, total - 1)];
  const value = answers[q.id];

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: T.paper, color: T.ink }}>
      <PaperGrain /><LaidPaper /><TopVignette />

      <SiteHeader />
      <Breadcrumbs trail={[{ label: "Home", href: "#" }, { label: "Diagnostic" }]} />

      {/* Hero band */}
      <section className="relative z-10 border-b" style={{ borderColor: T.rule, background: `linear-gradient(180deg, ${T.paper2} 0%, ${T.paper} 100%)` }}>
        <Container>
          <div className="flex items-start justify-between py-12">
            <div>
              <Eyebrow color={T.accent}>The Diagnostic · 40 seconds · No email</Eyebrow>
              <h1 className="mt-4" style={{ fontFamily: SERIF, fontSize: 78, lineHeight: 0.98, letterSpacing: "-0.035em", fontWeight: 400, fontVariationSettings: '"opsz" 144', color: T.ink }}>
                Five honest questions.<br/>
                <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>Three guides back.</span>
              </h1>
              <p className="mt-6 max-w-2xl" style={{ fontFamily: SERIF_ED, fontStyle: "italic", fontSize: 22, lineHeight: 1.5, color: T.muted }}>
                Not a quiz that sells you a routine. A short triage that tells you which two or three of our concern guides match what you described — and where to start reading.
              </p>
            </div>
            <Folio n="P. 41 · DIAGNOSTIC" />
          </div>
          {/* Trust strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-10 border-t pt-6" style={{ borderColor: T.rule }}>
            {[
              { icon: <Clock className="h-4 w-4" />, k: "40 sec", v: "Median completion" },
              { icon: <Lock className="h-4 w-4" />, k: "No email", v: "No account, no list" },
              { icon: <Shield className="h-4 w-4" />, k: "No storage", v: "Answers cleared on close" },
              { icon: <Sparkles className="h-4 w-4" />, k: "No routine sold", v: "Guides only, never products" },
            ].map((s) => (
              <div key={s.k} className="flex items-start gap-3">
                <span style={{ color: T.accent }}>{s.icon}</span>
                <div>
                  <p style={{ fontFamily: SERIF, fontSize: 18, color: T.ink, lineHeight: 1 }}>{s.k}</p>
                  <p className="mt-1" style={{ fontFamily: SANS, fontSize: 12.5, color: T.muted }}>{s.v}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Quiz body */}
      <section className="relative z-10 py-20">
        <Container max={760}>
          {/* Progress rail */}
          <div className="flex items-center gap-2 mb-16">
            {QUESTIONS.map((qq, i) => {
              const done = !!answers[qq.id];
              const current = i === step;
              return (
                <div key={qq.id} className="flex-1 flex flex-col gap-2">
                  <div style={{
                    height: 3, background: done || current ? T.ink : T.rule,
                  }} />
                  <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.1em", color: current ? T.ink : T.mutedSoft }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              );
            })}
          </div>

          {!isResult ? (
            <Question
              q={q}
              idx={step}
              total={total}
              value={value}
              onPick={(id) => setAnswers((a) => ({ ...a, [q.id]: id }))}
              onBack={step > 0 ? () => setStep((s) => s - 1) : undefined}
              onNext={() => setStep((s) => s + 1)}
              canNext={!!value}
            />
          ) : (
            <div>
              <Eyebrow color={T.accent}>§ 06 · Your guides</Eyebrow>
              <h2 className="mt-4" style={{ fontFamily: SERIF, fontSize: 64, lineHeight: 1.02, letterSpacing: "-0.03em", fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144' }}>
                Three places <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>to start.</span>
              </h2>
              <p className="mt-5 max-w-2xl" style={{ fontFamily: SERIF_ED, fontStyle: "italic", fontSize: 19, lineHeight: 1.55, color: T.muted }}>
                Based on what you described, these three guides answer the most of your situation. Read in order. The first usually solves 70% of the question.
              </p>
              <div className="mt-12 flex flex-col gap-px" style={{ background: T.rule }}>
                {RESULTS.map((r, i) => (
                  <a key={r.title} href="#" className="flex items-start justify-between gap-8 p-8 group" style={{ background: T.paper }}>
                    <div className="flex items-start gap-6">
                      <span style={{ fontFamily: MONO, fontSize: 11, color: T.mutedSoft, letterSpacing: "0.1em", paddingTop: 6 }}>
                        № {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <TierBadge tier={r.tier} />
                          <span style={{ fontFamily: MONO, fontSize: 10.5, color: T.mutedSoft, letterSpacing: "0.08em" }}>/{r.href}</span>
                        </div>
                        <h3 style={{ fontFamily: SERIF, fontSize: 30, lineHeight: 1.1, letterSpacing: "-0.02em", fontWeight: 400, color: T.ink }}>
                          {r.title}
                        </h3>
                        <p className="mt-2 max-w-xl" style={{ fontFamily: SANS, fontSize: 13.5, lineHeight: 1.55, color: T.muted }}>
                          {r.reason}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 mt-2 transition-transform group-hover:translate-x-1" style={{ color: T.ink }} />
                  </a>
                ))}
              </div>

              <div className="mt-16 flex items-center justify-between border-t pt-8" style={{ borderColor: T.rule }}>
                <button onClick={() => { setStep(0); setAnswers({}); }} className="inline-flex items-center gap-2" style={{ fontFamily: SANS, fontSize: 13, color: T.muted }}>
                  <ArrowLeft className="h-4 w-4" /> Run the diagnostic again
                </button>
                <a href="#" style={{ fontFamily: SANS, fontSize: 13, color: T.accent, fontWeight: 500 }}>
                  Email me these three guides instead →
                </a>
              </div>
            </div>
          )}
        </Container>
      </section>

      <Asterism />

      {/* Editor's note */}
      <section className="relative z-10 py-16 border-t" style={{ borderColor: T.rule, background: T.paper2 }}>
        <Container max={840}>
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-3">
              <Eyebrow>From the editors</Eyebrow>
              <p className="mt-3" style={{ fontFamily: MONO, fontSize: 10.5, color: T.mutedSoft, letterSpacing: "0.08em" }}>ON THIS DIAGNOSTIC</p>
            </div>
            <div className="col-span-12 md:col-span-9">
              <p style={{ fontFamily: SERIF_ED, fontStyle: "italic", fontSize: 22, lineHeight: 1.5, color: T.ink }}>
                "Five questions can't replace a dermatologist. They can stop you reading the wrong guide for a fortnight. That's all this is for."
              </p>
              <p className="mt-4" style={{ fontFamily: SANS, fontSize: 13, color: T.muted }}>
                — Dr. Sundeep, Medical Review Lead. The matching weights are documented in the methodology under § 4.2.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <div className="absolute right-12 top-[60vh] z-0 hidden lg:block"><AmbientFlask size={260} opacity={0.04} /></div>

      <SiteFooter />
    </div>
  );
};

export default Diagnostic;
