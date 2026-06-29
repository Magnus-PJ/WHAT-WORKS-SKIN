/**
 * Validate that the editor backlog aggregator (`_unreviewedShelf.ts`)
 * walks every routine, concern and ingredient brief page that exposes
 * a structured product shelf — i.e. every Routine* / Concern* /
 * Ingredient* component file under `evidently/` that exports a
 * top-level `STEPS` (routines), `PRODUCTS` (concerns or some
 * ingredient briefs) or `data: IngredientBriefData` (most ingredient
 * briefs) constant.
 *
 * Why: `_unreviewedShelf.ts` keeps a hardcoded list of which pages to
 * walk. If a future routine, concern or ingredient brief page is added
 * with a shelf of recommended products and the aggregator import list
 * is not updated, those mentions silently fall out of the editor
 * backlog. This script fails CI in that case.
 *
 * Run via: pnpm --filter @workspace/mockup-sandbox run validate:unreviewed-shelf
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const evidentlyDir = join(here, "..", "src", "components", "mockups", "evidently");
const aggregatorPath = join(evidentlyDir, "_unreviewedShelf.ts");

const aggregator = readFileSync(aggregatorPath, "utf8");

function listComponentsExporting(prefix: "Routine" | "Concern", marker: "STEPS" | "PRODUCTS"): string[] {
  const out: string[] = [];
  for (const file of readdirSync(evidentlyDir)) {
    if (!file.startsWith(prefix) || !file.endsWith(".tsx")) continue;
    const src = readFileSync(join(evidentlyDir, file), "utf8");
    // Match `export const STEPS` or `export const PRODUCTS` at top level.
    const pattern = new RegExp(`^export\\s+const\\s+${marker}\\b`, "m");
    if (pattern.test(src)) out.push(file.replace(/\.tsx$/, ""));
  }
  return out.sort();
}

// Ingredient brief pages come in two shapes:
//   1. Most use the shared `_IngredientBrief` template and export
//      `data: IngredientBriefData` (which contains `data.products`).
//   2. A few older pages export a top-level `PRODUCTS` constant
//      directly (e.g. IngredientDetail / Niacinamide / LAscorbic /
//      Azelaic / Bakuchiol).
// Either shape exposes a structured shelf the editor backlog needs to
// walk. Files like `IngredientIndex.tsx` that export neither are the
// hub/index pages and have no shelf — they're correctly skipped.
function listIngredientShelves(): string[] {
  const out: string[] = [];
  for (const file of readdirSync(evidentlyDir)) {
    if (!file.startsWith("Ingredient") || !file.endsWith(".tsx")) continue;
    const src = readFileSync(join(evidentlyDir, file), "utf8");
    const hasBriefData = /^export\s+const\s+data\s*:\s*IngredientBriefData\b/m.test(src);
    const hasProducts = /^export\s+const\s+PRODUCTS\b/m.test(src);
    if (hasBriefData || hasProducts) out.push(file.replace(/\.tsx$/, ""));
  }
  return out.sort();
}

// Extract the body of a top-level `const <name>: <type> = [ ... ];`
// array initializer from the aggregator source. Returns null if the
// declaration isn't found. Used to scope the BRIEF_SHELVES wiring
// check so an unrelated reference elsewhere in the file (e.g. a stray
// comment) cannot mask a missing entry.
function extractArrayBody(source: string, name: string): string | null {
  const re = new RegExp(`const\\s+${name}\\s*(?::[^=]*)?=\\s*\\[`, "m");
  const match = re.exec(source);
  if (!match) return null;
  const start = match.index + match[0].length; // position just after `[`
  let depth = 1;
  for (let i = start; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === "[") depth += 1;
    else if (ch === "]") {
      depth -= 1;
      if (depth === 0) return source.slice(start, i);
    }
  }
  return null;
}

// Find every local identifier the aggregator imports from a specific
// relative module path. Handles both renamed (`{ data as fooData }`)
// and bare (`{ PRODUCTS }`) named imports across one or more lines.
function importedLocalsFrom(source: string, modulePath: string): string[] {
  const escaped = modulePath.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&");
  const re = new RegExp(`import\\s*\\{([^}]*)\\}\\s*from\\s*"${escaped}"`, "g");
  const locals: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(source)) !== null) {
    for (const piece of m[1].split(",")) {
      const trimmed = piece.trim();
      if (!trimmed) continue;
      // `orig as local` or just `name`.
      const asMatch = /\bas\s+([A-Za-z_$][\w$]*)\s*$/.exec(trimmed);
      if (asMatch) {
        locals.push(asMatch[1]);
      } else {
        const nameMatch = /^([A-Za-z_$][\w$]*)\s*$/.exec(trimmed);
        if (nameMatch) locals.push(nameMatch[1]);
      }
    }
  }
  return locals;
}

const routineComponents = listComponentsExporting("Routine", "STEPS");
const concernComponents = listComponentsExporting("Concern", "PRODUCTS");
const ingredientComponents = listIngredientShelves();

const briefShelvesBody = extractArrayBody(aggregator, "BRIEF_SHELVES");
if (briefShelvesBody === null) {
  console.error(
    `✗ Could not locate the BRIEF_SHELVES array in _unreviewedShelf.ts.\n` +
    `  The validator needs that block to confirm each ingredient brief\n` +
    `  is wired into the editor backlog. If the constant was renamed,\n` +
    `  update validate-unreviewed-shelf.ts to match.\n`,
  );
  process.exit(1);
}

const missing: string[] = [];

for (const component of routineComponents) {
  // Aggregator imports STEPS as `<lowercaseFirst>Steps` and references
  // the component name in its ROUTINE_SHELVES list. The component name
  // must appear as `"<component>"` (a string literal) in the file.
  if (!aggregator.includes(`"${component}"`)) {
    missing.push(`routine: ${component}`);
  }
}

for (const component of concernComponents) {
  if (!aggregator.includes(`"${component}"`)) {
    missing.push(`concern: ${component}`);
  }
}

for (const component of ingredientComponents) {
  // BRIEF_SHELVES doesn't reference ingredient pages by component
  // name (it keys on catalogue slug), so we instead resolve the local
  // identifier(s) the aggregator imports from `./<component>` and
  // assert that at least one of them is referenced inside the
  // BRIEF_SHELVES initializer body. This catches both "not imported
  // at all" and "imported but never wired into BRIEF_SHELVES" — the
  // exact failure modes that would silently drop the brief's
  // unreviewed products from the editor backlog.
  const locals = importedLocalsFrom(aggregator, `./${component}`);
  if (locals.length === 0) {
    missing.push(`ingredient: ${component} (not imported by _unreviewedShelf.ts)`);
    continue;
  }
  const wordRes = locals.map(
    (n) => new RegExp(`\\b${n.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`),
  );
  const wired = wordRes.some((re) => re.test(briefShelvesBody));
  if (!wired) {
    missing.push(`ingredient: ${component} (imported but missing from BRIEF_SHELVES)`);
  }
}

if (missing.length > 0) {
  console.error(
    `✗ Editor backlog aggregator is out of sync with the component files.\n` +
    `  The following pages export a structured product shelf but are not\n` +
    `  walked by _unreviewedShelf.ts. Add them to ROUTINE_SHELVES,\n` +
    `  CONCERN_SHELVES or BRIEF_SHELVES so their products show up in the\n` +
    `  editor backlog:\n\n` +
    missing.map((m) => `    - ${m}`).join("\n") +
    `\n`,
  );
  process.exit(1);
}

console.log(
  `✓ Editor backlog aggregator covers all ${routineComponents.length} routine, ` +
  `${concernComponents.length} concern and ${ingredientComponents.length} ingredient ` +
  `pages with structured shelves.`,
);
