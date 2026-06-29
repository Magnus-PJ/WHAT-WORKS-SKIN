/**
 * Validate the CSV export format for the editor shelf-click dashboard.
 *
 * Why: editors download these CSVs into spreadsheets they keep
 * templates against, so the on-the-wire format is a contract — stable
 * column order, RFC 4180 escaping (commas, embedded quotes, CR, LF),
 * CRLF row terminators, header-only output for empty input, and a
 * UTF-8 BOM so Excel on Windows opens accented brand/product names
 * with the right encoding. A future refactor that quietly reorders
 * the columns, drops the BOM, or breaks quoting would silently
 * corrupt every editor spreadsheet that depends on the format.
 *
 * What it checks:
 *   1. Header line: lists exactly the contracted columns in the
 *      contracted order, comma-separated, terminated with CRLF.
 *   2. Empty input: produces a header-only file (no body rows) that
 *      still ends in CRLF.
 *   3. Escaping: a brand containing a comma, a product name with an
 *      embedded double-quote, and a destination href containing a
 *      newline are all wrapped in quotes; embedded quotes are
 *      doubled; raw newlines survive inside the quoted cell.
 *   4. CRLF row terminators between every record (including the
 *      trailing one), with no stray bare LF / bare CR.
 *   5. Non-ASCII characters round-trip untouched (the BOM is the
 *      only encoding hint we add).
 *   6. BOM presence: `CSV_BOM` is U+FEFF and prepending it to the
 *      serialised CSV produces a payload that starts with the BOM
 *      followed by the header line.
 *
 * Run via: pnpm --filter @workspace/mockup-sandbox run validate:shelf-csv-export
 */

import {
  CSV_BOM,
  SHELF_CLICK_CSV_COLUMNS,
  escapeCsvCell,
  rowsToCsv,
  type ShelfClickCsvRow,
  type ShelfClickPageKind,
} from "../src/components/mockups/evidently/_shelfClickCsv";

// ─────────────────────────────────────────────────────────────────────
// Contract: the exact header order editors' spreadsheet templates
// have been built against. Changing this list is a breaking change —
// add new columns at the end, never reorder, never rename.
// ─────────────────────────────────────────────────────────────────────
const EXPECTED_HEADERS: ReadonlyArray<string> = [
  "when",
  "page kind",
  "page label",
  "page slug",
  "brand",
  "product",
  "destination href",
];

const EXPECTED_HEADER_LINE = EXPECTED_HEADERS.join(",");

// Identity-style page-label resolver. The CSV format is what we're
// pinning here, not the catalogue lookup, so a deterministic
// `kind:slug` string keeps fixtures self-contained and the assertions
// easy to read.
function fixturePageLabel(kind: ShelfClickPageKind, slug: string): string {
  return `${kind}:${slug}`;
}

// ─────────────────────────────────────────────────────────────────────
// Fixtures. Each one targets a specific escaping / encoding rule.
// ─────────────────────────────────────────────────────────────────────
const COMMA_BRAND_ROW: ShelfClickCsvRow = {
  createdAt: "2026-04-01T12:00:00.000Z",
  pageKind: "ingredient",
  pageSlug: "tretinoin",
  brand: "Acme, Inc.",
  productName: "Retin-A",
  href: "https://example.com/retin-a",
};

const QUOTED_PRODUCT_ROW: ShelfClickCsvRow = {
  createdAt: "2026-04-02T12:00:00.000Z",
  pageKind: "routine",
  pageSlug: "RoutineBareMinimum",
  brand: "Plain Brand",
  productName: 'The "Best" Serum',
  href: "https://example.com/best-serum",
};

const NEWLINE_HREF_ROW: ShelfClickCsvRow = {
  createdAt: "2026-04-03T12:00:00.000Z",
  pageKind: "concern",
  pageSlug: "ConcernRosacea",
  brand: "Plain Brand",
  productName: "Plain Product",
  href: "https://example.com/path?with=newline\nin-it",
};

const NON_ASCII_ROW: ShelfClickCsvRow = {
  createdAt: "2026-04-04T12:00:00.000Z",
  pageKind: "ingredient",
  pageSlug: "azelaic",
  brand: "L'Oréal Paris",
  productName: "Crème — 한국어 — 日本語 — 😀",
  href: "https://example.com/crème",
};

// ─────────────────────────────────────────────────────────────────────
// Assertions.
// ─────────────────────────────────────────────────────────────────────
const failures: string[] = [];

function expect(condition: boolean, message: string): void {
  if (!condition) failures.push(message);
}

// 1. Column header order — pinned against `EXPECTED_HEADERS`.
{
  const actual = SHELF_CLICK_CSV_COLUMNS.map((c) => c.header);
  expect(
    actual.length === EXPECTED_HEADERS.length &&
      actual.every((h, i) => h === EXPECTED_HEADERS[i]),
    `column header order changed: expected [${EXPECTED_HEADERS.join(
      ", ",
    )}], got [${actual.join(", ")}]`,
  );
}

// 2. Empty input → header-only output, terminated with CRLF, no body.
{
  const csv = rowsToCsv([], fixturePageLabel);
  expect(
    csv === `${EXPECTED_HEADER_LINE}\r\n`,
    `empty input must produce a header-only line ending in CRLF; got ${JSON.stringify(csv)}`,
  );
  // Sanity: split on CRLF should give the header and one trailing
  // empty string, with no stray records.
  const parts = csv.split("\r\n");
  expect(
    parts.length === 2 && parts[0] === EXPECTED_HEADER_LINE && parts[1] === "",
    `empty-input CSV split on CRLF should be [header, ""], got ${JSON.stringify(parts)}`,
  );
}

// 3. Escaping rules — comma in brand, embedded double-quote in
//    product name, newline in destination href.
{
  const csv = rowsToCsv(
    [COMMA_BRAND_ROW, QUOTED_PRODUCT_ROW, NEWLINE_HREF_ROW],
    fixturePageLabel,
  );

  expect(
    csv.startsWith(`${EXPECTED_HEADER_LINE}\r\n`),
    `serialised CSV should start with the header line + CRLF; got ${JSON.stringify(
      csv.slice(0, 80),
    )}`,
  );

  // Comma in brand → that cell wrapped in quotes.
  expect(
    csv.includes(',"Acme, Inc.",'),
    `comma-bearing brand "Acme, Inc." should be wrapped in quotes; full CSV: ${JSON.stringify(csv)}`,
  );

  // Embedded double-quote in product name → wrapped in quotes AND
  // the inner quotes doubled (`"` → `""`).
  expect(
    csv.includes(',"The ""Best"" Serum",'),
    `embedded quotes in product name should be doubled and the cell wrapped in quotes; full CSV: ${JSON.stringify(csv)}`,
  );

  // Newline in destination href → wrapped in quotes; raw \n survives
  // inside the quoted cell (RFC 4180 explicitly allows this).
  expect(
    csv.includes(',"https://example.com/path?with=newline\nin-it"\r\n'),
    `newline in destination href should be preserved inside a quoted cell; full CSV: ${JSON.stringify(csv)}`,
  );

  // No bare LF or bare CR outside the deliberately-embedded one in
  // NEWLINE_HREF_ROW: every other line break is a CRLF pair.
  // Strip the embedded \n first so the structural-newline scan is clean.
  const structural = csv.replace("newline\nin-it", "newline__in-it");
  // Bare LF check: every \n must be preceded by \r.
  for (let i = 0; i < structural.length; i++) {
    if (structural[i] === "\n") {
      expect(
        i > 0 && structural[i - 1] === "\r",
        `bare LF at offset ${i} (no preceding CR) — row terminators must be CRLF`,
      );
    }
    if (structural[i] === "\r") {
      expect(
        i + 1 < structural.length && structural[i + 1] === "\n",
        `bare CR at offset ${i} (no following LF) — row terminators must be CRLF`,
      );
    }
  }
}

// 4. CRLF row terminators between records (including a trailing one).
{
  const csv = rowsToCsv(
    [COMMA_BRAND_ROW, QUOTED_PRODUCT_ROW],
    fixturePageLabel,
  );
  expect(
    csv.endsWith("\r\n"),
    `CSV must end in CRLF so the final record is terminated; got tail ${JSON.stringify(
      csv.slice(-4),
    )}`,
  );
  // Header + 2 rows + trailing empty = 4 parts when split on CRLF.
  const parts = csv.split("\r\n");
  expect(
    parts.length === 4 && parts[parts.length - 1] === "",
    `CSV with N rows should split into N+2 CRLF-delimited parts ending with ""; got ${parts.length} parts`,
  );
  expect(
    parts[0] === EXPECTED_HEADER_LINE,
    `first CRLF-delimited part should be the header line; got ${JSON.stringify(parts[0])}`,
  );
}

// 5. Non-ASCII characters round-trip untouched.
{
  const csv = rowsToCsv([NON_ASCII_ROW], fixturePageLabel);
  expect(
    csv.includes("L'Oréal Paris"),
    `non-ASCII brand "L'Oréal Paris" should survive serialisation untouched; got ${JSON.stringify(csv)}`,
  );
  expect(
    csv.includes("Crème — 한국어 — 日本語 — 😀"),
    `non-ASCII product name should survive serialisation untouched; got ${JSON.stringify(csv)}`,
  );
  expect(
    csv.includes("https://example.com/crème"),
    `non-ASCII href should survive serialisation untouched; got ${JSON.stringify(csv)}`,
  );
}

// 6. BOM presence: U+FEFF is the only encoding hint we add, and it's
//    prepended (not embedded) so it sits at byte offset 0 of the
//    download payload.
{
  expect(
    CSV_BOM === "\uFEFF",
    `CSV_BOM must be the UTF-8 byte-order mark U+FEFF; got code points [${[
      ...CSV_BOM,
    ]
      .map((ch) => "U+" + ch.codePointAt(0)!.toString(16).toUpperCase())
      .join(", ")}]`,
  );
  const csv = rowsToCsv([COMMA_BRAND_ROW], fixturePageLabel);
  const downloadable = `${CSV_BOM}${csv}`;
  expect(
    downloadable.charCodeAt(0) === 0xfeff,
    `downloadable payload must begin with U+FEFF (BOM); first code unit was 0x${downloadable
      .charCodeAt(0)
      .toString(16)}`,
  );
  expect(
    downloadable.startsWith(`${CSV_BOM}${EXPECTED_HEADER_LINE}\r\n`),
    `downloadable payload must be BOM + header line + CRLF; got prefix ${JSON.stringify(
      downloadable.slice(0, 80),
    )}`,
  );
  // The BOM must not also appear inside `rowsToCsv` output — that
  // would double-BOM every download and confuse non-Excel readers.
  expect(
    !csv.includes("\uFEFF"),
    `rowsToCsv output must not contain a BOM (the BOM is added at download time); offset ${csv.indexOf(
      "\uFEFF",
    )}`,
  );
}

// 7. `escapeCsvCell` invariants — guard the helper directly so a
//    refactor that breaks it is caught even if `rowsToCsv` happens
//    to still pass.
{
  expect(
    escapeCsvCell("plain") === "plain",
    `escapeCsvCell should leave a plain cell unquoted; got ${JSON.stringify(
      escapeCsvCell("plain"),
    )}`,
  );
  expect(
    escapeCsvCell("a,b") === '"a,b"',
    `escapeCsvCell should quote a comma-bearing cell; got ${JSON.stringify(
      escapeCsvCell("a,b"),
    )}`,
  );
  expect(
    escapeCsvCell('she said "hi"') === '"she said ""hi"""',
    `escapeCsvCell should double embedded quotes; got ${JSON.stringify(
      escapeCsvCell('she said "hi"'),
    )}`,
  );
  expect(
    escapeCsvCell("line1\nline2") === '"line1\nline2"',
    `escapeCsvCell should quote a LF-bearing cell; got ${JSON.stringify(
      escapeCsvCell("line1\nline2"),
    )}`,
  );
  expect(
    escapeCsvCell("line1\r\nline2") === '"line1\r\nline2"',
    `escapeCsvCell should quote a CRLF-bearing cell; got ${JSON.stringify(
      escapeCsvCell("line1\r\nline2"),
    )}`,
  );
}

// ─────────────────────────────────────────────────────────────────────
// Report.
// ─────────────────────────────────────────────────────────────────────
if (failures.length === 0) {
  console.log(
    `✓ Shelf-click CSV export format OK — ${EXPECTED_HEADERS.length} columns in locked order ` +
      `(${EXPECTED_HEADERS.join(", ")}); RFC 4180 escaping for commas, embedded quotes, and ` +
      `newlines; CRLF terminators; UTF-8 BOM prepended at download time; non-ASCII preserved.`,
  );
  process.exit(0);
}

console.error(
  `✗ Shelf-click CSV export contract broken — ${failures.length} assertion(s) failed:`,
);
for (const f of failures) console.error(`  • ${f}`);
console.error(
  `\n   This guards the format editors' spreadsheets depend on:\n` +
    `   - column order in EXPECTED_HEADERS\n` +
    `   - RFC 4180 escaping (commas, doubled quotes, embedded newlines)\n` +
    `   - CRLF row terminators including the trailing one\n` +
    `   - UTF-8 BOM prepended at download time so Excel reads accents correctly`,
);
process.exit(1);
