import { defineConfig } from "drizzle-kit";

// Migrasi memakai koneksi DIRECT Supabase (bukan pooler).
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
