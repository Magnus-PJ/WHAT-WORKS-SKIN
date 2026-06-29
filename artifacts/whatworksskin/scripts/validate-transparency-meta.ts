/**
 * Contract test: the shared transparency metadata
 * (`src/content/transparency/meta.json`) — which drives the
 * "last updated" timestamps on /methodology, /how-we-rate,
 * /sources, and /corrections, plus the methodology version
 * shown on the dossier and the linked PDF filename — stays
 * internally consistent and doesn't quietly go stale.
 *
 * Checks performed:
 *   1. Every changelog entry has an ISO date (YYYY-MM-DD) and a
 *      SemVer-ish version (vMAJOR.MINOR). The Astro schema enforces
 *      the same regexes, but we re-check here so the contract
 *      lives next to the rest of the validate:* suite and the
 *      script can run standalone without booting Astro.
 *   2. Every changelog date is a real calendar date and not in the
 *      future (the schema's regex would happily accept 2026-13-99).
 *   3. The latest changelog entry (by version, descending) matches
 *      `methodology.version` — the same string the methodology
 *      page bakes into the `methodology-vX.Y.pdf` download link.
 *      A version bump in the changelog without bumping the live
 *      methodology version (or vice-versa) would publish a stale
 *      download link.
 *   4. `methodology.lastUpdated` is on or after the date of the
 *      latest changelog entry. The dossier stamp doubles as a
 *      "last reviewed" date so it can move forward without a new
 *      changelog row, but it must never lag behind the most
 *      recent rubric change.
 *   5. Every `pages.*` lastUpdated date is real. Any date older
 *      than the staleness threshold (default 6 months) is reported
 *      as a non-fatal warning so editors notice surfaces drifting
 *      out of date before readers do. Override with
 *      `TRANSPARENCY_STALE_MONTHS=N` (set 0 to disable).
 *
 * Run via:
 *   pnpm --filter @workspace/whatworksskin run validate:transparency-meta
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const META_PATH = join(
  __dirname,
  "..",
  "src",
  "content",
  "transparency",
  "meta.json",
);

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const SEMVERISH = /^v(\d+)\.(\d+)$/;

type ChangelogEntry = { v: string; date: string; note: string };
type Meta = {
  methodology: {
    version: string;
    lastUpdated: string;
    changelog: ChangelogEntry[];
  };
  pages: Record<string, string>;
};

const meta = JSON.parse(readFileSync(META_PATH, "utf8")) as Meta;

const errors: string[] = [];
const warnings: string[] = [];

function parseIsoDate(s: string): Date | null {
  const m = ISO_DATE.exec(s);
  if (!m) return null;
  const [, y, mo, d] = m;
  const dt = new Date(`${y}-${mo}-${d}T00:00:00Z`);
  if (Number.isNaN(dt.getTime())) return null;
  if (
    dt.getUTCFullYear() !== Number(y) ||
    dt.getUTCMonth() + 1 !== Number(mo) ||
    dt.getUTCDate() !== Number(d)
  ) {
    return null;
  }
  return dt;
}

function compareVersion(a: string, b: string): number {
  const am = SEMVERISH.exec(a)!;
  const bm = SEMVERISH.exec(b)!;
  const [aMaj, aMin] = [Number(am[1]), Number(am[2])];
  const [bMaj, bMin] = [Number(bm[1]), Number(bm[2])];
  return aMaj === bMaj ? aMin - bMin : aMaj - bMaj;
}

const today = new Date();
today.setUTCHours(0, 0, 0, 0);

// 1 + 2: changelog format and real-date check.
const { changelog } = meta.methodology;
if (!Array.isArray(changelog) || changelog.length === 0) {
  errors.push("methodology.changelog: must contain at least one entry");
}

for (const [i, entry] of changelog.entries()) {
  const where = `methodology.changelog[${i}]`;
  if (!SEMVERISH.test(entry.v)) {
    errors.push(`${where}.v: "${entry.v}" is not SemVer-ish (vMAJOR.MINOR)`);
  }
  const dt = parseIsoDate(entry.date);
  if (!dt) {
    errors.push(
      `${where}.date: "${entry.date}" is not a real ISO calendar date (YYYY-MM-DD)`,
    );
  } else if (dt.getTime() > today.getTime()) {
    errors.push(`${where}.date: "${entry.date}" is in the future`);
  }
  if (typeof entry.note !== "string" || entry.note.trim() === "") {
    errors.push(`${where}.note: must be a non-empty string`);
  }
}

// 3 + 4: the latest changelog entry must match the live methodology
//        version + lastUpdated date the dossier renders.
if (changelog.length > 0 && changelog.every((e) => SEMVERISH.test(e.v))) {
  const sorted = [...changelog].sort((a, b) => compareVersion(b.v, a.v));
  const latest = sorted[0];

  if (!SEMVERISH.test(meta.methodology.version)) {
    errors.push(
      `methodology.version: "${meta.methodology.version}" is not SemVer-ish (vMAJOR.MINOR)`,
    );
  } else if (latest.v !== meta.methodology.version) {
    errors.push(
      `methodology.version "${meta.methodology.version}" does not match latest changelog entry "${latest.v}" — the methodology page links to methodology-${meta.methodology.version}.pdf, so the changelog and the download link would disagree.`,
    );
  }

  const luDt = parseIsoDate(meta.methodology.lastUpdated);
  if (!luDt) {
    errors.push(
      `methodology.lastUpdated: "${meta.methodology.lastUpdated}" is not a real ISO calendar date`,
    );
  } else {
    const latestDt = parseIsoDate(latest.date);
    if (latestDt && luDt.getTime() < latestDt.getTime()) {
      errors.push(
        `methodology.lastUpdated "${meta.methodology.lastUpdated}" is earlier than the latest changelog entry "${latest.v}" on ${latest.date} — the dossier would advertise a stale review date.`,
      );
    }
  }
}

// 5: per-page staleness warnings.
const staleMonthsRaw = process.env.TRANSPARENCY_STALE_MONTHS;
const staleMonths =
  staleMonthsRaw !== undefined && staleMonthsRaw !== ""
    ? Number(staleMonthsRaw)
    : 6;
if (!Number.isFinite(staleMonths) || staleMonths < 0) {
  errors.push(
    `TRANSPARENCY_STALE_MONTHS: "${staleMonthsRaw}" must be a non-negative number`,
  );
}

const staleThreshold =
  staleMonths > 0
    ? (() => {
        const t = new Date(today);
        t.setUTCMonth(t.getUTCMonth() - staleMonths);
        return t;
      })()
    : null;

const stampsToCheck: Array<[string, string]> = [
  ["methodology.lastUpdated", meta.methodology.lastUpdated],
  ...Object.entries(meta.pages ?? {}).map(
    ([k, v]) => [`pages.${k}`, v] as [string, string],
  ),
];

for (const [where, date] of stampsToCheck) {
  const dt = parseIsoDate(date);
  if (!dt) {
    // methodology.lastUpdated is already format-checked above; skip the
    // duplicate error for it here.
    if (where !== "methodology.lastUpdated") {
      errors.push(`${where}: "${date}" is not a real ISO calendar date`);
    }
    continue;
  }
  if (dt.getTime() > today.getTime()) {
    errors.push(`${where}: "${date}" is in the future`);
    continue;
  }
  if (staleThreshold && dt.getTime() < staleThreshold.getTime()) {
    warnings.push(
      `${where}: last updated ${date} — older than ${staleMonths} months. Review and bump the date if still current.`,
    );
  }
}

if (errors.length > 0) {
  console.error(
    `transparency-meta: ${errors.length} error${errors.length === 1 ? "" : "s"}`,
  );
  for (const e of errors) console.error(`  ✗ ${e}`);
  if (warnings.length > 0) {
    console.error(
      `\ntransparency-meta: ${warnings.length} warning${warnings.length === 1 ? "" : "s"}`,
    );
    for (const w of warnings) console.error(`  ! ${w}`);
  }
  process.exit(1);
}

if (warnings.length > 0) {
  console.warn(
    `transparency-meta: ${warnings.length} warning${warnings.length === 1 ? "" : "s"}`,
  );
  for (const w of warnings) console.warn(`  ! ${w}`);
}

const pageCount = Object.keys(meta.pages ?? {}).length;
console.log(
  `transparency-meta: OK — methodology ${meta.methodology.version} (${meta.methodology.lastUpdated}), ${changelog.length} changelog entr${changelog.length === 1 ? "y" : "ies"}, ${pageCount} page timestamp${pageCount === 1 ? "" : "s"} scanned.`,
);
