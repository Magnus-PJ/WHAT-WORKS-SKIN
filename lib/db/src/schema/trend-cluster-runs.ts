import {
  pgTable,
  text,
  serial,
  timestamp,
  index,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

// One row per nightly clustering pass. Lets editors see *why* a quiet
// queue is quiet — was the model returning few clusters tonight, or
// was it returning lots and our schema guards / hallucination filter
// throwing most of them away?
//
// The aggregate counts are a denormalised sum of the per-chunk
// breakdown stored in `chunks` — kept on the row so the queue
// endpoint doesn't have to walk the JSON to render the badge.
export const trendClusterRunsTable = pgTable(
  "trend_cluster_runs",
  {
    id: serial("id").primaryKey(),
    startedAt: timestamp("started_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    finishedAt: timestamp("finished_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    // Total chunks the script attempted (input signals / chunk size,
    // rounded up). Useful for sanity-checking against `chunksFailed`.
    chunksTotal: integer("chunks_total").notNull().default(0),
    // Chunks where the LLM call threw (rate limit, transient 5xx,
    // malformed JSON). These contribute zero to the counts below.
    chunksFailed: integer("chunks_failed").notNull().default(0),
    // Sum across surviving chunks of "well-shaped clusters the model
    // returned" — i.e. the count *before* schema and hallucination
    // filtering. This is the denominator the queue UI compares the
    // rejection counts against to decide whether to flash a banner.
    modelReturnedTotal: integer("model_returned_total").notNull().default(0),
    // Clusters the model returned that failed the schema guards
    // (bad verdict / tier / template, short name, single signal,
    // non-integer ids). See `_cluster-parse.ts#isClusterRow`.
    schemaRejectedTotal: integer("schema_rejected_total").notNull().default(0),
    // Clusters dropped because too many of their signal ids weren't in
    // the batch we sent the model — i.e. the model invented ids and
    // the cluster fell below the min-signals floor after filtering.
    // See `_cluster-parse.ts#filterClustersByValidSignalIds`.
    hallucinationDroppedTotal: integer("hallucination_dropped_total")
      .notNull()
      .default(0),
    // Candidate rows actually inserted into `trend_candidates`. This is
    // the same number the script logs as "total candidates" at the end
    // of the run.
    candidatesCreatedTotal: integer("candidates_created_total")
      .notNull()
      .default(0),
    // Per-chunk breakdown for editors who want to drill in. Shape is an
    // array of `{ index, modelReturned, schemaRejected,
    // hallucinationDropped, created, failed }` — typed below as
    // `ClusterRunChunkStat`.
    chunks: jsonb("chunks").notNull().default("[]"),
    // Free-form note. Today only the legend "no_signals" is set when
    // the run had nothing to do, but reserving the column lets future
    // failure modes be tagged without another migration.
    note: text("note"),
  },
  (t) => ({
    finishedAtIdx: index("trend_cluster_runs_finished_at_idx").on(t.finishedAt),
  }),
);

export type ClusterRunChunkStat = {
  index: number;
  modelReturned: number;
  schemaRejected: number;
  hallucinationDropped: number;
  created: number;
  failed: boolean;
};

export type TrendClusterRun = typeof trendClusterRunsTable.$inferSelect;
export type InsertTrendClusterRun = typeof trendClusterRunsTable.$inferInsert;
