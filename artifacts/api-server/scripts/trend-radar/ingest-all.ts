// Convenience runner — invokes all four ingestors in series so a cron
// job can call a single command. Source-level failures don't abort the
// run; a downed PubMed shouldn't keep us from picking up Reddit signals.

import { ingestReddit } from "./ingest-reddit";
import { ingestPubMed } from "./ingest-pubmed";
import { ingestGoogleTrends } from "./ingest-google-trends";
import { ingestFda } from "./ingest-fda";

async function main(): Promise<void> {
  const start = Date.now();
  const results: Record<string, { inserted: number; skipped: number } | string> = {};
  for (const [name, fn] of [
    ["reddit", ingestReddit],
    ["pubmed", ingestPubMed],
    ["google-trends", ingestGoogleTrends],
    ["fda-news", ingestFda],
  ] as const) {
    try {
      results[name] = await fn();
    } catch (err) {
      console.error(`[${name}] ingestor crashed:`, err);
      results[name] = err instanceof Error ? err.message : String(err);
    }
  }
  console.log("---");
  console.log(`Trend Radar ingest finished in ${Math.round((Date.now() - start) / 1000)}s`);
  console.log(JSON.stringify(results, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
