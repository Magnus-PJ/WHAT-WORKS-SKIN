// Contract tests for the GitHub publish-sync helper.
//
// `syncPublishedFileToGitHub` makes up to five GitHub REST calls and
// converts every failure into a structured `{ status, reason }` shape
// instead of throwing. These tests pin that contract by mocking
// `globalThis.fetch` and feeding it scripted responses for each call.
//
// We cover:
//   1. The five-call happy path (with reviewers).
//   2. The env-var-missing skip path (returns `{ status: "skipped" }`).
//   3. The missing-local-file path (file does not exist on disk).
//   4. The base-ref-fetch failure path (first GitHub call 404s).
//   5. The PR-open failure path (fourth GitHub call 422s).
//
// Run with:  pnpm --filter @workspace/api-server run test

import { strict as assert } from "node:assert";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";

import { syncPublishedFileToGitHub } from "../trend-sync";

type FetchFn = typeof globalThis.fetch;

// Snapshot the four env vars the helper reads so each test can mutate
// them in isolation and we can restore the originals on teardown.
const TRACKED_ENV = [
  "TREND_SYNC_GITHUB_TOKEN",
  "TREND_SYNC_GITHUB_OWNER",
  "TREND_SYNC_GITHUB_REPO",
  "TREND_SYNC_GITHUB_BASE_BRANCH",
  "TREND_SYNC_GITHUB_REVIEWERS",
] as const;

let savedEnv: Record<string, string | undefined> = {};
let savedFetch: FetchFn | undefined;
let tmpRoot = "";

function setConfiguredEnv(extra: Record<string, string> = {}): void {
  process.env.TREND_SYNC_GITHUB_TOKEN = "ghp_test_token";
  process.env.TREND_SYNC_GITHUB_OWNER = "whatworksskin";
  process.env.TREND_SYNC_GITHUB_REPO = "whatworksskin";
  for (const [k, v] of Object.entries(extra)) process.env[k] = v;
}

// Lightweight shim for the parts of `Response` the helper touches:
// `ok`, `status`, and `text()`. Returning a real `Response` would also
// work but this keeps the fixture code obvious at the call site.
function jsonResponse(status: number, body: unknown): Response {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => text,
  } as unknown as Response;
}

// Build a fetch mock that replays the queued responses in order and
// records every (url, init) it was called with for later assertions.
type Call = { url: string; init: RequestInit | undefined };
function mockFetchQueue(responses: Response[]): {
  fetch: FetchFn;
  calls: Call[];
} {
  const queue = [...responses];
  const calls: Call[] = [];
  const fetchImpl = (async (
    input: Parameters<FetchFn>[0],
    init?: RequestInit,
  ): Promise<Response> => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : (input as { url: string }).url;
    calls.push({ url, init });
    const next = queue.shift();
    if (!next) {
      throw new Error(
        `mock fetch: out of scripted responses (call #${calls.length} to ${url})`,
      );
    }
    return next;
  }) as FetchFn;
  return { fetch: fetchImpl, calls };
}

beforeEach(async () => {
  savedEnv = {};
  for (const k of TRACKED_ENV) {
    savedEnv[k] = process.env[k];
    delete process.env[k];
  }
  savedFetch = globalThis.fetch;
  tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "trend-sync-test-"));
});

afterEach(async () => {
  for (const k of TRACKED_ENV) {
    if (savedEnv[k] === undefined) delete process.env[k];
    else process.env[k] = savedEnv[k];
  }
  if (savedFetch) globalThis.fetch = savedFetch;
  await fs.rm(tmpRoot, { recursive: true, force: true });
});

async function writePayload(relativePath: string, body: string): Promise<void> {
  const abs = path.join(tmpRoot, relativePath);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, body, "utf8");
}

describe("syncPublishedFileToGitHub (skip paths)", () => {
  it("returns { status: 'skipped' } when TREND_SYNC_GITHUB_TOKEN is missing", async () => {
    // Owner + repo set, token deliberately omitted.
    process.env.TREND_SYNC_GITHUB_OWNER = "whatworksskin";
    process.env.TREND_SYNC_GITHUB_REPO = "whatworksskin";

    // `fetch` should never be invoked on the skip path.
    let fetchCalled = false;
    globalThis.fetch = (async () => {
      fetchCalled = true;
      throw new Error("fetch should not be called on the skip path");
    }) as FetchFn;

    const result = await syncPublishedFileToGitHub({
      repoRoot: tmpRoot,
      relativePath: "artifacts/whatworksskin/src/content/trend-watch/issue-014.json",
      slug: "issue-014",
      summary: "test summary",
      template: "trend-watch",
    });

    assert.equal(result.status, "skipped");
    assert.equal(fetchCalled, false);
    if (result.status === "skipped") {
      assert.match(result.reason, /TREND_SYNC_GITHUB_TOKEN/);
    }
  });

  it("returns { status: 'skipped' } when TREND_SYNC_GITHUB_OWNER is missing", async () => {
    process.env.TREND_SYNC_GITHUB_TOKEN = "ghp_test_token";
    process.env.TREND_SYNC_GITHUB_REPO = "whatworksskin";
    globalThis.fetch = (async () => {
      throw new Error("fetch should not be called on the skip path");
    }) as FetchFn;

    const result = await syncPublishedFileToGitHub({
      repoRoot: tmpRoot,
      relativePath: "x.json",
      slug: "x",
      summary: "",
      template: "trend-watch",
    });

    assert.equal(result.status, "skipped");
    if (result.status === "skipped") {
      assert.match(result.reason, /TREND_SYNC_GITHUB_OWNER/);
    }
  });
});

describe("syncPublishedFileToGitHub (local-file failure)", () => {
  it("returns { status: 'failed' } when the local file does not exist", async () => {
    setConfiguredEnv();
    let fetchCalled = false;
    globalThis.fetch = (async () => {
      fetchCalled = true;
      throw new Error("fetch should not be called when the file is missing");
    }) as FetchFn;

    const result = await syncPublishedFileToGitHub({
      repoRoot: tmpRoot,
      // tmpRoot exists but the relative file does not.
      relativePath: "does/not/exist.json",
      slug: "issue-999",
      summary: "irrelevant",
      template: "trend-watch",
    });

    assert.equal(fetchCalled, false);
    assert.equal(result.status, "failed");
    if (result.status === "failed") {
      assert.match(result.reason, /read local file failed/);
    }
  });
});

describe("syncPublishedFileToGitHub (GitHub failure paths)", () => {
  it("returns { status: 'failed' } when the base-ref fetch is not ok", async () => {
    setConfiguredEnv();
    await writePayload("issue-014.json", '{"slug":"issue-014"}');

    const { fetch: fetchImpl, calls } = mockFetchQueue([
      // Call 1: GET base ref → 404 (e.g. base branch typo).
      jsonResponse(404, { message: "Branch not found" }),
    ]);
    globalThis.fetch = fetchImpl;

    const result = await syncPublishedFileToGitHub({
      repoRoot: tmpRoot,
      relativePath: "issue-014.json",
      slug: "issue-014",
      summary: "summary",
      template: "trend-watch",
    });

    // We failed at call #1, so no further GitHub calls should fire and
    // we should not yet have allocated a `branch` field.
    assert.equal(calls.length, 1);
    assert.match(calls[0].url, /\/git\/ref\/heads\/main$/);
    assert.equal(result.status, "failed");
    if (result.status === "failed") {
      assert.match(result.reason, /get base ref failed: 404/);
      assert.match(result.reason, /Branch not found/);
      assert.equal(result.branch, undefined);
    }
  });

  it("returns { status: 'failed' } when the PR-open call fails (after branch + contents succeeded)", async () => {
    setConfiguredEnv();
    await writePayload("issue-015.json", '{"slug":"issue-015"}');

    const { fetch: fetchImpl, calls } = mockFetchQueue([
      // 1. GET base ref → ok
      jsonResponse(200, { object: { sha: "deadbeefcafef00d" } }),
      // 2. POST refs → ok (branch created)
      jsonResponse(201, { ref: "refs/heads/trend-radar/issue-015-1" }),
      // 3. PUT contents → ok (file committed)
      jsonResponse(201, { content: { sha: "abc123" } }),
      // 4. POST pulls → 422 (e.g. validation failed: head sha not found)
      jsonResponse(422, { message: "Validation Failed" }),
    ]);
    globalThis.fetch = fetchImpl;

    const result = await syncPublishedFileToGitHub({
      repoRoot: tmpRoot,
      relativePath: "issue-015.json",
      slug: "issue-015",
      summary: "summary",
      template: "trend-watch",
    });

    assert.equal(calls.length, 4, "should fail on the fourth call (PR open)");
    assert.equal(result.status, "failed");
    if (result.status === "failed") {
      assert.match(result.reason, /open PR failed: 422/);
      assert.match(result.reason, /Validation Failed/);
      // Once the branch has been created, we surface it in the failed
      // result so the operator can clean it up by hand.
      assert.ok(result.branch);
      assert.match(result.branch ?? "", /^trend-radar\/issue-015-/);
    }
  });
});

describe("syncPublishedFileToGitHub (happy path)", () => {
  it("walks all five GitHub calls in order and returns { status: 'synced' }", async () => {
    setConfiguredEnv({ TREND_SYNC_GITHUB_REVIEWERS: "drpaul, drsundeep" });
    await writePayload(
      "artifacts/whatworksskin/src/content/trend-watch/issue-016.json",
      '{"slug":"issue-016","verdict":"Promising"}',
    );

    const { fetch: fetchImpl, calls } = mockFetchQueue([
      // 1. GET base ref
      jsonResponse(200, { object: { sha: "1234567890abcdef" } }),
      // 2. POST refs (create branch)
      jsonResponse(201, { ref: "refs/heads/trend-radar/issue-016" }),
      // 3. PUT contents
      jsonResponse(201, { content: { sha: "fileblob1" } }),
      // 4. POST pulls (open PR)
      jsonResponse(201, {
        html_url: "https://github.com/whatworksskin/whatworksskin/pull/42",
        number: 42,
      }),
      // 5. POST requested_reviewers (best-effort)
      jsonResponse(201, { requested_reviewers: [] }),
    ]);
    globalThis.fetch = fetchImpl;

    const result = await syncPublishedFileToGitHub({
      repoRoot: tmpRoot,
      relativePath:
        "artifacts/whatworksskin/src/content/trend-watch/issue-016.json",
      slug: "issue-016",
      summary: "Editorial summary used in the PR body.",
      template: "trend-watch",
    });

    // All five GitHub calls fired in the documented order.
    assert.equal(calls.length, 5);
    assert.match(calls[0].url, /\/git\/ref\/heads\/main$/);
    assert.equal(calls[0].init?.method, "GET");
    assert.match(calls[1].url, /\/git\/refs$/);
    assert.equal(calls[1].init?.method, "POST");
    assert.match(
      calls[2].url,
      /\/contents\/artifacts\/whatworksskin\/src\/content\/trend-watch\/issue-016\.json$/,
    );
    assert.equal(calls[2].init?.method, "PUT");
    assert.match(calls[3].url, /\/pulls$/);
    assert.equal(calls[3].init?.method, "POST");
    assert.match(calls[4].url, /\/pulls\/42\/requested_reviewers$/);
    assert.equal(calls[4].init?.method, "POST");

    // Auth + content-type headers travel with every authenticated call.
    const headers = calls[1].init?.headers as Record<string, string>;
    assert.equal(headers.Authorization, "Bearer ghp_test_token");
    assert.equal(headers["Content-Type"], "application/json");

    // The branch ref is forked off the base sha we returned in call #1.
    const refBody = JSON.parse(calls[1].init?.body as string);
    assert.equal(refBody.sha, "1234567890abcdef");
    assert.match(refBody.ref, /^refs\/heads\/trend-radar\/issue-016-/);

    // The contents PUT carries the file's bytes as base64 + the new branch.
    const putBody = JSON.parse(calls[2].init?.body as string);
    assert.equal(
      Buffer.from(putBody.content, "base64").toString("utf8"),
      '{"slug":"issue-016","verdict":"Promising"}',
    );
    assert.match(putBody.branch, /^trend-radar\/issue-016-/);
    assert.match(putBody.message, /^trend-radar: publish issue-016$/);

    // PR title + body wiring.
    const prBody = JSON.parse(calls[3].init?.body as string);
    assert.equal(prBody.title, "Trend Watch: issue-016");
    assert.equal(prBody.base, "main");
    assert.match(prBody.head, /^trend-radar\/issue-016-/);
    assert.match(prBody.body, /Template:.*trend-watch/);
    assert.match(prBody.body, /Editorial summary used in the PR body\./);

    // Reviewers payload uses the trimmed/split env var.
    const reviewersBody = JSON.parse(calls[4].init?.body as string);
    assert.deepEqual(reviewersBody.reviewers, ["drpaul", "drsundeep"]);

    assert.equal(result.status, "synced");
    if (result.status === "synced") {
      assert.equal(
        result.pullRequestUrl,
        "https://github.com/whatworksskin/whatworksskin/pull/42",
      );
      assert.equal(result.pullRequestNumber, 42);
      assert.match(result.branch, /^trend-radar\/issue-016-/);
    }
  });

  it("uses the 'Ingredient draft' title prefix for the ingredient-draft template", async () => {
    setConfiguredEnv();
    await writePayload("ing.json", '{"k":1}');
    const { fetch: fetchImpl, calls } = mockFetchQueue([
      jsonResponse(200, { object: { sha: "sha" } }),
      jsonResponse(201, {}),
      jsonResponse(201, {}),
      jsonResponse(201, {
        html_url: "https://github.com/x/y/pull/7",
        number: 7,
      }),
    ]);
    globalThis.fetch = fetchImpl;

    const result = await syncPublishedFileToGitHub({
      repoRoot: tmpRoot,
      relativePath: "ing.json",
      slug: "bakuchiol",
      summary: "draft",
      template: "ingredient-draft",
    });

    assert.equal(result.status, "synced");
    // No reviewers env → no 5th call.
    assert.equal(calls.length, 4);
    const prBody = JSON.parse(calls[3].init?.body as string);
    assert.equal(prBody.title, "Ingredient draft: bakuchiol");
  });
});
