// PubMed ingestor — uses NCBI's E-utilities (esearch + esummary) to
// pull the most recent dermatology / cosmetic-science publications.
// E-utilities are public and free; the only requirement is a polite
// rate limit (3 req/s without an API key, but we cap at 1 req/s in
// `_lib.ts` to be conservative).

import { insertSignals, politeFetchJson, type RawSignal } from "./_lib";

// PubMed query terms tuned to surface skincare-relevant trials and
// reviews while excluding pure laboratory work that wouldn't translate
// into a Trend Watch verdict.
const QUERIES = [
  '("dermatology"[MeSH] AND "cosmetics"[MeSH])',
  '("skin aging"[MeSH] AND "randomized controlled trial"[Publication Type])',
  '("acne vulgaris"[MeSH] AND ("review"[Publication Type] OR "clinical trial"[Publication Type]))',
  '("retinoids"[MeSH] AND "skin"[MeSH])',
  '("sunscreening agents"[MeSH] AND ("photoaging"[All Fields] OR "ultraviolet"[All Fields]))',
];

const RESULTS_PER_QUERY = 10;
const RECENT_DAYS = 30;

type ESearchResponse = {
  esearchresult: {
    idlist: string[];
  };
};

type ESummaryResponse = {
  result: Record<
    string,
    {
      uid?: string;
      title?: string;
      pubdate?: string;
      source?: string;
      authors?: Array<{ name: string }>;
    } & Record<string, unknown>
  >;
};

export async function ingestPubMed(): Promise<{ inserted: number; skipped: number }> {
  const all: RawSignal[] = [];
  for (const term of QUERIES) {
    const search =
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi` +
      `?db=pubmed&retmode=json&retmax=${RESULTS_PER_QUERY}` +
      `&reldate=${RECENT_DAYS}&datetype=pdat&term=${encodeURIComponent(term)}`;
    let ids: string[] = [];
    try {
      const r = await politeFetchJson<ESearchResponse>("pubmed", search);
      ids = r.esearchresult.idlist ?? [];
    } catch (err) {
      console.warn(`[pubmed] esearch failed for "${term}":`, err);
      continue;
    }
    if (ids.length === 0) continue;

    const summary =
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi` +
      `?db=pubmed&retmode=json&id=${ids.join(",")}`;
    let summaries: ESummaryResponse;
    try {
      summaries = await politeFetchJson<ESummaryResponse>("pubmed", summary);
    } catch (err) {
      console.warn(`[pubmed] esummary failed for ids ${ids.join(",")}:`, err);
      continue;
    }
    for (const id of ids) {
      const row = summaries.result[id];
      if (!row || !row.title) continue;
      all.push({
        source: "pubmed",
        sourceUrl: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
        title: row.title,
        body: typeof row.source === "string" ? row.source : null,
        publishedAt: typeof row.pubdate === "string" ? new Date(row.pubdate) : null,
        extra: {
          query: term,
          authors: Array.isArray(row.authors)
            ? row.authors.slice(0, 3).map((a) => a.name)
            : [],
        },
      });
    }
  }
  const result = await insertSignals(all);
  console.log(`[pubmed] +${result.inserted} new (skipped ${result.skipped})`);
  return result;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  ingestPubMed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
