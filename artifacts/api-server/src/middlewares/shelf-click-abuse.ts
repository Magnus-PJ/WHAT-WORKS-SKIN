import type { Request, RequestHandler } from "express";

// Abuse defences for the public `POST /api/analytics/shelf-click`
// sink. The endpoint must remain unauthenticated — the in-page
// outbound-click forwarder uses `navigator.sendBeacon`, which can't
// carry an editor session — so we layer cheap, low-friction
// safeguards instead:
//
//   1. A 64 KB body cap mounted in `app.ts` as a route-scoped
//      `express.json({ limit })` *before* the global parser, so
//      oversized payloads are rejected with 413 before they're fully
//      read. This sits on top of the existing per-event field caps
//      and the 50-event batch cap enforced by the zod schema.
//   2. `enforceShelfClickAllowedOrigin` — reject requests whose
//      `Origin` / `Referer` host isn't one of our own domains. Real
//      browser POSTs (including `sendBeacon`) always include at least
//      one of these headers, so absence is itself a signal. Headers
//      are spoofable by curl, so this only acts as a coarse first
//      filter — the per-IP rate limiter is the real spam shield.
//   3. `enforceShelfClickRateLimit` — a fixed-window per-IP counter
//      that returns 429 once a sane per-minute ceiling is exceeded.
//      Keys off Express's `req.ip`, which honours the trusted-proxy
//      configuration set in `app.ts`.
//
// Tunable via environment variables so we can tighten/loosen without
// a redeploy if abuse patterns shift.

// ─────────────────────────────────────────────────────────────────────
// Origin / Referer allowlist
// ─────────────────────────────────────────────────────────────────────
// Build the allowlist from Replit's standard env vars (so dev preview
// and deployed domains are covered automatically) plus any extra hosts
// from `SHELF_CLICK_ALLOWED_ORIGINS` (comma-separated). The request's
// own `Host` is always allowed, which trivially covers the
// same-origin case the legitimate forwarder uses.
function envHostList(name: string): string[] {
  const raw = process.env[name];
  if (!raw) return [];
  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .map((entry) => {
      // Accept either bare hosts (`example.com`) or full origins
      // (`https://example.com`). We normalise to bare host so the
      // header comparison below ignores scheme/port noise.
      try {
        return new URL(
          entry.includes("://") ? entry : `https://${entry}`,
        ).host.toLowerCase();
      } catch {
        return entry.toLowerCase();
      }
    });
}

function buildAllowedHosts(req: Request): Set<string> {
  const hosts = new Set<string>();
  for (const h of envHostList("REPLIT_DEV_DOMAIN")) hosts.add(h);
  for (const h of envHostList("REPLIT_DOMAINS")) hosts.add(h);
  for (const h of envHostList("SHELF_CLICK_ALLOWED_ORIGINS")) hosts.add(h);
  // Trust the request's own host so any same-origin POST is allowed
  // even when the deployment domain isn't in the env yet (e.g. a
  // freshly published preview URL).
  const ownHost = req.get("host");
  if (ownHost) hosts.add(ownHost.toLowerCase());
  return hosts;
}

function headerHost(value: string | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).host.toLowerCase();
  } catch {
    return null;
  }
}

export function enforceShelfClickAllowedOrigin(): RequestHandler {
  return (req, res, next) => {
    const allowed = buildAllowedHosts(req);
    const originHost = headerHost(req.get("origin"));
    const refererHost = headerHost(req.get("referer"));

    // Real browsers always attach at least one of Origin / Referer to
    // a same-origin POST (and `sendBeacon` is no exception). A
    // request that has neither is almost certainly a scripted curl
    // loop, so we drop it.
    if (!originHost && !refererHost) {
      req.log.warn(
        "shelf-click: rejected request with no Origin/Referer",
      );
      res.status(403).json({ error: "forbidden_origin" });
      return;
    }

    if (
      (originHost && allowed.has(originHost)) ||
      (refererHost && allowed.has(refererHost))
    ) {
      next();
      return;
    }

    req.log.warn(
      { originHost, refererHost },
      "shelf-click: rejected disallowed origin",
    );
    res.status(403).json({ error: "forbidden_origin" });
  };
}

// ─────────────────────────────────────────────────────────────────────
// Per-IP rate limit
// ─────────────────────────────────────────────────────────────────────
// Fixed-window counter keyed by client IP. We deliberately stay
// in-memory and dependency-free: the API server runs as a single
// process today, the limit is best-effort (not a billing meter), and
// keeping it local avoids dragging in Redis just for spam shielding.
// If/when we scale horizontally this should move to a shared store.
const DEFAULT_RATE_LIMIT_PER_MIN = 60;
const RATE_WINDOW_MS = 60 * 1000;
// Hard cap on the in-memory map size so a flood of unique IPs can't
// balloon RSS. We evict in insertion order (Map preserves it) once
// the cap is hit, which is a coarse but bounded GC.
const MAX_TRACKED_IPS = 10_000;

interface IpWindow {
  count: number;
  windowStart: number;
}

function clientIp(req: Request): string {
  // `req.ip` reflects the real client IP because `app.ts` sets
  // `trust proxy = 1` (one trusted hop = Replit's edge). Reading
  // `X-Forwarded-For` ourselves would be unsafe here because the
  // header is attacker-controlled when not gated by a trusted-proxy
  // boundary — a spammer could vary it per request to bypass the
  // per-IP ceiling entirely.
  return req.ip ?? req.socket.remoteAddress ?? "unknown";
}

function readRateLimitFromEnv(): number {
  const raw = process.env["SHELF_CLICK_RATE_LIMIT_PER_MIN"];
  if (!raw) return DEFAULT_RATE_LIMIT_PER_MIN;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_RATE_LIMIT_PER_MIN;
  }
  return parsed;
}

export interface ShelfClickRateLimiter {
  middleware: RequestHandler;
  // Exposed for tests so they can start from a clean slate without
  // having to wait `RATE_WINDOW_MS` between assertions.
  reset: () => void;
}

export function createShelfClickRateLimiter(opts?: {
  limitPerMin?: number;
  now?: () => number;
}): ShelfClickRateLimiter {
  const limitPerMin = opts?.limitPerMin ?? readRateLimitFromEnv();
  const now = opts?.now ?? Date.now;
  const windows = new Map<string, IpWindow>();

  const middleware: RequestHandler = (req, res, next) => {
    const ip = clientIp(req);
    const t = now();
    let entry = windows.get(ip);
    if (!entry || t - entry.windowStart >= RATE_WINDOW_MS) {
      entry = { count: 0, windowStart: t };
      // Keep insertion order fresh so eviction below is meaningful.
      windows.delete(ip);
      windows.set(ip, entry);
    }
    entry.count += 1;

    if (windows.size > MAX_TRACKED_IPS) {
      const oldestKey = windows.keys().next().value;
      if (oldestKey !== undefined && oldestKey !== ip) {
        windows.delete(oldestKey);
      }
    }

    if (entry.count > limitPerMin) {
      const retryAfterSec = Math.max(
        1,
        Math.ceil((RATE_WINDOW_MS - (t - entry.windowStart)) / 1000),
      );
      res.setHeader("Retry-After", String(retryAfterSec));
      req.log.warn(
        { ip, count: entry.count, limitPerMin },
        "shelf-click: rate-limited IP",
      );
      res.status(429).json({ error: "rate_limited" });
      return;
    }
    next();
  };

  return {
    middleware,
    reset: () => windows.clear(),
  };
}

// Module-level singleton so every request hits the same counter map
// regardless of how many times the route file is imported.
const sharedLimiter = createShelfClickRateLimiter();

export function enforceShelfClickRateLimit(): RequestHandler {
  return sharedLimiter.middleware;
}
