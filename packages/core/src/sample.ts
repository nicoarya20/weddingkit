import type { Invitation } from "./schema";

// Data mentah (tanpa parse) agar sisi tamu tidak membundel zod.
// Divalidasi terhadap invitationSchema di sample.test.ts.
export const sampleInvitation: Invitation = {
  slug: "nico-dian",
  template: "classic-floral",
  theme: {
    color: { bg: "#FBF7F2", surface: "#FFFFFF", text: "#2B2B2B", muted: "#7A7A7A", primary: "#B5656B", accent: "#C9A66B", border: "#EADFD3" },
    font: { heading: "Playfair Display", body: "Inter", script: "Great Vibes" },
    radius: "12px", motion: "soft", ornament: "none",
  },
  sections: [
    { id: "s1", type: "cover", enabled: true, props: { title: "Nico & Dian", subtitle: "Kami mengundang Anda", date: "2026-12-12" } },
    { id: "s2", type: "couple", enabled: true, props: { people: [
      { name: "Nico Arya", role: "Putra dari", parents: "Bapak A & Ibu B" },
      { name: "Dian Lestari", role: "Putri dari", parents: "Bapak C & Ibu D" },
    ] } },
    { id: "s3", type: "countdown", enabled: true, props: { target: "2026-12-12T09:00:00+07:00", label: "Menuju hari bahagia" } },
    { id: "s4", type: "events", enabled: true, props: { items: [
      { name: "Akad Nikah", date: "2026-12-12", time: "09.00 WIB", place: "Masjid Al-Ikhlas", address: "Jl. Contoh No. 1", visibleTo: ["keluarga_inti", "saudara", "sahabat"] },
      { name: "Resepsi", date: "2026-12-12", time: "12.00 WIB", place: "Gedung Serbaguna", address: "Jl. Contoh No. 2", visibleTo: ["keluarga_inti", "saudara", "sahabat", "teman"] },
    ] } },
  ],
  features: { customTheme: true, maxSections: 12 },
  status: "draft",
};
