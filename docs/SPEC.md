# WeddingKit — Spesifikasi Fitur (v1)

Tool pribadi untuk membuat dan mengelola undangan pernikahan digital. Bahasa: **Indonesia saja**.

## Keputusan yang sudah diambil

| Topik | Keputusan |
|---|---|
| Pengguna | Pemakaian pribadi. Bukan SaaS/vendor. |
| Role | `superadmin` (developer), `admin`, tamu (tanpa login) |
| Visibilitas admin | Admin melihat dan mengedit **semua** undangan |
| Tampilan | Website, layout mobile (~430px), di desktop tetap mobile dan di tengah |
| Frontend | Vite + React, section di-lazy-load |
| Preview WhatsApp | Edge function (Cloudflare Worker) menyisipkan meta OG per undangan |
| Backend | **API Hono di Cloudflare Worker** + **Drizzle ORM**. Supabase hanya untuk Postgres dan Auth (login admin) |
| Akses data | Satu jalur: browser → API → Drizzle → Postgres (via Hyperdrive, koneksi *direct* Supabase). Browser tidak pernah menyentuh DB langsung |
| Auth | Supabase Auth; API memverifikasi JWT (JWKS, ES256/RS256) lalu memuat role dari tabel `profiles` |
| RLS | Aktif di semua tabel **tanpa policy**: anon key Supabase tidak bisa membaca apa pun; hanya API (role DB) yang bisa |
| Storage media | Cloudflare R2 (S3-compatible, tanpa egress). Supabase Storage sebagai alternatif. **Bukan MinIO** (repo CE diarsipkan Feb 2026). Alasan: hemat biaya, tanpa urus server |
| Kirim WA | Salin link + template pesan. **Tanpa WhatsApp API** |
| Angpau/hadiah | Hanya menampilkan rekening/e-wallet/QR. Tanpa pembayaran |
| Check-in QR | Masuk v1 |
| Ucapan tamu | Langsung tampil, admin bisa menyembunyikan/menghapus setelahnya |
| Tier Basic/Premium | Disiapkan sebagai feature flags per undangan, belum dipakai |

## 1. Tamu (tanpa login)

Tamu membuka link, langsung melihat undangan. Tidak ada tampilan admin.

Link: `/{slug}?to={nama}-{acak}`, contoh `/nico-dian?to=rudi-k7x2`.

- Kode dibuat otomatis dari nama tamu + akhiran acak pendek (4 karakter), supaya enak dibaca tapi tidak mudah ditebak. Nama kembar tidak bentrok karena akhirannya acak.
- Sapaan di undangan memakai **nama tampilan** (misal "Bapak Rudi Hartono"), terpisah dari kode di URL.
- Kode menentukan sapaan, kategori tamu, dan RSVP. Tanpa kode, undangan tampil sebagai tamu umum.

### Kategori tamu

| Kategori | Melihat |
|---|---|
| `keluarga_inti` | Semua acara |
| `saudara` | Acara yang ditandai untuk saudara |
| `sahabat` | Acara yang ditandai untuk sahabat |
| `teman` | Hanya acara besar (biasanya resepsi) |

Tiap acara punya daftar kategori yang boleh melihatnya (`visibleTo`).

> Catatan: pembatasan ini soal **kenyamanan, bukan keamanan**. Tamu yang menebak URL kategori lain bisa melihat acaranya. Dipublish sebagai satu JSON per kategori supaya tamu tidak melihat acara yang bukan untuknya di tampilan normal.

### Section undangan

Urutan dan on/off diatur admin.

| Section | Fitur |
|---|---|
| `cover` | Sapaan nama tamu, tombol "Buka Undangan" (musik mulai setelah klik) |
| `couple` | Foto, nama lengkap, nama orang tua |
| `quote` | Teks/ayat bebas |
| `story` | Timeline perjalanan |
| `events` | Nama acara, tanggal, jam, lokasi, tombol Google Maps, tombol tambah ke kalender. Difilter per kategori tamu |
| `countdown` | Hitung mundur ke hari-H |
| `gallery` | Foto/video, grid atau masonry, lightbox |
| `rsvp` | Hadir/tidak, jumlah orang, catatan. Terhubung ke tamu lewat kode |
| `wishes` | Tulis ucapan, lihat ucapan lain (langsung tampil) |
| `gift` | Rekening/e-wallet dengan tombol salin, alamat kirim kado, QR |
| `music` | Putar/jeda |
| `qr` | QR check-in pribadi tamu (untuk hari-H) |
| `closing` | Ucapan terima kasih, tombol bagikan |

## 2. Admin

| Menu | Fitur |
|---|---|
| Undangan | Daftar semua undangan; buat dari template; duplikat; arsipkan; status draft/published |
| Editor → Konten | Form isi tiap section (dibuat otomatis dari schema) |
| Editor → Struktur | Tambah, hapus, nyalakan/matikan, urut ulang section |
| Editor → Tema | Warna, font, radius, ornamen, ganti template |
| Editor → Preview | Preview mobile langsung, tombol Publish |
| Editor → Pengaturan | Slug, judul + gambar preview WA, musik, tanggal |
| Tamu | Daftar tamu, tambah manual, impor CSV, kategori, grup, kode unik |
| Tamu → Kirim | Salin link per tamu, template pesan WA (dengan nama tamu), tandai sudah dikirim |
| RSVP | Rekap hadir/tidak/belum, total pax, ekspor CSV |
| Ucapan | Lihat, sembunyikan, hapus |
| Check-in | Scan QR tamu, daftar yang sudah hadir, hitung hadir vs RSVP |
| Media | Upload foto/video/musik, kompres otomatis |
| Riwayat | Versi yang pernah dipublish, kembalikan ke versi lama |

### Impor tamu dan kirim WA

- Impor CSV (ekspor Google Contacts: nama + nomor). Kode, kategori, dan link dibuat otomatis; kategori bisa diatur massal.
- Tombol "Kirim via WA" membuka `https://wa.me/{nomor}?text={pesan}` dengan pesan sudah terisi. Tanpa WhatsApp API, tanpa biaya.
- Tidak membaca kontak HP langsung (Contact Picker API hanya Chrome Android, tidak andal).
- Template pesan bisa diedit admin; dipilih otomatis per kategori tamu. Placeholder: `{nama}`, `{link}`, `{mempelai}`, `{tanggal}`.

Preset awal:

**Formal**
> Assalamu'alaikum Wr. Wb.
> Kepada Yth. {nama},
>
> Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk hadir pada pernikahan kami, {mempelai}, pada {tanggal}.
>
> Detail acara dan konfirmasi kehadiran dapat dilihat di sini:
> {link}
>
> Merupakan kehormatan bagi kami apabila berkenan hadir dan memberikan doa restu. Terima kasih.

**Santai**
> Halo {nama}! 👋
> Kami mau menikah nih, {mempelai}, tanggal {tanggal}. Kamu wajib datang ya!
> Cek detail dan konfirmasi di sini: {link}
> Ditunggu kehadirannya 🤍

**Singkat**
> Yth. {nama}, kami mengundang Anda ke pernikahan {mempelai} pada {tanggal}. Info lengkap & RSVP: {link}

Preset formal memakai salam Islam; sediakan preset netral tanpa salam agama sebagai pilihan.

## 3. Superadmin

Semua fitur admin, ditambah:

| Menu | Fitur |
|---|---|
| Pengguna | Tambah, ubah, nonaktifkan admin |
| Template | Buat dari undangan yang ada, edit, hapus |
| Tema preset | Palet dan font yang tersedia di editor |
| Tipe section | Aktif/nonaktifkan jenis section |
| Feature flags | Atur fitur per undangan (`customTheme`, `maxSections`, dll.) |
| Sistem | Domain, batas upload, log aktivitas |
| Hapus permanen | Hanya superadmin yang boleh |

## 4. Model data (ringkas)

Satu undangan = dokumen dengan tiga lapis: **template → theme → section override**.

```json
{
  "slug": "nico-dian",
  "template": "classic-floral",
  "theme": {
    "color": { "bg": "", "surface": "", "text": "", "muted": "", "primary": "", "accent": "", "border": "" },
    "font": { "heading": "", "body": "", "script": "" },
    "radius": "12px",
    "motion": "soft",
    "ornament": "floral-gold"
  },
  "sections": [
    { "id": "s1", "type": "cover", "enabled": true, "props": {} },
    { "id": "s2", "type": "events", "enabled": true,
      "props": { "items": [ { "name": "Akad", "visibleTo": ["keluarga_inti", "saudara", "sahabat"] },
                            { "name": "Resepsi", "visibleTo": ["keluarga_inti", "saudara", "sahabat", "teman"] } ] } }
  ],
  "features": { "customTheme": true, "maxSections": 12 },
  "status": "draft"
}
```

- Theme dirender sebagai CSS variables.
- Tiap tipe section punya schema (Zod): satu sumber untuk validasi, tipe TypeScript, dan form admin.
- `style` per section hanya boleh menimpa token yang diizinkan, bukan CSS bebas.

### Tabel

`profiles`, `templates`, `invitations` (draft + published), `guests` (kode, kategori, grup, sudah_dikirim, checked_in_at), `rsvps`, `wishes` (hidden), `assets`, `invitation_versions`, `activity_log`.

## 4b. Batas upload

| Jenis | Format | Batas | Perlakuan |
|---|---|---|---|
| Foto | JPG, PNG, WebP, HEIC | 10 MB | Diubah ke WebP/AVIF, beberapa ukuran (480/960/1600px) |
| Video | MP4 (H.264), WebM | 50 MB, maks ±60 detik | Muted-loop atau dengan poster; disarankan dikompres sebelum upload |
| Musik | MP3, M4A/AAC | 8 MB | Satu lagu per undangan |
| Total per undangan | | ~200 MB | Mencegah halaman membengkak |

## 4c. API

Publik (tanpa login, divalidasi Zod):

| Rute | Fungsi |
|---|---|
| `GET /public/:slug/guests/:code` | Sapaan + kategori tamu |
| `POST /public/:slug/rsvp` | RSVP (upsert satu per tamu) |
| `POST /public/:slug/wishes` | Kirim ucapan (langsung tampil) |
| `GET /public/:slug/wishes` | Daftar ucapan yang tidak disembunyikan |

Admin (JWT + profil aktif): `GET /admin/me`, `GET /admin/invitations` (semua undangan). Superadmin saja: `GET /admin/users`.

Belum ada: rate limit untuk rute publik (gunakan Cloudflare Rate Limiting binding), CRUD undangan/tamu, publish, upload R2.

## 5. Performa

- Vite SPA, code-splitting per section.
- Saat Publish, konten dibekukan jadi JSON statis di CDN (satu per kategori tamu). Tamu hanya fetch satu JSON.
- Font dibatasi dan di-preload. Gambar dikompres saat upload.
- Edge function hanya aktif untuk crawler.

## 6. Di luar v1

Multi-bahasa, pembayaran, integrasi WhatsApp API, multi-tenant/vendor, tier Basic/Premium aktif.

## 7. Pertanyaan terbuka

Tidak ada pertanyaan terbuka tersisa. Lihat bagian 8 untuk catatan operasional.

## 8. Catatan operasional

- **Free tier (dicek Okt 2026):** R2 = 10 GB storage, 1 jt Class A, 10 jt Class B, egress gratis. Supabase = 500 MB DB, 1 GB storage, 5 GB egress, 50 rb MAU.
- **Supabase free di-pause setelah 1 minggu tanpa aktivitas.** RSVP dan ucapan berhenti sampai di-restore. Mitigasi: ping harian lewat Cloudflare Worker cron, atau upgrade ke Pro hanya selama bulan acara. Undangan statis di CDN tetap bisa dilihat saat DB di-pause.
- Media di R2; Supabase hanya untuk data, supaya DB tetap di bawah 500 MB.
- **Video:** v1 hanya validasi ukuran (50 MB) dan durasi (±60 detik) saat unggah, plus poster diambil di browser. Video tidak autoplay sebelum diklik. Kompres dilakukan manual sebelum unggah. Transcoding otomatis ditunda (butuh ffmpeg di server/VPS = biaya + operasional).

### Preset pesan netral

> Halo {nama},
>
> Dengan bahagia kami mengundang Anda untuk hadir di pernikahan kami, {mempelai}, pada {tanggal}.
>
> Detail acara dan konfirmasi kehadiran ada di sini:
> {link}
>
> Kehadiran dan doa Anda akan sangat berarti bagi kami. Terima kasih 🤍
