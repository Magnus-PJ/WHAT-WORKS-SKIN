import { getEntry } from "astro:content";

export type TransparencyPageKey =
  | "methodology"
  | "howWeRate"
  | "sources"
  | "corrections"
  | "editors"
  | "letters";

export type TransparencyChangelogEntry = {
  v: string;
  date: string;
  note: string;
};

export type TransparencyMeta = {
  methodology: {
    version: string;
    lastUpdated: string;
    changelog: TransparencyChangelogEntry[];
  };
  pages: Record<TransparencyPageKey, string>;
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Format an ISO date ("2026-04-02") as "2 April 2026" to match the existing
 * editorial copy on the transparency surfaces.
 */
export function formatLongDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

/** Year-only convenience used in the methodology rail (e.g. "RUBRIC v1.2 · 2026"). */
export function yearOf(iso: string): string {
  const m = /^(\d{4})-/.exec(iso);
  return m ? m[1] : iso;
}

export async function loadTransparencyMeta(): Promise<TransparencyMeta> {
  const entry = await getEntry("transparency", "meta");
  if (!entry) {
    throw new Error(
      "transparency/meta.json is missing — required for the transparency-style reader pages.",
    );
  }
  return entry.data as TransparencyMeta;
}
