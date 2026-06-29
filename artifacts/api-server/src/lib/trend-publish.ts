// Trend Radar publish helpers.
//
// When a reviewer (Dr. Paul / Dr. Sundeep) approves a candidate from
// the trend queue, the API needs to write the verdict back into the
// Astro `whatworksskin` content collection so the next site rebuild
// picks it up. We deliberately keep this as plain `fs.writeFile` to
// flat JSON: the Astro collection schema is stable, the editorial
// voice is short-form, and a Git diff on a JSON file is easier for the
// founders to review than a generated MDX blob.
//
// Path resolution: the api-server runs from `artifacts/api-server/`
// in dev (esbuild outputs to `dist/`, started via Node), and shares
// the monorepo filesystem with `artifacts/whatworksskin/`. We anchor
// off `process.cwd()` (the artifact dir) and walk up two segments to
// land in the workspace root, then descend into the target collection.
//
// Deployment topology: the api-server is intended to run on Replit
// (Reserved-VM-style with a writable repo checkout); only the static
// Astro `whatworksskin` site ships to Vercel. That means the publish
// step writes into a developer-controlled checkout, not into Vercel's
// read-only serverless filesystem. Getting these JSON files into the
// source repo Vercel builds from is the job of `trend-sync.ts`, which
// the approve route invokes immediately after a successful local write
// to open a Pull Request via the GitHub REST API. If the api-server
// ever migrates to a serverless host, this helper must be replaced
// with one that writes directly to GitHub (or to object storage) since
// there will no longer be a writable checkout to land the file in
// before the sync step runs.

import { promises as fs } from "node:fs";
import path from "node:path";

const COLLECTION_ROOT = "artifacts/whatworksskin/src/content";
const TREND_WATCH_DIR = `${COLLECTION_ROOT}/trend-watch`;
const INGREDIENT_DRAFTS_DIR = `${COLLECTION_ROOT}/ingredients/_drafts`;

// Reverse-derive the repo-relative path of a previously-published
// candidate from the row's `status` + `publishedSlug`. Used by the
// sync-retry route, which must re-run the GitHub sync against the
// existing local file *without* re-allocating an issue number or
// touching the filesystem. Kept here (not in the route file) so the
// dir convention has exactly one owner — if the trend-watch or
// ingredients-draft folder ever moves, both publish and retry will
// follow the new constant in lockstep.
export function publishedPathForApproved(
  status: "approved-trendwatch" | "approved-draft",
  slug: string,
): string {
  const dir = status === "approved-trendwatch" ? TREND_WATCH_DIR : INGREDIENT_DRAFTS_DIR;
  return `${dir}/${slug}.json`;
}

// Same status → template mapping the approve route uses when claiming
// a row, exposed so the sync-retry route can pass the right `template`
// (used in the PR title prefix) without having to read it back from
// the candidate row's `suggestedTemplate` (which is the LLM's guess,
// not necessarily what the reviewer ultimately published as).
export function templateForApprovedStatus(
  status: "approved-trendwatch" | "approved-draft",
): "trend-watch" | "ingredient-draft" {
  return status === "approved-trendwatch" ? "trend-watch" : "ingredient-draft";
}

// Walk up from `process.cwd()` until we hit a directory that contains
// the `artifacts/whatworksskin` content folder. In dev the api-server
// runs from `<repo>/artifacts/api-server`, but allowing the lookup to
// traverse a few levels keeps this resilient if the entry point ever
// moves (e.g. when esbuild is launched from `dist/`).
export async function findRepoRoot(): Promise<string> {
  let dir = process.cwd();
  for (let i = 0; i < 6; i++) {
    try {
      await fs.access(path.join(dir, COLLECTION_ROOT));
      return dir;
    } catch {
      const next = path.dirname(dir);
      if (next === dir) break;
      dir = next;
    }
  }
  throw new Error(
    `trend-publish: could not locate ${COLLECTION_ROOT} from cwd=${process.cwd()}`,
  );
}

function todayHumanDate(): { date: string; year: number } {
  const d = new Date();
  const months = [
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
  return {
    date: `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`,
    year: d.getFullYear(),
  };
}

function pad3(n: number): string {
  return n.toString().padStart(3, "0");
}

// Pure JSON serialisation with sorted keys at the top level so the
// content-collection diffs are stable across runs. We don't deep-sort
// inside `verdicts[]` because the verdicts list is editorial-ordered
// (the n="01"/02/03 numbering matters) and re-sorting it would scramble
// the founders' intended reading order.
function stableStringify(value: unknown): string {
  return JSON.stringify(value, null, 2) + "\n";
}

export type TrendWatchVerdict = {
  n?: string;
  name: string;
  verdict: string;
  tier?: string;
  body?: string;
  bottom?: string;
};

export type TrendWatchIssuePayload = {
  headline: string;
  dek: string;
  verdict: TrendWatchVerdict;
};

export type PublishResult = {
  publishedSlug: string;
  publishedPath: string;
};

// Scan the trend-watch dir for the highest existing `issue-NNN`. Used
// as the starting point for the exclusive-create retry loop below.
async function highestIssueNumber(repoRoot: string): Promise<number> {
  const dir = path.join(repoRoot, TREND_WATCH_DIR);
  const files = await fs.readdir(dir);
  let max = 0;
  for (const f of files) {
    const m = /^issue-(\d{3})\.json$/.exec(f);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > max) max = n;
    }
  }
  return max;
}

const MAX_ALLOC_RETRIES = 25;

// Errors with a `code` field (Node fs errors).
function isErrnoExceptionWithCode(e: unknown, code: string): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code: unknown }).code === code
  );
}

export async function publishTrendWatchIssue(
  payload: TrendWatchIssuePayload,
): Promise<PublishResult> {
  const repoRoot = await findRepoRoot();
  const dir = path.join(repoRoot, TREND_WATCH_DIR);
  const { date, year } = todayHumanDate();

  // Allocate `issue-NNN` atomically: open with `wx` (exclusive create
  // — fails with EEXIST if the file already exists) so two parallel
  // approvals can't both pick the same NNN and overwrite each other.
  // On EEXIST, advance to NNN+1 and retry.
  let n = (await highestIssueNumber(repoRoot)) + 1;
  for (let attempt = 0; attempt < MAX_ALLOC_RETRIES; attempt++) {
    const slug = `issue-${pad3(n)}`;
    const absPath = path.join(dir, `${slug}.json`);
    const issue = {
      slug,
      n,
      date,
      year,
      headline: payload.headline,
      dek: payload.dek,
      signed: "Dr. Paul + Dr. Sundeep",
      pageRef: `P. ${pad3(n)}`,
      eyebrow: `Trend Watch · Issue ${pad3(n)} · ${date}`,
      verdicts: [
        {
          n: "01",
          name: payload.verdict.name,
          tier: payload.verdict.tier ?? "",
          verdict: payload.verdict.verdict,
          color: "",
          body: payload.verdict.body ?? "",
          bottom: payload.verdict.bottom ?? "",
        },
      ],
    };
    try {
      await fs.writeFile(absPath, stableStringify(issue), { encoding: "utf8", flag: "wx" });
      return { publishedSlug: slug, publishedPath: `${TREND_WATCH_DIR}/${slug}.json` };
    } catch (err) {
      if (isErrnoExceptionWithCode(err, "EEXIST")) {
        n += 1;
        continue;
      }
      throw err;
    }
  }
  throw new Error(`trend-publish: could not allocate issue slug after ${MAX_ALLOC_RETRIES} retries`);
}

export type IngredientDraftPayload = {
  name: string;
  summary: string;
  verdict: string;
  tier: string;
  bottom?: string;
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// Ingredient drafts land in a `_drafts/` sub-folder so the Astro
// collection schema does not pick them up automatically (Astro ignores
// underscore-prefixed entries). Reviewers move the draft into place by
// hand once they've added evidence citations and a tier.
export async function publishIngredientDraft(
  payload: IngredientDraftPayload,
): Promise<PublishResult> {
  const repoRoot = await findRepoRoot();
  const dir = path.join(repoRoot, INGREDIENT_DRAFTS_DIR);
  await fs.mkdir(dir, { recursive: true });

  const baseSlug = slugify(payload.name) || `draft-${Date.now()}`;
  // Same exclusive-create + retry pattern as trend-watch issues, so two
  // parallel approvals of similarly-named ingredients can't clobber
  // each other's draft.
  let suffix = 1;
  let slug = baseSlug;
  for (let attempt = 0; attempt < MAX_ALLOC_RETRIES; attempt++) {
    const absPath = path.join(dir, `${slug}.json`);
    const draft = {
      slug,
      name: payload.name,
      summary: payload.summary,
      verdict: payload.verdict,
      tier: payload.tier,
      bottom: payload.bottom ?? "",
      status: "draft",
      suggestedBy: "trend-radar",
      createdAt: new Date().toISOString(),
    };
    try {
      await fs.writeFile(absPath, stableStringify(draft), { encoding: "utf8", flag: "wx" });
      return {
        publishedSlug: slug,
        publishedPath: `${INGREDIENT_DRAFTS_DIR}/${slug}.json`,
      };
    } catch (err) {
      if (isErrnoExceptionWithCode(err, "EEXIST")) {
        suffix += 1;
        slug = `${baseSlug}-${suffix}`;
        continue;
      }
      throw err;
    }
  }
  throw new Error(`trend-publish: could not allocate ingredient draft slug after ${MAX_ALLOC_RETRIES} retries`);
}
