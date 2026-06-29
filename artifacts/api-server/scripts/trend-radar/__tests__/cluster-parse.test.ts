// Contract tests for the LLM clustering parser.
//
// The clustering pass (../cluster.ts) trusts the shape of an Anthropic
// JSON response. These tests pin that contract: if the model (or a
// future model swap) starts returning a different shape, or if it
// hallucinates signal ids that weren't in the batch we sent, the
// tests should turn red rather than have the script silently drop
// every cluster.
//
// Run with:  pnpm --filter @workspace/api-server run test

import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import {
  filterClustersByValidSignalIds,
  filterClustersByValidSignalIdsWithStats,
  isClusterRow,
  parseClusters,
  parseClustersWithStats,
} from "../_cluster-parse";

// A representative "good" model response covering both template
// variants ("trend-watch" and "ingredient-draft"), all four tiers we
// actually use here, and a velocity that isn't the default. If any of
// these enum values change in cluster.ts the test will fail loudly.
const FIXTURE_RESPONSE = JSON.stringify({
  clusters: [
    {
      name: "Tretinoin Sandwich Method Resurgence",
      summary:
        "Multiple subreddits and one PubMed review point to renewed interest in the 'tretinoin sandwich' application order. Evidence is mixed but consistent with reduced irritation in sensitive users.",
      suggestedVerdict: "Promising",
      suggestedTier: "B",
      suggestedTemplate: "trend-watch",
      velocity: "rising",
      signalIds: [101, 102, 103],
    },
    {
      name: "Bakuchiol As Retinol Alternative",
      summary:
        "A cluster of Reddit threads plus an FDA notice about cosmetic claims around bakuchiol. Evidence base is limited to two small RCTs but consumer interest is climbing fast and the site does not yet have an ingredient page.",
      suggestedVerdict: "Partly True",
      suggestedTier: "C",
      suggestedTemplate: "ingredient-draft",
      velocity: "steady",
      signalIds: [201, 202],
    },
  ],
});

describe("parseClusters (contract test)", () => {
  it("parses a well-formed model response into the expected ClusterRow[]", () => {
    const rows = parseClusters(FIXTURE_RESPONSE);
    assert.equal(rows.length, 2, "two clusters should survive parsing");

    const [first, second] = rows;
    assert.equal(first.name, "Tretinoin Sandwich Method Resurgence");
    assert.equal(first.suggestedVerdict, "Promising");
    assert.equal(first.suggestedTier, "B");
    assert.equal(first.suggestedTemplate, "trend-watch");
    assert.equal(first.velocity, "rising");
    assert.deepEqual(first.signalIds, [101, 102, 103]);

    assert.equal(second.suggestedTemplate, "ingredient-draft");
    assert.equal(second.suggestedVerdict, "Partly True");
    assert.deepEqual(second.signalIds, [201, 202]);
  });

  it("unwraps a ```json fenced response (Claude occasionally fences)", () => {
    const fenced = "```json\n" + FIXTURE_RESPONSE + "\n```";
    const rows = parseClusters(fenced);
    assert.equal(rows.length, 2);
  });

  it("returns [] on invalid JSON instead of throwing", () => {
    const rows = parseClusters("not json at all {");
    assert.deepEqual(rows, []);
  });

  it("returns [] when the top-level shape is not an object with `clusters: []`", () => {
    assert.deepEqual(parseClusters("[]"), []);
    assert.deepEqual(parseClusters("null"), []);
    assert.deepEqual(parseClusters('{"foo": "bar"}'), []);
    assert.deepEqual(parseClusters('{"clusters": "nope"}'), []);
  });

  it("drops malformed cluster rows but keeps the well-formed siblings", () => {
    const mixed = JSON.stringify({
      clusters: [
        // Good — survives.
        {
          name: "Tretinoin Sandwich Method Resurgence",
          summary:
            "Multiple subreddits and one PubMed review point to renewed interest in the application order, with consistent reports of reduced irritation in sensitive users.",
          suggestedVerdict: "Promising",
          suggestedTier: "B",
          suggestedTemplate: "trend-watch",
          velocity: "rising",
          signalIds: [1, 2, 3],
        },
        // Two-word name — fails the `>= 3 words` rule.
        {
          name: "Short Name",
          summary:
            "This summary is plenty long enough to satisfy the length guard, but the name is only two words so it should be dropped.",
          suggestedVerdict: "Promising",
          suggestedTier: "B",
          suggestedTemplate: "trend-watch",
          velocity: "rising",
          signalIds: [4, 5],
        },
        // Verdict not in the allowlist.
        {
          name: "Some Other Trend Name",
          summary:
            "This summary is also plenty long, but the suggestedVerdict value below is not one of the five we accept.",
          suggestedVerdict: "Maybe",
          suggestedTier: "B",
          suggestedTemplate: "trend-watch",
          velocity: "rising",
          signalIds: [6, 7],
        },
        // Template typo (older model behaviour).
        {
          name: "Niacinamide Strength Debate",
          summary:
            "Lots of chatter on whether 5 or 10 percent niacinamide is the sweet spot, with the model invoking an older template name.",
          suggestedVerdict: "Holds Up",
          suggestedTier: "A",
          suggestedTemplate: "trend_watch",
          velocity: "steady",
          signalIds: [8, 9],
        },
        // Single signal id — under MIN_SIGNALS_PER_CLUSTER.
        {
          name: "Lone Signal Trend Cluster",
          summary:
            "A summary of comfortable length, but only one signal id below — the schema requires at least two so this row should drop.",
          suggestedVerdict: "Skip",
          suggestedTier: "D",
          suggestedTemplate: "trend-watch",
          velocity: "fading",
          signalIds: [10],
        },
        // Non-integer signal id.
        {
          name: "Floaty Signal Id Cluster",
          summary:
            "A summary that is plenty long enough, but one of the signalIds is a float so the integer guard should reject the whole row.",
          suggestedVerdict: "Skip",
          suggestedTier: "D",
          suggestedTemplate: "trend-watch",
          velocity: "fading",
          signalIds: [11, 12.5],
        },
      ],
    });
    const rows = parseClusters(mixed);
    assert.equal(rows.length, 1, "only the well-formed row should survive");
    assert.equal(rows[0].name, "Tretinoin Sandwich Method Resurgence");
  });
});

describe("filterClustersByValidSignalIds (hallucination guard)", () => {
  it("strips signal ids that weren't in the batch we sent", () => {
    // We only sent 101, 102, 103 and 201 to the model, but the model
    // returned 999 (hallucinated) inside cluster #1 and 999 + 998
    // (both hallucinated) inside cluster #2.
    const clusters = parseClusters(FIXTURE_RESPONSE);
    assert.equal(clusters.length, 2);
    const withHallucinations = [
      { ...clusters[0], signalIds: [101, 102, 999] },
      { ...clusters[1], signalIds: [201, 999, 998] },
    ];
    const validIds = new Set([101, 102, 103, 201]);

    const filtered = filterClustersByValidSignalIds(withHallucinations, validIds);

    assert.equal(filtered.length, 1, "cluster #2 should drop below the floor and be removed");
    assert.deepEqual(filtered[0].signalIds, [101, 102]);
    assert.equal(filtered[0].name, "Tretinoin Sandwich Method Resurgence");
  });

  it("drops clusters whose ids were entirely hallucinated", () => {
    const clusters = parseClusters(FIXTURE_RESPONSE);
    const allFake = clusters.map((c) => ({ ...c, signalIds: [9001, 9002] }));
    const filtered = filterClustersByValidSignalIds(allFake, new Set([1, 2, 3]));
    assert.deepEqual(filtered, []);
  });

  it("keeps clusters untouched when every id is real", () => {
    const clusters = parseClusters(FIXTURE_RESPONSE);
    const validIds = new Set<number>([101, 102, 103, 201, 202]);
    const filtered = filterClustersByValidSignalIds(clusters, validIds);
    assert.equal(filtered.length, 2);
    assert.deepEqual(filtered[0].signalIds, [101, 102, 103]);
    assert.deepEqual(filtered[1].signalIds, [201, 202]);
  });
});

describe("parseClustersWithStats (telemetry contract)", () => {
  it("reports both 'returned' and 'rejected' counts on the well-formed fixture", () => {
    const stats = parseClustersWithStats(FIXTURE_RESPONSE);
    assert.equal(stats.rows.length, 2);
    assert.equal(
      stats.modelReturned,
      2,
      "model returned two clusters in the fixture",
    );
    assert.equal(
      stats.schemaRejected,
      0,
      "no clusters fail the schema in the fixture",
    );
  });

  it("counts schema rejections without dropping the well-formed siblings", () => {
    // 6 clusters in, only 1 well-formed survives → 5 schema rejects.
    const mixed = JSON.stringify({
      clusters: [
        {
          name: "Tretinoin Sandwich Method Resurgence",
          summary:
            "Multiple subreddits and one PubMed review point to renewed interest in the application order, with consistent reports of reduced irritation in sensitive users.",
          suggestedVerdict: "Promising",
          suggestedTier: "B",
          suggestedTemplate: "trend-watch",
          velocity: "rising",
          signalIds: [1, 2, 3],
        },
        { name: "Short Name", summary: "x".repeat(40), suggestedVerdict: "Promising", suggestedTier: "B", suggestedTemplate: "trend-watch", velocity: "rising", signalIds: [4, 5] },
        { name: "Some Other Trend Name", summary: "x".repeat(40), suggestedVerdict: "Maybe", suggestedTier: "B", suggestedTemplate: "trend-watch", velocity: "rising", signalIds: [6, 7] },
        { name: "Niacinamide Strength Debate", summary: "x".repeat(40), suggestedVerdict: "Holds Up", suggestedTier: "A", suggestedTemplate: "trend_watch", velocity: "steady", signalIds: [8, 9] },
        { name: "Lone Signal Trend Cluster", summary: "x".repeat(40), suggestedVerdict: "Skip", suggestedTier: "D", suggestedTemplate: "trend-watch", velocity: "fading", signalIds: [10] },
        { name: "Floaty Signal Id Cluster", summary: "x".repeat(40), suggestedVerdict: "Skip", suggestedTier: "D", suggestedTemplate: "trend-watch", velocity: "fading", signalIds: [11, 12.5] },
      ],
    });
    const stats = parseClustersWithStats(mixed);
    assert.equal(stats.rows.length, 1, "one well-formed survivor");
    assert.equal(stats.modelReturned, 6, "six clusters returned by the model");
    assert.equal(stats.schemaRejected, 5, "five rejected by schema guards");
  });

  it("zeros every count when the JSON is malformed", () => {
    const stats = parseClustersWithStats("not json at all {");
    assert.deepEqual(stats, { rows: [], modelReturned: 0, schemaRejected: 0 });
  });

  it("zeros every count when the top-level shape is wrong", () => {
    assert.deepEqual(
      parseClustersWithStats('{"foo": "bar"}'),
      { rows: [], modelReturned: 0, schemaRejected: 0 },
    );
    assert.deepEqual(
      parseClustersWithStats('{"clusters": "nope"}'),
      { rows: [], modelReturned: 0, schemaRejected: 0 },
    );
  });
});

describe("filterClustersByValidSignalIdsWithStats (telemetry contract)", () => {
  it("counts dropped clusters separately from kept ones", () => {
    const clusters = parseClusters(FIXTURE_RESPONSE);
    const withHallucinations = [
      { ...clusters[0], signalIds: [101, 102, 999] }, // keeps 2 → survives
      { ...clusters[1], signalIds: [201, 999, 998] }, // keeps 1 → drops
    ];
    const stats = filterClustersByValidSignalIdsWithStats(
      withHallucinations,
      new Set([101, 102, 103, 201]),
    );
    assert.equal(stats.rows.length, 1);
    assert.equal(stats.hallucinationDropped, 1);
  });

  it("reports zero drops when every id is real", () => {
    const clusters = parseClusters(FIXTURE_RESPONSE);
    const stats = filterClustersByValidSignalIdsWithStats(
      clusters,
      new Set([101, 102, 103, 201, 202]),
    );
    assert.equal(stats.rows.length, 2);
    assert.equal(stats.hallucinationDropped, 0);
  });

  it("counts every cluster as dropped when every id was hallucinated", () => {
    const clusters = parseClusters(FIXTURE_RESPONSE);
    const allFake = clusters.map((c) => ({ ...c, signalIds: [9001, 9002] }));
    const stats = filterClustersByValidSignalIdsWithStats(
      allFake,
      new Set([1, 2, 3]),
    );
    assert.equal(stats.rows.length, 0);
    assert.equal(stats.hallucinationDropped, 2);
  });

  it("keeps the legacy filter wrapper byte-for-byte equivalent on the rows it returns", () => {
    // Sanity check that the no-stats variant is still a thin pass-through
    // — a regression here would mean cluster.ts's old call sites would
    // start dropping (or keeping) clusters they didn't before.
    const clusters = parseClusters(FIXTURE_RESPONSE);
    const validIds = new Set([101, 102, 103, 201]);
    const legacy = filterClustersByValidSignalIds(clusters, validIds);
    const stats = filterClustersByValidSignalIdsWithStats(clusters, validIds);
    assert.deepEqual(stats.rows, legacy);
  });
});

describe("isClusterRow (direct schema guard)", () => {
  it("accepts a minimal well-formed row", () => {
    assert.equal(
      isClusterRow({
        name: "Three Word Name",
        summary:
          "A summary of comfortably more than thirty characters so the length guard is happy.",
        suggestedVerdict: "Holds Up",
        suggestedTier: "A",
        suggestedTemplate: "trend-watch",
        velocity: "rising",
        signalIds: [1, 2],
      }),
      true,
    );
  });

  it("rejects null, primitives, and arrays", () => {
    assert.equal(isClusterRow(null), false);
    assert.equal(isClusterRow(undefined), false);
    assert.equal(isClusterRow(42), false);
    assert.equal(isClusterRow("string"), false);
    assert.equal(isClusterRow([]), false);
  });
});
