import { sql } from "drizzle-orm";
import { createDb } from "@weddingkit/db";
import { createApp } from "./app";
import type { Bindings } from "./types";

function connect(env: Bindings) {
  const url = env.HYPERDRIVE?.connectionString ?? env.DATABASE_URL;
  if (!url) throw new Error("HYPERDRIVE atau DATABASE_URL belum diatur");
  return createDb(url);
}

const app = createApp(connect);

export default {
  fetch: app.fetch,
  // Ping harian (cron) agar project Supabase free tidak di-pause.
  async scheduled(_e: ScheduledController, env: Bindings, ctx: ExecutionContext) {
    const { db, close } = connect(env);
    ctx.waitUntil(db.execute(sql`select 1`).finally(() => close()));
  },
};
