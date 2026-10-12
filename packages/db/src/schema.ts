import { sql } from "drizzle-orm";
import {
  boolean, index, integer, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid,
} from "drizzle-orm/pg-core";
import { GUEST_CATEGORIES } from "@weddingkit/core";

export const roleEnum = pgEnum("role", ["superadmin", "admin"]);
export const guestCategoryEnum = pgEnum("guest_category", GUEST_CATEGORIES);
export const invitationStatusEnum = pgEnum("invitation_status", ["draft", "published", "archived"]);
export const assetKindEnum = pgEnum("asset_kind", ["photo", "video", "audio"]);

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

/** id = auth.users.id (Supabase Auth). Baris dibuat oleh superadmin saat menambah admin. */
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull().default(""),
  role: roleEnum("role").notNull().default("admin"),
  active: boolean("active").notNull().default(true),
  createdAt: createdAt(),
}).enableRLS();

export const templates = pgTable("templates", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  theme: jsonb("theme").notNull(),
  sections: jsonb("sections").notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}).enableRLS();

export const invitations = pgTable("invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  templateId: text("template_id").references(() => templates.id, { onDelete: "set null" }),
  draft: jsonb("draft").notNull(),
  published: jsonb("published"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  status: invitationStatusEnum("status").notNull().default("draft"),
  features: jsonb("features").notNull().default(sql`'{"customTheme":true,"maxSections":12}'::jsonb`),
  createdBy: uuid("created_by").references(() => profiles.id, { onDelete: "set null" }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}).enableRLS();

export const invitationVersions = pgTable("invitation_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  invitationId: uuid("invitation_id").notNull().references(() => invitations.id, { onDelete: "cascade" }),
  snapshot: jsonb("snapshot").notNull(),
  createdBy: uuid("created_by").references(() => profiles.id, { onDelete: "set null" }),
  createdAt: createdAt(),
}, (t) => [index("invitation_versions_inv_idx").on(t.invitationId, t.createdAt)]).enableRLS();

export const guests = pgTable("guests", {
  id: uuid("id").primaryKey().defaultRandom(),
  invitationId: uuid("invitation_id").notNull().references(() => invitations.id, { onDelete: "cascade" }),
  /** Kode di URL: nama + akhiran acak, mis. "rudi-k7x2". */
  code: text("code").notNull(),
  displayName: text("display_name").notNull(),
  phone: text("phone"),
  category: guestCategoryEnum("category").notNull().default("teman"),
  groupName: text("group_name"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  checkedInAt: timestamp("checked_in_at", { withTimezone: true }),
  createdAt: createdAt(),
}, (t) => [uniqueIndex("guests_inv_code_uq").on(t.invitationId, t.code)]).enableRLS();

export const rsvps = pgTable("rsvps", {
  id: uuid("id").primaryKey().defaultRandom(),
  guestId: uuid("guest_id").notNull().unique().references(() => guests.id, { onDelete: "cascade" }),
  attending: boolean("attending").notNull(),
  pax: integer("pax").notNull().default(1),
  note: text("note").notNull().default(""),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}).enableRLS();

export const wishes = pgTable("wishes", {
  id: uuid("id").primaryKey().defaultRandom(),
  invitationId: uuid("invitation_id").notNull().references(() => invitations.id, { onDelete: "cascade" }),
  guestId: uuid("guest_id").references(() => guests.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  message: text("message").notNull(),
  hidden: boolean("hidden").notNull().default(false),
  createdAt: createdAt(),
}, (t) => [index("wishes_inv_idx").on(t.invitationId, t.createdAt)]).enableRLS();

export const assets = pgTable("assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  invitationId: uuid("invitation_id").notNull().references(() => invitations.id, { onDelete: "cascade" }),
  /** Kunci objek di R2. */
  key: text("key").notNull().unique(),
  kind: assetKindEnum("kind").notNull(),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  createdBy: uuid("created_by").references(() => profiles.id, { onDelete: "set null" }),
  createdAt: createdAt(),
}).enableRLS();

export const activityLog = pgTable("activity_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: text("entity_id"),
  meta: jsonb("meta"),
  createdAt: createdAt(),
}).enableRLS();
