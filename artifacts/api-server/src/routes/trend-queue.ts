// Trend Radar reviewer queue — editor-only API surface used by the
// `EditorTrendQueue.tsx` mockup-sandbox dashboard.
//
// Lifecycle:
//   - Ingestion scripts (`scripts/trend-radar/ingest-*.ts`) drop raw
//     signals into `trend_signals`.
//   - The clustering script (`scripts/trend-radar/cluster.ts`) groups
//     unattached signals into `trend_candidates` using Anthropic.
//   - This router serves the resulting candidates to the dashboard,
//     accepts approve/reject/snooze decisions, and writes approved
//     items back into the Astro content collection so the next build
//     picks them up.

import { Router, type IRouter } from "express";
import {
  db,
  trendCandidatesTable,
  trendClusterRunsTable,
  trendSignalsTable,
  type TrendClusterRun,
} from "@workspace/db";
import { and, desc, eq, lt, or } from "drizzle-orm";
import {
  ApproveTrendCandidateBody,
  ListTrendQueueQueryParams,
  type TrendClusterRunSummary,
} from "@workspace/api-zod";
import { requireEditor } from "../middlewares/editor-auth";
import {
  publishTrendWatchIssue,
  publishIngredientDraft,
  findRepoRoot,
  publishedPathForApproved,
  templateForApprovedStatus,
} from "../lib/trend-publish";
import {
  syncPublishedFileToGitHub,
  type TrendSyncResult,
} from "../lib/trend-sync";

const router: IRouter = Router();

const SNOOZE_DAYS = 30;

// Build the wire-shape summary the dashboard renders (counts +
// derived rejection rate). Lives next to the route because it's a
// thin row-to-DTO mapper — and the rejection rate is computed in one
// place so the server and the UI agree on the threshold the warning
// banner triggers at.
//
// `finishedAt` is pre-serialised to ISO here so the JSON the editor
// sees lines up with how the candidates list serialises its
// timestamps. The generated `TrendClusterRunSummary` types
// `finishedAt` as `Date` for the runtime parser, but over the wire
// it's a string.
type TrendClusterRunSummaryWire = Omit<TrendClusterRunSummary, "finishedAt"> & {
  finishedAt: string;
};

function summariseClusterRun(row: TrendClusterRun): TrendClusterRunSummaryWire {
  // Floating rate over the model's *returned* clusters: if the model
  // returned nothing tonight, "rejection rate" isn't a meaningful
  // number — clamp it to 0 so the UI doesn't show NaN%.
  //
  // We deliberately send the *unrounded* float on the wire and let the
  // UI decide its own display precision. Rounding here had a subtle bug:
  // a real 50.4% rejection rate would round to 0.50 and silently fall
  // below the dashboard's `> 0.5` warning threshold, so the banner
  // wouldn't flip to danger. Sending the raw ratio means a single
  // rounding rule (UI's `(rate * 100).toFixed(0) + "%"`) governs
  // display, while threshold comparisons see the true value.
  const denom = row.modelReturnedTotal;
  const rejected = row.schemaRejectedTotal + row.hallucinationDroppedTotal;
  const rejectionRate = denom > 0 ? rejected / denom : 0;
  return {
    finishedAt: row.finishedAt.toISOString(),
    chunksTotal: row.chunksTotal,
    chunksFailed: row.chunksFailed,
    modelReturnedTotal: row.modelReturnedTotal,
    schemaRejectedTotal: row.schemaRejectedTotal,
    hallucinationDroppedTotal: row.hallucinationDroppedTotal,
    candidatesCreatedTotal: row.candidatesCreatedTotal,
    rejectionRate,
    note: row.note,
  };
}

async function loadLastClusterRun(): Promise<TrendClusterRunSummaryWire | null> {
  const rows = await db
    .select()
    .from(trendClusterRunsTable)
    .orderBy(desc(trendClusterRunsTable.finishedAt))
    .limit(1);
  const row = rows[0];
  return row ? summariseClusterRun(row) : null;
}

// ─────────────────────────────────────────────────────────────────────
// GET /editor/trend-queue
//
// Returns candidates filtered by `status` (default `queued`) newest-
// first, with an attached array of source signals so reviewers can
// click through to the original Reddit thread, PubMed abstract, etc.
// before publishing.
//
// Snooze auto-graduation: any candidate whose snooze window has
// elapsed is silently flipped back to `queued` *before* the listing
// query runs, so reviewers don't need to manually rescue snoozed items
// that the 30-day clock has aged out.
// ─────────────────────────────────────────────────────────────────────
router.get("/editor/trend-queue", requireEditor(), async (req, res) => {
  const parsed = ListTrendQueueQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({
      error: "invalid_query",
      issues: parsed.error.issues,
    });
    return;
  }
  const { status, limit } = parsed.data;

  // Wake any snoozed candidates whose 30-day pause has expired. We do
  // this on every list call rather than via a cron because the queue
  // is reviewer-driven (no background scheduler today) and the cost is
  // a single indexed UPDATE per request.
  await db
    .update(trendCandidatesTable)
    .set({ status: "queued", snoozeUntil: null, updatedAt: new Date() })
    .where(
      and(
        eq(trendCandidatesTable.status, "snoozed"),
        lt(trendCandidatesTable.snoozeUntil, new Date()),
      ),
    );

  // Pull the candidates and the last-run telemetry concurrently so the
  // queue badge doesn't add a sequential round-trip to the page load.
  const [candidates, lastClusterRun] = await Promise.all([
    db
      .select()
      .from(trendCandidatesTable)
      .where(eq(trendCandidatesTable.status, status))
      .orderBy(desc(trendCandidatesTable.updatedAt))
      .limit(limit),
    loadLastClusterRun(),
  ]);

  // Pull the signals for the visible page in one query and group them
  // by candidate id in JS — this keeps the API surface a single
  // round-trip from the dashboard's point of view without forcing a
  // join that would duplicate the candidate row per signal.
  const ids = candidates.map((c) => c.id);
  const signals = ids.length
    ? await db
        .select({
          id: trendSignalsTable.id,
          candidateId: trendSignalsTable.candidateId,
          source: trendSignalsTable.source,
          sourceUrl: trendSignalsTable.sourceUrl,
          title: trendSignalsTable.title,
          publishedAt: trendSignalsTable.publishedAt,
        })
        .from(trendSignalsTable)
        .where(
          or(...ids.map((id) => eq(trendSignalsTable.candidateId, id))),
        )
    : [];

  const signalsByCandidate = new Map<number, typeof signals>();
  for (const s of signals) {
    if (s.candidateId == null) continue;
    const list = signalsByCandidate.get(s.candidateId) ?? [];
    list.push(s);
    signalsByCandidate.set(s.candidateId, list);
  }

  res.json({
    status,
    lastClusterRun,
    candidates: candidates.map((c) => ({
      id: c.id,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      name: c.name,
      summary: c.summary,
      suggestedVerdict: c.suggestedVerdict,
      suggestedTier: c.suggestedTier,
      suggestedTemplate: c.suggestedTemplate,
      velocity: c.velocity,
      sourceCount: c.sourceCount,
      status: c.status,
      publishedSlug: c.publishedSlug,
      pullRequestUrl: c.pullRequestUrl,
      lastSyncError: c.lastSyncError,
      lastSyncAttemptAt: c.lastSyncAttemptAt
        ? c.lastSyncAttemptAt.toISOString()
        : null,
      signals: (signalsByCandidate.get(c.id) ?? []).map((s) => ({
        id: s.id,
        source: s.source,
        sourceUrl: s.sourceUrl,
        title: s.title,
        publishedAt: s.publishedAt ? s.publishedAt.toISOString() : null,
      })),
    })),
  });
});

// Helper: load a candidate by id, returning null on miss so the route
// can 404 cleanly. Returns the row directly (not wrapped in an array)
// because Drizzle's `.limit(1)` still gives you back a list.
async function loadCandidate(id: number) {
  const rows = await db
    .select()
    .from(trendCandidatesTable)
    .where(eq(trendCandidatesTable.id, id))
    .limit(1);
  return rows[0] ?? null;
}

function parseId(raw: string | string[] | undefined): number | null {
  if (typeof raw !== "string") return null;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

// ─────────────────────────────────────────────────────────────────────
// POST /editor/trend-queue/:id/approve
//
// Publishes the candidate back to Astro under the chosen template and
// flips the candidate row to the matching `approved-*` status so it
// drops out of the queue. The body lets the reviewer override the
// auto-suggested name/summary/verdict/tier — the rule is "publish what
// the founder typed, not what the LLM guessed".
// ─────────────────────────────────────────────────────────────────────
router.post(
  "/editor/trend-queue/:id/approve",
  requireEditor(),
  async (req, res) => {
    const id = parseId(req.params.id);
    if (id == null) {
      res.status(400).json({ error: "invalid_id" });
      return;
    }
    const parsed = ApproveTrendCandidateBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "invalid_body",
        issues: parsed.error.issues,
      });
      return;
    }
    const body = parsed.data;

    // Concurrency-safe claim: atomically flip the row out of a
    // reviewable state into a transient `approved-*` status before we
    // touch the filesystem. If two reviewers click Approve at the same
    // instant only one UPDATE will affect a row, the other returns
    // zero rows and we 409 — preventing duplicate `issue-NNN.json`
    // files from racing into the content folder.
    const provisionalStatus: "approved-trendwatch" | "approved-draft" =
      body.template === "trend-watch" ? "approved-trendwatch" : "approved-draft";
    const claimedRows = await db
      .update(trendCandidatesTable)
      .set({ status: provisionalStatus, updatedAt: new Date() })
      .where(
        and(
          eq(trendCandidatesTable.id, id),
          or(
            eq(trendCandidatesTable.status, "queued"),
            eq(trendCandidatesTable.status, "snoozed"),
          ),
        ),
      )
      .returning({ id: trendCandidatesTable.id });
    if (claimedRows.length === 0) {
      // Either the row doesn't exist or it's already resolved; figure
      // out which to give the editor a useful error.
      const existing = await loadCandidate(id);
      if (!existing) {
        res.status(404).json({ error: "not_found" });
        return;
      }
      res.status(409).json({ error: "already_resolved", status: existing.status });
      return;
    }

    // The row is now claimed in the provisional `approved-*` status.
    // If the filesystem write throws, we MUST roll the row back to
    // `queued` so the candidate doesn't get lost (status flipped but
    // no published file). The compensation runs in a finally block via
    // a success flag.
    let result: { publishedSlug: string; publishedPath: string };
    let writeSucceeded = false;
    try {
      if (body.template === "trend-watch") {
        result = await publishTrendWatchIssue({
          headline: body.name,
          dek: body.summary.slice(0, 240),
          verdict: {
            name: body.name,
            verdict: body.verdict,
            tier: body.tier,
            body: body.summary,
            bottom: body.bottom,
          },
        });
      } else {
        result = await publishIngredientDraft({
          name: body.name,
          summary: body.summary,
          verdict: body.verdict,
          tier: body.tier,
          bottom: body.bottom,
        });
      }
      writeSucceeded = true;
    } catch (writeErr) {
      // Compensating reset back to `queued` so the editor can retry.
      try {
        await db
          .update(trendCandidatesTable)
          .set({ status: "queued", updatedAt: new Date() })
          .where(eq(trendCandidatesTable.id, id));
      } catch (rollbackErr) {
        req.log.error(
          { candidateId: id, rollbackErr },
          "trend-queue: rollback after publish failure also failed",
        );
      }
      req.log.error(
        { candidateId: id, template: body.template, writeErr },
        "trend-queue: publish failed, status rolled back to queued",
      );
      res.status(500).json({ error: "publish_failed" });
      return;
    }

    if (!writeSucceeded) return; // unreachable; satisfies TS

    // Filesystem write succeeded — persist the published slug + ts.
    await db
      .update(trendCandidatesTable)
      .set({
        publishedSlug: result.publishedSlug,
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(trendCandidatesTable.id, id));

    req.log.info(
      { candidateId: id, template: body.template, slug: result.publishedSlug },
      "trend-queue: published candidate",
    );

    // Sync the freshly-written file to the source repo Vercel builds
    // from by opening a Pull Request via the GitHub REST API. This is
    // intentionally *not* part of the local-write atomicity contract:
    //   - The local file is already on disk; rolling back the candidate
    //     row would leave a stranded JSON file with no DB pointer.
    //   - The sync is fully retryable from the local file (the founder
    //     can `git push` it manually if every automated attempt fails).
    // So a sync failure logs loudly and is surfaced to the editor in
    // the response payload, but the approval itself is considered
    // successful and the editor sees the "published as ..." line.
    let sync: TrendSyncResult;
    try {
      const repoRoot = await findRepoRoot();
      sync = await syncPublishedFileToGitHub({
        repoRoot,
        relativePath: result.publishedPath,
        slug: result.publishedSlug,
        summary: body.summary,
        template: body.template,
      });
    } catch (syncErr) {
      // The sync helper itself shouldn't throw (it converts errors to
      // `{ status: "failed" }`), but we belt-and-braces here so an
      // unexpected exception (e.g. fetch network throw) doesn't bubble
      // up and 500 the approval response.
      const reason = syncErr instanceof Error ? syncErr.message : String(syncErr);
      req.log.error(
        { candidateId: id, slug: result.publishedSlug, syncErr },
        "trend-queue: sync helper threw unexpectedly",
      );
      sync = { status: "failed", reason };
    }

    if (sync.status === "synced") {
      // Successful sync clears any prior failure diagnostics so the
      // editor card flips out of the "last sync failed" affordance on
      // the next list refresh.
      await db
        .update(trendCandidatesTable)
        .set({
          pullRequestUrl: sync.pullRequestUrl,
          lastSyncError: null,
          lastSyncAttemptAt: null,
          updatedAt: new Date(),
        })
        .where(eq(trendCandidatesTable.id, id));
      req.log.info(
        {
          candidateId: id,
          slug: result.publishedSlug,
          pullRequestUrl: sync.pullRequestUrl,
          pullRequestNumber: sync.pullRequestNumber,
        },
        "trend-queue: opened sync PR",
      );
    } else if (sync.status === "skipped") {
      // Common in dev / local runs without a configured token; debug
      // level so it doesn't drown out real errors but is still visible
      // when chasing "why didn't a PR open?".
      //
      // Deliberately leave any prior `lastSyncError` in place: a
      // skipped result means we didn't even try (env vars missing),
      // so wiping out a previously-recorded GitHub error would just
      // hide diagnostic context if a token regression flipped sync
      // back to unconfigured.
      req.log.debug(
        { candidateId: id, slug: result.publishedSlug, reason: sync.reason },
        "trend-queue: sync skipped (unconfigured)",
      );
    } else {
      // Persist the failure reason + timestamp so the dashboard can
      // surface "Last sync failed 2h ago: 401 Bad credentials" on
      // first page load — the in-session retry result alone vanishes
      // as soon as the editor refreshes.
      await db
        .update(trendCandidatesTable)
        .set({
          lastSyncError: sync.reason,
          lastSyncAttemptAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(trendCandidatesTable.id, id));
      req.log.error(
        { candidateId: id, slug: result.publishedSlug, reason: sync.reason },
        "trend-queue: sync failed; file remains in local checkout for manual push",
      );
    }

    res.json({
      publishedSlug: result.publishedSlug,
      publishedPath: result.publishedPath,
      syncStatus: sync.status,
      pullRequestUrl:
        sync.status === "synced" ? sync.pullRequestUrl : undefined,
      syncReason: sync.status === "synced" ? undefined : sync.reason,
    });
  },
);

router.post(
  "/editor/trend-queue/:id/reject",
  requireEditor(),
  async (req, res) => {
    const id = parseId(req.params.id);
    if (id == null) {
      res.status(400).json({ error: "invalid_id" });
      return;
    }
    const candidate = await loadCandidate(id);
    if (!candidate) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    await db
      .update(trendCandidatesTable)
      .set({ status: "rejected", updatedAt: new Date() })
      .where(eq(trendCandidatesTable.id, id));
    req.log.info({ candidateId: id }, "trend-queue: rejected candidate");
    res.status(204).end();
  },
);

// ─────────────────────────────────────────────────────────────────────
// POST /editor/trend-queue/:id/sync-retry
//
// Re-runs the GitHub PR sync against an already-published candidate
// whose first sync attempt didn't open a PR (bad token, GitHub
// outage, network blip, etc.). The local file written by the original
// approve call is on disk in the api-server's checkout — this route
// reuses it as-is, never re-allocating an issue number or writing a
// second `issue-NNN.json`.
//
// Eligibility:
//   - Status is `approved-trendwatch` or `approved-draft` (i.e. the
//     row was approved at some point in the past).
//   - `publishedSlug` is set (the local write succeeded).
//   - `pullRequestUrl` is null (no successful sync to retry against —
//     a row that already has a PR is a no-op for this endpoint).
//
// On success the new PR URL is persisted on the row, so the editor
// card flips out of the "retry" affordance on the next list refresh.
// On failure the row is left untouched (still no PR URL) and the
// editor sees the GitHub error so they can decide to re-retry or push
// by hand.
//
// Idempotency note: `syncPublishedFileToGitHub` mints a fresh branch
// name including `Date.now()` on every call, so two parallel retries
// won't collide on the GitHub side. We don't lock the row across the
// retry because (a) the sync is several network round-trips and we
// don't want to hold a row lock that long, (b) the worst case of two
// parallel retries is two PRs against the same file, which the
// founder can resolve by closing one — strictly better than losing
// the recovery path.
// ─────────────────────────────────────────────────────────────────────
router.post(
  "/editor/trend-queue/:id/sync-retry",
  requireEditor(),
  async (req, res) => {
    const id = parseId(req.params.id);
    if (id == null) {
      res.status(400).json({ error: "invalid_id" });
      return;
    }
    const candidate = await loadCandidate(id);
    if (!candidate) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    if (
      candidate.status !== "approved-trendwatch" &&
      candidate.status !== "approved-draft"
    ) {
      res.status(409).json({
        error: "not_published",
        status: candidate.status,
      });
      return;
    }
    if (!candidate.publishedSlug) {
      // Defensive: an approved-* row without a slug means the publish
      // half-finished (status flipped, file write didn't record). The
      // only safe recovery there is to re-approve, not to retry sync
      // against a path we'd have to invent.
      res.status(409).json({ error: "missing_published_slug" });
      return;
    }
    if (candidate.pullRequestUrl) {
      // Already has a PR — return the existing URL so the UI can
      // self-heal (e.g. the editor's local view was stale and a prior
      // retry already won the race).
      res.json({
        publishedSlug: candidate.publishedSlug,
        publishedPath: publishedPathForApproved(
          candidate.status,
          candidate.publishedSlug,
        ),
        syncStatus: "synced",
        pullRequestUrl: candidate.pullRequestUrl,
      });
      return;
    }

    const publishedPath = publishedPathForApproved(
      candidate.status,
      candidate.publishedSlug,
    );
    const template = templateForApprovedStatus(candidate.status);

    let sync: TrendSyncResult;
    try {
      const repoRoot = await findRepoRoot();
      sync = await syncPublishedFileToGitHub({
        repoRoot,
        relativePath: publishedPath,
        slug: candidate.publishedSlug,
        summary: candidate.summary,
        template,
      });
    } catch (syncErr) {
      const reason = syncErr instanceof Error ? syncErr.message : String(syncErr);
      req.log.error(
        { candidateId: id, slug: candidate.publishedSlug, syncErr },
        "trend-queue: sync-retry helper threw unexpectedly",
      );
      sync = { status: "failed", reason };
    }

    if (sync.status === "synced") {
      // Successful retry clears the persisted failure reason so the
      // dashboard's "Last sync failed" hint disappears on the next
      // refresh, mirroring the approve-path semantics above.
      await db
        .update(trendCandidatesTable)
        .set({
          pullRequestUrl: sync.pullRequestUrl,
          lastSyncError: null,
          lastSyncAttemptAt: null,
          updatedAt: new Date(),
        })
        .where(eq(trendCandidatesTable.id, id));
      req.log.info(
        {
          candidateId: id,
          slug: candidate.publishedSlug,
          pullRequestUrl: sync.pullRequestUrl,
          pullRequestNumber: sync.pullRequestNumber,
        },
        "trend-queue: sync-retry opened PR",
      );
    } else if (sync.status === "skipped") {
      // Same rationale as the approve path: don't wipe a real
      // previously-recorded GitHub error just because the env vars
      // disappeared between attempts.
      req.log.debug(
        { candidateId: id, slug: candidate.publishedSlug, reason: sync.reason },
        "trend-queue: sync-retry skipped (unconfigured)",
      );
    } else {
      // Update the persisted failure reason on every retry so the
      // dashboard always reflects the *latest* attempt rather than
      // the original one.
      await db
        .update(trendCandidatesTable)
        .set({
          lastSyncError: sync.reason,
          lastSyncAttemptAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(trendCandidatesTable.id, id));
      req.log.error(
        { candidateId: id, slug: candidate.publishedSlug, reason: sync.reason },
        "trend-queue: sync-retry failed; file remains in local checkout",
      );
    }

    res.json({
      publishedSlug: candidate.publishedSlug,
      publishedPath,
      syncStatus: sync.status,
      pullRequestUrl:
        sync.status === "synced" ? sync.pullRequestUrl : undefined,
      syncReason: sync.status === "synced" ? undefined : sync.reason,
    });
  },
);

router.post(
  "/editor/trend-queue/:id/snooze",
  requireEditor(),
  async (req, res) => {
    const id = parseId(req.params.id);
    if (id == null) {
      res.status(400).json({ error: "invalid_id" });
      return;
    }
    const candidate = await loadCandidate(id);
    if (!candidate) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    const snoozeUntil = new Date(
      Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000,
    );
    await db
      .update(trendCandidatesTable)
      .set({
        status: "snoozed",
        snoozeUntil,
        updatedAt: new Date(),
      })
      .where(eq(trendCandidatesTable.id, id));
    req.log.info(
      { candidateId: id, snoozeUntil },
      "trend-queue: snoozed candidate",
    );
    res.status(204).end();
  },
);

export default router;
