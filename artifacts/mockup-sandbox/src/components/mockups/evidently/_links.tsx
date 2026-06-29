// Shared cross-link mapping between products, ingredients, and supplements.
// Single source of truth so the relationship between catalogue pages
// (slug ↔ ingredient key ↔ component name) doesn't drift, and so we
// can linkify free-text content (concern tables, supplement evidence
// notes, routine step bodies) consistently.

import React from "react";
import { PRODUCTS, type ProductEntry } from "./_productCatalogue";

// Re-exported for back-compat: the row data now lives in
// `_productCatalogue.ts` (consumed directly by `_searchIndex.ts`),
// but existing call sites that read PRODUCTS / ProductEntry from this
// module continue to work unchanged.
export { PRODUCTS };
export type { ProductEntry };

export type Tier = "A" | "B" | "C" | "D";

const PREVIEW_BASE = "/__mockup/preview/evidently";

// ─────────────────────────────────────────────────────────────────────
// Ingredients with built detail pages.
//
// Single slug-keyed map carrying both the detail-page component file
// name and the human-readable display name, so adding a new ingredient
// only requires one edit. Use `ingredientHrefFor` / `ingredientNameFor`
// accessors to read either piece in consumers.
// ─────────────────────────────────────────────────────────────────────
export type IngredientEntry = {
  /** Detail-page component file name (without .tsx). */
  component: string;
  /** Human-readable display name. */
  name: string;
};

export const INGREDIENTS: Record<string, IngredientEntry> = {
  "tretinoin":        { component: "IngredientDetail",        name: "Tretinoin" },
  "niacinamide":      { component: "IngredientNiacinamide",   name: "Niacinamide" },
  "l-ascorbic-acid":  { component: "IngredientLAscorbic",     name: "L-ascorbic acid" },
  "azelaic-acid":     { component: "IngredientAzelaic",       name: "Azelaic acid" },
  "bakuchiol":        { component: "IngredientBakuchiol",     name: "Bakuchiol" },
  "retinol":          { component: "IngredientRetinol",       name: "Retinol" },
  "adapalene":        { component: "IngredientAdapalene",     name: "Adapalene" },
  "salicylic-acid":   { component: "IngredientSalicylic",     name: "Salicylic acid" },
  "glycolic-acid":    { component: "IngredientGlycolic",      name: "Glycolic acid" },
  "lactic-acid":      { component: "IngredientLactic",        name: "Lactic acid" },
  "mandelic-acid":    { component: "IngredientMandelic",      name: "Mandelic acid" },
  "tranexamic-acid":  { component: "IngredientTranexamic",    name: "Tranexamic acid" },
  "alpha-arbutin":    { component: "IngredientAlphaArbutin",  name: "Alpha arbutin" },
  "hyaluronic-acid":  { component: "IngredientHyaluronic",    name: "Hyaluronic acid" },
  "ceramides":        { component: "IngredientCeramides",     name: "Ceramides" },
  "centella":         { component: "IngredientCentella",      name: "Centella asiatica" },
  "panthenol":        { component: "IngredientPanthenol",     name: "Panthenol (B5)" },
  "peptides-signal":  { component: "IngredientPeptidesSignal", name: "Signal peptides" },
  "peptides-copper":  { component: "IngredientPeptidesCopper", name: "Copper peptides" },
  "uv-filters":       { component: "IngredientUVFilters",     name: "UV filters" },
  "zinc-oxide":       { component: "IngredientZincOxide",     name: "Zinc oxide" },
  "bemotrizinol":     { component: "IngredientBemotrizinol",  name: "Bemotrizinol" },
  "snail-mucin":      { component: "IngredientSnailMucin",    name: "Snail mucin" },
  "propolis":         { component: "IngredientPropolis",      name: "Propolis" },
  "benzoyl-peroxide": { component: "IngredientBenzoylPeroxide", name: "Benzoyl peroxide" },
  "sulphur":          { component: "IngredientSulphur",       name: "Sulphur" },
  "exosomes":         { component: "IngredientExosomes",      name: "Exosomes (cosmetic)" },
};

export function ingredientHrefFor(slug: string): string | null {
  const comp = INGREDIENTS[slug]?.component;
  return comp ? `${PREVIEW_BASE}/${comp}` : null;
}

export function ingredientNameFor(slug: string): string | null {
  return INGREDIENTS[slug]?.name ?? null;
}

// ─────────────────────────────────────────────────────────────────────
// Match free-text ingredient strings (as they appear in product
// formula tables) to an ingredient slug. Order is important — most
// specific patterns first.
// ─────────────────────────────────────────────────────────────────────
const INGREDIENT_MATCHERS: Array<[RegExp, string]> = [
  [/tretinoin/i, "tretinoin"],
  [/adapalene/i, "adapalene"],
  [/bakuchiol/i, "bakuchiol"],
  [/\bretino[ly]/i, "retinol"],
  [/niacinamide/i, "niacinamide"],
  [/(?:l[- ]?)?ascorbic acid|\bvitamin\s*c\b|\bvit\s*c\b/i, "l-ascorbic-acid"],
  [/azelaic/i, "azelaic-acid"],
  [/salicylic|\blha\b|capryloyl salicylic/i, "salicylic-acid"],
  [/glycolic/i, "glycolic-acid"],
  [/lactic acid/i, "lactic-acid"],
  [/mandelic/i, "mandelic-acid"],
  [/tranexamic/i, "tranexamic-acid"],
  [/alpha[\s-]?arbutin/i, "alpha-arbutin"],
  [/hyaluronic|sodium hyaluronate/i, "hyaluronic-acid"],
  [/ceramide/i, "ceramides"],
  [/centella|madecassoside/i, "centella"],
  [/panthenol|provitamin b5|\bvitamin b5\b/i, "panthenol"],
  [/signal peptide/i, "peptides-signal"],
  [/copper peptide|ghk-?cu/i, "peptides-copper"],
  [/zinc oxide/i, "zinc-oxide"],
  [/tinosorb s|bemotrizinol/i, "bemotrizinol"],
  [/snail mucin|snail secretion/i, "snail-mucin"],
  [/propolis/i, "propolis"],
  [/benzoyl peroxide/i, "benzoyl-peroxide"],
  [/\bsulphur\b|\bsulfur\b/i, "sulphur"],
  [/exosome/i, "exosomes"],
];

export function slugForIngredientName(name: string): string | null {
  for (const [re, slug] of INGREDIENT_MATCHERS) {
    if (re.test(name)) return slug;
  }
  return null;
}

export function linkForIngredientName(name: string): string | null {
  const slug = slugForIngredientName(name);
  return slug ? ingredientHrefFor(slug) : null;
}

// ─────────────────────────────────────────────────────────────────────
// Product catalogue helpers. The PRODUCTS row data lives in
// `_productCatalogue.ts` (re-exported above for back-compat). The
// helpers below stay here because they depend on the ingredient and
// supplement matchers defined in this module.
// ─────────────────────────────────────────────────────────────────────

export function productHref(component: string): string {
  return `${PREVIEW_BASE}/${component}`;
}

export function productsContainingIngredient(slug: string): ProductEntry[] {
  return PRODUCTS.filter((p) =>
    p.ingredients?.some((name) => slugForIngredientName(name) === slug),
  );
}

// ─────────────────────────────────────────────────────────────────────
// Resolve a free-text { brand, name } pair (as it appears on an
// ingredient brief's "On our shelf" card) to a catalogue product
// component. Returns the component name or null if no confident match.
// ─────────────────────────────────────────────────────────────────────
const STOPWORDS = new Set([
  "the","and","for","with","gel","cream","serum","lotion","fluid","balm",
  "cleanser","moisturizer","moisturiser","facial","face","skin","spf",
  "daily","liquid","foam","foaming","booster","drop","drops","solution",
  "suspension","extract","care","essence","mask","oil","water",
]);

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokens(s: string): string[] {
  return normalize(s).split(/\s+/).filter((t) => t.length >= 3);
}

function meaningfulTokens(s: string): string[] {
  return tokens(s).filter((t) => !STOPWORDS.has(t) && !/^\d+$/.test(t));
}

function brandMatches(briefBrand: string, catalogBrand: string): boolean {
  const a = normalize(briefBrand);
  const b = normalize(catalogBrand);
  if (!a || !b) return false;
  if (a === b) return true;
  return a.includes(b) || b.includes(a);
}

export function productEntryForBriefEntry(
  brand: string,
  name: string,
): ProductEntry | null {
  const candidates = PRODUCTS.filter((p) => brandMatches(brand, p.brand));
  if (candidates.length === 0) return null;

  // Exact (normalized) name match wins outright — handy for short
  // product names like "A-Ret 0.05% Gel" or "Sébium AKN" where token
  // overlap with sibling catalogue entries is too thin to be decisive.
  // Aliases are checked on the same exact-match path so brief wording
  // can differ from the canonical catalogue name.
  const briefNameNorm = normalize(name);
  const exact = candidates.find(
    (p) =>
      normalize(p.name) === briefNameNorm ||
      p.aliases?.some((a) => normalize(a) === briefNameNorm),
  );
  if (exact) return exact;

  const briefTokens = new Set(meaningfulTokens(name));

  let best: { entry: ProductEntry; score: number } | null = null;
  let secondScore = 0;
  for (const p of candidates) {
    const pTokens = new Set(meaningfulTokens(p.name));
    let overlap = 0;
    briefTokens.forEach((t) => {
      if (pTokens.has(t)) overlap += 1;
    });
    if (best === null || overlap > best.score) {
      secondScore = best?.score ?? 0;
      best = { entry: p, score: overlap };
    } else if (overlap > secondScore) {
      secondScore = overlap;
    }
  }

  if (!best) return null;
  // Single brand candidate: any sensible signal is enough. With multiple
  // candidates we require ≥ 2 distinctive tokens or a clear winning margin.
  if (candidates.length === 1) {
    return best.score >= 1 ? best.entry : null;
  }
  if (best.score >= 2 && best.score > secondScore) return best.entry;
  return null;
}

export function productComponentForBriefEntry(
  brand: string,
  name: string,
): string | null {
  return productEntryForBriefEntry(brand, name)?.component ?? null;
}

export function productHrefForBriefEntry(
  brand: string,
  name: string,
): string | null {
  const comp = productComponentForBriefEntry(brand, name);
  return comp ? productHref(comp) : null;
}

/** Outbound link descriptor for an "On our shelf" card. `external` is
 *  true when the link goes to a brand site or retailer rather than an
 *  internal review page — callers should mark these visually (e.g.
 *  with an external-link icon and `target="_blank"`). */
export type BriefLink = { href: string; external: boolean };

export function productLinkForBriefEntry(
  brand: string,
  name: string,
): BriefLink | null {
  const entry = productEntryForBriefEntry(brand, name);
  if (!entry) return null;
  if (entry.component) {
    return { href: productHref(entry.component), external: false };
  }
  if (entry.purchaseUrl) {
    return { href: entry.purchaseUrl, external: true };
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────
// Outbound click tracking for "On our shelf" cards.
//
// Internal "Read review" clicks are deliberately untouched — only
// external (brand / retailer) clicks emit a tracking event so we can
// see how often readers actually click through from our editorial
// shelves. The payload is intentionally minimal (brand, product name,
// page-context, destination URL) — no user identifiers, no referrer,
// no timing — and the handler never blocks navigation.
//
// `pageKind` + `pageSlug` together identify the source page. Ingredient
// briefs use `pageKind: "ingredient"` with the catalogue ingredient
// slug; routine and concern pages use the detail-page component file
// name as the slug because multiple catalogue slugs can alias the
// same component (e.g. "am-sensitive" + "pm-sensitive" → "RoutineBareMinimum").
//
// Events are surfaced two ways so we don't lock ourselves into a
// single analytics vendor:
//   1. `window.dataLayer.push(...)` — the GTM / GA4 convention; the
//      tag manager (when present) forwards it to whichever analytics
//      backend is configured.
//   2. A `CustomEvent("evidently:shelf-outbound")` — lets in-app
//      listeners (or e2e tests) observe clicks without depending on
//      any analytics vendor being installed.
// ─────────────────────────────────────────────────────────────────────
export const SHELF_OUTBOUND_EVENT = "evidently:shelf-outbound";

export type ShelfPageKind = "ingredient" | "routine" | "concern";

export type ShelfOutboundClickPayload = {
  brand: string;
  productName: string;
  pageKind: ShelfPageKind;
  pageSlug: string;
  href: string;
};

export function trackShelfOutboundClick(
  payload: ShelfOutboundClickPayload,
): void {
  if (typeof window === "undefined") return;

  type DataLayerEntry = Record<string, unknown>;
  const w = window as Window & { dataLayer?: DataLayerEntry[] };
  if (!Array.isArray(w.dataLayer)) {
    w.dataLayer = [];
  }
  w.dataLayer.push({
    event: "shelf_outbound_click",
    shelf_brand: payload.brand,
    shelf_product: payload.productName,
    shelf_page_kind: payload.pageKind,
    shelf_page_slug: payload.pageSlug,
    shelf_destination: payload.href,
  });

  try {
    window.dispatchEvent(
      new CustomEvent(SHELF_OUTBOUND_EVENT, { detail: payload }),
    );
  } catch {
    // CustomEvent unavailable (very old browsers) — silently ignore.
  }
}

/** Build an `onClick` handler for a shelf-card `<a>`. Returns
 *  `undefined` for null or internal links so React doesn't attach a
 *  no-op listener and internal "Read review" clicks stay completely
 *  unaffected. */
export function shelfOutboundClickHandler(
  link: BriefLink | null,
  meta: {
    brand: string;
    productName: string;
    pageKind: ShelfPageKind;
    pageSlug: string;
  },
): React.MouseEventHandler<HTMLAnchorElement> | undefined {
  if (!link?.external) return undefined;
  const href = link.href;
  return () => {
    trackShelfOutboundClick({
      brand: meta.brand,
      productName: meta.productName,
      pageKind: meta.pageKind,
      pageSlug: meta.pageSlug,
      href,
    });
  };
}

// ─────────────────────────────────────────────────────────────────────
// Forwarder: drains `evidently:shelf-outbound` events to the API
// server's `POST /api/analytics/shelf-click` sink so the editorial
// team can read them. Designed so navigation is never delayed:
//
//   1. Events are buffered in memory and flushed on a short debounce
//      (`FLUSH_DELAY_MS`) so a burst of clicks travels as one batch.
//   2. The flush prefers `navigator.sendBeacon` (queued by the browser
//      and delivered even if the tab is closing); when sendBeacon is
//      unavailable or rejects the payload we fall back to `fetch` with
//      `keepalive: true`, which is also non-blocking.
//   3. We additionally flush on `pagehide` and on the document going
//      hidden so the last few clicks aren't lost when the user switches
//      tabs to the brand site they just opened.
//
// The forwarder is install-once: calling `installShelfOutboundForwarder`
// twice is a no-op — handy because React StrictMode mounts effects
// twice in dev.
// ─────────────────────────────────────────────────────────────────────
const SHELF_OUTBOUND_ENDPOINT = "/api/analytics/shelf-click";
const FLUSH_DELAY_MS = 250;
const MAX_BATCH = 20;

let _forwarderInstalled = false;

function postShelfClickBatch(
  endpoint: string,
  events: ShelfOutboundClickPayload[],
): void {
  if (events.length === 0) return;
  const body = JSON.stringify({
    events: events.map((e) => ({
      pageKind: e.pageKind,
      pageSlug: e.pageSlug,
      brand: e.brand,
      productName: e.productName,
      href: e.href,
    })),
  });

  try {
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.sendBeacon === "function"
    ) {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon(endpoint, blob)) return;
    }
    void fetch(endpoint, {
      method: "POST",
      body,
      headers: { "content-type": "application/json" },
      keepalive: true,
      credentials: "same-origin",
    }).catch(() => {
      // Swallow — analytics must never surface as a user-visible error.
    });
  } catch {
    // Best-effort: never let analytics break the user's click.
  }
}

export function installShelfOutboundForwarder(opts?: {
  endpoint?: string;
}): () => void {
  if (typeof window === "undefined") return () => {};
  if (_forwarderInstalled) return () => {};
  _forwarderInstalled = true;

  const endpoint = opts?.endpoint ?? SHELF_OUTBOUND_ENDPOINT;
  let queue: ShelfOutboundClickPayload[] = [];
  let flushTimer: ReturnType<typeof setTimeout> | null = null;

  function flush(): void {
    if (flushTimer !== null) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
    if (queue.length === 0) return;
    const batch = queue;
    queue = [];
    postShelfClickBatch(endpoint, batch);
  }

  function scheduleFlush(): void {
    if (flushTimer !== null) return;
    flushTimer = setTimeout(flush, FLUSH_DELAY_MS);
  }

  function onShelfClick(e: Event): void {
    const detail = (e as CustomEvent<ShelfOutboundClickPayload>).detail;
    if (!detail) return;
    queue.push(detail);
    if (queue.length >= MAX_BATCH) {
      flush();
    } else {
      scheduleFlush();
    }
  }

  function onPageHide(): void {
    flush();
  }

  function onVisibilityChange(): void {
    if (document.visibilityState === "hidden") flush();
  }

  window.addEventListener(SHELF_OUTBOUND_EVENT, onShelfClick);
  window.addEventListener("pagehide", onPageHide);
  document.addEventListener("visibilitychange", onVisibilityChange);

  return () => {
    flush();
    window.removeEventListener(SHELF_OUTBOUND_EVENT, onShelfClick);
    window.removeEventListener("pagehide", onPageHide);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    _forwarderInstalled = false;
  };
}

// ─────────────────────────────────────────────────────────────────────
// Supplements with built brief pages.
//
// Single slug-keyed map carrying both the brief-page component file
// name and the human-readable display name, so adding a new supplement
// only requires one edit. Use `supplementHrefFor` / `supplementNameFor`
// accessors to read either piece in consumers.
// ─────────────────────────────────────────────────────────────────────
export type SupplementEntry = {
  /** Brief-page component file name (without .tsx). */
  component: string;
  /** Human-readable display name. */
  name: string;
};

export const SUPPLEMENTS: Record<string, SupplementEntry> = {
  "omega-3":          { component: "SupplementOmega3",          name: "Omega-3 (EPA + DHA)" },
  "vitamin-d":        { component: "SupplementVitaminD",        name: "Vitamin D" },
  "vitamin-c-oral":   { component: "SupplementVitaminC",        name: "Vitamin C (oral)" },
  "zinc-oral":        { component: "SupplementZinc",            name: "Zinc (oral)" },
  "biotin":           { component: "SupplementBiotin",          name: "Biotin" },
  "collagen":         { component: "SupplementCollagen",        name: "Collagen peptides" },
  "marine-collagen":  { component: "SupplementMarineCollagen",  name: "Marine collagen" },
  "astaxanthin":      { component: "SupplementAstaxanthin",     name: "Astaxanthin" },
  "carotenoids":      { component: "SupplementCarotenoids",     name: "Carotenoids (β-carotene & lycopene)" },
  "ceramide-oral":    { component: "SupplementCeramide",        name: "Ceramide (oral)" },
  "evening-primrose": { component: "SupplementEveningPrimrose", name: "Evening primrose oil" },
  "exosome-oral":     { component: "SupplementExosome",         name: "Exosome (oral)" },
  "glutathione-iv":   { component: "SupplementGlutathioneIV",   name: "Glutathione (IV)" },
  "glutathione-oral": { component: "SupplementGlutathioneOral", name: "Glutathione (oral)" },
  "iron-oral":        { component: "SupplementIron",            name: "Iron (oral, when deficient)" },
  "magnesium":        { component: "SupplementMagnesium",       name: "Magnesium glycinate" },
  "nac":              { component: "SupplementNAC",             name: "N-acetylcysteine (NAC)" },
  "probiotics":       { component: "SupplementProbiotics",      name: "Probiotics" },
  "sea-moss":         { component: "SupplementSeaMoss",         name: "Sea moss" },
  "spirulina":        { component: "SupplementSpirulina",       name: "Spirulina" },
  "tranexamic-oral":  { component: "SupplementTranexamic",      name: "Tranexamic acid (oral)" },
};

export function supplementHrefFor(slug: string): string | null {
  const comp = SUPPLEMENTS[slug]?.component;
  return comp ? `${PREVIEW_BASE}/${comp}` : null;
}

export function supplementNameFor(slug: string): string | null {
  return SUPPLEMENTS[slug]?.name ?? null;
}

// Order matters — most specific patterns first. Anything matched here
// resolves to a supplement brief, not a topical ingredient page.
export const SUPPLEMENT_MATCHERS: Array<[RegExp, string]> = [
  [/marine collagen/i, "marine-collagen"],
  [/(?:hydrolys[ei]d\s+)?collagen(?:\s+peptides?)?/i, "collagen"],
  [/omega[-\s]?3|fish oil|epa\s*\+\s*dha/i, "omega-3"],
  [/vitamin\s*d\b/i, "vitamin-d"],
  [/oral\s+vitamin\s*c|vitamin\s*c\s*\(\s*oral\s*\)/i, "vitamin-c-oral"],
  [/oral\s+zinc|zinc\s+picolinate|zinc\s+gluconate/i, "zinc-oral"],
  [/biotin/i, "biotin"],
  [/astaxanthin/i, "astaxanthin"],
  [/beta[-\s]?carotene|lycopene|carotenoid/i, "carotenoids"],
  [/oral\s+ceramide|ceramide\s+capsule/i, "ceramide-oral"],
  [/evening\s+primrose/i, "evening-primrose"],
  [/oral\W{1,3}exosome|exosome\W{1,3}beverage/i, "exosome-oral"],
  [/glutathione\s*\(\s*iv\s*\)|iv\s+glutathione/i, "glutathione-iv"],
  [/glutathione\s*\(\s*oral\s*\)|oral\s+glutathione/i, "glutathione-oral"],
  [/oral\s+iron|iron\s+supplement|iron\s*\(\s*when\s+deficient\s*\)/i, "iron-oral"],
  [/magnesium\s+glycinate|magnesium\s+supplement/i, "magnesium"],
  [/n[-\s]?acetylcysteine|\bnac\b/i, "nac"],
  [/probiotic[s]?|lactobacillus/i, "probiotics"],
  [/sea\s+moss/i, "sea-moss"],
  [/spirulina/i, "spirulina"],
  [/oral\s+tranexamic|tranexamic\s+acid\s*\(\s*oral\b[^)]*\)/i, "tranexamic-oral"],
];

export function slugForSupplementName(name: string): string | null {
  for (const [re, slug] of SUPPLEMENT_MATCHERS) {
    if (re.test(name)) return slug;
  }
  return null;
}

export function linkForSupplementName(name: string): string | null {
  const slug = slugForSupplementName(name);
  return slug ? supplementHrefFor(slug) : null;
}

// ─────────────────────────────────────────────────────────────────────
// Trend Watch articles → the ingredient or supplement brief they
// primarily discuss. Keyed by the article's component file name (the
// same key the TrendWatchArchive `BUILT` map uses) so individual
// article pages can render a "Read the brief" callout that points at
// the canonical brief for each subject they grade.
//
// Articles that grade multiple subjects can list multiple targets;
// articles whose subject has no built brief (e.g. microneedling, beef
// tallow) are simply omitted.
// ─────────────────────────────────────────────────────────────────────
export type TrendWatchTarget =
  | { kind: "ingredient"; slug: string }
  | { kind: "supplement"; slug: string };

export const TREND_WATCH_TARGETS: Record<string, TrendWatchTarget[]> = {
  // Iss. 001 — launch issue. Centred on daily SPF as the keystone habit.
  TrendWatch001: [{ kind: "ingredient", slug: "uv-filters" }],
  // Iss. 003 — peptide gold rush (GHK-Cu, Matrixyl, Argireline).
  TrendWatch003: [
    { kind: "ingredient", slug: "peptides-copper" },
    { kind: "ingredient", slug: "peptides-signal" },
  ],
  // Iss. 004 — mandelic acid.
  TrendWatch004: [{ kind: "ingredient", slug: "mandelic-acid" }],
  // Iss. 006 — year-end ledger covering oral tranexamic + centella TECA.
  TrendWatch006: [
    { kind: "supplement", slug: "tranexamic-oral" },
    { kind: "ingredient", slug: "centella" },
  ],
  // Iss. 008 — retinal vs retinol.
  TrendWatch008: [{ kind: "ingredient", slug: "retinol" }],
  // Iss. 009 — methylene blue, NMN, GlyNAC. NAC is the only one with a brief.
  TrendWatch009: [{ kind: "supplement", slug: "nac" }],
  // Iss. 010 — mineral SPF and reef-safe claims.
  TrendWatch010: [
    { kind: "ingredient", slug: "zinc-oxide" },
    { kind: "ingredient", slug: "uv-filters" },
  ],
  // Iss. 011 — bakuchiol vs retinol, Seoul split-face.
  TrendWatch011: [{ kind: "ingredient", slug: "bakuchiol" }],
  // Iss. 012 — collagen drinks (oral), topical exosomes (post-procedure),
  // skin-gut probiotics (oral). The exosomes verdict is about the
  // topical category, so it points at the ingredient brief, not the
  // oral supplement brief.
  TrendWatch012: [
    { kind: "supplement", slug: "collagen" },
    { kind: "ingredient", slug: "exosomes" },
    { kind: "supplement", slug: "probiotics" },
  ],
  // Iss. 013 — snail mucin, polyglutamic acid, skin cycling.
  TrendWatch013: [{ kind: "ingredient", slug: "snail-mucin" }],
};

export type TrendWatchLink = {
  kind: "ingredient" | "supplement";
  slug: string;
  name: string;
  href: string;
};

/** Resolve a Trend Watch article component to the brief links it should
 *  point at. Targets without a built brief are skipped silently. */
export function trendWatchLinksFor(component: string): TrendWatchLink[] {
  const targets = TREND_WATCH_TARGETS[component];
  if (!targets) return [];
  const out: TrendWatchLink[] = [];
  for (const t of targets) {
    if (t.kind === "ingredient") {
      const href = ingredientHrefFor(t.slug);
      const name = ingredientNameFor(t.slug);
      if (href && name) out.push({ kind: "ingredient", slug: t.slug, name, href });
    } else {
      const href = supplementHrefFor(t.slug);
      const name = supplementNameFor(t.slug);
      if (href && name) {
        out.push({ kind: "supplement", slug: t.slug, name, href });
      }
    }
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────
// Concern guides with built detail pages.
//
// Single slug-keyed map carrying both the detail-page component file
// name and the human-readable display name, so adding a new concern
// only requires one edit. Mirrors the BUILT map in ConcernIndex so the
// reverse direction (ingredient brief → concern guide) stays in sync
// with the forward direction. Use `concernHrefFor` / `concernNameFor`
// accessors to read either piece in consumers.
// ─────────────────────────────────────────────────────────────────────
export type ConcernEntry = {
  /** Detail-page component file name (without .tsx). */
  component: string;
  /** Human-readable display name. */
  name: string;
};

export const CONCERNS: Record<string, ConcernEntry> = {
  "melasma":             { component: "ConcernDetail",            name: "Melasma" },
  "pih":                 { component: "ConcernPIH",               name: "Post-inflammatory hyperpigmentation" },
  "sun-spots":           { component: "ConcernSunSpots",          name: "Sun spots & solar lentigines" },
  "dark-circles":        { component: "ConcernDarkCircles",       name: "Dark circles" },
  "comedonal-acne":      { component: "ConcernComedonal",         name: "Comedonal acne" },
  "inflammatory-acne":   { component: "ConcernInflammatory",      name: "Inflammatory acne" },
  "hormonal-acne":       { component: "ConcernHormonalAcne",      name: "Hormonal acne" },
  "fungal-acne":         { component: "ConcernFungal",            name: "Fungal acne" },
  "scarring":            { component: "ConcernScarring",          name: "Acne scarring" },
  "fine-lines":          { component: "ConcernFineLines",         name: "Fine lines & early wrinkles" },
  "elasticity":          { component: "ConcernElasticity",        name: "Loss of firmness & elasticity" },
  "tone-texture":        { component: "ConcernToneTexture",       name: "Uneven tone & texture" },
  "photoaging":          { component: "ConcernPhotoaging",        name: "Photoaging" },
  "stretch-marks":       { component: "ConcernStretchMarks",      name: "Stretch marks (striae distensae)" },
  "rosacea":             { component: "ConcernRosacea",           name: "Rosacea" },
  "eczema":              { component: "ConcernEczema",            name: "Atopic dermatitis (eczema)" },
  "compromised-barrier": { component: "ConcernBarrier",           name: "Compromised barrier" },
  "perioral-dermatitis": { component: "ConcernPerioral",          name: "Perioral dermatitis" },
  "post-procedure":      { component: "ConcernPostProcedure",     name: "Post-procedure recovery" },
  "post-isotretinoin":   { component: "ConcernPostIsotretinoin",  name: "Post-isotretinoin transition" },
  "dullness":            { component: "ConcernDullness",          name: "Dullness" },
};

export function concernHrefFor(slug: string): string | null {
  const comp = CONCERNS[slug]?.component;
  return comp ? `${PREVIEW_BASE}/${comp}` : null;
}

export function concernNameFor(slug: string): string | null {
  return CONCERNS[slug]?.name ?? null;
}

// Match free-text concern names (as they appear in ingredient brief
// evidence rows, lead text, FAQs, etc.) to a concern slug. Order is
// important — most specific patterns first so e.g. "post-inflammatory
// hyperpigmentation" resolves to PIH and not inflammatory acne.
export const CONCERN_MATCHERS: Array<[RegExp, string]> = [
  // Catch the canonical "post-inflammatory hyperpigmentation" / "PIH"
  // phrasings, the parenthetical brief shorthand "PIH (post-inflammatory)",
  // and the bare term "hyperpigmentation" when no qualifier is given —
  // all roll up to the PIH guide, which is the only built page covering
  // melanocyte-driven hyperpigmentation outside of melasma and sun spots.
  [/post[-\s]?inflammatory\s+(?:hyper)?pigment(?:ation)?|\bpih\b(?:\s*\(\s*post[-\s]?inflammatory\s*\))?|\bhyperpigmentation\b/i, "pih"],
  [/melasma/i, "melasma"],
  [/dark\s+circles?/i, "dark-circles"],
  [/sun\s+spots?|solar\s+lentig(?:o|ines)/i, "sun-spots"],
  // Match both natural word order ("comedonal acne") and the parenthetical
  // brief shorthand ("Acne (comedonal)") used in the Tretinoin
  // concentration-by-concern table.
  [/comedonal\s+acne|acne\s*\(\s*comedonal\s*\)|\bcomedones?\b/i, "comedonal-acne"],
  [/inflammatory\s+acne|acne\s*\(\s*inflammatory\s*\)/i, "inflammatory-acne"],
  [/hormonal\s+acne|acne\s*\(\s*hormonal\s*\)/i, "hormonal-acne"],
  [/fungal\s+acne|acne\s*\(\s*fungal\s*\)|malassezia\s+follic\w*/i, "fungal-acne"],
  [/(?:atrophic|acne|post[-\s]?acne)\s+scar(?:ring|s)?|\bscarring\b/i, "scarring"],
  [/perioral\s+dermatitis/i, "perioral-dermatitis"],
  [/post[-\s]?procedure/i, "post-procedure"],
  [/post[-\s]?isotretinoin/i, "post-isotretinoin"],
  [/atopic\s+dermatitis|\beczema\b/i, "eczema"],
  [/compromised\s+barrier|barrier\s+(?:repair|compromise|disruption|recovery|function|integrity)/i, "compromised-barrier"],
  [/loss\s+of\s+(?:firmness|elasticity)|\belasticity\b/i, "elasticity"],
  // Photoaging has its own guide — distinct from fine lines, which
  // is one downstream sign. Listed before the fine-lines matcher so
  // the more specific upstream concern wins when both terms appear
  // in the same string.
  [/\bphoto[-\s]?ag(?:e?ing)\b/i, "photoaging"],
  [/fine\s+lines?|early\s+wrinkles?|\bwrinkles?\b/i, "fine-lines"],
  [/uneven\s+tone(?:\s+(?:and|&)\s+texture)?|uneven\s+texture|tone\s+(?:and|&)\s+texture/i, "tone-texture"],
  // Generic "erythema" mentions in ingredient briefs refer to inflammatory
  // facial redness — the rosacea guide is the closest built target.
  [/\brosacea\b|\berythema\b/i, "rosacea"],
  [/\bdullness\b|dull\s+skin/i, "dullness"],
  // Stretch marks (striae distensae) have a built guide. The matcher
  // covers both the bare term and the parenthetical brief shorthand
  // ("Stretch marks (early)") used in the Tretinoin concentration
  // table.
  // Bare "striae" resolves to stretch-marks too — body briefs talk
  // about "mature striae", "silver striae", "white-phase striae" etc.
  // and there's no other built guide the term could plausibly point at.
  [/\bstretch\s+marks?\b|\bstriae\b/i, "stretch-marks"],
];

export function slugForConcernName(name: string): string | null {
  for (const [re, slug] of CONCERN_MATCHERS) {
    if (re.test(name)) return slug;
  }
  return null;
}

export function linkForConcernName(name: string): string | null {
  const slug = slugForConcernName(name);
  return slug ? concernHrefFor(slug) : null;
}

// ─────────────────────────────────────────────────────────────────────
// Linkify helper — wrap matched terms in free-form text with anchors
// pointing to the corresponding ingredient, supplement, or concern
// brief. Only terms that resolve to an actual built page get linked;
// everything else is returned as plain text.
// ─────────────────────────────────────────────────────────────────────
export type LinkScope = "ingredients" | "supplements" | "concerns" | "both";

export type LinkifyOptions = {
  scope?: LinkScope;
  excludeSlugs?: string[];
  className?: string;
  style?: React.CSSProperties;
};

const DEFAULT_LINK_STYLE: React.CSSProperties = {
  color: "inherit",
  textDecoration: "underline",
  textDecorationThickness: "1px",
  textUnderlineOffset: 2,
  textDecorationColor: "rgba(0,0,0,0.3)",
};

type Resolver = Array<[RegExp, string, (slug: string) => string | null]>;

function buildResolvers(scope: LinkScope): Resolver {
  const out: Resolver = [];
  if (scope === "ingredients" || scope === "both") {
    for (const [re, slug] of INGREDIENT_MATCHERS) {
      if (INGREDIENTS[slug]) out.push([re, slug, ingredientHrefFor]);
    }
  }
  if (scope === "supplements" || scope === "both") {
    for (const [re, slug] of SUPPLEMENT_MATCHERS) {
      if (SUPPLEMENTS[slug]) out.push([re, slug, supplementHrefFor]);
    }
  }
  if (scope === "concerns") {
    for (const [re, slug] of CONCERN_MATCHERS) {
      if (CONCERNS[slug]) out.push([re, slug, concernHrefFor]);
    }
  }
  return out;
}

export function linkifyText(
  text: string,
  options: LinkifyOptions = {},
): React.ReactNode {
  const { scope = "ingredients", excludeSlugs = [], className, style } = options;
  const exclude = new Set(excludeSlugs);
  const resolvers = buildResolvers(scope).filter(([, slug]) => !exclude.has(slug));

  type Hit = { start: number; end: number; href: string; matched: string; slug: string };
  const hits: Hit[] = [];
  for (const [re, slug, hrefFor] of resolvers) {
    const flags = re.flags.includes("g") ? re.flags : re.flags + "g";
    const g = new RegExp(re.source, flags);
    let m: RegExpExecArray | null;
    while ((m = g.exec(text)) !== null) {
      if (m[0].length === 0) { g.lastIndex += 1; continue; }
      const href = hrefFor(slug);
      if (!href) continue;
      hits.push({ start: m.index, end: m.index + m[0].length, href, matched: m[0], slug });
    }
  }

  // Prefer earliest, then longest match. Drop overlaps.
  hits.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));
  const filtered: Hit[] = [];
  let lastEnd = 0;
  const seen = new Set<string>();
  for (const h of hits) {
    if (h.start < lastEnd) continue;
    // Avoid linking the same target twice in a single block — the first
    // mention is enough and keeps the prose readable.
    if (seen.has(h.slug)) continue;
    filtered.push(h);
    seen.add(h.slug);
    lastEnd = h.end;
  }

  if (filtered.length === 0) return text;

  const linkStyle = style ? { ...DEFAULT_LINK_STYLE, ...style } : DEFAULT_LINK_STYLE;
  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  filtered.forEach((h, i) => {
    if (h.start > cursor) nodes.push(text.slice(cursor, h.start));
    nodes.push(
      <a key={`lk-${i}-${h.slug}`} href={h.href} className={className} style={linkStyle}>
        {h.matched}
      </a>,
    );
    cursor = h.end;
  });
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return <>{nodes}</>;
}
