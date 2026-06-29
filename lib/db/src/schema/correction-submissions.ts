import { pgTable, text, serial, timestamp, index } from "drizzle-orm/pg-core";

// Reader-flagged corrections submitted via the public form on
// `/corrections` (and the small CTA in the site footer). Persisted
// here as the editor "inbox" — the corrections workflow polls this
// table to triage submissions against the SLA in the page's published
// five-rule policy (typo: 24h, factual: 7 days). The form is
// deliberately unauthenticated so any reader can flag an error, with
// abuse defences (origin allowlist + per-IP rate limit + honeypot)
// enforced at the API edge.
export const correctionSubmissionsTable = pgTable(
  "correction_submissions",
  {
    id: serial("id").primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    // The page the reader was on when they spotted the error. Stored
    // as free text rather than a foreign key into the catalogue so a
    // submission about a third-party page (e.g. a syndicated quote)
    // or a link the reader copied from somewhere else still records
    // cleanly.
    pageUrl: text("page_url").notNull(),
    // The reader's description of the error. Length-capped at the API
    // edge to keep abuse cheap.
    description: text("description").notNull(),
    // Optional supporting evidence URL (study, manufacturer page, …).
    evidenceUrl: text("evidence_url"),
    // Optional reply-to so the editors can attribute the catch and
    // send confirmation when the fix ships, per the policy ("with
    // attribution to the reader if one prompted it").
    submitterEmail: text("submitter_email"),
    userAgent: text("user_agent"),
    // Workflow state machine: `new` → `triaged` → `applied` |
    // `dismissed`. Stored as text rather than a Postgres enum so
    // editors can add new states without a migration.
    status: text("status").notNull().default("new"),
    // Free-text scratchpad the editor inbox UI writes when triaging a
    // submission ("dup of #41", "asked the reader for a screenshot",
    // …). Internal-only — never returned by the public POST endpoint
    // and not echoed back to the submitter.
    internalNote: text("internal_note"),
    // Bumped whenever an editor PATCHes the row so the inbox can show
    // "last touched N hours ago" alongside `createdAt` (the SLA clock).
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    createdAtIdx: index("correction_submissions_created_at_idx").on(t.createdAt),
    statusIdx: index("correction_submissions_status_idx").on(t.status),
  }),
);

export type CorrectionSubmission = typeof correctionSubmissionsTable.$inferSelect;
export type InsertCorrectionSubmission = typeof correctionSubmissionsTable.$inferInsert;
