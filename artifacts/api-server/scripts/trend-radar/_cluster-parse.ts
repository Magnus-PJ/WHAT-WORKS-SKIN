// Pure parsing + validation helpers for the LLM clustering pass.
//
// Lives in its own module (no DB / no Anthropic SDK imports) so that
// the contract tests under `__tests__/` can exercise the schema
// guards directly without needing a database or network.

export const VERDICTS = [
  "Holds Up",
  "Promising",
  "Partly True",
  "Misleading",
  "Skip",
] as const;
export const TIERS = ["A", "B", "C", "D"] as const;
export const TEMPLATES = ["trend-watch", "ingredient-draft"] as const;
export const VELOCITIES = ["rising", "steady", "fading"] as const;

export const MIN_SIGNALS_PER_CLUSTER = 2;

export type ClusterRow = {
  name: string;
  summary: string;
  suggestedVerdict: (typeof VERDICTS)[number];
  suggestedTier: (typeof TIERS)[number];
  suggestedTemplate: (typeof TEMPLATES)[number];
  velocity: (typeof VELOCITIES)[number];
  signalIds: number[];
};

export function isClusterRow(v: unknown): v is ClusterRow {
  if (!v || typeof v !== "object") return false;
  const r = v as Record<string, unknown>;
  if (typeof r.name !== "string" || r.name.trim().split(/\s+/).length < 3) return false;
  if (typeof r.summary !== "string" || r.summary.length < 30) return false;
  if (!VERDICTS.includes(r.suggestedVerdict as (typeof VERDICTS)[number])) return false;
  if (!TIERS.includes(r.suggestedTier as (typeof TIERS)[number])) return false;
  if (!TEMPLATES.includes(r.suggestedTemplate as (typeof TEMPLATES)[number])) return false;
  if (!VELOCITIES.includes(r.velocity as (typeof VELOCITIES)[number])) return false;
  if (!Array.isArray(r.signalIds) || r.signalIds.length < MIN_SIGNALS_PER_CLUSTER) return false;
  if (!r.signalIds.every((n: unknown) => typeof n === "number" && Number.isInteger(n))) return false;
  return true;
}

// Coerce the LLM response into a `ClusterRow[]`. We accept either a raw
// JSON object or one wrapped in a ```json fence (Claude occasionally
// adds one despite the prompt).
export function parseClusters(raw: string): ClusterRow[] {
  return parseClustersWithStats(raw).rows;
}

export type ParseClustersStats = {
  rows: ClusterRow[];
  // Total clusters the model returned in `clusters: [...]` (after
  // JSON parsing, before any schema filtering).
  modelReturned: number;
  // Clusters that failed `isClusterRow` (bad verdict / tier / template,
  // short name, single signal, non-integer ids, …).
  schemaRejected: number;
};

// Same parser, but exposes the counts callers (cluster.ts) need to
// store per-run telemetry. The plain `parseClusters` above stays as a
// thin wrapper so the public contract / existing tests don't need to
// change.
export function parseClustersWithStats(raw: string): ParseClustersStats {
  const trimmed = raw.trim();
  const unfenced = trimmed
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(unfenced);
  } catch (err) {
    console.error("cluster: failed to parse JSON from model:", err);
    console.error("raw:", raw.slice(0, 500));
    return { rows: [], modelReturned: 0, schemaRejected: 0 };
  }
  if (!parsed || typeof parsed !== "object") {
    return { rows: [], modelReturned: 0, schemaRejected: 0 };
  }
  const arr = (parsed as { clusters?: unknown }).clusters;
  if (!Array.isArray(arr)) {
    return { rows: [], modelReturned: 0, schemaRejected: 0 };
  }
  const rows = arr.filter(isClusterRow);
  return {
    rows,
    modelReturned: arr.length,
    schemaRejected: arr.length - rows.length,
  };
}

// Drop any signal ids the LLM produced that weren't in the batch we
// sent (hallucinations), and then drop any clusters that fall below
// the minimum signal count. This is the second half of the contract:
// even a perfectly-shaped cluster row must reference real ids.
export function filterClustersByValidSignalIds(
  clusters: ClusterRow[],
  validIds: ReadonlySet<number>,
): ClusterRow[] {
  return filterClustersByValidSignalIdsWithStats(clusters, validIds).rows;
}

export type FilterClustersStats = {
  rows: ClusterRow[];
  // Clusters that survived schema parsing but were dropped here
  // because the model invented signal ids and the cluster fell below
  // the min-signals floor after filtering them out.
  hallucinationDropped: number;
};

// Stats-bearing variant. Returned alongside the surviving rows so the
// nightly run can record how often the hallucination guard fires —
// editors looking at a quiet queue need to know whether the model is
// returning few clusters or returning many that we then throw away.
export function filterClustersByValidSignalIdsWithStats(
  clusters: ClusterRow[],
  validIds: ReadonlySet<number>,
): FilterClustersStats {
  const out: ClusterRow[] = [];
  let dropped = 0;
  for (const c of clusters) {
    const ids = c.signalIds.filter((id) => validIds.has(id));
    if (ids.length < MIN_SIGNALS_PER_CLUSTER) {
      dropped += 1;
      continue;
    }
    out.push({ ...c, signalIds: ids });
  }
  return { rows: out, hallucinationDropped: dropped };
}
