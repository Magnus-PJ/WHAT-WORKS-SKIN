// Best-effort outbound notification for newly persisted reader
// corrections. Editors don't have an inbox UI yet, and the policy SLA
// (typo 24h / factual 7 days) starts ticking the moment a submission
// lands. Posting to a webhook (Slack incoming-webhook URL, a custom
// endpoint, anything that accepts JSON) keeps a human in the loop
// until the inbox view ships.
//
// Two design rules:
//
//   1. **No-op when unconfigured.** Dev and CI runs leave
//      `CORRECTIONS_NOTIFY_WEBHOOK_URL` unset; we must not attempt a
//      network call in that case. This keeps the test suite hermetic
//      and prevents accidental pings from local dev.
//
//   2. **Never fail the request.** The reader has already had their
//      submission persisted. A flaky webhook is an editor-side
//      problem; surfacing it as a 500 to the reader would lose the
//      submission's "thanks!" UX and tempt them to resubmit.
//      Failures are logged and swallowed.

import type { Logger } from "pino";

export type CorrectionNotificationPayload = {
  submissionId: number;
  pageUrl: string;
  description: string;
  evidenceUrl: string | null;
  submitterEmail: string | null;
};

// A tiny structural subtype so callers can pass `req.log` (a pino
// child) without us having to import express types here.
type LogLike = Pick<Logger, "info" | "warn" | "error">;

function buildSlackCompatibleBody(
  payload: CorrectionNotificationPayload,
): Record<string, unknown> {
  // Slack incoming webhooks render `text` as the message body and
  // ignore unknown top-level keys, so we can include the full
  // structured payload alongside a human-readable summary. Generic
  // webhook receivers see a plain JSON object with every field they
  // need to route or template against.
  const lines = [
    `New correction #${payload.submissionId}`,
    `Page: ${payload.pageUrl}`,
    `Description: ${payload.description}`,
  ];
  if (payload.evidenceUrl) lines.push(`Evidence: ${payload.evidenceUrl}`);
  if (payload.submitterEmail) lines.push(`From: ${payload.submitterEmail}`);
  return {
    text: lines.join("\n"),
    submissionId: payload.submissionId,
    pageUrl: payload.pageUrl,
    description: payload.description,
    evidenceUrl: payload.evidenceUrl,
    submitterEmail: payload.submitterEmail,
  };
}

export async function notifyEditorsOfCorrection(
  payload: CorrectionNotificationPayload,
  log: LogLike,
): Promise<void> {
  const url = process.env["CORRECTIONS_NOTIFY_WEBHOOK_URL"];
  if (!url || url.trim().length === 0) {
    // Intentionally silent — this is the expected state in dev/test.
    return;
  }
  const body = buildSlackCompatibleBody(payload);
  try {
    // 5s is well under any sensible reverse-proxy timeout but long
    // enough to ride out a sluggish Slack edge. We don't retry: a
    // duplicate ping for the same submission would be more annoying
    // than a missed one (the row is in the DB either way).
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5_000);
    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
    if (!res.ok) {
      log.warn(
        { submissionId: payload.submissionId, status: res.status },
        "corrections: webhook returned non-2xx",
      );
      return;
    }
    log.info(
      { submissionId: payload.submissionId },
      "corrections: notified editors via webhook",
    );
  } catch (err) {
    log.error(
      {
        submissionId: payload.submissionId,
        err: err instanceof Error ? err.message : String(err),
      },
      "corrections: webhook delivery failed",
    );
  }
}
