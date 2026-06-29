// Pure CSV serialiser for the editor shelf-click dashboard.
//
// Editors download these CSVs into spreadsheets they keep templates
// against, so the on-the-wire format is a contract:
//   - Stable column order (`SHELF_CLICK_CSV_COLUMNS`)
//   - RFC 4180 escaping (commas, embedded quotes, newlines)
//   - CRLF row terminators (including a trailing terminator on the
//     final row so header-only output is still well-formed)
//   - UTF-8 BOM (`CSV_BOM`) prepended at download time so Excel on
//     Windows opens accented brand/product names with the right
//     encoding.
//
// The helpers live in their own module (rather than inside
// `EditorShelfClicks.tsx`) so `scripts/validate-shelf-csv-export.ts`
// can import and exercise them without dragging the React component
// tree along — the column order, escaping, and BOM are all pinned by
// that script via `pnpm validate:matchers` so a future refactor can't
// quietly corrupt every editor spreadsheet.

export type ShelfClickPageKind = "ingredient" | "routine" | "concern";

export type ShelfClickCsvRow = {
  createdAt: string;
  pageKind: ShelfClickPageKind;
  pageSlug: string;
  brand: string;
  productName: string;
  href: string;
};

// UTF-8 byte-order mark. Prepended in `downloadCsv` (not `rowsToCsv`)
// so callers that just want the textual CSV — including the
// validation script's escaping/CRLF assertions — can keep the body
// BOM-free, while every actual download still carries the BOM Excel
// needs.
export const CSV_BOM = "\uFEFF";

export type ShelfClickCsvColumn = {
  header: string;
  value: (
    row: ShelfClickCsvRow,
    pageLabel: (kind: ShelfClickPageKind, slug: string) => string,
  ) => string;
};

// Locked column order. Editors' spreadsheet templates index by
// position, so reordering / inserting / dropping columns silently
// breaks every saved formula. Add new columns at the *end* and
// extend the validation script's header-order assertion at the same
// time.
export const SHELF_CLICK_CSV_COLUMNS: ReadonlyArray<ShelfClickCsvColumn> = [
  { header: "when", value: (r) => r.createdAt },
  { header: "page kind", value: (r) => r.pageKind },
  {
    header: "page label",
    value: (r, pageLabel) => pageLabel(r.pageKind, r.pageSlug),
  },
  { header: "page slug", value: (r) => r.pageSlug },
  { header: "brand", value: (r) => r.brand },
  { header: "product", value: (r) => r.productName },
  { header: "destination href", value: (r) => r.href },
];

// RFC 4180 escaping: wrap in quotes when the cell contains a comma,
// double-quote, CR, or LF; double any embedded quotes.
export function escapeCsvCell(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// Serialise rows to CSV text. Empty input still produces a valid
// header line (terminated with CRLF) so editors get a header-only
// file rather than a zero-byte download. `pageLabel` is injected
// rather than imported so this module stays free of the catalogue
// dependencies the validation script doesn't need.
export function rowsToCsv(
  rows: ReadonlyArray<ShelfClickCsvRow>,
  pageLabel: (kind: ShelfClickPageKind, slug: string) => string,
): string {
  const lines: string[] = [
    SHELF_CLICK_CSV_COLUMNS.map((c) => escapeCsvCell(c.header)).join(","),
  ];
  for (const r of rows) {
    lines.push(
      SHELF_CLICK_CSV_COLUMNS.map((c) =>
        escapeCsvCell(c.value(r, pageLabel)),
      ).join(","),
    );
  }
  // Trailing CRLF keeps every record (including the header when the
  // body is empty) terminated, matching RFC 4180 and avoiding
  // surprising tools that expect line-terminated files.
  return `${lines.join("\r\n")}\r\n`;
}
