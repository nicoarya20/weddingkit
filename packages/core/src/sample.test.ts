import { expect, test } from "bun:test";
import { invitationSchema } from "./schema";
import { sampleInvitation } from "./sample";
import { sectionsFor, visibleEvents } from "./visibility";

test("sample valid terhadap schema", () => {
  expect(invitationSchema.safeParse(sampleInvitation).success).toBe(true);
});

test("teman hanya melihat resepsi; keluarga_inti melihat semua", () => {
  const ev = sampleInvitation.sections.find((s) => s.type === "events")!;
  if (ev.type !== "events") throw new Error();
  expect(visibleEvents(ev.props.items, "teman").map((e) => e.name)).toEqual(["Resepsi"]);
  expect(visibleEvents(ev.props.items, "keluarga_inti")).toHaveLength(2);
});

test("section nonaktif tidak tampil", () => {
  const s = sampleInvitation.sections.map((x, i) => (i === 1 ? { ...x, enabled: false } : x));
  expect(sectionsFor(s, "teman").some((x) => x.type === "couple")).toBe(false);
});
