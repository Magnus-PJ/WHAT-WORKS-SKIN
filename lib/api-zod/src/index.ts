export * from "./generated/api";
// `generated/types/editorSignInBody.ts` declares an interface with the
// same name as the zod schema value `EditorSignInBody` already
// re-exported above. They describe the same wire shape (one as a
// runtime parser, one as a TS type), so re-exporting both via
// `export *` collides. List the request/response types explicitly and
// drop the duplicate — consumers that want the request type can
// `import type { EditorSignInBody }` from the schema or use the
// inferred type via `z.infer<typeof EditorSignInBody>`.
export type {
  EditorSessionStatus,
  ExportShelfClicksParams,
  HealthStatus,
  ListShelfClicksParams,
  ShelfClickBatch,
  ShelfClickEvent,
  ShelfClickList,
  ShelfClickRecord,
  ShelfPageKind,
  TrendClusterRunSummary,
} from "./generated/types";
