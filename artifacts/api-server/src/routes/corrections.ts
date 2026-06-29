import { Router, type IRouter } from "express";
import { db, correctionSubmissionsTable } from "@workspace/db";
import {
  SubmitCorrectionBody,
  ListEditorCorrectionsQueryParams,
  UpdateEditorCorrectionBody,
} from "@workspace/api-zod";
import { desc, eq } from "drizzle-orm";
import {
  enforceCorrectionsAllowedOrigin,
  enforceCorrectionsRateLimit,
} from "../middlewares/corrections-abuse";
import { requireEditor } from "../middlewares/editor-auth";
import { notifyEditorsOfCorrection } from "../lib/corrections-notify";

const router: IRouter = Router();

// `POST /api/corrections` — public sink for the reader-facing
// "Submit a correction" form on the `/corrections` page (and the
// small CTA in the site footer of every page). The endpoint is
// unauthenticated by design: any reader should be able to flag an
// error without signing up. Abuse defences live one layer up
// (origin allowlist + per-IP rate limit + 16 KB body cap in
// `app.ts`); this handler additionally implements a server-side
// honeypot that bots typically trip and humans never see.
router.post(
  "/corrections",
  enforceCorrectionsAllowedOrigin(),
  enforceCorrectionsRateLimit(),
  async (req, res) => {
    const parsed = SubmitCorrectionBody.safeParse(req.body);
    if (!parsed.success) {
      req.log.warn(
        { issues: parsed.error.issues },
        "corrections: rejected malformed payload",
      );
      res.status(400).json({
        error: "invalid_payload",
        issues: parsed.error.issues,
      });
      return;
    }
    const { pageUrl, description, evidenceUrl, email, website } = parsed.data;

    // Honeypot: real browsers leave the visually-hidden `website`
    // field blank because the form's CSS hides it off-screen. A
    // scraping bot that fills every input will populate it. We
    // respond 204 anyway so the bot can't tell it was rejected and
    // start probing for the real shape.
    if (typeof website === "string" && website.trim().length > 0) {
      req.log.warn(
        { website: website.slice(0, 64) },
        "corrections: dropped honeypot submission",
      );
      res.status(204).end();
      return;
    }

    const userAgent = req.get("user-agent") ?? null;
    const inserted = await db
      .insert(correctionSubmissionsTable)
      .values({
        pageUrl,
        description,
        evidenceUrl: evidenceUrl ?? null,
        submitterEmail: email ?? null,
        userAgent,
      })
      .returning({ id: correctionSubmissionsTable.id });
    const submissionId = inserted[0]!.id;
    req.log.info(
      {
        submissionId,
        pageUrl,
        hasEvidence: Boolean(evidenceUrl),
        hasEmail: Boolean(email),
      },
      "corrections: persisted submission",
    );
    // Editors don't have an inbox UI yet, so route the new submission
    // out to whatever webhook (Slack, custom listener, …) the
    // operator has configured. We await rather than fire-and-forget
    // so a slow webhook can't outlive the request and leak into the
    // next tick after the process has moved on; the helper enforces
    // its own 5s timeout and swallows all errors so the reader still
    // sees a 204 even when the webhook is unreachable.
    await notifyEditorsOfCorrection(
      {
        submissionId,
        pageUrl,
        description,
        evidenceUrl: evidenceUrl ?? null,
        submitterEmail: email ?? null,
      },
      req.log,
    );
    res.status(204).end();
  },
);

// Shape the editor inbox renders. Mirrors `CorrectionRecord` in the
// OpenAPI spec — timestamps go over the wire as ISO strings so the
// dashboard's "submitted N hours ago" SLA clock can be derived in JS
// without any timezone footguns.
type CorrectionWire = {
  id: number;
  createdAt: string;
  updatedAt: string;
  pageUrl: string;
  description: string;
  evidenceUrl: string | null;
  submitterEmail: string | null;
  userAgent: string | null;
  status: string;
  internalNote: string | null;
};

function toWire(
  row: typeof correctionSubmissionsTable.$inferSelect,
): CorrectionWire {
  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    pageUrl: row.pageUrl,
    description: row.description,
    evidenceUrl: row.evidenceUrl,
    submitterEmail: row.submitterEmail,
    userAgent: row.userAgent,
    status: row.status,
    internalNote: row.internalNote,
  };
}

// ─────────────────────────────────────────────────────────────────────
// GET /editor/corrections
//
// Editor-only inbox listing. Defaults to `status=new` because that's
// the "what came in since I last checked" view editors open every
// morning; `status=all` skips the filter entirely so an editor can
// look back across resolved items without paging through each bucket.
// ─────────────────────────────────────────────────────────────────────
router.get("/editor/corrections", requireEditor(), async (req, res) => {
  const parsed = ListEditorCorrectionsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({
      error: "invalid_query",
      issues: parsed.error.issues,
    });
    return;
  }
  const { status, limit } = parsed.data;
  const rows = await db
    .select()
    .from(correctionSubmissionsTable)
    .where(
      status === "all"
        ? undefined
        : eq(correctionSubmissionsTable.status, status),
    )
    .orderBy(desc(correctionSubmissionsTable.createdAt))
    .limit(limit);
  res.json({ status, corrections: rows.map(toWire) });
});

function parseId(raw: string | string[] | undefined): number | null {
  if (typeof raw !== "string") return null;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

// ─────────────────────────────────────────────────────────────────────
// PATCH /editor/corrections/:id
//
// Updates the workflow status and/or the internal note on a single
// submission. Both body fields are optional — sending just `status`
// advances the workflow without touching the note, and sending just
// `internalNote` records a triage comment without changing state. At
// least one field must be present or we reject 400 (no-op PATCHes are
// almost certainly a bug in the caller).
// ─────────────────────────────────────────────────────────────────────
router.patch("/editor/corrections/:id", requireEditor(), async (req, res) => {
  const id = parseId(req.params.id);
  if (id == null) {
    res.status(400).json({ error: "invalid_id" });
    return;
  }
  const parsed = UpdateEditorCorrectionBody.safeParse(req.body ?? {});
  if (!parsed.success) {
    res.status(400).json({
      error: "invalid_body",
      issues: parsed.error.issues,
    });
    return;
  }
  const body = parsed.data as {
    status?: "new" | "triaged" | "applied" | "dismissed";
    internalNote?: string | null;
  };
  // The zod schema permits omitting both fields (every property is
  // optional), but a PATCH that asks for nothing is meaningless. We
  // distinguish "field absent" from "field set to null" so editors
  // can clear an existing note by sending `internalNote: null`.
  const hasStatus = body.status !== undefined;
  const hasNote = Object.prototype.hasOwnProperty.call(
    req.body ?? {},
    "internalNote",
  );
  if (!hasStatus && !hasNote) {
    res.status(400).json({ error: "no_fields" });
    return;
  }

  const update: Partial<typeof correctionSubmissionsTable.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (hasStatus) update.status = body.status!;
  if (hasNote) update.internalNote = body.internalNote ?? null;

  const updated = await db
    .update(correctionSubmissionsTable)
    .set(update)
    .where(eq(correctionSubmissionsTable.id, id))
    .returning();
  const row = updated[0];
  if (!row) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  req.log.info(
    {
      correctionId: id,
      newStatus: hasStatus ? body.status : undefined,
      noteChanged: hasNote,
    },
    "corrections: editor updated submission",
  );
  res.json(toWire(row));
});

export default router;
