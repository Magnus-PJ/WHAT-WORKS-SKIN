// Canonical Trend Watch issue catalogue.
//
// Single source of truth for the rows shown on `TrendWatchArchive`,
// the rows the search registry surfaces in the header overlay, and
// the home-page Trend Watch ticker. Issue number → component file map
// lives here so issue URLs stay consistent across all surfaces.

const PREVIEW_BASE = "/__mockup/preview/evidently";

export type Verdict = "Holds up" | "Partly true" | "Misleading" | "Skip";

export type TrendWatchIssue = {
  n: number;
  date: string;
  year: number;
  headline: string;
  dek: string;
  trends: { name: string; verdict: Verdict }[];
  signed: string;
};

export const TREND_WATCH_ISSUES: TrendWatchIssue[] = [
  { n: 14, date: "20 April 2026", year: 2026, headline: "Beef tallow, the LED mask reckoning, and a sunscreen recall in Korea",
    dek: "Three trends that filled our inbox in March. Two don't survive a closer look.",
    trends: [{ name: "Beef tallow as moisturiser", verdict: "Skip" }, { name: "At-home red-light masks", verdict: "Partly true" }, { name: "Korean PA++++ recall", verdict: "Holds up" }],
    signed: "Dr. Paul + Dr. Sundeep" },
  { n: 13, date: "06 April 2026", year: 2026, headline: "Snail mucin, the rise of polyglutamic acid, and 'skin cycling' redux",
    dek: "When a TikTok regimen meets a peer-reviewed paper. Neither wins outright.",
    trends: [{ name: "Snail secretion filtrate", verdict: "Partly true" }, { name: "Polyglutamic acid", verdict: "Holds up" }, { name: "Skin cycling 4-night protocol", verdict: "Partly true" }],
    signed: "Dr. Paul" },
  { n: 12, date: "23 March 2026", year: 2026, headline: "The collagen drink question, finally settled",
    dek: "A meta-analysis dropped. We read all 19 trials. Here is what they actually say.",
    trends: [{ name: "Hydrolysed collagen peptides", verdict: "Partly true" }, { name: "Vegan collagen 'boosters'", verdict: "Skip" }, { name: "Bone broth claims", verdict: "Misleading" }],
    signed: "Dr. Sundeep" },
  { n: 11, date: "09 March 2026", year: 2026, headline: "Bakuchiol vs retinol, take three. New data from Seoul.",
    dek: "Twelve-week split-face trial, 84 participants. The result is more interesting than the headline.",
    trends: [{ name: "Bakuchiol 0.5% nightly", verdict: "Holds up" }, { name: "Bakuchiol as 'pregnancy-safe retinol'", verdict: "Misleading" }],
    signed: "Dr. Paul" },
  { n: 10, date: "23 February 2026", year: 2026, headline: "Mineral sunscreens are catching up. Slowly.",
    dek: "We tested four new SPF 50 mineral formulations against the chemical category leader.",
    trends: [{ name: "New zinc-only PA++++ filters", verdict: "Holds up" }, { name: "'Reef-safe' marketing claims", verdict: "Misleading" }, { name: "SPF in moisturisers", verdict: "Skip" }],
    signed: "Dr. Sundeep" },
  { n: 9, date: "09 February 2026", year: 2026, headline: "Methylene blue, NMN, and the longevity-skincare overlap",
    dek: "Three supplements crossed over from the longevity world into our inbox. One of them is interesting.",
    trends: [{ name: "Topical methylene blue", verdict: "Partly true" }, { name: "Oral NMN for skin", verdict: "Skip" }, { name: "Glycine + NAC stack", verdict: "Partly true" }],
    signed: "Dr. Paul + Dr. Sundeep" },
  { n: 8, date: "26 January 2026", year: 2026, headline: "The retinal vs retinol debate, again",
    dek: "A reader asked us to settle it. We read 31 studies. The answer depends on which question you mean.",
    trends: [{ name: "Retinaldehyde 0.05%", verdict: "Holds up" }, { name: "Retinol 0.5% time-released", verdict: "Holds up" }, { name: "OTC 'retinol esters'", verdict: "Misleading" }],
    signed: "Dr. Paul" },
  { n: 7, date: "12 January 2026", year: 2026, headline: "Beef-fat creams, the 2026 edition",
    dek: "We did not expect to write about tallow twice. Here we are.",
    trends: [{ name: "Grass-fed tallow balms", verdict: "Skip" }],
    signed: "Dr. Paul" },
  { n: 6, date: "29 December 2025", year: 2025, headline: "Year-end: the five things that earned a Tier-A grade in 2025",
    dek: "And the three things that lost theirs.",
    trends: [{ name: "Tranexamic acid (oral)", verdict: "Holds up" }, { name: "Heliocare oral", verdict: "Holds up" }, { name: "Centella triterpenes", verdict: "Holds up" }],
    signed: "Dr. Paul + Dr. Sundeep" },
  { n: 5, date: "15 December 2025", year: 2025, headline: "Microneedling at home: a careful no",
    dek: "Two new derma-roller brands sent us samples. We sent them back.",
    trends: [{ name: "0.5mm at-home dermarollers", verdict: "Skip" }, { name: "0.25mm dermastamps", verdict: "Partly true" }],
    signed: "Dr. Sundeep" },
  { n: 4, date: "01 December 2025", year: 2025, headline: "Mandelic acid is having a moment. We agree, with footnotes.",
    dek: "The case for mandelic in skin of colour is stronger than the case for glycolic. Here is the evidence.",
    trends: [{ name: "Mandelic 10% serums", verdict: "Holds up" }, { name: "Mandelic + lactic blends", verdict: "Partly true" }],
    signed: "Dr. Paul" },
  { n: 3, date: "17 November 2025", year: 2025, headline: "The peptide gold rush, sorted",
    dek: "Copper peptides, GHK, Matrixyl, palmitoyl tripeptide-1. Which ones earned their badge.",
    trends: [{ name: "GHK-Cu 1%", verdict: "Partly true" }, { name: "Matrixyl 3000", verdict: "Holds up" }, { name: "Argireline (acetyl hexapeptide-8)", verdict: "Misleading" }],
    signed: "Dr. Paul" },
  { n: 2, date: "03 November 2025", year: 2025, headline: "Slugging, vaseline, and the petrolatum question",
    dek: "TikTok rediscovered occlusion. We re-read the dermatology literature so you don't have to.",
    trends: [{ name: "Overnight slugging (full-face)", verdict: "Partly true" }, { name: "Petrolatum on barrier flares", verdict: "Holds up" }, { name: "Slugging over actives", verdict: "Misleading" }],
    signed: "Dr. Sundeep" },
  { n: 1, date: "20 October 2025", year: 2025, headline: "The launch issue: what we believe in, what we don't",
    dek: "A founding manifesto disguised as a verdict column. Three trends, no advertisers.",
    trends: [{ name: "10-step K-beauty routines", verdict: "Misleading" }, { name: "Daily SPF (high UVA-PF)", verdict: "Holds up" }, { name: "'Skin types' as identity", verdict: "Partly true" }],
    signed: "Dr. Paul + Dr. Sundeep" },
];

// Issue number → detail page component file name (without .tsx).
export const TREND_WATCH_BUILT: Record<number, string> = {
  14: "TrendWatch",
  13: "TrendWatch013",
  12: "TrendWatch012",
  11: "TrendWatch011",
  10: "TrendWatch010",
  9: "TrendWatch009",
  8: "TrendWatch008",
  7: "TrendWatch007",
  6: "TrendWatch006",
  5: "TrendWatch005",
  4: "TrendWatch004",
  3: "TrendWatch003",
  2: "TrendWatch002",
  1: "TrendWatch001",
};

export function trendWatchHrefFor(n: number): string | null {
  const comp = TREND_WATCH_BUILT[n];
  return comp ? `${PREVIEW_BASE}/${comp}` : null;
}
