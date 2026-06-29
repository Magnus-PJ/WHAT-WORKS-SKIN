// SELF-CONTAINED inline search controller, embedded verbatim into
// /search via `<script is:inline>` (loaded with Vite's `?raw` suffix
// at build time). Inline because the Replit dev preview serves the
// site under a `/whatworksskin/` proxy prefix that does NOT route
// Astro's root-relative dev URLs (`/src/...`, `/_astro/...`,
// `/@vite/client`) through to the artifact's port — so any
// `<script src="...">` would 404 in dev and break the typeahead.
//
// This file is plain JS (no TS, no imports) so it can be `?raw`-
// imported by the Astro page and written directly into the HTML.
//
// IMPORTANT: the `rankSearchEntries` body below MUST stay
// behaviourally equivalent to the canonical TS version in
// `src/lib/search-index.ts`. The "inline-bundle parity" section of
// `scripts/test-search-index.ts` loads this file with `node:vm`,
// reads the rank function out via the `__WWS_INLINE_RANK__` test
// hook below, and asserts identical output across synthetic
// fixtures, the full real corpus, and varied limit values.
(function () {
  "use strict";

  var SEARCH_LIMIT = 16;

  var KIND_TINT = {
    Ingredient: "var(--accent)",
    Product: "var(--ink)",
    Routine: "var(--ink-soft)",
    Concern: "var(--ink-soft)",
    Supplement: "var(--ink-soft)",
    "Trend Watch": "var(--warning, #b45309)",
  };

  // Test hook: expose the rank function to Node when this file is
  // executed via `vm.runInNewContext` from the contract test (no
  // `document`). The branch is taken AFTER `rankSearchEntries` is
  // defined below, so the assignment happens at the bottom of the IIFE.
  function rankSearchEntries(query, entries, limit) {
    if (limit == null) limit = 12;
    var q = String(query || "").trim().toLowerCase();
    if (!q) return [];
    var tokens = q.split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return [];

    var scored = [];
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      var allMatch = true;
      var score = 0;
      var title = e.title.toLowerCase();
      var kind = e.kind.toLowerCase();
      for (var k = 0; k < tokens.length; k++) {
        var t = tokens[k];
        if (e.haystack.indexOf(t) < 0) {
          allMatch = false;
          break;
        }
        if (title === t) score += 100;
        else if (title.indexOf(t) === 0) score += 40;
        else if (title.indexOf(t) >= 0) score += 20;
        else score += 4;
        if (kind.indexOf(t) >= 0) score += 6;
      }
      if (!allMatch) continue;
      if (title === q) score += 200;
      else if (title.indexOf(q) === 0) score += 80;
      scored.push({ entry: e, score: score });
    }
    scored.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return a.entry.title.localeCompare(b.entry.title);
    });
    return scored.slice(0, limit).map(function (s) {
      return s.entry;
    });
  }

  // ---------------------------------------------------------------------
  // Test-only escape: when running under Node (no `document`), expose
  // `rankSearchEntries` on `globalThis` and bail out before the DOM
  // controller below tries to read `document.readyState`.
  // ---------------------------------------------------------------------
  if (typeof document === "undefined") {
    if (typeof globalThis !== "undefined") {
      globalThis.__WWS_INLINE_RANK__ = rankSearchEntries;
    }
    return;
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderResults(results) {
    var html = "";
    for (var i = 0; i < results.length; i++) {
      var r = results[i];
      var num = String(i + 1);
      if (num.length < 2) num = "0" + num;
      var tint = KIND_TINT[r.kind] || "var(--ink)";
      var tier = r.tier
        ? '<span class="search-result-tier" data-tier="' +
          esc(r.tier) +
          '">' +
          esc(r.tier) +
          "</span>"
        : "";
      var eyebrow = r.eyebrow
        ? '<p class="search-result-eyebrow">' + esc(r.eyebrow) + "</p>"
        : "";
      var oneliner = r.oneliner
        ? '<p class="search-result-oneliner">' + esc(r.oneliner) + "</p>"
        : "";
      html +=
        '<li><a class="search-result" href="' +
        esc(r.href) +
        '">' +
        '<div class="search-result-meta">' +
        '<span class="search-result-num">' +
        num +
        " ·</span>" +
        '<span class="search-result-kind" style="color: ' +
        tint +
        '">' +
        esc(r.kind) +
        "</span>" +
        tier +
        "</div>" +
        '<div class="search-result-body">' +
        '<h3 class="search-result-title">' +
        esc(r.title) +
        "</h3>" +
        eyebrow +
        oneliner +
        '<p class="search-result-href">' +
        esc(r.href) +
        "</p>" +
        "</div>" +
        "</a></li>";
    }
    return html;
  }

  function init() {
    var root = document.getElementById("wws-search-root");
    if (!root) return;
    var input = root.querySelector("#wws-search-input");
    var clearBtn = root.querySelector("#wws-search-clear");
    var meta = root.querySelector("#wws-search-meta");
    var emptySection = root.querySelector("#wws-search-empty");
    var zeroSection = root.querySelector("#wws-search-zero");
    var resultsList = root.querySelector("#wws-search-results");
    if (!input || !clearBtn || !meta || !emptySection || !zeroSection || !resultsList) {
      return;
    }

    var data = window.__WWS_SEARCH_ENTRIES__;
    var entries = Array.isArray(data) ? data : [];
    var totalEntries = entries.length;
    var briefWord = totalEntries === 1 ? "brief" : "briefs";
    var initialMeta =
      totalEntries +
      " " +
      briefWord +
      " indexed across ingredients, products, routines, concerns, supplements, and Trend Watch.";

    if (totalEntries === 0) {
      meta.textContent = initialMeta;
    }

    // Sync the current query into the URL via `?q=…` so a typed
    // search is bookmarkable / shareable. We use `replaceState` (not
    // `pushState`) so a single search session does NOT spam the
    // browser history with an entry per keystroke — back/forward
    // still moves the reader between pages, not between letters.
    // `popstate` (below) handles the case where a fresh entry
    // arrives via a back/forward navigation between distinct pages.
    function syncUrl(query) {
      if (typeof window === "undefined" || !window.history) return;
      try {
        var nextUrl = new URL(window.location.href);
        var trimmed = query.trim();
        if (trimmed) {
          if (nextUrl.searchParams.get("q") === trimmed) return;
          nextUrl.searchParams.set("q", trimmed);
        } else {
          if (!nextUrl.searchParams.has("q")) return;
          nextUrl.searchParams.delete("q");
        }
        window.history.replaceState(
          window.history.state,
          "",
          nextUrl.pathname + nextUrl.search + nextUrl.hash,
        );
      } catch (_err) {
        /* URL APIs unavailable — fall back silently. */
      }
    }

    function setState(query) {
      var trimmed = query.trim();
      var hasQuery = trimmed.length > 0;
      clearBtn.hidden = !hasQuery;

      if (!hasQuery) {
        meta.textContent = initialMeta;
        emptySection.hidden = false;
        zeroSection.hidden = true;
        resultsList.hidden = true;
        resultsList.innerHTML = "";
        return;
      }

      var results = rankSearchEntries(trimmed, entries, SEARCH_LIMIT);
      var resultWord = results.length === 1 ? "result" : "results";
      meta.innerHTML =
        results.length +
        " " +
        resultWord +
        ' for <span class="search-meta-q">"' +
        esc(trimmed) +
        '"</span> across ' +
        totalEntries +
        " indexed " +
        briefWord +
        ".";

      if (results.length === 0) {
        emptySection.hidden = true;
        zeroSection.hidden = false;
        resultsList.hidden = true;
        resultsList.innerHTML = "";
        return;
      }

      emptySection.hidden = true;
      zeroSection.hidden = true;
      resultsList.hidden = false;
      resultsList.innerHTML = renderResults(results);
    }

    // Tiny debounce so we don't re-rank on every keystroke while a
    // reader is still typing. 80ms is below typical typing cadence,
    // so the UI still feels live, but rapid bursts coalesce. We
    // also fold the URL sync into the debounced path so `?q=` is
    // updated on the same cadence as the visible result list.
    var debounceHandle = 0;
    function scheduleSetState(value) {
      if (debounceHandle) {
        window.clearTimeout(debounceHandle);
      }
      debounceHandle = window.setTimeout(function () {
        debounceHandle = 0;
        setState(value);
        syncUrl(value);
      }, 80);
    }
    function flushSetState(value) {
      if (debounceHandle) {
        window.clearTimeout(debounceHandle);
        debounceHandle = 0;
      }
      setState(value);
      syncUrl(value);
    }

    input.addEventListener("input", function () {
      scheduleSetState(input.value);
    });
    input.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && input.value) {
        event.preventDefault();
        input.value = "";
        flushSetState("");
        input.focus();
      }
    });
    clearBtn.addEventListener("click", function () {
      input.value = "";
      flushSetState("");
      input.focus();
    });

    var chips = root.querySelectorAll(".search-example");
    for (var i = 0; i < chips.length; i++) {
      (function (btn) {
        btn.addEventListener("click", function () {
          var q = btn.getAttribute("data-query") || (btn.textContent || "").trim();
          input.value = q;
          flushSetState(q);
          input.focus();
        });
      })(chips[i]);
    }

    // Back/forward navigation between distinct history entries can
    // land us on this page with a different `?q=…` than what's in
    // the input. Re-seed from the URL and re-render so the visible
    // query, the URL, and the result list all agree.
    window.addEventListener("popstate", function () {
      var nextQ = "";
      try {
        nextQ = new URL(window.location.href).searchParams.get("q") || "";
      } catch (_err) {
        nextQ = "";
      }
      if (input.value !== nextQ) {
        input.value = nextQ;
      }
      if (debounceHandle) {
        window.clearTimeout(debounceHandle);
        debounceHandle = 0;
      }
      setState(nextQ);
    });

    // Seed from the URL on first paint. Two paths can fill the
    // input here:
    //   1. SSR: `search.astro` reads `Astro.url.searchParams.get("q")`
    //      and stamps the value attribute. That works under any SSR
    //      adapter (and is how a JS-disabled crawler still sees the
    //      seeded query in the HTML).
    //   2. Static SSG: the page is prerendered without request
    //      context, so the SSR `value=""` is empty. We then read
    //      `window.location.search` ourselves so a shareable link
    //      like `/search?q=tretinoin` STILL lands on a populated
    //      result list — just one paint later, on hydration.
    // Either way, calling `setState` re-ranks and re-renders the
    // result list so the visible state matches the URL.
    if (!input.value) {
      try {
        var seedQ = new URL(window.location.href).searchParams.get("q") || "";
        if (seedQ) input.value = seedQ;
      } catch (_err) {
        /* URL APIs unavailable — fall back to whatever the SSR markup gave us. */
      }
    }
    if (input.value) {
      clearBtn.hidden = false;
      setState(input.value);
    }

    input.focus();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
