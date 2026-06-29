// Clustering pass: turns raw `trend_signals` rows into editorially
// useful `trend_candidates` using Anthropic. Run after the ingest
// scripts finish.

import { and, eq, gte, isNull } from "drizzle-orm";
import {
  db,
  trendCandidatesTable,
  trendClusterRunsTable,
  trendSignalsTable,
  type ClusterRunChunkStat,
} from "@workspace/db";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import {
  type ClusterRow,
  MIN_SIGNALS_PER_CLUSTER,
  filterClustersByValidSignalIdsWithStats,
  parseClustersWithStats,
} from "./_cluster-parse";
import { sendClusterRunAlert, type AlertRunSummary } from "./_alert";

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 8192;
const SIGNALS_PER_CHUNK = 30;
const LOOKBACK_DAYS = 14;

const SYSTEM_PROMPT = `You are an editorial assistant for "What Works Skin", an evidence-first
ad-free skincare reference. You read raw trend signals scraped from
Reddit, PubMed, Google Trends, and FDA news, and you cluster them into
named editorial trends that the editors (Dr. Paul + Dr. Sundeep) can
review.

Output must be a single JSON object matching this exact shape:
{
  "clusters": [
    {
      "name": "string — three or more words, sentence case, no quotes",
      "summary": "one paragraph (60–120 words) describing what the trend is and what the evidence suggests",
      "suggestedVerdict": "Holds Up" | "Promising" | "Partly True" | "Misleading" | "Skip",
      "suggestedTier": "A" | "B" | "C" | "D",
      "suggestedTemplate": "trend-watch" | "ingredient-draft",
      "velocity": "rising" | "steady" | "fading",
      "signalIds": [<integer signal ids from the input>]
    }
  ]
}

Rules:
- Cluster names MUST be at least three words.
- Each cluster must contain at least ${MIN_SIGNALS_PER_CLUSTER} signal ids.
- Use "ingredient-draft" only when the cluster is centred on a single
  ingredient or compound the site doesn't yet have a page for.
- Suggested tier reflects evidence strength: A = strong RCT support,
  B = consistent positive signal, C = mixed, D = misleading or harmful.
- Skip signals that don't form a coherent cluster — do not invent
  one-signal "trends".
- Output ONLY the JSON object. No prose, no markdown fences.`;

type SignalForCluster = {
  id: number;
  source: string;
  title: string;
  body?: string | null;
  publishedAt?: Date | null;
  sourceUrl: string;
};

function summariseSignal(s: SignalForCluster): string {
  const date = s.publishedAt ? s.publishedAt.toISOString().slice(0, 10) : "—";
  const body = s.body ? ` :: ${s.body.replace(/\s+/g, " ").slice(0, 220)}` : "";
  return `[${s.id}] (${s.source} ${date}) ${s.title}${body}`;
}

async function loadUnclusteredSignals(): Promise<SignalForCluster[]> {
  // Only consider signals from the last 14 days. Anything older has
  // either already been clustered or is stale enough that re-surfacing
  // it would noise up the queue.
  const cutoff = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
  const rows = await db
    .select({
      id: trendSignalsTable.id,
      source: trendSignalsTable.source,
      title: trendSignalsTable.title,
      body: trendSignalsTable.body,
      publishedAt: trendSignalsTable.publishedAt,
      sourceUrl: trendSignalsTable.sourceUrl,
    })
    .from(trendSignalsTable)
    .where(
      and(
        isNull(trendSignalsTable.candidateId),
        gte(trendSignalsTable.createdAt, cutoff),
      ),
    );
  return rows;
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

type ChunkOutcome = {
  rows: ClusterRow[];
  modelReturned: number;
  schemaRejected: number;
};

async function clusterChunk(
  signals: SignalForCluster[],
): Promise<ChunkOutcome> {
  const userPrompt =
    "Signals to cluster (one per line):\n" + signals.map(summariseSignal).join("\n");
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });
  const block = message.content[0];
  const text = block && block.type === "text" ? block.text : "";
  const stats = parseClustersWithStats(text);
  return {
    rows: stats.rows,
    modelReturned: stats.modelReturned,
    schemaRejected: stats.schemaRejected,
  };
}

type PersistOutcome = {
  created: number;
  hallucinationDropped: number;
};

async function persistClusters(
  clusters: ClusterRow[],
  validIds: Set<number>,
): Promise<PersistOutcome> {
  // Filter the LLM's chosen ids to ones we actually fetched — guards
  // against hallucinated ids that aren't in the batch we sent.
  const filtered = filterClustersByValidSignalIdsWithStats(clusters, validIds);
  const survivors = filtered.rows;
  let created = 0;
  for (const c of survivors) {
    const inserted = await db
      .insert(trendCandidatesTable)
      .values({
        name: c.name.trim(),
        summary: c.summary.trim(),
        suggestedVerdict: c.suggestedVerdict,
        suggestedTier: c.suggestedTier,
        suggestedTemplate: c.suggestedTemplate,
        velocity: c.velocity,
        sourceCount: c.signalIds.length,
        status: "queued",
      })
      .returning({ id: trendCandidatesTable.id });
    const candidateId = inserted[0]?.id;
    if (!candidateId) continue;

    // Back-link each signal to the new candidate so the queue endpoint
    // can render the source list. We loop one update per id rather
    // than batch via `inArray` to keep the script's dependency
    // surface tiny — at <100 signals per cluster this is comfortably
    // under a second of database time.
    for (const id of c.signalIds) {
      await db
        .update(trendSignalsTable)
        .set({ candidateId })
        .where(eq(trendSignalsTable.id, id));
    }
    created += 1;
  }
  return { created, hallucinationDropped: filtered.hallucinationDropped };
}

// Persist a single `trend_cluster_runs` row summarising the night's
// pass — both the aggregate counts (so the queue endpoint can render
// a "X% rejected tonight" badge cheaply) and the per-chunk JSON
// breakdown (so an editor drilling into a noisy night can see which
// chunk went sideways). Wrapped in a try/catch because failing to
// record telemetry must never crash the actual clustering work.
//
// Returns the aggregated totals so the caller can hand them to the
// alert helper without having to recompute the sums (and without
// having to round-trip the row back out of the DB).
async function recordRun(args: {
  startedAt: Date;
  chunkStats: ClusterRunChunkStat[];
  totalCreated: number;
  chunksTotal: number;
  chunksFailed: number;
  note: string | null;
}): Promise<AlertRunSummary> {
  const modelReturnedTotal = args.chunkStats.reduce(
    (a, c) => a + c.modelReturned,
    0,
  );
  const schemaRejectedTotal = args.chunkStats.reduce(
    (a, c) => a + c.schemaRejected,
    0,
  );
  const hallucinationDroppedTotal = args.chunkStats.reduce(
    (a, c) => a + c.hallucinationDropped,
    0,
  );
  try {
    await db.insert(trendClusterRunsTable).values({
      startedAt: args.startedAt,
      finishedAt: new Date(),
      chunksTotal: args.chunksTotal,
      chunksFailed: args.chunksFailed,
      modelReturnedTotal,
      schemaRejectedTotal,
      hallucinationDroppedTotal,
      candidatesCreatedTotal: args.totalCreated,
      chunks: args.chunkStats,
      note: args.note,
    });
  } catch (err) {
    console.error("cluster: failed to record run telemetry:", err);
  }
  return {
    chunksTotal: args.chunksTotal,
    modelReturnedTotal,
    schemaRejectedTotal,
    hallucinationDroppedTotal,
    candidatesCreatedTotal: args.totalCreated,
  };
}

// Fire-and-log the rejection-rate alert. Wrapped here (not inside the
// helper) so a totally unexpected throw can't crash the nightly run —
// telemetry and alerting are observability features, not pipeline
// steps.
async function maybeAlert(summary: AlertRunSummary): Promise<void> {
  try {
    const result = await sendClusterRunAlert(summary);
    if (result.status === "sent") {
      console.log("cluster: rejection-rate alert sent");
    } else if (result.status === "skipped") {
      console.log(`cluster: rejection-rate alert skipped (${result.reason})`);
    } else {
      console.error(
        `cluster: rejection-rate alert failed: ${result.reason}`,
      );
    }
  } catch (err) {
    console.error("cluster: rejection-rate alert threw unexpectedly:", err);
  }
}

async function main(): Promise<void> {
  const startedAt = new Date();
  const signals = await loadUnclusteredSignals();
  if (signals.length === 0) {
    console.log("cluster: no unclustered signals in last 14 days; nothing to do");
    // Record the no-op row but deliberately do NOT run the alert: a
    // "no signals to cluster" night isn't actionable, and pinging
    // editors at 03:05 UTC for it would just train them to mute the
    // channel.
    await recordRun({
      startedAt,
      chunkStats: [],
      totalCreated: 0,
      chunksTotal: 0,
      chunksFailed: 0,
      note: "no_signals",
    });
    return;
  }
  const chunks = chunk(signals, SIGNALS_PER_CHUNK);
  console.log(
    `cluster: ${signals.length} signals across ${chunks.length} chunk(s) (size ${SIGNALS_PER_CHUNK})`,
  );

  // Per-chunk try/catch so one bad LLM call (rate limit, transient
  // 5xx, malformed JSON) doesn't poison the whole nightly run.
  let totalCreated = 0;
  let chunkErrors = 0;
  const chunkStats: ClusterRunChunkStat[] = [];
  for (const [i, batch] of chunks.entries()) {
    const validIds = new Set(batch.map((s) => s.id));
    try {
      const outcome = await clusterChunk(batch);
      if (outcome.rows.length === 0) {
        console.warn(
          `cluster: chunk ${i + 1}/${chunks.length}: no valid clusters (model returned ${outcome.modelReturned}, schema rejected ${outcome.schemaRejected})`,
        );
        chunkStats.push({
          index: i,
          modelReturned: outcome.modelReturned,
          schemaRejected: outcome.schemaRejected,
          hallucinationDropped: 0,
          created: 0,
          failed: false,
        });
        continue;
      }
      const persistOutcome = await persistClusters(outcome.rows, validIds);
      totalCreated += persistOutcome.created;
      chunkStats.push({
        index: i,
        modelReturned: outcome.modelReturned,
        schemaRejected: outcome.schemaRejected,
        hallucinationDropped: persistOutcome.hallucinationDropped,
        created: persistOutcome.created,
        failed: false,
      });
      console.log(
        `cluster: chunk ${i + 1}/${chunks.length}: created ${persistOutcome.created} candidate(s) from ${outcome.rows.length} cluster(s) (model returned ${outcome.modelReturned}, schema rejected ${outcome.schemaRejected}, hallucination dropped ${persistOutcome.hallucinationDropped})`,
      );
    } catch (err) {
      chunkErrors += 1;
      chunkStats.push({
        index: i,
        modelReturned: 0,
        schemaRejected: 0,
        hallucinationDropped: 0,
        created: 0,
        failed: true,
      });
      console.error(`cluster: chunk ${i + 1}/${chunks.length} failed:`, err);
      // Fall through to the next chunk.
    }
  }
  console.log(
    `cluster: done. total candidates ${totalCreated}, failed chunks ${chunkErrors}/${chunks.length}`,
  );
  const summary = await recordRun({
    startedAt,
    chunkStats,
    totalCreated,
    chunksTotal: chunks.length,
    chunksFailed: chunkErrors,
    note: null,
  });
  // Alert *after* the row is recorded so the dashboard link in the
  // alert always lines up with what the editor will see when they
  // click through.
  await maybeAlert(summary);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
