// Google Trends ingestor — pulls daily-trend RSS for both US and IN,
// keeps only items whose title/description matches our skincare token
// allowlist, and dedupes across the two feeds via the shared
// `insertSignals` hash key.

import {
  insertSignals,
  parseRssDate,
  parseRssItems,
  politeFetchText,
  type RawSignal,
} from "./_lib";

const LOCALES = [
  { geo: "US", feed: "daily-trends-us" },
  { geo: "IN", feed: "daily-trends-in" },
] as const;

// Cheap relevance gate. If a daily trend doesn't mention any of these
// tokens it's almost certainly not a skincare story (sports / politics
// / breaking news). Better to under-collect than to flood the queue
// with off-topic items the founders have to manually reject.
const SKINCARE_TOKENS = [
  "skin",
  "acne",
  "retinol",
  "tretinoin",
  "spf",
  "sunscreen",
  "moisturi",
  "exfoliat",
  "dermatolog",
  "rosacea",
  "eczema",
  "wrinkle",
  "pore",
  "serum",
  "vitamin c",
  "niacinamide",
  "hyaluron",
  "peptide",
  "collagen",
  "botox",
  "filler",
  "skincare",
  "makeup",
  "beauty",
];

function isLikelySkincare(text: string): boolean {
  const t = text.toLowerCase();
  return SKINCARE_TOKENS.some((tok) => t.includes(tok));
}

export async function ingestGoogleTrends(): Promise<{ inserted: number; skipped: number }> {
  const all: RawSignal[] = [];
  for (const { geo, feed } of LOCALES) {
    const url = `https://trends.google.com/trends/trendingsearches/daily/rss?geo=${geo}`;
    let xml: string;
    try {
      xml = await politeFetchText("google-trends", url);
    } catch (err) {
      console.warn(`[google-trends:${geo}] feed fetch failed:`, err);
      continue;
    }
    const items = parseRssItems(xml);
    let kept = 0;
    for (const it of items) {
      const haystack = `${it.title} ${it.description ?? ""}`;
      if (!isLikelySkincare(haystack)) continue;
      all.push({
        source: "google-trends",
        sourceUrl: it.link,
        title: it.title,
        body: it.description ?? null,
        publishedAt: parseRssDate(it.pubDate),
        extra: { feed, geo },
      });
      kept += 1;
    }
    console.log(`[google-trends:${geo}] kept ${kept}/${items.length} skincare items`);
  }
  // insertSignals dedupes via the unique hash on (source + sourceUrl), so
  // the same trend appearing in both US + IN feeds collapses to one row.
  const result = await insertSignals(all);
  console.log(`[google-trends] +${result.inserted} new (skipped ${result.skipped})`);
  return result;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  ingestGoogleTrends()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
