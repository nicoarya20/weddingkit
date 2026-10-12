import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import type { Db } from "@weddingkit/db";
import { adminRoutes } from "./routes-admin";
import { publicRoutes } from "./routes-public";
import type { AppEnv, Bindings } from "./types";

/** getDb disuntik supaya bisa diuji tanpa database. Mengembalikan db + fungsi penutup koneksi. */
export type DbProvider = (env: Bindings) => { db: Db; close: () => Promise<void> | void };

export function createApp(getDb: DbProvider) {
  const app = new Hono<AppEnv>();

  app.use("*", cors({ origin: (o) => o, allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE"], allowHeaders: ["Authorization", "Content-Type"] }));

  app.get("/health", (c) => c.json({ ok: true }));

  // Koneksi DB dibuat lazily per request dan ditutup setelah respons.
  app.use("/public/*", async (c, next) => dbScope(c, getDb, next));
  app.use("/admin/*", async (c, next) => dbScope(c, getDb, next));

  app.route("/public", publicRoutes);
  app.route("/admin", adminRoutes);

  app.onError((err, c) => {
    if (err instanceof HTTPException) return c.json({ error: err.message }, err.status);
    console.error(err);
    return c.json({ error: "Terjadi kesalahan" }, 500);
  });

  return app;
}

async function dbScope(c: any, getDb: DbProvider, next: () => Promise<void>) {
  const { db, close } = getDb(c.env);
  c.set("db", db);
  try {
    await next();
  } finally {
    let ctx: ExecutionContext | undefined;
    try { ctx = c.executionCtx; } catch { /* tanpa ExecutionContext (mis. di tes) */ }
    if (ctx) ctx.waitUntil(Promise.resolve(close()));
    else await close();
  }
}
