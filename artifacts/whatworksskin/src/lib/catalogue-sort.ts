// Resolve the active catalogue sort mode from a request URL.
//
// Catalogue index pages share the `SortToggle` component but each
// page owns its own list of valid sort modes (e.g. ingredients
// supports "default" / "links" / "paired"; products supports
// "default" / "links"). To keep SSR and the SortToggle's active
// button in lock-step when a reader lands on a shared `?sort=…`
// link, both the page and the toggle resolve the active mode the
// same way: trust the query param if it matches a known mode for
// this page, otherwise fall back to the page's default.
//
// Unknown modes are silently ignored rather than 404'd because a
// reader copying a URL between two slightly different catalogue
// pages (e.g. ingredients ?sort=paired pasted onto products) should
// still land on a sensible view, not an error.
export function resolveSortMode(
  url: URL,
  validModes: readonly string[],
  defaultMode: string,
): string {
  const raw = url.searchParams.get("sort");
  if (raw && validModes.includes(raw)) return raw;
  return defaultMode;
}

// Apply the catalogue sort to a list of items that carry the same
// per-card metadata the SortToggle script reads at runtime
// (`linkCount`, optional `pairedCount`). Returns a new array; the
// original `defaultIndex` of each item is preserved so the
// `data-default-index` attribute keeps pointing at the editorial
// order regardless of what mode rendered the cards.
export interface SortableItem<T> {
  entry: T;
  defaultIndex: number;
  linkCount: number;
  pairedCount?: number;
}

export function sortCatalogueItems<T>(
  items: ReadonlyArray<SortableItem<T>>,
  mode: string,
): SortableItem<T>[] {
  const copy = items.slice();
  if (mode === "links") {
    copy.sort((a, b) => {
      if (b.linkCount !== a.linkCount) return b.linkCount - a.linkCount;
      return a.defaultIndex - b.defaultIndex;
    });
  } else if (mode === "paired") {
    copy.sort((a, b) => {
      const pa = a.pairedCount ?? 0;
      const pb = b.pairedCount ?? 0;
      if (pb !== pa) return pb - pa;
      return a.defaultIndex - b.defaultIndex;
    });
  }
  // Default mode: leave the editorial order alone.
  return copy;
}
