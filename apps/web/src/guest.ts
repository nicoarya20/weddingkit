import { GUEST_CATEGORIES, type GuestCategory } from "@weddingkit/core";

/** Sementara (stub): ?to=rudi-k7x2 -> "Rudi"; ?cat=teman untuk uji filter acara. Nanti diganti lookup Supabase. */
export function readGuest(search = location.search): { name: string | null; category: GuestCategory } {
  const p = new URLSearchParams(search);
  const to = p.get("to");
  const name = to ? to.replace(/-[a-z0-9]{4}$/i, "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : null;
  const cat = p.get("cat") as GuestCategory | null;
  return { name, category: cat && GUEST_CATEGORIES.includes(cat) ? cat : "teman" };
}
