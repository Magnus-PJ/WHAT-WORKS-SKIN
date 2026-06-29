import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

const rawPort = process.env.PORT;
const port = rawPort ? Number(rawPort) : 4321;
if (rawPort && (Number.isNaN(port) || port <= 0)) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH ?? "/";
const trimmedBase = basePath.replace(/\/$/, "") || "/";

export default defineConfig({
  site: process.env.SITE_URL || "https://whatworksskin.com",
  base: trimmedBase,
  trailingSlash: "ignore",
  output: "static",
  integrations: [react(), mdx(), sitemap()],
  server: {
    host: "0.0.0.0",
    port,
    allowedHosts: true,
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      host: "0.0.0.0",
      port,
      strictPort: true,
      allowedHosts: true,
      hmr: {
        clientPort: 443,
      },
    },
    preview: {
      host: "0.0.0.0",
      port,
      allowedHosts: true,
    },
  },
});
