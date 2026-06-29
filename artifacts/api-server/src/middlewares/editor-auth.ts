import type { RequestHandler, CookieOptions } from "express";

// HttpOnly signed-cookie session for editor dashboards. The shared
// `EDITOR_TOKEN` value is exchanged once at `POST /editor/sign-in` for
// this cookie, then never travels to the browser again — the cookie is
// what the GET shelf-clicks route checks. Keeping the cookie HttpOnly
// also keeps it out of JS, so a pasted screenshot or a casually leaked
// frontend bundle can't reveal it.

export const EDITOR_COOKIE_NAME = "evidently_editor";
const EDITOR_COOKIE_VALUE = "ok";
const EDITOR_COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function editorCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    signed: true,
    sameSite: "lax",
    // The dashboard runs over HTTPS in dev (Replit proxy) and prod, but
    // we don't gate `secure` on NODE_ENV because the proxy-served URL
    // is always HTTPS for users.
    secure: true,
    path: "/",
    maxAge: EDITOR_COOKIE_MAX_AGE_MS,
  };
}

export function editorCookieValue(): string {
  return EDITOR_COOKIE_VALUE;
}

export function isEditorCookieValid(value: unknown): boolean {
  return value === EDITOR_COOKIE_VALUE;
}

export function requireEditor(): RequestHandler {
  return (req, res, next) => {
    if (!process.env["EDITOR_TOKEN"]) {
      req.log.error(
        "editor-auth: EDITOR_TOKEN is not configured; refusing request",
      );
      res.status(401).json({ error: "editor_auth_unconfigured" });
      return;
    }
    if (isEditorCookieValid(req.signedCookies?.[EDITOR_COOKIE_NAME])) {
      next();
      return;
    }
    res.status(401).json({ error: "editor_auth_required" });
  };
}
