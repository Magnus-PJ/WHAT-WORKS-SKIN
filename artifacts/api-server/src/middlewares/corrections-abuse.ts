import type { Request, RequestHandler } from "express";

// Abuse defences for the public `POST /api/corrections` sink. The
// endpoint is intentionally unauthenticated — any reader should be
// able to flag an error without signing up — so we layer cheap,
// low-friction safeguards instead of an auth gate:
//
//   1. A 16 KB body cap mounted in `app.ts` as a route-scoped
//      `express.json({ limit })` *before* the global parser, so
//      oversized payloads are rejected with 413 before they're fully
//      read. The 16 KB ceiling comfortably fits the 4 KB description
//      cap from the zod schema plus headers and overhead.
//   2. `enforceCorrectionsAllowedOrigin` — reject requests whose
//      `Origin` / `Referer` host isn't one of our own domains. Real
//      browser POSTs from the on-page form always include at least
//      one of these headers, so absence is itself a signal.
//   3. `enforceCorrectionsRateLimit` — a fixed-window per-IP counter
//      that returns 429 once a sane per-hour ceiling is exceeded.
//      Tighter than the shelf-click sink because corrections are
//      human-rate (a busy reader files maybe one a day), not
//      machine-rate.
//   4. The route handler itself implements a server-side honeypot
//      (`website` field) that real browsers leave blank and bots
//      fill in.
//
// In-memory + dependency-free, like the sibling shelf-click /
// editor-sign-in limiters. If/when we scale horizontally this should
// move to a shared store.

// ─────────────────────────────────────────────────────────────────────
// Origin / Referer allowlist
// ─────────────────────────────────────────────────────────────────────
function envHostList(name: string): string[] {
  const raw = process.env[name];
  if (!raw) return [];
  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .map((entry) => {
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
  // We piggy-back on the same env var the shelf-click sink uses so
  // operators only have one allowlist to keep up to date for both
  // public POST endpoints.
  for (const h of envHostList("SHELF_CLICK_ALLOWED_ORIGINS")) hosts.add(h);
  for (const h of envHostList("CORRECTIONS_ALLOWED_ORIGINS")) hosts.add(h);
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

export function enforceCorrectionsAllowedOrigin(): RequestHandler {
  return (req, res, next) => {
    const allowed = buildAllowedHosts(req);
    const originHost = headerHost(req.get("origin"));
    const refererHost = headerHost(req.get("referer"));

    if (!originHost && !refererHost) {
      req.log.warn(
        "corrections: rejected request with no Origin/Referer",
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
      "corrections: rejected disallowed origin",
    );
    res.status(403).json({ error: "forbidden_origin" });
  };
}

// ─────────────────────────────────────────────────────────────────────
// Per-IP rate limit
// ─────────────────────────────────────────────────────────────────────
// Hourly window — corrections are a human-rate action (a single
// reader filing a typo), not a machine-rate one. The default ceiling
// (10/hr) is still generous: a legitimate "I'm reading the same brief
// and spotted three things" reader stays well under it.
const DEFAULT_RATE_LIMIT_PER_HOUR = 10;
const RATE_WINDOW_MS = 60 * 60 * 1000;
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
  // boundary.
  return req.ip ?? req.socket.remoteAddress ?? "unknown";
}

function readRateLimitFromEnv(): number {
  const raw = process.env["CORRECTIONS_RATE_LIMIT_PER_HOUR"];
  if (!raw) return DEFAULT_RATE_LIMIT_PER_HOUR;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_RATE_LIMIT_PER_HOUR;
  }
  return parsed;
}

export interface CorrectionsRateLimiter {
  middleware: RequestHandler;
  reset: () => void;
}

export function createCorrectionsRateLimiter(opts?: {
  limitPerHour?: number;
  now?: () => number;
}): CorrectionsRateLimiter {
  const limit = opts?.limitPerHour ?? readRateLimitFromEnv();
  const now = opts?.now ?? Date.now;
  const windows = new Map<string, IpWindow>();

  const middleware: RequestHandler = (req, res, next) => {
    const ip = clientIp(req);
    const t = now();
    let entry = windows.get(ip);
    if (!entry || t - entry.windowStart >= RATE_WINDOW_MS) {
      entry = { count: 0, windowStart: t };
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

    if (entry.count > limit) {
      const retryAfterSec = Math.max(
        1,
        Math.ceil((RATE_WINDOW_MS - (t - entry.windowStart)) / 1000),
      );
      res.setHeader("Retry-After", String(retryAfterSec));
      req.log.warn(
        { ip, count: entry.count, limit },
        "corrections: rate-limited IP",
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

const sharedLimiter = createCorrectionsRateLimiter();

export function enforceCorrectionsRateLimit(): RequestHandler {
  return sharedLimiter.middleware;
}
