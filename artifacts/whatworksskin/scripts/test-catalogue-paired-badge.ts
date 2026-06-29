/**
 * Contract test: the catalogue index's per-card "Paired in N briefs"
 * caption is wired to the same inverse `relatedIngredients` index
 * (`buildMentionedByIndex`) that powers the brief's "Mentioned by"
 * section, with the gating rules the live page bakes into its badge:
 *
 *   1. OMIT-WHEN-ZERO contract — a brief with zero inbound mentions
 *      renders no badge at all (not "Paired in 0 briefs"). The badge
 *      is reserved for hubs that actually have inbound coverage; a
 *      "0" tag would just be visual noise on brand-new briefs.
 *
 *   2. COUNT-EQUALS-INVERSE-INDEX-LENGTH contract — when a badge IS
 *      rendered, the number on the badge equals the inverse index's
 *      length for that slug exactly. (No filtering, no de-dup against
 *      the curated grid — the catalogue card has no curated grid to
 *      dedupe against, unlike the brief itself.)
 *
 *   3. SINGULAR-WORDING contract — the count-of-1 case reads
 *      "Paired in 1 brief", NOT "Paired in 1 briefs". Easy to regress
 *      on a future template edit because Astro's templating doesn't
 *      flag English-grammar mistakes.
 *
 * The badge gating itself lives in the pure `buildPairedBadge` helper
 * in `src/lib/catalogue-paired-badge.ts`, which is consumed verbatim
 * by `src/pages/ingredients/index.astro`. This test imports and calls
 * the SAME helper — so a future change to the helper (e.g. flipping
 * the singular wording or starting to render "0" badges) gets caught
 * here, and a template-side regression that swaps the helper out for
 * inline logic gets caught by code review at the import site.
 *
 * Run via:
 *   pnpm --filter @workspace/whatworksskin run test:catalogue-paired-badge
 *
 * Exits non-zero on any failure so it can wire into CI alongside the
 * sibling `test:mentioned-by` and `test:backlinks` contract tests.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildMentionedByIndex,
  type MentionedByInput,
} from "../src/lib/mentioned-by.ts";
import { buildPairedBadge } from "../src/lib/catalogue-paired-badge.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INGREDIENTS_DIR = path.resolve(__dirname, "../src/content/ingredients");

// ─────────────────────────────────────────────────────────────────────
// Test harness — minimal, no external deps so this stays a single
// `tsx` script like the sibling `test-mentioned-by.ts` contract test.
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
// Render-template guard — the whole point of the contract is that the
// catalogue's `index.astro` consumes the SAME `buildPairedBadge`
// helper this test exercises. If a future refactor inlines the gating
// back into the template, the helper-based assertions below would
// still pass while the live page silently regresses. This guard
// pins the import so that drift fails the test instead.
// ─────────────────────────────────────────────────────────────────────

const INDEX_ASTRO = path.resolve(
  __dirname,
  "../src/pages/ingredients/index.astro",
);

console.log("Catalogue 'Paired in N briefs' badge");

await test(
  "render-template guard: index.astro imports and calls buildPairedBadge",
  () => {
    const src = fs.readFileSync(INDEX_ASTRO, "utf8");
    const importsHelper = /from\s+["']@\/lib\/catalogue-paired-badge["']/.test(
      src,
    );
    const callsHelper = /buildPairedBadge\s*\(/.test(src);
    if (!importsHelper) {
      throw new Error(
        `src/pages/ingredients/index.astro must import buildPairedBadge ` +
          `from "@/lib/catalogue-paired-badge" so the rendered badge ` +
          `goes through the same helper this contract test exercises.`,
      );
    }
    if (!callsHelper) {
      throw new Error(
        `src/pages/ingredients/index.astro imports buildPairedBadge ` +
          `but never calls it. The badge gating must be delegated to ` +
          `the helper, not duplicated inline.`,
      );
    }
  },
);

// ─────────────────────────────────────────────────────────────────────
// Synthetic-fixture cases — exercise the shared `buildPairedBadge`
// helper directly. These are the same code path the Astro template
// invokes, so a regression here is a regression on the rendered page.
// ─────────────────────────────────────────────────────────────────────

await test("badge is omitted entirely when count is 0", () => {
  expectEqual(
    buildPairedBadge(0),
    null,
    "count of 0 must omit the badge (no 'Paired in 0 briefs')",
  );
});

await test("badge uses singular noun for count of 1", () => {
  const badge = buildPairedBadge(1);
  expectEqual(badge?.count, 1, "count echoed back unchanged");
  expectEqual(
    badge?.noun,
    "brief",
    "noun must be singular 'brief' for count of 1",
  );
  expectEqual(
    badge?.label,
    "Paired in 1 brief",
    "aria-label must read 'Paired in 1 brief' (singular)",
  );
});

await test("badge uses plural noun for counts > 1", () => {
  for (const n of [2, 7, 42]) {
    const badge = buildPairedBadge(n);
    expectEqual(badge?.count, n, `count of ${n} echoed back unchanged`);
    expectEqual(
      badge?.noun,
      "briefs",
      `noun must be plural 'briefs' for count of ${n}`,
    );
    expectEqual(
      badge?.label,
      `Paired in ${n} briefs`,
      `aria-label must read 'Paired in ${n} briefs'`,
    );
  }
});

await test("negative counts (defensive) also omit the badge", () => {
  // The catalogue currently can't pass a negative count (it comes from
  // `Map.get(...) ?? 0`), but the helper must still gate it cleanly so
  // a future caller that forgets `?? 0` doesn't render "Paired in -1".
  expectEqual(buildPairedBadge(-1), null, "count of -1 must omit the badge");
});

// ─────────────────────────────────────────────────────────────────────
// Corpus-level contracts — exercised against the real ingredient
// content collection on disk, the same data the live catalogue card
// consumes via `getCollection("ingredients")` + `getIngredientMentionedBy`.
// Each assertion drives the SAME `buildPairedBadge` helper the page
// renders from, so a helper-side regression surfaces here.
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

console.log("\nCatalogue badge against the real ingredient corpus");

const realBriefs = loadRealBriefs();
const realIdx = buildMentionedByIndex(realBriefs);

await test(
  "real corpus: every published slug with ≥1 inbound mention renders a badge whose count equals the inverse-index length",
  () => {
    const violations: string[] = [];
    for (const brief of realBriefs) {
      const inverseLen = (realIdx.get(brief.slug) ?? []).length;
      if (inverseLen === 0) continue;
      const badge = buildPairedBadge(inverseLen);
      if (badge === null) {
        violations.push(
          `${brief.slug} (${brief.file}) has ${inverseLen} inbound ` +
            `mention(s) but the helper omitted the badge`,
        );
        continue;
      }
      if (badge.count !== inverseLen) {
        violations.push(
          `${brief.slug} (${brief.file}): badge count is ${badge.count}, ` +
            `expected ${inverseLen} (inverse-index length)`,
        );
      }
      const expectedNoun = inverseLen === 1 ? "brief" : "briefs";
      if (badge.noun !== expectedNoun) {
        violations.push(
          `${brief.slug} (${brief.file}): badge noun is '${badge.noun}', ` +
            `expected '${expectedNoun}' for count ${inverseLen}`,
        );
      }
    }
    if (violations.length > 0) {
      throw new Error(
        `${violations.length} badge-count violation(s):\n  - ` +
          violations.join("\n  - "),
      );
    }
  },
);

await test(
  "real corpus: every published slug with 0 inbound mentions renders no badge at all",
  () => {
    const violations: string[] = [];
    for (const brief of realBriefs) {
      const inverseLen = (realIdx.get(brief.slug) ?? []).length;
      if (inverseLen !== 0) continue;
      const badge = buildPairedBadge(inverseLen);
      if (badge !== null) {
        violations.push(
          `${brief.slug} (${brief.file}) has 0 inbound mentions but ` +
            `the helper rendered ${JSON.stringify(badge)}`,
        );
      }
    }
    if (violations.length > 0) {
      throw new Error(
        `${violations.length} omit-when-zero violation(s):\n  - ` +
          violations.join("\n  - "),
      );
    }
  },
);

await test(
  "real corpus: any published slug with exactly 1 inbound mention reads 'Paired in 1 brief' (singular)",
  () => {
    const violations: string[] = [];
    let oneCount = 0;
    for (const brief of realBriefs) {
      const inverseLen = (realIdx.get(brief.slug) ?? []).length;
      if (inverseLen !== 1) continue;
      oneCount++;
      const badge = buildPairedBadge(inverseLen);
      if (badge?.label !== "Paired in 1 brief") {
        violations.push(
          `${brief.slug} (${brief.file}): expected label 'Paired in 1 brief', ` +
            `got ${JSON.stringify(badge?.label)}`,
        );
      }
      if (badge?.noun !== "brief") {
        violations.push(
          `${brief.slug} (${brief.file}): expected noun 'brief', ` +
            `got ${JSON.stringify(badge?.noun)}`,
        );
      }
    }
    if (violations.length > 0) {
      throw new Error(
        `${violations.length} singular-wording violation(s):\n  - ` +
          violations.join("\n  - "),
      );
    }
    // Diagnostic only: not a failure if the real corpus happens to
    // have no count-of-1 case at the moment. The synthetic-fixture
    // case above keeps the singular wording pinned even then.
    console.log(
      `    (corpus had ${oneCount} ingredient(s) with exactly 1 inbound mention)`,
    );
  },
);

// ─────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────

console.log("");
const total = passed + failed;
if (failed > 0) {
  console.error(`✗ ${failed} of ${total} catalogue-paired-badge cases failed.`);
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
console.log(`✓ All ${total} catalogue-paired-badge cases passed.`);
