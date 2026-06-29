import { pgTable, text, serial, timestamp, index, integer } from "drizzle-orm/pg-core";

export const trendCandidatesTable = pgTable(
  "trend_candidates",
  {
    id: serial("id").primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    name: text("name").notNull(),
    summary: text("summary").notNull(),
    suggestedVerdict: text("suggested_verdict").notNull(),
    suggestedTier: text("suggested_tier").notNull(),
    suggestedTemplate: text("suggested_template").notNull(),
    velocity: text("velocity").notNull().default("steady"),
    sourceCount: integer("source_count").notNull().default(0),
    status: text("status").notNull().default("queued"),
    snoozeUntil: timestamp("snooze_until", { withTimezone: true }),
    publishedSlug: text("published_slug"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    // URL of the GitHub PR opened by the trend-sync helper after the
    // approval write. Null when the sync helper is unconfigured (env
    // vars missing) or when the sync attempt failed; in both cases the
    // file still lives in the api-server's local checkout and a founder
    // can push it manually. See `artifacts/api-server/src/lib/trend-sync.ts`.
    pullRequestUrl: text("pull_request_url"),
    // Most recent failure reason from the trend-sync helper. We persist
    // this so the editor card can show "Last sync failed: 401 Bad
    // credentials" on a fresh page load — the in-session retry result
    // alone evaporates as soon as the dashboard reloads, leaving the
    // founder with no clue whether the failure was a stale token, a
    // GitHub outage, or a duplicate file already on the upstream
    // branch. Cleared on a successful sync; left untouched on a
    // `skipped` (unconfigured) result so prior diagnostic text isn't
    // wiped out by an env-var regression.
    lastSyncError: text("last_sync_error"),
    lastSyncAttemptAt: timestamp("last_sync_attempt_at", { withTimezone: true }),
  },
  (t) => ({
    statusIdx: index("trend_candidates_status_idx").on(t.status),
    createdAtIdx: index("trend_candidates_created_at_idx").on(t.createdAt),
  }),
);

export type TrendCandidate = typeof trendCandidatesTable.$inferSelect;
export type InsertTrendCandidate = typeof trendCandidatesTable.$inferInsert;
