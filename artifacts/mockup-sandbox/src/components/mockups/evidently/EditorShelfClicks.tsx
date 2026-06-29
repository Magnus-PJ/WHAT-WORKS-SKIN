// EditorShelfClicks — editor-facing dashboard for outbound shelf
// clicks. Reads `GET /api/analytics/shelf-clicks` and groups the
// results by source page (ingredient / routine / concern) so editors
// can see which guides actually push readers through to brand sites.
//
// `pageSlug` semantics (from the OpenAPI spec):
//   - `pageKind: "ingredient"` → catalogue ingredient slug (e.g. `tretinoin`)
//   - `pageKind: "routine"` / `pageKind: "concern"` → detail-page
//     component file name (e.g. `RoutineBareMinimum`, `ConcernRosacea`)
//
// We resolve those slugs to human-readable titles via the same
// catalogues the rest of the site uses (`_links.tsx` for ingredients
// and concerns, `_routineCatalogue.ts` for routines) so the dashboard
// reads as page titles, not raw slugs.

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Download,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import {
  SiteHeader,
  SiteFooter,
  Breadcrumbs,
  Container,
  Eyebrow,
  PaperGrain,
  LaidPaper,
  TopVignette,
  AmbientFlask,
  SERIF,
  SERIF_ED,
  SANS,
  MONO,
} from "./_chrome";
import { T } from "./_theme";
import {
  CONCERNS,
  INGREDIENTS,
  concernHrefFor,
  ingredientHrefFor,
} from "./_links";
import { ROUTINE_BUILT, ROUTINE_ROWS } from "./_routineCatalogue";
import { invalidateEditorModeCache } from "./_editorMode";
import {
  CSV_BOM,
  rowsToCsv as serialiseRowsToCsv,
  type ShelfClickCsvRow,
} from "./_shelfClickCsv";
import {
  suggestNarrowing,
  type ShelfClickSuggestion,
} from "./_shelfClickSuggestion";

// ─────────────────────────────────────────────────────────────────────
// Types — mirror the OpenAPI `ShelfClickRecord` shape. We re-declare
// them locally rather than depend on `@workspace/api-zod` so this
// dashboard component can be developed alongside the rest of the
// preview pages without pulling in the codegen package.
// ─────────────────────────────────────────────────────────────────────
type PageKind = "ingredient" | "routine" | "concern";

type ShelfClickRecord = {
  id: number;
  createdAt: string;
  pageKind: PageKind;
  pageSlug: string;
  brand: string;
  productName: string;
  href: string;
  userAgent: string | null;
};

type ShelfClickList = {
  clicks: ShelfClickRecord[];
  // The row cap the server applied (echoed back so the dashboard can
  // phrase "showing the most recent N" using the server's own number)
  // and a flag the server sets when the response hit that cap.
  limit: number;
  hasMore: boolean;
  // True total of rows matching the request's filters (`pageKind` /
  // `pageSlug` / `since` / `until`), ignoring `limit`. Always present
  // — when the cap wasn't hit the server reports `clicks.length`
  // directly (which already is the true total in that case) so the
  // banner can quote a concrete miss without the dashboard having to
  // special-case a missing field.
  totalCount: number;
};

const PREVIEW_BASE = "/__mockup/preview/evidently";

// ─────────────────────────────────────────────────────────────────────
// Reverse lookups: pageSlug → human title and pageSlug → preview href.
//
// Routines and concerns store the detail-page component name as the
// `pageSlug` (multiple catalogue slugs can alias the same component),
// so we walk the slug→component map once per render to recover the
// catalogue row.
// ─────────────────────────────────────────────────────────────────────
function ingredientLabelFor(slug: string): string {
  return INGREDIENTS[slug]?.name ?? slug;
}

function routineLabelFor(component: string): string {
  const entry = Object.entries(ROUTINE_BUILT).find(
    ([, comp]) => comp === component,
  );
  if (!entry) return component;
  const [slug] = entry;
  const row = ROUTINE_ROWS.find((r) => r.slug === slug);
  return row ? `${row.sub} — ${row.title}` : component;
}

function concernLabelFor(component: string): string {
  const entry = Object.entries(CONCERNS).find(
    ([, e]) => e.component === component,
  );
  return entry ? entry[1].name : component;
}

function pageLabel(kind: PageKind, slug: string): string {
  if (kind === "ingredient") return ingredientLabelFor(slug);
  if (kind === "routine") return routineLabelFor(slug);
  return concernLabelFor(slug);
}

function pageHref(kind: PageKind, slug: string): string | null {
  if (kind === "ingredient") return ingredientHrefFor(slug);
  // Routines and concerns store the component file name directly, so
  // the preview href can be built without a slug-table lookup. We
  // confirm the component is one we host before linking, otherwise
  // editors get a broken preview.
  if (kind === "routine") {
    const known = Object.values(ROUTINE_BUILT).includes(slug);
    return known ? `${PREVIEW_BASE}/${slug}` : null;
  }
  const concernEntry = Object.values(CONCERNS).find(
    (e) => e.component === slug,
  );
  if (concernEntry) {
    // Use concernHrefFor with any slug pointing at this component so
    // the URL matches the canonical preview path.
    const slugForComponent = Object.entries(CONCERNS).find(
      ([, e]) => e.component === slug,
    )?.[0];
    return slugForComponent
      ? concernHrefFor(slugForComponent)
      : `${PREVIEW_BASE}/${slug}`;
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────
// Date-range chip selector. The API takes optional `since`/`until`
// ISO-8601 query params so the chosen window is filtered server-side
// (the row cap of 1000 then applies *within* that window rather than
// across the whole history). `All recent` sends no bounds and falls
// back to the most-recent 1000 rows.
// ─────────────────────────────────────────────────────────────────────
const RANGES = [
  { id: "24h", label: "Last 24 hours", hours: 24 },
  { id: "7d", label: "Last 7 days", hours: 24 * 7 },
  { id: "30d", label: "Last 30 days", hours: 24 * 30 },
  { id: "all", label: "All recent", hours: null as number | null },
] as const;

type RangeId = (typeof RANGES)[number]["id"];

function rangeStartMs(range: RangeId, now: number): number | null {
  const r = RANGES.find((x) => x.id === range)!;
  return r.hours === null ? null : now - r.hours * 60 * 60 * 1000;
}

const KIND_TINT: Record<PageKind, { fg: string; bg: string }> = {
  ingredient: { fg: T.accent, bg: T.accentSoft },
  routine: { fg: T.tierC, bg: T.tierCsoft },
  concern: { fg: T.tierD, bg: T.tierDsoft },
};

const KIND_LABEL: Record<PageKind, string> = {
  ingredient: "Ingredient",
  routine: "Routine",
  concern: "Concern",
};

const KIND_FILTERS: Array<{ id: PageKind | "all"; label: string }> = [
  { id: "all", label: "All pages" },
  { id: "ingredient", label: "Ingredients" },
  { id: "routine", label: "Routines" },
  { id: "concern", label: "Concerns" },
];

function formatRelative(iso: string, now: number): string {
  const t = new Date(iso).getTime();
  const diff = Math.max(0, now - t);
  const min = Math.round(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.round(hr / 24);
  if (d < 14) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function tryHostname(href: string): string {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return href;
  }
}

// ─────────────────────────────────────────────────────────────────────
// CSV export helpers. Editors hit "Download CSV" to pull the rows
// currently on screen (post date-range, post page-kind chip, and post
// drill-in) into a spreadsheet. The pure serialiser (column order,
// RFC 4180 escaping, CRLF terminators, header-only output for empty
// input) lives in `_shelfClickCsv.ts` so it can be exercised by
// `scripts/validate-shelf-csv-export.ts` without dragging the React
// component tree along. We just wrap it here with the dashboard's
// `pageLabel` resolver and the BOM-prefixed download blob.
// ─────────────────────────────────────────────────────────────────────
function rowsToCsv(rows: ReadonlyArray<ShelfClickRecord>): string {
  return serialiseRowsToCsv(rows as ReadonlyArray<ShelfClickCsvRow>, pageLabel);
}

function downloadCsv(filename: string, csv: string): void {
  // Prepend a UTF-8 BOM so Excel on Windows opens the file with the
  // correct encoding when product names or brands contain accents.
  const blob = new Blob([`${CSV_BOM}${csv}`], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function csvFilename(now: number): string {
  const d = new Date(now);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `shelf-clicks-${yyyy}-${mm}-${dd}.csv`;
}

// ─────────────────────────────────────────────────────────────────────
// Aggregations.
// ─────────────────────────────────────────────────────────────────────
type PageGroup = {
  key: string;
  pageKind: PageKind;
  pageSlug: string;
  label: string;
  href: string | null;
  total: number;
  topBrand: string;
  topBrandCount: number;
  lastClickAt: string;
};

function groupClicks(rows: ShelfClickRecord[]): PageGroup[] {
  const map = new Map<
    string,
    {
      pageKind: PageKind;
      pageSlug: string;
      total: number;
      brands: Map<string, number>;
      lastClickAt: string;
    }
  >();
  for (const r of rows) {
    const key = `${r.pageKind}:${r.pageSlug}`;
    let g = map.get(key);
    if (!g) {
      g = {
        pageKind: r.pageKind,
        pageSlug: r.pageSlug,
        total: 0,
        brands: new Map(),
        lastClickAt: r.createdAt,
      };
      map.set(key, g);
    }
    g.total += 1;
    g.brands.set(r.brand, (g.brands.get(r.brand) ?? 0) + 1);
    if (r.createdAt > g.lastClickAt) g.lastClickAt = r.createdAt;
  }
  return Array.from(map.entries())
    .map(([key, g]) => {
      let topBrand = "—";
      let topBrandCount = 0;
      for (const [b, c] of g.brands) {
        if (c > topBrandCount) {
          topBrand = b;
          topBrandCount = c;
        }
      }
      return {
        key,
        pageKind: g.pageKind,
        pageSlug: g.pageSlug,
        label: pageLabel(g.pageKind, g.pageSlug),
        href: pageHref(g.pageKind, g.pageSlug),
        total: g.total,
        topBrand,
        topBrandCount,
        lastClickAt: g.lastClickAt,
      };
    })
    .sort((a, b) => b.total - a.total || a.label.localeCompare(b.label));
}

// Inverse of `groupClicks`: pivots the same rows by destination brand
// so editors can see which brands receive the most outbound traffic
// across all guides. The brand view doesn't drill in (no per-brand
// detail screen yet), but it does surface the top product per brand
// so editors get a one-line answer to "which SKU is doing the work?".
type BrandGroup = {
  brand: string;
  total: number;
  topProduct: string;
  topProductCount: number;
  lastClickAt: string;
};

function groupClicksByBrand(rows: ShelfClickRecord[]): BrandGroup[] {
  const map = new Map<
    string,
    {
      total: number;
      products: Map<string, number>;
      lastClickAt: string;
    }
  >();
  for (const r of rows) {
    let g = map.get(r.brand);
    if (!g) {
      g = { total: 0, products: new Map(), lastClickAt: r.createdAt };
      map.set(r.brand, g);
    }
    g.total += 1;
    g.products.set(r.productName, (g.products.get(r.productName) ?? 0) + 1);
    if (r.createdAt > g.lastClickAt) g.lastClickAt = r.createdAt;
  }
  return Array.from(map.entries())
    .map(([brand, g]) => {
      let topProduct = "—";
      let topProductCount = 0;
      for (const [p, c] of g.products) {
        if (c > topProductCount) {
          topProduct = p;
          topProductCount = c;
        }
      }
      return {
        brand,
        total: g.total,
        topProduct,
        topProductCount,
        lastClickAt: g.lastClickAt,
      };
    })
    .sort((a, b) => b.total - a.total || a.brand.localeCompare(b.brand));
}

// Per-brand drill aggregate: the inverse of `DrillView`'s page slice.
// Given the same `filteredRows` the brand table renders, pull every
// click destined for one brand and break it down by the source guide
// that drove it and by the product that was clicked. Both lists are
// sorted by clicks desc so the highest-traffic source / SKU shows up
// first, mirroring the page-pivot drill's ordering. Returns `null`
// when the brand has no clicks in the active range so the caller can
// fall through to the brand list instead of rendering an empty drill.
type BrandDrillPage = {
  key: string;
  pageKind: PageKind;
  pageSlug: string;
  label: string;
  href: string | null;
  total: number;
};

type BrandDrillProduct = {
  productName: string;
  total: number;
};

type BrandDrillAggregate = {
  brand: string;
  total: number;
  pages: BrandDrillPage[];
  products: BrandDrillProduct[];
  lastClickAt: string;
  rows: ShelfClickRecord[];
};

function aggregateBrandDrill(
  rows: ShelfClickRecord[],
  brand: string,
): BrandDrillAggregate | null {
  const matching = rows.filter((r) => r.brand === brand);
  if (matching.length === 0) return null;
  const pageMap = new Map<string, BrandDrillPage>();
  const productMap = new Map<string, number>();
  let lastClickAt = matching[0].createdAt;
  for (const r of matching) {
    const key = `${r.pageKind}:${r.pageSlug}`;
    let p = pageMap.get(key);
    if (!p) {
      p = {
        key,
        pageKind: r.pageKind,
        pageSlug: r.pageSlug,
        label: pageLabel(r.pageKind, r.pageSlug),
        href: pageHref(r.pageKind, r.pageSlug),
        total: 0,
      };
      pageMap.set(key, p);
    }
    p.total += 1;
    productMap.set(r.productName, (productMap.get(r.productName) ?? 0) + 1);
    if (r.createdAt > lastClickAt) lastClickAt = r.createdAt;
  }
  const pages = Array.from(pageMap.values()).sort(
    (a, b) => b.total - a.total || a.label.localeCompare(b.label),
  );
  const products = Array.from(productMap.entries())
    .map(([productName, total]) => ({ productName, total }))
    .sort(
      (a, b) =>
        b.total - a.total || a.productName.localeCompare(b.productName),
    );
  return {
    brand,
    total: matching.length,
    pages,
    products,
    lastClickAt,
    rows: matching,
  };
}

// ─────────────────────────────────────────────────────────────────────
// API. Lives inside the component file because no other preview page
// hits a JSON API today; if/when we add more, this can move into a
// shared `_api.ts`.
// ─────────────────────────────────────────────────────────────────────
const ENDPOINT = "/api/analytics/shelf-clicks";
const EXPORT_ENDPOINT = "/api/analytics/shelf-clicks/export";
const SIGN_IN_ENDPOINT = "/api/editor/sign-in";

// ─────────────────────────────────────────────────────────────────────
// `?page=<kind>:<slug>` deep link.
//
// Guide pages render an editor-only "Open shelf-click data for this
// page →" link that lands here with the relevant slice already drilled
// into. The query param value matches the dashboard's internal
// `${pageKind}:${pageSlug}` group key so once the rows have loaded the
// page just sets `drillKey` to it and the existing `groups.find` lookup
// surfaces the right group. Rejecting unknown `pageKind` values keeps
// a malformed URL from breaking the dashboard.
// ─────────────────────────────────────────────────────────────────────
const VALID_PAGE_KINDS: ReadonlySet<string> = new Set([
  "ingredient",
  "routine",
  "concern",
]);

function readDeepLinkPageParam(): string | null {
  if (typeof window === "undefined") return null;
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(window.location.search);
  } catch {
    return null;
  }
  const raw = params.get("page");
  if (!raw) return null;
  const colon = raw.indexOf(":");
  if (colon <= 0 || colon === raw.length - 1) return null;
  const kind = raw.slice(0, colon);
  const slug = raw.slice(colon + 1);
  if (!VALID_PAGE_KINDS.has(kind)) return null;
  // Sanity-check the slug shape — accept any printable, non-whitespace
  // identifier the catalogue might use without forcing a per-kind
  // regex here (the dashboard's group lookup already silently ignores
  // a deep link to a page with no clicks in the active range, so a
  // typo just falls back to the grouped list).
  if (slug.length === 0 || /\s/.test(slug)) return null;
  return `${kind}:${slug}`;
}

// Drop the `?page=<kind>:<slug>` deep-link param from the address bar
// without navigating. Called whenever the editor leaves drilled-in
// mode (back button, range chip, brand-pivot toggle) so a manual
// refresh keeps them on the all-pages view instead of pulling them
// back into the drilled-in slice they just exited. Other query params
// and the path/hash are preserved; this is a no-op when `page` isn't
// present, so it's safe to call from any drill-clearing code path.
function clearDeepLinkPageParam(): void {
  if (typeof window === "undefined") return;
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(window.location.search);
  } catch {
    return;
  }
  if (!params.has("page")) return;
  params.delete("page");
  const qs = params.toString();
  const newUrl = `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`;
  window.history.replaceState(null, "", newUrl);
}

// Map a `<kind>:<slug>` deep-link key back to the public guide URL it
// was generated from, so a non-editor who lands on the dashboard via a
// shared / pasted deep link can be silently redirected to the matching
// public page instead of seeing the sign-in form. Returns `null` when
// the key is malformed or the slug doesn't resolve to a built guide
// (in which case the caller falls through to the normal sign-in
// gate — no useful public destination to send them to).
export function publicHrefForDeepLink(deepLink: string): string | null {
  const colon = deepLink.indexOf(":");
  if (colon <= 0 || colon === deepLink.length - 1) return null;
  const kind = deepLink.slice(0, colon);
  const slug = deepLink.slice(colon + 1);
  if (!VALID_PAGE_KINDS.has(kind)) return null;
  return pageHref(kind as PageKind, slug);
}

// Sentinel error thrown when the API returns 401 so the page can fall
// through to the sign-in screen instead of showing a generic banner.
class EditorAuthRequiredError extends Error {
  constructor() {
    super("editor_auth_required");
    this.name = "EditorAuthRequiredError";
  }
}

function buildEndpoint(
  sinceMs: number | null,
  untilMs: number | null,
): string {
  const params = new URLSearchParams({ limit: "1000" });
  if (sinceMs !== null) {
    params.set("since", new Date(sinceMs).toISOString());
  }
  if (untilMs !== null) {
    params.set("until", new Date(untilMs).toISOString());
  }
  return `${ENDPOINT}?${params.toString()}`;
}

async function fetchShelfClicks(
  sinceMs: number | null,
  untilMs: number | null,
  signal: AbortSignal,
): Promise<ShelfClickList> {
  // The signed-cookie session set by `POST /editor/sign-in` is the
  // only thing that authorises this call. `credentials: "include"` is
  // required so the cookie is sent even when the API is on a different
  // origin (it's same-origin in this project, but include keeps the
  // call honest if that ever changes).
  const res = await fetch(buildEndpoint(sinceMs, untilMs), {
    signal,
    headers: { accept: "application/json" },
    credentials: "include",
  });
  if (res.status === 401) {
    throw new EditorAuthRequiredError();
  }
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }
  const body = (await res.json()) as ShelfClickList;
  // Validate the three response fields the dashboard relies on. The
  // generated zod parser already runs on the server side, but the
  // client only sees the wire JSON, so a defensive check here keeps a
  // malformed backend from silently rendering an empty banner state.
  if (!body || !Array.isArray(body.clicks)) {
    throw new Error("Malformed response: missing `clicks` array");
  }
  if (typeof body.limit !== "number") {
    throw new Error("Malformed response: missing or non-numeric `limit`");
  }
  if (typeof body.hasMore !== "boolean") {
    throw new Error("Malformed response: missing or non-boolean `hasMore`");
  }
  // `totalCount` is required so the banner never has to special-case
  // its absence. Reject anything other than a finite non-negative
  // number — silently coercing a malformed value would let the banner
  // quote a misleading total.
  if (
    typeof body.totalCount !== "number" ||
    !Number.isFinite(body.totalCount) ||
    body.totalCount < 0
  ) {
    throw new Error("Malformed response: missing or invalid `totalCount`");
  }
  return body;
}

// ─────────────────────────────────────────────────────────────────────
// Bounded-window CSV export.
//
// The dashboard's listing endpoint is capped at 1000 rows so a busy
// month silently truncates the totals. The companion
// `GET /analytics/shelf-clicks/export` route streams every matching row
// as NDJSON (one JSON object per line) so this client can build the
// full-window CSV via the same `rowsToCsv` helper used for in-memory
// exports — column order, escaping, and page-label resolution stay
// identical to a small-window export by construction.
//
// We parse the stream incrementally rather than buffering the whole
// response so very large windows don't spike browser memory: each
// completed line becomes a record, the partial last chunk is held in
// `buffer` until the next chunk fills it, and a final flush drains
// whatever is left when the server closes the stream.
// ─────────────────────────────────────────────────────────────────────
function buildExportEndpoint(opts: {
  sinceMs: number | null;
  untilMs: number | null;
  pageKind: PageKind | null;
  pageSlug: string | null;
}): string {
  const params = new URLSearchParams();
  if (opts.sinceMs !== null) {
    params.set("since", new Date(opts.sinceMs).toISOString());
  }
  if (opts.untilMs !== null) {
    params.set("until", new Date(opts.untilMs).toISOString());
  }
  if (opts.pageKind) params.set("pageKind", opts.pageKind);
  if (opts.pageSlug) params.set("pageSlug", opts.pageSlug);
  const qs = params.toString();
  return qs ? `${EXPORT_ENDPOINT}?${qs}` : EXPORT_ENDPOINT;
}

function parseStreamedRecord(line: string): ShelfClickRecord | null {
  const trimmed = line.trim();
  if (trimmed === "") return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    // A malformed line means the server cut the response off mid-row
    // (most likely an internal error after headers were sent). Throwing
    // here surfaces the failure in the dashboard rather than silently
    // dropping rows.
    throw new Error("Malformed NDJSON line in shelf-click export stream.");
  }
  if (
    !parsed ||
    typeof parsed !== "object" ||
    typeof (parsed as { id?: unknown }).id !== "number" ||
    typeof (parsed as { createdAt?: unknown }).createdAt !== "string"
  ) {
    throw new Error("Malformed NDJSON record in shelf-click export stream.");
  }
  return parsed as ShelfClickRecord;
}

async function fetchAllShelfClicks(opts: {
  sinceMs: number | null;
  untilMs: number | null;
  pageKind: PageKind | null;
  pageSlug: string | null;
  signal: AbortSignal;
}): Promise<ShelfClickRecord[]> {
  const res = await fetch(buildExportEndpoint(opts), {
    signal: opts.signal,
    headers: { accept: "application/x-ndjson" },
    credentials: "include",
  });
  if (res.status === 401) throw new EditorAuthRequiredError();
  if (!res.ok) {
    throw new Error(`Export failed: ${res.status} ${res.statusText}`);
  }
  if (!res.body) {
    // No streaming reader available — fall back to a single-shot
    // text read so the helper still works on browsers without the
    // ReadableStream API exposed on `fetch`.
    const text = await res.text();
    const records: ShelfClickRecord[] = [];
    for (const line of text.split("\n")) {
      const record = parseStreamedRecord(line);
      if (record) records.push(record);
    }
    return records;
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  const records: ShelfClickRecord[] = [];
  let buffer = "";
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { value, done } = await reader.read();
    if (value) {
      buffer += decoder.decode(value, { stream: true });
      let newlineAt = buffer.indexOf("\n");
      while (newlineAt !== -1) {
        const line = buffer.slice(0, newlineAt);
        buffer = buffer.slice(newlineAt + 1);
        const record = parseStreamedRecord(line);
        if (record) records.push(record);
        newlineAt = buffer.indexOf("\n");
      }
    }
    if (done) break;
  }
  // Drain any final, non-newline-terminated line plus the decoder's
  // trailing state. NDJSON is line-terminated, but a server that
  // omitted the trailing `\n` shouldn't lose the last record.
  buffer += decoder.decode();
  const tail = parseStreamedRecord(buffer);
  if (tail) records.push(tail);
  return records;
}

async function signInEditor(token: string): Promise<void> {
  const res = await fetch(SIGN_IN_ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ token }),
  });
  if (res.status === 401) {
    throw new Error("That editor token wasn't accepted. Double-check it.");
  }
  if (!res.ok) {
    throw new Error(`Sign-in failed: ${res.status} ${res.statusText}`);
  }
  // Drop the cached `useEditorMode()` probe so any guide page rendered
  // in the same tab refetches and can reveal the editor-only deep
  // link without forcing a full reload.
  invalidateEditorModeCache();
}

// ─────────────────────────────────────────────────────────────────────
// Sub-components.
// ─────────────────────────────────────────────────────────────────────
const KindBadge: React.FC<{ kind: PageKind }> = ({ kind }) => {
  const tint = KIND_TINT[kind];
  return (
    <span
      className="inline-flex items-center"
      style={{
        fontFamily: SANS,
        fontSize: 9.5,
        letterSpacing: "0.16em",
        fontWeight: 700,
        color: tint.fg,
        background: tint.bg,
        border: `1px solid ${tint.fg}55`,
        padding: "3px 8px",
        borderRadius: 2,
        textTransform: "uppercase",
      }}
    >
      {KIND_LABEL[kind]}
    </span>
  );
};

const Chip: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      fontFamily: SANS,
      fontSize: 12.5,
      fontWeight: active ? 600 : 500,
      letterSpacing: "0.02em",
      color: active ? T.paper : T.inkSoft,
      background: active ? T.ink : T.paper,
      border: `1px solid ${active ? T.ink : T.rule}`,
      padding: "7px 14px",
      borderRadius: 999,
      cursor: "pointer",
    }}
  >
    {children}
  </button>
);

const StatTile: React.FC<{
  label: string;
  value: string | number;
  hint?: string;
  tint?: string;
}> = ({ label, value, hint, tint }) => (
  <div
    className="px-6 py-6"
    style={{ background: T.paper, border: `1px solid ${T.rule}` }}
  >
    <div
      style={{
        fontFamily: MONO,
        fontSize: 10,
        letterSpacing: "0.18em",
        color: T.mutedSoft,
        textTransform: "uppercase",
      }}
    >
      {label}
    </div>
    <div
      className="mt-3"
      style={{
        fontFamily: SERIF,
        fontSize: 44,
        lineHeight: 1,
        color: tint ?? T.ink,
        fontVariationSettings: '"opsz" 144',
      }}
    >
      {value}
    </div>
    {hint && (
      <div
        className="mt-2"
        style={{
          fontFamily: SERIF_ED,
          fontStyle: "italic",
          fontSize: 13,
          color: T.muted,
        }}
      >
        {hint}
      </div>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────
// Sign-in gate. Editors paste the shared editor token once; the API
// exchanges it for an HttpOnly signed cookie and we never hold the
// raw value in component state past the POST.
// ─────────────────────────────────────────────────────────────────────
const SignInScreen: React.FC<{ onSignedIn: () => void }> = ({
  onSignedIn,
}) => {
  const [token, setToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setErr(null);
    try {
      await signInEditor(token);
      setToken("");
      onSignedIn();
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : String(e2));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden flex flex-col"
      style={{ background: T.paper, color: T.ink }}
    >
      <PaperGrain />
      <LaidPaper />
      <TopVignette />
      <SiteHeader />
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-16">
        <form
          onSubmit={submit}
          className="w-full max-w-md"
          style={{
            background: T.paper,
            border: `1px solid ${T.rule}`,
            padding: "32px 28px",
          }}
        >
          <Eyebrow color={T.accent}>Editor desk</Eyebrow>
          <h2
            className="mt-3"
            style={{
              fontFamily: SERIF,
              fontSize: 32,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              color: T.ink,
            }}
          >
            Sign in to the shelf-click dashboard
          </h2>
          <p
            className="mt-3"
            style={{
              fontFamily: SERIF_ED,
              fontStyle: "italic",
              fontSize: 14,
              color: T.muted,
            }}
          >
            Paste the shared editor token once. We&rsquo;ll exchange it for
            a session cookie so you don&rsquo;t have to enter it again on
            this device for the next 30 days.
          </p>
          <label
            htmlFor="editor-token"
            className="block mt-6"
            style={{
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: "0.18em",
              color: T.mutedSoft,
              textTransform: "uppercase",
            }}
          >
            Editor token
          </label>
          <input
            id="editor-token"
            type="password"
            autoComplete="current-password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            disabled={submitting}
            className="block w-full mt-2"
            style={{
              fontFamily: MONO,
              fontSize: 14,
              color: T.ink,
              background: T.paper,
              border: `1px solid ${T.rule}`,
              padding: "10px 12px",
              outline: "none",
            }}
          />
          {err && (
            <div
              className="mt-4 px-3 py-2"
              style={{
                background: T.dangerSoft,
                border: `1px solid ${T.danger}55`,
                color: T.danger,
                fontFamily: SANS,
                fontSize: 12.5,
              }}
            >
              {err}
            </div>
          )}
          <button
            type="submit"
            disabled={submitting || !token}
            className="inline-flex items-center mt-6"
            style={{
              fontFamily: SANS,
              fontSize: 12.5,
              fontWeight: 600,
              color: T.paper,
              background: T.ink,
              border: `1px solid ${T.ink}`,
              padding: "9px 18px",
              opacity: submitting || !token ? 0.5 : 1,
              cursor: submitting || !token ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────
// Main component.
// ─────────────────────────────────────────────────────────────────────
const EditorShelfClicks: React.FC = () => {
  const [rows, setRows] = useState<ShelfClickRecord[] | null>(null);
  // `cap` mirrors the server response: the row cap that was applied,
  // whether that cap was actually hit, and the true total of rows
  // matching the same filters. When `hasMore` is true we surface a
  // banner above the totals so editors know the numbers on screen
  // are a truncated view of a larger window, and use `totalCount` to
  // quote the concrete miss ("most recent 1,000 of 12,438") instead
  // of just gesturing at it.
  const [cap, setCap] = useState<{
    limit: number;
    hasMore: boolean;
    totalCount: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);
  const [range, setRange] = useState<RangeId>("7d");
  const [kindFilter, setKindFilter] = useState<PageKind | "all">("all");
  // Which pivot the body table is showing. "page" groups clicks by
  // source guide (the original view); "brand" pivots the same rows by
  // destination brand so editors can see which brands are receiving
  // the most outbound traffic across all guides. The drill-in screen
  // is only meaningful for the page view, so switching to "brand"
  // also clears the drill state below.
  const [view, setView] = useState<"page" | "brand">("page");
  const [drillKey, setDrillKey] = useState<string | null>(null);
  // Brand-pivot counterpart to `drillKey`. When set (and the brand
  // pivot is active) the body swaps the brand list for a per-brand
  // breakdown by source guide and product. Page and brand drills are
  // mutually exclusive — toggling pivots or hitting the back button
  // clears this so the state never leaks across views.
  const [brandDrillKey, setBrandDrillKey] = useState<string | null>(null);
  // Pending deep-link target read off the URL on mount. We can't apply
  // it as `drillKey` immediately because the rows haven't loaded yet
  // (and `groups.find` would silently return null), so we hold the
  // value here and consume it once the row fetch resolves and matches.
  const [pendingDrillKey, setPendingDrillKey] = useState<string | null>(
    () => readDeepLinkPageParam(),
  );
  const [now, setNow] = useState<number>(() => Date.now());
  // `needsSignIn` flips on whenever the API answers 401, so the page
  // can swap the dashboard out for a sign-in form. The token never
  // lives in component state past the sign-in POST.
  const [needsSignIn, setNeedsSignIn] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    // Compute the bounds from the chosen range chip so the SQL
    // `WHERE` does the date filter; we still apply the same predicate
    // client-side below to stay defensive against clock drift. For
    // bounded windows we send `until = now` too so the server-side
    // window matches the chip's intent exactly.
    const nowMs = Date.now();
    const sinceMs = rangeStartMs(range, nowMs);
    const untilMs = sinceMs === null ? null : nowMs;
    fetchShelfClicks(sinceMs, untilMs, ctrl.signal)
      .then((response) => {
        setRows(response.clicks);
        setCap({
          limit: response.limit,
          hasMore: response.hasMore,
          totalCount: response.totalCount,
        });
        setNeedsSignIn(false);
        setNow(Date.now());
      })
      .catch((err: unknown) => {
        if ((err as { name?: string }).name === "AbortError") return;
        if (err instanceof EditorAuthRequiredError) {
          // Social-share / accidental-paste hygiene: if a non-editor
          // landed here via the editor-only "Open shelf-click data for
          // this page →" deep link (`?page=<kind>:<slug>`), silently
          // redirect them to the matching public guide page instead of
          // exposing the sign-in form. We use `replace()` so the
          // dashboard URL doesn't end up in their back-button history.
          // If the deep-link slug doesn't resolve to a built guide we
          // fall through to the normal sign-in gate — the editor still
          // needs a way in even when the URL is unhelpful.
          if (pendingDrillKey && typeof window !== "undefined") {
            const target = publicHrefForDeepLink(pendingDrillKey);
            if (target) {
              window.location.replace(target);
              return;
            }
          }
          setNeedsSignIn(true);
          setRows(null);
          setCap(null);
          return;
        }
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
      })
      .finally(() => {
        setLoading(false);
      });
    return () => ctrl.abort();
  }, [refreshTick, range]);

  // Apply date-range + kind filters once, then derive both the group
  // table and (if drilled in) the row list from the same source.
  const filteredRows = useMemo<ShelfClickRecord[]>(() => {
    if (!rows) return [];
    const startMs = rangeStartMs(range, now);
    return rows.filter((r) => {
      if (startMs !== null && new Date(r.createdAt).getTime() < startMs) {
        return false;
      }
      if (kindFilter !== "all" && r.pageKind !== kindFilter) return false;
      return true;
    });
  }, [rows, range, kindFilter, now]);

  const groups = useMemo(() => groupClicks(filteredRows), [filteredRows]);
  // Brand-pivoted aggregate of the same `filteredRows`. Computed
  // unconditionally so flipping the view toggle is instant — the
  // result is small (one row per brand) so this is cheap.
  const brandGroups = useMemo(
    () => groupClicksByBrand(filteredRows),
    [filteredRows],
  );

  // Once the rows have loaded and grouped, apply any pending deep-link
  // target from the URL (`?page=<kind>:<slug>`). We only consume the
  // pending value when the matching group actually exists so a deep
  // link to a page with no clicks in the active range falls back to
  // the grouped list (and re-running the effect won't re-apply the
  // value once an editor manually clicks "Back to all pages").
  useEffect(() => {
    if (!pendingDrillKey) return;
    if (groups.length === 0) return;
    if (groups.some((g) => g.key === pendingDrillKey)) {
      // Deep links target a specific source page, so make sure we're
      // on the page view before drilling in (an editor following the
      // link from a guide expects to land on that guide's slice, not
      // the brand pivot they happened to leave the dashboard on).
      setView("page");
      setDrillKey(pendingDrillKey);
    }
    setPendingDrillKey(null);
  }, [pendingDrillKey, groups]);

  const totals = useMemo(() => {
    const byKind: Record<PageKind, number> = {
      ingredient: 0,
      routine: 0,
      concern: 0,
    };
    for (const r of filteredRows) {
      byKind[r.pageKind] += 1;
    }
    return {
      total: filteredRows.length,
      byKind,
      pages: groups.length,
    };
  }, [filteredRows, groups]);

  const drilled = useMemo(() => {
    // Drill-in is a page-view concept; suppress it when the editor
    // has flipped over to the brand pivot so the back-button section
    // doesn't render on top of the brand table.
    if (view !== "page") return null;
    if (!drillKey) return null;
    const group = groups.find((g) => g.key === drillKey) ?? null;
    if (!group) return null;
    const recent = filteredRows
      .filter(
        (r) =>
          r.pageKind === group.pageKind && r.pageSlug === group.pageSlug,
      )
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return { group, recent };
  }, [view, drillKey, groups, filteredRows]);

  // Brand-drill counterpart of `drilled`. Only meaningful in the
  // brand pivot, and only when the selected brand actually has clicks
  // in the active range — otherwise the drill view would render an
  // empty shell, so we fall back to the brand list (the next render
  // will show it because `brandDrilled` is null) and the editor can
  // pick a different brand.
  const brandDrilled = useMemo(() => {
    if (view !== "brand") return null;
    if (!brandDrillKey) return null;
    return aggregateBrandDrill(filteredRows, brandDrillKey);
  }, [view, brandDrillKey, filteredRows]);

  // Clear a stale brand-drill key once we know the active filter set
  // doesn't contain that brand any more (e.g. the editor flipped the
  // page-kind chip to "ingredient" while drilled into a brand whose
  // clicks are all on routine pages). Without this, toggling the
  // filter back later would silently re-enter the drill, which is
  // surprising. We only act once `rows` has loaded so an in-flight
  // refresh doesn't accidentally clear the key on transient empty
  // data.
  useEffect(() => {
    if (view !== "brand") return;
    if (!brandDrillKey) return;
    if (rows === null) return;
    if (filteredRows.some((r) => r.brand === brandDrillKey)) return;
    setBrandDrillKey(null);
  }, [view, brandDrillKey, rows, filteredRows]);

  const refresh = (): void => setRefreshTick((n) => n + 1);

  // Truncation suggestion: when the API capped the response, derive a
  // concrete narrower filter from the rows we already have so the
  // banner can offer a one-click fix instead of just gesturing at the
  // chips. The suggestion is computed against `rows` (the unfiltered
  // server slice) and the cap fields it returned alongside, so it
  // doesn't shift around when the editor flips the page-kind chip
  // client-side. Returns `null` when nothing useful can be suggested
  // (e.g. an already-narrowed kind filter and no smaller built-in
  // range fits) — the banner falls back to its existing prompt.
  const truncationSuggestion = useMemo<ShelfClickSuggestion | null>(() => {
    if (!cap?.hasMore) return null;
    if (!rows || rows.length === 0) return null;
    return suggestNarrowing(
      rows,
      range,
      kindFilter,
      { limit: cap.limit, totalCount: cap.totalCount },
    );
  }, [cap, rows, range, kindFilter]);

  // Rows that the export button should write out. When the editor has
  // drilled into a single page, "what's currently shown" is just that
  // page's recent clicks; otherwise it's everything the dashboard tile
  // and group table are summarising. Either way we go through the same
  // `filteredRows` pipeline so the date-range chip + page-kind chip
  // already apply.
  const exportRows = useMemo<ShelfClickRecord[]>(() => {
    if (drilled) return drilled.recent;
    // When the editor has drilled into a brand, the visible payload is
    // just that brand's clicks — match the page-drill behaviour and
    // export only those rows so the CSV doesn't silently include rows
    // for brands the editor isn't looking at.
    if (brandDrilled) return brandDrilled.rows;
    return filteredRows;
  }, [drilled, brandDrilled, filteredRows]);

  // The button is disabled while data is still loading (we don't know
  // what the visible set is yet) and while the page is showing an
  // error banner. Empty filters are *not* a disable reason — per spec
  // we still emit a header-only CSV in that case. We also disable
  // while a streamed export is in flight so a second click can't kick
  // off a parallel download against the same window.
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const exportDisabled = loading || error !== null || exporting;

  const handleDownloadCsv = (): void => {
    if (exportDisabled) return;
    setExportError(null);
    // The dashboard's listing endpoint caps at 1000 rows so the
    // in-memory `exportRows` may be a most-recent slice rather than the
    // full window the editor selected. When the editor has narrowed to
    // a bounded date range OR drilled into a specific page we fetch
    // every matching row from the streaming export endpoint so the CSV
    // covers the full intent. The "All recent" + no-drill case has no
    // bounds at all, so we keep the existing in-memory path (the same
    // 1000-row preview the dashboard is already showing) rather than
    // pulling the entire history blindly.
    const nowMs = now;
    const sinceMs = rangeStartMs(range, nowMs);
    const untilMs = sinceMs === null ? null : nowMs;
    const drillKind = drilled ? drilled.group.pageKind : null;
    const drillSlug = drilled ? drilled.group.pageSlug : null;
    const useStreamingExport =
      sinceMs !== null || drillKind !== null;
    if (!useStreamingExport) {
      downloadCsv(csvFilename(Date.now()), rowsToCsv(exportRows));
      return;
    }
    const ctrl = new AbortController();
    setExporting(true);
    fetchAllShelfClicks({
      sinceMs,
      untilMs,
      pageKind: drillKind,
      pageSlug: drillSlug,
      signal: ctrl.signal,
    })
      .then((records) => {
        // Apply the active page-kind chip on the client so the CSV
        // matches the dashboard's visible filter when the editor is
        // looking at a specific kind. The export endpoint accepts a
        // single `pageKind`, but we also fold "all kinds" through the
        // same code path for symmetry with the in-memory exporter.
        const filtered =
          kindFilter === "all"
            ? records
            : records.filter((r) => r.pageKind === kindFilter);
        downloadCsv(csvFilename(Date.now()), rowsToCsv(filtered));
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (err instanceof EditorAuthRequiredError) {
          // Session expired mid-export; trigger the same sign-in
          // fallthrough the listing fetcher uses.
          setNeedsSignIn(true);
          return;
        }
        setExportError(
          err instanceof Error ? err.message : "Failed to export CSV.",
        );
      })
      .finally(() => {
        setExporting(false);
      });
  };

  if (needsSignIn) {
    return <SignInScreen onSignedIn={refresh} />;
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: T.paper, color: T.ink }}
    >
      <PaperGrain />
      <LaidPaper />
      <TopVignette />

      <SiteHeader />
      <Breadcrumbs
        trail={[
          { label: "Home", href: `${PREVIEW_BASE}/Home` },
          { label: "Editor desk", href: `${PREVIEW_BASE}/Editors` },
          { label: "Shelf clicks" },
        ]}
      />

      {/* Hero */}
      <section
        className="relative z-10 border-b overflow-hidden"
        style={{
          borderColor: T.rule,
          background: `linear-gradient(180deg, ${T.paper2} 0%, ${T.paper} 100%)`,
        }}
      >
        <Container>
          <div className="grid grid-cols-12 gap-8 py-14">
            <div className="col-span-12 md:col-span-8">
              <Eyebrow color={T.accent}>Editor desk · Shelf clicks</Eyebrow>
              <h1
                className="mt-4"
                style={{
                  fontFamily: SERIF,
                  fontSize: 76,
                  lineHeight: 0.98,
                  letterSpacing: "-0.03em",
                  fontWeight: 400,
                  color: T.ink,
                  fontVariationSettings: '"opsz" 144',
                }}
              >
                Which pages{" "}
                <span
                  style={{
                    fontStyle: "italic",
                    color: T.accent,
                    fontFamily: SERIF_ED,
                  }}
                >
                  push readers out?
                </span>
              </h1>
              <p
                className="mt-6 max-w-2xl"
                style={{
                  fontFamily: SERIF_ED,
                  fontStyle: "italic",
                  fontSize: 19,
                  lineHeight: 1.55,
                  color: T.muted,
                }}
              >
                Every &ldquo;Visit brand&rdquo; click leaving an editorial
                page — grouped by source page, so you can see whether a new
                routine or concern guide is actually doing the work the
                ingredient briefs already do.
              </p>
            </div>
            <div className="col-span-12 md:col-span-4 flex md:justify-end items-start gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleDownloadCsv}
                disabled={exportDisabled}
                title={
                  exporting
                    ? "Streaming the full window from the server…"
                    : drilled
                      ? `Download every click for ${drilled.group.label} in the selected range as CSV`
                      : range !== "all"
                        ? "Download every click in the selected date range as CSV"
                        : `Download the ${exportRows.length} click${exportRows.length === 1 ? "" : "s"} shown as CSV`
                }
                className="inline-flex items-center gap-2"
                style={{
                  fontFamily: SANS,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: T.paper,
                  background: T.ink,
                  border: `1px solid ${T.ink}`,
                  padding: "9px 16px",
                  opacity: exportDisabled ? 0.5 : 1,
                  cursor: exportDisabled ? "not-allowed" : "pointer",
                }}
              >
                <Download className="h-3.5 w-3.5" />
                {exporting ? "Preparing CSV…" : "Download CSV"}
              </button>
              {exportError ? (
                <div
                  role="alert"
                  className="basis-full"
                  style={{
                    fontFamily: SANS,
                    fontSize: 12,
                    color: T.accent,
                    marginTop: 4,
                  }}
                >
                  Couldn&rsquo;t export: {exportError}
                </div>
              ) : null}
              <button
                type="button"
                onClick={refresh}
                className="inline-flex items-center gap-2"
                style={{
                  fontFamily: SANS,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: T.ink,
                  background: T.paper,
                  border: `1px solid ${T.ink}`,
                  padding: "9px 16px",
                }}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh data
              </button>
            </div>
          </div>

          {/* Range chips */}
          <div className="flex flex-wrap items-center gap-2 pb-8">
            <span
              style={{
                fontFamily: MONO,
                fontSize: 10,
                letterSpacing: "0.16em",
                color: T.mutedSoft,
                marginRight: 8,
                textTransform: "uppercase",
              }}
            >
              Date range
            </span>
            {RANGES.map((r) => (
              <Chip
                key={r.id}
                active={range === r.id}
                onClick={() => {
                  setRange(r.id);
                  setDrillKey(null);
                  setBrandDrillKey(null);
                  clearDeepLinkPageParam();
                }}
              >
                {r.label}
              </Chip>
            ))}
          </div>

          {/* Truncation notice — shown whenever the API hit its row
              cap, because the totals tile below otherwise reads as the
              authoritative count for the chosen window when it's
              actually a most-recent-N slice. */}
          {cap?.hasMore && (
            <div
              className="mb-8 px-5 py-4"
              role="alert"
              style={{
                background: T.warningSoft,
                border: `1px solid ${T.warning}55`,
                color: T.warning,
                fontFamily: SANS,
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              <strong style={{ fontWeight: 700 }}>
                Showing the most recent {cap.limit.toLocaleString()} of{" "}
                {cap.totalCount.toLocaleString()} clicks in this window.
              </strong>{" "}
              The totals below cover only that slice. Pick a tighter date
              range to see everything.
              {/* Concrete one-click suggestion derived from the
                  truncated slice's density. We surface either the
                  largest narrower built-in range that projects under
                  the cap or, when no range fits and the kind chip is
                  still on "all pages", a single-kind chip. The button
                  applies the suggestion straight away (and clears any
                  drill state, mirroring the chip click handlers
                  above) so editors don't have to translate the prose
                  into a click themselves. */}
              {truncationSuggestion && (
                <div
                  className="mt-3 flex flex-wrap items-center gap-2"
                  data-testid="shelf-click-suggestion"
                >
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 10,
                      letterSpacing: "0.16em",
                      color: T.warning,
                      opacity: 0.75,
                      textTransform: "uppercase",
                    }}
                  >
                    Try
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (truncationSuggestion.kind === "range") {
                        setRange(truncationSuggestion.rangeId);
                      } else {
                        setKindFilter(truncationSuggestion.pageKind);
                      }
                      setDrillKey(null);
                      setBrandDrillKey(null);
                      clearDeepLinkPageParam();
                    }}
                    style={{
                      fontFamily: SANS,
                      fontSize: 12.5,
                      fontWeight: 600,
                      letterSpacing: "0.02em",
                      color: T.paper,
                      background: T.warning,
                      border: `1px solid ${T.warning}`,
                      padding: "6px 12px",
                      borderRadius: 999,
                      cursor: "pointer",
                    }}
                  >
                    {truncationSuggestion.kind === "range"
                      ? `${truncationSuggestion.label} (≈ ${truncationSuggestion.estimate.toLocaleString()} clicks)`
                      : `Filter to ${truncationSuggestion.label} (≈ ${truncationSuggestion.estimate.toLocaleString()} clicks)`}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Stat tiles */}
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-px pb-12"
            style={{ background: T.rule }}
          >
            <StatTile
              label="Total clicks"
              value={loading ? "—" : totals.total.toLocaleString()}
              hint={`${totals.pages} pages`}
            />
            <StatTile
              label="Ingredient pages"
              value={loading ? "—" : totals.byKind.ingredient}
              tint={KIND_TINT.ingredient.fg}
            />
            <StatTile
              label="Routine pages"
              value={loading ? "—" : totals.byKind.routine}
              tint={KIND_TINT.routine.fg}
            />
            <StatTile
              label="Concern pages"
              value={loading ? "—" : totals.byKind.concern}
              tint={KIND_TINT.concern.fg}
            />
          </div>
        </Container>
      </section>

      {/* Body */}
      <section className="relative z-10 py-16">
        <Container max={1180}>
          {error && (
            <div
              className="mb-8 px-5 py-4"
              style={{
                background: T.dangerSoft,
                border: `1px solid ${T.danger}55`,
                color: T.danger,
                fontFamily: SANS,
                fontSize: 13,
              }}
            >
              <strong style={{ fontWeight: 700 }}>
                Couldn&rsquo;t load shelf clicks.
              </strong>{" "}
              {error}
            </div>
          )}

          {drilled ? (
            <DrillView
              group={drilled.group}
              rows={drilled.recent}
              now={now}
              onBack={() => {
                setDrillKey(null);
                clearDeepLinkPageParam();
              }}
            />
          ) : brandDrilled ? (
            <BrandDrillView
              aggregate={brandDrilled}
              now={now}
              onBack={() => {
                setBrandDrillKey(null);
              }}
            />
          ) : (
            <>
              {/* View toggle: page-pivot (the original "by source
                  page" view) vs brand-pivot (the inverse, grouping
                  outbound clicks by destination brand). Switching
                  also drops the opposite pivot's drill state so the
                  back button doesn't reappear on top of the table
                  the editor just toggled into. */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    letterSpacing: "0.16em",
                    color: T.mutedSoft,
                    marginRight: 8,
                    textTransform: "uppercase",
                  }}
                >
                  Group by
                </span>
                <Chip
                  active={view === "page"}
                  onClick={() => {
                    setView("page");
                    setBrandDrillKey(null);
                  }}
                >
                  Source page
                </Chip>
                <Chip
                  active={view === "brand"}
                  onClick={() => {
                    setView("brand");
                    setDrillKey(null);
                    clearDeepLinkPageParam();
                  }}
                >
                  Destination brand
                </Chip>
              </div>

              {/* Kind filter chips — applies to both views since the
                  underlying `filteredRows` feeds both aggregates. */}
              <div className="flex flex-wrap items-center gap-2 mb-8">
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    letterSpacing: "0.16em",
                    color: T.mutedSoft,
                    marginRight: 8,
                    textTransform: "uppercase",
                  }}
                >
                  Page kind
                </span>
                {KIND_FILTERS.map((k) => (
                  <Chip
                    key={k.id}
                    active={kindFilter === k.id}
                    onClick={() => setKindFilter(k.id)}
                  >
                    {k.label}
                  </Chip>
                ))}
              </div>

              <div className="flex items-baseline justify-between mb-6">
                <Eyebrow>
                  {view === "page"
                    ? "By source page · Most-clicked first"
                    : "By destination brand · Most-clicked first"}
                </Eyebrow>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 10.5,
                    color: T.mutedSoft,
                    letterSpacing: "0.08em",
                  }}
                >
                  {loading
                    ? "LOADING…"
                    : view === "page"
                      ? `SHOWING ${groups.length} PAGE${groups.length === 1 ? "" : "S"}`
                      : `SHOWING ${brandGroups.length} BRAND${brandGroups.length === 1 ? "" : "S"}`}
                </span>
              </div>

              {view === "page" ? (
                <GroupTable
                  groups={groups}
                  loading={loading}
                  onDrill={(key) => setDrillKey(key)}
                />
              ) : (
                <BrandTable
                  groups={brandGroups}
                  loading={loading}
                  now={now}
                  onDrill={(brand) => setBrandDrillKey(brand)}
                />
              )}
            </>
          )}
        </Container>
      </section>

      <div className="absolute right-12 top-[40vh] z-0 hidden lg:block">
        <AmbientFlask size={300} opacity={0.04} />
      </div>

      <SiteFooter />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────
// Group table.
// ─────────────────────────────────────────────────────────────────────
const GroupTable: React.FC<{
  groups: PageGroup[];
  loading: boolean;
  onDrill: (key: string) => void;
}> = ({ groups, loading, onDrill }) => {
  if (loading) {
    return (
      <div
        className="py-16 text-center"
        style={{ fontFamily: SERIF_ED, fontStyle: "italic", color: T.muted }}
      >
        Loading shelf clicks…
      </div>
    );
  }
  if (groups.length === 0) {
    return (
      <div
        className="py-16 text-center"
        style={{
          fontFamily: SERIF_ED,
          fontStyle: "italic",
          color: T.muted,
          border: `1px dashed ${T.rule}`,
        }}
      >
        No outbound shelf clicks recorded for this filter yet.
      </div>
    );
  }
  return (
    <div style={{ borderTop: `2px solid ${T.ink}` }}>
      <div
        className="hidden md:grid grid-cols-12 gap-4 py-3 border-b"
        style={{
          borderColor: T.rule,
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: "0.12em",
          color: T.mutedSoft,
        }}
      >
        <div className="col-span-2">PAGE KIND</div>
        <div className="col-span-5">PAGE</div>
        <div className="col-span-3">TOP BRAND</div>
        <div className="col-span-1 text-right">CLICKS</div>
        <div className="col-span-1 text-right">DRILL</div>
      </div>
      {groups.map((g) => (
        <button
          type="button"
          key={g.key}
          onClick={() => onDrill(g.key)}
          className="grid grid-cols-12 gap-4 py-5 border-b w-full text-left hover:bg-[var(--hover)]"
          style={
            {
              borderColor: T.rule,
              background: T.paper,
              cursor: "pointer",
              "--hover": T.paper2,
            } as React.CSSProperties
          }
        >
          <div className="col-span-12 md:col-span-2 flex items-start">
            <KindBadge kind={g.pageKind} />
          </div>
          <div className="col-span-12 md:col-span-5">
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 18,
                lineHeight: 1.25,
                color: T.ink,
              }}
            >
              {g.label}
            </div>
            <div
              className="mt-1"
              style={{
                fontFamily: MONO,
                fontSize: 10.5,
                color: T.mutedSoft,
                letterSpacing: "0.06em",
              }}
            >
              {g.pageSlug}
            </div>
          </div>
          <div className="col-span-8 md:col-span-3">
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 15,
                color: T.inkSoft,
              }}
            >
              {g.topBrand}
            </div>
            <div
              className="mt-1"
              style={{
                fontFamily: SANS,
                fontSize: 11.5,
                color: T.muted,
              }}
            >
              {g.topBrandCount} of {g.total} clicks
            </div>
          </div>
          <div
            className="col-span-2 md:col-span-1 text-right"
            style={{
              fontFamily: SERIF,
              fontSize: 28,
              color: T.ink,
              fontVariationSettings: '"opsz" 144',
              lineHeight: 1,
            }}
          >
            {g.total}
          </div>
          <div
            className="col-span-2 md:col-span-1 text-right"
            style={{ color: T.accent }}
          >
            <ArrowUpRight className="h-4 w-4 inline-block" />
          </div>
        </button>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────
// Brand table — same shape as `GroupTable` but pivoted: one row per
// destination brand showing total clicks, the top product (and its
// share of those clicks), and the most recent click time. Rows are
// clickable: clicking a brand opens `BrandDrillView` to show that
// brand's clicks broken down by source guide and product.
// ─────────────────────────────────────────────────────────────────────
const BrandTable: React.FC<{
  groups: BrandGroup[];
  loading: boolean;
  now: number;
  onDrill: (brand: string) => void;
}> = ({ groups, loading, now, onDrill }) => {
  if (loading) {
    return (
      <div
        className="py-16 text-center"
        style={{ fontFamily: SERIF_ED, fontStyle: "italic", color: T.muted }}
      >
        Loading shelf clicks…
      </div>
    );
  }
  if (groups.length === 0) {
    return (
      <div
        className="py-16 text-center"
        style={{
          fontFamily: SERIF_ED,
          fontStyle: "italic",
          color: T.muted,
          border: `1px dashed ${T.rule}`,
        }}
      >
        No outbound shelf clicks recorded for this filter yet.
      </div>
    );
  }
  return (
    <div style={{ borderTop: `2px solid ${T.ink}` }}>
      <div
        className="hidden md:grid grid-cols-12 gap-4 py-3 border-b"
        style={{
          borderColor: T.rule,
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: "0.12em",
          color: T.mutedSoft,
        }}
      >
        <div className="col-span-3">BRAND</div>
        <div className="col-span-5">TOP PRODUCT</div>
        <div className="col-span-2">LAST CLICK</div>
        <div className="col-span-1 text-right">CLICKS</div>
        <div className="col-span-1 text-right">DRILL</div>
      </div>
      {groups.map((g) => (
        <button
          type="button"
          key={g.brand}
          onClick={() => onDrill(g.brand)}
          className="grid grid-cols-12 gap-4 py-5 border-b w-full text-left hover:bg-[var(--hover)]"
          style={
            {
              borderColor: T.rule,
              background: T.paper,
              cursor: "pointer",
              "--hover": T.paper2,
            } as React.CSSProperties
          }
        >
          <div className="col-span-12 md:col-span-3">
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 18,
                lineHeight: 1.25,
                color: T.ink,
              }}
            >
              {g.brand}
            </div>
          </div>
          <div className="col-span-12 md:col-span-5">
            <div
              style={{
                fontFamily: SERIF_ED,
                fontStyle: "italic",
                fontSize: 15.5,
                color: T.inkSoft,
                lineHeight: 1.4,
              }}
            >
              {g.topProduct}
            </div>
            <div
              className="mt-1"
              style={{
                fontFamily: SANS,
                fontSize: 11.5,
                color: T.muted,
              }}
            >
              {g.topProductCount} of {g.total} clicks
            </div>
          </div>
          <div className="col-span-8 md:col-span-2">
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 14,
                color: T.ink,
                lineHeight: 1.2,
              }}
            >
              {formatRelative(g.lastClickAt, now)}
            </div>
            <div
              className="mt-1"
              style={{
                fontFamily: MONO,
                fontSize: 10,
                color: T.mutedSoft,
                letterSpacing: "0.06em",
              }}
            >
              {new Date(g.lastClickAt).toLocaleString()}
            </div>
          </div>
          <div
            className="col-span-2 md:col-span-1 text-right"
            style={{
              fontFamily: SERIF,
              fontSize: 28,
              color: T.ink,
              fontVariationSettings: '"opsz" 144',
              lineHeight: 1,
            }}
          >
            {g.total}
          </div>
          <div
            className="col-span-2 md:col-span-1 text-right"
            style={{ color: T.accent }}
          >
            <ArrowUpRight className="inline-block h-4 w-4" />
          </div>
        </button>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────
// Brand drill-down view: the inverse of `DrillView`. Shows the brand's
// total outbound clicks broken down two ways — by source guide and by
// product — so editors evaluating a commercial relationship can see
// both which guides are pushing readers and which SKUs are doing the
// work. Pages link out to the public guide URL when one resolves; the
// product list is read-only because the click record only carries the
// product name (no SKU URL on the source row).
// ─────────────────────────────────────────────────────────────────────
const BrandDrillView: React.FC<{
  aggregate: BrandDrillAggregate;
  now: number;
  onBack: () => void;
}> = ({ aggregate, now, onBack }) => {
  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 mb-6"
        style={{
          fontFamily: SANS,
          fontSize: 12.5,
          fontWeight: 500,
          color: T.accent,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to all brands
      </button>

      <div className="flex flex-wrap items-baseline gap-3">
        <h2
          style={{
            fontFamily: SERIF,
            fontSize: 40,
            lineHeight: 1.05,
            letterSpacing: "-0.025em",
            color: T.ink,
            fontVariationSettings: '"opsz" 144',
            fontWeight: 400,
          }}
        >
          {aggregate.brand}
        </h2>
      </div>
      <div
        className="mt-2 flex flex-wrap items-center gap-4"
        style={{
          fontFamily: MONO,
          fontSize: 11,
          color: T.mutedSoft,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        <span>
          {aggregate.total} CLICK{aggregate.total === 1 ? "" : "S"}
        </span>
        <span>·</span>
        <span>
          {aggregate.pages.length} SOURCE PAGE
          {aggregate.pages.length === 1 ? "" : "S"}
        </span>
        <span>·</span>
        <span>
          {aggregate.products.length} PRODUCT
          {aggregate.products.length === 1 ? "" : "S"}
        </span>
        <span>·</span>
        <span>LAST {formatRelative(aggregate.lastClickAt, now)}</span>
      </div>

      {/* By source page — which guides drove the editor to click out
          to this brand. The "OPEN" link mirrors the page-pivot drill
          so editors can jump straight to the guide for context. */}
      <div className="mt-10">
        <Eyebrow>By source page · Most-clicked first</Eyebrow>
        <div className="mt-4" style={{ borderTop: `2px solid ${T.ink}` }}>
          <div
            className="hidden md:grid grid-cols-12 gap-4 py-3 border-b"
            style={{
              borderColor: T.rule,
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: "0.12em",
              color: T.mutedSoft,
            }}
          >
            <div className="col-span-2">PAGE KIND</div>
            <div className="col-span-7">PAGE</div>
            <div className="col-span-3 text-right">CLICKS</div>
          </div>
          {aggregate.pages.map((p) => (
            <article
              key={p.key}
              className="grid grid-cols-12 gap-4 py-4 border-b"
              style={{ borderColor: T.rule }}
            >
              <div className="col-span-12 md:col-span-2 flex items-start">
                <KindBadge kind={p.pageKind} />
              </div>
              <div className="col-span-12 md:col-span-7">
                <div
                  style={{
                    fontFamily: SERIF,
                    fontSize: 17,
                    lineHeight: 1.25,
                    color: T.ink,
                  }}
                >
                  {p.label}
                </div>
                <div
                  className="mt-1 flex flex-wrap items-center gap-3"
                  style={{
                    fontFamily: MONO,
                    fontSize: 10.5,
                    color: T.mutedSoft,
                    letterSpacing: "0.06em",
                  }}
                >
                  <span>{p.pageSlug}</span>
                  {p.href && (
                    <a
                      href={p.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1"
                      style={{
                        color: T.accent,
                        textTransform: "uppercase",
                      }}
                    >
                      Open page <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
              <div
                className="col-span-12 md:col-span-3 text-right"
                style={{
                  fontFamily: SERIF,
                  fontSize: 26,
                  color: T.ink,
                  fontVariationSettings: '"opsz" 144',
                  lineHeight: 1,
                }}
              >
                {p.total}
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* By product — which SKUs at the brand are doing the work. We
          don't link out (the click record carries the destination
          href but it's per-row, not per-product) so this list is
          read-only by design. */}
      <div className="mt-12">
        <Eyebrow>By product · Most-clicked first</Eyebrow>
        <div className="mt-4" style={{ borderTop: `2px solid ${T.ink}` }}>
          <div
            className="hidden md:grid grid-cols-12 gap-4 py-3 border-b"
            style={{
              borderColor: T.rule,
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: "0.12em",
              color: T.mutedSoft,
            }}
          >
            <div className="col-span-9">PRODUCT</div>
            <div className="col-span-3 text-right">CLICKS</div>
          </div>
          {aggregate.products.map((p) => (
            <article
              key={p.productName}
              className="grid grid-cols-12 gap-4 py-4 border-b"
              style={{ borderColor: T.rule }}
            >
              <div
                className="col-span-12 md:col-span-9"
                style={{
                  fontFamily: SERIF_ED,
                  fontStyle: "italic",
                  fontSize: 16,
                  lineHeight: 1.4,
                  color: T.inkSoft,
                }}
              >
                {p.productName}
              </div>
              <div
                className="col-span-12 md:col-span-3 text-right"
                style={{
                  fontFamily: SERIF,
                  fontSize: 26,
                  color: T.ink,
                  fontVariationSettings: '"opsz" 144',
                  lineHeight: 1,
                }}
              >
                {p.total}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────
// Drill-down view: recent clicks for a single page.
// ─────────────────────────────────────────────────────────────────────
const DrillView: React.FC<{
  group: PageGroup;
  rows: ShelfClickRecord[];
  now: number;
  onBack: () => void;
}> = ({ group, rows, now, onBack }) => {
  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 mb-6"
        style={{
          fontFamily: SANS,
          fontSize: 12.5,
          fontWeight: 500,
          color: T.accent,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to all pages
      </button>

      <div className="flex flex-wrap items-baseline gap-3">
        <KindBadge kind={group.pageKind} />
        <h2
          style={{
            fontFamily: SERIF,
            fontSize: 40,
            lineHeight: 1.05,
            letterSpacing: "-0.025em",
            color: T.ink,
            fontVariationSettings: '"opsz" 144',
            fontWeight: 400,
          }}
        >
          {group.label}
        </h2>
      </div>
      <div
        className="mt-2 flex flex-wrap items-center gap-4"
        style={{
          fontFamily: MONO,
          fontSize: 11,
          color: T.mutedSoft,
          letterSpacing: "0.06em",
        }}
      >
        <span>{group.pageSlug}</span>
        <span>·</span>
        <span>
          {group.total} CLICK{group.total === 1 ? "" : "S"}
        </span>
        {group.href && (
          <>
            <span>·</span>
            <a
              href={group.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1"
              style={{ color: T.accent, textTransform: "uppercase" }}
            >
              Open page <ExternalLink className="h-3 w-3" />
            </a>
          </>
        )}
      </div>

      <div className="mt-10" style={{ borderTop: `2px solid ${T.ink}` }}>
        <div
          className="hidden md:grid grid-cols-12 gap-4 py-3 border-b"
          style={{
            borderColor: T.rule,
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: "0.12em",
            color: T.mutedSoft,
          }}
        >
          <div className="col-span-2">WHEN</div>
          <div className="col-span-3">BRAND</div>
          <div className="col-span-4">PRODUCT</div>
          <div className="col-span-3">DESTINATION</div>
        </div>
        {rows.map((r) => (
          <article
            key={r.id}
            className="grid grid-cols-12 gap-4 py-4 border-b"
            style={{ borderColor: T.rule }}
          >
            <div className="col-span-12 md:col-span-2">
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 15,
                  color: T.ink,
                  lineHeight: 1.2,
                }}
              >
                {formatRelative(r.createdAt, now)}
              </div>
              <div
                className="mt-1"
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  color: T.mutedSoft,
                  letterSpacing: "0.06em",
                }}
              >
                {new Date(r.createdAt).toLocaleString()}
              </div>
            </div>
            <div className="col-span-12 md:col-span-3">
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 16,
                  color: T.ink,
                  lineHeight: 1.25,
                }}
              >
                {r.brand}
              </div>
            </div>
            <div className="col-span-12 md:col-span-4">
              <div
                style={{
                  fontFamily: SERIF_ED,
                  fontSize: 15.5,
                  color: T.inkSoft,
                  lineHeight: 1.4,
                }}
              >
                {r.productName}
              </div>
            </div>
            <div className="col-span-12 md:col-span-3">
              <a
                href={r.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-start gap-1"
                style={{
                  fontFamily: SANS,
                  fontSize: 12.5,
                  color: T.accent,
                  wordBreak: "break-all",
                }}
              >
                {tryHostname(r.href)}
                <ExternalLink className="h-3 w-3 mt-0.5 shrink-0" />
              </a>
            </div>
          </article>
        ))}
        {rows.length === 0 && (
          <div
            className="py-12 text-center"
            style={{
              fontFamily: SERIF_ED,
              fontStyle: "italic",
              color: T.muted,
            }}
          >
            No clicks for this page in the selected range.
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorShelfClicks;
