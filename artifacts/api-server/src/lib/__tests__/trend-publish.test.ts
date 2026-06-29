// Contract tests for the Trend Radar publish helper.
//
// `trend-publish.ts` is the on-disk side of the approval flow: it
// allocates the next `issue-NNN` slug for trend-watch entries, writes
// the JSON payload into the Astro content collection inside a
// developer-controlled checkout, and (for ingredient drafts) suffixes
// duplicate slugs so two parallel approvals can't clobber each other.
// The companion GitHub-sync helper is covered by `trend-sync.test.ts`.
//
// We cover:
//   1. The pure status → path / status → template helpers.
//   2. `findRepoRoot` walking up from a nested cwd.
//   3. `publishTrendWatchIssue` happy path (fresh dir, allocates
//      issue-001, writes the documented JSON shape).
//   4. `publishTrendWatchIssue` slug allocation when prior issues exist
//      on disk (highest existing → +1).
//   5. `publishTrendWatchIssue` EEXIST retry (writeFile fails once with
//      EEXIST → next slug is taken).
//   6. `publishTrendWatchIssue` non-EEXIST write failure propagates as
//      a thrown error (no slug-eating retry loop).
//   7. `publishIngredientDraft` happy path (slugifies the name, writes
//      under `_drafts/`).
//   8. `publishIngredientDraft` slug-suffix retry when the base slug
//      already exists on disk.
//
// Run with:  pnpm --filter @workspace/api-server run test

import { strict as assert } from "node:assert";
import * as fsModule from "node:fs";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";

import {
  findRepoRoot,
  publishedPathForApproved,
  publishIngredientDraft,
  publishTrendWatchIssue,
  templateForApprovedStatus,
} from "../trend-publish";

// Mirror the constants the helper uses internally so the tests can
// assert against the canonical paths without re-exporting them.
const COLLECTION_ROOT = "artifacts/whatworksskin/src/content";
const TREND_WATCH_DIR = `${COLLECTION_ROOT}/trend-watch`;
const INGREDIENT_DRAFTS_DIR = `${COLLECTION_ROOT}/ingredients/_drafts`;

let tmpRoot = "";
let savedCwd = "";
let savedWriteFile: typeof fsModule.promises.writeFile | undefined;

beforeEach(async () => {
  savedCwd = process.cwd();
  tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), "trend-publish-test-"));
  // `findRepoRoot` looks for `<root>/artifacts/whatworksskin/src/content`,
  // so seed that structure (plus the trend-watch dir which the helper
  // reads with `readdir` to find the highest existing issue).
  await fs.mkdir(path.join(tmpRoot, TREND_WATCH_DIR), { recursive: true });
  await fs.mkdir(path.join(tmpRoot, INGREDIENT_DRAFTS_DIR), { recursive: true });
  // Resolve to the canonical path so later string-equality checks line
  // up (on macOS `mkdtemp` returns `/var/folders/...` which `chdir`
  // resolves to `/private/var/folders/...`).
  const realRoot = await fs.realpath(tmpRoot);
  tmpRoot = realRoot;
  process.chdir(realRoot);
});

afterEach(async () => {
  process.chdir(savedCwd);
  // If a test monkey-patched `fs.promises.writeFile`, restore it so
  // later tests (and `fs.rm` below) get the real implementation back.
  if (savedWriteFile) {
    fsModule.promises.writeFile = savedWriteFile;
    savedWriteFile = undefined;
  }
  await fs.rm(tmpRoot, { recursive: true, force: true });
});

describe("publishedPathForApproved", () => {
  it("maps approved-trendwatch to the trend-watch collection dir", () => {
    assert.equal(
      publishedPathForApproved("approved-trendwatch", "issue-014"),
      `${TREND_WATCH_DIR}/issue-014.json`,
    );
  });

  it("maps approved-draft to the ingredients/_drafts dir", () => {
    assert.equal(
      publishedPathForApproved("approved-draft", "bakuchiol"),
      `${INGREDIENT_DRAFTS_DIR}/bakuchiol.json`,
    );
  });
});

describe("templateForApprovedStatus", () => {
  it("maps approved-trendwatch → trend-watch", () => {
    assert.equal(templateForApprovedStatus("approved-trendwatch"), "trend-watch");
  });

  it("maps approved-draft → ingredient-draft", () => {
    assert.equal(templateForApprovedStatus("approved-draft"), "ingredient-draft");
  });
});

describe("findRepoRoot", () => {
  it("walks up from a nested cwd until it finds the content collection", async () => {
    // Create a deeper start dir to prove the walk-up logic works
    // (the helper allows up to 6 levels of ascent).
    const nested = path.join(tmpRoot, "artifacts", "api-server", "dist");
    await fs.mkdir(nested, { recursive: true });
    process.chdir(nested);

    const root = await findRepoRoot();
    assert.equal(root, tmpRoot);
  });

  it("throws a helpful error when the content collection is not found", async () => {
    // chdir somewhere with no `artifacts/whatworksskin/...` above it.
    const isolated = await fs.mkdtemp(path.join(os.tmpdir(), "trend-publish-no-root-"));
    try {
      process.chdir(isolated);
      await assert.rejects(findRepoRoot(), /could not locate/);
    } finally {
      process.chdir(savedCwd);
      await fs.rm(isolated, { recursive: true, force: true });
    }
  });
});

describe("publishTrendWatchIssue (happy path)", () => {
  it("allocates issue-001 in an empty dir and writes the documented JSON shape", async () => {
    const result = await publishTrendWatchIssue({
      headline: "The peptide pivot",
      dek: "What we make of the new copper-peptide hype.",
      verdict: {
        name: "Copper peptides",
        verdict: "Promising, with caveats",
        tier: "watch",
        body: "Body copy.",
        bottom: "Bottom line.",
      },
    });

    assert.equal(result.publishedSlug, "issue-001");
    assert.equal(result.publishedPath, `${TREND_WATCH_DIR}/issue-001.json`);

    const written = await fs.readFile(
      path.join(tmpRoot, result.publishedPath),
      "utf8",
    );
    // Files are written with a trailing newline for clean Git diffs.
    assert.ok(written.endsWith("\n"), "expected trailing newline");

    const parsed = JSON.parse(written);
    assert.equal(parsed.slug, "issue-001");
    assert.equal(parsed.n, 1);
    assert.equal(parsed.headline, "The peptide pivot");
    assert.equal(parsed.dek, "What we make of the new copper-peptide hype.");
    assert.equal(parsed.signed, "Dr. Paul + Dr. Sundeep");
    assert.equal(parsed.pageRef, "P. 001");
    assert.match(parsed.eyebrow, /^Trend Watch · Issue 001 · /);
    assert.equal(parsed.verdicts.length, 1);
    assert.deepEqual(parsed.verdicts[0], {
      n: "01",
      name: "Copper peptides",
      tier: "watch",
      verdict: "Promising, with caveats",
      color: "",
      body: "Body copy.",
      bottom: "Bottom line.",
    });

    // Year stamp matches the date stamp the helper computed.
    assert.equal(typeof parsed.year, "number");
    assert.match(parsed.date, new RegExp(`${parsed.year}$`));
  });

  it("defaults optional verdict fields to empty strings", async () => {
    const result = await publishTrendWatchIssue({
      headline: "h",
      dek: "d",
      verdict: { name: "Bare verdict", verdict: "Skip" },
    });
    const parsed = JSON.parse(
      await fs.readFile(path.join(tmpRoot, result.publishedPath), "utf8"),
    );
    assert.equal(parsed.verdicts[0].tier, "");
    assert.equal(parsed.verdicts[0].body, "");
    assert.equal(parsed.verdicts[0].bottom, "");
  });
});

describe("publishTrendWatchIssue (slug allocation)", () => {
  it("picks the next slug after the highest existing issue-NNN", async () => {
    // Pre-seed three prior issues; helper should land on issue-008.
    for (const n of ["001", "003", "007"]) {
      await fs.writeFile(
        path.join(tmpRoot, TREND_WATCH_DIR, `issue-${n}.json`),
        "{}\n",
        "utf8",
      );
    }
    // Also drop a non-issue file to confirm the regex filter ignores it.
    await fs.writeFile(
      path.join(tmpRoot, TREND_WATCH_DIR, "README.md"),
      "noise",
      "utf8",
    );

    const result = await publishTrendWatchIssue({
      headline: "h",
      dek: "d",
      verdict: { name: "n", verdict: "v" },
    });
    assert.equal(result.publishedSlug, "issue-008");
    assert.equal(result.publishedPath, `${TREND_WATCH_DIR}/issue-008.json`);
  });

  it("retries to the next slug when the first wx write throws EEXIST", async () => {
    // Simulate a race: between `highestIssueNumber` and the wx write,
    // another process landed `issue-001.json`. The helper should catch
    // EEXIST, advance to issue-002, and write that instead.
    savedWriteFile = fsModule.promises.writeFile;
    let calls = 0;
    fsModule.promises.writeFile = (async (
      ...args: Parameters<typeof fsModule.promises.writeFile>
    ) => {
      calls += 1;
      if (calls === 1) {
        const err = new Error("file exists") as NodeJS.ErrnoException;
        err.code = "EEXIST";
        throw err;
      }
      return savedWriteFile!(...args);
    }) as typeof fsModule.promises.writeFile;

    const result = await publishTrendWatchIssue({
      headline: "h",
      dek: "d",
      verdict: { name: "n", verdict: "v" },
    });
    assert.equal(calls, 2);
    assert.equal(result.publishedSlug, "issue-002");
    // The actually-written file is issue-002 (the EEXIST attempt was
    // intercepted before any bytes hit disk).
    const onDisk = await fs.readdir(path.join(tmpRoot, TREND_WATCH_DIR));
    assert.deepEqual(onDisk.sort(), ["issue-002.json"]);
  });
});

describe("publishTrendWatchIssue (write failure)", () => {
  it("propagates non-EEXIST writeFile errors instead of retrying", async () => {
    savedWriteFile = fsModule.promises.writeFile;
    let calls = 0;
    fsModule.promises.writeFile = (async () => {
      calls += 1;
      const err = new Error("disk full") as NodeJS.ErrnoException;
      err.code = "ENOSPC";
      throw err;
    }) as typeof fsModule.promises.writeFile;

    await assert.rejects(
      publishTrendWatchIssue({
        headline: "h",
        dek: "d",
        verdict: { name: "n", verdict: "v" },
      }),
      /disk full/,
    );
    // Crucially, the helper should NOT have burned through the retry
    // budget on a non-EEXIST error — exactly one writeFile attempt.
    assert.equal(calls, 1);
  });
});

describe("publishIngredientDraft (happy path)", () => {
  it("slugifies the name and writes under ingredients/_drafts/", async () => {
    const result = await publishIngredientDraft({
      name: "Bakuchiol (Plant Retinol!)",
      summary: "A gentler retinol alternative.",
      verdict: "Promising",
      tier: "watch",
      bottom: "Worth a look.",
    });
    assert.equal(result.publishedSlug, "bakuchiol-plant-retinol");
    assert.equal(
      result.publishedPath,
      `${INGREDIENT_DRAFTS_DIR}/bakuchiol-plant-retinol.json`,
    );

    const parsed = JSON.parse(
      await fs.readFile(path.join(tmpRoot, result.publishedPath), "utf8"),
    );
    assert.equal(parsed.slug, "bakuchiol-plant-retinol");
    assert.equal(parsed.name, "Bakuchiol (Plant Retinol!)");
    assert.equal(parsed.summary, "A gentler retinol alternative.");
    assert.equal(parsed.verdict, "Promising");
    assert.equal(parsed.tier, "watch");
    assert.equal(parsed.bottom, "Worth a look.");
    assert.equal(parsed.status, "draft");
    assert.equal(parsed.suggestedBy, "trend-radar");
    // ISO timestamp shape: 2026-05-02T12:34:56.789Z
    assert.match(parsed.createdAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it("creates the _drafts directory on demand", async () => {
    // Remove the seeded drafts dir to confirm the helper recreates it
    // (the trend-watch helper relies on the dir existing because it
    // readdirs first; the ingredient helper explicitly mkdirs).
    await fs.rm(path.join(tmpRoot, INGREDIENT_DRAFTS_DIR), {
      recursive: true,
      force: true,
    });
    const result = await publishIngredientDraft({
      name: "Polyglutamic Acid",
      summary: "s",
      verdict: "v",
      tier: "t",
    });
    assert.equal(result.publishedSlug, "polyglutamic-acid");
    const stat = await fs.stat(path.join(tmpRoot, result.publishedPath));
    assert.ok(stat.isFile());
  });
});

describe("publishIngredientDraft (slug suffix retry)", () => {
  it("appends -2 when the base slug already exists on disk", async () => {
    // Pre-seed an existing draft so the wx flag trips EEXIST on the
    // first attempt and the helper retries with a numeric suffix.
    await fs.writeFile(
      path.join(tmpRoot, INGREDIENT_DRAFTS_DIR, "bakuchiol.json"),
      "{}\n",
      "utf8",
    );

    const result = await publishIngredientDraft({
      name: "Bakuchiol",
      summary: "s",
      verdict: "v",
      tier: "t",
    });
    assert.equal(result.publishedSlug, "bakuchiol-2");
    assert.equal(
      result.publishedPath,
      `${INGREDIENT_DRAFTS_DIR}/bakuchiol-2.json`,
    );

    // Original draft is still untouched by the retry.
    const original = await fs.readFile(
      path.join(tmpRoot, INGREDIENT_DRAFTS_DIR, "bakuchiol.json"),
      "utf8",
    );
    assert.equal(original, "{}\n");
  });

  it("propagates non-EEXIST writeFile errors instead of retrying", async () => {
    savedWriteFile = fsModule.promises.writeFile;
    let calls = 0;
    fsModule.promises.writeFile = (async () => {
      calls += 1;
      const err = new Error("permission denied") as NodeJS.ErrnoException;
      err.code = "EACCES";
      throw err;
    }) as typeof fsModule.promises.writeFile;

    await assert.rejects(
      publishIngredientDraft({
        name: "Niacinamide",
        summary: "s",
        verdict: "v",
        tier: "t",
      }),
      /permission denied/,
    );
    assert.equal(calls, 1);
  });
});
