/**
 * Validate that the editor shelf-clicks dashboard's `<kind>:<slug>`
 * deep-link plumbing stays in sync with the public preview pages —
 * checked in *both* directions.
 *
 * Why: when a non-editor pastes / opens a shared
 * `/__mockup/preview/evidently/EditorShelfClicks?page=<kind>:<slug>`
 * URL, the dashboard silently redirects them to the matching public
 * guide instead of dropping them on the editor sign-in form. That
 * redirect leans on `publicHrefForDeepLink()`, which walks the same
 * INGREDIENTS / ROUTINE_BUILT / CONCERNS catalogues used elsewhere on
 * the site to recover the public href.
 *
 * Two ways the redirect can silently dead-end at the sign-in form:
 *
 *   A. **Forward gap** — a catalogue entry references a slug or
 *      component that has no built detail page. `publicHrefForDeepLink()`
 *      returns `null` (or a 404 URL) and the visitor falls through to
 *      the editor sign-in form. Caught by Phase 1 below.
 *
 *   B. **Inverse gap** — a built `Ingredient*.tsx` / `Routine*.tsx` /
 *      `Concern*.tsx` detail page exists on disk but was never wired
 *      into its catalogue. The dashboard records the editor's visit
 *      under `pageSlug = "<ComponentName>"` (routines / concerns) or
 *      whatever ingredient slug was emitted, but the deep-link key
 *      never resolves because no catalogue entry points at the file.
 *      Caught by Phase 2 below.
 *
 * Phase 1 — catalogue → page (every catalogued slug resolves):
 *   - every INGREDIENTS entry            → `ingredient:<slug>`
 *   - every unique ROUTINE_BUILT value   → `routine:<component>`
 *   - every unique CONCERNS component    → `concern:<component>`
 *
 *   For each it asserts that:
 *     1. `publicHrefForDeepLink()` returns a non-null URL, and
 *     2. that URL points at a `*.tsx` component file that actually
 *        exists in `src/components/mockups/evidently/` (so a typo in
 *        a catalogue's `component` string can't dead-end at a 404
 *        either).
 *
 * Phase 2 — page → catalogue (every built page is wired in):
 *   - every `Ingredient*.tsx` / `Routine*.tsx` / `Concern*.tsx` in
 *     `src/components/mockups/evidently/`, excluding the `_`-prefixed
 *     private/template files (`_concernTemplate.tsx`, `_links.tsx`,
 *     etc.) and the `<Prefix>Index.tsx` listing pages.
 *
 *   For each detail page it asserts that the component file name is
 *   reachable from at least one catalogue entry (via
 *   `publicHrefForDeepLink()`) — i.e. there is at least one
 *   `<kind>:<slug>` key the dashboard could emit that resolves to
 *   `${PREVIEW_BASE}/${ComponentName}`.
 *
 * The script exits non-zero with a per-failure list so CI /
 * pre-merge runs catch regressions in either direction, and is wired
 * into the existing `pnpm validate:matchers` aggregate alongside the
 * other shelf-* validators.
 *
 * Run via: pnpm --filter @workspace/mockup-sandbox run validate:editor-deep-link-redirects
 */

import { existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { publicHrefForDeepLink } from "../src/components/mockups/evidently/EditorShelfClicks";
import {
  CONCERNS,
  INGREDIENTS,
} from "../src/components/mockups/evidently/_links";
import { ROUTINE_BUILT } from "../src/components/mockups/evidently/_routineCatalogue";

const here = dirname(fileURLToPath(import.meta.url));
const evidentlyDir = join(here, "..", "src", "components", "mockups", "evidently");

const PREVIEW_BASE = "/__mockup/preview/evidently";

type DeepLinkCheck = {
  /** What kind of catalogue this slug came from (informational). */
  kind: "ingredient" | "routine" | "concern";
  /** The `<kind>:<slug>` key as `publicHrefForDeepLink()` would receive it. */
  deepLink: string;
  /** Where the slug was sourced from, for the error report. */
  source: string;
};

function checksForIngredients(): DeepLinkCheck[] {
  return Object.keys(INGREDIENTS)
    .sort()
    .map((slug) => ({
      kind: "ingredient" as const,
      deepLink: `ingredient:${slug}`,
      source: `INGREDIENTS["${slug}"]`,
    }));
}

function checksForRoutines(): DeepLinkCheck[] {
  // Several catalogue slugs can alias the same component (e.g.
  // am-sensitive + pm-sensitive both point at RoutineBareMinimum), so
  // de-dupe on the component name — that's the value the dashboard
  // emits as the deep-link slug.
  const components = Array.from(new Set(Object.values(ROUTINE_BUILT))).sort();
  return components.map((component) => ({
    kind: "routine" as const,
    deepLink: `routine:${component}`,
    source: `ROUTINE_BUILT[…] = "${component}"`,
  }));
}

function checksForConcerns(): DeepLinkCheck[] {
  // Same de-dupe rationale as routines: the deep-link slug for
  // concerns is the component file name, not the catalogue slug.
  const components = Array.from(
    new Set(Object.values(CONCERNS).map((e) => e.component)),
  ).sort();
  return components.map((component) => ({
    kind: "concern" as const,
    deepLink: `concern:${component}`,
    source: `CONCERNS[…].component = "${component}"`,
  }));
}

type Failure = {
  check: DeepLinkCheck;
  reason: string;
};

const failures: Failure[] = [];
const allChecks: DeepLinkCheck[] = [
  ...checksForIngredients(),
  ...checksForRoutines(),
  ...checksForConcerns(),
];

for (const check of allChecks) {
  const href = publicHrefForDeepLink(check.deepLink);
  if (href === null) {
    failures.push({
      check,
      reason:
        `publicHrefForDeepLink("${check.deepLink}") returned null — the ` +
        `editor sign-in form would be shown instead of a public guide`,
    });
    continue;
  }
  if (!href.startsWith(`${PREVIEW_BASE}/`)) {
    failures.push({
      check,
      reason:
        `expected URL under "${PREVIEW_BASE}/" but got "${href}" — the ` +
        `redirect would land outside the public preview area`,
    });
    continue;
  }
  const component = href.slice(`${PREVIEW_BASE}/`.length);
  if (component.length === 0 || component.includes("/")) {
    failures.push({
      check,
      reason:
        `URL "${href}" does not point at a single preview component — ` +
        `expected "${PREVIEW_BASE}/<Component>"`,
    });
    continue;
  }
  const componentPath = join(evidentlyDir, `${component}.tsx`);
  if (!existsSync(componentPath)) {
    failures.push({
      check,
      reason:
        `URL "${href}" points at "${component}.tsx", which does not ` +
        `exist in src/components/mockups/evidently/ — the redirect ` +
        `would dead-end at a 404`,
    });
  }
}

// ─────────────────────────────────────────────────────────────────────
// Phase 2 — page → catalogue.
//
// Walk every built `Ingredient*.tsx` / `Routine*.tsx` / `Concern*.tsx`
// detail page on disk and assert each one is reachable from at least
// one catalogue entry via `publicHrefForDeepLink()`.
//
// For routines and concerns the dashboard emits the component file
// name as the deep-link slug, so the reachability check is the
// straight-through `<kind>:<ComponentName>`. For ingredients the
// dashboard emits the ingredient catalogue slug (not the component
// name), so reachability is "some `INGREDIENTS[*].component` equals
// this file name". The set-based check below covers all three kinds
// uniformly by building the inverse map of "which component files
// `publicHrefForDeepLink()` could ever resolve to" once, then asking
// whether each enumerated detail page appears in it.
//
// Excluded from enumeration:
//   - any file whose basename starts with `_` (private helpers,
//     templates, catalogues — `_links.tsx`, `_concernTemplate.tsx`,
//     `_routineCatalogue.ts`, etc.); and
//   - `<Prefix>Index.tsx` listing pages, which are never deep-link
//     targets.
// ─────────────────────────────────────────────────────────────────────

type DetailPageKind = "ingredient" | "routine" | "concern";

const DETAIL_PAGE_PREFIXES: Record<DetailPageKind, string> = {
  ingredient: "Ingredient",
  routine: "Routine",
  concern: "Concern",
};

type EnumeratedPage = {
  kind: DetailPageKind;
  /** Component file basename without `.tsx`. */
  component: string;
  /** Relative path used in the failure report. */
  relativePath: string;
};

function enumerateDetailPages(): EnumeratedPage[] {
  const entries = readdirSync(evidentlyDir, { withFileTypes: true });
  const pages: EnumeratedPage[] = [];
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const name = entry.name;
    if (!name.endsWith(".tsx")) continue;
    if (name.startsWith("_")) continue;
    const base = name.slice(0, -".tsx".length);
    for (const [kind, prefix] of Object.entries(DETAIL_PAGE_PREFIXES) as Array<
      [DetailPageKind, string]
    >) {
      if (!base.startsWith(prefix)) continue;
      // Skip the `<Prefix>Index.tsx` listing pages — they are the
      // entry points into each taxonomy, not deep-link targets.
      if (base === `${prefix}Index`) continue;
      pages.push({
        kind,
        component: base,
        relativePath: `src/components/mockups/evidently/${name}`,
      });
      break;
    }
  }
  pages.sort((a, b) =>
    a.kind === b.kind
      ? a.component.localeCompare(b.component)
      : a.kind.localeCompare(b.kind),
  );
  return pages;
}

// Build the inverse map: for each kind, which component file names
// `publicHrefForDeepLink()` could ever resolve to. We re-use the same
// `<kind>:<slug>` key set as Phase 1 (each catalogued slug is what
// the dashboard would actually emit) so the two phases stay
// symmetrical — anything Phase 1 successfully resolved becomes a
// reachable target here.
function reachableComponentsByKind(): Record<DetailPageKind, Set<string>> {
  const reachable: Record<DetailPageKind, Set<string>> = {
    ingredient: new Set(),
    routine: new Set(),
    concern: new Set(),
  };
  for (const check of allChecks) {
    const href = publicHrefForDeepLink(check.deepLink);
    if (href === null) continue;
    if (!href.startsWith(`${PREVIEW_BASE}/`)) continue;
    const component = href.slice(`${PREVIEW_BASE}/`.length);
    if (component.length === 0 || component.includes("/")) continue;
    reachable[check.kind].add(component);
  }
  return reachable;
}

type OrphanFailure = {
  page: EnumeratedPage;
  reason: string;
};

const orphanFailures: OrphanFailure[] = [];
const enumeratedPages = enumerateDetailPages();
const reachable = reachableComponentsByKind();

const CATALOGUE_HINT: Record<DetailPageKind, string> = {
  ingredient: "INGREDIENTS in _links.tsx",
  routine: "ROUTINE_BUILT in _routineCatalogue.ts",
  concern: "CONCERNS in _links.tsx",
};

for (const page of enumeratedPages) {
  if (reachable[page.kind].has(page.component)) continue;
  orphanFailures.push({
    page,
    reason:
      `no catalogue entry resolves to "${page.component}.tsx" — add ` +
      `an entry to ${CATALOGUE_HINT[page.kind]} pointing at this ` +
      `component (or delete / rename the file with a leading "_" if ` +
      `it is not a deep-link target). Editors landing on this page ` +
      `would record \`${page.kind}:${page.component}\` in the shelf-` +
      `clicks dashboard, but a non-editor pasting the same deep link ` +
      `would silently dead-end at the editor sign-in form.`,
  });
}

const totalFailures = failures.length + orphanFailures.length;

if (totalFailures === 0) {
  console.log(
    `✓ Editor deep-link redirects OK — checked ${allChecks.length} ` +
      `catalogued slug(s) (forward) and ${enumeratedPages.length} ` +
      `built detail page(s) (inverse) across ingredients, routines, ` +
      `and concerns.`,
  );
  process.exit(0);
}

if (failures.length > 0) {
  console.error(
    `✗ Found ${failures.length} catalogued slug(s) whose editor deep ` +
      `link would dead-end at the sign-in form (or a 404) instead of ` +
      `redirecting to a public guide.\n` +
      `   For each one, either:\n` +
      `     - add the missing entry to INGREDIENTS / ROUTINE_BUILT / ` +
      `CONCERNS in artifacts/mockup-sandbox/src/components/mockups/` +
      `evidently/, or\n` +
      `     - add the missing detail-page component .tsx file under ` +
      `the same directory so the URL resolves.\n`,
  );
  for (const f of failures) {
    console.error(
      `  • [${f.check.kind}] ${f.check.deepLink}\n` +
        `      source: ${f.check.source}\n` +
        `      ${f.reason}`,
    );
  }
}

if (orphanFailures.length > 0) {
  console.error(
    `✗ Found ${orphanFailures.length} built detail page(s) that are ` +
      `not wired into any catalogue. An editor browsing one of these ` +
      `pages would emit a shelf-click row with a \`<kind>:<slug>\` ` +
      `deep-link key the public preview redirect cannot resolve, ` +
      `silently dropping non-editor visitors on the sign-in form.\n`,
  );
  for (const f of orphanFailures) {
    console.error(
      `  • [${f.page.kind}] ${f.page.relativePath}\n` +
        `      ${f.reason}`,
    );
  }
}

process.exit(1);
