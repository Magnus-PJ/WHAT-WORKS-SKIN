// Contract tests for the regex-based RSS parser.
//
// The Google Trends daily-trends feed and the FDA news / cosmetics RSS
// feeds both flow through `parseRssItems` and `parseRssDate` in
// ../_lib.ts. Those helpers deliberately avoid a full XML parser, so
// they are sensitive to feed-shape changes — if either upstream tweaks
// its element layout (different namespace, new wrapper tag, encoded
// CDATA, ...) the parser silently returns zero items and that source
// quietly stops producing trend signals. These tests pin the shapes
// we currently rely on so a regression turns red instead of going
// unnoticed.
//
// Run with:  pnpm --filter @workspace/api-server run test

import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { parseRssDate, parseRssItems } from "../_lib";

// Representative snapshot of the Google Trends daily-trends RSS feed
// (https://trends.google.com/trends/trendingsearches/daily/rss?geo=US).
// Notable shape quirks we deliberately keep:
//   - <ht:approx_traffic> and other ht:* namespaced siblings inside
//     each <item>; our regex must not be confused by them.
//   - <title> wrapped in CDATA on the channel (but not on items).
//   - HTML entities (&amp;) in titles.
//   - Multiple <ht:news_item> children, each with their own <title>
//     and <link> — those should NOT bleed into the item-level title
//     because `stripTag` matches the first <title> after the <item>
//     opening tag (which is the trend headline itself).
const GOOGLE_TRENDS_FIXTURE = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:ht="https://trends.google.com/trends/trendingsearches/daily" version="2.0">
  <channel>
    <title><![CDATA[Daily Search Trends]]></title>
    <link>https://trends.google.com/trends/trendingsearches/daily?geo=US</link>
    <description>Recent daily search trends from Google.</description>
    <language>en-US</language>
    <item>
      <title>Tretinoin shortage sparks dermatologist concern</title>
      <link>https://trends.google.com/trends/trendingsearches/daily?geo=US#tretinoin</link>
      <pubDate>Mon, 28 Apr 2025 10:00:00 -0700</pubDate>
      <description>Tretinoin supply issues affecting acne &amp; anti-aging routines</description>
      <ht:approx_traffic>50,000+</ht:approx_traffic>
      <ht:news_item>
        <ht:news_item_title>Why your tretinoin pharmacy is suddenly out of stock</ht:news_item_title>
        <ht:news_item_url>https://example.com/news/tretinoin-shortage</ht:news_item_url>
        <ht:news_item_source>Allure</ht:news_item_source>
      </ht:news_item>
      <ht:news_item>
        <ht:news_item_title>Dermatologists weigh in on the retinoid gap</ht:news_item_title>
        <ht:news_item_url>https://example.com/news/derm-weighs-in</ht:news_item_url>
        <ht:news_item_source>NYT</ht:news_item_source>
      </ht:news_item>
    </item>
    <item>
      <title><![CDATA[Niacinamide vs. vitamin C — which goes first?]]></title>
      <link>https://trends.google.com/trends/trendingsearches/daily?geo=US#niacinamide</link>
      <pubDate>Sun, 27 Apr 2025 22:30:00 -0700</pubDate>
      <description><![CDATA[Layering order debate resurfaces on TikTok]]></description>
      <ht:approx_traffic>20,000+</ht:approx_traffic>
    </item>
    <item>
      <title>NBA playoffs Game 5 highlights</title>
      <link>https://trends.google.com/trends/trendingsearches/daily?geo=US#nba</link>
      <pubDate>Sun, 27 Apr 2025 21:00:00 -0700</pubDate>
      <description>Off-topic sports trend — relevance gate elsewhere should drop it</description>
      <ht:approx_traffic>500,000+</ht:approx_traffic>
    </item>
  </channel>
</rss>`;

// Representative snapshot of the FDA news RSS feed
// (https://www.fda.gov/.../press-announcements/rss.xml). The
// real feed wraps descriptions in CDATA-with-HTML, uses guids, and
// emits RFC-822 pubDates with EDT/EST timezone names. We pin all of
// those here so a future feed migration shows up loudly.
const FDA_NEWS_FIXTURE = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
  <channel>
    <title>FDA Press Announcements</title>
    <link>https://www.fda.gov/news-events/fda-newsroom/press-announcements</link>
    <description>Recent press announcements from the U.S. Food and Drug Administration.</description>
    <language>en-us</language>
    <atom:link href="https://www.fda.gov/.../press-announcements/rss.xml" rel="self" type="application/rss+xml"/>
    <item>
      <title>FDA Warns Consumers About Benzene Contamination in Sunscreen Lots</title>
      <link>https://www.fda.gov/news-events/press-announcements/fda-warns-benzene-sunscreen-2025</link>
      <description><![CDATA[<p>The U.S. Food and Drug Administration today issued a warning regarding benzene contamination detected in specific lots of aerosol sunscreen products.</p>]]></description>
      <pubDate>Wed, 23 Apr 2025 14:30:00 EDT</pubDate>
      <guid isPermaLink="false">fda-press-2025-04-23-benzene-sunscreen</guid>
    </item>
    <item>
      <title>FDA Issues Recall of Hydroquinone Skin-Lightening Cream</title>
      <link>https://www.fda.gov/news-events/press-announcements/fda-recall-hydroquinone-2025</link>
      <description><![CDATA[<p>The agency announced a voluntary recall of an OTC hydroquinone-based skin-lightening cream after lab testing found mercury contamination.</p>]]></description>
      <pubDate>Tue, 15 Apr 2025 09:00:00 EDT</pubDate>
      <guid isPermaLink="false">fda-press-2025-04-15-hydroquinone-recall</guid>
    </item>
  </channel>
</rss>`;

describe("parseRssItems — Google Trends daily-trends snapshot", () => {
  it("returns one entry per <item> in feed order", () => {
    const items = parseRssItems(GOOGLE_TRENDS_FIXTURE);
    assert.equal(items.length, 3, "three <item> blocks → three rows");
  });

  it("extracts the item-level title, link, and pubDate (not the channel-level ones)", () => {
    const items = parseRssItems(GOOGLE_TRENDS_FIXTURE);
    const first = items[0];
    assert.equal(first.title, "Tretinoin shortage sparks dermatologist concern");
    assert.equal(
      first.link,
      "https://trends.google.com/trends/trendingsearches/daily?geo=US#tretinoin",
    );
    assert.equal(first.pubDate, "Mon, 28 Apr 2025 10:00:00 -0700");
    assert.equal(
      first.description,
      "Tretinoin supply issues affecting acne & anti-aging routines",
      "should decode the &amp; entity in the description",
    );
  });

  it("does not let nested <ht:news_item><ht:news_item_title> children leak into the item title", () => {
    // The first item has two <ht:news_item> siblings, each containing
    // their own title-shaped tag. Because `stripTag` looks for
    // <title>…</title> (not <ht:news_item_title>…</ht:news_item_title>),
    // the nested news headlines must NOT replace the trend title.
    const items = parseRssItems(GOOGLE_TRENDS_FIXTURE);
    assert.equal(items[0].title, "Tretinoin shortage sparks dermatologist concern");
    assert.notEqual(items[0].title, "Why your tretinoin pharmacy is suddenly out of stock");
  });

  it("unwraps CDATA-wrapped titles and descriptions on the second item", () => {
    const items = parseRssItems(GOOGLE_TRENDS_FIXTURE);
    const second = items[1];
    assert.equal(second.title, "Niacinamide vs. vitamin C — which goes first?");
    assert.equal(second.description, "Layering order debate resurfaces on TikTok");
  });
});

describe("parseRssItems — FDA news snapshot", () => {
  it("returns one entry per <item> in feed order", () => {
    const items = parseRssItems(FDA_NEWS_FIXTURE);
    assert.equal(items.length, 2);
  });

  it("extracts title, link, and EDT-suffixed pubDate from the FDA item shape", () => {
    const items = parseRssItems(FDA_NEWS_FIXTURE);
    const first = items[0];
    assert.equal(
      first.title,
      "FDA Warns Consumers About Benzene Contamination in Sunscreen Lots",
    );
    assert.equal(
      first.link,
      "https://www.fda.gov/news-events/press-announcements/fda-warns-benzene-sunscreen-2025",
    );
    assert.equal(first.pubDate, "Wed, 23 Apr 2025 14:30:00 EDT");
  });

  it("preserves CDATA-wrapped HTML descriptions verbatim (caller decides what to do with them)", () => {
    const items = parseRssItems(FDA_NEWS_FIXTURE);
    // We intentionally do NOT strip the inner <p> tags — downstream
    // consumers truncate/clean as needed. The contract here is just
    // that CDATA is unwrapped and the inner HTML survives.
    assert.ok(items[0].description?.startsWith("<p>"), "inner <p> survives CDATA unwrap");
    assert.ok(
      items[0].description?.includes("benzene contamination"),
      "description body text is preserved",
    );
  });

  it("produces a parseable date string for every item", () => {
    const items = parseRssItems(FDA_NEWS_FIXTURE);
    for (const it of items) {
      const parsed = parseRssDate(it.pubDate);
      assert.ok(parsed instanceof Date, `pubDate ${it.pubDate} should parse to a Date`);
      assert.ok(!Number.isNaN(parsed!.getTime()), "should not be Invalid Date");
    }
  });
});

describe("parseRssItems — malformed / edge-case behaviour", () => {
  it("skips an <item> block missing both title and link without throwing", () => {
    const xml = `<?xml version="1.0"?>
<rss><channel>
  <item>
    <title>Good Item With Title And Link</title>
    <link>https://example.com/good</link>
    <pubDate>Mon, 28 Apr 2025 10:00:00 -0700</pubDate>
  </item>
  <item>
    <pubDate>Mon, 28 Apr 2025 11:00:00 -0700</pubDate>
    <description>No title, no link — should be silently skipped, not throw.</description>
  </item>
  <item>
    <title>Title But Missing Link</title>
    <pubDate>Mon, 28 Apr 2025 12:00:00 -0700</pubDate>
  </item>
</channel></rss>`;
    let items: ReturnType<typeof parseRssItems> = [];
    assert.doesNotThrow(() => {
      items = parseRssItems(xml);
    });
    assert.equal(items.length, 1, "only the well-formed item survives");
    assert.equal(items[0].title, "Good Item With Title And Link");
  });

  it("returns [] when the feed contains no <item> blocks at all", () => {
    const xml = `<?xml version="1.0"?>
<rss><channel><title>Empty feed</title></channel></rss>`;
    assert.deepEqual(parseRssItems(xml), []);
  });

  it("returns [] on completely non-XML input rather than throwing", () => {
    assert.doesNotThrow(() => parseRssItems("not xml at all <<<>>>"));
    assert.deepEqual(parseRssItems("not xml at all <<<>>>"), []);
  });
});

describe("parseRssDate", () => {
  it("parses an RFC-822 date with an explicit numeric offset", () => {
    const d = parseRssDate("Mon, 28 Apr 2025 10:00:00 -0700");
    assert.ok(d instanceof Date);
    assert.equal(d!.toISOString(), "2025-04-28T17:00:00.000Z");
  });

  it("parses an RFC-822 date with a US timezone abbreviation (FDA shape)", () => {
    const d = parseRssDate("Wed, 23 Apr 2025 14:30:00 EDT");
    assert.ok(d instanceof Date);
    assert.ok(!Number.isNaN(d!.getTime()), "EDT-suffixed date should not be Invalid Date");
  });

  it("returns null for undefined input", () => {
    assert.equal(parseRssDate(undefined), null);
  });

  it("returns null for an empty string", () => {
    assert.equal(parseRssDate(""), null);
  });

  it("returns null (not Invalid Date) for an unparseable string", () => {
    // The contract is "null on unparseable" — callers store the result
    // straight into a `publishedAt` column, and an Invalid Date there
    // would either crash the driver or write NaN.
    const result = parseRssDate("not a date at all, just words");
    assert.equal(result, null, "unparseable strings must return null, not Invalid Date");
  });

  it("returns null for the literal string 'Invalid Date'", () => {
    assert.equal(parseRssDate("Invalid Date"), null);
  });
});
