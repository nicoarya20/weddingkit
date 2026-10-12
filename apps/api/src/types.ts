import type { Db } from "@weddingkit/db";

export type Bindings = {
  HYPERDRIVE?: Hyperdrive;
  DATABASE_URL?: string; // dev lokal (.dev.vars)
  SUPABASE_URL: string;
};

export type Role = "superadmin" | "admin";

export type Variables = {
  db: Db;
  jwtPayload?: { sub?: string }; // diisi middleware jwk
  user: { id: string; email: string; role: Role };
};

export type AppEnv = { Bindings: Bindings; Variables: Variables };
