import { zValidator } from "@hono/zod-validator";
import { and, desc, eq } from "drizzle-orm";
import { schema } from "@weddingkit/db";
import { Hono } from "hono";
import { z } from "zod";
import type { AppEnv } from "./types";

const { invitations, guests, rsvps, wishes } = schema;

export const publicRoutes = new Hono<AppEnv>();

async function findInvitation(c: { var: { db: AppEnv["Variables"]["db"] } }, slug: string) {
  const [inv] = await c.var.db
    .select({ id: invitations.id })
    .from(invitations)
    .where(and(eq(invitations.slug, slug), eq(invitations.status, "published")))
    .limit(1);
  return inv;
}

// Lookup tamu dari kode di URL: untuk sapaan + kategori (filter acara).
publicRoutes.get("/:slug/guests/:code", async (c) => {
  const inv = await findInvitation(c, c.req.param("slug"));
  if (!inv) return c.json({ error: "Undangan tidak ditemukan" }, 404);
  const [g] = await c.var.db
    .select({ displayName: guests.displayName, category: guests.category })
    .from(guests)
    .where(and(eq(guests.invitationId, inv.id), eq(guests.code, c.req.param("code"))))
    .limit(1);
  if (!g) return c.json({ error: "Tamu tidak ditemukan" }, 404);
  return c.json(g);
});

const rsvpBody = z.object({
  code: z.string().min(1).max(80),
  attending: z.boolean(),
  pax: z.number().int().min(1).max(10).default(1),
  note: z.string().max(300).default(""),
});

publicRoutes.post("/:slug/rsvp", zValidator("json", rsvpBody), async (c) => {
  const inv = await findInvitation(c, c.req.param("slug"));
  if (!inv) return c.json({ error: "Undangan tidak ditemukan" }, 404);
  const body = c.req.valid("json");
  const [g] = await c.var.db
    .select({ id: guests.id })
    .from(guests)
    .where(and(eq(guests.invitationId, inv.id), eq(guests.code, body.code)))
    .limit(1);
  if (!g) return c.json({ error: "Tamu tidak ditemukan" }, 404);

  const pax = body.attending ? body.pax : 0;
  await c.var.db
    .insert(rsvps)
    .values({ guestId: g.id, attending: body.attending, pax, note: body.note })
    .onConflictDoUpdate({ target: rsvps.guestId, set: { attending: body.attending, pax, note: body.note, updatedAt: new Date() } });
  return c.json({ ok: true });
});

const wishBody = z.object({
  code: z.string().max(80).optional(),
  name: z.string().trim().min(1).max(60),
  message: z.string().trim().min(1).max(500),
});

publicRoutes.post("/:slug/wishes", zValidator("json", wishBody), async (c) => {
  const inv = await findInvitation(c, c.req.param("slug"));
  if (!inv) return c.json({ error: "Undangan tidak ditemukan" }, 404);
  const body = c.req.valid("json");
  let guestId: string | null = null;
  if (body.code) {
    const [g] = await c.var.db
      .select({ id: guests.id })
      .from(guests)
      .where(and(eq(guests.invitationId, inv.id), eq(guests.code, body.code)))
      .limit(1);
    guestId = g?.id ?? null;
  }
  await c.var.db.insert(wishes).values({ invitationId: inv.id, guestId, name: body.name, message: body.message });
  return c.json({ ok: true }, 201);
});

publicRoutes.get("/:slug/wishes", async (c) => {
  const inv = await findInvitation(c, c.req.param("slug"));
  if (!inv) return c.json({ error: "Undangan tidak ditemukan" }, 404);
  const rows = await c.var.db
    .select({ name: wishes.name, message: wishes.message, createdAt: wishes.createdAt })
    .from(wishes)
    .where(and(eq(wishes.invitationId, inv.id), eq(wishes.hidden, false)))
    .orderBy(desc(wishes.createdAt))
    .limit(100);
  return c.json(rows);
});
