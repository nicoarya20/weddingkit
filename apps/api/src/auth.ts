import { eq } from "drizzle-orm";
import { schema } from "@weddingkit/db";
import { createMiddleware } from "hono/factory";
import { jwk } from "hono/jwk";
import { HTTPException } from "hono/http-exception";
import type { AppEnv, Role } from "./types";

/** Verifikasi JWT Supabase (kunci asimetris, via JWKS) lalu muat profil + role dari DB. */
export const requireUser = createMiddleware<AppEnv>(async (c, next) => {
  const verify = jwk({
    jwks_uri: `${c.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`,
    alg: ["ES256", "RS256"],
  });
  // jwk() melempar 401 bila token tidak valid
  await verify(c, async () => {});

  const payload = c.get("jwtPayload");
  if (!payload?.sub) throw new HTTPException(401, { message: "Token tidak valid" });

  const [profile] = await c.var.db.select().from(schema.profiles).where(eq(schema.profiles.id, payload.sub)).limit(1);
  if (!profile || !profile.active) throw new HTTPException(403, { message: "Akun tidak aktif atau belum terdaftar" });

  c.set("user", { id: profile.id, email: profile.email, role: profile.role });
  await next();
});

export const requireRole = (...roles: Role[]) =>
  createMiddleware<AppEnv>(async (c, next) => {
    if (!roles.includes(c.var.user.role)) throw new HTTPException(403, { message: "Tidak punya akses" });
    await next();
  });
