# Bikin Invoice — Invoice & Kontrak Kerja (Next.js 15 + SQLite Lokal, Opensource)

Web app **Next.js 15 (App Router)** untuk bikin **Invoice** & **Kontrak Kerja/SPK** fleksibel untuk freelancer/agency website. Data disimpan **lokal di browser via SQLite (sql.js + IndexedDB)** — tanpa backend, tanpa Cloudflare, tanpa deploy. Cukup `npm run dev` langsung pakai data real.

> PRD lengkap: [`PRD.md`](./PRD.md) — sekarang v0.5 Next.js 15

## ✨ Fitur

- **Dashboard Kanban** (Planned / In Progress / Done) drag & drop
- **Clients & Projects** — CRUD + edit
- **Invoice Builder** — manual dropdown Opsi A (termin 50/50, 30/40/30, 100%, 4x, custom + metode, PPN, tempo, denda) + kalkulasi realtime + preview A4 + Download PDF 1 halaman (odd only)
- **Contract Builder** — dropdown Opsi B (durasi, revisi, garansi, materai, 1/2/3 pihak TTD) + Generate pasal via AI Mock (DeepSeek via DeepInfra siap di Fase BE, sekarang mock) + editor pasal toggle/reorder + preview A4
- **Templates Level 1** — Minimal / Corporate / Creative (warna, font Inter/Manrope/Playfair, header)
- **Settings** — profil usaha, logo & TTD upload file (base64), rekening, NPWP
- **SQLite Lokal** — `sql.js` (WASM) + `IndexedDB` (`bikin-invoice-sqlite` / `bikin-invoice.db`), export/import `.db` untuk backup & opensource
- **UI Style** — Modern Minimalist SaaS Kanban, light professional, primary Hitam `#111827`, accent Biru/Kuning/Hijau, Inter, radius 12px pill, flat border

## 🗄 Penyimpanan: SQLite Lokal (Tanpa Backend)

Semua tabel (`clients`, `projects`, `invoices`, `contracts`, `settings`, `counters`) ada di **SQLite WASM di browser**.

- **Lokasi fisik:** Browser `IndexedDB` → DB `bikin-invoice-sqlite` → store `kv` key `db-binary` + backup `localStorage` base64. File bisa di-export jadi `bikin-invoice-YYYY-MM-DD.db` via **Settings → Export .db**.
- **Data Real:** Klik **Settings → Mulai Data Real (Kosong)** untuk hapus dummy & mulai isi data beneran. Data langsung tersimpan SQLite, survive reload.
- **Opensource:** Tidak perlu `wrangler`, `D1`, `R2`, atau env. Cukup clone & `npm run dev`. Jika mau share DB, export lalu commit ke `data/bikin-invoice.db` (opsional).

```
frontend/src/db/sqlite.ts  # init sql.js, persist IndexedDB, export/import .db
frontend/src/db/repo.ts    # CRUD clients/projects/invoices/contracts/settings
frontend/src/db/seed.ts    # seed dummy atau kosong
frontend/src/store/useAppStore.ts # Zustand + SQLite (bukan localStorage dummy)
```

## 🚀 Cara Jalan (Lokal, Data Real)

```bash
# 1. Clone
git clone <repo-url> bikin-invoice
cd bikin-invoice/frontend

# 2. Install
npm install

# 3. Dev (Next.js 15 — data real langsung di SQLite browser)
npm run dev
# buka http://localhost:3000

# 4. Build (Next.js)
npm run build
npm run start # preview prod di http://localhost:3000
```

1. Buka **Settings** → cek stats SQLite (clients/projects/invoices/contracts)
2. Klik **Mulai Data Real (Kosong)** jika mau hapus dummy
3. Buat **Clients** & **Projects** baru
4. Buat **Invoice** (isi item + pilih dropdown termin/PPN/tempo) → **Download PDF** (1 halaman)
5. Buat **Kontrak** (isi dropdown durasi/revisi/garansi/materai/TTD → Generate AI Mock) → **Download PDF**
6. Backup: **Settings → Export .db** (simpan di `data/` jika mau di-commit)

## 📦 Struktur (Semua di dalam `frontend/`)

Sesuai permintaan: **tidak ada folder sejajar `frontend`** di root. Semua data & docs di dalam `frontend/`.

```
bikin-invoice/                 # root — cuma ada frontend/ + .gitignore
└── frontend/                  # Next.js 15 (App Router) — SATU-SATUNYA folder project
    ├── PRD.md                 # PRD v0.5 Next.js 15 (dari root)
    ├── README.md              # README utama (dari root)
    ├── README.next.md         # README asli Next.js (backup)
    ├── data/                  # SQLite seeder default (68KB) — DARI root/data
    │   ├── bikin-invoice.db   # auto-load di browser saat IndexedDB kosong (di-copy ke public/)
    │   └── seed.sql
    ├── public/
    │   ├── sql-wasm.wasm & sql-wasm-browser.wasm (643KB)
    │   └── bikin-invoice.db   # copy dari data/ untuk fetch di browser
    ├── src/
    │   ├── app/               # Next App Router: page.tsx, layout.tsx, clients/, invoices/[id]/, contracts/[id]/
    │   ├── components/        # shadcn + Kanban + Sidebar (next/link) + providers.tsx
    │   ├── db/                # sqlite.ts (IndexedDB), repo.ts, seeder.ts
    │   ├── store/             # Zustand + SQLite
    │   └── lib/
    ├── scripts/
    │   └── seed.mjs           # generate data/bikin-invoice.db & public/bikin-invoice.db
    └── package.json           # Next 15.5.4 + sql.js + html2canvas + jspdf
```

## 🔄 Migrasi dari Cloudflare Stack

Dulu direncanakan: `Cloudflare Pages + Workers + D1 + R2 + DeepInfra`. Sekarang **di-nonaktifkan** untuk opensource lokal:

- `frontend/src/db/*` menggantikan `D1`
- `html2canvas + jspdf` (1 halaman) menggantikan `R2` PDF
- `services/mockAi.ts` menggantikan DeepInfra real (bisa diaktifkan lagi dengan `VITE_DEEPINFRA_KEY` jika mau)

Jika mau deploy lagi, tinggal aktifkan `backend/` Workers (lihat `backend/README.md` & `PRD.md` Bab 5).

## 📄 Lisensi

Opensource — pakai bebas untuk freelancer/agency. PRD & dummy data untuk demo.

