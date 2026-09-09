# PRD — Bikin Invoice & Kontrak Kerja Fleksibel + AI

### SaaS Dashboard untuk Freelancer / Agency Website

**Versi:** 0.5 — Next.js 15 + SQLite Lokal Opensource + Data Real  
**Tanggal:** 08 Sep 2026  
**Status:** Approved — Next.js 15 App Router + SQLite WASM + IndexedDB (Tanpa Deploy)  
**Bahasa:** Full Bahasa Indonesia  
**Lokus File:** `D:\PROJEK\React JS\bikin-invoice\`

---

## Kontrol Dokumen

| Item | Keterangan |
|------|------------|
| **Nama Produk** | Bikin Invoice — Generator Invoice & Kontrak Kerja untuk Freelancer/Agency Website |
| **Jenis Produk** | Web App Responsive (Desktop-first) — Membuat, Preview, Simpan R2, Export PDF Invoice & Kontrak |
| **Pemilik Produk** | Personal / Arka Studio — Single user MVP, siap multi-user fase 2 |
| **Pengguna Utama** | Freelancer web, agency kecil, studio kreatif yang menjual jasa pembuatan website & layanan IT |
| **Platform Awal** | Responsive Web: Desktop 1440px, Tablet 768px, Mobile 320px |
| **Bahasa** | Indonesia (Full) — English fase 2 |
| **Stack Frontend** | **Next.js 15 (App Router)** + React 19 + TypeScript + Tailwind 4 + shadcn/ui (Radix) + Zustand + sql.js (SQLite WASM) + IndexedDB |
| **Penyimpanan** | **SQLite Lokal** (`sql.js` + `IndexedDB` `bikin-invoice-sqlite`) — file `bikin-invoice.db` bisa export/import, tanpa backend |
| **Stack Backend (Arsip)** | `frontend-vite/` (backup Vite) + Cloudflare Workers (di-nonaktifkan, lihat `backend/README.md`) |
| **Deploy** | **Tidak perlu deploy** — `npm run dev` di `frontend/` (Next.js di `http://localhost:3000`) |
| **Repository** | `bikin-invoice/frontend/` (Next.js) & `data/` (SQLite) & `frontend-vite/` (backup) |
| **Status** | **Approved v0.5** — Next.js 15 + SQLite Lokal (Opensource) |

### Riwayat Versi

| Versi | Tanggal | Perubahan | Status |
|-------|---------|-----------|--------|
| 0.1 | 08 Sep 2026 | Draft awal high-level, scope invoice+kontrak+AI fleksibel | Draft |
| 0.2 | 08 Sep 2026 | Update stack Cloudflare Pages/Workers D1/R2 + DeepInfra DeepSeek V4 Flash | Draft |
| **0.3** | **08 Sep 2026** | **Final: Invoice tanpa AI (dropdown Opsi A), Kontrak pakai AI (dropdown Opsi B), Level 1 Template, R2, UI Style Kanban Minimalist, Frontend-First Dummy** | **Approved** |
| **0.4** | **08 Sep 2026** | **SQLite Lokal Opensource: ganti Cloudflare D1/R2 ke sql.js + IndexedDB, data real, export/import .db, tanpa deploy** | **Approved** |
| **0.5** | **08 Sep 2026** | **Migrasi Vite → Next.js 15 App Router: Sidebar next/link, providers.tsx, seeder default .db, build sukses** | **Approved** |

### Daftar Isi

1. Ringkasan Eksekutif
2. Tujuan & Indikator Keberhasilan
3. Persona & Use Case
4. Ruang Lingkup (MVP Frontend vs Fase BE)
5. Arsitektur Sistem
6. UI/UX Style Guide — Modern Minimalist SaaS Kanban
7. Arsitektur Informasi & Navigasi
8. User Flow Detail
9. Kebutuhan Fungsional per Layar (Dropdown Opsi A & B)
10. Aturan Bisnis
11. Model Data (Dummy & D1)
12. Spesifikasi AI — Kontrak Only (DeepInfra)
13. Spesifikasi Template Level 1 & PDF + R2
14. Kebutuhan Non-Fungsional
15. Acceptance Criteria Frontend
16. Roadmap & Tahapan Rilis
17. Risiko & Mitigasi
18. Lampiran

---

## 1. Ringkasan Eksekutif

### 1.1 Latar Belakang
Sebagai freelancer/agency website, setiap dapat client baru (contoh: UMKM minta website company profile 5 halaman) kamu harus manual membuat 2 dokumen:

1. **Invoice Pembayaran** — rincian biaya, DP, termin, PPN, jatuh tempo.
2. **Kontrak Kerja / SPK (Surat Perjanjian Kerja)** — ruang lingkup, revisi, hak cipta, garansi, pembatalan, TTD.

Proses saat ini: copy file Word/Excel lama → ganti nama → hitung manual → tulis pasal kontrak manual → export PDF yang sering berantakan. Tidak ada arsip terpusat. Contoh invoice existing `Invoice-HMYILJIC-0001.pdf` menunjukkan kebutuhan format profesional yang konsisten.

### 1.2 Pernyataan Masalah

- **Invoice manual rawan salah:** hitung total, DP, PPN, termin 30/40/30 sering salah.
- **Kontrak copy-paste tidak lengkap:** pasal revisi, garansi, hak cipta tidak standar, bahasa tidak profesional.
- **Template kaku:** tiap client butuh termin/PPN/materai/TTD berbeda harus edit file baru.
- **Tidak ada preview rapi:** export Word → PDF pecah layout saat kirim WA.
- **Tidak ada history:** susah cari invoice 3 bulan lalu.

### 1.3 Solusi yang Ditawarkan

Web app **Bikin Invoice** dengan filosofi **"Pilih, bukan Ketik"**:

- **Invoice:** User **memilih** dari dropdown yang kita sediakan (termin, metode, PPN, tempo, denda) lalu isi angka (harga, qty). Tanpa AI — cepat & akurat.
- **Kontrak:** User **memilih** opsi (durasi, revisi, garansi, materai, jumlah pihak) lalu klik **"Generate dengan AI"** → DeepSeek V4 Flash generate pasal lengkap Bahasa Indonesia formal yang tinggal di-toggle/edit.
- **Fleksibel Level 1:** Ganti warna, logo, font — tanpa drag-drop kompleks di MVP.
- **Arsip R2:** Semua PDF final simpan permanen di Cloudflare R2.

### 1.4 Strategi Frontend-First

**Fase sekarang (v0.3):** Fokus **Frontend 100% dengan data dummy** sampai UI & flow sesuai keinginan kamu. Tanpa backend, tanpa D1/R2 real, tanpa DeepInfra real. Semua data di `src/data/dummy.ts` + `zustand` + `localStorage`. AI di-mock (delay 1.5s return dummy clauses). Ini memungkinkan iterasi UI super cepat.

**Fase BE menyusul:** Setelah UI approve, baru sambungkan ke Workers + D1 + R2 + DeepInfra real (API sudah di-spec di PRD ini).

---

## 2. Tujuan & Indikator Keberhasilan

### 2.1 Tujuan Produk

1. **Invoice < 2 menit:** Pilih dropdown → isi item → preview → download/simpan R2.
2. **Kontrak < 3 menit:** Pilih opsi → Generate AI → toggle/edit pasal → preview → download/simpan R2.
3. **Fleksibel 100% via Pilihan:** Semua variasi client ter-cover oleh dropdown Opsi A & B, tanpa perlu edit file manual.
4. **AI Kontrak Profesional:** Bahasa Indonesia formal, lengkap, siap pakai.
5. **Arsip Rapi:** Dashboard Kanban, filter, search, status.

### 2.2 Indikator Keberhasilan (KPI MVP Frontend)

| Indikator | Target | Cara Ukur |
|-----------|--------|-----------|
| Waktu bikin invoice (dummy) | < 2 menit | User test 3 skenario |
| Waktu bikin kontrak (mock AI) | < 3 menit | User test |
| Akurasi kalkulasi total/DP/PPN | 100% | Unit test + UAT 10 kasus termin |
| Kepuasan fleksibilitas dropdown | >= 4/5 | Wawancara kamu |
| AI mock generate diterima | >= 80% tanpa edit besar | Review dummy clauses |
| Export PDF rapi A4 | 0 layout break | Visual QA 3 template |
| UI sesuai spec Kanban minimalis | 100% token terpakai | Design review |

### 2.3 Non-Goals MVP

- Pembayaran online (payment gateway) — hanya catat manual.
- E-signature tersertifikasi — cukup gambar TTD upload.
- Multi-user role — single user dulu.
- Bilingual — full Indonesia dulu.
- Drag-drop template builder — Level 1 saja.

---

## 3. Persona & Use Case

| Persona | Tujuan | Kebutuhan Utama | Pain Point |
|---------|--------|-----------------|------------|
| **Kamu — Freelancer Web (Primary)** | Cepat kirim penawaran profesional ke client baru | Pilih termin cepat, AI bantu pasal, PDF rapi kirim WA | Hitung manual, pasal tidak standar |
| **Admin Studio (Fase 2)** | Kelola banyak client & project | Dashboard Kanban, filter status, template studio | File tercecer |
| **Client Penerima** | Paham scope & cara bayar | PDF jelas: rincian, termin, pasal singkat | PDF berantakan |

### Use Case Utama

- **UC-01:** Buat invoice baru untuk client existing dengan termin custom.
- **UC-02:** Buat kontrak baru dengan AI, pilih pakai materai & 2 pihak TTD.
- **UC-03:** Duplikat invoice lama untuk client baru (ganti nama & harga).
- **UC-04:** Lihat dashboard Kanban status invoice (Planned/In Progress/Done).
- **UC-05:** Edit pasal kontrak (matikan pasal Garansi jika tidak perlu).

---

## 4. Ruang Lingkup

### 4.1 MVP Frontend-First (Yang Dikerjakan Sekarang)

**Data & State:**
- Dummy data: 10 clients, 8 projects, 12 invoices, 6 contracts, 1 settings di `src/data/dummy.ts`.
- Zustand store + localStorage persist. Tanpa fetch API.

**Halaman & Fitur:**
- **Dashboard** — Kanban 3 kolom (Planned / In Progress / Done) untuk Invoice & Kontrak, stats ringkas, tombol cepat.
- **Client** — Daftar + Detail + CRUD modal (nama, perusahaan, WA, email, alamat, NPWP).
- **Project** — Daftar + CRUD (judul, kategori, deskripsi, estimasi harga, deadline).
- **Invoice Builder** — Form kiri + Preview kanan, tabel item (tambah/hapus/reorder), semua dropdown Opsi A, kalkulasi realtime, pilih Template Level 1, preview A4, download PDF (client-side).
- **Contract Builder** — Form opsi B + Editor TipTap per pasal + tombol "Generate dengan AI (Mock)" + toggle ON/OFF pasal + input Nama Pihak 1/2 + preview A4 + download PDF.
- **Template** — Switcher 3 template Level 1 (Minimal, Corporate, Creative).
- **Settings** — Profil usaha (nama, logo upload preview, alamat, rekening, TTD upload preview).

**Tidak termasuk di MVP Frontend:** Auth, D1, R2 real, DeepInfra real, share link public (hanya dummy).

### 4.2 Fase Backend (Setelah Frontend Approve)

- Migrasi dummy → D1 (5 tabel), R2 upload PDF/logo/TTD real, Workers Hono API, DeepInfra AI real, `wrangler deploy` ke Pages/Workers.
- Tambahan: filter tahun, export Excel, share link public.

---

## 5. Arsitektur Sistem

### 5.1 Arsitektur Frontend-First (Saat Ini)

```
[Browser]
  └─ React Vite + Zustand (dummy.ts + localStorage)
     ├─ Live Preview (state)
     └─ @react-pdf/renderer (PDF client-side, tanpa R2)
```

### 5.2 Arsitektur Cloudflare (Fase BE — Sudah Di-spec)

```
[Browser - React Vite @ Cloudflare Pages]
      │  fetch /api/*
      ▼
[Cloudflare Workers - Hono @ workers.dev]
      │  bindings: DB (D1), R2, env DEEPINFRA_API_KEY
      ├─► D1 (SQLite) — clients, projects, invoices, contracts, settings, counters
      ├─► R2 — /logos/*, /signatures/*, /pdf/invoice-*.pdf, /pdf/contract-*.pdf
      └─► DeepInfra API — https://api.deepinfra.com/v1/openai/chat/completions (model: deepseek-ai/DeepSeek-V3 alias v4-flash)
```

**Wrangler Config (Fase BE):**

```toml
# backend/wrangler.toml
name = "bikin-invoice-api"
main = "src/index.ts"
compatibility_date = "2026-09-08"

[d1_databases]
[[d1_databases]]
binding = "DB"
database_name = "bikin-invoice-d1"
database_id = "xxx"

[r2_buckets]
[[r2_buckets]]
binding = "R2"
bucket_name = "bikin-invoice-r2"

[vars]
DEEPINFRA_MODEL = "deepseek-ai/DeepSeek-V3"
# secret: DEEPINFRA_API_KEY via `wrangler secret put`
```

---

## 6. UI/UX Style Guide — Modern Minimalist SaaS Kanban

> **Sumber Spec:** Didefinisikan user verbatim, diimplementasi sebagai Tailwind tokens.

### 6.1 Theme & Character

**Style:** Modern, Minimalist, SaaS Dashboard, Kanban.  
**Theme:** Light, Professional, Soft, Clean.  
**Character:** Bersih, terorganisir, berorientasi utilitas. Whitespace optimal, warna latar lembut, nyaman dipakai lama. Flat design — pemisahan elemen mengandalkan border tipis & beda warna latar, bukan shadow mencolok.

### 6.2 Color Pattern

| Token | Value | Penggunaan |
|-------|-------|------------|
| **Primary** | `#111827` / Hitam / Dark Grey | Teks utama, judul H1, ikon navigasi aktif |
| **Secondary** | `#FFFFFF` (Putih) | Latar kartu Kanban, kartu form, modal |
| **Background Canvas** | `#F9FAFB` / `#F3F4F6` Off-white / Abu sangat terang | Latar canvas utama & sidebar |
| **Text Primary** | `#111827` Dark Grey | Judul, nama kartu, label form |
| **Text Secondary** | `#6B7280` Light Grey | Metadata (durasi "3.5 Weeks", tanggal, deskripsi) |
| **Border** | `#E5E7EB` Light Grey | Garis border 1px semua kartu & section |
| **Accent — Planned** | `#3B82F6` Biru | Badge/tag "Planned", indikator kolom Planned |
| **Accent — In Progress** | `#F59E0B` Kuning/Oranye | Badge "In Progress" |
| **Accent — Done** | `#10B981` Hijau | Badge "Done", tag "Feature" |
| **Inactive State** | `#F3F4F6` Abu terang | Menu sidebar tidak aktif, hover |

**Pola:** Palet monokromatik (putih & abu-abu) + aksen semantik terfokus pada indikator status/tag agar mudah scan visual.

### 6.3 Typography

| Level | Size | Weight | Usage |
|-------|------|--------|-------|
| **H1 (Judul Utama)** | 24-28px | Semi-bold / 600 | Judul Dashboard, "Bikin Invoice" |
| **H2 (Header Kolom)** | 14-16px | Medium / 500 | "Planned", "In Progress", "Done" |
| **Card Title** | 14-16px | Medium / 500 | Nama client/project/invoice |
| **Body / Card Text** | 14px | Regular / 400 | Deskripsi, alamat, item |
| **Metadata / Tag** | 12px | Regular / 400 | Durasi, tanggal, status pill |

**Font Family:** Sans-serif — `Inter` (primary), fallback `Roboto`, system sans. Clean, geometris, keterbacaan tinggi.

### 6.4 Border & Radius

- **Radius Kartu:** `8px - 12px` (`rounded-lg` / `rounded-xl` di Tailwind).
- **Radius Tag/Pill:** `9999px` (`rounded-full`).
- **Border:** Solid 1px `Light Grey` (`#E5E7EB`).
- **Konsistensi:** Semua elemen (kartu, input, button, sidebar active state) pakai rounded — kesan modern, ramah, tidak kaku.

### 6.5 Spacing & Layout

- **Layout:** Sidebar navigasi tetap kiri (240px) + area konten utama Kanban kanan (flex 1, scroll horizontal jika perlu).
- **Spacing:** Longgar (generous padding) — `p-4` / `p-6` di kartu, `gap-6` antar kolom, `gap-4` antar kartu.
- **Alignment:** Teks rata kiri (left-aligned), kartu berjajar horizontal & vertikal.
- **Grid:** Sistem kolom vertikal (column-based Kanban).
- **Density:** Rendah-menengah (low-to-medium) — informasi mudah cerna, tidak padat.

### 6.6 Component Style

| Komponen | Style |
|----------|-------|
| **Card** | Latar putih, border 1px Light Grey, rounded 8-12px, tanpa shadow mencolok di default (flat). Hover: border sedikit gelap. |
| **Button** | `+` sirkuler (`rounded-full` 32px) untuk tambah, pill (`rounded-full` + `px-4 py-2`) untuk tag/label, primary Hitam (`bg-zinc-900` text white), secondary White border. |
| **Input / Search** | Pill (`rounded-full`) dengan ikon kiri (Search), border 1px Light Grey, bg white, placeholder Light Grey. |
| **Navigation** | Sidebar vertikal ikon + teks, item aktif = bg Abu terang (`#F3F4F6`) rounded pill + text Dark Grey + font Medium. Inactive = text Light Grey. Ikon line/outline monokrom. |
| **Table/List** | Disajikan sebagai Kanban board columns, bukan table tradisional. |
| **Icon** | Outline/line minimalis, monokrom, 16-20px. |
| **Shadow** | Flat — andalkan border & perbedaan bg (`F9FAFB` vs `FFFFFF`), bukan shadow. |

### 6.7 Tailwind Tokens (Implementasi)

```css
/* frontend/src/index.css */
:root {
  --primary: #111827;
  --secondary: #FFFFFF;
  --canvas: #F9FAFB;
  --canvas-2: #F3F4F6;
  --text-primary: #111827;
  --text-secondary: #6B7280;
  --border: #E5E7EB;
  --accent-blue: #3B82F6;
  --accent-amber: #F59E0B;
  --accent-green: #10B981;
  --radius-card: 12px;
  --radius-pill: 9999px;
}
```

---

## 7. Arsitektur Informasi & Navigasi

| Menu Sidebar | Icon | Sub Halaman | Tujuan |
|--------------|------|-------------|--------|
| **Dashboard** | LayoutDashboard | — | Kanban ringkas + stats + aksi cepat |
| **Clients** | Users | Daftar, Detail (tabs: Info, Projects, Invoices) | Kelola database client |
| **Projects** | FolderKanban | Daftar, Detail | Hubungkan client ↔ invoice/kontrak |
| **Invoices** | FileText | Daftar (Kanban/Table toggle), Buat, Edit, Preview | Alur invoice manual |
| **Contracts** | FileSignature | Daftar (Kanban), Buat (with AI), Edit | Alur kontrak AI |
| **Templates** | Palette | Preview 3 template Level 1 | Pilih template aktif |
| **Settings** | Settings | Profil Usaha, Rekening, TTD | Konfigurasi kop & identitas |

**Navigasi Global:**
- Sidebar fixed kiri 240px, collapsible di mobile (drawer).
- Header top: Search pill (kanan atas), tombol `+ Invoice Baru` (Hitam pill), `+ Kontrak Baru` (White border pill).
- Breadcrumb: `Dashboard > Invoices > INV-2026-0001`.
- Active state: bg `#F3F4F6` pill + text `#111827` Medium.

---

## 8. User Flow Detail

### 8.1 Flow Invoice — Manual Dropdown (Tanpa AI)

```
[DASHBOARD] ──► [+ Invoice Baru] ──► [PILIH CLIENT] ──► [PILIH PROJECT (opsional)] ──► [INVOICE BUILDER]
                                                                              │
                                    ┌─────────────────────────────────────────┘
                                    ▼
[FORM KIRI]                          [PREVIEW KANAN (A4)]
- Nomor auto INV-2026-0013           - Live update <300ms
- Tanggal terbit & Jatuh tempo       - Template Minimal/Corporate/Creative
- Tabel Item: +Tambah, hapus, qty    - Header (logo, nama usaha)
- Dropdown Termin (Opsi A)           - Tabel item
- Dropdown Metode, PPN, Tempo, Denda - Subtotal, PPN, Diskon, Total, DP, Sisa
- Catatan & Syarat                   - Rekening & TTD
- Pilih Template Level 1             - Pagination jika >12 item
                                    │
                                    ▼
[SIMPAN DRAFT] ──► [DOWNLOAD PDF] ──► [KEMBALI KE DAFTAR KANBAN → kolom "In Progress" atau "Done"]
   (zustand + localStorage)   (@react-pdf/renderer)   (Fase BE: + simpan R2)
```

**Termin Custom:** Jika pilih "Custom" → muncul builder termin N baris (Tanggal + % + Nominal auto-hit).

### 8.2 Flow Kontrak — Dengan AI Mock (Frontend) / Real (Fase BE)

```
[DASHBOARD] ──► [+ Kontrak Baru] ──► [PILIH CLIENT & PROJECT] ──► [OPSI KONTRAK (Dropdown Opsi B)]
                                                                    - Durasi, Revisi, Garansi
                                                                    - Materai Ya/Tidak
                                                                    - TTD 1/2/3 pihak + Nama Pihak 1 & 2
                                                                    - Hak Cipta
                                                                    │
                                                                    ▼
                                          [TOMBOL "Generate dengan AI" (Mock 1.5s)]
                                                                    │
                                                                    ▼
                                          [EDITOR PASAL — 8 Card]
                                          - Tiap card: title, TipTap content, toggle ON/OFF, drag reorder, hapus
                                          - Badge "Generated by AI — harap periksa"
                                                                    │
                                                                    ▼
                                          [PREVIEW KANAN A4] ──► [SIMPAN DRAFT] ──► [DOWNLOAD PDF]
                                          - Kop + Para Pihak
                                          - Pasal aktif saja
                                          - Halaman TTD (1/2/3 kolom sesuai pilihan)
```

### 8.3 Flow Edit Fleksibel

User bisa lewati AI sepenuhnya → langsung edit pasal manual. AI hanya asisten opsional.

---

## 9. Kebutuhan Fungsional per Layar

### 9.1 Global

| ID | Fitur | Requirement | Prioritas |
|----|-------|-------------|-----------|
| FR-G01 | Responsive | 320px → 1440px, Kanban scroll horizontal di mobile | Must |
| FR-G02 | Auto Number | `INV-YYYY-XXXX` & `SPK-YYYY-XXXX` auto increment, dummy: `INV-2026-0013` next | Must |
| FR-G03 | Search | Search pill header filter client/project/invoice by nama/nomor (dummy filter) | Must |
| FR-G04 | Duplicate | Tombol duplikat invoice/kontrak → prefill form baru | Should |
| FR-G05 | Persist | Zustand + localStorage auto-save draft | Must |
| FR-G06 | Kanban DnD | Drag kartu antar kolom Planned/In Progress/Done (update status) — pakai `@dnd-kit` atau native | Should |

### 9.2 Clients & Projects

| ID | Requirement | Prioritas |
|----|-------------|-----------|
| FR-C01 | CRUD Client: nama, perusahaan, WA (+62), email, alamat, NPWP opsional — modal form | Must |
| FR-C02 | CRUD Project: judul, kategori (Company Profile, E-commerce, Custom, Landing Page), deskripsi, estimasi harga, deadline, status | Must |
| FR-C03 | Relasi: Client 1—N Project, Project 1—N Invoice/Kontrak (select di builder) | Must |
| FR-C04 | Validasi WA & email (Zod) | Must |
| FR-C05 | Detail Client: tabs Info, Projects, Invoices, Contracts | Should |

### 9.3 Invoice Builder — Opsi A (Tanpa AI)

| ID | Field | Tipe | Opsi Dropdown | Validasi |
|----|-------|------|---------------|----------|
| FR-I01 | Tabel Item | Table + Add/Remove/Drag | Kolom: Nama, Deskripsi, Qty, Satuan (pcs, hari, paket), Harga, Diskon per item | Qty >=1, Harga >=0 |
| FR-I02 | Kalkulasi | Realtime | Subtotal, Diskon Global (Rp / %), PPN toggle, Total, DP (Rp & %), Sisa | Total 100% termin, bulat Rupiah |
| FR-I03 | **Termin Pembayaran** | **Dropdown** | 50% DP - 50% Pelunasan, 30% - 40% - 30%, 100% di Awal, 4x Termin (25%), Custom | Jika Custom → builder N termin (Tanggal + % + Nominal) |
| FR-I04 | **Metode Pembayaran** | **Dropdown** | Transfer Bank, QRIS, Cash, Termin Bertahap | Must choose 1 |
| FR-I05 | **PPN** | **Dropdown** | Tanpa PPN, PPN 11% Ditambahkan, PPN Sudah Termasuk | Jika Ditambahkan → baris PPN terpisah |
| FR-I06 | **Jatuh Tempo** | **Dropdown** | 7 Hari, 14 Hari, 30 Hari, Tanggal Custom | Default 14 Hari dari terbit |
| FR-I07 | **Denda Keterlambatan** | **Dropdown** | Tanpa Denda, 1% per Hari, 1% per Minggu, Custom | Tampil di Syarat |
| FR-I08 | **Biaya Tambahan** | **Dropdown** | Tanpa Biaya Tambahan, Revisi di luar scope Rp/hari, Maintenance opsional | Tampil di catatan |
| FR-I09 | Nomor, Tgl Terbit, Catatan, Syarat | Input | Auto number, date picker, textarea | Nomor unik |
| FR-I10 | Template | Switcher Level 1 | Minimal, Corporate, Creative (warna/font/header) | Preview realtime |
| FR-I11 | Preview & PDF | View | A4 live preview + Download PDF `@react-pdf/renderer` | <3s generate |

### 9.4 Contract Builder — Opsi B (Dengan AI)

| ID | Field | Tipe | Opsi | Prioritas |
|----|-------|------|------|-----------|
| FR-K01 | Para Pihak | Input | Nama Pihak 1 (usahamu, auto dari Settings), Nama Pihak 2 (client, auto), Jabatan (Direktur/Personal/CV/PT) | Must |
| FR-K02 | **Durasi Pengerjaan** | **Dropdown** | 7 Hari, 14 Hari, 21 Hari, 30 Hari, 60 Hari, Custom | Must |
| FR-K03 | **Jumlah Revisi** | **Dropdown** | 1x, 2x, 3x, 5x, Unlimited (selama scope) | Must |
| FR-K04 | **Garansi/Maintenance** | **Dropdown** | 7 Hari, 30 Hari, 90 Hari, Tidak Ada Garansi | Must |
| FR-K05 | **Materai** | **Toggle** | Pakai Materai Rp10.000 / Tidak Pakai | Must |
| FR-K06 | **Tanda Tangan** | **Dropdown** | 1 Pihak, 2 Pihak, 3 Pihak (+ Saksi) — plus input Nama Pihak 1, Nama Pihak 2, Nama Saksi | Must |
| FR-K07 | **Hak Cipta** | **Dropdown** | Milik Client setelah lunas, Milik Developer hingga lunas, Bagi Pakai | Must |
| FR-K08 | **Template Pasal** | **Toggle List** | 8 pasal default (ON/OFF per pasal) | Must |
| FR-K09 | Editor Pasal | TipTap | Rich-text per pasal, heading, list, bold, tabel opsional, drag reorder, duplicate, hapus | Must |
| FR-K10 | AI Generate | Button | "Generate dengan AI" → mock 1.5s → return 8 clauses Bahasa Indonesia formal → auto-fill editor | Must |
| FR-K11 | Variabel | Auto | `{{client_name}}`, `{{project_title}}`, `{{price}}`, `{{duration}}`, `{{revisi}}` auto-replace + highlight | Must |
| FR-K12 | Preview & PDF | View | A4 preview + halaman TTD sesuai pilihan (1/2/3 kolom) + materai badge | Must |

**8 Pasal Default (Toggle):**

1. Pendahuluan & Ruang Lingkup Pekerjaan
2. Biaya, Pembayaran & Termin
3. Jadwal, Deadline & Keterlambatan
4. Revisi & Biaya Tambahan
5. Hak Cipta, Kepemilikan & Serah Terima
6. Garansi, Maintenance & Batasan Tanggung Jawab
7. Pembatalan, Force Majeure & Penyelesaian Sengketa
8. Penutup & Tanda Tangan

### 9.5 AI Assist — Kontrak Only

| ID | Requirement | Prioritas |
|----|-------------|-----------|
| FR-AI01 | Tombol Generate Kontrak: input dropdown Opsi B → output array clauses JSON Bahasa Indonesia formal | Must |
| FR-AI02 | Tombol Perbaiki Bahasa (fase BE): seleksi teks → "Lebih Formal / Lebih Ringkas" | Could (Fase BE) |
| FR-AI03 | Mock Frontend: delay 1.5s, return dummy clauses dari `dummyClauses.ts`, badge "Mock AI — akan pakai DeepInfra real" | Must (Frontend) |
| FR-AI04 | Real BE: `POST /api/ai/generate-contract` dengan `type`, `prompt`, `context` — key di Workers secret | Must (Fase BE) |
| FR-AI05 | Fallback: jika AI gagal → error ramah + tetap bisa manual | Must |
| FR-AI06 | Badge: "Generated by AI — harap periksa" di editor | Must |

### 9.6 Template & Settings

| ID | Requirement | Prioritas |
|----|-------------|-----------|
| FR-T01 | Settings: nama usaha, logo upload (preview), alamat, telepon, email, bank, norek, an, NPWP, TTD upload (preview) — simpan localStorage dulu | Must |
| FR-T02 | Template Config Level 1: `primaryColor` (Hitam #111827 default), `secondaryColor`, `font` (Inter/Manrope/Playfair), `showLogo` boolean, `headerStyle` (minimal/band) | Must |
| FR-T03 | Switcher 3 template: Minimal (clean), Corporate (band header), Creative (aksen) — preview realtime | Must |

---

## 10. Aturan Bisnis (BR)

| ID | Aturan |
|----|--------|
| BR-01 | Nomor unik `INV-YYYY-XXXX` & `SPK-YYYY-XXXX`, XXXX increment per tahun, tidak boleh duplikat (dummy: max +1). |
| BR-02 | Total = Σ(qty×harga − diskon item) − diskon global + PPN. DP % dari Total. Sisa = Total − DP. Bulat Rupiah `Rp 4.500.000` tanpa desimal. |
| BR-03 | PPN 11% hanya jika dropdown "PPN 11% Ditambahkan" → tampil baris terpisah "PPN 11%". |
| BR-04 | Termin % harus total 100%. Validasi FE (Zod) + BE (D1). |
| BR-05 | Jatuh tempo default 14 hari dari tgl terbit (sesuai dropdown), bisa custom. |
| BR-06 | Status Overdue otomatis jika lewat jatuh tempo & belum Paid (hitung on-read). |
| BR-07 | Kontrak minimal 1 pasal aktif sebelum export. |
| BR-08 | Variabel `{{...}}` wajib terisi sebelum PDF — jika kosong tampil warning. |
| BR-09 | AI output bukan final — user wajib review, tampil badge. |
| BR-10 | Format Rupiah: `Rp` + titik ribuan, contoh `Rp 10.000`, `Rp 1.500.000`. |

---

## 11. Model Data

### 11.1 Dummy Data (Frontend-First) — `src/data/dummy.ts`

```typescript
// types/index.ts
type Client = { id: string; name: string; company: string; email: string; phone: string; address: string; npwp?: string; createdAt: string; }
type Project = { id: string; clientId: string; title: string; category: 'Company Profile'|'E-commerce'|'Custom'|'Landing Page'; description: string; priceEstimate: number; deadline?: string; status: 'planned'|'in_progress'|'done'; }
type InvoiceItem = { id: string; name: string; desc: string; qty: number; unit: string; price: number; discount: number; }
type Invoice = { id: string; number: string; clientId: string; projectId?: string; items: InvoiceItem[]; subtotal: number; discountType: 'percent'|'fixed'; discountValue: number; taxMode: 'none'|'add11'|'include'; taxValue: number; total: number; termin: '50/50'|'30/40/30'|'100'|'4x'|'custom'; terminDetails?: {date:string; percent:number}[]; paymentMethod: 'transfer'|'qris'|'cash'|'termin'; dueMode: '7'|'14'|'30'|'custom'; dueDate: string; issueDate: string; lateFee: 'none'|'1day'|'1week'|'custom'; extraCost: 'none'|'revisi'|'maintenance'; notes: string; terms: string; templateId: 'minimal'|'corporate'|'creative'; status: 'planned'|'in_progress'|'done'; createdAt: string; }
type Clause = { id: string; title: string; content: string; // HTML
order: number; enabled: boolean; }
type Contract = { id: string; number: string; clientId: string; projectId?: string; title: string; party1Name: string; party1Role: string; party2Name: string; party2Role: string; duration: '7'|'14'|'21'|'30'|'60'|'custom'; revisi: '1'|'2'|'3'|'5'|'unlimited'; warranty: '7'|'30'|'90'|'none'; materai: boolean; signCount: 1|2|3; witnessName?: string; ipRights: 'client'|'dev'|'shared'; clauses: Clause[]; templateId: string; status: 'planned'|'in_progress'|'done'; createdAt: string; }
```

**Dummy Counts:** 10 clients (CV Barokah, PT Maju Jaya, Toko Berkah, dll), 8 projects, 12 invoices (sebar status Planned/In Progress/Done), 6 contracts, 1 settings (Arka Studio), 3 templates.

### 11.2 D1 Schema (Fase BE) — `migrations/0001_init.sql`

```sql
CREATE TABLE clients (id TEXT PRIMARY KEY, name TEXT NOT NULL, company TEXT, email TEXT, phone TEXT, address TEXT, npwp TEXT, created_at TEXT);
CREATE TABLE projects (id TEXT PRIMARY KEY, client_id TEXT REFERENCES clients(id), title TEXT, category TEXT, description TEXT, price_estimate INTEGER, deadline TEXT, status TEXT, created_at TEXT);
CREATE TABLE invoices (id TEXT PRIMARY KEY, number TEXT UNIQUE, client_id TEXT, project_id TEXT, items JSON, subtotal INTEGER, discount_type TEXT, discount_value INTEGER, tax_mode TEXT, tax_value INTEGER, total INTEGER, termin TEXT, termin_details JSON, payment_method TEXT, due_mode TEXT, due_date TEXT, issue_date TEXT, late_fee TEXT, extra_cost TEXT, notes TEXT, terms TEXT, template_id TEXT, status TEXT, r2_pdf_key TEXT, created_at TEXT);
CREATE TABLE contracts (id TEXT PRIMARY KEY, number TEXT UNIQUE, client_id TEXT, project_id TEXT, title TEXT, party1_name TEXT, party1_role TEXT, party2_name TEXT, party2_role TEXT, duration TEXT, revisi TEXT, warranty TEXT, materai INTEGER, sign_count INTEGER, witness_name TEXT, ip_rights TEXT, clauses JSON, template_id TEXT, status TEXT, r2_pdf_key TEXT, created_at TEXT);
CREATE TABLE settings (id TEXT PRIMARY KEY, data JSON);
CREATE TABLE counters (year TEXT PRIMARY KEY, last_invoice_seq INTEGER, last_contract_seq INTEGER);
CREATE TABLE templates (id TEXT PRIMARY KEY, type TEXT, name TEXT, config JSON, is_default INTEGER);
```

---

## 12. Spesifikasi AI — Kontrak Only (DeepInfra DeepSeek V4 Flash)

### 12.1 Provider

- **Model:** `deepseek-ai/DeepSeek-V3` (alias `deepseek-v4-flash` milik user — via env `DEEPINFRA_MODEL`).
- **Endpoint:** `https://api.deepinfra.com/v1/openai/chat/completions` (OpenAI-compatible).
- **Auth:** `Authorization: Bearer ${DEEPINFRA_API_KEY}` (Workers secret, tidak di FE).
- **SDK:** `openai` npm dengan `baseURL` DeepInfra.

### 12.2 Endpoint (Fase BE)

```
POST /api/ai/generate-contract
Body: {
  duration: "21",
  revisi: "3",
  warranty: "30",
  materai: true,
  signCount: 2,
  party1Name: "Arka Studio",
  party2Name: "CV Barokah",
  projectTitle: "Website Company Profile 5 Halaman",
  price: 4500000,
  ipRights: "client"
}
Response: { clauses: [{title, content: "<p>...</p><ul><li>...</li></ul>"}] } // 8 pasal
Validation: Zod di Workers, retry 1x jika JSON invalid.
```

### 12.3 System Prompt (Fase BE)

```
Kamu asisten legal freelancer IT Indonesia. Tugas: buat 8 pasal kontrak SPK pembuatan website. Bahasa formal Indonesia, lengkap, pasal per pasal. Gunakan variabel {{client_name}}, {{project_title}}, {{price}}, {{duration}}, {{revisi}}, {{warranty}}. Jika materai=true tambahkan kalimat materai Rp10.000. Output HARUS JSON valid: {clauses:[{title,content}]}. Content pakai HTML <p><ul><li>. Jangan tambah markdown.
```

### 12.4 Frontend Mock (Saat Ini)

`src/services/mockAi.ts` → `generateContractMock(options)` → delay 1500ms → return `dummyClauses.ts` (8 pasal Bahasa Indonesia formal dengan variabel sudah terisi). Tombol "Generate dengan AI" tampil badge "Mock — DeepInfra real di Fase BE".

### 12.5 Guardrail

- Validasi Zod di FE + BE.
- Jika AI gagal → toast error + tetap bisa edit manual.
- Rate limit BE: 20 req/menit per IP.

---

## 13. Spesifikasi Template Level 1 & PDF + R2

### 13.1 Template Level 1 (MVP)

| Template | Header | Warna | Font | Cocok |
|----------|--------|-------|------|-------|
| **Minimal** | Tipis, logo kecil kiri | Hitam #111827 + Abu | Inter | Freelancer modern |
| **Corporate** | Band tebal primary color | Hitam + Biru aksen | Manrope | Agency formal |
| **Creative** | Aksen miring, logo besar | Hitam + Hijau | Playfair | Studio kreatif |

**Config JSON:**

```json
{
  "primaryColor": "#111827",
  "secondaryColor": "#FFFFFF",
  "font": "Inter",
  "showLogo": true,
  "headerStyle": "minimal"
}
```

Switcher di Builder → preview realtime (state `templateId`).

### 13.2 PDF Strategy

- **Frontend (Sekarang):** `@react-pdf/renderer` di FE untuk preview & download instant (tanpa R2). Layout A4 margin 20mm, font 9-10pt, auto page break jika >12 item.
- **Fase BE (R2):** `POST /api/pdf/invoice/:id` → Workers generate via `pdf-lib` atau `html` → `R2.put(key, buffer, {contentType:"application/pdf"})` → simpan `r2_pdf_key` di D1 → `GET /api/files/:key` serve PDF.

**Nama File R2:** `pdf/invoices/INV-2026-0013.pdf`, `pdf/contracts/SPK-2026-0007.pdf`, `logos/arka-logo.png`, `signatures/ttd.png`.

### 13.3 R2 Bucket

`bikin-invoice-r2` — gratis 10GB, tanpa egress fee. Semua PDF historis permanen.

---

## 14. Kebutuhan Non-Fungsional

| Kategori | Requirement | Target |
|----------|-------------|--------|
| Performa | Preview update | < 300ms setelah edit |
| Performa | Generate PDF (client) | < 3 detik 1 halaman |
| Performa | Mock AI | 1.5s delay (simulasi) |
| Keamanan | API key DeepInfra di Workers secret, tidak di bundle FE | Must |
| Validasi | Zod di FE (form) + BE (D1) | Must |
| Browser | Chrome, Edge, Firefox latest, Safari | Must |
| Aksesibilitas | Keyboard navigable, label form, contrast AA | Should |
| Backup | Export JSON dummy (Fase BE: R2 backup) | Should |
| Deploy | Pages auto-deploy dari `frontend/dist`, Workers `wrangler deploy` | Must |

---

## 15. Acceptance Criteria — Frontend Dummy

Harus lolos sebelum lanjut Fase BE:

- [ ] Dashboard Kanban tampil 3 kolom (Planned Biru, In Progress Kuning, Done Hijau) dengan kartu dummy, drag antar kolom update status.
- [ ] Search pill filter Kanban by nama/nomor.
- [ ] Bisa buat Client & Project baru via modal, muncul di dummy list.
- [ ] Bisa buat Invoice baru: pilih client/project, isi tabel item, pilih semua dropdown Opsi A, kalkulasi total/DP/PPN/sisa 100% benar, switch template Level 1, preview A4 realtime, download PDF tanpa pecah.
- [ ] Nomor invoice auto increment tidak duplikat (buat 5 berurutan).
- [ ] Bisa buat Kontrak baru: isi dropdown Opsi B, klik Generate AI Mock → 8 pasal muncul, toggle OFF 1 pasal, reorder drag, edit TipTap, isi Nama Pihak 1/2, preview A4 dengan TTD 1/2/3 kolom sesuai pilihan + badge materai, download PDF.
- [ ] Settings logo & rekening & TTD upload preview muncul di preview invoice/kontrak.
- [ ] UI 100% sesuai token: primary Hitam, bg Off-white, kartu putih border 1px, radius 12px, pill tag, font Inter, flat shadow.
- [ ] Semua data persist di localStorage (refresh tidak hilang).
- [ ] Jika mock AI "gagal" (simulasi), tetap bisa manual.

---

## 16. Roadmap & Tahapan Rilis

| Fase | Tugas | Estimasi | Status |
|------|-------|----------|--------|
| **F0 Setup** | Vite + TS + Tailwind 4 + shadcn + Inter + token warna + Sidebar Kanban layout | 0.5 hari | Next |
| **F1 Data** | Types + dummy.ts + zustand + localStorage + Dashboard Kanban + Clients/Projects CRUD | 1 hari | — |
| **F2 Invoice** | Invoice Builder (dropdown A) + kalkulasi + preview + PDF | 1.5 hari | — |
| **F3 Contract** | Contract Builder (dropdown B) + TipTap + mock AI + preview + PDF | 1.5 hari | — |
| **F4 Polish** | Settings + Template switcher + search + drag Kanban + responsive | 0.5 hari | — |
| **BE-1** | Workers Hono + D1 migrations + R2 + API CRUD (migrasi dummy) | 2 hari | Setelah FE approve |
| **BE-2** | DeepInfra real + PDF R2 upload + deploy Pages/Workers | 1 hari | — |

**Total Frontend-First:** ~5 hari kerja.

### Perintah Kunci (Fase BE nanti)

```bash
wrangler d1 create bikin-invoice-d1
wrangler r2 bucket create bikin-invoice-r2
wrangler secret put DEEPINFRA_API_KEY
wrangler d1 execute bikin-invoice-d1 --local --file=migrations/0001_init.sql
wrangler deploy
wrangler pages deploy frontend/dist
```

---

## 17. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| Dropdown Opsi A/B kurang opsi | User butuh custom tidak ter-cover | Sediakan opsi "Custom" dengan input manual + field tambahan di PRD sudah ada |
| Kalkulasi termin 100% salah | Invoice salah | Unit test 10 kasus + validasi Zod FE/BE |
| Mock AI tidak mirip real | Ekspektasi salah saat migrasi BE | Prompt real sudah di-spec, dummy clauses dibuat mirip output DeepSeek formal |
| Kanban drag performance | Lag di mobile | Pakai `@dnd-kit` ringan atau native, test di 320px |
| PDF pecah jika item >12 | Layout A4 rusak | Auto page break di `@react-pdf/renderer`, test 20 item |
| D1 single-writer limit | Concurrent write error (kecil untuk personal) | Counter transaction `BEGIN/COMMIT`, retry jika busy |

---

## 18. Lampiran

### 18.1 Contoh Payload AI Kontrak (Mock & Real)

**Input (dari dropdown B):**

```json
{
  "duration": "21",
  "revisi": "3",
  "warranty": "30",
  "materai": true,
  "signCount": 2,
  "party1Name": "Arka Studio",
  "party1Role": "PT",
  "party2Name": "CV Barokah",
  "party2Role": "CV",
  "projectTitle": "Website Company Profile 5 Halaman",
  "price": 4500000,
  "ipRights": "client"
}
```

**Output (8 pasal, Bahasa Indonesia formal, HTML):**

```json
{
  "clauses": [
    {"title": "Pasal 1 — Ruang Lingkup Pekerjaan", "content": "<p>Pihak Pertama akan mengerjakan {{project_title}} selama {{duration}} hari meliputi desain, development, dan deploy...</p>"},
    {"title": "Pasal 2 — Biaya dan Termin", "content": "<p>Total biaya {{price}} dengan termin ...</p>"},
    {"title": "Pasal 3 — Jadwal dan Keterlambatan", "content": "<p>...</p>"},
    {"title": "Pasal 4 — Revisi", "content": "<p>Revisi maksimal {{revisi}} kali selama scope...</p>"},
    {"title": "Pasal 5 — Hak Cipta", "content": "<p>Hak cipta milik {{client_name}} setelah pelunasan...</p>"},
    {"title": "Pasal 6 — Garansi", "content": "<p>Garansi {{warranty}} hari...</p>"},
    {"title": "Pasal 7 — Pembatalan dan Force Majeure", "content": "<p>...</p>"},
    {"title": "Pasal 8 — Penutup dan Tanda Tangan", "content": "<p>Perjanjian bermaterai Rp10.000...</p>"}
  ]
}
```

### 18.2 Contoh Nomor

- Invoice: `INV-2026-0001`, `INV-2026-0013` (next), `INV-2027-0001` (reset tahun)
- Kontrak: `SPK-2026-0001`, `SPK-2026-0007`

### 18.3 Referensi UI

- Spec warna, tipografi, radius, spacing di Bab 6 adalah **verbatim** dari instruksi user — menjadi acuan token Tailwind di FE.

---

**Disetujui untuk Eksekusi Frontend-First.**  
Next: Scaffold `frontend/` + dummy data + UI Kanban sesuai Bab 6.

