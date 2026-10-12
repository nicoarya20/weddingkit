import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export * as schema from "./schema";

/** Satu klien per request (pola yang dianjurkan untuk Workers + Hyperdrive). */
export function createDb(connectionString: string) {
  const sql = postgres(connectionString, { max: 5, fetch_types: false, prepare: false });
  return { db: drizzle(sql, { schema }), close: () => sql.end({ timeout: 1 }) };
}

export type Db = ReturnType<typeof createDb>["db"];
