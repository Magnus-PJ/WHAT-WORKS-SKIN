/**
 * Contract test: the inverse `relatedIngredients` graph that powers
 * the "Mentioned by" / "Also paired with" section on every ingredient
 * brief preserves its semantics.
 *
 * `buildMentionedByIndex` in `src/lib/mentioned-by.ts` is the pure
 * inverse-graph builder behind the runtime `mentionedByIndex()` /
 * `getIngredientMentionedBy()` helpers in `src/lib/links.ts`. The
 * renderer in `IngredientBrief.astro` then layers a dedupe step on
 * top — any entry already shown on the curated grid above is filtered
 * out so the section reads as additive, not duplicative.
 *
 * This script exercises three contracts the live page depends on:
 *
 *   1. INVERSE-GRAPH CONTRACT — every `A → B` curated link in any
 *      brief produces a `B ← A` entry in the index for `B`.
 *
 *   2. DEDUPE-AGAINST-CURATED-GRID CONTRACT — when `A` curates `B`
 *      and `B` curates `A`, the rendered mentioned-by list for `B`
 *      (i.e. the inverse minus the curated-grid slugs) does NOT
 *      contain `A`, because `A` is already on B's curated grid above.
 *
 *   3. UNKNOWN-SLUG CONTRACT — `relatedIngredients` references that
 *      point at a pre-publish or typo'd slug with no brief are
 *      dropped from the inverse index instead of producing dead
 *      links on hub pages like niacinamide.
 *
 * Plus a few related invariants — self-link skipping, per-source
 * dedup of duplicate refs, and alphabetical sort — that future
 * refactors of the builder could otherwise silently regress.
 *
 * Run via:
 *   pnpm --filter @workspace/whatworksskin run test:mentioned-by
 *
 * Exits non-zero on any failure so it can wire into CI alongside the
 * sibling `validate:related-ingredients-symmetry` validator and the
 * `test:backlinks` contract test.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildMentionedByIndex,
  filterRenderedMentionedBy,
  type MentionedByEntry,
  type MentionedByInput,
} from "../src/lib/mentioned-by.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INGREDIENTS_DIR = path.resolve(__dirname, "../src/content/ingredients");

// ─────────────────────────────────────────────────────────────────────
// Test harness — minimal, no external deps so this stays a single
// `tsx` script like the sibling `test-backlinks.ts` contract test.
// ─────────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures: { name: string; message: string }[] = [];

function test(name: string, fn: () => void | Promise<void>): Promise<void> {
  return Promise.resolve()
    .then(() => fn())
    .then(
      () => {
        passed++;
        console.log(`  ✓ ${name}`);
      },
      (err) => {
        failed++;
        const message = err instanceof Error ? err.stack ?? err.message : String(err);
        failures.push({ name, message });
        console.log(`  ✗ ${name}`);
      },
    );
}

function expectEqual<T>(actual: T, expected: T, label: string): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`${label}\n  expected: ${e}\n  actual:   ${a}`);
  }
}

// ─────────────────────────────────────────────────────────────────────
// The dedupe-against-curated-grid step lives in `filterRenderedMentionedBy`
// (in `src/lib/mentioned-by.ts`) and is consumed verbatim by
// `IngredientBrief.astro`. Calling the same helper from the tests
// pins the renderer's exact filter behaviour — a future change to
// the filter (e.g. flipping the set semantics, swapping include/exclude)
// gets caught here instead of silently double-listing curated peers in
// the rendered "Mentioned by" grid.
// ─────────────────────────────────────────────────────────────────────

function rendered(
  entries: readonly MentionedByEntry[] | undefined,
  curatedRelatedSlugs: readonly string[],
): MentionedByEntry[] {
  return filterRenderedMentionedBy(entries, new Set(curatedRelatedSlugs));
}

// ─────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────

console.log("Mentioned-by inverse graph");

await test(
  "inverse-graph contract: every A → B curated link produces a B ← A entry",
  () => {
    const briefs: MentionedByInput[] = [
      {
        slug: "niacinamide",
        name: "Niacinamide",
        tier: "A",
        relatedIngredients: ["retinol", "ceramides"],
      },
      {
        slug: "retinol",
        name: "Retinol",
        tier: "A",
        relatedIngredients: ["bakuchiol"],
      },
      {
        slug: "ceramides",
        name: "Ceramides",
        tier: "A",
        relatedIngredients: ["panthenol"],
      },
      {
        slug: "bakuchiol",
        name: "Bakuchiol",
        tier: "B",
        relatedIngredients: ["niacinamide"],
      },
      {
        slug: "panthenol",
        name: "Panthenol",
        tier: "B",
        relatedIngredients: ["centella"],
      },
      { slug: "centella", name: "Centella", tier: "B" },
    ];
    const idx = buildMentionedByIndex(briefs);

    // Every A → B should appear as B ← A in the inverse index.
    const expected: Record<string, string[]> = {
      retinol: ["niacinamide"],
      ceramides: ["niacinamide"],
      bakuchiol: ["retinol"],
      panthenol: ["ceramides"],
      niacinamide: ["bakuchiol"],
      centella: ["panthenol"],
    };
    for (const [target, sources] of Object.entries(expected)) {
      expectEqual(
        idx.get(target)?.map((e) => e.slug) ?? [],
        sources,
        `${target} should be mentioned by ${JSON.stringify(sources)}`,
      );
    }

    // Sanity: targets with zero inbound edges are absent from the index.
    expectEqual(
      idx.has("does-not-exist"),
      false,
      "targets with no inbound edges are not present",
    );
  },
);

await test(
  "inverse-graph contract carries the source brief's name and tier through",
  () => {
    const briefs: MentionedByInput[] = [
      {
        slug: "azelaic-acid",
        name: "Azelaic acid",
        tier: "B",
        relatedIngredients: ["niacinamide"],
      },
      { slug: "niacinamide", name: "Niacinamide", tier: "A" },
    ];
    const idx = buildMentionedByIndex(briefs);
    expectEqual(
      idx.get("niacinamide"),
      [{ slug: "azelaic-acid", name: "Azelaic acid", tier: "B" }],
      "name and tier come from the source brief, not the target",
    );
  },
);

await test(
  "dedupe-against-curated-grid: A is hidden from B's rendered list when B already curates A",
  () => {
    // Mutual pair: niacinamide curates retinol AND retinol curates
    // niacinamide. The inverse index for retinol still contains
    // niacinamide (bare inverse), but the renderer's filter against
    // the curated-grid slugs MUST drop it so readers don't see the
    // same card twice.
    const briefs: MentionedByInput[] = [
      {
        slug: "niacinamide",
        name: "Niacinamide",
        tier: "A",
        relatedIngredients: ["retinol", "ceramides"],
      },
      {
        slug: "retinol",
        name: "Retinol",
        tier: "A",
        relatedIngredients: ["niacinamide", "bakuchiol"],
      },
      {
        slug: "ceramides",
        name: "Ceramides",
        tier: "A",
        relatedIngredients: ["niacinamide"],
      },
      {
        slug: "bakuchiol",
        name: "Bakuchiol",
        tier: "B",
        relatedIngredients: ["retinol"],
      },
    ];
    const idx = buildMentionedByIndex(briefs);

    // Bare inverse for retinol — both mutual peer (niacinamide) and
    // one-way mention (bakuchiol) are present.
    expectEqual(
      idx.get("retinol")?.map((e) => e.slug),
      ["bakuchiol", "niacinamide"],
      "bare inverse contains both mutual and one-way sources",
    );

    // After the renderer's dedupe against retinol's curated grid
    // (which lists niacinamide and bakuchiol), nothing remains —
    // both inverse entries are already on the curated grid.
    const retinolCurated = ["niacinamide", "bakuchiol"];
    expectEqual(
      rendered(idx.get("retinol"), retinolCurated).map((e) => e.slug),
      [],
      "rendered list excludes every slug already on the curated grid",
    );

    // For niacinamide (curated grid: retinol, ceramides) the rendered
    // list should also be empty — both sources are mutual peers.
    const niacCurated = ["retinol", "ceramides"];
    expectEqual(
      rendered(idx.get("niacinamide"), niacCurated).map((e) => e.slug),
      [],
      "mutual pairs are filtered out for the source page too",
    );

    // For bakuchiol (curated grid: retinol) the rendered list keeps
    // the one-way mention from a brief that is NOT on the curated
    // grid. (None in this fixture, so the rendered list is empty;
    // the next test exercises the keep-case explicitly.)
  },
);

await test(
  "dedupe-against-curated-grid: one-way mentions from non-curated peers are kept",
  () => {
    // Niacinamide's curated grid is reserved for its closest peers
    // (retinol, ceramides). A long tail of other briefs cite
    // niacinamide as a buffering partner — those one-way mentions
    // are exactly what the "Mentioned by" section is for.
    const briefs: MentionedByInput[] = [
      {
        slug: "niacinamide",
        name: "Niacinamide",
        tier: "A",
        relatedIngredients: ["retinol", "ceramides"],
      },
      { slug: "retinol", name: "Retinol", tier: "A" },
      { slug: "ceramides", name: "Ceramides", tier: "A" },
      {
        slug: "azelaic-acid",
        name: "Azelaic acid",
        tier: "B",
        relatedIngredients: ["niacinamide"],
      },
      {
        slug: "salicylic-acid",
        name: "Salicylic acid",
        tier: "A",
        relatedIngredients: ["niacinamide"],
      },
      {
        slug: "bakuchiol",
        name: "Bakuchiol",
        tier: "B",
        relatedIngredients: ["niacinamide"],
      },
    ];
    const idx = buildMentionedByIndex(briefs);
    const niacCurated = ["retinol", "ceramides"];
    expectEqual(
      rendered(idx.get("niacinamide"), niacCurated).map((e) => e.slug),
      ["azelaic-acid", "bakuchiol", "salicylic-acid"],
      "rendered list keeps every one-way mention from a non-curated peer",
    );
  },
);

await test(
  "unknown-slug contract: pre-publish / typo'd target slugs are dropped",
  () => {
    const briefs: MentionedByInput[] = [
      {
        slug: "niacinamide",
        name: "Niacinamide",
        tier: "A",
        // `unpublished-active` has no brief yet; `nicaniamide` is a
        // typo. Both must be dropped so the inverse index never
        // produces a dead link on a hub page.
        relatedIngredients: [
          "retinol",
          "unpublished-active",
          "nicaniamide",
        ],
      },
      { slug: "retinol", name: "Retinol", tier: "A" },
    ];
    const idx = buildMentionedByIndex(briefs);

    // The typo'd / pre-publish slugs are absent from the index.
    expectEqual(
      idx.has("unpublished-active"),
      false,
      "pre-publish slug is dropped from the inverse index",
    );
    expectEqual(
      idx.has("nicaniamide"),
      false,
      "typo'd slug is dropped from the inverse index",
    );

    // The valid slug still got its entry — the bad refs don't poison
    // the rest of the source brief's outbound edges.
    expectEqual(
      idx.get("retinol")?.map((e) => e.slug),
      ["niacinamide"],
      "valid sibling refs in the same source still produce an inverse entry",
    );
  },
);

await test("self-links (A → A) are ignored", () => {
  const briefs: MentionedByInput[] = [
    {
      slug: "retinol",
      name: "Retinol",
      tier: "A",
      // A self-link would render as a card pointing at the page the
      // reader is already on. Builder must filter it out.
      relatedIngredients: ["retinol", "bakuchiol"],
    },
    { slug: "bakuchiol", name: "Bakuchiol", tier: "B" },
  ];
  const idx = buildMentionedByIndex(briefs);
  expectEqual(
    idx.has("retinol"),
    false,
    "self-link does not land in the target's inverse list",
  );
  expectEqual(
    idx.get("bakuchiol")?.map((e) => e.slug),
    ["retinol"],
    "other refs in the same brief still produce inverse entries",
  );
});

await test("duplicate refs in a single brief contribute only once", () => {
  const briefs: MentionedByInput[] = [
    {
      slug: "niacinamide",
      name: "Niacinamide",
      tier: "A",
      // Same target twice (e.g. once as a bare slug, once as an
      // override pair). The inverse must list niacinamide once for
      // retinol, not twice.
      relatedIngredients: [
        "retinol",
        { slug: "retinol", sub: "Evening partner" },
      ],
    },
    { slug: "retinol", name: "Retinol", tier: "A" },
  ];
  const idx = buildMentionedByIndex(briefs);
  expectEqual(
    idx.get("retinol")?.map((e) => e.slug),
    ["niacinamide"],
    "duplicate ref in the same brief does not double-count",
  );
});

await test(
  "object-form refs ({ slug, sub }) participate in the inverse graph",
  () => {
    const briefs: MentionedByInput[] = [
      {
        slug: "exosomes",
        name: "Exosomes (cosmetic)",
        tier: "C",
        relatedIngredients: [
          { slug: "retinol", sub: "Comparator" },
          { slug: "peptides-signal", sub: "Comparator" },
        ],
      },
      { slug: "retinol", name: "Retinol", tier: "A" },
      { slug: "peptides-signal", name: "Signal peptides", tier: "B" },
    ];
    const idx = buildMentionedByIndex(briefs);
    expectEqual(
      idx.get("retinol")?.map((e) => e.slug),
      ["exosomes"],
      "object-form ref produces an inverse entry for retinol",
    );
    expectEqual(
      idx.get("peptides-signal")?.map((e) => e.slug),
      ["exosomes"],
      "object-form ref produces an inverse entry for peptides-signal",
    );
  },
);

await test(
  "per-target inverse list is sorted alphabetically by source name",
  () => {
    // Insertion order is intentionally not alphabetical so a missing
    // sort would surface as `["Salicylic acid", "Azelaic acid", ...]`
    // instead of the expected `["Alpha arbutin", "Azelaic acid", ...]`.
    const briefs: MentionedByInput[] = [
      {
        slug: "salicylic-acid",
        name: "Salicylic acid",
        tier: "A",
        relatedIngredients: ["niacinamide"],
      },
      {
        slug: "azelaic-acid",
        name: "Azelaic acid",
        tier: "B",
        relatedIngredients: ["niacinamide"],
      },
      {
        slug: "alpha-arbutin",
        name: "Alpha arbutin",
        tier: "B",
        relatedIngredients: ["niacinamide"],
      },
      { slug: "niacinamide", name: "Niacinamide", tier: "A" },
    ];
    const idx = buildMentionedByIndex(briefs);
    expectEqual(
      idx.get("niacinamide")?.map((e) => e.name),
      ["Alpha arbutin", "Azelaic acid", "Salicylic acid"],
      "sources sorted alphabetically by name",
    );
  },
);

await test("a brief with no relatedIngredients contributes no inverse edges", () => {
  const briefs: MentionedByInput[] = [
    { slug: "niacinamide", name: "Niacinamide", tier: "A" },
    {
      slug: "retinol",
      name: "Retinol",
      tier: "A",
      relatedIngredients: null,
    },
    { slug: "ceramides", name: "Ceramides", tier: "A" },
  ];
  const idx = buildMentionedByIndex(briefs);
  expectEqual(idx.size, 0, "no edges, no entries");
});

// ─────────────────────────────────────────────────────────────────────
// Corpus-level contracts — exercised against the real ingredient
// content collection on disk. The synthetic-fixture cases above
// pin the builder semantics; these cases pin the *promise* the live
// site makes to readers (every A→B in real briefs surfaces on B's
// hub page; mutual peers never appear twice on a brief).
//
// Loaded by reading `src/content/ingredients/*.json` directly so we
// don't have to boot Astro / `getCollection`. The runtime wrapper
// in `links.ts` flattens collection entries to the same minimal
// `MentionedByInput` shape we build here.
// ─────────────────────────────────────────────────────────────────────

type RealBrief = MentionedByInput & { file: string };

function loadRealBriefs(): RealBrief[] {
  const out: RealBrief[] = [];
  const files = fs
    .readdirSync(INGREDIENTS_DIR, { withFileTypes: true })
    .filter((d) => d.isFile() && d.name.endsWith(".json"))
    .map((d) => d.name)
    .sort();
  for (const file of files) {
    const data = JSON.parse(
      fs.readFileSync(path.join(INGREDIENTS_DIR, file), "utf8"),
    );
    if (
      typeof data?.slug !== "string" ||
      typeof data?.name !== "string" ||
      typeof data?.tier !== "string"
    ) {
      continue;
    }
    out.push({
      slug: data.slug,
      name: data.name,
      tier: data.tier as "A" | "B" | "C" | "D",
      relatedIngredients: Array.isArray(data?.relatedIngredients)
        ? data.relatedIngredients
        : null,
      file,
    });
  }
  return out;
}

console.log("\nMentioned-by inverse graph (real ingredient corpus)");

const realBriefs = loadRealBriefs();
const realBySlug = new Map(realBriefs.map((b) => [b.slug, b]));
const realIdx = buildMentionedByIndex(realBriefs);

await test(
  "real corpus: every A→B in any brief surfaces as B←A in the inverse index",
  () => {
    const violations: string[] = [];
    for (const brief of realBriefs) {
      const refs = brief.relatedIngredients ?? [];
      for (const ref of refs) {
        const targetSlug = typeof ref === "string" ? ref : ref?.slug;
        if (!targetSlug) continue;
        if (targetSlug === brief.slug) continue;
        // Pre-publish / typo targets are intentionally dropped — that
        // contract is exercised by the synthetic-fixture case above
        // and by the sibling `validate:related-ingredients-symmetry`
        // script. Skip them here so this test stays focused on the
        // inverse-mapping promise for *resolvable* targets.
        if (!realBySlug.has(targetSlug)) continue;
        const inverse = realIdx.get(targetSlug) ?? [];
        if (!inverse.some((e) => e.slug === brief.slug)) {
          violations.push(
            `${brief.slug} → ${targetSlug} (from ${brief.file}) ` +
              `is missing the B←A entry on ${targetSlug}`,
          );
        }
      }
    }
    if (violations.length > 0) {
      throw new Error(
        `${violations.length} inverse-graph violation(s):\n  - ` +
          violations.join("\n  - "),
      );
    }
  },
);

await test(
  "real corpus: mutual pairs are filtered out of every brief's rendered list",
  () => {
    const violations: string[] = [];
    for (const brief of realBriefs) {
      const curatedSlugs = new Set<string>();
      for (const ref of brief.relatedIngredients ?? []) {
        const slug = typeof ref === "string" ? ref : ref?.slug;
        if (typeof slug === "string") curatedSlugs.add(slug);
      }
      const renderedList = filterRenderedMentionedBy(
        realIdx.get(brief.slug),
        curatedSlugs,
      );
      for (const m of renderedList) {
        if (curatedSlugs.has(m.slug)) {
          violations.push(
            `${brief.slug} (${brief.file}) renders ${m.slug} in ` +
              `Mentioned-by even though it's already on the curated grid`,
          );
        }
      }
    }
    if (violations.length > 0) {
      throw new Error(
        `${violations.length} dedupe violation(s):\n  - ` +
          violations.join("\n  - "),
      );
    }
  },
);

await test(
  "real corpus: every entry in every inverse list resolves to a published brief",
  () => {
    const dead: string[] = [];
    for (const [target, entries] of realIdx) {
      if (!realBySlug.has(target)) {
        dead.push(`inverse target ${target} has no brief`);
        continue;
      }
      for (const e of entries) {
        if (!realBySlug.has(e.slug)) {
          dead.push(`${target} ← ${e.slug} (no brief for source)`);
        }
      }
    }
    if (dead.length > 0) {
      throw new Error(
        `${dead.length} dead inverse edge(s):\n  - ` + dead.join("\n  - "),
      );
    }
  },
);

// ─────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────

console.log("");
const total = passed + failed;
if (failed > 0) {
  console.error(`✗ ${failed} of ${total} mentioned-by cases failed.`);
  for (const f of failures) {
    console.error(`\n  Failure: ${f.name}`);
    console.error(
      "    " +
        f.message
          .split("\n")
          .map((l) => l)
          .join("\n    "),
    );
  }
  process.exit(1);
}
console.log(`✓ All ${total} mentioned-by cases passed.`);
