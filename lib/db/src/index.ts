import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const isProd = process.env.NODE_ENV === "production";
const databaseUrl = process.env.DATABASE_URL || "postgres://postgres@localhost:5432/whatworksskin";

if (isProd && !process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set in production mode. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle(pool, { schema });

export * from "./schema";
