// Persisted sync-error behaviour for the trend-queue router.
//
// The approve and sync-retry endpoints both read the GitHub sync
// helper's return value and decide what to write into the candidate
// row's `lastSyncError` + `lastSyncAttemptAt` columns. The dashboard
// reads those two columns on its next list refresh to render the
// "Last sync failed N ago: <reason>" affordance, so the persistence
// rules matter for the editor experience and are worth pinning down.
//
// Coverage in this file:
//   1. A failed sync on the approve path writes `lastSyncError` plus
//      a fresh `lastSyncAttemptAt`.
//   2. A failed sync-retry overwrites a prior failure reason and bumps
//      the timestamp forward.
//   3. A successful sync-retry clears both columns back to null.
//   4. A skipped (unconfigured) sync-retry leaves any prior failure
//      reason untouched, because "skipped" means we did not actually
//      try and so should not erase diagnostic state.
//
// Test architecture:
//   - We mount the trend-queue router on a minimal Express app per test
//     so we don't have to satisfy `app.ts`'s module-level
//     `SESSION_SECRET` requirement.
//   - The router calls `requireEditor()`, which reads
//     `req.signedCookies.evidently_editor` and checks `EDITOR_TOKEN` is
//     set. We sign the cookie inline with HMAC-SHA256 (cookie-signature
//     is a transitive dep that is not directly resolvable from this
//     package).
//   - Filesystem-touching helpers (`findRepoRoot`, the publish helpers)
//     resolve paths relative to `process.cwd()`, so each test chdirs
//     into a temp root with the expected `artifacts/whatworksskin`
//     content layout.
//   - The GitHub sync helper is driven by env vars + `globalThis.fetch`,
//     which we stub per test the same way `lib/__tests__/trend-sync.test.ts`
//     does.
//   - We use the real database (the `trend_candidates` table) and clean
//     it between tests so assertions can read back what the route wrote.

import { strict as assert } from "node:assert";
import { afterEach, beforeEach, describe, it } from "node:test";
import http from "node:http";
import crypto from "node:crypto";
import os from "node:os";
import path from "node:path";
import { promises as fs } from "node:fs";

import express, { type Express } from "express";
import cookieParser from "cookie-parser";
import { db, trendCandidatesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const TEST_SESSION_SECRET = "test-session-secret-for-trend-queue-suite";
const TEST_EDITOR_TOKEN = "test-editor-token";

const TRACKED_ENV = [
  "SESSION_SECRET",
  "EDITOR_TOKEN",
  "TREND_SYNC_GITHUB_TOKEN",
  "TREND_SYNC_GITHUB_OWNER",
  "TREND_SYNC_GITHUB_REPO",
  "TREND_SYNC_GITHUB_BASE_BRANCH",
  "TREND_SYNC_GITHUB_REVIEWERS",
] as const;

type FetchFn = typeof globalThis.fetch;

let savedEnv: Record<string, string | undefined> = {};
let savedFetch: FetchFn | undefined;
let savedCwd = "";
let tmpRoot = "";
let server: http.Server | null = null;
let baseUrl = "";

// Sign a cookie value the way `cookie-parser` expects when reading a
// signed cookie back into `req.signedCookies`. The on-the-wire format
// is `s:<value>.<base64-hmac-sha256-of-value>`. We inline this rather
// than importing `cookie-signature` because it is a transitive dep that
// is not directly resolvable from this package's node_modules.
function signCookie(value: string, secret: string): string {
  const sig = crypto
    .createHmac("sha256", secret)
    .update(value)
    .digest("base64")
    .replace(/=+$/, "");
  return `s:${value}.${sig}`;
}

function editorCookieHeader(): string {
  const signed = signCookie("ok", TEST_SESSION_SECRET);
  return `evidently_editor=${encodeURIComponent(signed)}`;
}

// Stand up an Express app that mounts only the router under test.
// We attach a noop `req.log` (the route uses `req.log.info/error/debug`
// which would normally be injected by `pino-http`).
async function startApp(app: Express): Promise<void> {
  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, "127.0.0.1", () => {
      const addr = server!.address();
      if (addr && typeof addr === "object") {
        baseUrl = `http://127.0.0.1:${addr.port}`;
      }
      resolve();
    });
  });
}

async function stopApp(): Promise<void> {
  if (!server) return;
  await new Promise<void>((resolve) => {
    server!.close(() => resolve());
  });
  server = null;
}

// Build a `globalThis.fetch` stub that replays scripted responses for
// the GitHub helper in order. Call sites can also pass a request to
// the test server through; we route by URL so test-driven calls to
// `127.0.0.1` go to the real fetch and only `api.github.com` calls hit
// the queue.
function jsonResponse(status: number, body: unknown): Response {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => text,
  } as unknown as Response;
}

function installGitHubFetchQueue(responses: Response[]): {
  calls: { url: string; init: RequestInit | undefined }[];
} {
  const queue = [...responses];
  const calls: { url: string; init: RequestInit | undefined }[] = [];
  const realFetch = savedFetch!;
  const stub: FetchFn = (async (
    input: Parameters<FetchFn>[0],
    init?: RequestInit,
  ): Promise<Response> => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : (input as { url: string }).url;
    if (!url.startsWith("https://api.github.com")) {
      return realFetch(input as Parameters<FetchFn>[0], init);
    }
    calls.push({ url, init });
    const next = queue.shift();
    if (!next) {
      throw new Error(
        `mock fetch: out of scripted GitHub responses (call #${calls.length} to ${url})`,
      );
    }
    return next;
  }) as FetchFn;
  globalThis.fetch = stub;
  return { calls };
}

async function makeAppWithRouter(): Promise<Express> {
  // Import the router lazily inside the test so it picks up the env
  // vars we set in `beforeEach`.
  const { default: trendQueueRouter } = await import("../trend-queue");
  const app = express();
  app.use(express.json());
  app.use(cookieParser(TEST_SESSION_SECRET));
  app.use((req, _res, next) => {
    (req as unknown as { log: Record<string, (...args: unknown[]) => void> }).log = {
      info: () => {},
      error: () => {},
      debug: () => {},
      warn: () => {},
    };
    next();
  });
  app.use(trendQueueRouter);
  return app;
}

// Lay down the directory structure `findRepoRoot()` looks for so it
// can resolve `process.cwd()` to the temp root.
async function seedRepoLayout(root: string): Promise<void> {
  await fs.mkdir(
    path.join(root, "artifacts/whatworksskin/src/content/trend-watch"),
    { recursive: true },
  );
  await fs.mkdir(
    path.join(root, "artifacts/whatworksskin/src/content/ingredients/_drafts"),
    { recursive: true },
  );
}

// Insert a candidate row in the shape the sync-retry endpoint expects:
// already approved, with a `publishedSlug` set. Returns the new id.
async function insertApprovedTrendwatchRow(opts: {
  publishedSlug: string;
  lastSyncError: string | null;
  lastSyncAttemptAt: Date | null;
}): Promise<number> {
  const [row] = await db
    .insert(trendCandidatesTable)
    .values({
      name: "Test Candidate",
      summary: "A test candidate used by the persisted-sync-error suite.",
      suggestedVerdict: "Promising",
      suggestedTier: "B",
      suggestedTemplate: "trend-watch",
      velocity: 1,
      sourceCount: 1,
      status: "approved-trendwatch",
      publishedSlug: opts.publishedSlug,
      publishedAt: new Date(),
      lastSyncError: opts.lastSyncError,
      lastSyncAttemptAt: opts.lastSyncAttemptAt,
    })
    .returning({ id: trendCandidatesTable.id });
  return row.id;
}

async function loadRow(id: number) {
  const rows = await db
    .select()
    .from(trendCandidatesTable)
    .where(eq(trendCandidatesTable.id, id))
    .limit(1);
  return rows[0] ?? null;
}

beforeEach(async () => {
  savedEnv = {};
  for (const k of TRACKED_ENV) {
    savedEnv[k] = process.env[k];
    delete process.env[k];
  }
  savedFetch = globalThis.fetch;
  savedCwd = process.cwd();

  process.env.SESSION_SECRET = TEST_SESSION_SECRET;
  process.env.EDITOR_TOKEN = TEST_EDITOR_TOKEN;

  tmpRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "trend-queue-persisted-sync-"),
  );
  await seedRepoLayout(tmpRoot);
  process.chdir(tmpRoot);

  // Clean the candidates table so each test starts from a known state.
  await db.delete(trendCandidatesTable);
});

afterEach(async () => {
  await stopApp();
  process.chdir(savedCwd);
  if (savedFetch) globalThis.fetch = savedFetch;
  for (const k of TRACKED_ENV) {
    if (savedEnv[k] === undefined) delete process.env[k];
    else process.env[k] = savedEnv[k];
  }
  await db.delete(trendCandidatesTable);
  await fs.rm(tmpRoot, { recursive: true, force: true });
});

describe("trend-queue: persisted sync-error on approve", () => {
  it("writes lastSyncError and lastSyncAttemptAt when the GitHub sync fails", async () => {
    // Configure the GitHub env vars so the sync helper runs (rather
    // than skipping) and stub the very first GitHub call to 401.
    process.env.TREND_SYNC_GITHUB_TOKEN = "ghp_test_token";
    process.env.TREND_SYNC_GITHUB_OWNER = "whatworksskin";
    process.env.TREND_SYNC_GITHUB_REPO = "whatworksskin";

    const { calls } = installGitHubFetchQueue([
      jsonResponse(401, { message: "Bad credentials" }),
    ]);

    // Seed a queued candidate the route can claim.
    const [candidate] = await db
      .insert(trendCandidatesTable)
      .values({
        name: "Bakuchiol revisited",
        summary:
          "A test candidate seeded by the persisted-sync-error suite for the approve path.",
        suggestedVerdict: "Promising",
        suggestedTier: "B",
        suggestedTemplate: "trend-watch",
        velocity: 2,
        sourceCount: 3,
        status: "queued",
      })
      .returning({ id: trendCandidatesTable.id });

    const app = await makeAppWithRouter();
    await startApp(app);

    const tBefore = Date.now();
    const res = await fetch(
      `${baseUrl}/editor/trend-queue/${candidate.id}/approve`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: editorCookieHeader(),
        },
        body: JSON.stringify({
          template: "trend-watch",
          name: "Bakuchiol revisited",
          summary:
            "Reviewer-edited summary that is at least ten characters long.",
          verdict: "Promising",
          tier: "B",
        }),
      },
    );
    const tAfter = Date.now();

    assert.equal(res.status, 200);
    const body = (await res.json()) as {
      syncStatus: string;
      syncReason?: string;
    };
    assert.equal(body.syncStatus, "failed");
    assert.match(body.syncReason ?? "", /get base ref failed: 401/);
    assert.equal(calls.length, 1);

    // The row should now carry the persisted failure diagnostics.
    const row = await loadRow(candidate.id);
    assert.ok(row);
    assert.equal(row.status, "approved-trendwatch");
    assert.ok(row.publishedSlug, "publishedSlug should be set after publish");
    assert.equal(row.pullRequestUrl, null);
    assert.ok(row.lastSyncError);
    assert.match(row.lastSyncError ?? "", /get base ref failed: 401/);
    assert.match(row.lastSyncError ?? "", /Bad credentials/);
    assert.ok(row.lastSyncAttemptAt instanceof Date);
    const ts = row.lastSyncAttemptAt!.getTime();
    assert.ok(
      ts >= tBefore && ts <= tAfter + 1000,
      `lastSyncAttemptAt (${ts}) should fall within the request window [${tBefore}, ${tAfter}]`,
    );
  });
});

describe("trend-queue: persisted sync-error on sync-retry", () => {
  it("overwrites a prior failure reason and bumps the timestamp", async () => {
    // Pre-existing failure recorded an hour ago.
    const priorReason = "get base ref failed: 401 Bad credentials";
    const priorTs = new Date(Date.now() - 60 * 60 * 1000);
    const id = await insertApprovedTrendwatchRow({
      publishedSlug: "issue-001",
      lastSyncError: priorReason,
      lastSyncAttemptAt: priorTs,
    });

    // Configure GitHub env so the helper runs (does not skip), but
    // deliberately do NOT create the local file the helper tries to
    // read. The helper returns `{ status: "failed", reason: "read
    // local file failed: ..." }` without making any network calls,
    // which gives us a deterministic failure with a different reason
    // string than the prior one.
    process.env.TREND_SYNC_GITHUB_TOKEN = "ghp_test_token";
    process.env.TREND_SYNC_GITHUB_OWNER = "whatworksskin";
    process.env.TREND_SYNC_GITHUB_REPO = "whatworksskin";

    // The test client uses `fetch` to hit our local server, so the
    // stub has to pass loopback calls through to the real fetch and
    // only fail if a GitHub call is attempted (which it should not be:
    // the helper bails on the file-read step before any network call).
    let githubCalled = false;
    const realFetch = savedFetch!;
    globalThis.fetch = (async (
      input: Parameters<FetchFn>[0],
      init?: RequestInit,
    ): Promise<Response> => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : (input as { url: string }).url;
      if (url.startsWith("https://api.github.com")) {
        githubCalled = true;
        throw new Error(
          "fetch should not be called when local file is missing",
        );
      }
      return realFetch(input as Parameters<FetchFn>[0], init);
    }) as FetchFn;

    const app = await makeAppWithRouter();
    await startApp(app);

    const tBefore = Date.now();
    const res = await fetch(
      `${baseUrl}/editor/trend-queue/${id}/sync-retry`,
      {
        method: "POST",
        headers: { Cookie: editorCookieHeader() },
      },
    );
    const tAfter = Date.now();

    assert.equal(res.status, 200);
    const body = (await res.json()) as {
      syncStatus: string;
      syncReason?: string;
    };
    assert.equal(body.syncStatus, "failed");
    assert.match(body.syncReason ?? "", /read local file failed/);
    assert.equal(githubCalled, false);

    const row = await loadRow(id);
    assert.ok(row);
    assert.notEqual(
      row.lastSyncError,
      priorReason,
      "the prior reason should have been overwritten",
    );
    assert.match(row.lastSyncError ?? "", /read local file failed/);
    assert.ok(row.lastSyncAttemptAt instanceof Date);
    const ts = row.lastSyncAttemptAt!.getTime();
    assert.ok(
      ts > priorTs.getTime(),
      "lastSyncAttemptAt should have been bumped forward",
    );
    assert.ok(
      ts >= tBefore && ts <= tAfter + 1000,
      `lastSyncAttemptAt (${ts}) should fall within the retry request window`,
    );
  });

  it("clears lastSyncError and lastSyncAttemptAt on a successful retry", async () => {
    const slug = "issue-002";
    const priorReason = "open PR failed: 500 Internal Server Error";
    const priorTs = new Date(Date.now() - 30 * 60 * 1000);
    const id = await insertApprovedTrendwatchRow({
      publishedSlug: slug,
      lastSyncError: priorReason,
      lastSyncAttemptAt: priorTs,
    });

    // The local file the sync helper reads must exist for the happy
    // path to make it past the first read step.
    const relPath = `artifacts/whatworksskin/src/content/trend-watch/${slug}.json`;
    await fs.writeFile(
      path.join(tmpRoot, relPath),
      JSON.stringify({ slug, headline: "Test" }, null, 2),
      "utf8",
    );

    process.env.TREND_SYNC_GITHUB_TOKEN = "ghp_test_token";
    process.env.TREND_SYNC_GITHUB_OWNER = "whatworksskin";
    process.env.TREND_SYNC_GITHUB_REPO = "whatworksskin";

    const { calls } = installGitHubFetchQueue([
      // 1. GET base ref
      jsonResponse(200, { object: { sha: "abc123def456" } }),
      // 2. POST refs (create branch)
      jsonResponse(201, { ref: `refs/heads/trend-radar/${slug}` }),
      // 3. PUT contents
      jsonResponse(201, { content: { sha: "blob1" } }),
      // 4. POST pulls (open PR)
      jsonResponse(201, {
        html_url: `https://github.com/whatworksskin/whatworksskin/pull/99`,
        number: 99,
      }),
    ]);

    const app = await makeAppWithRouter();
    await startApp(app);

    const res = await fetch(
      `${baseUrl}/editor/trend-queue/${id}/sync-retry`,
      {
        method: "POST",
        headers: { Cookie: editorCookieHeader() },
      },
    );

    assert.equal(res.status, 200);
    const body = (await res.json()) as {
      syncStatus: string;
      pullRequestUrl?: string;
    };
    assert.equal(body.syncStatus, "synced");
    assert.equal(
      body.pullRequestUrl,
      "https://github.com/whatworksskin/whatworksskin/pull/99",
    );
    assert.equal(calls.length, 4);

    const row = await loadRow(id);
    assert.ok(row);
    assert.equal(
      row.pullRequestUrl,
      "https://github.com/whatworksskin/whatworksskin/pull/99",
    );
    assert.equal(
      row.lastSyncError,
      null,
      "successful retry should clear the prior lastSyncError",
    );
    assert.equal(
      row.lastSyncAttemptAt,
      null,
      "successful retry should clear the prior lastSyncAttemptAt",
    );
  });

  it("preserves a prior failure reason when the retry is skipped (unconfigured)", async () => {
    const priorReason = "create branch failed: 422 Reference already exists";
    const priorTs = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const id = await insertApprovedTrendwatchRow({
      publishedSlug: "issue-003",
      lastSyncError: priorReason,
      lastSyncAttemptAt: priorTs,
    });

    // Deliberately leave the GitHub env vars unset so the sync helper
    // returns `{ status: "skipped" }`. The route should NOT touch the
    // persisted failure diagnostics on the skip path. The stub passes
    // loopback calls through (the test client uses `fetch` to hit our
    // local server) and only fails if a GitHub call is attempted.
    let githubCalled = false;
    const realFetch = savedFetch!;
    globalThis.fetch = (async (
      input: Parameters<FetchFn>[0],
      init?: RequestInit,
    ): Promise<Response> => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : (input as { url: string }).url;
      if (url.startsWith("https://api.github.com")) {
        githubCalled = true;
        throw new Error("fetch should not be called on the skip path");
      }
      return realFetch(input as Parameters<FetchFn>[0], init);
    }) as FetchFn;

    const app = await makeAppWithRouter();
    await startApp(app);

    const res = await fetch(
      `${baseUrl}/editor/trend-queue/${id}/sync-retry`,
      {
        method: "POST",
        headers: { Cookie: editorCookieHeader() },
      },
    );

    assert.equal(res.status, 200);
    const body = (await res.json()) as {
      syncStatus: string;
      syncReason?: string;
    };
    assert.equal(body.syncStatus, "skipped");
    assert.match(body.syncReason ?? "", /TREND_SYNC_GITHUB_TOKEN/);
    assert.equal(githubCalled, false);

    const row = await loadRow(id);
    assert.ok(row);
    assert.equal(
      row.lastSyncError,
      priorReason,
      "skip path must preserve the prior failure reason",
    );
    assert.ok(row.lastSyncAttemptAt instanceof Date);
    assert.equal(
      row.lastSyncAttemptAt!.getTime(),
      priorTs.getTime(),
      "skip path must preserve the prior attempt timestamp",
    );
    assert.equal(row.pullRequestUrl, null);
  });
});
