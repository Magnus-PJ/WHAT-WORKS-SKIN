/**
 * Validate that every `purchaseUrl` in the product catalogue
 * (`_productCatalogue.ts`) points at a real product-detail page rather
 * than a bare brand homepage.
 *
 * Why: unreviewed shelf entries each carry a `purchaseUrl` that the
 * shelf cards link out to. Most should be deep product-detail URLs
 * (e.g. `/products/abc-serum`), but it's easy to slip in a brand
 * homepage (just `https://brand.com/`) when adding a new entry — the
 * card then quietly sends readers to a generic landing page instead of
 * the SKU they were promised. Without a guardrail this drift
 * accumulates over time. This script fails CI on any catalogue entry
 * whose `purchaseUrl` has no path component (domain root only) or
 * whose path is just `/`, unless the entry is in the small whitelist
 * below for brands that genuinely only operate at root.
 *
 * Run via: pnpm --filter @workspace/mockup-sandbox run validate:purchase-urls
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const cataloguePath = join(
  here, "..", "src", "components", "mockups", "evidently", "_productCatalogue.ts",
);

// Whitelist of (brand + URL) pairs where the brand truly only operates
// at root — single-product Rx-brand sites where the homepage IS the
// product page, with no deeper SKU URL to point at. Keep this list
// small and add an inline rationale for each entry. Any new entry not
// covered here must use a deep product-detail URL.
const WHITELIST: ReadonlyArray<{ brand: string; url: string; reason: string }> = [
  {
    brand: "Galderma",
    url: "https://www.finacea.com/",
    reason: "finacea.com is Galderma's single-product Rx brand site for Finacea Foam — there is no deeper SKU URL.",
  },
  {
    brand: "Galderma",
    url: "https://www.epiduoforte.com/",
    reason: "epiduoforte.com is Galderma's single-product Rx brand site for Epiduo Forte — there is no deeper SKU URL.",
  },
  {
    brand: "Obagi",
    url: "https://www.obagi.com/",
    reason: "Obagi's tretinoin SKUs are Rx-only and not listed on the consumer storefront; the brand homepage is the closest stable URL.",
  },
  {
    brand: "Stridex",
    url: "https://stridex.com/",
    reason: "stridex.com lists its small product range on the homepage and has no per-SKU detail pages.",
  },
];

function isWhitelisted(brand: string, url: string): boolean {
  return WHITELIST.some((entry) => entry.brand === brand && entry.url === url);
}

function hasNoMeaningfulPath(url: string): boolean {
  // Catches domain-only URLs (no path) and domain + "/" only.
  // We deliberately evaluate the pathname only — a query string or
  // fragment hanging off the brand root (e.g. "https://brand.com/?ref=x"
  // or "https://brand.com/#section") still lands the reader on the
  // homepage, which is the failure mode the guardrail exists to catch.
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    // If it's not a parseable URL we can't reason about it — let other
    // validation catch malformed strings.
    return false;
  }
  const path = parsed.pathname;
  return path === "" || path === "/";
}

const source = readFileSync(cataloguePath, "utf8");

// Match each catalogue entry as a flat object literal between `{` and `}`,
// then pull the `brand`, `name`, and `purchaseUrl` fields out of it. The
// catalogue is hand-edited and reliably uses single-line property syntax
// (`brand: "Foo", name: "Bar", purchaseUrl: "https://…"`) so a forgiving
// per-entry regex is sufficient and avoids depending on a TS parser.
const entryPattern = /\{[^{}]*?\bpurchaseUrl\s*:\s*"([^"]+)"[^{}]*?\}/g;
const brandPattern = /\bbrand\s*:\s*"([^"]+)"/;
const namePattern = /\bname\s*:\s*"([^"]+)"/;

type Offender = { brand: string; name: string; url: string };
const offenders: Offender[] = [];
let totalChecked = 0;

for (const match of source.matchAll(entryPattern)) {
  const block = match[0];
  const url = match[1];
  totalChecked += 1;

  const brand = block.match(brandPattern)?.[1] ?? "(unknown brand)";
  const name = block.match(namePattern)?.[1] ?? "(unknown name)";

  if (!hasNoMeaningfulPath(url)) continue;
  if (isWhitelisted(brand, url)) continue;

  offenders.push({ brand, name, url });
}

if (totalChecked === 0) {
  console.error(
    `✗ validate-purchase-urls found no purchaseUrl entries in\n` +
    `  ${cataloguePath}.\n` +
    `  The catalogue file format may have changed in a way this\n` +
    `  validator no longer understands — please review.\n`,
  );
  process.exit(1);
}

if (offenders.length > 0) {
  console.error(
    `✗ ${offenders.length} catalogue entr${offenders.length === 1 ? "y" : "ies"} ` +
    `link${offenders.length === 1 ? "s" : ""} out to a bare brand homepage instead of a product-detail URL.\n` +
    `  Shelf cards built from these entries quietly send readers to a\n` +
    `  generic landing page instead of the SKU they were promised.\n` +
    `  Replace each purchaseUrl below with the deepest stable product\n` +
    `  page URL you can find (brand site preferred, reputable retailer\n` +
    `  if not). If the brand truly only operates at root, add it to the\n` +
    `  WHITELIST in scripts/validate-purchase-urls.ts with a rationale.\n\n` +
    offenders.map((o) => `    - ${o.brand} — ${o.name}\n        ${o.url}`).join("\n") +
    `\n`,
  );
  process.exit(1);
}

console.log(
  `✓ All ${totalChecked} catalogue purchaseUrl entries point at a ` +
  `product-detail path` +
  (WHITELIST.length > 0
    ? ` (${WHITELIST.length} whitelisted brand-root exception${WHITELIST.length === 1 ? "" : "s"}).`
    : `.`),
);
