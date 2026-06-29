import { pgTable, text, serial, timestamp, index, uniqueIndex, integer } from "drizzle-orm/pg-core";

export const trendSignalsTable = pgTable(
  "trend_signals",
  {
    id: serial("id").primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    source: text("source").notNull(),
    sourceUrl: text("source_url").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    extra: text("extra"),
    hash: text("hash").notNull(),
    candidateId: integer("candidate_id"),
  },
  (t) => ({
    hashUniq: uniqueIndex("trend_signals_hash_uniq").on(t.hash),
    sourceIdx: index("trend_signals_source_idx").on(t.source),
    createdAtIdx: index("trend_signals_created_at_idx").on(t.createdAt),
    candidateIdx: index("trend_signals_candidate_idx").on(t.candidateId),
  }),
);

export type TrendSignal = typeof trendSignalsTable.$inferSelect;
export type InsertTrendSignal = typeof trendSignalsTable.$inferInsert;
