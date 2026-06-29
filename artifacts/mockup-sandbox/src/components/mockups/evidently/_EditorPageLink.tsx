// EditorPageLink — small editor-only deep link rendered at the foot of
// every Concern, Routine, and Ingredient guide. Clicking it lands on
// the shelf-click dashboard already drilled into this page's slice
// (`?page=<kind>:<slug>`), saving editors a scroll through the grouped
// list. The link is gated by `useEditorMode()` so public visitors never
// see it.

import React from "react";
import { ArrowUpRight } from "lucide-react";
import { Container, MONO, SANS } from "./_chrome";
import { T } from "./_theme";
import { useEditorMode } from "./_editorMode";

const PREVIEW_BASE = "/__mockup/preview/evidently";
const DASHBOARD_PATH = `${PREVIEW_BASE}/EditorShelfClicks`;

export type EditorPageLinkProps = {
  /** Which kind of editorial page this is. Must match the value the
   *  shelf-click tracker sends with each click. */
  pageKind: "ingredient" | "routine" | "concern";
  /** Per-kind page identifier. Ingredient pages use the catalogue slug
   *  (e.g. `tretinoin`); routine and concern pages use the detail-page
   *  component file name (e.g. `RoutineBareMinimum`, `ConcernRosacea`)
   *  because multiple catalogue slugs can alias the same component. */
  pageSlug: string;
};

/** URL-encodes the `?page=<kind>:<slug>` deep link so the dashboard can
 *  pre-select the matching group. The colon is part of the dashboard's
 *  internal `${pageKind}:${pageSlug}` key — encoding the whole value
 *  via `encodeURIComponent` keeps slugs that might contain reserved
 *  characters (e.g. a future slug with a slash) safe in transit. */
export function dashboardDeepLinkHref(
  pageKind: EditorPageLinkProps["pageKind"],
  pageSlug: string,
): string {
  const value = `${pageKind}:${pageSlug}`;
  return `${DASHBOARD_PATH}?page=${encodeURIComponent(value)}`;
}

export const EditorPageLink: React.FC<EditorPageLinkProps> = ({
  pageKind,
  pageSlug,
}) => {
  const isEditor = useEditorMode();
  if (!isEditor) return null;

  const href = dashboardDeepLinkHref(pageKind, pageSlug);

  return (
    <aside
      aria-label="Editor tools"
      className="relative z-10 border-t border-b"
      style={{ borderColor: T.rule, background: T.paper2 }}
    >
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-3 py-4">
          <span
            style={{
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: "0.18em",
              color: T.mutedSoft,
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Editor tools
          </span>
          <a
            href={href}
            className="inline-flex items-center gap-1.5"
            style={{
              fontFamily: SANS,
              fontSize: 12.5,
              fontWeight: 600,
              color: T.accent,
              textDecoration: "none",
            }}
          >
            Open shelf-click data for this page
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </Container>
    </aside>
  );
};

export default EditorPageLink;
