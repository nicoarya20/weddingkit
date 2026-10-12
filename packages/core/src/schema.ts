import { z } from "zod";
import { GUEST_CATEGORIES } from "./constants";
export const guestCategory = z.enum(GUEST_CATEGORIES);
export type GuestCategory = z.infer<typeof guestCategory>;

export const themeSchema = z.object({
  color: z.object({
    bg: z.string(), surface: z.string(), text: z.string(), muted: z.string(),
    primary: z.string(), accent: z.string(), border: z.string(),
  }),
  font: z.object({ heading: z.string(), body: z.string(), script: z.string() }),
  radius: z.string().default("12px"),
  motion: z.enum(["none", "soft", "lively"]).default("soft"),
  ornament: z.string().default("none"),
});
export type Theme = z.infer<typeof themeSchema>;

// Token yang boleh ditimpa per section (bukan CSS bebas).
export const sectionStyleSchema = z
  .object({
    bg: z.string(), text: z.string(), align: z.enum(["left", "center"]),
    paddingY: z.enum(["sm", "md", "lg"]),
  })
  .partial();

const base = { id: z.string(), enabled: z.boolean().default(true), style: sectionStyleSchema.optional() };

export const coverSection = z.object({
  ...base, type: z.literal("cover"),
  props: z.object({ title: z.string(), subtitle: z.string().default("Kami mengundang Anda"), date: z.string(), photo: z.string().optional() }),
});

export const coupleSection = z.object({
  ...base, type: z.literal("couple"),
  props: z.object({
    people: z.array(z.object({
      name: z.string(), role: z.string().default(""), parents: z.string().default(""), photo: z.string().optional(),
    })).min(1),
  }),
});

export const eventItem = z.object({
  name: z.string(), date: z.string(), time: z.string(), place: z.string(), address: z.string().default(""),
  mapUrl: z.string().optional(),
  visibleTo: z.array(guestCategory).default([...GUEST_CATEGORIES]),
});
export type EventItem = z.infer<typeof eventItem>;

export const eventsSection = z.object({
  ...base, type: z.literal("events"), props: z.object({ items: z.array(eventItem).min(1) }),
});

export const countdownSection = z.object({
  ...base, type: z.literal("countdown"), props: z.object({ target: z.string(), label: z.string().default("Menuju hari bahagia") }),
});

export const sectionSchema = z.discriminatedUnion("type", [coverSection, coupleSection, eventsSection, countdownSection]);
export type Section = z.infer<typeof sectionSchema>;
export type SectionType = Section["type"];

export type CoverProps = z.infer<typeof coverSection>["props"];
export type CoupleProps = z.infer<typeof coupleSection>["props"];
export type EventsProps = z.infer<typeof eventsSection>["props"];
export type CountdownProps = z.infer<typeof countdownSection>["props"];

export const invitationSchema = z.object({
  slug: z.string(),
  template: z.string(),
  theme: themeSchema,
  sections: z.array(sectionSchema),
  features: z.object({ customTheme: z.boolean().default(true), maxSections: z.number().default(12) }).default({}),
  status: z.enum(["draft", "published"]).default("draft"),
});
export type Invitation = z.infer<typeof invitationSchema>;
