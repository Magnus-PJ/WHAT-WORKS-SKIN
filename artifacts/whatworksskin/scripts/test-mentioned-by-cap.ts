/**
 * Contract test: the visible-cap on the rendered "Mentioned by" /
 * "Also paired with" grid in `IngredientBrief.astro` preserves its
 * semantics.
 *
 * The cap + split lives in `splitMentionedByForCap` (in
 * `src/lib/mentioned-by.ts`) so the renderer and this test exercise
 * the same code path. The renderer markup contract this pins:
 *
 *   • Briefs at or under the cap render every entry inline — no
 *     `mb-toggle` checkbox, no `mb-toggle-btn` label, and no
 *     `mb-overflow` items in the list.
 *   • Briefs above the cap render exactly `MENTIONED_BY_CAP` entries
 *     in the visible head (no `mb-overflow` class), the rest in the
 *     overflow tail (each tagged with `mb-overflow`), and the toggle
 *     label reads "Show all {total}" where `{total}` is the full
 *     count after the curated-grid dedupe — not the cap, and not
 *     the overflow length.
 *
 * Synthetic fixture: one over-cap hub (`hub-over`) with cap+5 inverse
 * mentions, one at-cap hub (`hub-at`) with exactly cap inverse
 * mentions, and one under-cap hub (`hub-under`) with cap-3 inverse
 * mentions. Each is fed through `buildMentionedByIndex` so the test
 * exercises the same inverse-graph → cap-split pipeline the live
 * page uses.
 *
 * Run via:
 *   pnpm --filter @workspace/whatworksskin run test:mentioned-by-cap
 *
 * Exits non-zero on any failure so it can wire into CI alongside
 * `test:mentioned-by` and the sibling renderer-contract tests.
 */

import {
  MENTIONED_BY_CAP,
  buildMentionedByIndex,
  splitMentionedByForCap,
  type MentionedByEntry,
  type MentionedByInput,
} from "../src/lib/mentioned-by.ts";

let passed = 0;
let failed = 0;
const failures: { name: string; message: string }[] = [];

function test(name: string, fn: () => void): void {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    const message = err instanceof Error ? err.stack ?? err.message : String(err);
    failures.push({ name, message });
    console.log(`  ✗ ${name}`);
  }
}

function expectEqual<T>(actual: T, expected: T, label: string): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`${label}\n  expected: ${e}\n  actual:   ${a}`);
  }
}

// ─────────────────────────────────────────────────────────────────────
// Fixture builder — one hub at each side of the cap, fed sources
// whose names sort alphabetically so the resulting inverse list has
// a deterministic order. `pad3` keeps the alphabetical sort matching
// numeric order for any cap below 1000.
// ─────────────────────────────────────────────────────────────────────

function pad3(n: number): string {
  return String(n).padStart(3, "0");
}

function makeCorpus(targetSlug: string, nSources: number): MentionedByInput[] {
  const target: MentionedByInput = {
    slug: targetSlug,
    name: targetSlug.replace(/-/g, " "),
    tier: "A",
  };
  const sources: MentionedByInput[] = [];
  for (let i = 1; i <= nSources; i++) {
    sources.push({
      slug: `src-${pad3(i)}`,
      name: `Source ${pad3(i)}`,
      tier: "B",
      relatedIngredients: [targetSlug],
    });
  }
  return [target, ...sources];
}

function inverseFor(target: string, briefs: MentionedByInput[]): MentionedByEntry[] {
  const idx = buildMentionedByIndex(briefs);
  return idx.get(target) ?? [];
}

// ─────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────

console.log(`Mentioned-by visible cap (MENTIONED_BY_CAP = ${MENTIONED_BY_CAP})`);

test("cap is a positive integer (sanity)", () => {
  if (!Number.isInteger(MENTIONED_BY_CAP) || MENTIONED_BY_CAP <= 0) {
    throw new Error(
      `MENTIONED_BY_CAP must be a positive integer, got ${MENTIONED_BY_CAP}`,
    );
  }
});

test("under-cap brief: every entry visible, no overflow, no toggle", () => {
  const under = MENTIONED_BY_CAP - 3;
  const entries = inverseFor("hub-under", makeCorpus("hub-under", under));
  expectEqual(entries.length, under, "fixture sanity: inverse count = sources");

  const split = splitMentionedByForCap(entries);
  expectEqual(split.total, under, "total reflects full inverse count");
  expectEqual(split.visible.length, under, "every entry sits in the visible head");
  expectEqual(split.overflow.length, 0, "overflow tail is empty");
  expectEqual(split.hasOverflow, false, "no toggle (mb-toggle / mb-toggle-btn)");
});

test("at-cap brief: exactly cap visible, no overflow, no toggle", () => {
  const entries = inverseFor("hub-at", makeCorpus("hub-at", MENTIONED_BY_CAP));
  expectEqual(entries.length, MENTIONED_BY_CAP, "fixture sanity");

  const split = splitMentionedByForCap(entries);
  expectEqual(split.total, MENTIONED_BY_CAP, "total = cap");
  expectEqual(split.visible.length, MENTIONED_BY_CAP, "visible head fills the cap");
  expectEqual(split.overflow.length, 0, "no overflow at the cap boundary");
  expectEqual(split.hasOverflow, false, "no toggle is emitted at the boundary");
});

test("over-cap brief: cap visible, rest overflow, toggle label = 'Show all {total}'", () => {
  const extra = 5;
  const total = MENTIONED_BY_CAP + extra;
  const entries = inverseFor("hub-over", makeCorpus("hub-over", total));
  expectEqual(entries.length, total, "fixture sanity");

  const split = splitMentionedByForCap(entries);
  expectEqual(split.total, total, "total reflects full inverse count");
  expectEqual(
    split.visible.length,
    MENTIONED_BY_CAP,
    "exactly MENTIONED_BY_CAP entries in the visible head",
  );
  expectEqual(
    split.overflow.length,
    extra,
    "everything past the cap lands in the overflow tail",
  );
  expectEqual(split.hasOverflow, true, "mb-toggle + mb-toggle-btn are emitted");
  expectEqual(
    split.toggleLabel,
    `Show all ${total}`,
    "toggle label uses the full total, not the overflow length or the cap",
  );

  // Ordering contract: the visible head is the alphabetical prefix
  // of the full sorted inverse list, and the overflow is the suffix —
  // i.e. the cap is a slice, not a re-bucket. A future refactor that
  // swapped the slice for tier-bucketed selection would surface here.
  expectEqual(
    split.visible.map((e) => e.slug),
    entries.slice(0, MENTIONED_BY_CAP).map((e) => e.slug),
    "visible head = alphabetical prefix of the full inverse list",
  );
  expectEqual(
    split.overflow.map((e) => e.slug),
    entries.slice(MENTIONED_BY_CAP).map((e) => e.slug),
    "overflow tail = alphabetical suffix of the full inverse list",
  );

  // Disjoint-and-complete: no entry is shown twice, none is dropped.
  const visibleSlugs = new Set(split.visible.map((e) => e.slug));
  const overflowSlugs = new Set(split.overflow.map((e) => e.slug));
  for (const s of visibleSlugs) {
    if (overflowSlugs.has(s)) {
      throw new Error(`slug ${s} appears in both visible and overflow`);
    }
  }
  const union = new Set<string>([...visibleSlugs, ...overflowSlugs]);
  expectEqual(
    union.size,
    total,
    "visible ∪ overflow covers every inverse entry exactly once",
  );
});

test("just-over-cap brief (cap+1): cap visible, single overflow entry, toggle present", () => {
  const total = MENTIONED_BY_CAP + 1;
  const entries = inverseFor("hub-edge", makeCorpus("hub-edge", total));
  const split = splitMentionedByForCap(entries);

  expectEqual(split.visible.length, MENTIONED_BY_CAP, "cap entries visible");
  expectEqual(split.overflow.length, 1, "exactly one overflow entry at cap+1");
  expectEqual(split.hasOverflow, true, "the off-by-one boundary still emits the toggle");
  expectEqual(
    split.toggleLabel,
    `Show all ${total}`,
    "label still uses the full total at cap+1",
  );
});

test("empty inverse list: nothing visible, no overflow, no toggle", () => {
  const split = splitMentionedByForCap([]);
  expectEqual(split.total, 0, "total = 0");
  expectEqual(split.visible.length, 0, "no visible entries");
  expectEqual(split.overflow.length, 0, "no overflow entries");
  expectEqual(split.hasOverflow, false, "no toggle when there are no mentions");
});

// ─────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────

console.log("");
const total = passed + failed;
if (failed > 0) {
  console.error(`✗ ${failed} of ${total} mentioned-by-cap cases failed.`);
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
console.log(`✓ All ${total} mentioned-by-cap cases passed.`);
