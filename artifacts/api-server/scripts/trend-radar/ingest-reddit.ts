// Reddit ingestor — pulls hot posts from a curated set of skincare
// subreddits via the public `.json` endpoint. Reddit doesn't require
// API auth for these read-only queries as long as we throttle and
// send a real User-Agent.
//
// We deliberately stick to "what is being talked about right now"
// (the hot listing) rather than scraping comments. The clustering
// pass uses titles + flair as signal text.

import { insertSignals, politeFetchJson, type RawSignal } from "./_lib";

const SUBREDDITS = [
  "SkincareAddiction",
  "30PlusSkinCare",
  "AsianBeauty",
  "Skincare_Addiction_UK",
  "tretinoin",
  "Rosacea",
];

const HOT_LIMIT = 25;

type RedditListing = {
  data: {
    children: Array<{
      data: {
        id: string;
        title: string;
        permalink: string;
        selftext?: string;
        created_utc: number;
        score: number;
        num_comments: number;
        link_flair_text?: string | null;
        over_18: boolean;
      };
    }>;
  };
};

export async function ingestReddit(): Promise<{ inserted: number; skipped: number }> {
  const all: RawSignal[] = [];
  for (const sub of SUBREDDITS) {
    const url = `https://www.reddit.com/r/${sub}/hot.json?limit=${HOT_LIMIT}`;
    let listing: RedditListing;
    try {
      listing = await politeFetchJson<RedditListing>("reddit", url);
    } catch (err) {
      console.warn(`[reddit] ${sub} fetch failed:`, err);
      continue;
    }
    for (const child of listing.data.children ?? []) {
      const p = child.data;
      // Skip NSFW content — out of scope and would just pollute the
      // editorial queue.
      if (p.over_18) continue;
      // Drop ultra-low-engagement posts so a single Reddit power user
      // can't single-handedly seed a "trend".
      if (p.score < 5 && p.num_comments < 3) continue;
      all.push({
        source: "reddit",
        sourceUrl: `https://www.reddit.com${p.permalink}`,
        title: p.title,
        body: p.selftext?.slice(0, 1000) ?? null,
        publishedAt: new Date(p.created_utc * 1000),
        extra: {
          subreddit: sub,
          score: p.score,
          numComments: p.num_comments,
          flair: p.link_flair_text ?? null,
        },
      });
    }
  }
  const result = await insertSignals(all);
  console.log(`[reddit] +${result.inserted} new (skipped ${result.skipped})`);
  return result;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  ingestReddit()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
