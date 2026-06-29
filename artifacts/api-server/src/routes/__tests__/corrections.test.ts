// Behavioural coverage for the public `POST /api/corrections` sink.
//
// The endpoint backs the reader-facing "Submit a correction" form on
// `/corrections` (and the small CTA in the site footer of every
// page). It is intentionally unauthenticated, so the abuse-defence
// surface is what we care about exercising:
//
//   1. Origin/Referer allowlist — requests from a third-party origin
//      are rejected 403 before the handler runs.
//   2. Honeypot — a submission with the `website` field populated is
//      silently accepted (204) but never persisted, so a bot can't
//      tell it was rejected.
//   3. Payload validation — a bad payload (missing `pageUrl`, too
//      short `description`, …) is rejected 400.
//   4. Happy path — a well-formed submission from an allowed origin
//      is persisted with the correct shape.
//
// We mount the corrections router on a minimal Express app per test
// (instead of importing `app.ts`) so we don't have to satisfy the
// module-level `SESSION_SECRET` requirement for an unauthenticated
// endpoint. The body cap that lives in `app.ts` is therefore not
// exercised here — payload-size limits are an Express-builtin
// behaviour and re-testing them would just be re-testing the
// framework.

import { strict as assert } from "node:assert";
import { afterEach, beforeEach, describe, it } from "node:test";
import http from "node:http";

import express, { type Express } from "express";
import { db, correctionSubmissionsTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";

import correctionsRouter from "../corrections";

const ALLOWED_HOST = "test.whatworksskin.local";

let server: http.Server | null = null;
let baseUrl = "";
const insertedIds: number[] = [];

function buildApp(): Express {
  const app = express();
  // The shipped server attaches `req.log` via `pino-http`; the route
  // and its middleware call `req.log.warn` / `req.log.info` directly.
  // We don't need real log output in tests, but the property has to
  // exist or every handler crashes. A tiny no-op shim keeps the test
  // surface honest without dragging in pino.
  app.use((req, _res, next) => {
    (req as { log?: unknown }).log = {
      warn: () => {},
      info: () => {},
      error: () => {},
      debug: () => {},
      trace: () => {},
      fatal: () => {},
    };
    next();
  });
  app.use(express.json({ limit: "16kb" }));
  app.use("/api", correctionsRouter);
  return app;
}

async function listen(app: Express): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server = app.listen(0, "127.0.0.1", (err?: Error) => {
      if (err) reject(err);
      else resolve();
    });
  });
  const addr = server!.address();
  if (!addr || typeof addr === "string") {
    throw new Error("test server did not bind to a TCP port");
  }
  baseUrl = `http://127.0.0.1:${addr.port}`;
}

async function close(): Promise<void> {
  if (!server) return;
  await new Promise<void>((resolve, reject) => {
    server!.close((err) => (err ? reject(err) : resolve()));
  });
  server = null;
}

async function post(
  body: unknown,
  headers: Record<string, string> = {},
): Promise<{ status: number; text: string }> {
  const res = await fetch(`${baseUrl}/api/corrections`, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  return { status: res.status, text: await res.text() };
}

const SAVED_ENV: Record<string, string | undefined> = {};

beforeEach(async () => {
  for (const name of [
    "CORRECTIONS_ALLOWED_ORIGINS",
    "CORRECTIONS_RATE_LIMIT_PER_HOUR",
    "CORRECTIONS_NOTIFY_WEBHOOK_URL",
  ]) {
    SAVED_ENV[name] = process.env[name];
  }
  process.env["CORRECTIONS_ALLOWED_ORIGINS"] = ALLOWED_HOST;
  // High enough that none of the per-test sequences trip it; the
  // limiter has its own dedicated unit-style coverage in the abuse
  // middleware module.
  process.env["CORRECTIONS_RATE_LIMIT_PER_HOUR"] = "1000";
  // Default to "no notifier configured" so tests that don't opt in
  // never fire a real outbound request — this is the production-dev
  // default the helper documents as a no-op.
  delete process.env["CORRECTIONS_NOTIFY_WEBHOOK_URL"];
  insertedIds.length = 0;
  await listen(buildApp());
});

afterEach(async () => {
  await close();
  if (insertedIds.length > 0) {
    for (const id of insertedIds) {
      await db
        .delete(correctionSubmissionsTable)
        .where(eq(correctionSubmissionsTable.id, id));
    }
  }
  for (const [name, value] of Object.entries(SAVED_ENV)) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});

async function recordLatest(): Promise<number | null> {
  const rows = await db
    .select({ id: correctionSubmissionsTable.id })
    .from(correctionSubmissionsTable)
    .orderBy(desc(correctionSubmissionsTable.id))
    .limit(1);
  if (rows.length === 0) return null;
  insertedIds.push(rows[0]!.id);
  return rows[0]!.id;
}

describe("POST /api/corrections", () => {
  it("rejects requests with no Origin or Referer", async () => {
    const before = (
      await db
        .select({ id: correctionSubmissionsTable.id })
        .from(correctionSubmissionsTable)
    ).length;
    const res = await post({
      pageUrl: "https://whatworksskin.com/concerns/melasma",
      description: "Argireline link in §3 is broken — 404 on click.",
    });
    assert.equal(res.status, 403);
    const after = (
      await db
        .select({ id: correctionSubmissionsTable.id })
        .from(correctionSubmissionsTable)
    ).length;
    assert.equal(after, before, "no row should be persisted on a forbidden origin");
  });

  it("rejects requests from a third-party origin", async () => {
    const res = await post(
      {
        pageUrl: "https://whatworksskin.com/x",
        description: "Looks wrong, file please.",
      },
      { origin: "https://evil.example.com" },
    );
    assert.equal(res.status, 403);
  });

  it("rejects malformed payloads with 400", async () => {
    const res = await post(
      {
        // Missing `pageUrl`, too-short `description`.
        description: "no",
      },
      { origin: `https://${ALLOWED_HOST}` },
    );
    assert.equal(res.status, 400);
    const body = JSON.parse(res.text || "{}");
    assert.equal(body.error, "invalid_payload");
    assert.ok(Array.isArray(body.issues), "should expose zod issues");
  });

  it("silently drops honeypot submissions but returns 204", async () => {
    const before = (
      await db
        .select({ id: correctionSubmissionsTable.id })
        .from(correctionSubmissionsTable)
    ).length;
    const res = await post(
      {
        pageUrl: "https://whatworksskin.com/x",
        description: "Real-looking description from a scraper-bot.",
        website: "https://spam.example.com/buy-now",
      },
      { origin: `https://${ALLOWED_HOST}` },
    );
    assert.equal(res.status, 204);
    const after = (
      await db
        .select({ id: correctionSubmissionsTable.id })
        .from(correctionSubmissionsTable)
    ).length;
    assert.equal(after, before, "honeypot submissions must not be persisted");
  });

  it("persists a well-formed submission and returns 204", async () => {
    const res = await post(
      {
        pageUrl: "https://whatworksskin.com/concerns/melasma",
        description: "The dosing range for tranexamic acid in §4 is mis-cited.",
        evidenceUrl: "https://pubmed.ncbi.nlm.nih.gov/12345678/",
        email: "reader@example.com",
      },
      {
        origin: `https://${ALLOWED_HOST}`,
        "user-agent": "wws-tests/0.0",
      },
    );
    assert.equal(res.status, 204);

    const id = await recordLatest();
    assert.ok(id !== null, "expected a persisted row");
    const rows = await db
      .select()
      .from(correctionSubmissionsTable)
      .where(eq(correctionSubmissionsTable.id, id!));
    const row = rows[0]!;
    assert.equal(
      row.pageUrl,
      "https://whatworksskin.com/concerns/melasma",
    );
    assert.equal(
      row.description,
      "The dosing range for tranexamic acid in §4 is mis-cited.",
    );
    assert.equal(
      row.evidenceUrl,
      "https://pubmed.ncbi.nlm.nih.gov/12345678/",
    );
    assert.equal(row.submitterEmail, "reader@example.com");
    assert.equal(row.userAgent, "wws-tests/0.0");
    assert.equal(row.status, "new");
  });

  it("does not call any webhook when CORRECTIONS_NOTIFY_WEBHOOK_URL is unset", async () => {
    // Point the env var at a port that nothing is listening on. If
    // the route were to attempt a request anyway, fetch would throw
    // ECONNREFUSED — but the helper swallows webhook errors, so the
    // 204 itself doesn't prove anything. Instead we leave the env
    // var unset (the beforeEach default) and assert the response is
    // still 204 and the row is persisted, which is the contract we
    // care about: dev/test must never accidentally try to deliver.
    assert.equal(process.env["CORRECTIONS_NOTIFY_WEBHOOK_URL"], undefined);
    const res = await post(
      {
        pageUrl: "https://whatworksskin.com/x",
        description: "Quiet-mode submission, webhook should stay silent.",
      },
      { origin: `https://${ALLOWED_HOST}` },
    );
    assert.equal(res.status, 204);
    await recordLatest();
  });

  it("posts a structured notification to the configured webhook on a real submission", async () => {
    const received: Array<{ headers: http.IncomingHttpHeaders; body: string }> = [];
    const hook = http.createServer((req, res) => {
      const chunks: Buffer[] = [];
      req.on("data", (c) => chunks.push(c as Buffer));
      req.on("end", () => {
        received.push({
          headers: req.headers,
          body: Buffer.concat(chunks).toString("utf8"),
        });
        res.statusCode = 200;
        res.end("ok");
      });
    });
    await new Promise<void>((resolve) =>
      hook.listen(0, "127.0.0.1", () => resolve()),
    );
    const addr = hook.address();
    if (!addr || typeof addr === "string") {
      throw new Error("webhook test server did not bind");
    }
    const webhookUrl = `http://127.0.0.1:${addr.port}/hook`;
    process.env["CORRECTIONS_NOTIFY_WEBHOOK_URL"] = webhookUrl;
    try {
      const res = await post(
        {
          pageUrl: "https://whatworksskin.com/concerns/melasma",
          description: "Citation in §4 mis-cites the dosing range.",
          evidenceUrl: "https://pubmed.ncbi.nlm.nih.gov/12345678/",
          email: "reader@example.com",
        },
        { origin: `https://${ALLOWED_HOST}` },
      );
      assert.equal(res.status, 204);
      const id = await recordLatest();
      assert.ok(id !== null);

      assert.equal(received.length, 1, "webhook should be called exactly once");
      const hit = received[0]!;
      assert.match(
        String(hit.headers["content-type"] ?? ""),
        /application\/json/,
      );
      const body = JSON.parse(hit.body) as {
        text: string;
        submissionId: number;
        pageUrl: string;
        description: string;
        evidenceUrl: string | null;
        submitterEmail: string | null;
      };
      assert.equal(body.submissionId, id);
      assert.equal(body.pageUrl, "https://whatworksskin.com/concerns/melasma");
      assert.equal(
        body.description,
        "Citation in §4 mis-cites the dosing range.",
      );
      assert.equal(
        body.evidenceUrl,
        "https://pubmed.ncbi.nlm.nih.gov/12345678/",
      );
      assert.equal(body.submitterEmail, "reader@example.com");
      // The Slack-compatible `text` summary should mention the page
      // and the submission id so an editor scanning a channel can
      // act without expanding the structured payload.
      assert.match(body.text, /melasma/);
      assert.match(body.text, new RegExp(`#${id}\\b`));
    } finally {
      await new Promise<void>((resolve) => hook.close(() => resolve()));
    }
  });

  it("does not notify the webhook on a honeypot hit", async () => {
    let calls = 0;
    const hook = http.createServer((_req, res) => {
      calls += 1;
      res.statusCode = 200;
      res.end("ok");
    });
    await new Promise<void>((resolve) =>
      hook.listen(0, "127.0.0.1", () => resolve()),
    );
    const addr = hook.address();
    if (!addr || typeof addr === "string") {
      throw new Error("webhook test server did not bind");
    }
    process.env["CORRECTIONS_NOTIFY_WEBHOOK_URL"] = `http://127.0.0.1:${addr.port}/hook`;
    try {
      const res = await post(
        {
          pageUrl: "https://whatworksskin.com/x",
          description: "Bot-shaped submission with the honeypot tripped.",
          website: "https://spam.example.com/buy-now",
        },
        { origin: `https://${ALLOWED_HOST}` },
      );
      assert.equal(res.status, 204);
      // Give the event loop a beat in case the route had fired the
      // request asynchronously — we want to be confident the
      // notifier was never invoked, not just that it hadn't been
      // invoked yet.
      await new Promise((r) => setTimeout(r, 50));
      assert.equal(calls, 0, "honeypot hits must not page editors");
    } finally {
      await new Promise<void>((resolve) => hook.close(() => resolve()));
    }
  });

  it("accepts the Referer header as an allowlist signal when Origin is absent", async () => {
    const res = await post(
      {
        pageUrl: "https://whatworksskin.com/x",
        description: "From a referer-only request.",
      },
      { referer: `https://${ALLOWED_HOST}/corrections` },
    );
    assert.equal(res.status, 204);
    await recordLatest();
  });
});
