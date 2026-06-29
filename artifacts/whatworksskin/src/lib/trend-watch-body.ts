// Helpers for the structured `verdict.body` shape used by Trend Watch
// issues. Editors author the body as either a plain string (the
// historical shape, unchanged) or a structured array of segments where
// individual runs of text can carry an inline link to an existing
// brief:
//
//   "body": [
//     "Lead-in prose, ",
//     { "text": "UV filters brief", "kind": "ingredient", "slug": "uv-filters" },
//     " — trailing prose."
//   ]
//
// `TrendWatchIssue.astro` renders these segments as real `<a>` tags;
// the cross-link coverage report walks them so each inline link is
// verified against the live brief catalogue and counted toward the
// resolved-reference total instead of leaking into the matcher-gap
// stats as untracked free text.

/**
 * Kinds of brief an inline trend-watch link can target. Matches the
 * top-level content directories under `src/content/` so the renderer
 * can build a URL by `${kind}s/${slug}`.
 */
export type TrendWatchLinkKind =
  | "ingredient"
  | "concern"
  | "product"
  | "supplement"
  | "routine";

export type TrendWatchBodyLink = {
  text: string;
  kind: TrendWatchLinkKind;
  slug: string;
};

export type TrendWatchBodySegment = string | TrendWatchBodyLink;

/**
 * Map a link kind to the page-route prefix it lives under. Centralised
 * here so the renderer and any future consumer agree on the URL shape
 * without re-deriving the pluralisation rule.
 */
export const KIND_TO_ROUTE: Record<TrendWatchLinkKind, string> = {
  ingredient: "ingredients",
  concern: "concerns",
  product: "products",
  supplement: "supplements",
  routine: "routines",
};

/**
 * Type-guard for an inline link segment. Anything else is treated as
 * plain text (the renderer interpolates strings as-is).
 */
export function isLinkSegment(s: unknown): s is TrendWatchBodyLink {
  if (!s || typeof s !== "object") return false;
  const r = s as Record<string, unknown>;
  return (
    typeof r.text === "string" &&
    typeof r.slug === "string" &&
    typeof r.kind === "string" &&
    (r.kind as string) in KIND_TO_ROUTE
  );
}

/**
 * Normalise `body` (string | array | undefined | unknown) into a
 * uniform list of segments the renderer can iterate. A plain string
 * becomes a single text segment; an array is filtered to keep only
 * non-empty strings and well-formed link objects.
 */
export function normaliseBody(body: unknown): TrendWatchBodySegment[] {
  if (body == null) return [];
  if (typeof body === "string") return body === "" ? [] : [body];
  if (!Array.isArray(body)) return [];
  const out: TrendWatchBodySegment[] = [];
  for (const seg of body) {
    if (typeof seg === "string") {
      if (seg !== "") out.push(seg);
    } else if (isLinkSegment(seg)) {
      out.push(seg);
    }
  }
  return out;
}

/**
 * Pull every inline link segment out of a body. Used by the cross-link
 * coverage report to verify that each link's `(kind, slug)` resolves
 * to an existing brief.
 */
export function extractLinks(body: unknown): TrendWatchBodyLink[] {
  return normaliseBody(body).filter(isLinkSegment) as TrendWatchBodyLink[];
}
