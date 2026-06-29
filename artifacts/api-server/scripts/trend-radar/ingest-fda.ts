// FDA news / press-announcements ingestor.
//
// The FDA publishes a public RSS feed of cosmetics-related press
// announcements, recalls, and safety advisories. We pull two relevant
// feeds — press announcements (covers most cosmetic regulatory news)
// and the cosmetics-specific recalls feed — and let the clustering
// pass dedupe overlap. RSS, no auth needed.

import {
  insertSignals,
  parseRssDate,
  parseRssItems,
  politeFetchText,
  type RawSignal,
} from "./_lib";

const FEEDS = [
  // Cosmetics topic feed (recalls, warnings, MoCRA news).
  "https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/cosmetics/rss.xml",
  // Press announcements — broader, but cheap to filter post-hoc.
  "https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/press-announcements/rss.xml",
];

const PRESS_KEYWORDS = [
  "cosmetic",
  "skincare",
  "skin care",
  "sunscreen",
  "spf",
  "talc",
  "retinoid",
  "asbestos",
  "moca",
  "mocra",
  "lead",
  "benzene",
  "trolamine",
  "hydroquinone",
  "minoxidil",
];

function isCosmeticsRelevant(feedUrl: string, title: string, desc?: string): boolean {
  // The cosmetics-topic feed is on-topic by definition; everything from
  // the press feed needs to mention a cosmetics-relevant token.
  if (feedUrl.includes("/cosmetics/")) return true;
  const t = `${title} ${desc ?? ""}`.toLowerCase();
  return PRESS_KEYWORDS.some((k) => t.includes(k));
}

export async function ingestFda(): Promise<{ inserted: number; skipped: number }> {
  const all: RawSignal[] = [];
  for (const feed of FEEDS) {
    let xml: string;
    try {
      xml = await politeFetchText("fda-news", feed);
    } catch (err) {
      console.warn(`[fda-news] ${feed} fetch failed:`, err);
      continue;
    }
    for (const it of parseRssItems(xml)) {
      if (!isCosmeticsRelevant(feed, it.title, it.description)) continue;
      all.push({
        source: "fda-news",
        sourceUrl: it.link,
        title: it.title,
        body: it.description ?? null,
        publishedAt: parseRssDate(it.pubDate),
        extra: { feed },
      });
    }
  }
  const result = await insertSignals(all);
  console.log(`[fda-news] +${result.inserted} new (skipped ${result.skipped})`);
  return result;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  ingestFda()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
