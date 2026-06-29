// Trend Radar nightly clustering alert.
//
// Why this exists
// ---------------
// The editor dashboard renders a red "rejection rate over 50%" badge on
// `EditorTrendQueue.tsx`, but that warning is only visible if someone
// opens the page. If a degraded prompt or a model regression silently
// drops most of the queue for a few nights running and nobody loads the
// dashboard, the queue starves without anyone noticing. This module
// pushes a brief alert to a configured webhook (Slack-incoming-webhook
// shape — `{ text }` — also accepted by Discord, Mattermost, and most
// generic chatops receivers) right after the nightly cluster run records
// its `trend_cluster_runs` row.
//
// Configuration (all env vars optional → unconfigured = silent skip)
// ------------------------------------------------------------------
//   TREND_RADAR_ALERT_WEBHOOK_URL    HTTPS URL the alert payload is POSTed
//                                    to. Slack/Discord-style incoming
//                                    webhook is expected (`{ text: ... }`).
//   TREND_RADAR_ALERT_DASHBOARD_URL  Optional. Appended to the alert body
//                                    so the recipient can click straight
//                                    through to the editor trend queue.
//   TREND_RADAR_ALERT_THRESHOLD      Optional float in (0, 1). Defaults to
//                                    0.5, matching the dashboard's red
//                                    badge cutoff. Out-of-range or
//                                    unparseable values cause the alert
//                                    to be skipped (with a logged
//                                    reason) rather than silently
//                                    fall back, so a typo in the env
//                                    can't quietly disable the check.
//
// Skip rules
// ----------
//   - No webhook URL configured → skipped (dev runs are unaffected).
//   - "No signals to cluster" runs (chunksTotal === 0) → skipped, even
//     if the rate would arithmetically be 0 — no-op nights are not
//     interesting.
//   - Model returned 0 clusters across the whole run → skipped: the
//     rejection rate denominator is undefined, so we have nothing
//     useful to report. (A *separate* "model returned nothing" alert
//     could be added later, but it's outside this task's scope.)
//   - Rejection rate is at or below the threshold → skipped.
//
// Failure handling
// ----------------
// Like the cluster-run telemetry write, the alert step must never
// crash the nightly job: a downed Slack workspace shouldn't fail the
// pipeline. The send helper returns a structured `{ status, reason }`
// shape and the caller logs the result. Network exceptions are caught.

export const DEFAULT_REJECTION_RATE_ALERT_THRESHOLD = 0.5;

// The minimum information the alert needs from a `trend_cluster_runs`
// row. Kept as a structural type (not a Drizzle row import) so this
// module stays trivial to unit-test without touching the DB layer.
export type AlertRunSummary = {
  chunksTotal: number;
  modelReturnedTotal: number;
  schemaRejectedTotal: number;
  hallucinationDroppedTotal: number;
  candidatesCreatedTotal: number;
};

export type AlertSendResult =
  | { status: "skipped"; reason: string }
  | { status: "sent" }
  | { status: "failed"; reason: string };

// Mirrors the server-side rejection-rate computation in
// `src/routes/trend-queue.ts` so the editor dashboard and the alert
// agree on the number — keeping this in one shape per file (rather than
// shared from a common module) is intentional: the dashboard route is
// in `src/`, this script is in `scripts/`, and they have separate
// build pipelines (Express bundle vs. tsx). Duplicating ~3 lines is
// cheaper than adding a cross-tree dependency, and the test in
// `__tests__/alert.test.ts` pins both shapes against the same
// fixtures.
export function rejectionRateForRun(run: AlertRunSummary): number {
  const denom = run.modelReturnedTotal;
  const rejected = run.schemaRejectedTotal + run.hallucinationDroppedTotal;
  return denom > 0 ? rejected / denom : 0;
}

export function shouldAlertOnRejectionRate(
  run: AlertRunSummary,
  threshold: number,
): boolean {
  // No-signals runs (the wrapper records a row with chunksTotal=0 so
  // the dashboard can still show "last run was a no-op") must not
  // alert — the rate is meaningless and an editor doesn't need a
  // ping for "we ingested nothing tonight".
  if (run.chunksTotal === 0) return false;
  // No clusters returned across the run → rate denominator is 0.
  // Skip rather than divide-by-zero or report 0% (which would itself
  // fall below the threshold and be a no-op anyway).
  if (run.modelReturnedTotal === 0) return false;
  return rejectionRateForRun(run) > threshold;
}

export function formatAlertMessage(
  run: AlertRunSummary,
  opts: { dashboardUrl?: string | undefined } = {},
): string {
  const rate = rejectionRateForRun(run);
  const pct = Math.round(rate * 100);
  const lines = [
    `Trend Radar: nightly clustering rejected ${pct}% of returned clusters.`,
    `• chunks total: ${run.chunksTotal}`,
    `• model returned: ${run.modelReturnedTotal}`,
    `• schema rejected: ${run.schemaRejectedTotal}`,
    `• hallucination dropped: ${run.hallucinationDroppedTotal}`,
    `• candidates created: ${run.candidatesCreatedTotal}`,
    `• rejection rate: ${pct}%`,
  ];
  if (opts.dashboardUrl) {
    lines.push(`Editor trend queue: ${opts.dashboardUrl}`);
  }
  return lines.join("\n");
}

type AlertConfig = {
  webhookUrl: string;
  dashboardUrl: string | undefined;
  threshold: number;
};

// Returns the resolved config, or `{ skip: reason }` so the caller can
// surface a useful "why didn't we send?" line in the script log.
function readAlertConfig(
  env: NodeJS.ProcessEnv,
): AlertConfig | { skip: string } {
  const webhookUrl = env.TREND_RADAR_ALERT_WEBHOOK_URL?.trim();
  const dashboardUrl = env.TREND_RADAR_ALERT_DASHBOARD_URL?.trim() || undefined;
  const thresholdRaw = env.TREND_RADAR_ALERT_THRESHOLD?.trim();

  if (!webhookUrl) {
    return { skip: "TREND_RADAR_ALERT_WEBHOOK_URL not configured" };
  }

  let threshold = DEFAULT_REJECTION_RATE_ALERT_THRESHOLD;
  if (thresholdRaw) {
    const parsed = Number.parseFloat(thresholdRaw);
    if (!Number.isFinite(parsed) || parsed <= 0 || parsed >= 1) {
      return {
        skip: `invalid TREND_RADAR_ALERT_THRESHOLD ${JSON.stringify(thresholdRaw)} (expected float in (0, 1))`,
      };
    }
    threshold = parsed;
  }

  return { webhookUrl, dashboardUrl, threshold };
}

export type SendClusterRunAlertOptions = {
  env?: NodeJS.ProcessEnv;
  fetchImpl?: typeof globalThis.fetch;
};

export async function sendClusterRunAlert(
  run: AlertRunSummary,
  opts: SendClusterRunAlertOptions = {},
): Promise<AlertSendResult> {
  const env = opts.env ?? process.env;
  const fetchImpl = opts.fetchImpl ?? globalThis.fetch;

  const config = readAlertConfig(env);
  if ("skip" in config) {
    return { status: "skipped", reason: config.skip };
  }

  if (!shouldAlertOnRejectionRate(run, config.threshold)) {
    const rate = rejectionRateForRun(run);
    return {
      status: "skipped",
      reason: `rejection rate ${(rate * 100).toFixed(1)}% does not exceed threshold ${(config.threshold * 100).toFixed(1)}% (chunksTotal=${run.chunksTotal}, modelReturned=${run.modelReturnedTotal})`,
    };
  }

  const text = formatAlertMessage(run, { dashboardUrl: config.dashboardUrl });

  try {
    const res = await fetchImpl(config.webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      return {
        status: "failed",
        reason: `webhook responded ${res.status} ${res.statusText}`,
      };
    }
    return { status: "sent" };
  } catch (err) {
    return {
      status: "failed",
      reason: err instanceof Error ? err.message : String(err),
    };
  }
}
