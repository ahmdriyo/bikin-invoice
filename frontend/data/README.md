# Data — SQLite Seeder (Bukan Dummy)

- `bikin-invoice.db` (68 KB) — **SQLite seeder** yang otomatis ter-load saat clone fresh. Isi: 10 clients, 8 projects, 12 invoices, 6 kontrak + settings default (Usaha Saya). File ini di-commit agar opensource langsung ada data demo. Sumber tunggal: `src/db/defaultSeeder.ts` → SQLite.
- `seed.sql` — schema dump (untuk referensi, generate dari `scripts/seed.mjs`)
- Export user: via **Settings → Export .db** → simpan di sini sebagai `bikin-invoice-YYYY-MM-DD.db` jika mau backup/share. Atau regenerate via `npm run seed`.

**Alur Seeder → SQLite Lokal:**
1. `src/db/defaultSeeder.ts` = single source of truth (10/8/12/6 + settings + templateConfigs + seederClausesMock)
2. `src/db/seeder.ts` = `runDefaultSeeder()` auto saat IndexedDB kosong (dipanggil di `src/components/providers.tsx`)
3. `scripts/seed.mjs` = Node seeder untuk generate file fisik `data/bikin-invoice.db` + `public/bikin-invoice.db` (duplikasi data, keep sync dengan defaultSeeder)
4. `src/db/sqlite.ts` = init sql.js, fetch `/bikin-invoice.db` jika IndexedDB kosong, persist ke IndexedDB (`bikin-invoice-sqlite`)
5. `src/store/useAppStore.ts` = `loadAll()` baca dari SQLite via `src/db/repo.ts` — **tidak ada import dummy di runtime**

**Perintah:**
```bash
cd frontend
npm run seed        # generate data/bikin-invoice.db + public/bikin-invoice.db dari seeder
npm run seed:force  # sama, force regenerate
npm run db:reset    # alias
```

Browser akan fetch `/bikin-invoice.db` saat IndexedDB kosong (lihat `src/db/sqlite.ts:72-79`).
`src/data/dummy.ts` = **@deprecated** — hanya re-export dari `defaultSeeder` untuk kompatibilitas, jangan dipakai untuk kode baru.
