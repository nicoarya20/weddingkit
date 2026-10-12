import type { EventItem, GuestCategory, Section } from "./schema";

export function visibleEvents(items: EventItem[], category: GuestCategory): EventItem[] {
  return items.filter((e) => e.visibleTo.includes(category));
}

/** Section aktif saja, urutan array = urutan tampil. Section events tanpa acara yang terlihat disembunyikan. */
export function sectionsFor(sections: Section[], category: GuestCategory): Section[] {
  return sections.filter((s) => {
    if (!s.enabled) return false;
    if (s.type === "events") return visibleEvents(s.props.items, category).length > 0;
    return true;
  });
}
