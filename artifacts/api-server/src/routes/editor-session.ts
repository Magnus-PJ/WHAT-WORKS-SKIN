import { Router, type IRouter } from "express";
import {
  EDITOR_COOKIE_NAME,
  editorCookieOptions,
  editorCookieValue,
  isEditorCookieValid,
} from "../middlewares/editor-auth";
import {
  enforceEditorSignInRateLimit,
  recordEditorSignInFailure,
  recordEditorSignInSuccess,
} from "../middlewares/editor-sign-in-rate-limit";

const router: IRouter = Router();

// Deterministic delay applied to every failed sign-in response. Slows
// scripted token guessing without adding noticeable latency for a
// human operator who only types the token once. Combined with the
// per-IP rate limit, this caps sustainable guess rates at a few
// attempts every fifteen minutes per source IP.
const FAILURE_DELAY_MS = 250;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// `POST /api/editor/sign-in` exchanges the shared `EDITOR_TOKEN` for an
// HttpOnly signed session cookie. The dashboard prompts the editor for
// the token once; from then on the cookie is what authorises the
// editor-only API surface (currently `GET /analytics/shelf-clicks`).
//
// Constant-time string compare avoids leaking token length differences
// via timing.
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

router.post(
  "/editor/sign-in",
  // Rate limit runs *before* the handler so callers who've already
  // burned through their attempts get 429'd without us touching the
  // token compare path at all.
  enforceEditorSignInRateLimit(),
  async (req, res) => {
    const expected = process.env["EDITOR_TOKEN"];
    if (!expected) {
      req.log.error(
        "editor sign-in: EDITOR_TOKEN is not configured; refusing request",
      );
      res.status(503).json({ error: "editor_auth_unconfigured" });
      return;
    }
    const body = (req.body ?? {}) as { token?: unknown };
    const provided = typeof body.token === "string" ? body.token : "";
    if (!provided || !timingSafeEqual(provided, expected)) {
      recordEditorSignInFailure(req);
      // Pause before responding so a scripted guesser can't just blast
      // 5 attempts back-to-back inside a few milliseconds and then
      // rotate IPs — it has to wait for each rejection too.
      await delay(FAILURE_DELAY_MS);
      req.log.warn("editor sign-in: rejected mismatched token");
      res.status(401).json({ error: "invalid_token" });
      return;
    }
    // Clear any prior failure count for this IP so a legitimate
    // operator who mistyped the token a few times isn't locked out
    // the moment they finally get it right.
    recordEditorSignInSuccess(req);
    res.cookie(EDITOR_COOKIE_NAME, editorCookieValue(), editorCookieOptions());
    res.status(204).end();
  },
);

router.post("/editor/sign-out", (_req, res) => {
  res.clearCookie(EDITOR_COOKIE_NAME, { path: "/" });
  res.status(204).end();
});

// `GET /api/editor/session` is a tiny status probe so editor-only UI on
// the public site (e.g. the deep-link from a guide page to its slice of
// the shelf-click dashboard) can decide whether to render itself
// without going through the full sign-in form. The actual editor
// authorisation is still enforced by `requireEditor()` on the data
// routes — this endpoint only reports whether the cookie is valid and
// never returns any sensitive state, so it's safe to leave unguarded.
router.get("/editor/session", (req, res) => {
  const signedIn = isEditorCookieValid(
    req.signedCookies?.[EDITOR_COOKIE_NAME],
  );
  res.json({ signedIn });
});

export default router;
