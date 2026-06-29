/**
 * Validate the contract between shelf-card link resolution and
 * outbound-click tracking — i.e. that internal "Read review" clicks
 * are *never* counted as outbound clicks while every external brand /
 * retailer click is.
 *
 * Why: every shelf row (ingredient brief, routine pick, concern card)
 * goes through the same `productLinkForBriefEntry` →
 * `shelfOutboundClickHandler` pipeline. The handler is intentionally a
 * no-op for `external: false` links so React doesn't even attach a
 * listener, which keeps internal review clicks out of the
 * `shelf_outbound_click` event stream consumed by the editor
 * dashboard. The semantics are documented in `replit.md` under
 * "Analytics — shelf outbound clicks"; this script locks them down so
 * a future refactor can't quietly start double-counting.
 *
 * What it checks:
 *   1. A catalogue entry with a `component` resolves to an internal
 *      link (`external: false`) and `shelfOutboundClickHandler`
 *      returns `undefined` — clicking the row dispatches no
 *      `evidently:shelf-outbound` event and writes nothing to
 *      `window.dataLayer`.
 *   2. A catalogue entry with only a `purchaseUrl` resolves to an
 *      external link (`external: true`) and the handler is a real
 *      function. Invoking it dispatches exactly one
 *      `evidently:shelf-outbound` CustomEvent with the meta we
 *      passed in, and pushes one `shelf_outbound_click` entry to
 *      `dataLayer`.
 *   3. The same handler shape works for every `ShelfPageKind`
 *      surface (`ingredient`, `routine`, `concern`) — the three
 *      pageKinds the editor dashboard groups by.
 *
 * Run via: pnpm --filter @workspace/mockup-sandbox run validate:shelf-outbound-tracking
 */

import {
  productLinkForBriefEntry,
  shelfOutboundClickHandler,
  SHELF_OUTBOUND_EVENT,
  type ShelfPageKind,
  type ShelfOutboundClickPayload,
} from "../src/components/mockups/evidently/_links";

// ─────────────────────────────────────────────────────────────────────
// Minimal browser-shaped globals. The handler short-circuits when
// `window` is undefined, so we install an EventTarget-backed `window`
// and a writable `dataLayer` array we can inspect after each click.
// ─────────────────────────────────────────────────────────────────────
type DataLayerEntry = Record<string, unknown>;
type WindowLike = EventTarget & { dataLayer?: DataLayerEntry[] };

const target = new EventTarget() as WindowLike;
target.dataLayer = [];
(globalThis as unknown as { window: WindowLike }).window = target;

function resetDataLayer(): void {
  target.dataLayer = [];
}

function captureEventOnce(): {
  promise: Promise<ShelfOutboundClickPayload | null>;
  cancel: () => void;
} {
  let resolve!: (value: ShelfOutboundClickPayload | null) => void;
  const promise = new Promise<ShelfOutboundClickPayload | null>((r) => {
    resolve = r;
  });
  let count = 0;
  let lastDetail: ShelfOutboundClickPayload | null = null;
  function listener(e: Event): void {
    count += 1;
    lastDetail = (e as CustomEvent<ShelfOutboundClickPayload>).detail;
  }
  target.addEventListener(SHELF_OUTBOUND_EVENT, listener);
  // Settle on the next microtask: dispatchEvent is synchronous, so by
  // the time the handler returns the listener has run (or not) and we
  // can decide.
  queueMicrotask(() => {
    target.removeEventListener(SHELF_OUTBOUND_EVENT, listener);
    if (count === 0) resolve(null);
    else if (count === 1) resolve(lastDetail);
    else
      resolve({
        ...(lastDetail as ShelfOutboundClickPayload),
        productName: `__multiple_dispatch__:${count}`,
      });
  });
  return {
    promise,
    cancel: () => target.removeEventListener(SHELF_OUTBOUND_EVENT, listener),
  };
}

// ─────────────────────────────────────────────────────────────────────
// Fixtures. Picked from `_productCatalogue.ts` so the test reflects
// real catalogue rows: an internal review (component, no purchaseUrl)
// and an unreviewed entry (purchaseUrl only).
// ─────────────────────────────────────────────────────────────────────
const INTERNAL_FIXTURE = {
  brand: "SkinCeuticals",
  name: "C E Ferulic",
} as const;

const EXTERNAL_FIXTURE = {
  brand: "The Ordinary",
  name: "Niacinamide 10% + Zinc 1%",
} as const;

const PAGE_KINDS: ShelfPageKind[] = ["ingredient", "routine", "concern"];

// ─────────────────────────────────────────────────────────────────────
// Assertions.
// ─────────────────────────────────────────────────────────────────────
const failures: string[] = [];

function expect(condition: boolean, message: string): void {
  if (!condition) failures.push(message);
}

// 1. Internal fixture must resolve as an internal link, and the
//    handler must be `undefined` (no listener attached → no event,
//    no dataLayer write, no double-count).
{
  const link = productLinkForBriefEntry(
    INTERNAL_FIXTURE.brand,
    INTERNAL_FIXTURE.name,
  );
  expect(
    link !== null,
    `internal fixture "${INTERNAL_FIXTURE.brand} — ${INTERNAL_FIXTURE.name}" did not resolve to a catalogue link`,
  );
  expect(
    link?.external === false,
    `internal fixture should resolve to external:false, got external:${String(link?.external)}`,
  );
  for (const pageKind of PAGE_KINDS) {
    const handler = shelfOutboundClickHandler(link, {
      brand: INTERNAL_FIXTURE.brand,
      productName: INTERNAL_FIXTURE.name,
      pageKind,
      pageSlug: "fixture",
    });
    expect(
      handler === undefined,
      `internal-link handler for pageKind="${pageKind}" should be undefined (no React listener), got ${typeof handler}`,
    );
  }
}

// 2. External fixture must resolve as an external link, and the
//    handler must dispatch exactly one shelf-outbound event with the
//    meta we passed in, plus push one matching dataLayer entry.
for (const pageKind of PAGE_KINDS) {
  const link = productLinkForBriefEntry(
    EXTERNAL_FIXTURE.brand,
    EXTERNAL_FIXTURE.name,
  );
  expect(
    link !== null,
    `external fixture "${EXTERNAL_FIXTURE.brand} — ${EXTERNAL_FIXTURE.name}" did not resolve to a catalogue link`,
  );
  expect(
    link?.external === true,
    `external fixture should resolve to external:true, got external:${String(link?.external)}`,
  );

  resetDataLayer();
  const capture = captureEventOnce();
  const handler = shelfOutboundClickHandler(link, {
    brand: EXTERNAL_FIXTURE.brand,
    productName: EXTERNAL_FIXTURE.name,
    pageKind,
    pageSlug: `fixture-${pageKind}`,
  });
  if (typeof handler !== "function") {
    failures.push(
      `external-link handler for pageKind="${pageKind}" must be a function, got ${typeof handler}`,
    );
    capture.cancel();
    continue;
  }
  // Synthesise just enough of a MouseEvent for the handler — it doesn't
  // read any properties, it only fires off tracking and returns.
  handler({} as unknown as React.MouseEvent<HTMLAnchorElement>);

  const detail = await capture.promise;
  if (detail === null) {
    failures.push(
      `external-link click on pageKind="${pageKind}" did not dispatch a "${SHELF_OUTBOUND_EVENT}" event`,
    );
  } else if (detail.productName.startsWith("__multiple_dispatch__:")) {
    failures.push(
      `external-link click on pageKind="${pageKind}" dispatched ${detail.productName.split(":")[1]} events; expected exactly 1`,
    );
  } else {
    expect(
      detail.brand === EXTERNAL_FIXTURE.brand,
      `event payload brand mismatch on pageKind="${pageKind}": "${detail.brand}"`,
    );
    expect(
      detail.productName === EXTERNAL_FIXTURE.name,
      `event payload productName mismatch on pageKind="${pageKind}": "${detail.productName}"`,
    );
    expect(
      detail.pageKind === pageKind,
      `event payload pageKind mismatch: expected "${pageKind}", got "${detail.pageKind}"`,
    );
    expect(
      detail.pageSlug === `fixture-${pageKind}`,
      `event payload pageSlug mismatch on pageKind="${pageKind}": "${detail.pageSlug}"`,
    );
    expect(
      typeof detail.href === "string" && detail.href === link?.href,
      `event payload href mismatch on pageKind="${pageKind}": "${detail.href}" vs "${link?.href}"`,
    );
  }

  // dataLayer should have grown by exactly one `shelf_outbound_click`
  // entry — the GTM half of the dual surface.
  const dl = target.dataLayer ?? [];
  const outbound = dl.filter((e) => e.event === "shelf_outbound_click");
  expect(
    outbound.length === 1,
    `dataLayer should contain exactly 1 shelf_outbound_click entry for pageKind="${pageKind}", got ${outbound.length}`,
  );
  if (outbound.length === 1) {
    const e = outbound[0];
    expect(
      e.shelf_brand === EXTERNAL_FIXTURE.brand &&
        e.shelf_product === EXTERNAL_FIXTURE.name &&
        e.shelf_page_kind === pageKind &&
        e.shelf_page_slug === `fixture-${pageKind}` &&
        e.shelf_destination === link?.href,
      `dataLayer entry for pageKind="${pageKind}" has unexpected shape: ${JSON.stringify(e)}`,
    );
  }
}

// 3. Belt-and-braces: re-run the internal case with a listener
//    actively attached. The handler is `undefined`, so there's no
//    way for it to fire — but if a future change ever wires the
//    handler back through for internal links, this would catch it
//    by failing on a non-zero dispatch count or dataLayer push.
{
  const link = productLinkForBriefEntry(
    INTERNAL_FIXTURE.brand,
    INTERNAL_FIXTURE.name,
  );
  resetDataLayer();
  let dispatched = 0;
  function spy(): void {
    dispatched += 1;
  }
  target.addEventListener(SHELF_OUTBOUND_EVENT, spy);

  const handler = shelfOutboundClickHandler(link, {
    brand: INTERNAL_FIXTURE.brand,
    productName: INTERNAL_FIXTURE.name,
    pageKind: "ingredient",
    pageSlug: "fixture",
  });
  // No call possible — handler is undefined. We assert that fact AND
  // confirm nothing was emitted as a side effect of building it.
  expect(
    handler === undefined,
    `internal-link handler should remain undefined under spy attachment`,
  );
  expect(
    dispatched === 0,
    `building an internal-link handler must not dispatch any "${SHELF_OUTBOUND_EVENT}" events (got ${dispatched})`,
  );
  const dl = target.dataLayer ?? [];
  expect(
    dl.length === 0,
    `building an internal-link handler must not push to dataLayer (got ${dl.length} entries)`,
  );

  target.removeEventListener(SHELF_OUTBOUND_EVENT, spy);
}

// ─────────────────────────────────────────────────────────────────────
// Report.
// ─────────────────────────────────────────────────────────────────────
if (failures.length === 0) {
  console.log(
    `✓ Shelf outbound tracking OK — internal "Read review" clicks emit no event; ` +
      `external clicks emit exactly one event with the right pageKind / pageSlug / href ` +
      `for all ${PAGE_KINDS.length} shelf surfaces (${PAGE_KINDS.join(", ")}).`,
  );
  process.exit(0);
}

console.error(
  `✗ Shelf outbound tracking contract broken — ${failures.length} assertion(s) failed:`,
);
for (const f of failures) console.error(`  • ${f}`);
console.error(
  `\n   This guards the agreed semantics in replit.md → "Analytics — shelf outbound clicks":\n` +
    `   internal review links must never emit a shelf_outbound_click event,\n` +
    `   and external brand/retailer links must emit exactly one with the right meta.`,
);
process.exit(1);
