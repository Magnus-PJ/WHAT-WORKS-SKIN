// Canonical routine catalogue.
//
// Single source of truth for the rows shown on `RoutineIndex` and the
// rows the search registry surfaces in the header overlay. Slug →
// component file map lives here so detail-page URLs stay consistent.

const PREVIEW_BASE = "/__mockup/preview/evidently";

export type RoutineRow = {
  slug: string;
  title: string;
  sub: string;
  goal: string;
  time: "Morning" | "Evening" | "Weekly";
  skinType: string;
  steps: number;
  minutes: number;
  cost: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  body: string;
  reviewer: "Dr. Sundeep" | "Dr. Paul";
  featured?: number;
};

export const ROUTINE_ROWS: RoutineRow[] = [
  // Pigment
  { slug: "am-pigment", title: "Four steps. Twelve minutes.", sub: "AM · Pigment-prone", goal: "Pigmentation", time: "Morning", skinType: "All Fitzpatricks", steps: 4, minutes: 12, cost: "₹ 4–7k", difficulty: "Beginner", body: "Cleanse, antioxidant, pigment-blocker, SPF. The single most-recommended morning protocol on the site.", reviewer: "Dr. Sundeep", featured: 1 },
  { slug: "pm-pigment", title: "The retinoid + azelaic night.", sub: "PM · Pigment-prone", goal: "Pigmentation", time: "Evening", skinType: "All Fitzpatricks", steps: 5, minutes: 18, cost: "₹ 3–6k", difficulty: "Intermediate", body: "Tretinoin + azelaic + barrier seal. The slow-work counterpart to the AM stack.", reviewer: "Dr. Sundeep", featured: 2 },

  // Acne
  { slug: "am-acne", title: "The morning that doesn't strip.", sub: "AM · Adult acne", goal: "Acne", time: "Morning", skinType: "Oily / Combination", steps: 4, minutes: 10, cost: "₹ 3–5k", difficulty: "Beginner", body: "Salicylic cleanser, niacinamide, zinc-only SPF. Gentle on the barrier, hostile to C. acnes.", reviewer: "Dr. Paul", featured: 3 },
  { slug: "pm-acne", title: "Adapalene the right way.", sub: "PM · Adult acne", goal: "Acne", time: "Evening", skinType: "Oily / Combination", steps: 4, minutes: 9, cost: "₹ 1–3k", difficulty: "Beginner", body: "The OTC retinoid most clinicians wish patients started with first.", reviewer: "Dr. Paul", featured: 4 },
  { slug: "weekly-bha", title: "The weekly BHA reset.", sub: "Weekly · Pore reset", goal: "Acne", time: "Weekly", skinType: "Oily / Combination", steps: 3, minutes: 15, cost: "₹ 2k", difficulty: "Intermediate", body: "Clay mask, 2% BHA dwell, barrier seal. Resets without retinoid stacking.", reviewer: "Dr. Paul" },

  // Anti-aging
  { slug: "am-aging", title: "The AM anti-aging stack.", sub: "AM · 35+ skin", goal: "Anti-aging", time: "Morning", skinType: "Mature / Normal", steps: 5, minutes: 14, cost: "₹ 8–14k", difficulty: "Intermediate", body: "Vitamin C, peptides, mineral SPF. Built around prevention, not correction.", reviewer: "Dr. Sundeep" },
  { slug: "pm-aging", title: "Tretinoin without the chaos.", sub: "PM · 35+ skin", goal: "Anti-aging", time: "Evening", skinType: "Mature / Normal", steps: 4, minutes: 11, cost: "₹ 5–9k", difficulty: "Advanced", body: "Buffered tretinoin protocol with ceramide sandwich. Twelve-week ramp.", reviewer: "Dr. Sundeep" },

  // Sensitive
  { slug: "am-sensitive", title: "The minimum viable morning.", sub: "AM · Reactive skin", goal: "Sensitive", time: "Morning", skinType: "Sensitive / Rosacea", steps: 3, minutes: 6, cost: "₹ 3–5k", difficulty: "Beginner", body: "Three steps. No actives. Built for skin that flares at the sight of an INCI list.", reviewer: "Dr. Paul" },
  { slug: "pm-sensitive", title: "Azelaic-only night.", sub: "PM · Reactive skin", goal: "Sensitive", time: "Evening", skinType: "Sensitive / Rosacea", steps: 3, minutes: 7, cost: "₹ 2–4k", difficulty: "Beginner", body: "The single active most rosacea responders tolerate. Low and slow.", reviewer: "Dr. Sundeep" },

  // Pregnancy
  { slug: "pregnancy-am", title: "Pregnancy-safe morning.", sub: "AM · Pregnancy", goal: "Pregnancy", time: "Morning", skinType: "All", steps: 4, minutes: 10, cost: "₹ 3–6k", difficulty: "Beginner", body: "Mineral SPF, alpha arbutin, niacinamide. No retinoids, no salicylic, no hydroquinone.", reviewer: "Dr. Sundeep" },
  { slug: "pregnancy-pm", title: "Pregnancy-safe evening.", sub: "PM · Pregnancy", goal: "Pregnancy", time: "Evening", skinType: "All", steps: 3, minutes: 6, cost: "₹ 2–4k", difficulty: "Beginner", body: "Cleanse, azelaic 10%, ceramide cream. The list of what you can do, not what you can't.", reviewer: "Dr. Sundeep" },

  // Recovery
  { slug: "post-laser", title: "The post-procedure week.", sub: "Recovery · Day 0–7", goal: "Recovery", time: "Weekly", skinType: "All", steps: 4, minutes: 8, cost: "₹ 4–8k", difficulty: "Beginner", body: "Centella, panthenol, occlusive seal. Day-by-day callouts for laser and microneedling.", reviewer: "Dr. Sundeep" },

  // Oil control
  { slug: "oily-balance", title: "The oily-skin balance.", sub: "AM · Oily / Combination", goal: "Sensitive", time: "Morning", skinType: "Oily / Combination", steps: 4, minutes: 8, cost: "₹ 2–4k", difficulty: "Beginner", body: "Niacinamide 10%, gel moisturiser, fluid SPF. Skip the stripping toner; control sebum without dehydrating.", reviewer: "Dr. Paul" },
];

// Slug → detail page component file name (without .tsx).
export const ROUTINE_BUILT: Record<string, string> = {
  "am-pigment": "RoutineDetail",
  "pm-pigment": "RoutinePMBarrier",
  "am-sensitive": "RoutineBareMinimum",
  "pm-sensitive": "RoutineBareMinimum",
  "post-laser": "RoutinePostProcedure",
  "am-acne": "RoutineAMAcne",
  "pm-acne": "RoutinePMAcne",
  "weekly-bha": "RoutineWeeklyBHA",
  "am-aging": "RoutineAMAging",
  "pm-aging": "RoutinePMAging",
  "pregnancy-am": "RoutinePregnancyAM",
  "pregnancy-pm": "RoutinePregnancyPM",
  "oily-balance": "RoutineOilyBalance",
};

export function routineHrefFor(slug: string): string | null {
  const comp = ROUTINE_BUILT[slug];
  return comp ? `${PREVIEW_BASE}/${comp}` : null;
}
