// Contract tests for the nightly clustering rejection-rate alert.
//
// `_alert.ts` reads three env vars, computes a rate from the cluster
// run summary, and POSTs to a webhook when the rate exceeds the
// threshold. These tests pin every branch of that decision tree so a
// future refactor can't silently re-enable alerts on no-op nights or
// silently drop alerts on bad nights.
//
// Run with:  pnpm --filter @workspace/api-server run test

import { strict as assert } from "node:assert";
import { afterEach, beforeEach, describe, it } from "node:test";

import {
  DEFAULT_REJECTION_RATE_ALERT_THRESHOLD,
  formatAlertMessage,
  rejectionRateForRun,
  sendClusterRunAlert,
  shouldAlertOnRejectionRate,
  type AlertRunSummary,
} from "../_alert";

type FetchFn = typeof globalThis.fetch;

const TRACKED_ENV = [
  "TREND_RADAR_ALERT_WEBHOOK_URL",
  "TREND_RADAR_ALERT_DASHBOARD_URL",
  "TREND_RADAR_ALERT_THRESHOLD",
] as const;

let savedEnv: Record<string, string | undefined> = {};

beforeEach(() => {
  savedEnv = {};
  for (const k of TRACKED_ENV) {
    savedEnv[k] = process.env[k];
    delete process.env[k];
  }
});

afterEach(() => {
  for (const k of TRACKED_ENV) {
    if (savedEnv[k] === undefined) delete process.env[k];
    else process.env[k] = savedEnv[k];
  }
});

// Lightweight `Response`-shaped fixture. Mirrors the helper used in
// `lib/__tests__/trend-sync.test.ts` so the two suites read the same
// way.
function fakeResponse(status: number, statusText = "OK"): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    text: async () => "",
  } as unknown as Response;
}

type Call = { url: string; init: RequestInit | undefined };
function recordingFetch(response: Response): {
  fetch: FetchFn;
  calls: Call[];
} {
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
    return response;
  }) as FetchFn;
  return { fetch: fetchImpl, calls };
}

// A summary the dashboard would flag red: 7 of 10 clusters rejected
// (5 schema + 2 hallucination) for a 70% rate, which sits above the
// default 50% threshold.
const HOT_SUMMARY: AlertRunSummary = {
  chunksTotal: 4,
  modelReturnedTotal: 10,
  schemaRejectedTotal: 5,
  hallucinationDroppedTotal: 2,
  candidatesCreatedTotal: 3,
};

// A normal night: 1 of 10 rejected = 10%.
const QUIET_SUMMARY: AlertRunSummary = {
  chunksTotal: 4,
  modelReturnedTotal: 10,
  schemaRejectedTotal: 1,
  hallucinationDroppedTotal: 0,
  candidatesCreatedTotal: 9,
};

// The "no signals to cluster" branch in cluster.ts records this row.
const NO_SIGNALS_SUMMARY: AlertRunSummary = {
  chunksTotal: 0,
  modelReturnedTotal: 0,
  schemaRejectedTotal: 0,
  hallucinationDroppedTotal: 0,
  candidatesCreatedTotal: 0,
};

describe("rejectionRateForRun", () => {
  it("returns rejected/returned when the model returned at least one cluster", () => {
    assert.equal(rejectionRateForRun(HOT_SUMMARY), 0.7);
  });

  it("returns 0 (not NaN) when the model returned nothing", () => {
    // Important: this matches the dashboard's wire-format clamp in
    // src/routes/trend-queue.ts so the two surfaces agree on the
    // edge case.
    assert.equal(rejectionRateForRun(NO_SIGNALS_SUMMARY), 0);
  });
});

describe("shouldAlertOnRejectionRate", () => {
  it("alerts when the rate strictly exceeds the threshold", () => {
    assert.equal(shouldAlertOnRejectionRate(HOT_SUMMARY, 0.5), true);
  });

  it("does not alert when the rate is below the threshold", () => {
    assert.equal(shouldAlertOnRejectionRate(QUIET_SUMMARY, 0.5), false);
  });

  it("does not alert when the rate is exactly at the threshold (strict >)", () => {
    // Pinning the comparator: dashboard uses `> 0.5`, alert must too.
    const exact: AlertRunSummary = {
      chunksTotal: 2,
      modelReturnedTotal: 10,
      schemaRejectedTotal: 5,
      hallucinationDroppedTotal: 0,
      candidatesCreatedTotal: 5,
    };
    assert.equal(shouldAlertOnRejectionRate(exact, 0.5), false);
  });

  it("does not alert on a no-signals night even if the rate would otherwise pass", () => {
    // chunksTotal === 0 must short-circuit before the rate check.
    assert.equal(shouldAlertOnRejectionRate(NO_SIGNALS_SUMMARY, 0.5), false);
  });

  it("does not alert when the model returned nothing across non-empty chunks", () => {
    // E.g. every chunk threw (rate-limited night): nothing actionable
    // to report from the rejection-rate angle.
    const allFailed: AlertRunSummary = {
      chunksTotal: 3,
      modelReturnedTotal: 0,
      schemaRejectedTotal: 0,
      hallucinationDroppedTotal: 0,
      candidatesCreatedTotal: 0,
    };
    assert.equal(shouldAlertOnRejectionRate(allFailed, 0.5), false);
  });
});

describe("formatAlertMessage", () => {
  it("includes every stat the task spec asked for", () => {
    const text = formatAlertMessage(HOT_SUMMARY);
    assert.match(text, /rejected 70% of returned clusters/);
    assert.match(text, /chunks total: 4/);
    assert.match(text, /model returned: 10/);
    assert.match(text, /schema rejected: 5/);
    assert.match(text, /hallucination dropped: 2/);
    assert.match(text, /candidates created: 3/);
    assert.match(text, /rejection rate: 70%/);
  });

  it("appends the dashboard URL when provided", () => {
    const text = formatAlertMessage(HOT_SUMMARY, {
      dashboardUrl: "https://example.com/editor/trend-queue",
    });
    assert.match(
      text,
      /Editor trend queue: https:\/\/example\.com\/editor\/trend-queue/,
    );
  });

  it("omits the dashboard line when no URL is configured", () => {
    const text = formatAlertMessage(HOT_SUMMARY);
    assert.equal(text.includes("Editor trend queue:"), false);
  });
});

describe("DEFAULT_REJECTION_RATE_ALERT_THRESHOLD", () => {
  it("matches the editor dashboard's red-badge cutoff (0.5)", () => {
    // If this number changes, the dashboard's
    // REJECTION_RATE_WARN_THRESHOLD in EditorTrendQueue.tsx should
    // change with it — the two surfaces must agree on what counts
    // as "too many drops".
    assert.equal(DEFAULT_REJECTION_RATE_ALERT_THRESHOLD, 0.5);
  });
});

describe("sendClusterRunAlert", () => {
  it("skips when TREND_RADAR_ALERT_WEBHOOK_URL is unset (dev runs unaffected)", async () => {
    let fetchCalled = false;
    const fetchImpl = (async () => {
      fetchCalled = true;
      return fakeResponse(200);
    }) as FetchFn;
    const result = await sendClusterRunAlert(HOT_SUMMARY, {
      env: {},
      fetchImpl,
    });
    assert.equal(result.status, "skipped");
    assert.match(
      (result as { reason: string }).reason,
      /TREND_RADAR_ALERT_WEBHOOK_URL/,
    );
    assert.equal(fetchCalled, false);
  });

  it("skips when the rejection rate is below the threshold", async () => {
    let fetchCalled = false;
    const fetchImpl = (async () => {
      fetchCalled = true;
      return fakeResponse(200);
    }) as FetchFn;
    const result = await sendClusterRunAlert(QUIET_SUMMARY, {
      env: { TREND_RADAR_ALERT_WEBHOOK_URL: "https://hooks.example/abc" },
      fetchImpl,
    });
    assert.equal(result.status, "skipped");
    assert.equal(fetchCalled, false);
  });

  it("skips no-signal runs even with a webhook configured", async () => {
    let fetchCalled = false;
    const fetchImpl = (async () => {
      fetchCalled = true;
      return fakeResponse(200);
    }) as FetchFn;
    const result = await sendClusterRunAlert(NO_SIGNALS_SUMMARY, {
      env: { TREND_RADAR_ALERT_WEBHOOK_URL: "https://hooks.example/abc" },
      fetchImpl,
    });
    assert.equal(result.status, "skipped");
    assert.equal(fetchCalled, false);
  });

  it("POSTs a JSON body with the formatted text when the rate exceeds the threshold", async () => {
    const { fetch, calls } = recordingFetch(fakeResponse(200));
    const result = await sendClusterRunAlert(HOT_SUMMARY, {
      env: {
        TREND_RADAR_ALERT_WEBHOOK_URL: "https://hooks.example/abc",
        TREND_RADAR_ALERT_DASHBOARD_URL: "https://example.com/editor/trend-queue",
      },
      fetchImpl: fetch,
    });
    assert.equal(result.status, "sent");
    assert.equal(calls.length, 1);
    assert.equal(calls[0]!.url, "https://hooks.example/abc");
    const init = calls[0]!.init!;
    assert.equal(init.method, "POST");
    assert.deepEqual(init.headers, { "content-type": "application/json" });
    const parsed = JSON.parse(init.body as string) as { text: string };
    assert.match(parsed.text, /rejected 70% of returned clusters/);
    assert.match(
      parsed.text,
      /Editor trend queue: https:\/\/example\.com\/editor\/trend-queue/,
    );
  });

  it("respects an overridden TREND_RADAR_ALERT_THRESHOLD", async () => {
    // Bump the threshold above 70% and the same hot summary should
    // now be skipped.
    let fetchCalled = false;
    const fetchImpl = (async () => {
      fetchCalled = true;
      return fakeResponse(200);
    }) as FetchFn;
    const result = await sendClusterRunAlert(HOT_SUMMARY, {
      env: {
        TREND_RADAR_ALERT_WEBHOOK_URL: "https://hooks.example/abc",
        TREND_RADAR_ALERT_THRESHOLD: "0.9",
      },
      fetchImpl,
    });
    assert.equal(result.status, "skipped");
    assert.equal(fetchCalled, false);
  });

  it("skips with a clear reason when TREND_RADAR_ALERT_THRESHOLD is unparseable", async () => {
    // Refusing to silently fall back to the default protects against
    // a typo'd env var quietly disabling the threshold.
    let fetchCalled = false;
    const fetchImpl = (async () => {
      fetchCalled = true;
      return fakeResponse(200);
    }) as FetchFn;
    const result = await sendClusterRunAlert(HOT_SUMMARY, {
      env: {
        TREND_RADAR_ALERT_WEBHOOK_URL: "https://hooks.example/abc",
        TREND_RADAR_ALERT_THRESHOLD: "fifty-percent",
      },
      fetchImpl,
    });
    assert.equal(result.status, "skipped");
    assert.match(
      (result as { reason: string }).reason,
      /invalid TREND_RADAR_ALERT_THRESHOLD/,
    );
    assert.equal(fetchCalled, false);
  });

  it("skips when TREND_RADAR_ALERT_THRESHOLD is out of (0, 1)", async () => {
    // 1.5, 0, 1 are all invalid: the rate is in [0, 1] so a
    // threshold of 1 would never fire, and 0 would always fire on
    // any non-zero schema reject.
    for (const bad of ["0", "1", "1.5", "-0.2"]) {
      const { fetch } = recordingFetch(fakeResponse(200));
      const result = await sendClusterRunAlert(HOT_SUMMARY, {
        env: {
          TREND_RADAR_ALERT_WEBHOOK_URL: "https://hooks.example/abc",
          TREND_RADAR_ALERT_THRESHOLD: bad,
        },
        fetchImpl: fetch,
      });
      assert.equal(
        result.status,
        "skipped",
        `expected skip for threshold ${bad}`,
      );
    }
  });

  it("returns { status: 'failed' } on a non-2xx webhook response", async () => {
    const { fetch } = recordingFetch(fakeResponse(500, "Internal Server Error"));
    const result = await sendClusterRunAlert(HOT_SUMMARY, {
      env: { TREND_RADAR_ALERT_WEBHOOK_URL: "https://hooks.example/abc" },
      fetchImpl: fetch,
    });
    assert.equal(result.status, "failed");
    assert.match(
      (result as { reason: string }).reason,
      /500 Internal Server Error/,
    );
  });

  it("returns { status: 'failed' } when the network call throws", async () => {
    const fetchImpl = (async () => {
      throw new Error("ECONNRESET");
    }) as FetchFn;
    const result = await sendClusterRunAlert(HOT_SUMMARY, {
      env: { TREND_RADAR_ALERT_WEBHOOK_URL: "https://hooks.example/abc" },
      fetchImpl,
    });
    assert.equal(result.status, "failed");
    assert.match((result as { reason: string }).reason, /ECONNRESET/);
  });
});
