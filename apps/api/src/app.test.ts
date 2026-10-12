import { expect, test } from "bun:test";
import { createApp } from "./app";

// DB palsu: rute yang diuji di sini tidak menyentuh database.
const fakeDb = () => ({ db: {} as never, close: () => {} });
const app = createApp(fakeDb);
const env = { SUPABASE_URL: "https://example.supabase.co" };

test("health ok", async () => {
  const res = await app.request("/health", {}, env);
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ ok: true });
});

test("admin tanpa token ditolak 401", async () => {
  const res = await app.request("/admin/invitations", {}, env);
  expect(res.status).toBe(401);
});

test("RSVP dengan body tidak valid ditolak 400 sebelum menyentuh DB", async () => {
  const res = await app.request(
    "/public/nico-dian/rsvp",
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: "rudi", attending: "ya" }) },
    env,
  );
  expect(res.status).toBe(400);
});

test("ucapan kosong ditolak 400", async () => {
  const res = await app.request(
    "/public/nico-dian/wishes",
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Rudi", message: "   " }) },
    env,
  );
  expect(res.status).toBe(400);
});
