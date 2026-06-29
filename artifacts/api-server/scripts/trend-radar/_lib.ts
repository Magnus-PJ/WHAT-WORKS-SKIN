// Shared helpers for Trend Radar ingest scripts.
//
// All four free-tier sources (Reddit public JSON, PubMed E-utilities,
// Google Trends daily-trends RSS, FDA news RSS) flow through this
// helper so the polite-fetch pattern, dedup hash, and Drizzle insert
// shape live in one place. Ingest scripts only have to provide a
// source-specific parser that turns an HTTP response into a list of
// `RawSignal` rows.

import { createHash } from "node:crypto";
import { db, trendSignalsTable, type InsertTrendSignal } from "@workspace/db";

// Single browser-fakeable UA string keeps us out of accidental WAF
// blocks while still identifying the project to anyone reading server
// logs (Reddit's TOS asks for an honest UA; this leans honest enough).
const USER_AGENT =
  "WhatWorksSkinTrendRadar/0.1 (+https://whatworksskin.com; ingestion bot, contact dr.paul@whatworksskin.com)";

export type TrendSource = "reddit" | "pubmed" | "google-trends" | "fda-news";

export type RawSignal = {
  source: TrendSource;
  sourceUrl: string;
  title: string;
  body?: string | null;
  publishedAt?: Date | null;
  extra?: Record<string, unknown>;
};

// Polite fetch: 1 request per second per source, plus a short jitter.
// We keep the limiter per-source so a slow PubMed call doesn't stall
// the Reddit batch. Returns the parsed JSON or string body depending
// on the requested type.
const lastCallAt: Record<TrendSource, number> = {
  reddit: 0,
  pubmed: 0,
  "google-trends": 0,
  "fda-news": 0,
};

const MIN_INTERVAL_MS = 1000;

async function politeWait(source: TrendSource): Promise<void> {
  const now = Date.now();
  const wait = lastCallAt[source] + MIN_INTERVAL_MS - now;
  if (wait > 0) {
    await new Promise((r) => setTimeout(r, wait + Math.random() * 100));
  }
  lastCallAt[source] = Date.now();
}

export async function politeFetchJson<T = unknown>(
  source: TrendSource,
  url: string,
): Promise<T> {
  await politeWait(source);
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`${source}: ${url} → HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function politeFetchText(
  source: TrendSource,
  url: string,
): Promise<string> {
  await politeWait(source);
  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/rss+xml, application/xml, text/xml, */*",
    },
  });
  if (!res.ok) {
    throw new Error(`${source}: ${url} → HTTP ${res.status}`);
  }
  return await res.text();
}

// Stable dedup hash: source + canonical URL. Using the URL alone would
// miss cross-source dupes (the same FDA notice surfacing on Reddit),
// but since we want to weight signals per source those *should* count
// separately. Hash by (source + url) so re-running an ingestor is a
// no-op rather than appending duplicates.
export function signalHash(source: TrendSource, sourceUrl: string): string {
  return createHash("sha256")
    .update(`${source}::${sourceUrl}`)
    .digest("hex")
    .slice(0, 32);
}

// Bulk insert with `ON CONFLICT DO NOTHING` on the hash unique index.
// Drizzle's `onConflictDoNothing` lets us insert idempotent batches —
// re-running an ingestor 5 minutes later just no-ops on the already-
// persisted rows, which keeps the candidate clustering pass stable.
export async function insertSignals(
  rows: RawSignal[],
): Promise<{ inserted: number; skipped: number }> {
  if (rows.length === 0) return { inserted: 0, skipped: 0 };
  const values: InsertTrendSignal[] = rows.map((r) => ({
    source: r.source,
    sourceUrl: r.sourceUrl,
    title: r.title.slice(0, 500),
    body: r.body ?? null,
    publishedAt: r.publishedAt ?? null,
    hash: signalHash(r.source, r.sourceUrl),
    extra: r.extra ? JSON.stringify(r.extra) : null,
  }));
  const inserted = await db
    .insert(trendSignalsTable)
    .values(values)
    .onConflictDoNothing({ target: trendSignalsTable.hash })
    .returning({ id: trendSignalsTable.id });
  return { inserted: inserted.length, skipped: rows.length - inserted.length };
}

// Trivial XML element extractor. We deliberately avoid a full XML
// parser dependency for the two RSS feeds (Google Trends, FDA news);
// both are well-formed enough that a regex over <item>…</item> blocks
// gets us title + link + pubDate without dragging in a parser. The
// fallback is graceful — anything we can't parse is just skipped.
export function parseRssItems(xml: string): Array<{
  title: string;
  link: string;
  pubDate?: string;
  description?: string;
}> {
  const items: Array<{
    title: string;
    link: string;
    pubDate?: string;
    description?: string;
  }> = [];
  const itemRegex = /<item\b[^>]*>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = stripTag(block, "title");
    const link = stripTag(block, "link");
    const pubDate = stripTag(block, "pubDate");
    const description = stripTag(block, "description");
    if (title && link) {
      items.push({ title, link, pubDate, description });
    }
  }
  return items;
}

function stripTag(block: string, tag: string): string | undefined {
  const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = re.exec(block);
  if (!m) return undefined;
  let v = m[1];
  // Unwrap CDATA, decode the four entities Astro / RSS feeds actually
  // ever emit. We don't try to be a full HTML decoder — the title
  // strings end up in a database column and a reviewer UI, both of
  // which are tolerant of leftover entities.
  v = v.replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/, "$1");
  v = v
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  return v.trim() || undefined;
}

export function parseRssDate(s?: string): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}
