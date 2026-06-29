// Base-path-safe URL joining for internal links.
// Astro's `import.meta.env.BASE_URL` reflects whatever was passed to `base`
// in `astro.config.mjs` and is NOT guaranteed to have a trailing slash, so
// naive template-string concatenation produced broken hrefs like
// "/whatworksskiningredients" in built output. Always go through `url()`.

const rawBase = import.meta.env.BASE_URL ?? "/";
const baseTrimmed = rawBase.replace(/\/+$/, "");

/** Join the configured site base with the given path. Always starts with `/`. */
export function url(path: string): string {
  if (!path || path === "/") return baseTrimmed === "" ? "/" : `${baseTrimmed}/`;
  const trimmed = path.replace(/^\/+/, "");
  return baseTrimmed === "" ? `/${trimmed}` : `${baseTrimmed}/${trimmed}`;
}

/** The site root (e.g. "/whatworksskin/"). */
export const home = url("/");
