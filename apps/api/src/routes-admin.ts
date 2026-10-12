import { desc, ne } from "drizzle-orm";
import { schema } from "@weddingkit/db";
import { Hono } from "hono";
import { requireRole, requireUser } from "./auth";
import type { AppEnv } from "./types";

export const adminRoutes = new Hono<AppEnv>();

adminRoutes.use("*", requireUser);

adminRoutes.get("/me", (c) => c.json(c.var.user));

// Admin dan superadmin sama-sama melihat SEMUA undangan.
adminRoutes.get("/invitations", async (c) => {
  const rows = await c.var.db
    .select({
      id: schema.invitations.id, slug: schema.invitations.slug, status: schema.invitations.status,
      publishedAt: schema.invitations.publishedAt, updatedAt: schema.invitations.updatedAt,
    })
    .from(schema.invitations)
    .where(ne(schema.invitations.status, "archived"))
    .orderBy(desc(schema.invitations.updatedAt));
  return c.json(rows);
});

// Hanya superadmin.
adminRoutes.get("/users", requireRole("superadmin"), async (c) => {
  const rows = await c.var.db.select().from(schema.profiles).orderBy(schema.profiles.createdAt);
  return c.json(rows);
});
