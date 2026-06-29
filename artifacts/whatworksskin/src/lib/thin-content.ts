import report from "../../scripts/thin-content-report.json";

export type ThinKind = "concerns" | "routines" | "supplements" | "products" | "trend-watch";

type Bucket = { thin: string[]; partiallyThin?: string[]; expectedSkinny: string[] };
type Report = Partial<Record<ThinKind, Bucket>>;

const typed = report as Report;

const thinSets: Record<ThinKind, Set<string>> = {
  concerns: new Set(typed.concerns?.thin ?? []),
  routines: new Set(typed.routines?.thin ?? []),
  supplements: new Set(typed.supplements?.thin ?? []),
  products: new Set(typed.products?.thin ?? []),
  "trend-watch": new Set(typed["trend-watch"]?.thin ?? []),
};

const partiallyThinSets: Record<ThinKind, Set<string>> = {
  concerns: new Set(typed.concerns?.partiallyThin ?? []),
  routines: new Set(typed.routines?.partiallyThin ?? []),
  supplements: new Set(typed.supplements?.partiallyThin ?? []),
  products: new Set(typed.products?.partiallyThin ?? []),
  "trend-watch": new Set(typed["trend-watch"]?.partiallyThin ?? []),
};

const expectedSkinnySets: Record<ThinKind, Set<string>> = {
  concerns: new Set(typed.concerns?.expectedSkinny ?? []),
  routines: new Set(typed.routines?.expectedSkinny ?? []),
  supplements: new Set(typed.supplements?.expectedSkinny ?? []),
  products: new Set(typed.products?.expectedSkinny ?? []),
  "trend-watch": new Set(typed["trend-watch"]?.expectedSkinny ?? []),
};

export function isThin(kind: ThinKind, slug: string): boolean {
  if (expectedSkinnySets[kind].has(slug)) return false;
  return thinSets[kind].has(slug);
}

export function isPartiallyThin(kind: ThinKind, slug: string): boolean {
  if (expectedSkinnySets[kind].has(slug)) return false;
  return partiallyThinSets[kind].has(slug);
}
