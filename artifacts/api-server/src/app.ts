import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { env } from "./lib/env";

const app: Express = express();

// `SESSION_SECRET` signs the editor-session cookie. We treat the var as
// required so we never silently fall back to an unsigned cookie that an
// attacker could mint themselves.
const sessionSecret = env.SESSION_SECRET;

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
// One trusted proxy hop in front of us (Replit's edge). Required so
// `req.ip` reflects the real client IP from `X-Forwarded-For` instead
// of the attacker-controlled raw header — the per-IP rate limit on the
// public shelf-click sink depends on this. The editor session cookie
// hard-codes `secure: true`, so flipping this on does not change cookie
// behaviour.
const trustProxyVal = env.TRUST_PROXY;
const parsedTrustProxy =
  trustProxyVal === "true"
    ? true
    : trustProxyVal === "false"
      ? false
      : !isNaN(Number(trustProxyVal))
        ? Number(trustProxyVal)
        : trustProxyVal;
app.set("trust proxy", parsedTrustProxy);

app.use(cors());

// Tight 64 KB body cap on the public shelf-click sink, mounted *before*
// the global JSON parser so the request stream is consumed (and
// rejected with 413 if oversized) before the default 100 KB parser
// ever sees it. The global parser below short-circuits when `req.body`
// is already populated.
app.use(
  "/api/analytics/shelf-click",
  express.json({ limit: "64kb" }),
);

// Tight 16 KB body cap on the public corrections sink, mounted *before*
// the global JSON parser so the request stream is consumed (and rejected
// with 413 if oversized) before the default 100 KB parser ever sees it.
// 16 KB comfortably fits the 4 KB description ceiling from the zod
// schema plus the small URL/email fields and HTTP overhead.
app.use(
  "/api/corrections",
  express.json({ limit: "16kb" }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(sessionSecret));

app.use("/api", router);

export default app;
