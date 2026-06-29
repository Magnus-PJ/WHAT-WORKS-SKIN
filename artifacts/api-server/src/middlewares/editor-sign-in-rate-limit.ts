import type { Request, RequestHandler } from "express";

// Per-IP rate limit for `POST /api/editor/sign-in`. The endpoint
// authenticates against the shared `EDITOR_TOKEN`, so without a
// throttle an attacker who's discovered the editor surface (e.g. via
// the public `GET /api/editor/session` probe) can script unbounded
// guesses. Constant-time compare in the handler stops length leaks but
// doesn't slow brute force on its own.
//
// Strategy:
//   - Track *failed* sign-in attempts per client IP in a fixed
//     15-minute window. Counting only failures means a legitimate
//     editor who signs in repeatedly (e.g. clearing cookies during
//     dev) is never throttled.
//   - Once `MAX_FAILED_ATTEMPTS` is hit, the middleware short-circuits
//     with HTTP 429 and a `Retry-After` header until the window rolls
//     over.
//   - Successful sign-ins clear the IP's counter so an operator who
//     fat-fingered the token a few times isn't locked out the moment
//     they finally get it right.
//   - Only the sign-in route is wrapped — `GET /editor/session` and
//     `POST /editor/sign-out` are untouched, so the public probe still
//     answers normally.
//
// In-memory + dependency-free: the API server is single-process today
// and the limit is best-effort spam shielding, not a billing meter. If
// we scale horizontally this should move to a shared store.

const DEFAULT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_MAX_FAILED_ATTEMPTS = 5;
// Hard cap on the in-memory map size so a flood of unique IPs can't
// balloon RSS. Insertion-ordered eviction matches the shelf-click
// limiter's approach.
const MAX_TRACKED_IPS = 10_000;

interface IpWindow {
  failures: number;
  windowStart: number;
}

function clientIp(req: Request): string {
  // `req.ip` reflects the real client IP because `app.ts` sets
  // `trust proxy = 1` (one trusted hop = Replit's edge). Reading
  // `X-Forwarded-For` ourselves would be unsafe — when not gated by a
  // trusted-proxy boundary, an attacker could vary the header per
  // request to bypass the per-IP ceiling entirely.
  return req.ip ?? req.socket.remoteAddress ?? "unknown";
}

export interface EditorSignInRateLimiter {
  middleware: RequestHandler;
  recordFailure: (req: Request) => void;
  recordSuccess: (req: Request) => void;
  // Exposed so tests can start from a clean slate without waiting
  // `windowMs` between assertions.
  reset: () => void;
}

export function createEditorSignInRateLimiter(opts?: {
  maxFailedAttempts?: number;
  windowMs?: number;
  now?: () => number;
}): EditorSignInRateLimiter {
  const maxFailed = opts?.maxFailedAttempts ?? DEFAULT_MAX_FAILED_ATTEMPTS;
  const windowMs = opts?.windowMs ?? DEFAULT_WINDOW_MS;
  const now = opts?.now ?? Date.now;
  const windows = new Map<string, IpWindow>();

  function getActiveEntry(ip: string, t: number): IpWindow | undefined {
    const entry = windows.get(ip);
    if (!entry) return undefined;
    if (t - entry.windowStart >= windowMs) {
      windows.delete(ip);
      return undefined;
    }
    return entry;
  }

  const middleware: RequestHandler = (req, res, next) => {
    const ip = clientIp(req);
    const entry = getActiveEntry(ip, now());
    if (entry && entry.failures >= maxFailed) {
      const retryAfterSec = Math.max(
        1,
        Math.ceil((windowMs - (now() - entry.windowStart)) / 1000),
      );
      res.setHeader("Retry-After", String(retryAfterSec));
      req.log.warn(
        { ip, failures: entry.failures, maxFailed },
        "editor sign-in: rate-limited IP",
      );
      res.status(429).json({ error: "rate_limited" });
      return;
    }
    next();
  };

  function recordFailure(req: Request): void {
    const ip = clientIp(req);
    const t = now();
    let entry = windows.get(ip);
    if (!entry || t - entry.windowStart >= windowMs) {
      entry = { failures: 0, windowStart: t };
    }
    entry.failures += 1;
    // Re-insert so the Map's insertion order reflects recency for the
    // eviction step below.
    windows.delete(ip);
    windows.set(ip, entry);

    if (windows.size > MAX_TRACKED_IPS) {
      const oldestKey = windows.keys().next().value;
      if (oldestKey !== undefined && oldestKey !== ip) {
        windows.delete(oldestKey);
      }
    }
  }

  function recordSuccess(req: Request): void {
    windows.delete(clientIp(req));
  }

  return {
    middleware,
    recordFailure,
    recordSuccess,
    reset: () => windows.clear(),
  };
}

// Module-level singleton so every request hits the same counter map
// regardless of how many times the route file is imported.
const sharedLimiter = createEditorSignInRateLimiter();

export function enforceEditorSignInRateLimit(): RequestHandler {
  return sharedLimiter.middleware;
}

export function recordEditorSignInFailure(req: Request): void {
  sharedLimiter.recordFailure(req);
}

export function recordEditorSignInSuccess(req: Request): void {
  sharedLimiter.recordSuccess(req);
}
