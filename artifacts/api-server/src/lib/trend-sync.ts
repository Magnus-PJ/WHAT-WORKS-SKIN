// Trend Radar publish → GitHub PR sync.
//
// Why this exists
// ---------------
// `trend-publish.ts` writes the approved JSON file into the api-server's
// local repo checkout. That checkout is *not* the source repo Vercel
// builds whatworksskin.com from, so without a sync step approvals stay
// invisible to the public site. This helper closes that gap by opening
// a Pull Request against the source repo with the just-written file as
// its only diff.
//
// Why a PR (not a direct push or object storage)
// ----------------------------------------------
//   - Editorial workflow already routes through Dr. Paul + Dr. Sundeep;
//     a PR is the natural review surface and Vercel will spin up a
//     preview deployment per PR for them to eyeball before merge.
//   - Direct push-to-main would skip that review and force-trust the
//     LLM-assisted draft with no human checkpoint between approval and
//     production.
//   - Object storage + a custom build hook adds two extra moving parts
//     (storage bucket lifecycle, Vercel build-step) and forfeits the
//     PR-preview benefit.
//
// Configuration (all env vars optional → unconfigured = silent skip)
// ------------------------------------------------------------------
//   TREND_SYNC_GITHUB_TOKEN          fine-grained PAT with repo:contents:write
//                                    + pull_requests:write on the target repo
//   TREND_SYNC_GITHUB_OWNER          e.g. "whatworksskin"
//   TREND_SYNC_GITHUB_REPO           e.g. "whatworksskin"
//   TREND_SYNC_GITHUB_BASE_BRANCH    default "main"
//   TREND_SYNC_GITHUB_REVIEWERS      comma-separated GitHub usernames
//                                    (best-effort; bad usernames are not fatal)
//
// When any of token/owner/repo is missing the helper returns
// `{ status: "skipped" }` so the local-only dev flow keeps working
// untouched. The approve route treats sync failures as non-fatal:
// the file is already on disk, so a founder can `git push` by hand.
//
// Implementation notes
// --------------------
// We hit the REST API directly via fetch instead of pulling Octokit:
// Octokit is ~1MB of bundled JS for what is here just five HTTP calls,
// and esbuild already has to transitively pull our other deps.
//
// Branch naming includes a millisecond timestamp so re-runs (e.g.
// after a transient 5xx on the first attempt) don't collide with an
// existing branch. The branch is created from the current head SHA of
// the base branch — we don't try to handle a moving base mid-flight,
// because the source repo is editorially low-traffic and a stale base
// just means GitHub's PR view will show the merge UI normally.

import { promises as fs } from "node:fs";
import path from "node:path";

const GITHUB_API = "https://api.github.com";
const USER_AGENT = "whatworksskin-trend-radar/1.0";

export type TrendSyncSkipped = { status: "skipped"; reason: string };
export type TrendSyncSucceeded = {
  status: "synced";
  pullRequestUrl: string;
  pullRequestNumber: number;
  branch: string;
};
export type TrendSyncFailed = {
  status: "failed";
  reason: string;
  branch?: string;
};
export type TrendSyncResult =
  | TrendSyncSkipped
  | TrendSyncSucceeded
  | TrendSyncFailed;

export type TrendSyncInput = {
  repoRoot: string;
  // Repo-relative POSIX path of the file we just wrote (e.g.
  // `artifacts/whatworksskin/src/content/trend-watch/issue-014.json`).
  relativePath: string;
  // Slug used as part of the branch name and PR title.
  slug: string;
  // Short editorial summary for the PR body. Trimmed for length.
  summary: string;
  // "trend-watch" | "ingredient-draft" — drives PR title prefix.
  template: "trend-watch" | "ingredient-draft";
};

type GitHubConfig = {
  token: string;
  owner: string;
  repo: string;
  baseBranch: string;
  reviewers: string[];
};

function readConfig(): GitHubConfig | { missing: string } {
  const token = process.env.TREND_SYNC_GITHUB_TOKEN?.trim();
  const owner = process.env.TREND_SYNC_GITHUB_OWNER?.trim();
  const repo = process.env.TREND_SYNC_GITHUB_REPO?.trim();
  const baseBranch =
    process.env.TREND_SYNC_GITHUB_BASE_BRANCH?.trim() || "main";
  const reviewers = (process.env.TREND_SYNC_GITHUB_REVIEWERS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!token) return { missing: "TREND_SYNC_GITHUB_TOKEN" };
  if (!owner) return { missing: "TREND_SYNC_GITHUB_OWNER" };
  if (!repo) return { missing: "TREND_SYNC_GITHUB_REPO" };
  return { token, owner, repo, baseBranch, reviewers };
}

function authHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": USER_AGENT,
  };
}

async function ghFetch(
  url: string,
  init: RequestInit,
): Promise<{ ok: boolean; status: number; body: unknown; rawText: string }> {
  const res = await fetch(url, init);
  const rawText = await res.text();
  let body: unknown = null;
  if (rawText) {
    try {
      body = JSON.parse(rawText);
    } catch {
      body = rawText;
    }
  }
  return { ok: res.ok, status: res.status, body, rawText };
}

function describeError(prefix: string, status: number, body: unknown): string {
  const message =
    typeof body === "object" &&
    body !== null &&
    "message" in body &&
    typeof (body as { message: unknown }).message === "string"
      ? (body as { message: string }).message
      : "(no message)";
  return `${prefix}: ${status} ${message}`;
}

// Slug of a posix path's parent directory used to make the branch name
// human-readable in GitHub's UI. We don't include the full path because
// branch refs with deep slashes get noisy in the picker.
function posixSlugFromPath(p: string): string {
  const base = p.split("/").pop() ?? p;
  return base.replace(/\.[^./]+$/, "");
}

function safeBranchSegment(s: string): string {
  return s.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
}

function buildPrBody(input: TrendSyncInput): string {
  const trimmed = input.summary.trim();
  const summary =
    trimmed.length > 600 ? `${trimmed.slice(0, 597).trimEnd()}…` : trimmed;
  return [
    "Auto-opened by the api-server's Trend Radar approval flow.",
    "",
    `**Template:** \`${input.template}\``,
    `**Slug:** \`${input.slug}\``,
    `**File:** \`${input.relativePath}\``,
    "",
    "**Editorial summary**",
    "",
    summary || "_(no summary)_",
    "",
    "Merging this PR ships the approved entry to whatworksskin.com on the next Vercel build.",
  ].join("\n");
}

export async function syncPublishedFileToGitHub(
  input: TrendSyncInput,
): Promise<TrendSyncResult> {
  const cfg = readConfig();
  if ("missing" in cfg) {
    return {
      status: "skipped",
      reason: `${cfg.missing} not set`,
    };
  }

  // Read the file from the api-server's local checkout. The publish
  // helper has already written it; we just need the bytes to ship up
  // to GitHub as a base64-encoded contents blob.
  const absPath = path.join(input.repoRoot, input.relativePath);
  let fileBuf: Buffer;
  try {
    fileBuf = await fs.readFile(absPath);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { status: "failed", reason: `read local file failed: ${msg}` };
  }
  const contentB64 = fileBuf.toString("base64");

  const slugForBranch =
    safeBranchSegment(input.slug) ||
    safeBranchSegment(posixSlugFromPath(input.relativePath)) ||
    "trend";
  const branch = `trend-radar/${slugForBranch}-${Date.now()}`;
  const headers = authHeaders(cfg.token);

  // 1. Resolve the base branch SHA so we can fork a new branch off it.
  const refUrl = `${GITHUB_API}/repos/${cfg.owner}/${cfg.repo}/git/ref/heads/${encodeURIComponent(cfg.baseBranch)}`;
  const refRes = await ghFetch(refUrl, { method: "GET", headers });
  if (!refRes.ok) {
    return {
      status: "failed",
      reason: describeError("get base ref failed", refRes.status, refRes.body),
    };
  }
  const baseSha = (() => {
    const body = refRes.body;
    if (
      typeof body === "object" &&
      body !== null &&
      "object" in body &&
      typeof (body as { object: unknown }).object === "object" &&
      (body as { object: { sha?: unknown } }).object?.sha &&
      typeof (body as { object: { sha?: unknown } }).object.sha === "string"
    ) {
      return (body as { object: { sha: string } }).object.sha;
    }
    return null;
  })();
  if (!baseSha) {
    return {
      status: "failed",
      reason: "get base ref returned no sha",
    };
  }

  // 2. Create the new branch ref. 422 here typically means the branch
  // name already exists (timestamp collision is astronomically unlikely
  // but we surface the GitHub message verbatim).
  const createRefUrl = `${GITHUB_API}/repos/${cfg.owner}/${cfg.repo}/git/refs`;
  const createRefRes = await ghFetch(createRefUrl, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      ref: `refs/heads/${branch}`,
      sha: baseSha,
    }),
  });
  if (!createRefRes.ok) {
    return {
      status: "failed",
      reason: describeError(
        "create branch failed",
        createRefRes.status,
        createRefRes.body,
      ),
      branch,
    };
  }

  // 3. PUT the file on the new branch via the Contents API. This
  // single call creates the blob, tree, and commit in one shot, which
  // is exactly what we need for a one-file PR.
  //
  // We deliberately don't pass a `sha` (which the API requires for
  // *updates*) because every approval allocates a fresh `issue-NNN`
  // slug on the local side and is therefore expected to be a pure
  // create. If the local checkout's `highestIssueNumber()` lookup is
  // stale (e.g. the source repo already has the same `issue-NNN.json`
  // because a parallel approval landed elsewhere first), GitHub will
  // 422 with a "file already exists" message — that propagates back as
  // `status: "failed"` with a useful `reason`, the local file stays on
  // disk, and the operator reconciles by picking a fresh slug + retry
  // (or manually pushing). We don't auto-bump the local slug because
  // the local file (already named `issue-NNN.json` and recorded in the
  // candidate row) would also need renaming and the simpler recovery
  // path is "re-approve to allocate a new local NNN."
  const contentsUrl = `${GITHUB_API}/repos/${cfg.owner}/${cfg.repo}/contents/${input.relativePath
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
  const putRes = await ghFetch(contentsUrl, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `trend-radar: publish ${input.slug}`,
      content: contentB64,
      branch,
    }),
  });
  if (!putRes.ok) {
    return {
      status: "failed",
      reason: describeError(
        "put contents failed",
        putRes.status,
        putRes.body,
      ),
      branch,
    };
  }

  // 4. Open the PR.
  const titlePrefix =
    input.template === "trend-watch" ? "Trend Watch" : "Ingredient draft";
  const prUrl = `${GITHUB_API}/repos/${cfg.owner}/${cfg.repo}/pulls`;
  const prRes = await ghFetch(prUrl, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      title: `${titlePrefix}: ${input.slug}`,
      head: branch,
      base: cfg.baseBranch,
      body: buildPrBody(input),
      maintainer_can_modify: true,
    }),
  });
  if (!prRes.ok) {
    return {
      status: "failed",
      reason: describeError("open PR failed", prRes.status, prRes.body),
      branch,
    };
  }
  const prBody = prRes.body as
    | { html_url?: string; number?: number }
    | string
    | null;
  const htmlUrl =
    typeof prBody === "object" && prBody !== null
      ? typeof prBody.html_url === "string"
        ? prBody.html_url
        : null
      : null;
  const number =
    typeof prBody === "object" && prBody !== null
      ? typeof prBody.number === "number"
        ? prBody.number
        : null
      : null;
  if (!htmlUrl || number == null) {
    return {
      status: "failed",
      reason: "open PR succeeded but response was missing html_url or number",
      branch,
    };
  }

  // 5. Best-effort reviewer assignment. A bad/typoed username here
  // would 422 the whole call; we don't want that to fail the sync
  // because the PR itself is already useful. Failures are folded into
  // a successful return with reviewers omitted from the PR.
  if (cfg.reviewers.length > 0) {
    const reviewersUrl = `${GITHUB_API}/repos/${cfg.owner}/${cfg.repo}/pulls/${number}/requested_reviewers`;
    await ghFetch(reviewersUrl, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ reviewers: cfg.reviewers }),
    });
    // Intentionally don't read or branch on the response — see comment
    // above. The PR url is already the source of truth.
  }

  return {
    status: "synced",
    pullRequestUrl: htmlUrl,
    pullRequestNumber: number,
    branch,
  };
}
