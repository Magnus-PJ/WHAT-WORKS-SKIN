/**
 * Validate that every "On our shelf" entry referenced from an
 * Ingredient*.tsx brief resolves to a real catalogue entry — either
 * an internal review (component) or an outbound purchase URL.
 *
 * Why: the existing `validate:ingredients` script verifies the
 * forward direction (ingredient names on catalogued products map to
 * known slugs). This script verifies the inverse: every shelf card
 * recommended on an ingredient brief maps to *something* the catalogue
 * knows about. Otherwise `productLinkForBriefEntry` returns `null` and
 * the brief silently renders the inert "Not yet reviewed" fallback.
 *
 * The script discovers ingredient briefs by scanning `Ingredient*.tsx`
 * files in the evidently/ directory and reading whichever shelf shape
 * the file exposes:
 *   - Standard briefs export `data.products` (via IngredientBriefData).
 *   - Custom briefs export a top-level `PRODUCTS` constant.
 * Files with neither (e.g. IngredientIndex.tsx) are skipped.
 *
 * Each `{ brand, name }` pair is fed through `productEntryForBriefEntry`
 * and the script fails when the result is `null` (no catalogue match)
 * or has neither a `component` nor a `purchaseUrl` (matched, but the
 * catalogue row is inert).
 *
 * Run via: pnpm --filter @workspace/mockup-sandbox run validate:shelf-resolution
 */

import { readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { productEntryForBriefEntry } from "../src/components/mockups/evidently/_links";

const here = dirname(fileURLToPath(import.meta.url));
const evidentlyDir = join(here, "..", "src", "components", "mockups", "evidently");

type ShelfEntry = { brand: string; name: string };

type DiscoveredShelf = {
  /** Component file name without `.tsx`, used as the source label. */
  source: string;
  /** Which shape the shelf came from (informational, used in errors). */
  shape: "data.products" | "PRODUCTS";
  entries: ShelfEntry[];
};

function isShelfEntryArray(value: unknown): value is ShelfEntry[] {
  if (!Array.isArray(value)) return false;
  return value.every(
    (e) =>
      e !== null &&
      typeof e === "object" &&
      typeof (e as { brand?: unknown }).brand === "string" &&
      typeof (e as { name?: unknown }).name === "string",
  );
}

async function loadShelfFromFile(file: string): Promise<DiscoveredShelf | null> {
  const url = pathToFileURL(join(evidentlyDir, file)).href;
  const mod = (await import(url)) as Record<string, unknown>;

  const data = mod.data as { products?: unknown } | undefined;
  if (data && isShelfEntryArray(data.products)) {
    return {
      source: file.replace(/\.tsx$/, ""),
      shape: "data.products",
      entries: data.products,
    };
  }

  const products = mod.PRODUCTS;
  if (isShelfEntryArray(products)) {
    return {
      source: file.replace(/\.tsx$/, ""),
      shape: "PRODUCTS",
      entries: products,
    };
  }

  return null;
}

type Failure = {
  source: string;
  shape: DiscoveredShelf["shape"];
  brand: string;
  name: string;
  reason: string;
};

const failures: Failure[] = [];
let totalEntries = 0;
let scannedShelves = 0;

const ingredientFiles = readdirSync(evidentlyDir)
  .filter((f) => f.startsWith("Ingredient") && f.endsWith(".tsx"))
  .sort();

for (const file of ingredientFiles) {
  const shelf = await loadShelfFromFile(file);
  if (!shelf) continue;
  scannedShelves += 1;

  for (const entry of shelf.entries) {
    totalEntries += 1;
    const matched = productEntryForBriefEntry(entry.brand, entry.name);

    if (matched === null) {
      failures.push({
        source: shelf.source,
        shape: shelf.shape,
        brand: entry.brand,
        name: entry.name,
        reason: "no catalogue entry matched this brand+name pair",
      });
      continue;
    }

    if (!matched.component && !matched.purchaseUrl) {
      failures.push({
        source: shelf.source,
        shape: shelf.shape,
        brand: entry.brand,
        name: entry.name,
        reason:
          `matched catalogue row "${matched.brand} — ${matched.name}" ` +
          `has neither a review component nor a purchaseUrl`,
      });
    }
  }
}

if (failures.length === 0) {
  console.log(
    `✓ Shelf resolution OK — checked ${totalEntries} shelf entries across ` +
      `${scannedShelves} ingredient brief(s).`,
  );
  process.exit(0);
}

console.error(
  `✗ Found ${failures.length} shelf entr${failures.length === 1 ? "y" : "ies"} ` +
    `that would silently render the "Not yet reviewed" fallback.\n` +
    `   For each one, either:\n` +
    `     - add a catalogue row in artifacts/mockup-sandbox/src/components/` +
    `mockups/evidently/_productCatalogue.ts (with a component or purchaseUrl), or\n` +
    `     - reword the shelf entry on the brief so it matches an existing\n` +
    `       catalogue row (brand + name).\n`,
);
for (const f of failures) {
  console.error(
    `  • ${f.source} (${f.shape}) — "${f.brand} — ${f.name}"\n` +
      `      ${f.reason}`,
  );
}
process.exit(1);
