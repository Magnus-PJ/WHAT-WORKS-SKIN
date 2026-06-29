// Behavioural coverage for the editor-only inbox routes that close
// the loop on the public `POST /api/corrections` form:
//
//   - GET  /api/editor/corrections         — newest-first listing,
//                                           filterable by `status`.
//   - PATCH /api/editor/corrections/:id    — update workflow status
//                                           and/or the internal note.
//
// The router is mounted on a minimal Express app per test (same shape
// as `trend-queue.persisted-sync-error.test.ts`) so the tests don't
// have to satisfy `app.ts`'s module-level `SESSION_SECRET` /
// `EDITOR_TOKEN` requirements through every code path. The tests
// instead set those env vars directly and sign the editor cookie by
// hand because `cookie-signature` is a transitive dep we can't
// resolve from this package's node_modules.

import { strict as assert } from "node:assert";
import { afterEach, beforeEach, describe, it } from "node:test";
import http from "node:http";
import crypto from "node:crypto";

import express, { type Express } from "express";
import cookieParser from "cookie-parser";
import { db, correctionSubmissionsTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";

const TEST_SESSION_SECRET = "test-session-secret-for-editor-corrections";
const TEST_EDITOR_TOKEN = "test-editor-token";

let server: http.Server | null = null;
let baseUrl = "";
const insertedIds: number[] = [];

const SAVED_ENV: Record<string, string | undefined> = {};

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

async function makeApp(): Promise<Express> {
  const { default: correctionsRouter } = await import("../corrections");
  const app = express();
  app.use(express.json());
  app.use(cookieParser(TEST_SESSION_SECRET));
  app.use((req, _res, next) => {
    (req as { log?: unknown }).log = {
      info: () => {},
      error: () => {},
      debug: () => {},
      warn: () => {},
    };
    next();
  });
  app.use("/api", correctionsRouter);
  return app;
}

async function listen(app: Express): Promise<void> {
  await new Promise<void>((resolve) => {
    server = app.listen(0, "127.0.0.1", () => {
      const addr = server!.address();
      if (addr && typeof addr === "object") {
        baseUrl = `http://127.0.0.1:${addr.port}`;
      }
      resolve();
    });
  });
}

async function close(): Promise<void> {
  if (!server) return;
  await new Promise<void>((resolve) => server!.close(() => resolve()));
  server = null;
}

async function seed(
  rows: Array<Partial<typeof correctionSubmissionsTable.$inferInsert>>,
): Promise<number[]> {
  const ids: number[] = [];
  for (const row of rows) {
    const [r] = await db
      .insert(correctionSubmissionsTable)
      .values({
        pageUrl: row.pageUrl ?? "https://whatworksskin.com/x",
        description:
          row.description ?? "Seeded by the editor-corrections suite.",
        ...row,
      })
      .returning({ id: correctionSubmissionsTable.id });
    ids.push(r!.id);
    insertedIds.push(r!.id);
  }
  return ids;
}

beforeEach(async () => {
  for (const k of ["SESSION_SECRET", "EDITOR_TOKEN"]) {
    SAVED_ENV[k] = process.env[k];
  }
  process.env.SESSION_SECRET = TEST_SESSION_SECRET;
  process.env.EDITOR_TOKEN = TEST_EDITOR_TOKEN;
  insertedIds.length = 0;
  await listen(await makeApp());
});

afterEach(async () => {
  await close();
  if (insertedIds.length > 0) {
    await db
      .delete(correctionSubmissionsTable)
      .where(inArray(correctionSubmissionsTable.id, insertedIds));
  }
  for (const [k, v] of Object.entries(SAVED_ENV)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
});

describe("GET /api/editor/corrections", () => {
  it("requires the editor session cookie", async () => {
    const res = await fetch(`${baseUrl}/api/editor/corrections`);
    assert.equal(res.status, 401);
  });

  it("defaults to status=new and lists newest first", async () => {
    const ids = await seed([
      {
        pageUrl: "https://whatworksskin.com/older",
        description: "Older new submission to verify ordering.",
        status: "new",
      },
      {
        pageUrl: "https://whatworksskin.com/applied",
        description: "Already applied submission, must not appear by default.",
        status: "applied",
      },
      {
        pageUrl: "https://whatworksskin.com/newer",
        description: "Newer new submission, should be first in the listing.",
        status: "new",
      },
    ]);

    const res = await fetch(`${baseUrl}/api/editor/corrections`, {
      headers: { cookie: editorCookieHeader() },
    });
    assert.equal(res.status, 200);
    const body = (await res.json()) as {
      status: string;
      corrections: Array<{ id: number; status: string; pageUrl: string }>;
    };
    assert.equal(body.status, "new");
    const seenIds = body.corrections.map((c) => c.id);
    // Both `new` rows should be present, the `applied` row excluded.
    assert.ok(seenIds.includes(ids[0]!));
    assert.ok(seenIds.includes(ids[2]!));
    assert.ok(!seenIds.includes(ids[1]!));
    // Newer-first within the visible window: the row inserted last
    // (highest id, latest createdAt) must come before the older one.
    const idxNewer = seenIds.indexOf(ids[2]!);
    const idxOlder = seenIds.indexOf(ids[0]!);
    assert.ok(
      idxNewer < idxOlder,
      `expected newer row (id=${ids[2]}) before older row (id=${ids[0]})`,
    );
  });

  it("filters by ?status=applied", async () => {
    const [newId, appliedId] = await seed([
      { description: "A row to leave alone in `new`.", status: "new" },
      { description: "An applied row we want back.", status: "applied" },
    ]);
    const res = await fetch(
      `${baseUrl}/api/editor/corrections?status=applied`,
      { headers: { cookie: editorCookieHeader() } },
    );
    const body = (await res.json()) as {
      corrections: Array<{ id: number; status: string }>;
    };
    const ids = body.corrections.map((c) => c.id);
    assert.ok(ids.includes(appliedId!));
    assert.ok(!ids.includes(newId!));
    for (const c of body.corrections) {
      assert.equal(c.status, "applied");
    }
  });

  it("returns every state with ?status=all", async () => {
    const ids = await seed([
      { description: "new row for the all-filter test.", status: "new" },
      { description: "applied row for the all-filter test.", status: "applied" },
      { description: "dismissed row for the all-filter test.", status: "dismissed" },
    ]);
    const res = await fetch(`${baseUrl}/api/editor/corrections?status=all`, {
      headers: { cookie: editorCookieHeader() },
    });
    const body = (await res.json()) as {
      status: string;
      corrections: Array<{ id: number }>;
    };
    assert.equal(body.status, "all");
    const seen = new Set(body.corrections.map((c) => c.id));
    for (const id of ids) assert.ok(seen.has(id), `expected id ${id} in list`);
  });
});

describe("PATCH /api/editor/corrections/:id", () => {
  it("requires the editor session cookie", async () => {
    const [id] = await seed([{ description: "Auth-gate guinea pig." }]);
    const res = await fetch(`${baseUrl}/api/editor/corrections/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: "triaged" }),
    });
    assert.equal(res.status, 401);
  });

  it("updates the status, bumps updatedAt, and returns the row", async () => {
    const [id] = await seed([
      { description: "Status change candidate.", status: "new" },
    ]);
    const before = (
      await db
        .select()
        .from(correctionSubmissionsTable)
        .where(eq(correctionSubmissionsTable.id, id!))
    )[0]!;
    // Wait a millisecond so updatedAt strictly differs from the seed.
    await new Promise((r) => setTimeout(r, 5));
    const res = await fetch(`${baseUrl}/api/editor/corrections/${id}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        cookie: editorCookieHeader(),
      },
      body: JSON.stringify({ status: "triaged" }),
    });
    assert.equal(res.status, 200);
    const body = (await res.json()) as {
      id: number;
      status: string;
      internalNote: string | null;
      updatedAt: string;
    };
    assert.equal(body.id, id);
    assert.equal(body.status, "triaged");
    assert.ok(
      new Date(body.updatedAt).getTime() > before.updatedAt.getTime(),
      "updatedAt should advance on a status change",
    );
  });

  it("records and clears the internal note independently of status", async () => {
    const [id] = await seed([
      { description: "Note-only update target.", status: "new" },
    ]);
    // First: set a note without changing status.
    let res = await fetch(`${baseUrl}/api/editor/corrections/${id}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        cookie: editorCookieHeader(),
      },
      body: JSON.stringify({ internalNote: "dup of #41" }),
    });
    assert.equal(res.status, 200);
    let body = (await res.json()) as {
      status: string;
      internalNote: string | null;
    };
    assert.equal(body.status, "new", "status must be untouched");
    assert.equal(body.internalNote, "dup of #41");
    // Then: clear it explicitly with null.
    res = await fetch(`${baseUrl}/api/editor/corrections/${id}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        cookie: editorCookieHeader(),
      },
      body: JSON.stringify({ internalNote: null }),
    });
    body = (await res.json()) as {
      status: string;
      internalNote: string | null;
    };
    assert.equal(body.internalNote, null, "internalNote should clear to null");
  });

  it("rejects an empty PATCH (no status, no internalNote)", async () => {
    const [id] = await seed([{ description: "No-op PATCH target." }]);
    const res = await fetch(`${baseUrl}/api/editor/corrections/${id}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        cookie: editorCookieHeader(),
      },
      body: JSON.stringify({}),
    });
    assert.equal(res.status, 400);
    const body = (await res.json()) as { error: string };
    assert.equal(body.error, "no_fields");
  });

  it("rejects an unknown status with 400", async () => {
    const [id] = await seed([{ description: "Bad-status target." }]);
    const res = await fetch(`${baseUrl}/api/editor/corrections/${id}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        cookie: editorCookieHeader(),
      },
      body: JSON.stringify({ status: "deleted" }),
    });
    assert.equal(res.status, 400);
  });

  it("404s on a missing id", async () => {
    const res = await fetch(`${baseUrl}/api/editor/corrections/999999999`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        cookie: editorCookieHeader(),
      },
      body: JSON.stringify({ status: "applied" }),
    });
    assert.equal(res.status, 404);
  });
});
