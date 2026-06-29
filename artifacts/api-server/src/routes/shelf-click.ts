import { Router, type IRouter } from "express";
import { db, shelfClicksTable } from "@workspace/db";
import { and, count, desc, eq, gte, lt, lte, or, type SQL } from "drizzle-orm";
import {
  RecordShelfClicksBody,
  ListShelfClicksQueryParams,
  ListShelfClicksResponse,
  ExportShelfClicksQueryParams,
} from "@workspace/api-zod";
import { requireEditor } from "../middlewares/editor-auth";
import {
  enforceShelfClickAllowedOrigin,
  enforceShelfClickRateLimit,
} from "../middlewares/shelf-click-abuse";

// `since` / `until` arrive in `req.query` as ISO-8601 strings, but the
// generated schema types them as `z.date()` (orval's `coerce.query`
// option only handles boolean/number/string). Convert just those two
// fields to `Date` instances before validation so the route can keep
// using the generated schema as the single source of truth.
function coerceDateQuery(
  raw: unknown,
): Date | undefined | null | unknown {
  if (typeof raw !== "string" || raw === "") return raw;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? raw : d;
}

const router: IRouter = Router();

router.post(
  "/analytics/shelf-click",
  enforceShelfClickAllowedOrigin(),
  enforceShelfClickRateLimit(),
  async (req, res) => {
    const parsed = RecordShelfClicksBody.safeParse(req.body);
    if (!parsed.success) {
      req.log.warn(
        { issues: parsed.error.issues },
        "shelf-click: rejected malformed payload",
      );
      res.status(400).json({
        error: "invalid_payload",
        issues: parsed.error.issues,
      });
      return;
    }

    const userAgent = req.get("user-agent") ?? null;
    const rows = parsed.data.events.map((event) => ({
      pageKind: event.pageKind,
      pageSlug: event.pageSlug,
      brand: event.brand,
      productName: event.productName,
      href: event.href,
      userAgent,
    }));

    await db.insert(shelfClicksTable).values(rows);
    req.log.info({ count: rows.length }, "shelf-click: persisted batch");
    res.status(204).end();
  },
);

router.get("/analytics/shelf-clicks", requireEditor(), async (req, res) => {
  const rawQuery = {
    ...req.query,
    since: coerceDateQuery(req.query.since),
    until: coerceDateQuery(req.query.until),
  };
  const parsed = ListShelfClicksQueryParams.safeParse(rawQuery);
  if (!parsed.success) {
    res.status(400).json({
      error: "invalid_query",
      issues: parsed.error.issues,
    });
    return;
  }
  const { limit, pageKind, pageSlug, since, until } = parsed.data;

  // `pageKind` and `pageSlug` filter independently so editors can
  // either look at "all routine clicks" or zoom in on a single source
  // page; both filters can be combined. `since` / `until` add a
  // server-side date window so the dashboard can pull historical
  // ranges (e.g. `Last 30 days`) without being silently capped by
  // the row-limit ceiling.
  const filters = [
    pageKind ? eq(shelfClicksTable.pageKind, pageKind) : null,
    pageSlug ? eq(shelfClicksTable.pageSlug, pageSlug) : null,
    since ? gte(shelfClicksTable.createdAt, since) : null,
    until ? lte(shelfClicksTable.createdAt, until) : null,
  ].filter((f): f is NonNullable<typeof f> => f !== null);

  const where: SQL<unknown> | undefined =
    filters.length === 0
      ? undefined
      : filters.length === 1
        ? filters[0]
        : and(...filters);

  const baseQuery = db
    .select()
    .from(shelfClicksTable)
    .orderBy(desc(shelfClicksTable.createdAt))
    .limit(limit);

  const rows = where === undefined ? await baseQuery : await baseQuery.where(where);

  // Only run the `SELECT COUNT(*)` when the row cap was actually hit.
  // When `rows.length < limit` the listing query already exhausted
  // the matching rows, so `rows.length` itself is the true total and
  // a second round-trip would just add latency on the common path.
  // When the cap was hit we run the count so the dashboard banner
  // can say "Showing the most recent 1,000 of N clicks" instead of
  // leaving editors to guess how badly the window is truncated, and
  // we derive `hasMore` from the count rather than from the cap-hit
  // heuristic so the exact-edge case (`totalCount === limit`) does
  // not falsely claim truncation.
  let totalCount: number;
  let hasMore: boolean;
  if (rows.length === limit) {
    const countQuery = db
      .select({ value: count() })
      .from(shelfClicksTable);
    const countRows =
      where === undefined
        ? await countQuery
        : await countQuery.where(where);
    totalCount = countRows[0]?.value ?? rows.length;
    hasMore = totalCount > limit;
  } else {
    totalCount = rows.length;
    hasMore = false;
  }

  const body = ListShelfClicksResponse.parse({
    clicks: rows,
    limit,
    hasMore,
    totalCount,
  });
  res.json(body);
});

// ─────────────────────────────────────────────────────────────────────
// `GET /analytics/shelf-clicks/export` — NDJSON streaming export.
//
// The dashboard's listing route caps rows at 1000 so a busy month
// silently truncates the totals; this companion route streams every
// row in the requested window so the "Download CSV" button can hand
// editors the complete date window. We stream NDJSON (one JSON object
// per line) rather than CSV so the page-label resolution can stay
// where the catalogue already lives — in the dashboard component —
// without coupling the API server to the React mockup catalogue. The
// dashboard pipes the stream through the same `rowsToCsv` helper used
// by the in-memory exporter, so the resulting file's column order and
// escaping are identical to a small in-window export.
//
// We page through the result with keyset pagination on
// `(createdAt DESC, id DESC)` so memory and database connection usage
// stay bounded regardless of how busy the window is — only one page
// (`EXPORT_PAGE_SIZE` rows) is in flight at a time, and the next page
// isn't requested until the previous one has been written to the
// response stream. There is intentionally NO upper row cap on this
// endpoint: the whole point of the route is to give editors the full
// window without silent truncation, so a cap that the client couldn't
// distinguish from "you reached the end" would re-create exactly the
// 1000-row dashboard problem this endpoint exists to solve. The route
// is editor-only (`requireEditor()`), so an unbounded stream is an
// acceptable trust-boundary tradeoff — an abusive editor cookie can
// already do more damage via the rest of the editor surface.
// ─────────────────────────────────────────────────────────────────────
const EXPORT_PAGE_SIZE = 500;

router.get(
  "/analytics/shelf-clicks/export",
  requireEditor(),
  async (req, res) => {
    const rawQuery = {
      ...req.query,
      since: coerceDateQuery(req.query.since),
      until: coerceDateQuery(req.query.until),
    };
    const parsed = ExportShelfClicksQueryParams.safeParse(rawQuery);
    if (!parsed.success) {
      res.status(400).json({
        error: "invalid_query",
        issues: parsed.error.issues,
      });
      return;
    }
    const { pageKind, pageSlug, since, until } = parsed.data;

    const baseFilters = [
      pageKind ? eq(shelfClicksTable.pageKind, pageKind) : null,
      pageSlug ? eq(shelfClicksTable.pageSlug, pageSlug) : null,
      since ? gte(shelfClicksTable.createdAt, since) : null,
      until ? lte(shelfClicksTable.createdAt, until) : null,
    ].filter((f): f is NonNullable<typeof f> => f !== null);

    res.status(200);
    res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
    // Disable downstream proxy buffering so chunks reach the browser
    // as they're written. Replit's edge proxy respects `X-Accel-Buffering`
    // (nginx-style) and most others either honour it or are no-ops, so
    // setting it is safe even when it doesn't apply.
    res.setHeader("X-Accel-Buffering", "no");
    res.setHeader("Cache-Control", "no-store");

    let cursorCreatedAt: Date | null = null;
    let cursorId: number | null = null;
    let totalEmitted = 0;
    let aborted = false;
    req.on("close", () => {
      // Editor closed the tab / cancelled the download mid-stream;
      // stop fetching the next page so we don't keep working on a
      // dropped response.
      aborted = true;
    });

    try {
      while (!aborted) {
        // Keyset cursor: continue strictly past the last row in the
        // previous batch using `(createdAt, id) < (lastCreatedAt, lastId)`
        // expanded into the equivalent SQL-friendly disjunction so the
        // existing `(created_at)` index can still satisfy the order.
        const cursorFilter: SQL<unknown> | undefined =
          cursorCreatedAt !== null && cursorId !== null
            ? or(
                lt(shelfClicksTable.createdAt, cursorCreatedAt),
                and(
                  eq(shelfClicksTable.createdAt, cursorCreatedAt),
                  lt(shelfClicksTable.id, cursorId),
                ),
              )
            : undefined;
        const conditions: Array<SQL<unknown>> = cursorFilter
          ? [...baseFilters, cursorFilter]
          : [...baseFilters];
        const where: SQL<unknown> | undefined =
          conditions.length === 0
            ? undefined
            : conditions.length === 1
              ? conditions[0]
              : and(...conditions);
        const pageSize = EXPORT_PAGE_SIZE;

        const batch = await db
          .select()
          .from(shelfClicksTable)
          .where(where)
          .orderBy(desc(shelfClicksTable.createdAt), desc(shelfClicksTable.id))
          .limit(pageSize);

        if (batch.length === 0) break;

        for (const row of batch) {
          if (aborted) break;
          // Serialise `createdAt` as ISO-8601 to match the JSON shape
          // the listing endpoint emits (zod's `coerce.date` rendering),
          // so the client's parser is identical to the in-memory path.
          const wire = {
            id: row.id,
            createdAt:
              row.createdAt instanceof Date
                ? row.createdAt.toISOString()
                : row.createdAt,
            pageKind: row.pageKind,
            pageSlug: row.pageSlug,
            brand: row.brand,
            productName: row.productName,
            href: row.href,
            userAgent: row.userAgent,
          };
          res.write(`${JSON.stringify(wire)}\n`);
          totalEmitted += 1;
        }

        if (batch.length < pageSize) break;
        const last = batch[batch.length - 1]!;
        cursorCreatedAt = last.createdAt;
        cursorId = last.id;
      }

      req.log.info(
        {
          pageKind,
          pageSlug,
          since,
          until,
          rows: totalEmitted,
        },
        "shelf-click export: stream complete",
      );
      res.end();
    } catch (err) {
      // We've already sent headers and (probably) some rows by the
      // time a mid-stream error fires, so we can't switch to a JSON
      // 500 body — just log and abort the response. The client treats
      // a truncated NDJSON stream as a failed export.
      req.log.error({ err }, "shelf-click export: streaming failed");
      try {
        res.destroy(err instanceof Error ? err : new Error(String(err)));
      } catch {
        // noop — destroy is best-effort once the stream is in flight
      }
    }
  },
);

export default router;
