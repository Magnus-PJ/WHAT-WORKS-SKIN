# Overview

This project is a pnpm workspace monorepo using TypeScript to develop and maintain `whatworksskin.com`, an ultra-premium editorial site focused on skincare. It aims to provide detailed, evidence-based information on ingredients, products, concerns, and routines. The platform features an advanced design system, comprehensive content collections, robust analytics for editorial insights, and an AI-powered "Trend Radar" system to identify emerging skincare trends. The site is a production-bound static site built with Astro 5, with deployment via Vercel for production and Replit for development/preview. The ambition is to establish `whatworksskin.com` as a leading authoritative source in the skincare information space.

# User Preferences

I prefer iterative development and welcome early feedback. Ask before making major architectural changes or introducing new dependencies.
I prefer detailed explanations for complex technical decisions.
Do not make changes to the `lib/api-spec/openapi.yaml` file directly; all API definitions should be managed through the codegen process.
Ensure that all new features and modifications are thoroughly type-checked.

# System Architecture

## Monorepo Structure and Technologies

The project is a pnpm workspace monorepo utilizing Node.js 24 and TypeScript 5.9. It uses Express 5 for API development, PostgreSQL with Drizzle ORM for data management, and Zod for validation. API code generation is handled by Orval from an OpenAPI specification, and `esbuild` is used for CJS bundling.

## Frontend (`whatworksskin.com`)

The production website is a static site built with Astro 5, leveraging Astro's integrations for React, MDX, and Sitemap.

### UI/UX and Design System

An ultra-premium editorial design is implemented with a shared light palette and specific font stack (Fraunces, Instrument Serif, Inter, JetBrains Mono). Core UI components are derived from an `evidently/` design system, emphasizing a clean, evidence-based presentation. Styling uses CSS custom properties defined in `src/styles/tokens.css` as the single source of truth for design tokens, with Tailwind v4 used sparingly.

### Content Management

Content is managed via Astro 5 content collections (`src/content.config.ts`), loading JSON files with strict Zod schemas for various content types (ingredients, concerns, supplements, products, routines, trend-watch). Cross-link resolution between briefs is implemented in `src/lib/links.ts` and `src/lib/link-aliases.ts`. Home page "in-focus" cards rotate deterministically per Trend Watch issue. Evidence rendering supports two shapes (study-table, bar-chart) and two forms (shelf cards, form cards).

### Pages and Routing

Dynamic routes are generated for detail pages (e.g., `src/pages/ingredients/[slug].astro`) using `getStaticPaths`. The editorial home page (`src/pages/index.astro`) features "in-focus" cards promoting catalogue depth.

### Analytics and Technical Implementations

Outbound click analytics are captured using `navigator.sendBeacon` (with `fetch` + `keepalive` fallback) and POSTed to `/api/analytics/shelf-click`. Events are debounced and flushed on page navigation.

## Backend and API

The API server handles analytics tracking by processing `POST /api/analytics/shelf-click` requests, storing data in the `shelf_clicks` table. An editor dashboard consumes `GET /api/analytics/shelf-clicks` for displaying and filtering click data, including CSV export and truncation banner with narrowing suggestions.

## Trend Radar System

A "Trend Radar" pipeline ingests data from public sources (Reddit, PubMed, Google Trends, FDA), LLM-clusters them into named trends using Anthropic, and queues them for editorial approval into the Astro `trend-watch` content collection.

- **Sources**: Includes `ingest-reddit.ts`, `ingest-pubmed.ts`, `ingest-google-trends.ts`, and `ingest-fda.ts`. Instagram and TikTok are excluded.
- **Nightly Schedule**: Runs as a Replit Scheduled Deployment at `0 3 * * *` UTC, executing `pnpm --filter @workspace/api-server run trend-radar:nightly`.
- **Persistence**: Signals are stored in `trend_signals`; candidates in `trend_candidates` with various status enums.
- **Clustering**: `cluster.ts` selects unclustered signals from the last 14 days, processes them in chunks using Anthropic's `claude-sonnet-4-6` via Replit AI, requiring strict JSON output with specific naming and signal count criteria.
- **Telemetry and Alerts**: Each clustering pass writes telemetry to `trend_cluster_runs`. High rejection rates (over 50%) trigger Slack/Discord alerts via `_alert.ts`.
- **Reviewer Dashboard**: An editor dashboard (`EditorTrendQueue.tsx`) allows reviewers to manage trend candidates (approve, snooze, reject) with concurrency-safe approval flows. Approved trends result in `issue-NNN.json` files in the `trend-watch` collection or draft ingredient stubs.
- **Deployment Topology**: The API server runs on Replit. Approved JSON files are published via a GitHub Pull Request opened by the `trend-sync helper` (`artifacts/api-server/src/lib/trend-sync.ts`) against the source repo, enabling Vercel preview deployments.

## Editor Tools

An `EditorPageLink` component provides deep links to the editor dashboard, visible to signed-in editors after a session check with `GET /api/editor/session`.

# External Dependencies

-   **PostgreSQL**: Primary database.
-   **Drizzle ORM**: Database interaction.
-   **Express**: API server framework.
-   **Zod**: Schema validation.
-   **Orval**: API client and OpenAPI code generator.
-   **Astro**: Frontend framework.
-   **Tailwind CSS**: Utility-first CSS (sparingly used).
-   **Vercel**: Production hosting.
-   **GoDaddy**: DNS management.
-   **Anthropic AI**: LLM-based clustering via Replit AI integration.
-   **navigator.sendBeacon**: Analytics transmission.