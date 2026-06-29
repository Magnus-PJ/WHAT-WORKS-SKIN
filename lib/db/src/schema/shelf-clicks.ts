import { pgTable, text, serial, timestamp, index } from "drizzle-orm/pg-core";

export const shelfClicksTable = pgTable(
  "shelf_clicks",
  {
    id: serial("id").primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    // `pageKind` is one of "ingredient" | "routine" | "concern". Stored
    // as text rather than a Postgres enum so adding a new editorial
    // page kind is a no-op for the database. The Zod schema generated
    // from the OpenAPI spec is the source of truth for valid values.
    pageKind: text("page_kind").notNull(),
    // Per-kind identifier for the source page. Ingredient briefs use
    // the catalogue ingredient slug (e.g. "tretinoin"); routine and
    // concern pages use the detail-page component file name (e.g.
    // "RoutineBareMinimum") because multiple catalogue slugs can alias
    // the same component.
    pageSlug: text("page_slug").notNull(),
    brand: text("brand").notNull(),
    productName: text("product_name").notNull(),
    href: text("href").notNull(),
    userAgent: text("user_agent"),
  },
  (t) => ({
    createdAtIdx: index("shelf_clicks_created_at_idx").on(t.createdAt),
    // Composite index supports both "filter by page kind only" (e.g.
    // all routine clicks) and "filter to a single page" (kind + slug)
    // without needing a second index.
    pageIdx: index("shelf_clicks_page_idx").on(t.pageKind, t.pageSlug),
  }),
);

export type ShelfClick = typeof shelfClicksTable.$inferSelect;
export type InsertShelfClick = typeof shelfClicksTable.$inferInsert;
