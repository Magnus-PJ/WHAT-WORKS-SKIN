/**
 * Integration test: the `?q=` round-trip on `/whatworksskin/search`
 * survives refactors of `search.astro` or `search-ui.inline.js`.
 *
 * The shareable-link contract has three moving parts:
 *
 *   1. SSR SEEDING — landing on `/whatworksskin/search?q=tretinoin`
 *      paints the input pre-filled AND the result list rendered into
 *      the initial HTML, with no client round-trip required (so the
 *      page isn't blank for the first ~80ms after hydration).
 *
 *   2. URL SYNC ON TYPE — typing into the input mirrors the current
 *      query into `?q=…` via `history.replaceState`, NOT
 *      `pushState`. A multi-character query must not push one
 *      history entry per keystroke: back/forward should still skip
 *      between distinct pages, never between letters.
 *
 *   3. CLEAR REMOVES `?q=` — both Escape and the X button must reset
 *      the input AND strip `?q=` from the visible URL, so the
 *      shareable link reflects the visible state.
 *
 * Implementation: this test boots a real `astro dev` server in a
 * child process, fetches the live `/whatworksskin/search?q=…`
 * response (so SSR markup comes from the actual `search.astro`
 * route, NOT a hand-rolled fixture), then loads the response into
 * JSDOM and exercises the inline controller's behaviour. That way a
 * future refactor of either `search.astro` or
 * `src/scripts/search-ui.inline.js` is caught by this contract.
 *
 * Run via:
 *   pnpm --filter @workspace/whatworksskin run test:search-url-sync
 *
 * Wired into CI via the `whatworksskin:test-search-url-sync`
 * validation alongside the existing `:test-search-index` cases.
 */

import { spawn, type ChildProcess } from "node:child_process";
import * as net from "node:net";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM, VirtualConsole } from "jsdom";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../../..");
const BASE = "/whatworksskin";

// ─────────────────────────────────────────────────────────────────────
// Test harness — mirrors the minimal style used by the sibling
// `test-search-index.ts` so a future maintainer can read both without
// switching mental models.
// ─────────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures: { name: string; message: string }[] = [];

async function test(name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    const message =
      err instanceof Error ? (err.stack ?? err.message) : String(err);
    failures.push({ name, message });
    console.log(`  ✗ ${name}`);
  }
}

function assert(cond: unknown, label: string): asserts cond {
  if (!cond) throw new Error(label);
}

function expectEqual<T>(actual: T, expected: T, label: string): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`${label}\n  expected: ${e}\n  actual:   ${a}`);
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─────────────────────────────────────────────────────────────────────
// Astro dev-server bootstrapper — the integration substrate
// ─────────────────────────────────────────────────────────────────────

async function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    (srv as any).on("error", reject);
    srv.listen(0, "127.0.0.1", () => {
      const addr = srv.address();
      if (typeof addr === "object" && addr) {
        const port = addr.port;
        srv.close(() => resolve(port));
      } else {
        srv.close(() => reject(new Error("failed to allocate free port")));
      }
    });
  });
}

let astroProc: ChildProcess | null = null;
let serverOrigin = "";

function killAstro() {
  if (!astroProc) return;
  try {
    if (astroProc.pid) process.kill(-astroProc.pid, "SIGTERM");
  } catch {
    /* group may already be gone */
  }
  try {
    astroProc.kill("SIGKILL");
  } catch {
    /* already dead */
  }
  astroProc = null;
}

async function startAstroDev(): Promise<void> {
  const port = await getFreePort();
  serverOrigin = `http://127.0.0.1:${port}`;

  astroProc = spawn(
    "pnpm",
    [
      "--filter",
      "@workspace/whatworksskin",
      "exec",
      "astro",
      "dev",
      "--port",
      String(port),
      "--host",
      "127.0.0.1",
    ],
    {
      cwd: REPO_ROOT,
      env: {
        ...process.env,
        PORT: String(port),
        // search.astro uses the BASE prefix at link-build time; force
        // the dev server to mount under `/whatworksskin/` so the test
        // URL matches the real shareable-link contract.
        BASE_PATH: `${BASE}/`,
        NODE_ENV: "development",
      },
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  // Surface server output only when something goes wrong (we keep
  // the last few lines around for crash diagnostics).
  const tail: string[] = [];
  const captureTail = (chunk: Buffer | string) => {
    const s = typeof chunk === "string" ? chunk : chunk.toString("utf8");
    tail.push(s);
    if (tail.length > 50) tail.shift();
  };
  astroProc.stdout?.on("data", captureTail);
  astroProc.stderr?.on("data", captureTail);
  (astroProc as any).on("exit", (code: any, signal: any) => {
    if (code !== null && code !== 0) {
      console.error(
        `astro dev exited unexpectedly (code=${code}, signal=${signal}). ` +
          `Tail:\n${tail.join("")}`,
      );
    }
  });

  // Make sure the child dies even if this process is killed hard.
  process.on("exit", killAstro);
  process.on("SIGINT", () => {
    killAstro();
    process.exit(130);
  });
  process.on("SIGTERM", () => {
    killAstro();
    process.exit(143);
  });

  // Poll until the dev server answers `/search` with a 200. astro
  // dev startup includes a content-collection sync pass which can
  // take several seconds on first boot, so a generous deadline.
  const deadline = Date.now() + 90_000;
  const target = `${serverOrigin}${BASE}/search`;
  let lastErr: unknown = null;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(target);
      if (r.ok) return;
      lastErr = `HTTP ${r.status}`;
    } catch (err) {
      lastErr = err;
    }
    await sleep(300);
  }
  throw new Error(
    `astro dev did not become ready at ${target} within 90s ` +
      `(last error: ${String(lastErr)})\n${tail.join("")}`,
  );
}

// ─────────────────────────────────────────────────────────────────────
// JSDOM substrate — fetch the live SSR HTML, then run inline scripts
// ─────────────────────────────────────────────────────────────────────

async function fetchSearchPage(query: string): Promise<{ url: string; html: string }> {
  const search = query ? `?q=${encodeURIComponent(query)}` : "";
  const url = `${serverOrigin}${BASE}/search${search}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`unexpected status ${res.status} fetching ${url}`);
  }
  const html = await res.text();
  return { url, html };
}

function makeDomFromHtml(html: string, url: string): JSDOM {
  // JSDOM logs CSS-parse warnings and any rejected script errors on
  // its default console. We surface real scripting errors as test
  // failures via the `jsdomError` channel; everything else is muted
  // so the test output stays focused.
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("jsdomError", (err) => {
    // Filter out network-fetch errors for assets we can't reach
    // (the dev page references `/_astro/...` and `@vite/client`,
    // which JSDOM declines to load by default — we don't care).
    const msg = err instanceof Error ? err.message : String(err);
    if (/Could not load|resource loading is disabled/i.test(msg)) return;
    throw err;
  });
  return new JSDOM(html, {
    url,
    runScripts: "dangerously",
    pretendToBeVisual: true,
    virtualConsole,
  });
}

// Wait for the inline controller's `init()` to have run. JSDOM with
// `runScripts: "dangerously"` executes scripts during parsing; the
// controller's branch on `document.readyState === "loading"` defers
// to `DOMContentLoaded`, so we wait one tick past that event.
async function waitForControllerReady(dom: JSDOM): Promise<void> {
  if (dom.window.document.readyState !== "complete") {
    await new Promise<void>((resolve) => {
      dom.window.addEventListener("load", () => resolve(), { once: true });
    });
  }
  // Allow any 80ms-debounced post-hydration work to settle.
  await sleep(120);
}

// ─────────────────────────────────────────────────────────────────────
// Boot Astro dev once for the whole suite
// ─────────────────────────────────────────────────────────────────────

console.log("Booting astro dev (this may take a few seconds)…");
const bootStart = Date.now();
try {
  await startAstroDev();
  console.log(`Astro dev ready in ${Date.now() - bootStart}ms at ${serverOrigin}\n`);
} catch (err) {
  console.error("Failed to boot astro dev:", err);
  killAstro();
  process.exit(1);
}

try {
  // ───────────────────────────────────────────────────────────────────
  // Test cases — exercised against the LIVE dev server response
  // ───────────────────────────────────────────────────────────────────

  console.log("Search URL sync — SSR seed (live astro dev response)");

  await test(
    "GET /whatworksskin/search?q=tretinoin lands on a pre-filled input and a populated result list (no typing)",
    async () => {
      const { html, url } = await fetchSearchPage("tretinoin");

      // Load the live response into JSDOM and run the inline
      // controller. We assert the post-hydration state because the
      // site uses `output: "static"` — Astro pre-renders with no
      // request context, so SSR can't see `?q=`. The controller is
      // responsible for seeding the input from the URL on init, so
      // a reader landing on the shareable link still sees a filled
      // input + matching results without typing a single character.
      const dom = makeDomFromHtml(html, url);
      try {
        await waitForControllerReady(dom);

        const win = dom.window;
        const input = win.document.getElementById(
          "wws-search-input",
        ) as HTMLInputElement;
        expectEqual(
          input.value,
          "tretinoin",
          "input must be seeded from ?q= on first paint",
        );

        const results = win.document.getElementById(
          "wws-search-results",
        ) as HTMLUListElement;
        assert(
          !results.hidden,
          "result list must NOT be hidden when ?q= is present",
        );
        const items = results.querySelectorAll("li");
        assert(
          items.length > 0,
          `expected at least one result <li> for ?q=tretinoin (got ${items.length})`,
        );

        // The Tretinoin brief itself must be among the results —
        // otherwise the shareable link lands on a list that doesn't
        // include the obvious match.
        const titles = Array.from(
          results.querySelectorAll(".search-result-title"),
        ).map((n) => (n.textContent || "").trim());
        assert(
          titles.includes("Tretinoin"),
          `expected "Tretinoin" in result titles, got: ${JSON.stringify(titles)}`,
        );

        // The empty-state chip panel must be hidden so the reader
        // doesn't see a "Try a query" prompt above their results.
        const emptyPanel = win.document.getElementById("wws-search-empty");
        assert(
          emptyPanel?.hidden,
          "empty-state panel must be hidden when ?q= is present",
        );

        // The clear (X) button must be visible when the input is
        // seeded — same contract the controller maintains.
        const clearBtn = win.document.getElementById(
          "wws-search-clear",
        ) as HTMLButtonElement;
        assert(
          !clearBtn.hidden,
          "clear button must be visible when input is seeded",
        );

        // URL must still carry ?q=tretinoin — hydration must not
        // strip it from the shareable link.
        const params = new win.URL(win.location.href).searchParams;
        expectEqual(
          params.get("q"),
          "tretinoin",
          "?q= preserved across hydration",
        );
      } finally {
        dom.window.close();
      }
    },
  );

  await test(
    "the static SSR response itself contains the search controller and entry blob (no broken markup)",
    async () => {
      // Even though `output: "static"` means SSR can't see `?q=`,
      // the live response from `search.astro` MUST still ship the
      // search root, the entries window blob, and the inline
      // controller. A future refactor that drops any of these
      // breaks the shareable-link contract on first paint.
      const { html, url } = await fetchSearchPage("tretinoin");
      const dom = new JSDOM(html, { url });
      try {
        const doc = dom.window.document;
        assert(
          doc.getElementById("wws-search-root"),
          "#wws-search-root must exist in SSR HTML",
        );
        assert(
          doc.getElementById("wws-search-input"),
          "#wws-search-input must exist in SSR HTML",
        );
        assert(
          doc.getElementById("wws-search-results"),
          "#wws-search-results must exist in SSR HTML",
        );
        assert(
          /window\.__WWS_SEARCH_ENTRIES__\s*=/.test(html),
          "search entries window blob must be embedded in SSR HTML",
        );
        // The inline controller — identifiable by a stable marker
        // string — must be present. If a refactor splits it into a
        // `<script src=...>`, the dev preview proxy would 404 it
        // (see the long comment in `search-ui.inline.js`).
        assert(
          html.includes("__WWS_INLINE_RANK__"),
          "inline controller must be embedded in SSR HTML (not loaded via <script src>)",
        );
      } finally {
        dom.window.close();
      }
    },
  );

  console.log("\nSearch URL sync — typing (live astro dev response)");

  await test(
    "typing mirrors into ?q= via replaceState (no per-keystroke history entries)",
    async () => {
      const { html, url } = await fetchSearchPage("");
      const dom = makeDomFromHtml(html, url);
      try {
        const win = dom.window;
        await waitForControllerReady(dom);

        const input = win.document.getElementById(
          "wws-search-input",
        ) as HTMLInputElement;

        const baselineHistoryLen = win.history.length;

        // Simulate the reader typing one character at a time. The
        // controller listens to the `input` event, so we fire one
        // per keystroke (matching what a real browser dispatches).
        const phrase = "niacinamide";
        for (let i = 1; i <= phrase.length; i++) {
          input.value = phrase.slice(0, i);
          input.dispatchEvent(new win.Event("input", { bubbles: true }));
        }

        // Allow the 80ms debounce + a healthy buffer to elapse so
        // the queued URL sync can run.
        await sleep(160);

        const params = new win.URL(win.location.href).searchParams;
        expectEqual(
          params.get("q"),
          "niacinamide",
          "URL ?q= must reflect the final typed value",
        );

        expectEqual(
          win.history.length,
          baselineHistoryLen,
          `typing ${phrase.length} characters must NOT push new history entries ` +
            `(baseline ${baselineHistoryLen}, after typing ${win.history.length})`,
        );
      } finally {
        dom.window.close();
      }
    },
  );

  console.log("\nSearch URL sync — clear (live astro dev response)");

  await test(
    "Escape with a non-empty query strips ?q= from the URL",
    async () => {
      const { html, url } = await fetchSearchPage("tretinoin");
      const dom = makeDomFromHtml(html, url);
      try {
        const win = dom.window;
        await waitForControllerReady(dom);

        const input = win.document.getElementById(
          "wws-search-input",
        ) as HTMLInputElement;

        // Sanity check the precondition.
        expectEqual(
          new win.URL(win.location.href).searchParams.get("q"),
          "tretinoin",
          "precondition: URL starts with ?q=tretinoin",
        );

        input.dispatchEvent(
          new win.KeyboardEvent("keydown", {
            key: "Escape",
            bubbles: true,
            cancelable: true,
          }),
        );
        await sleep(10);

        expectEqual(input.value, "", "input cleared on Escape");
        const cleared = new win.URL(win.location.href);
        expectEqual(
          cleared.searchParams.has("q"),
          false,
          "?q= removed on Escape",
        );
        expectEqual(
          cleared.search,
          "",
          "URL search string fully cleared on Escape (no dangling ?)",
        );
      } finally {
        dom.window.close();
      }
    },
  );

  await test("X clear button strips ?q= from the URL", async () => {
    const { html, url } = await fetchSearchPage("tretinoin");
    const dom = makeDomFromHtml(html, url);
    try {
      const win = dom.window;
      await waitForControllerReady(dom);

      const input = win.document.getElementById(
        "wws-search-input",
      ) as HTMLInputElement;
      const clearBtn = win.document.getElementById(
        "wws-search-clear",
      ) as HTMLButtonElement;

      expectEqual(
        new win.URL(win.location.href).searchParams.get("q"),
        "tretinoin",
        "precondition: URL starts with ?q=tretinoin",
      );

      clearBtn.dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
      await sleep(10);

      expectEqual(input.value, "", "input cleared by X button");
      const cleared = new win.URL(win.location.href);
      expectEqual(
        cleared.searchParams.has("q"),
        false,
        "?q= removed by X button",
      );

      // The clear button is hidden once the input is empty so the X
      // doesn't sit on a blank field — same contract `setState` enforces.
      assert(clearBtn.hidden, "clear button hidden after input cleared");
    } finally {
      dom.window.close();
    }
  });

  await test(
    "popstate to a different ?q= re-seeds the input and results",
    async () => {
      // Final shareable-link surface: a back/forward navigation
      // between two distinct history entries (each with its own
      // `?q=`) must re-seed the input and re-render the result
      // list, so the visible state and the URL never disagree.
      const { html, url } = await fetchSearchPage("tretinoin");
      const dom = makeDomFromHtml(html, url);
      try {
        const win = dom.window;
        await waitForControllerReady(dom);

        const input = win.document.getElementById(
          "wws-search-input",
        ) as HTMLInputElement;

        // Push a fresh entry with a different query, then dispatch
        // a popstate to mimic the reader pressing Back.
        const next = new win.URL(win.location.href);
        next.searchParams.set("q", "niacinamide");
        win.history.pushState(null, "", next.toString());
        win.dispatchEvent(new win.PopStateEvent("popstate"));
        await sleep(20);

        expectEqual(
          input.value,
          "niacinamide",
          "popstate must re-seed the input from the new ?q=",
        );

        const results = win.document.getElementById(
          "wws-search-results",
        ) as HTMLUListElement;
        assert(
          !results.hidden && results.querySelectorAll("li").length > 0,
          "popstate must re-render the result list for the new query",
        );
      } finally {
        dom.window.close();
      }
    },
  );
} finally {
  killAstro();
}

// ─────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────

console.log("");
const total = passed + failed;
if (failed > 0) {
  console.error(`✗ ${failed} of ${total} search URL-sync cases failed.`);
  for (const f of failures) {
    console.error(`\n  Failure: ${f.name}`);
    console.error(
      "    " +
        f.message
          .split("\n")
          .map((l) => l)
          .join("\n    "),
    );
  }
  process.exit(1);
}
console.log(`✓ All ${total} search URL-sync cases passed.`);
process.exit(0);
