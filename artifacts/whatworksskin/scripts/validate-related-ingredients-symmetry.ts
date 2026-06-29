/**
 * Validate that the per-ingredient `relatedIngredients` cross-link
 * graph is symmetric.
 *
 * Each ingredient brief in `src/content/ingredients/*.json` lists 2–4
 * sibling slugs in its `relatedIngredients` array. Those picks are
 * authored independently per file, so it's easy to write
 * `niacinamide` → `ceramides` without `ceramides` ever pointing back
 * at `niacinamide`. The build doesn't notice, but readers do — they
 * dead-end after one hop through the "Related ingredients" grid.
 *
 * This script walks every brief and reports two classes of problem:
 *
 *   • MISSING TARGET — `relatedIngredients` points at a slug that
 *     has no brief at all. The reference will be silently dropped at
 *     render time, so editors should either add the brief or remove
 *     the slug.
 *
 *   • ONE-WAY PICK — A links to B, but B does not link back to A,
 *     and the pair is not in the documented `ALLOWED_ASYMMETRIES`
 *     allow-list. Editors should either add `A` to B's list, drop
 *     `B` from A's list, or add the pair to the allow-list with a
 *     short rationale.
 *
 * The script also flags STALE allow-list entries — pairs that are
 * now reciprocal (or no longer exist) and should be deleted from
 * the allow-list so the catch keeps biting.
 *
 * Run via:
 *   pnpm --filter @workspace/whatworksskin run validate:related-ingredients-symmetry
 *
 * Exits 1 on any unexpected asymmetry, missing target, or stale
 * allow-list entry; exits 0 otherwise.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INGREDIENTS_DIR = path.resolve(
  __dirname,
  "../src/content/ingredients",
);

// ─────────────────────────────────────────────────────────────────────
// Allow-list of intentional one-way picks.
//
// Format: "from-slug→to-slug". Each cluster of entries below has a
// shared editorial rationale captured in the leading comment. Add new
// entries sparingly — the goal of this validator is to keep the
// catalogue's "Related ingredients" grid reciprocal as it grows. If
// the allow-list balloons we've lost the signal.
// ─────────────────────────────────────────────────────────────────────

const ALLOWED_ASYMMETRIES: ReadonlySet<string> = new Set<string>([
  // Niacinamide is the catalogue's most-recommended daily partner —
  // almost every other active calls it out as a buffering / barrier-
  // friendly sidekick. Its own four `relatedIngredients` slots are
  // reserved for its closest pigment + barrier peers (l-ascorbic
  // acid, tranexamic acid, retinol, ceramides), so the long tail of
  // ingredients that name-check niacinamide intentionally don't
  // expect a back-link.
  "alpha-arbutin→niacinamide",
  "azelaic-acid→niacinamide",
  "bakuchiol→niacinamide",
  "benzoyl-peroxide→niacinamide",
  "centella→niacinamide",
  "glycolic-acid→niacinamide",
  "hyaluronic-acid→niacinamide",
  "lactic-acid→niacinamide",
  "mandelic-acid→niacinamide",
  "panthenol→niacinamide",
  "peptides-copper→niacinamide",
  "peptides-signal→niacinamide",
  "propolis→niacinamide",
  "salicylic-acid→niacinamide",
  "snail-mucin→niacinamide",
  "sulphur→niacinamide",

  // Retinol's four slots are the retinoid family + bakuchiol +
  // peptides-signal. Niacinamide cites retinol as its canonical
  // evening partner, and exosomes positions retinol as a comparator,
  // but neither needs a reciprocal slot on retinol's own card.
  "niacinamide→retinol",
  "exosomes→retinol",

  // Peptides-signal's slots are reserved for its closest peptide and
  // retinoid peers. Exosomes' nod to peptides-signal as a comparator
  // is one-way by design.
  "exosomes→peptides-signal",

  // Ceramides' slots are the barrier-repair quartet (hyaluronic,
  // panthenol, centella, niacinamide). Peptides-copper cites
  // ceramides as a barrier complement; the back-link doesn't fit.
  "peptides-copper→ceramides",

  // Hyaluronic-acid's slots are barrier peers; lactic-acid's nod to
  // hyaluronic as a humectant pairing partner is one-way.
  "lactic-acid→hyaluronic-acid",

  // The soothing-barrier cluster (panthenol / centella / snail-mucin
  // / propolis) all sit close to each other but each card holds at
  // most four siblings. The cross-references that don't fit are
  // documented one-ways:
  "propolis→panthenol",
  "propolis→snail-mucin",
  "snail-mucin→panthenol",
  "snail-mucin→centella",

  // The acne + pigment cluster (adapalene / azelaic / salicylic /
  // benzoyl-peroxide / sulphur / mandelic) is densely connected.
  // Each brief picks its closest 4 partners; the picks that don't fit
  // back are documented one-ways:
  "mandelic-acid→salicylic-acid",
  "salicylic-acid→adapalene",
  "sulphur→salicylic-acid",
  "sulphur→azelaic-acid",
  "tretinoin→azelaic-acid",
]);

// ─────────────────────────────────────────────────────────────────────
// Load every brief's slug + relatedIngredients array.
// ─────────────────────────────────────────────────────────────────────

type Brief = { slug: string; related: string[]; file: string };

function loadBriefs(): Map<string, Brief> {
  const briefs = new Map<string, Brief>();
  const files = fs
    .readdirSync(INGREDIENTS_DIR, { withFileTypes: true })
    .filter((d) => d.isFile() && d.name.endsWith(".json"))
    .map((d) => d.name)
    .sort();
  for (const file of files) {
    const full = path.join(INGREDIENTS_DIR, file);
    const data = JSON.parse(fs.readFileSync(full, "utf8"));
    if (typeof data?.slug !== "string") continue;
    // `relatedIngredients` accepts either a bare slug string or an
    // `{ slug, sub }` override object; this validator only cares about
    // the slug graph, so flatten to slugs here.
    const related: string[] = Array.isArray(data?.relatedIngredients)
      ? data.relatedIngredients
          .map((entry: unknown): string | undefined => {
            if (typeof entry === "string") return entry;
            if (
              entry &&
              typeof entry === "object" &&
              typeof (entry as { slug?: unknown }).slug === "string"
            ) {
              return (entry as { slug: string }).slug;
            }
            return undefined;
          })
          .filter((s: string | undefined): s is string => typeof s === "string")
      : [];
    briefs.set(data.slug, { slug: data.slug, related, file });
  }
  return briefs;
}

const briefs = loadBriefs();

// ─────────────────────────────────────────────────────────────────────
// Walk the graph.
// ─────────────────────────────────────────────────────────────────────

const pairKey = (a: string, b: string): string => `${a}→${b}`;

type MissingTarget = {
  kind: "missing-target";
  from: string;
  to: string;
  fromFile: string;
};
type OneWay = {
  kind: "one-way";
  from: string;
  to: string;
  fromFile: string;
  toFile: string;
};
type Issue = MissingTarget | OneWay;

const issues: Issue[] = [];

for (const [from, brief] of briefs) {
  for (const to of brief.related) {
    if (from === to) {
      // Self-link: treat as a missing target for clarity.
      issues.push({
        kind: "missing-target",
        from,
        to,
        fromFile: brief.file,
      });
      continue;
    }
    const target = briefs.get(to);
    if (!target) {
      issues.push({
        kind: "missing-target",
        from,
        to,
        fromFile: brief.file,
      });
      continue;
    }
    if (target.related.includes(from)) continue;
    if (ALLOWED_ASYMMETRIES.has(pairKey(from, to))) continue;
    issues.push({
      kind: "one-way",
      from,
      to,
      fromFile: brief.file,
      toFile: target.file,
    });
  }
}

// ─────────────────────────────────────────────────────────────────────
// Detect stale allow-list entries.
// ─────────────────────────────────────────────────────────────────────

type Stale =
  | { kind: "stale-now-reciprocal"; from: string; to: string }
  | { kind: "stale-no-such-pair"; from: string; to: string; reason: string };

const stale: Stale[] = [];
for (const key of ALLOWED_ASYMMETRIES) {
  const [from, to] = key.split("\u2192");
  if (!from || !to) {
    stale.push({
      kind: "stale-no-such-pair",
      from: from ?? "",
      to: to ?? "",
      reason: "malformed allow-list entry (expected 'from\u2192to')",
    });
    continue;
  }
  const fromBrief = briefs.get(from);
  const toBrief = briefs.get(to);
  if (!fromBrief) {
    stale.push({
      kind: "stale-no-such-pair",
      from,
      to,
      reason: `no brief for "${from}"`,
    });
    continue;
  }
  if (!toBrief) {
    stale.push({
      kind: "stale-no-such-pair",
      from,
      to,
      reason: `no brief for "${to}"`,
    });
    continue;
  }
  if (!fromBrief.related.includes(to)) {
    stale.push({
      kind: "stale-no-such-pair",
      from,
      to,
      reason: `"${from}" no longer lists "${to}" in relatedIngredients`,
    });
    continue;
  }
  if (toBrief.related.includes(from)) {
    stale.push({ kind: "stale-now-reciprocal", from, to });
  }
}

// ─────────────────────────────────────────────────────────────────────
// Report.
// ─────────────────────────────────────────────────────────────────────

if (issues.length === 0 && stale.length === 0) {
  const total = [...briefs.values()].reduce(
    (n, b) => n + b.related.length,
    0,
  );
  console.log(
    `\u2713 Related-ingredients graph OK — ${total} cross-link(s) across ` +
      `${briefs.size} ingredient brief(s); ${ALLOWED_ASYMMETRIES.size} ` +
      `documented one-way pick(s).`,
  );
  process.exit(0);
}

if (issues.length > 0) {
  const oneWay = issues.filter((i): i is OneWay => i.kind === "one-way");
  const missing = issues.filter(
    (i): i is MissingTarget => i.kind === "missing-target",
  );

  if (oneWay.length > 0) {
    console.error(
      `\n\u2717 Found ${oneWay.length} one-sided pick(s) in the ingredient ` +
        `cross-link graph:\n`,
    );
    for (const i of oneWay) {
      console.error(
        `  • ${i.from} \u2192 ${i.to} (no back-link)\n` +
          `      from: src/content/ingredients/${i.fromFile}\n` +
          `      fix:  add "${i.from}" to relatedIngredients in ` +
          `src/content/ingredients/${i.toFile},\n` +
          `            or drop "${i.to}" from ${i.fromFile},\n` +
          `            or add "${i.from}\u2192${i.to}" to ` +
          `ALLOWED_ASYMMETRIES with a short rationale.`,
      );
    }
  }

  if (missing.length > 0) {
    console.error(
      `\n\u2717 Found ${missing.length} relatedIngredients reference(s) ` +
        `pointing at a slug with no brief:\n`,
    );
    for (const i of missing) {
      console.error(
        `  • ${i.from} \u2192 ${i.to}\n` +
          `      from: src/content/ingredients/${i.fromFile}\n` +
          `      fix:  add a brief for "${i.to}" or remove the slug ` +
          `from ${i.fromFile}.`,
      );
    }
  }
}

if (stale.length > 0) {
  console.error(
    `\n\u2717 Found ${stale.length} stale ALLOWED_ASYMMETRIES entry(ies) ` +
      `to clean up in ` +
      `artifacts/whatworksskin/scripts/validate-related-ingredients-symmetry.ts:\n`,
  );
  for (const s of stale) {
    if (s.kind === "stale-now-reciprocal") {
      console.error(
        `  • ${s.from}\u2192${s.to} is now reciprocal — remove it from ` +
          `the allow-list.`,
      );
    } else {
      console.error(`  • ${s.from}\u2192${s.to} — ${s.reason}.`);
    }
  }
}

process.exit(1);
