// Editor-mode detection for the public preview pages.
//
// The actual editor session is an HttpOnly signed cookie (`evidently_editor`)
// issued by `POST /api/editor/sign-in` and enforced by the editor-only
// API surface. Because the cookie is HttpOnly we can't read it from JS,
// so this hook asks the API: `GET /api/editor/session` returns
// `{ signedIn: boolean }` based purely on whether the request carried a
// valid cookie. UI gated on this hook (e.g. the per-page "Open shelf-click
// data for this page →" deep link) renders only when an editor is signed
// in; everyone else gets `false` and never sees the link.
//
// The result is cached in module scope so the dozens of guide pages
// don't each hit the endpoint on first navigation — the first call wins
// and subsequent mounts use the cached promise. Public visitors who
// never sign in pay exactly one network round-trip per browser session.

import { useEffect, useState } from "react";

const SESSION_ENDPOINT = "/api/editor/session";

let _cached: Promise<boolean> | null = null;

function fetchEditorSession(): Promise<boolean> {
  if (_cached) return _cached;
  _cached = fetch(SESSION_ENDPOINT, {
    credentials: "include",
    headers: { accept: "application/json" },
  })
    .then((res) => {
      if (!res.ok) return false;
      return res.json().then((body: { signedIn?: unknown }) => {
        return body?.signedIn === true;
      });
    })
    .catch(() => false);
  return _cached;
}

/** Returns `true` once the API has confirmed the caller carries a valid
 *  editor session cookie, `false` otherwise (including while the probe
 *  is in flight). Components that gate visibility on editor mode
 *  therefore render nothing during the probe and avoid a flash of
 *  editor-only chrome on public visitors' screens. */
export function useEditorMode(): boolean {
  const [isEditor, setIsEditor] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    fetchEditorSession().then((value) => {
      if (!cancelled) setIsEditor(value);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return isEditor;
}

/** Drop the cached editor-session probe so the next `useEditorMode()`
 *  caller refetches. Call this after any flow that changes the cookie
 *  in this tab — i.e. successful editor sign-in / sign-out — so a
 *  guide page rendered in the same tab can reveal (or hide) the
 *  editor-only deep link without forcing a full reload. */
export function invalidateEditorModeCache(): void {
  _cached = null;
}

/** Reset the cached probe — only used by tests, not by app code. */
export function _resetEditorModeCacheForTests(): void {
  _cached = null;
}
